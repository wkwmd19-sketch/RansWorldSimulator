/* RWS v10.35 · RP Shop product vector icons (39 items; no changes to calculations). */
(function rwsRpVectorIcons(){
  'use strict';
  const BASE='rws-rp-vector';
  const ICONS={
    exp:'<path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 3 5-7"/><path d="M16 6h3v3"/>',
    rp:'<circle cx="9" cy="9" r="5"/><path d="M14.5 8.5c3.7.3 5.5 2.5 5.5 5.5 0 3.1-2.5 5.5-5.6 5.5-3 0-5.2-1.6-5.5-4.2"/><path d="M9 6.7v4.6m-1.5-3.2h3"/>',
    sp:'<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',
    aim:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
    str:'<path d="M4 9v6M7 7v10M17 7v10M20 9v6M4 12h16"/>',
    dex:'<path d="m5 17 4-9 4 5 5-7"/><path d="m14 6 4 0 0 4"/><path d="M5 21h14"/>',
    int:'<path d="M12 4.3c-2.6-2.2-6.5-.5-6.5 2.8-2.2.9-3 3.9-.9 5.4-1.4 2.5.2 5.4 2.8 5.4 1.1 2 3.5 2.4 4.6.8 1.1 1.6 3.7 1.2 4.7-.8 2.6 0 4.2-2.9 2.8-5.4 2-1.5 1.3-4.5-1-5.4-2-3.3.1-7.2 0-7.5 3.5-.6 3.4-2.8 5.2-4.1 5.5-1.2 1.8-2 4.5-2.2 6.8"/><path d="M12 4v16"/>',
    luk:'<path d="M12 11C2 11 6 2 12 8c6-6 10 3 0 3Zm0 0c-9-1-10 8-2 7 3-.4 3-3 2-7Zm0 0c0-10 8-11 8-4-.1 3-3 4-8 4Z"/><path d="M12 13c1 3 2 5 4 8"/>',
    evasion:'<path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z"/><path d="m8 13 2 2 6-6"/>',
    penalty:'<path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z"/><path d="M8 12h8M12 8v8"/>',
    meso:'<path d="M5 6h13a2 2 0 0 1 2 2v11H6a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2Z"/><path d="M6 6V4a2 2 0 0 1 2-2h10v4"/><path d="M14 11h7v5h-7a2.5 2.5 0 0 1 0-5Z"/><path d="M16 13.5h.01"/>',
    move:'<path d="m4 17 4-5 4 3 3-8 5 2"/><path d="M17 5h4v4"/><path d="M4 21h16"/>',
    generic:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8M12 8v8"/>'
  };
  const TIER_LABEL={normal:'N',magic:'M',rare:'R',epic:'E',unique:'U',legendary:'LG',imperial:'IM',master:'MA',arcane:'AR',mystic:'MY',heaven:'HE',divine:'DV',ultimate:'UL',royal:'RO',eternal:'ET'};
  const TIER_KO={노멀:'normal',매직:'magic',레어:'rare',에픽:'epic',유니크:'unique',레전드리:'legendary',임페리얼:'imperial',마스터:'master',아케인:'arcane',미스틱:'mystic',헤븐:'heaven',디바인:'divine',얼티밋:'ultimate',로얄:'royal',이터널:'eternal'};
  const STYLE=document.createElement('style');
  STYLE.id=BASE+'-style';
  STYLE.textContent=`
    #shop .product .pimg{
      display:grid!important;place-items:center!important;
      width:94px!important;height:94px!important;overflow:hidden!important;
      background:#142239!important;background-image:none!important;
      background-repeat:no-repeat!important;background-position:center!important;
      background-size:auto!important;
      border:1px solid #334865!important;
      border-radius:17px!important;
      margin:4px auto 8px!important;
      box-shadow:inset 0 1px 0 rgba(220,238,255,.04)!important;
    }
    #shop .product .pimg img{display:none!important}
    #shop .product .pimg .rws-rp-icon{
      width:59px!important;height:59px!important;max-width:100%!important;
      color:#9dc6f2!important;stroke:currentColor!important;
      overflow:visible!important;display:block!important;
      background:transparent!important;opacity:1!important;
    }
    #shop .product .pimg[data-rws-icon-kind="coin"] .rws-rp-icon{color:#edcb85!important}
    #shop .product .pimg[data-rws-icon-kind="stat"] .rws-rp-icon{color:#a7d3ef!important}
    #shop .product .pimg[data-rws-icon-kind="skill"] .rws-rp-icon{color:#c4b7f6!important}
    #shop .product .pimg[data-rws-icon-kind="title"] .rws-rp-icon{color:#91d5df!important}
    #shop .product .pimg .rws-rp-icon text{stroke:none!important;fill:currentColor!important;font-family:system-ui,'Segoe UI',sans-serif;font-weight:800}
    /* Stronger than the v10.26 title sprite and v10.34 compact-mode rules. */
    #shop.shop-grid.compact .product .pimg{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important}
    @media(max-width:500px){#shop .product .pimg{width:86px!important;height:86px!important}#shop .product .pimg .rws-rp-icon{width:55px!important;height:55px!important}}
  `;
  function iconKind(name){
    if(name.includes('컬렉션 칭호 효과 증폭')){
      const tier=name.match(/\[([^\]]+)\]/)?.[1]?.trim()||'';
      return {kind:'title',code:TIER_KO[tier]||'normal'};
    }
    if(name.includes('스킬 최대 레벨')){
      return {kind:'skill',code:name.match(/\[\s*([^\]]+?)\s*\]/)?.[1]?.trim()||'SK'};
    }
    if(name.includes('경험치 획득'))return {kind:'main',code:'exp'};
    if(name.includes('환생코인'))return {kind:'coin',code:'rp'};
    if(name.includes('SP 증가'))return {kind:'main',code:'sp'};
    if(name.includes('명중'))return {kind:'main',code:'aim'};
    if(name.includes('STR'))return {kind:'stat',code:'str'};
    if(name.includes('DEX'))return {kind:'stat',code:'dex'};
    if(name.includes('INT'))return {kind:'stat',code:'int'};
    if(name.includes('LUK'))return {kind:'stat',code:'luk'};
    if(name.includes('회피율'))return {kind:'main',code:'evasion'};
    if(name.includes('패널티'))return {kind:'main',code:'penalty'};
    if(name.includes('메소'))return {kind:'coin',code:'meso'};
    if(name.includes('이동속도'))return {kind:'main',code:'move'};
    return {kind:'main',code:'generic'};
  }
  function svgBody(item){
    const code=item.code;
    if(item.kind==='skill'){
      const letters=String(code).replace(/[^A-Z]/g,'').slice(0,4)||'SK';
      const size=letters.length>2?'5.3':letters.length>1?'7.2':'10';
      return `<path d="M12 2.8 19 6.5v7.2c0 4.4-3 6.7-7 8-4-1.3-7-3.6-7-8V6.5Z"/><path d="M8.1 6.9h7.8" opacity=".5"/><text x="12" y="15.35" text-anchor="middle" font-size="${size}">${letters}</text>`;
    }
    if(item.kind==='title'){
      const letters=TIER_LABEL[code]||'T';
      const size=letters.length>1?'6.7':'9';
      return `<path d="M8.4 3.4 6.5 9l-2.3 3 4.5 2.6M15.6 3.4 17.5 9l2.3 3-4.5 2.6"/><circle cx="12" cy="12.5" r="6.5"/><path d="m8.7 18.2-1 3.2 4.3-1.5 4.3 1.5-1-3.2"/><text x="12" y="15.2" text-anchor="middle" font-size="${size}">${letters}</text>`;
    }
    return ICONS[code]||ICONS.generic;
  }
  function renderSVG(item){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('rws-rp-icon');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');
    svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.innerHTML=svgBody(item);
    return svg;
  }
  function upgradeCard(card){
    const name=card.querySelector('.pname')?.textContent?.trim()||'';
    const slot=card.querySelector('.pimg');
    if(!name||!slot)return false;
    const item=iconKind(name);
    const fingerprint=item.kind+':'+item.code;
    if(slot.dataset.rwsIcon===fingerprint&&slot.querySelector('.rws-rp-icon'))return false;
    slot.dataset.rwsIcon=fingerprint;
    slot.dataset.rwsIconKind=item.kind;
    slot.replaceChildren(renderSVG(item));
    slot.setAttribute('aria-label',name+' 아이콘');
    return true;
  }
  function upgrade(){
    const shop=document.getElementById('shop');
    if(!shop)return false;
    shop.querySelectorAll('.product').forEach(upgradeCard);
    return true;
  }
  function start(){
    if(!document.getElementById(STYLE.id))document.head.appendChild(STYLE);
    let watch=null;
    const timer=setInterval(()=>{
      const shop=document.getElementById('shop');
      if(!shop)return;
      if(watch&&watch.target===shop)return;
      if(watch)watch.disconnect();
      const observer=new MutationObserver(()=>upgrade());
      observer.observe(shop,{childList:true,subtree:true});
      watch=observer;watch.target=shop;
      upgrade();
    },350);
    window.addEventListener('beforeunload',()=>{clearInterval(timer);watch?.disconnect()},{once:true});
    console.info('[RWS v10.35] RP shop SVG icons enabled');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
