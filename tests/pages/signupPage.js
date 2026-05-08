// @ts-check
import { expect } from '@playwright/test';

export class SignupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.firstName = page.locator('input[name="firstName"]');
    this.middleName = page.locator('input[name="middleName"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.email = page.locator('input[name="email"]');
    this.phoneNumber = page.locator('input[name="phoneNumber"]');
    this.password = page.locator('input[name="password"]');
    this.confirmPassword = page.locator('input[name="confirmPassword"]');
    this.consentCheckbox = page.getByRole('checkbox', {
      name: /I confirm that I am authorised/i,
    });
    // Scope to the form's submit button (a MuiLoadingButton). The site
    // header also has a "Sign Up" button which would otherwise collide.
    this.submitButton = page
      .locator('button.MuiLoadingButton-root')
      .filter({ hasText: /sign up/i });
  }

  async goto() {
    await this.page.goto('/#/signup');
    await expect(this.firstName).toBeVisible();
  }

  /**
   * Fill the signup form with the provided values. Country defaults to
   * Australia (preselected by VITE_AUS_COUNTRY_ID), which we leave alone.
   * @param {{
   *   firstName: string,
   *   middleName?: string,
   *   lastName: string,
   *   email: string,
   *   phoneNumber: string,
   *   password: string,
   * }} values
   */
  async fillForm(values) {
    await this.firstName.fill(values.firstName);
    if (values.middleName) await this.middleName.fill(values.middleName);
    await this.lastName.fill(values.lastName);
    await this.email.fill(values.email);
    await this.phoneNumber.fill(values.phoneNumber);
    await this.password.fill(values.password);
    await this.confirmPassword.fill(values.password);
  }

  async acceptConsentAndSubmit() {
    await this.consentCheckbox.check();
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }
}

/**
 * Generates a fresh test identity per run so signup doesn't collide with
 * previous test data.
 *
 * Constraints baked into the backend & frontend:
 * - Email regex `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/` rejects "+" plus-addressing,
 *   so we use a dotted local part instead.
 * - Phone regex `/^(0[4]\d{8}|4\d{8})$/` requires AU mobile format.
 */
export function makeSignupFixture() {
  const stamp = Date.now();
  const phoneSuffix = Math.floor(10000000 + Math.random() * 89999999); // 8 digits
  return {
    firstName: 'Test',
    middleName: '',
    lastName: 'User',
    email: `pwtest.${stamp}@mailinator.com`,
    phoneNumber: `4${phoneSuffix}`,
    password: 'Passw0rd!',
  };
}
