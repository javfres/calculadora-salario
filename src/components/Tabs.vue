<template>
    <div class="tabs">
        <div class="line"></div>
        <ul>
            <li v-for="item in items"
            :key="item.id"
            :class="{active: item.id === currentTab}">
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


<style scoped>

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
}

ul {
    z-index: 5;
}
ul li {
    color: grey;
    background: #fefefe;
    padding: 14px 24px 10px;
    margin: 0px -6px 0 10px;
    position: relative;
    float: left;
    text-align: center;
    z-index: 1;
}
ul li::before {
    content: '';
    display: block;
    position: absolute;
    top: 0; left: 0;
    width: 70%;
    height: 100%;
    border-style: solid;
    border-color: #eee;
    border-width: 2px 0 2px 2px;
    border-radius: 8px 0 0 0;
    -webkit-transform: skewX(-20deg);
       -moz-transform: skewX(-20deg);
         -o-transform: skewX(-20deg);
            transform: skewX(-20deg);
    background-color: inherit;
    z-index: -1;
}
ul li::after {
    content: '';
    display: block;
    position: absolute;
    top: 0; right: 0;
    width: 70%;
    height: 100%;
    border-style: solid;
    border-color: #eee;
    border-width: 2px 2px 2px 0;
    border-radius: 0 8px 0 0;
    -webkit-transform: skewX(20deg);
       -moz-transform: skewX(20deg);
         -o-transform: skewX(20deg);
            transform: skewX(20deg);
    background-color: inherit;
    z-index: -1;
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
ul li:not([class='active']):hover::before,
ul li:not([class='active']):hover::after {
    background-color: #efefef; 
}

.line {
    &:first-child {
        flex-grow: 0.1;
    }

    border-color: #eee;
    border-style: solid;
    border-width: 0px 0px 2px 0;
    flex-grow: 1;

    margin: 0px -6px 0 10px;

}

</style>
