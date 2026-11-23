import { test, expect, Page } from '@playwright/test';

async function llenarFormulario(
  page: Page,
  datos: { nombre?: string; email?: string; edad?: string; pais?: string; terminos?: boolean },
) {
  await page.goto('/registro.html');
  if (datos.nombre !== undefined) await page.getByTestId('nombre').fill(datos.nombre);
  if (datos.email !== undefined) await page.getByTestId('email').fill(datos.email);
  if (datos.edad !== undefined) await page.getByTestId('edad').fill(datos.edad);
  if (datos.pais) await page.getByTestId('pais').selectOption(datos.pais);
  if (datos.terminos) await page.getByTestId('terminos').check();
  await page.click('#btn-registrar');
}

const VALIDO = { nombre: 'Ana Gómez', email: 'ana@example.com', edad: '30', pais: 'CO', terminos: true };

test.describe('Formulario de registro', () => {
  test('REG-01 Registro exitoso con datos válidos', { tag: '@smoke' }, async ({ page }) => {
    await llenarFormulario(page, VALIDO);
    await expect(page.getByTestId('registro-ok')).toHaveText('Registro exitoso para Ana Gómez');
  });

  test('REG-02 Rechaza correo con formato inválido', async ({ page }) => {
    await llenarFormulario(page, { ...VALIDO, email: 'correo-sin-arroba' });
    await expect(page.getByTestId('error-email')).toHaveText('Correo electrónico inválido');
    await expect(page.getByTestId('registro-ok')).toBeHidden();
  });

  test('REG-03 Rechaza a menores de edad', async ({ page }) => {
    await llenarFormulario(page, { ...VALIDO, edad: '17' });
    await expect(page.getByTestId('error-edad')).toHaveText('Debes ser mayor de edad');
  });

  test('REG-04 Exige aceptar los términos y condiciones', async ({ page }) => {
    await llenarFormulario(page, { ...VALIDO, terminos: false });
    await expect(page.getByTestId('error-terminos')).toHaveText('Debes aceptar los términos');
    await expect(page.getByTestId('registro-ok')).toBeHidden();
  });

  test('REG-05 Muestra todos los errores con el formulario vacío', async ({ page }) => {
    await llenarFormulario(page, {});
    for (const campo of ['nombre', 'email', 'edad', 'pais', 'terminos']) {
      await expect(page.getByTestId(`error-${campo}`)).not.toBeEmpty();
    }
  });
});
