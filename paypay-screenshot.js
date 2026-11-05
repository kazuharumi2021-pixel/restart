/* RE:START PayPay screenshot + PayPay/PayPay Card CSV importer v083 */
const PPV='v083';
const ppNorm=s=>String(s??'').trim().replace(/^"|"$/g,'').replace(/\s+/g,' ');
const ppMoney=s=>Number(String(s??'').replace(/[^0-9.-]/g,''))||0;
const ppDate=s=>{let m=String(s??'').match(/(20\d{2})[年\/-]\s*(\d{1,2})[月\/-]\s*(\d{1,2})(?:日)?(?:\s*(\d{1,2})[時:]\s*(\d{1,2}))?/);return m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:''};
const ppTime=s=>{let m=String(s??'').match(/(?:\d{1,2}月\d{1,2}日\s*)?(\d{1,2})[時:]\s*(\d{1,2})/);return m?`${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}`:''};
const ppStore=s=>ppNorm(s).replace(/　/g,' ');
function ppCat(store){return /セブン|ローソン|ファミリーマート|スーパー|食品|弁当|カフェ|レストラン/.test(store)?'食費':'その他'}
function ppDuplicate(x){
  const exact=moneyData().find(y=>x.transactionId&&y.transactionId&&String(x.transactionId)===String(y.transactionId));
  if(exact)return {level:'exact',item:exact};
  const likely=moneyData().find(y=>String(y.date||'')===x.date&&(+y.amount||0)===x.amount&&ppStore(y.store||'')===ppStore(x.store||'')&&(!x.time||!y.time||x.time===y.time));
  return likely?{level:'likely',item:likely}:null;
}
function ppCsvRows(text){
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){let c=text[i],n=text[i+1];if(c==='"'&&q&&n==='"'){cell+='"';i++}else if(c==='"')q=!q;else if(c===','&&!q){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=c}
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
function ppFind(headers,names){for(const n of names){let i=headers.findIndex(h=>ppNorm(h).replace(/[\s　]/g,'').includes(n));if(i>=0)return i}return -1}
function parsePayPayCsv(text,fileName=''){
  const rows=ppCsvRows(text.replace(/^\uFEFF/,''));if(rows.length<2)throw new Error('CSVに明細がありません');
  const h=rows[0].map(ppNorm),di=ppFind(h,['取引日','利用日','利用年月日']),oi=ppFind(h,['出金金額','利用金額','金額']),ii=ppFind(h,['入金金額']),ci=ppFind(h,['取引内容','利用内容']),si=ppFind(h,['取引先','利用店名','加盟店名','利用先']),mi=ppFind(h,['取引方法','支払方法']),ti=ppFind(h,['取引番号','利用番号']);
  if(di<0||oi<0)throw new Error('取引日または金額の列を確認できません');
  return rows.slice(1).map((r,i)=>{const content=ci>=0?ppNorm(r[ci]):'',amount=ppMoney(r[oi]);if(!amount||/ポイント|入金|チャージ|返金/.test(content)||(!/カード/i.test(fileName)&&ii>=0&&ppMoney(r[ii])>0))return null;const rawDate=r[di]||'';const store=si>=0?ppStore(r[si]):(content||'カード利用');return {key:`csv-${i}`,date:ppDate(rawDate),time:ppTime(rawDate),amount:Math.abs(amount),store,item:store,cat:ppCat(store),pay:mi>=0?ppNorm(r[mi]):(/カード/i.test(fileName)?'クレジット':'PayPay'),transactionId:ti>=0?ppNorm(r[ti]):'',source:/カード/i.test(fileName)?'PayPayカードCSV':'PayPay CSV'} }).filter(Boolean);
}
function parsePayPayScreenshot(text){
  const lines=String(text||'').split(/\r?\n/).map(ppNorm).filter(Boolean),out=[];
  for(let i=0;i<lines.length;i++){
    if(!/(支払い完了|セブン|ローソン|ファミリーマート|円$)/.test(lines[i]))continue;
    let store='',date='',time='',amount=0,pay='PayPay';
    for(let j=Math.max(0,i-5);j<=Math.min(lines.length-1,i+7);j++){
      const l=lines[j];if(/PayPayポイント|\d+\s*pt$/i.test(l))continue;
      if(!store&&/(セブン|ローソン|ファミリーマート|イオン|スーパー|ドラッグ|ストア|カフェ|レストラン)/.test(l)&&!/支払い完了/.test(l))store=l;
      if(!date&&/20\d{2}年/.test(l)){date=ppDate(l);time=ppTime(l)}
      if(!amount){let m=l.match(/([0-9,]+)\s*円$/);if(m)amount=ppMoney(m[1])}
      if(/カード|VISA|Mastercard|JCB/i.test(l))pay='クレジット';
    }
    if(store&&date&&amount){let key=`${date}-${time}-${store}-${amount}`;if(!out.some(x=>x.key===key))out.push({key,date,time,amount,store,item:store,cat:ppCat(store),pay,transactionId:'',source:'PayPayスクショ'})}
  }
  return out;
}
function ppReview(list,title){
  if(!list.length){alert('登録可能な支出を確認できませんでした');return}
  list.forEach(x=>x.dup=ppDuplicate(x));
  const dups=list.filter(x=>x.dup).length;
  moneyContent.innerHTML=`<h2>${title}</h2><div class="pp-summary">${list.length}件を検出${dups?`<b>・重複候補 ${dups}件</b>`:''}</div><div class="pp-list">${list.map((x,i)=>`<label class="pp-item ${x.dup?'pp-dup':''}"><input type="checkbox" data-pp="${i}" ${x.dup?'':'checked'}><span><b>${x.store}</b><small>${x.date} ${x.time||''} ｜ ${x.pay}${x.dup?`<em>⚠️ ${x.dup.level==='exact'?'取引番号が一致':'似た履歴あり'}</em>`:''}</small></span><strong>¥${x.amount.toLocaleString()}</strong></label>`).join('')}</div>${dups?'<p class="pp-note">重複候補は初期状態で除外しています。必要ならチェックを入れて両方登録できます。</p>':''}<div class="pp-actions"><button type="button" id="ppImport" class="complete">選択した支出を登録</button><button type="button" id="ppCancel" class="nextbtn">中止</button></div>`;
  moneyDlg.showModal();
  ppCancel.onclick=()=>moneyDlg.close();
  ppImport.onclick=()=>{const selected=[...moneyContent.querySelectorAll('[data-pp]:checked')].map(el=>list[+el.dataset.pp]);if(!selected.length){alert('登録する支出を選択してください');return}selected.forEach((x,n)=>moneyData().push({...x,id:Date.now()+n,items:[]}));localStorage.setItem(KEY,JSON.stringify(S));moneyDlg.close();render();alert(`${selected.length}件を登録しました${dups?`（重複候補は選択内容に従いました）`:''}`)};
}
async function ppReadCsv(file){let buf=await file.arrayBuffer(),text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch{text=new TextDecoder('shift-jis').decode(buf)}if(/�/.test(text))text=new TextDecoder('shift-jis').decode(buf);return parsePayPayCsv(text,file.name)}
function ppImportDialog(){
  moneyContent.innerHTML=`<h2>📱 PayPayスクショ取込</h2><div class="pp-choices"><label>📱<b>PayPay履歴スクショを複数選択</b><small>写真アプリから複数枚をまとめて選択できます</small><input id="ppShot" type="file" accept="image/*" multiple></label></div><div id="ppStatus" class="ai-status" style="display:none"></div>`;
  moneyDlg.showModal();
  ppShot.onchange=async()=>{
    const files=[...(ppShot.files||[])];if(!files.length)return;
    ppStatus.style.display='block';let all=[],errors=[];
    for(let i=0;i<files.length;i++){
      const f=files[i];ppStatus.textContent=`${files.length}枚中 ${i+1}枚目を読み取っています…`;
      try{
        if(f.size>4*1024*1024)throw new Error('4MBを超えています');
        const base64=await fileToBase64(f),res=await fetch(OCR_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({base64,contentType:f.type||'image/jpeg'})}),data=await res.json();
        if(!res.ok||!data.success)throw new Error(data.error||'OCRに失敗しました');
        all.push(...parsePayPayScreenshot(data.rawText));
      }catch(e){errors.push(`${f.name}: ${e.message}`)}
    }
    const unique=[...new Map(all.map(x=>[x.transactionId||x.key,x])).values()];
    if(!unique.length){ppStatus.textContent=`登録可能な支出を確認できませんでした${errors.length?'（'+errors.length+'枚でエラー）':''}`;return}
    ppReview(unique,`PayPayスクショ取込（${files.length}枚）`);
    if(errors.length)alert(`${errors.length}枚は読み取れませんでした。読み取れた候補のみ表示します。`);
  };
}
const ppRenderBase=render;
render=function(){ppRenderBase();if(S.tab==='money'){const box=document.querySelector('.money-actions');if(box&&!document.querySelector('[data-money="paypay"]')){const b=document.createElement('button');b.type='button';b.dataset.money='paypay';b.textContent='📱 PayPayスクショ取込';b.onclick=ppImportDialog;box.appendChild(b)}}};
render();
