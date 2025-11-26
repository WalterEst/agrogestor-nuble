import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../componentes/Login.vue'
import RegistroView from '../componentes/Registro.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'
import Publicaciones from '../componentes/Publicaciones.vue'

const routes = [
  {
    path: '/',
        redirect: '/publicaciones'
  },
  {
    path: '/publicaciones',
    name: 'publicaciones',
    component: Publicaciones,
    meta: { title: 'Publicaciones | MarkeVUE' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Ingresa a MarketVue' }
    },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { title: 'Panel administrador | MarketVUE' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router