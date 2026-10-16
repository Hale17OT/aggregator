<script setup lang="ts">
const props=withDefaults(defineProps<{modelValue:number;min?:number;max:number;step:number;label:string;valueText:string;disabled?:boolean;revision?:string}>(),{min:0});
const emit=defineEmits<{preview:[value:number|null];input:[value:number];commit:[value:number]}>();
const face=ref<HTMLElement|null>(null),dragging=ref(false),draft=ref<number|null>(null);
let pointer:number|null=null,lastAngle:number|null=null,raw=0,geometry:DOMRect|null=null;
const value=computed(()=>draft.value??props.modelValue);
const bounded=(v:number)=>Math.max(props.min,Math.min(props.max,v));
const quantize=(v:number)=>bounded(Math.round((v-props.min)/props.step)*props.step+props.min);
function angle(e:PointerEvent){const b=geometry!,x=e.clientX-b.x-b.width/2,y=e.clientY-b.y-b.height/2;return Math.hypot(x,y)<b.width*.18?null:Math.atan2(y,x)*180/Math.PI;}
function cancel(){const id=pointer;pointer=null;lastAngle=null;dragging.value=false;draft.value=null;emit('preview',null);if(id!==null&&face.value?.hasPointerCapture(id))face.value.releasePointerCapture(id);}
function down(e:PointerEvent){if(props.disabled||props.max<=props.min||pointer!==null||!e.isPrimary||e.button!==0)return;e.preventDefault();face.value?.focus({preventScroll:true});geometry=face.value!.getBoundingClientRect();pointer=e.pointerId;lastAngle=angle(e);raw=props.modelValue;draft.value=props.modelValue;dragging.value=true;face.value?.setPointerCapture(e.pointerId);}
function sample(e:PointerEvent){const next=angle(e);if(next===null){lastAngle=null;return;}if(lastAngle===null){lastAngle=next;return;}const delta=((next-lastAngle+540)%360)-180;lastAngle=next;raw=bounded(raw+delta/270*(props.max-props.min));}
function move(e:PointerEvent){if(e.pointerId!==pointer)return;const samples=e.getCoalescedEvents?.()||[];for(const point of samples)sample(point);if(!samples.length||samples.at(-1)!.timeStamp!==e.timeStamp||samples.at(-1)!.clientX!==e.clientX||samples.at(-1)!.clientY!==e.clientY)sample(e);const v=quantize(raw);if(v!==draft.value){draft.value=v;emit('preview',v);emit('input',v);}}
function up(e:PointerEvent){if(e.pointerId!==pointer)return;move(e);const v=draft.value;cancel();if(v!==null)emit('commit',v);}
function cancelled(e:PointerEvent){if(e.pointerId===pointer)cancel();}
function deliberate(v:number){if(props.disabled||props.max<=props.min)return;cancel();const next=quantize(v);emit('input',next);emit('commit',next);}
function key(e:KeyboardEvent){if(e.key==='Escape'){if(dragging.value){e.preventDefault();e.stopPropagation();cancel();}return;}const changes:Record<string,number>={ArrowRight:props.step,ArrowUp:props.step,ArrowLeft:-props.step,ArrowDown:-props.step,PageUp:props.step*5,PageDown:-props.step*5};if(e.key in changes||e.key==='Home'||e.key==='End'){e.preventDefault();e.stopPropagation();deliberate(e.key==='Home'?props.min:e.key==='End'?props.max:props.modelValue+changes[e.key]!);}}
watch(()=>[props.revision,props.disabled,props.max],cancel);
onMounted(()=>{window.addEventListener('blur',cancel);window.addEventListener('resize',cancel);window.addEventListener('scroll',cancel,true);});onBeforeUnmount(()=>{cancel();window.removeEventListener('blur',cancel);window.removeEventListener('resize',cancel);window.removeEventListener('scroll',cancel,true);});
</script>
<template>
  <div class="rotary-control" :class="{'is-dragging':dragging}">
    <span class="rotary-title">{{ label }} <output>{{ valueText }}</output></span>
    <span class="knob-scale"><span ref="face" class="rotary-knob" role="slider" :tabindex="disabled||max<=min?-1:0" :aria-label="`${label} knob`" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="value" :aria-valuetext="valueText" :aria-disabled="disabled||max<=min" :style="{'--angle':`${-135+(max>min?(value-min)/(max-min):0)*270}deg`}" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="cancelled" @lostpointercapture="cancelled" @keydown="key"><i aria-hidden="true"></i></span></span>
    <input :aria-label="label==='Story'?'Story tuner':'Volume'" :title="`${label} alternative slider`" type="range" :min="min" :max="Math.max(min,max)" :step="step" :value="value" :disabled="disabled||max<=min" @input="deliberate(Number(($event.target as HTMLInputElement).value))"/>
    <div class="dial-steps"><button type="button" :aria-label="`Decrease ${label.toLowerCase()}`" :disabled="disabled||value<=min" @click="deliberate(modelValue-step)">−</button><button type="button" :aria-label="`Increase ${label.toLowerCase()}`" :disabled="disabled||value>=max" @click="deliberate(modelValue+step)">+</button></div>
  </div>
