
import Dinero from 'dinero.js'
import { configs as irpfConfigs, Config, ConfigContribuyente, situaciones } from '../irpf/config/config';
import { Description } from '../utils/description';
import { ConfigFlexibleBase } from './config/base';
import { ConfigFlexibleContribuyente, configs } from './config/config';
import CalculadoraSalario from '@/irpf/irpf';

function D(amount: number): Dinero.Dinero {
    return Dinero({amount: Math.floor(amount*100), precision: 2})
}

export class Resultado {
    ahorro_restaurante = 0;
    ahorro_transporte = 0;
    ahorro_guarderia = 0;
    ahorro_seguro = 0;
    ahorro_total = 0;

    porcentage_restaurante = 0;
    porcentage_transporte = 0;
    porcentage_guarderia = 0;
    porcentage_seguro = 0;
    porcentage_total = 0;
}

export default class CalculadoraFlexible {

    year: number;
    configIRPF: Config;
    configFlexible: ConfigFlexibleBase;
    configFlexibleContribuyente: ConfigFlexibleContribuyente;
    
    description: Description = new Description();

    constructor(configFlexibleContribuyente: ConfigFlexibleContribuyente, year: number) {
        this.year = year;
        this.configIRPF = irpfConfigs[year];
        this.configFlexible = configs[year];
        this.configFlexibleContribuyente = configFlexibleContribuyente;
    }

    configIRPFContribuyente(salario: number): ConfigContribuyente {
        return  {
            year: this.year,
            grupo_cotizacion: 1,
            salarioA: salario,
            salarioB: 0,
            situacion_id: "soltero",
            ahorro: 0,
        };
    }

