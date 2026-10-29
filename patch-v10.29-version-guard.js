(function RWSVersionGuard1029(){
  const INSTALLED="10.32";
  const PUBLIC_VERSION="v"+INSTALLED;
  const manifestUrl="./release.json";
  const storageKey="rws-latest-version-dismissed";
  const uiId="rws-version-notice";
  let checking=false,seenLatest="",noticeOpen=false,lastCheck=0;
  const $=id=>document.getElementById(id);
  function parts(s){
    const match=String(s||"").replace(/^v/i,"").match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
    return match?[+match[1],+match[2],+(match[3]||0)]:null;
  }
  function compare(a,b){
    const x=parts(a),y=parts(b);
    if(!x||!y)return null;
    for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;
    return 0;
  }
  function freshUrl(targetVersion){
    const u=new URL(window.location.href);
    u.searchParams.set("rws_latest",""+(targetVersion||INSTALLED));
    u.searchParams.set("rws_cache",Date.now().toString()+"-"+Math.random().toString(36).slice(2,7));
    return u.href;
  }
  async function readRelease(){
    const nonce=Date.now()+"-"+Math.random().toString(36).slice(2);
    const r=await fetch(manifestUrl+"?t="+nonce,{cache:"no-store",credentials:"same-origin"});
    if(!r.ok)throw new Error("release manifest "+r.status);
    const data=await r.json();
    if(!data||!parts(data.version))throw new Error("manifest version invalid");
    return data;
  }
  function upgradeHistory(){
    const badge=document.querySelector(".version");
    if(badge&&compare(INSTALLED,badge.textContent)>=0){
      badge.textContent=PUBLIC_VERSION;
      badge.title="업데이트 내역";
    }
    const log=$("changelogModal");
    const list=log?.querySelector(".changelog-body");
    if(list&&!list.querySelector('[data-update-version="v10.29"]')){
      const entry=document.createElement("section");
      entry.dataset.updateVersion="v10.29";
      const heading=document.createElement("b");
      heading.className="changelog-ver";heading.textContent=PUBLIC_VERSION;
      const p=document.createElement("p");
      p.textContent="접속 시 최신 배포 버전 확인 및 캐시 우회 로딩 적용. 새 버전이 감지되면 자동 새로고침 또는 업데이트 안내 팝업을 표시합니다. 기존 기능과 버전별 변경내역은 유지.";
      entry.append(heading,p);list.prepend(entry);
      const caption=log.querySelector(".changelog-head p");
      if(caption)caption.textContent="주요 기능과 변경사항 요약 · "+PUBLIC_VERSION;
    }
  }
  function setupNotice(){
    if($(uiId))return;
    const styles=document.createElement("style");
    styles.id="rws-version-notice-style";
    styles.textContent=`
      #${uiId}{position:fixed;inset:0;z-index:2500;display:none;place-items:center;background:rgba(3,7,18,.79);padding:20px;backdrop-filter:blur(8px)}
      #${uiId}.show{display:grid}
      #${uiId} .rws-update-card{width:min(470px,100%);border:1px solid #45678f;border-radius:17px;background:linear-gradient(180deg,#203553,#12223a);padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.6)}
      #${uiId} h3{font-size:20px;margin:0 0 9px;color:#f3f8ff}
      #${uiId} p{font-size:12px;color:#c0d3ec;line-height:1.7;margin:0 0 10px}
      #${uiId} .rws-update-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:18px}
      #${uiId} button{border:1px solid #4b6994;border-radius:10px;background:#1d3454;color:#e1efff;padding:10px 14px;font-size:12px;font-weight:800;cursor:pointer}
      #${uiId} .rws-update-primary{background:#2c77cb;border-color:#69a9ee;color:white}
    `;
    document.head.appendChild(styles);
    const n=document.createElement("div");
    n.id=uiId;
    n.setAttribute("role","dialog");n.setAttribute("aria-modal","true");
    n.setAttribute("aria-labelledby","rws-update-title");
    n.setAttribute("aria-hidden","true");
    n.innerHTML=`<div class="rws-update-card">
      <h3 id="rws-update-title">RWS 새 버전 업데이트</h3>
      <p id="rws-update-message">새 버전이 확인되었습니다.</p>
      <p>현재 작업 중인 입력값이 있다면 새로고침 전에 확인해 주세요.</p>
      <div class="rws-update-actions">
        <button type="button" id="rws-update-later">나중에</button>
        <button type="button" id="rws-update-now" class="rws-update-primary">최신 버전으로 새로고침</button>
      </div>
    </div>`;
    document.body.appendChild(n);
    $("rws-update-now").addEventListener("click",()=>window.location.replace(freshUrl(seenLatest)));
    $("rws-update-later").addEventListener("click",()=>{
      try{sessionStorage.setItem(storageKey,seenLatest);}catch(_){}
      closeNotice();
    });
    n.addEventListener("click",e=>{if(e.target===n)closeNotice();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&noticeOpen)closeNotice();});
  }
  function closeNotice(){
    const n=$(uiId);if(!n)return;
    noticeOpen=false;n.classList.remove("show");n.setAttribute("aria-hidden","true");
  }
  function showNotice(latest){
    if(!$(uiId))setupNotice();
    seenLatest=latest;
    $("rws-update-message").textContent="현재 접속 버전 "+PUBLIC_VERSION+"보다 최신인 v"+latest+"이(가) 배포되었습니다.";
    const n=$(uiId);n.classList.add("show");n.setAttribute("aria-hidden","false");noticeOpen=true;
    $("rws-update-now").focus();
  }
  async function checkRelease(force){
    if(checking||document.visibilityState==="hidden")return;
    const now=Date.now();
    if(!force&&now-lastCheck<60000)return;
    lastCheck=now;checking=true;
    try{
      const data=await readRelease();
      if(compare(data.version,INSTALLED)>0){
        if(!noticeOpen){
          const dismissed=(()=>{try{return sessionStorage.getItem(storageKey)===data.version}catch(_){return false}})();
          if(!dismissed)showNotice(data.version);
        }
      }else upgradeHistory();
    }catch(err){
      // Do not interrupt the calculator when the network is unavailable.
      console.debug("[RWS] latest-version check unavailable:",err?.message||err);
    }finally{checking=false;}
  }
  let tries=0;
  const init=setInterval(()=>{
    tries++;
    if(!$("tab-rebirth")||!document.querySelector(".version")){if(tries>500)clearInterval(init);return;}
    clearInterval(init);
    upgradeHistory();
    setupNotice();
    checkRelease(true);
    window.addEventListener("focus",()=>checkRelease(false));
    window.addEventListener("pageshow",()=>checkRelease(false));
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkRelease(false);});
    setInterval(()=>checkRelease(false),180000);
    console.info("[RWS] v10.29 update check enabled");
  },60);
})();
