(function(){
"use strict";
const V="v10.40",PAGE_SIZE=20;
const RAW="1:달팽이|5:파란 달팽이|7:스포아|11:빨간 달팽이|13:스텀프|16:슬라임|18:돼지|22:주황버섯|24:다크 스텀프|28:리본돼지|30:옥토퍼스|34:초록버섯|36:버블링|40:엑스텀프|42:고스텀프|46:파란버섯|48:스티지|52:주니어 네키|54:뿔버섯|58:다크 엑스텀프|60:우드 마스크|64:좀비버섯|66:스톤 마스크|70:와일드보어|70:아이언보어|72:이블아이|76:페어리|78:리게이터|82:파이어보어|84:커즈아이|88:주니어 레이스|90:주니어 부기|94:루팡|96:콜드아이|100:좀비루팡|102:아이언 호그|106:스켈독|108:카파 드레이크|114:머미독|118:레이스|120:드레이크|124:크로코|126:스톤골렘|130:멜러디|132:스켈레톤 사병|137:다크 스톤골렘|139:믹스골렘|143:레드 드레이크|145:와일드카고|149:스켈레톤 장교|150:아이스 드레이크|154:다크 드레이크|156:타우로마시스|160:스켈레톤 지휘관|163:타우로스피어|166:주니어 스톤볼|169:스톤볼|172:아이스 스톤볼|175:파이어 스톤볼|178:리티|181:주니어 샐리온|184:주니어 라이오너|187:주니어 그류핀|190:다크 리티|193:스타픽시|196:주니어 페페|199:루나픽시|202:러스터픽시|205:샐리온|208:라이오너|211:그류핀|214:주니어 루이넬|217:루이넬|220:흰 모래토끼|223:갈색 모래토끼|226:주니어 카투스|229:벨라모아|232:모래 두더지|235:귀마개 프릴드|238:카투스|241:목도리 프릴드|244:로얄 카투스|247:미요캐츠|250:스콜피언|253:키요|256:모래난쟁이|259:붉은 모래난쟁이|262:모래거인|265:큐브슬라임|268:루모|271:트리플 루모|274:아이언 뮤테|277:강화된 아이언 뮤테|280:미스릴 뮤테|283:강화된 미스릴 뮤테|286:로이드|289:네오 휴로이드|292:호문|295:사이티|298:호문쿨루|301:D.로이|304:호문스큘러|309:주니어 예티|314:헥터|318:다크 주니어 예티|323:화이트팽|327:페페|331:다크 페페|336:예티|340:다크 예티|345:웨어울프|349:예티와 페페|354:다크 예티와 페페|358:라이칸스로프|363:설산의 마녀|367:쿨리 좀비|372:플라이아이|376:마이너 좀비|381:주니어 불독|385:파이어봄|390:불독|394:파이어독|400:브라운테니|406:라츠|412:북치는 토끼|418:처프|424:더키 패밀리|430:핑크테니|436:블랙 라츠|442:치크세이버|447:팬더테니|453:핑크세이버|459:장난감 목마|467:블록퍼스|474:스카이세이버|482:킹 블록퍼스|489:트위터|496:로보토이|503:블록골렘|511:마스터 로보|518:킹 블록골렘|536:티키|543:크로노스|550:틱톡|558:플래툰 크로노스|565:마스터 크로노스";

/* RWS v10.40: monster level provisional mapping, sourced from v10.38 regions.
 * Original 14 subregions and 147 monsters remain unchanged
 * Explicitly confirmed level anchors are fixed; remaining values are interpolated.
 */
/* Mapping anchors (old Lv -> new Lv); only named user-confirmed points
 * and early Ludibrium +6 are measured. Other edges are published region boundaries.
 * The interpolated middle levels are provisional, NOT game-confirmed.
 * [[1,1],[7,13],[9,16],[15,28],[63,124],[66,130],[70,139],[81,160],[82,163],[85,166],[136,217],[139,220],[181,262],[186,265],[240,301],[244,304],[262,309],[286,327],[376,394],[394,400],[400,406],[406,412],[412,418],[562,565]]
 * Confirmed monster names: 타우로스피어, 주니어 스톤볼, 루이넬, 흰 모래토끼, 모래거인, 큐브슬라임, 페페, D.로이, 호문스큘러, 주니어 예티, 파이어독, 브라운테니, 라츠, 북치는 토끼, 처프
 */
const REGION_UPDATES=[{"name":"리스항구","items":[{"lv":1,"name":"달팽이","sourceName":"嫩寶"},{"lv":5,"name":"파란 달팽이","sourceName":"藍寶"},{"lv":11,"name":"빨간 달팽이","sourceName":"紅寶"},{"lv":16,"name":"슬라임","sourceName":"綠水靈"},{"lv":18,"name":"돼지","sourceName":"肥肥"},{"lv":28,"name":"리본돼지","sourceName":"緞帶肥肥"}]},{"name":"헤네시스","items":[{"lv":1,"name":"달팽이","sourceName":"嫩寶"},{"lv":5,"name":"파란 달팽이","sourceName":"藍寶"},{"lv":7,"name":"스포아","sourceName":"菇菇仔"},{"lv":11,"name":"빨간 달팽이","sourceName":"紅寶"},{"lv":18,"name":"돼지","sourceName":"肥肥"},{"lv":28,"name":"주황버섯","sourceName":"菇菇寶貝"},{"lv":28,"name":"리본돼지","sourceName":"緞帶肥肥"},{"lv":34,"name":"초록버섯","sourceName":"綠菇菇"},{"lv":46,"name":"파란버섯","sourceName":"藍菇菇"},{"lv":54,"name":"뿔버섯","sourceName":"刺菇菇"},{"lv":76,"name":"페어리","sourceName":"蝴蝶精"},{"lv":102,"name":"아이언 호그","sourceName":"鋼之肥肥"},{"lv":126,"name":"스톤골렘","sourceName":"石巨人"},{"lv":139,"name":"믹스골렘","sourceName":"混種石巨人"},{"lv":137,"name":"다크 스톤골렘","sourceName":"黑曜石巨人"}]},{"name":"슬리피우드","items":[{"lv":16,"name":"슬라임","sourceName":"綠水靈"},{"lv":34,"name":"초록버섯","sourceName":"綠菇菇"},{"lv":52,"name":"주니어 네키","sourceName":"青蛇"},{"lv":54,"name":"뿔버섯","sourceName":"刺菇菇"},{"lv":84,"name":"커즈아이","sourceName":"風獨眼獸"},{"lv":90,"name":"주니어 부기","sourceName":"幼魔精靈"},{"lv":94,"name":"루팡","sourceName":"猴子"},{"lv":126,"name":"스톤골렘","sourceName":"石巨人"},{"lv":137,"name":"다크 스톤골렘","sourceName":"黑曜石巨人"},{"lv":139,"name":"믹스골렘","sourceName":"混種石巨人"},{"lv":64,"name":"좀비버섯","sourceName":"殭屍菇菇"},{"lv":72,"name":"이블아이","sourceName":"火獨眼獸"},{"lv":96,"name":"콜드아이","sourceName":"冰獨眼獸"},{"lv":145,"name":"와일드카고","sourceName":"魔龍"},{"lv":156,"name":"타우로마시스","sourceName":"月牙牛魔王"},{"lv":163,"name":"타우로스피어","sourceName":"長槍牛魔王"},{"lv":120,"name":"드레이크","sourceName":"青龍"},{"lv":150,"name":"아이스 드레이크","sourceName":"冰龍"},{"lv":154,"name":"다크 드레이크","sourceName":"黑龍"}]},{"name":"커닝시티-지하철","items":[{"lv":16,"name":"슬라임","sourceName":"綠水靈"},{"lv":22,"name":"주황버섯","sourceName":"菇菇寶貝"},{"lv":30,"name":"옥토퍼스","sourceName":"三眼章魚"},{"lv":36,"name":"버블링","sourceName":"藍水靈"},{"lv":48,"name":"스티지","sourceName":"蝙蝠"},{"lv":88,"name":"주니어 레이스","sourceName":"小幽靈"},{"lv":118,"name":"레이스","sourceName":"大幽靈"}]},{"name":"커닝시티","items":[{"lv":16,"name":"슬라임","sourceName":"綠水靈"},{"lv":34,"name":"초록버섯","sourceName":"綠菇菇"},{"lv":52,"name":"주니어 네키","sourceName":"青蛇"},{"lv":78,"name":"리게이터","sourceName":"鱷魚"},{"lv":94,"name":"루팡","sourceName":"猴子"},{"lv":100,"name":"좀비루팡","sourceName":"天使猴"},{"lv":124,"name":"크로코","sourceName":"黑鱷魚"}]},{"name":"페리온","items":[{"lv":13,"name":"스텀프","sourceName":"木妖"},{"lv":24,"name":"다크 스텀프","sourceName":"黑木妖"},{"lv":40,"name":"엑스텀프","sourceName":"斧木妖"},{"lv":58,"name":"다크 엑스텀프","sourceName":"黑斧木妖"},{"lv":42,"name":"고스텀프","sourceName":"發芽木妖"},{"lv":60,"name":"우드 마스크","sourceName":"木面怪人"},{"lv":66,"name":"스톤 마스크","sourceName":"石面怪人"},{"lv":70,"name":"와일드보어","sourceName":"黑肥肥"},{"lv":82,"name":"파이어보어","sourceName":"火肥肥"},{"lv":70,"name":"아이언보어","sourceName":"鋼之黑肥肥"},{"lv":108,"name":"카파 드레이크","sourceName":"土龍"},{"lv":143,"name":"레드 드레이크","sourceName":"赤龍"},{"lv":106,"name":"스켈독","sourceName":"骷髏犬"},{"lv":114,"name":"머미독","sourceName":"木乃伊犬"},{"lv":132,"name":"스켈레톤 사병","sourceName":"骷髏士兵"},{"lv":149,"name":"스켈레톤 장교","sourceName":"骷髏士官"},{"lv":160,"name":"스켈레톤 지휘관","sourceName":"骷髏指揮官"}]},{"name":"엘리니아","items":[{"lv":13,"name":"스텀프","sourceName":"木妖"},{"lv":16,"name":"슬라임","sourceName":"綠水靈"},{"lv":34,"name":"초록버섯","sourceName":"綠菇菇"},{"lv":54,"name":"뿔버섯","sourceName":"刺菇菇"},{"lv":76,"name":"페어리","sourceName":"蝴蝶精"},{"lv":84,"name":"커즈아이","sourceName":"風獨眼獸"},{"lv":94,"name":"루팡","sourceName":"猴子"},{"lv":100,"name":"좀비루팡","sourceName":"天使猴"},{"lv":130,"name":"멜러디","sourceName":"女巫"}]},{"name":"오르비스-오르비스탑","items":[{"lv":166,"name":"주니어 스톤볼","sourceName":"小石球"},{"lv":169,"name":"스톤볼","sourceName":"石球"},{"lv":172,"name":"아이스 스톤볼","sourceName":"冰石球"},{"lv":175,"name":"파이어 스톤볼","sourceName":"火石球"},{"lv":178,"name":"리티","sourceName":"利堤"},{"lv":190,"name":"다크 리티","sourceName":"黑利堤"},{"lv":196,"name":"주니어 페페","sourceName":"小企鵝王"}]},{"name":"오르비스-하늘공원","items":[{"lv":181,"name":"주니어 샐리온","sourceName":"幼紅獨角獅"},{"lv":184,"name":"주니어 라이오너","sourceName":"幼黃獨角獅"},{"lv":187,"name":"주니어 그류핀","sourceName":"幼藍獨角獅"},{"lv":193,"name":"스타픽시","sourceName":"星光精靈"},{"lv":199,"name":"루나픽시","sourceName":"月光精靈"},{"lv":202,"name":"러스터픽시","sourceName":"日光精靈"},{"lv":205,"name":"샐리온","sourceName":"紅獨角獅"},{"lv":208,"name":"라이오너","sourceName":"黃獨角獅"},{"lv":211,"name":"그류핀","sourceName":"藍獨角獅"},{"lv":214,"name":"주니어 루이넬","sourceName":"幼黑格里芬"},{"lv":217,"name":"루이넬","sourceName":"黑格里芬"}]}];
const PRESERVED_REGION_GROUPS={"엘나스":"주니어 예티|헥터|다크 주니어 예티|화이트팽|페페|다크 페페|예티|다크 예티|웨어울프|예티와 페페|다크 예티와 페페|라이칸스로프|설산의 마녀","폐광":"쿨리 좀비|플라이아이|마이너 좀비|주니어 불독|파이어봄|불독|파이어독","아리안트":"흰 모래토끼|갈색 모래토끼|주니어 카투스|벨라모아|모래 두더지|귀마개 프릴드|카투스|목도리 프릴드|로얄 카투스|미요캐츠|스콜피언|키요|모래난쟁이|붉은 모래난쟁이|모래거인","마가티아":"큐브슬라임|루모|트리플 루모|아이언 뮤테|강화된 아이언 뮤테|미스릴 뮤테|강화된 미스릴 뮤테|로이드|네오 휴로이드|호문|사이티|호문쿨루|D.로이|호문스큘러","루디브리엄":"브라운테니|라츠|북치는 토끼|처프|더키 패밀리|핑크테니|블랙 라츠|치크세이버|팬더테니|핑크세이버|장난감 목마|블록퍼스|스카이세이버|킹 블록퍼스|트위터|로보토이|블록골렘|마스터 로보|킹 블록골렘|티키|크로노스|틱톡|플래툰 크로노스|마스터 크로노스"};
const REGION_GROUPS={...Object.fromEntries(REGION_UPDATES.map(v=>[v.name,v.items.map(x=>x.name).join("|")])),...PRESERVED_REGION_GROUPS};
const REGIONS=Object.keys(REGION_GROUPS);
const MONSTER_REGISTRY=new Map();
function monsterKey(lv,name){return lv+"|"+name;}
function addMonster(lv,name,region,sourceName){
  const key=monsterKey(lv,name);
  let entry=MONSTER_REGISTRY.get(key);
  if(!entry){entry={lv,name,regions:[],region:"",sourceNames:[]};MONSTER_REGISTRY.set(key,entry);}
  if(!entry.regions.includes(region))entry.regions.push(region);
  if(sourceName&&!entry.sourceNames.includes(sourceName))entry.sourceNames.push(sourceName);
}
const ORIGINAL_MONSTERS=RAW.split("|").map(x=>{const i=x.indexOf(":");return {lv:+x.slice(0,i),name:x.slice(i+1)};});
for(const row of ORIGINAL_MONSTERS){
  for(const [region,names] of Object.entries(PRESERVED_REGION_GROUPS)){
    if(names.split("|").includes(row.name))addMonster(row.lv,row.name,region,"");
  }
}
for(const group of REGION_UPDATES){
  for(const entry of group.items)addMonster(entry.lv,entry.name,group.name,entry.sourceName);
}
for(const row of ORIGINAL_MONSTERS){
  if(!MONSTER_REGISTRY.has(monsterKey(row.lv,row.name)))addMonster(row.lv,row.name,"미분류","");
}
const monsters=[...MONSTER_REGISTRY.values()].sort((a,b)=>a.lv-b.lv||a.name.localeCompare(b.name,"ko"));
for(const m of monsters)m.region=m.regions.filter(x=>x!=="미분류").join(" · ")||"미분류";
window.__RWS38_MONSTER_STATS__=Object.fromEntries(REGIONS.map(region=>{
  const xs=monsters.filter(x=>x.regions.includes(region));
  return [region,xs.length?[Math.min(...xs.map(x=>x.lv)),Math.max(...xs.map(x=>x.lv)),xs.length]:[0,0,0]];
}));
window.__RWS38_MONSTER_READY__={count:monsters.length,regions:REGIONS,updated:REGION_UPDATES.length,preserved:Object.keys(PRESERVED_REGION_GROUPS)};
window.__RWS40_MONSTER_READY__={count:monsters.length,min:1,max:565,regionRangeMatches:11,confirmedNamedAnchors:15};
const $=id=>document.getElementById(id);
const PRESETS=[[1,565,"전체"],[1,100,"1~100"],[101,200,"101~200"],[201,300,"201~300"],[301,400,"301~400"],[401,500,"401~500"],[501,565,"501~565"]];
let from=1,to=565,exact=null,keyword="",selectedRegion="전체",page=1,lastFocus=null,oldOverflow="";
function install(){
 const target=document.querySelector("#tab-exp>.section-title");if(!target)return false;
 if($("mlOpen"))return true;
 const css=document.createElement("style");css.id="mlStyle";css.textContent=[
 "#tab-exp>.section-title{flex-wrap:wrap}",
 ".ml-open{white-space:nowrap;flex-shrink:0;align-self:flex-start;border-color:#426b9c;background:#162d4c;color:#d7eeff;font-size:12px}",
 ".ml-backdrop{position:fixed;inset:0;z-index:1910;display:none;place-items:center;padding:16px;background:rgba(3,8,17,.83);backdrop-filter:blur(7px)}",
 ".ml-backdrop.show{display:grid}",
 ".ml-dialog{width:min(800px,100%);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid #3e577a;border-radius:18px;background:linear-gradient(180deg,#1a2943,#101a2d);box-shadow:0 28px 90px rgba(0,0,0,.58)}",
 ".ml-head{display:flex;justify-content:space-between;gap:14px;padding:18px 20px 12px;border-bottom:1px solid #2f4363}",
 ".ml-head h3{margin:0;font-size:20px;color:#eaf4ff}.ml-head .rws-ml-temp{color:#b5f58b;font-size:.84em;font-weight:900;white-space:nowrap}.ml-head p{margin:7px 0 0;font-size:11px;color:#a3b7d3;line-height:1.55}",
 ".ml-close{height:34px;width:34px;flex:0 0 34px;display:inline-grid;place-items:center;padding:0;border:1px solid #47638b;border-radius:9px;background:#14233a;color:#e8f3ff;font:23px/1 Arial,sans-serif;cursor:pointer}",
 ".ml-controls{padding:13px 20px 12px;border-bottom:1px solid #2c3e5c;display:flex;flex-direction:column;gap:10px}",
 ".ml-presets{display:flex;flex-wrap:wrap;gap:6px}.ml-presets button{border:1px solid #334967;border-radius:9px;background:#172743;color:#c6d9f1;padding:7px 10px;font-size:11px;font-weight:750;cursor:pointer}",
 ".ml-presets button[aria-pressed=true]{border-color:#518bd1;background:#255080;color:#fff}",
 ".ml-fields{display:grid;grid-template-columns:1fr 1fr 1fr 1.6fr;gap:8px}.ml-fields label{display:flex;flex-direction:column;gap:5px;color:#9eb4d3;font-size:11px;font-weight:700}",
 ".ml-region{display:flex;flex-direction:column;gap:5px;max-width:270px;color:#9eb4d3;font-size:11px;font-weight:700}.ml-region select{box-sizing:border-box;min-width:0;border-radius:9px;border:1px solid #3c557a;background:#101d32;color:#eaf5ff;padding:9px 10px;font-size:13px}.ml-region select:focus{border-color:#7cbcff;outline:none;box-shadow:0 0 0 2px rgba(94,168,255,.15)}",
 ".ml-fields input{box-sizing:border-box;min-width:0;width:100%;border-radius:9px;border:1px solid #3c557a;background:#101d32;color:#eaf5ff;padding:9px 10px;font-size:13px;outline:none}",
 ".ml-fields input:focus{border-color:#7cbcff;box-shadow:0 0 0 2px rgba(94,168,255,.15)}",
 ".ml-actions{display:flex;gap:8px}.ml-action{border-radius:9px;padding:9px 12px;border:1px solid #3a5680;color:#e9f3ff;background:#172a46;font-weight:780;font-size:12px;cursor:pointer}.ml-action.primary{border-color:#477fbb;background:#25568a}.ml-action:disabled{opacity:.35;cursor:default}",
 ".ml-error{min-height:0;color:#ffadba;font-size:11px}",
 ".ml-summary{padding:10px 20px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:#a4bad9}.ml-summary strong{color:#d7eeff}",
 ".ml-scroll{overflow:auto;flex:1;min-height:0;margin:0 20px;border:1px solid #2b4162;border-radius:10px;background:#101b2f}",
 ".ml-table{width:100%;border-collapse:collapse;font-size:12px}.ml-table th{position:sticky;top:0;background:#203452;color:#bcdcff;padding:11px 12px;text-align:left;border-bottom:1px solid #486080}",
 ".ml-table th:last-child,.ml-table td:last-child{width:110px;color:#a8dfc7}",
 ".ml-table td{padding:10px 12px;border-bottom:1px solid #263754;color:#dae7fa}.ml-table th:first-child,.ml-table td:first-child{width:100px;text-align:center}.ml-table td:first-child{font-weight:850;color:#b5d8ff}",
 ".ml-table tbody tr:nth-child(even){background:rgba(90,132,185,.06)}.ml-table tbody tr:hover{background:#213959}",
 ".ml-empty{text-align:center!important;padding:30px!important;color:#aabdd6!important}",
 ".ml-footer{padding:11px 20px 16px;border-top:1px solid #2d405c;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}",
 ".ml-note{color:#91a7c6;font-size:10px;line-height:1.6;flex:1}.ml-pages{display:flex;align-items:center;gap:8px;color:#b1c7e6;font-size:11px;white-space:nowrap}",
 "@media(max-width:650px){.ml-fields{grid-template-columns:repeat(2,minmax(0,1fr))}}",
 "@media(max-width:430px){.ml-backdrop{padding:8px}.ml-head{padding:13px}.ml-head h3{font-size:17px}.ml-controls{padding:10px 13px}.ml-summary{padding:9px 13px}.ml-scroll{margin:0 13px}.ml-footer{padding:11px 13px}.ml-fields label:last-child{grid-column:1/-1}}"
 ].join("");
 document.head.appendChild(css);
 const button=document.createElement("button");button.id="mlOpen";button.type="button";
 button.className="btn ml-open";button.textContent="몬스터 레벨표";button.setAttribute("aria-haspopup","dialog");target.appendChild(button);
 const modal=document.createElement("div");modal.id="mlModal";modal.className="ml-backdrop";
 modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-labelledby","mlTitle");modal.setAttribute("aria-hidden","true");
 modal.innerHTML=[
 '<div class="ml-dialog"><div class="ml-head"><div><h3 id="mlTitle">몬스터 레벨표 <span class="rws-ml-temp">(임시)</span> <span style="font-size:12px;color:#8bbffa">' + monsters.length + '건 · Lv.1~565</span></h3>',
 '<p>몬스터 147건의 일부 레벨은 실측 확인 · 나머지는 변경된 지역 범위에 맞춘 임시 추정치 (등장 지역은 별도 검증 필요)</p></div>',
 '<button id="mlClose" type="button" class="ml-close" aria-label="닫기">×</button></div>',
 '<div class="ml-controls"><div id="mlPresets" class="ml-presets" role="group" aria-label="레벨 구간 빠른 선택">',
 PRESETS.map(x=>'<button type="button" data-from="'+x[0]+'" data-to="'+x[1]+'" aria-pressed="false">'+x[2]+'</button>').join(""),
 '</div><label class="ml-region" for="mlRegion">등장 지역 선택<select id="mlRegion"><option value="전체">전체 지역</option>'+REGIONS.map(region=>'<option value="'+region+'">'+region+'</option>').join('')+'</select></label><div class="ml-fields">',
 '<label>시작 Lv<input id="mlFrom" type="number" min="1" max="565" step="1" value="1"></label>',
 '<label>끝 Lv<input id="mlTo" type="number" min="1" max="565" step="1" value="565"></label>',
 '<label>특정 레벨<input id="mlExact" type="number" min="1" max="565" step="1" placeholder="예: 36"></label>',
 '<label>몬스터 이름 검색<input id="mlName" type="search" placeholder="예: 예티, 크로노스" autocomplete="off"></label>',
 '</div><div class="ml-actions"><button id="mlSearch" type="button" class="ml-action primary">조회</button>',
 '<button id="mlReset" type="button" class="ml-action">초기화</button></div>',
 '<div id="mlError" class="ml-error" role="status"></div></div>',
 '<div class="ml-summary"><strong id="mlCount"></strong><span id="mlFilter"></span></div>',
 '<div class="ml-scroll" tabindex="0" aria-label="몬스터 레벨 목록"><table class="ml-table">',
 '<thead><tr><th scope="col">레벨</th><th scope="col">몬스터 이름</th><th scope="col">등장 지역</th></tr></thead><tbody id="mlRows"></tbody></table></div>',
 '<div class="ml-footer"><div class="ml-note">※ 일부 실측을 제외한 레벨은 구간별 임시 추정치 · 등장 지역은 기존 자료 기준 · 20종씩 표시</div>',
 '<div class="ml-pages"><button id="mlPrev" type="button" class="ml-action">이전</button>',
 '<span id="mlPage">1 / 1</span><button id="mlNext" type="button" class="ml-action">다음</button></div></div></div>'
 ].join("");
 document.body.appendChild(modal);
 button.addEventListener("click",open);
 $("mlClose").addEventListener("click",close);
 modal.addEventListener("click",e=>{if(e.target===modal)close()});
 $("mlSearch").addEventListener("click",apply);$("mlReset").addEventListener("click",reset);
 $("mlName").addEventListener("input",apply);$("mlRegion").addEventListener("change",apply);
 ["mlFrom","mlTo","mlExact","mlName"].forEach(id=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();apply()}}));
 $("mlPresets").addEventListener("click",e=>{const b=e.target.closest("button[data-from]");if(!b)return;$("mlFrom").value=b.dataset.from;$("mlTo").value=b.dataset.to;$("mlExact").value="";apply()});
 $("mlPrev").addEventListener("click",()=>{page--;render()});
 $("mlNext").addEventListener("click",()=>{page++;render()});
 document.addEventListener("keydown",e=>{
  if(!modal.classList.contains("show"))return;
  if(e.key==="Escape"){e.preventDefault();close();return;}
  if(e.key==="Tab"){
   const all=Array.from(modal.querySelectorAll("button:not(:disabled),input:not(:disabled),[tabindex='0']"));
   if(!all.length)return;
   if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all[all.length-1].focus()}
   else if(!e.shiftKey&&document.activeElement===all[all.length-1]){e.preventDefault();all[0].focus()}
  }
 });
 render();return true;
}
function valid(n){return Number.isInteger(n)&&n>=1&&n<=565}
function apply(){
 const a=Number($("mlFrom").value),b=Number($("mlTo").value),e=$("mlExact").value.trim();
 if(!valid(a)||!valid(b)||a>b){$("mlError").textContent="시작·끝 레벨은 1~565 사이이며 시작 Lv이 끝 Lv 이하여야 합니다.";return}
 if(e!==""&&!valid(Number(e))){$("mlError").textContent="특정 레벨은 1~565 사이의 정수로 입력해 주세요.";return}
 from=a;to=b;exact=e===""?null:Number(e);keyword=$("mlName").value.trim();selectedRegion=$("mlRegion").value;page=1;
 $("mlError").textContent="";render();
}
function reset(){$("mlFrom").value=1;$("mlTo").value=562;$("mlExact").value="";$("mlName").value="";$("mlRegion").value="전체";apply()}
function render(){
 const q=keyword.toLocaleLowerCase("ko-KR");
 const rows=monsters.filter(x=>(exact===null?(x.lv>=from&&x.lv<=to):(x.lv===exact))&&(selectedRegion==="전체"||x.regions.includes(selectedRegion))&&(!q||x.name.toLocaleLowerCase("ko-KR").includes(q)||x.sourceNames.some(name=>name.includes(keyword))));
 const maxPage=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));page=Math.min(maxPage,Math.max(1,page));
 const selected=rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE),fragment=document.createDocumentFragment();
 if(!selected.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=3;td.className="ml-empty";td.textContent="검색 결과가 없습니다.";tr.append(td);fragment.append(tr)}
 else selected.forEach(x=>{const tr=document.createElement("tr"),lv=document.createElement("td"),nm=document.createElement("td"),area=document.createElement("td");lv.textContent="Lv."+x.lv;nm.textContent=x.name;if(x.sourceNames.length)nm.title="TXT 원문: "+x.sourceNames.join(", ");area.classList.add("rws-ml-region-cell");const displayRegions=x.regions.filter(name=>name!=="미분류");if(!displayRegions.length)displayRegions.push("미분류");displayRegions.forEach((region,i)=>{if(i)area.appendChild(document.createTextNode(" "));const token=document.createElement("span");token.className="rws-ml-region-name";token.textContent=(i?"· ":"")+region;area.appendChild(token);});tr.append(lv,nm,area);fragment.append(tr)});
 $("mlRows").replaceChildren(fragment);
 $("mlCount").textContent="검색 결과 "+rows.length+"건 / 전체 "+monsters.length+"건";
 $("mlFilter").textContent=(exact===null?"Lv."+from+"~"+to:"Lv."+exact+" 검색")+(selectedRegion!=="전체"?" · 지역: "+selectedRegion:"")+(keyword?" · 이름: "+keyword:"");
 $("mlPage").textContent=page+" / "+maxPage;$("mlPrev").disabled=page<=1;$("mlNext").disabled=page>=maxPage;
 $("mlPresets").querySelectorAll("button[data-from]").forEach(b=>b.setAttribute("aria-pressed",exact===null&&from===+b.dataset.from&&to===+b.dataset.to?"true":"false"));
 $("mlModal").querySelector(".ml-scroll").scrollTop=0;
}
function open(){lastFocus=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";$("mlModal").classList.add("show");$("mlModal").setAttribute("aria-hidden","false");render();$("mlName").focus()}
function close(){$("mlModal").classList.remove("show");$("mlModal").setAttribute("aria-hidden","true");document.body.style.overflow=oldOverflow;if(lastFocus?.focus)lastFocus.focus()}
function setVersion(){
 const badge=document.querySelector(".version");if(badge){badge.textContent=V;badge.title="업데이트 내역"}
 const history=$("changelogModal"),list=history?.querySelector(".changelog-body");
 if(list&&!list.querySelector('[data-update-version="v10.32"]')){
  const entry=document.createElement("section");entry.dataset.updateVersion=V;
  const title=document.createElement("b");title.className="changelog-ver";title.textContent=V;
  const p=document.createElement("p");p.textContent="몬스터 147건 · 14개 지역 분류. Lv.1~565 임시 레벨 매핑 반영, 실측 확인 외 중간 레벨은 추정치이며 등장 지역도 검증 중.";
  entry.append(title,p);list.prepend(entry);
 }
 const caption=history?.querySelector(".changelog-head p");if(caption)caption.textContent="주요 기능과 변경사항 요약 · "+V;
 return !!badge&&!!list;
}
if(monsters.length!==147)console.error("몬스터 레벨 데이터 수 확인 필요",monsters.length);
let attempts=0;
const timer=setInterval(()=>{attempts++;if($("tab-exp")&&install()&&setVersion()){clearInterval(timer);console.info("[RWS v10.40] Provisional monster levels ready:",monsters.length)}else if(attempts>=250){clearInterval(timer);console.error("Monster level lookup initialization timed out")}},60);
})();