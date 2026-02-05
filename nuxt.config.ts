// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
  },
  app: {
    baseURL: '/ai-fitting-guide/', // 레포지토리 이름과 동일하게 설정
    buildAssetsDir: 'assets',     // 언더바(_)로 시작하는 폴더명을 인식하지 못하는 문제를 방지
  },
  ssr: false, // 정적 배포(SPA/Static)를 위해 SSR 비활성화 권장
  nitro: {
    preset: 'github-pages'
  },
})
