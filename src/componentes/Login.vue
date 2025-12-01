<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '../stores/session'

const form = reactive({
  email: '',
  passwrd: ''
})

const loading = ref(false)
const feedback = ref(null)
const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'
const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore()
const adminRoles = [1, 2]

const emailValid = computed(() =>
  /^\S+@\S+\.\S+$/.test(form.email.trim())
)

const passwordValid = computed(() => form.passwrd.trim().length >= 6)
const canSubmit = computed(() => emailValid.value && passwordValid.value && !loading.value)

const handleSubmit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  feedback.value = null

  try {
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email.trim(), passwrd: form.passwrd })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'No pudimos validar tus credenciales')
    }

    const nombre = payload?.usuario?.nombre || 'a MarkeVUE'
    const roleId = Number(payload?.usuario?.rol_id)
    const isAdmin = adminRoles.includes(roleId)
    const estado = payload?.usuario?.estado_registro || 'pendiente'
    sessionStore.setSession(payload)
    feedback.value = {
      type: 'success',
            text: isAdmin
        ? `¡Bienvenido ${nombre}! Redirigiendo al panel administrador.`
        : `¡Bienvenido ${nombre}! Estado de tu cuenta: ${estado}.`
    }

    const redirectPath = route.query.redirect

    if (isAdmin) {
      await router.push({ name: 'admin' })
      return
    }

    if (typeof redirectPath === 'string' && redirectPath) {
      await router.replace(redirectPath)
      return
    }
    
    await router.push({ name: 'publicaciones' })
  } catch (error) {
    feedback.value = {
      type: 'error',
      text: error.message || 'Error inesperado. Intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="login__hero">
      <p class="pill pill--success">Nuevo</p>
      <h1>Accede a tu cuenta</h1>
      <p class="lead">
        Ingresa con tu correo y contraseña para gestionar tus productos, revisar tus publicaciones
        y seguir el estado de tus solicitudes dentro de <strong>MarkeVUE</strong>.
      </p>
      <div class="status-grid">
        <article class="status">
          <p class="status__label">Estados de cuentas</p>
          <p class="status__value">Pendiente - Aprobada - Rechazada - Bloqueada</p>
          <p class="status__hint">
            Si tu cuenta está pendiente, un administrador debe revisarla antes de que puedas publicar.
          </p>
        </article>
        <article class="status">
          <p class="status__label">Tipos de usuario</p>
          <p class="status__value">super administrador · administrador · usuario</p>
          <p class="status__hint">
            Los administradores pueden revisar y aprobar nuevas cuentas y publicaciones.
          </p>
        </article>
      </div>
    </div>

    <div class="login__card card">
      <div class="login__head">
        <div>
          <h2>Inicia sesión en MarkeVUE</h2>
          <p class="muted">
            Usa las credenciales que registraste al crear tu cuenta. Si tienes problemas para ingresar,
            contacta al administrador de la plataforma.
          </p>
        </div>
      </div>

      <form class="login__form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>Correo electrónico</span>
          <input
            v-model="form.email"
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.cl"
            required
            :class="{ 'field--error': feedback?.type === 'error' && !emailValid }"
          />
          <small v-if="!emailValid">Ingresa un correo válido.</small>
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input
            v-model="form.passwrd"
            name="passwrd"
            type="password"
            placeholder="Tu contraseña"
            minlength="6"
            required
            :class="{ 'field--error': feedback?.type === 'error' && !passwordValid }"
          />
          <small v-if="!passwordValid">Debe contener al menos 6 caracteres.</small>
        </label>

        <button class="btn btn--primary btn--full" type="submit" :disabled="!canSubmit">
          <span v-if="loading" class="loader" aria-hidden="true"></span>
          {{ loading ? 'Validando...' : 'Ingresar' }}
        </button>
      </form>

      <p v-if="feedback" class="alert" :class="`alert--${feedback.type}`">
        {{ feedback.text }}
      </p>

      <ul class="hints">
        <li>Si olvidaste tu contraseña, contacta al equipo de soporte de la plataforma.</li>
      </ul>
    </div>
  </section>
</template>

<style scoped src="../estilos/Login.css"></style>
