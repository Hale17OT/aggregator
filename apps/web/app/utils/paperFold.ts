/** Ephemeral inert current sheet over the authoritative destination HTML. No media or Vue clones. */
export function paperFold(spread:HTMLElement,direction:number){
 const layer=document.createElement('div'),sheet=spread.cloneNode(true) as HTMLElement,fold=document.createElement('div');
 layer.className='paper-fold';layer.inert=true;layer.setAttribute('aria-hidden','true');
 sheet.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
 sheet.querySelectorAll('video,audio,iframe,script').forEach(e=>e.remove());
 sheet.removeAttribute('id');sheet.style.cssText='position:absolute;inset:0;background:var(--surface);margin:0;pointer-events:none';
 layer.style.cssText='position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden';
 fold.style.cssText='position:absolute;top:0;bottom:0;pointer-events:none';
 layer.append(sheet,fold);spread.parentElement!.append(layer);
 let frame=0,resolve:()=>void=()=>{};const finished=new Promise<void>(r=>{resolve=r;});
 function cancel(){cancelAnimationFrame(frame);layer.remove();resolve();}
 function start(){const begin=performance.now();function tick(now:number){const t=Math.min(1,(now-begin)/600),p=t*t*(3-2*t),lift=Math.sin(Math.PI*t),edge=p*112-6,bend=lift*9;
 const x=direction>0?edge:100-edge,top=x-direction*bend,bottom=x+direction*bend*.45;
 sheet.style.clipPath=direction>0?`polygon(${top}% 0,100% 0,100% 100%,${bottom}% 100%)`:`polygon(0 0,${top}% 0,${bottom}% 100%,0 100%)`;
 fold.style.left=`${x-bend/2}%`;fold.style.width=`${bend}%`;fold.style.transform=`skewY(${direction*lift*7}deg)`;
 fold.style.background=`linear-gradient(${direction>0?'90':'270'}deg,#82745c44,var(--surface) 16%,#ddd5bf 55%,#fffdf5 88%,#8a806a55)`;
 fold.style.boxShadow=`${-direction*lift*14}px 0 ${lift*22}px #18211955`;fold.style.opacity=String(lift);layer.dataset.progress=String(t);
 if(t<1)frame=requestAnimationFrame(tick);else cancel();}frame=requestAnimationFrame(tick);}
 return {start,finished,cancel};
}
