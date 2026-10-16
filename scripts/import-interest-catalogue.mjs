import { createHash } from 'node:crypto';
import seed from '../docs/next-build/completion/interest_catalogue.seed.json' with {type:'json'};
import { concepts,ancestors } from '../packages/domain/src/taxonomy.ts';
import assertions from '../packages/test-fixtures/reader-subjects.json' with {type:'json'};
const uuid=key=>{const h=createHash('sha256').update(key).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
export async function importInterests(client){
 for(const c of concepts)ancestors(c.id);
 const ids=new Map();
 for(const c of concepts){const r=await client.query(`INSERT INTO public.topics(id,slug,name,scope,concept_key,concept_kind,metadata) VALUES($1,$2,$3,'authored-local-reader-taxonomy',$4,$5,$6) ON CONFLICT(concept_key) DO UPDATE SET name=excluded.name,metadata=excluded.metadata RETURNING id`,[uuid(c.id),c.id.replaceAll(':','-'),c.label,c.id,c.kind,JSON.stringify(c)]);ids.set(c.id,r.rows[0].id);}
 for(const e of [...seed.topic_edges,...seed.entity_relations])await client.query('INSERT INTO public.concept_relations(from_id,to_id,relation,context) VALUES($1,$2,$3,$4) ON CONFLICT(from_id,to_id,relation) DO UPDATE SET context=excluded.context',[ids.get(e.from),ids.get(e.to),e.relation,JSON.stringify(e)]);
 if((await client.query("SELECT to_regclass('public.article_subject_assertions') AS present")).rows[0].present)for(const a of assertions)for(const [i,id] of a.material.entries())await client.query(`INSERT INTO public.article_subject_assertions(article_id,version_id,topic_id,relevance,classification_revision,provenance) SELECT $1,$2,$3,$4,$5,$6 WHERE EXISTS(SELECT FROM public.article_versions WHERE id=$2 AND article_id=$1) ON CONFLICT(version_id,topic_id) DO NOTHING`,[a.articleId,a.versionId,ids.get(id),i===0?'primary':'supporting',a.classificationRevision,a.provenance]);
 return {concepts:concepts.length,topics:concepts.filter(c=>c.kind==='topic').length,roots:concepts.filter(c=>c.is_browse_root).length,relations:seed.topic_edges.length+seed.entity_relations.length};
}
