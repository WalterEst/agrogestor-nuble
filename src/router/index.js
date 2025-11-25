import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../componentes/Login.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'
import ProductosPublicos from '../componentes/ProductosPublicos.vue'
import DetalleProducto from '../componentes/DetalleProducto.vue'

const routes = [
  {
    path: '/',
    redirect: '/productos'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Ingresa a MarketVue' }
  },
  {
    path: '/productos',
    name: 'productos',
    component: ProductosPublicos,
    meta: { title: 'Catálogo de productos | MarketVUE' }
  },
  {
    path: '/productos/:id',
    name: 'detalle-producto',
    component: DetalleProducto,
    meta: { title: 'Detalles del producto | MarketVUE' }
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