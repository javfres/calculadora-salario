<template>
    <div class="theform">

        <div class="thelabel">Bruto anual</div>
        <div class="theinput">
            <input type="number" v-model="state.salario" step="1000" min="0">
        </div>  

        <div class="thelabel">restaurante</div>
        <div class="theinput">
            <input type="number" v-model="state.restaurante" step="10" min="0">
        </div>  

        <div class="thelabel">transporte</div>
        <div class="theinput">
            <input type="number" v-model="state.transporte" step="10" min="0">
        </div> 

        <div class="thelabel">guarderia</div>
        <div class="theinput">
            <input type="number" v-model="state.guarderia" step="10" min="0">
        </div> 

        <div class="thelabel">seguro</div>
        <div class="theinput">
            <input type="number" v-model="state.seguro" step="10" min="0">
        </div> 

    </div>
</template>


<script setup lang="ts">

import { computed, reactive } from '@vue/reactivity';
import { onMounted, watch, toRef } from 'vue';
import {ConfigContribuyente, getSituacionFromID, situaciones, situacion_id_t, years, grupo_cotizacion_names} from '../../irpf/config/config';
import { ConfigFlexibleContribuyente } from '@/flexible/config/config';

export interface Props {
    start: ConfigFlexibleContribuyente;
}

const props = defineProps<Props>();


interface State {
    salario: number;
    restaurante: number;
    transporte: number;
    guarderia: number;
    seguro: number;
}

const state = reactive<State>({
    salario: props.start.salario,
    restaurante: props.start.restaurante,
    transporte: props.start.transporte,
    guarderia: props.start.guarderia,
    seguro: props.start.seguro,
})


watch(toRef(props, "start"), start => {
    state.salario = start.salario;
    state.restaurante = start.restaurante;
    state.transporte = start.transporte;
    state.guarderia = start.guarderia;
    state.seguro = start.seguro;
});


const emit = defineEmits(['newConfig']);


onMounted(() => {
    onUpdateInput();
})


function onUpdateInput(){

    const config: ConfigFlexibleContribuyente = {
        salario: state.salario,
        restaurante: state.restaurante,
        transporte: state.transporte,
        guarderia: state.guarderia,
        seguro: state.seguro,
    };

    emit('newConfig', config)
}

watch(() => state.salario, onUpdateInput)
watch(() => state.restaurante, onUpdateInput)
watch(() => state.transporte, onUpdateInput)
watch(() => state.guarderia, onUpdateInput)
watch(() => state.seguro, onUpdateInput)

</script>



<style lang="scss" scoped>

.theform {

    display: grid;
    grid-template-columns: auto 1fr;
    margin-bottom: 30px;

    //background-color: rgb(232, 232, 232);
    padding: 2px;

    .thelabel {
        grid-column-start: 1;
        grid-column-end: 2;
        margin-top: auto;
        margin-bottom: auto;
        margin-right: 16px;
        text-align: right;
    }

    .theinput {
        grid-column-start: 2;
        grid-column-end: 3;
        display: flex;
        gap: 8px;

        input, select {
            padding: 10px 10px;
            margin: 4px 0;
            box-sizing: border-box;
            flex: 1;
            width: 0;
        }
    }
}

</style>
