import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import type { CustomWorld } from '../../utils/world';

const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== 'false';

let globalBrowser: Browser | undefined;

BeforeAll(async () => {
  globalBrowser = await chromium.launch({ headless: HEADLESS });
});

Before(async function (this: CustomWorld) {
  if (!globalBrowser) throw new Error('Playwright browser was not initialized in BeforeAll');
  this.browser = globalBrowser;
  await this.newContext();
});

After(async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
  const status = result?.status;
  if (String(status) === 'FAILED') {
    if (this.page) {
      const buffer = await this.page.screenshot({ type: 'png', fullPage: true });
      // Attach screenshot to the Cucumber report
      // `attach` is provided by the World base class
      // contentType 'image/png' so report generators can render it
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.attach(buffer, 'image/png');
    }
  }

  await this.closeContext();
});

AfterAll(async () => {
  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = undefined;
  }
});
