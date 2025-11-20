<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

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

const usuarioEditado = reactive({
  id: null,
  nombre: '',
  email: '',
  rol: '',
  telefono: '',
  ubicacion: '',
  estado: '',
  notas: ''
})

const totales = computed(() => ({
  usuarios: usuarios.value.length,
  solicitudes: solicitudesPublicacion.value.length,
  publicaciones: publicaciones.value.length
}))

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
    publicaciones.value = Array.isArray(payload.publicaciones) ? payload.publicaciones : []

    registrarAccion('Datos del panel sincronizados con backend.')
  } catch (error) {
    registrarAccion(error.message || 'Error al cargar datos. Revisa la conexión con el backend.')
  } finally {
    cargando.value = false
  }
}

const seleccionarUsuario = (usuario) => {
  usuarioEditado.id = usuario.id || null
  usuarioEditado.nombre = usuario.nombre || ''
  usuarioEditado.email = usuario.email || ''
  usuarioEditado.rol = usuario.rol_id ?? usuario.rol ?? ''
  usuarioEditado.telefono = usuario.telefono || ''
  usuarioEditado.ubicacion = usuario.ubicacion || ''
  usuarioEditado.estado = usuario.estado || ''
  usuarioEditado.notas = ''
  registrarAccion('Usuario cargado para edición. Realiza los cambios y guarda.')
}

