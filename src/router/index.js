import { createRouter, createWebHistory } from 'vue-router';

const routes = [
<<<<<<< HEAD
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
=======
  { path: '/', redirect: '/explore' },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('../views/Explore.vue'),
  },
  {
    path: '/mine',
    name: 'myPosts',
    component: () => import('../views/MyPosts.vue'),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
>>>>>>> 2ca9f9bca785590591df9fa0ca7e0c99f23bf9f5
