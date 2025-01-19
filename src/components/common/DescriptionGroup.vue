<template>
    <div class="group">
        <div class="row" v-for="item of group.items" :key="item.id">

            <template v-if="item.isLine()">
                <div v-html="(item as Line).toHtml()"></div>
            </template>
            <template v-else>
                <DescriptionGroup :group="item"></DescriptionGroup>
            </template>

        </div>
    </div>
</template>
  
  
<script setup lang="ts">

import { Group, Line } from '@/irpf/description';

interface Props {
    group: Group
}

defineProps<Props>();

</script>

<style lang="scss" scoped >

.group {

    .row {
        display: flex;
        flex-direction: row;
        margin-bottom: 2px;

        :deep(.euros), :deep(.percentage) {
            font-weight: bold;
            color: rgb(94, 40, 25);
        }

        .group {
            margin-left: 20px;
            margin-bottom: 10px;
        }

    }
}

</style>
