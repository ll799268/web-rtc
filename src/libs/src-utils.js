const fillQuery = (queryString, obj) => {
  obj.userQuery = {}
  if (queryString.length === 0) return
  if (queryString.indexOf('?') >= 0) {
    queryString = queryString.split('?')[1]
  }

  const queries = queryString.split('&')
  for (const i = 0; i < queries.length; i++) {
    const elem = queries[i]
    const query = elem.split('=')
    obj[query[0]] = query[1]
    obj.userQuery[query[0]] = query[1]
  }
  obj.vhost = obj.domain ? obj.domain : obj.vhost
}

const parse = url => {
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

  fillQuery(a.search, ret)

  if (!ret.port) {
    if (schema === 'webrtc' || schema === 'rtc') {
      if (ret.userQuery.schema === 'https' ||
        window.location.href.indexOf('https://') === 0) {
        ret.port = 443
      } else {
        ret.port = 1985
      }
    }
  }
  return ret
}

export const prepareUrl = (webrtcUrl, defaultPath) => {
  const urlObject = parse(webrtcUrl)

  let schema = urlObject.userQuery.schema
  schema = schema ? schema + ':' : window.location.protocol

  let port = urlObject.port || 1985
  if (schema === 'https:') {
    port = urlObject.port || 443
  }

  let api = urlObject.userQuery.play || defaultPath
  if (api.lastIndexOf('/') !== api.length - 1) {
    api += '/'
  }

  let apiUrl = schema + '//' + urlObject.server + ':' + port + api
  for (const key in urlObject.userQuery) {
    if (key !== 'api' && key !== 'play') {
      apiUrl += '&' + key + '=' + urlObject.userQuery[key]
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
}
