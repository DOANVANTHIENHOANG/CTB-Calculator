const { test: base, expect, chromium } = require('@playwright/test');
const path = require('path');

// Trỏ về thư mục gốc 01-caidat nơi chứa file manifest.json
const extensionPath = path.resolve(__dirname, '..');

const test = base.extend({
  // 1. Khởi chạy trình duyệt Chromium kèm extension đã giải nén
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    await use(context);
    await context.close();
  },

  // 2. Lấy Extension ID từ Service Worker (background.js)
  extensionId: async ({ context }, use) => {
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    const extensionId = new URL(serviceWorker.url()).host;
    await use(extensionId);
  },

  // 3. Tự động mở trang sidepanel của Extension để kịch bản test thao tác
  extensionPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/sidepanel/sidepanel.html`);
    await use(page);
    await page.close();
  }
});

module.exports = { test, expect };