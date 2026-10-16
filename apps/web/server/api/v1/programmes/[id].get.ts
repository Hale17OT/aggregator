import type { Programme } from '../../../../../../packages/contracts/src/programme';
export default defineEventHandler(async event=>{
  const id=getRouterParam(event,'id');if(!id||!/^[a-zA-Z0-9_-]{1,160}$/.test(id))throw createError({statusCode:404});
  return await $fetch<{data:Programme}>(`${useRuntimeConfig(event).apiBase}/api/v1/programmes/${id}`);
});
