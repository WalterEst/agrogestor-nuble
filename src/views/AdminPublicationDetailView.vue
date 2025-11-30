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
const formulario = ref({ titulo: '', precio: '', descripcion: '' })
const guardando = ref(false)

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

const estadoClase = computed(() => {
  const estado = publicacion.value?.estado_publicacion

  return {
    pill: true,
    'pill--success': estado === 'publicada',
    'pill--warning': estado === 'pendiente_revision',
    'pill--error': estado === 'rechazada'
  }
})

const estadoTexto = computed(() => {
  const estado = publicacion.value?.estado_publicacion
  if (estado === 'publicada') return 'Publicada'
  if (estado === 'pendiente_revision') return 'Pendiente de revisión'
  if (estado === 'rechazada') return 'Rechazada'
  return estado || 'Sin estado'
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
    formulario.value = {
      titulo: data.publicacion?.titulo || '',
      precio: data.publicacion?.precio ?? '',
      descripcion: data.publicacion?.descripcion || ''
    }
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

const guardarCambios = async () => {
  if (!publicacion.value?.id || guardando.value) return
  guardando.value = true
  mensaje.value = ''

  try {
    const payload = {
      name: formulario.value.titulo,
      price: formulario.value.precio,
      description: formulario.value.descripcion
    }

    const resp = await fetch(`${apiBase}/publisher/products/${publicacion.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data?.message || 'No fue posible actualizar la publicación')
    }

    publicacion.value = {
      ...publicacion.value,
      ...payload,
      titulo: payload.name,
      precio: payload.price
    }
    mensaje.value = 'Cambios guardados correctamente.'
  } catch (err) {
    mensaje.value = err.message || 'No se pudo guardar la edición.'
  } finally {
    guardando.value = false
  }
}

const restaurarFormulario = () => {
  if (!publicacion.value) return
  formulario.value = {
    titulo: publicacion.value.titulo || '',
    precio: publicacion.value.precio ?? '',
    descripcion: publicacion.value.descripcion || ''
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
        <p class="pill pill--info">Panel administrador</p>
        <h1>Detalle de publicación</h1>
        <p class="muted">
          Revisa la información de la publicación, realiza ajustes y aprueba o rechaza desde este panel.
        </p>
      </div>
      <div class="actions">
        <button class="btn btn--ghost" type="button" @click="regresar">Volver al listado</button>
      </div>
    </header>

    <div v-if="cargando" class="card card--skeleton">
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text"></div>
    </div>

    <div v-else-if="error" class="alert alert--error">
      {{ error }}
    </div>

    <article v-else-if="publicacion" class="card detalle">
      <header class="detalle__header">
        <div class="detalle__title">
          <p :class="estadoClase">
            {{ estadoTexto }}
          </p>
          <h2>{{ publicacion.titulo }}</h2>
          <p class="muted">
            {{ publicacion.autor || 'Autor desconocido' }} ·
            <span class="badge">{{ publicacion.categoria || 'Sin categoría' }}</span>
          </p>
        </div>

        <div class="detalle__actions">
          <button
            class="btn btn--ghost btn--danger"
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
        <div class="detalle__col detalle__col--main">
          <section class="detalle__section">
            <h3>Descripción</h3>
            <p class="detalle__texto">
              {{ publicacion.descripcion || 'Sin descripción proporcionada.' }}
            </p>
          </section>

          <section class="detalle__section detalle__section--grid">
            <div class="detalle__item">
              <span class="detalle__label">Precio</span>
              <p class="detalle__value">
                {{ publicacion.precio }} {{ publicacion.moneda || '' }}
              </p>
            </div>
            <div class="detalle__item">
              <span class="detalle__label">Fecha de creación</span>
              <p class="detalle__value">
                {{ publicacion.fecha || 'Sin fecha' }}
              </p>
            </div>
          </section>
        </div>

        <div class="detalle__col detalle__col--side">
          <section class="detalle__section detalle__section--form">
            <h3>Editar publicación</h3>
            <p class="detalle__hint muted">
              Puedes ajustar título, precio y descripción antes de aprobar la publicación.
            </p>

            <form class="form" @submit.prevent="guardarCambios">
              <label class="field">
                <span>Título</span>
                <input v-model="formulario.titulo" type="text" required />
              </label>

              <label class="field">
                <span>Precio</span>
                <input v-model.number="formulario.precio" type="number" min="0" step="0.01" required />
              </label>

              <label class="field">
                <span>Descripción</span>
                <textarea v-model="formulario.descripcion" rows="4" required></textarea>
              </label>

              <div class="detalle__actions detalle__actions--form">
                <button class="btn btn--ghost" type="button" @click="restaurarFormulario">
                  Descartar cambios
                </button>
                <button class="btn btn--primary" type="submit" :disabled="guardando">
                  {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </article>

    <transition name="fade">
      <p v-if="mensaje" class="alert alert--info">
        {{ mensaje }}
      </p>
    </transition>
  </section>
</template>

<style scoped>
.page.admin-publicacion {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  display: grid;
  gap: 1.5rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page__header h1 {
  margin: 0.25rem 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
}

.card--skeleton {
  position: relative;
  overflow: hidden;
}

.skeleton {
  border-radius: 999px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton--title {
  height: 1.25rem;
  width: 40%;
  margin-bottom: 0.75rem;
}

.skeleton--text {
  height: 0.9rem;
  width: 70%;
  margin-bottom: 0.5rem;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.muted {
  color: #6b7280;
  font-size: 0.9rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pill--info {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.pill--success {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.pill--warning {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}

.pill--error {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.badge {
  display: inline-flex;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #eff6ff;
  color: #1d4ed8;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.15rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.12s ease, background-color 0.12s ease,
    border-color 0.12s ease, color 0.12s ease;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
  transform: none;
}

.btn--primary {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.btn--primary:hover:not(:disabled) {
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn--ghost:hover:not(:disabled) {
  background: #f9fafb;
}

.btn--danger {
  border-color: #fecaca;
  color: #b91c1c;
}

.btn--danger:hover:not(:disabled) {
  background: #fef2f2;
}

.alert {
  border-radius: 12px;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
}

.alert--error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.detalle {
  display: grid;
  gap: 1.5rem;
}

.detalle__header {
  display: flex;
  justify-content: space-between;
  gap: 1.25rem;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.detalle__title h2 {
  margin: 0.25rem 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #111827;
}

.detalle__actions {
  display: flex;
  gap: 0.6rem;
}

.detalle__content {
  display: grid;
  gap: 1rem;
}

.detalle__col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detalle__col--main {
  gap: 0.9rem;
}

.detalle__section {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.detalle__section h3 {
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.detalle__texto {
  margin: 0;
  line-height: 1.5;
  color: #4b5563;
}

.detalle__section--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.8rem;
}

.detalle__item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.detalle__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.detalle__value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.field span {
  font-weight: 500;
  color: #374151;
}

.field input,
.field textarea {
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
  background: #ffffff;
}

.detalle__section--form {
  background: #ffffff;
}

.detalle__hint {
  margin-bottom: 0.5rem;
}

.detalle__actions--form {
  justify-content: flex-end;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 840px) {
  .page.admin-publicacion {
    padding: 2rem 0;
  }

  .detalle__content {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.2fr);
    gap: 1.25rem;
  }
}

@media (max-width: 640px) {
  .page__header {
    flex-direction: column;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }

  .detalle__actions {
    width: 100%;
  }

  .detalle__actions .btn {
    flex: 1;
  }
}
</style>
