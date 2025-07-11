import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const MettingRTC = () => import('@/views/MettingRTC')
const P2PRTC = () => import('@/views/P2PRTC')
const Peer = () => import('@/views/Peer')

const routes = [
  {
    path: '/',
    component: MettingRTC,
  },
  {
    path: '/P2PRTC',
    component: P2PRTC,
  },
  {
    path: '/Peer',
    component: Peer,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
