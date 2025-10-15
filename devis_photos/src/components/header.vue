<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Default Title')
</script>
<template>
  <nav>
      <div class="button-navBar">
          <RouterLink to="/" class="nav-link">
              <h3>Home</h3>
          </RouterLink>
          <RouterLink to="/about" class="nav-link">
              <h3>About</h3> 
          </RouterLink>
      </div>
  </nav>
</template>

<style scoped>
h1 {
    font-family: "Pathway Extreme", serif;
    font-optical-sizing: auto;
    font-style: normal;
    font-weight: bold;
    font-size: 34px;
    font-variation-settings:"wdth" 100;
    color:white;
    margin-left: 4vw;
}
</style>