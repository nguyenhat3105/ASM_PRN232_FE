import { test, expect } from "@playwright/test";
test("project directory filters compose including zero status", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(
    page.getByRole("link", { name: "Internal Dashboard", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Filter by status", { exact: true }).selectOption("0");
  await page
    .getByLabel("Filter by department", { exact: true })
    .selectOption("2");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Internal Dashboard", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Search projects", { exact: true })
    .fill("no-such-project");
  await expect(
    page.getByRole("heading", { name: "No projects found" }),
  ).toBeVisible();
});
test("management Board and List share task filters", async ({ page }) => {
  await page.goto("/tasks/manage");
  await page.getByLabel("Filter management project").selectOption("1");
  await page.getByLabel("Filter management status").selectOption("0");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("tab", { name: "Board", exact: true }).click();
  await expect(page.locator(".board-card")).toHaveCount(2);
  await page.getByLabel("Filter management priority").selectOption("3");
  await expect(page.locator(".board-card")).toHaveCount(1);
  await page.getByRole("tab", { name: "List", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
});
test("create menu opens contextual forms and displays inline errors", async ({
  page,
}) => {
  await page.goto("/projects/1");
  await page.getByRole("link", { name: "Add task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Project *", { exact: true })).toHaveValue("1");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(
    page.getByText("This field is required.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Create new record" }).click();
  await page.getByRole("menuitem", { name: "Task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Create new record" }).click();
  await page.getByRole("menuitem", { name: "Tag", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Tag name *")).toBeVisible();
});
test("row action menu is keyboard accessible and preserves deletion rules", async ({
  page,
}) => {
  await page.goto("/departments/manage");
  const trigger = page.getByRole("button", {
    name: "Actions for Engineering",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("desktop collapse and mobile drawer support keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  for (const route of [
    "/projects",
    "/tasks/manage",
    "/board",
    "/tags/manage",
  ]) {
    await page.goto(route);
    await expect(page.locator('main [role="status"]')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});
