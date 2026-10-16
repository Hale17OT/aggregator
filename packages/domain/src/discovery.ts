import { publicProjection, type PublicationRepository } from './publication.js';

export const deskSlug=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function discover(repo:PublicationRepository, query:{q?:string;topic?:string;page?:number;limit?:number}={}){
  const q=(query.q??'').trim();const page=query.page??1;const limit=query.limit??6;
  if(q.length>120||!Number.isSafeInteger(page)||page<1||page>10000||!Number.isSafeInteger(limit)||limit<1||limit>24)throw new Error('INVALID_DISCOVERY_QUERY');
  // Re-project on every request, before matching or counting: a cached hit is never permission.
  const publicItems=repo.list().map(d=>publicProjection(d,'brief')).filter(d=>d!==null);
  const topics=[...new Set(publicItems.map(d=>d.topic))].sort().map(name=>({name,slug:deskSlug(name)}));
  const terms=q.toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
  const matches=publicItems.filter(d=>(!query.topic||deskSlug(d.topic)===query.topic)&&terms.every(term=>`${d.headline} ${d.deck} ${d.blocks.map(b=>b.text).join(' ')}`.toLocaleLowerCase('en').includes(term)))
    .sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.slug.localeCompare(b.slug));
  return {data:matches.slice((page-1)*limit,page*limit),meta:{fixture:true,total:matches.length,page,limit,pages:Math.ceil(matches.length/limit),topics}};
}
