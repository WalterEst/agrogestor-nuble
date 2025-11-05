<script setup>
import { reactive } from 'vue'

const form = reactive({
  nombre: '',
  email: '',
  mensaje: '',
})

function onSubmit(event) {
  event.preventDefault()
  alert(`Gracias por contactarnos, ${form.nombre || 'visitante'}! Pronto responderemos tu mensaje.`)
  form.nombre = ''
  form.email = ''
  form.mensaje = ''
}
</script>

<template>
  <section class="contacto">
    <div class="intro">
      <h1>Contacto municipal</h1>
      <p>
        ¿Tienes dudas sobre servicios turísticos, eventos culturales o deseas sumar tu emprendimiento? Escríbenos y
        el equipo de la Municipalidad de Chillán se comunicará contigo.
      </p>
    </div>

    <form class="formulario" @submit="onSubmit">
      <label>
        Nombre completo
        <input v-model="form.nombre" type="text" name="nombre" placeholder="Ej. María González" required />
      </label>

      <label>
        Correo electrónico
        <input v-model="form.email" type="email" name="email" placeholder="nombre@correo.cl" required />
      </label>

      <label>
        Mensaje
        <textarea
          v-model="form.mensaje"
          name="mensaje"
          rows="5"
          placeholder="Cuéntanos cómo podemos ayudarte"
          required
        ></textarea>
      </label>

      <button type="submit">Enviar mensaje</button>
    </form>
  </section>
</template>

<style scoped>
.contacto {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: start;
}

.intro h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  color: #0b2e4a;
  margin-bottom: 1rem;
}

.intro p {
  color: #2c3e50;
  line-height: 1.7;
}

.formulario {
  display: grid;
  gap: 1.25rem;
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(15, 32, 39, 0.12);
}

label {
  display: grid;
  gap: 0.5rem;
  font-weight: 600;
  color: #10375c;
}

input,
textarea {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(16, 55, 92, 0.2);
  font-size: 1rem;
  font-family: inherit;
}

button {
  justify-self: start;
  padding: 0.75rem 2rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #184d47, #0b5394);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(16, 55, 92, 0.25);
}
</style>
