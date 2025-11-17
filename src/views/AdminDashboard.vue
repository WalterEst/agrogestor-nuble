<template>
  <section class="page dashboard">
    <header class="page__header dashboard__header">
      <div>
        <p class="dashboard__welcome">Hola, {{ auth.user?.name || 'Super administrador' }}</p>
        <h1 class="page__title">Panel de control</h1>
        <p class="page__subtitle">
          Supervisa la actividad del mercado agrícola, gestiona usuarios y controla las publicaciones desde un único lugar.
        </p>
      </div>
    </header>

    <div v-if="loading" class="empty-state">Cargando panel...</div>
    <div v-else>
      <p v-if="err" class="dashboard__error" role="alert">{{ err }}</p>

      <div v-if="!err" class="dashboard__grid">
        <section class="card dashboard__stats">
          <header class="dashboard__section-header">
            <div>
              <h2>Resumen operativo</h2>
              <p>Estado global de publicaciones y usuarios aprobados en MarketVue.</p>
            </div>
            <button class="dashboard__reload" type="button" :disabled="reloading" @click="reload">
              {{ reloading ? 'Actualizando...' : 'Actualizar datos' }}
            </button>
          </header>

          <div class="dashboard__stat-grid">
            <article class="dashboard__stat">
              <span class="dashboard__stat-label">Publicaciones activas</span>
              <strong class="dashboard__stat-value">{{ overview.posts.active }}</strong>
              <small>{{ overview.posts.total }} en total</small>
            </article>
            <article class="dashboard__stat">
              <span class="dashboard__stat-label">Publicaciones inactivas</span>
              <strong class="dashboard__stat-value">{{ overview.posts.inactive }}</strong>
              <small>Disponible para ajustes</small>
            </article>
            <article class="dashboard__stat">
              <span class="dashboard__stat-label">Usuarios aprobados</span>
              <strong class="dashboard__stat-value">{{ overview.users.approved }}</strong>
              <small>{{ overview.users.total }} registrados</small>
            </article>
            <article class="dashboard__stat">
              <span class="dashboard__stat-label">Solicitudes pendientes</span>
              <strong class="dashboard__stat-value">{{ overview.users.pending }}</strong>
              <small>En espera de revisión</small>
            </article>
          </div>
        </section>

        <section class="card dashboard__actions">
          <h2>Acciones rápidas</h2>
          <div class="dashboard__action-grid">
            <button class="dashboard__action" type="button" @click="goTo('/new')">
              <span class="dashboard__action-icon">➕</span>
              <span>
                <strong>Crear publicación</strong>
                <small>Publica nuevos productos o servicios agrícolas.</small>
              </span>
            </button>
            <button class="dashboard__action" type="button" @click="goTo('/admin/users')">
              <span class="dashboard__action-icon">👥</span>
              <span>
                <strong>Gestionar usuarios</strong>
                <small>Aprueba o rechaza solicitudes pendientes.</small>
              </span>
            </button>
            <button class="dashboard__action" type="button" @click="goTo('/mine')">
              <span class="dashboard__action-icon">📁</span>
              <span>
                <strong>Mis publicaciones</strong>
                <small>Actualiza precios o estados de tus publicaciones.</small>
              </span>
            </button>
            <button class="dashboard__action" type="button" @click="goTo('/explore')">
              <span class="dashboard__action-icon">🛒</span>
              <span>
                <strong>Ver mercado</strong>
                <small>Consulta cómo se ven los productos publicados.</small>
              </span>
            </button>
          </div>
        </section>

        <section class="card dashboard__chart">
          <header class="dashboard__section-header">
            <div>
              <h2>Vistas estimadas del portal</h2>
              <p>Seguimiento simulado de tráfico para la última semana.</p>
            </div>
          </header>
          <div class="dashboard__chart-grid">
            <div v-for="point in visits" :key="point.label" class="dashboard__chart-bar">
              <span class="dashboard__chart-value">{{ point.value }}</span>
              <div class="dashboard__chart-track">
                <div class="dashboard__chart-fill" :style="{ height: `${barHeight(point.value)}%` }"></div>
              </div>
              <span class="dashboard__chart-label">{{ point.label }}</span>
            </div>
          </div>
        </section>

        <section id="panel-posts" class="card dashboard__posts">
          <header class="dashboard__section-header">
            <div>
              <h2>Publicaciones recientes</h2>
              <p>Activa o pausa publicaciones directamente desde el panel.</p>
            </div>
          </header>

          <div v-if="posts.length === 0" class="empty-state">Aún no hay publicaciones registradas.</div>
          <div v-else class="dashboard__table" role="table">
            <div class="dashboard__table-row dashboard__table-row--head" role="row">
              <span role="columnheader">Título</span>
              <span role="columnheader">Productor</span>
              <span role="columnheader">Precio</span>
              <span role="columnheader">Publicado</span>
              <span role="columnheader" class="dashboard__table-status">Estado</span>
              <span role="columnheader" class="dashboard__table-rating">Valoración</span>
              <span role="columnheader" class="dashboard__table-actions">Acciones</span>
            </div>

            <div v-for="post in posts" :key="post.id" class="dashboard__table-row" role="row">
              <span role="cell" class="dashboard__table-title">{{ post.title }}</span>
              <span role="cell">{{ post.seller }}</span>
              <span role="cell">{{ formatPrice(post.price) }}</span>
              <span role="cell">{{ formatDate(post.createdAt) }}</span>
              <span role="cell" class="dashboard__table-status">
                <span class="pill" :class="post.isActive ? 'pill--success' : 'pill--warning'">
                  {{ post.isActive ? 'Activa' : 'Inactiva' }}
                </span>
              </span>
              <span role="cell" class="dashboard__table-rating">
                <template v-if="post.reviewsCount > 0">
                  ⭐ {{ formatRating(post.averageRating) }} · {{ post.reviewsCount }}
                  {{ post.reviewsCount === 1 ? 'opinión' : 'opiniones' }}
                </template>
                <template v-else>Sin datos</template>
              </span>
              <span role="cell" class="dashboard__table-actions">
                <template v-if="editing === post.id">
                  <button
                    class="btn btn--ghost"
                    type="button"
                    :disabled="savingEdit"
                    @click="saveEdit(post.id)"
                  >
                    {{ savingEdit ? 'Guardando...' : 'Guardar' }}
                  </button>
                  <button class="btn btn--ghost" type="button" :disabled="savingEdit" @click="cancelEdit">
                    Cancelar
                  </button>
                </template>
                <template v-else>
                  <button
                    class="btn btn--ghost dashboard__toggle"
                    type="button"
                    :disabled="toggling === post.id"
                    @click="togglePost(post.id)"
                  >
                    {{ toggling === post.id ? 'Actualizando...' : post.isActive ? 'Pausar' : 'Reactivar' }}
                  </button>
                  <button class="btn btn--ghost" type="button" @click="startEdit(post)">Editar</button>
                  <button
                    class="btn btn--ghost btn--danger"
                    type="button"
                    :disabled="deleting === post.id"
                    @click="deletePost(post)"
                  >
                    {{ deleting === post.id ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </template>
              </span>
            </div>
          </div>

          <form v-if="editing" class="dashboard__edit-form" @submit.prevent="saveEdit(editing)">
            <h3>Editar publicación seleccionada</h3>
            <div class="dashboard__edit-grid">
              <label>
                <span>Título</span>
                <input v-model="editForm.title" type="text" required minlength="3" maxlength="120" />
              </label>
              <label>
                <span>Precio</span>
                <input
                  v-model.number="editForm.price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label class="dashboard__edit-description">
                <span>Descripción</span>
                <textarea v-model="editForm.description" rows="3" maxlength="1000"></textarea>
              </label>
              <label class="dashboard__edit-switch">
                <input v-model="editForm.isActive" type="checkbox" />
                <span>Mantener publicación activa</span>
              </label>
            </div>
            <div class="dashboard__edit-actions">
              <button class="btn" type="submit" :disabled="savingEdit">
                {{ savingEdit ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <button class="btn btn--ghost" type="button" :disabled="savingEdit" @click="cancelEdit">
                Cancelar
              </button>
            </div>
          </form>
        </section>

        <section class="card dashboard__pending">
          <header class="dashboard__section-header">
            <div>
              <h2>Solicitudes destacadas</h2>
              <p>Últimas cuentas en espera de aprobación.</p>
            </div>
          </header>

          <div v-if="overview.pendingUsers.length === 0" class="empty-state">No hay solicitudes pendientes.</div>
          <ul v-else class="dashboard__pending-list">
            <li v-for="user in overview.pendingUsers" :key="user.id" class="dashboard__pending-item">
              <div>
                <strong>{{ user.name }}</strong>
                <span>{{ user.email }}</span>
              </div>
              <span class="pill">Pendiente</span>
            </li>
          </ul>

          <button class="dashboard__see-all" type="button" @click="goTo('/admin/users')">
            Ver todas las solicitudes
          </button>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const router = useRouter();

const loading = ref(false);
const reloading = ref(false);
const err = ref('');
const toggling = ref('');
const editing = ref('');
const savingEdit = ref(false);
const deleting = ref('');
const editForm = reactive({
  title: '',
  price: 0,
  description: '',
  isActive: true,
});
const originalPost = ref(null);

const overview = ref({
  posts: { total: 0, active: 0, inactive: 0 },
  users: { total: 0, approved: 0, pending: 0 },
  pendingUsers: [],
});

const posts = ref([]);
const visits = ref([]);

const priceFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
});

const maxVisitValue = computed(() => {
  const values = visits.value.map((item) => item.value);
  const max = Math.max(0, ...values);
  return max === 0 ? 1 : max;
});

function normalizePost(raw) {
  return {
    ...raw,
    price: raw.price != null ? Number(raw.price) : null,
    isActive: raw.isActive === 1 || raw.isActive === true,
    averageRating: raw.averageRating != null ? Number(raw.averageRating) : null,
    reviewsCount: Number(raw.reviewsCount ?? 0),
  };
}

function generateVisits(activePosts) {
  const now = new Date();
  const intensity = Math.max(activePosts, 1) * 8;
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const label = new Intl.DateTimeFormat('es-CL', { weekday: 'short' }).format(day);
    const signal = Math.sin((day.getDate() + index) * 1.4) * 25;
    const base = 120 + intensity + index * 12;
    return {
      label,
      value: Math.round(base + signal),
    };
  });
}

