<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePublisherStore } from '../../../stores/publisherStore';

const router = useRouter();
const store = usePublisherStore();

const myProducts = computed(() => store.products);
const isLoading = computed(() => store.loading);

onMounted(() => {
  store.fetchMyProducts();
});

const getStatusLabel = (status) => {
  if (!status) return '';
  const map = { 
    approved: 'Publicado', 
    pending: 'En Revisión', pendiente_revision: 'En Revisión',
    rejected: 'Rechazado' 
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = { 
    approved: 'bg-green-100 text-green-800', 
    publicada: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800', 
    pendiente_revision: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800' 
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const createNew = () => router.push({ name: 'publisher-create-product' });
const goToEdit = (id) => router.push({ name: 'publisher-edit-product', params: { id } });
const goToDetail = (id) => router.push({ name: 'publisher-product-detail', params: { id } });

const handleDelete = async (id) => {
  if (confirm('¿Estás seguro de eliminar esta publicación permanentemente?')) {
    await store.deleteProduct(id);
  }
};
</script>

<template>
  <div class="publisher-container">
    
    <div class="pub-hero">
      <div>
        <h1>Mis Publicaciones</h1>
        <p>Administra tus productos de MarketVue</p>
      </div>
      <button class="pub-btn" @click="createNew">
        Nuevo Producto
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      Cargando tus productos...
    </div>

    <div v-else class="pub-list">
      
      <div v-if="myProducts.length === 0" class="empty-state">
        <p>No tienes publicaciones aún. ¡Crea la primera!</p>
      </div>

      <div v-for="product in myProducts" :key="product.id" class="float-card">
        
        <div class="card-thumb">
            <img v-if="product.portada" :src="product.portada" :alt="product.name" class="product-img">
            <div v-else class="no-image-text">Sin Img</div>
        </div>

        <div class="card-info">
          <h3>{{ product.name || product.titulo || 'Sin Título' }}</h3>
          
          <div class="card-meta">
            <span class="price-tag">
              ${{ Number(product.price || product.precio || 0).toLocaleString('es-CL') }}
            </span>
            <span class="stock-tag">
              Stock: {{ product.stock || 0 }}
            </span>
          </div>
        </div>

        <div class="card-actions">
          <span :class="['status-badge', getStatusClass(product.status || product.estado_publicacion)]">
            {{ getStatusLabel(product.status || product.estado_publicacion) }}
          </span>
          
          <div class="buttons-row">
            <button @click="goToDetail(product.id)" class="text-btn view-btn">Ver</button>
            <button @click="goToEdit(product.id)" class="text-btn edit-btn">Editar</button>
            <button @click="handleDelete(product.id)" class="text-btn delete-btn">Eliminar</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.publisher-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.float-card {
  background: white;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1.5rem;
  align-items: center;
}

.card-thumb {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}
.product-img { width: 100%; height: 100%; object-fit: cover; }
.no-image-text { font-size: 0.7rem; color: #9ca3af; font-weight: 600; text-align: center; }

.card-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 700; color: #1f2937; }
.card-meta { display: flex; gap: 1rem; font-size: 0.9rem; color: #6b7280; }
.price-tag { color: #059669; font-weight: 700; }

.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.buttons-row { display: flex; gap: 0.5rem; }


.text-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  color: #374151;
}
.view-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.edit-btn:hover { border-color: #f59e0b; color: #d97706; background: #fffbeb; }
.delete-btn:hover { border-color: #ef4444; color: #dc2626; background: #fef2f2; }

.loading-state, .empty-state { text-align: center; padding: 3rem; color: #9ca3af; background: #f9fafb; border-radius: 8px; border: 1px dashed #e5e7eb; }
</style>