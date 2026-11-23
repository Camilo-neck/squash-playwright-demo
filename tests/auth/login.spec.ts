import { test, expect } from '@playwright/test';
import { USUARIOS, enviarLogin, iniciarSesion } from '../helpers/auth';

test.describe('Módulo de Autenticación', () => {
  test('AUTH-01 Login exitoso con credenciales válidas', { tag: '@smoke' }, async ({ page }) => {
    await enviarLogin(page, USUARIOS.admin.usuario, USUARIOS.admin.password);
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.getByTestId('welcome')).toContainText('admin');
  });

  test('AUTH-02 Error de autenticación con clave incorrecta', async ({ page }) => {
    await enviarLogin(page, 'admin', 'clave-incorrecta');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText('Usuario o contraseña incorrectos');
    await expect(page).toHaveURL(/\/(index\.html)?$/);
  });

  test('AUTH-03 Usuario bloqueado no puede iniciar sesión', async ({ page }) => {
    await enviarLogin(page, USUARIOS.bloqueado.usuario, USUARIOS.bloqueado.password);
    await expect(page.locator('.alert-error')).toContainText('Usuario bloqueado');
  });

  test('AUTH-04 Validación de campos obligatorios vacíos', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-login');
    await expect(page.getByTestId('error-username')).toHaveText('El usuario es obligatorio');
    await expect(page.getByTestId('error-password')).toHaveText('La contraseña es obligatoria');
  });

  test('AUTH-05 Cierre de sesión redirige al login', async ({ page }) => {
    await iniciarSesion(page, USUARIOS.qa.usuario, USUARIOS.qa.password);
    await page.click('#btn-logout');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('AUTH-06 Acceso directo al panel sin sesión redirige al login', async ({ page }) => {
    await page.goto('/dashboard.html');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });
});
