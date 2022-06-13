import axios from 'axios'

export function SrsRtcPublisherAsync() {
  const self = {}
  self.constraints = {
    audio: true,
    video: true
  }
  self.publish = async url => {
    let conf = self.__internal.prepareUrl(url)
    self.pc.addTransceiver('audio', { direction: 'sendonly' })
    self.pc.addTransceiver('video', { direction: 'sendonly' })

    const stream = await navigator.mediaDevices.getUserMedia(self.constraints)
    stream.getTracks().forEach(track => {
      self.pc.addTrack(track)
      self.ontrack && self.ontrack({ track })
    })

    const offer = await self.pc.createOffer()
    await self.pc.setLocalDescription(offer)

    const session = await new Promise((resolve, reject) => {
      const data = {
        api: conf.apiUrl, 
        tid: conf.tid, 
        streamurl: conf.streamUrl,
        clientip: null, 
        sdp: offer.sdp
      }
      // console.log('Generated offer: ', data);
      axios({
        method: 'post',
        url: conf.apiUrl,
        data: JSON.stringify(data)
      })
      .then(res => {
        // console.log('Got answer: ', res);
        if (res.data.code) {
          return reject(res.data)
        }
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
     
    })

    await self.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
    )
    session.simulator = conf.schema + '//' + conf.urlObject.server + ':' + conf.port + '/rtc/v1/nack/'
    return session
  }

  self.close = () => {
    self.pc && self.pc.close()
    self.pc = null
  }

  self.ontrack = event => self.stream.addTrack(event.track)
  
  self.__internal = {
    defaultPath: '/rtc/v1/publish/',
    prepareUrl: webrtcUrl => {
      const urlObject = self.__internal.parse(webrtcUrl)

      let schema = urlObject.user_query.schema
      schema = schema ? schema + ':' : window.location.protocol

      let port = urlObject.port || 1985
      if (schema === 'https:') {
        port = urlObject.port || 443
      }

      let api = urlObject.user_query.play || self.__internal.defaultPath
      if (api.lastIndexOf('/') !== api.length - 1) {
        api += '/'
      }

      let apiUrl = schema + '//' + urlObject.server + ':' + port + api
      for (const key in urlObject.user_query) {
        if (key !== 'api' && key !== 'play') {
          apiUrl += '&' + key + '=' + urlObject.user_query[key]
        }
      }

      apiUrl = apiUrl.replace(api + '&', api + '?')
      const streamUrl = urlObject.url

      return {
        apiUrl, 
        streamUrl, 
        schema, 
        urlObject, 
        port,
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100)).toString(16).substr(0, 7)
      }
    },
    parse: url => {
      const a = document.createElement('a')
      a.href = url.replace('rtmp://', 'http://')
        .replace('webrtc://', 'http://')
        .replace('rtc://', 'http://')

      let vhost = a.hostname
      let app = a.pathname.substr(1, a.pathname.lastIndexOf('/') - 1)
      let stream = a.pathname.substr(a.pathname.lastIndexOf('/') + 1)

      app = app.replace('...vhost...', '?vhost=')
      if (app.indexOf('?') >= 0) {
        let params = app.substr(app.indexOf('?'))
        app = app.substr(0, app.indexOf('?'))

        if (params.indexOf('vhost=') > 0) {
          vhost = params.substr(params.indexOf('vhost=') + 'vhost='.length)
          if (vhost.indexOf('&') > 0) {
            vhost = vhost.substr(0, vhost.indexOf('&'))
          }
        }
      }

      if (a.hostname === vhost) {
        const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        if (re.test(a.hostname)) {
          vhost = '__defaultVhost__'
        }
      }

      let schema = 'rtmp'
      if (url.indexOf('://') > 0) {
        schema = url.substr(0, url.indexOf('://'))
      }

      let port = a.port
      if (!port) {
        if (schema === 'http') {
          port = 80
        } else if (schema === 'https') {
          port = 443
        } else if (schema === 'rtmp') {
          port = 1935
        }
      }

      const ret = {
        url,
        schema,
        server: a.hostname, port: port,
        vhost, 
        app, 
        stream
      }
      self.__internal.fill_query(a.search, ret)

      if (!ret.port) {
        if (schema === 'webrtc' || schema === 'rtc') {
          if (ret.user_query.schema === 'https' ||
            window.location.href.indexOf('https://') === 0) {
            ret.port = 443
          } else {
            ret.port = 1985
          }
        }
      }
      return ret
    },
    fill_query: (query_string, obj) => {
      obj.user_query = {}

      if (query_string.length === 0) return

      if (query_string.indexOf('?') >= 0) {
        query_string = query_string.split('?')[1]
      }

      const queries = query_string.split('&')

      for (const i = 0; i < queries.length; i++) {
        const elem = queries[i]
        const query = elem.split('=')

        obj[query[0]] = query[1]
        obj.user_query[query[0]] = query[1]
      }
      if (obj.domain) {
        obj.vhost = obj.domain
      }
    }
  }

  self.pc = new RTCPeerConnection(null)
  self.stream = new MediaStream()
  return self
}

