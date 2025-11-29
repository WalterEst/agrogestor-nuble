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

// Helper para obtener el nombre del estado
const getStatusLabel = (status) => {
  if (!status) return '';
  const map = { 
    approved: 'Publicado', publicdad: 'Publicado',
    pending: 'En Revisión', pendiente_revision: 'En Revisión',
    rejected: 'Rechazado' 
  };
  return map[status] || status;
};

// Helper para el color del estado
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
        + Nuevo Producto
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
            <div v-else class="no-image-placeholder">📦</div>
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
            <button @click="goToDetail(product.id)" class="action-btn view-btn" title="Ver">👁️</button>
            <button @click="goToEdit(product.id)" class="action-btn edit-btn" title="Editar">✏️</button>
            <button @click="handleDelete(product.id)" class="action-btn delete-btn" title="Eliminar">🗑️</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal */
.publisher-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

/* Estilo de Tarjeta Flotante */
.float-card {
  background: white;
  border-radius: 12px; /* Bordes redondeados */
  padding: 1.2rem;
  margin-bottom: 1rem;
  
  /* EL EFECTO FLOTANTE (Sombra) */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0,0,0,0.05);
  
  display: grid;
  grid-template-columns: 80px 1fr auto; /* Imagen - Info - Acciones */
  gap: 1.5rem;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Animación al pasar el mouse */
.float-card:hover {
  transform: translateY(-3px); /* Se levanta un poco */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Imagen */
.card-thumb {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}
.product-img { width: 100%; height: 100%; object-fit: cover; }
.no-image-placeholder { font-size: 2rem; }

/* Texto e Info */
.card-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}
.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}
.price-tag {
  color: #059669; /* Verde dinero */
  font-weight: 700;
  font-size: 1rem;
}

/* Acciones */
.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.buttons-row {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}
.view-btn:hover { background: #dbeafe; color: #1e40af; }
.edit-btn:hover { background: #fef3c7; color: #92400e; }
.delete-btn:hover { background: #fee2e2; color: #991b1b; }

/* Estados vacíos */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}
</style>