import { Config, GroupCotizacion, Tipo, Tramo } from "./base";

// https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537?changeLanguage=es
// https://sede.agenciatributaria.gob.es/Sede/manuales-practicos.html
// https://sede.agenciatributaria.gob.es/Sede/Ayuda/24Presentacion/100.html

export default class Config2024 implements Config {

    salario_minimo_interprofesional(): number {
        return 1134*14;
    }

    grupos_cotizacion(): GroupCotizacion[] {

        return [
            {
                grupo: 1,
                base_minima: 1847.40,
                base_maxima: 4720.50
            },
            {
                grupo: 2,
                base_minima: 1532.10,
                base_maxima: 4720.50
            },
            {
                grupo: 3,
                base_minima: 1332.90,
                base_maxima: 4720.50
            },
            {
                grupo: 4,
                base_minima: 1323.00,
                base_maxima: 4720.50
            },
            {
                grupo: 5,
                base_minima: 1323.00,
                base_maxima: 4720.50
            },
            {
                grupo: 6,
                base_minima: 1323.00,
                base_maxima: 4720.50
            },
            {
                grupo: 7,
                base_minima: 1323.00,
                base_maxima: 4720.50
            },
        ];
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
                nombre: "Fondo de Garantía Salarial", // FOGASA
                porcentaje: 0,
                porcentaje_empresa: 0.2,
            },
            {
                nombre: "Mecanismo de Equidad Intergeneracional (MEI)",
                porcentaje: 0.12,
                porcentaje_empresa: 0.58,
            }
        ];
    }


    // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2024/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_2-minimo-contribuyente.html
    minimo_general(): number {
        return 5550;
    }

    minimo_edad(edad: number):number{
        if(edad >= 75) {
            return 8100-this.minimo_general();
        } else if(edad >= 65) {
            return 6700-this.minimo_general();
        } else {
            return 0;
        }
    }

    minimo_matrimonio(): number {
        return 3400;
    }

    minimo_mono_parental(): number {
        return 2150;
    }

    minimo_hijo(n: number): number {
        switch(n){
            case 1: return 2400;
            case 2: return 2700;
            case 3: return 4000;
            default: return 4500;
        }
    }

    otros_gastos_deducibles(): number {
        return 2000;
    }

    // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html
    escala_gravamen_estatal(): Tramo[] {
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

                // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-castilla-leon.html
    
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

    // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2024/8-cumplimentacion-irpf/8_4-cuota-integra/8_4_4-gravamen-base-liquidable-ahorro.html
    escala_gravamen_estatal_ahorro(): Tramo[] {
        return [
            {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9.50},
            {base_liquidable_hasta: 6000, cuota_integra: 570, porcentaje_resto: 10.5},
            {base_liquidable_hasta: 50000, cuota_integra: 5190, porcentaje_resto: 11.5},
            {base_liquidable_hasta: 200000, cuota_integra: 22440, porcentaje_resto: 13.5},
            {base_liquidable_hasta: 300000, cuota_integra: 35940, porcentaje_resto: 14},
        ];
        
    }

    escala_gravamen_autonomico_ahorro(): Tramo[] {
        return [
            {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9.50},
            {base_liquidable_hasta: 6000, cuota_integra: 570, porcentaje_resto: 10.5},
            {base_liquidable_hasta: 50000, cuota_integra: 5190, porcentaje_resto: 11.5},
            {base_liquidable_hasta: 200000, cuota_integra: 22440, porcentaje_resto: 13.5},
            {base_liquidable_hasta: 300000, cuota_integra: 35940, porcentaje_resto: 14},
        ];
    }

    //
    // Planes de pensiones
    //
    plan_pensiones_max(): number {
        return 1500;
    }

    //
    // Retribución flexible
    //
    // https://factorialhr.es/blog/retribucion-flexible-empresa-espana/
    flexible_max_transporte(): number {
        return 1500;
    }
    flexible_max_guarderia(): number {
        return 0; // No hay límite
    }
    flexible_max_seguro(): number {
        return 500
    }
    flexible_max_percentage(): number {
        return 0.3
    }
    flexible_max_restaurante_dia(): number {
        return 11;
    }
    flexible_dias_laborables(): number {
        return 220; // ????
    }

}