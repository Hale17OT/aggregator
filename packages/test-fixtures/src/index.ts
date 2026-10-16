import fixtures from '../../../docs/design/fixtures/articles.json' with { type: 'json' };
import { draftSchema } from '../../contracts/src/index.js';
import { digest, FixtureRepository } from '../../domain/src/publication.js';
import { additionalDispatches } from './dispatches.js';
export const fixtureDrafts=()=>[...fixtures,...additionalDispatches()].map(f=>draftSchema.parse(structuredClone(f)));
export function createFixtureRepository(){
  const drafts=fixtureDrafts();for(const d of drafts){d.state='in_review';d.reviews=[{reviewerId:'fictional-editor',digest:digest(d),decision:'approve',sequence:1}];}
  const privateDraft=draftSchema.parse({...drafts[0],slug:'unpublished-draft',state:'draft',headline:'PRIVATE DRAFT MUST NOT LEAK',reviews:[]});
  const repo=new FixtureRepository([...drafts,privateDraft]);
  for(const d of drafts)repo.publish(d.slug,digest(d),0,'fixture-publish-'+d.slug,'publisher',new Date('2026-10-12T00:00:00Z'));
  return repo;
}