async function fetchData({ showMainSpinner = false } = {}) {
  if (showMainSpinner) {
    loading.value = true;
  } else {
    reloading.value = true;
  }
  err.value = '';

  try {
    const [overviewResponse, postsResponse] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/posts'),
    ]);

    overview.value = {
      posts: {
        total: Number(overviewResponse.data.posts?.total || 0),
        active: Number(overviewResponse.data.posts?.active || 0),
        inactive: Number(overviewResponse.data.posts?.inactive || 0),
      },
      users: {
        total: Number(overviewResponse.data.users?.total || 0),
        approved: Number(overviewResponse.data.users?.approved || 0),
        pending: Number(overviewResponse.data.users?.pending || 0),
      },
      pendingUsers: overviewResponse.data.pendingUsers || [],
    };

    posts.value = postsResponse.data.map(normalizePost);
    visits.value = generateVisits(overview.value.posts.active);
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo cargar el panel de administración.';
  } finally {
    if (showMainSpinner) {
      loading.value = false;
    } else {
      reloading.value = false;
    }
  }
}

async function reload() {
  if (reloading.value) return;
  await fetchData({ showMainSpinner: false });
}

async function togglePost(id) {
  if (toggling.value) return;
  const current = posts.value.find((item) => item.id === id);
  if (!current) return;

  toggling.value = id;
  err.value = '';

  try {
    const { data } = await api.patch(`/admin/posts/${id}/toggle`);
    const updated = normalizePost(data);
    posts.value = posts.value.map((item) => (item.id === id ? updated : item));
    applyActiveChange(current.isActive, updated.isActive);
    visits.value = generateVisits(overview.value.posts.active);
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo actualizar la publicación.';
  } finally {
    toggling.value = '';
  }
}

