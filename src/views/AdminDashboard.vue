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
      <button class="btn btn--ghost dashboard__logout" type="button" @click="handleLogout">
        Cerrar sesión
      </button>
    </header>

    <div v-if="loading" class="empty-state">Cargando panel...</div>
    <div v-else>
      <p v-if="err" class="dashboard__error" role="alert">{{ err }}</p>

      <div v-if="!err" class="dashboard__grid">
        <section class="card dashboard__stats">
          <header class="dashboard__section-header">
            <div>
              <h2>Resumen operativo</h2>
              <p>Estado global de publicaciones y usuarios aprobados en AgroGestor.</p>
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

        <section class="card dashboard__posts">
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
              <span role="cell" class="dashboard__table-actions">
                <button
                  class="btn btn--ghost dashboard__toggle"
                  type="button"
                  :disabled="toggling === post.id"
                  @click="togglePost(post.id)"
                >
                  {{ toggling === post.id ? 'Actualizando...' : post.isActive ? 'Pausar' : 'Reactivar' }}
                </button>
              </span>
            </div>
          </div>
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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const router = useRouter();

const loading = ref(false);
const reloading = ref(false);
const err = ref('');
const toggling = ref('');

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

    if (current.isActive && !updated.isActive) {
      overview.value.posts.active = Math.max(0, overview.value.posts.active - 1);
      overview.value.posts.inactive += 1;
    } else if (!current.isActive && updated.isActive) {
      overview.value.posts.active += 1;
      overview.value.posts.inactive = Math.max(0, overview.value.posts.inactive - 1);
    }

    visits.value = generateVisits(overview.value.posts.active);
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo actualizar la publicación.';
  } finally {
    toggling.value = '';
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

function barHeight(value) {
  return Math.max(10, Math.round((value / maxVisitValue.value) * 100));
}

function handleLogout() {
  auth.logout();
  router.replace('/login');
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

.dashboard__logout {
  align-self: flex-start;
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
  grid-template-columns: 2.2fr 1.3fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid rgba(16, 55, 92, 0.08);
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

  .dashboard__logout {
    width: 100%;
  }
}
</style>
