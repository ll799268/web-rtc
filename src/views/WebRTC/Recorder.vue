<template>
  <video ref="recorder"
    controls muted></video>
</template>

<script>
export default {
  props: {
    startRecording: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      connect: null
    }
  },
  created () {
    this.initPeer()
  },
  watch: {
    startRecording (Val) {
      Val && this.getStream()
    }
  },
  methods: {
    initPeer () {
      this.connect = new RTCPeerConnection()
    },
    async getStream () {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      const recorderVideo = this.$refs.recorder
      recorderVideo.srcObject = stream
      recorderVideo.play()
    }
  }
}
</script>

<style lang="scss" scoped>
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
