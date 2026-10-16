// Test-only trusted prerequisite channel. Never imported by the runtime runner.
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { z } from 'zod';
const declarationSchema=z.strictObject({provenance:z.literal('fictional-test-declaration'),registry:z.array(z.strictObject({source:z.string().regex(/^[a-z0-9-]+$/),items:z.array(z.string()),kinds:z.array(z.enum(['html','feed','transcript','video']))})).max(40),declarations:z.array(z.strictObject({source:z.string(),item:z.string(),origin:z.string(),relationship:z.enum(['original','reprint','derived','cites']),independent:z.boolean(),provenance:z.literal('fictional-test-declaration')})).max(40)});
const declarations=()=>declarationSchema.parse(JSON.parse(readFileSync('fixtures/editorial-policy.json','utf8')));
export async function provision(harness,work){
 harness.verify('aggregator_pipeline');const db=new pg.Client({host:'127.0.0.1',port:55442,user:'agg_bootstrap',database:'aggregator_pipeline'});await db.connect();try{return await work(db);}finally{await db.end();}
}
export async function registry(harness){return provision(harness,async db=>{
 // Never derive permissions from the document bundle. Only this separate trusted
 // fixture declaration file supplies identities, covered items and use scope.
 for(const registration of declarations().registry){const source=registration.source;
 const id=(await db.query(`INSERT INTO sources(slug,name,source_type,home_url,identity_key,status,public_rationale) VALUES($1,$1,'publisher',$2,$1,'active','Fictional policy declaration; no human credibility approval') RETURNING id`,[source,'https://'+source+'.example.test'])).rows[0].id;
 await db.query(`INSERT INTO source_endpoints(source_id,adapter,endpoint_url,status,configuration) VALUES($1,'publisher_upload',$2,'active',$3)`,[id,'https://'+source+'.example.test/upload',JSON.stringify({key:source,localOnly:true})]);
 await db.query(`INSERT INTO rights_grants(source_id,grant_key,revision,status,allow_discovery,allow_fetch,allow_store,allow_model,allow_synthesis,scope,agreement_reference,starts_at,ends_at,raw_retention_days) VALUES($1,$2,1,'active',true,true,true,true,true,$3,'fictional-test-declaration',now()-interval '1 day',now()+interval '30 days',30)`,[id,source,JSON.stringify({provenance:'fictional-test-declaration',endpoint:source,items:registration.items,kinds:registration.kinds})]);
 }
 });}
export async function declareOrigins(harness){return provision(harness,async db=>{
 const policy=declarations();
 for(const d of policy.declarations){if(d.provenance!=='fictional-test-declaration')throw Error('TEST_DECLARATIONS_ONLY');
 const origin=(await db.query(`INSERT INTO reporting_origins(origin_key,label,origin_type,rationale) VALUES($1,$1,'original_reporting','fictional-test-declaration; not human verified') ON CONFLICT(origin_key) DO UPDATE SET origin_key=EXCLUDED.origin_key RETURNING id`,[d.origin])).rows[0].id;
 await db.query(`INSERT INTO item_origins(source_version_id,origin_id,relationship,counts_for_independence,rationale) SELECT v.id,$1,$2,$3,'fictional-test-declaration' FROM source_item_versions v JOIN source_items i ON i.id=v.item_id JOIN sources s ON s.id=i.source_id WHERE s.slug=$4 AND i.provider_item_key=$5 ON CONFLICT DO NOTHING`,[origin,d.relationship,d.independent,d.source,d.item]);
 }
 });}
