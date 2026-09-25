import { test, expect } from "@playwright/test";

test("task creation, editing, soft deletion and recovery use real PostgreSQL", async ({
  page,
}) => {
  // Route only this test to the disposable PostgreSQL-backed API.
  await page.route("http://localhost:5080/api/**", async (route) => {
    const response = await route.fetch({
      url: route.request().url().replace(":5080/", ":5081/"),
    });
    await route.fulfill({ response });
  });
  const title = `Browser QA ${Date.now()}`;
  await page.goto("/tasks/manage");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page.getByLabel("Title *").fill(title);
  await page.getByLabel("Project *").selectOption("1");
  await page.getByLabel("Priority", { exact: true }).selectOption("0");
  await page.getByLabel("frontend", { exact: true }).check();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Search tasks").fill(title);
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row.getByText("Low", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: `Edit ${title}`, exact: true })
    .click();
  await page.getByLabel("frontend", { exact: true }).uncheck();
  await page.getByLabel("backend", { exact: true }).check();
  await page.getByLabel("Status", { exact: true }).selectOption("1");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row.getByText("In Progress", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: `Delete ${title}`, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(row).toHaveCount(0);
  await page.getByRole("button", { name: "View trash", exact: true }).click();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show active tasks", exact: true })
    .click();
  await expect(row).toBeVisible();
});
