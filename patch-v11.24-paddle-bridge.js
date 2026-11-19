/* RWS v11.00 · PaddleOCR v3 independent A/B UI integration.
   Existing OCR debug/review functions are private to the legacy IIFE.
   Do not invoke beginOcrDebug / pushOcrDebug / finishOcrDebug /
   v51ShowReview / v53ShowFallback / setExpInputValue from this module.
*/
(function(){
"use strict";
const VERSION="11.00";
const $=id=>document.getElementById(id);
const perSide={A:null,B:null};
const activeResult={A:0,B:0};
const VALID_SIDES=new Set(["A","B"]);
function debugStart(side,file,img){
 const log={version:VERSION,engine:"PaddleOCR v3",side,
  startedAt:new Date().toISOString(),
  file:{name:file?.name||"",size:file?.size||0,lastModified:file?.lastModified||0},
  image:{width:img?.naturalWidth||0,height:img?.naturalHeight||0},events:[],result:null};
 perSide[side]=log;
 const btn=$("ocrLog"+side);
 if(btn){btn.disabled=false;btn.onclick=()=>exportDebug(side);}
 return log;
}
function debugEvent(side,type,data){
 const d=perSide[side];if(!d)return;
 d.events.push({time:new Date().toISOString(),type,data});
}
function debugFinish(side,result){
 const d=perSide[side];if(!d)return;
 d.finishedAt=new Date().toISOString();d.result=result;
 const btn=$("ocrLog"+side);
 if(btn){btn.disabled=false;btn.onclick=()=>exportDebug(side);}
}
function exportDebug(side){
 const log=perSide[side];if(!log)return;
 const data=new Blob([JSON.stringify(log,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(data);
 const a=document.createElement("a");a.href=url;
 a.download="RWS_PaddleOCR_v11.00_"+side+"_log.json";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function clearPanel(side){
 const pane=$("rws56Review"+side);
 if(pane)pane.remove();
}
function invalidated(side,file,token){return shotFiles[side]!==file||activeResult[side]!==token;}
function setNumeric(side,level,exp,total){
 if(!Number.isInteger(level)||!Number.isSafeInteger(exp)||exp<0||exp>=total||
    Number(LEVEL_EXP[level]||0)!==total)return false;
 $("level"+side).value=String(level);
 const mode=$("expInputMode");mode.value="raw";updateExpMode();
 const input=$("exp"+side);
 input.value=String(exp);
 input.dispatchEvent(new Event("input",{bubbles:true}));
 ocrRetryVisible(side,true);
 if(typeof lastMeasurement!=="undefined")lastMeasurement=null;
 return true;
}
function showPanel(side,file,img,result,mode,token){
 clearPanel(side);
 const el=$("ocrStatus"+side);
 if(!el)return false;
 const section=document.createElement("section");
 section.id="rws56Review"+side;
 section.style.cssText="margin-top:10px;border:1px solid #667e9e;border-radius:10px;padding:12px;background:#102039;color:#e5efff;display:grid;gap:9px;font-size:12px";
 section.setAttribute("aria-label","EXP 원본 확인");
 const message=document.createElement("strong");
 message.textContent="경험치 수치를 추출할 수 없습니다. 확대된 원본 화면에서 경험치 또는 진행률을 확인 후 수기 입력해 주세요.";
 section.appendChild(message);
 const c=document.createElement("canvas");c.width=900;c.height=88;
 c.style.cssText="width:100%;height:auto;background:#101827;border:1px solid #506386;border-radius:5px;image-rendering:pixelated";
 c.setAttribute("aria-label","게임 화면 하단 경험치 숫자 확대");
 try{
  const w=img.naturalWidth,h=img.naturalHeight;
  const x=Math.floor(w*.34),y=Math.floor(h*.946),sw=Math.min(w-x,Math.ceil(w*.44)),sh=Math.min(h-y,Math.ceil(h*.044));
  if(sw>0&&sh>0){const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x,y,sw,sh,0,0,c.width,c.height);}
 }catch(err){debugEvent(side,"crop-error",String(err));}
 section.appendChild(c);
 (el.closest(".ocr-row")||el).insertAdjacentElement("afterend",section);
 return true;
}
function automatic(side,file,r,token){
 if(invalidated(side,file,token))return false;
 const lv=r.level,exp=Number(r.current),total=Number(LEVEL_EXP[lv]||0);
 if(!r.verified||!Number.isInteger(lv)||!Number.isSafeInteger(exp)||!total||r.total!==total||
    Math.round(exp/total*10000)/100!==r.pct)return false;
 if(!setNumeric(side,lv,exp,total))return false;
 ocrStatus(side,"Lv."+lv+" / EXP "+exp.toLocaleString("ko-KR")+
  " · "+r.pct.toFixed(2)+"% 검산 일치","success");
 return true;
}
async function run(side){
 if(!VALID_SIDES.has(side))return;
 const file=shotFiles[side],img=$("preview"+side);
 if(!file||!img)return;
 const token=++activeResult[side];
 clearPanel(side);
 ocrRetryVisible(side,false);
 ocrStatus(side,"PaddleOCR v3 · 모델 상태 확인 중...","working");
 debugStart(side,file,img);
 let heartbeat=null,deadline=null,stage="모델 상태 확인 중";
 const began=Date.now();
 const status=text=>{
  stage=text;
  if(!invalidated(side,file,token))ocrStatus(side,text,"working");
 };
 try{
  if(!img.complete||!img.naturalWidth){
   await Promise.race([
    new Promise((resolve,reject)=>{
     img.addEventListener("load",resolve,{once:true});
     img.addEventListener("error",()=>reject(Error("스크린샷을 불러오지 못했습니다.")),{once:true});
    }),
    new Promise((_,reject)=>setTimeout(()=>reject(Error("스크린샷을 불러오는 시간이 초과되었습니다.")),12000))
   ]);
  }
  if(invalidated(side,file,token))return;
  heartbeat=setInterval(()=>{
   if(!invalidated(side,file,token))
    ocrStatus(side,stage+" · "+Math.floor((Date.now()-began)/1000)+"초 경과","working");
  },4500);
  const task=window.RWS1100Paddle.recognize(file,status);
  const timeout=new Promise((_,reject)=>{
   deadline=setTimeout(()=>reject(Error("PaddleOCR 응답 시간 초과 · 모델/CDN 연결을 확인해 주세요.")),125000);
  });
  const result=await Promise.race([task,timeout]);
  if(invalidated(side,file,token))return;
  debugEvent(side,"recognition",result);
  if(automatic(side,file,result,token)){
   debugFinish(side,{ok:true,mode:"automatic",level:result.level,current:result.current});
   return;
  }
  const review=result.reviewRequired?"review":"fallback";
  showPanel(side,file,img,result,review,token);
  ocrStatus(side,review==="review"?"PaddleOCR · 누락된 진행률을 확인해 주세요.":"PaddleOCR · 인식 결과 확인 필요 · 원본 화면을 확인해 주세요.","working");
  ocrRetryVisible(side,true);
  debugFinish(side,{ok:false,reviewRequired:true,mode:review});
 }catch(err){
  if(invalidated(side,file,token))return;
  const msg=String(err?.message||err);
  debugEvent(side,"error",{message:msg});
  showPanel(side,file,img,null,"fallback",token);
  ocrStatus(side,"PaddleOCR 오류 · "+msg+" · 아래에서 직접 입력해 주세요.","error");
  ocrRetryVisible(side,true);
  debugFinish(side,{ok:false,error:msg});
 }finally{
  if(heartbeat!==null)clearInterval(heartbeat);
  if(deadline!==null)clearTimeout(deadline);
 }
}
let installed=false,attempts=0;
function install(){
 if(installed)return true;
 if(!window.RWS1100Paddle||!window.__RWS53_OCR_SAFE_FALLBACK_INSTALLED__||
    !$("ocrStatusA")||!$("ocrStatusB")||
    typeof window.runHudOcr!=="function"||typeof window.queueHudOcr!=="function")return false;
 window.runHudOcr=run;
 let queue=Promise.resolve();
 window.queueHudOcr=function(side){queue=queue.catch(()=>{}).then(()=>run(side));return queue;};
 installed=true;
 window.__RWS1100_PADDLE_BRIDGE_INSTALLED__=true;
 console.info("[RWS v11.00] standalone PaddleOCR A/B integration ready");
 return true;
}
const installTimer=setInterval(()=>{
 attempts++;
 if(install()||attempts>300){clearInterval(installTimer);
  if(!installed)console.error("[RWS v11.00] bridge missing app globals");
 }
},80);
window.RWS1100Bridge={run,install,automatic,showPanel,getDebug:side=>perSide[side]};
})();
