/* RWS v11.03 · Penalty-ignoring RP shop cap 60% → 65%.
 * Player-supplied exact table: 60.0→65.0 in 50 steps of 0.1%.
 * Earlier 42.1–60.0% estimates are preserved and still labeled estimates.
 */
(function rws1103PenaltyExtension(){
 "use strict";
 const START=600,END=650,STEP=100000,FIRST=14200000;
 let installed=false,attempts=0;
 function install(){
  if(installed)return true;
  if(typeof DATA==="undefined"||typeof products==="undefined"||
     typeof renderShop!=="function"||typeof window.itemInfo!=="function")return false;
  const p=products.find(x=>x.id==="penalty"),meta=DATA.pricing?.penalty;
  if(!p||!meta||!Array.isArray(meta.prices))return false;
  if(p.maxTicks!==600||meta.prices.length!==600||p.tick!==0.1){
   console.error("[RWS v11.03] Penalty pricing baseline differs from expected; no changes applied",
     {maxTicks:p.maxTicks,priceCount:meta.prices.length,step:p.tick});
   return true;
  }
  const table=Array.from({length:END-START},(_,i)=>FIRST+STEP*i);
  if(table[0]!==14200000||table.at(-1)!==19100000||
     table.reduce((sum,x)=>sum+x,0)!==832500000)
   throw Error("60–65% penalty pricing checksum mismatch");
  meta.prices.push(...table);
  p.maxTicks=END;
  meta.confirmedExtra={fromTick:START,toTickExclusive:END,first:table[0],last:table.at(-1),total:832500000};
  meta.method=String(meta.method||"")+
   " / 60.0~65.0%는 제공된 신규 비용표에 따라 검증된 수치(0.1%당 100,000 RP씩 증가). 이전 42% 이후의 미검증 구간은 추정 유지.";
  const original=window.itemInfo;
  window.itemInfo=function(product){
   const info=original(product);
   // A purchase in the previously unverified middle range still makes total cost estimated.
   // But the NEXT upgrade after reaching 60% uses the newly supplied exact price table.
   if(product?.id==="penalty"&&product.ticks>=START&&product.ticks<END)
    info.nextEstimated=false;
   return info;
  };
  installed=true;
  window.__RWS1103_PENALTY_READY__={
   cap:65,step:0.1,prices:meta.prices.length,
   confirmedStart:START,confirmedEnd:END-1,confirmedSum:832500000
  };
  renderShop();
  console.info("[RWS v11.03] Penalty ignore cap: 65%; verified 50 new costs; total 832,500,000 RP");
  return true;
 }
 const id=setInterval(()=>{
  if(install()||++attempts>250){clearInterval(id);if(!installed)
   console.error("[RWS v11.03] penalty upgrade could not install");}
 },75);
})();
