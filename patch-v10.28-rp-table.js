(function rwsRpTablePatch(){
  const VERSION="v10.28";
  const MIN=30,MAX=350,PAGE_SIZE=20;
  const format=new Intl.NumberFormat("ko-KR",{maximumFractionDigits:0});
  const $=id=>document.getElementById(id);
  let page=1,from=251,to=300,exact=null,previousOverflow="",lastFocus=null,bonusPct=500;
  let initialized=false;
  const presets=[[30,350,"전체"],[30,100,"30~100"],[101,200,"101~200"],[201,250,"201~250"],[251,300,"251~300"],[301,350,"301~350"]];

  function getBonus(){
  return {bonus:bonusPct,multiplier:1+bonusPct/100,isMax:bonusPct===500};
}
  function addStyles(){
    if($("rp-table-style"))return;
    const style=document.createElement("style");style.id="rp-table-style";
    style.textContent=`
      #tab-rebirth>.section-title{flex-wrap:wrap}
      .rp-table-open{flex-shrink:0;white-space:nowrap;align-self:flex-start;display:inline-flex;align-items:center;gap:7px;border-color:#426b9c;background:#162d4c;color:#d7eeff;font-size:12px}
      .rp-table-open:hover{background:#24436b;border-color:#69a0d9}
      .rp-table-backdrop{position:fixed;inset:0;z-index:1900;display:none;place-items:center;padding:16px;background:rgba(3,8,17,.83);backdrop-filter:blur(7px)}
      .rp-table-backdrop.show{display:grid}
      .rp-table-dialog{width:min(850px,100%);max-height:min(90vh,860px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #3e577a;border-radius:18px;background:linear-gradient(180deg,#1a2943,#101a2d);box-shadow:0 28px 90px rgba(0,0,0,.58)}
      .rp-table-header{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:18px 20px 12px;border-bottom:1px solid #2f4363}
      .rp-table-header h3{margin:0;font-size:20px;color:#eaf4ff}
      .rp-table-header p{font-size:11px;margin:7px 0 0;color:#a3b7d3;line-height:1.55}
      .rp-table-close{height:34px;width:34px;flex:0 0 34px;display:grid;place-items:center;padding:0;border:1px solid #47638b;border-radius:9px;background:#14233a;color:#e8f3ff;font-size:23px;line-height:1;cursor:pointer}
      .rp-table-controls{padding:13px 20px 12px;border-bottom:1px solid #2c3e5c;display:flex;flex-direction:column;gap:11px}
      .rp-table-bonus-settings{display:flex;gap:10px;align-items:end;flex-wrap:wrap;background:#14253e;border:1px solid #345174;padding:10px 12px;border-radius:10px}
      .rp-table-bonus-settings label{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:800;color:#d5e6ff;flex-wrap:wrap}
      .rp-table-bonus-settings input{width:102px;min-width:76px;border:1px solid #5b82b5;border-radius:8px;background:#0c1b31;color:#f3f9ff;font-size:14px;font-weight:750;padding:8px 9px}
      .rp-table-bonus-settings input:focus{outline:2px solid #477cb8;outline-offset:2px}
      .rp-table-bonus-settings button{border:1px solid #9f8138;background:#3f3419;color:#ffe5a1;border-radius:8px;padding:8px 11px;font-weight:850;font-size:11px;cursor:pointer}
      .rp-table-bonus-help{color:#91acca;font-size:11px;line-height:1.45}
      .rp-table-values.only-max{min-width:280px}
      .rp-table-presets{display:flex;flex-wrap:wrap;gap:6px}
      .rp-table-presets button{border:1px solid #334967;border-radius:9px;background:#172743;color:#c6d9f1;padding:7px 10px;font-size:11px;font-weight:750;cursor:pointer}
      .rp-table-presets button[aria-pressed="true"]{border-color:#518bd1;background:#255080;color:#fff}
      .rp-table-inputs{display:grid;grid-template-columns:minmax(90px,1fr) minmax(90px,1fr) minmax(130px,1.3fr) auto auto;gap:8px;align-items:end}
      .rp-table-inputs label{display:flex;flex-direction:column;gap:5px;color:#9eb4d3;font-size:11px;font-weight:700}
      .rp-table-inputs input{min-width:0;width:100%;border-radius:9px;border:1px solid #3c557a;background:#101d32;color:#eaf5ff;padding:9px 10px;font-size:13px;outline:none}
      .rp-table-inputs input:focus{border-color:#7cbcff;box-shadow:0 0 0 2px rgba(94,168,255,.15)}
      .rp-table-action{white-space:nowrap;border-radius:9px;padding:9px 12px;border:1px solid #3a5680;color:#e9f3ff;background:#172a46;font-weight:780;font-size:12px;cursor:pointer}
      .rp-table-action.primary{border-color:#477fbb;background:#25568a}
      .rp-table-action:disabled{opacity:.35;cursor:default}
      .rp-table-error{color:#ffadba;font-size:11px;min-height:0}
      .rp-table-summary{padding:10px 20px;display:flex;gap:9px;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:11px;color:#a4bad9}
      .rp-table-summary strong{color:#d7eeff}
      .rp-table-scroll{overflow:auto;min-height:0;flex:1;margin:0 20px;border:1px solid #2b4162;border-radius:10px;background:#101b2f}
      .rp-table-values{border-collapse:collapse;width:100%;min-width:560px;font-size:12px;font-variant-numeric:tabular-nums}
      .rp-table-values th{position:sticky;top:0;z-index:2;background:#203452;color:#bcdcff;padding:11px 12px;text-align:right;white-space:nowrap;border-bottom:1px solid #486080}
      .rp-table-values th:first-child,.rp-table-values td:first-child{text-align:center}
      .rp-table-values td{padding:10px 12px;border-bottom:1px solid #263754;text-align:right;color:#dae7fa}
      .rp-table-values tbody tr:nth-child(even){background:rgba(90,132,185,.06)}
      .rp-table-values tbody tr:hover{background:#213959}
      .rp-table-values td:first-child{font-weight:850;color:#b5d8ff}
      .rp-table-values td:last-child{font-weight:800;color:#ffdf95}
      .rp-table-empty{text-align:center!important;padding:30px!important;color:#aabdd6!important;font-weight:500!important}
      .rp-table-footer{padding:11px 20px 16px;border-top:1px solid #2d405c;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
      .rp-table-page{display:flex;align-items:center;gap:8px;color:#b1c7e6;font-size:11px}
      .rp-table-note{color:#91a7c6;font-size:10px;line-height:1.6;flex:1;min-width:200px}
      @media(max-width:690px){
        .rp-table-inputs{grid-template-columns:repeat(3,minmax(0,1fr))}
        .rp-table-inputs .rp-table-action{grid-column:span 1}
      }
      @media(max-width:430px){
        .rp-table-backdrop{padding:8px}
        .rp-table-header{padding:13px}
        .rp-table-controls{padding:10px 13px}
        .rp-table-summary{padding:9px 13px}
        .rp-table-scroll{margin:0 13px}
        .rp-table-footer{padding:11px 13px}
        .rp-table-inputs{grid-template-columns:repeat(2,minmax(0,1fr))}
        .rp-table-inputs label:nth-child(3){grid-column:span 2}
        .rp-table-header h3{font-size:17px}
      }
    `;
    document.head.appendChild(style);
  }
  function createUI(){
    const section=$("tab-rebirth")?.querySelector(".section-title");
    if(!section)return false;
    addStyles();
    if(!$("rpTableOpen")){
      const button=document.createElement("button");
      button.id="rpTableOpen";button.type="button";button.className="btn rp-table-open";
      button.textContent="환생코인획득표";button.setAttribute("aria-haspopup","dialog");
      section.appendChild(button);
      button.addEventListener("click",open);
    }
    if(!$("rpTableBackdrop")){
      const overlay=document.createElement("div");
      overlay.id="rpTableBackdrop";overlay.className="rp-table-backdrop";
      overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
      overlay.setAttribute("aria-labelledby","rpTableTitle");overlay.setAttribute("aria-hidden","true");
      overlay.innerHTML=`
        <div class="rp-table-dialog">
          <div class="rp-table-header">
            <div>
              <h3 id="rpTableTitle">환생코인 획득표 <span style="color:#8bbffa;font-size:12px">Lv.30~350</span></h3>
              <p>각 레벨에서 환생할 때 받는 RP · 보너스 500%는 MAX이며, 낮은 수치에서는 MAX와 비교</p>
            </div>
            <button type="button" id="rpTableClose" class="rp-table-close" aria-label="닫기">×</button>
          </div>
          <div class="rp-table-controls">
            <div class="rp-table-bonus-settings">
              <label for="rpTableBonusInput">환생코인 보너스 (%) <input id="rpTableBonusInput" type="number" min="0" max="500" step="0.01" value="500" inputmode="decimal" aria-label="환생코인 획득량 보너스 퍼센트"></label>
              <button id="rpTableBonusMax" type="button">MAX 500%</button>
              <span class="rp-table-bonus-help">0~500% 입력 · 기본값 +500% MAX</span>
            </div>
            <div id="rpTablePresets" class="rp-table-presets" role="group" aria-label="레벨 구간 빠른 선택">
              ${presets.map(x=>`<button type="button" data-from="${x[0]}" data-to="${x[1]}" aria-pressed="false">${x[2]}</button>`).join("")}
            </div>
            <div class="rp-table-inputs">
              <label>시작 Lv<input id="rpTableFrom" type="number" min="30" max="350" step="1" value="251"></label>
              <label>끝 Lv<input id="rpTableTo" type="number" min="30" max="350" step="1" value="300"></label>
              <label>특정 레벨 검색<input id="rpTableExact" type="number" min="30" max="350" step="1" placeholder="예: 307"></label>
              <button id="rpTableApply" type="button" class="rp-table-action primary">조회</button>
              <button id="rpTableClear" type="button" class="rp-table-action">초기화</button>
            </div>
            <div id="rpTableError" class="rp-table-error" role="status"></div>
          </div>
          <div class="rp-table-summary"><strong id="rpTableResultCount">-</strong><span id="rpTableBonus">-</span></div>
          <div class="rp-table-scroll" tabindex="0" aria-label="환생코인 획득량 목록">
            <table class="rp-table-values">
              <thead><tr id="rpTableHeadRow"><th scope="col">레벨</th><th scope="col">MAX RP (+500%)</th></tr></thead>
              <tbody id="rpTableBody"></tbody>
            </table>
          </div>
          <div class="rp-table-footer">
            <div class="rp-table-note">환생코인 보너스는 이 팝업에서만 적용 · 검색 레벨은 구간보다 우선 적용 · 20개씩 표시</div>
            <div class="rp-table-page">
              <button id="rpTablePrev" type="button" class="rp-table-action">이전</button>
              <span id="rpTablePageInfo">1 / 1</span>
              <button id="rpTableNext" type="button" class="rp-table-action">다음</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      $("rpTableClose").addEventListener("click",close);
      overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
      $("rpTableApply").addEventListener("click",applyInputs);
      $("rpTableBonusInput").addEventListener("input",applyBonus);
      $("rpTableBonusInput").addEventListener("change",applyBonus);
      $("rpTableBonusMax").addEventListener("click",()=>{
        $("rpTableBonusInput").value="500";applyBonus();
      });
      $("rpTableClear").addEventListener("click",()=>setRange(251,300));
      for(const inp of ["rpTableFrom","rpTableTo","rpTableExact"]){
        $(inp).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyInputs();}});
      }
      $("rpTablePresets").addEventListener("click",e=>{
        const el=e.target.closest("button[data-from]");if(!el)return;
        setRange(Number(el.dataset.from),Number(el.dataset.to));
      });
      $("rpTablePrev").addEventListener("click",()=>{page--;render();});
      $("rpTableNext").addEventListener("click",()=>{page++;render();});
      document.addEventListener("keydown",e=>{
        if(!$("rpTableBackdrop")?.classList.contains("show"))return;
        if(e.key==="Escape"){e.preventDefault();close();}
        if(e.key==="Tab"){
          const focusable=[...$("rpTableBackdrop").querySelectorAll("button:not(:disabled),input:not(:disabled),[tabindex='0']")];
          if(focusable.length){
            const first=focusable[0],last=focusable[focusable.length-1];
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
            else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
          }
        }
      });
    }
    return true;
  }
  function applyBonus(){
  const input=$("rpTableBonusInput");
  const value=String(input.value).trim(),n=Number(value);
  if(!value||!Number.isFinite(n)||n<0||n>500){
    input.setAttribute("aria-invalid","true");
    $("rpTableError").textContent="환생코인 보너스는 0~500% 사이로 입력해 주세요.";
    return false;
  }
  input.removeAttribute("aria-invalid");
  bonusPct=n;
  $("rpTableError").textContent="";
  page=1;
  render();
  return true;
}
  function setRange(a,b){
    from=a;to=b;exact=null;page=1;
    $("rpTableFrom").value=a;$("rpTableTo").value=b;$("rpTableExact").value="";
    $("rpTableError").textContent="";
    render();
  }
  function applyInputs(){
    if(!applyBonus())return;
    const a=Number($("rpTableFrom").value),b=Number($("rpTableTo").value),query=$("rpTableExact").value.trim();
    const valid=n=>Number.isInteger(n)&&n>=MIN&&n<=MAX;
    if(!valid(a)||!valid(b)||a>b){
      $("rpTableError").textContent="시작·끝 레벨을 30~350 사이로 입력하고 시작 Lv이 끝 Lv 이하인지 확인해 주세요.";
      return;
    }
    if(query!==""&&!valid(Number(query))){
      $("rpTableError").textContent="검색 레벨은 30~350 사이의 정수로 입력해 주세요.";
      return;
    }
    from=a;to=b;exact=query!==""?Number(query):null;page=1;
    $("rpTableError").textContent="";
    render();
  }
  function render(){
  if(!$("rpTableBody"))return;
  const {bonus,multiplier,isMax}=getBonus();
  const pctText=bonus.toLocaleString("ko-KR",{maximumFractionDigits:2});
  const levels=exact!==null?[exact]:Array.from({length:to-from+1},(_,i)=>from+i);
  const rows=levels.map(lv=>({lv,base:Number(LEVEL_RP[lv])})).filter(x=>Number.isFinite(x.base)&&x.base>=0);
  const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
  page=Math.max(1,Math.min(page,pages));
  const visible=rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const headings=isMax
    ? '<th scope="col">레벨</th><th scope="col">MAX RP (+500%)</th>'
    : `<th scope="col">레벨</th><th scope="col">현재 RP (+${pctText}%)</th><th scope="col">MAX RP (+500%)</th>`;
  $("rpTableHeadRow").innerHTML=headings;
  $("rpTableBackdrop").querySelector(".rp-table-values").classList.toggle("only-max",isMax);
  $("rpTableBody").innerHTML=visible.length?visible.map(x=>{
    const max=format.format(Math.round(x.base*6));
    return isMax
      ? `<tr><td>Lv.${x.lv}</td><td>${max}</td></tr>`
      : `<tr><td>Lv.${x.lv}</td><td>${format.format(Math.round(x.base*multiplier))}</td><td>${max}</td></tr>`;
  }).join(""):`<tr><td class="rp-table-empty" colspan="${isMax?2:3}">해당 조건의 환생코인 데이터가 없습니다.</td></tr>`;
  $("rpTableResultCount").textContent=exact!==null?`Lv.${exact} 조회 · ${rows.length}개 결과`:`Lv.${from}~${to} · ${rows.length}개 레벨`;
  $("rpTableBonus").textContent=isMax
    ? "환코 보너스 MAX (+500%, ×6)"
    : `환코 보너스 +${pctText}% (×${multiplier.toLocaleString("ko-KR",{maximumFractionDigits:4})}) · MAX (+500%, ×6) 비교`;
  $("rpTablePageInfo").textContent=`${page} / ${pages}`;
  $("rpTablePrev").disabled=page<=1;$("rpTableNext").disabled=page>=pages;
  for(const el of $("rpTablePresets").querySelectorAll("button[data-from]")){
    const active=exact===null&&from===Number(el.dataset.from)&&to===Number(el.dataset.to);
    el.setAttribute("aria-pressed",active?"true":"false");
  }
  const scroll=$("rpTableBackdrop").querySelector(".rp-table-scroll");
  scroll.scrollTop=0;
}
  function open(){
    if(!initialized)return;
    lastFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
    $("rpTableBackdrop").classList.add("show");
    $("rpTableBackdrop").setAttribute("aria-hidden","false");
    render();$("rpTableClose").focus();
  }
  function close(){
    $("rpTableBackdrop").classList.remove("show");
    $("rpTableBackdrop").setAttribute("aria-hidden","true");
    document.body.style.overflow=previousOverflow;
    if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus();
  }
  function updateVersion(){
    const v=document.querySelector(".version");
    const match=String(v?.textContent||"").match(/^v(\d+)\.(\d+)(?:\.(\d+))?$/);
    const current=match?[Number(match[1]),Number(match[2]),Number(match[3]||0)]:null;
    const newer=!!current&&(current[0]>10||(current[0]===10&&(current[1]>28||(current[1]===28&&current[2]>0))));
    if(v&&!newer){v.textContent=VERSION;v.title="업데이트 내역";}
    const list=$("changelogModal")?.querySelector(".changelog-body");
    if(list&&!list.querySelector('[data-update-version="v10.28"]')){
      const entry=document.createElement("section");
      entry.dataset.updateVersion=VERSION;
      const title=document.createElement("b");
      title.className="changelog-ver";title.textContent=VERSION;
      const para=document.createElement("p");
      para.textContent="환생 타이밍 추천 탭에 환생코인획득표 추가. Lv.30~350 기본 RP / 현재 설정 RP / MAX (+500%) 비교, 레벨 구간 필터, 개별 레벨 검색, 20개씩 페이지 이동 지원.";
      entry.append(title,para);list.prepend(entry);
      const desc=$("changelogModal").querySelector(".changelog-head p");
      if(desc&&!newer)desc.textContent="주요 기능과 변경사항 요약 · v10.28";
    }
  }

  let attempts=0;
  const wait=setInterval(()=>{
    attempts++;
    let ready=false;
    try{
      ready=typeof LEVEL_RP!=="undefined"&&LEVEL_RP?.length>=351&&
        LEVEL_RP[251]===1292153&&LEVEL_RP[300]===19475660&&
        LEVEL_RP[301]===20566800&&LEVEL_RP[350]===298516214&&
        !!$("changelogModal")&&!!$("tab-rebirth");
    }catch(_){}
    if(ready){
      clearInterval(wait);
      initialized=createUI();
      if(initialized){updateVersion();console.info("[RansWorldSimulator v10.28] Rebirth RP lookup ready.")}
    }else if(attempts>=400){
      clearInterval(wait);console.error("RWS v10.28 RP table initialization timed out.");
    }
  },50);
})();
