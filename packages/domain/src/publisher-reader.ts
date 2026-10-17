import {publisherArticleSchema,type PublisherArticle} from '../../contracts/src/index.js';
export interface SourceReaderRow{id:string;versionId:string;version:number;url:string;headline:string;author:string;publishedAt:string;modifiedAt:string|null;checkedAt:string;publisher:string;sourceType:string;body:string;license:string;licenseUrl:string;topic:string;sourceSlug:string;}
export function publisherProjection(row:SourceReaderRow):PublisherArticle{
 row={...row,publishedAt:new Date(row.publishedAt).toISOString(),checkedAt:new Date(row.checkedAt).toISOString()};
 const sourceId=row.versionId;
 return publisherArticleSchema.parse({id:row.id,versionId:row.versionId,version:row.version,slug:'publisher-'+row.id,fixture:false,contentKind:'publisher-original',topic:row.topic,headline:row.headline,deck:row.body.split('\n\n')[0],cutoff:row.checkedAt,publishedAt:row.publishedAt,correction:null,leadMedia:null,inlineMedia:[],variant:'standard',
 blocks:row.body.split('\n\n').filter(Boolean).map((text,i)=>({id:'publisher-p-'+i,heading:'',text,claimIds:[],sourceIds:[sourceId]})),claims:[],
 sources:[{id:sourceId,ordinal:1,publisher:row.publisher,title:row.headline,kind:'article',url:row.url,author:row.author,publishedAt:row.publishedAt,checkedAt:row.checkedAt,availability:'available',role:'context',locator:null}],
 disclosure:'Attributed publisher reporting. This is not Aggregator synthesis or independent corroboration. No sample audio or video accompanies this report.',
 attribution:{publisher:row.publisher,author:row.author,url:row.url,license:row.license,licenseUrl:row.licenseUrl,sourceType:row.sourceType,transformation:'Text extracted from the publisher feed; imagery, embeds and navigation omitted. Original links and publisher version remain authoritative.'}});
}

