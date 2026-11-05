/* RE:START BODY unified overview v085 */
function bodyPercent(id){const t=bodyRowsForMode(id).length,d=bodyDoneCount(id);return t?Math.round(d/t*100):0}
const bodyV083=body;
body=function(){
  const html=bodyV083();
  const ids=['walk','stretch','strength'];
  const summary=`<section class="card body-summary"><h2>今日の達成状況</h2>${ids.map(id=>{const x=EX[id],d=bodyDoneCount(id),t=bodyRowsForMode(id).length,p=bodyPercent(id);const note=id==='walk'?(d?'完了':'未完了'):`${d}/${t}種目完了`;return `<button class="body-summary-row ${p===100?'is-complete':''}" data-ex="${id}"><span class="body-summary-head"><b>${x.icon} ${x.n}</b><strong>${p}%</strong></span><span class="body-summary-bar"><i style="width:${p}%"></i></span><small>${note}</small></button>`}).join('')}</section>`;
  return html.replace('<section class="card"><div class="body-mode-note">',summary+'<section class="card"><div class="body-mode-note">');
};
