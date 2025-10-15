<template>
  <div class="home">
    <h1>Simulateur de Devis</h1>
    <p>Sélectionnez un type de produit pour commencer :</p>

    <div class="product-types">
      <!-- Liste des types de produits -->
      <div
        v-for="product in productTypes"
        :key="product.id"
        class="product-card"
        @click="goToProduct(product.route)"
      >
        <h2>{{ product.title }}</h2>
        <p>{{ product.description }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';

// Liste des types de produits
const productTypes = [
  {
    id: 1,
    title: "Photos",
    description: "Devis pour tirages photo (format, finition, quantité).",
    route: "/photos",
  }
];

// Utilisation du router pour la navigation
const router = useRouter();
const goToProduct = (route) => {
  router.push(route);
};
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.product-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.product-card:hover {
  background-color: #f5f5f5;
}

h2 {
  color: #2c3e50;
}

p {
  color: #666;
}
</style>