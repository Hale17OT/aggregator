// Build an item-bound policy proposal from the separately reviewed saved responses.
// This does not apply grants or fetch new content.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseLiveFeed} from '../packages/editorial/live-feed.mjs';
const review=readFileSync('docs/execution/REAL_NEWS_SOURCE_RIGHTS_REVIEW.md','utf8');
const exclusions=['after-flood-disasters','isaias-dims','hubble-spies','mars-moons'];
const sources=[{slug:'global-voices',file:'globalvoices',name:'Global Voices',type:'publisher',feed:'https://globalvoices.org/feed/',hosts:['globalvoices.org'],topic:'World',license:'CC BY 3.0 — Global Voices text, item exceptions excluded',terms:'https://globalvoices.org/about/global-voices-attribution-policy/'},{slug:'nasa',file:'nasa',name:'NASA',type:'institution',feed:'https://www.nasa.gov/feed/',hosts:['www.nasa.gov','science.nasa.gov'],topic:'Science',license:'NASA informational text use; no endorsement or audiovisual rights',terms:'https://www.nasa.gov/nasa-brand-center/images-and-media/'}];
const overrides={'when-free-speech':'Tirso Sitoe; English translation by Liam Anderson','subsea-cables':'Alli Armijo','low-altitude-flights':'Sharon Teitelbaum','i-am-artemis-allison':'Matina Douzenis'};
for(const source of sources){
 const input=parseLiveFeed(readFileSync('.cache/live-source-review/'+source.file+'.xml'),source.hosts,{institutionAuthor:source.slug==='nasa'?'NASA':null});
 source.policyRevision=2;
 source.grantKey='local-reader-'+source.slug+'-20261017';
 source.items=input.filter(item=>review.split('\n').some(line=>line.includes(item.url)&&line.includes('CONDITIONAL'))&&!exclusions.some(part=>item.url.includes(part))).map(item=>({url:item.url,contentHash:item.contentHash,bodyHash:createHash('sha256').update(item.body).digest('hex'),title:item.title,publishedAt:item.publishedAt,author:Object.entries(overrides).find(([part])=>item.url.includes(part))?.[1]||item.author,decision:'text-only'}));
}
writeFileSync('docs/engineering/real-news-google-profile/source-policy-proposal.json',JSON.stringify({reviewerKind:'agent-license-review',humanApproval:false,createdAt:new Date().toISOString(),sourceReview:'docs/execution/REAL_NEWS_SOURCE_RIGHTS_REVIEW.md',sources},null,2));
console.log('Item-bound text-only proposal:',sources.map(s=>[s.slug,s.items.length]));
