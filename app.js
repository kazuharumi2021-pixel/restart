const KEY='restart-life-v1';
const baseTasks=[
 {n:'朝のお祈り（朝晩推奨・最低1日1回）',t:'MUST',p:6},{n:'朝の服薬：デュロキセチン / タダラフィル',t:'MUST',p:8},{n:'AGA服薬（火水木土日）',t:'MUST',p:4},{n:'朝ストレッチ 3〜5分',t:'SHOULD',p:5},{n:'ウォーキング 20〜30分',t:'SHOULD',p:10},{n:'英語 / 自主学習',t:'SHOULD',p:8},{n:'夜ストレッチ 5〜10分',t:'SHOULD',p:6},{n:'夜のお祈り',t:'BONUS',p:3},{n:'22:00 娯楽終了',t:'MUST',p:10},{n:'23:00 就寝',t:'MUST',p:15}
];
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{tasks:baseTasks.map((x,i)=>({...x,id:i+1,done:false})),money:[],mode:'full'};
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function render(){const root=document.querySelector('#tasks');root.innerHTML='';state.tasks.forEach(x=>{const r=document.createElement('div');r.className='task';r.innerHTML=`<input type="checkbox" ${x.done?'checked':''}><label>${x.n}</label><span class="tag">${x.t}</span>`;r.querySelector('input').addEventListener('change',e=>{x.done=e.target.checked;save()});root.append(r)});document.querySelector('#score').textContent=Math.min(100,state.tasks.filter(x=>x.done).reduce((a,b)=>a+b.p,0));}
document.querySelector('#date').textContent='11/3 火・祝';
document.querySelector('#addTask').onclick=()=>document.querySelector('#taskDialog').showModal();
document.querySelector('#saveTask').onclick=e=>{const n=document.querySelector('#taskName').value.trim();if(!n){e.preventDefault();return}state.tasks.push({id:Date.now(),n,t:document.querySelector('#taskType').value,p:3,done:false});document.querySelector('#taskName').value='';save()};
document.querySelector('#minimum').onclick=()=>{state.mode='minimum';state.tasks.forEach(x=>{if(!['MUST'].includes(x.t))x.t='BONUS'});save();document.querySelector('#panel').innerHTML='<h2>最低限モード</h2><p>今日は取り返しません。MUSTを優先し、運動・学習は翌日に積み上げず通常運転へ戻します。</p>'};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const v=b.dataset.view,p=document.querySelector('#panel');const txt={body:'BODY：SIXPAD・ウォーキング/ランニング・筋トレ・ストレッチ。画像付きフォーム解説は次版で追加します。',study:'STUDY：通勤英会話・CATIA V5/JIS・自主学習を管理します。',money:'MONEY：手入力に加え、レシート/購入スクショ/PDFをAI/OCR解析する接続口を次版で実装します。',calendar:'CALENDAR：日別スコア、完了率、正当スキップ、復帰状況を月単位で確認できるようにします。'};p.innerHTML=`<h2>${v.toUpperCase()}</h2><p>${txt[v]}</p>`});
render();
