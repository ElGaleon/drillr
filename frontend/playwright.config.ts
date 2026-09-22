import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:5174", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "cd ../backend && DATABASE_URL=sqlite:///./drillr_e2e_radar.db DEV_AUTH_BYPASS=true .venv/bin/python -m uvicorn app.main:app --port 8001", url: "http://127.0.0.1:8001/health", reuseExistingServer: false },
    { command: "VITE_API_URL=http://127.0.0.1:8001 npm run dev -- --host 127.0.0.1 --port 5174", url: "http://127.0.0.1:5174", reuseExistingServer: false },
  ],
});
