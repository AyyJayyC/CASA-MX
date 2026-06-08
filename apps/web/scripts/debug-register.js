const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));
  page.on('dialog', async (dialog) => {
    console.log('[dialog]', dialog.message());
    await dialog.dismiss();
  });

  try {
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });

    let submit = await page.$('button[type=submit]');
    const isDisabled = submit ? await submit.getAttribute('disabled') : 'missing';
    console.log('Submit disabled initially:', !!isDisabled);

    // Try clicking submit (expect disabled)
    if (submit) {
      await Promise.all([
        page.waitForTimeout(300),
        submit.click().catch((e) => console.log('[click error]', e.message))
      ]);
    }

    // Check for roles checkboxes
    const roleCheckbox = await page.$('input[type=checkbox][value=buyer]');
    if (!roleCheckbox) {
      console.log('Buyer checkbox not found');
    } else {
      await roleCheckbox.click();

      // Re-query the submit button because the DOM may have re-rendered
      submit = await page.$('button[type=submit]');
      const disabledAfter = submit ? await submit.getAttribute('disabled') : 'missing';
      console.log('Submit disabled after selecting role:', !!disabledAfter);

      // Fill name and email
      await page.fill('#name', 'Test User');
      await page.fill('#email', `test+${Date.now()}@example.com`);

      // Re-query submit before clicking to ensure we have the current element
      submit = await page.$('button[type=submit]');

      // Click submit when enabled
      if (submit && !(await submit.getAttribute('disabled'))) {
        // Use form.requestSubmit() to trigger form handlers reliably
        await page.evaluate(() => document.querySelector('form') && document.querySelector('form').requestSubmit());
        // wait a moment for any client-side processing
        await page.waitForTimeout(600);

        console.log('URL after submit:', page.url());
        const users = await page.evaluate(() => localStorage.getItem('casa-mx:1.0.0:users'));
        console.log('localStorage users:', users);
      } else {
        console.log('Submit still disabled or missing at final click time');
      }
    }
  } catch (err) {
    console.error('Error during reproduction:', err);
  } finally {
    await browser.close();
  }
})();
