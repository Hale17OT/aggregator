import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const root='http://127.0.0.1:3000',dir='output/shortform-rebuild/verification/member';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {for(let run=1;run<=3;run++){
 const context=await browser.newContext(),page=await context.newPage(),email=`shortform-${Date.now()}-${run}@example.test`;
 await page.goto(root+'/sign-in');await page.getByLabel('Email address').fill(email);await page.getByRole('button',{name:'Send sign-in link',exact:true}).click();await page.getByRole('heading',{name:'Check the captured mailbox'}).waitFor();
 let link;
 for(let n=0;n<30&&!link;n++){const inbox=await(await fetch('http://127.0.0.1:8025/api/v1/messages?limit=100')).json();const item=inbox.messages.find(m=>m.To.some(to=>to.Address===email));if(item){const message=await(await fetch('http://127.0.0.1:8025/api/v1/message/'+item.ID)).json();link=message.Text.match(/http:\/\/127\.0\.0\.1:3000\/auth\/confirm#[^\s]+/)?.[0];}else await page.waitForTimeout(200);}
 assert(link);await page.goto(link);await page.getByRole('button',{name:'Confirm sign in',exact:true}).click();await page.waitForURL(url=>['/library','/interests'].includes(url.pathname));if(new URL(page.url()).pathname==='/interests'){await page.getByRole('button',{name:'Skip setup',exact:true}).click();await page.waitForURL('**/library');}
 await page.goto(root+'/clips');await page.getByRole('button',{name:'Save',exact:true}).waitFor();await page.getByRole('button',{name:'Save',exact:true}).click();await page.getByRole('button',{name:'Unsave',exact:true}).waitFor();
 let saved=(await(await context.request.get(root+'/api/v1/me/bookmarks')).json()).data;assert.equal(saved.length,1);const id=saved[0].articleId;
 const library=await context.newPage();await library.goto(root+'/library');await library.getByRole('button',{name:'Remove saved story',exact:true}).waitFor();
 await page.getByRole('button',{name:'Unsave',exact:true}).click();await page.getByRole('button',{name:'Save',exact:true}).waitFor();saved=(await(await context.request.get(root+'/api/v1/me/bookmarks')).json()).data;assert.equal(saved.length,0);
 await page.route('**/api/v1/me/bookmarks/'+id,route=>route.request().method()==='PUT'?route.fulfill({status:503,contentType:'application/json',body:'{"error":"controlled unavailable"}'}):route.continue());
 await page.getByRole('button',{name:'Save',exact:true}).click();await page.getByRole('status').filter({hasText:'could not be saved'}).waitFor();assert.equal(await page.getByRole('button',{name:'Unsave',exact:true}).count(),0);await page.unrouteAll();
 await library.getByRole('button',{name:'Sign out',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Sources',exact:true}).click();await page.getByRole('dialog').waitFor();assert(await page.getByRole('dialog').getByRole('link',{name:'Exact original item'}).count()>=3);
 results.push({run,saveReadback:true,sharedLibrary:true,unsave:true,failureNoSuccess:true,anonymousSources:true});await context.close();
}}finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));}
