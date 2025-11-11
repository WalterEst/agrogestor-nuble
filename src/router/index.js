import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/explore', name: 'explore', component: () => import('../views/Explore.vue') },
  { path: '/mine', name: 'myPosts', component: () => import('../views/MyPosts.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
