<template>
  <div class="salarytable">

    <div class="row" v-for="item of items" :key="item.name">
      <div class="entry">{{ item.name }}</div>
      <div class="value"> {{ item.value }}</div>
    </div>

  </div>
</template>
  
  
<script lang="ts">

import { Options, Vue } from 'vue-class-component';

import { TableItem } from '@/types';


class Props {
    items?: TableItem[]
}

@Options({})
export default class Table extends Vue.with(Props) {


}

</script>


<style scoped>
.salarytable {
  display: flex;
  flex-direction: column;
  background: rgb(233, 247, 231);
  margin-top: 10px;
  padding: 10px;
  gap: 5px
}

.salarytable .row {
  display: flex;
  flex-direction: row;
}

.salarytable .row .value {
  text-align: right;
  flex-grow: 1;
  font-weight: bold;
  color: rgb(30, 73, 25);
}


</style>
