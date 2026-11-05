/* RE:START BODY per-item completion v083 */
const bodyItemKey=(id,i)=>`b_${id}_${i}`;
function bodyRowsForMode(id){
  const all=BODY_DETAIL[id]||[];
  const mode=(L().mode||'FULL').toLowerCase();
  const count=id==='walk'?1:id==='stretch'?(mode==='full'?7:mode==='short'?4:2):(mode==='full'?6:mode==='short'?4:2);
  return all.slice(0,count);
}
function bodyDoneCount(id){const rows=bodyRowsForMode(id);return rows.filter((_,i)=>L().done[bodyItemKey(id,i)]).length}
function syncBodyParent(id){const rows=bodyRowsForMode(id),done=bodyDoneCount(id);L().done['b_'+id]=rows.length>0&&done===rows.length}
function migrateLegacyBody(){['walk','stretch','strength'].forEach(id=>{const rows=bodyRowsForMode(id);if(L().done['b_'+id]&&!rows.some((_,i)=>L().done[bodyItemKey(id,i)])){rows.forEach((_,i)=>L().done[bodyItemKey(id,i)]=true)}})}
function body(){
  migrateLegacyBody();
  const l=L(),m=l.mode.toLowerCase(),ids=['walk','stretch','strength'];
  const total=ids.reduce((n,id)=>n+bodyRowsForMode(id).length,0),done=ids.reduce((n,id)=>n+bodyDoneCount(id),0);
  return `<button class="back" data-go="home">← ホーム</button><section class="card bodyhero"><h2>BODY / ${l.mode}</h2><p>体を動かして、明日の自分をつくる。</p><div class="progress"><span style="width:${total?Math.round(done/total*100):0}%"></span></div><p>${done}/${total} 種目完了</p></section><section class="card"><div class="body-mode-note"><b>今日のBODYメニュー</b><span>チェックはこのBODY画面だけで管理します</span></div>${ids.map(id=>{const x=EX[id],d=bodyDoneCount(id),t=bodyRowsForMode(id).length;return `<button class="body-menu ${d===t?'body-done':''}" data-ex="${id}"><span class="body-icon">${x.icon}</span><span class="body-info"><b>${x.n}</b><small>${x.g}<br><strong>${x[m]} ｜ ${d}/${t}種目</strong></small></span><span class="body-arrow">${d===t?'✓':d?`${d}/${t}`:'›'}</span></button>`}).join('')}</section><section class="card"><p class="muted">痛み、めまい、胸部症状、強い息苦しさなどがある場合は中止してください。無理のない範囲で続けます。</p></section>`;
}
function showEx(id){
  migrateLegacyBody();
  const x=EX[id],m=L().mode.toLowerCase(),rows=bodyRowsForMode(id);
  exerciseContent.innerHTML=`<div class="body-dialog-head"><h2>${x.icon} ${x.n}</h2><p>${x.g} ｜ <b>${x[m]}</b></p></div><img class="body-guide" src="${x.img}?v=083" alt="${x.n}のフォームガイド"><div class="body-detail-list">${rows.map((r,i)=>`<label class="body-check-card ${L().done[bodyItemKey(id,i)]?'checked':''}"><input type="checkbox" data-body-item="${i}" ${L().done[bodyItemKey(id,i)]?'checked':''}><span class="body-detail-no">${i+1}</span><span><b>${r[0]}</b><small>${r[1]}</small><ul>${r[2].map(t=>`<li>${t}</li>`).join('')}</ul></span></label>`).join('')}</div><div class="body-common"><b>意識すること</b><ul>${x.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div><div class="exercise-actions"><button type="button" id="allBody" class="complete">全種目を完了</button><button type="button" id="closeEx" class="nextbtn">閉じる</button></div>`;
  exerciseDlg.showModal();
  exerciseContent.querySelectorAll('[data-body-item]').forEach(cb=>cb.onchange=()=>{L().done[bodyItemKey(id,+cb.dataset.bodyItem)]=cb.checked;syncBodyParent(id);localStorage.setItem(KEY,JSON.stringify(S));cb.closest('.body-check-card').classList.toggle('checked',cb.checked)});
  allBody.onclick=()=>{rows.forEach((_,i)=>L().done[bodyItemKey(id,i)]=true);syncBodyParent(id);localStorage.setItem(KEY,JSON.stringify(S));exerciseDlg.close();render()};
  closeEx.onclick=()=>{syncBodyParent(id);localStorage.setItem(KEY,JSON.stringify(S));exerciseDlg.close();render()};
}
const granularRenderBase=render;
render=function(){granularRenderBase();if(S.tab==='home'){document.querySelectorAll('.task').forEach(row=>{const text=row.querySelector('.name')?.textContent||'';if(/朝ストレッチ|夜ストレッチ|運動メニュー/.test(text))row.remove()})}};
render();
