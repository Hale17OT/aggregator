export type ProgrammeVariant = 'full' | 'brief' | 'solo' | 'duo';
export interface ProgrammeSource { id:string; ordinal:number; publisher:string; title:string; url:string; articleSlug:string }
export interface ProgrammeSegment {
  id:string; articleSlug:string; articleVersionId:string; blockIds:string[]; claimIds:string[]; sourceIds:string[];
  speakerId:'ada'|'eli'|'clip'|null; text:string; displayText:string; startMs:number; endMs:number;
  shot:'opening'|'presenter'|'image'|'figure'|'clip'|'recap';
  visual?:{url:string;kind:'image'|'video';credit:string;alt:string;sourceId?:string;offsetMs:number;treatment:'narration_over_visual'|'clip_then_comment'};
  mouthCues:{startMs:number;endMs:number;value:'closed'|'open'|'wide'}[];
  scene?:{camera:'opening'|'medium'|'wide'|'shoulder'|'image'|'clip'|'evidence'|'recap';heading:string;body:string;attribution:string;gesture?:{gesture:'introduction'|'emphasis'|'contrast'|'evidence'|'closing';start:number;peak:number;end:number;intensity:number}};
}
export interface Programme {
  schemaVersion:1; programmeId:string; kind:'radio'|'broadcast'|'clip'; variant:ProgrammeVariant; title:string;
  status:'ready'; language:'en'; durationMs:number; audioUrl:string; articleSlugs:string[];
  chapters:{articleSlug:string;title:string;startMs:number;endMs:number}[];
  segments:ProgrammeSegment[]; sources:ProgrammeSource[]; syntheticDisclosure:string;
  scriptDigest:string; renditionKey:string; revisions:{slug:string;versionId:string;digest:string}[];
  videoRendition?:{url:string;posterUrl:string;captionUrl:string;sourceMapUrl:string;renditionKey:string;durationMs:number;width:number;height:number;fps:number};
  assets:ProgrammeAsset[];
  mediaTreatment?:'narration_over_visual'|'clip_then_comment';
  scenePlan?:{version:1;style:'attributed-text'};
}
export interface ProgrammeAsset {
  id:string; storageKey:string; type:'audio'|'image'|'video'|'captions'|'source-map'; mime:string; hash:string; bytes:number;
  durationMs?:number; sampleRate?:number; sampleCount?:number; width?:number; height?:number;
  availability:'available'; permissions:{display:boolean;transform:boolean;audio:boolean;broadcast:boolean};
  provenance:string; engine:string; voice:string; modelRevision:string;
}
export interface SpeechProvider { revision:string; synthesize(text:string,voice:string,outputPath:string):Promise<void> }
export interface PresenterRenderer { revision:string; render(programme:Programme,outputPath:string):Promise<void> }
