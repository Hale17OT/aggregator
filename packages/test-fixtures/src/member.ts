import { randomBytes, randomUUID } from 'node:crypto';
import type { Preferences, PreferencesPatch } from '../../contracts/src/member.js';
import { AccessError, verifier, type Account, type IdentityRepository, type SessionRecord, type Clock } from '../../domain/src/identity.js';
import type { Bookmark, MemberRepository } from '../../domain/src/member.js';

export const fixtureUsers={a:'00000000-0000-4000-8000-000000000001',b:'00000000-0000-4000-8000-000000000002',staff:'00000000-0000-4000-8000-000000000003'};
export const sessionLifetimes={idleMs:30*60*1000,absoluteMs:12*60*60*1000};
export class MemoryMemberRepository implements IdentityRepository,MemberRepository {
  private accounts=new Map<string,Account>();private sessions=new Map<string,SessionRecord>();private prefs=new Map<string,Preferences>();private saved=new Map<string,Bookmark>();
  constructor(){
    for(const [name,id] of Object.entries(fixtureUsers)){
      this.accounts.set(id,{id,displayName:`Fictional ${name}`,status:'active',roles:name==='staff'?['publisher','administrator']:['reader'],sessionVersion:0});
      this.prefs.set(id,{theme:name==='b'?'dark':'system',textSize:'standard',reduceMotion:false,homeMode:'editorial',language:'en',timezone:'UTC',lockVersion:0,updatedAt:'2026-10-12T00:00:00.000Z',playbackSpeed:1,anchorCount:1,narrationVoice:'prepared',mediaTreatment:'narration_over_visual',listeningHistory:true});
    }
  }
  async account(id:string){return structuredClone(this.accounts.get(id));}
  async session(id:string){return structuredClone(this.sessions.get(id));}
  async insertSession(record:SessionRecord){if(this.sessions.has(record.id))throw new Error('Session collision');this.sessions.set(record.id,structuredClone(record));}
  async touchSession(id:string,now:number){const s=this.sessions.get(id);if(!s||s.revokedAt!==null)throw new AccessError(401,'UNAUTHENTICATED');s.lastSeenAt=Math.max(s.lastSeenAt,now);}
  async revokeSession(id:string,now:number){const s=this.sessions.get(id);if(s)s.revokedAt=now;}
  // Trusted non-HTTP harness hook. Every account/role change invalidates existing sessions.
  async changeAccount(id:string,patch:Partial<Pick<Account,'status'|'roles'>>){const a=this.accounts.get(id);if(!a)throw new Error('Unknown fixture');Object.assign(a,structuredClone(patch));a.sessionVersion++;}
  async preferences(id:string){const p=this.prefs.get(id);if(!p)throw new AccessError(404,'NOT_FOUND');return structuredClone(p);}
  async updatePreferences(id:string,patch:PreferencesPatch,now:string){const p=this.prefs.get(id);if(!p)throw new AccessError(404,'NOT_FOUND');if(p.lockVersion!==patch.lockVersion)throw new AccessError(409,'CONFLICT');const result={...p,...patch,lockVersion:p.lockVersion+1,updatedAt:now};this.prefs.set(id,result);return structuredClone(result);}
  async bookmarks(id:string){return [...this.saved.values()].filter(b=>b.userId===id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(b=>structuredClone(b));}
  async addBookmark(b:Bookmark){const key=`${b.userId}:${b.articleId}`;if(!this.saved.has(key))this.saved.set(key,structuredClone(b));return structuredClone(this.saved.get(key)!);}
  async removeBookmark(userId:string,articleId:string){this.saved.delete(`${userId}:${articleId}`);}
}

export function fixtureIssuer(repo:IdentityRepository,config:{mode:string;nodeEnv:string},clock:Clock=Date.now){
  if(config.mode!=='local-test'||config.nodeEnv!=='test'||process.env.NODE_ENV==='production')throw new Error('Fixture issuance requires explicit local-test mode and test environment');
  return async(userId:string)=>{
    if(!Object.values(fixtureUsers).includes(userId))throw new Error('Unknown fixture');
    const account=await repo.account(userId);if(!account||account.status!=='active')throw new Error('Inactive fixture');
    const now=clock(),secret=randomBytes(32).toString('hex'),id=randomUUID();
    await repo.insertSession({id,userId,tokenHash:verifier(secret),createdAt:now,lastSeenAt:now,expiresAt:now+sessionLifetimes.absoluteMs,idleTimeoutMs:sessionLifetimes.idleMs,revokedAt:null,authenticationMethod:'fixture',assurance:'fixture-only',mfaVerifiedAt:null,accountVersion:account.sessionVersion,csrfToken:randomBytes(32).toString('hex')});
    return `${id}.${secret}`;
  };
}
