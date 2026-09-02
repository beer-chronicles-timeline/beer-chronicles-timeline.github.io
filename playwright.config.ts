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

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && python3 -m http.server ${requestedPort} --bind 127.0.0.1 --directory out`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
