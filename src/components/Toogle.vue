<template>
    <label class="switch">
        <input type="checkbox" v-model="value" />
        <span class="slider round"></span>
    </label>
</template>
  
  
<script setup lang="ts">

import { defineProps, defineEmits, ref, watch } from "vue"


const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = ref(props.modelValue.value)

watch(value, (newValue) => {
  console.log('newValue', newValue)
  emit('update:modelValue', newValue)
})

</script>


<style lang="scss" scoped>

$size: 20px;
$margin: 2px;
$width: 40px;

$out_size: $size + 2*$margin;

.switch {
  
  position: relative;
  display: inline-block;
  width: $width;
  height: $out_size;

  input { 
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: $size;
    width: $size;
    left: $margin;
    bottom: $margin;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked + .slider:before {
    transform: translateX($width - $size - 2*$margin);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: $size
  }
  .slider.round:before {
    border-radius: 50%;
  }
}

</style>
