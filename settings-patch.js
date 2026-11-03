/* RE:START Settings v078 */
const RESTART_VERSION='v0.78';
function settings(){
  const usage=new Blob([localStorage.getItem(KEY)||'']).size;
  return `<section class="card settingshero"><h2>設定</h2><p>RE:STARTの更新・バックアップ・データ管理</p><div class="versionpill">${RESTART_VERSION}</div></section>
  <section class="card"><h2>🔄 アプリ更新</h2><p class="muted">GitHub Pagesの最新版を読み込み直します。登録データは消しません。</p><button type="button" id="refreshApp" class="setting-primary">最新版に更新</button><div id="updateStatus" class="setting-status" aria-live="polite"></div></section>
  <section class="card"><h2>💾 データ管理</h2><div class="settings-list"><button type="button" id="backupData"><span>バックアップを保存</span><small>BODY・STUDY・MONEY・日々の記録</small></button><label class="settings-file"><span>バックアップから復元</span><small>RE:STARTのJSONファイルを選択</small><input id="restoreData" type="file" accept="application/json,.json"></label></div><p class="muted">現在の保存データ：約 ${Math.max(1,Math.round(usage/1024))} KB</p></section>
  <section class="card"><h2>☁️ OCR</h2><div class="settings-row"><span>Azure OCR</span><b>設定済み</b></div><p class="muted">レシート・写真・PDFはMONEY画面から読み取ります。</p></section>
  <section class="card danger-zone"><h2>🗑️ 初期化</h2><p class="muted">このiPhone / ブラウザに保存されているRE:STARTデータを削除します。</p><button type="button" id="resetData" class="danger-button">全データを初期化</button></section>
  <section class="card"><h2>RE:START</h2><p class="muted">生活・BODY・STUDY・MONEYをひとつにまとめ、続けることを優先する個人用アプリです。</p></section>`;
}
function bindSettings(){
  const refresh=document.querySelector('#refreshApp');
  if(refresh)refresh.onclick=()=>{
    const s=document.querySelector('#updateStatus');
    if(s)s.textContent='最新版を確認しています…';
    const u=new URL(location.href);u.searchParams.set('_refresh',Date.now());location.replace(u.toString());
  };
  const backup=document.querySelector('#backupData');
  if(backup)backup.onclick=()=>{
    const payload={app:'RE:START',version:RESTART_VERSION,storageKey:KEY,exportedAt:new Date().toISOString(),data:S};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`restart-backup-${K(D)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const restore=document.querySelector('#restoreData');
  if(restore)restore.onchange=async()=>{
    const f=restore.files&&restore.files[0];if(!f)return;
    try{const obj=JSON.parse(await f.text()),data=obj&&obj.data?obj.data:obj;if(!data||typeof data!=='object'||!data.logs)throw new Error('RE:STARTのバックアップとして確認できません');if(!confirm('現在のデータをバックアップ内容で置き換えますか？'))return;S=data;localStorage.setItem(KEY,JSON.stringify(S));alert('復元しました');render()}catch(e){alert(`復元できませんでした：${e.message}`)}finally{restore.value=''}
  };
  const reset=document.querySelector('#resetData');
  if(reset)reset.onclick=()=>{if(!confirm('RE:STARTの全データを削除します。元に戻せません。続けますか？'))return;if(!confirm('最終確認です。本当に初期化しますか？'))return;localStorage.removeItem(KEY);location.reload()};
}
const renderV077=render;
render=function(){renderV077();if(S.tab==='settings'){app.innerHTML=settings();bindSettings();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===S.tab));}};
render();
