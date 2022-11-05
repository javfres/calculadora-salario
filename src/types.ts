export type BarItem = {
    name: string,
    amount: number,
    subitems?: BarItem[]
}

export type TableItem = {
    name: string,
    value: string,
}