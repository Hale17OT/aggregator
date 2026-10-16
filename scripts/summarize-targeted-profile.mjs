import {readFileSync,writeFileSync} from 'node:fs';
const series=process.argv[2];if(!/^[a-z0-9-]+$/.test(series||''))throw Error('Explicit series required');
const dir=`output/targeted-closeout-20261016/profile/${series}`,rows=[];
for(const phase of ['before','after'])for(let repeat=1;repeat<=3;repeat++){
 const folder=`${dir}/${phase}-${repeat}`;
 const snapshots=readFileSync(folder+'/flutter-timings.txt','utf8').split(/\r?\n/).filter(l=>l.includes('AGG_PROFILE ')).map(l=>JSON.parse(l.split('AGG_PROFILE ')[1]));
 const sample=snapshots.find(s=>s.seconds===45);if(sample?.interruptions)throw Error(`Playback interrupted ${folder}`);if(!sample)throw Error(`Missing matched 45s snapshot ${folder}`);
 rows.push({phase,repeat,identity:JSON.parse(readFileSync(folder+'/identity.json','utf8').replace(/^\uFEFF/,'')),...sample});
}
const median=values=>values.sort((a,b)=>a-b)[1];
const summary=Object.fromEntries(['before','after'].map(phase=>[phase,Object.fromEntries(['ui','raster'].map(stage=>[stage,{p95MedianMs:median(rows.filter(r=>r.phase===phase).map(r=>r.warm[stage].p95Ms)),p95RepeatsMs:rows.filter(r=>r.phase===phase).map(r=>r.warm[stage].p95Ms)}]))]));
writeFileSync(dir+'/comparison.json',JSON.stringify({rows,summary,window:rows[0].identity.measurementClock || 'Application +30–45 seconds; historical setup', protocol:'Same source media and profile template on both builds. First30 seconds retained; warm15 seconds measured. No concurrent builds/browser/recording.',gateMs:16.7,gate:rows.filter(r=>r.phase==='after').every(r=>r.warm.raster.p95Ms<=16.7)?'PASS within this diagnostic only':'FAIL',limitations:'Emulator only; no physical-device generalization. Original mixed-workload raster gate remains separate; gfxinfo zero-frame sentinel is invalid. Static brand assets changed outside Clips. Localized build work does not prove raster causation.'},null,2));
console.log(summary);
