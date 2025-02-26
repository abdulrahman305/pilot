import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";
import { Page as PlaywrightPage } from "playwright";

describe("Wix Domains Page Testing", () => {
  let testContext: TestContext;
  let page: PlaywrightPage;

  beforeAll(async () => {
    testContext = await setupTestEnvironment("wix-domains.html", "playwright");
    page = testContext.page as PlaywrightPage;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  beforeEach(async () => {
    await page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });
  });

  it("should match the screenshot against the baseline image", async () => {
    await page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    await page.setViewportSize({ width: 800, height: 600 });
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: "wix-domains-playwright-desktop",
      failureThreshold: 0.05,
      failureThresholdType: "percent",
    });
  });

  it("should generate the expected clean view structure", async () => {
    const structure = await page.evaluate(() => {
      window.driverUtils.markImportantElements();
      return window.driverUtils.extractCleanViewStructure();
    });
    expect(structure).toMatchSnapshot("wix-domains-clean-view-structure");
  });
});
