import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:3000", browserName: "chromium" },
  workers: 1,
  reporter: "list",
});
