<template>
    <div class="theform">

        <!--
        <div class="thelabel"></div>
        <div class="theinput">
           Modo avanzado  <Toogle></Toogle>
        </div> 
        -->
    
        <div class="thelabel">Año</div>
        <div class="theinput">
            <select v-model="state.year">
                <option v-for="y of years" :key="y" :value="y">
                    {{ y }}
                </option>
            </select>
        </div> 

        <div class="thelabel">Situación</div>
        <div class="theinput">
            <select v-model="state.situacion_id">
                <option v-for="sit of situaciones" :key="sit.id" :value="sit.id">
                    {{ sit.name }}
                </option>
            </select>
        </div> 

        <div class="thelabel">Bruto anual</div>
        <div class="theinput">
            <input type="number" v-model="state.salarioA" step="1000" min="0">
            <input type="number" v-model="state.salarioB" step="1000" min="0" v-if="['matri-conj', 'matri-ind'].includes(state.situacion_id)">
        </div>  

        <div class="thelabel">Ahorro</div>
        <div class="theinput">
            <input type="number" v-model="state.ahorro" step="1000" min="0">
        </div>  

        <div class="thelabel">Edad</div>
        <div class="theinput">
            <input type="number" v-model="state.edad" step="1" min="1">
        </div> 

        <template v-if="situacion?.has_hijos">
            <div class="thelabel">Hijos</div>
            <div class="theinput">
                <input type="number" v-model="state.hijos" step="1" :min="situacion.min_hijos">
            </div> 
        </template>

        <!-- Oculto porque sólo se usa la base máxima y esa es común a todos los grupos -->
        <div class="thelabel">Grupo de cotización</div>
        <div class="theinput">
            <select v-model="state.grupo_cotizacion">
                <option v-for="g of grupo_cotizacion_names" :key="g.grupo" :value="g.grupo">
                    Grupo {{ g.grupo }} - {{ g.nombre }}
                </option>
            </select>
        </div> 

    </div>
</template>


<script setup lang="ts">

import { computed, reactive } from '@vue/reactivity';
import { onMounted, watch, toRef } from 'vue';
import {ConfigContribuyente, getSituacionFromID, situaciones, situacion_id_t, years, grupo_cotizacion_names} from '../../irpf/config/config';

export interface Props {
    start: ConfigContribuyente;
}

const props = defineProps<Props>();



interface State {
    year: number,
    grupo_cotizacion: number,
    situacion_id: situacion_id_t,
    salarioA: number,
    salarioB: number,
    edad: number,
    hijos: number,
    ahorro: number,
}

const state = reactive<State>({
    year: props.start.year || years[0],
    grupo_cotizacion: props.start.grupo_cotizacion || 1,
    situacion_id: props.start.situacion_id,
    salarioA: props.start.salarioA,
    salarioB: props.start.salarioB,
    edad: props.start.edad || 30,
    hijos: props.start.hijos || 0,
    ahorro: props.start.ahorro || 0,
})


watch(toRef(props, "start"), start => {
    state.situacion_id = start.situacion_id;
    state.salarioA = start.salarioA;
    state.salarioB = start.salarioB;
    state.edad = start.edad || 30;
    state.hijos = start.hijos || 0;
    state.ahorro = start.ahorro || 0;
});



const situacion = computed(() => getSituacionFromID(state.situacion_id))

const emit = defineEmits(['newConfig']);


onMounted(() => {
    onUpdateInput();
})


function onUpdateSituacion(){

    if(!situacion.value.has_hijos) {
        state.hijos = 0;
    } else if (situacion.value.min_hijos > 0) {
        state.hijos = Math.max(state.hijos, situacion.value.min_hijos)
    }

    if(!situacion.value.has_b) {
        state.salarioB = 0;
    }

    onUpdateInput();
}

function onUpdateInput(){

    const config: ConfigContribuyente = {
        year: state.year,
        grupo_cotizacion: state.grupo_cotizacion,
        salarioA: state.salarioA,
        salarioB: state.salarioB,
        situacion_id: state.situacion_id,
        edad: state.edad,
        hijos: state.hijos,
        ahorro: state.ahorro,
    };

    emit('newConfig', config)
}

watch(() => state.situacion_id, onUpdateSituacion)
watch(() => state.salarioA, onUpdateInput)
watch(() => state.salarioB, onUpdateInput)
watch(() => state.edad, onUpdateInput)
watch(() => state.hijos, onUpdateInput)
watch(() => state.grupo_cotizacion, onUpdateInput)
watch(() => state.year, onUpdateInput)
watch(() => state.ahorro, onUpdateInput)

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
            //flex-basis: 0;
            width: 0;
        }
    }
}

</style>
