/* RWS v11.25 — per-minute spot history, character Lv, level difference,
 * automatic best-efficiency or explicit history selection for rebirth timing.
 * Per-record memo is kept in the existing session-only saved records.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const STORE='RWS_LOCAL_EXP_SPOTS_v1';
  const RAW='1:달팽이|5:파란 달팽이|7:스포아|11:빨간 달팽이|13:스텀프|16:슬라임|18:돼지|22:주황버섯|24:다크 스텀프|28:리본돼지|30:옥토퍼스|34:초록버섯|36:버블링|40:엑스텀프|42:고스텀프|46:파란버섯|48:스티지|52:주니어 네키|54:뿔버섯|58:다크 엑스텀프|60:우드 마스크|64:좀비버섯|66:스톤 마스크|70:와일드보어|70:아이언보어|72:이블아이|76:페어리|78:리게이터|82:파이어보어|84:커즈아이|88:주니어 레이스|90:주니어 부기|94:루팡|96:콜드아이|100:좀비루팡|102:아이언 호그|106:스켈독|108:카파 드레이크|114:머미독|118:레이스|120:드레이크|124:크로코|126:스톤골렘|130:멜러디|132:스켈레톤 사병|137:다크 스톤골렘|139:믹스골렘|143:레드 드레이크|145:와일드카고|149:스켈레톤 장교|150:아이스 드레이크|154:다크 드레이크|156:타우로마시스|160:스켈레톤 지휘관|163:타우로스피어|166:주니어 스톤볼|169:스톤볼|172:아이스 스톤볼|175:파이어 스톤볼|178:리티|181:주니어 샐리온|184:주니어 라이오너|187:주니어 그류핀|190:다크 리티|193:스타픽시|196:주니어 페페|199:루나픽시|202:러스터픽시|205:샐리온|208:라이오너|211:그류핀|214:주니어 루이넬|217:루이넬|220:흰 모래토끼|223:갈색 모래토끼|226:주니어 카투스|229:벨라모아|232:모래 두더지|235:귀마개 프릴드|238:카투스|241:목도리 프릴드|244:로얄 카투스|247:미요캐츠|250:스콜피언|253:키요|256:모래난쟁이|259:붉은 모래난쟁이|262:모래거인|265:큐브슬라임|268:루모|271:트리플 루모|274:아이언 뮤테|277:강화된 아이언 뮤테|280:미스릴 뮤테|283:강화된 미스릴 뮤테|286:로이드|289:네오 휴로이드|292:호문|295:사이티|298:호문쿨루|301:D.로이|304:호문스큘러|309:주니어 예티|314:헥터|318:다크 주니어 예티|323:화이트팽|327:페페|331:다크 페페|336:예티|340:다크 예티|345:웨어울프|349:예티와 페페|354:다크 예티와 페페|358:라이칸스로프|363:설산의 마녀|367:쿨리 좀비|372:플라이아이|376:마이너 좀비|381:주니어 불독|385:파이어봄|390:불독|394:파이어독|400:브라운테니|406:라츠|412:북치는 토끼|418:처프|424:더키 패밀리|430:핑크테니|436:블랙 라츠|442:치크세이버|448:팬더테니|453:핑크세이버|460:장난감 목마|468:블록퍼스|475:스카이세이버|483:킹 블록퍼스|490:트위터|498:로보토이|505:블록골렘|513:마스터 로보|520:킹 블록골렘|529:티키|538:크로노스|547:틱톡|556:플래툰 크로노스|565:마스터 크로노스|576:버피|586:소울테니|597:레이지 버피|607:마스터 소울테니|618:버푼|628:클라크|639:딥 버푼|649:다크 클라크';
const monsters=RAW.split('|').map(x=>{const i=x.indexOf(':');return {level:Number(x.slice(0,i)),name:x.slice(i+1)};});
const byName=new Map(monsters.map(x=>[x.name.replace(/\s/g,''),x]));
const byLevel=new Map();
for(const m of monsters){if(!byLevel.has(m.level))byLevel.set(m.level,[]);byLevel.get(m.level).push(m);}
const fmt=n=>Number(n).toLocaleString('ko-KR',{maximumFractionDigits:2});
const fmtInteger=n=>Math.round(Number(n)).toLocaleString('ko-KR');
// All per-minute rates use three decimal places, including saved rows and rebirth transfer.
const fmtRate=n=>Number(n).toLocaleString('ko-KR',{minimumFractionDigits:3,maximumFractionDigits:3});
const compactMinuteRate=n=>{
 const value=Number(n),abs=Math.abs(value);
 if(!Number.isFinite(value))return '-';
 const units=[[1e12,'조'],[1e8,'억'],[1e7,'천만'],[1e4,'만']];
 const u=units.find(([scale])=>abs>=scale);
 return u?fmtRate(value/u[0])+u[1]:fmtRate(value);
};
const pct=n=>Math.abs(n).toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2});
const tag=(kind,cls,text)=>{const el=document.createElement(kind);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const getMonster=value=>byName.get(String(value||'').replace(/\s/g,''))||null;
const monsterLabel=x=>(x?.monsterName||'미입력')+(Number.isInteger(x?.monsterLevel)?' (Lv.'+x.monsterLevel+')':'');
const levelDifference=x=>Number.isInteger(x?.monsterLevel)&&Number.isInteger(x?.characterLv)?x.monsterLevel-x.characterLv:null;
const formatDifference=x=>{const v=levelDifference(x);return v==null?'-':(v>0?'+':'')+v;};
const changePercent=(a,b)=>(a/b-1)*100;
const compare=(current,baseline)=>{
 const diff=changePercent(current.perMinute,baseline.perMinute);
 const currentLabel=current.monsterName?monsterLabel(current):'현재 측정값';
 const baselineLabel=baseline.monsterName?monsterLabel(baseline):'최고 저장 기록';
 if(Math.abs(diff)<1e-9)return currentLabel+'의 분당 EXP는 '+baselineLabel+'과 동일합니다.';
 return currentLabel+'의 분당 EXP는 '+baselineLabel+' 대비 '+pct(diff)+'% '+(diff>0?'높습니다.':'낮습니다.');
};
function duration(seconds){
 seconds=Math.floor(Number(seconds)||0);const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
 return h?h+'시간 '+m+'분 '+s+'초':m?m+'분 '+s+'초':s+'초';
}
function normalize(item){
 if(!item||typeof item!=='object')return null;
 const perMinute=Number(item.perMinute)||Number(item.perHour)/60;
 if(!(Number.isFinite(perMinute)&&perMinute>0))return null;
 const char=Number(item.characterLv??item.playerLv);
 const ml=Number(item.monsterLevel);
 const endState=item.endState&&typeof item.endState==='object'?item.endState:null;
 return {
  id:String(item.id||'legacy-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)),
  perMinute,elapsedSec:Number(item.elapsedSec)||0,
  monsterName:String(item.monsterName||''),monsterLevel:Number.isInteger(ml)&&ml>0?ml:null,
  characterLv:Number.isInteger(char)&&char>0?char:null,
  savedAt:item.savedAt||null,endState,
  memo:String(item.memo??'').slice(0,120),
  at:item.at||null
 };
}
let entries=[];
try{
 const all=JSON.parse(sessionStorage.getItem(STORE)||'[]');
 if(Array.isArray(all))entries=all.map(normalize).filter(Boolean).slice(-40);
}catch(e){console.warn('[RWS LOCAL] Temporary record load failed:',e);}
const persist=()=>{try{sessionStorage.setItem(STORE,JSON.stringify(entries.slice(-40)));}catch(e){console.warn('[RWS LOCAL] save failed:',e);}};
let latest=null,scanToken=0,selectedRecordId=null;
const style=tag('style');style.textContent=`
  /* Four equally-sized result cards; keep existing elapsed/gained/per-minute cards. */
  #tab-exp .result-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  #tab-exp .result-grid>.card{min-width:0;box-sizing:border-box}
  #expPerHour{visibility:hidden}#tab-exp .card.result:has(#expPerHour){display:none!important}
  #rwsLocalMonsterMetric{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:clamp(15px,1.4vw,22px)}
  #rwsLocalMonsterMetricCard{position:relative}
  #rwsLocalMonsterEdit{position:absolute;right:13px;top:13px;border:1px solid #40618a;background:#18304c;border-radius:7px;color:#aed6ff;padding:3px 8px;font-size:10px;cursor:pointer}
  #rwsLocalMonsterEdit[hidden]{display:none!important}
  #tab-exp .actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  #tab-exp .actions button{white-space:normal}
  /* Priority: calculate (strong blue) > rebirth (calm blue) > save (muted green). */
  #tab-exp #calcExpBtn{background:linear-gradient(120deg,#186fff,#6755ed)!important;border-color:#7b9eff!important;color:#fff!important;font-weight:850;box-shadow:0 5px 20px rgba(38,100,241,.38)!important}
  #tab-exp #calcExpBtn:not(:disabled):hover{filter:brightness(1.12);box-shadow:0 6px 22px rgba(52,105,235,.45)}
  #tab-exp #applyExpBtn{background:#1f4265!important;border:1px solid #476e96!important;color:#dcecff!important;box-shadow:none!important;font-weight:750}
  #tab-exp #applyExpBtn:not(:disabled):hover{background:#2a5380;border-color:#6b9bca}
  #rwsLocalSaveBtn{background:#293c38!important;border-color:#455b54!important;color:#b9d1c7!important;box-shadow:none!important}
  #rwsLocalSaveBtn:not(:disabled):hover{background:#324c45;border-color:#607c70}
  #rwsLocalClearBtn{background:#452735;border-color:#85526b;color:#ffd8e3}
  #rwsLocalMonsterControls[hidden],#rwsLocalMonsterStatus[hidden],#rwsLocalComparison[hidden]{display:none!important}
  #rwsLocalMonsterControls{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin:11px 0;padding:12px 14px;border:1px solid #47678d;border-radius:12px;background:#11243e}
  #rwsLocalMonsterControls label{display:grid;gap:6px;font-size:12px;color:#dce9ff;flex:1;min-width:180px}
  #rwsLocalMonsterControls input{border:1px solid #5275a1;border-radius:8px;background:#0c182a;color:#fff;padding:10px;min-width:0;width:100%;box-sizing:border-box}
  #rwsLocalMonsterControls button{border:1px solid #5078a5;border-radius:8px;background:#21486e;color:#fff;padding:10px 12px;font-size:12px;font-weight:800;cursor:pointer}
  #rwsLocalMonsterStatus{font-size:12px;color:#b6d6fa;line-height:1.5;margin:7px 0 4px}
  #rwsLocalComparison{font-size:13px;font-weight:800;color:#9decc5;margin:12px 0 4px;line-height:1.6}
  #rwsLocalExpPanel{margin:14px 0 20px;border:1px solid #344f72;background:linear-gradient(160deg,#172845,#10192d);border-radius:15px;padding:15px;color:#e6f0ff}
  #rwsLocalExpPanel h3{margin:0;font-size:17px}
  #rwsLocalExpPanel .local-table-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 11px}
  #rwsLocalExpPanel .local-select-summary{color:#a9c8e6;font-size:11px;min-height:16px;margin:0 0 9px}
  #rwsLocalExpPanel .local-table-wrap{overflow-x:auto;border:1px solid #334966;border-radius:9px}
  #rwsLocalExpPanel table{width:100%;min-width:1320px;table-layout:fixed;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}
  #rwsLocalExpPanel table col:nth-child(1){width:8%}
  #rwsLocalExpPanel table col:nth-child(2){width:17%}
  #rwsLocalExpPanel table col:nth-child(3){width:8%}
  #rwsLocalExpPanel table col:nth-child(4){width:8%}
  #rwsLocalExpPanel table col:nth-child(5){width:10%}
  #rwsLocalExpPanel table col:nth-child(6){width:14%}
  #rwsLocalExpPanel table col:nth-child(7){width:14%}
  #rwsLocalExpPanel table col:nth-child(8){width:15%}
  #rwsLocalExpPanel table col:nth-child(9){width:6%}
  #rwsLocalExpPanel th,#rwsLocalExpPanel td{box-sizing:border-box;height:52px;padding:9px 8px;border-bottom:1px solid #263b54;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
  #rwsLocalExpPanel th{background:#1b3657;color:#b6d9ff;font-weight:800}
  #rwsLocalExpPanel thead th,#rwsLocalExpPanel tbody td{text-align:center!important}
  #rwsLocalExpPanel tr[data-selected=true]{background:rgba(67,138,202,.16)}
  #rwsLocalExpPanel .choice{display:inline-flex;gap:6px;align-items:center;justify-content:center;cursor:pointer;font-size:12px;color:#bcd9fd}
  #rwsLocalExpPanel input[type=radio]{accent-color:#75baff;cursor:pointer;margin:0}
  #rwsLocalExpPanel .small-delete{padding:5px 8px;background:#3c2534;border:1px solid #855369;border-radius:7px;color:#ffe2eb;cursor:pointer}
  #rwsLocalExpPanel .rws-record-memo{display:block;width:100%;min-width:0;box-sizing:border-box;padding:7px 6px;border:1px solid #435e7e;border-radius:7px;background:#0d1e35;color:#f0f6ff;font:inherit;font-size:12px;text-align:center;outline:none}
  #rwsLocalExpPanel .rws-record-memo::placeholder{color:#7795b7}
  #rwsLocalExpPanel .rws-record-memo:focus-visible{border-color:#76b3f2;box-shadow:0 0 0 2px #4275a755}
  @media(max-width:980px){#tab-exp .result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:550px){#tab-exp .result-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#rwsLocalExpPanel{padding:10px}#rwsLocalMonsterMetric{font-size:14px}#tab-exp .actions button{flex:1 1 42%;font-size:12px}}
`;document.head.appendChild(style);
const section=$('tab-exp');if(!section)throw Error('경험치 효율 계산 탭을 찾지 못했습니다.');
// Existing calculation actions: keep original label, place save/clear directly beside it.
const originalApply=$('applyExpBtn');
const actionBar=originalApply?.parentElement;
if(!originalApply||!actionBar)throw Error('환생 타이밍 계산 버튼을 찾지 못했습니다.');
originalApply.textContent='환생 타이밍 계산';
const save=tag('button','btn','기록 임시저장');save.id='rwsLocalSaveBtn';save.type='button';save.disabled=true;
const clear=tag('button','btn','기록 모두 지우기');clear.id='rwsLocalClearBtn';clear.type='button';clear.disabled=true;
originalApply.insertAdjacentElement('afterend',save);
save.insertAdjacentElement('afterend',clear);
const resultGrid=$('expPerMin')?.closest('.result-grid');
if(!resultGrid)throw Error('경험치 효율 미니카드 영역을 찾지 못했습니다.');
const metric=tag('div','card result');metric.id='rwsLocalMonsterMetricCard';
metric.appendChild(tag('div','rlabel','사냥터 정보'));
const metricValue=tag('div','rvalue accent','측정 전');metricValue.id='rwsLocalMonsterMetric';
metric.appendChild(metricValue);
const metricEdit=tag('button','','수정');metricEdit.id='rwsLocalMonsterEdit';metricEdit.type='button';metricEdit.hidden=true;
metricEdit.title='몬스터명은 선택사항입니다. 필요할 때만 입력하거나 수정하세요.';metric.appendChild(metricEdit);
resultGrid.appendChild(metric);
const controls=tag('div');controls.id='rwsLocalMonsterControls';controls.hidden=true;
const label=tag('label');label.appendChild(tag('span','','몬스터 이름 (선택사항)'));
const input=tag('input');input.id='rwsLocalMonsterName';input.placeholder='입력하지 않아도 저장·환생 계산 가능';input.setAttribute('list','rwsLocalMonsterList');input.autocomplete='off';
label.appendChild(input);controls.appendChild(label);
const monsterList=tag('datalist');monsterList.id='rwsLocalMonsterList';
for(const m of monsters){const o=tag('option');o.value=m.name;o.label='Lv.'+m.level;monsterList.appendChild(o);}
controls.appendChild(monsterList);
const level=tag('span','','몬스터 레벨: -');level.id='rwsLocalMonsterLevel';controls.appendChild(level);
const detect=tag('button','','다시 인식');detect.type='button';detect.id='rwsLocalDetectBtn';controls.appendChild(detect);
const confirmMonster=tag('button','','확인');confirmMonster.type='button';confirmMonster.id='rwsLocalMonsterConfirm';controls.appendChild(confirmMonster);
const status=tag('div','','');status.id='rwsLocalMonsterStatus';status.hidden=true;
const comparison=tag('div','','');comparison.id='rwsLocalComparison';comparison.hidden=true;comparison.setAttribute('aria-live','polite');
resultGrid.insertAdjacentElement('afterend',controls);
controls.insertAdjacentElement('afterend',monsterList);
monsterList.insertAdjacentElement('afterend',status);
status.insertAdjacentElement('afterend',comparison);
const panel=tag('section');panel.id='rwsLocalExpPanel';panel.setAttribute('aria-label','임시저장된 사냥터 경험치 기록');
const heading=tag('div','local-table-heading');heading.appendChild(tag('h3','','임시저장 기록'));
const automaticLabel=tag('label','choice');
const automatic=tag('input');automatic.type='radio';automatic.name='rwsLocalSavedChoice';automatic.value='auto';automatic.checked=true;
automaticLabel.appendChild(automatic);automaticLabel.appendChild(tag('span','','미선택: 최고 분당 EXP 자동 적용'));
heading.appendChild(automaticLabel);panel.appendChild(heading);
const selectedSummary=tag('div','local-select-summary');panel.appendChild(selectedSummary);
const wrap=tag('div','local-table-wrap'),table=tag('table'),cols=tag('colgroup');
for(let i=0;i<9;i++)cols.appendChild(tag('col'));
table.appendChild(cols);
const head=tag('thead'),headrow=tag('tr');
for(const key of ['선택 / 순서','몬스터 · 레벨','캐릭터 Lv','레벨차이','경과시간','분당 EXP','최고 효율 대비','메모','관리']){
 const th=tag('th','',key);if(key==='레벨차이')th.title='몬스터 Lv - 캐릭터 Lv';headrow.appendChild(th);
}
head.appendChild(headrow);table.appendChild(head);
const tbody=tag('tbody');table.appendChild(tbody);wrap.appendChild(table);panel.appendChild(wrap);section.appendChild(panel);
document.title='RansWorldSimulator v11.25';
const headerMeta=document.querySelector('.header-meta');

const oldHour=$('expPerHour');if(oldHour?.closest('.card'))oldHour.closest('.card').style.display='none';
let lastDisplayedMonster='측정 전';
function setEditor(open,message=''){
 controls.hidden=!open;
 status.hidden=!message;
 status.textContent=message;
}
function showProgress(message){controls.hidden=true;status.hidden=false;status.textContent=message;}
function selectedMonster(){return getMonster(input.value);}
function refreshLevel(){const m=selectedMonster();level.textContent=m?'몬스터 레벨: Lv.'+m.level:'몬스터 레벨: -';}
function activeMeasurement(){const m=selectedMonster();return latest?{...latest,monsterName:m?.name||input.value.trim()||'',monsterLevel:m?.level??null}:null;}
function summaryFor(m){return '경과시간 '+duration(m.elapsedSec)+' · 분당 '+compactMinuteRate(m.perMinute)+' EXP · 캐릭터 Lv.'+(m.characterLv??'-')+' · '+monsterLabel(m)+' · 레벨차이 '+formatDifference(m);}
function lastCalculatedMeasurement(){
 const data=typeof lastMeasurement!=='undefined'?lastMeasurement:null;
 if(!data||!(Number(data.perHour)>0))return null;
 const time=data.time instanceof Date && Number.isFinite(data.time.getTime())
   ? (typeof formatInputDate==='function'?formatInputDate(data.time):'')
   : '';
 const level=Number(data.level),value=Number(data.value);
 return {
  perMinute:Number(data.perHour)/60, elapsedSec:0,
  characterLv:Number.isInteger(level)?level:null,monsterName:'',monsterLevel:null,
  endState:time&&Number.isFinite(value)?{level,mode:data.mode||'raw',value,time}:null
 };
}
function defaultChoice(){
 const choices=entries.slice();
 // A completed measurement remains usable after it is saved, even if all
 // temporary records are subsequently deleted. The original RWS invalidates
 // lastMeasurement whenever the source Lv/EXP/time fields are edited.
 const candidate=activeMeasurement()||lastCalculatedMeasurement();
 if(candidate)choices.push(candidate);
 return choices.reduce((best,row)=>!best||row.perMinute>best.perMinute?row:best,null);
}
function effectiveChoice(){return selectedRecordId?entries.find(x=>x.id===selectedRecordId)||null:defaultChoice();}
function bestSavedRecord(){return entries.reduce((best,row)=>!best||row.perMinute>best.perMinute?row:best,null);}
function bestComparisonText(record,best){
 if(!best||!(best.perMinute>0))return '기준 없음';
 const diff=changePercent(record.perMinute,best.perMinute);
 if(Math.abs(diff)<1e-9)return '최고 효율 (0.00%)';
 return (diff>0?'+':'−')+pct(diff)+'%';
}
function renderChoice(){
 const record=effectiveChoice();
 const mode=selectedRecordId?'선택한 기록':'최고 분당 EXP 자동 선택';
 selectedSummary.textContent=record?mode+' · '+monsterLabel(record)+' · '+compactMinuteRate(record.perMinute)+' EXP/분':'임시기록이 없어도 환생 타이밍 계산에서 값을 직접 입력할 수 있습니다.';
 // Temporary records are optional, not a prerequisite to visit rebirth timing.
 const btn=$('applyExpBtn');if(btn)btn.disabled=false;
 automatic.checked=selectedRecordId===null;
}
function renderCurrent(){
 const m=activeMeasurement();
 // Monster name is optional; a valid calculated EXP/min is sufficient for saving.
 save.disabled=!m||!(m.perMinute>0);
 metricEdit.hidden=!latest;
 if(!latest){metricValue.textContent=lastDisplayedMonster;comparison.textContent='';comparison.hidden=true;renderChoice();return;}
 const named=monsterLabel(m);
 metricValue.textContent=named;
 lastDisplayedMonster=named;
 if(entries.length){comparison.textContent='최고 효율 비교 · '+compare(m,bestSavedRecord());comparison.hidden=false;}
 else {comparison.textContent='';comparison.hidden=true;}
 renderChoice();
}
function renderRecords(){
 clear.disabled=entries.length===0;
 tbody.replaceChildren();
 if(!entries.length){const tr=tag('tr'),cell=tag('td','','임시저장된 기록이 없습니다.');cell.colSpan=9;cell.style.textAlign='center';tr.appendChild(cell);tbody.appendChild(tr);renderChoice();return;}
 const best=bestSavedRecord();
 entries.forEach((m,i)=>{
  const tr=tag('tr');tr.dataset.selected=String(selectedRecordId===m.id);
  const first=tag('td'),choice=tag('label','choice');
  const radio=tag('input');radio.type='radio';radio.name='rwsLocalSavedChoice';radio.value=m.id;radio.checked=selectedRecordId===m.id;
  radio.addEventListener('change',()=>{selectedRecordId=m.id;renderRecords();});
  choice.appendChild(radio);choice.appendChild(tag('span','',String(i+1)));first.appendChild(choice);tr.appendChild(first);
  const values=[monsterLabel(m),m.characterLv!=null?'Lv.'+m.characterLv:'-',formatDifference(m),duration(m.elapsedSec),compactMinuteRate(m.perMinute),bestComparisonText(m,best)];
  for(let k=0;k<values.length;k++){const td=tag('td','',values[k]);td.title=values[k];tr.appendChild(td);}
  // Notes belong to an individual saved record, independent of its current display order.
  const memoCell=tag('td'),memo=tag('input','rws-record-memo');
  memo.type='text';memo.placeholder='세팅 메모';memo.autocomplete='off';memo.maxLength=120;
  memo.value=m.memo||'';memo.title=memo.value;
  memo.setAttribute('aria-label','임시저장 기록 '+(i+1)+' 메모');
  memo.addEventListener('input',()=>{
   const row=entries.find(entry=>entry.id===m.id);
   if(!row)return;
   row.memo=memo.value.slice(0,120);memo.title=row.memo;
   persist();
  });
  memoCell.appendChild(memo);tr.appendChild(memoCell);
  const actions=tag('td'),del=tag('button','small-delete','삭제');del.type='button';
  del.addEventListener('click',()=>{if(selectedRecordId===m.id)selectedRecordId=null;entries.splice(i,1);persist();renderRecords();renderCurrent();});
  actions.appendChild(del);tr.appendChild(actions);tbody.appendChild(tr);
 });
 renderChoice();
}
function captureEndState(){
 const level=Number($('levelB')?.value),value=Number(String($('expB')?.value||'').replace(/,/g,'')),time=$('timeB')?.value||'';
 const mode=$('expInputMode')?.value||'raw';
 if(!Number.isInteger(level)||level<1||level>350||!time||!Number.isFinite(value))return null;
 return {level,mode,value,time};
}
function currentEndState(){
 if(latest?.endState)return latest.endState;
 return captureEndState();
}
function exactRate(n){
 const [whole,dec]=Number(n).toFixed(3).split('.');
 return whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+dec;
}
function rebirthReference(record){
 const label=$('rwsRebirthRateLabel')||$('rbRate')?.closest('.field')?.querySelector('label');
 const level=Number.isInteger(record.monsterLevel)?'Lv.'+record.monsterLevel:null;
 if(label)label.textContent=level?'분당 경험치 (몬스터 '+level+')':'분당 경험치';
}
function applyToRebirth(){
 const selected=effectiveChoice();
 if(!selected){
  // Keep any previously entered rebirth values intact and open the calculator.
  window.showTab?.('rebirth');
  return true;
 }
 const state=currentEndState()||selected.endState;
 if(state){
  if($('rbNow'))$('rbNow').value=state.time;
  if($('rbLevel'))$('rbLevel').value=state.level;
  if($('rbExpMode')){$('rbExpMode').value=state.mode;$('rbExpMode').dispatchEvent(new Event('change',{bubbles:true}));}
  if($('rbExp')){
   // v10.34's existing input helper formats raw EXP with commas and its parser strips them.
   if(typeof setExpInputValue==='function')setExpInputValue('rbExp',state.value,state.mode);
   else{
    const raw=String(state.value);
    $('rbExp').value=state.mode==='pct'?raw:raw.replace(/\B(?=(\d{3})+(?!\d))/g,',');
   }
  }
 }
 const rate=$('rbRate');if(!rate){status.textContent='환생 타이밍 계산의 분당 EXP 입력칸을 찾지 못했습니다.';return false;}
 rate.value=compactMinuteRate(selected.perMinute);
 // Keep the three-decimal original for precise automatic calculations even though
 // the input visibly shows a three-decimal abbreviated unit (e.g. 8.173억).
 rate.dataset.rwsExactMinute=exactRate(selected.perMinute);
 rate.dataset.rwsCompactShown=rate.value;
 rebirthReference(selected);
 window.showTab?.('rebirth');
 rate.classList.add('auto');setTimeout(()=>rate.classList.remove('auto'),1400);
 const start=$('rbStart');
 if(start?.value?.trim()&&state?.time)setTimeout(()=>$('calcRbBtn')?.click(),60);
 else status.textContent='환생 효율을 적용했습니다. 환생 시작 시각을 확인한 뒤 환생 타이밍 계산을 눌러 주세요.';
 return true;
}
automatic.addEventListener('change',()=>{selectedRecordId=null;renderRecords();});
originalApply.onclick=applyToRebirth;
input.addEventListener('input',()=>{scanToken++;refreshLevel();renderCurrent();});
metricEdit.addEventListener('click',()=>{if(latest){setEditor(true,'몬스터 이름을 직접 확인하거나 다시 인식해 주세요.');input.focus();}});
confirmMonster.addEventListener('click',()=>{
 // Blank or unknown names are allowed. Only listed names resolve to a monster level.
 refreshLevel();setEditor(false);renderCurrent();
});
save.addEventListener('click',()=>{
 const m=activeMeasurement();
 if(!m||!(m.perMinute>0))return;
 // Saving an EXP result must never require a monster name.
 m.id=String(Date.now())+'-'+Math.random().toString(36).slice(2,8);m.savedAt=new Date().toISOString();
 entries.push(normalize(m));entries=entries.slice(-40);persist();latest=null;
 lastDisplayedMonster=monsterLabel(m);
 setEditor(false);
 renderRecords();renderCurrent();
});
clear.addEventListener('click',()=>{if(!entries.length)return;if(confirm('임시저장된 EXP 측정 기록을 모두 삭제하시겠습니까?')){entries=[];selectedRecordId=null;persist();renderRecords();renderCurrent();}});
const calc=$('calcExpBtn');if(!calc)throw Error('경험치 효율 계산 버튼을 찾지 못했습니다.');
const original=calc.onclick;
calc.onclick=function(event){
 const success=typeof original==='function'?original.call(this,event):false;
 if(!success)return success;
 const a=new Date($('timeA').value.replace(' ','T')),b=new Date($('timeB').value.replace(' ','T'));
 const sec=(b-a)/1000;
 const perHour=typeof lastMeasurement!=='undefined'?Number(lastMeasurement?.perHour):NaN;
 if(!(sec>0)||!(perHour>0)){latest=null;renderCurrent();return success;}
 const endState=captureEndState();
 scanToken++;
 latest={perMinute:perHour/60,elapsedSec:sec,characterLv:Number($('levelB').value),endState,at:b.toISOString()};
 $('expPerMin').textContent=compactMinuteRate(latest.perMinute)+'/분';
 input.value='';lastDisplayedMonster='몬스터 인식 중';refreshLevel();renderCurrent();
 const hasFile=typeof shotFiles!=='undefined'&&Boolean(shotFiles.B||shotFiles.A);
 if(hasFile)scanMonster(false);
 else setEditor(true,'몬스터명은 선택사항입니다. 필요할 때만 직접 입력해 주세요. 비워도 임시저장 및 환생 계산이 가능합니다.');
 return success;
};
for(const id of ['timeA','timeB','levelA','levelB','expA','expB','expInputMode']){
 const field=$(id);if(!field)continue;
 field.addEventListener('input',()=>{latest=null;renderCurrent();});
 field.addEventListener('change',()=>{latest=null;renderCurrent();});
}
// The existing PaddleOCR model detects monster Lv on HUD; users confirm the name.
  function candidateLevels(texts){
    const votes=new Map();
    for(const x of texts){
      const t=String(x.text||'').normalize('NFKC').replace(/[：]/g,':');
      const normalized=t.replace(/\s+/g,'');
      for(const match of normalized.matchAll(/(?:Lv\.?|LV\.?|[lI]v\.?)[^0-9]{0,3}(\d{3})/gi)){
        const lv=Number(match[1]);if(!byLevel.has(lv))continue;
        votes.set(lv,(votes.get(lv)||0)+1);
      }
    }
    return [...votes].map(([level,count])=>({level,count,names:byLevel.get(level).map(x=>x.name)})).sort((a,b)=>b.count-a.count);
  }
async function scanMonster(explicit){
 const token=++scanToken;
 const file=(typeof shotFiles!=='undefined'&&(shotFiles.B||shotFiles.A))||null;
 if(!file){setEditor(true,'몬스터명은 선택사항입니다. 스크린샷을 첨부하거나 직접 입력할 수 있지만 생략해도 됩니다.');return;}
 const engine=window.RWS1100Paddle;
 if(!engine?.ensureModel){setEditor(true,'몬스터 인식 엔진을 사용할 수 없습니다. 이름 없이도 저장하거나 환생 계산을 진행할 수 있습니다.');return;}
 detect.disabled=true;showProgress('몬스터 레벨 인식을 준비하고 있습니다...');
 let bitmap=null;
 try{
  const model=await engine.ensureModel(msg=>{if(token===scanToken)showProgress(msg);});
  if(token!==scanToken)return;
  bitmap=await createImageBitmap(file);
  const w=bitmap.width,h=bitmap.height;
  const regions=[[.29,.40],[.39,.51],[.50,.61],[.60,.71],[.69,.81]];
  const canvases=regions.map(([top,bottom])=>{
   const c=document.createElement('canvas'),left=Math.floor(w*.12),right=Math.floor(w*.99);
   const sw=right-left,sh=Math.max(1,Math.floor(h*(bottom-top))),scale=Math.min(2.5,2000/sw);
   c.width=Math.round(sw*scale);c.height=Math.round(sh*scale);
   const ctx=c.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#121924';ctx.fillRect(0,0,c.width,c.height);
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(bitmap,left,Math.floor(h*top),sw,sh,0,0,c.width,c.height);return c;
  });
  showProgress('몬스터 이름표를 인식하고 있습니다...');
  const result=await Promise.race([
   model.predict(canvases,{textRecScoreThresh:0}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('몬스터 인식 시간 초과')),50000))
  ]);
  if(token!==scanToken)return;
  const texts=(Array.isArray(result)?result:[]).flatMap(r=>(r?.items||[]));
  const matches=candidateLevels(texts),best=matches[0];
  window.__RWS_LOCAL_MONSTER_DIAGNOSTIC__={candidates:matches,rawTexts:texts.map(x=>x.text)};
  if(!best){setEditor(true,'몬스터 Lv 인식 실패. 이름은 선택사항이므로 비워도 저장 및 환생 계산이 가능합니다.');return;}
  const confident=best.names.length===1&&(matches.length===1||best.count>matches[1].count);
  if(!confident){setEditor(true,'몬스터 후보가 여러 개이거나 이름이 불확실합니다. 필요한 경우에만 이름을 선택해 주세요.');return;}
  input.value=best.names[0];refreshLevel();renderCurrent();setEditor(false);
 }catch(err){if(token===scanToken)setEditor(true,'몬스터 자동 인식 실패: '+String(err?.message||err)+' · 몬스터명은 생략 가능합니다.');}
 finally{if(bitmap)bitmap.close?.();detect.disabled=false;}
}
detect.addEventListener('click',()=>scanMonster(true));
function ensureRebirthText(){
 const field=$('rbRate');if(!field)return;
 const label=$('rwsRebirthRateLabel')||field.closest('.field')?.querySelector('label');
 if(label)label.textContent='분당 경험치';
 field.placeholder='예: 7.15억 또는 715,368,655';
 // No reference-hunting-ground note below the rate input (per user request).
 $('rwsLocalRebirthMonsterInfo')?.remove();
}
ensureRebirthText();
$('rbRate')?.addEventListener('input',()=>{
 const el=$('rbRate');
 delete el.dataset.rwsExactMinute;
 delete el.dataset.rwsCompactShown;
});
window.RWSLocalRate={
 readMinute:()=>{
   const el=$('rbRate');if(!el)return NaN;
   if(el.dataset.rwsExactMinute && el.value===el.dataset.rwsCompactShown){
     const exact=Number(el.dataset.rwsExactMinute.replace(/,/g,''));
     if(Number.isFinite(exact))return exact;
   }
   return typeof parseRate==='function'?parseRate(el.value):NaN;
 }
};
window.RWSLocalExpCompare={getRecords:()=>entries.map(x=>({...x})),candidateLevels,comparison:compare,monsters,calculateDelta:changePercent,
 getChoice:()=>effectiveChoice(),applyToRebirth,levelDifference,fmtRate,compactMinuteRate,bestSavedRecord,bestComparisonText,monsterOptional:true};
window.__RWS_LOCAL_EXP_COMPARE_READY__=true;
window.__RWS_LOCAL_UI_VERSION__="11.25";
renderRecords();renderCurrent();
})();