// RWS v10.36 · verified OCR fix for HUD level/EXP recognition.
(async()=>{
const BASE="./";
const parts=['patch-v10.22.part1.txt','patch-v10.22.part2.txt','patch-v10.22.part3.txt','patch-v10.22.part4.txt','patch-v10.22.part5.txt'];
try{
  let source=(await Promise.all(parts.map(async path=>{
    const r=await fetch(BASE+path+'?release=10.39',{cache:'no-cache'});
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


  // v10.38 local: tune OCR rectangles for the user's 2010x1174 HUD.
  // Previous percentage crops at x=.363-.418 only contained "61".
  const oldPercentRegions=`  const regions=[
    {x:.363,y:.953,w:.055,h:.030},
    {x:.366,y:.955,w:.052,h:.027},
    {x:.369,y:.956,w:.048,h:.025}
  ];`;
  const newPercentRegions=`  const regions=[
    {x:.388,y:.950,w:.082,h:.036},
    {x:.391,y:.953,w:.079,h:.031},
    {x:.394,y:.955,w:.074,h:.027}
  ];`;
  if(!source.includes(oldPercentRegions))throw Error('OCR % region anchors not found');
  source=source.replace(oldPercentRegions,newPercentRegions);

  // Move the current EXP window right, to stop reading "74%" as part of the EXP number.
  const currentFn='async function v21CollectCurrent(worker,img,tableTotal,pcts){';
  const currentStart=source.indexOf(currentFn);
  const currentStop=source.indexOf('\nfunction v21FuseHud(',currentStart);
  if(currentStart<0||currentStop<currentStart)throw Error('OCR current EXP region not found');
  let currentSection=source.slice(currentStart,currentStop);
  const oldCurrentRegions=`  const regions=[
    {x:.405,y:.951,w:.128,h:.033},
    {x:.412,y:.953,w:.112,h:.030},
    {x:.417,y:.955,w:.104,h:.027}
  ];`;
  const newCurrentRegions=`  const regions=[
    {x:.444,y:.949,w:.112,h:.036},
    {x:.450,y:.951,w:.105,h:.033},
    {x:.456,y:.954,w:.099,h:.029}
  ];`;
  if(!currentSection.includes(oldCurrentRegions))throw Error('OCR current EXP coordinates changed');
  currentSection=currentSection.replace(oldCurrentRegions,newCurrentRegions);
  const currentMarker='      const ds=v21Digits(part);\n      const local=[];';
  if(!currentSection.includes(currentMarker))throw Error('OCR current candidate anchor missing');
  currentSection=currentSection.replace(currentMarker,`      const ds=v21Digits(part);
      const local=[];
      // Directly recognized comma groups have stronger evidence than shortened subsequences.
      // Example from the actual failure log: "74(90,924,546" -> 90,924,546.
      // Reject malformed 4-digit groups such as "90,924,5467" rather than guessing.
      for(const match of String(text||'').matchAll(/(?:^|[^0-9,])([0-9]{1,3}(?:,[0-9]{3}){1,4})(?![0-9,])/g)){
        const value=Number(match[1].replace(/,/g,''));
        if(!Number.isSafeInteger(value)||value<0||value>=tableTotal)continue;
        if(!targetLens.includes(String(value).length))continue;
        v21AddCandidate(map,value,-2.0,text,{region,...a,kind:'hud-grouped-exact'});
        local.push(value);
      }`);
  source=source.slice(0,currentStart)+currentSection+source.slice(currentStop);

  // Restrict the low-confidence fallback to OCR-confirmed current digits and
  // an independently recognized total EXP exactly matching the game's level table.
  // This never guesses raw current EXP from a rounded percentage.
  const fuseStart=source.indexOf('function v21FuseHud(level,tableTotal,pctPack,totalPack,currentPack){');
  const fuseStop=source.indexOf('\nasync function v21RunStructuredHud(',fuseStart);
  if(fuseStart<0||fuseStop<fuseStart)throw Error('OCR fusion function changed');
  let fuse=source.slice(fuseStart,fuseStop);
  if(!fuse.includes('  const best=sorted[0]||null;')||!fuse.includes('  let confidence="low";'))throw Error('OCR fusion anchors missing');
  fuse=fuse.replace('  const best=sorted[0]||null;','  let best=sorted[0]||null;');
  const fallbackAnchor='  pushOcrDebug("v21-fusion",{';
  if(!fuse.includes(fallbackAnchor))throw Error('OCR fusion debug anchor missing');
  fuse=fuse.replace(fallbackAnchor,`  if(!best && pcts.length===0){
    const total=totals.find(t=>t.value===tableTotal && t.support>=3);
    const direct=currents.filter(c=>c.support>=2 && c.meta.some(m=>m.kind==='hud-grouped-exact'));
    if(total && direct.length===1){
      const candidate=direct[0];
      const pct=Math.round(candidate.value/total.value*10000)/100;
      if(candidate.value<total.value && pct>=0 && pct<=100){
        best={level,percent:pct,current:candidate.value,total:total.value,
          calculatedPercent:pct,percentErr:0,pSupport:0,tSupport:total.support,
          cSupport:candidate.support,pGroupHits:0,tGroupHits:total.groupHits||0,
          cGroupHits:candidate.groupHits||0,pRaw:'',tRaw:total.raws?.[0]||'',
          cRaw:candidate.raws?.[0]||'',score:100,percentDerived:true};
        pushOcrDebug('v38-local-raw-confirmed-pct-unread',{
          current:candidate.value,total:total.value,percentDerived:pct,
          directEvidence:candidate.support,percentOcrObserved:false});
      }
    }
  }
`+fallbackAnchor);
  source=source.slice(0,fuseStart)+fuse+source.slice(fuseStop);
  source=source.replace('const OCR_DEBUG_VERSION="v10.36 HUD OCR FIX"','const OCR_DEBUG_VERSION="v10.39 HUD OCR IMPROVEMENT"');
  console.info('[RWS local] Lv.150 OCR percent/current candidate scan improved');


  // Validate final replacement before running it.
  new Function(source);
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript;charset=utf-8'}));
  const script=document.createElement('script');script.src=url;
  script.onload=()=>{URL.revokeObjectURL(url);window.__RWS36_OCR_INSTALLED__=true;window.__RWS39_OCR_INSTALLED__=true;};
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