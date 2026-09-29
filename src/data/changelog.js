// 업데이트 내역 ★ 여기만 고치면 된다 (최신이 맨 앞)
export const CHANGELOG = [
  {
    ver: '0.2',
    date: '2026-09-29',
    items: [
      { kind: 'new', text: '친구에게 공유 · 홈화면 설치 · 전체화면 버튼이 생겼어요' },
      { kind: 'new', text: '업데이트 내역과 사용 안내를 볼 수 있어요' },
    ],
  },
  {
    ver: '0.1',
    date: '2026-09-28',
    items: [
      { kind: 'new', text: '캔버스 크기를 세로/가로로 바꿀 수 있어요' },
      { kind: 'new', text: '첫 공개!' },
    ],
  },
];
export const APP_VER = CHANGELOG[0].ver;
