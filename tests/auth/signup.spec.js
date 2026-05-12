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

  test('shows validation error for invalid email format', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    const details = makeSignupFixture();
    details.email = 'invalid-email';
    await signup.submit(details);

    const emailError = page.locator('p.MuiFormHelperText-root', {
      hasText: /(valid|invalid).*email|email.*required|enter.*email/i,
    });
    await expect(emailError).toBeVisible();
    await expect(page.getByText(/sms verification/i)).not.toBeVisible();
  });

  test('shows validation error for invalid phone format', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    const details = makeSignupFixture();
    details.phoneNumber = '12345';
    await signup.submit(details);

    const phoneError = page.locator('p.MuiFormHelperText-root', {
      hasText: /(valid|invalid).*mobile|mobile number|phone number/i,
    });
    await expect(phoneError).toBeVisible();
    await expect(page.getByText(/sms verification/i)).not.toBeVisible();
  });

  test('shows validation error when passwords do not match', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    const details = makeSignupFixture();
    details.confirmPassword = 'Different1!';
    await signup.submit(details);

    await expect(page.getByText(/passwords must match/i)).toBeVisible();
    await expect(page.getByText(/sms verification/i)).not.toBeVisible();
  });

  test('shows required field errors when required fields are missing', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.submit({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    });

    const requiredError = page.locator('p.MuiFormHelperText-root', {
      hasText: /required/i,
    }).first();
    await expect(requiredError).toBeVisible();
    await expect(page.getByText(/sms verification/i)).not.toBeVisible();
  });

  test('submitting valid details opens the OTP modal', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fillForm(makeSignupFixture());
    await signup.acceptConsentAndSubmit();

    // Backend returns success → frontend opens OTP modal (NewSignUpPage:617).
    await expect(page.getByText(/sms verification/i)).toBeVisible({ timeout: 30_000 });
  });

  test('OTP modal shows resend button and input field', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fillForm(makeSignupFixture());
    await signup.acceptConsentAndSubmit();

    await expect(page.getByText(/sms verification/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('textbox', { name: /otp|verification code/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /resend|send again/i })).toBeVisible();
  });

  test('invalid OTP shows error message', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fillForm(makeSignupFixture());
    await signup.acceptConsentAndSubmit();

    await expect(page.getByText(/sms verification/i)).toBeVisible({ timeout: 30_000 });
    const otpInput = page.getByRole('textbox', { name: /otp|verification code/i });
    await otpInput.fill('000000');
    await page.getByRole('button', { name: /verify|confirm/i }).click();

    await expect(page.getByText(/invalid|incorrect|wrong.*otp/i)).toBeVisible();
  });

  test('clicking Sign In link navigates to login page', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    await page.getByRole('link', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/#\/login/);
    await expect(page.getByRole('heading', { name: /^login$/i })).toBeVisible();
  });

  test('signup page is accessible via keyboard navigation', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();

    // Tab through form fields
    await page.keyboard.press('Tab'); // First name
    await expect(signup.firstName).toBeFocused();
    await page.keyboard.press('Tab'); // Middle name
    await expect(signup.middleName).toBeFocused();
    await page.keyboard.press('Tab'); // Last name
    await expect(signup.lastName).toBeFocused();
    // Continue for other fields...
  });
});
