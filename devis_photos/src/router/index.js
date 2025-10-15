import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/home.vue';

const routes = [
  { 
    path: '/', 
    name: 'home', 
    component: HomeView
  },
  { 
    path: '/about', 
    name: 'about', 
    component: () => import('../views/about.vue'), 
    meta: { title: 'About' } 
  } 
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;