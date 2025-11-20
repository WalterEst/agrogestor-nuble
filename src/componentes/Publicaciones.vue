<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

const publicaciones = ref([])
const cargando = ref(false)
const error = ref('')

const filtros = reactive({
  busqueda: '',
  categoria: 'todas'
})

const categoriasDisponibles = computed(() => {
  const categorias = new Set()
  publicaciones.value.forEach((item) => {
    if (item.categoria) categorias.add(item.categoria)
  })
  return ['todas', ...categorias]
})

const publicacionesFiltradas = computed(() => {
  const termino = filtros.busqueda.trim().toLowerCase()
  return publicaciones.value.filter((item) => {
    const coincideBusqueda = termino
      ? `${item.titulo} ${item.descripcion} ${item.autor} ${item.categoria}`
          .toLowerCase()
          .includes(termino)
      : true
    const coincideCategoria = filtros.categoria === 'todas' || item.categoria === filtros.categoria
    return coincideBusqueda && coincideCategoria
  })
})

const totalPublicaciones = computed(() => publicaciones.value.length)
const totalFiltradas = computed(() => publicacionesFiltradas.value.length)

const formatoPrecio = (valor, moneda = 'CLP') => {
  try {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: moneda || 'CLP',
      maximumFractionDigits: moneda === 'CLP' ? 0 : 2
    })
    return formatter.format(Number(valor) || 0)
  } catch (err) {
    console.warn('No se pudo formatear el valor', err)
    return `${moneda || 'CLP'} ${valor}`
  }
}

const cargarPublicaciones = async () => {
  cargando.value = true
  error.value = ''

  try {
    const response = await fetch(`${apiBase}/publicaciones`)
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No pudimos cargar las publicaciones.')
    }

    publicaciones.value = Array.isArray(payload.publicaciones) ? payload.publicaciones : []
  } catch (err) {
    error.value = err.message || 'Error al consultar la API de publicaciones.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPublicaciones)
</script>

<template>
  <section class="page publicaciones">
    <header class="page__header publicaciones__header">
      <div>
        <p class="pill pill--success">Mercado en vivo</p>
        <h1>Publicaciones de la comunidad</h1>
      </div>
      <div class="highlight">
        <div>
          <p class="highlight__eyebrow">Disponibles ahora</p>
          <p class="highlight__value">{{ totalPublicaciones }}</p>
          <p class="muted">Resultados después de filtrar: {{ totalFiltradas }}</p>
        </div>
        <div class="highlight__actions">
          <button class="btn btn--ghost" type="button" @click="cargarPublicaciones" :disabled="cargando">
            {{ cargando ? 'Actualizando...' : 'Recargar' }}
          </button>
        </div>
      </div>
    </header>

    <div class="publicaciones__controls">
      <label class="field">
        <span>Buscar</span>
        <input
          v-model="filtros.busqueda"
          type="search"
          placeholder="Título, autor o categoría"
          autocomplete="off"
        />
      </label>
      <label class="field">
        <span>Categoría</span>
        <select v-model="filtros.categoria">
          <option v-for="categoria in categoriasDisponibles" :key="categoria" :value="categoria">
            {{ categoria === 'todas' ? 'Todas las categorías' : categoria }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="error" class="alert alert--error">
      {{ error }}
    </div>

    <div v-else-if="cargando" class="skeleton-grid">
      <div v-for="item in 3" :key="`skeleton-${item}`" class="card publicacion-card publicacion-card--ghost">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--meta"></div>
      </div>
    </div>

    <div v-else-if="publicacionesFiltradas.length" class="grid-responsive publicaciones__list">
      <article v-for="publicacion in publicacionesFiltradas" :key="publicacion.id" class="card publicacion-card">
        <div class="publicacion__header">
          <div>
            <p class="pill pill--success">{{ publicacion.estado_publicacion }}</p>
            <h3>{{ publicacion.titulo }}</h3>
            <p class="publicacion__meta">{{ publicacion.autor || 'Autor desconocido' }} · {{ publicacion.categoria }}</p>
          </div>
          <p class="publicacion__price">{{ formatoPrecio(publicacion.precio, publicacion.moneda) }}</p>
        </div>
        <p class="publicacion__description">{{ publicacion.descripcion }}</p>
        <div class="publicacion__footer">
          <div class="chips">
            <span class="chip">{{ publicacion.moneda }}</span>
            <span class="chip">Creado el {{ publicacion.fecha }}</span>
          </div>
          <a class="btn btn--ghost" href="#">Ver detalle</a>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      No encontramos publicaciones con los filtros actuales. Intenta ajustar la búsqueda o seleccionar otra categoría.
    </div>
  </section>
</template>

<style scoped src="../estilos/Publicaciones.css"></style>