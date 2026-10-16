import { getRequestHeader,proxyRequest } from 'h3';
export default defineEventHandler(async event=>{
  const id=getRouterParam(event,'id');if(!id||!/^[a-zA-Z0-9_-]{1,160}$/.test(id))throw createError({statusCode:404});
  const base=new URL(useRuntimeConfig(event).apiBase);if(base.protocol!=='http:'||base.hostname!=='127.0.0.1'||base.username||base.password)throw createError({statusCode:503});
  const range=getRequestHeader(event,'range');
  return proxyRequest(event,new URL(`/api/v1/programme-assets/${id}`,base).href,{fetchOptions:{redirect:'error',headers:range?{range}:{}},headers:{cookie:'',authorization:''}});
});
