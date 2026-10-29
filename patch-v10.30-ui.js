(function installRWS1030UI(){
  const version="v10.30";
  if(!document.getElementById("rws-1030-close-style")){
    const style=document.createElement("style");
    style.id="rws-1030-close-style";
    style.textContent=`
      /* All close-X buttons: horizontal and vertical centering */
      :where(.pet-close,.formula-modal-close,.version-egg-close,.rp-table-close,
        #changelogClose,#versionEggClose,#petCloseBtn,#rebirthFormulaCloseBtn,#rpTableClose,
        button[aria-label="닫기"],button[aria-label="업데이트 내역 닫기"]){
        display:inline-grid!important;
        place-items:center!important;
        align-items:center!important;
        justify-items:center!important;
        padding:0!important;
        text-align:center!important;
        line-height:1!important;
        font-family:Arial,system-ui,sans-serif!important;
        box-sizing:border-box!important;
      }
    `;
    document.head.appendChild(style);
  }
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    const badge=document.querySelector(".version");
    const history=document.getElementById("changelogModal")?.querySelector(".changelog-body");
    if(badge){
      badge.textContent=version;
      badge.title="업데이트 내역";
    }
    if(history){
      if(!history.querySelector('[data-update-version="v10.30"]')){
        const entry=document.createElement("section");
        entry.dataset.updateVersion=version;
        const heading=document.createElement("b");
        heading.className="changelog-ver";heading.textContent=version;
        const details=document.createElement("p");
        details.textContent="환생코인획득표에서 보너스 0~500% 직접 입력 지원(기본 MAX). MAX 적용 시 MAX RP만 표시하고, 그 외에는 현재 보너스 RP와 MAX RP 비교 표시. 사이트의 닫기(X) 버튼 중앙정렬 개선.";
        entry.append(heading,details);
        history.prepend(entry);
      }
      const title=document.getElementById("changelogModal").querySelector(".changelog-head p");
      if(title)title.textContent="주요 기능과 변경사항 요약 · "+version;
    }
    if(badge&&history){clearInterval(timer);return;}
    if(tries>=200)clearInterval(timer);
  },60);
})();
