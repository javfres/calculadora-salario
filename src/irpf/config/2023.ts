import { Description } from "../description";
import { Config, ConfigContribuyente, Tipo, Tramo } from "./base";

const grupos_contizacion = [
    {
        grupo: 1,
        base_minima: 1759.5,
        base_maxima: 4495.50
    },
    {
        grupo: 2,
        base_minima: 1459.2,
        base_maxima: 4495.50
    },
    {
        grupo: 3,
        base_minima: 1269.3,
        base_maxima: 4495.50
    },
    {
        grupo: 4,
        base_minima: 1260,
        base_maxima: 4495.50
    },
    {
        grupo: 5,
        base_minima: 1260,
        base_maxima: 4495.50
    },
    {
        grupo: 6,
        base_minima: 1260,
        base_maxima: 4495.50
    },
    {
        grupo: 7,
        base_minima: 1260,
        base_maxima: 4495.50
    },
];


export default class Config2023 implements Config {

    year(): number {
        return 2023;
    }

    salario_minimo_interprofesional(): number {
        return 15876;
    }

    //
    // https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537?changeLanguage=es
    //

    base_minima(grupo_cotizacion: number): number {
       const g = grupos_contizacion.find(g => g.grupo === grupo_cotizacion)
        if (g) {
            return g.base_minima;
        }
        return 0;
    }

    base_maxima(grupo_cotizacion: number): number {
        const g = grupos_contizacion.find(g => g.grupo === grupo_cotizacion)
        if (g) {
            return g.base_maxima;
        }
        return 0;
    }

    tipos(): Tipo[] {
        return [
            {
                nombre: "Contingencias comunes",
                porcentaje: 4.7,
                porcentaje_empresa: 23.60,
            },
            {
                nombre: "Desempleo",
                porcentaje: 1.55,
                porcentaje_empresa: 5.50,
            },
            {
                nombre: "Formación profesional",
                porcentaje: 0.1,
                porcentaje_empresa: 0.6,
            },
            {
                nombre: "Fondo de Garantía Salarial",
                porcentaje: 0,
                porcentaje_empresa: 0.2,
            },
        ];
    }

    //
    // https://tributos.jcyl.es/web/es/informacion-tributaria/informacion-basica-deducciones-aplicables.html
    //

    minimo_contribuyente(config: ConfigContribuyente): number {
        return this.describe_minimo_contribuyente(config, new Description());
    }

    describe_minimo_contribuyente(config: ConfigContribuyente, description: Description): number {
        
        // https://sede.agenciatributaria.gob.es/Sede/irpf/tengo-que-presentar-declaracion/declaracion-individual-conjunta/caracteristicas-tributacion-conjunta.html#:~:text=2.150%20%E2%82%AC%20anuales%20para%20unidad,con%20%C3%A9l%20o%20con%20ella.
        const matrimonio = 3400;
        const monoparental = 2150;

        let minimo = 0;

        if(config.edad){
            if(config.edad >= 75) {
                minimo = 6950;
                description.line().text("Al tener más de 75 años, corresponde una reducción de").euros(minimo);
            } else if(config.edad >= 65) {
                minimo = 6700;
                description.line().text("Al tener más de 75 años, corresponde una reducción de").euros(minimo);
            } else {
                minimo = 5550;
                description.line().text(`Al tener ${ config.edad } años, corresponde el mínimo personal, una reducción de`).euros(minimo);
            }
        } else {
            minimo = 5550;
            description.line().text(`El mínimo personal es una reducción de`).euros(minimo);
        }

        const reducciónHijoN = (num: number) =>{
            switch(num){
                case 1: return 2400;
                case 2: return 2700;
                case 3: return 4000;
                default: return 4500;
            }
        }

        if (config.situacion_id === 'matri-conj') {
            description.line()
                .text("Al realizar la declaración conjunta, hay una reducción adicional de:")
                .euros(matrimonio);
            minimo += matrimonio;
        }


        if(!config.hijos) return minimo;

        let reducciónHijos = 0;

        for(let i=1; i<=config.hijos; i++){
            const reducción = reducciónHijoN(i);
            description.line()
                .text(`Por el hijo #${i} corresponde una reducción de`)
                .euros(reducción);
            reducciónHijos += reducción;
        }

        switch(config.situacion_id){

            case "matri-ind":
                minimo += reducciónHijos/2;

                description.line()
                    .text("La reducción total por hijos es de")
                    .euros(reducciónHijos)
                    .dot()
                    .text("Pero al tener pareja cada miembro se beneficia de la mitad de la reducción:")
                    .euros(reducciónHijos/2, {parenthesis: true})
                    .text("que sumado al mínimo personal da un total de")
                    .euros(minimo)

                break;

            case "matri-conj":
                minimo += reducciónHijos;

                description.line()
                    .text("La reducción total por hijos es de")
                    .euros(reducciónHijos)
                    .dot()
                    .text("que sumado al mínimo personal y a la reducción por declaración conjunta da un total de")
                    .euros(minimo)

                break;

            case "monoparental":
                minimo += reducciónHijos;
                minimo += monoparental;

                description.line()
                    .text("La reducción total por hijos es de")
                    .euros(reducciónHijos)
                    .dot()
                    .text("Al tratarse de una familia monoparental, hay una reducción adicional de:")
                    .euros(monoparental)
                    .text("que sumado al mínimo personal da un total de")
                    .euros(minimo)

                break
        }

        return minimo;
    }

