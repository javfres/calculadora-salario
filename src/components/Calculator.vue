<template>
    <div class="calculator">

        <h1>Calculadora Salario Neto</h1>

        <p>
            Calculadora salario neto para el año 2022.
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

        <Form @newConfig="newConfig"></Form>
        <CalcResults v-if="config" :config="config"></CalcResults>

    </div>
</template>

<script setup lang="ts">

import Form from './Form.vue';
import {ConfigContribuyente, configs} from '../irpf/config/config';
import CalcResults from './CalcResults.vue';
import CuantoAlMes from './CuantoAlMes.vue'
import { Ref, ref } from 'vue';
import { PID } from '@/irpf/pid';
import IRPF from '../irpf/irpf';

const config: Ref<ConfigContribuyente|undefined> = ref()

function newConfig(c: ConfigContribuyente){
    console.log("New config has been generated", c);
    config.value = c;
}


function alMes(expected: number) {
    

    console.log("expected", expected);
    console.log(config.value);


    const pid = new PID((salarioA) => {

        const calc = new IRPF(configs[0]);
        const inp = {...config.value!, salarioA}
        calc.calcular(inp)

        return calc.a.neto_mes;

    }, {start: expected*12});

    const salarioA = pid.run(expected);

    config.value = { ...config.value!,  salarioA} ;

}


</script>