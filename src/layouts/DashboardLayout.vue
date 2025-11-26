<template>
  <div class="dashboard-layout">
    <header class="bg-gray-800 text-white p-4">
      <h1 class="text-xl font-bold">Panel MarketVue</h1>
    </header>

    <div class="flex min-h-screen">
      <aside class="w-64 bg-gray-100 p-4 hidden md:block border-r">
        <nav class="space-y-2">
          <p class="text-xs text-gray-500 font-bold uppercase">Publicador</p>
          <router-link 
            to="/panel/publicador/mis-productos" 
            class="block text-indigo-600 hover:underline"
          >
            Mis Publicaciones
          </router-link>
        </nav>
      </aside>

      <main class="flex-1 p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>

</script>