import { defineConfig, devices } from "@playwright/test";

const requestedPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

if (
  !Number.isInteger(requestedPort) ||
  requestedPort < 1 ||
  requestedPort > 65535
) {
  throw new Error("PLAYWRIGHT_PORT must be an integer between 1 and 65535.");
}

const baseURL = `http://127.0.0.1:${requestedPort}`;
const staticServerCommand = `node scripts/serve-export.mjs ${requestedPort}`;
const webServerCommand =
  process.env.PLAYWRIGHT_USE_EXISTING_BUILD === "1"
    ? staticServerCommand
    : `npm run build:offline && ${staticServerCommand}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: "line",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile|@webkit/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      grepInvert: /@a11y-scan|@mobile|@webkit/,
    },
    {
      name: "mobile-chromium",
      grep: /@mobile|@journey|@a11y-scan/,
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "webkit",
      grep: /@webkit|@journey/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
