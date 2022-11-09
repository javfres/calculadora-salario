
import Dinero from 'dinero.js'
import { Config, ConfigContribuyente, situaciones } from './config/config';
import { Description } from './description';

function D(amount: number): Dinero.Dinero {
    return Dinero({amount: Math.floor(amount*100), precision: 2})
}


export default class CalculadoraSalario {

    config: Config;
    
    // A y B para declaración conjunta
    bruto_a = 0;
    bruto_b = 0;
    bruto_total = 0;

    seguridad_social_a = 0;
    seguridad_social_b = 0;

    irpf = 0;
    irpf_porcentaje = 0;
    neto = 0;

    neto_a = 0;
    neto_b = 0;

    neto_mes_a = 0;
    neto_mes_b = 0;

    seguridad_social_empresa_a = 0;
    seguridad_social_empresa_b = 0;

    total_empresa_a = 0;
    total_empresa_b = 0;

    dinero_estado = 0;

    description: Description = new Description();

    constructor(config: Config){
        this.config = config;
    }

    calcular(configContribuyente: ConfigContribuyente) {

        const bruto_a = configContribuyente.salarioA;
        const bruto_b = configContribuyente.salarioB;

        const has_b = situaciones.find(s => s.id === configContribuyente.situacion_id)!.has_b;

        // Create a new description object
        this.description = new Description();

        //
        // Bruto
        //
        const d_brutoA = D(bruto_a);
        const d_brutoB = D(bruto_b)
        const d_bruto = d_brutoA.add(d_brutoB);

        if(!has_b){
            this.description.add().text("El sueldo bruto es de").euros(d_bruto);
            this.bruto_a = d_bruto.toRoundedUnit(2);
            this.bruto_b = 0;
            this.bruto_total = d_bruto.toRoundedUnit(2);
        } else {
            this.description.add()
                .text("El sueldo bruto A es de").euros(d_brutoA).coma()
                .text("El sueldo bruto B es de").euros(d_brutoB).dot()
                .text("El sueldo bruto total es de").euros(d_bruto)
            this.bruto_a = d_brutoA.toRoundedUnit(2);
            this.bruto_b = d_brutoB.toRoundedUnit(2);
            this.bruto_total = d_bruto.toRoundedUnit(2);
        }

        
        //
        // Calculo seguridad social
        //
    

        let d_seguridad_social_ab = D(0);
        let d_seguridad_social_a = D(0);
        let d_seguridad_social_b = D(0);
        let d_seguridad_social_empresa_a = D(0);
        let d_seguridad_social_empresa_b = D(0);

        ["A", "B"].forEach(person => {

            const isA = person === "A";

            if(has_b) {
                this.description.add().text("Calculo para " + person).symbol(":");
            }

            if(!isA && !has_b) return;
            
            const bruto = isA ? bruto_a : bruto_b;

            // Base sobre la que se aplican los porcentajes
            const d_base_seguridad_social = D(
                Math.min(this.config.base_maxima() * 12, bruto)
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
            for(const tipo of this.config.tipos()){
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
            for(const tipo of this.config.tipos()){
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

            d_seguridad_social_ab = d_seguridad_social_ab.add(d_seguridad_social)

            if(isA){
                this.seguridad_social_a = d_seguridad_social.toRoundedUnit(2);
                this.seguridad_social_empresa_a = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_a = d_seguridad_social;
                d_seguridad_social_empresa_a = d_seguridad_social_empresa;
            } else {
                this.seguridad_social_b = d_seguridad_social.toRoundedUnit(2);
                this.seguridad_social_empresa_b = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_b = d_seguridad_social;
                d_seguridad_social_empresa_b = d_seguridad_social_empresa;
            }

        });

        

        //
        // Calculo IRPF
        //

        // Quitar el mínimo personal
        const reducción = this.config.describe_minimo_contribuyente(configContribuyente, this.description);
        const d_redución_irpf = D(reducción)
        let d_base_imponible = d_bruto;
        d_base_imponible = d_base_imponible.subtract(d_seguridad_social_ab)
        d_base_imponible = d_base_imponible.subtract(d_redución_irpf)
        if (d_base_imponible.isNegative()){
            d_base_imponible = D(0);
        }

        this.description.add()
            .text("La base imponible sobre la que se aplica el IRPF es")
            .euros(d_base_imponible)
            .dot()
            .text("Esta base es el bruto de")
            .euros(d_bruto)
            .text("menos la contribución a la seguridad social")
            .euros(d_seguridad_social_ab)
            .text("y la reducción correspondiente según la situación familiar")
            .euros(d_redución_irpf, {parenthesis: true})

        this.description.add()
            .text("Ahora se calcula los tramos del IRPF");

        const d_irpf = this.calcularTramos(d_base_imponible);
        this.irpf = d_irpf.toRoundedUnit(2);

        this.description.add()
            .text("La retención total del IRPF es de")
            .euros(d_irpf);


        const d_neto = d_bruto.subtract(d_seguridad_social_ab).subtract(d_irpf);
        this.neto = d_neto.toRoundedUnit(2);

        this.description.add()
            .text("El salario neto es por tanto de")
            .euros(d_neto);


        this.irpf_porcentaje = 100 * d_irpf.toUnit() / d_bruto.toUnit()

        this.description.add()
            .text("Lo que corresponde a un porcentaje de IRPF en nómina de")
            .percentage(this.irpf_porcentaje);

        if(!has_b){
            this.neto_mes_a = d_neto.divide(12).toRoundedUnit(2);
        } else {

            const d_neto_a = d_brutoA.subtract(d_seguridad_social_a).multiply(this.irpf_porcentaje/100);
            const d_neto_b = d_neto.subtract(d_neto_a);

            this.neto_a = d_neto_a.toRoundedUnit(2);
            this.neto_b = d_neto_a.toRoundedUnit(2);

            this.neto_mes_a = d_neto_a.divide(12).toRoundedUnit(2);
            this.neto_mes_b = d_neto_b.divide(12).toRoundedUnit(2);
        }


        


        this.total_empresa_a = d_brutoA.add(d_seguridad_social_empresa_a).toRoundedUnit(2);
        this.total_empresa_b = d_brutoB.add(d_seguridad_social_empresa_b).toRoundedUnit(2);

        if(!has_b){
            this.description.add()
                .text("La empresa tiene un coste total de")
                .euros(this.total_empresa_a);
        } else {
            this.description.add()
                .text("La empresa A tiene un coste total de")
                .euros(this.total_empresa_a)
                .text("La empresa B tiene un coste total de")
                .euros(this.total_empresa_b)
        }


        this.dinero_estado = d_seguridad_social_ab
            .add(d_seguridad_social_empresa_a).add(d_seguridad_social_empresa_b)
            .add(d_irpf).toRoundedUnit(2);

        this.description.add()
            .text("El estado ingresa")
            .euros(d_neto)
            .text("en impuestos");

    }

    calcularTramos(cantidad: Dinero.Dinero): Dinero.Dinero {

        let retencionTotal = Dinero();

        const tramos = this.config.tramos();
    
        for(const [i, tramo] of tramos.entries()) {
            const previo = i > 0 ? tramos[i-1].hasta : 0;
    
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

}

