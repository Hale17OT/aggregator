import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
const phase = process.argv[2];
if (phase !== 'after-r2') throw Error('Explicit after-r2 capture phase required');
const dir = `output/targeted-closeout-20261016/evidence/web-journey-${phase}`;
if (existsSync(dir)) throw Error('Immutable capture occupied');
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
const page = await context.newPage();
const stages = [];
async function inspect(stage, pauseExpected) {
  await page.waitForTimeout(3000);
  const state = await page.locator('video').evaluate(v => ({ paused: v.paused, time: v.currentTime, src: v.currentSrc, index: v.dataset.index }));
  stages.push({ stage, ...state });
  if (pauseExpected !== undefined && state.paused !== pauseExpected) throw Error(`${stage}: pause mismatch`);
  await page.screenshot({ path: `${dir}/${stage}.png` });
}
try {
  await page.goto('http://127.0.0.1:3000/clips');
  await page.getByRole('button', { name: 'Play', exact: true }).first().waitFor();
  await inspect('ready', true);
  await page.getByRole('button', { name: 'Play', exact: true }).first().click();
  await inspect('playing', false);
  await page.waitForTimeout(4000);
  const box = await page.locator('video').boundingBox();
  await page.mouse.click(box.x + box.width * .25, box.y + box.height * .35);
  await inspect('picture-paused', true);
  await page.locator('.clip-feed').focus();
  await page.keyboard.press('ArrowDown');
  await inspect('next-paused', true);
  const slider = await page.getByRole('slider', { name: 'Clip position' }).boundingBox();
  await page.mouse.move(slider.x + slider.width * .2, slider.y + slider.height / 2);
  await page.mouse.down();
  await page.mouse.move(slider.x + slider.width * .5, slider.y + slider.height / 2, { steps: 10 });
  await page.mouse.up();
  await inspect('seek-paused', true);
  await page.getByRole('button', { name: 'Sources', exact: true }).click();
  await inspect('sources', true);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await inspect('sources-return', true);
  await page.locator('.clip-meta a').click();
  await page.waitForURL('**/articles/**');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${dir}/article.png` });
  await page.goBack();
  await inspect('article-return', true);
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await inspect('more', true);
  await page.keyboard.press('Escape');
  await inspect('final-paused', true);
} finally {
  writeFileSync(`${dir}/stages.json`, JSON.stringify(stages, null, 2));
  await context.close();
  await browser.close();
}
