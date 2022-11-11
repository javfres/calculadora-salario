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

        <Form @newConfig="newConfig"></Form>
        <CalcResults v-if="config" :config="config"></CalcResults>

    </div>
</template>

<script setup lang="ts">

import Form from './Form.vue';
import {ConfigContribuyente} from '../irpf/config/config';
import CalcResults from './CalcResults.vue';
import { Ref, ref } from 'vue';

const config: Ref<ConfigContribuyente|undefined> = ref()

function newConfig(c: ConfigContribuyente){
    console.log("New config has been generated", c);
    config.value = c;
}

</script>