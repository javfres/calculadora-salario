

type pid_conf_t = {
    start?: number;
    maxIter?: number;
    Kp?: number;
    Ki?: number;
    Kd?: number;
}

type pid_fn_t = (input: number) => number;

export class PID {

    fn: pid_fn_t;

    start: number;
    maxIter: number;

    Kp: number;
    Ki: number;
    Kd: number;

    constructor(fn: pid_fn_t, config: pid_conf_t = {}){

        this.fn = fn;

        const def = {
            start: 0,
            maxIter: 100,
            Kp: 1,
            Ki: 0,
            Kd: 5,
        };

        const config2 = {...def, ...config}
        this.start = config2.start;
        this.maxIter = config2.maxIter;
        this.Kp = config2.Kd
        this.Ki = config2.Ki
        this.Kd = config2.Kd
    }

    run(expected: number): number {

        let current = 0;
        let acumError = 0;
        let lastError = 0;
        for(let i=0; i<this.maxIter; i++){

            const output = this.fn(current);
            const error = expected - output;
            acumError += error;
            const rateError = error - lastError;
            lastError = error;


            console.log({i, current, output, error, acumError});
            if(Math.abs(error) < 0.01) break;

            current += error * this.Kp + acumError * this.Ki + rateError * this.Kd;
        }


        return current;

    }



}