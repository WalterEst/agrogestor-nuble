<template>
  <section class="page admin-users">
    <header class="page__header">
      <h1 class="page__title">Gestión de usuarios</h1>
      <p class="page__subtitle">
        Administra las cuentas registradas, revisa las solicitudes pendientes y actualiza la información sensible de cada
        perfil.
      </p>
    </header>

    <div v-if="loading" class="empty-state">Cargando panel de usuarios...</div>

    <div v-else>
      <p v-if="err" class="admin-users__error" role="alert">{{ err }}</p>

      <div v-else class="admin-users__grid">
        <section class="card admin-users__panel">
          <h2>Crear nuevo usuario</h2>
          <p class="admin-users__panel-subtitle">
            Registra manualmente a productores o compradores con acceso inmediato.
          </p>

          <form class="admin-users__form" @submit.prevent="createUser">
            <div class="admin-users__form-grid">
              <label>
                <span>Nombre completo</span>
                <input v-model="createForm.name" type="text" required minlength="2" />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input v-model="createForm.email" type="email" autocomplete="email" required />
              </label>
              <label>
                <span>Contraseña</span>
                <input v-model="createForm.password" type="password" autocomplete="new-password" required minlength="6" />
              </label>
              <label>
                <span>Edad</span>
                <input v-model.number="createForm.age" type="number" min="18" max="120" required />
              </label>
              <label>
                <span>Teléfono</span>
                <input v-model="createForm.phone" type="tel" autocomplete="tel" required />
              </label>
              <label class="admin-users__form-wide">
                <span>Dirección o comuna</span>
                <input v-model="createForm.address" type="text" required />
              </label>
              <label>
                <span>RUT</span>
                <input v-model="createForm.rut" type="text" required />
              </label>
              <label>
                <span>Rol</span>
                <select v-model="createForm.role">
                  <option value="USER">Usuario</option>
                  <option value="SUPERADMIN">Super admin</option>
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select v-model="createForm.status">
                  <option value="APPROVED">Aprobado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="DENIED">Rechazado</option>
                </select>
              </label>
            </div>

            <p v-if="createErr" class="admin-users__form-error" role="alert">{{ createErr }}</p>
            <p v-if="createMsg" class="admin-users__form-success" role="status">{{ createMsg }}</p>

            <button class="btn btn--primary" type="submit" :disabled="creating">
              {{ creating ? 'Creando...' : 'Crear usuario' }}
            </button>
          </form>
        </section>

        <section class="card admin-users__panel">
          <header class="admin-users__panel-header">
            <div>
              <h2>Solicitudes pendientes</h2>
              <p class="admin-users__panel-subtitle">Confirma los antecedentes antes de aprobar el acceso.</p>
            </div>
            <button class="btn btn--ghost" type="button" :disabled="refreshing" @click="loadPending">
              {{ refreshing ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </header>

          <p v-if="pendingErr" class="admin-users__form-error" role="alert">{{ pendingErr }}</p>

          <div v-if="pending.length === 0" class="empty-state">No hay usuarios pendientes.</div>
          <ul v-else class="admin-users__pending-list">
            <li v-for="user in pending" :key="user.id" class="admin-users__pending-item">
              <div class="admin-users__pending-info">
                <h3>{{ user.name }}</h3>
                <p><strong>Correo:</strong> {{ user.email }}</p>
                <p><strong>RUT:</strong> {{ user.rut || '—' }}</p>
                <p><strong>Edad:</strong> {{ user.age ?? '—' }}</p>
                <p><strong>Ubicación:</strong> {{ user.address || '—' }}</p>
                <p><strong>Teléfono:</strong> {{ user.phone || '—' }}</p>
              </div>
              <div class="admin-users__pending-actions">
                <button class="btn btn--primary" type="button" :disabled="pendingAction" @click="approve(user.id)">
                  {{ pendingAction ? 'Procesando...' : 'Aprobar' }}
                </button>
                <button class="btn btn--ghost" type="button" :disabled="pendingAction" @click="deny(user.id)">
                  Rechazar
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="card admin-users__panel admin-users__panel--full">
          <header class="admin-users__panel-header">
            <div>
              <h2>Usuarios registrados</h2>
              <p class="admin-users__panel-subtitle">
                Información privada disponible solo para super administradores.
              </p>
            </div>
          </header>

          <p v-if="tableErr" class="admin-users__form-error" role="alert">{{ tableErr }}</p>
          <p v-if="tableMsg" class="admin-users__form-success" role="status">{{ tableMsg }}</p>

          <div v-if="users.length === 0" class="empty-state">Aún no hay usuarios registrados.</div>
          <div v-else class="admin-users__table" role="table">
            <div class="admin-users__table-row admin-users__table-row--head" role="row">
              <span role="columnheader">Nombre</span>
              <span role="columnheader">Correo</span>
              <span role="columnheader">RUT</span>
              <span role="columnheader">Edad</span>
              <span role="columnheader">Ubicación</span>
              <span role="columnheader">Rol</span>
              <span role="columnheader">Estado</span>
              <span role="columnheader" class="admin-users__table-actions">Acciones</span>
            </div>
            <div v-for="user in users" :key="user.id" class="admin-users__table-row" role="row">
              <span role="cell" class="admin-users__table-name">{{ user.name }}</span>
              <span role="cell">{{ user.email }}</span>
              <span role="cell">{{ user.rut || '—' }}</span>
              <span role="cell">{{ user.age ?? '—' }}</span>
              <span role="cell">{{ user.address || '—' }}</span>
              <span role="cell">{{ formatRole(user.role) }}</span>
              <span role="cell">
                <span class="pill" :class="statusClass(user.status)">{{ formatStatus(user.status) }}</span>
              </span>
              <span role="cell" class="admin-users__table-actions">
                <button class="btn btn--ghost" type="button" @click="startEdit(user)">Editar</button>
                <button
                  class="btn btn--ghost btn--danger"
                  type="button"
                  :disabled="deletingId === user.id"
                  @click="deleteUser(user)"
                >
                  {{ deletingId === user.id ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </span>
            </div>
          </div>
        </section>

        <section v-if="editing" class="card admin-users__panel admin-users__panel--full">
          <h2>Editar usuario</h2>
          <p class="admin-users__panel-subtitle">Actualiza los datos de contacto y los permisos otorgados.</p>

          <form class="admin-users__form" @submit.prevent="updateUser">
            <div class="admin-users__form-grid">
              <label>
                <span>Nombre completo</span>
                <input v-model="editing.name" type="text" required minlength="2" />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input v-model="editing.email" type="email" autocomplete="email" required />
              </label>
              <label>
                <span>Nueva contraseña</span>
                <input v-model="editing.password" type="password" autocomplete="new-password" minlength="6" placeholder="Sin cambios" />
              </label>
              <label>
                <span>Edad</span>
                <input v-model.number="editing.age" type="number" min="18" max="120" required />
              </label>
              <label>
                <span>Teléfono</span>
                <input v-model="editing.phone" type="tel" required />
              </label>
              <label class="admin-users__form-wide">
                <span>Dirección o comuna</span>
                <input v-model="editing.address" type="text" required />
              </label>
              <label>
                <span>RUT</span>
                <input v-model="editing.rut" type="text" required />
              </label>
              <label>
                <span>Rol</span>
                <select v-model="editing.role">
                  <option value="USER">Usuario</option>
                  <option value="SUPERADMIN">Super admin</option>
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select v-model="editing.status">
                  <option value="APPROVED">Aprobado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="DENIED">Rechazado</option>
                </select>
              </label>
            </div>

            <p v-if="editErr" class="admin-users__form-error" role="alert">{{ editErr }}</p>

            <div class="admin-users__form-actions">
              <button class="btn btn--primary" type="submit" :disabled="updating">
                {{ updating ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <button class="btn btn--ghost" type="button" :disabled="updating" @click="cancelEdit">Cancelar</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../services/api';

const loading = ref(true);
const err = ref('');
const pending = ref([]);
const users = ref([]);

const createForm = reactive({
  name: '',
  email: '',
  password: '',
  age: 18,
  address: '',
  rut: '',
  phone: '',
  role: 'USER',
  status: 'APPROVED',
});
const creating = ref(false);
const createErr = ref('');
const createMsg = ref('');

const pendingErr = ref('');
const pendingAction = ref(false);
const refreshing = ref(false);

const tableErr = ref('');
const tableMsg = ref('');
const deletingId = ref('');

const editing = ref(null);
const updating = ref(false);
const editErr = ref('');

function resetCreateForm() {
  createForm.name = '';
  createForm.email = '';
  createForm.password = '';
  createForm.age = 18;
  createForm.address = '';
  createForm.rut = '';
  createForm.phone = '';
  createForm.role = 'USER';
  createForm.status = 'APPROVED';
}

async function loadAll() {
  loading.value = true;
  err.value = '';
  try {
    const [pendingRes, usersRes] = await Promise.all([
      api.get('/users/pending'),
      api.get('/users'),
    ]);
    pending.value = pendingRes.data;
    users.value = usersRes.data;
  } catch (e) {
    err.value = e.response?.data?.error || 'No se pudo cargar la información de usuarios.';
  } finally {
    loading.value = false;
  }
}

async function loadPending() {
  refreshing.value = true;
  pendingErr.value = '';
  try {
    const { data } = await api.get('/users/pending');
    pending.value = data;
  } catch (e) {
    pendingErr.value = e.response?.data?.error || 'No se pudieron obtener las solicitudes pendientes.';
  } finally {
    refreshing.value = false;
  }
}

function buildPayload(form, includePassword = true) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    age: Number(form.age),
    address: form.address.trim(),
    rut: form.rut.trim(),
    phone: form.phone.trim(),
  };
  if (includePassword && form.password) {
    payload.password = form.password;
  }
  return payload;
}

async function createUser() {
  if (creating.value) return;
  creating.value = true;
  createErr.value = '';
  createMsg.value = '';
  tableMsg.value = '';
  tableErr.value = '';
  try {
    const payload = buildPayload(createForm, true);
    const { data } = await api.post('/users', payload);
    users.value = [data, ...users.value];
    if (data.status === 'PENDING') {
      pending.value = [data, ...pending.value];
    }
    createMsg.value = 'Usuario creado correctamente.';
    tableMsg.value = data.status === 'APPROVED' ? 'Usuario aprobado y creado.' : '';
    resetCreateForm();
  } catch (e) {
    createErr.value = e.response?.data?.error || 'No se pudo crear el usuario.';
  } finally {
    creating.value = false;
  }
}

function startEdit(user) {
  editing.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    age: user.age ?? 18,
    address: user.address || '',
    rut: user.rut || '',
    phone: user.phone || '',
    role: user.role,
    status: user.status,
  };
  editErr.value = '';
}

function cancelEdit() {
  editing.value = null;
  editErr.value = '';
}

async function updateUser() {
  if (!editing.value || updating.value) return;
  updating.value = true;
  editErr.value = '';
  tableErr.value = '';
  tableMsg.value = '';
  try {
    const payload = buildPayload(editing.value, Boolean(editing.value.password));
    if (!editing.value.password) {
      delete payload.password;
    }
    const { data } = await api.put(`/users/${editing.value.id}`, payload);
    users.value = users.value.map((u) => (u.id === data.id ? data : u));
    pending.value = pending.value
      .map((u) => (u.id === data.id ? data : u))
      .filter((u) => u.status === 'PENDING');
    tableMsg.value = 'Usuario actualizado correctamente.';
    editing.value = null;
  } catch (e) {
    editErr.value = e.response?.data?.error || 'No se pudo actualizar el usuario.';
  } finally {
    updating.value = false;
  }
}

async function approve(id) {
  if (pendingAction.value) return;
  pendingAction.value = true;
  pendingErr.value = '';
  tableErr.value = '';
  tableMsg.value = '';
  try {
    await api.post(`/users/${id}/approve`);
    pending.value = pending.value.filter((u) => u.id !== id);
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'APPROVED' } : u));
    tableMsg.value = 'Usuario aprobado correctamente.';
  } catch (e) {
    pendingErr.value = e.response?.data?.error || 'No se pudo aprobar la solicitud.';
  } finally {
    pendingAction.value = false;
  }
}

