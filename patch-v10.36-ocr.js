// RWS v10.36 · verified OCR fix for HUD level/EXP recognition.
(async()=>{
const BASE="./";
const parts=['patch-v10.22.part1.txt','patch-v10.22.part2.txt','patch-v10.22.part3.txt','patch-v10.22.part4.txt','patch-v10.22.part5.txt'];
try{
  let source=(await Promise.all(parts.map(async path=>{
    const r=await fetch(BASE+path+'?release=10.36',{cache:'no-cache'});
    if(!r.ok)throw new Error(path+': HTTP '+r.status);
    return await r.text();
  }))).join('');
  const first='async function v21OcrLevel(worker,img){';
  const next='async function v21CollectPercent(worker,img){';
  const from=source.indexOf(first),to=source.indexOf(next,from);
  if(from<0||to<0)throw Error('레벨 OCR 함수가 예상과 다릅니다.');
  let section=source.slice(from,to);
  const original='  const map=new Map(),raws=[];';
  if(!section.includes(original))throw Error('레벨 OCR 처리 지점이 예상과 다릅니다.');
  section=section.replace(original,"  // First: recognize only white HUD numerals, excluding the gold background and the \"Lv.\" label.\n  const anchorRegions=[\n    {x:.139,y:.891,w:.068,h:.058},\n    {x:.137,y:.889,w:.072,h:.061}\n  ];\n  const anchorAttempts=[\n    {mode:'white',threshold:175,scale:9,psm:'7'},\n    {mode:'white',threshold:175,scale:9,psm:'13'},\n    {mode:'hud',threshold:195,scale:9,psm:'7'}\n  ];\n  const anchorResults=[];\n  for(const region of anchorRegions){\n    for(const settings of anchorAttempts){\n      const canvas=v22MakeOcrCanvas(img,region,settings.scale,settings.mode,settings.threshold);\n      const raw=await recognizeCanvas(worker,canvas,'0123456789',settings.psm);\n      const digits=v21Digits(raw),token=digits.slice(-3),value=Number(token);\n      pushOcrDebug('v23-level-white-crop',{region,...settings,raw:safeOcrText(raw),digits,token,value});\n      if((digits.length===3||(digits.length===4&&digits[0]==='1'))&&value>=100&&value<=350){\n        anchorResults.push({value,raw});\n      }\n    }\n  }\n  const counts=new Map();\n  for(const hit of anchorResults)counts.set(hit.value,(counts.get(hit.value)||0)+1);\n  const ordered=[...counts].sort((a,b)=>b[1]-a[1]);\n  if(ordered.length&&ordered[0][1]>=2&&(!ordered[1]||ordered[0][1]>ordered[1][1])){\n    const level=ordered[0][0];\n    pushOcrDebug('v23-level-anchor-selected',{value:level,support:ordered[0][1]});\n    return {lv:level,raw:anchorResults.find(x=>x.value===level).raw,score:-10,candidates:anchorResults};\n  }\n  // Fall back to the existing multi-crop OCR for uncertain or low-level HUDs.\n  const map=new Map(),raws=[];\n");
  source=source.slice(0,from)+section+source.slice(to);
  const old='  return v21FuseHud(lv,tableTotal,pctPack,totalPack,currentPack);';
  if(!source.includes(old))throw Error('EXP OCR 통합 처리 지점이 예상과 다릅니다.');
  source=source.replace(old,'  const result=v21FuseHud(lv,tableTotal,pctPack,totalPack,currentPack);result.percentCandidates=pctPack.candidates;return result;');
  const errorLine="    if(!fused.best)throw new Error(`EXP 후보 교차검증 실패 · Lv.${lv} · OCR 로그를 저장해 주세요.`);";
  if(!source.includes(errorLine))throw Error('EXP 오류 처리 지점이 예상과 다릅니다.');
  source=source.replace(errorLine,"    if(!fused.best){\n      // Raw EXP is NOT inferred from a two-decimal percentage; the user's data stays precise.\n      const candidate=(fused.percentCandidates||[])\n        .filter(p=>p.value>=0&&p.value<=100&&p.support>=3)\n        .sort((a,b)=>a.score-b.score)[0];\n      if(!candidate)throw new Error(`EXP 후보 교차검증 실패 · Lv.${lv} · OCR 로그를 저장해 주세요.`);\n      const percent=Number(candidate.value.toFixed(2));\n      $('level'+side).value=lv;\n      $('expInputMode').value='pct';\n      updateExpMode();\n      setExpInputValue('exp'+side,percent,'pct');\n      ocrStatus(side,`부분 인식 · Lv.${lv} / EXP ${percent.toFixed(2)}% · 숫자 EXP는 미검증`,'working');\n      ocrRetryVisible(side,true);\n      pushOcrDebug('v23-percent-fallback',{level:lv,percent,rawExpVerified:false});\n      finishOcrDebug(side,{ok:true,engine:'v10.36-percent-fallback',level:lv,percent,rawExpVerified:false});\n      lastMeasurement=null;\n      return;\n    }");
  source=source.replace('const OCR_DEBUG_VERSION="v10.22 OCR FUSION"','const OCR_DEBUG_VERSION="v10.36 HUD OCR FIX"');
  // Validate final replacement before running it.
  new Function(source);
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript;charset=utf-8'}));
  const script=document.createElement('script');script.src=url;
  script.onload=()=>{URL.revokeObjectURL(url);window.__RWS36_OCR_INSTALLED__=true;};
  script.onerror=()=>{URL.revokeObjectURL(url);console.error('[RWS v10.36 OCR] Load failed');};
  document.head.appendChild(script);
}catch(err){
  console.error('[RWS v10.36 OCR] The OCR module could not be installed:',err);
  const box=document.createElement('div');
  box.style.cssText='position:fixed;bottom:10px;left:10px;right:10px;z-index:9500;padding:12px;border:1px solid #ba7892;border-radius:10px;background:#302038;color:#fff;font:13px/1.6 system-ui';
  box.textContent='로컬 OCR 보정 모듈을 적용하지 못했습니다: '+String(err.message||err);
  document.body.appendChild(box);
}
})();