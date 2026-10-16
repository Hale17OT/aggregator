import type { PublicArticle } from '../../../../../../packages/contracts/src/index';
export default defineEventHandler(async (event):Promise<{data:PublicArticle;meta:{fixture:boolean}}> => {
  const slug=getRouterParam(event,'slug')||'';
  if(!/^[a-z0-9-]+$/.test(slug))throw createError({statusCode:404,statusMessage:'Article unavailable'});
  const variant=getQuery(event).variant||'standard';
  if(variant!=='standard'&&variant!=='brief')throw createError({statusCode:422,statusMessage:'Invalid reading variant'});
  try { return await $fetch<{data:PublicArticle;meta:{fixture:boolean}}>(`${useRuntimeConfig(event).apiBase}/api/v1/articles/${slug}`,{query:{variant}}); }
  catch(error:unknown){const status=(error as {statusCode?:number}).statusCode||503;throw createError({statusCode:status,statusMessage:status===410?'Article withdrawn':status===404?'Article unavailable':'Reading service unavailable'});}
});
