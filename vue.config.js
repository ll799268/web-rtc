const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('swf')
      .test(/\.swf$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000
      })
  },
  devServer: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://36.154.12.195:1443',
        changeOrigin: true
      }
    }
  }
})
