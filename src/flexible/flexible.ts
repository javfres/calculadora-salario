
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

        let restaurante = this.configFlexibleContribuyente.restaurante || 0;
        const transporte = this.configFlexibleContribuyente.transporte || 0;
        const guarderia = this.configFlexibleContribuyente.guarderia || 0;
        const seguro = this.configFlexibleContribuyente.seguro || 0;

        let extra = 0;

        const max_restaurante = this.configFlexible.max_restaurante_dia() * this.configFlexible.dias_laborables();
        if (restaurante > max_restaurante) {
            this.description.line().text("Has gastado más de lo permitido en restaurante, se te aplicará el máximo permitido")
            restaurante = max_restaurante;
            extra += restaurante - max_restaurante;
        }


        const flexible = restaurante + transporte + guarderia + seguro;

        this.description.line().text("El salario bruto es de ").euros(salario).text(", con unos gastos en flexible de ").euros(flexible)

        if (flexible <= 0) {
            this.description.line().text("No se ha gastado nada en flexible, por lo que no se puede aplicar el ahorro")
            return;
        }


       const salarioFlexible = salario - flexible;


       const calc1 = new CalculadoraSalario(this.configIRPF, this.configIRPFContribuyente(salario));
       calc1.calcular();

       const neto1 = calc1.a.neto - flexible;

       const calc2 = new CalculadoraSalario(this.configIRPF, this.configIRPFContribuyente(salarioFlexible));
       calc2.calcular(); 

       const neto2 = calc2.a.neto;

       const diff = neto2 - neto1;

       const percentage = (diff / flexible) * 100;

     
       this.description.line().text("El salario neto normal es de ").euros(neto1).text(", que incrementa hasta ").euros(neto2).text(" con el ahorro flexible")
       this.description.line().text("El ahorro total es de ").euros(diff).text(", lo que supone un ahorro del ").percentage(percentage)

       const parts = [
            {name: "restaurante", amount: this.configFlexibleContribuyente.restaurante},
            {name: "transporte", amount: this.configFlexibleContribuyente.transporte},
            {name: "guarderia", amount: this.configFlexibleContribuyente.guarderia},
            {name: "seguro", amount: this.configFlexibleContribuyente.seguro},
       ]

       this.description.startGroup()

       for(const {name, amount} of parts) {
            if (amount <= 0) continue;   
            const ahorro = (amount * percentage) / 100;
            this.description.line().text("El ahorro en").text(name, {quotes: true}).text("es de ").euros(ahorro).text(" euros")
            .text("has gastado ").euros(amount).text(", pero te ha costado ").euros(amount - ahorro)
        }

    }


   

}

