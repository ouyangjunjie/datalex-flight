import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/flight-search',
  },
  {
    path: '/flight-search',
    name: 'flight-search',
    component: () => import('../views/FlightSearch.vue'),
  },
  {
    path: '/booking-info',
    name: 'booking-info',
    component: () => import('../views/BookingInfo.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/flight-search',
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})