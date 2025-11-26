<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
  passwrd: '',
  passwrdConfirm: ''
})

const loading = ref(false)
const feedback = ref(null)
const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'
const router = useRouter()

const nombreValid = computed(() => form.nombre.trim().length >= 2)
const emailValid = computed(() => /^\S+@\S+\.\S+$/.test(form.email.trim()))
const passwordValid = computed(() => form.passwrd.trim().length >= 6)
const passwordsMatch = computed(() => form.passwrd === form.passwrdConfirm)

const canSubmit = computed(() => nombreValid.value && emailValid.value && passwordValid.value && passwordsMatch.value && !loading.value)

const handleRegister = async () => {
  if (!canSubmit.value) return
  loading.value = true
  feedback.value = null

  try {
    const response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        passwrd: form.passwrd
      })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No se pudo registrar la cuenta')
    }

    feedback.value = { type: 'success', text: 'Registro exitoso. Redirigiendo...' }
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (err) {
    feedback.value = { type: 'error', text: err.message || 'Error inesperado' }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="registro-container">
    <div class="registro-card">
      <h2 class="form-title">Crear una cuenta</h2>

      <form @submit.prevent="handleRegister" class="form-grid">
        
        <div class="form-row">
          <div class="input-group">
            <label for="nombre">Nombre</label>
            <input 
              id="nombre"
              v-model="form.nombre" 
              type="text" 
              placeholder="Ej. Juan"
              :class="{ 'input-error': !nombreValid && form.nombre.length > 0 }"
              required 
            />
            <span v-if="!nombreValid && form.nombre.length > 0" class="error-msg">Min. 2 caracteres</span>
          </div>

          <div class="input-group">
            <label for="apellido">Apellido</label>
            <input 
              id="apellido"
              v-model="form.apellido" 
              type="text" 
              placeholder="Ej. Pérez"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="email">Correo electrónico</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="correo@ejemplo.com"
            required 
          />
          <span v-if="!emailValid && form.email.length > 0" class="error-msg">Ingresa un correo válido</span>
        </div>

        <div class="input-group">
          <label for="passwrd">Contraseña</label>
          <input 
            id="passwrd"
            v-model="form.passwrd" 
            type="password" 
            placeholder="******"
            required 
            minlength="6" 
          />
          <span v-if="!passwordValid && form.passwrd.length > 0" class="error-msg">Mínimo 6 caracteres</span>
        </div>

        <div class="input-group">
          <label for="passwrdConfirm">Confirmar contraseña</label>
          <input 
            id="passwrdConfirm"
            v-model="form.passwrdConfirm" 
            type="password" 
            placeholder="******"
            required 
          />
          <span v-if="!passwordsMatch && form.passwrdConfirm.length > 0" class="error-msg">Las contraseñas no coinciden</span>
        </div>

        <div class="form-actions">
          <button class="btn-primary" :disabled="!canSubmit" type="submit">
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </div>

        <div v-if="feedback" :class="['alert', `alert--${feedback.type}`]">
          {{ feedback.text }}
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Reseteo básico para evitar desbordes */
* {
  box-sizing: border-box; 
}

.registro-container {
  display: flex;
  justify-content: center;
  align-items: center; /* Centrado vertical y horizontal */
  min-height: 85vh;
  padding: 1rem;
  background-color: transparent;
}

.registro-card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  /* Sombra suave y elegante */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 480px; /* Ancho máximo controlado */
}

.form-title {
  color: #0d4637;
  font-family: 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* RESPONSIVE: Grid para Nombre y Apellido */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas iguales */
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%; /* Asegura que el grupo ocupe su espacio asignado */
  position: relative;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-left: 2px;
}

input {
  width: 100%; /* CRUCIAL: Esto evita que se salga del contenedor */
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9fafb;
  color: #1f2937;
  transition: all 0.2s ease-in-out;
}

input:focus {
  outline: none;
  border-color: #0d4637;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(13, 70, 55, 0.15);
}

input::placeholder {
  color: #9ca3af;
}

.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.error-msg {
  font-size: 0.75rem;
  color: #dc2626;
  position: absolute;
  bottom: -1.2rem;
  left: 0;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.9rem;
  background-color: #0d4637;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #136350;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.8;
}

/* Alertas */
.alert {
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
}
.alert--success { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.alert--error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

/* --- RESPONSIVIDAD MÓVIL --- */
@media (max-width: 600px) {
  .registro-card {
    padding: 1.5rem; /* Menos padding interno en móvil */
  }

  .form-row {
    grid-template-columns: 1fr; /* Pasa a una sola columna */
    gap: 1.25rem; /* Aumenta el espacio vertical entre nombre y apellido */
  }
  
  .form-title {
    font-size: 1.75rem; /* Título un poco más pequeño */
    text-align: center;
  }
}
</style>