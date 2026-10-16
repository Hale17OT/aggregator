import type { RouterConfig } from '@nuxt/schema';
import { nextTick } from 'vue';

export default <RouterConfig>{
  scrollBehavior(to,from,savedPosition){
    const app=useNuxtApp();const router=useRouter();
    const position=()=>{
      if(router.currentRoute.value.fullPath!==to.fullPath)return false;
      // Keep a reader's scrolled position. If an interrupted navigation recorded
      // zero for a section URL, restore the explicit section after layout resolves.
      if(savedPosition&&savedPosition.top>0)return savedPosition;
      if(to.hash){let id;try{id=decodeURIComponent(to.hash.slice(1));}catch{return savedPosition||{top:0};}
        const element=document.getElementById(id);if(element)return {el:element,top:Number.parseFloat(getComputedStyle(element).scrollMarginTop)||0};
      }
      return savedPosition||(to.path===from.path?false:{top:0,left:0});
    };
    if(to.path===from.path||!from.matched.length)return position();
    // A quick Back can interrupt an async child before Nuxt emits loading:end.
    // For a section destination, wait for the actual target, not that missed hook.
    if(to.hash)return new Promise(resolve=>{
      let settled=false;let id:string;try{id=decodeURIComponent(to.hash.slice(1));}catch{resolve(position());return;}
      const finish=async()=>{if(settled)return;settled=true;observer.disconnect();clearTimeout(timeout);removeGuard();await nextTick();await document.fonts.ready;requestAnimationFrame(()=>resolve(position()));};
      const inspect=()=>{if(router.currentRoute.value.fullPath!==to.fullPath||document.getElementById(id))void finish();};
      const observer=new MutationObserver(inspect);
      const timeout=setTimeout(()=>void finish(),5000);
      const removeGuard=router.afterEach(()=>{if(router.currentRoute.value.fullPath!==to.fullPath)void finish();});
      observer.observe(document.body,{childList:true,subtree:true});inspect();
    });
    return new Promise(resolve=>{app.hooks.hookOnce('page:loading:end',async()=>{await nextTick();await document.fonts.ready;requestAnimationFrame(()=>resolve(position()));});});
  },
};
