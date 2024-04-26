
import { ConfigContribuyente } from "./base";
import { situacion_id_t, years } from "./config";

const lastYear = years[0];

function salary2str(s: number): string {

    if(s > 1000 && s % 1000 === 0){
        return Math.floor(s/1000) + "k";
    }

    return Math.floor(s) + "";

}

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

    res += salary2str(cc.salarioA);

    if(cc.salarioB){
        res += "b" + salary2str(cc.salarioB);
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

    if(cc.ahorro){
        res += "a" + salary2str(cc.ahorro);
    }

    return res;

}

function str2salary(s?: string): number {

    if(!s) return 0;
    
    const res = /([0-9]+)(k?)/.exec(s);
    if(!res) return 0;

    let num = +res[1];

    if(res[2]) num *= 1000;

    return num;

}

export function str2cc(q: string): ConfigContribuyente|null {

    const res = /([scim])([0-9]+k?)(?:b([0-9]+k?))?(?:e([0-9]+))?(?:h([0-9]+))?(?:y([0-9]+))?(?:g([0-9]+))?(?:a([0-9]+k?))?/.exec(q);
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

    const salarioA = str2salary(res[2]);

    const salarioB = str2salary(res[3]);

    const edad = +(res[4]||18);

    const hijos = +(res[5]||0);

    const year = +(res[6]||lastYear);

    const grupo_cotizacion = +(res[7]||1);

    const ahorro = str2salary(res[8]);

    return {
        year,
        grupo_cotizacion,
        situacion_id,
        salarioA,
        salarioB,
        edad,
        hijos,
        ahorro,
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