<template>
    <div class="results">
    
        <template v-if="barItems">
            <Bar :items="barItems"></Bar>
            <SalaryTable :items="tableItems"></SalaryTable>
            <SalaryTable :items="tableItemsB"></SalaryTable>
            <Description :description="calculator.description"></Description>
        </template>

    </div>
</template>


<script setup lang="ts">

import IRPF from '../irpf/irpf';
import {ConfigContribuyente, configs, getSituacionFromID} from '../irpf/config/config';
import Bar from './Bar.vue';
import SalaryTable from './Table.vue';
import { BarItem, TableItem } from '@/types';
import Description from './Description.vue';
import { computed, ref, Ref, toRef, watch } from 'vue';


export interface Props {
    config: ConfigContribuyente;
}

const props = defineProps<Props>();

const calculator = new IRPF(configs[0])

const barItems: Ref<BarItem[]> = ref([]);
const tableItems: Ref<TableItem[]> = ref([]);
const tableItemsB: Ref<TableItem[]> = ref([]);

const situacion = computed(() => getSituacionFromID(props.config.situacion_id))

watch(toRef(props, "config"), onUpdateConfig);

// First time
onUpdateConfig(props.config);

function onUpdateConfig(config: ConfigContribuyente){

    calculator.calcular(config)

    const has_b = situacion.value.has_b;


    if(!has_b){

        const empleado = [
            {name: "Seguridad Social", amount: calculator.seguridad_social_a},
            {name: "IRPF", amount: calculator.irpf},
            {name: "Neto", amount: calculator.neto},
        ]

        barItems.value = [
            {name: "Seguridad Social Empresa", amount: calculator.seguridad_social_empresa_a},
            {name: "Bruto para empleado", amount: calculator.bruto_a, subitems: empleado},
        ]

        tableItems.value = [
            {name: "Sueldo bruto", value: calculator.bruto_total.toFixed(2) + ' €'},
            {name: "Contribución Seguridad Social", value: calculator.seguridad_social_a.toFixed(2) + ' €'},
            {name: "Retención IRPF", value: calculator.irpf.toFixed(2) + ' €'},
            {name: "Porcentaje IRPF en nómina", value: calculator.irpf_porcentaje.toFixed(2) + '%'},
            {name: "Sueldo neto", value: calculator.neto.toFixed(2) + ' €'},
            {name: "Sueldo neto mensual", value: calculator.neto_mes_a.toFixed(2) + ' €'},
        ]

        tableItemsB.value = [
            {name: "Total empresa", value: calculator.total_empresa_a.toFixed(2) + ' €'},
            {name: "Total estado", value: calculator.dinero_estado.toFixed(2) + ' €'},
        ]


    } else {

        const empleado = [
            {name: "SS A", amount: calculator.seguridad_social_a},
            {name: "SS B", amount: calculator.seguridad_social_b},
            {name: "IRPF", amount: calculator.irpf},
            {name: "Neto", amount: calculator.neto},
        ]

        barItems.value = [
            {name: "SS Empresa A", amount: calculator.seguridad_social_empresa_a},
            {name: "SS Empresa B", amount: calculator.seguridad_social_empresa_b},
            {name: "Bruto conjunta", amount: calculator.bruto_total, subitems: empleado},
        ]

        tableItems.value = [
            {name: "Sueldo bruto A", value: calculator.bruto_a.toFixed(2) + ' €'},
            {name: "Contribución Seguridad Social A", value: calculator.seguridad_social_a.toFixed(2) + ' €'},

            {name: "Sueldo bruto B", value: calculator.bruto_b.toFixed(2) + ' €'},
            {name: "Contribución Seguridad Social B", value: calculator.seguridad_social_b.toFixed(2) + ' €'},


            {name: "Retención IRPF", value: calculator.irpf.toFixed(2) + ' €'},
            {name: "Porcentaje IRPF en nómina", value: calculator.irpf_porcentaje.toFixed(2) + '%'},

            {name: "Sueldo neto total", value: calculator.neto.toFixed(2) + ' €'},

            {name: "Sueldo neto A", value: calculator.neto_a.toFixed(2) + ' €'},
            {name: "Sueldo neto B", value: calculator.neto_b.toFixed(2) + ' €'},

            {name: "Sueldo neto mensual A", value: calculator.neto_mes_a.toFixed(2) + ' €'},
            {name: "Sueldo neto mensual B", value: calculator.neto_mes_b.toFixed(2) + ' €'},
        ]

        tableItemsB.value = [
            {name: "Total empresa A", value: calculator.total_empresa_a.toFixed(2) + ' €'},
            {name: "Total empresa B", value: calculator.total_empresa_b.toFixed(2) + ' €'},
            {name: "Total estado", value: calculator.dinero_estado.toFixed(2) + ' €'},
        ]

    }


}


</script>



<style scoped>



</style>
