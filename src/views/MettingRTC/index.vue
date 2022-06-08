<template>
  <div class="meeting-rtc">
    <!-- <NativePlayer />
    <OriginPlayer /> -->

    <div class="self">
      <video ref="selfPlayer" 
        autoplay muted controls></video>
      <b ref="selfUrl"></b>
    </div>
    <div class="others" ref="others">
      <!-- <div class="player" v-for="player in playersAttr"
        :key="player.id"
        :ref="player.id">
        <video :src="player.stream"
          class="others-player"
          autoplay muted controls></video>
        <b class="other">{{ player.url }}</b>
      </div> -->
    </div>
  </div>
</template>

<script>
// import NativePlayer from './NativePlayer'
// import OriginPlayer from './OriginPlayer'
import faceTime from '@/modules/srs/face-time'
export default {
  // components: {
  //   NativePlayer,
  //   OriginPlayer
  // },
  mounted () {
    this.$nextTick(faceTime(this.$refs.selfPlayer, this.$refs.selfUrl, this.$refs.others))
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
       video {
        width: 100%;
        height: 90%;
      }
    }
    .others {
      width: 30%;
      height: 100%;
      overflow-y: auto;
      .player {
        height: 40%;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        &:first-of-type {
          margin-top: 0;
        }
        video {
          height: 100%;
        }
      }
    }
  }
</style>
