<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const productos = ref([])
const cargando = ref(false)
const error = ref(null)
const busqueda = ref('')
const categoriaFiltro = ref('')

const categorias = computed(() => {
  const cats = new Set(productos.value.map(p => p.categoria).filter(Boolean))
  return Array.from(cats).sort()
})

const productosFiltrados = computed(() => {
  return productos.value.filter(producto => {
    const matchBusqueda = !busqueda.value || 
      producto.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.value.toLowerCase())
    
    const matchCategoria = !categoriaFiltro.value || 
      producto.categoria === categoriaFiltro.value
    
    return matchBusqueda && matchCategoria
  })
})

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(precio)
}

const obtenerProductos = async () => {
  cargando.value = true
  error.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/publicaciones')
    
    if (!response.ok) {
      throw new Error('Error al cargar los productos')
    }
    
    const data = await response.json()
    productos.value = data.publicaciones || []
  } catch (err) {
    error.value = err.message
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerProductos()
})

const limpiarFiltros = () => {
  busqueda.value = ''
  categoriaFiltro.value = ''
}
</script>

<template>
  <div class="productos-publicos">
    <div class="header">
      <h1>Productos disponibles</h1>
      <p>Explora nuestro catálogo de productos agrícolas</p>
    </div>

    <!-- Filtros -->
    <div class="filtros-container">
      <div class="busqueda">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar productos..."
          class="input-busqueda"
        />
      </div>

      <div class="filtro-categoria">
        <select v-model="categoriaFiltro" class="select-categoria">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categorias" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <button @click="limpiarFiltros" class="btn-limpiar">
        Limpiar filtros
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="estado-carga">
      <p>Cargando productos...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error && !cargando" class="error-mensaje">
      <p>{{ error }}</p>
      <button @click="obtenerProductos" class="btn-reintentar">
        Reintentar
      </button>
    </div>

    <!-- Grilla de productos -->
    <div v-if="!cargando && !error" class="productos-grid">
      <div v-if="productosFiltrados.length === 0" class="sin-resultados">
        <p>No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>

      <RouterLink
        v-for="producto in productosFiltrados"
        :key="producto.id"
        :to="`/productos/${producto.id}`"
        class="producto-card"
      >
        <div class="producto-imagen">
          <img
            v-if="producto.portada"
            :src="producto.portada"
            :alt="producto.titulo"
            class="imagen"
          />
          <div v-else class="imagen-placeholder">
            <span>Sin imagen</span>
          </div>
        </div>

        <div class="producto-info">
          <h3 class="titulo">{{ producto.titulo }}</h3>
          
          <p class="descripcion">
            {{ producto.descripcion.substring(0, 80) }}...
          </p>

          <div class="meta">
            <span class="categoria" v-if="producto.categoria">
              {{ producto.categoria }}
            </span>
            <span class="vendedor">{{ producto.autor }}</span>
          </div>

          <div class="precio-footer">
            <span class="precio">{{ formatearPrecio(producto.precio) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped src="../estilos/ProductosPublicos.css"></style>
