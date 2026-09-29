# 🤖 뚝딱로봇 (ddukddakRobot)

**프로젝트:** 파츠 조립형 로봇 디자인 앱
**브랜드:** 뚝딱 시리즈
**레벨:** L1 (React + Vite + Tailwind + localStorage)
**배포:** Vercel
**저작권:** © 2026 무궁무진클래스 · 용쌤

---

## 🎯 프로젝트 개요

아이들이 머리/몸통/팔/다리/무기 파츠를 **클릭으로 조립**하여 자신만의 로봇을 디자인하는 앱.
(악세서리·망토·배낭 등은 Phase 2)

**핵심 기능:**
- 카테고리별 파츠 라이브러리
- 캔버스에 파츠 자동 부착 (앵커 포인트 기반)
- 레이어 앞/뒤 순서 조절
- PNG 저장 (완성 로봇 다운로드)
- 로봇 이름/특기 입력

**사용 시나리오:**
- 초등 미술/창체 수업
- 학기초 자기소개 활동 ("내 로봇 = 나")
- 가정에서 아이들 창작 놀이

---

## 🎨 디자인 철학 (K-Robot Lab · Metallic Edition)

### 시그니처 디자인
- **폰트:**
  - **Pretendard** (400/700/800) — 본문·UI·한글 (필수, 기본)
  - **Space Grotesk** (500/700) — 숫자·영문 라벨 (uppercase + tracking-widest)
  - **Material Symbols Outlined** — 사이드바/툴바 아이콘
- **테마 컬러 (`lab.*` 네임스페이스):**
  - `lab.bg` `#081425` — 배경 (+ 카본 패턴 오버레이)
  - `lab.surface` `#152031` — 기본 패널
  - `lab.surface-high` `#1f2a3c` / `lab.surface-highest` `#2a3548` — 구획 헤더
  - `lab.surface-lowest` `#040e1f` — inset-groove 홈 바닥
  - `lab.blue` `#adc6ff` — primary (텍스트·외곽선)
  - `lab.blue-strong` `#4d8eff` — 네온 블루 글로우·게이지
  - `lab.orange` `#ec6a06` — 경고 포인트(laser-divider, 경고줄무늬)
  - `lab.text` `#d8e3fb` / `lab.text-dim` `#c2c6d6` / `lab.text-muted` `#8c909f`
  - `lab.outline` `#424754` — 구획선
- **질감 유틸 (index.css):**
  - `.carbon-bg` — 45° 미세 사선 카본 패턴
  - `.brushed-steel` — 135° 그라데이션 + 상/좌 하이라이트 테두리 (패널)
  - `.inset-groove` — 어두운 홈 (진행바·입력필드 배경)
  - `.laser-divider` / `.laser-divider-v` — 오렌지 점선 레이저컷 라인
  - `.neon-glow-blue` / `.neon-glow-orange` — 포인트 네온 그림자
  - `.warning-stripes` — 45° 경고 줄무늬 (CTA 버튼 엣지)
  - `.blueprint-grid` — 중앙 캔버스 청사진 격자
- **분위기:** 다크 메카닉 랩 · 청사진 캔버스 · 계측 텔레메트리
- **주의:** 이 라인은 **파스텔 뚝딱 시리즈와 별개의 서브라인** (🤖 K-Robot Lab 전용). 다른 뚝딱 앱에 이 톤을 복사하지 말 것.

### 공통 푸터 (필수)
```jsx
<footer className="text-center py-4 text-[10px] text-lab-text-muted tracking-widest uppercase font-stat">
  © 2026 무궁무진클래스 · 용쌤 ·
  <a href="https://mumuclass.kr" className="hover:text-lab-blue ml-1">
    mumuclass.kr
  </a>
</footer>
```

---

## 🏗️ 기술 스택

```json
{
  "framework": "React 18 + Vite",
  "styling": "Tailwind CSS",
  "state": "React useState + localStorage",
  "export": "html2canvas (PNG 저장)",
  "fonts": "Pretendard, Space Grotesk, Material Symbols Outlined",
  "deploy": "Vercel"
}
```

**금지 사항:**
- ❌ Firebase (L1 레벨이라 불필요)
- ❌ 서버/백엔드 (로컬 완결형)
- ❌ 로그인 시스템 (아이들 접근성)
- ❌ Noto Sans KR (Pretendard만)

---

## 📦 파츠 데이터 구조

### 1. 파츠 정의 (`src/data/partsData.js`)

