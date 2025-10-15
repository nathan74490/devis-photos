<script setup>
  import {RouterLink, RouterView} from 'vue-router'
  import Header from './components/header.vue'
</script>

<template>
  <div id="app">
    <Header />
    <RouterView />
  </div>
</template>