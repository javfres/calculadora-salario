<template>
    <div class="flexible">

        <h1>Retribución flexible</h1>

        <p>
            Calculadora de la retribución flexible
            para el año {{ year }} y para CyL.
            Esta calculadora compara los beneficios de la retribución flexible
            respecto a una retribución normal.
        </p>

        <p>
            La retribución flexible es otra forma de retribución que sí
            computa para el cálculo de la cotización a la seguridad social
            pero tiene ventajas fiscales respecto al IRPF.

            Cada categoría de la retribución flexible tiene un límite
            de aportación, dentro del límite no se tiene en cuenta para el IRPF.
            Si se supera, se calculará como retribución normal y habrá que pagar el IRPF
            aunque no se haya cobrado directamente en la nómina.
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
import Amount from '@/irpf/config/amount';

export interface Props {
    year: number;
}

const props = defineProps<Props>();

const start = ref<ConfigFlexibleContribuyente>({
    salario: Amount.fromNumber(30000),
    restaurante: Amount.Zero(),
    transporte: Amount.Zero(),
    guarderia: Amount.Zero(),
    seguro: Amount.Zero(),
})

const config: Ref<ConfigFlexibleContribuyente|undefined> = ref()

function newConfig(c: ConfigFlexibleContribuyente){
    config.value = c;
}


</script>