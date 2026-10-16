import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { sceneAt, renderSvg } from '../packages/broadcast/scene.mjs';
import { performanceCues } from '../packages/broadcast/performance.mjs';
const latest=JSON.parse(await readFile('.cache/broadcast/latest-duo-pilot.json','utf8'));
const p=JSON.parse(await readFile(join(latest.out,'scene-programme.json'),'utf8'));
const times=p.segments.flatMap(s=>[s.startMs,s.startMs+10,(s.startMs+s.endMs)/2,s.endMs-1]);
const expected=new Map(times.map(t=>[t,JSON.stringify(sceneAt(p,t))]));
for(const t of [...times].reverse())assert.equal(JSON.stringify(sceneAt(p,t)),expected.get(t),'seeks reconstruct exact scene independent of prior frames');
for(const t of times){const s=sceneAt(p,t);for(const person of ['ada','eli'])if(s.segment.speakerId!==person)assert.equal(s.performances[person].mouth,'X');}
const shapes=[...new Set(p.segments.flatMap(s=>s.phonemeCues?.map(c=>c.value)||[]))].sort();assert(shapes.length>=7,'raw Rhubarb shapes must not collapse to three mouth drawings');
for(const value of ['A','B','C','D','E','F','G','H','X']){const test=structuredClone(p);test.segments[0].phonemeCues=[{startMs:0,endMs:1000,value}];assert.equal(sceneAt(test,500).performances.ada.mouth,value);assert(renderSvg(test,500).includes('<svg'));}
const shots=[...new Set(Array.from({length:Math.ceil(p.durationMs/100)},(_,i)=>sceneAt(p,i*100).shot))];for(const shot of ['wide','medium','handoff','shoulder','image','clip','evidence','recap'])assert(shots.includes(shot));
for(const segment of p.segments.filter(s=>!performanceCues[s.id]))for(let t=segment.startMs;t<segment.endMs;t+=100){const scene=sceneAt(p,t);assert.equal(scene.performances.ada.gesture,0);assert.equal(scene.performances.eli.gesture,0);}
const report={checkedAt:new Date().toISOString(),groups:5,sceneSamples:times.length,results:'PASS',checks:['seeking determinism / reverse evaluation','silent and clip speaker mouth isolation','full A–F/G/H/X rig with real raw cues','all eight story-motivated shot types','gestures only at authored delivery beats; rests elsewhere'],actualPhonemes:shapes,shotTypes:shots,qualityAcceptance:'not established by these functional assertions'};
await writeFile(resolve('docs/engineering/broadcast-scene-checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
