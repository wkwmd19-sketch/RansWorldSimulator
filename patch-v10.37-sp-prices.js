/* RWS v10.37 · SP gain RP pricing (provisional interpolation).
   Shop icon and existing base app theme remain unchanged.
   Index n represents the cost to upgrade from +n to +(n+1).
   Verified anchor points: +24=1580, +33=5000, +50=20000, +66=59000, +90=164000.
   +20=940 retained from the previous v10.36 provisional formula.
*/
(function rws1037SPPricing(){
  'use strict';
  const ANCHORS={20:940,24:1580,33:5000,50:20000,66:59000,90:164000};
  function install(){
    try{
      if(typeof DATA==='undefined'||!DATA.pricing?.sp||typeof renderShop!=='function')return false;
      const sp=DATA.pricing.sp, price=sp.prices;
      if(!Array.isArray(price)||price.length<200)return false;
      // Wait for the existing loader's corrected SP pricing table, not the legacy app-base table.
      for(const level of [20,33,50,66,90]){
        if(price[level]!==ANCHORS[level])return false;
      }
      // Fit a quadratic through (+20,940), (+24,1580), and (+33,5000).
      // Keep other established price points untouched; round estimated costs to 20 RP.
      const x1=24-20,x2=33-20;
      const slope1=(ANCHORS[24]-ANCHORS[20])/x1;
      const slope2=(ANCHORS[33]-ANCHORS[20])/x2;
      const a=(slope2-slope1)/(x2-x1);
      const b=slope1-a*x1;
      const revised=[];
      for(let level=21;level<=32;level++){
        const x=level-20;
        const value=ANCHORS[20]+b*x+a*x*x;
        const cost=level===24?ANCHORS[24]:Math.round(value/20)*20;
        if(!Number.isSafeInteger(cost)||cost<=0)throw Error('Invalid SP estimate at +'+level);
        revised.push(cost);
      }
      const compare=[price[20],...revised,price[33]];
      if(compare.some((n,i)=>i>0&&n<=compare[i-1]))throw Error('SP RP prices must increase monotonically');
      revised.forEach((cost,i)=>{price[21+i]=cost;});
      // The shop models only a contiguous exact prefix. Retain the existing prefix
      // and disclose isolated verified anchors in the help tooltip instead.
      sp.exact=21;
      sp.method='SP증가 필요 RP값 수정(임시). +24→+25 1,580 RP 신규 실측. 기존 +33→+34 5,000 / +50→+51 20,000 / +66→+67 59,000 / +90→+91 164,000 RP 실측을 유지했습니다. +20→+21 940 RP는 이전 기준값이며, +21~+32 사이의 미확인 가격은 세 기준점에 맞춘 곡선 보간 추정값입니다. +33 이후 미확인 구간과 +91 이후 값도 기존 추정치를 유지합니다.';
      window.__RWS37_SP_PRICES_READY__=true;
      window.__RWS37_SP_PRICES_META__={anchors:ANCHORS,estimatedRange:[21,32]};
      renderShop();
      console.info('[RWS v10.37] SP RP temporary estimate applied; +24->+25 =',price[24]);
      return true;
    }catch(e){console.error('[RWS v10.37] SP pricing update failed',e);return false;}
  }
  if(install())return;
  let tries=0;
  const timer=setInterval(()=>{if(install()||++tries>120)clearInterval(timer);},100);
})();