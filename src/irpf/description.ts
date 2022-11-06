import { Dinero } from "dinero.js";

export class Line {

    id: number;

    items: {
        type: 'text' | 'euros' | 'percentage' | 'symbol',
        text?: string,
        value?: number,
    }[] = [];

    constructor(id: number){
        this.id = id;
    }
    
    text(text:string, options:{quotes?: boolean} = {}): Line {

        if(options.quotes) {
            text = `"${text}"`;
        }

        this.items.push({
            type: "text",
            text,
        });
        return this;
    }

    euros(value:number|Dinero.Dinero): Line {
        this.items.push({
            type: "euros",
            value: typeof value === 'number' ? value : value.toRoundedUnit(2),
        });
        return this;
    }
    
    percentage(value:number): Line {
        this.items.push({
            type: "percentage",
            value,
        });
        return this;
    }

    dot(): Line {
        this.items.push({type: 'symbol', text: '.'});
        return this;
    }

    coma(): Line {
        this.items.push({type: 'symbol', text: ','});
        return this;
    }

    toHtml(): string {

        if(this.items[this.items.length-1].type != 'symbol') {
            this.dot();
        }

        let html = "";

        for(const {type, text, value} of this.items) {

            if (html != "" && type != 'symbol'){
                html += " ";
            }

            html += (()=>{
                switch (type) {
                    case 'text': return text;
                    case 'euros': return `<span class="euros">${value?.toFixed(2)}€</span>`
                    case 'percentage': return `<span class="percentage">${value?.toFixed(2)}%</span>`
                    case 'symbol': return text;
                    default: return "";
                }
            })();
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