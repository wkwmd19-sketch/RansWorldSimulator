(function installRWS1027(){
  const V="v10.27";
  const exp251to300=[
    42490734720,44997688068,47652551664,50464052213,53441431293,56594475739,59933549808,63469629247,67214337372,71179983277,
    75379602291,79826998826,84536791756,89524462470,94806405756,100399983695,106323582733,112596674115,119240000000,126275160000,
    133725394440,141615047685,149970335499,158818585293,168188881825,178112025853,188620635378,199749252866,211535250000,224014991853,
    237231876372,251228557078,266051041946,281748053421,298372308433,315976274631,334617618932,354360058449,375267601897,397408072709,
    420855148999,445685602790,471981053354,499827935502,529317783697,560550000000,593622450000,628643407782,665736000000,693062287815
  ];
  const rp251to300=[
    1292153,1365580,1443185,1525207,1611898,1703523,1800362,1902717,2010898,2125238,
    2246089,2373821,2508828,2651523,2802347,2961761,3130255,3308349,3496589,3695554,
    3905857,4128142,4363096,4611439,4873937,5151397,5444673,5754668,6082335,6428683,
    6794780,7181752,7590790,8023156,8480180,8963271,9473917,10013692,10584259,11187377,
    11824906,12498809,13211167,13964174,14760154,15601562,16490993,17431192,18425058,19475660
  ];
  const history=[
    ["v10.27","Lv.251~300 필요 EXP 및 환생 RP 실측 데이터 반영, Lv.301~350 데이터 유지. 파티퀘스트 장기 소요시간 계산 오류 수정. 탐색 상한 및 먼 미래 예측 안내 개선. 버전별 변경내역 팝업과 제작자 사진 이스터에그 분리."],
    ["v10.26~v10.26.1","컬렉션 칭호 증폭 15종 이미지 적용 및 중앙정렬, 이미지 표시 문제 보완."],
    ["v10.25","RP 상점 컬렉션 칭호 효과 증폭 15종 추가. 각 Lv당 +1%, 최대 Lv.150, 필요 RP는 레벨마다 60,000씩 증가."],
    ["v10.24","Lv.301~350 기본 환생 RP 원본값으로 수정. 획득량 +500% 적용 시 ×6 중복 계산 오류 해결."],
    ["v10.23","Lv.300~350 필요 경험치표 업데이트 및 상위 레벨 계산 지원."],
    ["v10.22","화면 캡처 OCR의 레벨 숫자 판별 오류 수정. 현재 EXP / 필요 EXP / 진행률 후보 교차검증과 OCR 로그 유지."],
    ["v10.17~v10.21","하단 HUD OCR 단계별 개선, 디버그 로그 추출, 후보 조합 검증 엔진 도입."],
    ["v10.13~v10.16","랜스월드 창 직접 캡처 기능과 OCR 인식 개선."],
    ["v10.11~v10.12","파티퀘스트의 09:00 갱신·매일 반복 반영, RP 상점/사이트 이스터에그 및 설명 개선."],
    ["v10.7~v10.10","RP 상품 비용 가설/추정 표시, 간단히 보기·자세히 보기, JSON 저장·불러오기, 수치 입력 UI 개선."],
    ["v9.x~v10.6","경험치 효율 계산기 OCR, 환생 타이밍 추천, 파티퀘스트 EXP 설정과 펫 특성 이스터에그 등 기능 확장."],
    ["초기 버전 · v6~v8","RP 상점 상품별 필요 RP 계산, 잠금, 전체 초기화, 데이터 저장 기능 및 UI 구성."]
  ];
  function simulateFixed(requiredExp,now,rate,cfg){
    if(!(requiredExp>0))return {hours:0,eta:new Date(now.getTime()),pqRuns:0,pqExp:0};
    if(!Number.isFinite(requiredExp)||!(rate>0)||!Number.isFinite(rate))throw new Error("파티퀘스트 계산에 사용할 경험치 또는 EXP/h가 올바르지 않습니다.");
    if(!cfg.enabled){
      const hours=requiredExp/rate;
      return {hours,eta:new Date(now.getTime()+hours*3600000),pqRuns:0,pqExp:0};
    }
    let left=requiredExp,t=new Date(now.getTime()),pqRuns=0,pqExp=0;
    let queue=(cfg.currentRuns||[]).map(x=>x.reward);
    let nextReset=nextPartyQuestReset(t);
    const reward=Number(cfg.futureReward||0);
    let checks=0;
    while(left>0){
      if(++checks>300000)throw new Error("매우 먼 미래의 목표로 파티퀘스트 계산 한도를 초과했습니다. EXP/h를 확인해 주세요.");
      if(queue.length){
        const atReset=t.getHours()===9&&t.getMinutes()===0&&t.getSeconds()===0&&t.getMilliseconds()===0;
        if(cfg.futureEnabled&&atReset&&queue.length===3&&reward>0){
          const nextDay=new Date(t.getTime());nextDay.setDate(nextDay.getDate()+1);
          const dayHours=(nextDay.getTime()-t.getTime())/3600000;
          if(dayHours===24){
            const dailyGain=rate*23+reward*3;
            const skipDays=Math.max(0,Math.floor((left-1)/dailyGain));
            if(skipDays>=2){
              const future=new Date(t.getTime());future.setDate(future.getDate()+skipDays);
              if((future.getTime()-t.getTime())/3600000===24*skipDays){
                left-=dailyGain*skipDays;
                t=future;nextReset=new Date(future.getTime());nextReset.setDate(nextReset.getDate()+1);
                pqRuns+=skipDays*3;pqExp+=skipDays*3*reward;
                continue;
              }
            }
          }
        }
        const gain=queue.shift();
        t=new Date(t.getTime()+PARTY_QUEST_MINUTES*60000);
        pqRuns++;pqExp+=gain;left-=gain;
        while(cfg.futureEnabled&&t>=nextReset){
          queue.push(reward,reward,reward);nextReset.setDate(nextReset.getDate()+1);
        }
        continue;
      }
      if(!cfg.futureEnabled){t=new Date(t.getTime()+left/rate*3600000);left=0;break;}
      const remainingHours=(nextReset.getTime()-t.getTime())/3600000;
      if(remainingHours<0)throw new Error("파티퀘스트 09시 갱신 시각 계산에 실패했습니다.");
      const grindExp=rate*remainingHours;
      if(left<=grindExp){t=new Date(t.getTime()+left/rate*3600000);left=0;break;}
      left-=grindExp;t=new Date(nextReset.getTime());
      queue.push(reward,reward,reward);nextReset.setDate(nextReset.getDate()+1);
    }
    if(left>0||!Number.isFinite(t.getTime()))throw new Error("목표 Lv까지의 소요시간 계산을 완료하지 못했습니다.");
    return {hours:(t.getTime()-now.getTime())/3600000,eta:t,pqRuns,pqExp};
  }
  function renderNewCalc(){
    setError("rbError","");
    const start=parseLocalDate($("rbStart").value),now=parseLocalDate($("rbNow").value),cur=Math.floor(Number($("rbLevel").value));
    const mode=$("rbExpMode").value,v=parseNumInput($("rbExp").value),rate=parseRate($("rbRate").value);
    const targetRaw=$("rbTargetLevel").value.trim(),target=targetRaw===""?null:Math.floor(Number(targetRaw));
    let max=Math.floor(Number($("rbMaxLevel").value));
    if(!start||!now)return setError("rbError","시각은 YYYY-MM-DD HH:MM:SS 형식으로 입력해 주세요.");
    const elapsed=(now-start)/3600000;if(elapsed<=0)return setError("rbError","현재 시각은 환생 시작 시각보다 뒤여야 합니다.");
    if(!(cur>=1&&cur<=350))return setError("rbError","현재 Lv을 확인해 주세요.");
    if(!validProgress(cur,v,mode))return setError("rbError","현재 EXP 값을 확인해 주세요.");
    if(!(rate>0))return setError("rbError","최근 경험치 효율(/h)를 예: 315.55억 또는 1.1천만 형식으로 입력해 주세요.");
    if(target!==null&&!(target>=cur&&target<=350))return setError("rbError","목표 Lv은 현재 Lv 이상 Lv.350 이하로 입력해 주세요.");
    if(target!==null&&target>max)max=target;max=clamp(max,cur+1,350);$("rbMaxLevel").value=max;
    const pqConfig=getPartyQuestConfig();
    const pqError=validatePartyQuestConfig(pqConfig);
    if(pqError)return setError("rbError",pqError);
    const raw=progressRaw(cur,v,mode),mult=rpMultiplier(),currentRp=adjustedRp(cur,mult),currentCycle=currentRp/elapsed;
    const candidates=[];
    for(let lv=cur;lv<=max;lv++){
      const extraExp=lv===cur?0:expToLevel(cur,raw,lv);if(!Number.isFinite(extraExp))continue;
      let travel;
      try{travel=simulateTargetTimeWithPartyQuest(extraExp,now,rate,pqConfig);}
      catch(e){return setError("rbError",`Lv.${lv} 예상 도달 계산 실패: ${e?.message||e}`);}
      const extraH=travel.hours,totalH=elapsed+extraH,rp=adjustedRp(lv,mult),gain=rp-currentRp;
      if(!Number.isFinite(extraH)||!(totalH>0)||!Number.isFinite(travel.eta?.getTime()))return setError("rbError",`Lv.${lv} 도달시간 결과가 올바르지 않습니다.`);
      candidates.push({lv,rp,extraH,totalH,eta:travel.eta,pqRuns:travel.pqRuns,pqExp:travel.pqExp,addEff:extraH>0?gain/extraH:null,cycleEff:rp/totalH});
    }
    if(!candidates.length)return setError("rbError","추천할 수 있는 Lv 데이터가 없습니다.");
    const ranked=[...candidates].sort((a,b)=>(b.cycleEff-a.cycleEff)||(a.lv-b.lv));
    const r1=ranked[0],r2=ranked[1]||null;
    const suspiciousRange=(r1.lv>cur&&r1.extraH>=168&&max-cur>20);
    if(suspiciousRange)showRangeWarning(cur,r1.lv,max,r1.extraH);
    else $("maxLevelField").classList.remove("warning");
    const peak=ranked[0];
    const peakLossAtMax=((peak.cycleEff-(candidates[candidates.length-1]?.cycleEff||peak.cycleEff))/peak.cycleEff)*100;
    $("precisionNote").innerHTML =
      `<b>추천 기준:</b> 환생 시작부터 각 후보 Lv 도달까지의 <b>누적 RP/h</b>를 비교합니다. `+
      `최근 경험치 효율(/h)가 바뀌면 미래 도달시간이 달라져 추천 Lv도 달라질 수 있습니다.`+
      (peak.lv===max?`<br><b>탐색 범위 상한:</b> Lv.${max}이(가) 범위 내 최고점입니다. 탐색 상한을 높이면 추천 결과가 달라질 수 있습니다.`:"")+
      `<br><b>현재 최고점:</b> Lv.${peak.lv} · ${fmt(Math.round(peak.cycleEff))} RP/h`+
      (max>peak.lv?` · Lv.${max}까지 진행 시 최고점 대비 ${peakLossAtMax.toFixed(2)}% 낮음`:"")+
      (pqConfig.enabled?`<br><b>파티퀘스트 반영:</b> 현재 주기 ${pqConfig.currentRuns.length}회 · 이후 예상 도달일까지 매일 3회 반복 · 1판 20분 고정`:"");
    function desc(x){
      const when=x.lv===cur?"지금 환생":`예상 ${displayTime(x.eta)}`;
      const add=x.addEff===null?"추가 효율 -":`추가 효율 ${fmt(Math.round(x.addEff))} RP/h`;
      const pq=x.pqRuns?` · 파퀘 ${x.pqRuns}회 (${partyQuestRewardText(x.pqExp)})`:"";
      return `${when} · 환생 RP ${fmt(x.rp)}${pq}<br><b>누적 ${fmt(Math.round(x.cycleEff))} RP/h</b> · ${add}`;
    }
    $("rank1Main").textContent=`Lv.${r1.lv}`;$("rank1Desc").innerHTML=desc(r1);
    $("rank2Main").textContent=r2?`Lv.${r2.lv}`:"-";$("rank2Desc").innerHTML=r2?desc(r2):"-";
    $("rbElapsed").textContent=duration(elapsed*3600);$("rbCurrentRp").textContent=fmt(currentRp)+" RP";$("rbCurrentCycle").textContent=fmt(Math.round(currentCycle))+" RP/h";
    const tc=target===null?null:candidates.find(x=>x.lv===target);
    if(tc){
      $("targetBox").style.display="block";$("targetTitle").textContent=`목표 Lv.${tc.lv}`;
      const addText=tc.addEff===null?"-":`${fmt(Math.round(tc.addEff))} RP/h`;
      const pqText=tc.pqRuns?` · 파퀘 ${tc.pqRuns}회 (${partyQuestRewardText(tc.pqExp)}) 포함`:"";
      $("targetText").innerHTML=`예상 도달 ${displayTime(tc.eta)} · 현재부터 ${duration(tc.extraH*3600)}${pqText}<br>환생 RP ${fmt(tc.rp)} · 누적 ${fmt(Math.round(tc.cycleEff))} RP/h · 추가 효율 ${addText}`;
    }else $("targetBox").style.display="none";
    const focus=Math.min(r1.lv,r2?r2.lv:r1.lv),low=Math.max(cur,focus-5),high=Math.min(max,focus+7);
    let rows=candidates.filter(x=>x.lv>=low&&x.lv<=high);
    if(tc&&!rows.some(x=>x.lv===tc.lv))rows=[...rows,tc].sort((a,b)=>a.lv-b.lv);
    $("rbTableBody").innerHTML=rows.map(x=>{
      const cls=[x.lv===r1.lv?"top1":"",r2&&x.lv===r2.lv?"top2":"",target&&x.lv===target?"target":""].filter(Boolean).join(" ");
      const mark=x.lv===r1.lv?' <span style="color:#ffd36a">★</span>':(r2&&x.lv===r2.lv?' <span style="color:#d8dfea">☆</span>':"");
      const addText=x.addEff===null?"-":fmt(Math.round(x.addEff));
      return `<tr class="${cls}"><td>Lv.${x.lv}${mark}</td><td>${x.lv===cur?"현재":displayTime(x.eta)}</td><td>${fmt(x.rp)}</td><td>${addText}</td><td>${fmt(Math.round(x.cycleEff))}</td></tr>`;
    }).join("");
  }
  function installUI(){
    const original=document.querySelector(".version"),egg=document.getElementById("versionEggModal");
    if(!original||!egg||document.getElementById("changelogModal"))return;
    const version=original.cloneNode(true);
    version.textContent=V;
    version.title="업데이트 내역";
    version.setAttribute("role","button");
    version.setAttribute("tabindex","0");
    version.setAttribute("aria-label","업데이트 내역 열기");
    original.replaceWith(version);
    const author=document.querySelector(".author");
    author.id="authorEasterEgg";author.title="사진 보기";
    author.setAttribute("role","button");author.setAttribute("tabindex","0");author.setAttribute("aria-label","사진 이스터에그 열기");
    const css=document.createElement("style");
    css.id="rws-v1027-ui";
    css.textContent=`
      #versionEasterEgg,#authorEasterEgg{cursor:pointer;user-select:none}
      #versionEasterEgg:hover,#versionEasterEgg:focus-visible{color:#c4e3ff;border-color:#669ddd;outline:none}
      #authorEasterEgg{border:0;border-radius:5px;padding:3px 2px}
      #authorEasterEgg:hover,#authorEasterEgg:focus-visible{color:#a4f5d9;text-decoration:underline;outline:none}
      .changelog-backdrop{position:fixed;inset:0;z-index:1800;display:none;place-items:center;padding:18px;background:rgba(3,7,14,.82);backdrop-filter:blur(8px)}
      .changelog-backdrop.show{display:grid}
      .changelog-card{width:min(700px,100%);max-height:min(85vh,820px);display:flex;flex-direction:column;border:1px solid #3b537c;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#1a2943,#11192b);box-shadow:0 30px 90px rgba(0,0,0,.6)}
      .changelog-head{padding:19px 19px 14px;display:flex;justify-content:space-between;gap:14px;align-items:flex-start;border-bottom:1px solid #2c405e}
      .changelog-head h3{font-size:19px;letter-spacing:-.02em;margin:0}
      .changelog-head p{color:#94accd;font-size:11px;margin:6px 0 0}
      #changelogClose{min-width:34px;height:34px;padding:0;border:1px solid #45648e;border-radius:9px;background:#172640;color:#e1efff;font-size:22px;line-height:1}
      .changelog-body{overflow-y:auto;padding:7px 19px 14px}
      .changelog-body section{padding:12px 0;border-bottom:1px solid #2b3d5b}
      .changelog-body section:last-child{border:0}
      .changelog-body .changelog-ver{font-size:13px;color:#acd7ff;font-weight:850}
      .changelog-body p{margin:5px 0 0;color:#ced9ec;font-size:12px;line-height:1.7}
      .changelog-foot{border-top:1px solid #2c405e;padding:10px 19px;margin:0;color:#899bb9;font-size:10px}
      @media(max-width:560px){.changelog-head{padding:15px}.changelog-body{padding:5px 15px}.changelog-head h3{font-size:16px}}
    `;
    document.head.appendChild(css);
    const dialog=document.createElement("div");
    dialog.id="changelogModal";dialog.className="changelog-backdrop";
    dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");
    dialog.setAttribute("aria-labelledby","changelogTitle");dialog.setAttribute("aria-hidden","true");
    dialog.innerHTML=`<div class="changelog-card"><div class="changelog-head"><div><h3 id="changelogTitle">RansWorldSimulator 업데이트 내역</h3><p>주요 기능과 변경사항 요약 · v10.27</p></div><button type="button" id="changelogClose" aria-label="업데이트 내역 닫기">×</button></div><div class="changelog-body">${history.map(x=>`<section><b class="changelog-ver">${x[0]}</b><p>${x[1]}</p></section>`).join("")}</div><p class="changelog-foot">이 내역은 주요 기능 중심의 요약이며 모든 내부 테스트 패치를 개별 나열하지는 않습니다.</p></div>`;
    document.body.appendChild(dialog);
    const openHistory=()=>{dialog.classList.add("show");dialog.setAttribute("aria-hidden","false");document.getElementById("changelogClose").focus();};
    const closeHistory=()=>{dialog.classList.remove("show");dialog.setAttribute("aria-hidden","true");version.focus();};
    const openPhoto=()=>{egg.classList.add("show");document.getElementById("versionEggClose")?.focus();};
    const closePhoto=()=>{egg.classList.remove("show");author.focus();};
    const bind=(el,handler)=>{el.addEventListener("click",handler);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();handler();}});};
    bind(version,openHistory);bind(author,openPhoto);
    document.getElementById("changelogClose").addEventListener("click",closeHistory);
    dialog.addEventListener("click",e=>{if(e.target===dialog)closeHistory();});
    document.getElementById("versionEggClose")?.addEventListener("click",closePhoto);
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(dialog.classList.contains("show"))closeHistory();if(egg.classList.contains("show"))closePhoto();}});
  }
  let tries=0;
  const ready=setInterval(()=>{
    tries++;
    let ok=false;
    try{ok=typeof LEVEL_EXP!=="undefined"&&typeof LEVEL_RP!=="undefined"&&typeof nextPartyQuestReset==="function"&&typeof parseNumInput==="function"&&typeof showRangeWarning==="function"&&!!document.getElementById("calcRbBtn")&&!!document.getElementById("versionEggModal");}catch(_){}
    if(!ok){if(tries>500){clearInterval(ready);console.error("RWS v10.27 install timed out.");}return;}
    clearInterval(ready);
    for(let i=0;i<50;i++){LEVEL_EXP[251+i]=exp251to300[i];LEVEL_RP[251+i]=rp251to300[i];}
    simulateTargetTimeWithPartyQuest=simulateFixed;
    showRangeWarning=function(currentLv,recommendedLv,maxLv,extraHours){
      const suggested=Math.min(maxLv,Math.max(currentLv+1,currentLv+20));
      pendingSuggestedMax=suggested;
      document.getElementById("maxLevelField").classList.add("warning");
      document.getElementById("rangeWarningText").innerHTML=
        `현재 Lv.${currentLv}에서 <b>Lv.${recommendedLv}</b>이(가) 추천되었습니다.<br><br>`+
        `Lv.251~350 경험치와 환생 RP는 최신 제공 데이터로 계산하고 있습니다. 다만 <b>최근 EXP/h가 이후 레벨에서도 일정하다</b>고 가정하므로 장기 예측은 실제 성장 속도와 달라질 수 있습니다.`+
        `${Number.isFinite(extraHours)?`<br>현재 속도 기준 해당 Lv까지 약 <b>${duration(extraHours*3600)}</b>이 예상됩니다.`:""}`+
        `<br><br>필요하다면 탐색 상한을 Lv.${suggested}로 낮춰 가까운 레벨 구간부터 비교할 수 있습니다.`;
      document.getElementById("warningApplyBtn").textContent=`Lv.${suggested} 적용 후 다시 계산`;
      document.getElementById("rangeWarningModal").classList.add("show");
    };
    document.getElementById("calcRbBtn").onclick=renderNewCalc;
    installUI();
    console.info("[RansWorldSimulator v10.27] Data, party quest, recommendation UI, version history applied.");
  },60);
  let n=0;const finalizer=setInterval(()=>{const b=document.querySelector(".version");if(b)b.textContent=V;if(++n>=220)clearInterval(finalizer);},120);
})();
