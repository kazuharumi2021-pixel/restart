/* RE:START MONEY individual delete v081 */
const moneyBaseRender=render;
render=function(){
  moneyBaseRender();
  if(S.tab!=='money')return;
  document.querySelectorAll('.moneyrow').forEach(row=>{
    const yen=row.querySelector('.yen');
    const title=row.querySelector('b')?.textContent||'';
    const meta=row.querySelector('small')?.textContent||'';
    const amountText=yen?.textContent||'';
    const candidates=moneyData().filter(x=>
      (x.item||x.store||'支出')===title &&
      amountText.includes((+x.amount||0).toLocaleString()) &&
      (!x.date||meta.includes(x.date))
    );
    const item=candidates[candidates.length-1];
    if(!item||row.querySelector('.money-delete'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='money-delete';btn.textContent='🗑️';btn.setAttribute('aria-label','この支出を削除');
    btn.onclick=()=>{
      if(!confirm(`「${title}」 ¥${(+item.amount||0).toLocaleString()} を削除しますか？`))return;
      S.money=moneyData().filter(x=>x.id!==item.id);
      localStorage.setItem(KEY,JSON.stringify(S));
      render();
    };
    if(yen)yen.after(btn); else row.appendChild(btn);
  });
};
render();
