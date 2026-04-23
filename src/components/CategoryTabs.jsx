import { CATEGORIES } from '../data/partsData';

// 카테고리별 Material Symbols 아이콘 매핑
// (카테고리 key 기준 — CATEGORIES 에 새 키가 추가되면 이곳에도 매핑 추가)
const ICON_MAP = {
  heads: 'face',
  torsos: 'dashboard',
  arms: 'front_hand',
  legs: 'directions_walk',
  weapons: 'swords',
  accessories: 'auto_awesome',
};

// K-Robot Lab 카테고리 네비
// - vertical: 좌측 사이드바 (border-r-4 오렌지 강조)
// - horizontal: 모바일 상단 가로 스크롤 칩
export default function CategoryTabs({ active, onChange, orientation = 'vertical' }) {
  const isVertical = orientation === 'vertical';

  if (isVertical) {
    return (
      <nav className="flex flex-col">
        {CATEGORIES.map((cat) => {
          const selected = active === cat.key;
          const icon = ICON_MAP[cat.key] ?? 'category';
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange(cat.key)}
              className={[
                'flex items-center gap-3 px-5 py-2.5 font-stat text-[11px] tracking-[0.2em] uppercase transition-all border-r-4',
                selected
                  ? 'bg-lab-orange/10 text-lab-orange border-lab-orange shadow-[inset_0_0_20px_rgba(236,106,6,0.1)]'
                  : 'text-lab-text-muted border-transparent hover:bg-lab-surface hover:text-lab-blue hover:translate-x-0.5',
              ].join(' ')}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // horizontal (모바일)
  return (
    <div className="flex flex-row gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => {
        const selected = active === cat.key;
        const icon = ICON_MAP[cat.key] ?? 'category';
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={[
              'flex items-center gap-1.5 rounded px-3 py-1.5 font-stat text-[11px] tracking-[0.15em] uppercase shrink-0 transition border',
              selected
                ? 'bg-lab-orange/15 text-lab-orange border-lab-orange shadow-[0_0_10px_rgba(236,106,6,0.3)]'
                : 'bg-lab-surface text-lab-text-dim border-lab-outline hover:border-lab-blue-strong hover:text-lab-blue',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