function applyActiveChange(previous, next) {
  if (previous === next) return;
  if (previous && !next) {
    overview.value.posts.active = Math.max(0, overview.value.posts.active - 1);
    overview.value.posts.inactive += 1;
  } else if (!previous && next) {
    overview.value.posts.active += 1;
    overview.value.posts.inactive = Math.max(0, overview.value.posts.inactive - 1);
  }
}

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return priceFormatter.format(Number(value));
}

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

function formatRating(value) {
  if (value == null) return '—';
  return Number(value).toFixed(1);
}

function resetEditForm() {
  editForm.title = '';
  editForm.price = 0;
  editForm.description = '';
  editForm.isActive = true;
  originalPost.value = null;
  editing.value = '';
}

function startEdit(post) {
  editing.value = post.id;
  editForm.title = post.title;
  editForm.price = post.price != null ? Number(post.price) : 0;
  editForm.description = post.description || '';
  editForm.isActive = post.isActive;
  originalPost.value = { ...post };
  err.value = '';
}

function cancelEdit() {
  resetEditForm();
}

async function saveEdit(id) {
  if (!editing.value || savingEdit.value || !originalPost.value) return;

  const payload = {};
  const normalizedTitle = editForm.title.trim();
  if (normalizedTitle && normalizedTitle !== originalPost.value.title) {
    payload.title = normalizedTitle;
  }

  const normalizedDescription = (editForm.description || '').trim();
  if (normalizedDescription !== (originalPost.value.description || '')) {
    payload.description = normalizedDescription || null;
  }

  const parsedPrice = Number(editForm.price);
  if (!Number.isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice !== Number(originalPost.value.price ?? 0)) {
    payload.price = parsedPrice;
  }

  if (editForm.isActive !== originalPost.value.isActive) {
    payload.isActive = editForm.isActive;
  }

  if (Object.keys(payload).length === 0) {
    resetEditForm();
    return;
  }

  savingEdit.value = true;
  err.value = '';

  try {
    const { data } = await api.put(`/admin/posts/${id}`, payload);
    const updated = normalizePost(data);

    posts.value = posts.value.map((item) => (item.id === id ? updated : item));
    applyActiveChange(originalPost.value.isActive, updated.isActive);
    visits.value = generateVisits(overview.value.posts.active);

    resetEditForm();
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo actualizar la publicación.';
  } finally {
    savingEdit.value = false;
  }
}

