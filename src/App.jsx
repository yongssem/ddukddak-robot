import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import CategoryTabs from './components/CategoryTabs.jsx';
import PartsLibrary from './components/PartsLibrary.jsx';
import Canvas from './components/Canvas.jsx';
import Footer from './components/Footer.jsx';
import { CANVAS } from './data/partsData.js';

// 🤖 뚝딱로봇 · K-ROBOT LAB (Metallic Edition)
// 레이아웃: 상단바 + 좌측 파츠 데포 + 중앙 블루프린트 (우측 패널 제거, 캔버스 확장)
export default function App() {
  const [category, setCategory] = useState('heads');
  const [items, setItems] = useState([]); // 배열 순서 = 레이어 (뒤→앞)
  const [selectedUid, setSelectedUid] = useState(null);
  const [robotName, setRobotName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [exporting, setExporting] = useState(false);
  const uidCounterRef = useRef(0);
  const canvasRef = useRef(null); // html2canvas 캡처용

  const handleSelectPart = (part) => {
    if (category === 'arms') {
      uidCounterRef.current += 1;
      const leftUid = `item_${uidCounterRef.current}`;
      uidCounterRef.current += 1;
      const rightUid = `item_${uidCounterRef.current}`;
      const halfW = part.size.w / 2;
      const baseY = (CANVAS.height - part.size.h) / 2;
      const gap = 20;
      const leftItem = {
        uid: leftUid, partId: part.id, name: `${part.name} (왼팔)`, image: part.image,
        x: CANVAS.width / 2 - halfW - gap, y: baseY, w: halfW, h: part.size.h,
        rotation: 0, side: 'left',
      };
      const rightItem = {
        uid: rightUid, partId: part.id, name: `${part.name} (오른팔)`, image: part.image,
        x: CANVAS.width / 2 + gap, y: baseY, w: halfW, h: part.size.h,
        rotation: 0, side: 'right',
      };
      setItems((prev) => [...prev, leftItem, rightItem]);
      setSelectedUid(rightUid);
      return;
    }

    uidCounterRef.current += 1;
    const offset = (items.length % 8) * 24;
    const x = (CANVAS.width - part.size.w) / 2 + offset;
    const y = (CANVAS.height - part.size.h) / 2 + offset;
    const newItem = {
      uid: `item_${uidCounterRef.current}`,
      partId: part.id, name: part.name, image: part.image,
      x, y, w: part.size.w, h: part.size.h, rotation: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedUid(newItem.uid);
  };

  const handleUpdateItem = (uid, patch) => {
    setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, ...patch } : it)));
  };
  const handleDeleteItem = (uid) => {
    setItems((prev) => prev.filter((it) => it.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };
  const handleBringForward = (uid) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.uid === uid);
      if (i === -1 || i === prev.length - 1) return prev;
      const next = prev.slice();
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };
  const handleSendBackward = (uid) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.uid === uid);
      if (i <= 0) return prev;
      const next = prev.slice();
      [next[i], next[i - 1]] = [next[i - 1], next[i]];
      return next;
    });
  };

  const handleReset = () => {
    if (!confirm('조립한 로봇을 초기화할까요?')) return;
    setItems([]);
    setSelectedUid(null);
    setRobotName('');
    setSpecialty('');
  };

  // PNG 저장 — html2canvas 로 캔버스 DOM 캡처
  // exporting=true 동안 선택 아웃라인/핸들/플로팅바를 숨겨서 깔끔한 결과물을 뽑음
  const handleExport = async () => {
    if (!canvasRef.current || exporting || items.length === 0) return;
    setExporting(true);

    // 다음 페인트까지 대기 (핸들 사라진 후 캡처)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const img = await html2canvas(canvasRef.current, {
        backgroundColor: '#030b17',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const safeName = (robotName || 'unnamed').replace(/[\\/:*?"<>|]/g, '_').trim() || 'unnamed';
      const link = document.createElement('a');
      link.href = img.toDataURL('image/png');
      link.download = `뚝딱로봇_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('저장에 실패했어요: ' + (err?.message ?? '알 수 없는 오류'));
    } finally {
      setExporting(false);
    }
  };

  const canExport = items.length > 0 && !exporting;

  return (
    <div className="min-h-screen flex flex-col carbon-bg">
      {/* ── TopAppBar ───────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-lab-outline bg-gradient-to-br from-lab-surface-high to-lab-bg shadow-panel">
        <div className="flex justify-between items-center h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base md:text-lg font-black italic tracking-tight text-lab-blue-strong drop-shadow-[0_0_8px_rgba(77,142,255,0.6)]">
              DDUKDDAK_ROBOT_LAB
            </span>
            <span className="hidden md:inline-block font-stat text-[10px] tracking-[0.2em] text-lab-text-muted uppercase">
              / K-ROBOT CONSTRUCT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-stat tracking-widest uppercase text-lab-text-dim border border-lab-outline hover:border-lab-orange hover:text-lab-orange transition rounded"
              title="초기화"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span className="hidden sm:inline">RESET</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport}
              className={[
                'relative overflow-hidden flex items-center gap-1 px-3 py-1.5 text-[11px] font-stat tracking-widest uppercase brushed-steel border rounded transition',
                canExport
                  ? 'border-lab-blue-strong text-lab-blue hover:shadow-neon-blue'
                  : 'border-lab-outline text-lab-text-muted opacity-60 pointer-events-none',
              ].join(' ')}
              title={items.length === 0 ? '파츠를 먼저 조립해주세요' : 'PNG 저장'}
            >
              <span className="material-symbols-outlined text-[14px]">
                {exporting ? 'hourglass_top' : 'download'}
              </span>
              <span className="hidden sm:inline">
                {exporting ? 'SAVING…' : 'EXPORT_PNG'}
              </span>
              {canExport && (
                <div className="absolute right-0 top-0 bottom-0 w-2 warning-stripes opacity-80 pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ─────────────────── */}
      <div className="flex flex-1">
        {/* Left Sidebar (PARTS_DEPOT) — 데스크탑 전용 */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-lab-outline bg-lab-surface-low">
          <div className="p-5 border-b border-lab-outline">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-lab-orange neon-glow-orange" />
              <span className="font-stat text-[11px] tracking-[0.2em] text-lab-blue uppercase">
                PARTS_DEPOT
              </span>
            </div>
            <span className="font-stat text-[10px] tracking-[0.15em] text-lab-orange uppercase">
              V-4.02 READY
            </span>
          </div>

          <div className="py-3 border-b border-lab-outline">
            <CategoryTabs active={category} onChange={setCategory} orientation="vertical" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-2.5 font-stat text-[10px] tracking-[0.2em] text-lab-text-muted uppercase flex items-center justify-between">
              <span>INVENTORY</span>
              <span className="text-lab-text-muted/70 normal-case tracking-normal text-[10px]">
                클릭 = 캔버스 추가
              </span>
            </div>
            <div className="flex-1 overflow-hidden px-3 pb-3">
              <PartsLibrary category={category} onSelect={handleSelectPart} />
            </div>
          </div>
        </aside>

        {/* Main — 블루프린트 캔버스 단일 패널 */}
        <main className="flex-1 min-w-0 p-4 md:p-6 flex flex-col gap-4">
          {/* 모바일 전용 상단 카테고리 + 파츠 */}
          <div className="md:hidden brushed-steel rounded border border-lab-outline">
            <div className="h-8 bg-lab-surface-highest flex items-center px-3 border-b border-lab-outline">
              <span className="font-stat text-[10px] tracking-[0.2em] text-lab-text-dim uppercase">
                PARTS_DEPOT
              </span>
            </div>
            <div className="p-3">
              <CategoryTabs active={category} onChange={setCategory} orientation="horizontal" />
            </div>
            <div className="border-t border-lab-outline h-[220px] overflow-hidden">
              <PartsLibrary category={category} onSelect={handleSelectPart} />
            </div>
          </div>

          {/* Canvas Panel */}
          <section className="brushed-steel rounded flex flex-col border border-lab-outline overflow-hidden">
            {/* 헤더 + 인라인 입력 */}
            <div className="bg-lab-surface-highest border-b border-lab-outline px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-stat text-[11px] tracking-[0.2em] text-lab-text-dim uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">architecture</span>
                ASSEMBLY_MATRIX
              </span>

              <label className="flex items-center gap-2 min-w-0">
                <span className="font-stat text-[10px] tracking-[0.2em] text-lab-tertiary uppercase shrink-0">
                  CODENAME
                </span>
                <input
                  type="text"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  placeholder="예: 토시아"
                  maxLength={20}
                  className="inset-groove rounded px-2.5 py-1 w-[140px] text-[13px] text-lab-text placeholder:text-lab-text-muted border border-lab-outline focus:border-lab-blue-strong focus:outline-none"
                />
              </label>

              <label className="flex items-center gap-2 min-w-0">
                <span className="font-stat text-[10px] tracking-[0.2em] text-lab-tertiary uppercase shrink-0">
                  SPEC
                </span>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="예: 번개 공격"
                  maxLength={20}
                  className="inset-groove rounded px-2.5 py-1 w-[140px] text-[13px] text-lab-text placeholder:text-lab-text-muted border border-lab-outline focus:border-lab-blue-strong focus:outline-none"
                />
              </label>

              <div className="ml-auto flex items-center gap-3 font-stat text-[11px] tracking-[0.15em] uppercase">
                <span className="text-lab-tertiary">
                  PARTS <span className="text-lab-blue font-bold">{String(items.length).padStart(2, '0')}</span>
                </span>
                <span className="hidden sm:inline text-lab-text-muted">SN-88X-Δ</span>
              </div>
            </div>

            {/* Canvas body */}
            <div className="flex-1 flex items-center justify-center p-3 md:p-6 overflow-auto">
              <Canvas
                items={items}
                selectedUid={selectedUid}
                onSelect={setSelectedUid}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                canvasRef={canvasRef}
                codename={robotName}
                specialty={specialty}
                hideControls={exporting}
              />
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
