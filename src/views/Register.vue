<template>
  <section class="auth auth--register">
    <div class="auth__panel card">
      <header class="auth__header">
        <h1 class="auth__title">Solicita tu acceso</h1>
        <p class="auth__subtitle">
          Completa el formulario y un administrador confirmará tus datos para habilitarte como vendedor en la plataforma.
        </p>
      </header>

      <form class="auth__form" @submit.prevent="submit" novalidate>
        <div class="input-field">
          <label for="register-name">Nombre completo</label>
          <input id="register-name" v-model="name" type="text" placeholder="Ej. María González" autocomplete="name" required />
        </div>

        <div class="input-grid">
          <label class="input-field">
            <span>Edad</span>
            <input id="register-age" v-model.number="age" type="number" min="18" max="120" required />
          </label>
          <label class="input-field">
            <span>Teléfono de contacto</span>
            <input id="register-phone" v-model="phone" type="tel" placeholder="Ej. +56 9 1234 5678" required />
          </label>
        </div>

        <div class="input-field">
          <label for="register-address">¿Dónde vives?</label>
          <input id="register-address" v-model="address" type="text" placeholder="Comuna, ciudad o dirección de referencia" required />
        </div>

        <div class="input-field">
          <label for="register-rut">RUT</label>
          <input id="register-rut" v-model="rut" type="text" placeholder="Ej. 12.345.678-9" required aria-describedby="register-rut-help" :aria-invalid="!rutValid && rutTouched" />
          <p id="register-rut-help" class="input-help" v-if="rutTouched && !rutValid" role="alert" aria-live="polite">Ingresa un RUT válido (formato 12345678-9)</p>
        </div>

        <div class="input-field">
          <label for="register-email">Correo electrónico</label>
          <input id="register-email" v-model="email" type="email" placeholder="nombre@correo.cl" autocomplete="email" required aria-describedby="register-email-help" :aria-invalid="!emailValid && emailTouched" />
          <p id="register-email-help" class="input-help" v-if="emailTouched && !emailValid" role="alert" aria-live="polite">Ingresa un correo válido</p>
        </div>

        <div class="input-field">
          <label for="register-password">Contraseña</label>
          <input id="register-password" v-model="password" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" minlength="6" required aria-describedby="register-password-help" :aria-invalid="!passwordValid && passwordTouched" />
          <p id="register-password-help" class="input-help" v-if="passwordTouched && !passwordValid" role="alert" aria-live="polite">La contraseña debe tener al menos 6 caracteres</p>
        </div>

        <button class="btn btn--primary" type="submit" :disabled="!formValid || loading">{{ loading ? 'Enviando...' : 'Solicitar registro' }}</button>
      </form>

      <p class="auth__meta">
        ¿Ya estás registrado?
        <router-link to="/login">Volver al inicio de sesión</router-link>
      </p>

      <p v-if="msg" class="auth__success" role="status">{{ msg }}</p>
      <p v-if="err" class="auth__error" role="alert">{{ err }}</p>
    </div>

    <aside class="auth__aside">
      <h2>Únete a la red agrícola local</h2>
      <p>
        Promociona tus cultivos, enlaza con compradores mayoristas y recibe apoyo del ecosistema municipal. Solo toma unos
        minutos iniciar el proceso.
      </p>
    </aside>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '../services/api';
import { isEmail, isPasswordValid, isRutValid } from '../services/validators';
import { showError, showSuccess } from '../services/toast';

const name = ref('');
const email = ref('');
const password = ref('');
const age = ref(18);
const address = ref('');
const rut = ref('');
const phone = ref('');
const msg = ref('');
const err = ref('');
const loading = ref(false);

const emailTouched = ref(false);
const passwordTouched = ref(false);
const rutTouched = ref(false);

const emailValid = computed(() => isEmail(email.value));
const passwordValid = computed(() => isPasswordValid(password.value));
const rutValid = computed(() => isRutValid(rut.value));
const formValid = computed(() => name.value.trim().length >= 2 && emailValid.value && passwordValid.value && rutValid.value && address.value.trim().length >= 5 && phone.value.trim().length >= 6 && age.value >= 18);

function markTouched() {
  emailTouched.value = true;
  passwordTouched.value = true;
  rutTouched.value = true;
}

async function submit() {
  if (loading.value) return;
  markTouched();
  msg.value = '';
  err.value = '';
  if (!formValid.value) return;
  loading.value = true;
  try {
    await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      age: age.value,
      address: address.value,
      rut: rut.value,
      phone: phone.value,
    });
    msg.value = '¡Solicitud enviada! Revisa tu correo para conocer el estado de aprobación.';
    showSuccess(msg.value);
    name.value = '';
    email.value = '';
    password.value = '';
    age.value = 18;
    address.value = '';
    rut.value = '';
    phone.value = '';
  } catch (e) {
    const message = e?.response?.data?.error || e?.message || 'Ocurrió un error al registrar tu cuenta.';
    err.value = message;
    showError(message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}


</style>
