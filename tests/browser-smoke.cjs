// Launches the production Vite build in Chromium and exercises user flows.
// Catches reference errors that npm build and pure-logic tests cannot detect.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright-core');

const address = 'http://127.0.0.1:4173/';
const server = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js', 'preview',
  '--host', '127.0.0.1', '--port', '4173', '--strictPort'
], { stdio: 'inherit' });

let browser;
async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Preview server stopped');
    try {
      const response = await fetch(address);
      if (response.ok) return;
    } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Preview server never became ready');
}

async function assertNoPageErrors(page, run) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.stack || String(error)));
  await run();
  assert.deepEqual(errors, [], 'No React or JavaScript errors during the flow');
}

async function main() {
  await ready();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  await assertNoPageErrors(desktop, async () => {
    await desktop.goto(address, { waitUntil: 'networkidle' });
    await desktop.getByRole('button', { name: '1', exact: true }).click();
    await desktop.getByText('數字 1', { exact: true }).waitFor();
    assert.equal(await desktop.locator('canvas').count(), 2);
    const area = await desktop.locator('canvas').last().boundingBox();
    assert.ok(area && area.width > 100 && area.height > 100, 'Tracing canvas is visible');

    await desktop.getByRole('button', { name: '寫好了' }).click();
    await desktop.getByRole('button', { name: /下一個數字/ }).click();
    await desktop.getByText('數字 2', { exact: true }).waitFor();
    await desktop.getByRole('button', { name: '回到主頁格' }).click();
    await desktop.getByRole('button', { name: '1', exact: true }).waitFor();
  });
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await assertNoPageErrors(mobile, async () => {
    await mobile.goto(address, { waitUntil: 'networkidle' });
    await mobile.locator('select').selectOption('981');
    await mobile.getByRole('button', { name: '1000', exact: true }).click();
    await mobile.getByText('數字 1000', { exact: true }).waitFor();
    assert.ok(await mobile.getByRole('button', { name: '下一個數字' }).isDisabled());
  });
  await mobile.close();
  console.log('Browser smoke tests passed on desktop and mobile (selection, drawing view, score, navigation, bounds).');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  server.kill('SIGTERM');
});
