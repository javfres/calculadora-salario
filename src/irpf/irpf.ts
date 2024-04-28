
import Dinero from 'dinero.js'
import { Config, ConfigContribuyente, situaciones } from './config/config';
import { Description } from './description';
import { Tramo } from './config/base';

function D(amount: number): Dinero.Dinero {
    return Dinero({amount: Math.floor(amount*100), precision: 2})
}

export class Resultado {
    id: "A" | "B" = "A" 
    bruto = 0;
    seguridad_social = 0;
    neto = 0;
    neto_mes = 0;
    seguridad_social_empresa = 0;  
    total_empresa = 0;

    irpf = 0;
    irpf_porcentaje = 0;
    dinero_estado = 0;
}

export default class CalculadoraSalario {

    config: Config;
    configContribuyente: ConfigContribuyente;
    
    // A y B para declaración conjunta
    a = new Resultado();
    b = new Resultado();

    description: Description = new Description();

    constructor(config: Config, configContribuyente: ConfigContribuyente){
        this.config = config;
        this.configContribuyente = configContribuyente;
    }

    calcular() {

        const configContribuyente = this.configContribuyente;

        const bruto_a = configContribuyente.salarioA;
        const bruto_b = configContribuyente.salarioB;

        const has_b = situaciones.find(s => s.id === configContribuyente.situacion_id)?.has_b ?? false;

        // Create a new description object
        this.description = new Description();

        this.description.line().text("Calculando salario para el año").text("" + this.configContribuyente.year, {quotes: true});


        //
        // Bruto
        //
        const d_bruto_a = D(bruto_a);
        const d_bruto_b = D(bruto_b)

        if(!has_b){
            this.description.line().text("El sueldo bruto es de").euros(d_bruto_a);
            this.a.bruto = d_bruto_a.toRoundedUnit(2);
            this.b.bruto = 0;
        } else {
            this.description.line()
                .text("El sueldo bruto A es de").euros(d_bruto_a).coma()
                .text("el sueldo bruto B es de").euros(d_bruto_b).dot()
                .text("El sueldo bruto total es de").euros(d_bruto_a.add(d_bruto_b));
            this.a.bruto = d_bruto_a.toRoundedUnit(2);
            this.b.bruto = d_bruto_b.toRoundedUnit(2);
        }

        //
        // Calculo seguridad social
        //
        let d_seguridad_social_a = D(0);
        let d_seguridad_social_b = D(0);
        let d_seguridad_social_empresa_a = D(0);
        let d_seguridad_social_empresa_b = D(0);

        this.description.line().text("Calculo de la seguridad social:")
        this.description.startGroup();

        ["A", "B"].forEach(person => {
            const isA = person === "A";

            if(has_b) {
                this.description.line().text("Calculo para " + person).symbol(":");
                this.description.startGroup()
            }

            if(!isA && !has_b) return;
            
            const bruto = isA ? bruto_a : bruto_b;
            const d_bruto = D(bruto);

            // Base sobre la que se aplican los porcentajes
            const b_min = this.base_minima() * 12;
            const b_max = this.base_maxima() * 12;

            const d_base_seguridad_social = D(Math.max(b_min,Math.min(b_max, bruto)));

            const line = this.description.line()
                .text("La base sobre la que se aplica el calculo de la cotización")
                .text("de la Seguridad Social es")
                .euros(d_base_seguridad_social)
                .text("para el grupo de cotización")
                .text("" + configContribuyente.grupo_cotizacion, {quotes: true})
                .dot();

            if (d_bruto.lessThan(D(b_min))){
                line.text("El salario no llega a la base mínima de cotización!!!!");
            }  else if(d_bruto.greaterThan(d_base_seguridad_social)){
                line.text("Esta es la base máxima de cotización para el grupo");
            }

            let d_seguridad_social = Dinero();
            let d_seguridad_social_empresa = Dinero();

            // Iterar sobre los tipos
            for(const tipo of this.config.tipos()){
                if(!tipo.porcentaje) continue

                const d_empleado = d_base_seguridad_social.multiply(tipo.porcentaje/100)
                d_seguridad_social = d_seguridad_social.add(d_empleado)

                this.description.line()
                    .text("El empleado debe aportar")
                    .percentage(tipo.porcentaje)
                    .text("en concepto de")
                    .text(tipo.nombre, {quotes: true})
                    .coma()
                    .text("la cuantia es")
                    .euros(d_empleado);
            }

            this.description.line()
                .text("En total, la aportación a la seguridad social por el empleado es")
                .euros(d_seguridad_social);

            // Iterar sobre los tipos
            for(const tipo of this.config.tipos()){
                if(!tipo.porcentaje_empresa) continue

                const d_empresa = d_base_seguridad_social.multiply(tipo.porcentaje_empresa/100)
                d_seguridad_social_empresa = d_seguridad_social_empresa.add(d_empresa)

                this.description.line()
                    .text("La empresa debe aportar")
                    .percentage(tipo.porcentaje_empresa)
                    .text("en concepto de")
                    .text(tipo.nombre, {quotes: true})
                    .coma()
                    .text("la cuantia es")
                    .euros(d_empresa);
            }

            this.description.line()
                .text("En total, la aportación a la seguridad social por la empresa es:")
                .euros(d_seguridad_social_empresa);


            if(isA){
                this.a.seguridad_social = d_seguridad_social.toRoundedUnit(2);
                this.a.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_a = d_seguridad_social;
                d_seguridad_social_empresa_a = d_seguridad_social_empresa;
            } else {
                this.b.seguridad_social = d_seguridad_social.toRoundedUnit(2);
                this.b.seguridad_social_empresa = d_seguridad_social_empresa.toRoundedUnit(2);
                d_seguridad_social_b = d_seguridad_social;
                d_seguridad_social_empresa_b = d_seguridad_social_empresa;
            }

            if(has_b) {
                this.description.endGroup()
            }

        });

        this.description.endGroup();

        //
        // Calculo IRPF
        //
        this.description.line().text("Calculo del IRPF").symbol(":");
        this.description.startGroup();

        const mpf = this.calcularMinimoPersonalFamiliar();

        let d_irpf_a = D(0);
        let d_irpf_b = D(0);
        let d_irpf_ab = D(0);

        if (configContribuyente.situacion_id === "matri-ind") {

            this.description.line().text("Calculo de IRPF para A").symbol(":");
            this.description.startGroup();
            d_irpf_a = this.calcular_irpf(d_bruto_a, d_seguridad_social_a, mpf, this.a);
            this.description.endGroup();

            this.description.line().text("Calculo de IRPF para B").symbol(":");
            this.description.startGroup();
            d_irpf_b = this.calcular_irpf(d_bruto_b, d_seguridad_social_b, mpf, this.b);
            this.description.endGroup();

        } else if (configContribuyente.situacion_id === "matri-conj") {

            const d_bruto = d_bruto_a.add(d_bruto_b);
            const d_seguridad_social = d_seguridad_social_a.add(d_seguridad_social_b);

            this.description.line().text("Calculo de IRPF conjunto").symbol(":");
            this.description.startGroup();
            d_irpf_ab = this.calcular_irpf(d_bruto, d_seguridad_social, mpf, this.a);
            this.description.endGroup();

        } else {

            this.description.line().text("Calculo de IRPF").symbol(":");
            this.description.startGroup();
            d_irpf_a = this.calcular_irpf(d_bruto_a, d_seguridad_social_a, mpf, this.a);
            this.description.endGroup();

        }

        this.description.endGroup();

        //
        // Neto
        //

        this.description.line().text("Calculo del sueldo neto").symbol(":");
        this.description.startGroup();

        if(configContribuyente.situacion_id === "matri-conj"){

            const reparto = this.reparto_neto_conjunta(d_bruto_a, d_bruto_b, d_seguridad_social_a, d_seguridad_social_b, d_irpf_ab, this.a, this.b);
            d_irpf_a = reparto.d_irpf_a;
            d_irpf_b = reparto.d_irpf_b;
            this.calculo_neto(d_bruto_a, d_seguridad_social_a, d_irpf_a, this.a);
            this.calculo_neto(d_bruto_b, d_seguridad_social_b, d_irpf_b, this.b);

        } else if(configContribuyente.situacion_id === "matri-ind"){
            this.calculo_neto(d_bruto_a, d_seguridad_social_a, d_irpf_a, this.a);
            this.calculo_neto(d_bruto_b, d_seguridad_social_b, d_irpf_b, this.b);
        } else {
            this.calculo_neto(d_bruto_a, d_seguridad_social_a, d_irpf_a, this.a);
        }



        this.description.endGroup();

        //
        // Total empresa
        //

        this.a.total_empresa = d_bruto_a.add(d_seguridad_social_empresa_a).toRoundedUnit(2);
        this.b.total_empresa = d_bruto_b.add(d_seguridad_social_empresa_b).toRoundedUnit(2);

        if(!has_b){
            this.description.line()
                .text("La empresa tiene un coste total de")
                .euros(this.a.total_empresa);
        } else {
            this.description.line()
                .text("La empresa A tiene un coste total de")
                .euros(this.a.total_empresa)
                .coma()
                .text("la empresa B tiene un coste total de")
                .euros(this.b.total_empresa)
        }


        
        

        //
        // Total estado
        //

        this.description.line().text("Calculo de los impuestos que el estado ingresa").symbol(":");
        this.description.startGroup();

        if(has_b) {
            this.description.line().text("Calculo para A").symbol(":");
            this.description.startGroup()
        }

        const d_estado_a = D(0)
            .add(d_seguridad_social_a)
            .add(d_seguridad_social_empresa_a)
            .add(d_irpf_a);

        this.description.line().text("El estado ingresa")
            .euros(d_estado_a)
            .text("en impuestos");

        this.a.dinero_estado = d_estado_a.toRoundedUnit(2);

        if(has_b){
            this.description.line().text("Calculo para B").symbol(":");

            const d_estado_b = D(0)
            .add(d_seguridad_social_b)
            .add(d_seguridad_social_empresa_b)
            .add(d_irpf_b);

            this.description.line().text("El estado ingresa")
                .euros(d_estado_b)
                .text("en impuestos");

            const d_estado_total = d_estado_a.add(d_estado_b);

            this.description.line().text("En total, el estado ingresa")
                .euros(d_estado_total)
                .text("en impuestos");

            this.b.dinero_estado = d_estado_b.toRoundedUnit(2);

            this.description.endGroup()
        }

        


        //
        // Ahorro
        //
        const d_ahorro = D(configContribuyente.ahorro);
        if (d_ahorro.greaterThan(D(0))){


            this.description.line().text("Calculando ahorro (independiente del cálculo del salario)").symbol(":");

            this.description.startGroup()

            this.description.line().text("El ahorro es de").euros(d_ahorro);


            this.description.startGroup()

            const d_irpf_ahorro = this.calcularCuotasIntegrasAhorro(d_ahorro);
            const d_irpf_total = d_irpf_a.add(d_irpf_ahorro);
            this.description.endGroup()

            this.description.line()
                .text("La cuota líquida del IRPF sobre el ahorro es de")
                .euros(d_irpf_ahorro)
                .text("que sumada a la cuota líquida total del IRPF por el salario de")
                .euros(d_irpf_a)
                .text("da un total de")
                .euros(d_irpf_total);


            this.description.endGroup()
        }
       
    }


