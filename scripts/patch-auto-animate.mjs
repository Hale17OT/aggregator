// Local lifecycle correction for the pinned MIT-licensed AutoAnimate 0.10.0.
// Keep upstream source and notices; fail closed when an upgrade changes this file.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const path=new URL('../node_modules/@formkit/auto-animate/index.mjs',import.meta.url);
const marker='// Aggregator: cancel delayed polling and reject retired observer work.';
let source=await readFile(path,'utf8');
if(!source.includes(marker)){
  if(createHash('sha256').update(source).digest('hex')!=='cd5fca8eadcf0fb0474ff672de65851a4f58f1b13d76863bc649c2cf189a51d3')throw Error('AUTO_ANIMATE_PATCH_REVIEW_REQUIRED');
  source=source.replace('const intervals = new WeakMap();',`${marker}\nconst pollStarts = new WeakMap();\nconst intervals = new WeakMap();`);
  source=source.replace('function updatePos(el, debounce = true) {','function updatePos(el, debounce = true) {\n    if (!el.isConnected || !parents.has(getTarget(el))) return;');
  source=source.replace('            coords.set(el, getCoords(el));','            if (!el.isConnected || !parents.has(getTarget(el))) return;\n            coords.set(el, getCoords(el));');
  source=source.replace('function poll(el) {\n    setTimeout(() => {\n        intervals.set(el, setInterval(() => lowPriority(updatePos.bind(null, el)), 2000));\n    }, Math.round(2000 * Math.random()));\n}',`function poll(el) {
    clearTimeout(pollStarts.get(el));
    pollStarts.set(el, setTimeout(() => {
        pollStarts.delete(el);
        if (!el.isConnected || !parents.has(getTarget(el))) return;
        clearInterval(intervals.get(el));
        intervals.set(el, setInterval(() => lowPriority(updatePos.bind(null, el)), 2000));
    }, Math.round(2000 * Math.random())));
}`);
  source=source.replaceAll('                const i = intervals.get(node);','                clearTimeout(pollStarts.get(node));\n                pollStarts.delete(node);\n                const i = intervals.get(node);');
  source=source.replace('    el.remove();\n    coords.delete(el);','    el.remove();\n    clearTimeout(pollStarts.get(el));\n    pollStarts.delete(el);\n    clearInterval(intervals.get(el));\n    intervals.delete(el);\n    clearTimeout(debounces.get(el));\n    debounces.delete(el);\n    resize?.unobserve(el);\n    coords.delete(el);');
  await writeFile(path,source);
}
console.log('AutoAnimate 0.10.0 lifecycle patch present.');
