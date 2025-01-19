<template>
    <div class="descriptiontable">
        <DescriptionGroup v-if="descriptions.length>0" :group="descriptions[0].root"></DescriptionGroup>
    </div>
</template>
  
  
<script setup lang="ts">

import DescriptionGroup from './DescriptionGroup.vue';

import { Description } from '@/irpf/description';

interface Props {
    descriptions: Description[];
}

defineProps<Props>();

</script>


<style scoped>

.descriptiontable {
    display: flex;
    flex-direction: column;
    background: rgb(255, 228, 219);
    margin-top: 10px;
    padding: 10px;
    gap: 5px
}

</style>
