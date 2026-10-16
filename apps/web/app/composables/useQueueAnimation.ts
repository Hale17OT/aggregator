import {useAutoAnimate} from '@formkit/auto-animate/vue';
export function useQueueAnimation(){
  const [parent,enable]=useAutoAnimate({duration:150,easing:'ease-out'});let observer:MutationObserver|undefined,media:MediaQueryList|undefined;
  const sync=()=>enable(!media?.matches&&document.documentElement.dataset.reduceMotion!=='true'&&!(parent.value instanceof Element&&parent.value.contains(document.activeElement)));
  onMounted(()=>{media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',sync);observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});document.addEventListener('focusin',sync);document.addEventListener('focusout',sync);sync();});
  onBeforeUnmount(()=>{observer?.disconnect();media?.removeEventListener('change',sync);document.removeEventListener('focusin',sync);document.removeEventListener('focusout',sync);});return parent;
}
