import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const WebRTC = () => import('@/views/WebRTC')

const routes = [
  {
    path: '/',
    component: WebRTC,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
