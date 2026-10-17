import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGoogleClaims,verifyGoogleCredential} from '../packages/domain/src/google-identity.js';
const config={webClientId:'test-web',androidClientId:'test-android',origin:'http://127.0.0.1:3000'};
const now=1800000000000;
const valid={iss:'https://accounts.google.com',aud:'test-web',sub:'123456',nonce:'bound-nonce',iat:now/1000-10,exp:now/1000+300,email:'reader@example.test',email_verified:true};
test('Google claim validation binds issuer, audience, subject, nonce, time and authorized presenter',()=>{
 assert.equal(validateGoogleClaims(valid,config,'bound-nonce',now).subject,'123456');
 for(const patch of [{iss:'https://evil.example'},{aud:'other'},{sub:''},{nonce:'old'},{exp:now/1000},{iat:now/1000+61},{iat:now/1000-3601},{azp:'other'}])assert.throws(()=>validateGoogleClaims({...valid,...patch},config,'bound-nonce',now));
 assert.equal(validateGoogleClaims({...valid,azp:'test-android'},config,'bound-nonce',now).emailVerified,true);
});
test('Google malformed/token-directed-key rejection never returns credential data',async()=>{
 for(const token of ['private-sensitive-token',Buffer.from(JSON.stringify({alg:'RS256',kid:'a',jku:'https://evil.example/keys'})).toString('base64url')+'.private-sensitive-token.sig']){
  await assert.rejects(verifyGoogleCredential(token,config,'nonce'),error=>error instanceof Error&&!error.message.includes('private-sensitive-token')&&error.message==='GOOGLE_CREDENTIAL_REJECTED');
 }
});
