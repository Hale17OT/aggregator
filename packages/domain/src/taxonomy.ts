import seed from '../../../docs/next-build/completion/interest_catalogue.seed.json' with {type:'json'};
import type { InterestRule } from '../../contracts/src/interests.js';
export interface Concept {id:string;kind:string;label:string;aliases:string[];status:string;is_browse_root?:boolean;is_fictional?:boolean;[key:string]:unknown;}
export const concepts:Concept[]=seed.concepts;
export const taxonomyRevision='authored-2026-10-14-v1';
const index=new Map(concepts.map(c=>[c.id,c]));
const parents=new Map<string,string[]>();
for(const e of seed.topic_edges){if(index.get(e.from)?.kind!=='topic'||index.get(e.to)?.kind!=='topic')throw Error('Invalid topic edge');parents.set(e.from,[...(parents.get(e.from)||[]),e.to]);}
export function ancestors(id:string,path:string[]=[]):string[]{if(path.includes(id)||path.length>20)throw Error('Taxonomy cycle');return [...new Set([id,...(parents.get(id)||[]).flatMap(p=>ancestors(p,[...path,id]))])];}
for(const c of concepts)ancestors(c.id);
export function concept(id:string){return index.get(id);}
function navigationDescendants(id:string){const found=new Set<string>(),pending=[id];while(pending.length){const parent=pending.pop()!;for(const c of concepts)if(c.id!==id&&!found.has(c.id)&&(parents.get(c.id)?.includes(parent)||seed.entity_relations.some(e=>e.from===c.id&&e.to===parent&&['sport','participates_in','part_of'].includes(e.relation)))){found.add(c.id);pending.push(c.id);}}return [...found];}
export function browse(parent?:string,q=''){
 const term=q.trim().toLocaleLowerCase('en');if(term.length>120)throw Error('Invalid search');
 const list=term?concepts.filter(c=>[c.label,...c.aliases].some(v=>v.toLocaleLowerCase('en').includes(term))):parent?concepts.filter(c=>parents.get(c.id)?.includes(parent)||seed.entity_relations.some(e=>e.from===c.id&&e.to===parent&&['sport','participates_in','part_of'].includes(e.relation))):concepts.filter(c=>c.is_browse_root);
 return list.slice(0,40).map(c=>({...c,descendantIds:navigationDescendants(c.id),coveredBy:concepts.filter(parent=>parent.id!==c.id&&ruleMatches({target:parent.id,action:'follow'},[c.id])).map(parent=>parent.id),competitions:seed.entity_relations.filter(e=>e.from===c.id&&e.relation==='participates_in').map(e=>({value:e.to,label:index.get(e.to)!.label})),breadcrumb:ancestors(c.id).slice(1).reverse().map(id=>index.get(id)!.label),hasChildren:concepts.some(d=>parents.get(d.id)?.includes(c.id))||seed.entity_relations.some(e=>e.to===c.id)}));
}
export function validateRules(rules:InterestRule[]){for(const r of rules){const c=index.get(r.target);if(!c||c.status!=='active')throw Error('Unknown or retired interest');if(r.competition&&(c.kind!=='team'||index.get(r.competition)?.kind!=='competition'))throw Error('Invalid competition scope');}}
// Classification supplies material IDs only. Participation is never an inference of article subject.
export function ruleMatches(rule:InterestRule,material:string[]){
 const c=index.get(rule.target);if(!c)return false;if(rule.competition&&!material.includes(rule.competition))return false;
 if(c.kind==='topic')return material.some(id=>ancestors(id).includes(c.id)||seed.entity_relations.some(e=>e.from===id&&e.relation==='sport'&&ancestors(e.to).includes(c.id)));
 if(c.kind==='organisation')return material.includes(c.id)||seed.entity_relations.some(e=>e.to===c.id&&e.relation==='part_of'&&material.includes(e.from));
 return material.includes(c.id);
}
export function relevance(rules:InterestRule[],material:string[]){if(rules.some(r=>r.action==='mute'&&ruleMatches(r,material)))return null;
 const matches=rules.filter(r=>r.action==='follow'&&ruleMatches(r,material)).map(r=>{const c=index.get(r.target)!;return {target:c.id,label:c.label,reason:c.kind==='topic'?'followed_topic':c.kind==='competition'?'followed_competition':'followed_entity',specificity:r.competition?5:c.kind==='team'||c.kind==='organisation'?4:c.kind==='competition'?3:c.is_browse_root?1:2};});
 return matches.sort((a,b)=>b.specificity-a.specificity||a.target.localeCompare(b.target))[0]||null;
}
