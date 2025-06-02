import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiereAuth: true }
  },
  {
    path: '/agregar',
    name: 'Agregar',
    component: () => import('../views/Agregar.vue')
  },
  {
    path: '/traductor',
    name: 'Traductor',
    component: () => import('../views/Traductor.vue')
  },
  {
    path: '/prueba',
    name: 'Prueba',
    component: () => import('../views/Prueba.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiereAuth = to.matched.some(record => record.meta.requiereAuth)
  const estaLogueado = localStorage.getItem('logueado') === '1'
  if (requiereAuth && !estaLogueado) {
    next('/')
  } else {
    next()
  }
})

export default router