    calcular() {

        const salario = this.configFlexibleContribuyente.salario;
        this.description.line().text("El salario bruto es de ").euros(salario)
        if (salario < this.configIRPF.salario_minimo_interprofesional()) {
            this.description.line().text("El salario es menor que el salario mínimo interprofesional de ").euros(this.configIRPF.salario_minimo_interprofesional())
            .text(", por lo que no se puede aplicar el ahorro")
            return;
        }

        function normalize(amount: number): number {
            return Math.max(amount || 0, 0);
        }

        let restaurante = normalize(this.configFlexibleContribuyente.restaurante);
        let transporte = normalize(this.configFlexibleContribuyente.transporte);
        const guarderia = normalize(this.configFlexibleContribuyente.guarderia);
        let seguro =  normalize(this.configFlexibleContribuyente.seguro);

        let extra_restaurante = 0;
        let extra_transporte = 0;
        let extra_seguro = 0;

        // Restaurante
        const max_restaurante = this.configFlexible.max_restaurante_dia() * this.configFlexible.dias_laborables();
        if (restaurante > 0){
            this.description.line().text("Has gastado ").euros(restaurante).text(" en restaurante")
            this.description.startGroup()

            this.description.line().text("El máximo permitido es de").euros(this.configFlexible.max_restaurante_dia())
                .text(" por día laborable, como hay ").number(this.configFlexible.dias_laborables())
                .text(" días laborables, el máximo permitido es de ").euros(max_restaurante)

            if (restaurante > max_restaurante) {
                extra_restaurante = restaurante - max_restaurante;
                restaurante = max_restaurante;
                this.description.line().text("Has gastado más de lo permitido en restaurante, se te aplicará el máximo permitido.")
                .text("El extra gastado es de ").euros(extra_restaurante)
 
            } else {
                this.description.line().text("Has gastado menos de lo permitido en restaurante")
            }
            this.description.endGroup()
        }

        // Transporte
        const max_transporte = this.configFlexible.max_transporte();
        if (transporte > 0){
            this.description.line().text("Has gastado ").euros(transporte).text(" en transporte")
            this.description.startGroup()

            this.description.line().text("El máximo permitido es de").euros(max_transporte)

            if (transporte > max_transporte) {
                extra_transporte = transporte - max_transporte;
                transporte = max_transporte;
                this.description.line().text("Has gastado más de lo permitido en transporte, se te aplicará el máximo permitido.")
                .text("El extra gastado es de ").euros(extra_transporte)
            } else {
                this.description.line().text("Has gastado menos de lo permitido en transporte")
            }
            this.description.endGroup()
        }

        // Guardería
        if (guarderia > 0){
            this.description.line().text("Has gastado ").euros(guarderia).text(" en guardería")
            this.description.startGroup()
            this.description.line().text("No hay límite en guardería")
            this.description.endGroup()
        }

        // Seguro
        const max_seguro = this.configFlexible.max_seguro();
        if (seguro > 0){
            this.description.line().text("Has gastado ").euros(seguro).text(" en seguro")
            this.description.startGroup()

            this.description.line().text("El máximo permitido es de").euros(max_seguro)

            if (seguro > max_seguro) {
                extra_seguro = seguro - max_seguro;
                seguro = max_seguro;
                this.description.line().text("Has gastado más de lo permitido en seguro, se te aplicará el máximo permitido.")
                .text("El extra gastado es de ").euros(extra_seguro)
            } else {
                this.description.line().text("Has gastado menos de lo permitido en seguro")
            }
            this.description.endGroup()
        }




        // Calcular el total gastado en extras
        const total_extra = extra_restaurante + extra_transporte + extra_seguro;
        const flexible = restaurante + transporte + guarderia + seguro;

        const max_percentage = this.configFlexible.max_percentage();
        const percentage = (flexible / salario);

        if(percentage > max_percentage) {
            this.description.line().text("Has gastado más de lo permitido en flexible, que es el ").percentage(max_percentage)
            .text(" de tu salario, no se puede calcular el ahorro")
            return;
        }
        if (flexible <= 0) {
            this.description.line().text("No se ha gastado nada en flexible, por lo que no se puede aplicar el ahorro")
            return;
        }

        this.description.line().text("Con unos gastos en flexible de ").euros(flexible)

       const salarioFlexible = salario - flexible;
       if (salarioFlexible < this.configIRPF.salario_minimo_interprofesional()) {
              this.description.line().text("El salario neto restando el flexible es de ").euros(salarioFlexible)
              .text(" que es menor que el salario mínimo interprofesional de ").euros(this.configIRPF.salario_minimo_interprofesional())
                .text(", por lo que no se puede aplicar el ahorro")
              return
       }


       const calc1 = new CalculadoraSalario(this.configIRPF, this.configIRPFContribuyente(salario));
       calc1.calcular();

       const neto1 = calc1.a.neto - flexible;

       const calc2 = new CalculadoraSalario(this.configIRPF, this.configIRPFContribuyente(salarioFlexible));
       calc2.calcular(); 

       const neto2 = calc2.a.neto;

       const diff = neto2 - neto1;

       const percentage_ahorro = (diff / flexible) * 100;

     
       this.description.line().text("El salario neto normal es de ").euros(neto1).text(", que incrementa hasta ").euros(neto2).text(" con el ahorro flexible")
       this.description.line().text("El ahorro total es de ").euros(diff).text(", lo que supone un ahorro del ").percentage(percentage_ahorro)

       const parts = [
            {name: "restaurante", amount: restaurante, extra: extra_restaurante},
            {name: "transporte", amount: transporte, extra: extra_transporte},
            {name: "guarderia", amount: guarderia, extra: 0},
            {name: "seguro", amount: seguro, extra: extra_seguro},
       ]

       this.description.startGroup()

       for(const {name, amount, extra} of parts) {
            if (amount <= 0) continue;   
            const ahorro = (amount * percentage_ahorro) / 100;
            const percentage_part = (ahorro / (amount + extra)) * 100;

            this.description.line().text("El ahorro en").text(name, {quotes: true}).text("es de ").euros(ahorro).text(" euros")
            .text("has gastado ").euros(amount+extra).text(", pero te ha costado ").euros(amount + extra - ahorro)
            .text(", lo que supone un ahorro del ").percentage(percentage_part)
        }

    }


   

}

