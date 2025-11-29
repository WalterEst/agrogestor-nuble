import { createRouter, createWebHistory } from 'vue-router'
import { readSessionFromStorage } from '../stores/session'

// 1. IMPORTACIONES GENERALES (Nombres de archivo originales)
import LoginView from '../componentes/Login.vue'
import RegistroView from '../componentes/Registro.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'
import ProductosPublicos from '../componentes/ProductosPublicos.vue' 
import DetalleProducto from '../componentes/DetalleProducto.vue'
import AdminUserDetailView from '../views/AdminUserDetailView.vue'
import AdminPublicationDetailView from '../views/AdminPublicationDetailView.vue'

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
    meta: {
      title: 'Panel Administrador',
      authRequired: true,
      allowedRoles: [1, 2, 'admin', 'administrador', 'moderador', 'moderator']
    }
  },
    {
    path: '/admin/publicaciones/:id',
    name: 'admin-publication-detail',
    component: AdminPublicationDetailView,
    props: true,
    meta: {
      title: 'Detalle de publicación',
      authRequired: true,
      allowedRoles: [1, 2, 'admin', 'administrador', 'moderador', 'moderator']
    }
  },
  {
    path: '/admin/usuarios/:id',
    name: 'admin-user-detail',
    component: AdminUserDetailView,
    props: true,
    meta: {
      title: 'Detalle de usuario',
      authRequired: true,
      allowedRoles: [1, 2, 'admin', 'administrador', 'moderador', 'moderator']
    }
  },
  
  // --- RUTAS PROTEGIDAS DEL PUBLICADOR ---
  {
    path: '/panel/publicador',
    component: DashboardLayout,
    meta: { authRequired: true, allowedRoles: ['publisher', 'publicador', 'vendedor', 3] },
    children: [
      {
        path: 'mis-productos', 
        alias: 'mis-publicaciones', 
        name: 'publisher-products', 
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
      },
      {
        path: 'perfil',
        name: 'publisher-profile',
        component: () => import('../views/dashboard/publisher/EditProfileView.vue'),
        meta: { title: 'Mi Perfil' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const userHasAllowedRole = (user, allowedRoles) => {
  if (!allowedRoles.length) return true

  const roleId = Number(user?.rol_id ?? user?.rolId ?? user?.roleId)
  const roleName = String(user?.rol ?? user?.role ?? '').toLowerCase()

  return allowedRoles.some((role) => {
    if (typeof role === 'number') {
      return roleId === Number(role)
    }

    if (typeof role === 'string') {
      return roleName === role.toLowerCase()
    }

    return false
  })
}

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta?.authRequired)
  const allowedRoles = to.matched.flatMap((record) => record.meta?.allowedRoles ?? [])
  const session = readSessionFromStorage()
  const user = session?.usuario
  const isAuthenticated = Boolean(user)

  if (requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (allowedRoles.length && (!isAuthenticated || !userHasAllowedRole(user, allowedRoles))) {
    return { name: 'publicaciones' }
  }

  return true
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router