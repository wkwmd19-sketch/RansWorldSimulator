/* RWS v11.2: EXP needed for Lv -> Lv+1 in the rebirth coin table. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let observer=null,installed=false;
 function expForLevel(lv){
   try{
     if(typeof LEVEL_EXP==='undefined')return null;
     if(lv===350)return null; // Lv.351 EXP is not confirmed
     const n=Number(LEVEL_EXP[lv]);
     return Number.isFinite(n)&&n>0?n:null;
   }catch(e){return null;}
 }
 function update(){
   const header=$('rpTableHeadRow'),body=$('rpTableBody');
   if(!header||!body)return;
   if(!header.querySelector('[data-rws-local-needed-exp]')){
     const lvHead=header.querySelector('th');
     if(lvHead){
       const cell=document.createElement('th');cell.scope='col';cell.dataset.rwsLocalNeededExp='true';
       cell.textContent='필요 EXP (다음 Lv)';
       lvHead.insertAdjacentElement('afterend',cell);
     }
   }
   for(const row of body.querySelectorAll('tr')){
     if(row.querySelector('[data-rws-local-needed-exp]'))continue;
     const first=row.querySelector('td');if(!first)continue;
     const match=first.textContent.match(/Lv\.(\d+)/);
     if(!match){if(first.colSpan&&first.colSpan<4)first.colSpan+=1;continue;}
     const lv=Number(match[1]);const value=expForLevel(lv);
     const cell=document.createElement('td');cell.dataset.rwsLocalNeededExp='true';
     cell.style.color='#c5e9ff';cell.style.fontWeight='750';
     cell.textContent=lv===350?'-':(value==null?'자료 없음':value.toLocaleString('ko-KR'));
     cell.title=lv===350?'Lv.351 필요 EXP 미확정':'Lv.'+lv+'에서 Lv.'+(lv+1)+'까지 필요한 경험치';
     first.insertAdjacentElement('afterend',cell);
   }
 }
 function install(){
   if(installed)return true;
   const table=$('rpTableBackdrop')?.querySelector('.rp-table-values');
   if(!table)return false;
   installed=true;
   const css=document.createElement('style');css.id='rwsLocalRebirthExpCSS';
   css.textContent='#rpTableBackdrop .rp-table-values{min-width:680px}#rpTableBackdrop .rp-table-values th[data-rws-local-needed-exp],#rpTableBackdrop .rp-table-values td[data-rws-local-needed-exp]{text-align:right;white-space:nowrap}';
   document.head.appendChild(css);
   observer=new MutationObserver(update);
   observer.observe(table,{childList:true,subtree:true});
   update();
   window.__RWS_LOCAL_COIN_EXP_READY__=true;
   console.info('[RWS v11.2] Rebirth coin popup: next-level EXP column active');
   return true;
 }
 let tries=0;const timer=setInterval(()=>{if(install()||++tries>400)clearInterval(timer);},75);
 window.RWSLocalCoinExp={update,expForLevel};
})();