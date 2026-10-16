<script setup lang="ts">
const props=withDefaults(defineProps<{
  label:string;icon?:string;variant?:'primary'|'secondary'|'quiet'|'danger';
  disabled?:boolean;busy?:boolean;outcome?:'idle'|'success'|'error';iconOnly?:boolean;
  type?:'button'|'submit'|'reset';
}>(),{variant:'secondary',disabled:false,busy:false,outcome:'idle',iconOnly:false,type:'button'});
const emit=defineEmits<{click:[event:MouseEvent]}>();
function activate(event:MouseEvent){
  if(props.disabled||props.busy){event.preventDefault();event.stopImmediatePropagation();return;}
  emit('click',event);
}
</script>
<template>
  <button :type="type" :class="['control',`control--${variant}`,{'control--icon':iconOnly}]" :disabled="disabled" :aria-disabled="busy||undefined" :aria-busy="busy||undefined" :data-outcome="outcome" :aria-label="iconOnly?label:undefined" :title="iconOnly?label:undefined" @click="activate">
    <span :key="`${label}-${icon}`" class="control-content"><ControlIcon v-if="icon" :name="icon" /><span :class="{'sr-only':iconOnly}">{{ label }}</span></span>
  </button>
</template>
