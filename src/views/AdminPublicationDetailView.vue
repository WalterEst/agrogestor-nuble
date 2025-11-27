<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const publicacion = ref(null)
const cargando = ref(false)
const error = ref('')
const mensaje = ref('')
const procesando = ref(false)

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

const estadoClase = computed(() => {
  const estado = publicacion.value?.estado_publicacion

  return {
    'pill pill--success': estado === 'publicada',
    'pill pill--warning': estado === 'pendiente_revision',
    'pill pill--error': estado === 'rechazada'
  }
})

const cargarDetalle = async () => {
  cargando.value = true
  error.value = ''

  try {
    const resp = await fetch(`${apiBase}/publicaciones/${route.params.id}`)
    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data?.message || 'No se pudo cargar la publicación')
    }

    publicacion.value = data.publicacion
  } catch (err) {
    error.value = err.message || 'Error al cargar el detalle'
  } finally {
    cargando.value = false
  }
}

const actualizarEstado = async (estado_publicacion) => {
  if (!publicacion.value?.id || procesando.value) return
  procesando.value = true
  mensaje.value = ''

  try {
    const resp = await fetch(`${apiBase}/admin/publicaciones/${publicacion.value.id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_publicacion })
    })

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data?.message || 'No pudimos actualizar el estado')
    }

    publicacion.value = { ...publicacion.value, ...data.publicacion, estado_publicacion }
    mensaje.value =
      estado_publicacion === 'publicada'
        ? 'Publicación aprobada exitosamente.'
        : 'Publicación rechazada exitosamente.'
  } catch (err) {
    mensaje.value = err.message || 'No fue posible actualizar la publicación.'
  } finally {
    procesando.value = false
  }
}

const regresar = () => {
  router.back()
}

onMounted(cargarDetalle)
</script>

<template>
  <section class="page admin-publicacion">
    <header class="page__header">
      <div>
        <p class="pill pill--success">Panel administrador</p>
        <h1>Detalle de publicación</h1>
        <p class="muted">Revisa la información de la publicación y aprueba o rechaza desde este panel.</p>
      </div>
      <div class="actions">
        <button class="btn btn--ghost" type="button" @click="regresar">Volver</button>
      </div>
    </header>

    <div v-if="cargando" class="card">Cargando información...</div>
    <div v-else-if="error" class="alert alert--error">{{ error }}</div>

    <article v-else-if="publicacion" class="card detalle">
      <header class="detalle__header">
        <div>
          <p :class="estadoClase">{{ publicacion.estado_publicacion }}</p>
          <h2>{{ publicacion.titulo }}</h2>
          <p class="muted">{{ publicacion.autor }} · {{ publicacion.categoria }}</p>
        </div>
        <div class="detalle__actions">
          <button
            class="btn btn--ghost"
            type="button"
            :disabled="procesando || publicacion.estado_publicacion === 'rechazada'"
            @click="actualizarEstado('rechazada')"
          >
            {{ procesando ? 'Procesando...' : 'Rechazar' }}
          </button>
          <button
            class="btn btn--primary"
            type="button"
            :disabled="procesando || publicacion.estado_publicacion === 'publicada'"
            @click="actualizarEstado('publicada')"
          >
            {{ procesando ? 'Procesando...' : 'Aprobar' }}
          </button>
        </div>
      </header>

      <div class="detalle__content">
        <section class="detalle__section">
          <h3>Descripción</h3>
          <p>{{ publicacion.descripcion || 'Sin descripción' }}</p>
        </section>
        <section class="detalle__section">
          <h3>Datos de oferta</h3>
          <ul>
            <li><strong>Precio:</strong> {{ publicacion.precio }} {{ publicacion.moneda }}</li>
            <li><strong>Fecha:</strong> {{ publicacion.fecha }}</li>
          </ul>
        </section>
      </div>
    </article>

    <p v-if="mensaje" class="alert alert--info">{{ mensaje }}</p>
  </section>
</template>

<style scoped>
.admin-publicacion {
  gap: 1.5rem;
  display: grid;
}

.detalle {
  display: grid;
  gap: 1.25rem;
}

.detalle__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.detalle__actions {
  display: flex;
  gap: 0.75rem;
}

.detalle__content {
  display: grid;
  gap: 1rem;
}

.detalle__section {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 12px;
}
</style>