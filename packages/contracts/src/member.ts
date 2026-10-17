import { z } from 'zod';

export const roleSchema=z.enum(['reader','editor','publisher','curator','rights_reviewer','operator','administrator']);
export type Role=z.infer<typeof roleSchema>;
export const preferencesSchema=z.object({
  theme:z.enum(['light','dark','system']),textSize:z.enum(['small','standard','large']),
  reduceMotion:z.boolean(),homeMode:z.enum(['editorial','following']),language:z.literal('en'),
  timezone:z.string().max(100).refine(value=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}},'IANA timezone required'),
  lockVersion:z.number().int().nonnegative(),updatedAt:z.iso.datetime(),
  playbackSpeed:z.union([z.literal(0.75),z.literal(1),z.literal(1.25),z.literal(1.5)]),anchorCount:z.union([z.literal(1),z.literal(2)]),
  narrationVoice:z.literal('prepared'),mediaTreatment:z.enum(['narration_over_visual','clip_then_comment']),listeningHistory:z.boolean(),
}).strict();
export const preferencesPatchSchema=preferencesSchema.omit({updatedAt:true,lockVersion:true}).partial()
  .extend({lockVersion:z.number().int().nonnegative()}).strict()
  .refine(value=>Object.keys(value).length>1,'At least one editable field required');
export type Preferences=z.infer<typeof preferencesSchema>;
export type PreferencesPatch=z.infer<typeof preferencesPatchSchema>;
export const articleIdSchema=z.uuid();
export const emptyMutationSchema=z.object({}).strict();
export const queuePatchSchema=z.object({revision:z.number().int().nonnegative(),programmeIds:z.array(z.string().min(1).max(120)).max(50).refine(ids=>new Set(ids).size===ids.length)}).strict();
export const progressPatchSchema=z.object({programmeId:z.string().min(1).max(120),renditionKey:z.string().min(1).max(128),positionMs:z.number().int().nonnegative().max(86400000),revision:z.number().int().nonnegative()}).strict();
export interface ListeningProgress {programmeId:string;renditionKey:string;positionMs:number;durationMs:number;completed:boolean;revision:number;updatedAt:string;}
export interface ListeningState {revision:number;queue:string[];progress:ListeningProgress[];}

export interface SessionView {
  user:{id:string;displayName:string}; authenticationMethod:'fixture'|'captured-mail'|'google'; assurance:'fixture-only'|'local-demo'|'provider-verified';
  createdAt:string;expiresAt:string;idleExpiresAt:string;csrfToken:string;
}
