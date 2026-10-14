(()=>{
  const VERSION='v10.25';
  const TRANSPARENT='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const defs=[
    ['title_normal','[노멀] 컬렉션 칭호 효과 증폭',true],
    ['title_magic','[매직] 컬렉션 칭호 효과 증폭',true],
    ['title_rare','[레어] 컬렉션 칭호 효과 증폭',true],
    ['title_epic','[에픽] 컬렉션 칭호 효과 증폭',true],
    ['title_unique','[유니크] 컬렉션 칭호 효과 증폭',true],
    ['title_legendary','[레전드리] 컬렉션 칭호 효과 증폭',true],
    ['title_imperial','[임페리얼] 컬렉션 칭호 효과 증폭',true],
    ['title_master','[마스터] 컬렉션 칭호 효과 증폭',true],
    ['title_arcane','[아케인] 컬렉션 칭호 효과 증폭',false],
    ['title_mystic','[미스틱] 컬렉션 칭호 효과 증폭',false],
    ['title_heaven','[헤븐] 컬렉션 칭호 효과 증폭',false],
    ['title_divine','[디바인] 컬렉션 칭호 효과 증폭',false],
    ['title_ultimate','[얼티밋] 컬렉션 칭호 효과 증폭',false],
    ['title_royal','[로얄] 컬렉션 칭호 효과 증폭',false],
    ['title_eternal','[이터널] 컬렉션 칭호 효과 증폭',false]
  ];

  async function loadSprite(){
    try{
      const r=await fetch('./title-sprite-v10.25.txt?v=10.25.1',{cache:'no-cache'});
      if(!r.ok)throw new Error('sprite '+r.status);
      return 'data:image/webp;base64,'+(await r.text()).trim();
    }catch(e){
      console.error('v10.25 title sprite load failed',e);
      return '';
    }
  }

  function setVersion(){
    const el=document.querySelector('.version');
    if(el)el.textContent=VERSION;
  }

  (async()=>{
    const sprite=await loadSprite();
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      let ready=false;
      try{
        ready=typeof products!=='undefined' && typeof pricing!=='undefined' && typeof PRODUCT_HELP!=='undefined' && typeof renderShop==='function';
      }catch(_){ready=false}
      if(!ready){
        setVersion();
        if(tries>500)clearInterval(wait);
        return;
      }
      clearInterval(wait);

      const prices=Array.from({length:150},(_,i)=>60000*(i+1));
      let changed=false;
      for(const [id,name] of defs){
        if(products.some(p=>p.id===id))continue;
        products.push({id,name,ticks:0,tick:1,suffix:'%',maxTicks:150,icon:TRANSPARENT,locked:false});
        pricing[id]={prices:[...prices],exact:150,method:'Lv.N 필요 RP = 60,000 × N (공차 60,000 RP)'};
        PRODUCT_HELP[id]='해당 등급의 칭호 효과 증폭';
        changed=true;
      }

      if(!document.getElementById('title-amplify-v1025-style')){
        const style=document.createElement('style');
        style.id='title-amplify-v1025-style';
        let css='';
        if(sprite){
          const pos=[[4,4],[-82,4],[-168,4],[-254,4],[4,-82],[-82,-82],[-168,-82],[-254,-82]];
          for(let i=0;i<8;i++){
            const child=25+i,[x,y]=pos[i];
            css+=`#shop .product:nth-child(${child}) .pimg{background-image:url("${sprite}");background-repeat:no-repeat;background-size:344px 172px;background-position:${x}px ${y}px}#shop .product:nth-child(${child}) .pimg img{opacity:0}`;
          }
        }
        css+='#shop .product:nth-child(n+33) .pimg{display:none}';
        style.textContent=css;
        document.head.appendChild(style);
      }

      if(changed)renderShop();
      setVersion();
      console.info('[RansWorldSimulator v10.25] 15 collection title amplification products loaded.');
    },60);

    // Older async patches may finish later, so keep the newest release label authoritative.
    let n=0;
    const finalizer=setInterval(()=>{setVersion();if(++n>=200)clearInterval(finalizer)},100);
  })();
})();
