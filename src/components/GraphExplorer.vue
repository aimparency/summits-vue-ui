<template>
  <div class="svgtest">
    <p> here is a svg element, let's bring this to work in vue </p>
    <svg>
      <SVGPath/>
    </svg>
    <div v-for="node_id, node in state.nodes" :key="node_id"> {{ node }} </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SVGPath from './SVGPath.vue';

export default defineComponent({
  name: 'HelloWorld',
  components: {
    SVGPath
  },
  props: {
    msg: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
