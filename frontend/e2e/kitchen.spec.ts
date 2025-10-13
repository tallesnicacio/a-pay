import { test, expect } from '@playwright/test';

test.describe('Kitchen Management', () => {
  // Helper function to login as kitchen user
  async function loginAsKitchen(page: any) {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'cozinha@churrasquinho.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(orders|kitchen)/);
  }

  test('should display kitchen page', async ({ page }) => {
    await loginAsKitchen(page);

    // Navigate to kitchen
    await page.goto('/kitchen');

    // Should show kitchen header
    await expect(page.locator('text=Cozinha')).toBeVisible();

    // Should show stats cards
    await expect(page.locator('text=Fila')).toBeVisible();
    await expect(page.locator('text=Em Preparo')).toBeVisible();
    await expect(page.locator('text=Pronto')).toBeVisible();

    // Should show SSE status indicator
    await expect(page.locator('text=Tempo real')).toBeVisible();
  });

  test('should show kanban columns', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Should show 4 columns
    await expect(page.locator('text=Fila').first()).toBeVisible();
    await expect(page.locator('text=Em Preparo').first()).toBeVisible();
    await expect(page.locator('text=Pronto').first()).toBeVisible();
    await expect(page.locator('text=Entregue').first()).toBeVisible();
  });

  test('should display ticket cards', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(2000);

    // Look for ticket cards (may be empty)
    const ticketCard = page.locator('[data-testid="ticket-card"], .ticket-card').first();
    if (await ticketCard.isVisible()) {
      // Ticket should have number
      await expect(ticketCard).toContainText('#');
    }
  });

  test('should update ticket status', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(2000);

    // Find ticket in "Fila" column
    const queueColumn = page.locator('text=Fila').first().locator('..');
    const firstTicket = queueColumn.locator('[data-testid="ticket-card"], article').first();

    if (await firstTicket.isVisible()) {
      // Hover to show "Avançar" button
      await firstTicket.hover();

      // Click "Avançar" button
      const advanceButton = firstTicket.locator('button:has-text("Avançar")');
      if (await advanceButton.isVisible()) {
        await advanceButton.click();

        // Ticket should move to "Em Preparo"
        await page.waitForTimeout(500);

        // Should show in preparing column
        const preparingColumn = page.locator('text=Em Preparo').first().locator('..');
        await expect(preparingColumn.locator('article').first()).toBeVisible();
      }
    }
  });

  test('should show statistics', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(1000);

    // Stats should be visible
    const stats = page.locator('.grid').first();
    await expect(stats).toBeVisible();

    // Should show numbers
    await expect(page.locator('text=Tempo Médio')).toBeVisible();
    await expect(page.locator('text=min')).toBeVisible();
  });

  test('should refresh tickets manually', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    // Find refresh button
    const refreshButton = page.locator('button[title="Atualizar"]');
    await expect(refreshButton).toBeVisible();

    // Click refresh
    await refreshButton.click();

    // Should show loading state briefly
    await expect(refreshButton).toHaveClass(/animate-spin/);
  });

  test('should show SSE connection status', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(1000);

    // Should show connection dot (green or red)
    const statusIndicator = page.locator('.rounded-full').first();
    await expect(statusIndicator).toBeVisible();

    // Should have text
    const statusText = page.locator('text=Tempo real');
    await expect(statusText).toBeVisible();
  });

  test('should display ticket details', async ({ page }) => {
    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(2000);

    const firstTicket = page.locator('[data-testid="ticket-card"], article').first();
    if (await firstTicket.isVisible()) {
      // Should show ticket number
      await expect(firstTicket).toContainText('#');

      // Should show items count
      await expect(firstTicket.locator('text=item')).toBeVisible();

      // Should show total or relative time
      await expect(firstTicket).toHaveText(/R\$|\d+ min/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsKitchen(page);
    await page.goto('/kitchen');

    await page.waitForTimeout(1000);

    // Should show header
    await expect(page.locator('text=Cozinha')).toBeVisible();

    // Stats should be in grid (may be 2 columns on mobile)
    const stats = page.locator('.grid').first();
    await expect(stats).toBeVisible();

    // Bottom navigation should be visible
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
  });
});
