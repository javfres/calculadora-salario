
import { formatNumberEsp } from "../utils";

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


interface LineOrGroup {
    isLine(): boolean;
    isGroup(): boolean;
}

export class Line implements LineOrGroup {

    id: string;

    items: Item[] = [];

    constructor(id: number){
        this.id = "line-" + id;
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
                    case 'euros': return `<span class="euros">${formatNumberEsp(value!)}€</span>`
                    case 'percentage': return `<span class="percentage">${formatNumberEsp(value!)}%</span>`
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

    isLine(){
        return true;
    }

    isGroup(){
        return false;
    }

}

export class Group implements LineOrGroup {

    static id = 0;

    id: string;
    items: (Line|Group)[] = [];
    parent?: Group;

    constructor(parent?: Group){
        this.id = "group-" + (++Group.id);
        this.parent = parent;
    }

    line(): Line {
        const l = new Line(this.items.length);
        this.items.push(l);
        return l;
    }

    group(): Group {
        const g = new Group(this);
        this.items.push(g);
        return g;
    }

    isLine(){
        return false;
    }

    isGroup(){
        return true;
    }
}


export class Description {

    readonly root = new Group();
    private current = this.root;


    startGroup(): Description {
        this.current = this.current.group();
        return this;
    }

    endGroup(): Description {
        this.current = this.current.parent ?? this.root;
        return this;
    }

    line(): Line {
        return this.current.line()
    }

}