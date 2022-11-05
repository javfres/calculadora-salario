
// Tipo Cotización
type Tipo = {
    nombre: string;
    porcentaje: number;
    porcentaje_empresa: number; 
}

// Tramo cotización
type Tramo = {
    hasta: number;
    porcentaje: number;
}

export type Config = {

    year: number,

    //
    // Seguridad Social
    //

    // Base máxima para el grupo 1
    // https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537?changeLanguage=es
    base_maxima: number,
    tipos: Tipo[],

    //
    // IRPF
    //

    minimo_personal: number,
    tramos: Tramo[],
}



export const Config2022: Config = {

    year: 2022,

    base_maxima: 4139.40,

    tipos: [
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
    ],

    minimo_personal: 5550,

    tramos: [
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
    ],
}

export const configs = [
    Config2022,
];