    seleccionaEscala(cantidad: Dinero.Dinero, tramos: Tramo[]): Tramo {
        // Empezando por el último tramo, comprobar si la cantidad está en ese tramo
        for(const tramo of tramos.reverse()){
            if(cantidad.greaterThanOrEqual(D(tramo.base_liquidable_hasta))){
                return tramo;
            }
        }
        throw new Error("No se ha encontrado tramo para la cantidad " + cantidad.toUnit());
    }

    calcularMinimoPersonalFamiliar(): Dinero.Dinero {

        this.description.line().text("Calculando el mínimo personal y familiar");
        this.description.startGroup();

    
        let d_minimo = D(0);

        const d_minimo_general = D(this.config.minimo_general());
        d_minimo = d_minimo_general;
        this.description.line().text("El mínimo general es de").euros(d_minimo_general);


        const d_minimo_edad = D(this.config.minimo_edad(this.configContribuyente.edad ?? 0));
        d_minimo = d_minimo.add(d_minimo_edad);
        this.description.line().text("Teniendo en cuenta la edad, se añade un mínimo de").euros(d_minimo_edad);
        

        let d_minimo_hijos = D(0);

        const num_hijos = this.configContribuyente.hijos ?? 0;

        for(let i=1; i<=num_hijos; i++){
            const d= D(this.config.minimo_hijo(i));
            this.description.line().text(`Por el hijo #${i} corresponde un mínimo adicional de `).euros(d);
            d_minimo_hijos = d_minimo_hijos.add(d);
        }

        this.description.line().text("La suma de los mínimos por hijos es de").euros(d_minimo_hijos);

        if(this.configContribuyente.situacion_id === "matri-ind"){
            d_minimo_hijos = d_minimo_hijos.divide(2);
            this.description.line().text("Cada miembro de la pareja se beneficia de la mitad de los mínimos por hijos, es decir").euros(d_minimo_hijos);
        }


        d_minimo = d_minimo.add(d_minimo_hijos);

        if (this.configContribuyente.situacion_id === "matri-conj"){
            this.description.line().text("Al ser una declaración conjunta, se añade el mínimo por matrimonio").euros(D(this.config.minimo_matrimonio()));
            d_minimo = d_minimo.add(D(this.config.minimo_matrimonio()));
        }

        if (this.configContribuyente.situacion_id === "monoparental"){
            this.description.line().text("Al ser una declaración monoparental, se añade el mínimo por monoparental").euros(D(this.config.minimo_mono_parental()));
            d_minimo = d_minimo.add(D(this.config.minimo_mono_parental()));
        }

        this.description.line().text("El mínimo personal y familiar final es de").euros(d_minimo);
        this.description.endGroup();

    
        return d_minimo;
    }


