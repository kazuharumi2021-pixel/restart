/* RE:START OCR item extraction v080 */
function normalizeOcr(data,file){
  const r=data.receipt||{},text=data.rawText||'';
  const amount=yenNumber(r.total)||yenNumber(textMatch(text,[/ご請求額[^0-9¥￥]*[¥￥]?\s*([0-9,]+)/,/ご請求合計[^0-9¥￥]*[¥￥]?\s*([0-9,]+)/,/合\s*計[^0-9¥￥]*[¥￥]?\s*([0-9,]+)/,/PayPay支払[^0-9¥￥]*[¥￥]?\s*([0-9,]+)/]));
  const store=r.merchantName||textMatch(text,[/(セブン[-ー]?イレブン[^\n]{0,30})/,/([^\n]{1,40}オフィシャルストア)/,/店舗名\s*[:：]?\s*([^\n]+)/,/販売者\s*[:：]?\s*([^\n]+)/]);
  let date=r.transactionDate||'';
  if(!date){const m=text.match(/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日/);if(m)date=`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`}
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),items=[];
  const skip=/^(?:小\s*計|消費税|内消費税|合\s*計|税率|PayPay支払|お買上明細|会員コード|伝票番号|電話|レジ|事業者登録番号|領収書)/;
  for(let i=0;i<lines.length;i++){
    let line=lines[i],m;
    // Convenience-store format: 商品名 *188 / ＊188 / ¥188, including OCR spaces.
    m=line.match(/^(.{2,80}?)\s+(?:\*|＊|※|¥|￥)\s*([0-9,]+)\s*円?$/);
    if(m&&!skip.test(m[1])){items.push(`${m[1].trim()} | ${m[2].replace(/,/g,'')}`);continue}
    // Same format split by OCR into two lines: item name, then *188.
    m=line.match(/^(?:\*|＊|※|¥|￥)\s*([0-9,]+)\s*円?$/);
    if(m&&i>0){let name=lines[i-1].trim();if(name.length>=2&&!skip.test(name)&&!/^[-ー―\s]+$/.test(name))items.push(`${name} | ${m[1].replace(/,/g,'')}`);continue}
    // Online-store format: 販売価格 1,700 / ¥1,700. Look backward for product name.
    m=line.match(/(?:販売価格|価格|単価)\s*[:：]?\s*[¥￥]?\s*([0-9,]+)\s*円?/i);
    if(m){let name='';for(let j=i-1;j>=Math.max(0,i-12);j--){let c=lines[j].trim();if(!c||/^(?:販売価格|価格|単価|数量|個数|点数|品番|商品コード|SKU|送料|小計|合計|注文番号)(?:\s|[:：]|[0-9]|$)/i.test(c)||/^(?:[¥￥]?\s*)?[0-9,]+\s*円?$/.test(c)||/^SSZS[-_A-Za-z0-9]+$/i.test(c))continue;name=c;break}items.push(`${name||'商品'} | ${m[1].replace(/,/g,'')}`)}
  }
  const ship=text.match(/送料[^0-9¥￥]*[¥￥]?\s*([0-9,]+)/);if(ship)items.push(`送料 | ${ship[1].replace(/,/g,'')}`);
  const unique=[...new Set(items)];
  return {file:file.name,source:'Azure OCR',status:'OCR解析が完了しました。内容を確認・修正して登録してください。',extracted:true,date:date||K(D),amount,store,item:unique.length?`${unique.length}件の明細`:'',cat:guessCategory(`${store}\n${text}`),pay:guessPay(text),items:unique.join('\n')};
}
