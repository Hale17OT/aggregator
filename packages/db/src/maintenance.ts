import { Pool, type PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import type { Account, IdentityRepository, SessionRecord } from '../../domain/src/identity.js';
import { attestTarget, poolConfig, type DisposableTarget } from './member.js';

// Trusted harness only. No API role inherits these privileges; not registered in HTTP.
export class FixtureMaintenance implements IdentityRepository {
  readonly pool:Pool;
  constructor(private target:DisposableTarget){if(process.env.NODE_ENV==='production')throw new Error('Fixture maintenance disabled');this.pool=new Pool(poolConfig(target,'agg_maintenance_login',2));this.pool.on('error',()=>{});}
  private async transaction<T>(work:(client:PoolClient)=>Promise<T>):Promise<T>{
    const client=await this.pool.connect();let destroy=false,committing=false;
    const onError=()=>{destroy=true;};client.on('error',onError);
    try{
      await attestTarget(client,this.target);await client.query('BEGIN');const result=await work(client);
      committing=true;await client.query('COMMIT');committing=false;return result;
    }catch(e){if(committing)destroy=true;try{await client.query('ROLLBACK');}catch{destroy=true;}throw e;}
    finally{client.removeListener('error',onError);client.release(destroy);}
  }
  async account(id:string):Promise<Account|undefined>{return this.transaction(async client=>{
    const {rows}=await client.query(`SELECT u.id,u.display_name AS "displayName",u.status,u.session_version AS "sessionVersion",coalesce((SELECT json_agg(role_code) FROM public.user_roles WHERE user_id=u.id),'[]') AS roles FROM public.users u WHERE u.id=$1`,[id]);return rows[0];
  });}
  async session(_id:string):Promise<SessionRecord|undefined>{void _id;throw new Error('Use restricted runtime verification');}
  async insertSession(s:SessionRecord){return this.transaction(async client=>{
    const account=await client.query('SELECT status,session_version FROM public.users WHERE id=$1 FOR UPDATE',[s.userId]);
    if(account.rows[0]?.status!=='active'||account.rows[0].session_version!==s.accountVersion)throw new Error('Fixture account changed before issuance');
    await client.query('INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,mfa_verified_at,revoked_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token) VALUES($1,$2,$3,$4,$5,$6,NULL,$7,$8,$9,$10,$11,$12)',[s.id,s.userId,s.tokenHash,new Date(s.createdAt),new Date(s.expiresAt),new Date(s.lastSeenAt),s.revokedAt===null?null:new Date(s.revokedAt),s.accountVersion,s.authenticationMethod,s.assurance,s.idleTimeoutMs,s.csrfToken]);
  });}
  async touchSession(_id:string,_now:number){void _id;void _now;throw new Error('Use restricted runtime');}
  async revokeSession(id:string,now:number){return this.transaction(async client=>{
    const s=await client.query('SELECT user_id FROM public.sessions WHERE id=$1',[id]);
    if(s.rows[0]){await client.query('SELECT id FROM public.users WHERE id=$1 FOR UPDATE',[s.rows[0].user_id]);await client.query('UPDATE public.sessions SET revoked_at=coalesce(revoked_at,$2) WHERE id=$1',[id,new Date(now)]);}
  });}
  async changeAccount(id:string,patch:Partial<Pick<Account,'status'|'roles'>>,barrier?:(client:PoolClient)=>Promise<void>){return this.transaction(async client=>{
    const locked=await client.query('SELECT id FROM public.users WHERE id=$1 FOR UPDATE',[id]);if(!locked.rows[0])throw new Error('Unknown fixture account');
    await client.query('UPDATE public.users SET status=coalesce($2,status),session_version=session_version+1 WHERE id=$1',[id,patch.status??null]);
    if(patch.roles){await client.query('DELETE FROM public.user_roles WHERE user_id=$1',[id]);for(const role of patch.roles)await client.query('INSERT INTO public.user_roles(user_id,role_code) VALUES($1,$2)',[id,role]);}
    await client.query("INSERT INTO public.audit_events(actor_token,action,resource_type,resource_id,reason,correlation_id,metadata) VALUES('fixture-maintenance','fixture.account.changed','user',$1,'Controlled local fixture change',$2,$3)",[id,randomUUID(),JSON.stringify(patch)]);
    if(barrier)await barrier(client);
  });}
  async close(){await this.pool.end();}
}
