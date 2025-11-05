<script setup>
import TarjetaLugar from '../components/TarjetaLugar.vue'

const atractivos = [
  {
    titulo: 'Catedral de Chillán',
    descripcion:
      'Icono arquitectónico reconstruido tras el terremoto de 1939. Destaca por sus arcos parabólicos que simbolizan manos unidas en oración y su emotivo monumento a los caídos.',
    categoria: 'Centro histórico',
  },
  {
    titulo: 'Termas de Chillán',
    descripcion:
      'Complejo cordillerano con aguas termales, centro de ski y actividades de montaña durante todo el año. Un imperdible para el bienestar y el turismo aventura.',
    categoria: 'Naturaleza',
  },
  {
    titulo: 'Valle Las Trancas',
    descripcion:
      'Reserva de bosques nativos, senderos y paisajes nevados que conectan con el Parque Nacional Laguna del Laja. Ideal para trekking, bicicleta y observación de fauna.',
    categoria: 'Cordillera',
  },
  {
    titulo: 'Feria de Chillán',
    descripcion:
      'Mercado tradicional donde se encuentran productos campesinos, artesanía en greda y las reconocidas longanizas. Un espacio vivo de sabores y colores locales.',
    categoria: 'Cultura viva',
  },
]
</script>

<template>
  <section class="intro">
    <h1>Atractivos turísticos</h1>
    <p>
      La oferta turística de Chillán combina patrimonio, naturaleza y hospitalidad. Recorre cada uno de sus
      rincones emblemáticos para sumergirte en la identidad ñublensina.
    </p>
  </section>

  <section class="grid">
    <TarjetaLugar
      v-for="atractivo in atractivos"
      :key="atractivo.titulo"
      v-bind="atractivo"
    />
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
