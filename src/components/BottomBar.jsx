import { useEffect, useState } from 'react';
import { AUTHOR } from '../data/author.js';
import { CHANGELOG, APP_VER } from '../data/changelog.js';
import { hasUnseenUpdate, markUpdateSeen, initSeenVer } from '../lib/prefs.js';
import { shareAppLink } from '../lib/share.js';
import { canPrompt, isIOS, isStandalone, onInstallChange, promptInstall } from '../lib/install.js';
import { fsSupported, isFullscreen, onFullscreenChange, toggleFullscreen } from '../lib/fullscreen.js';
import { SiteIcon, InstaIcon, ShareIcon, InstallIcon, FullscreenIcon } from './Icons.jsx';

const KIND_LABEL = { new: '새로 생김', fix: '고쳤어요', up: '좋아졌어요' };
const iconBtn = 'p-1.5 rounded text-lab-text-muted hover:text-lab-blue hover:bg-lab-surface-high transition';

// 하단 바 — 사이트 · 인스타 · 공유 · 설치 · 전체화면 ...... ver
// (L1 · 서버 없음 → 좋아요는 붙이지 않는다)
export default function BottomBar({ played }) {
  const [toast, setToast] = useState('');
  const [, force] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
  const [unseen, setUnseen] = useState(() => { initSeenVer(); return hasUnseenUpdate(); });

  useEffect(() => onInstallChange(() => force((n) => n + 1)), []);
  useEffect(() => onFullscreenChange(() => force((n) => n + 1)), []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 1800); };

  const onShare = async () => {
    const r = await shareAppLink();
    if (r === 'copied') flash('주소를 복사했어요!');
    else if (r === 'fail') flash('복사하지 못했어요');
  };
  const onInstall = async () => {
    if (canPrompt()) await promptInstall();
    else setIosHelp(true);
  };
  const openLog = () => { setLogOpen(true); markUpdateSeen(); setUnseen(false); };

  const showInstall = !isStandalone() && (canPrompt() || isIOS());
  const fsOn = isFullscreen();

  return (
    <div className="relative shrink-0 border-t border-lab-outline bg-lab-surface-low px-3 py-1.5 flex items-center gap-1">
      {AUTHOR.siteUrl && (
        <a href={AUTHOR.siteUrl} target="_blank" rel="noopener noreferrer" className={iconBtn} title="무궁무진클래스" aria-label="무궁무진클래스">
          <SiteIcon />
        </a>
      )}
      {AUTHOR.url && played && (
        <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer" className={iconBtn} title={AUTHOR.title} aria-label={AUTHOR.title}>
          <InstaIcon />
        </a>
      )}
      <button type="button" onClick={onShare} className={iconBtn} title="친구에게 공유" aria-label="친구에게 공유">
        <ShareIcon />
      </button>
      {showInstall && (
        <button type="button" onClick={onInstall} className={iconBtn} title="홈화면에 설치" aria-label="홈화면에 설치">
          <InstallIcon />
        </button>
      )}
      {fsSupported() && (
        <button type="button" onClick={toggleFullscreen} className={iconBtn} title={fsOn ? '전체화면 끄기' : '전체화면'} aria-label={fsOn ? '전체화면 끄기' : '전체화면'}>
          <FullscreenIcon on={fsOn} />
        </button>
      )}

      <button type="button" onClick={openLog} className="ml-auto relative font-stat text-[10px] tracking-[0.2em] uppercase text-lab-text-muted hover:text-lab-blue px-2 py-1" title="업데이트 내역">
        ver {APP_VER}
        {unseen && <span className="absolute top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-lab-orange neon-glow-orange" />}
      </button>

      {toast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded bg-lab-surface-highest border border-lab-outline text-[12px] text-lab-text">
          {toast}
        </div>
      )}

      {iosHelp && (
        <Modal title="홈 화면에 추가하기" onClose={() => setIosHelp(false)}>
          <p>사파리 아래쪽 <b className="text-lab-blue">[공유]</b> 버튼을 누르고</p>
          <p><b className="text-lab-blue">[홈 화면에 추가]</b>를 고르면 앱처럼 열려요.</p>
        </Modal>
      )}

      {logOpen && (
        <Modal title="업데이트 내역" onClose={() => setLogOpen(false)}>
          {CHANGELOG.map((v, i) => (
            <details key={v.ver} open={i < 2} className="mb-3">
              <summary className="cursor-pointer font-stat text-[11px] tracking-widest text-lab-blue">
                VER {v.ver} <span className="text-lab-text-muted">· {v.date}</span>
              </summary>
              <ul className="mt-1.5 pl-1 space-y-1">
                {v.items.map((it, j) => (
                  <li key={j}>
                    <span className="text-[10px] mr-1.5 px-1.5 py-0.5 rounded border border-lab-outline text-lab-orange">{KIND_LABEL[it.kind]}</span>
                    {it.text}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm brushed-steel border border-lab-outline rounded p-5 text-[13px] text-lab-text-dim" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lab-text">{title}</span>
          <button type="button" onClick={onClose} className="text-lab-text-muted hover:text-lab-orange" aria-label="닫기">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
