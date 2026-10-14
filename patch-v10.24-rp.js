(()=>{
  const BASE_RP_301_350=[
    20566800,21719147,22936140,24221408,25578787,27012326,28526304,30125240,31813906,33597344,
    35480878,37470132,39571047,41789898,44133312,46608289,49222224,51982928,54898649,57978102,
    61230491,64665537,68293511,72125260,76172240,80446555,84960988,89729042,94764981,100083871,
    105701627,111635058,117901922,124520976,131512031,138896018,146695042,154932455,163632925,172822508,
    182528728,192780659,203609013,215046232,227126585,239886273,253363535,267598765,282634633,298516214
  ];

  function applyBaseRpData(){
    try{
      if(typeof LEVEL_RP==='undefined')return false;
      BASE_RP_301_350.forEach((value,index)=>{
        LEVEL_RP[301+index]=value;
      });
      return LEVEL_RP[301]===20566800 && LEVEL_RP[350]===298516214;
    }catch(e){
      console.error('v10.24 RP data patch failed',e);
      return false;
    }
  }

  let dataApplied=applyBaseRpData();
  const timer=setInterval(()=>{
    if(!dataApplied)dataApplied=applyBaseRpData();

    const version=document.querySelector('.version');
    const appReady=!!document.getElementById('calcRbBtn');
    if(version && appReady){
      version.textContent='v10.24';
      if(dataApplied){
        clearInterval(timer);
        console.info('[RansWorldSimulator v10.24] Lv.301~350 base reincarnation RP corrected.');
      }
    }
  },80);

  setTimeout(()=>{
    clearInterval(timer);
    if(!dataApplied)console.error('v10.24 RP patch timed out before LEVEL_RP became available.');
  },10000);
})();
