/* RWS v10.54 · PaddleOCR v3 browser recognition engine.
 * Reads pixels; never uses filenames or saved sample truth as OCR inputs.
 * A separate bridge controls RWS A/B UI and approval.
 */
(function(){
"use strict";
const VERSION="10.54";
const CDNS=[
 {name:"jsDelivr",url:"https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm"},
 {name:"Fastly",url:"https://fastly.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm"},
 {name:"esm.sh",url:"https://esm.sh/@paddleocr/paddleocr-js@0.4.2?bundle"}
];
let instance=null,pending=null,sdkName="";
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function digits(value){return String(value??"").replace(/[Oo]/g,"0").replace(/[Il|]/g,"1").replace(/[^0-9]/g,"");}
async function ensureModel(progress){
 if(instance)return instance;
 if(pending)return pending;
 pending=(async()=>{
  if(!/^https?:$/.test(location.protocol))throw Error("PaddleOCR은 HTTP(S)에서만 실행할 수 있습니다.");
  const problems=[];
  for(const source of CDNS){
   try{
    progress?.("SDK 연결: "+source.name);
    const mod=await import(source.url);
    const paddle=mod?.PaddleOCR;
    if(!paddle||typeof paddle.create!=="function")throw Error("PaddleOCR.create 없음");
    for(let attempt=1;attempt<=2;attempt++){
     try{
      progress?.("PaddleOCR 모델 다운로드 · "+source.name+" · "+attempt+"/2");
      instance=await paddle.create({lang:"en",ocrVersion:"PP-OCRv6",ortOptions:{backend:"auto"}});
      sdkName=source.name;
      progress?.("PaddleOCR v3 준비 완료");
      return instance;
     }catch(e){if(attempt===2)throw e;await sleep(1100);}
    }
   }catch(e){problems.push(source.name+": "+String(e?.message||e));}
  }
  throw Error("PaddleOCR SDK/모델을 연결하지 못했습니다. "+problems.join(" | "));
 })();
 try{return await pending;}finally{if(!instance)pending=null;}
}
function crop(img,field,variant){
 const w=img.width,h=img.height,factor=variant%2?6:5;
 let x,y,ww,hh;
 if(field==="level"){x=.083*w;y=.878*h;ww=.129*w;hh=.080*h;}
 else{
  y=h-42;hh=35;
  if(field==="pct"){x=(.337+(variant===1?.028:variant===2?.052:0))*w;ww=(variant===0?.14:.105)*w;}
  else if(field==="current"){x=(.388+variant*.018)*w;ww=(variant===0?.215:variant===1?.192:.169)*w;}
  else{x=(.505+variant*.05)*w;ww=(variant===0?.225:.18)*w;}
 }
 const c=document.createElement("canvas");
 const sw=Math.round(ww*factor),sh=Math.round(hh*factor);
 const levelCrop=field==="level";
 c.width=sw+(levelCrop?48:40);c.height=sh+(levelCrop?38:36);
 const ctx=c.getContext("2d",{willReadFrequently:true});
 ctx.fillStyle=levelCrop?"#101827":"#0d1320";ctx.fillRect(0,0,c.width,c.height);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
 ctx.drawImage(img,x,y,ww,hh,levelCrop?24:20,18,sw,sh);
 if(variant%2){
  const d=ctx.getImageData(0,0,c.width,c.height);
  for(let i=0;i<d.data.length;i+=4){
   const g=.299*d.data[i]+.587*d.data[i+1]+.114*d.data[i+2];
   const n=Math.min(255,Math.max(0,(g-128)*1.22+128));
   d.data[i]=d.data[i+1]=d.data[i+2]=n;
  }
  ctx.putImageData(d,0,0);
 }
 return c;
}
function allTexts(raw){
 return (raw?.items||[]).filter(x=>x&&typeof x.text==="string")
 .sort((a,b)=>(b.score||0)-(a.score||0))
 .map(x=>({text:x.text,score:Number(x.score)||0}));
}
function readLevel(lines){
 for(const s of lines.map(x=>x.text)){
  const m=s.match(/(?:lv[.\s]*)?(\d{2,3})/i);
  if(m){const n=Number(m[1]);if(n>=1&&n<=600)return n;}
 }
 return null;
}
function readPercents(lines){
 const found=new Map();
 function put(n,score,raw){
  if(n<0||n>=100||!Number.isFinite(n))return;
  const val=Number(n.toFixed(2)),key=String(val);
  const item=found.get(key)||{value:val,score:0,support:0,raw:[]};
  item.support++;item.score+=Math.max(0,score);if(item.raw.length<8)item.raw.push(raw);
  found.set(key,item);
 }
 for(const {text,score} of lines){
  const s=String(text||"").replace(/(\d{1,2})[:：](\d{2})(?=%)/g,"$1.$2").replace(/,/g,".");
  for(const m of s.matchAll(/(?:^|[^\d])(\d{1,2})\s*[.]\s*(\d{2})(?:%|[^\d]|$)/g))
   put(Number(m[1]+"."+m[2]),score,text);
  const m=s.trim().match(/^(\d{1,2})%(\d{2})%?$/);
  if(m)put(Number(m[1]+"."+m[2]),score*.7,text);
 }
 return [...found.values()].sort((a,b)=>b.support-a.support||b.score-a.score);
}
function readCurrents(lines,tableTotal,percents){
 const obs=new Map(),expLen=tableTotal?String(tableTotal).length:null;
 function put(raw,score,origin){
  if(!raw||!/^\d+$/.test(raw)||raw.length<7||raw.length>13)return;
  const n=Number(raw);
  if(!Number.isSafeInteger(n)||n<0||(tableTotal&&n>=tableTotal))return;
  const key=String(n),c=obs.get(key)||{value:key,support:0,score:0,raws:[]};
  c.support++;c.score+=score;c.raws.push(origin);obs.set(key,c);
 }
 for(const {text,score} of lines){
  let s=String(text||"").trim();
  if(s.includes("("))s=s.substring(s.lastIndexOf("(")+1);
  if(s.includes("/"))s=s.split("/")[0];
  for(const g of s.match(/\d{1,3}(?:,\d{3}){2,4}/g)||[])put(digits(g),score,text);
  put(digits(s),score,text);
 }
 const chosen=[...obs.values()];
 for(const c of chosen){
  const n=Number(c.value);
  c.ratio=tableTotal?Math.round(n/tableTotal*10000)/100:null;
  c.ratioMatch=percents.some(p=>p.value===c.ratio);
  c.lengthPlausible=!expLen||c.value.length>=Math.max(7,expLen-2);
  c.rank=(c.ratioMatch?40:0)+(c.lengthPlausible?8:0)+c.support*4+c.score;
 }
 return chosen.sort((a,b)=>b.rank-a.rank||b.support-a.support);
}
function partialPct(lines,pool,total){
 if(!Number.isSafeInteger(total)||total<=0||pool.some(c=>c.ratioMatch))return null;
 const suffixes=new Set();
 for(const {text} of lines){
  for(const m of String(text||"").matchAll(/(?:^|[^0-9])(?:[0-9]{1,2}[.:：])?([0-9]{2})%(?=[^0-9]|$)/g))
   suffixes.add(m[1]);
 }
 if(!suffixes.size)return null;
 const plausible=pool.filter(c=>{
  if(c.support<2||c.ratio==null||!Number.isSafeInteger(Number(c.value)))return false;
  if(!suffixes.has(c.ratio.toFixed(2).split(".")[1]))return false;
  return new Set(c.raws).size>=2;
 });
 if(plausible.length!==1)return null;
 const c=plausible[0];
 return {current:c.value,pct:c.ratio,support:c.support,
  reason:"OCR-fragment+EXP-ratio (manual review)",suffixes:[...suffixes]};
}
function totalDiagnostics(lines){
 const found=[];
 for(const {text,score} of lines){
  let s=String(text||"");if(s.includes("/"))s=s.split("/").pop();
  const groups=[...s.matchAll(/\d{1,3}(?:,\d{3}){2,5}/g)].map(m=>digits(m[0]));
  groups.push(digits(s));
  for(const v of groups)if(v.length>=7&&v.length<=13)found.push({value:v,score,raw:text});
 }
 return found.sort((a,b)=>b.score-a.score);
}
async function recognize(file,progress){
 const model=await ensureModel(progress);
 const img=await createImageBitmap(file);
 try{
  if(img.width/img.height<1.45||img.width/img.height>2.05)
   throw Error("게임 전체 화면 스크린샷을 사용해 주세요.");
  const list={level:[],pct:[],current:[],total:[]},tasks=[];
  for(const field of ["level","pct","current","total"]){
   const count=field==="level"?2:field==="pct"?3:field==="current"?4:2;
   for(let v=0;v<count;v++)tasks.push({field,variant:v,canvas:crop(img,field,v)});
  }
  progress?.("PaddleOCR 숫자 인식 중 ("+tasks.length+"개 영역)");
  const batch=await model.predict(tasks.map(t=>t.canvas),{textRecScoreThresh:0});
  if(!Array.isArray(batch)||batch.length!==tasks.length)throw Error("OCR 배치 수 불일치");
  batch.forEach((r,i)=>list[tasks[i].field].push(...allTexts(r).map(x=>({...x,roi:tasks[i].variant}))));
  const level=readLevel(list.level);
  const total=level?Number(LEVEL_EXP[level]||0):0;
  const percents=readPercents(list.pct),pool=readCurrents(list.current,total,percents);
  const partial=partialPct(list.pct,pool,total);
  const chosen=(partial?pool.find(c=>c.value===partial.current):null)||pool[0]||null;
  const current=chosen?.value??null,derived=current!=null&&total?Math.round(Number(current)/total*10000)/100:null;
  const observed=percents[0]?.value??null;
  const pct=chosen?.ratioMatch?(percents.find(p=>p.value===derived)?.value??observed):(partial?.pct??observed);
  const verified=Boolean(total&&chosen?.ratioMatch&&chosen.support>=1&&pct===derived&&!partial);
  const diagnostics=totalDiagnostics(list.total);
  return {level,pct,current,total:total||null,
   totalSource:total?"level-reference":"missing-level-reference",
   ocrTotalObserved:diagnostics[0]?.value||null,
   pctDerived:derived,pctSource:partial?"OCR-fragment+EXP-inferred":pct==null?"unread":"OCR",
   currentSource:chosen?"OCR-candidate":"unread",
   reviewRequired:Boolean(partial),verified,raw:{...list,percentCandidates:percents,currentCandidates:pool,totalDiagnostics:diagnostics,partialProgressEvidence:partial},sdk:sdkName};
 }finally{img.close?.();}
}
window.RWS54Paddle={version:VERSION,ensureModel,recognize,parse:{readLevel,readPercents,readCurrents,partialPct}};
window.__RWS54_PADDLE_ENGINE_READY__=true;
})();
