// 🤖 뚝딱로봇 파츠 데이터
// 파츠 이미지는 /public/parts/{heads|torsos|arms|legs|weapons}/ 에 투명 PNG 로 저장
// 앵커 좌표는 docs/anchors.md 에서 관리 후 이곳에 반영
//
// ─── 파츠 수량 ────────────────────────
//   머리 20  · 몸통 6  · 팔 10쌍  · 다리 16쌍  · 무기 8
//
// ─── 스키마 ──────────────────────────
//
// heads: [{
//   id, name, image, size: {w,h},
//   connector: { x, y },          // 목 아래 중앙 (몸통 anchors.head 와 결합)
// }]
//
// torsos: [{
//   id, name, image, size: {w,h},
//   anchors: {
//     head: { x, y },              // 목
//     arms: { x, y },              // 팔 세트 결합점 (어깨 기준)
//     hip:  { x, y },              // 골반
//   },
// }]
//
// arms: [{                         // 한 장 이미지에 왼팔+오른팔이 모두 그려짐
//   id, name, image, size: {w,h},
//   connector: { x, y },           // 몸통.anchors.arms 와 맞출 기준점
//   hand: {
//     left:  { x, y },             // 왼손 중심 (무기 grip 과 결합)
//     right: { x, y },             // 오른손 중심
//   },
// }]
//
// legs: [{                         // 한 장 이미지에 양다리 모두 그려짐
//   id, name, image, size: {w,h},
//   connector: { x, y },           // 골반 결합점 (몸통.anchors.hip 과 맞춤)
// }]
//
// weapons: [{
//   id, name, image, size: {w,h},
//   grip: { x, y },                // 손잡이 쥐는 점 (팔.hand.* 와 맞춤)
// }]

import { GENERATED_PARTS } from './parts.generated.js';

// 파일을 수동 삭제한 파츠 id — 탭에는 노출되지 않도록 filter.
// (parts.generated.js 는 스크립트로 재생성되므로 직접 수정하지 않음)
const MISSING_IDS = new Set([
  'weapon2_02', 'weapon2_04', 'weapon2_05', 'weapon2_07', 'weapon2_08',
  'weapon2_09', 'weapon2_10', 'weapon2_11', 'weapon2_12', 'weapon2_13',
  'weapon2_14', 'weapon2_15', 'weapon2_17', 'weapon2_18',
]);

// 파츠 데이터는 scripts/measure_anchors.py 로 자동 생성됨.
// 앵커 좌표가 어색한 파츠가 있으면 이곳에서 override 가능 (예: PARTS.weapons[0].grip = { x: 40, y: 180 })
export const PARTS = Object.fromEntries(
  Object.entries(GENERATED_PARTS).map(([cat, list]) => [
    cat,
    list.filter((p) => !MISSING_IDS.has(p.id)),
  ])
);

// 카테고리 메타 (탭 표시용) — CATEGORIES 에 추가되면 UI 자동 반영
export const CATEGORIES = [
  { key: 'heads',   label: '머리', emoji: '👤' },
  { key: 'torsos',  label: '몸통', emoji: '🦾' },
  { key: 'arms',    label: '팔',   emoji: '💪' },
  { key: 'legs',    label: '다리', emoji: '🦵' },
  { key: 'weapons', label: '무기', emoji: '⚔️' },
  { key: 'accessories', label: '악세서리', emoji: '🎀' },
];

// 레이어 순서 (뒤 → 앞)
// 무기는 왼손/오른손 각각 맨 앞 두 레이어
export const DEFAULT_LAYER_ORDER = [
  'arms',        // 팔 (가장 뒤)
  'legs',
  'torso',
  'head',
  'weaponLeft',
  'weaponRight', // 오른손 무기 (맨 앞)
];

// 캔버스 상수
// - 내부 좌표계 900x1200 (K-Robot Lab 블루프린트). 부품 배치·드래그 수식이 이 값을 기준으로 동작
// - 부품 size 는 부품 이미지 원본 픽셀이므로 CANVAS 변경과 무관
// 캔버스 프리셋 (PNG 저장 시 해상도 영향)
export const CANVAS_PRESETS = {
  portrait: { key: 'portrait', label: '세로',   width: 900,  height: 1200 },
  wide:     { key: 'wide',     label: '가로',   width: 2700, height: 1200 },
};

// 기본값 (하위 호환)
export const CANVAS = CANVAS_PRESETS.wide;

// 무기 손 슬롯 메타
export const WEAPON_HANDS = [
  { key: 'left',  label: '왼손',   emoji: '🤚' },
  { key: 'right', label: '오른손', emoji: '✋' },
];
