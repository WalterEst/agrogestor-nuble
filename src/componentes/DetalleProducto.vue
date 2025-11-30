<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const producto = ref(null)
const cargando = ref(false)
const error = ref(null)

const productId = computed(() => route.params.id)

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(precio)
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const obtenerProducto = async () => {
  cargando.value = true
  error.value = null
  
  try {
    const response = await fetch(`http://localhost:3000/api/publicaciones/${productId.value}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Detalle no encontrado en /api/publicaciones/${productId.value}, intentando buscar en la lista...`)
        const found = await buscarEnLista(productId.value)
        if (found) {
          producto.value = found
          return
        }
        throw new Error('Producto no encontrado')
      }
      throw new Error(`Error al cargar el producto (${response.status})`)
    }
    
    const data = await response.json()
    producto.value = data.publicacion
  } catch (err) {
    error.value = err.message
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

const buscarEnLista = async (id) => {
  try {
    const resp = await fetch('http://localhost:3000/api/publicaciones')
    if (!resp.ok) {
      console.warn('No se pudo obtener la lista de publicaciones para fallback')
      return null
    }
    const d = await resp.json()
    const lista = d.publicaciones || []
    const match = lista.find(p => String(p.id) === String(id))
    if (!match) return null

    return {
      ...match,
      vendedor: match.vendedor || {
        nombre: match.autor ? String(match.autor).split(' ')[0] : 'Vendedor',
        apellido: match.autor ? String(match.autor).split(' ').slice(1).join(' ') : '',
        email: null,
        estado_registro: 'desconocido'
      }
    }
  } catch (err) {
    console.error('Error buscando en lista:', err)
    return null
  }
}

const volverAlCatalogo = () => {
  window.history.back()
}

onMounted(() => {
  obtenerProducto()
})
</script>

<template>
  <div class="detalle-producto">
    <div class="botones-header">
      <button @click="volverAlCatalogo" class="btn-volver">
        ← Volver al catálogo
      </button>
    </div>

    <div v-if="cargando" class="estado-carga">
      <p>Cargando detalles del producto...</p>
    </div>

    <div v-if="error && !cargando" class="error-mensaje">
      <p>{{ error }}</p>
      <RouterLink to="/publicaciones" class="btn-volver">
        Ir al catálogo
      </RouterLink>
    </div>

    <div v-if="producto && !cargando && !error" class="producto-detalle-container">
      <div class="producto-main">
        <div class="imagen-section">
          <div class="imagen-principal">
            <img
              v-if="producto.portada"
              :src="producto.portada"
              :alt="producto.titulo"
              class="imagen"
            />
            <div v-else class="imagen-placeholder">
              <span>Imagen no disponible</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h1 class="titulo">{{ producto.titulo }}</h1>

          <div class="meta-info">
            <span class="categoria" v-if="producto.categoria">
               {{ producto.categoria }}
            </span>
            <span class="fecha">
               {{ formatearFecha(producto.fecha) }}
            </span>
          </div>

          <div class="precio-grande">
            {{ formatearPrecio(producto.precio) }}
          </div>

          <div class="descripcion-completa">
            <h3>Descripción</h3>
            <p>{{ producto.descripcion }}</p>
          </div>

          <div class="acciones">
            <button class="btn-comprar">
               Contactar con el vendedor
            </button>
          </div>

          <div class="estado-publicacion">
            <span class="badge" :class="producto.estado_publicacion">
              {{ producto.estado_publicacion }}
            </span>
          </div>
        </div>
      </div>

      <div class="vendedor-section">
        <div class="vendedor-card">
          <h2>Información del vendedor</h2>

          <div class="vendedor-info">
            <div class="avatar">
              <span class="avatar-inicial">
                {{ producto.vendedor?.nombre?.charAt(0) || 'V' }}
              </span>
            </div>

            <div class="vendedor-datos">
              <h3 class="nombre-vendedor">
                {{ producto.vendedor?.nombre }} {{ producto.vendedor?.apellido }}
              </h3>

              <p v-if="producto.vendedor?.email" class="email">
                Correo: {{ producto.vendedor.email }}
              </p>

              <p v-if="producto.vendedor?.ciudad" class="ubicacion">
                Ciudad: {{ producto.vendedor.ciudad }}
              </p>

              <p v-if="producto.vendedor?.estado_registro" class="estado">
                Estado: <span class="estado-badge">
                  {{ producto.vendedor.estado_registro }}
                </span>
              </p>

              <div v-if="producto.vendedor?.descripcion" class="descripcion-vendedor">
                <strong>Acerca del vendedor:</strong>
                <p>{{ producto.vendedor.descripcion }}</p>
              </div>
            </div>
          </div>

          <div class="vendedor-acciones">
            <button class="btn-contactar" v-if="producto.vendedor?.email">
               Enviar mensaje
            </button>
            <button class="btn-seguir">
               Seguir vendedor
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="../estilos/DetalleProducto.css"></style>
