<template>
    <div class="bar">

        <div v-for="b in items?.filter(x => x.amount > 0)" :key="b.name" class="item" :style="{'flex-grow': Math.floor(b.amount)}">

            <div class="content">
                <div class="name">{{b.name}}</div>
                <div class="amount">{{b.amount}} €</div>
            </div>

           <Bar v-if="b.subitems" :items="b.subitems" :level="level+1"></Bar>

        </div>

    </div>
</template>
  
  
<script setup lang="ts">

import { BarItem } from '@/types';


interface Props {
    items: BarItem[];
    level?: number;
}

const props = withDefaults(defineProps<Props>(), {
    level: () => 1
})


</script>



<style scoped>

    .bar {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 4px;
    }

    .item {
        display: flex;
        flex-direction: column;
        flex-basis: 0;
        flex-shrink: 1;
        gap: 10px;
    }

    .content {
        background: lightblue;
        display: flex;
        flex-direction: column;
        align-items: end;
        padding: 6px;
    }

    .name {
        text-align: right;
        text-overflow:ellipsis;
        height: 20px;
        font-size: 8pt;
    }

    .amount {
        overflow:hidden;
        margin-top: 10px;
        height: 20px;
        font-size: 10pt;
        white-space: nowrap;
    }

    .content .content {
        background: lightcoral;
    }

</style>
