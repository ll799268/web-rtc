<template>
  <div class="web-rtc">
    <div class="warpper">
      <div class="main-warpper">
        <Player :videoOption="entryVideoOption" />
      </div>
      <div class="connect-warpper">
        <Recorder :startRecording="startRecording" />
      </div>
    </div>
    <button @click="handleStartRecording">开始录制</button>
  </div>
</template>

<script>
import Player from './Player'
import Recorder from './Recorder'
export default {
  data() {
    return {
      entryVideoOption: {
        url: 'webrtc://36.154.12.195:81/live/livestream'
      },
      startRecording: false
    }
  },
  components: {
    Player,
    Recorder
  },
  methods: {
    handleStartRecording () {
      this.startRecording = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .web-rtc {
    display: flex;
    flex-direction: column;
    height: 80vh;
    overflow: hidden;
    .warpper {
      display: flex;
      height: 80%;
      .main-warpper {
        flex: 7;
        margin-right: 10px;
      }
      .connect-warpper {
        flex: 3;
      }
    }
    button {
      width: 100px;
      margin: 10px 0 0 auto;
    }
  }
</style>
