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

    tramos(): Tramo[] {
        return [
            {
                hasta: 12450,
                porcentaje: 19,
            },
            {
                hasta: 20200,
                porcentaje: 24,
            },
            {
                hasta: 35200,
                porcentaje: 30,
            },
            {
                hasta: 60000,
                porcentaje: 37,
            },
            {
                hasta: 300000,
                porcentaje: 45,
            },
            {
                hasta: Number.MAX_VALUE,
                porcentaje: 47,
            }
        ];
    }


    
}