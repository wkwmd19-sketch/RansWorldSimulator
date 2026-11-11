/* RWS v10.56 · PaddleOCR v3 independent A/B UI integration.
   Existing OCR debug/review functions are private to the legacy IIFE.
   Do not invoke beginOcrDebug / pushOcrDebug / finishOcrDebug /
   v51ShowReview / v53ShowFallback / setExpInputValue from this module.
*/
(function(){
"use strict";
const VERSION="10.56";
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
 a.download="RWS_PaddleOCR_v10.56_"+side+"_log.json";
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
 message.textContent=mode==="review"?
  "OCR 숫자 후보를 찾았지만 진행률 일부가 누락됐어. 게임 화면과 비교하여 직접 확인해 줘.":
  "OCR 인식값을 확정할 수 없어. 확대 이미지를 보고 EXP와 진행률을 직접 확인해 줘.";
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
 const fields=document.createElement("div");
 fields.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px";
 function input(label,value,placeholder){
  const wrap=document.createElement("label");wrap.style.cssText="display:grid;gap:4px";
  const title=document.createElement("span");title.textContent=label;
  const field=document.createElement("input");field.type="text";field.value=value||"";
  field.placeholder=placeholder;field.inputMode="decimal";field.autocomplete="off";
  field.style.cssText="width:100%;box-sizing:border-box;padding:8px;border:1px solid #536b8d;border-radius:6px;background:#0c182a;color:#fff;font-size:14px";
  wrap.appendChild(title);wrap.appendChild(field);fields.appendChild(wrap);return field;
 }
 const lv=input("레벨",Number.isInteger(result?.level)?String(result.level):"","274");
 const value=input("현재 EXP",mode==="review"&&result?.current?Number(result.current).toLocaleString("ko-KR"):"","69,588,644,836");
 const pct=input("화면에 표시된 진행률 (%)","","43.82");
 section.appendChild(fields);
 const help=document.createElement("div");help.style.cssText="font-size:12px;opacity:.9";
 section.appendChild(help);
 const button=document.createElement("button");button.type="button";button.disabled=true;
 button.textContent="검산 후 EXP 입력";
 button.style.cssText="padding:9px;border-radius:7px;border:1px solid #4987b5;background:#21517e;color:white;font-size:13px;font-weight:bold";
 section.appendChild(button);
 const readInteger=text=>{
  const v=String(text).trim();
  if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(v))return null;
  const n=Number(v.replace(/,/g,""));return Number.isSafeInteger(n)?n:null;
 };
 function assess(){
  const level=readInteger(lv.value),n=readInteger(value.value);
  const total=level?Number(LEVEL_EXP[level]||0):0;
  const ptxt=pct.value.trim(),p=/^\d{1,2}(?:\.\d{1,2})?$/.test(ptxt)?Number(ptxt):NaN;
  const good=total>0&&n!==null&&n>=0&&n<total&&p>=0&&p<100&&
    Math.round(n/total*10000)/100===p;
  button.disabled=!good;
  help.textContent=!total?"유효한 레벨을 입력해 줘.":
   good?"검산 일치 · 필요 EXP "+total.toLocaleString("ko-KR"):
   "EXP와 진행률을 원본에서 확인해 줘. 필요 EXP "+total.toLocaleString("ko-KR");
  return good?{level,n,p,total}:null;
 }
 for(const field of [lv,value,pct])field.addEventListener("input",assess);
 button.addEventListener("click",()=>{
  if(invalidated(side,file,token)){clearPanel(side);return;}
  const values=assess();if(!values)return;
  if(!setNumeric(side,values.level,values.n,values.total))return;
  ocrStatus(side,"PaddleOCR · 사용자가 원본 확인 / EXP "+
   values.n.toLocaleString("ko-KR")+" / "+values.p.toFixed(2)+"% 검산 일치","success");
  debugEvent(side,"manually-verified",{level:values.level,current:values.n,percent:values.p});
  clearPanel(side);
 });
 assess();
 (el.closest(".ocr-row")||el).insertAdjacentElement("afterend",section);
 return true;
}
function automatic(side,file,r,token){
 if(invalidated(side,file,token))return false;
 const lv=r.level,exp=Number(r.current),total=Number(LEVEL_EXP[lv]||0);
 if(!r.verified||!Number.isInteger(lv)||!Number.isSafeInteger(exp)||!total||r.total!==total||
    Math.round(exp/total*10000)/100!==r.pct)return false;
 if(!setNumeric(side,lv,exp,total))return false;
 ocrStatus(side,"PaddleOCR v3 인식 완료 · Lv."+lv+" / EXP "+exp.toLocaleString("ko-KR")+
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
     img.addEventListener("error",()=>reject(Error("스크린샷 로드 오류")),{once:true});
    }),
    new Promise((_,reject)=>setTimeout(()=>reject(Error("스크린샷 로드 시간 초과")),12000))
   ]);
  }
  if(invalidated(side,file,token))return;
  heartbeat=setInterval(()=>{
   if(!invalidated(side,file,token))
    ocrStatus(side,stage+" · "+Math.floor((Date.now()-began)/1000)+"초 경과","working");
  },4500);
  const task=window.RWS56Paddle.recognize(file,status);
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
  ocrStatus(side,review==="review"?"PaddleOCR · 진행률 일부 확인 필요":"PaddleOCR · 판독 불확실 · 원본을 확인해 줘","working");
  ocrRetryVisible(side,true);
  debugFinish(side,{ok:false,reviewRequired:true,mode:review});
 }catch(err){
  if(invalidated(side,file,token))return;
  const msg=String(err?.message||err);
  debugEvent(side,"error",{message:msg});
  showPanel(side,file,img,null,"fallback",token);
  ocrStatus(side,"PaddleOCR 오류 · "+msg+" · 직접 입력 가능","error");
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
 if(!window.RWS56Paddle||!window.__RWS53_OCR_SAFE_FALLBACK_INSTALLED__||
    !$("ocrStatusA")||!$("ocrStatusB")||
    typeof window.runHudOcr!=="function"||typeof window.queueHudOcr!=="function")return false;
 window.runHudOcr=run;
 let queue=Promise.resolve();
 window.queueHudOcr=function(side){queue=queue.catch(()=>{}).then(()=>run(side));return queue;};
 installed=true;
 window.__RWS56_PADDLE_BRIDGE_INSTALLED__=true;
 console.info("[RWS v10.56] standalone PaddleOCR A/B integration ready");
 return true;
}
const installTimer=setInterval(()=>{
 attempts++;
 if(install()||attempts>300){clearInterval(installTimer);
  if(!installed)console.error("[RWS v10.56] bridge missing app globals");
 }
},80);
window.RWS56Bridge={run,install,automatic,showPanel,getDebug:side=>perSide[side]};
})();
