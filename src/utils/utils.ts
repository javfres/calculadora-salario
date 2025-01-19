// Use , for decimals and . for thousands
export function formatNumberEsp(value: number, optionalDecimals = false): string {
    let str = value.toFixed(2).replace(/\./g, ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
    if (optionalDecimals) {
        str = str.replace(/,00$/, '');
    }
    return str;
}
