/* RWS v11.24 - Simplified OCR failure preview; auto-recognition rules unchanged. */
(function(){
 'use strict';
 const MESSAGE='경험치 수치를 추출할 수 없습니다. 확대된 원본 화면에서 경험치 또는 진행률을 확인 후 수기 입력해 주세요.';
 const panelIDs=['rws56ReviewA','rws56ReviewB','ocrFallbackA','ocrFallbackB','ocrReviewA','ocrReviewB'];
 function collapse(panel){
   if(!panel||panel.dataset.rwsOcrSimple==='yes')return;
   const picture=panel.querySelector('canvas, img');
   if(!picture)return;
   const message=document.createElement('strong');
   message.textContent=MESSAGE;
   message.style.cssText='font-weight:750;color:#eaf4ff;line-height:1.55;';
   panel.dataset.rwsOcrSimple='yes';
   panel.replaceChildren(message,picture);
 }
 function scan(){
   for(const id of panelIDs){
     const panel=document.getElementById(id);
     if(panel)collapse(panel);
   }
 }
 function activate(){
   const target=document.getElementById('tab-exp');
   if(!target)return false;
   new MutationObserver(scan).observe(target,{childList:true,subtree:true});
   scan();
   window.__RWS1124_OCR_FALLBACK_READY__=true;
   return true;
 }
 if(!activate()){
   let count=0;
   const timer=setInterval(()=>{count++;if(activate()||count>=100)clearInterval(timer);},100);
 }
})();