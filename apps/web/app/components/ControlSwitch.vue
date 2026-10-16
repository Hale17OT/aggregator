<script setup lang="ts">
defineProps<{modelValue:boolean;label:string;disabled?:boolean;hint?:string}>();const emit=defineEmits<{'update:modelValue':[value:boolean]}>();const id=useId();
</script>
<template><div class="control-field"><label class="field-switch" :for="id"><input :id="id" type="checkbox" role="switch" :checked="modelValue" :disabled="disabled" :aria-describedby="hint?`${id}-hint`:undefined" @change="emit('update:modelValue',($event.target as HTMLInputElement).checked)"><span class="switch-track" aria-hidden="true"></span><span>{{ label }}</span></label><small v-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</small></div></template>
