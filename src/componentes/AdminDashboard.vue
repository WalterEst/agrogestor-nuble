<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'

const usuarios = ref([])
const solicitudesPublicacion = ref([])
const publicaciones = ref([])
const notasModeracion = ref('')
const mensajeSistema = ref('')
const cargando = ref(false)
const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

const filtrosUsuarios = reactive({
  busqueda: '',
  rol: '',
  estado: ''
})

const filtrosSolicitudes = reactive({
  busqueda: '',
  estado: ''
})

const filtrosPublicaciones = reactive({
  busqueda: '',
  visibilidad: ''
})

const publicacionEnProceso = ref(null)
const usuarioEnProceso = ref(null)
const sessionStore = useSessionStore()
const esSuperAdmin = computed(
  () => sessionStore.roleId === 1 || sessionStore.roleName === 'super administrador'
)

const usuariosFiltrados = computed(() => {
  const termino = filtrosUsuarios.busqueda.toLowerCase()
  const rol = filtrosUsuarios.rol
  const estado = filtrosUsuarios.estado

  return usuarios.value.filter((usuario) => {
    const coincideBusqueda =
      !termino ||
      usuario.nombre?.toLowerCase().includes(termino) ||
      usuario.apellido?.toLowerCase().includes(termino) ||
      usuario.email?.toLowerCase().includes(termino)
    const coincideRol = !rol || String(usuario.rol_id || usuario.rolId) === String(rol)
    const coincideEstado = !estado || usuario.estado === estado

    return coincideBusqueda && coincideRol && coincideEstado
  })
})

const normalizarVisibilidad = (valor) => {
  if (valor === 'rechazada') return 'oculta'
  if (valor === 'pendiente_revision') return 'borrador'
  return valor || 'publicada'
}


const router = useRouter()

const totales = computed(() => ({
  usuarios: usuarios.value.length,
  solicitudes: solicitudesPublicacion.value.length,
  publicaciones: publicaciones.value.length
}))

const solicitudesFiltradas = computed(() => {
  const termino = filtrosSolicitudes.busqueda.toLowerCase()
  const estado = filtrosSolicitudes.estado

  return solicitudesPublicacion.value.filter((solicitud) => {
    const coincideBusqueda =
      !termino ||
      solicitud.titulo?.toLowerCase().includes(termino) ||
      solicitud.autor?.toLowerCase().includes(termino) ||
      solicitud.categoria?.toLowerCase().includes(termino)
    const coincideEstado = !estado || solicitud.estado_publicacion === estado

    return coincideBusqueda && coincideEstado
  })
})

