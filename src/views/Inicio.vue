<template>
  <section class="hero">
    <div class="hero-content">
      <h1>Bienvenidos a Chillán</h1>
      <p>
        Chillán, capital de la Región de Ñuble, es cuna de artistas y personajes ilustres de la historia
        chilena. Reconstruida tras el terremoto de 1939, la ciudad mezcla tradición y modernidad en su
        arquitectura, mercados y oferta cultural. Su identidad vibrante invita a recorrer plazas, museos y
        a disfrutar del carácter acogedor de su gente.
      </p>
      <RouterLink to="/atractivos" class="cta">Explorar atractivos</RouterLink>
    </div>
  </section>

  <section class="resumen">
    <h2>Historia en breve</h2>
    <p>
      Fundada en 1580, Chillán ha sido escenario de hitos fundamentales para Chile. Tras su destrucción por
      terremotos y erupciones volcánicas, la ciudad renació con una planificación moderna que convive con
      su legado patrimonial. Hoy destaca por su artesanía en greda, mercados campesinos y por ser la puerta
      de entrada al Nevados de Chillán.
    </p>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  place-items: center;
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, rgba(11, 83, 148, 0.85), rgba(24, 77, 71, 0.85)),
    url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80')
      center/cover;
  color: #fff;
  text-align: center;
  border-radius: 1.5rem;
}

.hero-content {
  max-width: 720px;
  display: grid;
  gap: 1.5rem;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: 0.05em;
}

.hero p {
  line-height: 1.7;
  font-size: 1.05rem;
}

.cta {
  justify-self: center;
  padding: 0.8rem 2.5rem;
  background: #f4a259;
  color: #10375c;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(16, 55, 92, 0.25);
}

.resumen {
  margin: 3rem auto 0;
  padding: 0 1.5rem 3rem;
  max-width: 880px;
  text-align: left;
}

.resumen h2 {
  font-size: 2rem;
  color: #0b2e4a;
  margin-bottom: 1rem;
}

.resumen p {
  line-height: 1.8;
  color: #2c3e50;
}
</style>
