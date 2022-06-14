import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const MettingRTC = () => import('@/views/MettingRTC')

const routes = [
  {
    path: '/',
    component: MettingRTC,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
