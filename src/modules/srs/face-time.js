
import { SrsRtcSignalingAsync, SrsRtcSignalingParse } from '@/modules/srs/srs.big'
import { SrsRtcPublisherAsync, SrsRtcPlayerAsync } from '@/modules/srs/srs.sdk'

class FaceTime {
  constructor(selfPlayer, selfUrl, others) {
    this.sig = null
    this.publisher = null
    this.players = {}

    this.selfPlayer = selfPlayer
    this.selfUrl = selfUrl
    this.others = others

    this.locationConfig = SrsRtcSignalingParse({
      hash: '',
      host: '36.154.12.195:1443',
      hostname: '36.154.12.195',
      href: 'https://36.154.12.195:1443/demos/room.html',
      origin: 'https://36.154.12.195:1443',
      pathname: '/demos/room.html',
      port: '1443',
      protocol: 'https:'
    })

    this.config = {
      host: this.locationConfig.host,
      room: 'live',
      display: this.locationConfig.display
    }
    
  }
  
  async startDemo () {

    const { host, room, display } = this.config

    this.sig && this.sig.close()
    this.sig = new SrsRtcSignalingAsync()

    this.sig.onmessage = msg => {
      if (msg.event === 'publish') {
        if (msg.peer &&
          msg.peer.publishing &&
          msg.peer.display !== display) {
          this.startPlay(host, room, msg.peer.display)
        }
      }

      // Remove dead players.
      if (msg.event === 'join' || msg.event === 'leave') {
        for (const k in this.players) {
          let stillAlive = false
          msg.participants.forEach(participant => {
            if (participant.display === k) stillAlive = true
          })

          if (!stillAlive) {
            this.players[k].player.close()
            try {
              this.others.removeChild(this.players[k].playDom)
            } catch {  }
          }
        }
      }
    }

    const { wsSchema, wsHost } = this.locationConfig

    await this.sig.connect(wsSchema, wsHost, room, display)
    let r0 = await this.sig.send({ action: 'join', room, display })
    await this.startPublish(host, room, display)
    let r1 = await this.sig.send({ action: 'publish', room, display })

    r0.participants.forEach(participant => {
      if (participant.display === display || !participant.publishing) return
      this.startPlay(host, room, participant.display)
    })

  }

  async startPublish (host, room, display) {
    const url = 'webrtc://' + host + '/' + room + '/' + display + this.locationConfig.query

    if (this.publisher) {
      this.publisher.close()
    }

    this.publisher = new SrsRtcPublisherAsync()

    this.selfPlayer.srcObject = this.publisher.stream

    try {
      const session = await this.publisher.publish(url)
      this.selfUrl.innerHTML = `self: ${url}`
    } catch (reason) {
      // 推流失败
      this.publisher.close()
      console.error(reason)
    }
  }

  startPlay (host, room, display) {
    if (this.players[display]) {
      this.players[display].ui.remove()
      this.players[display].player.close()
    }

    let player = new SrsRtcPlayerAsync()

    const playDom = document.createElement('div')
    playDom.id = `player-${display}`
    playDom.className = 'player'

    const videoDom = document.createElement('video')
    videoDom.autoplay = true
    videoDom.controls = true
    videoDom.srcObject = player.stream
    videoDom.style.width = '100%'

    const bDom = document.createElement('b')

    playDom.appendChild(videoDom)
    playDom.appendChild(bDom)

    this.others.appendChild(playDom)

    this.players[display] = {
      playDom,
      videoDom,
      player
    }

    const url = 'webrtc://' + host + '/' + room + '/' + display + this.locationConfig.query

    player.play(url)
      .then(session => {
        bDom.innerHTML = `Peer：${url}`
      })
      .catch(reason => {
        player.close()
      })
  }

}

export default FaceTime
