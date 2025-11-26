import { createRouter, createWebHistory } from 'vue-router'

// 1. IMPORTACIONES GENERALES (Nombres de archivo originales)
import LoginView from '../componentes/Login.vue'
import RegistroView from '../componentes/Registro.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'
import ProductosPublicos from '../componentes/ProductosPublicos.vue' 
import DetalleProducto from '../componentes/DetalleProducto.vue'

// 2. IMPORTACIONES DEL DASHBOARD PUBLICADOR
import DashboardLayout from '../layouts/DashboardLayout.vue'
import MyProductsView from '../views/dashboard/publisher/MyProductsView.vue'
import ProductFormView from '../views/dashboard/publisher/ProductFormView.vue'
import ProductDetailView from '../views/dashboard/publisher/ProductDetailView.vue'

const routes = [
  // --- RUTAS PÚBLICAS ---
  {
    path: '/',
    redirect: '/publicaciones' // Redirección corregida
  },
  {
    path: '/publicaciones', // URL visible: /publicaciones
    name: 'publicaciones',
    component: ProductosPublicos,
    meta: { title: 'Catálogo de Publicaciones | MarketVUE' }
  },
  {
    path: '/publicaciones/:id', // URL visible: /publicaciones/5
    name: 'detalle-publicacion',
    component: DetalleProducto,
    meta: { title: 'Detalle de la Publicación | MarketVUE' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Ingresa a MarketVue' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegistroView,
    meta: { title: 'Registro | MarketVUE' }
  },

  // --- RUTA ADMINISTRADOR ---
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { title: 'Panel Administrador' }
  },

  // --- RUTAS PROTEGIDAS DEL PUBLICADOR ---
  {
    path: '/panel/publicador',
    component: DashboardLayout,
    meta: { authRequired: true, allowedRoles: ['publisher'] },
    children: [
      {
        path: 'mis-publicaciones', // URL: /panel/publicador/mis-publicaciones
        name: 'publisher-products', // Mantenemos el name interno por si acaso
        component: MyProductsView,
        meta: { title: 'Mis Publicaciones' }
      },
      {
        path: 'publicacion/nueva',
        name: 'publisher-create-product',
        component: ProductFormView,
        props: { id: null },
        meta: { title: 'Nueva Publicación' }
      },
      {
        path: 'publicacion/editar/:id',
        name: 'publisher-edit-product',
        component: ProductFormView,
        props: true,
        meta: { title: 'Editar Publicación' }
      },
      {
        path: 'publicacion/detalle/:id',
        name: 'publisher-product-detail',
        component: ProductDetailView,
        props: true,
        meta: { title: 'Detalle de Publicación' }
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