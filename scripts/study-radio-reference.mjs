import { chromium } from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}); const page=await browser.newPage({viewport:{width:1440,height:1100}});
await page.goto('http://127.0.0.1:3000/radio');await page.screenshot({path:'output/playwright/radio-rebuild/before-radio.png',fullPage:false});
await page.goto('https://www.dqnamo.com/experiments/cassette-player',{waitUntil:'networkidle'});await page.screenshot({path:'output/playwright/radio-rebuild/reference-desktop.png'});await writeFile('output/playwright/radio-rebuild/reference.txt',await page.locator('body').innerText());console.log(await page.locator('button').evaluateAll(bs=>bs.map(b=>({text:b.textContent,aria:b.getAttribute('aria-label')}))));await browser.close();
