<template>
  <SideMenuHeader>
    <h4> near profile </h4>
  </SideMenuHeader>
  <SideMenuContent class="near-profile">
    <p>connection state: {{ $store.state.nearState }} </p>
    <p>
    <a :href="walletUrl">wallet link</a> <br/>
    <a :href="nodeUrl">node link</a> <br/>
    <a :href="helperUrl">helper link</a>
    </p>
    <button>logout</button>
    <button @click="requestSignIn">request sign in</button>
  </SideMenuContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ActionTypes } from '@/actions';

import SideMenuHeader from './SideMenuHeader.vue'; 
import SideMenuContent from './SideMenuContent.vue'; 

import nearConfig from '@/near-config'; 

export default defineComponent({
  name: 'NearProfile',
  components: {
    SideMenuHeader,
    SideMenuContent
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }, 
  }, 
  computed: {
    walletUrl() : string {
      return nearConfig.walletUrl
    }, 
    nodeUrl() : string {
      return nearConfig.nodeUrl
    }, 
    helperUrl() : string {
      return nearConfig.helperUrl
    }
  }, 
  methods: {
    requestSignIn() {
      this.$store.dispatch(ActionTypes.REQUEST_NEAR_SIGN_IN) 
    }, 
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

h4 {
  font-size: 1rem;
  margin: 0; 
  padding: 0; 
  text-align: center;
}

.near-profile {
  a {
    color: #8af; 
  }
}

</style>
