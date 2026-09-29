// 전체화면 — 사용자가 누른 직후에만 허용되므로 첫 조작에 얹는다
const PREF_KEY = 'ddukddakRobot_fullscreen';
const el = document.documentElement;
let tried = false;

export const fsSupported = () => !!(el.requestFullscreen || el.webkitRequestFullscreen);
export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function getPref() { try { return localStorage.getItem(PREF_KEY) !== 'off'; } catch { return true; } }
function setPref(on) { try { localStorage.setItem(PREF_KEY, on ? 'on' : 'off'); } catch {} }

const enter = () => Promise.resolve((el.requestFullscreen || el.webkitRequestFullscreen).call(el)).catch(() => {});
const exit = () => Promise.resolve((document.exitFullscreen || document.webkitExitFullscreen).call(document)).catch(() => {});

export function autoFullscreen() {
  if (!fsSupported() || !getPref() || tried || isFullscreen()) return;
  tried = true;
  enter();
}
export function toggleFullscreen() {
  if (isFullscreen()) { setPref(false); exit(); } else { setPref(true); enter(); }
}
export function onFullscreenChange(fn) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
  return () => {
    document.removeEventListener('fullscreenchange', fn);
    document.removeEventListener('webkitfullscreenchange', fn);
  };
}
