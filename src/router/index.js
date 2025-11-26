import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../componentes/Login.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'
import Publicaciones from '../componentes/Publicaciones.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import MyProductsView from '../views/dashboard/publisher/MyProductsView.vue'
import ProductFormView from '../views/dashboard/publisher/ProductFormView.vue'
import ProductDetailView from '../views/dashboard/publisher/ProductDetailView.vue'

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
    },
  {
    path: '/panel/publicador',
    component: () => import('../layouts/DashboardLayout.vue'), 
    meta: { authRequired: true, allowedRoles: ['publisher'] },
    children: [
    {
      path: 'mis-productos',
      name: 'publisher-products',
      component: () => import('../views/dashboard/publisher/MyProductsView.vue')
    },
    {
      path: 'producto/editar/:id',
      name: 'publisher-edit-product',
      component: () => import('../views/dashboard/publisher/ProductFormView.vue'),
      props: true
    },
    {
      path: 'producto/detalle/:id',
      name: 'publisher-product-detail',
      component: () => import('../views/dashboard/publisher/ProductDetailView.vue'),
      props: true
    }
    ]
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