// 친구에게 공유 — 모바일은 공유 시트, 데스크톱은 주소 복사
export async function shareAppLink() {
  const url = location.href.split('#')[0];
  try {
    if (navigator.share) {
      await navigator.share({ title: '뚝딱로봇', text: '파츠를 조립해 나만의 로봇을 만들어 봐!', url });
      return 'shared';
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancel'; // 공유 시트를 닫은 것 — 실패 아님
  }
  try { await navigator.clipboard.writeText(url); return 'copied'; } catch { return 'fail'; }
}
