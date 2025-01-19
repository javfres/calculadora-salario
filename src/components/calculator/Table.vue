<template>

    <div class="salarytable" :class="{hasb: table.has_b}">

        <template v-if="table.has_b">
            <div class="value title">A</div>
            <div class="value valueb title">B</div>
        </template>
    
        <template v-for="row of table.rows" :key="row.id">
            <div class="entry">{{ row.name }}</div>
            <div class="value" :class="{unique: table.has_b&&!row.has_b}"> {{ row.a }}</div>
            <div v-if="row.has_b" class="value valueb">{{ row.b }}</div>
        </template>

    </div>
</template>
  
<script lang="ts">
import { formatNumberEsp } from '@/utils/utils';

class Row {
    table: Table2;

    static id = 0;
    id: number;
    type: "eur" | "per" | "str" = "str";
    name = "";
    values: string[] = [];

    constructor(table: Table2, name = ""){
        this.table = table;
        this.name = name;
        this.id = (++Row.id);
    }

    eur(): Row {
        this.type = "eur";
        return this;
    }

    per(): Row {
        this.type = "per";
        return this;
    }

    value(v: string|number): Row {

        if (typeof v === "number") {
            if (v != 0) {
                v = formatNumberEsp(v, this.type === "eur");
                switch(this.type) {
                    case "eur":
                        v += '€';
                        break;
                    case "per":
                        v += '%';
                        break;
                }
            } else {
                v = "-";
            }
        }

        this.values.push(v);
        return this;
    }

    get has_b() {
        return this.values.length > 1;
    }

    get is_span() {
        return this.has_b && this.values.length < 2;
    }

    get a() {
        return this.values.length < 1 ? "" : this.values[0];
    }

    get b() {
        return this.values.length < 2 ? "" : this.values[1];
    }

}

export class Table2 {
    rows: Row[] = [];

    get has_b() {
        return this.rows.some(r => r.has_b);
    }

    row(name?: string): Row {
        const r = new Row(this, name);
        this.rows.push(r);
        return r;
    }
}

</script>
  
<script setup lang="ts">


interface Props {
    table: Table2
}

defineProps<Props>()

</script>


<style lang="scss" scoped>

.salarytable {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 14px;

    background: rgb(233, 247, 231);
    margin-top: 10px;
    padding: 10px;

    .entry {
        grid-column-start: 1;
        grid-column-end: 2;
    }

    .value {
        grid-column-start: 2;
        font-weight: bold;
        color: rgb(30, 73, 25);
        text-align: right;
        display: inline-block;
    }

    &.hasb {
        grid-template-columns: 1fr auto auto auto auto;

        .value {

            padding-left: 5px;
            padding-right: 5px;

            grid-column-start: 2;
            grid-column-end: 4;

            &.valueb {
                grid-column-start: 4;
                grid-column-start: 6;
            }

            &.unique {
                grid-column-start: 3;
                grid-column-end: 5;
            }

            &.title {
                text-align: center;
            }
        }
    }
}

</style>
