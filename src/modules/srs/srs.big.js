export function SrsRtcSignalingAsync() {
  const self = {}
  self.connect = async (schema, host, room, display) => {
    const url = schema + '://' + host + '/sig/v1/rtc'
    self.ws = new WebSocket(url + '?room=' + room + '&display=' + display)
    self.ws.onmessage = event => {
      const r = JSON.parse(event.data)
      const promise = self._internals.msgs[r.tid]
      if (promise) {
        promise.resolve(r.msg)
        delete self._internals.msgs[r.tid]
      } else {
        self.onmessage(r.msg)
      }
    }
    return new Promise((resolve, reject) => {
      self.ws.onopen = event => resolve(event)
      self.ws.onerror = event => reject(event)
    })
  }

  // The message is a json object.
  self.send = async msg => {
    return new Promise((resolve, reject) => {
      const r = { tid: Number(parseInt(new Date().getTime() * Math.random() * 100)).toString(16).substr(0, 7), msg }
      self._internals.msgs[r.tid] = { resolve, reject }
      self.ws.send(JSON.stringify(r))
    })
  }

  self.close = () => {
    self.ws && self.ws.close()
    self.ws = null
    for (const tid in self._internals.msgs) {
      var promise = self._internals.msgs[tid]
      promise.reject('close')
    }
  }

  self._internals = {
    // Key is tid, value is object {resolve, reject, response}.
    msgs: {}
  }
  return self
}

export function SrsRtcSignalingParse(location) {
  let query = location.href.split('?')[1]
  query = query ? '?' + query : ''

  let wsSchema = location.href.split('wss=')[1]
  wsSchema = wsSchema ? wsSchema.split('&')[0] : (location.protocol === 'http:' ? 'ws' : 'wss')

  let wsHost = location.href.split('wsh=')[1]
  wsHost = wsHost ? wsHost.split('&')[0] : location.hostname

  let wsPort = location.href.split('wsp=')[1]
  wsPort = wsPort ? wsPort.split('&')[0] : location.host.split(':')[1]

  let host = location.href.split('host=')[1]
  host = host ? host.split('&')[0] : location.hostname

  let room = location.href.split('room=')[1]
  room = room ? room.split('&')[0] : null

  let display = location.href.split('display=')[1]
  display = display ? display.split('&')[0] : Number(parseInt(new Date().getTime() * Math.random() * 100)).toString(16).toString(16).substr(0, 7)

  let autostart = location.href.split('autostart=')[1]
  autostart = autostart && autostart.split('&')[0] === 'true'

  // Remove data in query.
  let rawQuery = query
  if (query) {
    query = query.replace('wss=' + wsSchema, '')
    query = query.replace('wsh=' + wsHost, '')
    query = query.replace('wsp=' + wsPort, '')
    query = query.replace('host=' + host, '')
    if (room) {
      query = query.replace('room=' + room, '')
    }
    query = query.replace('display=' + display, '')
    query = query.replace('autostart=' + autostart, '')

    while (query.indexOf('&&') >= 0) {
      query = query.replace('&&', '&')
    }
    query = query.replace('?&', '?')
    if (query.lastIndexOf('?') === query.length - 1) {
      query = query.substr(0, query.length - 1)
    }
    if (query.lastIndexOf('&') === query.length - 1) {
      query = query.substr(0, query.length - 1)
    }
  }

  wsHost = wsPort ? wsHost.split(':')[0] + ':' + wsPort : wsHost

  return {
    query,
    rawQuery,
    wsSchema, 
    wsHost,
    host,
    room,
    display,
    autostart
  }
}
