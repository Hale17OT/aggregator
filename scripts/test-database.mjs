import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { migrations, migrate } from './db-migrations.mjs';
import { withDisposableDatabase } from './disposable-database.mjs';
const report={date:new Date().toISOString(),migrations:[],constraints:[],roles:[],limitations:['Fictional local PostgreSQL only; no deployment or publication service','Foundation assertions are separate from database-backed API verification']};
try{
 await withDisposableDatabase(async({root,data,port,version,systemIdentifier,createDatabase,verify})=>{
 report.version=version;report.target={data,host:'127.0.0.1',port,systemIdentifier};
 const list=migrations(join(root,'packages/db/migrations'));
 const fresh=createDatabase('aggregator_fresh'),upgrade=createDatabase('aggregator_upgrade'),failure=createDatabase('aggregator_failure');report.migrations=migrate(fresh,list);
 migrate(upgrade,list,4);upgrade.sql("SET ROLE agg_owner; INSERT INTO topics(slug,name,scope) VALUES('upgrade-fixture','Preserve me','fictional'); INSERT INTO users(id,email_normalized) VALUES('00000000-0000-4000-8000-000000000099','legacy@example.com'); INSERT INTO sessions(user_id,token_hash,expires_at) VALUES('00000000-0000-4000-8000-000000000099','legacy-verifier',now()+interval '1 day');");migrate(upgrade,list);assert.equal(upgrade.scalar("SELECT name FROM topics WHERE slug='upgrade-fixture'"),'Preserve me');
 assert.equal(upgrade.scalar("SELECT bool_and(revoked_at IS NOT NULL AND assurance='unverified') FROM sessions"),'t');
 const catalog=`SELECT json_agg(row_to_json(t) ORDER BY tablename) FROM (SELECT tablename, tableowner, rowsecurity FROM pg_tables WHERE schemaname='public') t`;
 assert.equal(fresh.scalar(catalog),upgrade.scalar(catalog));migrate(upgrade,list);assert.equal(upgrade.scalar('SELECT count(*) FROM schema_migrations'),String(list.length));
 const drift=list.map(m=>({...m}));drift[0].checksum='0'.repeat(64);assert.throws(()=>migrate(upgrade,drift),/checksum/);report.upgrade={from:'0004 through latest additive migrations',seedPreserved:true,catalogMatchesFresh:true,repeatedApply:'no-op',checksumDrift:'rejected'};
 migrate(failure,list,4);const broken={name:'0005_failure_probe.sql',sql:'CREATE TABLE rollback_probe(id integer); SELECT 1/0;',checksum:createHash('sha256').update('failure probe').digest('hex')};assert.throws(()=>migrate(failure,[...list.slice(0,4),broken]),/division by zero/);assert.equal(failure.scalar("SELECT to_regclass('rollback_probe') IS NULL"),'t');assert.equal(failure.scalar('SELECT count(*) FROM schema_migrations'),'4');migrate(failure,list);report.atomicity={failedDDL:'rolled back',failedLedger:'absent',recovery:'normal 0005 succeeds'};
 const output=fresh.sql(readFileSync('tests/database.sql','utf8'));report.constraints=JSON.parse(output.split('\n').filter(l=>l.startsWith('[')).at(-1));
 // Persist two fictional accounts and article metadata solely for role probes.
 fresh.sql(`SET ROLE agg_owner;
INSERT INTO users(id,email_normalized) VALUES('00000000-0000-4000-8000-000000000001','one@example.com'),('00000000-0000-4000-8000-000000000002','two@example.com');
INSERT INTO user_preferences(user_id) SELECT id FROM users;
INSERT INTO story_clusters(id,label) VALUES('00000000-0000-4000-8000-000000000010','Fictional');
INSERT INTO articles(id,cluster_id,slug) VALUES('00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000010','fictional');
INSERT INTO article_versions(id,article_id,cluster_id,version_number,headline,content_hash,evidence_hash,approval_hash,evidence_cutoff_at) VALUES('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000010',1,'Fictional','fixture','fixture','unapproved',now());
UPDATE articles SET current_version_id='00000000-0000-4000-8000-000000000030';`);
 const member='agg_member_login',reader='agg_reader_login';
 for(const user of [member,reader,'agg_worker_login']){assert.equal(fresh.sql('SELECT rolsuper OR rolbypassrls OR rolcreaterole FROM pg_roles WHERE rolname=current_user',user),'f');fresh.reject('SET ROLE agg_owner',user,'42501');fresh.reject('CREATE TABLE public.forbidden(id integer)',user,'42501');fresh.reject('SELECT * FROM public.sessions',user,'42501');fresh.reject("INSERT INTO public.user_roles(user_id,role_code) VALUES('00000000-0000-4000-8000-000000000001','publisher')",user,'42501');report.roles.push({role:user,ownerEscalation:'denied',ddl:'denied',sessionRead:'denied',selfAssignedRole:'denied'});}
 assert.equal(fresh.sql('SELECT count(*) FROM user_preferences',member),'0');
 const identity="SET LOCAL aggregator.user_id='00000000-0000-4000-8000-000000000001';";
 assert.equal(fresh.sql(`BEGIN; ${identity} SELECT count(*) FROM user_preferences; COMMIT; SELECT count(*) FROM user_preferences;`,member),'1\n0');
 assert.equal(fresh.sql(`BEGIN; ${identity} WITH changed AS (UPDATE user_preferences SET theme='dark' WHERE user_id='00000000-0000-4000-8000-000000000002' RETURNING *) SELECT count(*) FROM changed; ROLLBACK;`,member),'0');
 fresh.reject(`BEGIN; ${identity} INSERT INTO topic_follows(user_id,topic_id) VALUES('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000099');`,member,'42501');
 fresh.reject(`BEGIN; ${identity} UPDATE user_preferences SET user_id='00000000-0000-4000-8000-000000000003';`,member,'42501');
 assert.equal(fresh.sql(`BEGIN; ${identity} UPDATE user_preferences SET theme='dark'; SELECT theme FROM user_preferences; ROLLBACK;`,member),'dark');
 report.roles.push({memberRLS:'own read/write succeeds; other rows invisible/unwritable; forged row owner rejected',transactionContext:'absent denies; commit clears; fresh connection has no identity',caveat:'Custom GUC is trusted service context, not authenticated identity'});
 assert.equal(fresh.sql('SELECT count(*) FROM public_article_index',reader),'0');
 fresh.sql("SET ROLE agg_owner; UPDATE articles SET status='published'; UPDATE article_versions SET state='published';");assert.equal(fresh.sql('SELECT count(*) FROM public_article_index',reader),'1');
 fresh.reject('SELECT * FROM article_versions',reader,'42501');fresh.reject("UPDATE articles SET status='published'",reader,'42501');
 fresh.sql("SET ROLE agg_owner; UPDATE article_versions SET state='withdrawn';");assert.equal(fresh.sql('SELECT count(*) FROM public_article_index',reader),'0');report.roles.push({readerProjection:'draft excluded; fixture pointer visible only when both states published; withdrawal excluded',privateEvidenceAndWrites:'denied',caveat:'Test owner state changes are fixtures, not an implemented publication operation'});
 fresh.reject('SELECT 1','agg_outsider','permission denied for database');report.roles.push({ungrantedConnection:'denied'});
 // Defaults remain deny for future owner-created objects.
 fresh.sql("SET ROLE agg_owner; CREATE FUNCTION future_private() RETURNS text LANGUAGE sql AS $$ SELECT 'fixture'::text $$;");fresh.reject('SELECT future_private()',reader,'42501');
 report.target.verified=verify('aggregator_fresh');report.status='passed';console.log(`${report.constraints.length} SQL constraint assertions; ${report.roles.length} role groups; fresh/upgrade/checksum/rollback passed on ${version}`);

 });report.target.stopped=true;
}catch(error){report.status='failed';throw error;}finally{writeFileSync('docs/engineering/database-checks.json',JSON.stringify(report,null,2)+'\n');}
