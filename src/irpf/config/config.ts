import Config2022 from "./2022";
import { Config } from "./base";

export const configs: Config[] = [
    new Config2022(),
];

export { Config, ConfigContribuyente } from "./base";


export const situaciones = [
    {id: "soltero", name: "Soltero/a sin hijos", has_hijos: false, min_hijos: 0, has_b: false},
    {id: "matri-ind", name: "Matrimonio (declaración individual)", has_hijos: true, min_hijos: 0, has_b: false},
    {id: "matri-conj", name: "Declaración conjunta", has_hijos: true, min_hijos: 0, has_b: true},
    {id: "monoparental", name: "Monoparental", has_hijos: true, min_hijos: 1, has_b: false},
] as const;

export type situacion_id_t = typeof situaciones[number]['id']

export function getSituacionFromID(id: situacion_id_t){
    const situacion = situaciones.find(x => x.id === id);
    if(!situacion) throw new Error("unable to find situacion");
    return situacion;
}
