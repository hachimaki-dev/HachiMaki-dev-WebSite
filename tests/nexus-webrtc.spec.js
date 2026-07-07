import { test, expect } from '@playwright/test';

// To run this test:
// 1. Install playwright (npm install -D @playwright/test)
// 2. npx playwright install
// 3. Start the dev server (npm run dev)
// 4. Run test (npx playwright test tests/nexus-webrtc.spec.js --project=chromium --headed)

test.describe('Nexus WebRTC P2P Transfer', () => {
  test('should exchange a file between two peers', async ({ browser }) => {
    // Increase timeout for WebRTC negotiation
    test.setTimeout(60000);

    // Create two independent contexts to simulate two users (Uploader and Downloader)
    const uploaderContext = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const downloaderContext = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    const uploaderPage = await uploaderContext.newPage();
    const downloaderPage = await downloaderContext.newPage();

    // 1. Setup Uploader
    await uploaderPage.goto('http://localhost:5173/nexus');
    await expect(uploaderPage.locator('h1', { hasText: 'EL NEXO' })).toBeVisible({ timeout: 15000 });

    // Force fallback mode by removing showOpenFilePicker to test the input type=file fallback
    await uploaderPage.evaluate(() => {
      delete window.showOpenFilePicker;
    });

    // Uploader clicks "AGREGAR ARCHIVOS"
    // Since fallback uses an input element, we can listen for filechooser
    const [fileChooser] = await Promise.all([
      uploaderPage.waitForEvent('filechooser'),
      uploaderPage.getByRole('button', { name: /AGREGAR ARCHIVOS/ }).click()
    ]);
    
    // Provide a test file
    await fileChooser.setFiles({
      name: 'playwright-test-secret.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test file for WebRTC P2P transfer.')
    });

    // Verify file appears in Uploader's local vault
    await expect(uploaderPage.getByText('playwright-test-secret.txt')).toBeVisible();

    // 2. Setup Downloader
    await downloaderPage.goto('http://localhost:5173/nexus');
    await expect(downloaderPage.locator('h1', { hasText: 'EL NEXO' })).toBeVisible({ timeout: 15000 });

    // Downloader waits for Uploader to appear in the Network Peers list
    // Look for a peer card that contains the test file name
    const downloaderCard = downloaderPage.locator('.bg-bg.rounded.border', { hasText: 'playwright-test-secret.txt' }).first();
    
    // Wait until the peer card and the file are visible to the downloader
    await expect(downloaderCard).toBeVisible({ timeout: 20000 });

    // 3. Initiate Transfer
    // Downloader clicks "INTERCEPTAR"
    await downloaderCard.getByRole('button', { name: /INTERCEPTAR/ }).click();

    // Verify Downloader state updates
    await expect(downloaderPage.getByText(/SOLICITANDO: playwright-test-secret\.txt/)).toBeVisible();

    // 4. Uploader approves Transfer
    // Uploader should see incoming request
    await expect(uploaderPage.getByText('SOLICITUD DE INTERCEPCIÓN')).toBeVisible();
    await uploaderPage.getByRole('button', { name: /PERMITIR/ }).click();

    // 5. Transfer verification
    // Both should reach 100% and show completed messages
    await expect(uploaderPage.getByText(/TRANSMISIÓN COMPLETADA/)).toBeVisible({ timeout: 15000 });
    await expect(downloaderPage.getByText(/INTERCEPCIÓN COMPLETADA/)).toBeVisible({ timeout: 15000 });

    // The download is triggered automatically. Playwright can catch it if needed:
    // This is optional since "INTERCEPCIÓN COMPLETADA" implies the file was fully received and downloaded.

    // Cleanup
    await uploaderContext.close();
    await downloaderContext.close();
  });
});
