import { test, expect, Page } from '@playwright/test';
import { iniciarSesion } from '../helpers/auth';

async function agregarTarea(page: Page, titulo: string) {
  await page.getByTestId('todo-input').fill(titulo);
  await page.click('#btn-add');
}

test.describe('Gestión de tareas', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
  });

  test('TODO-01 Agregar una tarea nueva', { tag: '@smoke' }, async ({ page }) => {
    await agregarTarea(page, 'Comprar café');
    await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(1);
    await expect(page.getByTestId('todo-list')).toContainText('Comprar café');
    await expect(page.getByTestId('todo-count')).toHaveText('1 pendiente');
  });

  test('TODO-02 No permite agregar una tarea vacía', async ({ page }) => {
    await page.click('#btn-add');
    await expect(page.getByTestId('todo-error')).toHaveText('Escribe el nombre de la tarea');
    await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(0);
  });

  test('TODO-03 No permite tareas duplicadas', async ({ page }) => {
    await agregarTarea(page, 'Pagar servicios');
    await agregarTarea(page, 'pagar servicios');
    await expect(page.getByTestId('todo-error')).toHaveText('La tarea ya existe');
    await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(1);
  });

  test('TODO-04 Completar una tarea actualiza el contador', async ({ page }) => {
    await agregarTarea(page, 'Tarea A');
    await agregarTarea(page, 'Tarea B');
    await expect(page.getByTestId('todo-count')).toHaveText('2 pendientes');
    await page.getByLabel('Completar Tarea A').check();
    await expect(page.getByTestId('todo-count')).toHaveText('1 pendiente');
  });

  test('TODO-05 Eliminar una tarea', async ({ page }) => {
    await agregarTarea(page, 'Tarea temporal');
    await page.getByRole('button', { name: 'Eliminar Tarea temporal' }).click();
    await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(0);
    await expect(page.getByTestId('todo-count')).toHaveText('0 pendientes');
  });

  test('TODO-06 Filtrar por tareas completadas', async ({ page }) => {
    await agregarTarea(page, 'Hecha');
    await agregarTarea(page, 'Pendiente');
    await page.getByLabel('Completar Hecha').check();
    await page.getByRole('button', { name: 'Completadas' }).click();
    const items = page.getByTestId('todo-list').locator('li');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Hecha');
  });

  test('TODO-07 Las tareas persisten tras recargar la página', async ({ page }) => {
    await agregarTarea(page, 'Persistente');
    await page.reload();
    await expect(page.getByTestId('todo-list')).toContainText('Persistente');
  });

  test('TODO-08 Rechaza tareas de más de 60 caracteres', async ({ page }) => {
    await agregarTarea(page, 'x'.repeat(61));
    await expect(page.getByTestId('todo-error')).toHaveText('Máximo 60 caracteres');
  });
});
