
import Dinero from 'dinero.js'
import { Config } from './config';

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


    constructor(config: Config){
        this.config = config;
    }

    calcular(bruto:number) {

        const d_bruto = D(bruto);

        this.bruto = d_bruto.toRoundedUnit(2);
        let d_base_imponible = d_bruto;

        
        //
        // Calculo seguridad social
        //

        // Base sobre la que se aplican los porcentajes
        const d_base_seguridad_social = D(
            Math.min(this.config.base_maxima * 12, bruto)
        );

        let d_seguridad_social = Dinero();
        let d_seguridad_social_empresa = Dinero();

        // Iterar sobre los tipos
        for(const tipo of this.config.tipos){
            const d_empleado = d_base_seguridad_social.multiply(tipo.porcentaje/100)
            d_seguridad_social = d_seguridad_social.add(d_empleado)

            const d_empresa = d_base_seguridad_social.multiply(tipo.porcentaje_empresa/100)
            d_seguridad_social_empresa = d_seguridad_social_empresa.add(d_empresa)
        }


        d_base_imponible = d_base_imponible.subtract(d_seguridad_social)

        this.seguridad_social = d_seguridad_social.toRoundedUnit(2);
        this.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);

        //
        // Calculo IRPF
        //

        // Quitar el mínimo personal
        d_base_imponible = d_base_imponible.subtract(D(this.config.minimo_personal))

        const d_irpf = this.calcularTramos(d_base_imponible);
        this.irpf = d_irpf.toRoundedUnit(2);

        const d_neto = d_bruto.subtract(d_seguridad_social).subtract(d_irpf);
        this.neto = d_neto.toRoundedUnit(2);

        this.neto_mes = d_neto.divide(12).toRoundedUnit(2);

        this.irpf_porcentaje = 100 * d_irpf.toUnit() / d_bruto.toUnit()

        this.total_empresa = d_bruto.add(d_seguridad_social_empresa).toRoundedUnit(2);

        this.dinero_estado = d_seguridad_social.add(d_seguridad_social_empresa).add(d_irpf).toRoundedUnit(2);


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

