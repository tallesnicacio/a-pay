import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('A-Pay');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with email', async ({ page }) => {
    await page.goto('/login');

    // Preencher email
    await page.fill('input[type="email"]', 'garcom@churrasquinho.com');

    // Submeter form
    await page.click('button[type="submit"]');

    // Deve redirecionar para /orders
    await expect(page).toHaveURL(/\/orders/);

    // Deve mostrar o nome do estabelecimento
    await expect(page.locator('text=Churrasquinho da Praça')).toBeVisible();
  });

  test('should show error on invalid email', async ({ page }) => {
    await page.goto('/login');

    // Email vazio
    await page.click('button[type="submit"]');

    // Deve mostrar erro de validação do browser
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'garcom@churrasquinho.com');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/orders/);

    // Click logout button
    await page.click('button[title="Sair"]');

    // Deve redirecionar para /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist auth on page reload', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'garcom@churrasquinho.com');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/orders/);

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('text=Churrasquinho da Praça')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/orders');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