async function deny(id) {
  if (pendingAction.value) return;
  pendingAction.value = true;
  pendingErr.value = '';
  tableErr.value = '';
  tableMsg.value = '';
  try {
    await api.post(`/users/${id}/deny`);
    pending.value = pending.value.filter((u) => u.id !== id);
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'DENIED' } : u));
    tableMsg.value = 'Solicitud rechazada.';
  } catch (e) {
    pendingErr.value = e.response?.data?.error || 'No se pudo rechazar la solicitud.';
  } finally {
    pendingAction.value = false;
  }
}

async function deleteUser(user) {
  if (deletingId.value || !user) return;
  if (typeof window !== 'undefined' && !window.confirm(`¿Eliminar al usuario ${user.name}?`)) {
    return;
  }
  deletingId.value = user.id;
  tableErr.value = '';
  tableMsg.value = '';
  try {
    await api.delete(`/users/${user.id}`);
    users.value = users.value.filter((u) => u.id !== user.id);
    pending.value = pending.value.filter((u) => u.id !== user.id);
    tableMsg.value = 'Usuario eliminado correctamente.';
    if (editing.value?.id === user.id) {
      editing.value = null;
    }
  } catch (e) {
    tableErr.value = e.response?.data?.error || 'No se pudo eliminar el usuario.';
  } finally {
    deletingId.value = '';
  }
}

