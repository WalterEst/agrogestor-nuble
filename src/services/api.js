// Datos simulados para desarrollo
const mockPosts = [
  {
    id: 1,
    title: 'Tomates Cherry orgánicos',
    price: 3200,
    description: 'Tomates cherry frescos de cultivo orgánico, ideales para ensaladas y decoración.',
    seller: 'Agrícola San Pedro',
    isActive: true,
  },
  {
    id: 2,
    title: 'Lechugas de temporada',
    price: 1800,
    description: 'Lechuga crespa y morada, cosechadas recientemente.',
    seller: 'Huerto Los Andes',
    isActive: true,
  },
  {
    id: 3,
    title: 'Zanahorias frescas',
    price: 2000,
    description: 'Zanahorias para venta al por mayor y retail.',
    seller: 'Campo Verde',
    isActive: false,
  },
  {
    id: 4,
    title: 'Manzanas Fuji',
    price: 2500,
    description: 'Manzanas de excelente calidad, perfectas para consumo fresco.',
    seller: 'Asociación de Agricultores',
    isActive: true,
  },
  {
    id: 5,
    title: 'Papas para siembra',
    price: 15000,
    description: 'Papas de primera calidad certificadas para siembra.',
    seller: 'Agroindustria Central',
    isActive: true,
  },
  {
    id: 6,
    title: 'Fresas frescas',
    price: 4500,
    description: 'Fresas seleccionadas, recién cosechadas.',
    seller: 'Huerto del Sur',
    isActive: true,
  },
];

// Servicio de API
const api = {
  get: async (url) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (url === '/posts/mine') {
      return { data: mockPosts.slice(0, 4) };
    }

    if (url === '/posts') {
      return { data: mockPosts };
    }

    throw new Error(`Endpoint no implementado: ${url}`);
  },

  post: async (url, data) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    throw new Error(`Endpoint no implementado: ${url}`);
  },

  patch: async (url, data) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Toggle del estado activo/inactivo
    const match = url.match(/\/posts\/(\d+)\/toggle/);
    if (match) {
      const postId = parseInt(match[1]);
      const post = mockPosts.find((p) => p.id === postId);
      if (post) {
        post.isActive = !post.isActive;
        return { data: post };
      }
    }

    throw new Error(`Endpoint no implementado: ${url}`);
  },

  delete: async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    throw new Error(`Endpoint no implementado: ${url}`);
  },
};

export default api;
