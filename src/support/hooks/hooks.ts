import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import type { CustomWorld } from '../../utils/world';
import logger from '../../utils/logger';

const log = logger;
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== 'false';

let globalBrowser: Browser | undefined;

BeforeAll(async () => {
  log.info('BeforeAll: launching Playwright browser', { headless: HEADLESS });
  globalBrowser = await chromium.launch({ headless: HEADLESS, args: ['--start-maximized'] });
  log.info('Browser launched');
});

Before(async function (this: CustomWorld) {
  log.debug('Before: creating new scenario context');
  if (!globalBrowser) {
    log.error('Before: Playwright browser missing in BeforeAll');
    throw new Error('Playwright browser was not initialized in BeforeAll');
  }
  this.browser = globalBrowser;
  await this.newContext({
  viewport: null  // 👈 ensures actual window size
});
  log.debug('Before: browser context and page created');
});

After(async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
  const status = result?.status;
  log.info('After: scenario finished', { status: String(status) });
  if (String(status) === 'FAILED') {
    if (this.page) {
      log.error('After: scenario failed — taking screenshot');
      const buffer = await this.page.screenshot({ type: 'png', fullPage: true });
      await this.attach(buffer, 'image/png');
      log.info('After: screenshot attached to report');
    } else {
      log.warn('After: scenario failed but no page available to screenshot');
    }
  }

  await this.closeContext();
  log.debug('After: closed scenario context');
});

AfterAll(async () => {
  log.info('AfterAll: closing Playwright browser');
  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = undefined;
  }
  log.info('AfterAll: browser closed');
});
