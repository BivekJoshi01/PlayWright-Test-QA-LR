// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';
import { SendMoneyPage } from '../pages/sendMoneyPage.js';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? '';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Send Money Flow', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
      'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run send money tests'
    );

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await expect(page).toHaveURL(/#\/home/, { timeout: 30_000 });
  });

  test('send money page loads with form elements', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await expect(page.getByRole('heading', { name: /send money|transfer/i })).toBeVisible();
    await expect(sendMoney.amountInput).toBeVisible();
    await expect(sendMoney.recipientSelect).toBeVisible();
    await expect(sendMoney.sendButton).toBeVisible();
  });

  test('shows validation error for empty amount', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ recipient: 'test@example.com', amount: '' });
    await sendMoney.submitSend();

    await expect(page.getByText(/amount.*required|please enter.*amount/i)).toBeVisible();
  });

  test('shows validation error for invalid amount', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ recipient: 'test@example.com', amount: '-100' });
    await sendMoney.submitSend();

    await expect(page.getByText(/invalid.*amount|amount.*positive/i)).toBeVisible();
  });

  test('shows validation error for no recipient', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ amount: 100 });
    await sendMoney.submitSend();

    await expect(page.getByText(/recipient.*required|please select.*recipient/i)).toBeVisible();
  });

  test('successful send shows confirmation modal', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ recipient: 'test@example.com', amount: 50 });
    await sendMoney.submitSend();

    await expect(page.getByText(/confirm.*transfer|review.*details/i)).toBeVisible();
    await expect(sendMoney.confirmButton).toBeVisible();
  });

  test('confirming send completes transaction', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ recipient: 'test@example.com', amount: 25 });
    await sendMoney.submitSend();
    await sendMoney.confirmSend();

    await expect(page.getByText(/transfer.*successful|sent.*successfully/i)).toBeVisible();
  });

  test('insufficient balance shows error', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.fillSendForm({ recipient: 'test@example.com', amount: 1000000 }); // Large amount
    await sendMoney.submitSend();

    await expect(page.getByText(/insufficient.*balance|not enough.*funds/i)).toBeVisible();
  });

  test('navigation back to dashboard works', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await page.getByRole('link', { name: /back|dashboard|home/i }).click();
    await expect(page).toHaveURL(/#\/home|dashboard/);
  });

  test('currency selection affects display', async ({ page }) => {
    const sendMoney = new SendMoneyPage(page);
    await sendMoney.goto();

    await sendMoney.currencySelect.selectOption('USD');
    await expect(page.getByText(/USD|\$/)).toBeVisible();
  });
});