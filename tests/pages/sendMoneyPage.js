// @ts-check
import { expect } from '@playwright/test';

export class SendMoneyPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.recipientSelect = page.locator('select[name="recipient"]'); // Assuming select or input
    this.amountInput = page.locator('input[name="amount"]');
    this.currencySelect = page.locator('select[name="currency"]');
    this.sendButton = page.getByRole('button', { name: /send|transfer/i });
    this.confirmButton = page.getByRole('button', { name: /confirm/i });
  }

  async goto() {
    await this.page.goto('/#/home/send-money/0');
    await expect(this.amountInput).toBeVisible();
  }

  async fillSendForm({ recipient, amount, currency = 'AUD' }) {
    if (recipient) await this.recipientSelect.selectOption(recipient);
    await this.amountInput.fill(amount.toString());
    if (currency) await this.currencySelect.selectOption(currency);
  }

  async submitSend() {
    await this.sendButton.click();
  }

  async confirmSend() {
    await this.confirmButton.click();
  }
}