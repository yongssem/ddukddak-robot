import { useState } from 'react';
import { USAGE } from '../data/usage.js';
import { InfoIcon } from './Icons.jsx';

// 사용 안내 라벨 — 옆에서 보는 어른을 위한 표기. 조건 없이 항상 그린다
export default function UsageLabel() {
  const [open, setOpen] = useState(false);
  const isGame = USAGE.kind === 'game';
  const canOpen = !!USAGE.notFor; // 반쪽 라벨은 열지 않는다

  const chip = 'px-2 py-0.5 rounded border border-lab-outline text-lab-text-muted text-[10px] tracking-wide';
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => canOpen && setOpen((v) => !v)}
        aria-expanded={open}
        className="flex flex-wrap items-center gap-1.5 text-left hover:opacity-100 opacity-80 transition"
        title="사용 안내"
      >
        <span className="text-lab-text-muted"><InfoIcon size={13} /></span>
        <span className={chip}>{USAGE.badge}</span>
        {USAGE.minutes > 0 && <span className={chip}>권장 {USAGE.minutes}분</span>}
        <span className={`${chip} hidden sm:inline`}>{USAGE.when}</span>
      </button>

      {open && (
        <div className="absolute z-40 top-full left-0 mt-2 w-[290px] brushed-steel border border-lab-outline rounded p-4 text-[12px] leading-relaxed text-lab-text-dim shadow-panel">
          <p className="text-lab-text font-bold">이 앱은 {USAGE.badge}입니다.</p>
          {isGame && <p>학습을 목적으로 만들지 않았습니다.</p>}
          <p className="mt-3 text-lab-blue">▸ 이렇게 쓰면 좋아요</p>
          <p className="pl-3">{USAGE.when}</p>
          <p className="mt-3 text-lab-orange">▸ 이렇게는 권장하지 않아요</p>
          <p className="pl-3">{USAGE.notFor}</p>
          {USAGE.grows.length > 0 && (
            <>
              <p className="mt-3 text-lab-blue">▸ {isGame ? '하다 보면 자연히 쓰는 힘' : '기르는 힘'}</p>
              <p className="pl-3">{USAGE.grows.join(' · ')}</p>
              {isGame && <p className="pl-3 text-lab-text-muted">(학습 목표는 아닙니다)</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