    calcularCuotasIntegras(mpf: Dinero.Dinero, cantidad: Dinero.Dinero): Dinero.Dinero {

        this.description.line().text("Calculando cuotas íntegras del IRPF")
            .text("para la cantidad").euros(cantidad)
            .text("y el mínimo personal y familiar").euros(mpf);

        // Cuotas estatales y autonómicas para las bases liquidables y para el mínimo personal y familiar
        let cuota_estatal, cuota_autonomica, cuota_mpf_estatal, cuota_mpf_autonomica;

        {
            // Aplicación de la escala de gravamen general (estatal)
            const tramo = this.seleccionaEscala(cantidad, this.config.escala_gravamen_estatal());
            const cuota_integra = D(tramo.cuota_integra);
            const resto = cantidad.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("C1: El tramo de la escala de gravamen general (estatal) es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_estatal = cuota_total;
        }

        {
            // Aplicación de la escala de gravamen general (estatal) al mínimo personal y familiar
            const tramo = this.seleccionaEscala(mpf, this.config.escala_gravamen_estatal());
            const cuota_integra = D(tramo.cuota_integra);
            const resto = mpf.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("C2: El tramo de la escala de gravamen general (estatal) para el mínimo personal y familiar es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_mpf_estatal = cuota_total;
        }

        {
            // Aplicación de la escala de gravamen autonómica
            const tramo = this.seleccionaEscala(cantidad, this.config.escala_gravamen_autonomico("cyl"));
            const cuota_integra = D(tramo.cuota_integra);
            const resto = cantidad.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("C3: El tramo de la escala de gravamen autonómica es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_autonomica = cuota_total;
        }

        {
            // Aplicación de la escala de gravamen autonómica al mínimo personal y familiar
            const tramo = this.seleccionaEscala(mpf, this.config.escala_gravamen_autonomico("cyl"));
            const cuota_integra = D(tramo.cuota_integra);
            const resto = mpf.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("C4: El tramo de la escala de gravamen autonómica para el mínimo personal y familiar es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_mpf_autonomica = cuota_total;
        }

        const cuota_liquida_estatal = cuota_estatal.subtract(cuota_mpf_estatal);
        const cuota_liquida_autonomica = cuota_autonomica.subtract(cuota_mpf_autonomica);
        const cuota_liquida = cuota_liquida_estatal.add(cuota_liquida_autonomica);

        this.description.line()
            .text("La cuota líquida estatal (C1-C3) es de")
            .euros(cuota_liquida_estatal)
            .text("y la cuota líquida autonómica (C2-C4) es de")
            .euros(cuota_liquida_autonomica)
            .dot();

       return cuota_liquida;
    
    }

    calcularCuotasIntegrasAhorro(cantidad: Dinero.Dinero): Dinero.Dinero {


        this.description.line().text("Calculando cuotas íntegras del IRPF del ahorro")
            .text("para la cantidad").euros(cantidad);

        // Cuotas estatales y autonómicas para las bases liquidables
        let cuota_estatal, cuota_autonomica;

        {
            // Aplicación de la escala de gravamen general (estatal)
            const tramo = this.seleccionaEscala(cantidad, this.config.escala_gravamen_estatal_ahorro());
            const cuota_integra = D(tramo.cuota_integra);
            const resto = cantidad.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("CA1: El tramo de la escala de gravamen general (estatal) es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_estatal = cuota_total;
        }

       
        {
            // Aplicación de la escala de gravamen autonómica
            const tramo = this.seleccionaEscala(cantidad, this.config.escala_gravamen_autonomico_ahorro());
            const cuota_integra = D(tramo.cuota_integra);
            const resto = cantidad.subtract(D(tramo.base_liquidable_hasta));
            const cuota_resto = D(resto.toUnit() * (tramo.porcentaje_resto / 100));
            const cuota_total = cuota_integra.add(cuota_resto);

            this.description.line()
                .text("CA2: El tramo de la escala de gravamen autonómica es")
                .euros(tramo.base_liquidable_hasta)
                .text("cuya cuota íntegra es")
                .euros(cuota_integra)
                .text("el resto de la base liquidable es")
                .euros(resto)
                .text("y se aplica un porcentaje del")
                .percentage(tramo.porcentaje_resto)
                .text("que corresponde a")
                .euros(cuota_resto)
                .dot()
                .text("La cuota total es de")
                .euros(cuota_total);

            cuota_autonomica = cuota_total;
        }
       
        return cuota_autonomica.add(cuota_estatal);
    }

    calcular_irpf(d_bruto: Dinero.Dinero, d_seguridad_social: Dinero.Dinero, mpf: Dinero.Dinero, r: Resultado): Dinero.Dinero {
 
        let d_base_imponible = d_bruto;
        d_base_imponible = d_base_imponible.subtract(d_seguridad_social)
        if (d_base_imponible.isNegative()){
            d_base_imponible = D(0);
        }
        
        // Otros gastos deducibles
        const otros_gastos = D(this.config.otros_gastos_deducibles());
        d_base_imponible = d_base_imponible.subtract(otros_gastos);
        if (d_base_imponible.isNegative()){
            d_base_imponible = D(0);
        }

        this.description.line()
            .text("La base imponible sobre la que se aplica el IRPF es")
            .euros(d_base_imponible)
            .dot()
            .text("Esta base es el bruto de")
            .euros(d_bruto)
            .text("menos la contribución a la seguridad social")
            .euros(d_seguridad_social)
            .text(`y menos "otros gastos deducibles"`)
            .euros(otros_gastos);

        if (mpf.greaterThan(d_base_imponible)){
            this.description.line()
                .text("El mínimo personal y familiar es mayor que la base imponible, por lo que irpf es 0");
            r.irpf = 0;
            return D(0);
        }


        this.description.line()
            .text("Ahora se calcula el IRPF").symbol(":");
        this.description.startGroup()

        let d_irpf = this.calcularCuotasIntegras(mpf, d_base_imponible);

        this.description.line()
            .text("La cuota líquida total del IRPF es de")
            .euros(d_irpf);
        this.description.endGroup()

        if(d_irpf.isNegative()){
            this.description.line().text("El IRPF es negativo, ajustar a 0");
            d_irpf = D(0);
        }

        r.irpf = d_irpf.toRoundedUnit(2);

    

        return d_irpf;
    }


    reparto_neto_conjunta(d_bruto_a: Dinero.Dinero, d_bruto_b: Dinero.Dinero, d_seguridad_social_a: Dinero.Dinero, d_seguridad_social_b: Dinero.Dinero, d_irpf: Dinero.Dinero, a: Resultado, b: Resultado): {d_irpf_a: Dinero.Dinero, d_irpf_b: Dinero.Dinero} {

        const d_base_a = d_bruto_a.subtract(d_seguridad_social_a);
        const d_base_b = d_bruto_b.subtract(d_seguridad_social_b);

        const d_total = d_base_a.add(d_base_b);
        const percentage_a = d_base_a.toUnit() / d_total.toUnit();

        const d_irpf_a = d_irpf.multiply(percentage_a);
        const d_irpf_b = d_irpf.subtract(d_irpf_a);

        a.irpf = d_irpf_a.toRoundedUnit(2);
        b.irpf = d_irpf_b.toRoundedUnit(2);

        this.description.line()
            .text("Vamos a repartir el irpf A y B de forma proporcional a sus bases imponibles")
            .text("El IRPF para A es de")
            .euros(d_irpf_a)
            .text("y para B es de")
            .euros(d_irpf_b);

        return {d_irpf_a, d_irpf_b};

    }



    calculo_neto(d_bruto: Dinero.Dinero, d_seguridad_social: Dinero.Dinero, d_irpf: Dinero.Dinero, r: Resultado): Dinero.Dinero {

        let d_neto = d_bruto.subtract(d_seguridad_social).subtract(d_irpf);

        if (d_neto.isNegative()){
            d_neto = D(0);
        }   


        r.neto = d_neto.toRoundedUnit(2);
        r.neto_mes = d_neto.divide(12).toRoundedUnit(2);    

        this.description.line()
            .text("El salario neto es por tanto de")
            .euros(d_neto)
            .text("y el neto mensual es de")
            .euros(r.neto_mes);

        // El porcentaje de irpf es sobre el bruto
        if(d_irpf.isZero()){
            r.irpf_porcentaje = 0;
        } else {
            r.irpf_porcentaje = 100 * d_irpf.toUnit() / d_bruto.toUnit()
        }

        this.description.line()
            .text("Lo que corresponde a un porcentaje de IRPF en nómina de")
            .percentage(r.irpf_porcentaje);


        return d_neto;

    }

    base_minima(): number {
        const g = this.config.grupos_cotizacion().find(g => g.grupo === this.configContribuyente.grupo_cotizacion)
         if (g) {
             return g.base_minima;
         }
         return 0;
     }
 
     base_maxima(): number {
        const g = this.config.grupos_cotizacion().find(g => g.grupo === this.configContribuyente.grupo_cotizacion)
         if (g) {
             return g.base_maxima;
         }
         return 0;
     }

}

