import pg from 'pg';
import {writeFileSync} from 'node:fs';
import {readTarget,poolConfig,attestTarget} from '../packages/db/src/member.ts';
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json');
const c=new pg.Client(poolConfig(target,'agg_bootstrap',1));await c.connect();
try{await attestTarget(c,target);await c.query('BEGIN READ ONLY');
 const observations=(await c.query(`SELECT s.slug,o.http_status,count(*)::int observations,max(o.observed_at) latest FROM public.source_observations o JOIN public.source_items i ON i.id=o.item_id JOIN public.sources s ON s.id=i.source_id WHERE s.slug IN ('global-voices','nasa') GROUP BY s.slug,o.http_status ORDER BY s.slug,o.http_status`)).rows;
 const visible=(await c.query('SELECT jsonb_array_length(public.reader_source_items()) count')).rows[0].count;
 await c.query('ROLLBACK');writeFileSync('docs/engineering/real-news-google-profile/live-observations.json',JSON.stringify({at:new Date().toISOString(),observations,visible,limits:'Actual persisted network-observation statuses; separate source policy and synthetic fault tests remain necessary'},null,2));console.log({observations,visible});
}finally{await c.end();}
