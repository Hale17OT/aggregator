// Authored delivery beats in seconds relative to measured narration segments.
// These are direction, not inferred emotion or word alignment.
export const PERFORMANCE_REVISION='delivery-2026-10-13-v2';
export const performanceCues={
 'segment-1':{gesture:'introduction',start:3.1,peak:4.3,end:6.6,intensity:.55},
 'segment-6':{gesture:'emphasis',start:2.1,peak:3.0,end:4.8,intensity:.32},
 'segment-8':{gesture:'contrast',start:2.3,peak:3.8,end:6.3,intensity:.55},
 'segment-10':{gesture:'evidence',start:1.0,peak:2.1,end:4.7,intensity:.62},
 'segment-15':{gesture:'contrast',start:1.0,peak:2.6,end:5.4,intensity:.48},
 'segment-17':{gesture:'emphasis',start:2.0,peak:3.7,end:6.4,intensity:.43},
 'segment-19':{gesture:'contrast',start:1.0,peak:2.2,end:4.9,intensity:.48},
 'segment-20':{gesture:'closing',start:6.1,peak:7.7,end:10.9,intensity:.45}
};
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const envelope=(t,a,b,c)=>t<a||t>c?0:t<=b?smooth((t-a)/(b-a)):1-smooth((t-b)/(c-b));
const shapes={X:[14,.4,0,0],A:[16,.15,0,0],B:[18,4,1,0],C:[18,10,1,.5],D:[15,17,1,1],E:[12,11,.3,0],F:[7,7,0,0],G:[16,3,1,.1],H:[16,8,1,1]};
export function articulation(segment,time,speaking){if(!speaking)return{shape:'X',width:14,opening:.4,teeth:0,tongue:0,jaw:0};const cues=segment.phonemeCues||[],i=cues.findIndex(c=>time>=c.startMs&&time<c.endMs),cue=cues[i],shape=cue?.value||'X',target=shapes[shape]||shapes.X,previous=shapes[cues[i-1]?.value]||shapes.X;const closure=['A','X','G'].includes(shape),blend=cue?(closure?1:smooth((time-cue.startMs)/Math.min(65,(cue.endMs-cue.startMs)*.35))):1;const values=target.map((v,n)=>previous[n]+(v-previous[n])*blend);return{shape,width:values[0],opening:values[1],teeth:values[2],tongue:values[3],jaw:values[1]*.19};}
export function performanceAt(programme,segment,time){const local=(time-segment.startMs)/1000,duo=programme.variant==='duo',result={};
 for(const [person,seed]of[['ada',.73],['eli',2.17]]){const speaking=segment.speakerId===person,cue=programme.scenePlan?segment.scene?.gesture:performanceCues[segment.id],gesture=speaking&&cue?envelope(local,cue.start,cue.peak,cue.end)*cue.intensity:0;let attention=0;
 if(duo)for(let i=1;i<programme.segments.length;i++){const current=programme.segments[i],before=programme.segments[i-1];if(!['ada','eli'].includes(current.speakerId)||!['ada','eli'].includes(before.speakerId)||current.speakerId===before.speakerId)continue;const relative=(time-current.startMs)/1000;if(person===before.speakerId)attention=Math.max(attention,envelope(relative,-.7,.45,4.2));else if(person===current.speakerId)attention=Math.max(attention,envelope(relative,-1.15,-.2,1.2)*.65);}
 const direction=person==='ada'?1:-1;let blink=0; // global, staggered schedule: no blink reset at sentence cuts
 for(let n=0;n<45;n++){const at=seed+n*4.7+(n%3)*.61;const t=time/1000-at;blink=Math.max(blink,envelope(t,0,.085,.245));}
 const glance=speaking&&cue?.gesture==='evidence'?envelope(local,cue.start-.25,cue.peak-.2,cue.end)*.7:0;
 const mouth=articulation(segment,time,speaking);const breath=Math.sin(time/(person==='ada'?4700:5300)+seed)*.65;
 result[person]={speaking,mouth:mouth.shape,articulation:mouth,blink,gesture,gestureName:cue?.gesture||'rest',head:direction*attention*3.2-gesture*.65,gaze:direction*attention*3.8+glance*2.2,brow:speaking?gesture*.65:0,breath,shoulder:gesture*.9,attention};
 }return result;
}
export function armPose(side,p){const amount=p.gesture*(side===(p.gestureName==='evidence'?1:-1)?1:.25),shoulder={x:side*125,y:211+p.shoulder},wrist={x:side*(68+amount*48),y:409-amount*88};const dx=wrist.x-shoulder.x,dy=wrist.y-shoulder.y,d=Math.hypot(dx,dy),length=125,mid={x:(shoulder.x+wrist.x)/2,y:(shoulder.y+wrist.y)/2},height=Math.sqrt(Math.max(0,length*length-d*d/4));const elbow={x:mid.x+side*dy/d*height,y:mid.y-side*dx/d*height};return{shoulder,elbow,wrist,amount};}


