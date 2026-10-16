import { validateDraft, digest } from '../../../packages/domain/src/publication.js';
import { fixtureDrafts } from '../../../packages/test-fixtures/src/index.js';
// Boundary for deterministic generation; consumes fixture inputs only, no provider tools/network.
export interface GenerationAdapter { generate(): Promise<ReturnType<typeof fixtureDrafts>[number]>; }
export class FixtureGenerationAdapter implements GenerationAdapter { async generate(){return fixtureDrafts()[0]!;} }
const draft=await new FixtureGenerationAdapter().generate();
const blockers=validateDraft(draft,new Date('2026-10-12T00:00:00Z'));
console.log(JSON.stringify({adapter:'deterministic-fixture',digest:digest(draft),blockers,liveGenerationVerified:false}));
if(blockers.length)process.exitCode=1;
