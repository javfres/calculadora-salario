# Calculadora Salario Neto

[Link a la Calculadora](https://javfres.github.io/calculadora-salario)

Calculadora de salario neto para 2022-2023. Usando los datos de Castilla y León.
Probando otras calculadoras obtenía diferentes valores para las mismas entradas.
He creado mi propia calculadora para entender el calculo de la contribución
a la Seguridad Social y el impuesto del IRPF.

Otras calculadoras no especifican bien los conceptos de cotización
a la seguridad social. O no aplican correctamente el máximo de cotización.
Muchos no calculan bien el porcentaje del IRPF sobre la nómina,
dan un porcentaje sobre el bruto cuando la base del IRPF debería
de ser el bruto menos la seguridad social.

Esta calculadora da una explicación detalla del cálculo para poder detectar
los errores.

Otras calculadoras:

* https://taxscouts.es/calculadoras/calculadora-de-sueldo-neto
* https://www.lavanguardia.com/etc/calculadoras/calcula-tu-sueldo
* https://santandersmartbank.es/calculadora-sueldo-neto/#resultados_calculadora_nomina
* https://cincodias.elpais.com/herramientas/calculadora-sueldo-neto/#tabla_resultados

## Notas

* ¿Base de cotización puede ser mayor que salario?: https://foros.elasesorlaboral.com/threads/base-cotizacion-mayor-que-salario.34542/

## Changelog

* Abr 2024: actualización de la calculadora para 2023
    * Los datos los iguales que en 2022 excepto los cambios en las bases de cotización. Son iguales: tramos, tipos y los mínimo de CyL.
* Nov 2022: primera versión


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
