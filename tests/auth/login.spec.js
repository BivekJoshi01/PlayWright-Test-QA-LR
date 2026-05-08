// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe('Login flow', () => {
  test('renders the login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(page.getByRole('heading', { name: /^login$/i })).toBeVisible();
    await expect(login.submitButton).toBeVisible();
  });

  test('shows validation error when email is empty', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.passwordInput.fill('something');
    await login.submitButton.click();

    await expect(page.getByText(/email or phone is required/i)).toBeVisible();
  });

  test('rejects an obviously invalid email/phone', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login('not-an-email', 'whatever');

    await expect(page.getByText(/enter valid email or phone/i)).toBeVisible();
  });

  test('logs in a known user and lands in /home', async ({ page }) => {
    test.skip(
      !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
      'Set TEST_USER_EMAIL and TEST_USER_PASSWORD in my-playwright-tests/.env to run this test'
    );

    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // After successful login, user is redirected under /#/home (ProtectedRoute).
    await expect(page).toHaveURL(/#\/home/, { timeout: 30_000 });
  });
});
