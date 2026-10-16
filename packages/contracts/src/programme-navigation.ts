import type {Programme} from './programme.js';
export interface StoryAnchor {slug:string;versionId:string;blockId?:string}
export function matchesStory(programme:Programme,anchor:StoryAnchor){
  return programme.revisions.some(r=>r.slug===anchor.slug&&r.versionId===anchor.versionId);
}
/** Different scripts share evidence sections, never an inferred percentage or raw time. */
export function programmeBoundary(programme:Programme,anchor:StoryAnchor):number|null{
  if(!matchesStory(programme,anchor))return null;
  const segment=anchor.blockId?programme.segments.find(s=>s.articleSlug===anchor.slug&&s.articleVersionId===anchor.versionId&&s.blockIds.length===1&&s.blockIds.includes(anchor.blockId!)):undefined;
  return (segment?.startMs??programme.chapters.find(c=>c.articleSlug===anchor.slug)?.startMs??0)/1000;
}
export function storyAnchor(programme:Programme,seconds:number):StoryAnchor|undefined{
  const s=programme.segments.find(s=>seconds*1000>=s.startMs&&seconds*1000<s.endMs);
  return s?{slug:s.articleSlug,versionId:s.articleVersionId,blockId:s.blockIds.length===1?s.blockIds[0]:undefined}:undefined;
}

