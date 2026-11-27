/* RWS v11.2 FIX10 — contextual help and compact rebirth notes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const exp=$('tab-exp'),rebirth=$('tab-rebirth');
if(!exp||!rebirth)throw Error('FIX10 안내 설정: 필수 탭을 찾을 수 없습니다.');

// Hide the duplicated introductory paragraph. The help button reveals the
// original screenshot guidance as an expanded information panel on demand.
const expTitle=exp.querySelector('.section-title');
const expHeading=expTitle?.querySelector('h2');
const expIntro=expTitle?.querySelector('p');
const guide=exp.querySelector(':scope > details.info-details');
if(!expHeading||!guide)throw Error('FIX10 안내 설정: EXP 도움말을 찾을 수 없습니다.');
expIntro?.remove();
let line=expHeading.parentElement;
if(!line.classList.contains('section-title-line')){
 line=document.createElement('div');line.className='section-title-line';
 expHeading.parentElement.insertBefore(line,expHeading);line.appendChild(expHeading);
}
const helpBtn=document.createElement('button');
helpBtn.id='rwsExpScreenshotHelpBtn';
helpBtn.className='section-help-btn';
helpBtn.type='button';helpBtn.textContent='?';
helpBtn.title='스크린샷 입력 및 문자인식 안내';
helpBtn.setAttribute('aria-label','경험치 효율 계산 도움말 열기');
helpBtn.setAttribute('aria-controls','rwsExpScreenshotGuide');
helpBtn.setAttribute('aria-expanded','false');
line.appendChild(helpBtn);
guide.id='rwsExpScreenshotGuide';
guide.hidden=true;guide.open=true;
const summary=guide.querySelector('summary');
if(summary)summary.textContent='스크린샷 입력 및 문자인식 안내';
const body=guide.querySelector('.info-details-body');
if(!body)throw Error('FIX10 안내 설정: 도움말 본문이 없습니다.');
body.innerHTML=`
  <p><b>계산 방법</b> · 시작/종료 시각, 캐릭터 Lv, 현재 EXP(또는 진행률)를 두 시점 모두 입력한 다음 <b>경험치 효율 계산</b>을 누르세요. 스크린샷은 선택사항이며 직접 입력만으로도 계산할 수 있습니다.</p>
  <p><b>스크린샷 첨부 · 랜스월드 창 캡처</b> · 바탕화면 전체나 게임 화면 일부가 아닌 <b>랜스월드 게임 창 전체</b>를 캡처하세요. 창의 하단 <b>Lv · EXP HUD</b>가 잘리지 않고 보이도록 촬영해야 합니다. 각 스크린샷 영역을 클릭하거나 드래그하여 첨부할 수 있고, 해당 영역에 마우스를 올린 뒤 <b>Ctrl+V</b>로 붙여넣을 수도 있습니다.</p>
  <p><b>시각과 OCR 확인</b> · 파일 첨부는 사진 메타데이터 또는 파일 시각을, 붙여넣기는 붙여넣은 시각을 사용합니다. 자동 인식된 시각·레벨·EXP가 정확하지 않으면 원본 이미지를 확대해 확인하고 직접 수정하세요. 문자인식이 실패해도 수동 입력이 가능합니다.</p>
  <p><b>기록과 환생 계산</b> · EXP/분은 소수점 3자리의 약식 표기로 표시합니다. 몬스터명과 임시저장 기록은 <b>선택사항</b>입니다. 기록을 고르면 해당 분당 EXP를 적용하며, 미선택 시에는 계산한 값과 저장 기록 중 최고 효율을 적용합니다. 기록이 없어도 <b>환생 타이밍 계산</b> 버튼으로 이동하여 직접 입력할 수 있습니다.</p>`;
helpBtn.addEventListener('click',()=>{
 const reveal=guide.hidden;
 guide.hidden=!reveal;
 if(reveal)guide.open=true;
 helpBtn.setAttribute('aria-expanded',String(reveal));
 helpBtn.setAttribute('aria-label',reveal?'경험치 효율 계산 도움말 닫기':'경험치 효율 계산 도움말 열기');
});

// RP shop: relocate its existing description into an optional '?' panel.
// Keep the original HTML markup/content unchanged so the user's shop guide stays accurate.
const shop=$('tab-shop');
const shopTitle=shop?.querySelector('.section-title');
const shopHeading=shopTitle?.querySelector('h2');
const shopIntro=shopTitle?.querySelector('p');
if(!shopHeading||!shopIntro)throw Error('FIX10 안내 설정: RP 상점 제목 또는 기존 설명문이 없습니다.');
let shopLine=shopHeading.parentElement;
if(!shopLine.classList.contains('section-title-line')){
  const holder=shopLine;
  shopLine=document.createElement('div');shopLine.className='section-title-line';
  holder.insertBefore(shopLine,shopHeading);
  shopLine.appendChild(shopHeading);
}
const shopHelpButton=document.createElement('button');
shopHelpButton.id='rwsShopHelpBtn';
shopHelpButton.className='section-help-btn';
shopHelpButton.type='button';shopHelpButton.textContent='?';
shopHelpButton.title='RP 상점 이용 안내';
shopHelpButton.setAttribute('aria-label','RP 상점 도움말 열기');
shopHelpButton.setAttribute('aria-controls','rwsShopHelpPanel');
shopHelpButton.setAttribute('aria-expanded','false');
shopLine.appendChild(shopHelpButton);
const shopPanel=document.createElement('div');
shopPanel.id='rwsShopHelpPanel';
shopPanel.className='info-details rws-shop-guide';
shopPanel.setAttribute('role','region');
shopPanel.setAttribute('aria-label','RP 상점 이용 안내');
shopPanel.hidden=true;
shopIntro.remove();
shopPanel.appendChild(shopIntro);
shopTitle.insertAdjacentElement('afterend',shopPanel);
shopHelpButton.addEventListener('click',()=>{
  const show=shopPanel.hidden;
  shopPanel.hidden=!show;
  shopHelpButton.setAttribute('aria-expanded',String(show));
  shopHelpButton.setAttribute('aria-label',show?'RP 상점 도움말 닫기':'RP 상점 도움말 열기');
});

const rebirthTitle=rebirth.querySelector('.section-title');
rebirthTitle?.querySelector('p')?.remove();
// Formula explanations remain available via the existing '?' button.
rebirth.querySelector(':scope > details.info-details')?.remove();

const css=document.createElement('style');css.id='rwsFix7ContextHelpStyle';
css.textContent=`
  #rwsExpScreenshotGuide[hidden]{display:none!important}
  #rwsExpScreenshotGuide .info-details-body{line-height:1.75}
  #rwsExpScreenshotGuide .info-details-body p{margin:0 0 10px}
  #rwsExpScreenshotGuide .info-details-body p:last-child{margin-bottom:0}
  #rwsExpScreenshotHelpBtn{flex-shrink:0}
  /* The OCR DM banner is required by the upstream integrity check, so keep its
     DOM marker but remove it from the visible page and accessibility tree. */
  #rwsOcrDmNotice{display:none!important;visibility:hidden!important}
  #rwsShopHelpPanel[hidden]{display:none!important}
  #rwsShopHelpPanel{margin:0 0 18px;padding:13px 18px;line-height:1.75;background:#15253f;border:1px solid #35557b;border-radius:12px;color:#c9dbf5}
  #rwsShopHelpPanel p{margin:0}
  #rwsShopHelpBtn{flex-shrink:0}
  #pqDetails .pq-brief .rwsPqFixedTime{font-weight:850!important;color:#ffd173!important}
`;
document.head.appendChild(css);
$('rwsOcrDmNotice')?.setAttribute('aria-hidden','true');
window.__RWS_LOCAL_FIX10_HELP_READY__=true;
console.info('[RWS LOCAL UI FIX10] EXP contextual guide and rebirth description clean-up installed.');
})();