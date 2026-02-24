import { After, Status } from '@cucumber/cucumber';

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({
      path: `reports/screenshots/${scenario.pickle.name}.png`,
      fullPage: true
    });

    // Attach to Allure
    await this.attach(screenshot, 'image/png');
  }
});