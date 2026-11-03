/* RE:START BODY enhancement v076 - loaded after app.js */
Object.assign(EX,{
  walk:{img:'walking-guide.png',n:'ウォーキング',icon:'🚶',g:'全身持久力・血流改善',full:'25分',short:'10分',minimum:'5分',kind:'walk',tips:['背筋を伸ばし、目線は少し先へ','かかとから着地し、つま先で蹴り出す','腕を自然に振り、リズムよく歩く','会話できる程度のペースを保つ']},
  stretch:{img:'stretch-guide.png',n:'全身ストレッチ',icon:'🧘',g:'柔軟性・疲労回復・姿勢',full:'7種目・約8分',short:'4種目・約5分',minimum:'2種目・約3分',kind:'stretch',tips:['反動をつけない','心地よい伸びで止める','呼吸を止めない','左右を同様に行う']},
  strength:{img:'strength-guide.png',n:'筋力トレーニング',icon:'🏋️',g:'筋力・基礎代謝・体を支える力',full:'6種目',short:'4種目',minimum:'2種目',kind:'strength',tips:['回数より正しいフォームを優先','呼吸を止めない','痛みがある動作は中止','無理のない量から継続する']}
});

const BODY_DETAIL={
  walk:[
    ['ウォーキング','25 / 10 / 5分',['背筋を伸ばす','かかとから着地','腕を自然に振る','会話できるペース']]
  ],
  stretch:[
    ['首のストレッチ','左右 各15秒',['肩の力を抜く','呼吸を止めない','反動をつけない']],
    ['肩まわりのストレッチ','左右 各15秒',['片腕を胸の前で引く','肩をすくめない','左右同様に']],
    ['胸のストレッチ','15秒',['胸を開く','肩を下げる','深く呼吸する']],
    ['背中のストレッチ','20秒',['両手を前へ伸ばす','背中をゆっくり丸める','お尻をかかとへ近づける']],
    ['股関節のストレッチ','左右 各20秒',['骨盤をまっすぐ','体を反らしすぎない','前脚にゆっくり体重を乗せる']],
    ['太もも裏のストレッチ','左右 各20秒',['膝を軽く伸ばす','背中を丸めすぎない','つま先方向へゆっくり']],
    ['ふくらはぎのストレッチ','左右 各20秒',['かかとを床につける','つま先は正面','左右同様に']]
  ],
  strength:[
    ['スクワット','FULL 15回×3 / SHORT 10回×2 / MIN 8回×1',['膝とつま先を同じ方向','背筋を伸ばす','お尻を後ろへ引く','膝を深く曲げすぎない']],
    ['プッシュアップ','FULL 10〜15回×3 / SHORT 8〜12回×2 / MIN 5〜8回×1',['頭からかかとまで一直線','手は肩幅より少し広め','胸をゆっくり下ろす','きつい日は膝つきでOK']],
    ['ヒップリフト','FULL 15〜20回×3 / SHORT 10〜15回×2 / MIN 8〜10回×1',['足は腰幅','お尻を締めて持ち上げる','腰を反らしすぎない','ゆっくり上下する']],
    ['バードドッグ','FULL 左右10回×3 / SHORT 左右8回×2 / MIN 左右5回×1',['背中をまっすぐ','お腹に力を入れる','腰を反らさない','左右同じように']],
    ['カーフレイズ','FULL 20回×3 / SHORT 15回×2 / MIN 10回×1',['ゆっくりつま先立ち','かかとをしっかり下ろす','体を安定させる','壁や椅子につかまってOK']],
    ['プランク','FULL 30〜60秒×3 / SHORT 20〜30秒×2 / MIN 10〜20秒×1',['頭からかかとまで一直線','お腹に力を入れる','腰を反らさない','呼吸を続ける']]
  ]
};

function body(){
  const l=L(),m=l.mode.toLowerCase(),ids=['walk','stretch','strength'];
  const done=ids.filter(id=>l.done['b_'+id]).length;
  return `<button class="back" data-go="home">← ホーム</button>
  <section class="card bodyhero"><h2>BODY / ${l.mode}</h2><p>体を動かして、明日の自分をつくる。</p><div class="progress"><span style="width:${Math.round(done/ids.length*100)}%"></span></div><p>${done}/${ids.length} 完了</p></section>
  <section class="card"><div class="body-mode-note"><b>今日のBODYメニュー</b><span>${l.mode==='FULL'?'しっかり取り組む日':l.mode==='SHORT'?'短めに続ける日':'最低限でも途切れさせない日'}</span></div>${ids.map(id=>{const x=EX[id];return `<button class="body-menu ${l.done['b_'+id]?'body-done':''}" data-ex="${id}"><span class="body-icon">${x.icon}</span><span class="body-info"><b>${x.n}</b><small>${x.g}<br><strong>${x[m]}</strong></small></span><span class="body-arrow">${l.done['b_'+id]?'✓':'›'}</span></button>`}).join('')}</section>
  <section class="card"><p class="muted">痛み、めまい、胸部症状、強い息苦しさなどがある場合は中止してください。無理のない範囲で続けます。</p></section>`;
}

function bodyDetailCards(id){
  const rows=BODY_DETAIL[id]||[];
  return rows.map((r,i)=>`<article class="body-detail-card"><div class="body-detail-no">${i+1}</div><div><b>${r[0]}</b><small>${r[1]}</small><ul>${r[2].map(t=>`<li>${t}</li>`).join('')}</ul></div></article>`).join('');
}

function showEx(id){
  const x=EX[id],m=L().mode.toLowerCase();
  exerciseContent.innerHTML=`<div class="body-dialog-head"><div><h2>${x.icon} ${x.n}</h2><p>${x.g} ｜ <b>${x[m]}</b></p></div></div>
  <img class="body-guide" src="${x.img}?v=076" alt="${x.n}のフォームガイド">
  <div class="body-detail-list">${bodyDetailCards(id)}</div>
  <div class="body-common"><b>意識すること</b><ul>${x.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>
  <div class="exercise-actions"><button type="button" id="doneEx" class="complete">${L().done['b_'+id]?'完了済み':'完了にする'}</button><button type="button" id="closeEx" class="nextbtn">閉じる</button></div>`;
  exerciseDlg.showModal();
  doneEx.onclick=()=>{L().done['b_'+id]=true;localStorage.setItem(KEY,JSON.stringify(S));exerciseDlg.close();render()};
  closeEx.onclick=()=>exerciseDlg.close();
}
