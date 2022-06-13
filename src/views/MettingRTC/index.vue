<template>
  <div class="meeting-rtc">
    <!-- <NativePlayer />
    <OriginPlayer /> -->

    <div class="self">
      <video ref="selfPlayer"
        autoplay muted controls></video>
      <b ref="selfUrl"></b>
     <div class="button-groups">
        <button @click="handleStartRecord">开始录制</button>
        <button @click="handleStopRecord">停止录制</button>
        <button @click="handleRecordList">录制列表</button>
     </div>
    </div>
    <div class="others" ref="others">
      <!-- <div class="player">
        <video class="others-player"
          autoplay muted controls></video>
        <b class="other">other</b>
      </div> -->
    </div>
  </div>
</template>

<script>
// import NativePlayer from './NativePlayer'
// import OriginPlayer from './OriginPlayer'
import FaceTime from '@/modules/srs/face-time'
import { recordStart, recordStop, getVideoList } from '@/api/web-rtc'
export default {
  data () {
    this.faceTime = null
    return {
      threadId: ''
    }
  },
  // components: {
  //   NativePlayer,
  //   OriginPlayer
  // },
  mounted () {
    this.initFaceTime()
  },
  methods: {
    initFaceTime () {
      const faceTime = new FaceTime(this.$refs.selfPlayer, this.$refs.selfUrl, this.$refs.others)
      faceTime.startDemo()
      this.faceTime = faceTime
    },
    async handleStartRecord () {
      const { host, room, display } = this.faceTime.config
      const videoPath = `rtmp://${host}:1443/${room}/${display}`
      if (!videoPath) return
      const result = await recordStart({ videoPath })
      this.threadId = result.data.data
      console.log(result);
    },
    async handleStopRecord () {
      if (!this.threadId) {
        alert('请先开始录制!')
      }
      const result = await recordStop(this.threadId)
      console.log(result);
    },
    async handleRecordList () {
      const result = await getVideoList()
      console.log(result)
    }
  }
}
</script>

<style lang="scss" scoped>
  .meeting-rtc {
    display: flex;
    height: 100vh;
    video {
      object-fit: cover;
    }
    .self {
      width: 69%;
      height: 100%;
      margin-right: 1%;
      b {
        display: inline-block;
        margin: 6px 0;
      }
      video {
        width: 100%;
        height: 90%;
      }
    }
    .others {
      width: 30%;
      overflow-y: auto;
      overflow-x: hidden;
      .player {
        height: 30%;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        &:first-of-type {
          margin-top: 0;
        }
      }
    }
  }
</style>
