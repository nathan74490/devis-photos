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

<style>
/* === RESET GLOBAL === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === BASE GLOBALE === */
html, body, #app {
  font-family: "Inter", system-ui, sans-serif;
  background: #f9f9f9;
  color: #2c3e50;
}

/* === Supprime toute contrainte de centrage === */
body {
  display: flex;
  flex-direction: column;
}

/* === Liens par défaut === */
a {
  text-decoration: none;
  color: inherit;
}
</style>