(()=>{
  const VERSION='v10.26.1';
  const TRANSPARENT='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const defs=[
    ['title_normal','[노멀] 컬렉션 칭호 효과 증폭'],
    ['title_magic','[매직] 컬렉션 칭호 효과 증폭'],
    ['title_rare','[레어] 컬렉션 칭호 효과 증폭'],
    ['title_epic','[에픽] 컬렉션 칭호 효과 증폭'],
    ['title_unique','[유니크] 컬렉션 칭호 효과 증폭'],
    ['title_legendary','[레전드리] 컬렉션 칭호 효과 증폭'],
    ['title_imperial','[임페리얼] 컬렉션 칭호 효과 증폭'],
    ['title_master','[마스터] 컬렉션 칭호 효과 증폭'],
    ['title_arcane','[아케인] 컬렉션 칭호 효과 증폭'],
    ['title_mystic','[미스틱] 컬렉션 칭호 효과 증폭'],
    ['title_heaven','[헤븐] 컬렉션 칭호 효과 증폭'],
    ['title_divine','[디바인] 컬렉션 칭호 효과 증폭'],
    ['title_ultimate','[얼티밋] 컬렉션 칭호 효과 증폭'],
    ['title_royal','[로얄] 컬렉션 칭호 효과 증폭'],
    ['title_eternal','[이터널] 컬렉션 칭호 효과 증폭']
  ];
  let sprite='';
  function setVersion(){const el=document.querySelector('.version');if(el)el.textContent=VERSION}
  async function loadSprite(){
    try{
      const parts=await Promise.all(Array.from({length:7},async(_,i)=>{
        const r=await fetch(`./title-sprite-v10.26-fixed.part${i+1}.txt?v=10.26.1`,{cache:'no-cache'});
        if(!r.ok)throw new Error(`sprite part ${i+1}: ${r.status}`);
        return (await r.text()).trim();
      }));
      return 'data:image/webp;base64,'+parts.join('');
    }catch(e){console.error('v10.26.1 title sprite load failed',e);return ''}
  }
  function applyProducts(){
    try{
      if(typeof products==='undefined'||typeof pricing==='undefined'||typeof PRODUCT_HELP==='undefined'||typeof renderShop!=='function')return false;
      const prices=Array.from({length:150},(_,i)=>60000*(i+1));
      for(const [id,name] of defs){
        let p=products.find(x=>x.id===id);
        if(!p){p={id,name,ticks:0,tick:1,suffix:'%',maxTicks:150,icon:TRANSPARENT,locked:false};products.push(p)}
        else{p.name=name;p.tick=1;p.suffix='%';p.maxTicks=150;p.icon=TRANSPARENT;p.ticks=Math.max(0,Math.min(150,Number(p.ticks)||0))}
        pricing[id]={prices:[...prices],exact:150,method:'Lv.N 필요 RP = 60,000 × N (공차 60,000 RP)'};
        PRODUCT_HELP[id]='해당 등급의 칭호 효과 증폭';
      }
      renderShop();return true;
    }catch(e){console.error('v10.26.1 title products patch failed',e);return false}
  }
  function installStyles(){
    ['title-amplify-v1025-style','title-amplify-v1026-style','title-amplify-v10261-style'].forEach(id=>document.getElementById(id)?.remove());
    const style=document.createElement('style');style.id='title-amplify-v10261-style';let css='';
    for(let i=0;i<15;i++){
      const child=25+i,col=i%4,row=Math.floor(i/4),x=-(col*96),y=-(row*96);
      css+=`#shop .product:nth-child(${child}) .pimg{width:96px;height:96px;margin:4px auto;display:grid;place-items:center;background-image:url("${sprite}");background-repeat:no-repeat;background-size:384px 384px;background-position:${x}px ${y}px;background-origin:border-box;background-clip:border-box}`;
      css+=`#shop .product:nth-child(${child}) .pimg img{opacity:0;width:1px;height:1px}`;
    }
    style.textContent=css;document.head.appendChild(style);
  }
  (async()=>{
    sprite=await loadSprite();let tries=0;
    const timer=setInterval(()=>{tries++;setVersion();if(applyProducts()){clearInterval(timer);if(sprite)installStyles();else console.error('v10.26.1 sprite unavailable');setVersion();console.info('[RansWorldSimulator v10.26.1] title icons loaded')}else if(tries>500){clearInterval(timer);console.error('v10.26.1 title patch timed out.')}},60);
    let n=0;const finalizer=setInterval(()=>{setVersion();if(++n>=200)clearInterval(finalizer)},100);
  })();
})();
