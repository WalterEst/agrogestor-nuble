<template>
  <section class="auth">
    <div class="auth__panel card">
      <header class="auth__header">
        <h1 class="auth__title">Bienvenido de vuelta</h1>
        <p class="auth__subtitle">
          Gestiona tus productos agrícolas, publica nuevas ofertas y mantente conectado con la comunidad de AgroGestor.
        </p>
      </header>

      <form class="auth__form" @submit.prevent="submit">
        <div class="input-field">
          <label for="login-email">Correo electrónico</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="nombre@correo.cl"
            autocomplete="email"
            required
          />
        </div>

        <div class="input-field">
          <label for="login-password">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            required
          />
        </div>

        <button class="btn btn--primary" type="submit" :disabled="loading">
          <span v-if="loading" class="auth__spinner" aria-hidden="true"></span>
          {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="auth__meta">
        ¿Aún no tienes cuenta?
        <router-link to="/register">Solicita tu registro</router-link>
      </p>

      <p v-if="err" class="auth__error" role="alert">{{ err }}</p>
    </div>

    <aside class="auth__aside">
      <h2>Productividad rural sin complicaciones</h2>
      <p>
        AgroGestor centraliza tus publicaciones, solicitudes y contactos comerciales. Inicia sesión para acceder a herramientas
        diseñadas para productores y feriantes de Chillán.
      </p>
    </aside>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const email = ref('')
const password = ref('')
const err = ref('')
const loading = ref(false)
const auth = useAuth()
const router = useRouter()
const destination = computed(() =>
  auth.user?.role === 'SUPERADMIN' ? '/admin/dashboard' : '/explore'
)

onMounted(() => {
  if (auth.isLogged) {
    router.replace(destination.value)
  }
})

async function submit() {
  if (loading.value) return
  err.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.replace(destination.value)
  } catch (e) {
    err.value = e?.response?.data?.error || 'Ocurrió un error al iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<!-- Importa el CSS externo y mantenlo scoped -->
<style scoped src="./Login.css"></style>
