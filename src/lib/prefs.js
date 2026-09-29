// localStorage 기반 작은 기억들 (접두사: ddukddakRobot_)
import { APP_VER } from '../data/changelog.js';

const PLAYED_KEY = 'ddukddakRobot_played';
const SEEN_KEY = 'ddukddakRobot_seenVer';

export function hasPlayed() {
  try { return localStorage.getItem(PLAYED_KEY) === '1'; } catch { return false; }
}
export function markPlayed() {
  try { localStorage.setItem(PLAYED_KEY, '1'); } catch {}
}

// 처음 온 사람에게는 새 버전 배지를 띄우지 않는다
export function initSeenVer() {
  try { if (localStorage.getItem(SEEN_KEY) == null) localStorage.setItem(SEEN_KEY, APP_VER); } catch {}
}
export function hasUnseenUpdate() {
  try { return localStorage.getItem(SEEN_KEY) !== APP_VER; } catch { return false; }
}
export function markUpdateSeen() {
  try { localStorage.setItem(SEEN_KEY, APP_VER); } catch {}
}
