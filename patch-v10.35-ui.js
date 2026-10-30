/* RWS v10.35 · UI improvements carried forward from v10.33 */
(function rwsRelease1035UI(){
  'use strict';
  const $ = id => document.getElementById(id);
  const css = document.createElement('style');
  css.id='rws-local-ui-fixes';
  css.textContent = `
    /* 1 · Table column widths, spacing and alignment */
    #mlModal .ml-table{table-layout:fixed!important;width:100%!important;border-collapse:collapse!important}
    #mlModal .ml-table thead tr,#mlModal .ml-table tbody tr{display:table-row!important}
    #mlModal .ml-table th,#mlModal .ml-table td{box-sizing:border-box!important;text-align:left!important;vertical-align:middle!important;padding:11px 14px!important;white-space:normal!important;overflow-wrap:anywhere!important}
    #mlModal .ml-table th:nth-child(1),#mlModal .ml-table td:nth-child(1){width:106px!important;text-align:center!important}
    #mlModal .ml-table th:nth-child(2),#mlModal .ml-table td:nth-child(2){width:auto!important;text-align:left!important}
    #mlModal .ml-table th:nth-child(3),#mlModal .ml-table td:nth-child(3){width:140px!important;text-align:center!important}
    #mlModal .ml-table td.ml-empty{text-align:center!important}
    #mlModal .ml-scroll{overflow-x:auto!important;overflow-y:auto!important}
    #mlModal .ml-fields input:disabled{background:#0c1728!important;color:#768ba8!important;border-color:#2e415d!important;cursor:not-allowed!important;opacity:.58}
    #mlModal .ml-presets button:disabled{opacity:.38;cursor:not-allowed}
    #mlModal .ml-region:has(select:not([value="전체"])) {transition:opacity .1s}
    @media (max-width:540px){
      #mlModal .ml-table th,#mlModal .ml-table td{padding:10px 8px!important}
      #mlModal .ml-table th:nth-child(1),#mlModal .ml-table td:nth-child(1){width:76px!important}
      #mlModal .ml-table th:nth-child(3),#mlModal .ml-table td:nth-child(3){width:96px!important}
    }

    /* New local revision · match the rebirth-coin popup dimensions exactly. */
    #mlModal .ml-dialog{
      width:min(850px,100%)!important;
      max-height:min(90vh,860px)!important;
    }
    /* Split the rebirth start date and time into independent, fully editable text fields. */
    #rwsSplitStartFields{
      display:grid!important;
      grid-template-columns:minmax(0,1.25fr) minmax(0,0.92fr) 42px!important;
      gap:7px!important;align-items:stretch!important;
    }
    #rwsSplitStartFields #rbStart{display:none!important}
    #rwsSplitStartFields #rbStartDate,#rwsSplitStartFields #rbStartTime{
      min-width:0!important;width:100%!important;box-sizing:border-box!important;
      font-variant-numeric:tabular-nums;
    }
    #rwsSplitStartFields .calendar-input{display:none!important}
    #rwsSplitStartFields .rws-cal-button{width:42px!important}
    @media(max-width:400px){
      #rwsSplitStartFields{grid-template-columns:minmax(0,1.23fr) minmax(0,1fr) 42px!important;gap:5px!important}
      #rwsSplitStartFields #rbStartDate,#rwsSplitStartFields #rbStartTime{font-size:12px!important;padding-inline:8px!important}
    }
    /* 3 · Consistent centered cross marks irrespective of font metrics */
    #changelogClose,#rpTableClose,#mlClose{
      display:block!important;position:relative!important;box-sizing:border-box!important;
      width:34px!important;height:34px!important;min-width:34px!important;flex:0 0 34px!important;
      padding:0!important;margin:0!important;font-size:0!important;line-height:0!important;
      text-indent:-9999px!important;overflow:hidden!important;
    }
    #changelogClose::before,#changelogClose::after,
    #rpTableClose::before,#rpTableClose::after,
    #mlClose::before,#mlClose::after{
      content:""!important;position:absolute!important;left:50%!important;top:50%!important;
      width:16px!important;height:2px!important;border-radius:2px!important;
      background:#e8f3ff!important;transform:translate(-50%,-50%) rotate(45deg)!important;
      box-shadow:none!important;
    }
    #changelogClose::after,#rpTableClose::after,#mlClose::after{transform:translate(-50%,-50%) rotate(-45deg)!important}
    /* 7 · custom themed calendar, consistent across browsers */
    .rws-cal-button{width:42px;min-width:42px;height:100%;min-height:41px;border:1px solid #46668e;border-radius:9px;
      background:#172b48;color:#cfe5ff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
      transition:background .15s,border-color .15s;box-sizing:border-box}
    .rws-cal-button:hover{background:#24466f;border-color:#79b2f0}
    .rws-cal-button:focus-visible{outline:2px solid #79b2f0;outline-offset:2px}
    .rws-cal-button svg{width:21px;height:21px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
    .rws-cal-popover{position:fixed;z-index:2800;width:290px;max-width:calc(100vw - 18px);padding:13px;border:1px solid #5274a2;border-radius:15px;
      background:linear-gradient(180deg,#203553,#131e32);box-shadow:0 20px 58px rgba(0,0,0,.67);color:#e5f0ff;font:13px system-ui,'Noto Sans KR',sans-serif;}
    .rws-cal-nav{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:12px}
    .rws-cal-nav strong{font-size:15px;white-space:nowrap;letter-spacing:-.02em}
    .rws-cal-nav button,.rws-cal-foot button{border:1px solid #425f84;border-radius:8px;background:#1c3453;color:#dfeeff;cursor:pointer;font:700 12px system-ui,sans-serif;padding:7px 11px}
    .rws-cal-nav button:hover,.rws-cal-foot button:hover{background:#2e5480}
    .rws-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;text-align:center}
    .rws-cal-week{font-size:11px;font-weight:800;color:#91accd;padding:6px 0}
    .rws-cal-day{border:1px solid transparent;background:transparent;color:#e4edff;min-width:0;min-height:32px;border-radius:8px;cursor:pointer;font:700 12px system-ui,sans-serif}
    .rws-cal-day:hover{background:#29486c;border-color:#456ea2}
    .rws-cal-day.today{border-color:#5381bd;color:#add7ff}
    .rws-cal-day.selected{background:#2e72b7;border-color:#70b5ff;color:white}
    .rws-cal-day.empty{pointer-events:none}
    .rws-cal-week:nth-child(7n),.rws-cal-day.sunday{color:#ffb0b7}
    .rws-cal-foot{border-top:1px solid #324966;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;gap:9px}
    .rws-local-flag{display:inline-block;margin-left:8px;padding:4px 7px;border-radius:6px;background:#294465;color:#cbe5ff;font-size:10px;font-weight:800;white-space:nowrap}
  `;
  document.head.appendChild(css);

  let applied=false;
  function fixMonsterFilter(){
    const sel=$('mlRegion'),from=$('mlFrom'),to=$('mlTo'),presets=$('mlPresets');
    if(!sel||!from||!to||!presets)return false;
    // Capture phase runs BEFORE the original v10.32 change handler, ensuring the original filter sees 1..562.
    sel.addEventListener('change',()=>{
      if(sel.value!=='전체'){from.value='1';to.value='562';}
      updateDisabled();
    },true);
    function updateDisabled(){
      const on=sel.value!=='전체';
      from.disabled=on;to.disabled=on;
      presets.querySelectorAll('button[data-from]').forEach(b=>{b.disabled=on; b.title=on?'전체 지역을 선택하면 레벨 구간을 사용할 수 있습니다.':'';});
      from.title=to.title=on?'지역 필터 적용 중에는 레벨 범위를 사용하지 않습니다.':'';
    }
    updateDisabled();
    // Existing reset handler is registered earlier; its synchronous apply() finishes before this listener.
    $('mlReset')?.addEventListener('click',updateDisabled);
    return true;
  }
  function fixRpStep(){
    const input=$('rpTableBonusInput');if(!input)return false;
    input.setAttribute('step','1');input.setAttribute('inputmode','numeric');
    input.title='0~500%, 1% 단위로 설정';
    function normalize(){
      const n=Number(input.value);
      if(input.value.trim()===''||!Number.isFinite(n))return;
      const integer=Math.max(0,Math.min(500,Math.round(n)));
      if(input.value!==String(integer)){input.value=String(integer);input.dispatchEvent(new Event('input',{bubbles:true}));}
    }
    input.addEventListener('change',normalize);
    input.addEventListener('blur',normalize);
    return true;
  }
  function fixHistory(){
    const modal=$('changelogModal'),list=modal?.querySelector('.changelog-body');if(!list)return false;
    const entries=[...list.children].filter(n=>n.matches('section'));
    if(!entries.length)return false;
    const versionOf = el => {
      const tag=el.dataset.updateVersion || el.querySelector('.changelog-ver')?.textContent || '';
      const m=String(tag).match(/v?(\d+)\.(\d+)(?:\.(\d+))?/i);
      return m?[+m[1],+m[2],+(m[3]||0)]:[0,0,0];
    };
    for(const el of entries){
      if(el.dataset.updateVersion){
        const heading=el.querySelector('.changelog-ver');
        // Version guard's v10.29 entry previously displayed a newer release number.
        if(heading)heading.textContent=el.dataset.updateVersion;
      }
    }
    entries.sort((a,b)=>{
      const aa=versionOf(a),bb=versionOf(b);
      for(let i=0;i<3;i++)if(bb[i]!==aa[i])return bb[i]-aa[i];
      return 0;
    });
    entries.forEach(n=>list.appendChild(n));
    const head=modal.querySelector('.changelog-head p');if(head)head.textContent='주요 기능과 변경사항 요약 · v10.32 (로컬 UI 개선 테스트)';
    return true;
  }
  function addPreviewFlag(){
    if($('rwsLocalFlag'))return;
    const badge=document.querySelector('.version');if(!badge)return;
    const note=document.createElement('span');note.id='rwsLocalFlag';note.className='rws-local-flag';note.textContent='로컬 테스트';
    badge.insertAdjacentElement('afterend',note);
  }

  /* Calendar popup: dates are handed to the site's existing picker.change handler,
     so its original time-of-day preservation remains untouched. */
  let openPicker=null,activeButton=null,viewYear=0,viewMonth=0,pop=null;
  const pad=n=>String(n).padStart(2,'0');
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function currentDateOf(picker){
    const target=$(picker.dataset.calendarInputFor);
    const value=target?.value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(value){const d=new Date(+value[1],+value[2]-1,+value[3]);if(!Number.isNaN(d.getTime())&&iso(d)===value[0])return d;}
    return new Date();
  }
  function closeCalendar(){if(pop){pop.remove();pop=null;}openPicker=null;activeButton=null;}
  function movePopover(){
    if(!pop||!activeButton)return;
    const r=activeButton.getBoundingClientRect(),w=290,h=pop.offsetHeight||340;
    const left=Math.max(9,Math.min(r.right-w,window.innerWidth-w-9));
    const top=r.bottom+h+8<=window.innerHeight?r.bottom+7:Math.max(8,r.top-h-7);
    pop.style.left=left+'px';pop.style.top=top+'px';
  }
  function chooseDate(date){
    if(!openPicker)return;
    openPicker.value=date;
    openPicker.dispatchEvent(new Event('change',{bubbles:true}));
    closeCalendar();
  }
  function drawCalendar(){
    if(!pop)return;
    const now=new Date(),chosen=currentDateOf(openPicker),first=new Date(viewYear,viewMonth,1);
    const start=(first.getDay()+6)%7,days=new Date(viewYear,viewMonth+1,0).getDate();
    pop.replaceChildren();
    const nav=document.createElement('div');nav.className='rws-cal-nav';
    const prev=document.createElement('button');prev.type='button';prev.textContent='‹';prev.setAttribute('aria-label','이전 달');
    const title=document.createElement('strong');title.textContent=viewYear+'년 '+(viewMonth+1)+'월';
    const next=document.createElement('button');next.type='button';next.textContent='›';next.setAttribute('aria-label','다음 달');
    prev.onclick=()=>{const d=new Date(viewYear,viewMonth-1,1);viewYear=d.getFullYear();viewMonth=d.getMonth();drawCalendar()};
    next.onclick=()=>{const d=new Date(viewYear,viewMonth+1,1);viewYear=d.getFullYear();viewMonth=d.getMonth();drawCalendar()};
    nav.append(prev,title,next);pop.appendChild(nav);
    const grid=document.createElement('div');grid.className='rws-cal-grid';
    ['월','화','수','목','금','토','일'].forEach(day=>{const w=document.createElement('span');w.className='rws-cal-week';w.textContent=day;grid.appendChild(w)});
    for(let i=0;i<start;i++){const x=document.createElement('span');x.className='rws-cal-day empty';grid.appendChild(x)}
    for(let i=1;i<=days;i++){
      const d=new Date(viewYear,viewMonth,i),v=iso(d),b=document.createElement('button');
      b.type='button';b.className='rws-cal-day';b.textContent=String(i);b.setAttribute('aria-label',v);
      if(d.getDay()===0)b.classList.add('sunday');
      if(iso(now)===v)b.classList.add('today');
      if(iso(chosen)===v)b.classList.add('selected');
      b.addEventListener('click',()=>chooseDate(v));grid.appendChild(b);
    }
    pop.appendChild(grid);
    const foot=document.createElement('div');foot.className='rws-cal-foot';
    const today=document.createElement('button');today.type='button';today.textContent='오늘';today.addEventListener('click',()=>chooseDate(iso(new Date())));
    const done=document.createElement('button');done.type='button';done.textContent='닫기';done.addEventListener('click',closeCalendar);
    foot.append(today,done);pop.appendChild(foot);movePopover();
  }
  function openCalendar(picker,button){
    if(openPicker===picker){closeCalendar();return;}
    closeCalendar();openPicker=picker;activeButton=button;
    const d=currentDateOf(picker);viewYear=d.getFullYear();viewMonth=d.getMonth();
    pop=document.createElement('div');pop.className='rws-cal-popover';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','날짜 선택');
    document.body.appendChild(pop);drawCalendar();
  }
  function installCalendars(){
    const inputs=[...document.querySelectorAll('input.calendar-input[data-calendar-input-for]')];
    if(!inputs.length)return false;
    for(const original of inputs){
      if(original.dataset.localCalendarReady)continue;
      original.dataset.localCalendarReady='yes';original.style.display='none';
      const button=document.createElement('button');button.type='button';button.className='rws-cal-button';
      button.setAttribute('aria-label','테마 달력 열기');button.title='날짜 선택';
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></svg>';
      original.insertAdjacentElement('afterend',button);
      button.addEventListener('click',()=>openCalendar(original,button));
    }
    return true;
  }
  document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!activeButton?.contains(e.target))closeCalendar()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop){e.stopPropagation();closeCalendar()}} ,true);
  window.addEventListener('resize',movePopover);
  window.addEventListener('scroll',movePopover,true);


  /* New local revision: D-1/3/5/7 with the original app's offset math. */
  function installRebirthDayPresets(){
    const quick=document.querySelector('#tab-rebirth .date-quick');
    const originals=quick&&[...quick.querySelectorAll('button[data-dayoffset]')];
    if(!quick||!originals||originals.length<3)return false;
    if(quick.dataset.rwsLocalDayPresets==='v2')return true;
    [1,3,5].forEach((days,i)=>{
      originals[i].dataset.dayoffset=String(days);
      originals[i].textContent='D-'+days;
      originals[i].setAttribute('aria-label',days+'일 전 환생 시작 시각 적용');
    });
    const day7=document.createElement('button');
    day7.type='button';day7.dataset.dayoffset='7';day7.textContent='D-7';
    day7.setAttribute('aria-label','7일 전 환생 시작 시각 적용');
    day7.addEventListener('click',()=>{
      const value=$('rbNow')?.value||'';
      let now=null;
      if(typeof window.parseLocalDate==='function')now=window.parseLocalDate(value);
      if(!now)now=new Date();
      const start=new Date(now.getTime());
      start.setDate(start.getDate()-7);
      if(typeof window.formatInputDate==='function')$('rbStart').value=window.formatInputDate(start);
      else $('rbStart').value=iso(start)+' '+pad(start.getHours())+':'+pad(start.getMinutes())+':'+pad(start.getSeconds());
      $('rbStart').classList.add('auto');
      setTimeout(()=>$('rbStart')?.classList.remove('auto'),800);
      $('rbStartDate')?.dispatchEvent(new Event('rws:sync-from-original'));
    });
    // The upstream buttons set #rbStart.value directly (without firing a change event).
    // Our listeners run after the original handlers and therefore refresh the split fields.
    originals.slice(0,3).forEach(b=>b.addEventListener('click',()=>{
      $('rbStartDate')?.dispatchEvent(new Event('rws:sync-from-original'));
    }));
    quick.appendChild(day7);
    quick.dataset.rwsLocalDayPresets='v2';
    return true;
  }

  /* Keep #rbStart as the invisible canonical value for all preexisting RP calculations,
     calendar date changes, screenshot-to-rebirth transfer and D-minus shortcuts. */
  function installSplitRebirthStart(){
    const legacy=$('rbStart');
    const originalPicker=document.querySelector('.calendar-input[data-calendar-input-for="rbStart"]');
    const wrapper=legacy?.closest('.datetime-with-calendar');
    if(!legacy||!originalPicker||!wrapper)return false;
    if($('rbStartDate')&&$('rbStartTime'))return true;
    wrapper.id='rwsSplitStartFields';
    const date=document.createElement('input');
    date.id='rbStartDate';date.type='text';date.inputMode='numeric';
    date.placeholder='YYYY-MM-DD';date.maxLength=10;date.autocomplete='off';
    date.setAttribute('aria-label','이번 환생 시작 날짜');
    date.setAttribute('spellcheck','false');
    const time=document.createElement('input');
    time.id='rbStartTime';time.type='text';time.inputMode='numeric';
    time.placeholder='HH:MM:SS';time.maxLength=8;time.autocomplete='off';
    time.setAttribute('aria-label','이번 환생 시작 시간 (24시간)');
    time.setAttribute('spellcheck','false');
    wrapper.insertBefore(date,legacy);wrapper.insertBefore(time,legacy);
    const field=wrapper.closest('.field');
    const label=field?.querySelector('label');
    if(label)label.textContent='이번 환생 시작 날짜 / 시간 (24시간)';
    const help=field?.querySelector('.help');
    if(help)help.textContent='날짜: YYYY-MM-DD · 시간: HH:MM:SS (예: 21:30 → 21:30:00) · 달력 또는 D 버튼으로 자동 입력 가능';
    const validDate=(s)=>{
      const m=String(s||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if(!m)return null;
      const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
      return d.getFullYear()===Number(m[1])&&d.getMonth()+1===Number(m[2])&&d.getDate()===Number(m[3])?s.trim():null;
    };
    const canonicalDate=(value)=>{
      const s=String(value||'').trim();
      if(/^\d{8}$/.test(s))return validDate(s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8));
      return validDate(s);
    };
    const canonicalTime=(value)=>{
      let s=String(value||'').trim();
      if(/^\d{4}$/.test(s))s=s.slice(0,2)+':'+s.slice(2)+':00';
      else if(/^\d{6}$/.test(s))s=s.slice(0,2)+':'+s.slice(2,4)+':'+s.slice(4);
      else if(/^\d{1,2}:\d{2}$/.test(s))s=s+':00';
      const m=s.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
      if(!m||+m[1]>23||+m[2]>59||+m[3]>59)return null;
      return pad(+m[1])+':'+pad(+m[2])+':'+pad(+m[3]);
    };
    function push(){
      const d=canonicalDate(date.value),t=canonicalTime(time.value);
      // Deliberately keep incomplete input invalid for the existing calculator;
      // never silently use a stale previous timestamp.
      legacy.value=d&&t?d+' '+t:date.value.trim()+' '+time.value.trim();
      legacy.dispatchEvent(new Event('input',{bubbles:true}));
    }
    function pull(){
      const m=String(legacy.value||'').trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
      if(m){date.value=m[1];time.value=canonicalTime(m[2])||m[2];}
      else if(!legacy.value.trim()){date.value='';time.value='';}
    }
    [date,time].forEach(el=>el.addEventListener('input',push));
    date.addEventListener('blur',()=>{const val=canonicalDate(date.value);if(val)date.value=val;push()});
    time.addEventListener('blur',()=>{const val=canonicalTime(time.value);if(val)time.value=val;push()});
    date.addEventListener('rws:sync-from-original',pull);
    // The app's existing calendar handler writes the original field value on change.
    // Registered after it, our handler copies the updated value to the two fields.
    originalPicker.addEventListener('change',pull);
    // Additional refresh when other code changes the source input value programmatically.
    legacy.addEventListener('change',pull);
    pull();
    return true;
  }

  function showStaleNotice(current){
    if($('rwsStaleNotice'))return;
    const layer=document.createElement('div');layer.id='rwsStaleNotice';
    layer.setAttribute('role','alertdialog');layer.setAttribute('aria-modal','true');
    layer.style.cssText='position:fixed;inset:0;z-index:3900;display:grid;place-items:center;padding:18px;background:rgba(1,7,20,.84)';
    const card=document.createElement('div');
    card.style.cssText='max-width:460px;width:100%;padding:24px;border:1px solid #648cb8;border-radius:16px;background:#192c49;color:#e6f2ff;font:14px/1.65 system-ui,sans-serif;box-shadow:0 20px 80px #0009';
    const title=document.createElement('h2');title.style.cssText='margin:0 0 10px;font-size:20px';title.textContent='최신 버전으로 새로고침이 필요합니다';
    const desc=document.createElement('p');desc.textContent='현재 표시된 버전: '+(current||'확인되지 않음')+' · 이 페이지에서 필요한 배포 버전은 v10.35입니다. 페이지 일부 기능이 로딩되지 않았을 수 있습니다.';
    const retry=document.createElement('button');retry.type='button';retry.textContent='최신 버전으로 다시 불러오기';
    retry.style.cssText='border:1px solid #70aff0;border-radius:9px;padding:11px 15px;background:#285e99;color:white;font-weight:800;cursor:pointer';
    retry.addEventListener('click',()=>{
      // Force a new document request rather than reloading the same cached URL.
      const target=new URL(location.href);
      target.searchParams.set('rws_cache',Date.now().toString()+'-'+Math.random().toString(36).slice(2,7));
      target.pathname=new URL('./app-v10.35.html',location.href).pathname;
       target.searchParams.set('rws_latest','10.35');
      location.replace(target.href);
    });
    card.append(title,desc,retry);layer.appendChild(card);document.body.appendChild(layer);retry.focus();
  }
  setTimeout(()=>{
    const badge=document.querySelector('.version');
    const shown=String(badge?.textContent||'').trim();
    const match=shown.match(/^v(\d+)\.(\d+)(?:\.(\d+))?$/);
    const old=!match||Number(match[1])<10||(Number(match[1])===10&&Number(match[2])<34);
    if(old && !window.__rwsLocalVerified)showStaleNotice(shown);
  },20000);
  let tries=0;
  const initialize=setInterval(()=>{
    tries++;
    installCalendars();
    // Split UI must be in place before quick-date sync callbacks are installed.
    const splitReady=installSplitRebirthStart();
    if(splitReady)installRebirthDayPresets();
    if($('mlModal')&&$('rpTableBackdrop')&&$('changelogModal')){
      if(!applied){
        const done=[fixMonsterFilter(),fixRpStep(),fixHistory()];
        if(done.every(Boolean)){
          applied=true;
          console.info('[RWS Local v2] Previous UI fixes + monster popup sizing, D-1/3/5/7 and split rebirth start date/time applied.');
        }
      }
    }
    if(applied||tries>=250)clearInterval(initialize);
  },70);
})();

