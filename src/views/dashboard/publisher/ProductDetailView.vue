<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const product = ref(null);

onMounted(() => {
  // Simulamos datos del backend
  const id = route.params.id;
  product.value = {
    id: id,
    name: 'Miel de Ulmo Orgánica',
    price: 8500,
    description: 'Miel cruda 100% natural, cosechada en los bosques nativos de la precordillera de Ñuble. Sin aditivos ni preservantes. Formato de 1kg en envase de vidrio.',
    stock: 12,
    category: 'Alimentos',
    status: 'approved',
    image: 'https://via.placeholder.com/400' // Placeholder de imagen
  };
});

// Reutilizamos la lógica de clases de estado
const getStatusClass = (status) => {
  const map = { approved: 'status-approved', pending: 'status-pending', rejected: 'status-rejected' };
  return map[status] || '';
};

const getStatusLabel = (status) => {
  const map = { approved: 'Publicado', pending: 'En Revisión', rejected: 'Rechazado' };
  return map[status] || status;
};

const goToEdit = () => {
  router.push({ name: 'publisher-edit-product', params: { id: product.value.id } });
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

    <div v-if="!product" class="pub-card" style="text-align: center; padding: 3rem;">
      <p style="color: var(--pub-muted);">Cargando información del producto...</p>
    </div>

    <div v-else class="pub-card detail-grid">
      
      <div class="detail-image-container">
        <img :src="product.image" alt="Imagen del producto" />
        <div class="status-overlay">
          <span :class="['pub-badge', getStatusClass(product.status)]">
            {{ getStatusLabel(product.status) }}
          </span>
        </div>
      </div>

      <div class="detail-info">
        
        <div class="info-header">
          <span class="category-tag">{{ product.category }}</span>
          <h2>{{ product.name }}</h2>
          <div class="price-tag">${{ product.price.toLocaleString('es-CL') }}</div>
        </div>

        <div class="info-meta">
          <div class="meta-item">
            <span class="label">Stock Actual</span>
            <span class="value">{{ product.stock }} unidades</span>
          </div>
          <div class="meta-item">
            <span class="label">Visitas</span>
            <span class="value">124</span> </div>
        </div>

        <div class="info-description">
          <label>Descripción del Producto</label>
          <p>{{ product.description }}</p>
        </div>

        <div class="info-actions">
          <button @click="goToEdit" class="pub-btn">
            ✏️ Editar Información
          </button>
          <button class="pub-btn pub-btn--danger" style="background: white; border: 1px solid #fee2e2;">
            🗑️ Eliminar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .detail-grid {
    grid-template-columns: 350px 1fr; /* Imagen fija, resto flexible */
  }
}

/* Imagen */
.detail-image-container {
  position: relative;
  background: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--pub-border);
  height: 350px;
}

.detail-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* Info */
.info-header {
  border-bottom: 1px solid var(--pub-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.category-tag {
  font-size: 0.85rem;
  color: var(--pub-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.info-header h2 {
  margin: 0.5rem 0;
  font-size: 1.8rem;
  color: var(--pub-primary);
}

.price-tag {
  font-size: 2rem;
  font-weight: 800;
  color: var(--pub-accent);
}

.info-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-item .label {
  font-size: 0.8rem;
  color: var(--pub-muted);
  font-weight: 600;
}

.meta-item .value {
  font-size: 1.1rem;
  font-weight: 500;
}

.info-description label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--pub-primary);
}

.info-description p {
  line-height: 1.6;
  color: #4b5563;
}

.info-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--pub-border);
}
</style>