export function SrsRtcPlayerAsync() {
  const self = {}
  self.play = async url => {
    const conf = self.__internal.prepareUrl(url)
    self.pc.addTransceiver('audio', { direction: 'recvonly' })
    self.pc.addTransceiver('video', { direction: 'recvonly' })

    const offer = await self.pc.createOffer()
    await self.pc.setLocalDescription(offer)

    const session = await new Promise((resolve, reject) => {
      const data = {
        api: conf.apiUrl, 
        tid: conf.tid, 
        streamurl: conf.streamUrl,
        clientip: null, 
        sdp: offer.sdp
      }

      // console.log('Generated offer: ', data);
      axios({
        method: 'post',
        url: conf.apiUrl,
        data: JSON.stringify(data)
      })
      .then(res => {
        // console.log('Got answer: ', res);
        if (res.data.code) {
          return reject(res.data)
        }
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })

    })
    await self.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
    )
    session.simulator = conf.schema + '//' + conf.urlObject.server + ':' + conf.port + '/rtc/v1/nack/'
    return session
  }

  self.close = () => {
    self.pc && self.pc.close()
    self.pc = null
  }

  self.ontrack = event => self.stream.addTrack(event.track)

  self.__internal = {
    defaultPath: '/rtc/v1/play/',
    prepareUrl: webrtcUrl => {
      const urlObject = self.__internal.parse(webrtcUrl)

      let schema = urlObject.user_query.schema
      schema = schema ? schema + ':' : window.location.protocol

      let port = urlObject.port || 1985
      if (schema === 'https:') {
        port = urlObject.port || 443
      }

      let api = urlObject.user_query.play || self.__internal.defaultPath
      if (api.lastIndexOf('/') !== api.length - 1) {
        api += '/'
      }

      let apiUrl = schema + '//' + urlObject.server + ':' + port + api
      for (const key in urlObject.user_query) {
        if (key !== 'api' && key !== 'play') {
          apiUrl += '&' + key + '=' + urlObject.user_query[key]
        }
      }

      apiUrl = apiUrl.replace(api + '&', api + '?')
      const streamUrl = urlObject.url

      return {
        apiUrl, 
        streamUrl, 
        schema, 
        urlObject, 
        port,
        tid: Number(parseInt(new Date().getTime() * Math.random() * 100)).toString(16).substr(0, 7)
      }
    },
    parse: url => {
      const a = document.createElement('a')
      a.href = url.replace('rtmp://', 'http://')
        .replace('webrtc://', 'http://')
        .replace('rtc://', 'http://')

      let vhost = a.hostname
      let app = a.pathname.substr(1, a.pathname.lastIndexOf('/') - 1)
      let stream = a.pathname.substr(a.pathname.lastIndexOf('/') + 1)

      app = app.replace('...vhost...', '?vhost=')
      if (app.indexOf('?') >= 0) {
        let params = app.substr(app.indexOf('?'))
        app = app.substr(0, app.indexOf('?'))

        if (params.indexOf('vhost=') > 0) {
          vhost = params.substr(params.indexOf('vhost=') + 'vhost='.length)
          if (vhost.indexOf('&') > 0) {
            vhost = vhost.substr(0, vhost.indexOf('&'))
          }
        }
      }

      if (a.hostname === vhost) {
        const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        if (re.test(a.hostname)) {
          vhost = '__defaultVhost__'
        }
      }

      let schema = 'rtmp'
      if (url.indexOf('://') > 0) {
        schema = url.substr(0, url.indexOf('://'))
      }

      let port = a.port
      if (!port) {
        if (schema === 'http') {
          port = 80
        } else if (schema === 'https') {
          port = 443
        } else if (schema === 'rtmp') {
          port = 1935
        }
      }

      const ret = {
        url,
        schema,
        server: a.hostname, 
        port,
        vhost, 
        app, 
        stream
      }
      self.__internal.fill_query(a.search, ret)

      if (!ret.port) {
        if (schema === 'webrtc' || schema === 'rtc') {
          if (ret.user_query.schema === 'https' ||
            window.location.href.indexOf('https://') === 0) {
            ret.port = 443
          } else {
            ret.port = 1985
          }
        }
      }
      return ret
    },
    fill_query: (query_string, obj) => {
      obj.user_query = {}

      if (query_string.length === 0) return

      if (query_string.indexOf('?') >= 0) {
        query_string = query_string.split('?')[1]
      }

      const queries = query_string.split('&')

      for (const i = 0; i < queries.length; i++) {
        const elem = queries[i]
        const query = elem.split('=')

        obj[query[0]] = query[1]
        obj.user_query[query[0]] = query[1]
      }
      if (obj.domain) {
        obj.vhost = obj.domain
      }
    }
  }

  self.pc = new RTCPeerConnection(null)
  self.stream = new MediaStream()
  self.pc.ontrack = event => self.ontrack && self.ontrack(event)

  return self
}