</template>
<style scoped>
.rotary-control{display:grid;justify-items:center;gap:4px;min-width:0}.rotary-title{display:flex;gap:10px;font-size:9px;letter-spacing:.08em}.rotary-title output{font-variant-numeric:tabular-nums}.knob-scale{position:relative;display:block;width:66px;height:66px;border-radius:50%;background:repeating-conic-gradient(from -136deg,#65715b 0deg 1deg,transparent 1deg 27deg);padding:5px}.knob-scale:after{content:'';position:absolute;bottom:-1px;left:21px;width:24px;height:11px;background:#e4dcc8;pointer-events:none}.rotary-knob{position:relative;display:block;width:56px;height:56px;border-radius:50%;z-index:1;background:radial-gradient(circle at 36% 25%,#f5f1df,#d2cfb9 45%,#a9ad96 73%,#ece8d6 75%,#808a72 83%,#2a3f2b 88%);border:1px solid #8c957e;box-shadow:inset 0 1px 1px #fff,1px 4px 4px #0005,0 1px 0 2px #a29d84;touch-action:none;cursor:grab;user-select:none}.is-dragging .rotary-knob{cursor:grabbing;box-shadow:inset 0 1px 3px #68735b,0 1px 3px #0005}.rotary-knob:focus-visible{outline:3px solid var(--focus);outline-offset:5px}.rotary-knob[aria-disabled=true]{cursor:not-allowed;opacity:.6}.rotary-knob i{position:absolute;inset:5px;transform:rotate(var(--angle));border-radius:50%;pointer-events:none}.rotary-knob i:after{content:'';position:absolute;top:1px;left:21px;width:3px;height:10px;border-radius:1px;background:#334b37;box-shadow:1px 0 #fff9}.rotary-control input{width:92px;min-height:24px!important;height:24px;margin:0;accent-color:#365342!important}.dial-steps{display:flex;gap:5px}.dial-steps button{width:44px;min-height:44px;padding:0;background:transparent;border:1px solid #9b9f87;color:#23372f;border-radius:7px;font-size:20px;box-shadow:none}.dial-steps button:disabled{opacity:.45}.dial-steps button:focus-visible{outline:3px solid var(--focus);outline-offset:2px}@media(forced-colors:active){.rotary-knob{border:2px solid ButtonText;background:Canvas}.rotary-knob i:after{background:ButtonText}.knob-scale{outline:1px solid CanvasText}.dial-steps button{color:ButtonText;border-color:ButtonText}}@media(max-width:600px){.rotary-control input{min-height:30px!important}.rotary-title{font-size:8px}}
</style>




