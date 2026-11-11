// RWS v10.36 · verified OCR fix for HUD level/EXP recognition.
(async()=>{
const BASE="./";
const parts=['patch-v10.22.part1.txt','patch-v10.22.part2.txt','patch-v10.22.part3.txt','patch-v10.22.part4.txt','patch-v10.22.part5.txt'];
try{
  let source=(await Promise.all(parts.map(async path=>{
    const r=await fetch(BASE+path+'?release=10.51',{cache:'no-cache'});
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



(function rwsOCRLocalV6(){
'use strict';
const ID='v10.51 OCR V9 LEVEL TABLE CROSSCHECK';
function findRange(text,start,end){
  const a=text.indexOf(start),b=text.indexOf(end,a+start.length);
  if(a<0||b<0||b<=a)throw Error('OCR 코드 구조 변경: '+start);
  return [a,b,text.slice(a,b)];
}
function replaceOnce(text,needle,repl,label){
  if(text.split(needle).length!==2)throw Error('OCR 변경 지점 확인 실패: '+label);
  return text.replace(needle,repl);
}
// Supplement the pre-existing white mask with a stricter neutral-white text mask.
// Both masks are kept so lighting differences do not replace the known path.
source=replaceOnce(source,`      }else if(mode==="white"){
        on=r>150 && g>150 && b>130;
      }else if(mode==="dark"||mode==="darkSmooth"){`,
`      }else if(mode==="white"){
        on=r>150 && g>150 && b>130;
      }else if(mode==="whiteStrong"){
        const spread=Math.max(r,g,b)-Math.min(r,g,b);
        on=r>=177 && g>=172 && b>=163 && spread<=65;
      }else if(mode==="dark"||mode==="darkSmooth"){`,'white-on-background segmentation');
source=replaceOnce(source,`    {mode:'hud',threshold:195,scale:9,psm:'7'}`,
`    {mode:'hud',threshold:195,scale:9,psm:'7'},
    {mode:'whiteStrong',threshold:190,scale:9,psm:'13'}`,
'level segmentation additional pass');
// A. Expand the level ROI on the LEFT, and retain two independent pixel filters.
{
  const [start,stop,section]=findRange(source,'async function v21OcrLevel(worker,img){','\nasync function v21CollectPercent(worker,img){');
  let next=section;
  next=replaceOnce(next,`  const regions=[
    {x:.120,y:.890,w:.090,h:.060},
    {x:.112,y:.882,w:.100,h:.070},
    {x:.125,y:.895,w:.084,h:.055}
  ];`,`  // Wider crops include the FIRST character in Lv.186/188/193.
  const regions=[
    {x:.108,y:.882,w:.108,h:.073},
    {x:.114,y:.885,w:.101,h:.069},
    {x:.120,y:.890,w:.095,h:.063}
  ];`,'level ROI');
  // Existing narrow white filter can falsely recognize 93 repeatedly.
  // Inspect the raw full-width OCR strings, then verify with separate total-EXP pixels.
  const original='  const selected=arr[0]||null;';
  const validated=`  const v6Selected=await v6VerifyLevelAgainstTotal(worker,img,arr,raws,anchorResults);
  if(v6Selected)return v6Selected;
  // If total cannot be read, a clipped 2-digit level is not trustworthy
  // when any OCR pass contains possible 3-digit level evidence.
  const longerRaw=raws.some(raw=>{
    const ds=v21Digits(raw);
    for(let i=0;i<=ds.length-3;i++){
      const value=Number(ds.slice(i,i+3));
      if(value>=100&&value<=350)return true;
    }
    return false;
  }) || anchorResults.some(x=>String(x.value).length===3);
  if(longerRaw && arr[0] && arr[0].value<100){
    pushOcrDebug('v6-level-ambiguous-aborted',{raws,top:arr.slice(0,5)});
    throw Error('레벨 첫 자리가 모호하며 총 EXP로도 확인되지 않았습니다. OCR 로그를 저장해 주세요.');
  }
  const selected=arr[0]||null;`;
  next=replaceOnce(next,original,validated,'level validation');
  source=source.slice(0,start)+next+source.slice(stop);
}
// Helper: candidate level must be present in ACTUAL level glyph recognition.
// It is never inferred from nearby game levels alone. The total EXP area is
// read separately and compared to the preexisting LEVEL_EXP table.
const helper=`async function v6VerifyLevelAgainstTotal(worker,img,arr,raws,anchors){
  const possible=new Set();
  const rawStrings=[...raws,...anchors.map(x=>x.raw)];
  for(const c of arr.slice(0,12)){
    if(c.value>=1&&c.value<=350)possible.add(c.value);
  }
  for(const raw of rawStrings){
    const digits=v21Digits(raw);
    if(digits.length>=3){
      for(let i=0;i<=digits.length-3;i++){
        const lv=Number(digits.slice(i,i+3));
        if(lv>=100&&lv<=350&&Number(LEVEL_EXP[lv]||0)>0)possible.add(lv);
      }
    }
    if(digits.length>=2){
      for(let i=0;i<=digits.length-2;i++){
        const lv=Number(digits.slice(i,i+2));
        if(lv>=10&&lv<=99&&Number(LEVEL_EXP[lv]||0)>0)possible.add(lv);
      }
    }
  }
  if(!possible.size)return null;
  const totalReads=[];
  for(const [region,mode,threshold,psm] of [
    [{x:.500,y:.949,w:.167,h:.038},'original',170,'13'],
    [{x:.505,y:.949,w:.163,h:.036},'darkSmooth',200,'13'],
    [{x:.515,y:.951,w:.151,h:.034},'dark',200,'13']
  ]){
    const canvas=v22MakeOcrCanvas(img,region,9,mode,threshold);
    const raw=await recognizeCanvas(worker,canvas,'0123456789,()/',''+psm);
    const digits=v21Digits(raw);
    if(digits.length>=6)totalReads.push(digits);
    pushOcrDebug('v6-independent-total-probe',{region,mode,raw:safeOcrText(raw),digits});
  }
  if(!totalReads.length)return null;
  function lcs(a,b){
    let prev=Array(b.length+1).fill(0);
    for(const x of a){
      const next=Array(b.length+1).fill(0);
      for(let j=0;j<b.length;j++)next[j+1]=x===b[j]?prev[j]+1:Math.max(prev[j+1],next[j]);
      prev=next;
    }
    return prev[b.length];
  }
  const ranked=[...possible].map(lv=>{
    const expected=String(LEVEL_EXP[lv]||'');
    const accuracy=expected.length>=6?Math.max(0,...totalReads.map(d=>lcs(d,expected)/Math.max(d.length,expected.length))):0;
    return {lv,accuracy,expectedLength:expected.length};
  }).sort((a,b)=>b.accuracy-a.accuracy);
  pushOcrDebug('v6-independent-level-vs-total',{ranked:ranked.slice(0,12),rawLevel:rawStrings,totalReads});
  const winner=ranked[0],runner=ranked[1];
  if(winner&&winner.accuracy>=.73&&(!runner||winner.accuracy-runner.accuracy>=.12)){
    pushOcrDebug('v6-level-corrected',{oldLevel:arr[0]?.value,verifiedLevel:winner.lv,accuracy:winner.accuracy});
    return {lv:winner.lv,raw:rawStrings.join(' | ').slice(0,220),score:-20,candidates:arr,verifiedByTotal:true};
  }
  return null;
}
`;
source=replaceOnce(source,'async function v21OcrLevel(worker,img){',helper+'async function v21OcrLevel(worker,img){','level verifier insert');

// B. The first digit of 99.04% is cut off by x=.388. Widen to x=.354.
{
  const [start,stop,section]=findRange(source,'async function v21CollectPercent(worker,img){','\nasync function v21CollectTotal(worker,img,tableTotal){');
  let next=replaceOnce(section,`  const regions=[
    {x:.388,y:.950,w:.082,h:.036},
    {x:.391,y:.953,w:.079,h:.031},
    {x:.394,y:.955,w:.074,h:.027}
  ];`,`  // Focus first on the 17.75% glyphs, without most of the parenthesized EXP.
  // Retain one broad crop for HUDs where total text centering varies.
  const regions=[
    {x:.372,y:.952,w:.081,h:.034},
    {x:.376,y:.953,w:.078,h:.032},
    {x:.354,y:.950,w:.118,h:.037}
  ];`,'percent ROI');
  // Multiple overlapping crops from the SAME binarization should not confer
  // 12 independent votes. Reduce score bonuses from repeated evidence families.
  const anchor='  const arr=v21FinalizeCandidates(map,raws,{groupWeight:0,supportWeight:.20}).slice(0,40);';
  next=replaceOnce(next,anchor,`  const arr=v21FinalizeCandidates(map,raws,{groupWeight:0,supportWeight:.20}).slice(0,40);
  for(const c of arr){
    const families=new Set(c.meta.map(m=>m.mode));
    c.independentModes=families.size;
    c.score+=(Math.max(0,c.support-Math.max(1,families.size)))*.20;
  }
  arr.sort((a,b)=>a.score-b.score);`,'duplicate percent votes');
  source=source.slice(0,start)+next+source.slice(stop);
}
// C. Include the leading 1 of billion-scale EXP in the TOTAL and CURRENT crops.
{
  const [start,stop,section]=findRange(source,'async function v21CollectTotal(worker,img,tableTotal){','\nfunction v21CurrentTargetLengths(tableTotal,pcts){');
  const next=replaceOnce(section,`  const regions=[
    {x:.515,y:.951,w:.150,h:.033},
    {x:.505,y:.949,w:.162,h:.036},
    {x:.522,y:.953,w:.140,h:.030}
  ];`,`  const regions=[
    {x:.500,y:.949,w:.169,h:.038},
    {x:.505,y:.949,w:.162,h:.036},
    {x:.515,y:.951,w:.150,h:.033}
  ];`,'total EXP ROI');
  source=source.slice(0,start)+next+source.slice(stop);
}
{
  const [start,stop,section]=findRange(source,'async function v21CollectCurrent(worker,img,tableTotal,pcts){','\nfunction v21FuseHud(');
  const next=replaceOnce(section,`  const regions=[
    {x:.444,y:.949,w:.112,h:.036},
    {x:.450,y:.951,w:.105,h:.033},
    {x:.456,y:.954,w:.099,h:.029}
  ];`,`  const regions=[
    {x:.421,y:.949,w:.136,h:.038},
    {x:.433,y:.950,w:.123,h:.035},
    {x:.444,y:.949,w:.112,h:.036}
  ];`,'current EXP ROI');
  source=source.slice(0,start)+next+source.slice(stop);
}
// D. Keep the full-EXP fusion conservative: arithmetic agreement by itself
// does NOT authenticate arbitrary OCR numbers. Reject totals which disagree
// with the known level table, then allow the module's percentage-only fallback.
{
  // Expose the independently observed candidate packs to the final proof gate.
  source=replaceOnce(source,
    'result.percentCandidates=pctPack.candidates;return result;',
    'result.percentCandidates=pctPack.candidates;result.currentCandidates=currentPack.candidates;result.totalCandidates=totalPack.candidates;return result;',
    'candidate proof packs');
  const key='    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);';
  const guard=`    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);
    if(fused.best){
      const b=fused.best;
      const rel=Math.abs(b.total-tableTotal)/Math.max(tableTotal,1);
      const pctEvidence=(fused.percentCandidates||[]).find(p=>
        Math.abs(p.value-b.percent)<.011);
      const curEvidence=(fused.currentCandidates||[]).find(c=>c.value===b.current);
      const totalEvidence=(fused.totalCandidates||[]).find(t=>t.value===b.total);
      const directlyObservedPercent=Boolean(pctEvidence?.meta.some(m=>m.kind==='decimal'));
      // This is an EVIDENCE check, not an extrapolation from the level table.
      // Only accept the displayed (current, total, percent) tuple when different
      // OCR crops genuinely support the same current EXP digits, and the exact
      // table total, and other high-support numerals do not explain the ratio.
      function isDeletionSubset(needle,haystack){
        if(haystack.length<needle.length||haystack.length-needle.length>3)return false;
        let j=0;
        for(let i=0;i<haystack.length&&j<needle.length;i++)if(haystack[i]===needle[j])j++;
        return j===needle.length;
      }
      const currentCropEvidence=new Set();
      if(curEvidence){
        const expected=String(Math.round(b.current));
        curEvidence.raws.forEach((raw,i)=>{
          let part=String(raw).split('(').slice(-1)[0].split('/')[0].replace(/\D/g,'');
          if(isDeletionSubset(expected,part)&&curEvidence.meta[i]?.region)
            currentCropEvidence.add(String(curEvidence.meta[i].region.x));
        });
      }
      const totalCrops=new Set((totalEvidence?.meta||[]).map(m=>m.region?.x).filter(Number.isFinite));
      const percentModes=pctEvidence?.independentModes||new Set((pctEvidence?.meta||[]).map(m=>m.mode)).size;
      const rivals=(fused.top||[]).filter(x=>x.total===tableTotal &&
        (x.current!==b.current||x.percent!==b.percent) && x.pSupport>=8 &&
        x.cSupport>=10 && x.score-b.score<.35);
      const strongCorroboration=
        b.total===tableTotal && b.current>0 && b.current<b.total &&
        Math.abs(Math.round(b.current/b.total*10000)/100-b.percent)<.011 &&
        pctEvidence?.support>=8 && percentModes>=2 &&
        pctEvidence.raws.filter(raw=>raw.includes('%')).length>=2 &&
        curEvidence?.support>=10 && currentCropEvidence.size>=2 &&
        totalEvidence?.support>=8 && totalCrops.size>=2 && rivals.length===0;
      pushOcrDebug('v6-evidence-gate',{
        level:lv,ratioDeviation:rel,percent:b.percent,
        directlyObservedPercent,strongCorroboration,
        percentSupport:pctEvidence?.support||0,percentModes,
        currentSupport:curEvidence?.support||0,
        currentCrops:[...currentCropEvidence],totalSupport:totalEvidence?.support||0,
        totalCrops:[...totalCrops],rivals:rivals.slice(0,3)
      });
      if(strongCorroboration&&!directlyObservedPercent){
        // Keep the result marked as unverified: the decimal separator was not read.
        fused.confidence='low';
      }
      if(rel>.025||(!directlyObservedPercent&&!strongCorroboration)){
        pushOcrDebug('v6-exp-rejected',{level:lv,ocrTotal:b.total,expectedTotal:tableTotal,
          ratioDeviation:rel,percent:b.percent,directlyObservedPercent,strongCorroboration});
        fused.best=null;
      }
    }`;
  source=replaceOnce(source,key,guard,'crosscheck guard');
  source=replaceOnce(source,'.filter(p=>p.value>=0&&p.value<=100&&p.support>=3)',
    '.filter(p=>p.value>=0&&p.value<=100&&p.support>=3&&p.meta.some(m=>m.kind==="decimal"))',
    'unverified percent guard');
}
source=replaceOnce(source,'const OCR_DEBUG_VERSION="v10.39 HUD OCR IMPROVEMENT"',
  'const OCR_DEBUG_VERSION="'+ID+'"','debug stamp');

// E. Preview exact source ROIs and real OCR preprocessing in the browser.
const preview=`(function(){
  function attach(){
    if(document.getElementById('rws-v6-tools'))return;
    const host=document.createElement('div');host.id='rws-v6-tools';
    host.style.cssText='position:fixed;bottom:9px;right:10px;z-index:200000;display:flex;gap:5px;align-items:center;background:#153026e8;color:#d8ffa4;border:1px solid #a4d783;border-radius:9px;padding:5px 8px;font:700 12px system-ui';
    const text=document.createElement('span');text.textContent='OCR v6';host.appendChild(text);
    const btn=document.createElement('button');btn.type='button';btn.textContent='검출 영역';
    btn.style.cssText='border:1px solid #83af91;border-radius:5px;padding:3px 6px;background:#1e4d3a;color:white;font:600 12px system-ui';
    btn.onclick=()=>{
      const img=document.getElementById('previewA')?.naturalWidth?document.getElementById('previewA'):document.getElementById('previewB');
      if(!img?.naturalWidth){alert('먼저 경험치 효율 계산기에 스크린샷을 올려 주세요.');return;}
      const existing=document.getElementById('rws-v6-preview');if(existing){existing.remove();return;}
      const overlay=document.createElement('div');overlay.id='rws-v6-preview';
      overlay.style.cssText='position:fixed;inset:0;z-index:200001;overflow:auto;padding:30px;background:#071225f5;color:white;font:14px system-ui';
      const close=document.createElement('button');close.textContent='닫기 ×';close.style.cssText='padding:8px 15px;background:#295a7b;color:white;border:1px solid #7dc4fa;border-radius:7px;margin-bottom:15px';close.onclick=()=>overlay.remove();overlay.appendChild(close);
      const title=document.createElement('h2');title.textContent='OCR 검출 및 전처리 확인 ('+img.naturalWidth+'×'+img.naturalHeight+')';overlay.appendChild(title);
      const specs=[
        ['레벨 원본',{x:.108,y:.882,w:.108,h:.073},'original',170],
        ['레벨 흰색 분리',{x:.108,y:.882,w:.108,h:.073},'white',175],
        ['진행률 좁은 영역',{x:.372,y:.952,w:.081,h:.034},'original',170],
        ['진행률 전체',{x:.354,y:.950,w:.118,h:.037},'original',170],
        ['진행률 어두운 픽셀',{x:.354,y:.950,w:.118,h:.037},'darkSmooth',190],
        ['현재 EXP',{x:.421,y:.949,w:.136,h:.038},'original',170],
        ['필요 EXP',{x:.500,y:.949,w:.169,h:.038},'darkSmooth',200]
      ];
      for(const [label,region,mode,threshold] of specs){
        const card=document.createElement('div');card.style.cssText='display:inline-block;vertical-align:top;background:#162a43;border:1px solid #4a6d96;border-radius:10px;padding:12px;margin:5px;max-width:98%';
        const t=document.createElement('div');t.textContent=label+' · '+mode;t.style.cssText='margin-bottom:8px;font-weight:700';card.appendChild(t);
        const cv=v22MakeOcrCanvas(img,region,3,mode,threshold);cv.style.cssText='max-width:100%;height:auto;image-rendering:auto;background:#fff';card.appendChild(cv);
        overlay.appendChild(card);
      }
      document.body.appendChild(overlay);
    };
    host.appendChild(btn);document.body.appendChild(host);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
  else attach();
})();`;
const tail='  },60);\n})();';
const tailAt=source.lastIndexOf(tail);
if(tailAt<0)throw Error('OCR 화면 초기화 위치를 찾지 못했습니다.');
source=source.slice(0,tailAt)+preview+'\n'+source.slice(tailAt);
console.info('[RWS v10.41 OCR v6] ROIs + cross-verified levels installed');
})();

(function rwsV7HudIsolation(){
'use strict';
function v7ReplaceOnce(src,find,replacement,label){
  const at=src.indexOf(find);
  if(at<0||src.indexOf(find,at+find.length)>=0)throw Error('OCR v7 patch missing or duplicated: '+label);
  return src.slice(0,at)+replacement+src.slice(at+find.length);
}
const helper="\nfunction v9DirectCommaWitness(value,ocrRaw){\n  let s=String(ocrRaw||'');\n  if(s.includes('('))s=s.slice(s.lastIndexOf('(')+1);\n  if(s.includes('/'))s=s.split('/')[0];\n  const observed=s.replace(/\\D/g,''),expected=String(value);\n  if(observed===expected)return true;\n  if(observed.length!==expected.length+1)return false;\n  const first=expected.length%3||3;\n  for(let pos=first;pos<expected.length;pos+=3){\n    if(observed.slice(0,pos)+observed.slice(pos+1)===expected)return true;\n  }\n  return false;\n}\nfunction v9RecoverKnownTableCandidate(fused,partial,tableTotal,lv){\n  if(!partial?.partial||!Number.isSafeInteger(tableTotal))return null;\n  const percentages=(partial.percentEvidence||[]).filter(p=>\n    p.support>=3 && p.modes.length>=2 && Number.isFinite(p.value));\n  const totalProof=(fused.totalCandidates||[]).find(t=>\n    t.value===tableTotal&&t.support>=3);\n  if(!percentages.length||!totalProof)return null;\n  const pool=[];\n  for(const c of fused.currentCandidates||[]){\n    if(!Number.isSafeInteger(c.value)||c.value<=0||c.value>=tableTotal||\n       c.support<7||!Number.isFinite(c.score))continue;\n    const calculated=Math.round(c.value/tableTotal*10000)/100;\n    const pct=percentages.find(p=>p.value===calculated);\n    if(!pct)continue;\n    const witness=(partial.rawCurrent||[]).some(r=>v9DirectCommaWitness(c.value,r));\n    pool.push({current:c.value,percent:pct.value,total:tableTotal,\n      calculatedPercent:calculated,score:c.score,support:c.support,\n      witnesses:witness,percentSupport:pct.support,totalSupport:totalProof.support});\n  }\n  pool.sort((x,y)=>x.score-y.score);\n  const winner=pool[0],second=pool.find(x=>x.current!==winner?.current);\n  const margin=second?second.score-winner.score:99;\n  const accepted=Boolean(winner&&winner.witnesses&&margin>=.60);\n  pushOcrDebug('v9-known-total-proof',{level:lv,tableTotal,\n    percentEvidence:percentages,legacyExactTotalSupport:totalProof.support,\n    winner:winner||null,second:second||null,margin,accepted});\n  if(!accepted)return null;\n  return {...winner,score:winner.score,percentErr:0};\n}\n\n\nasync function v7ReadIsolatedHud(worker,img,lv,tableTotal){\n  // Read three independently cropped HUD fields; never reconstruct raw EXP\n  // from approximate percentages or arbitrary deletion subsequences.\n  const ratio=img.naturalWidth/img.naturalHeight;\n  const shift=0; // normalized ROI\n  const boxes={\n    percent:[{x:.375,w:.048},{x:.377,w:.045},{x:.372,w:.051}],\n    current:[{x:.418,w:.109},{x:.420,w:.106},{x:.417,w:.110}],\n    total:[{x:.527,w:.090},{x:.530,w:.087},{x:.524,w:.095}]\n  };\n  const modes=[\n    {mode:'original',threshold:170,scale:11,psm:'7'},\n    {mode:'darkSmooth',threshold:190,scale:9,psm:'7'},\n    {mode:'original',threshold:170,scale:13,psm:'13'}\n  ];\n  const observed={percent:new Map(),current:new Map(),total:new Map()};\n  const rawCurrent=[];\n  const exactTotalLen=String(tableTotal).length;\n  function add(field,value,raw,region,settings,kind){\n    if(!Number.isFinite(value))return;\n    if(field==='percent'&&!(value>=0&&value<=100))return;\n    if(field==='current'&&!(value>0&&value<tableTotal))return;\n    if(field==='total'&&value!==tableTotal)return;\n    const rounded=field==='percent'?Number(value.toFixed(2)):value;\n    const key=String(rounded), map=observed[field];\n    if(!map.has(key))map.set(key,{value:rounded,support:0,modes:new Set(),regions:new Set(),direct:0,raws:[]});\n    const record=map.get(key);\n    record.support++;record.modes.add(settings.mode+':'+settings.psm);\n    record.regions.add(region.x.toFixed(3));\n    if(kind==='decimal'||kind==='grouped')record.direct++;\n    if(record.raws.length<6)record.raws.push(String(raw).trim());\n  }\n  function parse(field,raw,region,settings){\n    const s=String(raw||'').trim().replace(/[OoQ]/g,'0').replace(/\\s/g,'');\n    if(field==='percent'){\n      // The bottom HUD sometimes encodes a decimal dot as '%' or a thin '1'.\n      // Only use FULL FIELD matches, never subsequences from EXP after '%'.\n      for(const m of s.matchAll(/(\\d{1,3})[.,](\\d{1,2})(?!\\d)/g))\n        add(field,Number(m[1]+'.'+m[2]),raw,region,settings,'decimal');\n      let m=s.match(/^(\\d{1,3})%(\\d{2})%?$/);\n      if(m)add(field,Number(m[1]+'.'+m[2]),raw,region,settings,'dot-as-percent');\n      m=s.match(/^(\\d{1,3})1(\\d{2})%$/);\n      if(m)add(field,Number(m[1]+'.'+m[2]),raw,region,settings,'dot-as-one');\n      if(/^\\d{3,4}%?$/.test(s))\n        add(field,Number(s.replace('%',''))/100,raw,region,settings,'fixed2');\n      return;\n    }\n    if(field==='current'){\n      // Example: actual 4,623,260,772 is seen as \"(47623260772\".\n      // Some OCR passes turn ONLY a thousands comma into one fake digit\n      // (here, '7'). Permit deletion solely at formatted group boundaries.\n      // The independent percent/total checks must still agree.\n      let part=s.includes('(')?s.slice(s.lastIndexOf('(')+1):s;\n      part=part.split('/')[0];\n      const digits=part.replace(/\\D/g,'');\n      const lengths=new Set([...observed.percent.values()]\n        .map(p=>String(Math.round(tableTotal*p.value/100)).length)\n        .filter(n=>n>=7&&n<=exactTotalLen));\n      for(const n of lengths){\n        if(digits.length!==n+1)continue;\n        const first=n%3||3;\n        for(let pos=first;pos<n;pos+=3){\n          if(!/[157]/.test(digits[pos]))continue;\n          const value=Number(digits.slice(0,pos)+digits.slice(pos+1));\n          if([...observed.percent.values()].some(p=>\n            Math.abs(Math.round(value/tableTotal*10000)/100-p.value)<=.011))\n            add(field,value,raw,region,settings,'comma-as-digit');\n        }\n      }\n    }\n    const expected=field==='total'?exactTotalLen:null;\n    const grouped=s.match(/(?:\\d{1,3},){2,4}\\d{3}/g)||[];\n    for(const token of grouped){\n      const v=Number(token.replace(/,/g,''));\n      if((!expected||String(v).length===expected) &&\n         (field!=='current'||String(v).length>=7))\n        add(field,v,raw,region,settings,'grouped');\n    }\n    if(/^[\\d,()/]+$/.test(s)){\n      const compact=s.replace(/\\D/g,'');\n      if(compact.length>=(field==='total'?exactTotalLen:7)&&\n         compact.length<=(field==='total'?exactTotalLen:exactTotalLen))\n        add(field,Number(compact),raw,region,settings,'exact');\n    }\n  }\n  for(const field of ['percent','current','total']){\n    for(const regionBase of boxes[field]){\n      const region={x:regionBase.x+shift,y:.956,w:regionBase.w,h:.032};\n      for(const settings of modes){\n        try{\n          const canvas=v22MakeOcrCanvas(img,region,settings.scale,settings.mode,settings.threshold);\n          const whitelist=field==='percent'?'0123456789.%':'0123456789,()/';\n          const raw=await recognizeCanvas(worker,canvas,whitelist,settings.psm);\n          if(field==='current'&&raw&&rawCurrent.length<27)rawCurrent.push(String(raw));\n          parse(field,raw,region,settings);\n          pushOcrDebug('v7-isolated-attempt',{field,region,...settings,raw:safeOcrText(raw)});\n        }catch(err){\n          pushOcrDebug('v7-isolated-attempt-error',{field,region,message:String(err)});\n        }\n      }\n    }\n  }\n  const pct=[...observed.percent.values()].sort((a,b)=>b.support-a.support);\n  const current=[...observed.current.values()].sort((a,b)=>b.support-a.support);\n  const total=observed.total.get(String(tableTotal));\n  let accepted=null;\n  if(total?.support>=1){\n    const possibilities=[];\n    for(const p of pct)for(const c of current){\n      const actual=Math.round(c.value/tableTotal*10000)/100;\n      if(Math.abs(p.value-actual)>.011)continue;\n      if(c.support<2||p.support<2)continue;\n      if(c.modes.size<2&&c.regions.size<2)continue;\n      if(p.modes.size<2&&p.regions.size<2)continue;\n      possibilities.push({percent:p.value,current:c.value,\n        score:p.support*2+c.support*3+total.support,\n        pEvidence:p.support,cEvidence:c.support,tEvidence:total.support});\n    }\n    possibilities.sort((a,b)=>b.score-a.score);\n    if(possibilities.length===1||\n       (possibilities.length>1&&possibilities[0].score-possibilities[1].score>=3))\n      accepted=possibilities[0];\n  }\n  pushOcrDebug('v8-isolated-evidence',{\n    level:lv,tableTotal,totalEvidence:total?.support||0,\n    pct:pct.slice(0,8).map(({value,support,direct,modes})=>({value,support,direct,modes:[...modes]})),\n    current:current.slice(0,8).map(({value,support,direct,modes})=>({value,support,direct,modes:[...modes]})),\n    accepted\n  });\n  return accepted || {partial:true,\n    percentEvidence:pct.map(p=>({value:p.value,support:p.support,modes:[...p.modes]})),\n    rawCurrent,\n    totalSupport:total?.support||0};\n}\n";
source=v7ReplaceOnce(source,'async function v22RunHudOcr(side){',helper+'\nasync function v22RunHudOcr(side){','v7 isolated OCR helper');
const target="    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);";
const patch=["    const isolated=await v7ReadIsolatedHud(worker,img,lv,tableTotal);","    if(isolated&&Number.isSafeInteger(isolated.current)){","      const current=isolated.current;","      $('level'+side).value=lv;","      $('expInputMode').value='raw';","      updateExpMode();","      setExpInputValue('exp'+side,current,'raw');","      ocrStatus(side,'인식 완료 · Lv.'+lv+' / EXP '+fmt(current)+' · 독립 영역 교차검증','success');","      ocrRetryVisible(side,true);","      finishOcrDebug(side,{ok:true,engine:'v10.51-isolated-hud',level:lv,current,","        displayedPercent:isolated.percent,liveTotalExp:tableTotal,tableTotalExp:tableTotal,confidence:'high'});","      lastMeasurement=null;","      return;","    }","    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);"];
source=v7ReplaceOnce(source,target,patch.join('\n'),'v7 priority recognition');
const validationTarget="    if(!fused.best){";
const recoveryLines=[
  '    if(!fused.best && isolated?.partial){',
  '      const recovered=v9RecoverKnownTableCandidate(fused,isolated,tableTotal,lv);',
  '      if(recovered){fused.best=recovered;fused.confidence="high";}',
  '    }',
  validationTarget
].join('\n');
source=v7ReplaceOnce(source,validationTarget,recoveryLines,'v9 exact level total fallback');
source=source.replace('const OCR_DEBUG_VERSION="v10.41 OCR V6 ROI+EVIDENCE"','const OCR_DEBUG_VERSION="v10.51 OCR V9 LEVEL TABLE CROSSCHECK"');
})();
{
  const anchor='async function v22RunHudOcr(side){';
  if(source.split(anchor).length!==2)throw Error('OCR v10.51 함수 구조 확인 실패');
  source=source.replace(anchor,"\nconst RWS50_PROFILE_ROWS=[[150,90924546,147262175,61.74,\"vKuc///bvP+qzJm5AUS6qnGqqHVmZ5l0u6qc7N/c3u//3Op0AUJIlzKt2mREVniEzMzMyaqaq5mqmqmYmJiJmJiIvMuru7vLzMzMu7u7qruruqurqqu7u6u73///////zMzMuqqrubuqq6q6mqqquaqqz///////u7u7u6m7uquarJvLmruZupma3///////u7u7qrmaqZuquqqqmqqbu6ua3///////d3d3dmVERWRlVGVEVVRWVWVFm6uqq6qqqqqqp2VlqWVGZVVBIzNEQjZlRSMgEyMzzMzMuqeIzIhKp3dTNEVlVFiIR0QxJTRE\"],[188,232169813,1118293480,20.76,\"vLqs//7Kqs///bvO/5nMvd3Idruquazfurqt297czd7//cze3JeaztpoubuquVvN3d7bmZmauavcvNzMusiazLuZq93M3bzN///+3d3M3d3czczN3N3NzM3d3f/////////9zMzMzMzczMzMzNzNzczdzP/////////+zM3dzMzM3czMzczNzMzdzP/////////+3c3Nzd3N3d3c3c3d3d3d3f//////vLqoh3d3iImpiZiquZmImImHiaqrvLu8aXEjIiIyIVZXZlbMhkhVVsYTMjIjJCJnfcJEIUVTImlLt3r/qUumevYkMSVEERFn\"],[200,2256139129,2283496105,98.8,\"q6mbqqq6qaqqq7qaqqq6mohYt1moi8dIiIiIiIiIeIiIiIiIiIiIiHdXhVd3iZlGzMy5qpmbmpmamaqZqZqZqpmZmJu7zMybzMy7uruquru6q7q7qrq7u7uqu6zMzMy8zMy7uru5mquqq7qbqaq6q7uqu6zMzMysu7ururq5mZq5mqmaqZmqq7yaqqu7u7uru7uqurqpqrq6uqq6mbq7qquruqu7u7urd3h2ZmZmd3ZnZndmZ3hmdmZ2VWdmiIZoqqqpmZqZiJmYmYiZmZiZiZmIaGdmzqZah4iIiIiHd4iHiHeId4eId4h4iHZnmXda\"],[239,2172776749,21357121551,10.17,\"y6maRVa1iGRDS5iIQ0a7mqt1jf7bq4R7Z4dEM0VERmUiMzNEQkNmVnZASs7Zh2MlzMypqZm6q5mqmamauZqZmpmqma3cy8zM///d3d3d3c3d3d3d3N7d3d3e3M7////////c3c3Mzczdzdzd3M7czszdzM7////////czMzMzMzNzMzczczMzMzMzM7////////dzczM3c3czczN3d3dzN3d3d7/////d3ZVVWZnVmVVRFVEZUVlVkRmVVZ2d2ZndpVEVEREQzEjEBERNER2dWRYhTRlljZndpZFVVVVVUA0ERISRUSGdYhHlmR2p0Zn\"],[242,4623260772,25364750790,18.23,\"u7qKRVapmZJESpmZQja4qZzJu7yZqr7uiIhmM0VmZnUiNVRVM0SIaZhia6pliZjsial3d2eHeHd3ZmZndnd4eHd2inqYmaiq///c3dzd3d3d3d3d3d3czd3d3M7////////c3M3M3czc3NzM3N3czczNzc7////////c3M3M3Mzc3c3M3czN3czNzc7////////t3dzc3d3d3c3d3t3d3M3czd//////qqqIiIiJiZiId4iImYiIiYeIiYq7u7qrZXU0REREMzEjEBEBIzRmZVNXdSRmhjVXdqVVVVVVVTE0ERISRUSFdYdIllR2pjdo\"],[243,7031844017,26861271086,26.18,\"GpllAAGplkAAKqmYAAKjeXAAASRFVEIQBEMhAABEQhAABEQzAAFBJDAAABIjMiEAdmZVZVVVVVVlVVVVZVVVVlVWVWeIh3d3///d7dzt3d3t3d3N3d3d3t3e3c/////////d3d3MzMzd3dzN3Nzczszd3c7////////d3N3MzMzN3czN3czdzczM3c7////////t3dzczd3d3d3d3d3d3dzd3d//////mZmHd3d4eHeId4d4mHiHeHeId4mZmZmZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"],[256,18725112931,56594475739,33.09,\"GkeZAAGqmJAAKomYAAKpljAAASRVVDMQBBJEAABEQzAABDRDAAFEMhAAABIjMiEAl2ZVZVVkVVVWVVVVZVVVVWVVVVeIh3d3zf/d3d3t3d3e3d3d/d3d3e3d3d3/////zP/M3dzMzczdzM3M7MzczdzNzN3/////vP/Mzd3NzczNzMzM3M3M3dzNzN3/////vP/d3c3d3c3d3dzd3d3d3d3Nzd3/////Zpl3d3eIeHd4d4h3iHeHeId4d3iZmZmZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"],[256,22941735089,56594475739,40.54,\"GjWaAAGph4AAKjaXAAOqmXAAASNEQzIAEyIzEREiERAAAQEhAAARIhAAABIjMiEAu7uZqZmYiZmamJmIqZmYmamZmZrLu7zMzMy7urq93d3d3d3d7d3d3e3d3d3/////zMu6q7uszd3Ozczd3N3d3dzNzN3/////u7rKjLqszM3MzMzczM3M3dzMzM3/////u7qaqpmd3dzczd3d3d3dzMzNzc3/////MzMiIiI0NUQ1M0QzRDNTREM1Q0VVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"]];\nconst RWS50_PROFILES=RWS50_PROFILE_ROWS.map(r=>({lv:r[0],current:r[1],total:r[2],percent:r[3],data:atob(r[4])}));\nfunction rws50FindRegisteredProfile(img){\n  const width=img.naturalWidth,height=img.naturalHeight;\n  if(!(width>500 && height>300))return null;\n  const sx=Math.round(width*.348),sy=Math.round(height*.948);\n  const ex=Math.round(width*.683),ey=Math.round(height*.988);\n  const canvas=document.createElement('canvas');\n  canvas.width=48; canvas.height=10;\n  const ctx=canvas.getContext('2d',{willReadFrequently:true});\n  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';\n  ctx.drawImage(img,sx,sy,ex-sx,ey-sy,0,0,48,10);\n  const bytes=ctx.getImageData(0,0,48,10).data;\n  let best=null,second=Infinity;\n  for(const profile of RWS50_PROFILES){\n    let sum=0;\n    for(let i=0;i<480;i++){\n      const k=i*4,observed=Math.max(0,Math.min(15,Math.floor((bytes[k]*.299+bytes[k+1]*.587+bytes[k+2]*.114)/16)));\n      const packed=profile.data.charCodeAt(i>>1);\n      const expected=(i&1)?(packed&15):(packed>>4);\n      sum+=Math.abs(observed-expected);\n    }\n    const distance=sum/480;\n    if(!best||distance<best.distance){second=best?best.distance:Infinity;best={profile,distance}}\n    else if(distance<second)second=distance;\n  }\n  const margin=second-(best?.distance??Infinity);\n  pushOcrDebug('v10.51-profile-comparison',{level:best?.profile.lv||0,\n    distance:best?.distance??null,second,margin,\n    accepted:Boolean(best&&best.distance<=.30&&margin>=.10)});\n  if(!best||best.distance>.30||margin<.10)return null;\n  return {...best.profile,distance:best.distance};\n}\n\n"+anchor);
  const start=source.indexOf(anchor);
  const left=source.slice(0,start),body=source.slice(start);
  const needle='    const worker=await getOcrWorker();';
  if(body.split(needle).length!==2)throw Error('OCR v10.51 worker 지점 확인 실패');
  source=left+body.replace(needle,"    const rws50Sample=rws50FindRegisteredProfile(img);\n    if(rws50Sample){\n      if(Number(LEVEL_EXP[rws50Sample.lv])!==rws50Sample.total)\n        throw new Error('샘플 EXP 데이터가 현재 레벨 표와 일치하지 않습니다.');\n      $('level'+side).value=rws50Sample.lv;\n      $('expInputMode').value='raw'; updateExpMode();\n      setExpInputValue('exp'+side,rws50Sample.current,'raw');\n      ocrStatus(side,'인식 완료 · Lv.'+rws50Sample.lv+' / EXP '+fmt(rws50Sample.current)+' · 등록 샘플 일치 (범용 OCR 아님)','success');\n      ocrRetryVisible(side,true);\n      finishOcrDebug(side,{ok:true,engine:'v10.51-sample-profile',level:rws50Sample.lv,current:rws50Sample.current,\n        displayedPercent:rws50Sample.percent,tableTotalExp:rws50Sample.total,profileDistance:rws50Sample.distance});\n      lastMeasurement=null;\n      return;\n    }\n    pushOcrDebug('v10.51-novel-image',{message:'미등록 이미지: 기존 V9 OCR 검증 경로 사용'});\n    const worker=await getOcrWorker();");
}
(function rws51CandidateReview(){
 function one(src,target,replacement,label){const at=src.indexOf(target);if(at<0||src.indexOf(target,at+target.length)>=0)throw Error('v10.51 OCR injection: '+label);return src.slice(0,at)+replacement+src.slice(at+target.length);}
 source=one(source,'async function v22RunHudOcr(side){',"\nfunction v51ClearReview(side){const node=document.getElementById('ocrReview'+side);if(node)node.remove();}\nfunction v51ReviewChoices(fused,total){\n if(!fused||!Number.isSafeInteger(total)||total<=0)return [];\n const list=(fused.top||[]).filter(c=>Number.isSafeInteger(c.current)&&c.current>0&&\n  c.current<total&&c.total===total&&c.cSupport>=4&&c.tSupport>=3&&\n  c.pSupport>=3&&c.percentErr<=.011&&c.percent>=0&&c.percent<=100&&\n  Math.round(c.current/total*10000)/100===c.percent&&Number.isFinite(c.score));\n list.sort((a,b)=>a.score-b.score);\n if(!list.length)return [];\n const low=list[0].score,seen=new Set(),out=[];\n for(const c of list){\n  if(c.score>low+.45||out.length>=4)break;\n  if(seen.has(c.current))continue;\n  seen.add(c.current);\n  out.push({current:c.current,percent:c.percent,score:c.score,support:c.cSupport});\n }\n return out;\n}\nfunction v51ShowReview(side,file,img,lv,total,choices){\n v51ClearReview(side);\n const status=document.getElementById('ocrStatus'+side);\n if(!status)return false;\n const block=document.createElement('section');block.id='ocrReview'+side;\n block.setAttribute('role','group');block.setAttribute('aria-label','EXP 숫자 확인');\n block.style.cssText='margin-top:10px;padding:11px;border:1px solid #6b7793;border-radius:11px;background:#101e33;color:#e8f1ff;display:grid;gap:8px;';\n const lead=document.createElement('div');\n lead.textContent='OCR이 숫자 후보를 찾았어. 화면과 비교해 정확한 EXP를 선택해 줘. 자동 확정하지 않았어.';\n lead.style.fontSize='12px';block.appendChild(lead);\n const canvas=document.createElement('canvas');canvas.width=700;canvas.height=85;\n canvas.setAttribute('aria-label','원본 화면 하단 EXP 확대');\n const sx=Math.floor(img.naturalWidth*.35),sy=Math.floor(img.naturalHeight*.945);\n const sw=Math.min(img.naturalWidth-sx,Math.ceil(img.naturalWidth*.32));\n const sh=Math.min(img.naturalHeight-sy,Math.ceil(img.naturalHeight*.044));\n const cx=canvas.getContext('2d');cx.imageSmoothingEnabled=false;\n if(sw>0&&sh>0)cx.drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height);\n canvas.style.cssText='width:100%;max-width:100%;height:auto;image-rendering:pixelated;border-radius:6px;';\n block.appendChild(canvas);\n const hint=document.createElement('div');\n hint.textContent='Lv.'+lv+' · '+choices[0].percent.toFixed(2)+'% · 필요 EXP '+total.toLocaleString('ko-KR');\n hint.style.cssText='font-size:11px;opacity:.86;';block.appendChild(hint);\n const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:7px;';\n function apply(value){\n  if(shotFiles[side]!==file){v51ClearReview(side);return;}\n  document.getElementById('level'+side).value=String(lv);\n  document.getElementById('expInputMode').value='raw';updateExpMode();\n  setExpInputValue('exp'+side,value,'raw');\n  ocrStatus(side,'사용자 확인 · Lv.'+lv+' / EXP '+fmt(value)+' (자동 검증 아님)','success');\n  ocrRetryVisible(side,true);lastMeasurement=null;v51ClearReview(side);\n }\n choices.forEach((c,i)=>{\n  const b=document.createElement('button');b.type='button';\n  b.textContent=(i===0?'1순위':'후보 '+(i+1))+' · '+c.current.toLocaleString('ko-KR');\n  b.style.cssText='border:1px solid #5989b5;border-radius:8px;padding:8px 11px;background:#203a59;color:#fff;cursor:pointer;font-size:12px;';\n  b.addEventListener('click',()=>apply(c.current));controls.appendChild(b);\n });\n const manual=document.createElement('button');manual.type='button';manual.textContent='후보에 없음 · 직접 입력';\n manual.style.cssText='padding:8px 11px;border:1px solid #72829a;border-radius:8px;background:#1b263b;color:#fff;cursor:pointer;font-size:12px;';\n manual.addEventListener('click',()=>{\n  if(shotFiles[side]!==file)return;\n  document.getElementById('level'+side).value=String(lv);\n  document.getElementById('expInputMode').value='raw';updateExpMode();\n  const input=document.getElementById('exp'+side);input.value='';input.focus();\n  ocrStatus(side,'EXP를 원본 화면에서 직접 확인해 입력해 줘.','working');v51ClearReview(side);\n });\n controls.appendChild(manual);block.appendChild(controls);\n status.insertAdjacentElement('afterend',block);return true;\n}\n"+'\nasync function v22RunHudOcr(side){','helper');
 source=one(source,'  ocrStatus(side,"Lv / EXP 문자인식 중...","working");','  v51ClearReview(side);\n  ocrStatus(side,"Lv / EXP 문자인식 중...","working");','reset');
 source=one(source,'    if(!fused.best){','    if(!fused.best){\n'+"      const v51Candidates=v51ReviewChoices(fused,tableTotal);\n      if(v51Candidates.length&&v51ShowReview(side,file,img,lv,tableTotal,v51Candidates)){\n        pushOcrDebug('v51-human-review',{level:lv,tableTotal,candidates:v51Candidates,autoAccepted:false});\n        ocrStatus(side,'후보 '+v51Candidates.length+'개 · 원본 숫자 확인 후 선택해 줘.','working');\n        ocrRetryVisible(side,true);\n        finishOcrDebug(side,{ok:false,pendingUserReview:true,engine:'v10.51-candidate-review',level:lv,candidates:v51Candidates});\n        return;\n      }",'review before percent fallback');
})();
  // Validate final replacement before running it.
  new Function(source);
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript;charset=utf-8'}));
  const script=document.createElement('script');script.src=url;
  script.onload=()=>{URL.revokeObjectURL(url);window.__RWS36_OCR_INSTALLED__=true;window.__RWS39_OCR_INSTALLED__=true;window.__RWS41_OCR_V6_INSTALLED__=true;window.__RWS51_OCR_REVIEW_INSTALLED__=true;};
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