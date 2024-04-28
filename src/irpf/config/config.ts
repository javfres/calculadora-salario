import Config2022 from "./2022";
import Config2023 from "./2023";
import { Config } from "./base";

export const years = [
    2023,
    2022
] as const;

export const configs: { [id: number]: Config } = {
    2023: new Config2023(),
    2022: new Config2022(),
};

export { Config, ConfigContribuyente } from "./base";

export const situaciones = [
    {id: "soltero", name: "Soltero/a sin hijos", has_hijos: false, min_hijos: 0, has_b: false},
    {id: "matri-ind", name: "Matrimonio (declaración individual)", has_hijos: true, min_hijos: 0, has_b: true},
    {id: "matri-conj", name: "Declaración conjunta", has_hijos: true, min_hijos: 0, has_b: true},
    {id: "monoparental", name: "Monoparental", has_hijos: true, min_hijos: 1, has_b: false},
] as const;

export type situacion_id_t = typeof situaciones[number]['id']

export function getSituacionFromID(id: situacion_id_t){
    const situacion = situaciones.find(x => x.id === id);
    if(!situacion) throw new Error("unable to find situacion");
    return situacion;
}

export const grupo_cotizacion_names = [
    {
        grupo: 1,
        nombre: "Ingenieros y Licenciados",
    },
    {
        grupo: 2,
        nombre: "Ingenieros Técnicos, Peritos y Ayudantes Titulados",
    },
    {
        grupo: 3,
        nombre: "Jefes Administrativos y de Taller",
    },
    {
        grupo: 4,
        nombre: "Ayudantes no titulados",
    },
    {
        grupo: 5,
        nombre: "Oficiales Administrativos",
    },
    {
        grupo: 6,
        nombre: "Subalternos",
    },
    {
        grupo: 7,
        nombre: "Auxiliares Administrativos",
    },
] as const;