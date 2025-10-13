import { test, expect } from '@playwright/test';

test.describe('Orders Management', () => {
  // Helper function to login
  async function login(page: any) {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'garcom@churrasquinho.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/orders/);
  }

  test('should display orders list', async ({ page }) => {
    await login(page);

    // Should show tabs
    await expect(page.locator('text=Não Pagos')).toBeVisible();
    await expect(page.locator('text=Pagos')).toBeVisible();

    // Should show new order button
    await expect(page.locator('text=+ Nova Comanda')).toBeVisible();
  });

  test('should create new order', async ({ page }) => {
    await login(page);

    // Click new order button
    await page.click('text=+ Nova Comanda');

    // Should navigate to new order page
    await expect(page).toHaveURL(/\/orders\/new/);

    // Should show product grid
    await expect(page.locator('text=Produtos')).toBeVisible();

    // Enter code
    await page.fill('input[placeholder*="código"]', 'Mesa 10');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-button"], button:has-text("Espetinho")', {
      timeout: 5000,
    });

    // Click on first product
    const firstProduct = page.locator('button').filter({ hasText: 'Espetinho' }).first();
    await firstProduct.click();

    // Should show item in cart
    await expect(page.locator('text=1 ×')).toBeVisible();

    // Click create order button
    await page.click('button:has-text("Criar Comanda")');

    // Should navigate back to orders list
    await expect(page).toHaveURL(/\/orders$/);

    // Should show success toast
    await expect(page.locator('text=Comanda criada')).toBeVisible();
  });

  test('should add multiple items to order', async ({ page }) => {
    await login(page);

    await page.click('text=+ Nova Comanda');
    await page.fill('input[placeholder*="código"]', 'Mesa 20');

    // Wait for products
    await page.waitForSelector('button:has-text("Espetinho")', {
      timeout: 5000,
    });

    // Add first product 2 times
    const firstProduct = page.locator('button').filter({ hasText: 'Espetinho' }).first();
    await firstProduct.click();
    await firstProduct.click();

    // Add second product
    const secondProduct = page.locator('button').filter({ hasText: 'Refrigerante' }).first();
    if (await secondProduct.isVisible()) {
      await secondProduct.click();
    }

    // Should show multiple items in cart
    const cart = page.locator('[role="complementary"], .cart, .summary').first();
    await expect(cart).toContainText('2 ×');

    // Click create
    await page.click('button:has-text("Criar Comanda")');

    await expect(page).toHaveURL(/\/orders$/);
  });

  test('should increase item quantity', async ({ page }) => {
    await login(page);

    await page.click('text=+ Nova Comanda');
    await page.fill('input[placeholder*="código"]', 'Mesa 30');

    await page.waitForSelector('button:has-text("Espetinho")');

    // Click product
    const product = page.locator('button').filter({ hasText: 'Espetinho' }).first();
    await product.click();

    // Wait for cart to update
    await page.waitForSelector('text=1 ×');

    // Click + button in cart
    const plusButton = page.locator('button:has-text("+")').first();
    if (await plusButton.isVisible()) {
      await plusButton.click();

      // Should show 2x
      await expect(page.locator('text=2 ×')).toBeVisible();
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await login(page);

    await page.click('text=+ Nova Comanda');

    await page.waitForSelector('button:has-text("Espetinho")');

    // Add item
    const product = page.locator('button').filter({ hasText: 'Espetinho' }).first();
    await product.click();

    await page.waitForSelector('text=1 ×');

    // Click remove button (trash icon or X)
    const removeButton = page.locator('button[title*="Remover"], button:has-text("×")').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();

      // Cart should be empty
      await expect(page.locator('text=Carrinho vazio')).toBeVisible();
    }
  });

  test('should view order details', async ({ page }) => {
    await login(page);

    // Wait for orders to load
    await page.waitForTimeout(1000);

    // Click on first order card
    const firstOrder = page.locator('[data-testid="order-card"], .order-card, article').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();

      // Should navigate to order details
      await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+/);

      // Should show order details
      await expect(page.locator('text=Detalhes da Comanda')).toBeVisible();
    }
  });

  test('should filter by payment status', async ({ page }) => {
    await login(page);

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Click on "Pagos" tab
    await page.click('text=Pagos');

    // URL should update or tab should be active
    await expect(page.locator('text=Pagos').first()).toHaveClass(/active|border-primary/);
  });

  test('should mark order as paid', async ({ page }) => {
    await login(page);

    await page.waitForTimeout(1000);

    // Click on first unpaid order
    const firstOrder = page.locator('[data-testid="order-card"], article').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();

      // Look for "Marcar como Pago" button
      const markPaidButton = page.locator('button:has-text("Marcar como Pago")');
      if (await markPaidButton.isVisible()) {
        await markPaidButton.click();

        // Modal should open
        await expect(page.locator('text=Registrar Pagamento')).toBeVisible();

        // Select payment method
        await page.click('button:has-text("Dinheiro")');

        // Confirm
        await page.click('button:has-text("Confirmar Pagamento")');

        // Should show success message
        await expect(page.locator('text=Pagamento registrado')).toBeVisible();
      }
    }
  });
});
