<template>
   <div class="input">
        <input
            type="text" v-model="value"
            pattern="[0-9.,]*"
            @blur="blur"
        >
    </div>
</template>


<script setup lang="ts">

import { Ref, ref, watch } from 'vue'


const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const value: Ref<string> = ref(`${props.modelValue}` || '')

function propagate(val: number) {
    emit('update:modelValue', val)
}

function toNumber(val: string) {
    val = val.trim().replace(/,/g, '.')
    let newNumber = Number(val)
    if (isNaN(newNumber)) {
        newNumber = 0
    }
    return newNumber
}

// If the new values is a number and its representation is the same as the string representation,
// then propagate the value. We do this to avoid propagating the value when the user is typing.
watch(value, (newValue:string) => {
    newValue = newValue.trim().replace(/,/g, '.')

    const newNumber = toNumber(newValue)

    if(`${newValue}` === `${newNumber}`) {
        propagate(newNumber)
    }
})

watch(() => props.modelValue, (newValue: number) => {
    if (`${newValue}` === `${toNumber(value.value)}`) {
        return
    }
    value.value = `${newValue}`
})

const blur = () => {
    propagate(toNumber(value.value))
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
