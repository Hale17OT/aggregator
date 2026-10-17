import sax from 'sax';
import {parse,renderSync} from 'ultrahtml';
import {extract,hash} from './input.mjs';
import {permittedUrl} from './live-fetch.mjs';
export function publisherText(html){
 const tree=parse(html);let nodes=0;
 const prune=(node,depth=0)=>{if(++nodes>10000||depth>48)throw Error('ARTICLE_PARSE_LIMIT');
  node.children=(node.children||[]).filter(c=>!['figure','figcaption','img','video','audio','iframe','script','style','nav','footer','svg','form','button'].includes(c.name?.toLowerCase())&&!/(?:^|\s)(?:hds-media|hds-credits|hds-article-hero-header|hds-article-header|wp-caption|wp-block-nasa-blocks-credits-and-details|wp-block-nasa-blocks-related-content|wp-block-nasa-blocks-related-articles|wp-block-nasa-blocks-topic-cards|social-icons|related-posts|keep-exploring)(?:\s|$)/.test(c.attributes?.class||''));
  for(const child of node.children)prune(child,depth+1);
 };prune(tree);return extract(Buffer.from(renderSync(tree)),'html').text;
}
export function parseLiveFeed(bytes,hosts,{institutionAuthor=null}={}){
 if(bytes.length>2097152)throw Error('FEED_SIZE');
 const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 if(/<!\s*(DOCTYPE|ENTITY)/i.test(raw))throw Error('FEED_DTD_DENIED');
 const parser=sax.parser(true,{strictEntities:true}),items=[];let item=null,field='',depth=0,nodes=0;
 parser.onopentag=n=>{if(++depth>32||++nodes>30000)throw Error('FEED_LIMIT');field=n.name.toLowerCase();if(field==='item')item={};};
 const text=t=>{if(item&&['title','link','guid','description','content:encoded','dc:creator','pubdate','category'].includes(field)){item[field]=(item[field]||'')+t;if(item[field].length>262144)throw Error('ITEM_LIMIT');}};
 parser.ontext=text;parser.oncdata=text;
 parser.onclosetag=n=>{depth--;if(n.toLowerCase()==='item'){if(items.length>=100)throw Error('FEED_ITEM_LIMIT');items.push(item);item=null;}field='';};
 parser.write(raw).close();
 if(depth!==0||item!==null)throw Error('FEED_TRUNCATED');
 return items.map(i=>{
  const url=permittedUrl((i.link||'').trim(),hosts).href,date=new Date(i.pubdate);
  if(!i.title||!(i['dc:creator']||institutionAuthor)||!Number.isFinite(date.getTime()))throw Error('ITEM_METADATA');
  const html=i['content:encoded']||i.description||'';
  let body=html?publisherText(html):'';if(new URL(url).pathname.startsWith('/news-release/'))body=body.split(/\n\n-end-\n\n/)[0];
  const title=extract(Buffer.from('<p>'+i.title+'</p>'),'html').text;
  return {key:hash(i.guid||url),url,title,author:(i['dc:creator']||institutionAuthor).trim(),publishedAt:date.toISOString(),body,contentHash:hash(html),rawHtml:html};
 });
}




import {Buffer} from 'node:buffer';
import {TextDecoder} from 'node:util';
