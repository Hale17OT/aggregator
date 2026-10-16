import type { PublicArticle } from '../../../../../packages/contracts/src/index';
type Result={data:PublicArticle[];meta:{fixture:boolean;total:number;page:number;limit:number;pages:number;topics:{name:string;slug:string}[]}};
export default defineEventHandler(async (event):Promise<Result>=>{
  try{return await $fetch<Result>(`${useRuntimeConfig(event).apiBase}/api/v1/discover`,{query:getQuery(event)});}
  catch(error:unknown){const status=(error as {statusCode?:number}).statusCode;throw createError({statusCode:status===422?422:503,statusMessage:status===422?'Invalid search filters':'Search unavailable'});}
});
