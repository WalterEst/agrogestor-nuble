<template>
  <section class="auth">
    <div class="auth__panel card">
      <header class="auth__header">
        <h1 class="auth__title">Bienvenido</h1>
        <p class="auth__subtitle">
          Gestiona tus productos, publica nuevas ofertas y mantente conectado con la comunidad de MarketVUE.
        </p>
      </header>

      <form class="auth__form" @submit.prevent="submit" novalidate>
        <div class="input-field">
          <label for="login-email">Correo electrónico</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="nombre@correo.cl"
            autocomplete="email"
            :aria-invalid="!emailValid"
            aria-describedby="login-email-help"
            required
          />
          <p id="login-email-help" class="input-help" v-if="emailTouched && !emailValid" role="alert" aria-live="polite">Ingresa un correo válido</p>
        </div>

        <div class="input-field">
          <label for="login-password">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            :aria-invalid="!passwordValid"
            aria-describedby="login-password-help"
            required
          />
          <p id="login-password-help" class="input-help" v-if="passwordTouched && !passwordValid" role="alert" aria-live="polite">La contraseña debe tener al menos 6 caracteres</p>
        </div>

        <button class="btn btn--primary" type="submit" :disabled="!formValid || loading">
          <span v-if="loading" class="auth__spinner" aria-hidden="true"></span>
          {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="auth__meta">
        ¿Aún no tienes cuenta?
        <span class="link-like">Solicita tu registro</span>
      </p>

    </div>

    <aside class="auth__aside">
      <h2>Productividad rural sin complicaciones</h2>
      <p>
        MarketVUE centraliza tus publicaciones, solicitudes y contactos comerciales. Inicia sesión para acceder a herramientas
        diseñadas para productores y feriantes de Chillán.
      </p>
    </aside>
  </section>
</template>

<style src="./Login.css" scoped></style>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';
import { isEmail, isPasswordValid } from '../services/validators';
import { showError } from '../services/toast';

const email = ref('');
const password = ref('');
const emailTouched = ref(false);
const passwordTouched = ref(false);
const loading = ref(false);
const err = ref('');

const auth = useAuth();
const router = useRouter();

const emailValid = computed(() => isEmail(email.value));
const passwordValid = computed(() => isPasswordValid(password.value));
const formValid = computed(() => emailValid.value && passwordValid.value);

function markTouched() {
  emailTouched.value = true;
  passwordTouched.value = true;
}

async function submit() {
  if (loading.value) return;
  markTouched();
  if (!formValid.value) return;
  loading.value = true;
  err.value = '';
  try {
  
    await auth.login(email.value, password.value);
    router.push('/explore');
  } catch (e) {
    const message = e?.response?.data?.error || e?.message || 'Error al iniciar sesión';
    err.value = message;
    showError(message);
  } finally {
    loading.value = false;
  }
}
</script>
