import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { AccessError } from './identity.js';

export interface GoogleConfiguration {webClientId:string;androidClientId?:string;iosClientId?:string;origin:string;}
export interface VerifiedGoogleIdentity {subject:string;email:string|null;emailVerified:boolean;name:string;}
const oauth=new OAuth2Client({transporterOptions:{timeout:5000,retry:false,maxContentLength:131072}});
export function validateGoogleClaims(payload:TokenPayload & {nonce?:string}, config:GoogleConfiguration, nonce:string, now=Date.now()):VerifiedGoogleIdentity {
 if(!['accounts.google.com','https://accounts.google.com'].includes(payload.iss)||payload.aud!==config.webClientId||!payload.sub||!/^[A-Za-z0-9_-]{1,255}$/.test(payload.sub)||payload.nonce!==nonce||!Number.isFinite(payload.exp)||payload.exp*1000<=now||!Number.isFinite(payload.iat)||payload.iat*1000>now+60000||now-payload.iat*1000>3600000)throw new AccessError(401,'GOOGLE_CREDENTIAL_REJECTED');
 if(payload.azp&&![config.webClientId,config.androidClientId,config.iosClientId].includes(payload.azp))throw new AccessError(401,'GOOGLE_CREDENTIAL_REJECTED');
 return {subject:payload.sub,email:payload.email&&payload.email.length<=320?payload.email:null,emailVerified:payload.email_verified===true,name:Array.from(payload.name||'Reader').filter(c=>c.charCodeAt(0)>=32&&c.charCodeAt(0)!==127).join('').slice(0,80)};
}
export async function verifyGoogleCredential(token:string,config:GoogleConfiguration,nonce:string):Promise<VerifiedGoogleIdentity>{
 try {
  if(token.length>8192||token.split('.').length!==3)throw Error('format');
  const header=JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString('utf8'));
  if(header.alg!=='RS256'||typeof header.kid!=='string'||header.jku||header.x5u||header.jwk||header.crit)throw Error('header');
  // Official fixed certificate endpoint and library cache. No DB transaction is held here.
  const ticket=await oauth.verifyIdToken({idToken:token,audience:config.webClientId,maxExpiry:7200});
  const payload=ticket.getPayload();if(!payload)throw Error('payload');
  return validateGoogleClaims(payload,config,nonce);
 } catch { // Library error messages may contain credentials: never log/return them.
  throw new AccessError(401,'GOOGLE_CREDENTIAL_REJECTED');
 }
}
