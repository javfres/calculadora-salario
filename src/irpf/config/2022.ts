import { Config, GroupCotizacion, Tipo, Tramo } from "./base";


export default class Config2022 implements Config {

    // https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537?changeLanguage=es

    salario_minimo_interprofesional(): number {
        return 1000*14;
    }

    grupos_cotizacion(): GroupCotizacion[] {
        return [
            {
                grupo: 1,
                base_minima: 1629.3,
                base_maxima: 4139.4,
            },
            {
                grupo: 2,
                base_minima: 1351.2,
                base_maxima: 4139.4,
            },
            {
                grupo: 3,
                base_minima: 1175.4,
                base_maxima: 4139.4,
            },
            {
                grupo: 4,
                base_minima: 1166.7,
                base_maxima: 4139.4,
            },
            {
                grupo: 5,
                base_minima: 1166.7,
                base_maxima: 4139.4,
            },
            {
                grupo: 6,
                base_minima: 1166.7,
                base_maxima: 4139.4,
            },
            {
                grupo: 7,
                base_minima: 1166.7,
                base_maxima: 4139.4,
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
                nombre: "Fondo de Garantía Salarial",
                porcentaje: 0,
                porcentaje_empresa: 0.2,
            },
        ];
    }

    //
    // https://tributos.jcyl.es/web/es/informacion-tributaria/informacion-basica-deducciones-aplicables.html
    //

    minimo_general(): number {
        return 5550;
    }

    minimo_edad(edad: number):number{
        if(edad >= 75) {
            return 6950-this.minimo_general();
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


    // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_4-cuota-integra/8_4_4-gravamen-base-liquidable-ahorro.html
    escala_gravamen_estatal_ahorro(): Tramo[] {
        return [
            {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9.50},
            {base_liquidable_hasta: 6000, cuota_integra: 570, porcentaje_resto: 10.5},
            {base_liquidable_hasta: 50000, cuota_integra: 5190, porcentaje_resto: 11.5},
            {base_liquidable_hasta: 200000, cuota_integra: 22440, porcentaje_resto: 13.5},
        ];
        
    }


    escala_gravamen_autonomico_ahorro(): Tramo[] {
        return [
            {base_liquidable_hasta: 0, cuota_integra: 0, porcentaje_resto: 9.50},
            {base_liquidable_hasta: 6000, cuota_integra: 570, porcentaje_resto: 10.5},
            {base_liquidable_hasta: 50000, cuota_integra: 5190, porcentaje_resto: 11.5},
            {base_liquidable_hasta: 200000, cuota_integra: 22440, porcentaje_resto: 13.5},
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