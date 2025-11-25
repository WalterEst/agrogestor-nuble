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

    feedback.value = { type: 'success', text: 'Registro exitoso. Revisa tu correo o inicia sesión.' }
    // Redirigir al login después de un pequeño retardo
    setTimeout(() => router.push({ name: 'login' }), 1000)
  } catch (err) {
    feedback.value = { type: 'error', text: err.message || 'Error inesperado' }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="registro">
    <div class="registro__card card">
      <h2>Crear una cuenta</h2>

      <form @submit.prevent="handleRegister" class="form">
        <label class="field">
          <span>Nombre</span>
          <input v-model="form.nombre" type="text" required />
          <small v-if="!nombreValid">Ingresa al menos 2 caracteres.</small>
        </label>

        <label class="field">
          <span>Apellido</span>
          <input v-model="form.apellido" type="text" />
        </label>

        <label class="field">
          <span>Correo electrónico</span>
          <input v-model="form.email" type="email" required />
          <small v-if="!emailValid">Ingresa un correo válido.</small>
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input v-model="form.passwrd" type="password" required minlength="6" />
          <small v-if="!passwordValid">La contraseña debe tener al menos 6 caracteres.</small>
        </label>

        <label class="field">
          <span>Confirmar contraseña</span>
          <input v-model="form.passwrdConfirm" type="password" required />
          <small v-if="!passwordsMatch">Las contraseñas deben coincidir.</small>
        </label>

        <button class="btn btn--primary btn--full" :disabled="!canSubmit" type="submit">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p v-if="feedback" :class="`alert alert--${feedback.type}`">{{ feedback.text }}</p>

    </div>
  </section>
</template>

<style scoped>
.registro { max-width: 720px; margin: 0 auto; padding: 2rem; }
.registro__card { padding: 1.5rem; }
.field small { color: #b91c1c; }
.alert--success { color: #065f46; }
.alert--error { color: #7f1d1d; }
</style>