```javascript
export const PARTS = {
  heads: [
    {
      id: 'head_01',
      name: '바이저 헬멧',
      image: '/parts/heads/head_01.png',
      connector: { x: 100, y: 180 },  // 목 아래 중앙
      size: { w: 200, h: 200 }
    },
    // ... 20개
  ],
  torsos: [
    {
      id: 'torso_01',
      name: '중장갑 몸통',
      image: '/parts/torsos/torso_01.png',
      size: { w: 400, h: 500 },
      anchors: {
        head: { x: 200, y: 50 },        // 머리 결합점
        leftArm: { x: 80, y: 130 },     // 왼쪽 어깨
        rightArm: { x: 320, y: 130 },   // 오른쪽 어깨
        hip: { x: 200, y: 480 },        // 골반 (다리 연결)
        chest: { x: 200, y: 250 },      // 가슴 장식
        back: { x: 200, y: 200 }        // 등 장식
      }
    },
    // ... 6개
  ],
  legs: [
    {
      id: 'leg_01',
      name: '중장갑 다리',
      image: '/parts/legs/leg_01.png',
      connector: { x: 100, y: 20 },  // 다리 위 중앙 (골반 연결점)
      size: { w: 200, h: 400 }
    },
    // ... 16개
  ]
};
```

### 2. 파츠 결합 로직

```
머리 배치 좌표 = 몸통 anchors.head - 머리 connector
       (200, 50) - (100, 180) = (100, -130)

→ 어떤 머리 + 어떤 몸통 조합이든 자동으로 정렬됨
```

---

## 🎬 UI/UX 구조

### 레이아웃 (데스크탑)

```
┌──────────────────────────────────────────┐
│ 🤖 뚝딱로봇      [저장] [인쇄] [초기화]   │
├────┬─────────────────────────────────────┤
│탭 │                                       │
│    │           🤖                         │
│머리│        로봇 캔버스                    │
│몸통│        (중앙)                         │
│팔  │                                       │
│다리│                                       │
│무기│   레이어 컨트롤: [⬆️ 앞] [⬇️ 뒤]      │
│장식│                                       │
│    │                                       │
│파츠│                                       │
│썸네│                                       │
│일  │                                       │
├────┴─────────────────────────────────────┤
│ 로봇이름: [___] 특기: [___]              │
└──────────────────────────────────────────┘
```

### 모바일 레이아웃
- 상단: 캔버스
- 중단: 카테고리 탭 (가로 스크롤)
- 하단: 파츠 라이브러리 (가로 스크롤)
- 최하단: 이름/특기 입력 + 저장 버튼

---

## 📋 MVP 기능 명세 (Phase 1)

### ✅ 필수 (1차 개발)

1. **카테고리 탭**
   - 머리 / 몸통 / 팔 / 다리 / 무기 (MVP 5종)
   - 탭 클릭 → 해당 파츠 라이브러리 표시

2. **파츠 라이브러리**
   - 선택된 카테고리 썸네일 그리드
   - 썸네일 클릭 → 캔버스에 배치

3. **로봇 캔버스**
   - 중앙 고정 캔버스 (600 × 800px)
   - 파츠 레이어 스택 구조
   - 몸통 기준 앵커 포인트에 자동 정렬

4. **레이어 컨트롤**
   - 선택된 파츠를 앞/뒤로 이동 버튼
   - 기본 레이어 순서 사전 정의

5. **PNG 저장**
   - html2canvas로 캔버스 캡처
   - `내로봇_{이름}.png` 형식 다운로드

6. **로봇 이름 / 특기 입력**
   - 텍스트 인풋 2개
   - localStorage에 저장

### 🔒 나중 (Phase 2)
- 악세서리 파츠 (망토/배낭/가슴 엠블럼 등)
- 인쇄용 PDF 출력
- 학급 갤러리 (L3 업그레이드)

---

## 🎨 레이어 순서 (기본값)

```javascript
const DEFAULT_LAYER_ORDER = [
  'cape',          // 1. 망토 (가장 뒤)
  'backpack',      // 2. 등 장식
  'leftArm',       // 3. 왼팔
  'rightArm',      // 4. 오른팔
  'legs',          // 5. 다리
  'torso',         // 6. 몸통
  'head',          // 7. 머리
  'weapon',        // 8. 무기 (손에 쥔)
  'chestEmblem',   // 9. 가슴 로고 (가장 앞)
];
```

사용자가 `[⬆️ 앞] [⬇️ 뒤]` 버튼으로 변경 가능.

---

## 💾 localStorage 구조

