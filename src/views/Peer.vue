<template>
  <div class="warpper">
    <div class="recorder">
      <h3>本机画面</h3>
      <video ref="recorder" controls autoPlay muted />
      <span>本机peerId：{{ peerId }}</span>
    </div>
    <div class="player">
      <h3>远程画面</h3>
      <video ref="player" controls autoPlay />
      <input
        type="text"
        placeholder="请输入要连接的peerId"
        v-model="originPeerId" />
      <button type="primary" 
        :disabled="peerId === '' || originPeerId === ''"
        @click="handleCall">开始通话</button>
    </div>
  </div>
</template>

<script>
import Peer from 'peerjs'
export default {
  data() {
    return {
      peer: null,
      peerId: '',
      originPeerId: ''
    }
  },
  created() {
    this.initPeer()
  },
  methods: {
    initPeer() {
      this.peer = new Peer()
      this.peer.on('open', id => {
        this.peerId = id
      })
      // 等待媒体接受传输
      this.peer.on('call', async call => {
        if (window.confirm(`是否接受 ${call.peer}?`)) {
          // 获取本地流
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })

          const recorderVideo = this.$refs.recorder
          recorderVideo.srcObject = stream
          recorderVideo.play()

          // 响应
          call.answer(stream)
          // 监听视频流，并更新到 remoteVideo 上
          call.on('stream', remoteVideo => {
            const playerVideo = this.$refs.player
            playerVideo.srcObject = remoteVideo
            playerVideo.play()
            
          })
        }
      })
    },
    async handleCall() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      const recorderVideo = this.$refs.recorder
      recorderVideo.srcObject = stream
      recorderVideo.play()
      
      const connection = this.peer.connect(this.originPeerId)
      connection.on('open', () => {
        console.log('已连接')
        // 多媒体传输
        const call = this.peer.call(this.originPeerId, stream)
        call.on('stream', remoteVideo => {
          const playerVideo = this.$refs.player
          playerVideo.srcObject = remoteVideo
          playerVideo.play()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.warpper {
  display: flex;
  > div {
    flex: 1;
    &:first-of-type {
      margin-right: 20px;
    }
    h3 {
      margin: 10px 0;
    }
    video {
      width: 100%;
      height: 100%;
    }
    input {
      margin-right: 10px;
    }
  }
}
</style>
