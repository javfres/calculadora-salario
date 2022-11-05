<template>
    <button class="button">
        <slot></slot>
    </button>
</template>
  
  
<script lang="ts">

import { Options, Vue, prop } from 'vue-class-component';

class Props {
    disabled = prop({default: false})
}

@Options({})
export default class Button extends Vue.with(Props) {


}

</script>



<style scoped>
    .button {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        display: inline-block;
        font-size: 16px;
    }
</style>
