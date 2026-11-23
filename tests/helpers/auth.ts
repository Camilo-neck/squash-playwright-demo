import { expect, Page } from '@playwright/test';

export const USUARIOS = {
  admin: { usuario: 'admin', password: 'Admin123!' },
  qa: { usuario: 'qa', password: 'Qa12345!' },
  bloqueado: { usuario: 'bloqueado', password: 'Bloq123!' },
};

/** Abre el login y envía el formulario (no valida el resultado). */
export async function enviarLogin(page: Page, usuario: string, password: string) {
  await page.goto('/');
  await page.getByTestId('username').fill(usuario);
  await page.getByTestId('password').fill(password);
  await page.click('#btn-login');
}

/** Inicia sesión con un usuario válido y espera al panel. */
export async function iniciarSesion(page: Page, usuario = USUARIOS.admin.usuario, password = USUARIOS.admin.password) {
  await enviarLogin(page, usuario, password);
  await expect(page.locator('.dashboard')).toBeVisible();
}
