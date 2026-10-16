-- Executed only after the harness verifies its newly-created PG18 cluster.
BEGIN;
SET LOCAL ROLE agg_owner;
CREATE TEMP TABLE assertions(label text PRIMARY KEY);
CREATE FUNCTION pg_temp.fid(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT md5('aggregator-fictional-'||n)::uuid $$;
CREATE FUNCTION pg_temp.ok(test boolean,label text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN
 IF test IS DISTINCT FROM true THEN RAISE EXCEPTION 'Assertion failed: %',label; END IF;
 INSERT INTO assertions VALUES(label);
END $$;
CREATE FUNCTION pg_temp.reject(statement text,expected text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE rejected boolean:=false;
BEGIN
 BEGIN EXECUTE statement;
 EXCEPTION WHEN others THEN
  IF SQLSTATE<>expected THEN RAISE EXCEPTION 'Unexpected SQLSTATE % for %',SQLSTATE,label; END IF;
  rejected:=true;
 END;
 PERFORM pg_temp.ok(rejected,label);
END $$;
DO $$ BEGIN
 FOR n IN 1..2 LOOP
  INSERT INTO users(id,email_normalized) VALUES(pg_temp.fid(n),'fixture-'||n||'@example.com');
  INSERT INTO sources(id,slug,name,source_type,home_url,identity_key) VALUES(pg_temp.fid(10+n),'fixture-'||n,'Fictional source','publisher','https://example.com/'||n,'fictional-'||n);
  INSERT INTO rights_grants(id,source_id,grant_key,revision,agreement_reference,starts_at) VALUES(pg_temp.fid(20+n),pg_temp.fid(10+n),'fictional-'||n,1,'TEST ONLY',now());
  INSERT INTO source_items(id,source_id,provider_item_key,kind,canonical_url) VALUES(pg_temp.fid(30+n),pg_temp.fid(10+n),'fictional-'||n,'article','https://example.com/item-'||n);
  INSERT INTO source_item_versions(id,item_id,source_id,rights_grant_id,revision,title,fetched_url,language,content_hash) VALUES(pg_temp.fid(40+n),pg_temp.fid(30+n),pg_temp.fid(10+n),pg_temp.fid(20+n),1,'Fictional item','https://example.com/item-'||n,'en','fixture-'||n);
  INSERT INTO evidence_spans(id,source_version_id,start_char,end_char,locator_hash) VALUES(pg_temp.fid(50+n),pg_temp.fid(40+n),0,10,'fictional-locator');
  INSERT INTO story_clusters(id,label) VALUES(pg_temp.fid(90+n),'Fictional cluster');
  INSERT INTO claims(id,cluster_id,proposition,claim_hash) VALUES(pg_temp.fid(80+n),pg_temp.fid(90+n),'Fictional proposition','fixture');
  INSERT INTO claim_evidence(claim_id,evidence_span_id,source_version_id,relation) VALUES(pg_temp.fid(80+n),pg_temp.fid(50+n),pg_temp.fid(40+n),'supports');
  INSERT INTO articles(id,cluster_id,slug) VALUES(pg_temp.fid(100+n),pg_temp.fid(90+n),'fictional-article-'||n);
  INSERT INTO article_versions(id,article_id,cluster_id,version_number,headline,content_hash,evidence_hash,approval_hash,evidence_cutoff_at) VALUES(pg_temp.fid(200+n),pg_temp.fid(100+n),pg_temp.fid(90+n),1,'Fictional headline','content','evidence','unapproved',now());
  INSERT INTO article_variants(id,version_id,variant) VALUES(pg_temp.fid(300+n),pg_temp.fid(200+n),'standard');
  INSERT INTO article_blocks(id,variant_id,version_id,position,block_type,text_content) VALUES(pg_temp.fid(400+n),pg_temp.fid(300+n),pg_temp.fid(200+n),0,'paragraph','Fictional block');
  INSERT INTO article_claims(version_id,claim_id,cluster_id) VALUES(pg_temp.fid(200+n),pg_temp.fid(80+n),pg_temp.fid(90+n));
  INSERT INTO article_sources(version_id,source_version_id,ordinal,usage) VALUES(pg_temp.fid(200+n),pg_temp.fid(40+n),1,'evidence');
 END LOOP;
END $$;
SELECT pg_temp.ok((SELECT count(*)=54 FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name NOT IN ('schema_migrations','local_auth_limits','listening_queues','listening_progress','source_payloads','evidence_packages','concept_relations','interest_states','article_subject_assertions')),'54 preserved launch tables');
SELECT pg_temp.ok((SELECT count(*)=2 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('source_payloads','evidence_packages')),'2 additive local engine tables');
SELECT pg_temp.ok((SELECT count(*)=3 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('local_auth_limits','listening_queues','listening_progress')),'3 additive local product tables');
SELECT pg_temp.reject($q$INSERT INTO source_item_versions(item_id,source_id,rights_grant_id,revision,title,fetched_url,language,content_hash) VALUES(pg_temp.fid(31),pg_temp.fid(12),pg_temp.fid(22),2,'Fixture','https://example.com','en','new')$q$,'23503','item/source lineage');
SELECT pg_temp.reject($q$INSERT INTO source_item_versions(item_id,source_id,rights_grant_id,revision,title,fetched_url,language,content_hash) VALUES(pg_temp.fid(31),pg_temp.fid(11),pg_temp.fid(22),2,'Fixture','https://example.com','en','new')$q$,'23503','grant/source lineage');
SELECT pg_temp.reject($q$INSERT INTO source_observations(item_id,source_version_id,requested_url,availability) VALUES(pg_temp.fid(31),pg_temp.fid(42),'https://example.com','available')$q$,'23503','observation exact item version');
SELECT pg_temp.reject($q$INSERT INTO claim_evidence VALUES(pg_temp.fid(81),pg_temp.fid(51),pg_temp.fid(42),'supports',NULL,NULL,NULL)$q$,'23503','span/source evidence chain');
SELECT pg_temp.reject($q$UPDATE article_versions SET cluster_id=pg_temp.fid(92) WHERE id=pg_temp.fid(201)$q$,'23503','article/version cluster');
SELECT pg_temp.reject($q$INSERT INTO article_claims VALUES(pg_temp.fid(201),pg_temp.fid(82),pg_temp.fid(91),true)$q$,'23503','version claim cluster');
SELECT pg_temp.reject($q$INSERT INTO article_blocks(variant_id,version_id,position,block_type,text_content) VALUES(pg_temp.fid(301),pg_temp.fid(202),1,'paragraph','Fixture')$q$,'23503','block variant version');
SELECT pg_temp.reject($q$INSERT INTO block_claims VALUES(pg_temp.fid(401),pg_temp.fid(201),pg_temp.fid(82))$q$,'23503','block selected claim');
SELECT pg_temp.reject($q$INSERT INTO block_claims VALUES(pg_temp.fid(402),pg_temp.fid(201),pg_temp.fid(81))$q$,'23503','block exact version');
SELECT pg_temp.reject($q$INSERT INTO article_claims VALUES(pg_temp.fid(201),pg_temp.fid(82),pg_temp.fid(92),true)$q$,'23503','selected version cluster');
SELECT pg_temp.reject($q$INSERT INTO claim_citations VALUES(pg_temp.fid(201),pg_temp.fid(82),pg_temp.fid(41),pg_temp.fid(51))$q$,'23503','citation selected claim');
SELECT pg_temp.reject($q$INSERT INTO claim_citations VALUES(pg_temp.fid(201),pg_temp.fid(81),pg_temp.fid(42),pg_temp.fid(52))$q$,'23503','citation included bibliography source');
SELECT pg_temp.reject($q$INSERT INTO claim_citations VALUES(pg_temp.fid(201),pg_temp.fid(81),pg_temp.fid(41),pg_temp.fid(52))$q$,'23503','citation exact claim span');
INSERT INTO block_claims VALUES(pg_temp.fid(401),pg_temp.fid(201),pg_temp.fid(81));
INSERT INTO claim_citations VALUES(pg_temp.fid(201),pg_temp.fid(81),pg_temp.fid(41),pg_temp.fid(51));
SELECT pg_temp.ok((SELECT count(*)=1 FROM claim_citations),'valid citation chain');
SET CONSTRAINTS fk_current_version_same_article IMMEDIATE;
SELECT pg_temp.reject($q$UPDATE articles SET current_version_id=pg_temp.fid(202) WHERE id=pg_temp.fid(101)$q$,'23503','public pointer same article');
SELECT pg_temp.reject($q$INSERT INTO bookmarks VALUES(pg_temp.fid(1),pg_temp.fid(101),pg_temp.fid(202),now())$q$,'23503','bookmark same article');
SELECT pg_temp.reject($q$INSERT INTO publication_events(article_id,version_id,event_type,reason,idempotency_key) VALUES(pg_temp.fid(101),pg_temp.fid(202),'publish','Fixture','fixture')$q$,'23503','publication event same article');
SELECT pg_temp.reject($q$INSERT INTO reader_reports(article_id,version_id,category,message,receipt_token_hash) VALUES(pg_temp.fid(101),pg_temp.fid(202),'fixture','Fixture','fixture')$q$,'23503','reader report same article');
SELECT pg_temp.reject($q$INSERT INTO reader_reports(article_id,version_id,claim_id,category,message,receipt_token_hash) VALUES(pg_temp.fid(101),pg_temp.fid(201),pg_temp.fid(82),'fixture','Fixture','fixture')$q$,'23503','reader report selected claim');
INSERT INTO reader_reports(id,article_id,version_id,category,message,receipt_token_hash) VALUES(pg_temp.fid(501),pg_temp.fid(101),pg_temp.fid(201),'fixture','Fixture','fixture');
SELECT pg_temp.reject($q$INSERT INTO corrections(article_id,report_id,from_version_id,public_note,severity) VALUES(pg_temp.fid(102),pg_temp.fid(501),pg_temp.fid(202),'Fixture','minor')$q$,'23503','correction report same article');
SELECT pg_temp.reject($q$INSERT INTO corrections(article_id,from_version_id,to_version_id,public_note,severity) VALUES(pg_temp.fid(101),pg_temp.fid(201),pg_temp.fid(202),'Fixture','minor')$q$,'23503','correction version same article');
SELECT pg_temp.reject($q$INSERT INTO corrections(article_id,from_version_id,public_note,severity) VALUES(pg_temp.fid(101),pg_temp.fid(202),'Fixture','minor')$q$,'23503','correction prior version same article');
SELECT pg_temp.reject($q$INSERT INTO analytics_events(event_name,article_id,version_id,expires_at) VALUES('fixture',pg_temp.fid(101),pg_temp.fid(202),now())$q$,'23503','analytics version same article');
SELECT pg_temp.reject($q$INSERT INTO analytics_events(event_name,version_id,expires_at) VALUES('fixture',pg_temp.fid(201),now())$q$,'23514','analytics version requires article');
SELECT pg_temp.reject($q$INSERT INTO generation_runs(cluster_id,version_id,idempotency_key,provider,model,prompt_version,evidence_hash,status) VALUES(pg_temp.fid(92),pg_temp.fid(201),'fixture','fixture','fixture','v1','fixture','queued')$q$,'23503','generation version cluster');
SELECT pg_temp.reject($q$INSERT INTO media_assets(source_version_id,rights_grant_id,object_key,mime_type,byte_size,checksum) VALUES(pg_temp.fid(41),pg_temp.fid(22),'fixture','image/png',1,'fixture')$q$,'23503','media exact version grant');
SELECT pg_temp.reject($q$INSERT INTO article_sources VALUES(pg_temp.fid(201),pg_temp.fid(42),1,'context','{}')$q$,'23505','version stable source ordinal');
SELECT pg_temp.reject($q$INSERT INTO evidence_spans(source_version_id,start_ms,end_ms,locator_hash) VALUES(pg_temp.fid(41),100,50,'fixture')$q$,'23514','ordered timestamp range');
SELECT pg_temp.reject($q$INSERT INTO evidence_spans(source_version_id,start_char,locator_hash) VALUES(pg_temp.fid(41),1,'fixture')$q$,'23514','complete text range');
SELECT pg_temp.reject($q$INSERT INTO consents(user_id,anonymous_key_hash,purpose,policy_version,granted) VALUES(pg_temp.fid(1),'fixture','fixture','v1',false)$q$,'23514','single consent subject');
SELECT pg_temp.reject($q$INSERT INTO sessions(user_id,token_hash,expires_at) VALUES(pg_temp.fid(1),'fixture',now()-interval '1 day')$q$,'23514','session expiry ordering');
INSERT INTO topics(id,slug,name,scope) VALUES(pg_temp.fid(601),'fixture-a','Fixture','fixture'),(pg_temp.fid(602),'fixture-b','Fixture','fixture');
INSERT INTO article_topics VALUES(pg_temp.fid(101),pg_temp.fid(601),true);
SELECT pg_temp.reject($q$INSERT INTO article_topics VALUES(pg_temp.fid(101),pg_temp.fid(602),true)$q$,'23505','one primary topic maximum');
INSERT INTO audit_events(actor_token,action,resource_type,resource_id,correlation_id) VALUES('fictional','test','fixture','fixture',pg_temp.fid(1));
SELECT pg_temp.reject($q$UPDATE audit_events SET action='tamper'$q$,'P0001','audit update forbidden');
SELECT pg_temp.reject($q$DELETE FROM audit_events$q$,'P0001','audit delete forbidden');
SELECT pg_temp.ok((SELECT bool_and(NOT allow_model AND NOT allow_synthesis AND NOT allow_public_excerpt) FROM rights_grants),'unknown rights default deny');
SET CONSTRAINTS fk_current_version_same_article DEFERRED;
UPDATE articles SET current_version_id=pg_temp.fid(203) WHERE id=pg_temp.fid(101);
INSERT INTO article_versions(id,article_id,cluster_id,version_number,headline,content_hash,evidence_hash,approval_hash,evidence_cutoff_at)
VALUES(pg_temp.fid(203),pg_temp.fid(101),pg_temp.fid(91),2,'Deferred fixture','fixture','fixture','unapproved',now());
SET CONSTRAINTS fk_current_version_same_article IMMEDIATE;
SELECT pg_temp.ok((SELECT current_version_id=pg_temp.fid(203) FROM articles WHERE id=pg_temp.fid(101)),'deferred pointer resolves within transaction');
SELECT pg_temp.ok((SELECT count(*)=2 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('concept_relations','interest_states')),'2 additive reader interest tables');
SELECT pg_temp.ok((SELECT count(*)=1 FROM information_schema.tables WHERE table_schema='public' AND table_name='article_subject_assertions'),'exact-version subject storage exists');
SELECT pg_temp.reject($q$INSERT INTO article_subject_assertions(article_id,version_id,topic_id,relevance,classification_revision,provenance) SELECT a.id,v.id,t.id,'primary','probe','Fictional probe' FROM articles a CROSS JOIN article_versions v CROSS JOIN topics t WHERE a.id<>v.article_id LIMIT 1$q$,'23503','subject version must belong to same article');
SELECT json_agg(label ORDER BY label) FROM assertions;
ROLLBACK;


