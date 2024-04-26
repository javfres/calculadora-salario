import { Description } from "../description";
import { situacion_id_t } from "./config";

/**
 * Tipo Cotización
 */ 
export type Tipo = {
    nombre: string;
    porcentaje: number;
    porcentaje_empresa: number; 
}

// Tramo cotización
export type Tramo = {
    base_liquidable_hasta: number;
    cuota_integra: number;
    porcentaje_resto: number;
}

export type ConfigContribuyente = {
    year: number;
    grupo_cotizacion: number;
    salarioA: number;
    salarioB: number;
    situacion_id: situacion_id_t;
    edad?: number;
    hijos?: number;
    ahorro: number;
}


export interface Config {

    /** El año de la configuración */
    year(): number;

    //
    // Seguridad Social
    //

    /** 
     * Base mínima de cotización
     * https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537?changeLanguage=es
     */
    base_minima(grupo_cotizacion: number): number;

    /** 
     * Base máxima de cotización
     */
    base_maxima(grupo_cotizacion: number): number;

    /**
     * Tipos de cotización con el porcentaje del empleado y la empresa
     */
    tipos(): Tipo[];

    //
    // IRPF
    //

    minimo_general(): number;
    minimo_edad(edad: number): number;
    minimo_matrimonio(): number;
    minimo_mono_parental(): number;
    minimo_hijo(n: number): number;

    otros_gastos_deducibles(): number;

    /**
     * Mínimo personal + familiar según corresponda
     * @param config Configuración del contribuyente
     */
    //minimo_contribuyente(config: ConfigContribuyente): number;

    /**
     * Añade a la descripción los detalles del mínimo del contribuyente
     * @param config 
     * @param description 
     */
    //describe_minimo_contribuyente(config: ConfigContribuyente, description: Description): number;

    /**
     * Tramos del IRPF
     */
    escala_gravamen_estatal(): Tramo[];
    escala_gravamen_autonomico(ccaa: string): Tramo[];

    escala_gravamen_estatal_ahorro(): Tramo[];
    escala_gravamen_autonomico_ahorro(): Tramo[];
}