const publicacionesFiltradas = computed(() => {
  const termino = filtrosPublicaciones.busqueda.toLowerCase()
  const visibilidad = filtrosPublicaciones.visibilidad

  return publicaciones.value
    .filter((publicacion) => {
      const coincideBusqueda =
        !termino ||
        publicacion.titulo?.toLowerCase().includes(termino) ||
        publicacion.autor?.toLowerCase().includes(termino) ||
        publicacion.categoria?.toLowerCase().includes(termino)
      const coincideVisibilidad = !visibilidad || publicacion.visibilidad === visibilidad

      return coincideBusqueda && coincideVisibilidad
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
})

const registrarAccion = (texto) => {
  mensajeSistema.value = texto
  setTimeout(() => {
    mensajeSistema.value = ''
  }, 3200)
}

const sincronizarDashboard = async () => {
  cargando.value = true
  try {
    const response = await fetch(`${apiBase}/admin/dashboard`)
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No pudimos cargar los datos del panel')
    }

    usuarios.value = Array.isArray(payload.usuarios) ? payload.usuarios : []
    solicitudesPublicacion.value = Array.isArray(payload.solicitudes)
      ? payload.solicitudes
      : []
    publicaciones.value = Array.isArray(payload.publicaciones)
      ? payload.publicaciones.map((item) => ({
          ...item,
          visibilidad: normalizarVisibilidad(item.visibilidad || item.estado_publicacion)
        }))
      : []
    registrarAccion('Datos del panel sincronizados con backend.')
  } catch (error) {
    registrarAccion(error.message || 'Error al cargar datos. Revisa la conexión con el backend.')
  } finally {
    cargando.value = false
  }
}

const actualizarEstadoPublicacion = async (solicitud, estado_publicacion) => {
  if (!solicitud?.id) {
    registrarAccion('No se pudo identificar la solicitud seleccionada.')
    return null
  }

  const response = await fetch(`${apiBase}/admin/publicaciones/${solicitud.id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado_publicacion })
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || 'No fue posible actualizar la publicación')
  }

  return payload.publicacion || { id: solicitud.id, estado_publicacion }
}

const solicitudEnRevision = ref(null)

const procesarRevision = async (solicitud, accion) => {
  if (!solicitud?.id) {
    registrarAccion('Selecciona una solicitud válida para continuar.')
    return
  }

  const estado_publicacion = accion === 'aprobar' ? 'publicada' : 'rechazada'
  solicitudEnRevision.value = solicitud.id

  try {
    const publicacionActualizada = await actualizarEstadoPublicacion(solicitud, estado_publicacion)

    solicitudesPublicacion.value = solicitudesPublicacion.value.filter((item) => item.id !== solicitud.id)

    const existente = publicaciones.value.findIndex((item) => item.id === solicitud.id)
    const registroBase = {
      id: solicitud.id,
      titulo: solicitud.titulo,
      autor: solicitud.autor,
      categoria: solicitud.categoria,
      fecha: solicitud.fecha,
      visibilidad: normalizarVisibilidad(estado_publicacion)
    }

    if (existente >= 0) {
      publicaciones.value.splice(existente, 1, {
        ...publicaciones.value[existente],
        ...registroBase,
        ...publicacionActualizada,
        visibilidad: normalizarVisibilidad(publicacionActualizada.estado_publicacion || registroBase.visibilidad)
      })
    } else {
      publicaciones.value.unshift({
        ...registroBase,
        ...publicacionActualizada,
        visibilidad: normalizarVisibilidad(publicacionActualizada.estado_publicacion || registroBase.visibilidad)
      })
    }

    registrarAccion(
      estado_publicacion === 'publicada'
        ? 'Publicación aprobada y movida a la lista activa.'
        : 'Publicación rechazada correctamente.'
    )
  } catch (error) {
    registrarAccion(error.message || 'No se pudo procesar la solicitud. Inténtalo nuevamente.')
  } finally {
    solicitudEnRevision.value = null
  }
}

const irAlDetallePublicacion = (solicitud) => {
  if (!solicitud?.id) return
  router.push({ name: 'admin-publication-detail', params: { id: solicitud.id } })
}

const editarPublicacion = (publicacion) => {
  if (!publicacion?.id) return
  router.push({ name: 'admin-publication-detail', params: { id: publicacion.id }, query: { modo: 'editar' } })
}

const ocultarOEliminarPublicacion = async (publicacion, accion = 'ocultar') => {
  if (!publicacion?.id || publicacionEnProceso.value) return
  publicacionEnProceso.value = publicacion.id

  try {
    if (accion === 'eliminar') {
      const response = await fetch(`${apiBase}/publisher/products/${publicacion.id}`, { method: 'DELETE' })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || 'No fue posible eliminar la publicación')
      }

      publicaciones.value = publicaciones.value.filter((item) => item.id !== publicacion.id)
      registrarAccion('Publicación eliminada correctamente.')
      return
    }

    const response = await fetch(`${apiBase}/admin/publicaciones/${publicacion.id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_publicacion: 'oculta' })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No fue posible actualizar la visibilidad')
    }

    publicaciones.value = publicaciones.value.map((item) =>
      item.id === publicacion.id
        ? {
            ...item,
            ...payload.publicacion,
            visibilidad: normalizarVisibilidad(payload.publicacion?.estado_publicacion || 'oculta')
          }
        : item
    )

    registrarAccion('Publicación marcada como oculta.')
  } catch (error) {
    registrarAccion(error.message || 'No se pudo completar la acción solicitada.')
  } finally {
    publicacionEnProceso.value = null
  }
}


const irAlDetalleUsuario = (usuario) => {
  if (!usuario?.id) {
    registrarAccion('No pudimos abrir el detalle del usuario seleccionado.')
    return
  }

  router.push({ name: 'admin-user-detail', params: { id: usuario.id } })
}

