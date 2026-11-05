/* RE:START unified HOME + category-only STUDY v086 */
const studyEntries=()=>Object.entries(STUDY);
const studyDoneCount=()=>studyEntries().filter(([id])=>L().done['s_'+id]).length;
const studyPercent=()=>{const t=studyEntries().length;return t?Math.round(studyDoneCount()/t*100):0};
const routineTasks=()=>S.tasks.filter(x=>!/朝ストレッチ|夜ストレッチ|運動メニュー|英語|自主学習/.test(x.n));
function dashboardBar(percent,cls=''){return `<span class="dash-bar ${cls}"><i style="width:${percent}%"></i></span>`}
function home(){
  migrateLegacyBody();
  const l=L(),bodyIds=['walk','stretch','strength'];
  const bodyTotal=bodyIds.reduce((n,id)=>n+bodyRowsForMode(id).length,0),bodyDone=bodyIds.reduce((n,id)=>n+bodyDoneCount(id),0),bodyRate=bodyTotal?Math.round(bodyDone/bodyTotal*100):0;
  const sDone=studyDoneCount(),sTotal=studyEntries().length,sRate=studyPercent();
  return `<section class="card hero"><div class="row between"><div>DAY ${DAY} / LIFE SCORE<div class="score">${l.score||0}</div></div><button class="btn" data-mode="MINIMUM">今日は最低限</button></div></section>
  <section class="card"><h2>今日のモード</h2><div class="mode">${['FULL','SHORT','MINIMUM'].map(x=>`<button data-mode="${x}" class="${l.mode===x?'on':''}">${x}</button>`).join('')}</div></section>
  <section class="card home-routine"><h2>今日のルーティン</h2>${routineTasks().map(x=>`<div class="task"><input type="checkbox" data-check="${x.id}" ${l.done[x.id]?'checked':''}><div class="name">${x.n}</div><span class="tag">${x.t}</span></div>`).join('')}
    <button class="dash-section" data-go="body"><span class="dash-title"><b>🏃 BODY</b><strong>${bodyRate}%</strong></span>${dashboardBar(bodyRate,'body')}<small>${bodyDone}/${bodyTotal}種目完了</small></button>
    <div class="dash-mini">${bodyIds.map(id=>{const x=EX[id],d=bodyDoneCount(id),t=bodyRowsForMode(id).length,p=t?Math.round(d/t*100):0;return `<button data-go="body"><span>${x.icon} ${x.n}</span><b>${p}%</b></button>`}).join('')}</div>
    <button class="dash-section" data-go="study"><span class="dash-title"><b>📚 STUDY</b><strong>${sRate}%</strong></span>${dashboardBar(sRate,'study')}<small>${sDone}/${sTotal}カテゴリ完了</small></button>
    <div class="study-chips">${studyEntries().map(([id,x])=>`<span class="${l.done['s_'+id]?'done':''}">${x.icon} ${x.title}${l.done['s_'+id]?' ✓':''}</span>`).join('')}</div>
  </section>
  <section class="card"><h2>QUICK</h2><div class="grid"><button class="quick" data-go="body">🏃 BODY</button><button class="quick" data-go="study">📚 STUDY</button><button class="quick" data-go="money">💴 MONEY</button><button class="quick" data-go="calendar">📅 CALENDAR</button></div></section>`;
}
function study(){
  const l=L(),entries=studyEntries(),done=studyDoneCount(),rate=studyPercent();
  return `<button class="back" data-go="home">← ホーム</button><section class="card studyhero"><h2>STUDY / ${l.mode}</h2><p>学習したカテゴリだけチェックします。</p>${dashboardBar(rate,'study')}<p>${done}/${entries.length}カテゴリ完了</p></section><section class="card"><h2>学習カテゴリ</h2>${entries.map(([id,x])=>`<div class="study-category ${l.done['s_'+id]?'done':''}"><label><input type="checkbox" data-study-check="${id}" ${l.done['s_'+id]?'checked':''}><span><b>${x.icon} ${x.title}</b><small>${x.goal}<br>${x[l.mode.toLowerCase()]}分</small></span></label><button type="button" data-study="${id}">詳細</button></div>`).join('')}</section>`;
}
function showStudy(id){
  const x=STUDY[id],m=L().mode.toLowerCase();
  studyContent.innerHTML=`<h2>${x.icon} ${x.title}</h2><p>${x.goal}</p><div class="studytime">今日の目安 ${x[m]}分</div><div class="study-plan"><b>今日やること</b><ol>${x.steps.map(a=>`<li>${a}</li>`).join('')}</ol></div><h3>AIにそのまま使える開始文</h3><div class="promptbox">${x.prompt}</div><h3>今日のメモ</h3><textarea id="studyNote" class="study-note"></textarea><div class="study-actions"><button type="button" id="doneStudy" class="complete">${L().done['s_'+id]?'完了を取り消す':'このカテゴリを完了'}</button><button type="button" id="closeStudy" class="nextbtn">閉じる</button></div>`;
  studyDlg.showModal();studyNote.value=L().notes[id]||'';
  studyNote.oninput=()=>{L().notes[id]=studyNote.value;localStorage.setItem(KEY,JSON.stringify(S))};
  doneStudy.onclick=()=>{L().done['s_'+id]=!L().done['s_'+id];localStorage.setItem(KEY,JSON.stringify(S));studyDlg.close();render()};
  closeStudy.onclick=()=>studyDlg.close();
}
const dashboardRenderBase=render;
render=function(){dashboardRenderBase();document.querySelectorAll('[data-study-check]').forEach(cb=>cb.onchange=()=>{L().done['s_'+cb.dataset.studyCheck]=cb.checked;localStorage.setItem(KEY,JSON.stringify(S));render()})};
render();
