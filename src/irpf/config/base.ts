import Amount from "./amount";
import { situacion_id_t } from "./config";

export type GroupCotizacion = {
    grupo: number;
    base_minima: number;
    base_maxima: number;
}

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
    salarioA: Amount;
    salarioB: Amount;
    situacion_id: situacion_id_t;
    edad?: number;
    hijos?: number;
    ahorro: Amount;
    plan_pensiones: Amount;

    flexible_restaurante: Amount;
    flexible_transporte: Amount;
    flexible_guarderia: Amount;
    flexible_seguro: Amount;
    flexible_seguro_personas: number;
}


export interface Config {

    salario_minimo_interprofesional(): number;

    //
    // Seguridad Social
    //

    grupos_cotizacion(): GroupCotizacion[];
   
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

    escala_gravamen_estatal(): Tramo[];
    escala_gravamen_autonomico(ccaa: string): Tramo[];

    escala_gravamen_estatal_ahorro(): Tramo[];
    escala_gravamen_autonomico_ahorro(): Tramo[];

    plan_pensiones_max(): number;

    // Configuración de retribución flexible
    flexible_max_restaurante_dia(): number;
    flexible_dias_laborables(): number;
    flexible_max_transporte(): number;
    flexible_max_guarderia(): number;
    flexible_max_seguro(): number;
    flexible_max_percentage(): number;
}
