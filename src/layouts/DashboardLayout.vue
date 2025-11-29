<template>
  <div class="dashboard-layout">
    <header class="top-bar">
      <div class="brand">MarketVue <span>Panel</span></div>
      <div class="user-info">
        <span>Bienvenido</span>
      </div>
    </header>

    <div class="main-wrapper">
      <aside class="sidebar">
        <nav class="nav-links">
          
          <p class="nav-category">GESTIÓN</p>
          <router-link :to="{ name: 'publisher-products' }" class="nav-item">
            Mis Publicaciones
          </router-link>
          
          <p class="nav-category">CUENTA</p>
          <router-link :to="{ name: 'publisher-profile' }" class="nav-item">
            Mi Perfil
          </router-link>

          <p class="nav-category">SOPORTE</p>
          <router-link :to="{ name: 'publisher-reports' }" class="nav-item">
            Mis Reportes
          </router-link>
          <router-link :to="{ name: 'publisher-contact' }" class="nav-item">
            Contactar Ayuda
          </router-link>

        </nav>
      </aside>

      <main class="content-area">
        <router-view></router-view>
      </main>
    </div>


  </div>
</template>

<style scoped>

.dashboard-layout { display: flex; flex-direction: column; min-height: 100vh; background-color: #f3f4f6; font-family: 'Inter', sans-serif; }
.top-bar { background-color: #064e3b; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 10; }
.brand { font-size: 1.25rem; font-weight: bold; }
.brand span { font-weight: normal; opacity: 0.8; }
.main-wrapper { display: flex; flex: 1; }
.sidebar { width: 250px; background: white; border-right: 1px solid #e5e7eb; padding: 2rem 1rem; display: none; }
@media (min-width: 768px) { .sidebar { display: block; } }

.nav-category { font-size: 0.75rem; color: #9ca3af; font-weight: 700; margin-bottom: 0.5rem; margin-top: 1.5rem; letter-spacing: 0.05em; }
.nav-item { display: block; padding: 0.75rem 1rem; color: #374151; text-decoration: none; border-radius: 0.375rem; margin-bottom: 0.25rem; font-weight: 500; transition: all 0.2s; }
.nav-item:hover { background-color: #f0fdf4; color: #065f46; }
.router-link-active { background-color: #d1fae5; color: #064e3b; font-weight: 600; }
.content-area { flex: 1; padding: 2rem; }


.floating-dock {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  z-index: 100;
  align-items: flex-end;
}

.float-pill {
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  background: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.float-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}


.btn-create { background-color: #059669; color: white; border: none; }
.btn-products { color: #0284c7; border-left: 4px solid #0284c7; }
.btn-profile { color: #7c3aed; border-left: 4px solid #7c3aed; }
.btn-support { color: #d97706; border-left: 4px solid #d97706; } 
</style>