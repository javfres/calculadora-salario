<template>
    <div class="theform">
    
        Situación
        <select v-model="situacion_id">
            <option v-for="sit of situaciones" :key="sit.id" :value="sit.id">
                {{ sit.name }}
            </option>
        </select>
        <br>
        Bruto anual:
        <input type="number" v-model="salary" step="1000" min="0">
        <input type="number" v-model="salaryB" step="1000" min="0" v-if="situacion_id === 'matri-conj'">
        <br>
        Edad: <input type="number" v-model="edad" step="1" min="1"> <br>

        <template v-if="situacion?.has_hijos">
            Hijos: <input type="number" v-model="hijos" step="1" :min="situacion.min_hijos">
        </template>

        <template v-if="barItems">
            <Bar :items="barItems"></Bar>
            <SalaryTable :items="tableItems"></SalaryTable>
            <SalaryTable :items="tableItemsB"></SalaryTable>
            <Description :description="calculator.description"></Description>
        </template>

    </div>
</template>


<script lang="ts">

import { Options, Vue } from 'vue-class-component';
import IRPF from '../irpf/irpf';
import {configs, situaciones, situacion_id_t} from '../irpf/config/config';
import Bar from './Bar.vue';
import Button from './Button.vue';
import Checkbox from './Checkbox.vue';
import SalaryTable from './Table.vue';
import { BarItem, TableItem } from '@/types';
import Description from './Description.vue';


@Options({
  components: {
    Bar,
    Button,
    Checkbox,
    SalaryTable,
    Description,
  },
  watch: {    
    situacion_id: function(){ this.onUpdateSituacion() },
    salary: function(){ this.onUpdateInput() },
    salaryB: function(){ this.onUpdateInput() },
    hijos: function(){ this.onUpdateInput() },
    edad: function(){ this.onUpdateInput() },
  }
})
export default class Form extends Vue {

    situaciones = situaciones;
    situacion_id: situacion_id_t = situaciones[0].id;

    get situacion() {
        return this.situaciones.find(s => s.id === this.situacion_id)!;
    }

    calculated = false;
    salary = 30000
    salaryB = 0
    edad = 30
    hijos = 0

    calculator = new IRPF(configs[0]);

    barItems: BarItem[] = [];
    tableItems: TableItem[] = [];
    tableItemsB: TableItem[] = [];

    mounted(){

        this.$nextTick(function(){
            this.onUpdateInput();
        })

    }

    onUpdateSituacion(){

        if(!this.situacion.has_hijos) {
            this.hijos = 0;
        } else if (this.situacion.min_hijos > 0) {
            this.hijos = Math.max(this.hijos, this.situacion.min_hijos)
        }

        if(!this.situacion.has_b) {
            this.salaryB = 0;
        }
        
        this.onUpdateInput();
    }

    onUpdateInput(){

        this.calculator.calcular(this.salary, this.salaryB, {edad: this.edad, hijos: this.hijos, situacion_id: this.situacion_id})

        const has_b = this.situacion.has_b;


        if(!has_b){

            const empleado = [
                {name: "Seguridad Social", amount: this.calculator.seguridad_social_a},
                {name: "IRPF", amount: this.calculator.irpf},
                {name: "Neto", amount: this.calculator.neto},
            ]

            this.barItems = [
                {name: "Seguridad Social Empresa", amount: this.calculator.seguridad_social_empresa_a},
                {name: "Bruto para empleado", amount: this.calculator.bruto_a, subitems: empleado},
            ]

            this.tableItems = [
                {name: "Sueldo bruto", value: this.calculator.bruto_total.toFixed(2) + ' €'},
                {name: "Contribución Seguridad Social", value: this.calculator.seguridad_social_a.toFixed(2) + ' €'},
                {name: "Retención IRPF", value: this.calculator.irpf.toFixed(2) + ' €'},
                {name: "Porcentaje IRPF en nómina", value: this.calculator.irpf_porcentaje.toFixed(2) + '%'},
                {name: "Sueldo neto", value: this.calculator.neto.toFixed(2) + ' €'},
                {name: "Sueldo neto mensual", value: this.calculator.neto_mes_a.toFixed(2) + ' €'},
            ]

            this.tableItemsB = [
                {name: "Total empresa", value: this.calculator.total_empresa_a.toFixed(2) + ' €'},
                {name: "Total estado", value: this.calculator.dinero_estado.toFixed(2) + ' €'},
            ]


        } else {

            const empleado = [
                {name: "SS A", amount: this.calculator.seguridad_social_a},
                {name: "SS B", amount: this.calculator.seguridad_social_b},
                {name: "IRPF", amount: this.calculator.irpf},
                {name: "Neto", amount: this.calculator.neto},
            ]

            this.barItems = [
                {name: "SS Empresa A", amount: this.calculator.seguridad_social_empresa_a},
                {name: "SS Empresa B", amount: this.calculator.seguridad_social_empresa_b},
                {name: "Bruto conjunta", amount: this.calculator.bruto_total, subitems: empleado},
            ]

            this.tableItems = [
                {name: "Sueldo bruto A", value: this.calculator.bruto_a.toFixed(2) + ' €'},
                {name: "Contribución Seguridad Social A", value: this.calculator.seguridad_social_a.toFixed(2) + ' €'},

                {name: "Sueldo bruto B", value: this.calculator.bruto_b.toFixed(2) + ' €'},
                {name: "Contribución Seguridad Social B", value: this.calculator.seguridad_social_b.toFixed(2) + ' €'},


                {name: "Retención IRPF", value: this.calculator.irpf.toFixed(2) + ' €'},
                {name: "Porcentaje IRPF en nómina", value: this.calculator.irpf_porcentaje.toFixed(2) + '%'},

                {name: "Sueldo neto total", value: this.calculator.neto.toFixed(2) + ' €'},

                {name: "Sueldo neto A", value: this.calculator.neto_a.toFixed(2) + ' €'},
                {name: "Sueldo neto B", value: this.calculator.neto_b.toFixed(2) + ' €'},

                {name: "Sueldo neto mensual A", value: this.calculator.neto_mes_a.toFixed(2) + ' €'},
                {name: "Sueldo neto mensual B", value: this.calculator.neto_mes_b.toFixed(2) + ' €'},
            ]

            this.tableItemsB = [
                {name: "Total empresa A", value: this.calculator.total_empresa_a.toFixed(2) + ' €'},
                {name: "Total empresa B", value: this.calculator.total_empresa_b.toFixed(2) + ' €'},
                {name: "Total estado", value: this.calculator.dinero_estado.toFixed(2) + ' €'},
            ]


        }



        this.calculated = true;

    }

}

</script>



<style scoped>

input {
    margin-bottom: 10px;
}

</style>
