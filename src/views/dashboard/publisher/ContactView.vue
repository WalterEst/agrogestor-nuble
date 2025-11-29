<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import publisherService from '../../../services/publisherService';

const router = useRouter();
const isLoading = ref(false);

const form = ref({
  asunto: '',
  mensaje: ''
});

const enviarMensaje = async () => {
  if (!form.value.asunto || !form.value.mensaje) {
    alert("Por favor completa todos los campos");
    return;
  }

  isLoading.value = true;
  try {
    await publisherService.sendContactForm(form.value);
    alert("Mensaje enviado. El equipo de soporte te responderá pronto.");
    router.push({ name: 'publisher-reports' }); // Redirige a la lista de reportes
  } catch (error) {
    alert("Error al enviar el mensaje.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="publisher-container">
    <div class="pub-hero">
      <div>
        <h1>Contacto y Soporte</h1>
        <p>¿Tienes dudas o necesitas reportar algo? Escríbenos.</p>
      </div>
    </div>

    <div class="pub-card" style="max-width: 700px; margin: 0 auto;">
      <form @submit.prevent="enviarMensaje">
        
        <div class="pub-field">
          <label>Asunto</label>
          <input v-model="form.asunto" type="text" class="pub-input" placeholder="Ej: Error al subir producto" required>
        </div>

        <div class="pub-field">
          <label>Mensaje Detallado</label>
          <textarea v-model="form.mensaje" rows="6" class="pub-textarea" placeholder="Describe tu problema o reporte..." required></textarea>
        </div>

        <div style="text-align: right; margin-top: 1rem;">
          <button type="submit" class="pub-btn" :disabled="isLoading">
            {{ isLoading ? 'Enviando...' : 'Enviar Mensaje' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
@import '../../../estilos/PublisherDashboard.css';
</style>