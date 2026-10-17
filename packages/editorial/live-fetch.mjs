import https from 'node:https';
import {Buffer} from 'node:buffer';
import {clearTimeout} from 'node:timers';
import {lookup} from 'node:dns/promises';
import {BlockList,isIP} from 'node:net';
const forbidden=new BlockList();
for(const [ip,bits] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]])forbidden.addSubnet(ip,bits,'ipv4');
const global6=new BlockList();global6.addSubnet('2000::',3,'ipv6');
for(const [ip,bits] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]])forbidden.addSubnet(ip,bits,'ipv6');
export function publicAddress(address){const family=isIP(address);return family===4?!forbidden.check(address,'ipv4'):family===6&&global6.check(address,'ipv6')&&!forbidden.check(address,'ipv6');}
export function permittedUrl(value,hosts){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.hash||u.port&&u.port!=='443'||!hosts.includes(u.hostname)||isIP(u.hostname))throw Error('SOURCE_DESTINATION_DENIED');return u;}
export async function fetchSource(value,hosts,{etag,lastModified,redirects=0,deadline=Date.now()+15000}={}){
 const u=permittedUrl(value,hosts);if(redirects>3||deadline<=Date.now())throw Error('SOURCE_DEADLINE');
 const paths={'www.nasa.gov':['/feed/','/robots.txt','/nasa-brand-center/images-and-media/'],'globalvoices.org':['/feed/','/robots.txt','/about/global-voices-attribution-policy/']};
 if(!paths[u.hostname]?.includes(u.pathname)||u.search)throw Error('SOURCE_PATH_DENIED');
 let dnsTimer,answers;
 try{answers=await Promise.race([lookup(u.hostname,{all:true}),new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('SOURCE_DNS_TIMEOUT')),Math.min(5000,deadline-Date.now()));})]);}finally{clearTimeout(dnsTimer);}
 if(!answers.length||answers.some(a=>!publicAddress(a.address)))throw Error('SOURCE_ADDRESS_DENIED');
 const selected=answers.find(a=>a.family===4)||answers[0];
 const response=await new Promise((resolve,reject)=>{
  const headers={'User-Agent':'TheAggregator-LocalResearch/1.0','Accept':'application/rss+xml, application/atom+xml, application/xml, text/html','Accept-Encoding':'identity'};
  if(etag)headers['If-None-Match']=etag;if(lastModified)headers['If-Modified-Since']=lastModified;
  const req=https.request(u,{method:'GET',headers,agent:false,lookup:(_host,_options,done)=>_options.all?done(null,[selected]):done(null,selected.address,selected.family)},res=>{
   if(res.statusCode===429){const value=res.headers['retry-after'];const seconds=/^\d+$/.test(value||'')?Number(value):Math.ceil((Date.parse(value||'')-Date.now())/1000);const error=Object.assign(Error('SOURCE_RATE_LIMIT'),{retryAfterSeconds:Math.max(60,Math.min(86400,Number.isFinite(seconds)?seconds:900))});res.destroy();reject(error);return;}
   if(res.statusCode===200&&!/^(application\/(rss\+xml|atom\+xml|xml)|text\/(xml|html|plain))(;|$)/i.test(res.headers['content-type']||'')){res.destroy();reject(Error('SOURCE_TYPE_DENIED'));return;}
   if(res.headers['content-encoding']&&res.headers['content-encoding']!=='identity'){res.destroy();reject(Error('SOURCE_ENCODING_DENIED'));return;}
   const chunks=[];let size=0;
   res.on('data',chunk=>{size+=chunk.length;if(size>2097152){res.destroy(Error('SOURCE_SIZE_LIMIT'));return;}chunks.push(chunk);});
   res.on('error',reject);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks),url:u.href,address:selected.address}));
  });
  req.on('socket',socket=>socket.once('secureConnect',()=>{if(socket.remoteAddress!==selected.address)req.destroy(Error('SOURCE_CONNECTION_MISMATCH'));}));
  const timer=setTimeout(()=>req.destroy(Error('SOURCE_DEADLINE')),Math.max(1,deadline-Date.now()));
  req.on('close',()=>clearTimeout(timer));req.on('error',()=>reject(Error('SOURCE_NETWORK_FAILURE')));req.end();
 });
 if([301,302,303,307,308].includes(response.status)){if(!response.headers.location)throw Error('SOURCE_REDIRECT_INVALID');return fetchSource(new URL(response.headers.location,u).href,hosts,{redirects:redirects+1,deadline});}
 if(![200,304].includes(response.status))throw Error(`SOURCE_HTTP_${response.status}`);
 if(response.status===200&&!/^(application\/(rss\+xml|atom\+xml|xml)|text\/(xml|html|plain))(;|$)/i.test(response.headers['content-type']||''))throw Error('SOURCE_TYPE_DENIED');
 return response;
}


