// 홈화면 설치 — 이 파일을 불러오는 순간 신호를 듣기 시작한다 (main.jsx 가장 먼저)
let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // 때는 우리가 정한다
  deferred = e;
  notify();
});
window.addEventListener('appinstalled', () => { deferred = null; notify(); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canPrompt = () => !!deferred;
export function onInstallChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// 한 번 쓴 신호는 버린다 (안 버리면 두 번째 누름이 조용히 무반응)
export async function promptInstall() {
  if (!deferred) return 'none';
  const e = deferred;
  deferred = null;
  notify();
  e.prompt();
  const { outcome } = await e.userChoice;
  return outcome;
}
