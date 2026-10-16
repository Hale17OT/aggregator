import {chromium} from 'playwright';
import {copyFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'output/shortform-rebuild/desktop-recording',size:{width:1280,height:720}}});
try {
 const page=await context.newPage(), recording=page.video();
 const hold=()=>page.waitForTimeout(2000);
 await page.goto('http://127.0.0.1:3000/clips');await hold();
 await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForTimeout(5000);
 const video=page.locator('video'),r=await video.boundingBox();
 await page.mouse.click(r.x+r.width/2,r.y+r.height/3);await hold();
 await page.getByRole('button',{name:'Next clip',exact:true}).click();await hold();
 await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForTimeout(4000);
 const s=await page.getByRole('slider',{name:'Clip position'}).boundingBox();
 await page.mouse.move(s.x+s.width*.2,s.y+s.height/2);await page.mouse.down();await page.mouse.move(s.x+s.width*.55,s.y+s.height/2,{steps:30});await page.mouse.up();await hold();
 await page.getByRole('button',{name:'Sources',exact:true}).click();await page.waitForTimeout(4000);
 await page.getByRole('button',{name:'Close',exact:true}).click();await hold();
 await page.getByRole('button',{name:'More',exact:true}).click();await hold();await page.keyboard.press('Escape');await hold();
 await page.locator('.clip-meta a').click();await page.waitForURL('**/articles/**');await hold();await page.goBack();await hold();
 if(!await page.locator('video').evaluate(v=>v.paused))throw Error('Return must remain paused');
 await context.close();copyFileSync(await recording.path(),'output/shortform-rebuild/desktop-interaction-uncut.webm');
} finally {await browser.close();}
