/** @type {import('tailwindcss').Config} */
// 🤖 뚝딱로봇 · K-Robot Lab (Metallic Edition)
// 컬러 네임스페이스는 `lab.*` — 파스텔 뚝딱 시리즈와 섞이지 않도록 분리
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          bg:                '#081425', // 전체 배경
          surface:           '#152031', // 기본 패널
          'surface-low':     '#111c2d',
          'surface-high':    '#1f2a3c', // 상단바, 구획 헤더
          'surface-highest': '#2a3548',
          'surface-lowest':  '#040e1f', // inset-groove 바닥
          bright:            '#2f3a4c', // 하이라이트 테두리

          blue:         '#adc6ff', // primary — 본문/외곽선
          'blue-strong':'#4d8eff', // neon 글로우/게이지 차오름
          orange:       '#ec6a06', // 경고/포인트
          peach:        '#ffb690',

          text:       '#d8e3fb', // on-surface
          'text-dim': '#c2c6d6',
          'text-muted': '#8c909f',
          outline:    '#424754',
          tertiary:   '#c1c7cf',
        },
        // 하위 호환 — 이전 robot-* 레퍼런스가 혹시 남아있으면 블루로 맵핑
        robot: {
          primary: '#8c909f',
          accent:  '#4d8eff',
          bg:      '#081425',
          canvas:  '#0a1020',
          text:    '#d8e3fb',
          border:  '#424754',
        },
      },
      fontFamily: {
        sans:    ['Pretendard', 'system-ui', 'sans-serif'],
        stat:    ['"Space Grotesk"', 'Pretendard', 'sans-serif'], // 숫자·라벨 (uppercase)
        display: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        'stat-lg':   ['32px', { lineHeight: '1',   letterSpacing: '0.05em', fontWeight: '700' }],
        'stat-sm':   ['14px', { lineHeight: '1',   letterSpacing: '0.1em',  fontWeight: '500' }],
        'label-caps':['11px', { lineHeight: '1',   letterSpacing: '0.15em', fontWeight: '700' }],
      },
      letterSpacing: {
        labels: '0.15em',
      },
      boxShadow: {
        'neon-blue':   '0 0 15px rgba(77,142,255,0.55)',
        'neon-orange': '0 0 15px rgba(236,106,6,0.6)',
        panel:         '0 4px 20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
