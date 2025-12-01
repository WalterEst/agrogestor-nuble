<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'

const usuarios = ref([])
const solicitudesPublicacion = ref([])
const publicaciones = ref([])
const reportes = ref([])
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
  publicaciones: publicaciones.value.length,
  reportes: reportes.value.length
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
    reportes.value = Array.isArray(payload.reportes) ? payload.reportes : []
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

// Reportes: UI state
const replyingTo = ref(null) // ticket id currently showing reply form
const replyText = ref('')
const reportLoading = ref(null)

const toggleReply = (ticket) => {
  if (!ticket || !ticket.id) return
  if (replyingTo.value === ticket.id) {
    replyingTo.value = null
    replyText.value = ''
    return
  }
  replyingTo.value = ticket.id
  replyText.value = ticket.respuesta || ''
}

const sendReply = async (ticket, markResolved = false) => {
  if (!ticket || !ticket.id) return
  reportLoading.value = ticket.id

  try {
    const payload = {}
    if (replyText.value && replyText.value.trim().length) payload.respuesta = replyText.value.trim()
    if (markResolved) payload.estado = 'resuelto'

    const response = await fetch(`${apiBase}/admin/reportes/${ticket.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': sessionStore.roleId || ''
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.message || 'No fue posible actualizar el ticket')

    // actualizar en el array local
    const idx = reportes.value.findIndex((r) => String(r.id) === String(ticket.id))
    if (idx >= 0) {
      reportes.value.splice(idx, 1, data.ticket)
    }

    registrarAccion('Respuesta enviada al ticket.')
    replyingTo.value = null
    replyText.value = ''
  } catch (e) {
    registrarAccion(e.message || 'Error al enviar la respuesta')
  } finally {
    reportLoading.value = null
  }
}

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
      <article class="card stat">
        <p class="stat__label">Tickets / Reportes</p>
        <p class="stat__value">{{ totales.reportes }}</p>
        <p class="stat__hint">Solicitudes de soporte y reportes de usuarios.</p>
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

    <section class="admin__grid">
      <article class="card admin__reportes">
        <header class="panel__header">
          <div>
            <h2>Tickets / Reportes</h2>
            <p class="muted">Revisa y responde los reportes enviados por los usuarios.</p>
          </div>
        </header>

        <div v-if="reportes.length" class="list">
          <article v-for="r in reportes" :key="r.id" class="list__item">
            <div class="list__info">
              <p class="list__title">{{ r.asunto }}</p>
              <p class="muted">{{ r.usuario_nombre || r.usuario?.nombre || 'Usuario desconocido' }} · {{ r.usuario_email || r.usuario?.email || '' }}</p>
            </div>
            <div class="list__meta">
              <p class="muted">{{ r.fecha }} • <strong>{{ r.estado || 'pendiente' }}</strong></p>
              <div class="list__buttons">
                <button class="btn btn--ghost" type="button" @click="() => { navigator.clipboard?.writeText(r.mensaje || '') }">Copiar Mensaje</button>
                <button class="btn btn--ghost" type="button" @click.stop.prevent="toggleReply(r)">
                  {{ replyingTo === r.id ? 'Cerrar' : 'Responder' }}
                </button>
                <button class="btn btn--primary" type="button" :disabled="reportLoading === r.id" @click.stop.prevent="sendReply(r, true)">
                  {{ reportLoading === r.id ? 'Enviando...' : 'Marcar resuelto' }}
                </button>
              </div>
            </div>
            <div class="report-body" style="margin-top:0.6rem;">
              <p>{{ r.mensaje }}</p>
              <div v-if="r.respuesta" class="admin-reply">
                <p><strong>Respuesta:</strong> {{ r.respuesta }}</p>
              </div>

              <div v-if="replyingTo === r.id" class="reply-form" style="margin-top:0.8rem;">
                <textarea v-model="replyText" rows="4" class="pub-textarea" placeholder="Escribe tu respuesta aquí..."></textarea>
                <div style="margin-top:0.5rem; text-align:right;">
                  <button class="btn btn--ghost" type="button" @click.prevent="toggleReply(r)">Cancelar</button>
                  <button class="btn btn--primary" type="button" :disabled="reportLoading === r.id" @click.prevent="sendReply(r, false)">
                    {{ reportLoading === r.id ? 'Enviando...' : 'Enviar respuesta' }}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">No hay tickets o reportes por el momento.</div>
      </article>
    </section>

    <p v-if="mensajeSistema" class="alert alert--info">{{ mensajeSistema }}</p>
  </section>
</template>

<style scoped src="../estilos/AdminDashboard.css"></style>

<style scoped>
/* Keep styles minimal and consistent with other components (card/pill/btn) */
:root {
  --brand: #059669;
  --brand-dark: #064e3b;
  --muted: #6b7280;
  --card-bg: #ffffff;
}

.admin__reportes { padding: 0; }
.admin__reportes .list { display:flex; flex-direction:column; gap:0.85rem; }

.admin__reportes .list__item {
  display:flex;
  gap:1rem;
  align-items:flex-start;
  background: var(--card-bg);
  border: 1px solid rgba(6,78,59,0.06);
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.admin__reportes .list__info { flex:1; }
.admin__reportes .list__title { margin:0 0 0.18rem 0; font-weight:700; color:var(--brand-dark); font-size:1rem; }
.admin__reportes .list__info .muted { margin:0; color:var(--muted); font-size:0.92rem; }

.admin__reportes .list__meta { width:220px; display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem; }
.admin__reportes .meta-top { color:var(--muted); font-size:0.9rem; }

/* Use existing pill styles where possible */
.admin__reportes .status-pill { font-weight:700; padding:6px 10px; border-radius:999px; font-size:0.78rem; }
.admin__reportes .status-pendiente { background:#fff7ed; color:#92400e; border:1px solid #fbe6c9; }
.admin__reportes .status-resuelto { background:#ecfdf5; color:#065f46; border:1px solid #c8f7df; }
.admin__reportes .status-cerrado { background:#f3f4f6; color:#374151; border:1px solid #e6e8eb; }

.admin__reportes .list__buttons { display:flex; gap:0.5rem; }
.admin__reportes .list__buttons .btn { padding:0.45rem 0.85rem; border-radius:999px; }

.admin__reportes .report-body { width:100%; margin-top:0.6rem; color:#24382f; line-height:1.5; }
.admin__reportes .admin-reply { margin-top:0.6rem; background:#f6fffa; border-left:4px solid var(--brand); padding:0.7rem; border-radius:6px; }

.admin__reportes .reply-form { margin-top:0.8rem; display:flex; flex-direction:column; gap:0.6rem; }
.admin__reportes .pub-textarea { width:100%; min-height:100px; padding:0.7rem; border-radius:8px; border:1px solid #e6f0ea; font-size:0.95rem; }

/* Responsive: stack and align like other admin lists */
@media (max-width: 880px) {
  .admin__reportes .list__item { flex-direction:column; }
  .admin__reportes .list__meta { width:100%; align-items:flex-start; }
  .admin__reportes .list__buttons { justify-content:flex-start; }
}

</style>
