import { z } from 'zod';
export const conceptId=z.string().regex(/^agg:(topic|team|competition|organisation|person|place):[a-z0-9-]+$/).max(140);
export const interestRule=z.object({target:conceptId,action:z.enum(['follow','mute']),competition:conceptId.optional()}).strict();
export const interestsPatch=z.object({revision:z.number().int().nonnegative(),status:z.enum(['in_progress','completed','skipped']),rules:z.array(interestRule).max(100),hiddenStories:z.array(z.uuid()).max(200)}).strict().refine(p=>new Set(p.rules.map(r=>r.target)).size===p.rules.length,'Duplicate rule');
export type InterestRule=z.infer<typeof interestRule>;
export type InterestsPatch=z.infer<typeof interestsPatch>;
export interface Interests {labels?:Record<string,string>;revision:number;status:'legacy'|'not_started'|'in_progress'|'completed'|'skipped';rules:InterestRule[];hiddenStories:string[];updatedAt:string|null;}
