import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const result=spawnSync(process.execPath,['--import','tsx','--test','tests/identity.test.ts'],{encoding:'utf8',windowsHide:true});
const output=result.stdout||'';
const report={date:new Date().toISOString(),command:'node --import tsx --test tests/identity.test.ts',status:result.status===0?'passed':'failed',groups:output.split('\n').filter(line=>line.startsWith('# Subtest: ')).map(line=>line.slice(11)),passed:Number(output.match(/# pass (\d+)/)?.[1]||0),failed:Number(output.match(/# fail (\d+)/)?.[1]||0),limitations:['Real Express HTTP tests with isolated in-memory repositories','No external identity provider, staff MFA, durable database persistence or production deployment']};
writeFileSync('docs/engineering/identity-api-checks.json',JSON.stringify(report,null,2)+'\n');
// Summaries only; neither raw HTTP requests nor arbitrary failure values enter evidence/logs.
console.log(`Identity API: ${report.passed} passed, ${report.failed} failed.`);
if(result.status!==0)throw new Error('Focused identity suite failed; inspect tests locally without logging credentials');
const browser=spawnSync(process.execPath,['--import','tsx','scripts/check-identity-browser.mjs'],{stdio:'inherit',windowsHide:true});
if(browser.status!==0)throw new Error('Identity browser suite failed');
