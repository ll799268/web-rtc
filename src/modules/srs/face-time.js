
import { SrsRtcSignalingAsync, SrsRtcSignalingParse } from '@/modules/srs/srs.big'
import { SrsRtcPublisherAsync, SrsRtcPlayerAsync } from '@/modules/srs/srs.sdk'

const faceTime = (selfPlayer, selfUrl, others) => {
  (() => {
    let sig = null
    let publisher = null
    let players = {}
  
    const locationConfig = SrsRtcSignalingParse({
      hash: '',
      host: '36.154.12.195:1443',
      hostname: '36.154.12.195',
      href: 'https://36.154.12.195:1443/demos/room.html',
      origin: 'https://36.154.12.195:1443',
      pathname: '/demos/room.html',
      port: '1443',
      protocol: 'https:'
    })

    let config = {
      host: locationConfig.host,
      room: 'live',
      display: locationConfig.display
    }

    const startDemo = async () => {

      const { host, room, display } = config

      sig && sig.close()
      sig = new SrsRtcSignalingAsync()

      sig.onmessage = msg => {
        if (msg.event === 'publish') {
          if (msg.peer && 
            msg.peer.publishing &&
            msg.peer.display !== display) {
            startPlay(
              host, 
              room, 
              msg.peer.display)
          }
        }

        // Remove dead players.
        if (msg.event === 'join' || msg.event === 'leave') {
          for (const k in players) {
            let stillAlive = false
            msg.participants.forEach(participant => {
              if (participant.display === k) stillAlive = true
            })

            if (!stillAlive) {
              players[k].player.close()
              others.removeChild(players[k].playDom)
            }
          }
        }
      }

      await sig.connect(locationConfig.wsSchema, locationConfig.wsHost, room, display)
      let r0 = await sig.send({ action: 'join', room, display })
      await startPublish(host, room, display)
      let r1 = await sig.send({ action: 'publish', room, display })

      r0.participants.forEach(participant => {
        if (participant.display === display || !participant.publishing) return
        startPlay(host, room, participant.display)
      })

    }

    const startPublish = (host, room, display) => {
      const url = 'webrtc://' + host + '/' + room + '/' + display + locationConfig.query

      if (publisher) {
        publisher.close()
      }

      publisher = new SrsRtcPublisherAsync()

      selfPlayer.srcObject = publisher.stream

      return publisher.publish(url)
      .then(session => {
        selfUrl.innerHTML = `self: ${ url }`
      })
      .catch(reason => {
        // 推流失败
        publisher.close()
        console.error(reason)
      })
    }

    const startPlay = (host, room, display) => {
      if (players[display]) {
        players[display].ui.remove()
        players[display].player.close()
      }

      let player = new SrsRtcPlayerAsync()

      const playDom = document.createElement('div')
      playDom.id = `player-${ display }`
      playDom.className = 'player'

      const videoDom = document.createElement('video')
      videoDom.autoplay = true
      videoDom.controls = true
      videoDom.srcObject = player.stream

      const bDom = document.createElement('b')

      playDom.appendChild(videoDom)
      playDom.appendChild(bDom)
      
      others.appendChild(playDom)
      
      players[display] = { 
        playDom, 
        videoDom, 
        player 
      }

      const url = 'webrtc://' + host + '/' + room + '/' + display + locationConfig.query
      
      player.play(url)
      .then(session => {
        bDom.innerHTML = `Peer：${ url }`
      })
      .catch(reason => {
        player.close()
      })
    }

    startDemo()

  })()

}


export default faceTime
