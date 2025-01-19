<template>
    <div class="flexible">

        <h1>Retribución flexible</h1>

        <p>
            Calculadora salario neto para el año {{ year }} y para CyL.
        </p>

        <Form :start="start" @newConfig="newConfig"></Form>

        <CalcResults v-if="config" :config="config"></CalcResults>
    </div>
</template>

<script setup lang="ts">

import Form from './Form.vue';

import { ConfigFlexibleContribuyente } from '@/flexible/config/config';
import { defineProps, Ref, ref } from 'vue';
import CalcResults from './CalcResults.vue';

export interface Props {
    year: number;
}

const props = defineProps<Props>();


const start = ref<ConfigFlexibleContribuyente>({
    salario: 20000,
    restaurante: 0,
    transporte: 0,
    guarderia: 0,
    seguro: 0
})

const config: Ref<ConfigFlexibleContribuyente|undefined> = ref()

function newConfig(c: ConfigFlexibleContribuyente){
    config.value = c;
}


</script>