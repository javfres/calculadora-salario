<template>
   <div class="input">
        <input
            type="text" v-model="value"
            @blur="blur"
        >
    </div>
</template>


<script setup lang="ts">

import Amount from '@/irpf/config/amount'
import { Ref, ref, watch } from 'vue'


const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

console.log('props', props.modelValue)

const value: Ref<string> = ref((props.modelValue || Amount.Zero() ).getText())

function propagate(val: Amount) {
    emit('update:modelValue', val)
}

function toNumber(text: string) {
    text = text.trim().replace(/,/g, '.')
    console.log('toNumber', text)

    const sums = text.split('+')
    const val = sums.reduce((acc, sum) => {
        const mults = sum.split('*')
        const res = mults.reduce((acc, mult) => {
            return acc * Number(mult)
        }, 1)
        return acc + res
    }, 0)

    return Number(val)
}

function toNumberOr0(text: string) {
    const val = toNumber(text)
    return isNaN(val) ? 0 : val
}

// To avoid propagating the value when the user is typing
// only propagate when the value is a number
watch(value, (newValue:string) => {
    newValue = newValue.trim().replace(/,/g, '.')

    const newNumber = toNumber(newValue)
    if (isNaN(newNumber)) {
        return
    }

    propagate(Amount.fromNumber(newNumber)) 
})

watch(() => props.modelValue, (newValue: Amount) => {
    if (`${newValue.getValue()}` === `${toNumber(value.value)}`) {
        return
    }
    value.value = newValue.getText()
})

const blur = () => {
    propagate(new Amount(value.value))
}

</script>

<style lang="scss" scoped>

.input {
    input {
        padding: 10px 10px;
        box-sizing: border-box;
        width: 100%;
    }
}

</style>
