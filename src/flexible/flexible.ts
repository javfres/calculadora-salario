
import Dinero from 'dinero.js'
import { configs as irpfConfigs, Config, ConfigContribuyente } from '../irpf/config/config';
import { Description } from '../utils/description';
import { ConfigFlexibleContribuyente } from './config/config';
import CalculadoraSalario from '@/irpf/irpf';
import Amount from '@/irpf/config/amount';

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
    configFlexibleContribuyente: ConfigFlexibleContribuyente;
    
    description: Description = new Description();

    constructor(configFlexibleContribuyente: ConfigFlexibleContribuyente, year: number) {
        this.year = year;
        this.configIRPF = irpfConfigs[year];
        this.configFlexibleContribuyente = configFlexibleContribuyente;
    }

    configIRPFContribuyente(salario: Amount, restaurante: Amount, transporte: Amount, guarderia: Amount, seguro: Amount): ConfigContribuyente {
        return  {
            year: this.year,
            grupo_cotizacion: 1,
            salarioA: salario,
            salarioB: Amount.fromNumber(0),
            situacion_id: "soltero",
            ahorro:  Amount.fromNumber(0),
            plan_pensiones: Amount.fromNumber(0),
            flexible_restaurante: restaurante,
            flexible_transporte: transporte,
            flexible_guarderia: guarderia,
            flexible_seguro: seguro,
            flexible_seguro_personas: 1,
        };
    }

    calcular() {

        const salario = this.configFlexibleContribuyente.salario;
        this.description.line().text("El salario bruto es de ").euros(salario.getValue())
        if (salario.getValue() < this.configIRPF.salario_minimo_interprofesional()) {
            this.description.line().text("El salario es menor que el salario mínimo interprofesional de ").euros(this.configIRPF.salario_minimo_interprofesional())
            .text(", por lo que no se puede aplicar el ahorro")
            return;
        }

        const restaurante = this.configFlexibleContribuyente.restaurante;
        const transporte = this.configFlexibleContribuyente.transporte;
        const guarderia = this.configFlexibleContribuyente.guarderia;
        const seguro =  this.configFlexibleContribuyente.seguro;

        const flexible = restaurante.getValue() + transporte.getValue() + guarderia.getValue() + seguro.getValue();

        if (flexible <= 0) {
            this.description.line().text("No se ha gastado nada en flexible, por lo que no se puede aplicar el ahorro")
            return;
        }

        this.description.line().text("Has dedicado ").euros(flexible).text(" en flexible")

        // Calcular el total gastado en extras        
        const max_percentage = this.configIRPF.flexible_max_percentage();
        const percentage = (flexible / salario.getValue());

        if(percentage > max_percentage) {
            this.description.line().text("Has gastado más de lo permitido en flexible, que es el ").percentage(max_percentage)
            .text(" de tu salario, no se puede calcular el ahorro")
            return;
        }


        const cfg1 = this.configIRPFContribuyente(salario, Amount.Zero(), Amount.Zero(), Amount.Zero(), Amount.Zero());
        const calc1 = new CalculadoraSalario(this.configIRPF, cfg1);
        calc1.calcular();
        const neto1 = calc1.a.neto - flexible;

 
        const cfg2 = this.configIRPFContribuyente(salario, restaurante, transporte, guarderia, seguro);
        const calc2 = new CalculadoraSalario(this.configIRPF, cfg2);
        calc2.calcular(); 
        const neto2 = calc2.a.neto;
        const diff = neto2 - neto1;
 

        this.description.line().text("Calculo de la declaración con un salario normal");
        this.description.startGroup()
        this.description.line().text("La aportación a la seguridad social es de ").euros(calc1.a.seguridad_social)
        this.description.line().text("El irpf es de ").euros(calc1.a.irpf)
        this.description.line().text("El salario neto es de ").euros(calc1.a.neto)
        .text("de los cuales pagarás").euros(flexible).text("por los servicios que no tienes en flexible")
        .text(" con lo que al final te quedan").euros(neto1)
        this.description.endGroup()


        this.description.line().text("Calculo de la declaración con el flexible");
        this.description.startGroup()
        this.description.line().text("La aportación a la seguridad social es de ").euros(calc2.a.seguridad_social)
        this.description.line().text("El irpf es de ").euros(calc2.a.irpf)
        this.description.line().text("El salario neto es de ").euros(calc2.a.neto)
        .text("y además te has llevado").euros(calc2.a.especie)
        .text("en especie, al final has ganado").euros(neto2+flexible)
        this.description.endGroup()


        this.description.line().text("El salario neto normal es de ").euros(calc1.a.neto)
        .text(", que se reduce a ").euros(neto1).text(" con lo que hubieras pagado de flexible sin desgravación")

        this.description.line().text("El salario neto (dinerado) usando el flexible es de ").euros(calc2.a.neto).
        text(", con lo que has ahorrado ").euros(diff)

        const percentage_original_price = ((flexible-diff) / flexible) * 100;
        this.description.line().text("Esto supone que vas a pagar un").percentage(percentage_original_price)
        .text(" respecto al precio original de ").euros(flexible);
    }


}