const enviarCambiosUsuario = async () => {
  if (!usuarioEditado.id) {
    registrarAccion('Selecciona un usuario de la lista para editarlo.')
    return
  }

  const payload = {
    nombre: usuarioEditado.nombre?.trim() || undefined,
    email: usuarioEditado.email?.trim() || undefined,
    estado_registro: usuarioEditado.estado || undefined,
    rol_id: usuarioEditado.rol ? Number(usuarioEditado.rol) : undefined
  }

  try {
    const response = await fetch(`${apiBase}/admin/usuarios/${usuarioEditado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.message || 'No se pudieron guardar los cambios')
    }

    const index = usuarios.value.findIndex((usuario) => usuario.id === usuarioEditado.id)
    if (index !== -1 && data.usuario) {
      usuarios.value.splice(index, 1, data.usuario)
    }

    registrarAccion('Usuario actualizado correctamente en el backend.')
  } catch (error) {
    registrarAccion(error.message || 'Error al guardar. Intenta nuevamente.')
  }
}

const procesarRevision = (decision) => {
  const texto = decision === 'aprobar'
    ? 'Solicitud marcada para aprobación.'
    : 'Solicitud marcada para rechazo.'
  registrarAccion(`${texto} Agrega notas para documentar la decisión.`)
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

      <div v-if="usuarios.length" class="list">
        <article v-for="usuario in usuarios" :key="usuario.id" class="list__item">
          <div class="list__info">
            <p class="list__title">{{ usuario.nombre }}</p>
            <p class="muted">{{ usuario.email }} · Rol: {{ usuario.rol }}</p>
          </div>
          <div class="list__meta">
            <span class="pill" :class="usuario.estado === 'aprobado' ? 'pill--success' : usuario.estado === 'pendiente' ? 'pill--warning' : 'pill--error'">
              {{ usuario.estado || 'sin estado' }}
            </span>
            <div class="list__buttons">
              <button class="btn btn--ghost" type="button" @click="seleccionarUsuario(usuario)">Editar</button>
              <button class="btn btn--ghost" type="button" @click="registrarAccion('Usuario marcado para bloqueo o eliminación.')">Bloquear/Eliminar</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">No se encontraron usuarios según los filtros aplicados.</div>
    </section>

    <section class="admin__grid">
      <article class="card admin__editor">
        <header class="panel__header">
          <div>
            <h2>Edición detallada de usuario</h2>
            <p class="muted">Actualiza datos de contacto, rol y estado sin cargar datos de ejemplo.</p>
          </div>
          <span class="badge">Formulario sin envío real</span>
        </header>

        <form class="form" @submit.prevent="enviarCambiosUsuario">
          <div class="form__grid">
            <label class="field">
              <span>Nombre completo</span>
              <input v-model="usuarioEditado.nombre" type="text" placeholder="Nombre y apellidos" />
            </label>
            <label class="field">
              <span>Correo</span>
              <input v-model="usuarioEditado.email" type="email" placeholder="usuario@correo.com" />
            </label>
            <label class="field">
              <span>Teléfono</span>
              <input v-model="usuarioEditado.telefono" type="tel" placeholder="+56 9 0000 0000" />
            </label>
            <label class="field">
              <span>Ubicación</span>
              <input v-model="usuarioEditado.ubicacion" type="text" placeholder="Ciudad o región" />
            </label>
            <label class="field">
              <span>Rol</span>
              <select v-model="usuarioEditado.rol">
                <option value="">Selecciona un rol</option>
                <option value="1">Superadministrador</option>
                <option value="2">Administrador</option>
                <option value="3">Vendedor</option>
              </select>
            </label>
            <label class="field">
              <span>Estado</span>
              <select v-model="usuarioEditado.estado">
                <option value="">Selecciona estado</option>
                <option value="aprobado">Aprobado</option>
                <option value="pendiente">Pendiente</option>
                <option value="rechazado">Rechazado</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span>Notas administrativas</span>
            <textarea v-model="usuarioEditado.notas" rows="3" placeholder="Agrega comentarios o decisiones tomadas"></textarea>
          </label>

          <div class="form__actions">
            <button class="btn btn--ghost" type="button" @click="registrarAccion('Cambios descartados localmente.')">Descartar</button>
            <button class="btn btn--primary" type="submit">Guardar cambios</button>
          </div>
        </form>
      </article>

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
          <article v-for="solicitud in solicitudesPublicacion" :key="solicitud.id" class="request">
            <div>
              <p class="request__title">{{ solicitud.titulo }}</p>
              <p class="muted">{{ solicitud.autor }} · {{ solicitud.categoria }}</p>
            </div>
            <div class="request__actions">
              <button class="btn btn--ghost" type="button" @click="procesarRevision('rechazar')">Rechazar</button>
              <button class="btn btn--primary" type="button" @click="procesarRevision('aprobar')">Aprobar</button>
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

        <div v-if="publicaciones.length" class="list">
          <article v-for="publicacion in publicaciones" :key="publicacion.id" class="list__item">
            <div class="list__info">
              <p class="list__title">{{ publicacion.titulo }}</p>
              <p class="muted">{{ publicacion.autor }} · {{ publicacion.fecha }}</p>
            </div>
            <div class="list__meta">
              <span class="pill pill--success" v-if="publicacion.visibilidad === 'publicada'">Publicada</span>
              <span class="pill pill--warning" v-else-if="publicacion.visibilidad === 'borrador'">Borrador</span>
              <span class="pill pill--error" v-else>Oculta</span>
              <div class="list__buttons">
                <button class="btn btn--ghost" type="button" @click="registrarAccion('Edición de publicación en espera de backend.')">Editar</button>
                <button class="btn btn--ghost" type="button" @click="registrarAccion('Publicación marcada para eliminar u ocultar.')">Eliminar/Ocultar</button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">No se encontraron publicaciones con los filtros seleccionados.</div>
      </article>

      <article class="card admin__notas">
        <header class="panel__header">
          <div>
            <h2>Notas de moderación</h2>
            <p class="muted">Deja constancia de decisiones tomadas por el equipo administrador.</p>
          </div>
        </header>
        <textarea
          v-model="notasModeracion"
          rows="7"
          class="notas"
          placeholder="Redacta aquí los comentarios generales o instrucciones para otros administradores."
        ></textarea>
        <div class="form__actions">
          <button class="btn btn--ghost" type="button" @click="notasModeracion = ''">Limpiar</button>
          <button class="btn btn--primary" type="button" @click="registrarAccion('Notas listas para guardar en el backend cuando esté disponible.')">
            Guardar notas
          </button>
        </div>
      </article>
    </section>

    <p v-if="mensajeSistema" class="alert alert--info">{{ mensajeSistema }}</p>
  </section>
</template>

<style scoped src="../estilos/AdminDashboard.css"></style>
