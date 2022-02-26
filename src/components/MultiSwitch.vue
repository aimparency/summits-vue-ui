<template>
  <div class="multi-switch">
    <span v-if="label" class="label"> {{ label }}: </span>
    <div 
      v-for="option, i in options"
      :key="i"
      :style="{backgroundColor: option.color}"
      class="option"
      :class="{ selected: option.value == value}"
      @click="select(i)">
      {{ option.value }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface Option {
 value: string, 
 color: string
}

export default defineComponent({
  emits: ['change'],
  props: {
    label: {
      type: String, 
    }, 
    options: {
      type: Array as PropType<Option[]>,
      required: true  
    }, 
    value: {
      type: String, 
      required: true
    }
  },
  methods: {
    select(i: number) {
      this.$emit('change', this.options[i].value) 
    },
  }
})
</script>

<style lang="less">
@dotsize: 3em;
@import '~@/global.less';

.multi-switch {
  .option {
    color: @foreground; 
    .buttonlike();
    margin: 0.25rem;
    display: inline-block; 
    opacity: 0.7; 
    cursor: pointer;        
    &.selected {
      opacity: 1; 
      border: 0.2rem solid shade(@foreground, 20%); 
    }
  }
}
</style>
