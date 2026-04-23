import { useRef, useState, useLayoutEffect } from 'react';
import { CANVAS as DEFAULT_CANVAS } from '../data/partsData';

// 🤖 K-Robot Lab · 블루프린트 캔버스
// - items: 배열 순서 = 레이어 (뒤→앞). side='left'|'right' 면 원본 팔 이미지 절반만 렌더
// - 이동: 파츠 본체 드래그 · 리사이즈: 우측 하단 블루 핸들 · 회전: 상단 오렌지 핸들
// - codename/specialty: 캔버스 좌하단 ID 플레이트에 렌더 (html2canvas 로 캡처됨)
// - hideControls: export 중 선택 아웃라인/핸들/플로팅바를 숨겨 깔끔한 PNG 출력
export default function Canvas({
  canvas = DEFAULT_CANVAS,
  items,
  selectedUid,
  onSelect,
  onUpdateItem,
  onDeleteItem,
  onBringForward,
  onSendBackward,
  canvasRef: externalRef,
  codename = '',
  specialty = '',
  hideControls = false,
}) {
  const CANVAS = canvas;
  const internalRef = useRef(null);
  const canvasRef = externalRef ?? internalRef;
  const wrapRef = useRef(null);
  const dragRef = useRef(null);
  // 부모 영역 안에서 비율 유지한 채 가로·세로 둘 다 맞는 최대 크기로 (스크롤 X)
  const [displayScale, setDisplayScale] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const s = Math.min(width / CANVAS.width, height / CANVAS.height);
      setDisplayScale(s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [CANVAS.width, CANVAS.height]);

  // 캔버스 CSS 크기 → 내부 좌표(600x800) 비율 (축소 대응)
  const getRectAndScale = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { rect: null, scale: 1 };
    return { rect, scale: CANVAS.width / rect.width };
  };

  const startDrag = (e, uid, mode) => {
    const item = items.find((it) => it.uid === uid);
    if (!item) return;
    onSelect(uid);
    const { rect, scale } = getRectAndScale();

    const base = {
      uid, mode, scale, rect,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x, origY: item.y,
      origW: item.w, origH: item.h,
      ratio: item.w / item.h,
      origRotation: item.rotation ?? 0,
    };

    if (mode === 'rotate' && rect) {
      const cx = item.x + item.w / 2;
      const cy = item.y + item.h / 2;
      const px = (e.clientX - rect.left) * scale;
      const py = (e.clientY - rect.top) * scale;
      base.cx = cx;
      base.cy = cy;
      base.startAngle = Math.atan2(py - cy, px - cx) * 180 / Math.PI;
    }

    dragRef.current = base;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;

    if (d.mode === 'move') {
      const dx = (e.clientX - d.startX) * d.scale;
      const dy = (e.clientY - d.startY) * d.scale;
      onUpdateItem(d.uid, { x: d.origX + dx, y: d.origY + dy });
      return;
    }

    if (d.mode === 'resize') {
      const dx = (e.clientX - d.startX) * d.scale;
      const dy = (e.clientY - d.startY) * d.scale;
      const delta = Math.max(dx, dy);
      const newW = Math.max(40, d.origW + delta);
      const newH = newW / d.ratio;
      onUpdateItem(d.uid, { w: newW, h: newH });
      return;
    }

    if (d.mode === 'rotate' && d.rect) {
      const px = (e.clientX - d.rect.left) * d.scale;
      const py = (e.clientY - d.rect.top) * d.scale;
      const angle = Math.atan2(py - d.cy, px - d.cx) * 180 / Math.PI;
      const next = d.origRotation + (angle - d.startAngle);
      onUpdateItem(d.uid, { rotation: next });
      return;
    }
  };

  const handlePointerUp = (e) => {
    if (dragRef.current) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      dragRef.current = null;
    }
  };

  const handleBgPointerDown = (e) => {
    if (e.target === e.currentTarget) onSelect(null);
  };

  const selectedItem = items.find((it) => it.uid === selectedUid) ?? null;

  return (
    <div ref={wrapRef} className="w-full h-full flex items-center justify-center">
      {displayScale > 0 && (
    <div
      ref={canvasRef}
      className="relative blueprint-grid rounded border border-lab-outline shadow-inner overflow-hidden touch-none select-none"
      style={{ width: CANVAS.width * displayScale, height: CANVAS.height * displayScale }}
      onPointerDown={handleBgPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 타이틀 오버레이 (아웃라인 텍스트) */}
      <div
        className="absolute top-4 left-5 text-[22px] font-black italic tracking-tight pointer-events-none select-none"
        style={{
          WebkitTextStroke: '1px #adc6ff',
          color: 'transparent',
          opacity: 0.55,
        }}
      >
        DDUKDDAK · K-ROBOT LAB
      </div>

      {/* 우상단 SN 표기 */}
      <div className="absolute top-4 right-5 font-stat text-[10px] tracking-[0.2em] uppercase text-lab-text-muted pointer-events-none">
        SN-88X-Δ / ALPHA
      </div>

      {/* 레이저 크로스헤어 */}
      <div className="absolute top-1/2 left-0 right-0 h-px laser-divider pointer-events-none opacity-50" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px laser-divider-v pointer-events-none opacity-50" />

      {/* ID 플레이트 — 좌하단 (캔버스에 고정, 저장 이미지에 포함됨) */}
      {(codename || specialty) && (
        <div
          className="absolute bottom-5 left-5 brushed-steel border border-lab-outline rounded px-4 py-3 pointer-events-none shadow-panel"
          style={{ minWidth: 220 }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-lab-outline/70">
            <div className="w-2 h-2 rounded-full bg-lab-orange neon-glow-orange" />
            <span className="font-stat text-[10px] tracking-[0.2em] uppercase text-lab-tertiary">
              UNIT_IDENTITY
            </span>
          </div>
          {codename && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-stat text-[9px] tracking-[0.2em] uppercase text-lab-text-muted w-[72px]">
                CODENAME
              </span>
              <span className="text-lab-blue font-bold text-[15px] tracking-tight">
                {codename}
              </span>
            </div>
          )}
          {specialty && (
            <div className="flex items-baseline gap-2">
              <span className="font-stat text-[9px] tracking-[0.2em] uppercase text-lab-text-muted w-[72px]">
                SPEC_ABL
              </span>
              <span className="text-lab-orange font-bold text-[13px]">
                {specialty}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 빈 상태 */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-lab-text-muted pointer-events-none">
          <span className="material-symbols-outlined text-[56px] text-lab-blue/40 mb-3">
            smart_toy
          </span>
          <p className="font-stat text-[12px] tracking-[0.2em] uppercase text-lab-text-dim">
            AWAITING CONSTRUCT
          </p>
          <p className="mt-2 text-[11px] text-lab-text-muted">
            좌측 파츠 데포에서 부품을 선택하세요
          </p>
          <p className="mt-1 text-[10px] text-lab-text-muted/70">
            드래그 = 이동 · 모서리 = 크기 · 상단 = 회전
          </p>
        </div>
      )}

      {/* 내부 좌표계(900×1200)로 렌더되는 파츠 레이어 — displayScale 로 축소 */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          transform: `scale(${displayScale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
      {items.map((item) => {
        const selected = !hideControls && item.uid === selectedUid;
        const rotation = item.rotation ?? 0;

        const bodyStyle = item.side
          ? {
              backgroundImage: `url(${item.image})`,
              backgroundSize: '200% 100%',
              backgroundPosition: item.side === 'right' ? '100% 0' : '0 0',
              backgroundRepeat: 'no-repeat',
            }
          : null;

        return (
          <div
            key={item.uid}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
              width: item.w,
              height: item.h,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              pointerEvents: 'auto',
            }}
          >
            {item.side ? (
              <div
                className="w-full h-full cursor-move"
                style={{
                  ...bodyStyle,
                  outline: selected ? '2px dashed #4d8eff' : 'none',
                  outlineOffset: '2px',
                  filter: selected ? 'drop-shadow(0 0 8px rgba(77,142,255,0.6))' : 'none',
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, item.uid, 'move');
                }}
              />
            ) : (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full cursor-move"
                style={{
                  outline: selected ? '2px dashed #4d8eff' : 'none',
                  outlineOffset: '2px',
                  filter: selected ? 'drop-shadow(0 0 8px rgba(77,142,255,0.6))' : 'none',
                }}
                draggable={false}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, item.uid, 'move');
                }}
              />
            )}

            {selected && (
              <>
                {/* 회전 핸들 (오렌지 네온) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-8 w-6 h-6 rounded-full bg-lab-orange border-2 border-lab-bg shadow-neon-orange cursor-grab flex items-center justify-center text-white text-[11px] font-bold"
                  title="회전"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, item.uid, 'rotate');
                  }}
                >
                  ↻
                </div>
                <div className="absolute left-1/2 -top-5 w-px h-5 bg-lab-orange pointer-events-none" />

                {/* 리사이즈 핸들 (블루 네온) */}
                <div
                  className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-lab-blue-strong border-2 border-lab-bg shadow-neon-blue cursor-nwse-resize"
                  title="크기 조절"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, item.uid, 'resize');
                  }}
                />
              </>
            )}
          </div>
        );
      })}
      </div>

      {/* 선택 플로팅 바 — 캔버스 상단에 고정 (로봇이 가려지지 않도록 위로 이동) */}
      {selectedItem && !hideControls && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 brushed-steel border border-lab-outline rounded-full shadow-panel px-2 py-1">
          <span className="px-2 font-stat text-[10px] tracking-[0.15em] uppercase text-lab-text-dim truncate max-w-[140px]">
            {selectedItem.name}
          </span>
          <button
            type="button"
            onClick={() => onUpdateItem(selectedItem.uid, { rotation: 0 })}
            className="p-1.5 rounded-full text-lab-text-muted hover:text-lab-blue hover:bg-lab-surface transition"
            title="회전 리셋"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>
          <button
            type="button"
            onClick={() => onSendBackward(selectedItem.uid)}
            className="p-1.5 rounded-full text-lab-text-muted hover:text-lab-blue hover:bg-lab-surface transition"
            title="뒤로"
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_back</span>
          </button>
          <button
            type="button"
            onClick={() => onBringForward(selectedItem.uid)}
            className="p-1.5 rounded-full text-lab-text-muted hover:text-lab-blue hover:bg-lab-surface transition"
            title="앞으로"
          >
            <span className="material-symbols-outlined text-[16px]">flip_to_front</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteItem(selectedItem.uid)}
            className="p-1.5 rounded-full text-lab-text-muted hover:text-lab-orange hover:bg-lab-surface transition"
            title="삭제"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </div>
      )}
    </div>
  );
}
