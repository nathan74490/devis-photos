<template>
  <div class="home">
    <h1>Simulateur de Devis</h1>
    <p>Sélectionnez un type de produit pour commencer :</p>

    <div class="product-types">
      <!-- Utilisation de router-link pour une navigation native -->
      <router-link
        v-for="product in productTypes"
        :key="product.id"
        :to="product.route"
        class="product-card"
      >
        <h2>{{ product.title }}</h2>
        <p>{{ product.description }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Liste des types de produits (utilisation de ref pour une réactivité future)
const productTypes = ref([
  {
    id: 1,
    title: "Photos Argentiques",
    description: "Devis pour tirages photo argentiques (format, finition, quantité).",
    route: "/photos/argentique", // Correspond à la route dynamique `/photos/:type`
  },
  {
    id: 2,
    title: "Photos Classiques",
    description: "Devis pour impressions sur papier classique (dimensions, cadre, quantité).",
    route: "/photos/classique",
  }
]);
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
  display: block; /* Important pour router-link */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* Supprime le soulignement des liens */
  color: inherit; /* Hérite de la couleur du texte parent */
}

.product-card:hover {
  background-color: #f5f5f5;
  border-color: #4CAF50; /* Couleur verte pour le survol */
  transform: translateY(-3px); /* Effet de soulèvement */
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

p {
  color: #666;
  font-size: 14px;
}
</style>
