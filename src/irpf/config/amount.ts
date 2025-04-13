
export default class Amount {
    str: string
    valid: boolean
    value: number

    constructor(str: string) {
        str = clean(str)
        const val = toNumber(str)
        if (isNaN(val)) {
            this.str = ''
            this.valid = false
            this.value = 0
        } else {
            this.str = str
            this.valid = true
            this.value = val
        }
    }

    getValue() {
        return this.value
    }

    getText() {
        return this.str
    }

    getOptimizedText() {
        const text = this.str

        const parts: string[] = []
        let pos = 0
        for (let i = 0; i < text.length; i++) {
            const c = text[i]
            if (c === '+' || c === '*') {
                parts.push(text.substring(pos, i))
                parts.push(c)
                pos = i + 1
            }
        }
        
        if (pos < text.length) parts.push(text.substring(pos))

        return parts.map(part => {
            if (part === '+' || part === '*') return part
            return toNumber(part).toFixed(2).replace(/\.00$/, "").replace(/\.([0-9])0$/, ".$1");
        }).join('')
    }

    static Zero() {
        return new Amount('0')
    }

    static fromNumber(num: number) {
        return new Amount(num.toString())
    }
}


function clean(text: string) {
    text = text.replace(/,/g, '.')
    text = text.replace(/[^0-9k.+*]/g, '')
    return text
}

function toNumber(text: string) {
    text = text.trim().replace(/,/g, '.')
    console.log('toNumber', text)

    const sums = text.split('+')
    if(sums.some(x => x === '')) return NaN
    const val = sums.reduce((acc, sum) => {
        const mults = sum.split('*')
        if(mults.some(x => x === '')) return NaN
        const res = mults.reduce((acc, mult) => {
            return acc * Number(mult)
        }, 1)
        return acc + res
    }, 0)

    return Number(val)
}
