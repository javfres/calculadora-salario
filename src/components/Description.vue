<template>
    <div class="descriptiontable">
        <div class="row" v-for="line of description!.lines" :key="line.id">
            <div v-html="line.toHtml()"></div>
        </div>
    </div>
</template>
  
  
<script setup lang="ts">

import { Description as Lines } from '@/irpf/description';

interface Props {
    description?: Lines
}

const props = defineProps<Props>();


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

.descriptiontable .row {
    display: flex;
    flex-direction: row;
}

.descriptiontable >>> .euros, .descriptiontable >>> .percentage {
    font-weight: bold;
    color: rgb(94, 40, 25);
}


</style>
