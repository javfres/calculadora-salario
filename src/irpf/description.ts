import { Dinero } from "dinero.js";

type Options = {
    quotes?: boolean,
    parenthesis?: boolean,
}

type Item = {
    type: 'text' | 'euros' | 'percentage' | 'symbol',
    text?: string,
    value?: number,
    options: Options,
}


export class Line {

    id: number;

    items: Item[] = [];

    constructor(id: number){
        this.id = id;
    }

    private push(item: Partial<Item>): Line {

        const item2: Item = {
            ...{
                type: "text",
                options: {},
            },
            ...item
        };

        this.items.push(item2)
        return this;
    }
    
    text(text:string, options:Options = {}): Line {

        this.push({
            type: "text",
            text,
            options,
        });
        return this;
    }

    euros(value:number|Dinero.Dinero, options:Options = {}): Line {
        this.push({
            type: "euros",
            value: typeof value === 'number' ? value : value.toRoundedUnit(2),
            options,
        });
        return this;
    }
    
    percentage(value:number, options:Options = {}): Line {
        this.push({
            type: "percentage",
            value,
            options,
        });
        return this;
    }

    symbol(symbol: string): Line{
        this.push({type: 'symbol', text: symbol});
        return this;
    }

    dot(): Line {
        return this.symbol(".");
    }

    coma(): Line {
        return this.symbol(",");
    }

    toHtml(): string {

        if(this.items[this.items.length-1].type != 'symbol') {
            this.dot();
        }

        let html = "";

        for(const {type, text, value, options} of this.items) {

            if (html != "" && type != 'symbol'){
                html += " ";
            }

            let res = (()=>{
                switch (type) {
                    case 'text': return text;
                    case 'euros': return `<span class="euros">${value?.toFixed(2)}€</span>`
                    case 'percentage': return `<span class="percentage">${value?.toFixed(2)}%</span>`
                    case 'symbol': return text;
                    default: return "";
                }
            })();

            if(options.parenthesis){
                res = `(${res})`;
            } else if (options.quotes){
                res = `"${res}"`;
            }

            html += res;
        }

        return html;
    }
}

export class Description {

    lines: Line[] = [];

    add(): Line {
        const it = new Line(this.lines.length);
        this.lines.push(it);
        return it;
    }
}