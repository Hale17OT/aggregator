import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Existing editorial modules are JavaScript runtime services.
import {publicAddress,permittedUrl} from '../packages/editorial/live-fetch.mjs';
// @ts-expect-error Existing editorial modules are JavaScript runtime services.
import {parseLiveFeed,publisherText} from '../packages/editorial/live-feed.mjs';
test('source connection classifier denies private and special destinations',()=>{
 for(const address of ['127.0.0.1','10.1.2.3','169.254.169.254','100.64.0.1','192.168.0.1','198.18.0.1','224.0.0.1','::1','::ffff:127.0.0.1','fc00::1','fe80::1','2001:db8::1'])assert.equal(publicAddress(address),false,address);
 assert.equal(publicAddress('8.8.8.8'),true);
});
test('live parser rejects entity, invalid encoding, oversized and incomplete source inputs',()=>{
 for(const bytes of [Buffer.from('<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///secret">]><rss>&x;</rss>'),Buffer.from([0xff]),Buffer.alloc(2097153),Buffer.from('<rss><channel>')])assert.throws(()=>parseLiveFeed(bytes,['www.nasa.gov']));
 const article=publisherText('<p>Actual reporting</p><script>steal()</script><iframe src="https://evil.example">tracker</iframe><figure><img src="x"><figcaption>Unlicensed caption</figcaption></figure><p>Next paragraph</p>');
 assert(article.includes('Actual reporting'));assert(article.includes('Next paragraph'));assert(!/steal|tracker|Unlicensed/.test(article));
});
test('live parser refuses fabricated missing author/date and private canonical URLs',()=>{
 const item=(url:string,date:string,author:string)=>Buffer.from(`<rss><channel><item><title>Report</title><link>${url}</link><pubDate>${date}</pubDate><dc:creator>${author}</dc:creator><description><![CDATA[<p>Report body</p>]]></description></item></channel></rss>`);
 for(const bytes of [item('https://127.0.0.1/a','2026-10-16','Author'),item('https://www.nasa.gov/a','not a date','Author'),item('https://www.nasa.gov/a','2026-10-16','')])assert.throws(()=>parseLiveFeed(bytes,['www.nasa.gov']));
});
test('source URL scope is fixed and does not accept credentials, IPs or alternate ports',()=>{
 const hosts=['www.nasa.gov'];
 assert.equal(permittedUrl('https://www.nasa.gov/feed/',hosts).hostname,'www.nasa.gov');
 for(const value of ['http://www.nasa.gov/feed/','https://www.nasa.gov.evil.example/','https://user@www.nasa.gov/','https://www.nasa.gov:8443/','https://127.0.0.1/','https://www.nasa.gov/#fragment'])assert.throws(()=>permittedUrl(value,hosts));
});
