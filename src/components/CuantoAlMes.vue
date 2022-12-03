<template>
    <div class="cuantoalmes">

        ¿Cuanto hay que cobrar para ganar X al mes?:
        <a class="pointer" @click="open = true">calcular</a>

        <Teleport :to="'#app'">
            <div v-if="open" class="modal">
                <p>¿Cuanto hay que cobrar para ganar {{ salary }} al mes?</p>
                <input type="number" step="100" min="0" v-model="salary" />
                <button @click.prevent="calculate">Calcular</button>
            </div>
        </Teleport>

    </div>
</template>
  
<script setup lang="ts">

import { ref } from 'vue'

const open = ref(false)
const salary = ref(1000);

const emit = defineEmits(['alMes']);


function calculate(){
    open.value = false;
    emit("alMes", salary.value);
}

</script>


<style lang="scss" scoped>

$width: 300px;

.pointer {
    cursor: pointer;
}

.modal {
    position: fixed;
    z-index: 999;
    top: 20%;
    left: 50%;
    width: $width;
    margin-left: -$width/2;

    padding: 20px;
    background-color: rgba(255, 255, 255, 0.91);
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0.475);

    
    display: flex;
    flex-direction: column;

    input, button {
        padding: 10px 10px;
        margin: 4px 0;
        box-sizing: border-box;
        flex: 1;
        //flex-basis: 0;
        width: 100%;
    }

}

</style>
