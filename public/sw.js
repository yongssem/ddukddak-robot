// 설치 자격을 얻으려고 있는 서비스 워커 — 아무것도 캐시하지 않는다 (새 판이 바로 보이도록)
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  /* 그대로 네트워크로 보낸다 */
})
