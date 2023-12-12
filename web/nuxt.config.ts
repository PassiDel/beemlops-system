// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/eslint-module',
    '@nuxtjs/i18n',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-auth-utils',
    '@vuestic/nuxt',
    'nuxt-route-meta'
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    public: {
      passwordMinLength: 10
    },
    rabbitUrl: 'amqp://guest:guest@localhost:5672',
    influxUrl: 'http://localhost:8086',
    influxToken: '',
    influxOrg: '',
    influxBucket: '',
    redisHost: '',
    redisPassword: ''
  },
  eslint: {
    cache: true,
    lintOnStart: false
  },
  i18n: {
    locales: [
      {
        file: 'en.json',
        code: 'en',
        iso: 'en-US'
      },
      {
        file: 'de.json',
        code: 'de',
        iso: 'de-DE'
      }
    ],
    customRoutes: 'page',
    defaultLocale: 'en',
    langDir: 'lang',
    lazy: true,
    experimental: {
      jsTsFormatResource: true
    }
  }
});
