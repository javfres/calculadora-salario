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

    <Form></Form>

  </div>
</template>


<script lang="ts">

import { Options, Vue } from 'vue-class-component';
import Form from './Form.vue';

@Options({
  components: {
    Form
  }
})
export default class Calculator extends Vue {


}

</script>



<style scoped>

</style>
