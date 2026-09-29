import { AUTHOR } from '../data/author.js';

// 공통 푸터 — 이름 두 개가 각각 링크 (주소만 링크 X)
export default function Footer() {
  const link = (href, text) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-lab-blue transition">{text}</a>
    ) : text;
  return (
    <footer className="bg-lab-surface-low pb-2 text-center">
      <span className="font-stat text-[10px] tracking-[0.2em] uppercase text-lab-text-muted">
        © 2026 {link(AUTHOR.siteUrl, '무궁무진클래스')} · {link(AUTHOR.url, '용쌤')}
      </span>
    </footer>
  );
}
