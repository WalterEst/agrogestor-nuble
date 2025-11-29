<script setup>
import { ref, onMounted } from 'vue';
import publisherService from '../../../services/publisherService';

const isLoading = ref(false);
const isSaving = ref(false);

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',       
  confirmPassword: '' 
});


onMounted(async () => {
  isLoading.value = true;
  try {
    const { data } = await publisherService.getProfile();
    form.value.nombre = data.nombre;
    form.value.apellido = data.apellido;
    form.value.email = data.email;
  } catch (error) {
    console.error(error);
    alert('Error al cargar tu perfil');
  } finally {
    isLoading.value = false;
  }
});

const saveProfile = async () => {
 
  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  isSaving.value = true;
  try {
    
    await publisherService.updateProfile({
        nombre: form.value.nombre,
        apellido: form.value.apellido,
        email: form.value.email,
        password: form.value.password 
    });
    
    alert('¡Perfil actualizado con éxito!');
    
    form.value.password = '';
    form.value.confirmPassword = '';
    
  } catch (error) {
    console.error(error);
    alert('No se pudo actualizar el perfil');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="publisher-container">
    <div class="pub-hero">
      <div>
        <h1>Mi Perfil</h1>
        <p>Actualiza tu información personal y seguridad</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">Cargando perfil...</div>

    <div v-else class="pub-card profile-card">
      <form @submit.prevent="saveProfile">
        
        <h3 class="section-title">Información Personal</h3>
        
        <div class="pub-grid-2">
          <div class="pub-field">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" class="pub-input" required>
          </div>
          <div class="pub-field">
            <label>Apellido</label>
            <input v-model="form.apellido" type="text" class="pub-input" required>
          </div>
        </div>

        <div class="pub-field">
          <label>Correo Electrónico</label>
          <input v-model="form.email" type="email" class="pub-input" required>
        </div>

        <hr class="divider">

        <h3 class="section-title">Cambiar Contraseña</h3>
        <p class="hint-text">Deja estos campos vacíos si no quieres cambiar tu contraseña.</p>

        <div class="pub-grid-2">
          <div class="pub-field">
            <label>Nueva Contraseña</label>
            <input v-model="form.password" type="password" class="pub-input" placeholder="********">
          </div>
          <div class="pub-field">
            <label>Confirmar Nueva Contraseña</label>
            <input v-model="form.confirmPassword" type="password" class="pub-input" placeholder="********">
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="pub-btn" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>

.profile-card {
  max-width: 700px;
  margin: 0 auto;
}

.section-title {
  color: #064e3b; 
  font-size: 1.1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #d1fae5;
  padding-bottom: 0.5rem;
}

.divider {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.hint-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
  margin-top: -0.5rem;
}

.form-actions {
  margin-top: 2rem;
  text-align: right;
}

.pub-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.pub-field { margin-bottom: 1rem; }
.pub-field label { display: block; font-weight: 600; margin-bottom: 0.4rem; font-size: 0.9rem; color: #374151; }
.pub-input { width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
.pub-btn { background-color: #059669; color: white; padding: 0.6rem 1.2rem; border-radius: 0.375rem; border: none; cursor: pointer; font-weight: 600; }
.pub-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.loading-state { text-align: center; padding: 2rem; color: #6b7280; }
</style>