function formatRole(role) {
  return role === 'SUPERADMIN' ? 'Super administrador' : 'Usuario';
}

function formatStatus(status) {
  switch (status) {
    case 'APPROVED':
      return 'Aprobado';
    case 'PENDING':
      return 'Pendiente';
    case 'DENIED':
      return 'Rechazado';
    default:
      return status;
  }
}

function statusClass(status) {
  if (status === 'APPROVED') return 'pill--success';
  if (status === 'PENDING') return 'pill--warning';
  if (status === 'DENIED') return 'pill--danger';
  return '';
}

onMounted(loadAll);
</script>

<style scoped>
.admin-users__grid {
  display: grid;
  gap: 2rem;
}

.admin-users__panel {
  display: grid;
  gap: 1.5rem;
}

.admin-users__panel-subtitle {
  color: rgba(16, 55, 92, 0.7);
  line-height: 1.6;
}

.admin-users__panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.admin-users__form {
  display: grid;
  gap: 1.25rem;
}

.admin-users__form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-users__form-grid label {
  display: grid;
  gap: 0.45rem;
  font-weight: 600;
  color: rgba(16, 55, 92, 0.9);
}

.admin-users__form-grid input,
.admin-users__form-grid select {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(16, 55, 92, 0.16);
  border-radius: 0.75rem;
  font-size: 0.95rem;
}

