<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Simulateur de Devis')
</script>

<template>
  <header class="app-header">
    <nav class="navbar">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">📸</span>
        <h1>{{ pageTitle }}</h1>
      </RouterLink>

      <div class="nav-right">
        <RouterLink
          to="/"
          class="nav-link"
          :class="{ active: route.path === '/' }"
        >
          Accueil
        </RouterLink>
        <RouterLink
          to="/about"
          class="nav-link"
          :class="{ active: route.path === '/about' }"
        >
          À propos
        </RouterLink>
        <RouterLink
          to="/contact"
          class="nav-link"
          :class="{ active: route.path === '/contact' }"
        >
          Contact
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  width: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #2e7d32 100%);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 80px;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 10px;
}
.logo-icon {
  font-size: 1.8rem;
}
.logo h1 {
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 1.6rem;
  color: white;
  letter-spacing: -0.5px;
}

.nav-right {
  display: flex;
  gap: 40px;
}

.nav-link {
  position: relative;
  text-decoration: none;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.active {
  color: #ffffff;
}
.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  height: 2px;
  width: 100%;
  background: white;
  border-radius: 2px;
}
</style>