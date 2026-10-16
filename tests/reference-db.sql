-- Only scripts/test-reference-db.ps1 creates and verifies this isolated cluster.
DO $$ BEGIN
 IF current_database() <> 'aggregator_disposable' OR inet_server_port() <> 55439 THEN RAISE EXCEPTION 'Unexpected target'; END IF;
END $$;
BEGIN;
INSERT INTO sources(id,slug,name,source_type,home_url,identity_key) VALUES
 ('00000000-0000-4000-8000-000000000011','fixture-one','Fictional One','publisher','https://example.com/one','fixture-one'),
 ('00000000-0000-4000-8000-000000000012','fixture-two','Fictional Two','publisher','https://example.com/two','fixture-two');
INSERT INTO rights_grants(id,source_id,grant_key,revision,agreement_reference,starts_at) VALUES
 ('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000011','fictional-grant',1,'local fixture only',now());
INSERT INTO source_items(id,source_id,provider_item_key,kind,canonical_url) VALUES
 ('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000012','fictional-item','article','https://example.com/item');
DO $$ BEGIN
 BEGIN
 INSERT INTO source_item_versions(item_id,source_id,rights_grant_id,revision,title,fetched_url,language,content_hash)
 VALUES('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000021',1,'Fixture','https://example.com/item','en','fixture-hash');
 RAISE EXCEPTION 'Cross-source grant was incorrectly accepted';
 EXCEPTION WHEN foreign_key_violation THEN RAISE NOTICE 'PASS: cross-source grant rejected'; END;
END $$;
DO $$ DECLARE actual_count int; BEGIN
 SELECT count(*) INTO actual_count FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';
 IF actual_count<>54 THEN RAISE EXCEPTION 'Expected 54 launch tables, got %',actual_count; END IF;
 RAISE NOTICE 'PASS: 54 launch tables created';
END $$;
ROLLBACK;