/* RWS v10.32 · Local-only UI text/monster-region improvements v3 */
(function rwsLocalV3(){
  'use strict';
  const $=id=>document.getElementById(id);
  const REGION_STATS={"헤네시스":[1,24,8],"엘리니아":[9,66,6],"페리온":[7,81,17],"커닝시티":[16,63,8],"슬리피우드":[28,82,16],"오르비스":[85,136,15],"엘나스":[97,334,16],"폐광":[340,376,7],"아리안트":[139,181,15],"마가티아":[186,244,14],"루디브리엄":[394,562,24]};
  const css=document.createElement('style');css.id='rws-local-v3-styles';
  css.textContent=`
    #mlModal .ml-region-summary{margin:-3px 0 0;padding:9px 12px;line-height:1.45;
      border:1px solid #35567a;border-radius:9px;background:#132947;color:#bfddfa;font-size:12px;font-weight:700}
    #mlModal .ml-region-summary strong{color:#a9e6cd;font-weight:900}
    #tab-exp .rws-ocr-dm-note{margin:10px 0 16px;padding:12px 14px;
      border:1px solid #36577a;border-left:3px solid #6ba5de;border-radius:10px;
      background:rgba(25,48,77,.7);color:#c1d6ef;font-size:12px;line-height:1.65}
    #tab-exp .rws-ocr-dm-note strong{color:#e4f1ff}
    #mlModal .ml-footer,#rpTableBackdrop .rp-table-footer{justify-content:flex-end!important}
    @media(max-width:520px){#tab-exp .rws-ocr-dm-note{font-size:11px;padding:10px 11px}}
  `;
  document.head.appendChild(css);

  function patchMonsterModal(){
    const modal=$('mlModal');if(!modal)return false;
    const description=modal.querySelector('.ml-head p');
    const msg='등장 지역이 실제 게임과 다르다면 디스코드 “뭐래”에게 DM으로 알려주세요. 상세 출현 위치는 맵 명칭이 제공되지 않아 직접 확인이 필요합니다.';
    if(description&&description.textContent!==msg)description.textContent=msg;
    modal.querySelector('.ml-footer .ml-note')?.remove();
    const select=$('mlRegion'),regionLabel=modal.querySelector('.ml-region');
    if(!select||!regionLabel)return false;
    let info=$('rwsMonsterRegionRange');
    if(!info){
      info=document.createElement('div');info.id='rwsMonsterRegionRange';info.className='ml-region-summary';
      info.setAttribute('role','status');info.setAttribute('aria-live','polite');
      regionLabel.insertAdjacentElement('afterend',info);
      select.addEventListener('change',updateRegionRange);
      $('mlReset')?.addEventListener('click',updateRegionRange);
    }
    updateRegionRange();
    return true;
  }
  function updateRegionRange(){
    const select=$('mlRegion'),info=$('rwsMonsterRegionRange');if(!select||!info)return;
    const region=select.value,stats=REGION_STATS[region];
    if(!stats){info.hidden=true;info.textContent='';return;}
    info.hidden=false;
    // All 146 records are retained. This span describes region min/max, not a claim
    // that every integer level between them has an associated monster.
    info.textContent=region+' 등장 몬스터 레벨 범위: Lv.'+stats[0]+'~'+stats[1]+' · '+stats[2]+'종';
  }
  function patchRpModal(){
    const dialog=$('rpTableBackdrop');if(!dialog)return false;
    const p=dialog.querySelector('.rp-table-header p');
    const msg='각 레벨에서 환생할 때 획득하는 RP 값을 확인할 수 있습니다.';
    if(p&&p.textContent!==msg)p.textContent=msg;
    dialog.querySelector('.rp-table-footer .rp-table-note')?.remove();
    return !!p;
  }
  function patchOcrText(){
    const exp=$('tab-exp');if(!exp)return false;
    const help=exp.querySelector('.info-details');
    if(help&&!$('rwsOcrDmNotice')){
      const note=document.createElement('div');note.id='rwsOcrDmNotice';note.className='rws-ocr-dm-note';
      note.innerHTML='스크린샷에서 <strong>Lv / EXP가 제대로 인식되지 않는 경우</strong>, <strong>“로그 저장”</strong>으로 저장한 로그 파일과 사용한 스크린샷을 디스코드 <strong>“뭐래”</strong>에게 DM으로 보내주세요.';
      help.insertAdjacentElement('afterend',note);
    }
    for(const side of ['A','B']){
      const el=$('ocrStatus'+side);
      if(el){
        const text=el.textContent.trim();
        if(text==='이미지를 넣으면 Lv / EXP 문자인식을 시작합니다.'||text==='이미지를 넣으면 Lv/EXP 문자인식을 시작합니다.'){
          el.textContent='이미지를 첨부하면 Lv / EXP 값을 자동으로 추출합니다.';
        }else if(text==='OCR 엔진 준비 중...' || text==='OCR 엔진 준비 중…'){
          el.textContent='Lv / EXP 값 추출 중...';
        }
      }
      const log=$('ocrLog'+side);
      if(log&&log.textContent.trim()!=='로그 저장'){
        log.textContent='로그 저장';log.title='인식 진단 로그 저장';
      }
    }
    return true;
  }
  let ready=false;
  const timer=setInterval(()=>{
    const a=patchMonsterModal(),b=patchRpModal(),c=patchOcrText();
    if(a&&b&&c){ready=true;clearInterval(timer);}
  },80);
  // The OCR plugin inserts log buttons asynchronously and the OCR worker modifies
  // status text during use: observe subsequent updates without changing callbacks.
  const initObserver=setInterval(()=>{
    const exp=$('tab-exp');if(!exp)return;
    clearInterval(initObserver);
    let inCallback=false;
    const observer=new MutationObserver(()=>{
      if(inCallback)return;
      inCallback=true;
      try{patchOcrText()}finally{inCallback=false;}
    });
    observer.observe(exp,{childList:true,characterData:true,subtree:true});
    patchOcrText();
  },100);
  // Timers are only needed during bootstrap; retain the observer for later OCR activity.
  setTimeout(()=>{if(!ready)clearInterval(timer);clearInterval(initObserver);},30000);
})();

