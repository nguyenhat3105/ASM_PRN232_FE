import { test, expect } from "@playwright/test";
test("dashboard loads real API data and all public views work", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Portal Redesign", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome to TaskTrack" })).toBeVisible();
  const projects = await (await page.request.get("http://localhost:5080/api/projects")).json();
  await expect(page.locator(".dashboard-project-cards .project-card")).toHaveCount(projects.length);
  for (const route of [
    "/departments",
    "/departments/1",
    "/projects",
    "/tasks",
    "/projects/1",
    "/tasks/1",
    "/departments/manage",
    "/projects/manage",
    "/tasks/manage",
    "/tags/manage",
    "/search",
    "/board",
    "/calendar",
    "/reports",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('main [role="status"]')).toHaveCount(0);
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
test("search preserves zero enum filters and updates from API", async ({
  page,
}) => {
  await page.goto("/search");
  await page.getByLabel("Filter status").selectOption("0");
  await page.getByLabel("Filter priority").selectOption("0");
  await expect(page).toHaveURL(/status=0/);
  await expect(page).toHaveURL(/priority=0/);
  await expect(page.getByText("No tasks to show")).toBeVisible();
});
test("management has accessible modal and required fields", async ({
  page,
}) => {
  await page.goto("/departments/manage");
  await page
    .getByRole("button", { name: "Create department", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Department name *")).toHaveAttribute(
    "required",
    "",
  );
  await expect(page.getByLabel("Description *")).toHaveAttribute(
    "required",
    "",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mobile navigation and layout remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("link", { name: "Board", exact: true }).click();
  await expect(page).toHaveURL(/board/);
  await expect(page.getByRole("heading", { name: "Task board" })).toBeVisible();
});
