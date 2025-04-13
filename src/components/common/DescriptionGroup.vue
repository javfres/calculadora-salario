<template>
    <div class="group">
        <div class="row" v-for="item of group.items" :key="item.id">

            <template v-if="item.isLine()">


                <hr v-if="(item as Line).isHr()" />
                <div v-else v-html="(item as Line).toHtml()"></div>


            </template>
            <template v-else>
                <DescriptionGroup :group="(item as Group)"></DescriptionGroup>
            </template>

        </div>
    </div>
</template>
  
  
<script setup lang="ts">

import { Group, Line } from '@/utils/description';

interface Props {
    group: Group
    isMain: boolean
}

const props = defineProps<Props>();

</script>

<style lang="scss" scoped>

.row {
    display: flex;
    flex-direction: row;
    margin-bottom: 2px;

    :deep(.euros), :deep(.percentage) {
        font-weight: bold;
        color: rgb(94, 40, 25);
    }

    hr {
        width: 100%;
    }
}


.row {
    .group {
        margin-left: 20px;
    }
}


</style>
