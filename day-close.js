/* RE:START logical day close v087: manual close or forced close at 05:00 */
const RC_CUTOFF_HOUR=5;
const rcPad=n=>String(n).padStart(2,'0');
const rcKey=d=>`${d.getFullYear()}-${rcPad(d.getMonth()+1)}-${rcPad(d.getDate())}`;
const rcCalendarDay=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
const rcPreviousDay=d=>{const x=new Date(d);x.setDate(x.getDate()-1);return x};
function rcLogFor(d){const k=rcKey(d);return S.logs[k]||(S.logs[k]={done:{},score:0,mode:'FULL',notes:{}})}
function rcTotals(){
  const l=L();
  const routine=typeof routineTasks==='function'?routineTasks():S.tasks;
  const rDone=routine.filter(x=>l.done[x.id]).length;
  const bodyIds=['walk','stretch','strength'];
  const bTotal=typeof bodyRowsForMode==='function'?bodyIds.reduce((n,id)=>n+bodyRowsForMode(id).length,0):0;
  const bDone=typeof bodyDoneCount==='function'?bodyIds.reduce((n,id)=>n+bodyDoneCount(id),0):0;
  const sTotal=typeof studyEntries==='function'?studyEntries().length:0;
  const sDone=typeof studyDoneCount==='function'?studyDoneCount():0;
  const total=routine.length+bTotal+sTotal,done=rDone+bDone+sDone;
  return {total,done,score:total?Math.round(done/total*100):0,routine:{done:rDone,total:routine.length},body:{done:bDone,total:bTotal},study:{done:sDone,total:sTotal}};
}
function rcFinalize(log,type,at=new Date()){
  if(log.closedAt)return;
  const totals=rcTotals();
  log.score=totals.score;log.finalScore=totals.score;log.finalTotals=totals;
  log.closedAt=at.toISOString();log.closeType=type;
}
function rcMigrateBedtime(){
  let changed=false;
  S.tasks.forEach(x=>{if(/^23:00\s*就寝/.test(x.n)){x.n=x.n.replace(/^23:00/,'0:00');changed=true}});
  if(changed)localStorage.setItem(KEY,JSON.stringify(S));
}
function rcAlignInitialDay(){
  const now=new Date(),today=rcCalendarDay(),prev=rcPreviousDay(today),prevLog=rcLogFor(prev);
  if(now.getHours()<RC_CUTOFF_HOUR&&!prevLog.closedAt){D.setTime(prev.getTime())}
  if(now.getHours()>=RC_CUTOFF_HOUR&&!prevLog.closedAt&&Object.keys(prevLog.done||{}).length){
    const forced=new Date(today);forced.setHours(RC_CUTOFF_HOUR,0,0,0);
    const currentD=new Date(D);D.setTime(prev.getTime());rcFinalize(prevLog,'forced',forced);D.setTime(currentD.getTime());
    localStorage.setItem(KEY,JSON.stringify(S));
  }
}
function rcFinishToday(){
  const l=L();
  if(l.closedAt)return;
  if(!confirm('今日を終了して達成状況を確定しますか？'))return;
  rcFinalize(l,'manual',new Date());localStorage.setItem(KEY,JSON.stringify(S));
  const today=rcCalendarDay();if(rcKey(D)!==rcKey(today))D.setTime(today.getTime());
  render();
}
function rcStatusHtml(){
  const l=L(),tot=rcTotals();
  if(l.closedAt){const t=new Date(l.closedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});return `<section class="card day-close-card closed"><div><b>本日は終了しました</b><small>${l.closeType==='forced'?'5:00に自動終了':t+'に確定'} ｜ 最終達成率 ${l.finalScore??tot.score}%</small></div></section>`}
  return `<section class="card day-close-card"><div><b>今日の記録を確定</b><small>押さない場合は翌朝5:00に自動終了します</small></div><button type="button" id="finishDay">本日終了</button></section>`;
}
rcMigrateBedtime();rcAlignInitialDay();
const rcHomeBase=home;
home=function(){
  const l=L(),tot=rcTotals();l.score=tot.score;
  let html=rcHomeBase();
  const marker='<section class="card"><h2>QUICK</h2>';
  return html.includes(marker)?html.replace(marker,rcStatusHtml()+marker):html+rcStatusHtml();
};
const rcRenderBase=render;
render=function(){
  rcRenderBase();
  const l=L();
  const finish=document.querySelector('#finishDay');if(finish)finish.onclick=rcFinishToday;
  if(l.closedAt){document.querySelectorAll('[data-check],[data-study-check],[data-mode],[data-body-item],#allBody,#doneStudy').forEach(el=>el.disabled=true)}
  today.textContent=`${D.getFullYear()}.${D.getMonth()+1}.${D.getDate()} (${J[D.getDay()]}) ・ Day ${Math.max(1,Math.floor((D-START)/86400000)+1)}`;
};
function rcRollover(){
  const now=new Date(),today=rcCalendarDay();
  if(now.getHours()>=RC_CUTOFF_HOUR){
    if(rcKey(D)!==rcKey(today)){
      const old=L();if(!old.closedAt)rcFinalize(old,'forced',now);
      D.setTime(today.getTime());localStorage.setItem(KEY,JSON.stringify(S));render();
    }
  }else if(L().closedAt&&rcKey(D)!==rcKey(today)){D.setTime(today.getTime());render()}
}
setInterval(rcRollover,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)rcRollover()});
render();
