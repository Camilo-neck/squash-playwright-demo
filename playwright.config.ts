import { defineConfig } from '@playwright/test';
import path from 'node:path';

/**
 * URL de la app bajo prueba. Prioridad:
 *   1. TC_CUF_BASE_URL -> campo personalizado "BASE_URL" del caso de prueba en Squash TM
 *   2. BASE_URL        -> variable de entorno normal (CI / ejecución local)
 *   3. http://localhost:3000 (la app demo, que el propio Playwright levanta con `webServer`)
 */
const externalUrl = process.env.TC_CUF_BASE_URL || process.env.BASE_URL;
const baseURL = externalUrl || 'http://localhost:3000';

// Cuando lo lanza Squash (el orquestador ejecuta desde la carpeta superior con --config), los
// reportes deben quedar en ../playwright-report, que es donde el orquestador los espera.
if (process.env.TC_REFERENCE) {
  const out = path.resolve(__dirname, '..', 'playwright-report');
  process.env.PLAYWRIGHT_HTML_REPORT = out;
  process.env.PLAYWRIGHT_JUNIT_OUTPUT_NAME = path.join(out, 'pw_junit_report.xml');
}

export default defineConfig({
  // IMPORTANTE (doc. oficial de Squash): si `testDir` no coincide con la carpeta de la
  // referencia automatizada (`repo/tests#...`), los tests pueden no ejecutarse.
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0, // sin reintentos: el resultado de Squash debe reflejar la primera ejecución
  reporter: [['list']], // Squash TM/OpenTestFactory lo sobreescribe con --reporter=html,junit

  use: {
    baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Solo si el runner usa un Chrome/Chromium instalado a mano en lugar del de Playwright.
    launchOptions: process.env.PW_CHROME_PATH
      ? { executablePath: process.env.PW_CHROME_PATH }
      : {},
  },

  // Si se apunta a un entorno externo no se levanta la app local.
  webServer: externalUrl
    ? undefined
    : {
        command: 'node server.js',
        url: 'http://localhost:3000/api/status',
        reuseExistingServer: true,
        timeout: 15_000,
      },
});
