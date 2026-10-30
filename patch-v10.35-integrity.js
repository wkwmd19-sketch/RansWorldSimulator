/* RWS v10.35 · canonical version indicator, integrity check, immutable update navigation. */
(function(){
  "use strict";
  const CURRENT="10.35", LABEL="v"+CURRENT, ROOT="./";
  const $=id=>document.getElementById(id);
  const parse=v=>{const m=String(v||"").replace(/^v/i,"").match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);return m?[+m[1],+m[2],+(m[3]||0)]:null};
  const cmp=(a,b)=>{const x=parse(a),y=parse(b);if(!x||!y)return 0;for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]-y[i]}return 0};
  const safeEntry=(name,version)=>{
    const expected="app-v"+version+".html";
    return name===expected&&/^app-v\d+\.\d+(?:\.\d+)?\.html$/.test(name)?name:expected;
  };
  function enforce(){
    const badge=document.querySelector(".header-meta .version");
    if(badge&&badge.textContent.trim()!==LABEL){badge.textContent=LABEL;badge.title="업데이트 내역";}
    return !!badge;
  }
  let bound=false;
  function bindBadge(){
    const header=document.querySelector(".header-meta");
    if(!header||bound)return false;
    bound=true;
    const observer=new MutationObserver(()=>enforce());
    observer.observe(header,{childList:true,subtree:true,characterData:true});
    enforce();return true;
  }
  function integrity(){
    const required=["tab-shop","tab-exp","tab-rebirth","mlModal","mlRegion","rpTableBackdrop",
      "changelogModal","viewModeBtn","rbStartDate","rbStartTime","rwsMonsterRegionRange","rwsOcrDmNotice"];
    const missing=required.filter(id=>!$(id));
    const cards=Array.from(document.querySelectorAll("#shop .product"));
    if(cards.length!==39||cards.some(card=>!card.querySelector(".pimg svg.rws-rp-icon")))missing.push("RP 상품 벡터 아이콘(39종)");
    const history=$("changelogModal")?.querySelector(".changelog-body");
    if(!history?.querySelector('[data-rws-v6-history="v10.35"]'))missing.push("v10.35 변경내역");
    if(!$("ocrLogA")||!$("ocrLogB"))missing.push("OCR 로그");
    return missing;
  }
  function errorBanner(missing){
    if($("rwsBootHealth"))return;
    const panel=document.createElement("div");
    panel.id="rwsBootHealth";
    panel.style.cssText="position:fixed;left:10px;right:10px;bottom:10px;z-index:2850;max-width:700px;margin:auto;background:#2b2030;border:1px solid #ba7892;border-radius:10px;padding:12px 14px;color:#fff0f3;font:12px/1.6 system-ui,sans-serif;box-shadow:0 8px 35px #0009";
    const message=document.createElement("span");
    message.textContent="일부 기능을 불러오지 못했습니다 ("+missing.join(", ")+"). 프로그램을 계속 사용하기 전에 아래 버튼으로 최신 페이지를 다시 열어주세요.";
    const button=document.createElement("button");button.type="button";
    button.textContent="v10.35 페이지 다시 열기";
    button.style.cssText="display:block;margin-top:8px;padding:8px 12px;border:1px solid #8baae0;border-radius:8px;background:#264a76;color:#fff;cursor:pointer";
    button.onclick=()=>{const u=new URL("./app-v10.35.html",location.href);u.searchParams.set("reload",Date.now().toString());location.assign(u.href)};
    panel.append(message,button);document.body.appendChild(panel);
  }
  let ready=false,tries=0;
  const init=setInterval(()=>{
    tries++;
    bindBadge();enforce();
    const missing=integrity();
    if(!missing.length){
      ready=true;window.__RWS35_READY__=true;window.__rwsLocalVerified=true;
      $("rwsStaleNotice")?.remove();$("rwsBootHealth")?.remove();
      clearInterval(init);console.info("[RWS v10.35] All application modules ready");
    }else if(tries>=240){clearInterval(init);errorBanner(missing);console.error("[RWS v10.35] Incomplete application modules:",missing)}
  },100);
  let latestSeen=CURRENT,checking=false;
  async function versionFrom(url){
    const c=new AbortController(),timeout=setTimeout(()=>c.abort(),4000);
    try{
      const r=await fetch(url+(url.includes("?")?"&":"?")+"check="+Date.now(),{cache:"no-store",signal:c.signal,redirect:"follow"});
      if(!r.ok)return null;
      const data=await r.json();
      if(!parse(data?.version))return null;
      return {version:data.version,entry:safeEntry(data.entry,data.version)};
    }catch(e){return null}finally{clearTimeout(timeout)}
  }
  async function checkForNewRelease(){
    if(checking||document.visibilityState==="hidden")return;
    checking=true;
    try{
      const sources=await Promise.all([
        versionFrom(ROOT+"release.json"),
        versionFrom("https://raw.githubusercontent.com/wkwmd19-sketch/RansWorldSimulator/main/release.json")
      ]);
      const valid=sources.filter(Boolean).sort((a,b)=>cmp(b.version,a.version));
      const latest=valid[0];
      if(!latest||cmp(latest.version,CURRENT)<=0||cmp(latest.version,latestSeen)<=0)return;
      latestSeen=latest.version;
      const overlay=document.createElement("div");overlay.id="rwsNewVersion34";
      overlay.style.cssText="position:fixed;inset:0;z-index:3800;display:grid;place-items:center;padding:20px;background:#030a18cf";
      overlay.innerHTML='<div style="max-width:440px;width:100%;border:1px solid #5e83b6;border-radius:16px;padding:22px;background:#152641;color:#e7f1ff;font:14px/1.65 system-ui,sans-serif"><h3 style="margin:0 0 8px;font-size:19px">새 버전이 준비됐습니다.</h3><p id="rwsNewVersionText"></p><div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap"><button id="rwsLater34" type="button">나중에</button><button id="rwsOpenNew34" type="button" style="background:#285b96;color:white">새 버전 열기</button></div></div>';
      document.body.appendChild(overlay);
      const buttonStyle="border:1px solid #5278a4;border-radius:9px;padding:9px 12px;background:#1d3454;color:#dceaff;font-weight:750;cursor:pointer";
      $("rwsLater34").style.cssText=buttonStyle;
      $("rwsOpenNew34").style.cssText+=";"+buttonStyle+";background:#285b96";
      $("rwsNewVersionText").textContent="현재 v"+CURRENT+" · 새 버전 v"+latest.version+" — 새 버전의 독립 주소를 열어 캐시 충돌을 피합니다.";
      $("rwsLater34").onclick=()=>overlay.remove();
      $("rwsOpenNew34").onclick=()=>{
        const u=new URL(ROOT+latest.entry,location.href);
        u.searchParams.set("update",Date.now().toString());
        location.assign(u.href);
      };
    }finally{checking=false}
  }
  window.addEventListener("focus",checkForNewRelease);
  window.addEventListener("pageshow",checkForNewRelease);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkForNewRelease()});
  setInterval(checkForNewRelease,180000);
  setTimeout(checkForNewRelease,3500);
})();