<template>
  <div class="home">
    <div class="hero">
      <h1>Simulateur de Devis</h1>
      <p>Sélectionnez un type de produit pour commencer :</p>
    </div>

    <div class="product-grid">
      <router-link
        v-for="product in productTypes"
        :key="product.id"
        :to="product.route"
        class="product-card"
      >
        <div class="card-content">
          <div class="card-icon">{{ product.icon }}</div>
          <h2>{{ product.title }}</h2>
          <p>{{ product.description }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const productTypes = ref([
  {
    id: 1,
    title: "Photos Argentiques",
    description: "Devis pour tirages photo argentiques : format, finition, quantité.",
    route: "/photos/argentique",
    icon: "🎞️",
  },
  {
    id: 2,
    title: "Photos Classiques",
    description: "Devis pour impressions classiques : dimensions, cadre, quantité.",
    route: "/photos/classique",
    icon: "🖼️",
  },
]);
</script>

<style scoped>
.home {
  padding: 60px 100px;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: center;
  color: #2c3e50;
}

.hero h1 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #2e7d32;
}

.hero p {
  font-size: 1.1rem;
  color: #555;
  margin-top: 10px;
  margin-bottom: 50px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.25);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

h2 {
  font-size: 1.4rem;
  color: #2c3e50;
}

p {
  color: #666;
  font-size: 1rem;
}
</style>