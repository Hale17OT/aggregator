<script setup lang="ts">
const route=useRoute();await navigateTo({path:'/',query:{...route.query,topic:String(route.params.slug)}},{replace:true,redirectCode:302});
</script><template><div /></template>
