
import Dinero from 'dinero.js'
import { Config } from './config';
import { Description } from './description';

function D(amount: number): Dinero.Dinero {
    return Dinero({amount: Math.floor(amount*100), precision: 2})
}


export default class CalculadoraSalario {

    config: Config;
    bruto = 0;
    seguridad_social = 0;
    irpf = 0;
    irpf_porcentaje = 0;
    neto = 0;
    neto_mes = 0;

    seguridad_social_empresa = 0;
    total_empresa = 0;

    dinero_estado = 0;

    description: Description = new Description();

    constructor(config: Config){
        this.config = config;
    }

    calcular(bruto:number) {

        // Create a new description object
        this.description = new Description();

        //
        // Bruto
        //
        const d_bruto = D(bruto);
        this.description.add().text("El sueldo bruto es de").euros(d_bruto);

        this.bruto = d_bruto.toRoundedUnit(2);

        
        //
        // Calculo seguridad social
        //

        // Base sobre la que se aplican los porcentajes
        const d_base_seguridad_social = D(
            Math.min(this.config.base_maxima * 12, bruto)
        );

        const line = this.description.add()
            .text("La base sobre la que se aplica el caculo de la cotización")
            .text("de la Seguridad Social es")
            .euros(d_base_seguridad_social)
            .dot();

        if(d_bruto.greaterThan(d_base_seguridad_social)){
            line.text("Esta es la base máxima de cotización para el grupo 1");
        }

        let d_seguridad_social = Dinero();
        let d_seguridad_social_empresa = Dinero();

        // Iterar sobre los tipos
        for(const tipo of this.config.tipos){
            if(!tipo.porcentaje) continue

            const d_empleado = d_base_seguridad_social.multiply(tipo.porcentaje/100)
            d_seguridad_social = d_seguridad_social.add(d_empleado)

            this.description.add()
                .text("El empleado debe aportar")
                .percentage(tipo.porcentaje)
                .text("en concepto de")
                .text(tipo.nombre, {quotes: true})
                .coma()
                .text("la cuantia es")
                .euros(d_empleado);
        }

        this.description.add()
            .text("En total, la aportación a la seguridad social por el empleado es")
            .euros(d_seguridad_social);

        // Iterar sobre los tipos
        for(const tipo of this.config.tipos){
            if(!tipo.porcentaje_empresa) continue

            const d_empresa = d_base_seguridad_social.multiply(tipo.porcentaje_empresa/100)
            d_seguridad_social_empresa = d_seguridad_social_empresa.add(d_empresa)

            this.description.add()
                .text("La empresa debe aportar")
                .percentage(tipo.porcentaje_empresa)
                .text("en concepto de")
                .text(tipo.nombre, {quotes: true})
                .coma()
                .text("la cuantia es")
                .euros(d_empresa);
        }

        this.description.add()
            .text("En total, la aportación a la seguridad social por la empresa es")
            .euros(d_seguridad_social_empresa);


        this.seguridad_social = d_seguridad_social.toRoundedUnit(2);
        this.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);

        //
        // Calculo IRPF
        //

        // Quitar el mínimo personal
        const d_minimo_personal = D(this.config.minimo_personal)
        let d_base_imponible = d_bruto;
        d_base_imponible = d_base_imponible.subtract(d_seguridad_social)
        d_base_imponible = d_base_imponible.subtract(d_minimo_personal)

        this.description.add()
            .text("La base imponible sobre la que se aplica el IRPF es")
            .euros(d_base_imponible)
            .dot()
            .text("Esta base es el bruto de")
            .euros(d_bruto)
            .text("menos la contribución a la seguridad social")
            .euros(d_seguridad_social)
            .text("y el mínimo personal")
            .euros(d_minimo_personal)
            .text("(soltero sin hijos)");

        this.description.add()
            .text("Ahora se calcula los tramos del IRPF");


        const d_irpf = this.calcularTramos(d_base_imponible);
        this.irpf = d_irpf.toRoundedUnit(2);

        this.description.add()
            .text("La retención total del IRPF es de")
            .euros(d_irpf);


        const d_neto = d_bruto.subtract(d_seguridad_social).subtract(d_irpf);
        this.neto = d_neto.toRoundedUnit(2);

        this.description.add()
            .text("El salario neto es por tanto de")
            .euros(d_neto);

        this.neto_mes = d_neto.divide(12).toRoundedUnit(2);

        this.irpf_porcentaje = 100 * d_irpf.toUnit() / d_bruto.toUnit()

        this.description.add()
            .text("Lo que corresponde a un porcentaje de IRPF en nómina de")
            .percentage(this.irpf_porcentaje);

        this.total_empresa = d_bruto.add(d_seguridad_social_empresa).toRoundedUnit(2);

        this.description.add()
            .text("La empresa tiene un coste total de")
            .euros(this.total_empresa);

        this.dinero_estado = d_seguridad_social.add(d_seguridad_social_empresa).add(d_irpf).toRoundedUnit(2);

        this.description.add()
            .text("El estado ingresa")
            .euros(d_neto)
            .text("en impuestos")

        this.print();
    }

    calcularTramos(cantidad: Dinero.Dinero): Dinero.Dinero {

        let retencionTotal = Dinero();
    
        for(const [i, tramo] of this.config.tramos.entries()) {
            const previo = i > 0 ? this.config.tramos[i-1].hasta : 0;
    
            const enTramo = Math.min(
                cantidad.toUnit() - previo,
                tramo.hasta-previo
            )
            if (enTramo <= 0) break;
            
            const retencion = D(enTramo * (tramo.porcentaje / 100));
            retencionTotal = retencionTotal.add(retencion)

            this.description.add()
                .text("En el tramo desde")
                .euros(previo)
                .text("a")
                .euros(tramo.hasta)
                .text("hay")
                .euros(enTramo)
                .text("para el salario bruto indicado")
                .dot()
                .text("Se retiene un")
                .percentage(tramo.porcentaje)
                .text("que corresponde a")
                .euros(retencion)
        }
    
        return retencionTotal;
    }


    print(){
        console.log("Bruto:", this.bruto);
        console.log("Seguridad social:", this.seguridad_social);
        console.log("IRPF:", this.irpf);
        console.log("IRPF porcentaje:", this.irpf_porcentaje.toFixed(2), "%");
        console.log("Neto:", this.neto);
        console.log("Neto mes:", this.neto_mes);
        console.log();
        console.log("Seguridad social (que paga empresa):", this.seguridad_social_empresa);
        console.log("Total coste empresa:", this.total_empresa);
        console.log("Total dinero para estado:", this.dinero_estado);
    }

}

