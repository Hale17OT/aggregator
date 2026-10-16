<script setup lang="ts" generic="T extends string | number">
import {SelectRoot,SelectTrigger,SelectValue,SelectIcon,SelectPortal,SelectContent,SelectViewport,SelectItem,SelectItemText,SelectItemIndicator,SelectScrollUpButton,SelectScrollDownButton} from 'reka-ui';
const props=defineProps<{modelValue:T;options:{value:T;label:string;disabled?:boolean}[];label:string;name?:string;disabled?:boolean;required?:boolean;invalid?:boolean;hint?:string}>();
const emit=defineEmits<{'update:modelValue':[value:T];change:[value:T]}>();
const id=useId(),mounted=ref(false),open=ref(false);onMounted(()=>{mounted.value=true;document.addEventListener("keydown",popupKey,true);});onBeforeUnmount(()=>document.removeEventListener("keydown",popupKey,true));
const encoded=computed(()=>String(props.modelValue)||'__empty');
const current=computed(()=>props.options.find(o=>o.value===props.modelValue));
function choose(value:unknown){const option=props.options.find(o=>(String(o.value)||'__empty')===String(value));if(!option||option.disabled)return;emit('update:modelValue',option.value);emit('change',option.value);}
const route=useRoute();watch(()=>route.fullPath,()=>open.value=false);
let tabTarget:HTMLElement|null=null;
function popupKey(event:KeyboardEvent){if(!open.value||event.key!=='Tab')return;event.preventDefault();event.stopPropagation();const trigger=document.getElementById(id);const items=Array.from(document.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(e=>e.getClientRects().length&&!e.closest('.field-popup')&&e.tabIndex>=0);const index=items.indexOf(trigger!);tabTarget=items[index+(event.shiftKey?-1:1)]||trigger;open.value=false;}
function closed(event:Event){if(tabTarget){event.preventDefault();const next=tabTarget;tabTarget=null;requestAnimationFrame(()=>next.focus());}}
</script>
<template>
  <div class="control-field">
    <label :id="`${id}-label`" :for="id">{{ label }}</label>
    <select v-if="!mounted" :id="id" class="field-input" :name="name" :value="modelValue" :disabled="disabled" :required="required" @change="choose(($event.target as HTMLSelectElement).value)"><option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option></select>
    <template v-else>
      <input v-if="name" type="hidden" :name="name" :value="modelValue">
      <SelectRoot v-model:open="open" :model-value="encoded" :disabled="disabled||options.length===0" @update:model-value="choose">
        <SelectTrigger :id="id" class="field-select" :aria-labelledby="`${id}-label`" :aria-describedby="hint?`${id}-hint`:undefined" :aria-invalid="invalid||undefined"><SelectValue>{{ current?.label||(options.length?'Selected value unavailable':'No choices available') }}</SelectValue><SelectIcon as-child><ControlChevron :open="open" /></SelectIcon></SelectTrigger>
        <SelectPortal><SelectContent class="field-popup" position="popper" :side-offset="6" :collision-padding="12" @escape-key-down.stop @keydown.capture="popupKey" @close-auto-focus="closed">
          <SelectScrollUpButton class="field-scroll" aria-label="Scroll choices up">⌃</SelectScrollUpButton>
          <SelectViewport class="field-viewport"><SelectItem v-for="option in options" :key="option.value" class="field-option" :data-option-value="option.value" :value="String(option.value)||'__empty'" :disabled="option.disabled"><SelectItemIndicator class="field-check" aria-hidden="true">✓</SelectItemIndicator><SelectItemText>{{ option.label }}</SelectItemText></SelectItem></SelectViewport>
          <SelectScrollDownButton class="field-scroll" aria-label="Scroll choices down">⌄</SelectScrollDownButton>
        </SelectContent></SelectPortal>
      </SelectRoot>
    </template>
    <small v-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</small>
  </div>
</template>


