import { defineEventHandler, getRequestHeader, readRawBody, setResponseHeader, setResponseStatus, createError } from 'h3';

// Fixed member API only. Public reader/source/media paths never use this credential forwarder.
export default defineEventHandler(async event=>{
  setResponseHeader(event,'Cache-Control','private, no-store');
  setResponseHeader(event,'Vary','Cookie');
  const path=event.path.split('?')[0]||'';
  if(!/^\/api\/v1\/(me\/(session|profile|export|account-action|preferences|interests|interest-preview|edition|clips|listening|queue|progress|bookmarks(?:\/[a-f0-9-]{36})?)|auth\/(logout|preflight|request|confirm|google\/(config|start|exchange|cancel)|native\/(bind|approve)))$/.test(path)||(event.path.includes('?')&&!path.endsWith('/edition')))throw createError({statusCode:404});
  if(path.endsWith('/edition')){const query=getQuery(event);if(Object.keys(query).some(k=>!['page','edition','q','topic'].includes(k))||Object.values(query).some(v=>typeof v!=='string'||v.length>120))throw createError({statusCode:422});}
  const method=event.method;
  const allowed:Record<string,string[]>=path.endsWith('/export')?{GET:['GET']}:path.endsWith('/account-action')?{POST:['POST']}:path.endsWith('/interests')?{GET:['GET'],PUT:['PUT']}:path.endsWith('/interest-preview')?{POST:['POST']}:path.endsWith('/edition')||path.endsWith('/clips')||path.endsWith('/session')||path.endsWith('/preflight')||path.endsWith('/google/config')||path.endsWith('/listening')?{GET:['GET']}:/\/auth\//.test(path)?{POST:['POST']}:(path.endsWith('/preferences')||path.endsWith('/profile'))?{GET:['GET'],PATCH:['PATCH']}:path.endsWith('/bookmarks')?{GET:['GET']}:path.endsWith('/queue')?{PUT:['PUT']}:{PUT:['PUT'],DELETE:['DELETE']};
  if(!allowed[method])throw createError({statusCode:405});
  const base=new URL(useRuntimeConfig(event).apiBase);
  if(base.protocol!=='http:'||base.hostname!=='127.0.0.1'||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw createError({statusCode:503,statusMessage:'Member service unavailable'});
  const headers:Record<string,string>={};
  for(const name of ['origin','content-type','x-csrf-token','sec-fetch-site']){const value=getRequestHeader(event,name);if(value)headers[name]=value;}
  const cookies=(getRequestHeader(event,'cookie')||'').split(';').map(c=>c.trim()).filter(c=>/^(agg_session|__Host-agg_session|agg_pre_auth|agg_native_browser)=/.test(c));
  if(cookies.length)headers.cookie=cookies.join('; ');
  const body=['GET','HEAD'].includes(method)?undefined:await readRawBody(event);
  if(body&&new TextEncoder().encode(body).length>(path.endsWith('/google/exchange')?12288:8192))throw createError({statusCode:413});
  try{
    const response=await fetch(new URL(event.path,base),{method,headers,body,redirect:'error',signal:AbortSignal.timeout(5000)});
    setResponseStatus(event,response.status);
    setResponseHeader(event,'Content-Type','application/json');
    const cookies=response.headers.getSetCookie();if(cookies.length)setResponseHeader(event,'Set-Cookie',cookies);
    setResponseHeader(event,'Referrer-Policy','no-referrer');
    const retry=response.headers.get('retry-after');if(retry)setResponseHeader(event,'Retry-After',Number(retry));
    return response.status===204?null:await response.text();
  }catch{throw createError({statusCode:503,statusMessage:'Member service unavailable'});}
});




