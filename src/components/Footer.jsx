// 공통 푸터 — 모든 페이지에서 재사용 (K-Robot Lab · 다크 톤)
export default function Footer() {
  return (
    <footer className="border-t border-lab-outline bg-lab-surface-low py-4 text-center">
      <span className="font-stat text-[10px] tracking-[0.2em] uppercase text-lab-text-muted">
        © 2026 MUMUCLASS · 용쌤 ·
        <a
          href="https://mumuclass.kr"
          target="_blank"
          rel="noreferrer"
          className="hover:text-lab-blue ml-1 transition"
        >
          mumuclass.kr
        </a>
      </span>
    </footer>
  );
}
