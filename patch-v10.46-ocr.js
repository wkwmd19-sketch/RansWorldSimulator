// RWS v10.36 · verified OCR fix for HUD level/EXP recognition.
(async()=>{
const BASE="./";
const parts=['patch-v10.22.part1.txt','patch-v10.22.part2.txt','patch-v10.22.part3.txt','patch-v10.22.part4.txt','patch-v10.22.part5.txt'];
try{
  let source=(await Promise.all(parts.map(async path=>{
    const r=await fetch(BASE+path+'?release=10.46',{cache:'no-cache'});
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
const ID='v10.46 OCR V7 ISOLATED HUD';
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
const helper="\nasync function v7ReadIsolatedHud(worker,img,lv,tableTotal){\n  // Read three independently cropped HUD fields; never reconstruct raw EXP\n  // from approximate percentages or arbitrary deletion subsequences.\n  const ratio=img.naturalWidth/img.naturalHeight;\n  const shift=ratio>=1.705?.012:0;\n  const boxes={\n    percent:[{x:.375,w:.048},{x:.377,w:.045},{x:.372,w:.051}],\n    current:[{x:.426,w:.088},{x:.428,w:.085},{x:.423,w:.092}],\n    total:[{x:.513,w:.094},{x:.516,w:.093},{x:.510,w:.100}]\n  };\n  const modes=[\n    {mode:'original',threshold:170,scale:11,psm:'7'},\n    {mode:'darkSmooth',threshold:190,scale:9,psm:'7'},\n    {mode:'original',threshold:170,scale:13,psm:'13'}\n  ];\n  const observed={percent:new Map(),current:new Map(),total:new Map()};\n  const exactTotalLen=String(tableTotal).length;\n  function add(field,value,raw,region,settings,kind){\n    if(!Number.isFinite(value))return;\n    if(field==='percent'&&!(value>=0&&value<=100))return;\n    if(field==='current'&&!(value>0&&value<tableTotal))return;\n    if(field==='total'&&value!==tableTotal)return;\n    const rounded=field==='percent'?Number(value.toFixed(2)):value;\n    const key=String(rounded), map=observed[field];\n    if(!map.has(key))map.set(key,{value:rounded,support:0,modes:new Set(),regions:new Set(),direct:0,raws:[]});\n    const record=map.get(key);\n    record.support++;record.modes.add(settings.mode+':'+settings.psm);\n    record.regions.add(region.x.toFixed(3));\n    if(kind==='decimal'||kind==='grouped')record.direct++;\n    if(record.raws.length<6)record.raws.push(String(raw).trim());\n  }\n  function parse(field,raw,region,settings){\n    const s=String(raw||'').trim().replace(/[OoQ]/g,'0').replace(/\\s/g,'');\n    if(field==='percent'){\n      for(const m of s.matchAll(/(\\d{1,3})[.,](\\d{1,2})(?!\\d)/g))\n        add(field,Number(m[1]+'.'+m[2]),raw,region,settings,'decimal');\n      if(/^\\d{3,5}%?$/.test(s))\n        add(field,Number(s.replace('%',''))/100,raw,region,settings,'fixed2');\n      return;\n    }\n    const expected=field==='total'?exactTotalLen:null;\n    const grouped=s.match(/(?:\\d{1,3},){2,4}\\d{3}/g)||[];\n    for(const token of grouped){\n      const v=Number(token.replace(/,/g,''));\n      if((!expected||String(v).length===expected) &&\n         (field!=='current'||String(v).length>=7))\n        add(field,v,raw,region,settings,'grouped');\n    }\n    if(/^[\\d,()/]+$/.test(s)){\n      const compact=s.replace(/\\D/g,'');\n      if(compact.length>=(field==='total'?exactTotalLen:7)&&\n         compact.length<=(field==='total'?exactTotalLen:exactTotalLen))\n        add(field,Number(compact),raw,region,settings,'exact');\n    }\n  }\n  for(const field of ['percent','current','total']){\n    for(const regionBase of boxes[field]){\n      const region={x:regionBase.x+shift,y:.956,w:regionBase.w,h:.032};\n      for(const settings of modes){\n        try{\n          const canvas=v22MakeOcrCanvas(img,region,settings.scale,settings.mode,settings.threshold);\n          const whitelist=field==='percent'?'0123456789.%':'0123456789,()/';\n          const raw=await recognizeCanvas(worker,canvas,whitelist,settings.psm);\n          parse(field,raw,region,settings);\n          pushOcrDebug('v7-isolated-attempt',{field,region,...settings,raw:safeOcrText(raw)});\n        }catch(err){\n          pushOcrDebug('v7-isolated-attempt-error',{field,region,message:String(err)});\n        }\n      }\n    }\n  }\n  const pct=[...observed.percent.values()].sort((a,b)=>b.support-a.support);\n  const current=[...observed.current.values()].sort((a,b)=>b.support-a.support);\n  const total=observed.total.get(String(tableTotal));\n  let accepted=null;\n  if(total?.support>=1){\n    const possibilities=[];\n    for(const p of pct)for(const c of current){\n      const actual=Math.round(c.value/tableTotal*10000)/100;\n      if(Math.abs(p.value-actual)>.011)continue;\n      if(c.support<2||p.support<2)continue;\n      if(c.modes.size<2&&c.regions.size<2)continue;\n      if(p.modes.size<2&&p.regions.size<2)continue;\n      possibilities.push({percent:p.value,current:c.value,\n        score:p.support*2+c.support*3+total.support,\n        pEvidence:p.support,cEvidence:c.support,tEvidence:total.support});\n    }\n    possibilities.sort((a,b)=>b.score-a.score);\n    if(possibilities.length===1||\n       (possibilities.length>1&&possibilities[0].score-possibilities[1].score>=3))\n      accepted=possibilities[0];\n  }\n  pushOcrDebug('v7-isolated-evidence',{\n    level:lv,tableTotal,totalEvidence:total?.support||0,\n    pct:pct.slice(0,8).map(({value,support,direct,modes})=>({value,support,direct,modes:[...modes]})),\n    current:current.slice(0,8).map(({value,support,direct,modes})=>({value,support,direct,modes:[...modes]})),\n    accepted\n  });\n  return accepted;\n}\n";
source=replaceOnce(source,'async function v22RunHudOcr(side){',helper+'\nasync function v22RunHudOcr(side){','v7 isolated OCR helper');
const target="    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);";
const patch=["    const isolated=await v7ReadIsolatedHud(worker,img,lv,tableTotal);","    if(isolated){","      const current=isolated.current;","      $('level'+side).value=lv;","      $('expInputMode').value='raw';","      updateExpMode();","      setExpInputValue('exp'+side,current,'raw');","      ocrStatus(side,'인식 완료 · Lv.'+lv+' / EXP '+fmt(current)+' · 독립 영역 교차검증','success');","      ocrRetryVisible(side,true);","      finishOcrDebug(side,{ok:true,engine:'v10.46-isolated-hud',level:lv,current,","        displayedPercent:isolated.percent,liveTotalExp:tableTotal,tableTotalExp:tableTotal,confidence:'high'});","      lastMeasurement=null;","      return;","    }","    const fused=await v21RunStructuredHud(worker,img,tableTotal,lv);"];
source=replaceOnce(source,target,patch.join('\n'),'v7 priority recognition');
source=source.replace('const OCR_DEBUG_VERSION="v10.41 OCR V6 ROI+EVIDENCE"','const OCR_DEBUG_VERSION="v10.46 OCR V7 ISOLATED HUD"');
})();
  // Validate final replacement before running it.
  new Function(source);
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript;charset=utf-8'}));
  const script=document.createElement('script');script.src=url;
  script.onload=()=>{URL.revokeObjectURL(url);window.__RWS36_OCR_INSTALLED__=true;window.__RWS39_OCR_INSTALLED__=true;window.__RWS41_OCR_V6_INSTALLED__=true;window.__RWS46_OCR_V7_INSTALLED__=true;};
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