async function deletePost(post) {
  if (deleting.value) return;
  if (!window.confirm('¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.')) {
    return;
  }

  deleting.value = post.id;
  err.value = '';

  try {
    await api.delete(`/admin/posts/${post.id}`);
    posts.value = posts.value.filter((item) => item.id !== post.id);

    overview.value.posts.total = Math.max(0, overview.value.posts.total - 1);
    if (post.isActive) {
      overview.value.posts.active = Math.max(0, overview.value.posts.active - 1);
    }
    overview.value.posts.inactive = Math.max(
      0,
      overview.value.posts.total - overview.value.posts.active
    );
    visits.value = generateVisits(overview.value.posts.active);

    if (editing.value === post.id) {
      resetEditForm();
    }
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo eliminar la publicación.';
  } finally {
    deleting.value = '';
  }
}

function barHeight(value) {
  return Math.max(10, Math.round((value / maxVisitValue.value) * 100));
}

function goTo(path) {
  router.push(path);
}

onMounted(() => {
  fetchData({ showMainSpinner: true });
});
</script>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: flex-start;
}

.dashboard__welcome {
  font-weight: 600;
  color: rgba(16, 55, 92, 0.7);
  margin-bottom: 0.5rem;
}

.dashboard__error {
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(207, 41, 60, 0.12);
  color: #9b1b30;
  font-weight: 600;
}

.dashboard__grid {
  display: grid;
  gap: 2rem;
}

.dashboard__stats h2,
.dashboard__actions h2,
.dashboard__chart h2,
.dashboard__posts h2,
.dashboard__pending h2 {
  font-size: 1.4rem;
  margin-bottom: 0.35rem;
}

.dashboard__section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.dashboard__section-header p {
  color: rgba(16, 55, 92, 0.7);
}

.dashboard__reload {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.3rem;
  background: rgba(24, 77, 71, 0.12);
  color: #184d47;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dashboard__reload[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard__reload:not([disabled]):hover {
  background: rgba(24, 77, 71, 0.18);
}

.dashboard__stat-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.dashboard__stat {
  display: grid;
  gap: 0.35rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 55, 92, 0.08);
}

.dashboard__stat-label {
  font-size: 0.95rem;
  color: rgba(16, 55, 92, 0.65);
}

.dashboard__stat-value {
  font-size: 2rem;
  color: #10375c;
}

.dashboard__actions {
  display: grid;
  gap: 1.25rem;
}

.dashboard__action-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.dashboard__action {
  border: 1px solid rgba(16, 55, 92, 0.1);
  border-radius: 1rem;
  padding: 1.1rem 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  gap: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(16, 55, 92, 0.12);
}

.dashboard__action-icon {
  font-size: 1.5rem;
}

