import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3';
export default defineEventHandler(async(event):Promise<{data:{renditionKey:string;audioHash:string;stepMs:number;rms:number[];peak:number[]}}>=>{
  const id=getRouterParam(event,'id');if(!id||!/^radio-[a-z0-9-]+$/.test(id))throw createError({statusCode:404});
  setHeader(event,'Cache-Control','no-store');
  return await $fetch<{data:{renditionKey:string;audioHash:string;stepMs:number;rms:number[];peak:number[]}}>(`${useRuntimeConfig(event).apiBase}/api/v1/programmes/${id}/envelope`);
});
