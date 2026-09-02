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
const staticServerCommand = `python3 -m http.server ${requestedPort} --bind 127.0.0.1 --directory out`;
const webServerCommand =
  process.env.PLAYWRIGHT_USE_EXISTING_BUILD === "1"
    ? staticServerCommand
    : `npm run build && ${staticServerCommand}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL,
    trace: "retain-on-failure",
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
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
