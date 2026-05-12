// @ts-check
import { test } from '@playwright/test';

test('probe login DOM', async ({ page }) => {
  await page.goto('/#/login');
  await page.getByRole('textbox', { name: /email or phone/i }).waitFor();
  const inputs = await page.locator('input').evaluateAll(els =>
    els.map(e => ({
      name: e.getAttribute('name'),
      type: e.getAttribute('type'),
      id: e.id,
    }))
  );
  console.log('LOGIN INPUTS:', JSON.stringify(inputs, null, 2));
});

test('probe signup DOM', async ({ page }) => {
  await page.goto('/#/signup');
  await page.waitForLoadState('networkidle');
  const inputs = await page.locator('input').evaluateAll(els =>
    els.map(e => ({
      name: e.getAttribute('name'),
      type: e.getAttribute('type'),
      placeholder: e.getAttribute('placeholder'),
      id: e.id,
      ariaLabel: e.getAttribute('aria-label'),
    }))
  );
  console.log('SIGNUP INPUTS:', JSON.stringify(inputs, null, 2));
});

test('probe invalid login error text', async ({ page }) => {
  await page.goto('/#/login');
  // Try filling by accessible name instead of name attr.
  await page.getByRole('textbox', { name: /email or phone/i }).fill('not-an-email');
  await page.getByRole('textbox', { name: /^password$/i }).fill('whatever');
  await page.getByRole('button', { name: /^login$/i }).click();
  await page.waitForTimeout(2000);
  const errors = await page.locator('p, span, div').evaluateAll(els =>
    els
      .map(e => (e.textContent || '').trim())
      .filter(t => /valid|invalid|incorrect|required|enter/i.test(t) && t.length < 120)
  );
  console.log('VALIDATION TEXTS:', JSON.stringify([...new Set(errors)], null, 2));
});
