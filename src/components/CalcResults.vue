<template>
    <div class="results">
    
        <template v-if="barItems">
            <Bar :items="barItems"></Bar>
            <SalaryTable :table="tables.empleado"></SalaryTable>
            <SalaryTable :table="tables.empresa"></SalaryTable>
            <Description :description="calculator.description"></Description>
        </template>

    </div>
</template>


<script setup lang="ts">

import IRPF from '../irpf/irpf';
import {ConfigContribuyente, configs, getSituacionFromID} from '../irpf/config/config';
import Bar, {BarItem} from './Bar.vue';
import SalaryTable, { Table2 } from './Table.vue';
import Description from './Description.vue';
import { computed, reactive, ref, Ref, toRef, watch } from 'vue';


export interface Props {
    config: ConfigContribuyente;
}

const props = defineProps<Props>();

const calculator = new IRPF(configs[0])

const barItems: Ref<BarItem[]> = ref([]);

const tables = reactive({
    empleado: new Table2(),
    empresa: new Table2(),
})


const situacion = computed(() => getSituacionFromID(props.config.situacion_id))

watch(toRef(props, "config"), onUpdateConfig);

// First time
onUpdateConfig(props.config);

function onUpdateConfig(config: ConfigContribuyente){

    calculator.calcular(config)

    const has_b = situacion.value.has_b;


    if(!has_b){

        const empleado = [
            {name: "Seguridad Social", amount: calculator.a.seguridad_social},
            {name: "IRPF", amount: calculator.irpf},
            {name: "Neto", amount: calculator.a.neto},
        ]

        barItems.value = [
            {name: "Seguridad Social Empresa", amount: calculator.a.seguridad_social_empresa},
            {name: "Bruto para empleado", amount: calculator.a.bruto, subitems: empleado},
        ]

        let t: Table2;

        t = new Table2()
        t.row("Sueldo bruto").eur().value(calculator.a.bruto)
        t.row("Contribución Seguridad Social").eur().value(calculator.a.seguridad_social)
        t.row("Retención IRPF").eur().value(calculator.irpf)
        t.row("Porcentaje IRPF en nómina").per().value(calculator.irpf_porcentaje)
        t.row("Sueldo neto").eur().value(calculator.a.neto)
        t.row("Sueldo neto mensual").eur().value(calculator.a.neto_mes)
        tables.empleado = t;

        t = new Table2()
        t.row("Total empresa").eur().value(calculator.a.total_empresa)
        t.row("Total estado").eur().value(calculator.dinero_estado)
        tables.empresa = t;

    } else {

        const empleado = [
            {name: "SS A", amount: calculator.a.seguridad_social},
            {name: "SS B", amount: calculator.b.seguridad_social},
            {name: "IRPF", amount: calculator.irpf},
            {name: "Neto A", amount: calculator.a.neto},
            {name: "Neto B", amount: calculator.b.neto},
        ]

        barItems.value = [
            {name: "SS Empresa A", amount: calculator.a.seguridad_social_empresa},
            {name: "SS Empresa B", amount: calculator.b.seguridad_social_empresa},
            {name: "Bruto conjunto", amount: calculator.bruto_total, subitems: empleado},
        ]

        let t: Table2;

        t = new Table2()
        t.row("Sueldo bruto").eur().value(calculator.a.bruto).value(calculator.b.bruto)
        t.row("Contribución Seguridad Social").eur().value(calculator.a.seguridad_social).value(calculator.b.seguridad_social)
        t.row("Retención IRPF").eur().value(calculator.irpf)
        t.row("Porcentaje IRPF en nómina").per().value(calculator.irpf_porcentaje)
        t.row("Sueldo neto total").eur().value(calculator.neto_total)
        t.row("Sueldo neto").eur().value(calculator.a.neto).value(calculator.b.neto)
        t.row("Sueldo neto mensual").eur().value(calculator.a.neto_mes).value(calculator.b.neto_mes)
        tables.empleado = t;

        t = new Table2()
        t.row("Total empresa").eur().value(calculator.a.total_empresa).value(calculator.b.total_empresa)
        t.row("Total estado").eur().value(calculator.dinero_estado)
        tables.empresa = t;


    }


}


</script>



<style scoped>



</style>
