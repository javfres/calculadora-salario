

import { ConfigFlexible2024 } from "./2024";
import { ConfigFlexibleBase } from "./base";

export const years = [
    2025,
    2024,
    2023,
    2022
] as const;

export const configs: { [id: number]: ConfigFlexibleBase } = {
    2022: new ConfigFlexible2024(),
    2023: new ConfigFlexible2024(),
    2024: new ConfigFlexible2024(),
    2025: new ConfigFlexible2024(),
};


export type ConfigFlexibleContribuyente = {
    salario: number;
    restaurante: number;
    transporte: number;
    guarderia: number;
    seguro: number;
}