.admin-users__form-grid input:focus,
.admin-users__form-grid select:focus {
  outline: 2px solid rgba(24, 77, 71, 0.35);
  outline-offset: 2px;
}

.admin-users__form-wide {
  grid-column: span 2;
}

.admin-users__form-error {
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  background: rgba(207, 41, 60, 0.12);
  color: #9b1b30;
  font-weight: 600;
}

.admin-users__form-success {
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  background: rgba(24, 77, 71, 0.12);
  color: #184d47;
  font-weight: 600;
}

.admin-users__form-actions {
  display: flex;
  gap: 1rem;
}

.admin-users__pending-list {
  display: grid;
  gap: 1rem;
}

.admin-users__pending-item {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(16, 55, 92, 0.12);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(253, 248, 238, 0.45);
}

.admin-users__pending-info {
  display: grid;
  gap: 0.4rem;
  color: rgba(16, 55, 92, 0.85);
}

.admin-users__pending-info h3 {
  font-size: 1.1rem;
  color: #0b2e4a;
}

.admin-users__pending-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.admin-users__table {
  display: grid;
  gap: 0.75rem;
}

.admin-users__table-row {
  display: grid;
  grid-template-columns: 1.25fr 1.25fr 0.9fr 0.6fr 1.4fr 0.9fr 0.9fr 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 55, 92, 0.08);
}

.admin-users__table-row--head {
  background: rgba(16, 55, 92, 0.1);
  font-weight: 700;
  color: #0b2e4a;
}

.admin-users__table-name {
  font-weight: 600;
  color: #10375c;
}

.admin-users__table-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.admin-users__error {
  padding: 0.9rem 1.1rem;
  border-radius: 0.85rem;
  background: rgba(207, 41, 60, 0.12);
  color: #9b1b30;
  font-weight: 600;
}

@media (max-width: 960px) {
  .admin-users__table-row {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.65rem;
  }

  .admin-users__table-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .admin-users__panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-users__form-actions {
    flex-direction: column;
  }

  .admin-users__form-wide {
    grid-column: span 1;
  }
}
</style>
