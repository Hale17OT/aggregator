import type { Programme } from '../../../../../../packages/contracts/src/programme';
export default defineEventHandler(async event=>{
  return await $fetch<{data:Programme[]}>(`${useRuntimeConfig(event).apiBase}/api/v1/programmes`);
});