.dashboard__action strong {
  display: block;
  color: #10375c;
}

.dashboard__action small {
  display: block;
  color: rgba(16, 55, 92, 0.7);
  margin-top: 0.35rem;
}

.dashboard__chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 1.25rem;
  align-items: end;
}

.dashboard__chart-bar {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}

.dashboard__chart-track {
  width: 100%;
  height: 180px;
  border-radius: 0.85rem;
  background: rgba(16, 55, 92, 0.08);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.dashboard__chart-fill {
  width: 100%;
  background: linear-gradient(135deg, #184d47, #0b5394);
  border-radius: 0.85rem;
}

.dashboard__chart-value {
  font-weight: 600;
  color: #10375c;
}

.dashboard__chart-label {
  font-size: 0.9rem;
  text-transform: capitalize;
  color: rgba(16, 55, 92, 0.7);
}

.dashboard__table {
  width: 100%;
  display: grid;
  gap: 0.75rem;
}

.dashboard__table-row {
  display: grid;
  grid-template-columns: 2.1fr 1.2fr 1fr 1fr 1fr 1.2fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid rgba(16, 55, 92, 0.08);
}

.dashboard__table-rating {
  color: rgba(16, 55, 92, 0.75);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dashboard__table-row--head {
  font-weight: 600;
  color: rgba(16, 55, 92, 0.65);
  border-bottom-color: rgba(16, 55, 92, 0.18);
}

.dashboard__table-title {
  font-weight: 600;
  color: #10375c;
}

.dashboard__table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dashboard__toggle {
  padding: 0.5rem 1.2rem;
}

.dashboard__pending {
  display: grid;
  gap: 1.25rem;
}

.dashboard__pending-list {
  list-style: none;
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

.dashboard__pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dashboard__pending-item strong {
  display: block;
  color: #10375c;
}

.dashboard__pending-item span {
  display: block;
  color: rgba(16, 55, 92, 0.7);
}

.btn--danger {
  color: #9b1b30;
}

.dashboard__edit-form {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(16, 55, 92, 0.12);
}

.dashboard__edit-form h3 {
  font-size: 1.2rem;
  color: #10375c;
}

.dashboard__edit-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.dashboard__edit-grid label {
  display: grid;
  gap: 0.5rem;
  color: rgba(16, 55, 92, 0.75);
}

.dashboard__edit-grid input,
.dashboard__edit-grid textarea {
  border-radius: 0.75rem;
  border: 1px solid rgba(16, 55, 92, 0.2);
  padding: 0.55rem 0.75rem;
  font: inherit;
}

.dashboard__edit-grid input:focus,
.dashboard__edit-grid textarea:focus {
  outline: none;
  border-color: #184d47;
  box-shadow: 0 0 0 3px rgba(24, 77, 71, 0.15);
}

.dashboard__edit-description {
  grid-column: 1 / -1;
}

.dashboard__edit-switch {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
}

.dashboard__edit-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pill--success {
  background: rgba(24, 77, 71, 0.1);
  color: #184d47;
}

.pill--warning {
  background: rgba(244, 162, 89, 0.15);
  color: #c5691f;
}

.dashboard__see-all {
  border: none;
  background: none;
  color: #0b5394;
  font-weight: 600;
  text-decoration: underline;
  text-align: left;
  cursor: pointer;
}

@media (max-width: 960px) {
  .dashboard__table-row {
    grid-template-columns: 1.8fr 1.4fr 1fr;
    grid-template-areas:
      'title title title'
      'seller price status'
      'rating rating rating'
      'date date actions';
    padding: 1.1rem 0;
  }

  .dashboard__table-row span:nth-child(1) {
    grid-area: title;
  }

  .dashboard__table-row span:nth-child(2) {
    grid-area: seller;
  }

  .dashboard__table-row span:nth-child(3) {
    grid-area: price;
  }

  .dashboard__table-row span:nth-child(4) {
    grid-area: date;
  }

  .dashboard__table-row span:nth-child(5) {
    grid-area: status;
  }

  .dashboard__table-row span:nth-child(6) {
    grid-area: rating;
  }

  .dashboard__table-row span:nth-child(7) {
    grid-area: actions;
    justify-content: flex-start;
  }

  .dashboard__table-row--head {
    display: none;
  }
}

@media (max-width: 720px) {
  .dashboard__header {
    flex-direction: column;
  }
}
</style>
