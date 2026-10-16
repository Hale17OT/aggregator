import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';


export async function withDisposableDatabase(work,options={}){
const root=realpathSync('.'),cache=join(root,'.cache');mkdirSync(cache,{recursive:true});
const retained=options.retained===true;
const pipeline=options.pipeline===true;
assert.ok(!(retained&&pipeline));
const data=join(cache,retained?'pg18-retained-demo':(pipeline?'pg18-pipeline-':'pg18-')+randomUUID()),port=retained?55441:pipeline?55442:55440;
const manifest=join(cache,'retained-db-owner.json');
const existing=retained&&existsSync(data);
if(existing&&!existsSync(manifest))throw new Error('Unknown retained directory; refusing adoption');
assert.ok(resolve(data).startsWith(root+sep+'.cache'+sep));
const bin=process.env.PG_BIN||(process.platform==='win32'?'C:/Program Files/PostgreSQL/18/bin':'/usr/lib/postgresql/18/bin');
const executable=n=>join(bin,n+(process.platform==='win32'?'.exe':''));
const env={...process.env};for(const key of Object.keys(env))if(key.startsWith('PG'))delete env[key];
function run(name,args,input,allowFailure=false){
 const r=spawnSync(executable(name),args,{encoding:'utf8',input,env,stdio:name==='pg_ctl'?'ignore':'pipe',maxBuffer:8*1024*1024,timeout:60000,windowsHide:true});
 if(r.error)throw r.error;
 if(r.status!==0&&!allowFailure)throw new Error(`${name} failed: ${(r.stderr||r.stdout||'see cluster log').slice(-1800)}`);
 if(r.stdout)r.stdout=r.stdout.replace(/\r\n/g,'\n');return r;
}
const version=run('postgres',['--version']).stdout.trim();assert.match(version,/PostgreSQL\) 18\./);
await new Promise((ok,no)=>{const s=createServer();s.once('error',no);s.listen(port,'127.0.0.1',()=>s.close(ok));});
if(!existing){mkdirSync(data);run('initdb',['-D',data,'-U','agg_bootstrap','-A','trust','--no-locale','-E','UTF8']);}
const control=run('pg_controldata',['-D',data]).stdout;const systemIdentifier=control.match(/Database system identifier:\s+(\d+)/)?.[1];assert.ok(systemIdentifier);
if(existing){const owner=JSON.parse(readFileSync(manifest,'utf8'));assert.equal(owner.purpose,'aggregator-retained-demo-pg18');assert.equal(owner.systemIdentifier,systemIdentifier);assert.equal(realpathSync(owner.data),realpathSync(data));assert.equal(owner.port,port);}
else if(retained)writeFileSync(manifest,JSON.stringify({purpose:'aggregator-retained-demo-pg18',data,port,systemIdentifier}));
const names=['aggregator_fresh','aggregator_upgrade','aggregator_failure','aggregator_identity','aggregator_pipeline'];
function raw(name,sql,user='agg_bootstrap',allowFailure=false){return run('psql',['-X','-qAt','-h','127.0.0.1','-p',String(port),'-U',user,'-d',name,'-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose'],sql,allowFailure);}
function verify(name){
 assert.ok(['postgres',...names].includes(name));
 const actual=JSON.parse(raw(name,"SELECT json_build_object('directory',current_setting('data_directory'),'database',current_database(),'host',inet_server_addr(),'port',inet_server_port(),'version',current_setting('server_version_num'),'system',system_identifier::text) FROM pg_control_system()").stdout);
 assert.equal(realpathSync(actual.directory),realpathSync(data));assert.equal(actual.database,name);assert.equal(actual.host,'127.0.0.1');assert.equal(actual.port,port);assert.ok(Number(actual.version)>=180000&&Number(actual.version)<190000);assert.equal(actual.system,systemIdentifier);return actual;
}
function db(name){return {sql(sql,user){verify(name);return raw(name,sql,user).stdout.trim();},scalar(sql){verify(name);return raw(name,sql).stdout.trim();},reject(sql,user,state){verify(name);const r=raw(name,sql,user,true);assert.notEqual(r.status,0);assert.ok(r.stderr.includes(state),r.stderr);}};}
let started=false,completed=false;
try{
 started=true;run('pg_ctl',['-D',data,'-l',join(cache,'pg18-'+systemIdentifier+'.log'),'-o',`-h 127.0.0.1 -p ${port}`,'-w','start']);
 verify('postgres');if(!existing)raw('postgres',`CREATE ROLE agg_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE agg_reader NOLOGIN; CREATE ROLE agg_member NOLOGIN; CREATE ROLE agg_worker NOLOGIN;
CREATE ROLE agg_reader_login LOGIN INHERIT; GRANT agg_reader TO agg_reader_login;
CREATE ROLE agg_member_login LOGIN INHERIT; GRANT agg_member TO agg_member_login;
CREATE ROLE agg_worker_login LOGIN INHERIT; GRANT agg_worker TO agg_worker_login;
CREATE ROLE agg_pipeline NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE agg_pipeline_login LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; GRANT agg_pipeline TO agg_pipeline_login;
CREATE ROLE agg_outsider LOGIN;
CREATE ROLE agg_session_runtime NOLOGIN; CREATE ROLE agg_fixture_maintenance NOLOGIN;
CREATE ROLE agg_api_login LOGIN INHERIT; GRANT agg_member,agg_session_runtime TO agg_api_login;
CREATE ROLE agg_maintenance_login LOGIN INHERIT; GRANT agg_fixture_maintenance TO agg_maintenance_login;
GRANT pg_read_all_settings TO agg_owner;
GRANT EXECUTE ON FUNCTION pg_catalog.pg_control_system() TO agg_owner;`);

 function createDatabase(name){
  assert.ok(names.includes(name));verify('postgres');
  if(existing&&raw('postgres',`SELECT count(*) FROM pg_database WHERE datname='${name}'`).stdout.trim()==='1')return db(name);
  run('createdb',['-h','127.0.0.1','-p',String(port),'-U','agg_bootstrap','-O','agg_owner',name]);
  db(name).sql(`REVOKE ALL ON DATABASE ${name} FROM PUBLIC; GRANT CONNECT ON DATABASE ${name} TO agg_reader_login,agg_member_login,agg_worker_login,agg_api_login,agg_maintenance_login;`);
  return db(name);
 }
 const result=await work({root,data,port,version,systemIdentifier,db,verify,createDatabase,existing});completed=true;return result;
}finally{
 if(!(retained&&options.keepRunning&&completed)&&started&&run('pg_ctl',['-D',data,'status'],undefined,true).status===0)run('pg_ctl',['-D',data,'-m','fast','-w','stop']);
}
}
