import { createHash, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type { Role, SessionView } from '../../contracts/src/member.js';

export class AccessError extends Error {
  constructor(public status:number,public code:string){super(code);}
}
export interface Account {id:string;displayName:string;status:'active'|'suspended'|'deleting'|'deleted';roles:Role[];sessionVersion:number;}
export interface SessionRecord {
  id:string;userId:string;tokenHash:string;createdAt:number;expiresAt:number;lastSeenAt:number;
  idleTimeoutMs:number;revokedAt:number|null;authenticationMethod:'fixture'|'captured-mail';assurance:'fixture-only'|'local-demo';
  mfaVerifiedAt:null;accountVersion:number;csrfToken:string;
  transport?:'web'|'native';nativeClientId?:string|null;
}
export interface IdentityRepository {
  account(id:string):Promise<Account|undefined>;
  session(id:string):Promise<SessionRecord|undefined>;
  insertSession(record:SessionRecord):Promise<void>;
  touchSession(id:string,now:number):Promise<void>;
  revokeSession(id:string,now:number):Promise<void>;
}
export type Clock=()=>number;
export const verifier=(value:string)=>createHash('sha256').update(value).digest('hex');
export function equalVerifier(a:string,b:string){
  if(!/^[a-f0-9]{64}$/.test(a)||!/^[a-f0-9]{64}$/.test(b))return false;
  return timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
}
export interface AuthContext {readonly userId:string;readonly sessionId:string;}
export type Capability='session:inspect'|'session:logout'|'preferences:read'|'preferences:write'|'bookmarks:read'|'bookmarks:write';
const readerCapabilities=new Set<string>(['preferences:read','preferences:write','bookmarks:read','bookmarks:write']);

export class IdentityService {
  private contexts=new WeakSet<AuthContext>();
  constructor(private repo:IdentityRepository,private clock:Clock=Date.now){}
  private async current(id:string){
    const session=await this.repo.session(id),now=this.clock();
    if(!session||session.revokedAt!==null||!((session.authenticationMethod==='fixture'&&session.assurance==='fixture-only')||(session.authenticationMethod==='captured-mail'&&session.assurance==='local-demo'))||session.mfaVerifiedAt!==null||now>=session.expiresAt||now>=session.lastSeenAt+session.idleTimeoutMs||now<session.createdAt)throw new AccessError(401,'UNAUTHENTICATED');
    const account=await this.repo.account(session.userId);
    if(!account||account.status!=='active'||account.sessionVersion!==session.accountVersion)throw new AccessError(401,'UNAUTHENTICATED');
    return {session,account,now};
  }
  async authenticate(token:string|undefined,transport:'web'|'native'='web'):Promise<AuthContext>{
    if(!token||!/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.([a-f0-9]{64})$/.test(token))throw new AccessError(401,'UNAUTHENTICATED');
    const [id,secret]=token.split('.');const {session,account,now}=await this.current(id);
    if((session.transport??'web')!==transport||(transport==='native'&&session.nativeClientId!=='aggregator-local'))throw new AccessError(401,'UNAUTHENTICATED');
    if(!equalVerifier(session.tokenHash,verifier(secret)))throw new AccessError(401,'UNAUTHENTICATED');
    await this.repo.touchSession(id,now);
    const context=Object.freeze({userId:account.id,sessionId:session.id});this.contexts.add(context);return context;
  }
  async authorize(context:AuthContext,capability:string){
    if(!this.contexts.has(context))throw new AccessError(401,'UNAUTHENTICATED');
    const current=await this.current(context.sessionId);
    if(current.account.id!==context.userId)throw new AccessError(401,'UNAUTHENTICATED');
    const allowed=capability==='session:inspect'||capability==='session:logout'||(readerCapabilities.has(capability)&&current.account.roles.includes('reader'));
    // No staff capability is available with fixture assurance, including administrator.
    if(!allowed)throw new AccessError(403,'FORBIDDEN');
    return current;
  }
  async inspect(context:AuthContext):Promise<SessionView>{
    const {session,account}=await this.authorize(context,'session:inspect');
    return {user:{id:account.id,displayName:account.displayName},authenticationMethod:session.authenticationMethod,assurance:session.assurance,createdAt:new Date(session.createdAt).toISOString(),expiresAt:new Date(session.expiresAt).toISOString(),idleExpiresAt:new Date(Math.min(session.expiresAt,session.lastSeenAt+session.idleTimeoutMs)).toISOString(),csrfToken:session.csrfToken};
  }
  async verifyCsrf(context:AuthContext,value:string|undefined){
    const {session}=await this.authorize(context,'session:inspect');
    if(!value||value.length!==64||!equalVerifier(verifier(session.csrfToken),verifier(value)))throw new AccessError(403,'CSRF_REJECTED');
  }
  async logout(context:AuthContext){await this.authorize(context,'session:logout');await this.repo.revokeSession(context.sessionId,this.clock());}
}
