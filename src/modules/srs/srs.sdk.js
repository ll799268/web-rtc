import axios from 'axios'
import { prepareUrl } from '@/libs/src-utils'

class SrsRtcAsync {
  constructor () {
    this.pc = new RTCPeerConnection()
    this.stream = new MediaStream()
  }

  close () {
    this.pc && this.pc.close()
    this.pc = null
  }

  ontrack = event => this.stream.addTrack(event.track)
}

export class SrsRtcPublisherAsync extends SrsRtcAsync {
  constructor () {
    super()
  }

  async publish (url) {
    const conf = prepareUrl(url, '/rtc/v1/publish/')
    this.pc.addTransceiver('audio', { direction: 'sendonly' })
    this.pc.addTransceiver('video', { direction: 'sendonly' })

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track)
      this.ontrack && this.ontrack({ track })
    })

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    const session = await new Promise((resolve, reject) => {
      const data = {
        api: conf.apiUrl, 
        tid: conf.tid, 
        streamurl: conf.streamUrl,
        clientip: null, 
        sdp: offer.sdp
      }
      axios({
        method: 'post',
        url: conf.apiUrl,
        data: JSON.stringify(data)
      })
      .then(res => {
        if (res.data.code) {
          return reject(res.data)
        }
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
    })
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
    )
    session.simulator = conf.schema + '//' + conf.urlObject.server + ':' + conf.port + '/rtc/v1/nack/'
    return session
  }

}

export class SrsRtcPlayerAsync extends SrsRtcAsync {
  constructor () {
    super()
    this.pc.ontrack = event => this.ontrack && this.ontrack(event)
  }

  async play (url) {
    const conf = prepareUrl(url, '/rtc/v1/play/')
    this.pc.addTransceiver('audio', { direction: 'recvonly' })
    this.pc.addTransceiver('video', { direction: 'recvonly' })

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    const session = await new Promise((resolve, reject) => {
      const data = {
        api: conf.apiUrl, 
        tid: conf.tid, 
        streamurl: conf.streamUrl,
        clientip: null, 
        sdp: offer.sdp
      }
      axios({
        method: 'post',
        url: conf.apiUrl,
        data: JSON.stringify(data)
      })
      .then(res => {
        if (res.data.code) {
          return reject(res.data)
        }
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })

    })
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
    )
    session.simulator = conf.schema + '//' + conf.urlObject.server + ':' + conf.port + '/rtc/v1/nack/'
    return session
  }

}