import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const MettingRTC = () => import('@/views/MettingRTC')
const FlashVideo = () => import('@/views/FlashVideo')

const routes = [
  {
    path: '/',
    component: MettingRTC,
  },
  {
    path: '/flash-video',
    component: FlashVideo,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
