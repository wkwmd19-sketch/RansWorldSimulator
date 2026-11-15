/* RWS v11.02 - Pet traits become a first-class navigation tab. */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const nav=$("nav-exp"), expTab=$("tab-exp"), popup=$("petSimulatorModal");
  const target=window.showTab;
  if(!nav||!expTab||!popup||typeof target!=="function"||
     !$("petTraitList")||!window.__RWS1101_PET_READY__)
    throw Error("펫 특성 탭 전환에 필요한 요소를 찾지 못했습니다.");
  if($("tab-pet")||$("nav-pet"))return;

  const button=document.createElement("button");
  button.id="nav-pet";button.type="button";
  button.textContent="펫 특성";
  button.setAttribute("aria-controls","tab-pet");
  button.setAttribute("aria-selected","false");
  nav.parentNode.insertBefore(button,nav);

  const section=document.createElement("section");
  section.id="tab-pet";
  section.className="tab";
  section.innerHTML='<div class="section-title"><div><h2>펫 특성</h2><p>펫 단계별 특성 범위, 주사위별 등급 확률·비용을 확인하고 옵션을 시뮬레이션합니다.</p></div></div><div id="rwsPetInlineHost"></div>';
  expTab.parentNode.insertBefore(section,expTab);

  // Reuse the existing simulator node to retain locks, targets, roll history,
  // pet selection and auto-roll event handlers. No duplicate IDs are created.
  const host=$("rwsPetInlineHost");
  host.appendChild(popup);
  popup.classList.remove("pet-modal-backdrop","show");
  popup.classList.add("rws-pet-inline");
  popup.setAttribute("role","region");
  popup.removeAttribute("aria-modal");
  const close=$("petCloseBtn");
  if(close){close.hidden=true;close.setAttribute("aria-hidden","true");close.tabIndex=-1;}

  const style=document.createElement("style");
  style.id="rws1102PetTabStyles";
  style.textContent=`
    .nav{grid-template-columns:repeat(4,minmax(0,1fr))}
    .nav button{min-width:0;white-space:normal}
    #tab-pet .rws-pet-inline{display:block;position:static;inset:auto;padding:0;z-index:auto;background:transparent;backdrop-filter:none}
    #tab-pet .rws-pet-inline .pet-modal{box-sizing:border-box;max-width:100%;width:min(980px,100%);max-height:none;overflow:visible;margin:0 auto}
    #tab-pet #petCloseBtn{display:none!important}
    #tab-pet .pet-top{grid-template-columns:minmax(0,1fr) auto}
    #brandLogo{cursor:default}
    @media(max-width:600px){
      .nav{gap:4px;padding:5px}
      .nav button{padding:10px 5px;font-size:11px}
      #tab-pet .pet-top{grid-template-columns:1fr}
      #tab-pet .rws-pet-inline .pet-modal{padding:13px}
    }
  `;
  document.head.appendChild(style);

  const originalShow=target;
  window.showTab=function(name){
    if(name!=="pet"&&name!=="shop"&&name!=="exp"&&name!=="rebirth")return;
    const leavingPet=section.classList.contains("active")&&name!=="pet";
    // The original implementation closes the three existing tabs when name=pet.
    originalShow(name);
    section.classList.toggle("active",name==="pet");
    button.classList.toggle("active",name==="pet");
    button.setAttribute("aria-selected",name==="pet"?"true":"false");
    if(leavingPet&&typeof window.stopPetAuto==="function")window.stopPetAuto();
  };
  button.addEventListener("click",()=>window.showTab("pet"));

  window.__RWS1102_PET_TAB_READY__=true;
  window.RWS1102PetTab={
    open:()=>window.showTab("pet"),
    sectionId:"tab-pet",
    formerModalNowInline:popup.parentNode===host
  };
  console.info("[RWS v11.02] Pet simulator moved into main navigation.");
})();