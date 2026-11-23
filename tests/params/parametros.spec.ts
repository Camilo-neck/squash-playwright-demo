import { test, expect } from '@playwright/test';
import { enviarLogin } from '../helpers/auth';

/**
 * Variables que Squash TM inyecta como variables de entorno (según la doc. oficial):
 *   DSNAME                -> nombre del dataset seleccionado
 *   DS_<parametro>        -> valor de cada parámetro del dataset
 *   TC_REFERENCE          -> referencia del caso de prueba en Squash
 *   TC_UUID               -> UUID interno del caso de prueba
 *   TC_CUF_<codigo>       -> campos personalizados del caso de prueba  (OJO: "CUF", no "CU")
 *
 * Cada variable tiene un valor por defecto para poder ejecutar el test también fuera de Squash.
 */
const env = process.env;

test.describe('Parámetros enviados desde Squash TM', () => {
  // Parámetros del dataset en Squash: USUARIO, PASSWORD, RESULTADO (EXITO | ERROR | BLOQUEADO)
  test('PAR-01 Login dirigido por dataset (DS_USUARIO, DS_PASSWORD, DS_RESULTADO)', async ({ page }) => {
    const usuario = env.DS_USUARIO ?? 'admin';
    const password = env.DS_PASSWORD ?? 'Admin123!';
    const resultado = (env.DS_RESULTADO ?? 'EXITO').toUpperCase();
    test.info().annotations.push({ type: 'dataset', description: env.DSNAME ?? 'sin-dataset (valores por defecto)' });

    await enviarLogin(page, usuario, password);

    switch (resultado) {
      case 'EXITO':
        await expect(page.locator('.dashboard')).toBeVisible();
        await expect(page.getByTestId('welcome')).toContainText(usuario);
        break;
      case 'ERROR':
        await expect(page.locator('.alert-error')).toHaveText('Usuario o contraseña incorrectos');
        break;
      case 'BLOQUEADO':
        await expect(page.locator('.alert-error')).toContainText('Usuario bloqueado');
        break;
      default:
        throw new Error(`DS_RESULTADO desconocido: "${resultado}". Use EXITO, ERROR o BLOQUEADO.`);
    }
  });

  test('PAR-02 Metadatos de ejecución recibidos de Squash (TC_REFERENCE, TC_UUID, DSNAME)', async () => {
    // Las anotaciones aparecen como <property> en el JUnit y en el reporte HTML.
    const info = test.info();
    info.annotations.push({ type: 'TC_REFERENCE', description: env.TC_REFERENCE ?? '(no definido: ejecución local)' });
    info.annotations.push({ type: 'TC_UUID', description: env.TC_UUID ?? '(no definido: ejecución local)' });
    info.annotations.push({ type: 'DSNAME', description: env.DSNAME ?? '(no definido: ejecución local)' });
    console.log('Variables de Squash recibidas:', {
      TC_REFERENCE: env.TC_REFERENCE,
      TC_UUID: env.TC_UUID,
      DSNAME: env.DSNAME,
      TC_CUF_BASE_URL: env.TC_CUF_BASE_URL,
      TC_CUF_TIMEOUT_MS: env.TC_CUF_TIMEOUT_MS,
    });
    // Si el test corre desde Squash, TC_REFERENCE debe llegar informado.
    if (env.TC_UUID) {
      expect(env.TC_REFERENCE, 'Squash debería enviar TC_REFERENCE').toBeTruthy();
    }
  });

  test('PAR-03 URL y timeout configurables por campos personalizados (TC_CUF_BASE_URL, TC_CUF_TIMEOUT_MS)', async ({ page, baseURL }) => {
    const timeout = parseInt(env.TC_CUF_TIMEOUT_MS ?? '5000', 10);
    expect(Number.isNaN(timeout), 'TC_CUF_TIMEOUT_MS debe ser numérico').toBeFalsy();

    await page.goto(baseURL!, { timeout });
    await expect(page).toHaveTitle(/Portal de Pruebas/);
  });
});
