import { test, expect } from '@playwright/test';

/**
 * Pruebas DIDÁCTICAS para comprobar cómo Squash TM calcula el estado final.
 * Están marcadas con @demo para excluirlas de la ejecución "sana" (npm run test:estables).
 *
 *   DEMO-01  pasa                                       -> Éxito
 *   DEMO-02  falla una aserción  (<failure> en JUnit)   -> Fallo
 *   DEMO-03  error técnico       (<error> en JUnit)     -> Bloqueado
 *
 * Referencias de prueba en Squash (ver squash/referencias-automatizadas.md):
 *   ...#estados.spec.ts#DEMO-01     -> Éxito
 *   ...#estados.spec.ts#DEMO-02     -> Fallo
 *   ...#estados.spec.ts#DEMO-03     -> Bloqueado
 *   ...#estados.spec.ts#DEMO-0[12]  -> Fallo      (éxito + fallo)
 *   ...#estados.spec.ts             -> Bloqueado  (éxito + fallo + error)
 */
test.describe('Estados finales (demo)', () => {
  test('DEMO-01 Prueba que pasa siempre', { tag: '@demo' }, async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Portal de Pruebas/);
  });

  test('DEMO-02 Fallo funcional intencional', { tag: '@demo' }, async ({ page }) => {
    await page.goto('/');
    // Aserción que NO se cumple a propósito -> status "Failed"
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Título que no existe');
  });

  test('DEMO-03 Error técnico intencional', { tag: '@demo' }, async ({ page }) => {
    await page.goto('/');
    // Un elemento inexistente provoca TimeoutError (no es una aserción) -> status "Error" -> Bloqueado
    await page.click('#boton-que-no-existe', { timeout: 1500 });
  });
});
