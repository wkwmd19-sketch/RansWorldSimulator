/* RWS v11.01 - pet tier trait expansion and dice rebalancing */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const PETS=[
 ["brownDog","갈색강아지",0,0],["brownCat","갈색고양이",0,0],
 ["blackCat","검은색고양이",5000000,8],["blackPig","검은색돼지",30000000,16],
 ["whiteRabbit","흰색토끼",100000000,24],["miniCargo","미니카고",300000000,32],
 ["husky","허스키",600000000,40],["monkey","원숭이",1000000000,48],
 ["panda","팬더",1500000000,56],["babyWhiteTiger","아기백호",2100000000,64],
 ["turkey","칠면조",2800000000,72],["dinoBoy","디노 보이",3600000000,80]
].map(([id,name,coin,bonus])=>({id,name,coin,bonus}));
const DICE=[
 ["normal","일반",1000000,[70,30,0,0]],
 ["advanced","고급",4000000,[55,35,10,0]],
 ["special","특별",15000000,[40,39.5,20,.5]],
 ["legendary","전설",75000000,[0,67.5,30,2.5]]
].map(([id,name,cost,probs])=>({id,name,cost,probs}));
if(typeof petState==="undefined"||typeof PET_OPTIONS==="undefined"||
 typeof PET_PROBS==="undefined"||typeof petRollValue!=="function"||
 typeof petBandDiscrete!=="function"||typeof renderPetSimulator!=="function"||
 typeof stopPetAuto!=="function"||typeof resetPetSimulator!=="function")
 throw Error("기존 펫 시뮬레이터 구조를 찾지 못했습니다.");
