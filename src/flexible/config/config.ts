import Amount from "@/irpf/config/amount";

export type ConfigFlexibleContribuyente = {
    salario: Amount;
    restaurante: Amount;
    transporte: Amount;
    guarderia: Amount;
    seguro: Amount;
}