/* RWS v10.32 · local-only UX refinement v4: integrated notice, compact region range, balanced monster table, title cards compact view */
(function rwsLocalV4(){
 'use strict';
 const $=id=>document.getElementById(id);
 const style=document.createElement('style');style.id='rws-local-v4-style';
 style.textContent=`
   /* Keep recognition/reporting instructions inside the existing collapsible help panel. */
   #tab-exp .info-details-body #rwsOcrDmNotice{
     margin:11px 0 0!important;padding:9px 0 0!important;
     background:transparent!important;border:0!important;border-top:1px solid #385472!important;
     border-radius:0!important;box-shadow:none!important;color:#c9dcf4!important;
     font-size:12px!important;line-height:1.7!important;
   }
   #tab-exp .info-details-body #rwsOcrDmNotice strong{color:#d6eaff!important}
   /* Region level span is emphasized text, not a second card. */
   #mlModal #rwsMonsterRegionRange{
     margin:1px 0 0!important;padding:0!important;min-height:0!important;
     background:transparent!important;border:none!important;border-radius:0!important;
     font-size:13px!important;font-weight:900!important;line-height:1.55!important;
     color:#84d6ff!important;text-shadow:0 0 12px rgba(49,142,224,.15)!important;
   }
   /* Equalize whitespace: three intentionally proportioned centered columns. */
   #mlModal .ml-table{table-layout:fixed!important;width:100%!important}
   #mlModal .ml-table th:nth-child(1),#mlModal .ml-table td:nth-child(1){width:25%!important;text-align:center!important}
   #mlModal .ml-table th:nth-child(2),#mlModal .ml-table td:nth-child(2){width:45%!important;text-align:center!important}
   #mlModal .ml-table th:nth-child(3),#mlModal .ml-table td:nth-child(3){width:30%!important;text-align:center!important}
   #mlModal .ml-table th:nth-child(2),#mlModal .ml-table td:nth-child(2){border-left:1px solid rgba(100,137,178,.12)!important}
   #mlModal .ml-table th:nth-child(3),#mlModal .ml-table td:nth-child(3){border-left:1px solid rgba(100,137,178,.12)!important}
   #mlModal .ml-table td:nth-child(2){font-weight:650!important;color:#e0edff!important}
   /* Title amplification sprites use selectors like '#shop .product:nth-child(25) .pimg'
      which override the normal compact-mode display:none. This stronger rule fixes it. */
   #shop.shop-grid.compact .product .pimg,
   #shop.shop-grid.compact .product .pspec{display:none!important;visibility:hidden!important;max-height:0!important;margin:0!important;padding:0!important}
   #shop.shop-grid.compact .product .pname-row{min-height:0!important}
   #shop.shop-grid.compact .product .pname{min-height:0!important}
   @media (max-width:540px){
     #mlModal .ml-table th,#mlModal .ml-table td{padding:10px 5px!important}
     #mlModal .ml-table th:nth-child(1),#mlModal .ml-table td:nth-child(1){width:22%!important}
     #mlModal .ml-table th:nth-child(2),#mlModal .ml-table td:nth-child(2){width:45%!important}
     #mlModal .ml-table th:nth-child(3),#mlModal .ml-table td:nth-child(3){width:33%!important}
     #mlModal #rwsMonsterRegionRange{font-size:12px!important}
   }
 `;
 document.head.appendChild(style);
 function integrateOcrNotice(){
   const details=document.querySelector('#tab-exp .info-details'),body=details?.querySelector('.info-details-body'),notice=$('rwsOcrDmNotice');
   if(!body||!notice)return false;
   if(notice.parentElement!==body)body.appendChild(notice);
   return true;
 }
 function simplifyRegionHint(){
   const select=$('mlRegion'),hint=$('rwsMonsterRegionRange'),label=select?.closest('.ml-region');
   if(!select||!hint||!label)return false;
   if(hint.parentElement!==label)label.appendChild(hint);
   // This message is written by the existing v3 region-change handler, and will
   // remain correctly synchronized with each region selection and reset.
   return true;
 }
 let n=0;
 const timer=setInterval(()=>{
   n++;
   const ready=integrateOcrNotice()&&simplifyRegionHint();
   if(ready||n>250)clearInterval(timer);
 },80);
})();

