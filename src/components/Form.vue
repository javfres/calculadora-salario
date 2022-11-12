<template>
    <div class="theform">
    
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
            <input type="number" v-model="state.salary_a" step="1000" min="0">
            <input type="number" v-model="state.salary_b" step="1000" min="0" v-if="state.situacion_id === 'matri-conj'">
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

    </div>
</template>


<script setup lang="ts">

import { computed, reactive } from '@vue/reactivity';
import { onMounted, watch } from 'vue';
import {ConfigContribuyente, getSituacionFromID, situaciones, situacion_id_t} from '../irpf/config/config';


interface State {
    situacion_id: situacion_id_t,
    salary_a: number,
    salary_b: number,
    edad: number,
    hijos: number,
}

const state = reactive<State>({
    situacion_id: situaciones[0].id,
    salary_a: 20000,
    salary_b: 0,
    edad: 30,
    hijos: 0,
})

const situacion = computed(() => getSituacionFromID(state.situacion_id))

const emit = defineEmits(['newConfig']);


onMounted(() => {
    onUpdateInput();
})


function onUpdateSituacion(){

    console.log("update situación")

    if(!situacion.value.has_hijos) {
        state.hijos = 0;
    } else if (situacion.value.min_hijos > 0) {
        state.hijos = Math.max(state.hijos, situacion.value.min_hijos)
    }

    if(!situacion.value.has_b) {
        state.salary_b = 0;
    }

    onUpdateInput();
}

function onUpdateInput(){

    console.log("update input")

    const config: ConfigContribuyente = {
        salarioA: state.salary_a,
        salarioB: state.salary_b,
        situacion_id: state.situacion_id,
        edad: state.edad,
        hijos: state.hijos,
    };

    console.log("emit newConfig", config);
    emit('newConfig', config)
}

watch(() => state.situacion_id, onUpdateSituacion)
watch(() => state.salary_a, onUpdateInput)
watch(() => state.salary_b, onUpdateInput)
watch(() => state.edad, onUpdateInput)
watch(() => state.hijos, onUpdateInput)



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
