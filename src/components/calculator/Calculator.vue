<template>
    <div class="calculator">

        <h1>Calculadora Salario Neto</h1>

        <p>
            Calculadora salario neto para el año {{ year }} y para CyL.
        </p>

        <p>
            Calcula el salario neto, la contribución a la seguridad social y el IRPF.
            También calcula la aportación de la empresa.
        </p>

        <p>
            Más información y código de la calculadora en:
            <a href="https://github.com/javfres/calculadora-salario">
                <font-awesome-icon icon="fa-brands fa-github" />
            </a>
        </p>

        <CuantoAlMes @al-mes="alMes"></CuantoAlMes>

        <Form :start="start" @newConfig="newConfig"></Form>
        <CalcResults v-if="config" :config="config"></CalcResults>

    </div>
</template>

<script setup lang="ts">

import Form from './Form.vue';
import {ConfigContribuyente, configs, situaciones} from '../../irpf/config/config';
import CalcResults from './CalcResults.vue';
import CuantoAlMes from './CuantoAlMes.vue'
import { Ref, ref } from 'vue';
import { PID } from '@/irpf/pid';
import IRPF from '../../irpf/irpf';
import { updateURL, getCCFromURL } from '@/irpf/config/cc2str';

export interface Props {
    year: number;
}

const props = defineProps<Props>();

const start = ref<ConfigContribuyente>({
    year: 2024,
    grupo_cotizacion: 1,
    situacion_id: situaciones[0].id,
    salarioA: 20000,
    salarioB: 0,
    edad: 30,
    hijos: 0,
    ahorro: 0,
})

const fromURL = getCCFromURL();
if(fromURL){
    start.value = fromURL;
}

const config: Ref<ConfigContribuyente|undefined> = ref()

function newConfig(c: ConfigContribuyente){
    config.value = c;
    updateURL(c);
}

function alMes(expected: number) {
    
    const pid = new PID((salarioA) => {

        const inp = {...config.value!, salarioA}
        const calc = new IRPF(configs[config.value!.year], inp);
        calc.calcular()

        return calc.a.neto_mes;

    }, {start: expected*12});

    const salarioA = Math.ceil(pid.run(expected));

    start.value = { ...config.value!,  salarioA} ;
}


</script>