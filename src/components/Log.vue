<template>
  <div class="log">
    <div 
      v-for="logEntry, i in logEntries"
      :key="logEntry.id"
      class="wrapper">
      <div
        @click.stop=""
        @mousedown.stop=""
        class="entry"
        :class="logEntry.type">
        {{ logEntry.msg }}
      </div>
      <button
        class='remove'
        @mousedown.stop=""
        @click.stop='remove(i)'>
        &#128473; 
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Log',
  computed: {
    logEntries() {
      console.log(this.$store.state.logEntries)

      return this.$store.state.logEntries
    }
  },
  methods: {
    remove(key: number) {
      console.log("key", key) 
      this.$store.state.logEntries.splice(key,1)

    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less';

.log{
  position: fixed; 
  left: 0.2rem; 
  top: 0.2rem; 
  height: calc(100vh - 2rem); 
  width: 50vw; 
  pointer-events: none; 
  box-sizing: border-box; 
  .wrapper {
    top: 0; 
    transition: top 0.3s ease-in-out; 
    margin: 0.5rem; 
    .entry{
      pointer-events: all; 
      max-width: 50vw; 
      display: inline-block; 
      vertical-align: middle; 
      box-sizing: border-box; 
      margin:0; 
      padding: 0.5rem; 
      padding-right: 2.5rem;
      border-radius: 0.2rem; 
      &.ui-error, &.near-error, &.transaction-error {
        background-color: fade(tint(@error, 50%), 50%); 
        &::before{
          content: '🗲 '
        }
      }
      &.info {
        background-color: fade(tint(@info, 50%), 50%); 
        &::before {
          content: '🛈 '
        }
      }
      &.warning {
        &::before {
          content: '⚠ '
        }
      }
    }
    .remove {
      pointer-events: all; 
      display: inline-block; 
      vertical-align: top; 
      height: 2rem; 
      width: 2rem; 
      margin-left: -2rem; 
      cursor: pointer; 
    }
  }
}
</style>
