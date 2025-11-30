<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import publisherService from '../../../services/publisherService'; 

const route = useRoute();
const router = useRouter();

const product = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const id = route.params.id;
    const { data } = await publisherService.getProductById(id);
    console.log("Datos recibidos:", data); // Para depurar en consola F12
    product.value = data;
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el producto.");
    router.back();
  } finally {
    isLoading.value = false;
  }
});

const getStatusClass = (status) => {
  if (!status) return 'bg-gray-200 text-gray-600';
  const map = { approved: 'status-approved', pending: 'status-pending', rejected: 'status-rejected' };
  return map[status] || '';
};

const getStatusLabel = (status) => {
  if (!status) return 'Desconocido';
  const map = { approved: 'Publicado', pending: 'En Revisión', rejected: 'Rechazado' };
  return map[status] || String(status).charAt(0).toUpperCase() + String(status).slice(1);
};

const goToEdit = () => {
  if (product.value) {
    router.push({ name: 'publisher-edit-product', params: { id: product.value.id } });
  }
};

const handleDelete = async () => {
    if(confirm("¿Eliminar este producto?")) {
        try {
            await publisherService.deleteProduct(product.value.id);
            router.push({ name: 'publisher-products' });
        } catch(e) {
            alert("Error al eliminar");
        }
    }
};
</script>

<template>
  <div class="publisher-container">
    
    <div class="pub-hero">
      <div>
        <h1>Detalle de Publicación</h1>
        <p v-if="product" class="text-sm">ID Referencia: #{{ product.id }}</p>
      </div>
      <button @click="router.back()" class="pub-btn pub-btn--secondary">
        ← Volver
      </button>
    </div>

    <div v-if="isLoading" class="pub-card" style="text-align: center; padding: 3rem;">
      <p style="color: var(--pub-muted);">Cargando información del producto...</p>
    </div>

    <div v-else-if="product" class="pub-card detail-grid">
      
      <div class="detail-image-container">
        <img v-if="product.portada" :src="product.portada" :alt="product.name">
        <div v-else class="no-image">Sin imagen</div>

        <div class="status-overlay">
          <span :class="['pub-badge', getStatusClass(product.status || product.estado_publicacion)]">
            {{ getStatusLabel(product.status || product.estado_publicacion) }}
          </span>
        </div>
      </div>

      <div class="detail-info">
        
        <div class="info-header">
          <span class="category-tag">{{ product.category || 'General' }}</span>
          
          <h2>{{ product.name || product.titulo || 'Producto sin nombre' }}</h2>
          
          <div class="price-tag">
            ${{ Number(product.price || product.precio || 0).toLocaleString('es-CL') }}
          </div>
        </div>

        <div class="info-meta">
          <div class="meta-item">
            <span class="label">Stock Actual</span>
            <span class="value">{{ product.stock || 0 }} unidades</span>
          </div>
          <div class="meta-item">
            <span class="label">Fecha</span>
            <span class="value">{{ product.fecha || 'Reciente' }}</span>
          </div>
        </div>

        <div class="info-description">
          <label>Descripción del Producto</label>
          <p>{{ product.description || 'Sin descripción.' }}</p>
        </div>

        <div class="info-actions">
          <button @click="goToEdit" class="pub-btn">
            Editar Información
          </button>
          <button @click="handleDelete" class="pub-btn pub-btn--danger" style="background: white; border: 1px solid #fee2e2;">
            Eliminar
          </button>
        </div>

      </div>
    </div>
    
    <div v-else class="pub-card" style="padding: 2rem; text-align: center;">
        <p>No se encontraron datos para este producto.</p>
    </div>

  </div>
</template>

<style scoped>

.detail-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .detail-grid { grid-template-columns: 350px 1fr; } }

.detail-image-container {
  position: relative;
  background: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-image-container img { width: 100%; height: 100%; object-fit: cover; }
.no-image { font-size: 1.5rem; color: #ccc; }

.status-overlay { position: absolute; top: 1rem; right: 1rem; }

.info-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
.category-tag { font-size: 0.85rem; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
.info-header h2 { margin: 0.5rem 0; font-size: 1.8rem; color: #111827; }
.price-tag { font-size: 2rem; font-weight: 800; color: #10b981; }

.info-meta { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
.meta-item { display: flex; flex-direction: column; }
.meta-item .label { font-size: 0.8rem; color: #6b7280; font-weight: 600; }
.meta-item .value { font-size: 1.1rem; font-weight: 500; }

.info-description label { display: block; font-weight: 700; margin-bottom: 0.5rem; color: #374151; }
.info-description p { line-height: 1.6; color: #4b5563; }

.info-actions { margin-top: 2rem; display: flex; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
</style>