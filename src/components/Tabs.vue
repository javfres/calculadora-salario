<template>
    <div class="tabs">
        <div class="line"></div>
        <ul>
            <li v-for="item in items"
                :key="item.id"
                :class="{active: item.id === currentTab}"
                @click="currentTab = item.id; $emit('tab-change', item.id)"
            >
                {{item.name}}
            </li>
        </ul>
        <div class="line"></div>
    </div>
</template>
  
<script lang="ts">

export type TabItem = {
    id: string;
    name: string,
}

</script>
  
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<Props>();

const currentTab = ref(props.items[0].id);

interface Props {
    items: TabItem[];
}

</script>


<style lang="scss" scoped>

$height: 22px;
$padding-top: 10px;
$padding-bottom: 6px;

$line-color: #eee;

.tabs {
    display: flex;
    flex-direction: row;
    justify-content: left;
    width: 100%;
}

ul {
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 5;
    display: flex;
    flex-direction: row;
}

ul li {
    height: $height;
    color: grey;
    background: #fefefe;
    padding: $padding-top 24px $padding-bottom;
    position: relative;
    text-align: center;
    z-index: 1;
}

ul li::before, ul li::after {
    content: '';
    display: block;
    position: absolute;
    width: 70%;
    height: 100%;
    border-style: solid;
    border-color: $line-color;
    background-color: inherit;
    z-index: -1;
}

ul li::before {
    top: -2px; left: 0;
    border-width: 2px 0 2px 2px;
    border-radius: 8px 0 0 0;
    transform: skewX(-20deg);
}
ul li::after {
    top: -2px; right: 0;
    border-width: 2px 2px 2px 0;
    border-radius: 0 8px 0 0;
    transform: skewX(20deg);
}


ul li.active {
    color: orange;
    z-index: 10;
}
ul li.active::before,
ul li.active::after {
    background-color: #fff;
    border-bottom-color: #fff;
}
ul li:not([class='active']):hover {
    cursor: pointer;
}
ul li:not([class='active']):hover::before,
ul li:not([class='active']):hover::after {
    background-color: #efefef;
}

.line {
    &:first-child {
        flex-grow: 0.1;
    }

    border-color: $line-color;
    border-style: solid;
    border-width: 0px 0px 2px 0;
    flex-grow: 1;

   height: $height + $padding-top + $padding-bottom;
}

</style>
