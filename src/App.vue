<template>
  <Tabs :items="[
    {id: 'calculator', name: 'Calculadora'},
    {id: 'flexible',   name: 'Retribución flexible'},
  ]"/>
  <Calculator/>
</template>

<script setup lang="ts">

import Tabs from './components/Tabs.vue';
import Calculator from './components/Calculator.vue';


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
