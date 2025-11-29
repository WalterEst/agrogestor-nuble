<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import publisherService from '../../../services/publisherService';

const router = useRouter();
const reports = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const { data } = await publisherService.getMyReports();
    reports.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const getStatusClass = (status) => {
  const map = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    resuelto: 'bg-green-100 text-green-800',
    cerrado: 'bg-gray-100 text-gray-800'
  };
  return map[status] || 'bg-gray-100';
};

const goToContact = () => router.push({ name: 'publisher-contact' });
</script>

<template>
  <div class="publisher-container">
    
    <div class="pub-hero">
      <div>
        <h1>Mis Reportes</h1>
        <p>Historial de tus consultas a soporte.</p>
      </div>
      <button class="pub-btn" @click="goToContact">
        Nuevo Reporte
      </button>
    </div>

    <div v-if="isLoading" class="text-center p-4">Cargando...</div>

    <div v-else class="pub-list">
      
      <div v-if="reports.length === 0" class="empty-state">
        <p>No has realizado reportes aún.</p>
      </div>

      <div v-for="report in reports" :key="report.id" class="report-card">
        <div class="report-header">
          <h3 class="report-title">{{ report.asunto }}</h3>
          <span :class="['status-badge', getStatusClass(report.estado)]">
            {{ report.estado.toUpperCase() }}
          </span>
        </div>
        
        <p class="report-date">{{ report.fecha }}</p>
        
        <div class="report-body">
          <p><strong>Tú:</strong> {{ report.mensaje }}</p>
          <div v-if="report.respuesta" class="admin-reply">
            <p><strong>Soporte:</strong> {{ report.respuesta }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import '../../../estilos/PublisherDashboard.css';

.report-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.report-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.report-date {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.report-body p {
  color: #374151;
  line-height: 1.5;
}

.admin-reply {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0fdf4; 
  border-left: 4px solid #059669;
  border-radius: 4px;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.bg-yellow-100 { background-color: #fef3c7; }
.text-yellow-800 { color: #92400e; }
.bg-green-100 { background-color: #d1fae5; }
.text-green-800 { color: #065f46; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
.text-center { text-align: center; }
.empty-state { text-align: center; padding: 2rem; color: #9ca3af; border: 1px dashed #ccc; border-radius: 8px; }
</style>