import { Pool, type PoolClient, type PoolConfig } from 'pg';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { AccessError, type Account, type IdentityRepository, type SessionRecord } from '../../domain/src/identity.js';
import {publisherProjection,type SourceReaderRow} from '../../domain/src/publisher-reader.js';
import type { MemberRepository, Bookmark } from '../../domain/src/member.js';
import type { MemberUnitOfWork } from '../../domain/src/member-unit.js';
import type { Preferences, PreferencesPatch,ListeningProgress } from '../../contracts/src/member.js';
import type { Interests,InterestsPatch } from '../../contracts/src/interests.js';

export interface DisposableTarget {purpose:'aggregator-disposable-pg18'|'aggregator-retained-demo-pg18';data:string;host:'127.0.0.1';port:55440|55441;database:'aggregator_identity';systemIdentifier:string;}
export function readTarget(path:string):DisposableTarget {
  const root=realpathSync('.'),file=realpathSync(path);
  if(!file.startsWith(root+sep+'.cache'+sep)||process.env.NODE_ENV==='production')throw new Error('Disposable database mode requires a local workspace manifest outside production');
  const target=JSON.parse(readFileSync(file,'utf8')) as DisposableTarget;
  if(!((target.purpose==='aggregator-disposable-pg18'&&target.port===55440)||(target.purpose==='aggregator-retained-demo-pg18'&&target.port===55441))||target.host!=='127.0.0.1'||target.database!=='aggregator_identity'||!/^\d+$/.test(target.systemIdentifier))throw new Error('Invalid workspace target');
  if(!realpathSync(target.data).startsWith(resolve(root,'.cache')+sep+'pg18-')||readFileSync(resolve(target.data,'PG_VERSION'),'utf8').trim()!=='18')throw new Error('Target is not a workspace PostgreSQL 18 cluster');
  return target;
}
export function poolConfig(target:DisposableTarget,user='agg_api_login',max=2):PoolConfig {
  if(!Number.isInteger(max)||max<1||max>4)throw new Error('Fixture pool size must be between one and four');
  return {host:target.host,port:target.port,database:target.database,user,password:'',ssl:false,max,
    connectionTimeoutMillis:600,idleTimeoutMillis:10000,query_timeout:3000,application_name:'aggregator-fixture-api',
    options:'-c search_path=pg_catalog -c statement_timeout=2000 -c lock_timeout=1000 -c idle_in_transaction_session_timeout=5000'};
}
const millis=(value:string|Date)=>new Date(value).getTime();
const preferences=(r:Record<string,unknown>):Preferences=>({theme:r.theme,textSize:r.text_size,reduceMotion:r.reduce_motion,homeMode:r.home_mode,language:r.language,timezone:r.timezone,lockVersion:r.lock_version,updatedAt:new Date(r.updated_at as string).toISOString(),playbackSpeed:Number(r.playback_speed),anchorCount:r.anchor_count,narrationVoice:r.narration_voice,mediaTreatment:r.media_treatment,listeningHistory:r.listening_history} as Preferences);
const progress=(r:Record<string,unknown>):ListeningProgress=>({programmeId:String(r.programme_id),renditionKey:String(r.rendition_key),positionMs:Number(r.position_ms),durationMs:Number(r.duration_ms),completed:Boolean(r.completed),revision:Number(r.revision),updatedAt:new Date(r.updated_at as string).toISOString()});
const bookmark=(r:Record<string,unknown>):Bookmark=>({userId:String(r.user_id),articleId:String(r.article_id),savedVersionId:String(r.saved_version_id),createdAt:new Date(r.created_at as string).toISOString()});

