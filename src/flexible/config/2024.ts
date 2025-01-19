import { ConfigFlexibleBase } from "./base";

// https://factorialhr.es/blog/retribucion-flexible-empresa-espana/

export class ConfigFlexible2024 implements ConfigFlexibleBase {
    max_transporte(): number {
        return 1500;
    }
    max_guarderia(): number {
        return 0; // No hay límite
    }
    max_seguro(): number {
        return 500
    }
    max_percentage(): number {
        return 0.3
    }
    max_restaurante_dia(): number {
        return 11;
    }
    dias_laborables(): number {
        return 225
    }
}