// @ts-check
import { test, expect } from '@playwright/test';
import { SignupPage, makeSignupFixture } from '../pages/signupPage.js';

test.describe('Signup flow', () => {
  test('renders the signup page', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await expect(page.getByRole('heading', { name: /registration details/i })).toBeVisible();
    await expect(signup.submitButton).toBeVisible();
  });

  test('submit button is disabled until consent checkbox is ticked', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fillForm(makeSignupFixture());

    await expect(signup.submitButton).toBeDisabled();
    await signup.consentCheckbox.check();
    await expect(signup.submitButton).toBeEnabled();
  });

  test('submitting valid details opens the OTP modal', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fillForm(makeSignupFixture());
    await signup.acceptConsentAndSubmit();

    // Backend returns success → frontend opens OTP modal (NewSignUpPage:617).
    await expect(page.getByText(/sms verification/i)).toBeVisible({ timeout: 30_000 });
  });
});