export class PostgresMemberRepository implements IdentityRepository,MemberRepository {
  async sourceBookmarks(userId:string){const current=(await this.client.query('SELECT public.reader_source_items() items')).rows[0].items as SourceReaderRow[];return (await this.client.query('SELECT * FROM public.source_bookmarks WHERE user_id=$1 ORDER BY created_at DESC',[userId])).rows.map(b=>{const source=current.find(s=>s.id===b.item_id);const a=source?publisherProjection(source):null;return {kind:'publisher-source',articleId:b.item_id,savedVersionId:b.saved_version_id,createdAt:b.created_at,status:a?'available':'unavailable',article:a?{id:a.id,versionId:a.versionId,slug:a.slug,headline:a.headline,correction:a.correction}:null};});}
  async saveSource(userId:string,id:string){const current=(await this.client.query('SELECT public.reader_source_items() items')).rows[0].items as SourceReaderRow[];const row=current.find(s=>s.id===id);if(!row)return null;await this.client.query('INSERT INTO public.source_bookmarks(user_id,item_id,saved_version_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[userId,id,row.versionId]);return {kind:'publisher-source',articleId:id,savedVersionId:row.versionId};}
  async removeSource(userId:string,id:string){await this.client.query('DELETE FROM public.source_bookmarks WHERE user_id=$1 AND item_id=$2',[userId,id]);}
  async profile(){return (await this.client.query('SELECT public.reader_profile() value')).rows[0].value;}
  async exportData(userId:string){
    const account=await this.profile();
    // reader_profile intentionally caps sessions at100. Refuse the boundary too,
    // because that capped projection cannot prove whether more rows exist.
    if(account.sessions.length>=100)throw new AccessError(413,'EXPORT_PAGINATION_REQUIRED');
    const result:Record<string,unknown>={format:'aggregator-member-export/1',generatedAt:new Date().toISOString(),account};
    // Fixed member-owned tables only; no media scan, source payload or token table.
    for(const table of ['user_preferences','topic_follows','interest_states','bookmarks','source_bookmarks','listening_queues','listening_progress']){
      const rows=(await this.client.query(`SELECT * FROM public.${table} WHERE user_id=$1 LIMIT 101`,[userId])).rows;
      if(rows.length>100)throw new AccessError(413,'EXPORT_PAGINATION_REQUIRED');result[table]=rows;
    }
    const consents=(await this.client.query('SELECT public.reader_consent_export() value')).rows[0].value;if(consents.length>100)throw new AccessError(413,'EXPORT_PAGINATION_REQUIRED');result.consents=consents;
    return {...result,notes:'Private member snapshot; at most100 records per collection. Larger exports require pagination and are refused without truncation. No server export file is created. Source bookmarks are references, not restricted publisher payloads.'};
  }
  async accountAction(action:'revoke-other'|'delete-account',sessionId:string,target?:string){if(!(await this.client.query('SELECT public.reader_account_action($1,$2,$3) ok',[action,sessionId,target??null])).rows[0].ok)throw new AccessError(403,'RECENT_SIGN_IN_REQUIRED');}
  async editProfile(revision:number,name:string){if(!(await this.client.query('SELECT public.edit_reader_profile($1,$2) ok',[revision,name])).rows[0].ok)throw new AccessError(409,'REVISION_CONFLICT');return this.profile();}
  private currentAccount?:Account;private selected?:SessionRecord;
  constructor(readonly client:PoolClient){}
  async session(id:string){
    const {rows}=await this.client.query('SELECT public.lookup_fixture_session($1::uuid) AS record',[id]);
    const record=rows[0]?.record;if(!record)return undefined;this.currentAccount=record.account;
    const r=record.session;
    this.selected={id:r.id,userId:r.user_id,tokenHash:r.token_hash,createdAt:millis(r.created_at),expiresAt:millis(r.expires_at),lastSeenAt:millis(r.last_seen_at),idleTimeoutMs:r.idle_timeout_ms,revokedAt:r.revoked_at?millis(r.revoked_at):null,authenticationMethod:r.authentication_method,assurance:r.assurance,mfaVerifiedAt:r.mfa_verified_at,accountVersion:r.account_version,csrfToken:r.csrf_token,transport:r.transport??'web',nativeClientId:r.native_client_id};
    return this.selected;
  }
  async account(id:string){return this.currentAccount?.id===id?this.currentAccount:undefined;}
  async insertSession(_record:SessionRecord){void _record;throw new AccessError(403,'FORBIDDEN');}
  async touchSession(id:string,now:number){
    if(this.selected?.id!==id)throw new AccessError(401,'UNAUTHENTICATED');
    const {rows}=await this.client.query('SELECT public.touch_fixture_session($1::uuid,$2::timestamptz) AS ok',[id,new Date(now)]);
    if(!rows[0].ok)throw new AccessError(401,'UNAUTHENTICATED');
    // Called only after IdentityService has checked the secret verifier. Same client/transaction.
    await this.client.query("SELECT set_config('aggregator.user_id',$1,true)",[this.selected.userId]);
  }
  async revokeSession(id:string,now:number){await this.client.query('SELECT public.revoke_fixture_session($1::uuid,$2::timestamptz)',[id,new Date(now)]);}
  async preferences(id:string){const {rows}=await this.client.query('SELECT * FROM public.user_preferences WHERE user_id=$1',[id]);if(!rows[0])throw new AccessError(404,'NOT_FOUND');return preferences(rows[0]);}
  async interests(id:string):Promise<Interests>{
    const state=await this.client.query('SELECT * FROM public.interest_states WHERE user_id=$1',[id]);
    const rules=await this.client.query('SELECT t.concept_key AS target,f.action,c.concept_key AS competition FROM public.topic_follows f JOIN public.topics t ON t.id=f.topic_id LEFT JOIN public.topics c ON c.id=f.competition_id WHERE f.user_id=$1 AND t.concept_key IS NOT NULL ORDER BY t.concept_key',[id]);
    return {revision:state.rows[0]?.revision??0,status:state.rows[0]?.status??'not_started',hiddenStories:state.rows[0]?.hidden_stories??[],updatedAt:state.rows[0]?.updated_at?.toISOString()??null,rules:rules.rows.map(r=>({target:r.target,action:r.action,...(r.competition?{competition:r.competition}:{})}))};
  }
  async updateInterests(id:string,p:InterestsPatch){
    await this.client.query('INSERT INTO public.interest_states(user_id) VALUES($1) ON CONFLICT DO NOTHING',[id]);
    const changed=await this.client.query('UPDATE public.interest_states SET revision=revision+1,status=$3,hidden_stories=$4,updated_at=now() WHERE user_id=$1 AND revision=$2 RETURNING revision',[id,p.revision,p.status,p.hiddenStories]);
    if(!changed.rowCount)throw new AccessError(409,'CONFLICT');
    // Preserve unmapped legacy follows; only this explicit catalogue selection is replaced.
    await this.client.query('DELETE FROM public.topic_follows f USING public.topics t WHERE f.topic_id=t.id AND f.user_id=$1 AND t.concept_key IS NOT NULL',[id]);
    for(const r of p.rules){const inserted=await this.client.query(`INSERT INTO public.topic_follows(user_id,topic_id,action,competition_id) SELECT $1,t.id,$3,c.id FROM public.topics t LEFT JOIN public.topics c ON c.concept_key=$4 WHERE t.concept_key=$2 AND t.status='active' AND ($4::text IS NULL OR c.concept_kind='competition') RETURNING topic_id`,[id,r.target,r.action,r.competition??null]);if(!inserted.rowCount)throw new AccessError(422,'INVALID_INPUT');}
    return this.interests(id);
  }
  async updatePreferences(id:string,patch:PreferencesPatch,now:string){
    const fields={theme:'theme',textSize:'text_size',reduceMotion:'reduce_motion',homeMode:'home_mode',language:'language',timezone:'timezone',playbackSpeed:'playback_speed',anchorCount:'anchor_count',narrationVoice:'narration_voice',mediaTreatment:'media_treatment',listeningHistory:'listening_history'} as const;
    const values:unknown[]=[id,patch.lockVersion,now];const sets:string[]=[];
    for(const key of Object.keys(fields) as (keyof typeof fields)[])if(patch[key]!==undefined){values.push(patch[key]);sets.push(`${fields[key]}=$${values.length}`);}
    const {rows}=await this.client.query(`UPDATE public.user_preferences SET ${sets.join(',')},lock_version=lock_version+1,updated_at=$3 WHERE user_id=$1 AND lock_version=$2 RETURNING *`,values);
    if(!rows[0])throw new AccessError(409,'CONFLICT');return preferences(rows[0]);
  }
  async bookmarks(id:string){const {rows}=await this.client.query('SELECT * FROM public.bookmarks WHERE user_id=$1 ORDER BY created_at DESC,article_id',[id]);return rows.map(bookmark);}
  async addBookmark(b:Bookmark){
    const {rows}=await this.client.query('INSERT INTO public.bookmarks(user_id,article_id,saved_version_id,created_at) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,article_id) DO NOTHING RETURNING *',[b.userId,b.articleId,b.savedVersionId,b.createdAt]);
    // Separate statement gets a new READ COMMITTED snapshot after conflict wait.
    if(rows[0])return bookmark(rows[0]);
    const existing=await this.client.query('SELECT * FROM public.bookmarks WHERE user_id=$1 AND article_id=$2',[b.userId,b.articleId]);
    if(!existing.rows[0])throw new AccessError(503,'SERVICE_UNAVAILABLE');return bookmark(existing.rows[0]);
  }
  async removeBookmark(id:string,articleId:string){await this.client.query('DELETE FROM public.bookmarks WHERE user_id=$1 AND article_id=$2',[id,articleId]);}
  async listening(id:string){const q=await this.client.query('SELECT programme_ids,revision FROM public.listening_queues WHERE user_id=$1',[id]);const p=await this.client.query('SELECT * FROM public.listening_progress WHERE user_id=$1 ORDER BY updated_at DESC',[id]);return {revision:q.rows[0]?.revision??0,queue:q.rows[0]?.programme_ids??[],progress:p.rows.map(progress)};}
  async updateQueue(id:string,revision:number,ids:string[]){
    await this.client.query('INSERT INTO public.listening_queues(user_id) VALUES($1) ON CONFLICT DO NOTHING',[id]);
    const r=await this.client.query('UPDATE public.listening_queues SET programme_ids=$3::jsonb,revision=revision+1,updated_at=now() WHERE user_id=$1 AND revision=$2 RETURNING revision',[id,revision,JSON.stringify(ids)]);
    if(!r.rowCount)throw new AccessError(409,'CONFLICT');return this.listening(id);
  }
  async updateProgress(id:string,p:Omit<ListeningProgress,'updatedAt'>){
    const r=await this.client.query(`INSERT INTO public.listening_progress(user_id,programme_id,rendition_key,position_ms,duration_ms,completed,revision) SELECT $1,$2,$3,$4,$5,$6,1 WHERE $7=0 OR EXISTS(SELECT FROM public.listening_progress WHERE user_id=$1 AND programme_id=$2 AND revision=$7)
    ON CONFLICT(user_id,programme_id) DO UPDATE SET rendition_key=$3,position_ms=$4,duration_ms=$5,completed=$6,revision=listening_progress.revision+1,updated_at=now() WHERE listening_progress.revision=$7 OR ($7=0 AND listening_progress.rendition_key<>$3) RETURNING *`,[id,p.programmeId,p.renditionKey,p.positionMs,p.durationMs,p.completed,p.revision]);
    if(!r.rowCount)throw new AccessError(409,'CONFLICT');return progress(r.rows[0]);
  }
  async clearProgress(id:string){await this.client.query('DELETE FROM public.listening_progress WHERE user_id=$1',[id]);}
}

export async function attestTarget(client:PoolClient,target:DisposableTarget){
    const {rows}=await client.query('SELECT public.fixture_target_identity() AS target');const t=rows[0].target;
    if(realpathSync(t.directory)!==realpathSync(target.data)||t.system!==target.systemIdentifier||t.database!==target.database||t.host!==target.host||t.port!==target.port||Number(t.version)<180000||Number(t.version)>=190000)throw new Error('Database target identity mismatch');
}

export class PostgresMemberUnit implements MemberUnitOfWork {
  readonly persistence='postgresql' as const;readonly pool:Pool;
  constructor(readonly target:DisposableTarget,max=2){this.pool=new Pool(poolConfig(target,'agg_api_login',max));this.pool.on('error',()=>{/* Failed idle clients are removed by pg; no credentials are logged. */});}
  private async verify(client:PoolClient){
    await attestTarget(client,this.target);
    const role=await client.query("SELECT rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,current_user,pg_has_role(current_user,'agg_owner','MEMBER') AS owner_member FROM pg_catalog.pg_roles WHERE rolname=current_user");
    if(role.rows[0].current_user!=='agg_api_login'||role.rows[0].rolsuper||role.rows[0].rolbypassrls||role.rows[0].rolcreaterole||role.rows[0].rolcreatedb||role.rows[0].owner_member)throw new Error('Unsafe runtime role');
  }
  async run<T>(work:(identity:IdentityRepository,members:MemberRepository)=>Promise<T>):Promise<T>{
    const client=await this.pool.connect();let destroy=false,committing=false;
    const onError=()=>{destroy=true;};client.on('error',onError);
    try{
      await this.verify(client);await client.query('BEGIN');
      const repo=new PostgresMemberRepository(client);const result=await work(repo,repo);
      committing=true;await client.query('COMMIT');committing=false;
      const clean=await client.query("SELECT nullif(current_setting('aggregator.user_id',true),'') IS NULL AS clean");
      if(!clean.rows[0].clean)throw new Error('Connection identity was not cleared');return result;
    }catch(error){
      // COMMIT transport failure may be ambiguous: discard; never report a verified rollback.
      if(committing)destroy=true;
      try{await client.query('ROLLBACK');const r=await client.query("SELECT nullif(current_setting('aggregator.user_id',true),'') IS NULL AS clean");if(!r.rows[0].clean)destroy=true;}catch{destroy=true;}
      throw error;
    }finally{client.removeListener('error',onError);client.release(destroy);}
  }
  async close(){await this.pool.end();}
}

