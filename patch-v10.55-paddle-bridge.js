/* RWS v10.55 · PaddleOCR v3 A/B screenshot integration.
 * Uses existing RWS image upload, OCR status, numeric EXP and timing fields.
 * Rejects low-evidence OCR automatically; review-only evidence never auto-fills.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
function clearPanels(side){
 if(typeof v51ClearReview==="function")v51ClearReview(side);
 if(typeof v53ClearFallback==="function")v53ClearFallback(side);
}
function showManual(side,file,img,lv,total){
 if(typeof v53ShowFallback==="function")
   return v53ShowFallback(side,file,img,lv,total,"PaddleOCR v3 검증 불충분");
 return false;
}
function applyVerified(side,file,r){
 if(shotFiles[side]!==file)return false;
 if(!Number.isInteger(r.level)||!Number.isSafeInteger(Number(r.current)))return false;
 const total=Number(LEVEL_EXP[r.level]||0),n=Number(r.current);
 if(total<=0||n<0||n>=total||total!==r.total)return false;
 if(Math.round(n/total*10000)/100!==r.pct)return false;
 $("level"+side).value=String(r.level);
 $("expInputMode").value="raw";updateExpMode();
 setExpInputValue("exp"+side,n,"raw");
 ocrStatus(side,"PaddleOCR v3 인식 완료 · Lv."+r.level+" / EXP "+fmt(n)+" · "+r.pct.toFixed(2)+"% 검산 일치","success");
 ocrRetryVisible(side,true);
 lastMeasurement=null;
 return true;
}
function showReview(side,file,img,r){
 if(shotFiles[side]!==file)return false;
 const n=Number(r.current);
 if(!Number.isSafeInteger(n)||!Number.isInteger(r.level)||!r.total||r.pct==null)return false;
 if(typeof v51ShowReview!=="function")return false;
 const candidate=[{current:n,percent:r.pct,support:2,score:0}];
 if(!v51ShowReview(side,file,img,r.level,r.total,candidate))return false;
 ocrStatus(side,"PaddleOCR v3 · 진행률 앞부분 누락 · EXP "+fmt(n)+" / 추정 "+r.pct.toFixed(2)+"% · 원본 확인 후 선택","working");
 ocrRetryVisible(side,true);
 return true;
}
async function run(side){
 const file=shotFiles[side],img=$("preview"+side);
 if(!file||!img)return;
 clearPanels(side);
 ocrRetryVisible(side,false);
 ocrStatus(side,"PaddleOCR v3 · 인식 시작...","working");
 beginOcrDebug(side,img,file);
 let finished=false;
 let heartbeat=null,watchdog=null,displayStage="인식 시작";
 const started=Date.now();
 const report=text=>{
  displayStage=text;
  if(shotFiles[side]===file)ocrStatus(side,text,"working");
 };
 function end(payload){if(!finished){finished=true;finishOcrDebug(side,payload);}}
 try{
  if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener("load",resolve,{once:true});img.addEventListener("error",()=>reject(Error("이미지를 읽을 수 없습니다.")),{once:true});});
  if(shotFiles[side]!==file){end({aborted:"image changed"});return;}
  // Dedicated model watchdog: an unresolved download must not hold the RWS OCR queue forever.
  const maxWait=125000;
  heartbeat=setInterval(()=>{
   if(shotFiles[side]===file){
    const seconds=Math.floor((Date.now()-started)/1000);
    ocrStatus(side,displayStage+" · "+seconds+"초 경과","working");
   }
  },4000);
  const recognizing=window.RWS55Paddle.recognize(file,report);
  const deadline=new Promise((_,reject)=>{
   watchdog=setTimeout(()=>reject(Error(
    "PaddleOCR 모델 로드/인식이 125초를 초과했습니다. 인터넷·모델 연결을 확인하고 페이지를 새로고침해 다시 시도해 주세요."
   )),maxWait);
  });
  const r=await Promise.race([recognizing,deadline]);
  if(shotFiles[side]!==file){end({aborted:"image changed"});return;}
  pushOcrDebug("paddle-v3-complete",{
   engine:"PaddleOCR PP-OCRv6",sdk:r.sdk,level:r.level,current:r.current,
   shownPercent:r.pct,percentFromExp:r.pctDerived,total:r.total,
   confidence:r.verified?"independent":"manual-required",
   percentSource:r.pctSource,reviewRequired:r.reviewRequired,
   raw:r.raw
  });
  if(r.verified&&applyVerified(side,file,r)){
   end({ok:true,engine:"PaddleOCR-v3",level:r.level,current:r.current,percent:r.pct,
      tableTotal:r.total,verified:true,reviewRequired:false});return;
  }
  if(r.reviewRequired&&showReview(side,file,img,r)){
   end({ok:false,engine:"PaddleOCR-v3",level:r.level,current:r.current,
     percent:r.pct,verified:false,reviewRequired:true});return;
  }
  showManual(side,file,img,r.level,r.total);
  ocrStatus(side,"PaddleOCR v3 · EXP 검증 불충분 · 확대 화면에서 직접 확인해 주세요.","error");
  ocrRetryVisible(side,true);
  end({ok:false,engine:"PaddleOCR-v3",level:r.level,current:r.current,
    percent:r.pct,verified:false,reviewRequired:false});
 }catch(err){
  if(shotFiles[side]!==file){end({aborted:"image changed"});return;}
  pushOcrDebug("paddle-v3-error",{message:String(err?.message||err)});
  showManual(side,file,img,null,null);
  ocrStatus(side,"PaddleOCR 오류 · "+String(err?.message||err)+" · 직접 입력 가능","error");
  ocrRetryVisible(side,true);
  end({ok:false,engine:"PaddleOCR-v3",error:String(err?.message||err)});
 }finally{
  if(heartbeat!==null)clearInterval(heartbeat);
  if(watchdog!==null)clearTimeout(watchdog);
 }
}
let installed=false,attempts=0;
function install(){
 if(installed)return true;
 if(!window.RWS55Paddle||!window.__RWS53_OCR_SAFE_FALLBACK_INSTALLED__||
    typeof window.runHudOcr!=="function"||!$("ocrStatusA")||!$("ocrStatusB"))return false;
 // runHudOcr is declared as a global function in app-base.html; the
 // window property is the same binding used by queueHudOcr(A/B).
 window.runHudOcr=run;
 // The legacy RWS queue can retain an unresolved Tesseract promise.
 // Rebind the global queue to a fresh, isolated PaddleOCR-only chain.
 let newQueue=Promise.resolve();
 window.queueHudOcr=function(side){
  newQueue=newQueue.catch(()=>{}).then(()=>run(side));
  return newQueue;
 };
 for(const side of ["A","B"]){
  const status=$("ocrStatus"+side);
  if(status&&status.classList.contains("idle"))
   status.textContent="PaddleOCR v3 · 이미지를 넣으면 인식합니다 (최초 모델 다운로드 필요)";
 }
 window.__RWS55_PADDLE_BRIDGE_INSTALLED__=true;
 installed=true;
 console.info("[RWS v10.55] PaddleOCR A/B bridge installed");
 return true;
}
const timer=setInterval(()=>{
 attempts++;
 if(install()||attempts>300){
  clearInterval(timer);
  if(!installed)console.error("[RWS v10.55] PaddleOCR bridge installation timed out");
 }
},80);
window.RWS55PaddleBridge={run,install,applyVerified,showReview,showManual};
})();
