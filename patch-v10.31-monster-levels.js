(function(){
"use strict";
const V="v10.31",PAGE_SIZE=20;
const RAW="1:달팽이|3:파란 달팽이|4:스포아|6:빨간 달팽이|7:스텀프|9:슬라임|10:돼지|12:주황버섯|13:다크 스텀프|15:리본돼지|16:옥토퍼스|18:초록버섯|19:버블링|21:엑스텀프|22:고스텀프|24:파란버섯|25:스티지|27:주니어 네키|28:뿔버섯|30:다크 엑스텀프|31:우드 마스크|33:좀비버섯|34:스톤 마스크|36:와일드보어|36:아이언보어|37:이블아이|39:페어리|40:리게이터|42:파이어보어|43:커즈아이|45:주니어 레이스|46:주니어 부기|48:루팡|49:콜드아이|51:좀비루팡|52:아이언 호그|54:스켈독|55:카파 드레이크|58:머미독|60:레이스|61:드레이크|63:크로코|64:스톤골렘|66:멜러디|67:스켈레톤 사병|69:다크 스톤골렘|70:믹스골렘|72:레드 드레이크|73:와일드카고|75:스켈레톤 장교|76:아이스 드레이크|78:다크 드레이크|79:타우로마시스|81:스켈레톤 지휘관|82:타우로스피어|85:주니어 스톤볼|88:스톤볼|91:아이스 스톤볼|94:파이어 스톤볼|97:리티|100:주니어 샐리온|103:주니어 라이오너|106:주니어 그류핀|109:다크 리티|112:스타픽시|115:주니어 페페|118:루나픽시|121:러스터픽시|124:샐리온|127:라이오너|130:그류핀|133:주니어 루이넬|136:루이넬|139:흰 모래토끼|142:갈색 모래토끼|145:주니어 카투스|148:벨라모아|151:모래 두더지|154:귀마개 프릴드|157:카투스|160:목도리 프릴드|163:로얄 카투스|166:미요캐츠|169:스콜피언|172:키요|175:모래난쟁이|178:붉은 모래난쟁이|181:모래거인|186:큐브슬라임|190:루모|195:트리플 루모|199:아이언 뮤테|204:강화된 아이언 뮤테|208:미스릴 뮤테|213:강화된 미스릴 뮤테|217:로이드|222:네오 휴로이드|226:호문|231:사이티|235:호문쿨루|240:D.로이|244:호문스큘러|262:주니어 예티|268:헥터|274:다크 주니어 예티|280:화이트팽|286:페페|292:다크 페페|298:예티|304:다크 예티|310:웨어울프|316:예티와 페페|322:다크 예티와 페페|328:라이칸스로프|334:설산의 마녀|340:쿨리 좀비|346:플라이아이|352:마이너 좀비|358:주니어 불독|364:파이어봄|370:불독|376:파이어독|394:브라운테니|400:라츠|406:북치는 토끼|412:처프|418:더키 패밀리|424:핑크테니|430:블랙 라츠|436:치크세이버|442:팬더테니|448:핑크세이버|454:장난감 목마|462:블록퍼스|469:스카이세이버|477:킹 블록퍼스|484:트위터|492:로보토이|499:블록골렘|507:마스터 로보|514:킹 블록골렘|532:티키|540:크로노스|547:틱톡|555:플래툰 크로노스|562:마스터 크로노스";
const monsters=RAW.split("|").map(x=>{const pos=x.indexOf(":");return {lv:+x.slice(0,pos),name:x.slice(pos+1)}});
const $=id=>document.getElementById(id);
const PRESETS=[[1,562,"전체"],[1,100,"1~100"],[101,200,"101~200"],[201,300,"201~300"],[301,400,"301~400"],[401,500,"401~500"],[501,562,"501~562"]];
let from=1,to=562,exact=null,keyword="",page=1,lastFocus=null,oldOverflow="";
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
 ".ml-head h3{margin:0;font-size:20px;color:#eaf4ff}.ml-head p{margin:7px 0 0;font-size:11px;color:#a3b7d3;line-height:1.55}",
 ".ml-close{height:34px;width:34px;flex:0 0 34px;display:inline-grid;place-items:center;padding:0;border:1px solid #47638b;border-radius:9px;background:#14233a;color:#e8f3ff;font:23px/1 Arial,sans-serif;cursor:pointer}",
 ".ml-controls{padding:13px 20px 12px;border-bottom:1px solid #2c3e5c;display:flex;flex-direction:column;gap:10px}",
 ".ml-presets{display:flex;flex-wrap:wrap;gap:6px}.ml-presets button{border:1px solid #334967;border-radius:9px;background:#172743;color:#c6d9f1;padding:7px 10px;font-size:11px;font-weight:750;cursor:pointer}",
 ".ml-presets button[aria-pressed=true]{border-color:#518bd1;background:#255080;color:#fff}",
 ".ml-fields{display:grid;grid-template-columns:1fr 1fr 1fr 1.6fr;gap:8px}.ml-fields label{display:flex;flex-direction:column;gap:5px;color:#9eb4d3;font-size:11px;font-weight:700}",
 ".ml-fields input{box-sizing:border-box;min-width:0;width:100%;border-radius:9px;border:1px solid #3c557a;background:#101d32;color:#eaf5ff;padding:9px 10px;font-size:13px;outline:none}",
 ".ml-fields input:focus{border-color:#7cbcff;box-shadow:0 0 0 2px rgba(94,168,255,.15)}",
 ".ml-actions{display:flex;gap:8px}.ml-action{border-radius:9px;padding:9px 12px;border:1px solid #3a5680;color:#e9f3ff;background:#172a46;font-weight:780;font-size:12px;cursor:pointer}.ml-action.primary{border-color:#477fbb;background:#25568a}.ml-action:disabled{opacity:.35;cursor:default}",
 ".ml-error{min-height:0;color:#ffadba;font-size:11px}",
 ".ml-summary{padding:10px 20px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:#a4bad9}.ml-summary strong{color:#d7eeff}",
 ".ml-scroll{overflow:auto;flex:1;min-height:0;margin:0 20px;border:1px solid #2b4162;border-radius:10px;background:#101b2f}",
 ".ml-table{width:100%;border-collapse:collapse;font-size:12px}.ml-table th{position:sticky;top:0;background:#203452;color:#bcdcff;padding:11px 12px;text-align:left;border-bottom:1px solid #486080}",
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
 '<div class="ml-dialog"><div class="ml-head"><div><h3 id="mlTitle">몬스터 레벨표 <span style="font-size:12px;color:#8bbffa">146종 · Lv.1~562</span></h3>',
 '<p>랜스월드 기준 몬스터 레벨 · 이름 또는 레벨로 검색할 수 있습니다.</p></div>',
 '<button id="mlClose" type="button" class="ml-close" aria-label="닫기">×</button></div>',
 '<div class="ml-controls"><div id="mlPresets" class="ml-presets" role="group" aria-label="레벨 구간 빠른 선택">',
 PRESETS.map(x=>'<button type="button" data-from="'+x[0]+'" data-to="'+x[1]+'" aria-pressed="false">'+x[2]+'</button>').join(""),
 '</div><div class="ml-fields">',
 '<label>시작 Lv<input id="mlFrom" type="number" min="1" max="562" step="1" value="1"></label>',
 '<label>끝 Lv<input id="mlTo" type="number" min="1" max="562" step="1" value="562"></label>',
 '<label>특정 레벨<input id="mlExact" type="number" min="1" max="562" step="1" placeholder="예: 36"></label>',
 '<label>몬스터 이름 검색<input id="mlName" type="search" placeholder="예: 예티, 크로노스" autocomplete="off"></label>',
 '</div><div class="ml-actions"><button id="mlSearch" type="button" class="ml-action primary">조회</button>',
 '<button id="mlReset" type="button" class="ml-action">초기화</button></div>',
 '<div id="mlError" class="ml-error" role="status"></div></div>',
 '<div class="ml-summary"><strong id="mlCount"></strong><span id="mlFilter"></span></div>',
 '<div class="ml-scroll" tabindex="0" aria-label="몬스터 레벨 목록"><table class="ml-table">',
 '<thead><tr><th scope="col">레벨</th><th scope="col">몬스터 이름</th></tr></thead><tbody id="mlRows"></tbody></table></div>',
 '<div class="ml-footer"><div class="ml-note">※ 원작 메이플스토리가 아닌 랜스월드 레벨 기준 · 20종씩 표시 · 동일 레벨 몬스터 모두 포함</div>',
 '<div class="ml-pages"><button id="mlPrev" type="button" class="ml-action">이전</button>',
 '<span id="mlPage">1 / 1</span><button id="mlNext" type="button" class="ml-action">다음</button></div></div></div>'
 ].join("");
 document.body.appendChild(modal);
 button.addEventListener("click",open);
 $("mlClose").addEventListener("click",close);
 modal.addEventListener("click",e=>{if(e.target===modal)close()});
 $("mlSearch").addEventListener("click",apply);$("mlReset").addEventListener("click",reset);
 $("mlName").addEventListener("input",apply);
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
function valid(n){return Number.isInteger(n)&&n>=1&&n<=562}
function apply(){
 const a=Number($("mlFrom").value),b=Number($("mlTo").value),e=$("mlExact").value.trim();
 if(!valid(a)||!valid(b)||a>b){$("mlError").textContent="시작·끝 레벨은 1~562 사이이며 시작 Lv이 끝 Lv 이하여야 합니다.";return}
 if(e!==""&&!valid(Number(e))){$("mlError").textContent="특정 레벨은 1~562 사이의 정수로 입력해 주세요.";return}
 from=a;to=b;exact=e===""?null:Number(e);keyword=$("mlName").value.trim();page=1;
 $("mlError").textContent="";render();
}
function reset(){$("mlFrom").value=1;$("mlTo").value=562;$("mlExact").value="";$("mlName").value="";apply()}
function render(){
 const q=keyword.toLocaleLowerCase("ko-KR");
 const rows=monsters.filter(x=>(exact===null?(x.lv>=from&&x.lv<=to):(x.lv===exact))&&(!q||x.name.toLocaleLowerCase("ko-KR").includes(q)));
 const maxPage=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));page=Math.min(maxPage,Math.max(1,page));
 const selected=rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE),fragment=document.createDocumentFragment();
 if(!selected.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=2;td.className="ml-empty";td.textContent="검색 결과가 없습니다.";tr.append(td);fragment.append(tr)}
 else selected.forEach(x=>{const tr=document.createElement("tr"),lv=document.createElement("td"),nm=document.createElement("td");lv.textContent="Lv."+x.lv;nm.textContent=x.name;tr.append(lv,nm);fragment.append(tr)});
 $("mlRows").replaceChildren(fragment);
 $("mlCount").textContent="검색 결과 "+rows.length+"종 / 전체 "+monsters.length+"종";
 $("mlFilter").textContent=(exact===null?"Lv."+from+"~"+to:"Lv."+exact+" 검색")+(keyword?" · 이름: "+keyword:"");
 $("mlPage").textContent=page+" / "+maxPage;$("mlPrev").disabled=page<=1;$("mlNext").disabled=page>=maxPage;
 $("mlPresets").querySelectorAll("button[data-from]").forEach(b=>b.setAttribute("aria-pressed",exact===null&&from===+b.dataset.from&&to===+b.dataset.to?"true":"false"));
 $("mlModal").querySelector(".ml-scroll").scrollTop=0;
}
function open(){lastFocus=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";$("mlModal").classList.add("show");$("mlModal").setAttribute("aria-hidden","false");render();$("mlName").focus()}
function close(){$("mlModal").classList.remove("show");$("mlModal").setAttribute("aria-hidden","true");document.body.style.overflow=oldOverflow;if(lastFocus?.focus)lastFocus.focus()}
function setVersion(){
 const badge=document.querySelector(".version");if(badge){badge.textContent=V;badge.title="업데이트 내역"}
 const history=$("changelogModal"),list=history?.querySelector(".changelog-body");
 if(list&&!list.querySelector('[data-update-version="v10.31"]')){
  const entry=document.createElement("section");entry.dataset.updateVersion=V;
  const title=document.createElement("b");title.className="changelog-ver";title.textContent=V;
  const p=document.createElement("p");p.textContent="경험치 효율 계산 탭에 몬스터 레벨표 추가. 랜스월드 146종(Lv.1~562) 몬스터 이름 검색, 레벨 범위·개별 레벨 조회, 구간 빠른 선택 및 페이지 이동 지원.";
  entry.append(title,p);list.prepend(entry);
 }
 const caption=history?.querySelector(".changelog-head p");if(caption)caption.textContent="주요 기능과 변경사항 요약 · "+V;
 return !!badge&&!!list;
}
if(monsters.length!==146)console.error("몬스터 레벨 데이터 수 확인 필요",monsters.length);
let attempts=0;
const timer=setInterval(()=>{attempts++;if($("tab-exp")&&install()&&setVersion()){clearInterval(timer);console.info("[RWS v10.31] Monster level lookup ready:",monsters.length)}else if(attempts>=250){clearInterval(timer);console.error("Monster level lookup initialization timed out")}},60);
})();