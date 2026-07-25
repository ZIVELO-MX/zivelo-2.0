import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run start -- --port 3000",
      url: "http://127.0.0.1:3000/es",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        "SUPABASE_SECRET_KEY=invalid-e2e-key npm run start -- --port 3001",
      url: "http://127.0.0.1:3001/es",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
