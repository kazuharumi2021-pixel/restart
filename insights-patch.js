/* RE:START Calendar / Record / Report v077 */
function logScore(log){
  if(!log)return 0;
  if(Number.isFinite(+log.score)&&+log.score>0)return Math.max(0,Math.min(100,Math.round(+log.score)));
  const done=log.done||{};
  const keys=Object.keys(done).filter(k=>done[k]);
  if(!keys.length)return 0;
  const routine=S.tasks||[];
  const routineDone=routine.filter(x=>done[x.id]).length;
  const bodyDone=['b_walk','b_stretch','b_strength'].filter(k=>done[k]).length;
  const studyDone=Object.keys(done).filter(k=>k.startsWith('s_')&&done[k]).length;
  const denom=Math.max(1,routine.length+3+Math.min(2,studyDone||0));
  return Math.min(100,Math.round((routineDone+bodyDone+Math.min(2,studyDone))/denom*100));
}
function monthKeys(){
  const y=D.getFullYear(),m=D.getMonth(),out=[];
  const last=new Date(y,m+1,0).getDate();
  for(let d=1;d<=last;d++)out.push(K(new Date(y,m,d)));
  return out;
}
function moneyForDate(k){return moneyData().filter(x=>String(x.date||'')===k)}
function daySummary(k){
  const l=S.logs[k]||{},done=l.done||{};
  return {score:logScore(l),routine:(S.tasks||[]).filter(x=>done[x.id]).length,body:['walk','stretch','strength'].filter(id=>done['b_'+id]).length,study:Object.keys(done).filter(x=>x.startsWith('s_')&&done[x]).length,money:moneyForDate(k)};
}
function calendar(){
  const y=D.getFullYear(),m=D.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0).getDate(),cells=Array(first.getDay()).fill('<div></div>');
  for(let d=1;d<=last;d++){
    const k=K(new Date(y,m,d)),q=daySummary(k),cl=q.score>=80?'good':q.score>=60?'ok':q.score>=40?'rec':q.score>0?'bad':'',today=k===K(D)?' cal-today':'';
    const marks=`${q.body?'🏃':''}${q.study?'📚':''}${q.money.length?'💴':''}`;
    cells.push(`<button type="button" class="day calday ${cl}${today}" data-date="${k}"><b>${d}</b><small>${marks||' '}</small></button>`);
  }
  const active=monthKeys().map(k=>daySummary(k).score).filter(Boolean),avg=active.length?Math.round(active.reduce((a,b)=>a+b,0)/active.length):0;
  return `<button class="back" data-go="home">← ホーム</button><section class="card"><div class="row between"><h2>${y}年${m+1}月</h2><span class="cal-avg">平均 ${avg}</span></div><div class="cal">${J.split('').map(x=>`<b>${x}</b>`).join('')}${cells.join('')}</div><div class="cal-legend"><span>●80+</span><span>●60+</span><span>●40+</span><span>🏃BODY</span><span>📚STUDY</span><span>💴MONEY</span></div></section><section id="dayDetail" class="card"><p class="muted">日付をタップすると、その日の記録を表示します。</p></section>`;
}
function showDay(k){
  const q=daySummary(k),l=S.logs[k]||{},names=(S.tasks||[]).filter(x=>(l.done||{})[x.id]).map(x=>x.n),money=q.money.reduce((s,x)=>s+(+x.amount||0),0);
  dayDetail.innerHTML=`<h2>${k.replaceAll('-','/')}</h2><div class="record-stats"><div><small>スコア</small><b>${q.score||0}</b></div><div><small>BODY</small><b>${q.body}/3</b></div><div><small>STUDY</small><b>${q.study}</b></div><div><small>支出</small><b>¥${money.toLocaleString()}</b></div></div>${names.length?`<h3>ルーティン</h3><ul class="compact-list">${names.map(x=>`<li>✓ ${x}</li>`).join('')}</ul>`:''}${q.money.length?`<h3>支出</h3>${q.money.map(x=>`<div class="moneyrow"><div><b>${x.item||x.store||'支出'}</b><small>${x.store||''} ｜ ${x.cat||''}</small></div><div class="yen">¥${(+x.amount||0).toLocaleString()}</div></div>`).join('')}`:''}`;
}
function record(){
  const keys=[...new Set([...Object.keys(S.logs||{}),...moneyData().map(x=>x.date).filter(Boolean)])].sort().reverse();
  return `<section class="card recordhero"><h2>記録</h2><p>BODY・STUDY・ルーティン・支出を、日付ごとにまとめます。</p></section>${keys.length?keys.slice(0,31).map(k=>{const q=daySummary(k),money=q.money.reduce((s,x)=>s+(+x.amount||0),0);return `<section class="card record-day"><div class="row between"><b>${k.replaceAll('-','/')}</b><span class="scorechip">${q.score||0}</span></div><div class="record-tags"><span>✓ ${q.routine}件</span><span>🏃 ${q.body}/3</span><span>📚 ${q.study}</span><span>💴 ¥${money.toLocaleString()}</span></div></section>`}).join(''):'<section class="card"><p class="muted">まだ記録はありません。</p></section>'}`;
}
function report(){
 const keys=Object.keys(S.logs||{}).sort(),scores=keys.map(k=>daySummary(k).score).filter(Boolean),avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
 const bodyDays=keys.filter(k=>daySummary(k).body>0).length,studyDays=keys.filter(k=>daySummary(k).study>0).length;
 const monthPrefix=K(D).slice(0,7),mm=moneyData().filter(x=>String(x.date||'').startsWith(monthPrefix)),spend=mm.reduce((s,x)=>s+(+x.amount||0),0);
 const cats={};mm.forEach(x=>cats[x.cat||'その他']=(cats[x.cat||'その他']||0)+(+x.amount||0));const max=Math.max(1,...Object.values(cats));
 const recent=keys.slice(-7).map(k=>({k,s:daySummary(k).score}));
 return `<section class="card reporthero"><h2>レポート</h2><p>完璧より、戻ってこられた日を積み上げます。</p><div class="report-grid"><div><small>平均スコア</small><b>${avg}</b></div><div><small>BODY実施日</small><b>${bodyDays}</b></div><div><small>STUDY実施日</small><b>${studyDays}</b></div><div><small>今月の支出</small><b>¥${spend.toLocaleString()}</b></div></div></section><section class="card"><h2>最近のスコア</h2>${recent.length?`<div class="score-bars">${recent.map(x=>`<div><span style="height:${Math.max(4,x.s)}%"></span><small>${+x.k.slice(-2)}</small></div>`).join('')}</div>`:'<p class="muted">記録がたまると表示します。</p>'}</section><section class="card"><h2>今月の支出カテゴリ</h2>${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="catbar"><div class="row between"><span>${c}</span><b>¥${v.toLocaleString()}</b></div><div class="barline"><span style="width:${Math.round(v/max*100)}%"></span></div></div>`).join('')||'<p class="muted">今月の支出はまだありません。</p>'}</section>`;
}

const baseRender=render;
render=function(){
  app.innerHTML=S.tab==='home'?home():S.tab==='body'?body():S.tab==='study'?study():S.tab==='money'?money():S.tab==='calendar'?calendar():S.tab==='record'?record():S.tab==='report'?report():simple('設定');
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.go;save()});
  document.querySelectorAll('[data-money]').forEach(b=>b.onclick=()=>b.dataset.money==='scan'?scanMoney():moneyForm());
  document.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>showStudy(b.dataset.study));
  document.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>showEx(b.dataset.ex));
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{L().mode=b.dataset.mode;save()});
  document.querySelectorAll('[data-check]').forEach(b=>b.onchange=()=>{L().done[b.dataset.check]=b.checked;save()});
  document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>showDay(b.dataset.date));
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===S.tab));
};
render();
