import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 180_000,
  expect: { timeout: 7000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4137",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx tsx tests/e2e-server.ts",
    url: "http://127.0.0.1:4137/health",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
