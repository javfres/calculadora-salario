<template>
    <div class="theform">
    
        Bruto: <input type="number" v-model="salary" step="1000">

        <template v-if="barItems">
            <Bar :items="barItems"></Bar>
            <SalaryTable :items="tableItems"></SalaryTable>
        </template>

    </div>
</template>


<script lang="ts">

import { Options, Vue } from 'vue-class-component';
import IRPF from '../irpf/irpf';
import {configs} from '../irpf/config';
import Bar from './Bar.vue';
import Button from './Button.vue';
import Checkbox from './Checkbox.vue';
import SalaryTable from './Table.vue';
import { BarItem, TableItem } from '@/types';


@Options({
  components: {
    Bar,
    Button,
    Checkbox,
    SalaryTable,
  },
  watch: {
    salary: function(){ this.onUpdateInput() }
  }
})
export default class Form extends Vue {

    calculated = false;
    salary = 30000

    calculator = new IRPF(configs[0]);

    barItems: BarItem[] = [];
     tableItems: TableItem[] = [];

    mounted(){

        this.$nextTick(function(){
            this.onUpdateInput();
        })

    }

    onUpdateInput(){

        this.calculator.calcular(this.salary)

        const empleado = [
            {name: "Seguridad Social", amount: this.calculator.seguridad_social},
            {name: "IRPF", amount: this.calculator.irpf},
            {name: "Neto", amount: this.calculator.neto},
        ]

        this.barItems = [
            {name: "Seguridad Social Empresa", amount: this.calculator.seguridad_social_empresa},
            {name: "Bruto para empleado", amount: this.calculator.bruto, subitems: empleado},
        ]

        this.tableItems = [
            {name: "Sueldo bruto", value: this.calculator.bruto.toFixed(2) + ' €'},
            {name: "Contribución Seguridad Social", value: this.calculator.seguridad_social.toFixed(2) + ' €'},
            {name: "Retención IRPF", value: this.calculator.irpf.toFixed(2) + ' €'},
            {name: "Porcentaje IRPF en nómina", value: this.calculator.irpf_porcentaje.toFixed(2) + '%'},
            {name: "Sueldo neto", value: this.calculator.neto.toFixed(2) + ' €'},
            {name: "Sueldo neto mensual", value: this.calculator.neto_mes.toFixed(2) + ' €'},
            
            {name: "Total empresa", value: this.calculator.total_empresa.toFixed(2) + ' €'},
            {name: "Total estado", value: this.calculator.dinero_estado.toFixed(2) + ' €'},
        ]

        this.calculated = true;

    }

}

</script>



<style scoped>

input {
    margin-bottom: 10px;
}

</style>