const byId=Object.fromEntries(PETS.map(p=>[p.id,p]));
const diceById=Object.fromEntries(DICE.map(p=>[p.id,p]));
window.__RWS1101_DICE_COSTS__=Object.fromEntries(DICE.map(d=>[d.id,d.cost]));
for(const d of DICE)PET_PROBS[d.id]=d.probs.slice();
petState.petId=petState.petId||"brownDog";
function selectedPet(){return byId[petState.petId]||PETS[0];}
function selectedDice(){return diceById[petState.type]||DICE[2];}
function bonusSteps(option,pet=selectedPet()){
 const n=option.max*pet.bonus/100;
 return option.kind==="step"?Math.round(n/option.step):Math.round(n);
}
function shift(option,value,pet=selectedPet()){
 const amount=bonusSteps(option,pet)*(option.kind==="step"?option.step:1);
 return option.kind==="step"?Number((value+amount).toFixed(1)):value+amount;
}
function band(option,rarity,pet=selectedPet()){
 if(option.kind==="step"){
  const count=Math.round((option.max-option.min)/option.step)+1;
  const [start,end]=petBandDiscrete(0,count-1,rarity);
  return [shift(option,option.min+start*option.step,pet),
          shift(option,option.min+end*option.step,pet)];
 }
 const [a,b]=petBandDiscrete(option.min,option.max,rarity);
 return [shift(option,a,pet),shift(option,b,pet)];
}
function optionRange(option,pet=selectedPet()){
 return {min:band(option,0,pet)[0],max:band(option,3,pet)[1]};
}
const oldRollValue=petRollValue;
petRollValue=function(option,rarity){
 return shift(option,oldRollValue(option,rarity));
};
petProbabilityLabel=function(){
 const d=selectedDice();
 return d.name+" · 하급 "+d.probs[0]+"% · 중급 "+d.probs[1]+"% · 상급 "+d.probs[2]+"% · 최상급 "+d.probs[3]+"%";
};
const modal=$("petSimulatorModal");
const types=modal?.querySelector(".pet-types");
if(!types)throw Error("기존 펫 주사위 UI가 없습니다.");
if(!types.querySelector('[data-pet-type="legendary"]')){
 const btn=document.createElement("button");
 btn.type="button";btn.className="pet-type";btn.dataset.petType="legendary";
 btn.textContent="전설";
 btn.addEventListener("click",()=>{stopPetAuto();petState.type="legendary";renderPetSimulator();});
 types.appendChild(btn);
}
const picker=document.createElement("div");
picker.id="rws1101PetPicker";picker.className="rws1101-pet-picker";
const label=document.createElement("label");
label.htmlFor="rws1101PetSelect";label.textContent="펫 종류";
const select=document.createElement("select");select.id="rws1101PetSelect";
for(const p of PETS){
 const opt=document.createElement("option");
 opt.value=p.id;opt.textContent=p.name+(p.bonus?" (+"+p.bonus+"%)":" (기본)");
 select.appendChild(opt);
}
const summary=document.createElement("p");summary.id="rws1101PetSummary";
picker.appendChild(label);picker.appendChild(select);picker.appendChild(summary);
types.parentNode.insertBefore(picker,types);
const details=document.createElement("div");
details.id="rws1101PetRanges";details.className="rws1101-pet-ranges";
const probability=$("petProbabilityText");
probability.parentNode.insertBefore(details,probability.nextSibling);
const style=document.createElement("style");
style.id="rws1101-pet-styles";
style.textContent=[
 "#petSimulatorModal .pet-types{grid-template-columns:repeat(4,minmax(0,1fr))}",
 "#petSimulatorModal .rws1101-pet-picker{display:grid;grid-template-columns:90px 1fr;gap:9px;align-items:center;padding:11px;margin:0 0 10px;border:1px solid #314a6c;border-radius:11px;background:#101c31}",
 "#petSimulatorModal .rws1101-pet-picker label{font-size:12px;font-weight:800;color:#dce9fc}",
 "#petSimulatorModal .rws1101-pet-picker select{width:100%;min-width:0;padding:9px 10px;border:1px solid #5876a0;border-radius:8px;background:#192c47;color:#fff;font-size:13px}",
 "#petSimulatorModal .rws1101-pet-picker p{grid-column:1/-1;margin:0;color:#a9bdd8;font-size:11px;line-height:1.5}",
 "#petSimulatorModal .rws1101-pet-ranges{margin:0 0 11px;overflow:auto;border:1px solid #2f4263;border-radius:10px;background:#0c192c}",
 "#petSimulatorModal .rws1101-pet-ranges summary{cursor:pointer;padding:9px 11px;color:#d0e2ff;font-size:12px;font-weight:800}",
 "#petSimulatorModal .rws1101-pet-ranges table{border-collapse:collapse;width:100%;min-width:450px;font-size:11px}",
 "#petSimulatorModal .rws1101-pet-ranges td,#petSimulatorModal .rws1101-pet-ranges th{padding:7px 6px;border-bottom:1px solid #273c58;text-align:center;white-space:nowrap}",
 "#petSimulatorModal .rws1101-pet-ranges td:first-child,#petSimulatorModal .rws1101-pet-ranges th:first-child{text-align:left;padding-left:11px}",
 "#petSimulatorModal .rws1101-pet-ranges th{color:#9dc0ef}",
 "@media(max-width:560px){#petSimulatorModal .rws1101-pet-picker{grid-template-columns:1fr}}"
].join("\n");
document.head.appendChild(style);
const number=n=>Number(n).toLocaleString("ko-KR",{maximumFractionDigits:1});
function rangeText(option,grade){
 const [lo,hi]=band(option,grade);
 return "+"+number(lo)+"~"+number(hi)+(option.suffix||"");
}
function renderExtras(){
 const pet=selectedPet(),d=selectedDice();
 select.value=pet.id;
 summary.textContent=pet.name+" · 옵션 확장 +"+pet.bonus+"% · "+
  (pet.coin?"누적 환생코인 "+number(pet.coin)+" 이상":"기본 옵션 유지")+
  " · 기본 최대치 기준으로 최소·최대 수치가 증가합니다.";
 details.replaceChildren();
 const disclosure=document.createElement("details"),head=document.createElement("summary");
 head.textContent="선택한 펫의 특성 등급별 수치 보기";disclosure.appendChild(head);
 const table=document.createElement("table"),thead=document.createElement("thead"),header=document.createElement("tr");
 for(const title of ["특성","하급","중급","상급","최상급"]){
  const th=document.createElement("th");th.textContent=title;header.appendChild(th);
 }
 thead.appendChild(header);table.appendChild(thead);
 const tbody=document.createElement("tbody");
 for(const [name,id] of [
  ["명중 / STR·DEX·INT·LUK","accuracy"],
  ["크리티컬 확률","critChance"],["크리티컬 데미지","critDamage"],["스킬 데미지","skillDamage"]
 ]){
  const row=document.createElement("tr"),a=document.createElement("td");a.textContent=name;row.appendChild(a);
  for(let g=0;g<4;g++){const cell=document.createElement("td");cell.textContent=rangeText(PET_OPTIONS[id],g);row.appendChild(cell);}
  tbody.appendChild(row);
 }
 table.appendChild(tbody);disclosure.appendChild(table);details.appendChild(disclosure);
 const cost=modal.querySelector(".pet-cost");
 if(cost)cost.textContent="1회 비용 "+number(d.cost)+" 메소 · 잠긴 특성은 유지됩니다.";
}
const originalRender=renderPetSimulator;
renderPetSimulator=function(){originalRender();renderExtras();};
select.addEventListener("change",()=>{
 const p=byId[select.value];
 if(!p||p.id===petState.petId)return;
 stopPetAuto();petState.petId=p.id;petState.spent=0;
 for(const slot of petState.traits){slot.data=null;slot.locked=false;}
 renderPetSimulator();
});
const originalReset=resetPetSimulator;
resetPetSimulator=function(){petState.petId="brownDog";originalReset();};
const reset=$("petGameResetBtn");if(reset)reset.onclick=resetPetSimulator;
renderPetSimulator();
window.RWS1101Pet={
 pets:PETS.map(p=>({...p})),dice:DICE.map(d=>({...d,probs:d.probs.slice()})),
 band,optionRange,bonusSteps,shift,getState:()=>({petId:petState.petId,dice:petState.type,spent:petState.spent})
};
window.__RWS1101_PET_READY__=true;
console.info("[RWS v11.01] Pet tier trait extension and dice probabilities installed.");
})();