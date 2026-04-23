import { PARTS } from '../data/partsData';

// 선택된 카테고리의 파츠 썸네일 그리드 (K-Robot Lab · 다크 톤)
// 클릭 = 캔버스에 아이템 추가 (중복 허용)
export default function PartsLibrary({ category, onSelect }) {
  const items = PARTS[category] ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
        <span className="material-symbols-outlined text-[32px] text-lab-text-muted mb-2">
          extension_off
        </span>
        <p className="font-stat text-[11px] tracking-[0.2em] uppercase text-lab-text-dim">
          NO PARTS LOADED
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-lab-text-muted">
          <code className="px-1 rounded bg-lab-surface-lowest text-lab-blue">
            public/parts/{category}/
          </code>
          에 PNG 추가 후<br />
          <code className="px-1 rounded bg-lab-surface-lowest text-lab-blue">
            src/data/partsData.js
          </code>
          등록 필요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 overflow-y-auto h-full">
      {items.map((part) => (
        <button
          key={part.id}
          type="button"
          onClick={() => onSelect?.(part)}
          className="group relative inset-groove rounded border border-lab-outline/70 hover:border-lab-blue-strong hover:shadow-neon-blue transition p-1 flex flex-col items-center"
          title={`${part.name} — 클릭해서 추가`}
        >
          {/* 코너 마커 (왼쪽 위) */}
          <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-lab-blue-strong rounded-full opacity-40 group-hover:opacity-100 transition" />
          <div className="w-full aspect-square flex items-center justify-center">
            <img
              src={part.image}
              alt={part.name}
              className="max-w-full max-h-full object-contain drop-shadow-[0_0_4px_rgba(77,142,255,0.3)]"
              draggable={false}
            />
          </div>
          <div className="mt-1 font-stat text-[9px] tracking-[0.1em] uppercase text-lab-text-dim truncate w-full text-center">
            {part.name}
          </div>
        </button>
      ))}
    </div>
  );
}
