<template>
  <div class="home">
    <h1>Bienvenue sur le site de devis pour tirages photo</h1>
    <p>Choisissez le type de produit pour lequel vous souhaitez obtenir un devis :</p>
    <div class="product-types">
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