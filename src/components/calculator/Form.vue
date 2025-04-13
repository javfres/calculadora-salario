<template>
    <div class="theform">

        <!--
        <div class="thelabel"></div>
        <div class="theinput">
           Modo avanzado  <Toogle v-model="avanzado"></Toogle> {{ avanzado }}
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
            <NumberInput type="number" v-model="state.salarioA" step="1000" min="0"></NumberInput>
            <NumberInput type="number" v-model="state.salarioB" step="1000" min="0" v-if="['matri-conj', 'matri-ind'].includes(state.situacion_id)"></NumberInput>
        </div>  

        <div class="thelabel">Ahorro</div>
        <div class="theinput">
            <div>
                <div class="sublabel">Rendimientos del ahorro</div>
                <NumberInput type="number" v-model="state.ahorro" step="1000" min="0"></NumberInput>
            </div>

            <div>
                <div class="sublabel">Aportaciones a planes de pensiones</div>
                <NumberInput type="number" v-model="state.plan_pensiones" step="1000" min="0"></NumberInput>
            </div>
        </div>

        <div class="thelabel">Flexibles</div>
        <div class="theinput">

            <div class="row">

                <div>
                    <div class="sublabel">Restaurante</div>
                    <NumberInput type="number" v-model="state.flexible_restaurante" step="100" min="0"></NumberInput>
                </div>  

                <div>
                    <div class="sublabel">Transporte</div>
                    <NumberInput type="number" v-model="state.flexible_transporte" step="100" min="0"></NumberInput>
                </div>

                </div>

            <div class="row">

                <div>
                    <div class="sublabel">Guardería</div>
                    <NumberInput type="number" v-model="state.flexible_guarderia" step="100" min="0"></NumberInput>
                </div>

                <div class="double">
                    <div>
                        <div class="sublabel">Seguro</div>
                        <NumberInput type="number" v-model="state.flexible_seguro" step="100" min="0"></NumberInput>
                    </div>
                    <div>
                        <div class="sublabel">Personas</div>
                        <input type="number" v-model="state.flexible_seguro_personas" step="1" min="1" max="10">
                    </div>
                </div>

            </div>  

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
        <div class="thelabel">Grupo de<br>cotización</div>
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
import { onMounted, watch, toRef, ref } from 'vue';
import {ConfigContribuyente, getSituacionFromID, situaciones, situacion_id_t, years, grupo_cotizacion_names} from '../../irpf/config/config';
import NumberInput from './NumberInput.vue';
import Amount from '@/irpf/config/amount';
import Toogle from '../Toogle.vue';

export interface Props {
    start: ConfigContribuyente;
}

const props = defineProps<Props>();

interface State {
    year: number,
    grupo_cotizacion: number,
    situacion_id: situacion_id_t,
    salarioA: Amount,
    salarioB: Amount,
    edad: number,
    hijos: number,
    ahorro: Amount,
    plan_pensiones: Amount,
    flexible_restaurante: Amount,
    flexible_transporte: Amount,
    flexible_guarderia: Amount,
    flexible_seguro: Amount,
    flexible_seguro_personas: number,
}

const state = reactive<State>({
    year: props.start.year || years[0],
    grupo_cotizacion: props.start.grupo_cotizacion || 1,
    situacion_id: props.start.situacion_id,
    salarioA: props.start.salarioA,
    salarioB: props.start.salarioB,
    edad: props.start.edad || 30,
    hijos: props.start.hijos || 0,
    ahorro: props.start.ahorro || Amount.Zero(),
    plan_pensiones: props.start.plan_pensiones || Amount.Zero(),
    flexible_restaurante: props.start.flexible_restaurante ||Amount.Zero(),
    flexible_transporte: props.start.flexible_transporte || Amount.Zero(),
    flexible_guarderia: props.start.flexible_guarderia || Amount.Zero(),
    flexible_seguro: props.start.flexible_seguro || Amount.Zero(),
    flexible_seguro_personas: props.start.flexible_seguro_personas || 1,
})


watch(toRef(props, "start"), start => {
    state.situacion_id = start.situacion_id;
    state.salarioA = start.salarioA;
    state.salarioB = start.salarioB;
    state.edad = start.edad || 30;
    state.hijos = start.hijos || 0;
    state.ahorro = start.ahorro || 0;
    state.plan_pensiones = start.plan_pensiones || 0;
    state.flexible_restaurante = start.flexible_restaurante || 0;
    state.flexible_transporte = start.flexible_transporte || 0;
    state.flexible_guarderia = start.flexible_guarderia || 0;
    state.flexible_seguro = start.flexible_seguro || 0;
});


const avanzado = ref(false);

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
        state.salarioB = Amount.Zero();
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
        plan_pensiones: state.plan_pensiones,
        flexible_restaurante: state.flexible_restaurante,
        flexible_transporte: state.flexible_transporte,
        flexible_guarderia: state.flexible_guarderia,
        flexible_seguro: state.flexible_seguro,
        flexible_seguro_personas: state.flexible_seguro_personas,
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
watch(() => state.plan_pensiones, onUpdateInput)
watch(() => state.flexible_restaurante, onUpdateInput)
watch(() => state.flexible_transporte, onUpdateInput)
watch(() => state.flexible_guarderia, onUpdateInput)
watch(() => state.flexible_seguro, onUpdateInput)
watch(() => state.flexible_seguro_personas, onUpdateInput)

</script>



<style lang="scss" scoped>

.theform {

    display: grid;
    grid-template-columns: auto 1fr;
    margin-bottom: 30px;

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

        .sublabel{
            height: 18px;
            font-size: 80%;
            overflow: hidden;
        }

        &>input, &>select {
            padding: 10px 10px;
            margin: 4px 0;
            box-sizing: border-box;
            flex: 1;
            width: 0;
        }

        &>div {
            margin: 4px 0;
            box-sizing: border-box;
            flex: 1;
            width: 0;
        }

        div.double {
            display: flex;
            flex: 1;

            div {
                &:first-child {
                    flex: 2.5;
                }

                display: flex;
                flex: 1;
                flex-direction: column;
     
                input, select {
                    padding: 10px 10px;
                    box-sizing: border-box;
                    flex: 1;
                    width: 100%;
                }
            }
        }
    }
}

</style>
