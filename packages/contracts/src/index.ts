import { z } from 'zod';
export * from './member.js';

const id = z.string().min(1);
// Local fictional illustrations never supply evidence eligibility.
export const editorialMediaSchema=z.object({
  id,kind:z.enum(['image','video']),src:z.string().regex(/^\/media\/[a-z0-9.-]+$/),
  width:z.number().int().positive(),height:z.number().int().positive(),alt:z.string().min(1),caption:z.string().min(1),credit:z.string().min(1),
  originalUrl:z.string().regex(/^\/media\/[a-z0-9.-]+$/),provenance:z.string().min(1),
  role:z.literal('illustration'),displayPermitted:z.boolean(),availability:z.enum(['available','unavailable']),
  focalPoint:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100)}),
  poster:z.string().regex(/^\/media\/[a-z0-9.-]+$/).optional(),captions:z.string().regex(/^\/media\/[a-z0-9.-]+$/).optional(),
});
export type EditorialMedia=z.infer<typeof editorialMediaSchema>;
export const sourceSchema = z.object({
  id, itemId: id, versionId: id, ordinal: z.number().int().positive(), publisher: z.string(), title: z.string().min(1),
  kind: z.enum(['article','document','video']), originId: id, originVerified: z.boolean(),
  url: z.url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;},'HTTPS item URL required'),
  author: z.string().nullable(), publishedAt: z.iso.datetime().nullable(), checkedAt: z.iso.datetime(),
  availability: z.enum(['available','unavailable']), role: z.enum(['evidence','context','related']), eligible: z.boolean(),
  rights: z.object({ revision:z.number().int().positive(),sourceApproved:z.boolean(),model:z.boolean(),synthesis:z.boolean(),publicExcerpt:z.boolean(),revoked:z.boolean(),expiresAt:z.iso.datetime() }),
  locator: z.object({startMs:z.number().nonnegative(),endMs:z.number().positive(),durationMs:z.number().positive(),validated:z.boolean(),provenance:z.string()}).nullable(),
});
export const blockSchema=z.object({id,heading:z.string(),text:z.string().min(1),claimIds:z.array(id).min(1),sourceIds:z.array(id).min(1)});
export const claimSchema=z.object({id,proposition:z.string(),status:z.enum(['attributed','corroborated','disputed','unresolved']),reviewed:z.boolean(),sourceIds:z.array(id).min(1)});
export const reviewSchema=z.object({reviewerId:id,digest:id,decision:z.enum(['approve','reject','revoke','changes_requested']),sequence:z.number().int().nonnegative()});
export const draftSchema=z.object({
  id:z.uuid(),versionId:z.uuid(),slug:z.string().regex(/^[a-z0-9-]+$/),version:z.number().int().positive(),fixture:z.literal(true),
  state:z.enum(['draft','in_review','published','withdrawn']),risk:z.enum(['normal','high']),topic:z.string(),headline:z.string().min(1),deck:z.string().min(1),headerClaimIds:z.array(id).min(1),
  cutoff:z.iso.datetime(),publishedAt:z.iso.datetime(),correction:z.string().nullable(),sources:z.array(sourceSchema),claims:z.array(claimSchema),
  leadMedia:editorialMediaSchema.nullable().default(null),inlineMedia:z.array(z.object({afterBlockIds:z.array(id),media:editorialMediaSchema})).default([]),
  variants:z.object({standard:z.array(blockSchema).min(1),brief:z.array(blockSchema).min(1)}),privateNotes:z.string(),reviews:z.array(reviewSchema),
});
export type Draft=z.infer<typeof draftSchema>;
export type Source=z.infer<typeof sourceSchema>;
export type Variant='standard'|'brief';
// Public-safe schema is an allowlist, not a private object with fields hidden by UI.
export const publicSourceSchema=sourceSchema.pick({id:true,ordinal:true,publisher:true,title:true,kind:true,url:true,author:true,publishedAt:true,checkedAt:true,availability:true,role:true,locator:true});
export const publicArticleSchema=draftSchema.pick({id:true,versionId:true,slug:true,version:true,fixture:true,topic:true,headline:true,deck:true,cutoff:true,publishedAt:true,correction:true,leadMedia:true,inlineMedia:true}).extend({
  variant:z.enum(['standard','brief']),blocks:z.array(blockSchema),sources:z.array(publicSourceSchema),
  claims:z.array(claimSchema.omit({reviewed:true})), disclosure:z.string(),
});
export const publisherArticleSchema=publicArticleSchema.extend({
 fixture:z.literal(false),contentKind:z.literal('publisher-original'),
 blocks:z.array(blockSchema.extend({claimIds:z.array(id).max(0)})),
 claims:z.array(claimSchema.omit({reviewed:true})).max(0),
 attribution:z.object({publisher:z.string(),author:z.string(),url:z.url(),license:z.string(),licenseUrl:z.url(),sourceType:z.string(),transformation:z.string()}),
});
export type PublisherArticle=z.infer<typeof publisherArticleSchema>;
export type PublicArticle=z.infer<typeof publicArticleSchema>|PublisherArticle;
