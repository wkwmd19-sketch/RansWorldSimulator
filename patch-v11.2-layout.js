/* RWS v11.06 FIX10: placement, focused text cleanup, unified rebirth results. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const exp=$('tab-exp'),rebirth=$('tab-rebirth');
 if(!exp||!rebirth)throw Error('FIX10: 탭을 찾을 수 없습니다.');
 // Preserve the original EXP input-method field above the two screenshot cards.
 if(!$('expInputMode'))throw Error('v11.2: EXP 입력방식을 찾을 수 없습니다.');
 const monsterLabel=$('rwsLocalMonsterMetricCard')?.querySelector('.rlabel');
 if(monsterLabel)monsterLabel.textContent='사냥터 정보';
 // Keep date/time inputs, remove only D-1 ... D-7 quick-action bar.
 const labelForStart=rebirth.querySelector('#rbStart')?.closest('.field')?.querySelector('label');
 if(labelForStart)labelForStart.textContent='이번 환생 일자';
 const extraTopInfo=rebirth.querySelector('#rbStart')?.closest('.field')?.querySelector('.help');
 if(extraTopInfo)extraTopInfo.remove();
 const maxNote=$('rpGainMax')?.closest('.field')?.querySelector('.help');
 if(maxNote)maxNote.remove();
 // Visually hide the manual increase label, preserving an accessible input name.
 const bonus=$('rpGainPct');
 if(bonus && !$('rwsRpBonusPercent')){
   bonus.setAttribute('aria-label','환생코인 증가율 (%)');
   const oldLabel=bonus.closest('.field')?.querySelector('label');
   if(oldLabel)oldLabel.classList.add('rwsFix8HiddenIncreaseLabel');
   const wrap=document.createElement('div');wrap.id='rwsRpBonusPercent';
   bonus.parentElement.insertBefore(wrap,bonus);wrap.appendChild(bonus);
   const suffix=document.createElement('span');suffix.className='rwsRpPercentSuffix';
   suffix.textContent='%';suffix.setAttribute('aria-hidden','true');wrap.appendChild(suffix);
 }
 const maxLabel=$('maxLevelField')?.querySelector('label');
 if(maxLabel)maxLabel.textContent='추천 환생 레벨 범위';
 const quick=rebirth.querySelector('.date-quick > span');
 if(quick)quick.parentElement?.remove();
 rebirth.querySelectorAll('.date-quick').forEach(el=>el.remove());

 // Remove the now-unnecessary user-facing hints without altering time parsers,
 // calendar controls, or the screenshot capture buttons.
 exp.querySelectorAll('.calc-card .field.full .help').forEach(el=>{
   if(el.textContent.includes('2130')&&el.textContent.includes('10142130'))el.remove();
 });
 const start=$('rbStart')?.closest('.field');
 const startHint=start?.querySelector(':scope > .help');
 if(startHint)startHint.remove();
 rebirth.querySelectorAll('.rb-form > .help').forEach(el=>{
   if(el.textContent.includes('경험치 효율 계산의 결과를 적용하면'))el.remove();
 });
 document.querySelectorAll('#tab-exp .capture-hint').forEach(el=>el.remove());

 const style=document.createElement('style');style.id='rwsFix7LayoutStyle';
 style.textContent=`
  /* Input method now sits to the RIGHT of the main actions. */
  #tab-exp .actions:has(#rwsExpInputModeField){display:flex!important;flex-wrap:wrap!important;align-items:end!important;gap:10px!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;padding-left:0!important;padding-right:0!important;justify-content:flex-start!important;}
  #rwsExpInputModeField{display:flex!important;align-items:center!important;gap:10px!important;flex:0 0 325px!important;max-width:325px!important;min-width:255px!important;margin:0 0 0 auto!important;padding:0!important;box-sizing:border-box!important;align-self:flex-end!important;}
  #rwsExpInputModeField label{white-space:nowrap!important;margin:0!important;flex:0 0 auto!important;font-size:12px!important;}
  #rwsRpBonusPercent{position:relative;display:block;width:100%;}
  #rwsRpBonusPercent #rpGainPct{display:block;width:100%!important;max-width:none!important;box-sizing:border-box!important;padding-right:32px!important;}
  #rwsRpBonusPercent .rwsRpPercentSuffix{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:#b2cce9;font-size:14px;font-weight:850;}
  #rwsRpBonusPercent:has(#rpGainPct:disabled) .rwsRpPercentSuffix{color:#899cb6;opacity:.7}
  #tab-rebirth .rwsFix8HiddenIncreaseLabel{display:none!important}
  #tab-rebirth .date-quick{display:none!important}
  #rwsExpInputModeField select{min-width:0!important;height:47px!important;min-height:47px!important;margin:0!important;flex:1!important;width:auto!important;box-sizing:border-box!important;}
  @media(max-width:980px){#rwsExpInputModeField{flex:1 1 100%!important;max-width:100%!important;min-width:0!important;margin-left:0!important;}#tab-exp .actions:has(#rwsExpInputModeField){row-gap:10px!important}}
  /* Keep the upstream integrity marker in DOM, but remove (임시) from UI. */
  #mlTitle .rws-ml-temp{display:none!important;visibility:hidden!important}
  #tab-exp .capture-hint{display:none!important}
  #tab-exp .calc-card .field.full .help{display:none!important}
  #tab-rebirth .rb-form .field:has(#rbStart) > .help{display:none!important}
  /* Original ranking remains in DOM as a calculation output, but is not duplicated. */
  #tab-rebirth .rb-results > .rank-grid{display:none!important}
  #rwsRbCompareLocal{margin:0 0 13px!important;}
  #rwsRbCompareLocal .rbc-head{display:none!important}
  #rwsRbCompareLocal .rbc-lead{font-weight:700!important;font-size:13px!important;color:#cfe2ff!important;}
  #rwsRbCompareLocal .rbc-note{margin-top:13px!important}
  #rwsRbCompareLocal .rbc-card.rbc-first .rbc-label{color:#ffcf64!important;font-weight:900!important}
  #rwsRbCompareLocal .rbc-card.rbc-second .rbc-label{color:#d9e4f6!important;font-weight:900!important}
  #rwsRbCompareLocal .rbc-label{font-size:12px!important}
  #rwsRbCompareLocal .rbc-line{margin-top:4px!important}
  #rwsRbCompareLocal .rbc-card.rbc-second{background:#242941;border-color:#56658b}
  #rwsRecommendationDetails{margin:0 0 13px!important;padding:0;border:1px solid #334e70;border-radius:10px;background:#111e34;overflow:hidden}
  #rwsRecommendationDetails summary{cursor:pointer;color:#b4d3f6;font-size:12px;font-weight:700;padding:10px 13px;}
  #rwsRecommendationDetails[open] summary{border-bottom:1px solid #334e70}
  #rwsRecommendationDetails #precisionNote{margin:0!important;border:0!important;border-radius:0!important;}
 `;
 document.head.appendChild(style);

 let done=false;
 function organize(){
   if(done)return true;
   const rbc=$('rwsRbCompareLocal'),results=rebirth.querySelector('.rb-results');
   const rank=results?.querySelector(':scope > .rank-grid'),precision=$('precisionNote');
   if(!rbc||!results||!rank||!precision)return false;
   rank.insertAdjacentElement('beforebegin',rbc);
   const note=rbc.querySelector('.rbc-note');
   if(note)note.textContent='현 시점부터 경험치 습득량이 일정하다는 가정을 따릅니다.';
   const details=document.createElement('details');details.id='rwsRecommendationDetails';
   const summary=document.createElement('summary');summary.textContent='추천 계산 세부 정보';
   precision.parentElement.insertBefore(details,precision);
   details.append(summary,precision);
   done=true;
   window.__RWS_LOCAL_FIX10_LAYOUT_READY__=true;
   console.info('[RWS LOCAL FIX10] Consolidated rebirth comparison ready.');
   return true;
 }
 let attempts=0;
 const timer=setInterval(()=>{if(organize()||++attempts>180)clearInterval(timer);},75);
 organize();
 window.__RWS_LOCAL_FIX10_STATIC_READY__=true;
})();