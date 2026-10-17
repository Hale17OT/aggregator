import { createApp } from './app.js';
import {existsSync} from 'node:fs';
import {attestTarget} from '../../../packages/db/src/member.js';
import {publisherProjection,type SourceReaderRow} from '../../../packages/domain/src/publisher-reader.js';
import { createFixtureRepository } from '../../../packages/test-fixtures/src/index.js';
import { PostgresMemberUnit, readTarget } from '../../../packages/db/src/member.js';
for(const flag of ['REAL_INGESTION_ENABLED','LIVE_GENERATION_ENABLED','PUBLIC_PUBLICATION_ENABLED'])if(process.env[flag]==='true')throw new Error(`${flag} is not implemented or authorized`);
if(process.env.DATABASE_URL)throw new Error('Ambient database URLs are forbidden; refusing memory fallback');
const adapter=process.env.PERSISTENCE_ADAPTER||'memory';
if(!['memory','postgresql'].includes(adapter))throw new Error('Unknown adapter; refusing memory fallback');
if(process.env.FIXTURE_SESSION_ISSUANCE)throw new Error('Fixture issuance is available only to the non-HTTP test harness');
const port=Number(process.env.PORT||4000);
let unit:PostgresMemberUnit|undefined;
if(adapter==='postgresql'){
  if(!process.env.DISPOSABLE_DB_TARGET)throw new Error('Verified disposable target manifest required');
  unit=new PostgresMemberUnit(readTarget(process.env.DISPOSABLE_DB_TARGET),Number(process.env.FIXTURE_POOL_SIZE||2));
  await unit.run(async()=>undefined);
}
if(process.env.LOCAL_CAPTURED_AUTH==='true'&&(!unit||unit.target.purpose!=='aggregator-retained-demo-pg18'))throw new Error('Local sign-in requires verified retained demo target');
const liveReader=unit&&existsSync('.cache/live-reader-enabled.json')?async()=>{const client=await unit!.pool.connect();try{await attestTarget(client,unit!.target);const rows=(await client.query('SELECT public.reader_source_items() items')).rows[0].items as SourceReaderRow[];return rows.map(publisherProjection);}finally{client.release();}}:undefined;
const server=createApp(createFixtureRepository(),{unit,liveReader,localAuth:process.env.LOCAL_CAPTURED_AUTH==='true'?unit:undefined}).listen(port,'127.0.0.1',()=>{
  const address=server.address();console.log(`Local reader API ready on ${typeof address==='object'?address?.port:port}; member adapter ${adapter}; reviewed publisher lane and configured reader identity only; publication disabled`);
  if(process.send)process.send({ready:true,port:typeof address==='object'?address?.port:port});
});
for(const signal of ['SIGTERM','SIGINT'] as const)process.on(signal,()=>server.close(()=>{void unit?.close();}));