    escala_gravamen_estatal(): Tramo[] {
        //Base liquidable hasta euros	Cuota íntegra euros	Resto base liquidable hasta euros	Tipo aplicable Porcentaje
        //Escala aplicable con independencia de su lugar de residencia
        //0,00	0,00	12.450,00	9,50
        //12.450,00	1.182,75	7.750,00	12,00
        //20.200,00	2.112,75	15.000,00	15,00
        //35.200,00	4.362,75	24.800,00	18,50
        //60.000,00	8.950,75	240.000	22,50
        //300.000,00	62.950,75	En adelante	24,50

        return [
            {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9.50},
            {base_liquidable_hasta: 12450, cuota_integra: 1182.75, porcentaje_resto: 12},
            {base_liquidable_hasta: 20200, cuota_integra: 2112.75, porcentaje_resto: 15},
            {base_liquidable_hasta: 35200, cuota_integra: 4362.75, porcentaje_resto: 18.50},
            {base_liquidable_hasta: 60000, cuota_integra: 8950.75, porcentaje_resto: 22.50},
            {base_liquidable_hasta: 300000, cuota_integra: 62950.75, porcentaje_resto: 24.50},
        ];
    }

    escala_gravamen_autonomico(ccaa: string): Tramo[] {
        switch(ccaa){
            case "cyl":

                // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-castilla-leon.html
                //Base liquidable hasta (euros)	Cuota íntegra (euros)	Resto base liquidable hasta (euros)	Tipo aplicable (%)
                //Escala aplicable en el ejercicio 2023 por los contribuyentes residentes en dicho ejercicio en esta Comunidad Autónoma
                //0,00	0,00	12.450,00	9
                //12.450,00	1.120,50	7.750,00	12,00
                //20.200,00	2.050,50	15.000,00	14,00
                //35.200,00	4.150,50	18.207,20	18,50
                //53.407,20	7.518,83	En adelante	21,50

                return [
                    {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9},
                    {base_liquidable_hasta: 12450, cuota_integra: 1120.50, porcentaje_resto: 12},
                    {base_liquidable_hasta: 20200, cuota_integra: 2050.50, porcentaje_resto: 14},
                    {base_liquidable_hasta: 35200, cuota_integra: 4150.50, porcentaje_resto: 18.50},
                    {base_liquidable_hasta: 53407.20, cuota_integra: 7518.83, porcentaje_resto: 21.50},
                ];

        
            default:
                throw new Error(`No hay datos para la comunidad autónoma ${ccaa}`);
        }
    }
  
}