
import Amount from "./amount";
import { ConfigContribuyente } from "./base";
import { situacion_id_t, years } from "./config";

const lastYear = years[0];

export function cc2str(cc: ConfigContribuyente): string {

    const l = (()=>{
        switch(cc.situacion_id){
            case "soltero": return "s";
            case "matri-conj": return "c";
            case "matri-ind": return "i";
            case "monoparental": return "m";
        }
    })();

    let res = l;

    res += cc.salarioA.getOptimizedText()

    if(cc.salarioB.getValue()){
        res += "b" +  cc.salarioB.getOptimizedText();
    }

    if(cc.edad){
        res += "e" + cc.edad;
    }

    if(cc.hijos){
        res += "h" + cc.hijos;
    }

    if(cc.year !== lastYear){
        res += "y" + cc.year;
    }

    if(cc.grupo_cotizacion !== 1){
        res += "g" + cc.grupo_cotizacion;
    }

    if(cc.ahorro.getValue()){
        res += "a" + cc.ahorro.getOptimizedText();
    }

    if(cc.plan_pensiones.getValue()){
        res += "p" + cc.plan_pensiones.getOptimizedText();
    }

    if(cc.flexible_restaurante.getValue()){
        res += "fr" + cc.flexible_restaurante.getOptimizedText();
    }

    if(cc.flexible_transporte.getValue()){
        res += "ft" + cc.flexible_transporte.getOptimizedText();
    }

    if(cc.flexible_guarderia.getValue()){
        res += "fg" + cc.flexible_guarderia.getOptimizedText();
    }

    if(cc.flexible_seguro.getValue()){
        res += "fs" + cc.flexible_seguro.getOptimizedText();
    }

    if(cc.flexible_seguro_personas > 1){
        res += "fp" + cc.flexible_seguro_personas;
    }

    return res;
}

export function str2cc(q: string): ConfigContribuyente|null {

    const res = /([scim])([0-9.+*]+)(?:b([0-9.+*]+))?(?:e([0-9]+))?(?:h([0-9]+))?(?:y([0-9]+))?(?:g([0-9]+))?(?:a([0-9.+*]+))?(?:p([0-9.+*]+))?(?:fr([0-9.+*]+))?(?:ft([0-9.+*]+))?(?:fg([0-9.+*]+))?(?:fs([0-9.+*]+))?(?:fp([0-9]+))?/i.exec(q);
    
    if(!res) return null;

    const situacion_id: situacion_id_t = ((x:string)=>{
        switch(x){
            case "s": return "soltero";
            case "c": return "matri-conj";
            case "i": return "matri-ind";
            case "m": return "monoparental";
            default: return "soltero";
        }
    })(res[1]);

    const salarioA = new Amount(res[2]||"0");
    const salarioB = new Amount(res[3]||"0");
    const edad = +(res[4]||18);
    const hijos = +(res[5]||0);
    const year = +(res[6]||lastYear);
    const grupo_cotizacion = +(res[7]||1);
    const ahorro = new Amount(res[8]||"0");

    const plan_pensiones = new Amount(res[9]||"0");
    const flexible_restaurante = new Amount(res[10]||"0");
    const flexible_transporte = new Amount(res[11]||"0");
    const flexible_guarderia = new Amount(res[12]||"0");
    const flexible_seguro = new Amount(res[13]||"0");
    const flexible_seguro_personas = +(res[14]||"1"); 

    return {
        year,
        grupo_cotizacion,
        situacion_id,
        salarioA,
        salarioB,
        edad,
        hijos,
        ahorro,
        plan_pensiones,
        flexible_restaurante,
        flexible_transporte,
        flexible_guarderia,
        flexible_seguro,
        flexible_seguro_personas,
    }
}

export function updateURL(cc: ConfigContribuyente) {

    // Construct URLSearchParams object instance from current URL querystring.
    const queryParams = new URLSearchParams(window.location.search);
    
    // Set new or modify existing parameter value. 
    queryParams.set("q", cc2str(cc));
    
    // Replace current querystring with the new one.
    history.replaceState(null, "null", "?"+queryParams.toString());
}

export function getCCFromURL(): ConfigContribuyente|null {

    const queryParams = new URLSearchParams(window.location.search);
    
    const str = queryParams.get("q");

    if(!str) return null;

    return str2cc(str);
}