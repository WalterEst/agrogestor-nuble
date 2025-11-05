<script setup>
import TarjetaLugar from '../components/TarjetaLugar.vue'

const platos = [
  {
    titulo: 'Longanizas de Chillán',
    descripcion:
      'Embutido curado con recetas tradicionales transmitidas por generaciones. Se caracteriza por su condimento único y por acompañar celebraciones familiares y fiestas costumbristas.',
    categoria: 'Producto estrella',
  },
  {
    titulo: 'Pan amasado campesino',
    descripcion:
      'Hecho a mano en hornos de barro con harina local, manteca y cariño campesino. El aroma del pan recién salido del horno es parte del patrimonio sensorial de la ciudad.',
    categoria: 'Sabores del campo',
  },
  {
    titulo: 'Vinos del Valle del Itata',
    descripcion:
      'Cepas patrimoniales como la moscatel y la país dan vida a vinos frescos y auténticos. Los viñedos centenarios, cultivados por pequeños productores, reflejan la cultura vitivinícola de Ñuble.',
    categoria: 'Enoturismo',
  },
]
</script>

<template>
  <section class="intro">
    <h1>Sabores con identidad</h1>
    <p>
      La gastronomía de Chillán destaca por productos campesinos y preparaciones tradicionales que celebran
      la generosidad del valle. Degusta estas propuestas y descubre el relato culinario del territorio.
    </p>
  </section>

  <section class="grid">
    <TarjetaLugar v-for="plato in platos" :key="plato.titulo" v-bind="plato" />
  </section>
</template>

<style scoped>
.intro {
  max-width: 760px;
  margin: 0 auto 2.5rem;
  text-align: center;
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

.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>
