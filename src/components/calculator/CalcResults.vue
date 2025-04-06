<template>
    <div class="results">
    
        <template v-if="barItems">
            <Bar :items="barItems"></Bar>
            <SalaryTable :table="tables.empleado"></SalaryTable>
            <SalaryTable :table="tables.empresa"></SalaryTable>
            <DescriptionTable :descriptions="descriptions"></DescriptionTable>
        </template>

    </div>
</template>


<script setup lang="ts">

import IRPF from '../../irpf/irpf';
import {ConfigContribuyente, configs, getSituacionFromID} from '../../irpf/config/config';
import Bar, {BarItem} from './Bar.vue';
import SalaryTable, { Table2 } from './Table.vue';
import DescriptionTable from '../common/DescriptionTable.vue';
import { computed, reactive, ref, Ref, toRef, watch } from 'vue';
import { Description } from '@/utils/description';


export interface Props {
    config: ConfigContribuyente;
}

const props = defineProps<Props>();

const descriptions: Ref<Description[]> = ref([]);

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

    const calculator = new IRPF(configs[config.year], config)

    calculator.calcular()

    const has_b = situacion.value.has_b;


    if(!has_b){

        const empleado = [
            {name: "Seguridad Social", amount: calculator.a.seguridad_social},
            {name: "IRPF", amount: calculator.a.irpf},
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
        t.row("Retención IRPF").eur().value(calculator.a.irpf)
        t.row("Porcentaje IRPF en nómina").per().value(calculator.a.irpf_porcentaje)
        t.row("Sueldo neto").eur().value(calculator.a.neto)
        t.row("Sueldo neto mensual").eur().value(calculator.a.neto_mes)
        t.row("Porcentaje del bruto en neto").per().value(100*calculator.a.neto/calculator.a.bruto)
        tables.empleado = t;

        t = new Table2()
        t.row("Total empresa").eur().value(calculator.a.total_empresa)
        t.row("Total estado").eur().value(calculator.a.dinero_estado)

        t.row("Porcentaje total estado").per().value(100*calculator.a.dinero_estado/calculator.a.total_empresa)
        t.row("Porcentaje total empleado").per().value(100*calculator.a.neto/calculator.a.total_empresa)

        tables.empresa = t;

    } else {

        const empleadoA = [
            {name: "SS A", amount: calculator.a.seguridad_social},
            {name: "IRPF A", amount: calculator.a.irpf},
            {name: "Neto A", amount: calculator.a.neto},
        ]

        const empleadoB = [
            {name: "SS B", amount: calculator.b.seguridad_social},
            {name: "IRPF B", amount: calculator.b.irpf},
            {name: "Neto B", amount: calculator.b.neto},
        ]

        barItems.value = [
            {name: "SS Empresa A", amount: calculator.a.seguridad_social_empresa},
            {name: "SS Empresa B", amount: calculator.b.seguridad_social_empresa},
            {name: "Bruto A", amount: calculator.a.bruto, subitems: empleadoA},
            {name: "Bruto B", amount: calculator.b.bruto, subitems: empleadoB},
        ]

        let t: Table2;

        t = new Table2()
        t.row("Sueldo bruto").eur().value(calculator.a.bruto).value(calculator.b.bruto)
        t.row("Contribución Seguridad Social").eur().value(calculator.a.seguridad_social).value(calculator.b.seguridad_social)
        t.row("Retención IRPF").eur().value(calculator.a.irpf).value(calculator.b.irpf)
        t.row("Porcentaje IRPF en nómina").per().value(calculator.a.irpf_porcentaje).value(calculator.b.irpf_porcentaje)
        t.row("Sueldo neto total").eur().value(calculator.a.neto+calculator.b.neto)
        t.row("Sueldo neto").eur().value(calculator.a.neto).value(calculator.b.neto)
        t.row("Sueldo neto mensual").eur().value(calculator.a.neto_mes).value(calculator.b.neto_mes)

        t.row("Total neto").eur().value(calculator.a.neto+calculator.b.neto)
        t.row("Total neto mensual").eur().value(calculator.a.neto_mes+calculator.b.neto_mes) 
        t.row("Porcentaje del bruto en neto").per().value(100*calculator.a.neto/calculator.a.bruto).value(100*calculator.b.neto/calculator.b.bruto)


        tables.empleado = t;

        t = new Table2()
        t.row("Total empresa").eur().value(calculator.a.total_empresa).value(calculator.b.total_empresa)
        t.row("Estado por A y B").eur().value(calculator.a.dinero_estado).value(calculator.b.dinero_estado)
        t.row("Total estado").eur().value(calculator.a.dinero_estado+calculator.b.dinero_estado)
        tables.empresa = t;


    }

    descriptions.value = [calculator.description];

}


</script>



<style scoped>



</style>