/* RWS · local-only v5 · region-range presentation and verified boot version */
(function rwsLocalV5(){
 'use strict';
 const EXPECTED='v10.35';
 const $=id=>document.getElementById(id);
 const style=document.createElement('style');
 style.id='rws-local-v5-style';
 style.textContent=`
   /* Text spans the same width as the region dropdown without a standalone panel. */
   #mlModal .ml-region{display:flex!important;flex-direction:column!important;align-items:stretch!important;width:100%!important;max-width:270px!important;min-width:0!important}
   #mlModal .ml-region select{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
   #mlModal #rwsMonsterRegionRange{
     display:block!important;box-sizing:border-box!important;width:100%!important;max-width:100%!important;
     margin:6px 0 0!important;padding:0!important;background:transparent!important;border:0!important;
     box-shadow:none!important;border-radius:0!important;min-height:0!important;
     color:#f1d5a7!important;font-weight:900!important;font-size:12px!important;
     letter-spacing:-.025em!important;line-height:1.45!important;
     text-shadow:0 1px 0 rgba(0,0,0,.2)!important;white-space:nowrap!important;
   }
   #mlModal #rwsMonsterRegionRange[hidden]{display:none!important}
   @media(max-width:380px){#mlModal #rwsMonsterRegionRange{font-size:11px!important;white-space:normal!important}}
 `;
 document.head.appendChild(style);
 function updateRegionText(){
   const select=$('mlRegion'),hint=$('rwsMonsterRegionRange');
   if(!select||!hint)return false;
   const raw=hint.textContent;
   // The v3 handler still owns the level statistics. Format only its user-facing copy.
   const match=raw.match(/^(.+?) 등장 몬스터 레벨 범위:\s*Lv\.(\d+)~(\d+)\s*·\s*(\d+)종$/);
   if(match){hint.textContent='등장 몬스터 레벨 범위 : Lv.'+match[2]+' ~ Lv.'+match[3]+' / '+match[4]+'종';}
   return true;
 }
 let isWriting=false;
 function observeRegion(){
   const hint=$('rwsMonsterRegionRange'),sel=$('mlRegion');
   if(!hint||!sel)return false;
   if(hint.dataset.rwsLocalV5!=='yes'){
     hint.dataset.rwsLocalV5='yes';
     const observer=new MutationObserver(()=>{
       if(isWriting)return;
       isWriting=true;try{updateRegionText()}finally{isWriting=false;}
     });
     observer.observe(hint,{childList:true,characterData:true,subtree:true});
     // Important: preserve v3's existing event-driven statistics after all selections.
     sel.addEventListener('change',()=>queueMicrotask(updateRegionText));
     $('mlReset')?.addEventListener('click',()=>queueMicrotask(updateRegionText));
   }
   updateRegionText();
   return true;
 }
 function isAppReady(){
   return !!($('mlModal')&&$('mlRegion')&&$('rwsMonsterRegionRange')&&$('rpTableBackdrop')&&
     $('changelogModal')&&$('viewModeBtn')&&$('rbStartDate')&&$('rbStartTime')&&
     $('rws-local-v4-style')&&$('rwsOcrDmNotice')&&document.querySelector('.version'));
 }
 let versionObserver=null;
 function normalizeBadge(){
   if(!isAppReady())return false;
   const badge=document.querySelector('.version');
   if(!badge)return false;
   // An old legacy script can rewrite the badge after the v10.32 features load.
   // Do not mistake this text-only regression for a stale application.
   if(badge.textContent.trim()!==EXPECTED)badge.textContent=EXPECTED;
   const caption=$('changelogModal')?.querySelector('.changelog-head p');
   if(caption&&!caption.textContent.includes('v10.35'))caption.textContent='변경사항 기록 · v10.35';
   window.__rwsLocalVerified=true;
   const falseNotice=$('rwsStaleNotice');if(falseNotice)falseNotice.remove();
   return true;
 }
 function bindBadge(){
   if(!normalizeBadge())return false;
   if(versionObserver)return true;
   const badge=document.querySelector('.version');
   versionObserver=new MutationObserver(()=>normalizeBadge());
   versionObserver.observe(badge,{childList:true,characterData:true,subtree:true});
   // If a future upstream change swaps the element entirely, restore the observer.
   let checks=0;
   const audit=setInterval(()=>{
     checks++;
     const current=document.querySelector('.version');
     if(!current||current!==badge){versionObserver.disconnect();versionObserver=null;bindBadge();clearInterval(audit);}
     else normalizeBadge();
     if(checks>=30)clearInterval(audit);
   },1500);
   return true;
 }
 let attempts=0;
 const install=setInterval(()=>{
   attempts++;
   const region=observeRegion(),version=bindBadge();
   if(region&&version){clearInterval(install);console.info('[RWS Local v5] Ready: region range / verified version',EXPECTED);}
   else if(attempts>330){clearInterval(install);console.warn('[RWS Local v5] Some modules did not initialize.');}
 },75);
})();
/* RWS v10.33 · user-approved grouped release notes */
(function rwsLocalV6ReleaseHistory(){
 'use strict';
 const RELEASE_NOTES=[{"version":"v10.35","groups":[["RP 상점",["상품 이미지 39종을 기본 SVG 벡터 아이콘으로 변경","간단히 보기에서는 아이콘을 숨기고 자세히 보기에서만 표시","스킬 등급 및 컬렉션 칭호 증폭 상품에 등급별 벡터 배지 적용"]]]},{"version":"v10.34","groups":[["기타",["구버전 로딩 근본 개선: 버전별 독립 HTML 주소와 안정적인 로더 구성","버전 표시를 단일 기준으로 통합하고 구버전 스크립트의 표시 덮어쓰기 방지","캐시 영향 최소화 및 업데이트 시 최신 페이지로 직접 이동"]]]},{"version":"v10.33","groups":[["RP상점",["칭호 상품 간단히 보기 오류 수정"]],["경험치 효율 계산기",["OCR 개선: 로그 저장 명칭, 인식 상태 및 오류 문의 안내 수정","몬스터 레벨표 지역 필터 추가 / UI개선","몬스터 팝업 크기·표 정렬·색상·안내 문구"]],["환생 타이밍 추천",["날짜·시간 입력 분리, D-1/3/5/7 버튼추가","환생코인 획득표 팝업 UI개선"]],["기타",["달력 테마, 환생코인 팝업 개선, 업데이트 이력 정리","지역 범위 문구/폭/베이지색, 오래된 버전 오탐·재로드 보완"]]]},{"version":"v10.32","groups":[["경험치 효율 계산기",["몬스터 등장 지역 테이블 적용","몬스터 레벨표 팝업 기능 개선"]]]},{"version":"v10.31","groups":[["경험치 효율 계산기",["랜스월드 몬스터 레벨 테이블 적용"]]]},{"version":"v10.30","groups":[["환생 타이밍 추천",["환생코인획득표에서 보너스 0~500% 직접 입력 지원","UI개선"]],["경험치 효율 계산기",["몬스터 레벨표 팝업 추가"]]]},{"version":"v10.29","groups":[["",["접속 시 최신 배포 버전 확인 및 캐시 우회 로딩 적용"]]]},{"version":"v10.28","groups":[["환생 타이밍 추천",["LV.30 ~ 350 환생코인 획득표 팝업 추가."]]]},{"version":"v10.27","groups":[["환생 타이밍 추천",["Lv.251~300 필요 EXP 및 환생 RP 실측 데이터 반영","파티퀘스트 장기 소요시간 계산 오류 수정","레벨 도달시간/탐색 상한 안내 보완"]],["기타",["펫 특성 시뮬레이터 기능 추가","제작자 사진 이스터에그 추가"]]]},{"version":"v10.26~v10.26.1","groups":[["RP 상점",["컬렉션 칭호 증폭 15종 이미지 표시 문제 보완."]]]},{"version":"v10.25","groups":[["RP 상점",["컬렉션 칭호 효과 증폭 15종 추가","등급별 상품 이미지 적용"]]]},{"version":"v10.24","groups":[["환생 타이밍 추천",["Lv.301~350 RP 기본값 및 +500% 계산 수정","Lv.301~350 기본 환생 RP 데이터 교정."]]]},{"version":"v10.23","groups":[["",["Lv.300~350 필요 경험치표 갱신"]]]},{"version":"v10.22","groups":[["경험치 효율 계산기",["화면 캡처 OCR의 레벨 숫자 판별 오류 수정","하단 HUD OCR 단계별 개선","디버그 로그 추출","OCR 추출 후보 조합 검증 엔진 도입","인식 과정의 후보/검증·진단 이벤트 로그 기록 저장 기능 추가"]]]},{"version":"v10.17~v10.21","groups":[["경험치 효율 계산기",["OCR 교차 검증·디버그 로그·인식 오류 수정","OCR 로그 저장 및 진단 기능 추가"]]]},{"version":"v10.13~v10.16","groups":[["경험치 효율 계산기",["랜스월드 창 직접 캡처 기능과 OCR 인식 개선","브라우저에서 랜스월드 창을 직접 선택해 스크린샷 확보","캡처 시각 기록, Lv / EXP OCR에 자동 전달, 공유 종료"]]]},{"version":"v10.11~v10.12","groups":[["RP 상점",["이스터에그 및 설명 개선"]],["환생 타이밍 추천",["파티퀘스트 보상 EXP를 미래 레벨 도달 계산에 반영","파티퀘스트의 09:00 갱신·매일 반복 반영 (1회 20분, 1주기 최대 3회)"]]]},{"version":"v10.7~v10.10","groups":[["RP 상점",["RP 상품 가격의 실측/추정 구분 및 도움말 보강","RP 상품 간단히 보기 / 자세히 보기 전환 기능 추가","JSON 파일 내보내기/가져오기 및 브라우저 저장 정리 기능 추가","EXP 입력 콤마·자리수 및 소수점 표시 보완"]],["환생 타이밍 추천",["도움말 접기/펼치기 기능 추가"]]]},{"version":"v10.6","groups":[["경험치 효율 계산기 페이지 추가",["두 시점의 레벨·경험치·촬영 시각으로 EXP/분, EXP/시간 계산.","원시 EXP 수치 및 경험치 진행률(%) 입력 지원.","스크린샷에서 하단 HUD의 Lv / EXP 자동 추출(OCR).","스크린샷 업로드 및 드래그 앤 드롭·붙여넣기 입력 지원","파티퀘스트 EXP 구조 정리"]],["기타",["펫 특성 이스터에그 추가"]]]},{"version":"v9.x~v10.1","groups":[["환생 타이밍 추천 페이지 추가",["환생 RP/h 기준 1순위·2순위 추천 기능 추가","환생 계산식 상세 설명 팝업 및 추천 기준 안내 작성","파티퀘스트 구조 작성"]]]},{"version":"초기 버전 · v6~v8","groups":[["RP 상점 페이지 추가",["RP 상점 상품별 강화 단계, 소요 RP, 총 소비 RP, 잔여 RP 계산.","품목 잠금, 잠금 제외 초기화, 브라우저 저장 및 불러오기.","상품 비용표/실측 데이터와 일부 추정 규칙 작성"]]]}];
 const $=id=>document.getElementById(id);
 const css=document.createElement('style');css.id='rws-local-v6-history-style';
 css.textContent=`
   #changelogModal .changelog-body{padding:5px 19px 17px!important}
   #changelogModal .changelog-body section.rws-release-entry{padding:16px 0 17px!important;border-bottom:1px solid #2b415e!important}
   #changelogModal .changelog-body section.rws-release-entry:last-child{border-bottom:none!important}
   #changelogModal .rws-release-version{font-size:15px!important;font-weight:900!important;color:#a9d7ff!important;letter-spacing:.015em!important}
   #changelogModal .rws-release-status{display:inline-block;margin-left:8px;padding:3px 7px;border:1px solid #61724f;border-radius:5px;background:#2b3020;color:#eed49b;font-size:10px;font-weight:800;vertical-align:1px}
   #changelogModal .rws-release-group{margin-top:12px}
   #changelogModal .rws-release-group h4{margin:0 0 6px;color:#e5f1ff;font-size:12px;font-weight:850;letter-spacing:.015em}
   #changelogModal .rws-release-items{list-style:none;margin:0;padding:0 0 0 12px}
   #changelogModal .rws-release-items li{position:relative;padding-left:13px;margin:4px 0;color:#c8d9ef;font-size:12px;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere}
   #changelogModal .rws-release-items li::before{content:'–';position:absolute;left:0;color:#83b8e3;font-weight:bold}
   #changelogModal .rws-release-nogroup{margin-top:9px}
   #changelogModal .changelog-head p{line-height:1.5!important}
   @media(max-width:520px){#changelogModal .changelog-body{padding:3px 14px 13px!important}#changelogModal .rws-release-items li{font-size:11.5px}}
 `;
 document.head.appendChild(css);
 let list=null,observer=null,refreshing=false;
 function node(tag,className,content){const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el}
 function createEntry(info){
   const section=node('section','rws-release-entry');
   section.dataset.rwsV6History=info.version;
   const title=node('b','changelog-ver rws-release-version','['+info.version+']');
   section.appendChild(title);
   
   info.groups.forEach(group=>{
     const wrap=node('div','rws-release-group'+(group[0]?'':' rws-release-nogroup'));
     if(group[0])wrap.appendChild(node('h4','',group[0]));
     const ul=node('ul','rws-release-items');
     group[1].forEach(item=>ul.appendChild(node('li','',item)));
     wrap.appendChild(ul);section.appendChild(wrap);
   });
   return section;
 }
 function current(){
   if(!list||list.children.length!==RELEASE_NOTES.length)return false;
   return RELEASE_NOTES.every((entry,i)=>list.children[i]?.dataset.rwsV6History===entry.version);
 }
 function refresh(){
   const modal=$('changelogModal'),target=modal?.querySelector('.changelog-body');
   if(!modal||!target)return false;
   list=target;
   if(refreshing)return true;
   const caption=modal.querySelector('.changelog-head p');
   if(!current()){
     refreshing=true;
     try{
       const fragment=document.createDocumentFragment();
       RELEASE_NOTES.forEach(entry=>fragment.appendChild(createEntry(entry)));
       list.replaceChildren(fragment);
       if(observer)observer.takeRecords();
     }finally{refreshing=false;}
   }
   // v10.33 is the published version and grouped history is the standard going forward.
   const label='변경사항 기록 · v10.35';
   if(caption&&caption.textContent!==label)caption.textContent=label;
   return true;
 }
 let attempts=0;
 const timer=setInterval(()=>{
   attempts++;
   if(refresh()){
     clearInterval(timer);
     observer=new MutationObserver(()=>{if(!refreshing)refresh()});
     observer.observe($('changelogModal'),{childList:true,subtree:true,characterData:true});
     document.querySelector('.version')?.addEventListener('click',()=>queueMicrotask(refresh));
     console.info('[RWS v10.35] User-approved release history loaded:',RELEASE_NOTES.length,'entries');
   }else if(attempts>=320){clearInterval(timer);console.warn('[RWS local v6] Release history panel was unavailable');}
 },75);
})();
