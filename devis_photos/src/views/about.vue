<template>
  <div class="home">
    <h1>Simulateur de Devis</h1>
    <div v-if="isLoading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="product-types">
      <router-link
        v-for="format in productTypes"
        :key="format.id"
        :to="format.route"
        class="product-card"
      >
        <h2>{{ format.label }}</h2>
        <p>{{ format.unit_price_ex_vat }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const productTypes = ref([]);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('http://192.168.10.177:8081/api/formats');
    if (!response.ok) {
      throw new Error('Erreur serveur');
    }
    productTypes.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});
</script>
