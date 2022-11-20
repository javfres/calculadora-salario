<template>
    <div class="cuantoalmes">

        ¿Cuanto hay que cobrar para ganar X al mes?: <a @click="open = true">calcular</a>

        <Teleport to="body">
            <div v-if="open" class="modal">
                <p>Hello from the modal!</p>
                <input type="number" min="0" v-model="salary" />
                <button @click="calculate">Calcular</button>
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
    console.log(salary.value);
    open.value = false;
    emit("alMes", salary.value);
}

</script>


<style scoped>

.modal {
    position: fixed;
    z-index: 999;
    top: 20%;
    left: 50%;
    width: 300px;
    margin-left: -150px;
    background-color: beige;
}

</style>
