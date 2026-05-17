import { test, expect } from '@playwright/test';

test.describe('Smart Leads Dashboard', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /sign in|get started/i }).first()).toBeVisible();
  });

  test('admin can login and view leads', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@smartleads.com');
    await page.getByLabel(/^password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/leads');
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible();
  });

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@smartleads.com');
    await page.getByLabel(/^password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);
    await page.keyboard.press('Control+K');
    await expect(page.getByPlaceholder(/search leads/i)).toBeVisible();
  });
});
