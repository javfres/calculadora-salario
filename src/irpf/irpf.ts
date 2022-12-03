
import Dinero from 'dinero.js'
import { Config, ConfigContribuyente, situaciones } from './config/config';
import { Description } from './description';

function D(amount: number): Dinero.Dinero {
    return Dinero({amount: Math.floor(amount*100), precision: 2})
}

export class Resultado {
    id: "A" | "B" = "A" 
    bruto = 0;
    seguridad_social = 0;
    neto = 0;
    neto_mes = 0;
    seguridad_social_empresa = 0;  
    total_empresa = 0;
}

export default class CalculadoraSalario {

    config: Config;
    
    // A y B para declaración conjunta
    a = new Resultado();
    b = new Resultado();

    irpf = 0;
    irpf_porcentaje = 0;

    bruto_total = 0;
    neto_total = 0;

    dinero_estado = 0;

    description: Description = new Description();

    constructor(config: Config){
        this.config = config;
    }

    calcular(configContribuyente: ConfigContribuyente) {

        const bruto_a = configContribuyente.salarioA;
        const bruto_b = configContribuyente.salarioB;

        const has_b = situaciones.find(s => s.id === configContribuyente.situacion_id)?.has_b ?? false;

        // Create a new description object
        this.description = new Description();

        //
        // Bruto
        //
        const d_bruto_a = D(bruto_a);
        const d_bruto_b = D(bruto_b)
        const d_bruto_total = d_bruto_a.add(d_bruto_b);

        if(!has_b){
            this.description.line().text("El sueldo bruto es de").euros(d_bruto_total);
            this.a.bruto = d_bruto_total.toRoundedUnit(2);
            this.b.bruto = 0;
            this.bruto_total = d_bruto_total.toRoundedUnit(2);
        } else {
            this.description.line()
                .text("El sueldo bruto A es de").euros(d_bruto_a).coma()
                .text("el sueldo bruto B es de").euros(d_bruto_b).dot()
                .text("El sueldo bruto total es de").euros(d_bruto_total)
            this.a.bruto = d_bruto_a.toRoundedUnit(2);
            this.b.bruto = d_bruto_b.toRoundedUnit(2);
            this.bruto_total = d_bruto_total.toRoundedUnit(2);
        }

        //
        // Calculo seguridad social
        //
        let d_seguridad_social_ab = D(0);
        let d_seguridad_social_a = D(0);
        let d_seguridad_social_empresa_a = D(0);
        let d_seguridad_social_empresa_b = D(0);

        this.description.line().text("Calculo de la seguridad social:")
        this.description.startGroup();

        ["A", "B"].forEach(person => {
            const isA = person === "A";

            if(has_b) {
                this.description.line().text("Calculo para " + person).symbol(":");
                this.description.startGroup()
            }

            if(!isA && !has_b) return;
            
            const bruto = isA ? bruto_a : bruto_b;

            // Base sobre la que se aplican los porcentajes
            const d_base_seguridad_social = D(
                Math.min(this.config.base_maxima() * 12, bruto)
            );

            const line = this.description.line()
                .text("La base sobre la que se aplica el caculo de la cotización")
                .text("de la Seguridad Social es")
                .euros(d_base_seguridad_social)
                .dot();

            if(d_bruto_total.greaterThan(d_base_seguridad_social)){
                line.text("Esta es la base máxima de cotización para el grupo 1");
            }

            let d_seguridad_social = Dinero();
            let d_seguridad_social_empresa = Dinero();

            // Iterar sobre los tipos
            for(const tipo of this.config.tipos()){
                if(!tipo.porcentaje) continue

                const d_empleado = d_base_seguridad_social.multiply(tipo.porcentaje/100)
                d_seguridad_social = d_seguridad_social.add(d_empleado)

                this.description.line()
                    .text("El empleado debe aportar")
                    .percentage(tipo.porcentaje)
                    .text("en concepto de")
                    .text(tipo.nombre, {quotes: true})
                    .coma()
                    .text("la cuantia es")
                    .euros(d_empleado);
            }

            this.description.line()
                .text("En total, la aportación a la seguridad social por el empleado es")
                .euros(d_seguridad_social);

            // Iterar sobre los tipos
            for(const tipo of this.config.tipos()){
                if(!tipo.porcentaje_empresa) continue

                const d_empresa = d_base_seguridad_social.multiply(tipo.porcentaje_empresa/100)
                d_seguridad_social_empresa = d_seguridad_social_empresa.add(d_empresa)

                this.description.line()
                    .text("La empresa debe aportar")
                    .percentage(tipo.porcentaje_empresa)
                    .text("en concepto de")
                    .text(tipo.nombre, {quotes: true})
                    .coma()
                    .text("la cuantia es")
                    .euros(d_empresa);
            }

            this.description.line()
                .text("En total, la aportación a la seguridad social por la empresa es:")
                .euros(d_seguridad_social_empresa);

            d_seguridad_social_ab = d_seguridad_social_ab.add(d_seguridad_social)

            if(isA){
                this.a.seguridad_social = d_seguridad_social.toRoundedUnit(2);
                this.a.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_a = d_seguridad_social;
                d_seguridad_social_empresa_a = d_seguridad_social_empresa;
            } else {
                this.b.seguridad_social = d_seguridad_social.toRoundedUnit(2);
                this.b.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_empresa_b = d_seguridad_social_empresa;
            }

            if(has_b) {
                this.description.endGroup()
            }

        });

        this.description.endGroup();

        //
        // Calculo IRPF
        //

        this.description.line().text("Calculo del IRPF").symbol(":");
        this.description.startGroup();

        // Quitar el mínimo personal
        const reducción = this.config.describe_minimo_contribuyente(configContribuyente, this.description);
        const d_redución_irpf = D(reducción)
        let d_base_imponible = d_bruto_total;
        d_base_imponible = d_base_imponible.subtract(d_seguridad_social_ab)
        d_base_imponible = d_base_imponible.subtract(d_redución_irpf)
        if (d_base_imponible.isNegative()){
            d_base_imponible = D(0);
        }

        this.description.line()
            .text("La base imponible sobre la que se aplica el IRPF es")
            .euros(d_base_imponible)
            .dot()
            .text("Esta base es el bruto de")
            .euros(d_bruto_total)
            .text("menos la contribución a la seguridad social")
            .euros(d_seguridad_social_ab)
            .text("y la reducción correspondiente según la situación familiar")
            .euros(d_redución_irpf, {parenthesis: true})

        this.description.line()
            .text("Ahora se calcula los tramos del IRPF").symbol(":");
        this.description.startGroup()

        const d_irpf = this.calcularTramos(d_base_imponible);
        this.irpf = d_irpf.toRoundedUnit(2);

        this.description.line()
            .text("La retención total del IRPF es de")
            .euros(d_irpf);
        this.description.endGroup()


        const d_neto_total = d_bruto_total.subtract(d_seguridad_social_ab).subtract(d_irpf);
        this.neto_total = d_neto_total.toRoundedUnit(2);
        this.a.neto = d_neto_total.toRoundedUnit(2);

        this.description.line()
            .text("El salario neto es por tanto de")
            .euros(d_neto_total);


        // El porcentaje de irpf es sobre el bruto 
        this.irpf_porcentaje = 100 * d_irpf.toUnit() / d_bruto_total.toUnit()

        this.description.line()
            .text("Lo que corresponde a un porcentaje de IRPF en nómina de")
            .percentage(this.irpf_porcentaje);

        this.description.endGroup();


        //
        // Neto
        //

        this.description.line().text("Calculo del sueldo neto").symbol(":");
        this.description.startGroup();


        if(!has_b){
            this.a.neto_mes = d_neto_total.divide(12).toRoundedUnit(2);

            this.description.line()
                .text("El sueldo neto mensual es de")
                .euros(this.a.neto_mes)

        } else {

            const d_neto_a = (d_bruto_a.subtract(d_seguridad_social_a)).multiply((1-this.irpf_porcentaje/100));
            const d_neto_b = d_neto_total.subtract(d_neto_a);

            this.a.neto = d_neto_a.toRoundedUnit(2);
            this.b.neto = d_neto_b.toRoundedUnit(2);

            this.description.line()
                .text("El sueldo neto es de")
                .euros(this.a.neto)
                .text("y")
                .euros(this.b.neto)

            this.a.neto_mes = d_neto_a.divide(12).toRoundedUnit(2);
            this.b.neto_mes = d_neto_b.divide(12).toRoundedUnit(2);

            this.description.line()
            .text("El sueldo neto mensual es de")
            .euros(this.a.neto_mes)
            .text("y")
            .euros(this.b.neto_mes)
        }

        this.description.endGroup();
        
        //
        // Total empresa
        //

        this.a.total_empresa = d_bruto_a.add(d_seguridad_social_empresa_a).toRoundedUnit(2);
        this.b.total_empresa = d_bruto_b.add(d_seguridad_social_empresa_b).toRoundedUnit(2);

        if(!has_b){
            this.description.line()
                .text("La empresa tiene un coste total de")
                .euros(this.a.total_empresa);
        } else {
            this.description.line()
                .text("La empresa A tiene un coste total de")
                .euros(this.a.total_empresa)
                .coma()
                .text("la empresa B tiene un coste total de")
                .euros(this.b.total_empresa)
        }

        //
        // Total estado
        //

        const d_estado = d_seguridad_social_ab
            .add(d_seguridad_social_empresa_a)
            .add(d_seguridad_social_empresa_b);

        this.dinero_estado = d_estado.add(d_irpf).toRoundedUnit(2);

        this.description.line()
            .text("El estado ingresa")
            .euros(d_estado)
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

            this.description.line()
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

