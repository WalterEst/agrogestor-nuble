import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '../views/Inicio.vue'
import AtractivosView from '../views/Atractivos.vue'
import GastronomiaView from '../views/Gastronomia.vue'
import ContactoView from '../views/Contacto.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'inicio', component: InicioView },
    { path: '/atractivos', name: 'atractivos', component: AtractivosView },
    { path: '/gastronomia', name: 'gastronomia', component: GastronomiaView },
    { path: '/contacto', name: 'contacto', component: ContactoView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
