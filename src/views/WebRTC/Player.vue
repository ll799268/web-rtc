<template>
  <video ref="player"
    controls></video>
</template>

<script>
import JSWebrtc from '@/modules/js-web-rtc'
export default {
  props: {
    videoOption: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      Player: null,
    }
  },
  mounted () {
    this.initPlayer()
  },
  methods: {
    initPlayer () {
      const { url, option } = this.videoOption
      this.$nextTick(() => {
        this.player = new JSWebrtc.Player(url, { 
          video: this.$refs.player, 
          autoPaly: true, 
          ...option 
        })
      })
    }
  },
  beforeDestroy () {
    this.Player = null
  }
}
</script>

<style lang="scss" scoped>
  video {
    width: 100%;
    height: 90%;
    object-fit: cover;
  }
</style>
