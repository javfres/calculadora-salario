<template>
  <Tabs
    :items="[
      {id: 'calculator', name: 'Calculadora'},
      {id: 'flexible',   name: 'Retribución flexible'},
    ]"
    @tab-change="tab = $event"
  />
  <Calculator v-if="tab === 'calculator'" :year="year" />
  <Flexible v-if="tab === 'flexible'" :year="year"/>
</template>

<script setup lang="ts">

import { ref } from 'vue';

import Tabs from './components/Tabs.vue';
import Calculator from './components/calculator/Calculator.vue';
import Flexible from './components/flexible/Flexible.vue';

const tab = ref('flexible');

// This is the main year
const year = 2024;

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  display: flex;
  flex-direction: column;
}
</style>
