import type { PublicArticle } from '../../../../../../packages/contracts/src/index';
export default defineEventHandler(async (event):Promise<{data:PublicArticle[];meta:{fixture:boolean}}> => {
  return await $fetch<{data:PublicArticle[];meta:{fixture:boolean}}>(`${useRuntimeConfig(event).apiBase}/api/v1/articles`);
});