const confirmarYEliminarUsuario = async (usuario) => {
  if (!usuario?.id) {
    registrarAccion('No pudimos identificar al usuario seleccionado.')
    return
  }

  if (!esSuperAdmin.value) {
    registrarAccion('Solo el super administrador puede eliminar usuarios.')
    return
  }

  const confirmado = window.confirm(
    `¿Eliminar la cuenta de ${usuario.nombre}? Se eliminarán también todas sus publicaciones y no podrás deshacer esta acción.`
  )

  if (!confirmado) return

  usuarioEnProceso.value = usuario.id

  try {
    const response = await fetch(`${apiBase}/admin/usuarios/${usuario.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': sessionStore.roleId || ''
      }
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No fue posible eliminar el usuario')
    }

    usuarios.value = usuarios.value.filter((item) => item.id !== usuario.id)
    solicitudesPublicacion.value = solicitudesPublicacion.value.filter(
      (item) => item.autor !== usuario.nombre && item.usuario_id !== usuario.id
    )
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    publicaciones.value = publicaciones.value.filter(
      (item) => item.usuario_id !== usuario.id && item.autor !== nombreCompleto && item.autor !== usuario.nombre
    )

    registrarAccion(payload?.message || 'Usuario y publicaciones eliminados correctamente.')
    await sincronizarDashboard()
  } catch (error) {
    registrarAccion(error.message || 'No se pudo eliminar el usuario. Inténtalo más tarde.')
  } finally {
    usuarioEnProceso.value = null
  }
}

onMounted(sincronizarDashboard)
</script>

<template>
  <section class="admin">
    <header class="admin__hero">
      <div>
        <p class="pill pill--success">Panel administrador</p>
        <h1>Gestión centralizada de MarkeVUE</h1>
          <p class="muted">
            Supervisa usuarios, valida publicaciones y administra la información de la plataforma desde un solo lugar.
            Los datos se cargan desde el backend cuando está disponible; si no hay registros verás los estados vacíos.
          </p>
        </div>
      <div class="hero__actions">
        <button class="btn btn--primary" type="button" @click="registrarAccion('Acción rápida programada para ejecutarse con el backend.')">
          Crear rol o permiso
        </button>
        <button class="btn btn--ghost" type="button" @click="registrarAccion('Sincronización pendiente de conexión.')">
          Sincronizar cambios
        </button>
      </div>
    </header>

    <div class="grid-responsive admin__stats">
      <article class="card stat">
        <p class="stat__label">Usuarios activos</p>
        <p class="stat__value">{{ totales.usuarios }}</p>
        <p class="stat__hint">Incluye todos los roles habilitados. Si no hay registros se mostrará "0".</p>
      </article>
      <article class="card stat">
        <p class="stat__label">Solicitudes pendientes</p>
        <p class="stat__value">{{ totales.solicitudes }}</p>
        <p class="stat__hint">Revisa y aprueba solicitudes de publicación.</p>
      </article>
      <article class="card stat">
        <p class="stat__label">Publicaciones visibles</p>
        <p class="stat__value">{{ totales.publicaciones }}</p>
        <p class="stat__hint">Controla qué publicaciones continúan disponibles.</p>
      </article>
    </div>

    <section class="card admin__panel">
      <header class="panel__header">
        <div>
          <h2>Gestión de usuarios</h2>
          <p class="muted">Filtra, edita y actualiza los datos de cuentas existentes.</p>
        </div>
        <div class="panel__actions">
          <button class="btn btn--ghost" type="button" @click="sincronizarDashboard" :disabled="cargando">
            {{ cargando ? 'Sincronizando...' : 'Refrescar datos' }}
          </button>
          <button class="btn btn--primary" type="button" @click="registrarAccion('Exportación pendiente de backend.')">Exportar</button>
        </div>
      </header>

      <div class="filters">
        <label class="field">
          <span>Búsqueda</span>
          <input v-model="filtrosUsuarios.busqueda" type="search" placeholder="Nombre, correo o rut" />
        </label>
        <label class="field">
          <span>Rol</span>
            <select v-model="filtrosUsuarios.rol">
              <option value="">Todos</option>
              <option value="1">Superadministrador</option>
              <option value="2">Administrador</option>
              <option value="3">Vendedor</option>
            </select>
          </label>
        <label class="field">
          <span>Estado</span>
          <select v-model="filtrosUsuarios.estado">
            <option value="">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="pendiente">Pendiente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </label>
      </div>

      <div v-if="usuariosFiltrados.length" class="list">
        <article v-for="usuario in usuariosFiltrados" :key="usuario.id" class="list__item">
          <div class="list__info">
            <p class="list__title">{{ usuario.nombre }}</p>
            <p class="muted">{{ usuario.email }} · Rol: {{ usuario.rol }}</p>
          </div>
          <div class="list__meta">
            <span class="pill" :class="usuario.estado === 'aprobado' ? 'pill--success' : usuario.estado === 'pendiente' ? 'pill--warning' : 'pill--error'">
              {{ usuario.estado || 'sin estado' }}
            </span>
            <div class="list__buttons">
              <button class="btn btn--ghost" type="button" @click="irAlDetalleUsuario(usuario)">Editar</button>
              <button
                class="btn btn--ghost"
                type="button"
                :disabled="usuarioEnProceso === usuario.id || !esSuperAdmin"
                @click="confirmarYEliminarUsuario(usuario)"
              >
                {{ usuarioEnProceso === usuario.id ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">No se encontraron usuarios según los filtros aplicados.</div>
    </section>

    <section class="admin__grid">
      <article class="card admin__requests">
        <header class="panel__header">
          <div>
            <h2>Solicitudes de publicaciones</h2>
            <p class="muted">Aprueba o rechaza publicaciones propuestas por vendedores.</p>
          </div>
          <div class="filters filters--compact">
            <label class="field">
              <span>Búsqueda</span>
              <input v-model="filtrosSolicitudes.busqueda" type="search" placeholder="Producto o solicitante" />
            </label>
            <label class="field">
              <span>Estado</span>
              <select v-model="filtrosSolicitudes.estado">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </label>
          </div>
        </header>

        <div v-if="solicitudesPublicacion.length" class="requests">
          <article v-for="solicitud in solicitudesFiltradas" :key="solicitud.id" class="request">
            <div>
              <p class="request__title">{{ solicitud.titulo }}</p>
              <p class="muted">{{ solicitud.autor }} · {{ solicitud.categoria }}</p>
            </div>
            <div class="request__actions">
              <button
                class="btn btn--ghost"
                type="button"
                :disabled="solicitudEnRevision === solicitud.id"
                @click="procesarRevision(solicitud, 'rechazar')"
              >
                {{ solicitudEnRevision === solicitud.id ? 'Procesando...' : 'Rechazar' }}
              </button>
              <button
                class="btn btn--ghost"
                type="button"
                @click="irAlDetallePublicacion(solicitud)"
              >
                Ver detalles
              </button>
              <button
                class="btn btn--primary"
                type="button"
                :disabled="solicitudEnRevision === solicitud.id"
                @click="procesarRevision(solicitud, 'aprobar')"
              >
                {{ solicitudEnRevision === solicitud.id ? 'Procesando...' : 'Aprobar' }}
              </button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">No hay solicitudes de publicación para revisar.</div>
      </article>
    </section>

    <section class="admin__grid">
      <article class="card admin__publicaciones">
        <header class="panel__header">
          <div>
            <h2>Publicaciones activas</h2>
            <p class="muted">Edita o elimina publicaciones existentes.</p>
          </div>
          <div class="filters filters--compact">
            <label class="field">
              <span>Búsqueda</span>
              <input v-model="filtrosPublicaciones.busqueda" type="search" placeholder="Título o categoría" />
            </label>
            <label class="field">
              <span>Visibilidad</span>
              <select v-model="filtrosPublicaciones.visibilidad">
                <option value="">Todas</option>
                <option value="publicada">Publicada</option>
                <option value="oculta">Oculta</option>
                <option value="borrador">Borrador</option>
              </select>
            </label>
          </div>
        </header>

        <div v-if="publicacionesFiltradas.length" class="list">
          <article v-for="publicacion in publicacionesFiltradas" :key="publicacion.id" class="list__item">
            <div class="list__info">
              <p class="list__title">{{ publicacion.titulo }}</p>
              <p class="muted">{{ publicacion.autor }} · {{ publicacion.fecha }}</p>
            </div>
            <div class="list__meta">
              <span class="pill pill--success" v-if="publicacion.visibilidad === 'publicada'">Publicada</span>
              <span class="pill pill--warning" v-else-if="publicacion.visibilidad === 'borrador'">Borrador</span>
              <span class="pill pill--error" v-else>Oculta</span>
              <div class="list__buttons">
                <button class="btn btn--ghost" type="button" @click="editarPublicacion(publicacion)">Editar</button>
                <button
                  class="btn btn--ghost"
                  type="button"
                  :disabled="publicacionEnProceso === publicacion.id"
                  @click="ocultarOEliminarPublicacion(publicacion, publicacion.visibilidad === 'oculta' ? 'eliminar' : 'ocultar')"
                >
                  {{ publicacionEnProceso === publicacion.id ? 'Procesando...' : publicacion.visibilidad === 'oculta' ? 'Eliminar' : 'Ocultar' }}
                </button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">No se encontraron publicaciones con los filtros seleccionados.</div>
      </article>
    </section>

    <p v-if="mensajeSistema" class="alert alert--info">{{ mensajeSistema }}</p>
  </section>
</template>

<style scoped src="../estilos/AdminDashboard.css"></style>
