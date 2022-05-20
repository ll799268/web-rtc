<template>
  <videoPlayer :options="playerOptions" />
</template>

<script>
import { videoPlayer } from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'videojs-flash'
import SWF_URL from 'videojs-swf/dist/video-js.swf'

export default {
  components: {
    videoPlayer
  },
  data () {
    return {
      playerOptions: {
        autoplay: true,
        sources: [{
          type: 'rtmp/mp4', 
          src: 'rtmp://36.154.12.195/live/livestream'
        }],
        techOrder: ['html5', 'flash'],
        flash: {
          swf: SWF_URL
        }
      }
    }
  }
}
</script>