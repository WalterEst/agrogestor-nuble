<template>
  <section class="page">
    <header class="page__header">
      <h1 class="page__title">Mercado agrícola</h1>
      <p class="page__subtitle">
        Descubre las últimas publicaciones de productores locales. Cada ficha incluye precio referencial, descripción y datos del
        vendedor para que concretes tu próximo negocio.
      </p>
    </header>

    <PostFilters @change="onFiltersChange" />

    <!-- Estado de carga -->
    <div v-if="loading" class="empty-state loading-state">
      <div class="spinner"></div>
      <p>Cargando publicaciones...</p>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="items.length === 0" class="empty-state no-results-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <p>No se encontraron publicaciones.</p>
      <span class="text-small">Intenta ajustar los filtros o prueba con otros parámetros de búsqueda.</span>
    </div>

    <!-- Listado de productos -->
    <div v-else class="grid-responsive">
      <article v-for="p in items" :key="p.id" class="market-card card">
        <img
          v-if="p.imageUrl"
          class="market-card__image"
          :src="apiBase + p.imageUrl"
          :alt="`Imagen de ${p.title}`"
          loading="lazy"
        />

        <div class="market-card__content">
          <h3>{{ p.title }}</h3>
          <p class="market-card__price">{{ formatPrice(p.price) }}</p>
          <p class="market-card__description">{{ p.description }}</p>
        </div>

        <footer class="market-card__footer">
          <span class="pill">Vendedor: {{ p.seller }}</span>
          <span class="pill" :class="p.isActive ? 'pill--success' : 'pill--warning'">
            {{ p.isActive ? 'Disponible' : 'Inactiva temporalmente' }}
          </span>
        </footer>
      </article>
    </div>

    <!-- Paginación -->
    <div class="pagination card" v-if="total > 0">
      <div class="pagination__info">Mostrando página {{ page }} de {{ totalPages }} — {{ total }} resultados</div>
      <div class="pagination__controls">
        <button class="btn btn--ghost" :disabled="page <= 1" @click="prevPage">Anterior</button>
        <button class="btn btn--ghost" :disabled="page >= totalPages" @click="nextPage">Siguiente</button>
        <label class="small muted" style="margin-left:1rem">Por página</label>
        <select v-model.number="pageSize" @change="onPageSizeChange">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import PostFilters from '../components/PostFilters.vue';

const items = ref([]);
const loading = ref(true);
const filters = ref({ q: '', minPrice: null, maxPrice: null, availability: 'any' });

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = ref(1);

const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function onFiltersChange(f) {
  filters.value = { ...f };
  page.value = 1;
  load();
}

async function load() {
  loading.value = true;
  try {
    const params = {
      q: filters.value.q || undefined,
      minPrice: filters.value.minPrice ?? undefined,
      maxPrice: filters.value.maxPrice ?? undefined,
      availability: filters.value.availability || undefined,
      page: page.value,
      pageSize: pageSize.value,
    };
    const res = await api.get('/posts', { params });
    items.value = res.data || [];
    if (res.meta) {
      total.value = res.meta.total || 0;
      page.value = res.meta.page || page.value;
      pageSize.value = res.meta.pageSize || pageSize.value;
      totalPages.value = res.meta.totalPages || 1;
    } else {
      total.value = items.value.length;
      totalPages.value = Math.max(1, Math.ceil(total.value / pageSize.value));
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function prevPage() {
  if (page.value > 1) {
    page.value -= 1;
    load();
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value += 1;
    load();
  }
}

function onPageSizeChange() {
  page.value = 1;
  load();
}

const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatPrice = (value) => formatter.format(Number(value || 0));
</script>

<style scoped>
/* Estados vacíos */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 1rem;
  gap: 1rem;
}

.loading-state {
  background: linear-gradient(135deg, rgba(24, 77, 71, 0.05), rgba(24, 77, 71, 0.1));
  color: var(--primary);
}

.no-results-state {
  background: linear-gradient(135deg, rgba(244, 162, 89, 0.05), rgba(244, 162, 89, 0.1));
  color: var(--muted);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(24, 77, 71, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--accent);
  opacity: 0.6;
}

.text-small {
  display: block;
  font-size: 0.875rem;
  color: var(--muted);
  opacity: 0.7;
}

/* Tarjetas */
.market-card {
  display: grid;
  gap: 1.25rem;
}

.market-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 1rem;
}

.market-card__content {
  display: grid;
  gap: 0.75rem;
}

.market-card__content h3 {
  font-size: 1.35rem;
  color: var(--primary);
}

.market-card__price {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--accent);
}

.market-card__description {
  color: var(--muted);
  line-height: 1.6;
  opacity: 0.85;
}

.market-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.pill {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(24, 77, 71, 0.1);
  color: var(--primary);
}

.pill--success {
  background: rgba(24, 77, 71, 0.15);
  color: var(--primary);
}

.pill--warning {
  background: rgba(244, 162, 89, 0.15);
  color: #c5691f;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination__info {
  font-weight: 600;
  color: var(--muted);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination__controls select {
  padding: 0.5rem;
  border: 1px solid var(--shadow-color);
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn--ghost {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(24, 77, 71, 0.05);
}

.btn--ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
