import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 단일 json-server/db.json 공유 → 순차 실행이 안전
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]], // list=콘솔, html=show-report용
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure', // 실패 시 트레이스 보존 → show-trace로 재생 (retries=0 로컬에서도)
    // SLOWMO=1000 처럼 ms를 주면 헤드풀로 천천히 실행해 눈으로 확인 가능
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev', // vite(5173) + json-server(3001) 동시 기동
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