```javascript
// key: 'ddukddakRobot_current'
{
  robotName: "토시아",
  specialty: "번개 공격",
  parts: {
    head: { id: 'head_05', layerIndex: 7 },
    torso: { id: 'torso_02', layerIndex: 6 },
    legs: { id: 'leg_03', layerIndex: 5 }
  },
  createdAt: "2026-04-23T..."
}

// key: 'ddukddakRobot_gallery' (저장한 로봇들)
[
  { id: 'robot_001', name: '토시아', ... },
  { id: 'robot_002', name: '불곰봇', ... }
]
```

---

## 🚨 개발 시 주의사항

### DO
- ✅ 모든 파츠 이미지는 **투명 배경 PNG**
- ✅ 파츠마다 **앵커 좌표**를 정확히 기록 (docs/anchors.md)
- ✅ 앵커 기반 자동 정렬 시스템 엄수
- ✅ 코드 주석은 **한국어**
- ✅ 모바일 터치 대응 (드래그 이벤트)

### DON'T
- ❌ README.md 자동 생성 금지
- ❌ 각 파츠에 개별 좌표 하드코딩 금지 (공식 앵커만 사용)
- ❌ 파츠 이미지 CDN 외부 의존 금지 (/public/parts에 로컬 저장)
- ❌ CSS-in-JS 라이브러리 사용 금지 (Tailwind만)

---

## 📂 파츠 이미지 준비 체크리스트

앱 개발 전 반드시 완료:

- [ ] 머리 20개 → 개별 PNG (투명 배경) → `/public/parts/heads/`
- [ ] 몸통 6개 → 개별 PNG → `/public/parts/torsos/`
- [ ] 팔 10쌍 → 왼팔+오른팔이 **한 장에** 포함된 PNG → `/public/parts/arms/`
- [ ] 다리 16쌍 → 양다리가 **한 장에** 포함된 PNG → `/public/parts/legs/`
- [ ] 무기 8개 → 개별 PNG (손잡이 기준) → `/public/parts/weapons/`
- [ ] 각 파츠 앵커 좌표 측정 → `docs/anchors.md`
- [ ] `partsData.js` 작성 완료

**자동 분할 스크립트 활용:**
```
1. A4 시트 (투명배경 PNG) 준비
2. split_sheet.py 실행
3. 개별 PNG 자동 생성
```

---

## 🎯 개발 순서 (권장)

```
Day 1: 파츠 전처리
  - A4 시트 배경 제거
  - 자동 분할 스크립트 실행
  - 앵커 좌표 측정 및 JSON 작성

Day 2: 기본 UI 구축
  - 레이아웃 (CategoryTabs + PartsLibrary + Canvas)
  - 파츠 썸네일 표시
  - 클릭 → 캔버스 배치 로직

Day 3: 결합 시스템
  - 앵커 기반 자동 정렬
  - 레이어 순서 관리
  - 레이어 이동 버튼

Day 4: 마무리
  - html2canvas PNG 저장
  - 로봇 이름/특기 입력
  - localStorage 연동
  - 배포 (Vercel)
```

---

## 🔗 배포 정보

- **도메인:** TBD (mumuclass.kr 서브도메인 or 신규 도메인)
- **Vercel 프로젝트명:** `ddukddak-robot`
- **저장소:** GitHub private repo

---

## 📞 용쌤 연락처

문의: 용쌤 (mumuclass.kr)
블로그: 딸깍교실
Instagram: @yongssam.dev
---

## 📌 작업 로그 (세션 교대용)

### 2026-09-29 (기기: 클라우드)
- 완료: 랜딩킷 세팅 — 하단 바(BottomBar.jsx: 사이트·인스타(써 본 뒤)·공유·설치·전체화면·ver 업데이트 내역+새 버전 점), 사용 안내 라벨(UsageLabel.jsx, 헤더 타이틀 옆), 푸터 이름 두 개 링크, PWA(manifest·sw.js 무캐시), favicon.svg 추가(기존 404 해결)
- 진행중: 없음
- 다음: 바이브용샘 확인 — src/data/usage.js 문구(창작 활동·권장 20분·권장X '평가 도구')와 changelog.js 버전 0.2
- 함정: L1이라 좋아요 미적용(서버 없음). 전체화면은 첫 파츠 클릭 때 자동 진입(끄면 기억). 헤드리스 캡처에서 Material Symbols 글자가 이름(RESTART_ALT 등)으로 보임 — 이번 변경과 무관한 기존 폰트 로딩 문제. public/parts 29MB(148파일)지만 첫 화면은 1.09MB
- 무게: 1.09MB · 24요청 · 이상 없음
