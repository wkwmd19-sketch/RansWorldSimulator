(()=>{
  const wait=setInterval(()=>{
    const version=document.querySelector('.version');
    const zoneA=document.getElementById('zoneA');
    const zoneB=document.getElementById('zoneB');
    if(!version||!zoneA||!zoneB||typeof window.loadShotFile!=='function'||typeof window.formatInputDate!=='function')return;
    clearInterval(wait);

    version.textContent='v10.13';

    const style=document.createElement('style');
    style.textContent=`
      .capture-actions{display:flex;align-items:center;gap:8px;margin:8px 0 2px;flex-wrap:wrap}
      .screen-capture-btn{border:1px solid #3b6ca5;border-radius:9px;background:#142a47;color:#d7ebff;padding:8px 12px;font-weight:800;font-size:11px;cursor:pointer;transition:.16s ease}
      .screen-capture-btn:hover{background:#1b385e;border-color:#65a9ef}
      .screen-capture-btn:disabled{opacity:.5;cursor:wait}
      .capture-hint{color:#8298b8;font-size:9px}
      .capture-flash{animation:captureFlash .45s ease}
      @keyframes captureFlash{0%{box-shadow:0 0 0 0 rgba(86,181,255,.6)}100%{box-shadow:0 0 0 14px rgba(86,181,255,0)}}
    `;
    document.head.appendChild(style);

    const addCaptureButton=(zone,side)=>{
      if(document.getElementById('capture'+side))return;
      const wrap=document.createElement('div');
      wrap.className='capture-actions';
      wrap.innerHTML=`<button id="capture${side}" class="screen-capture-btn" type="button">▣ 랜스월드 창 캡처</button>
        <span class="capture-hint">창 선택 후 현재 화면을 1장 캡처</span>`;
      zone.insertAdjacentElement('afterend',wrap);
    };
    addCaptureButton(zoneA,'A');
    addCaptureButton(zoneB,'B');

    const guide=document.querySelector('#tab-exp .info-details-body');
    if(guide && !guide.textContent.includes('랜스월드 창 캡처')){
      const sentence=document.createTextNode(' ');
      guide.appendChild(sentence);
      const b=document.createElement('b');
      b.textContent='랜스월드 창 캡처';
      guide.appendChild(b);
      guide.appendChild(document.createTextNode(' 버튼은 브라우저의 화면 공유 창에서 랜스월드 창을 선택하면 현재 화면을 1장 캡처해 바로 문자인식합니다.'));
    }

    async function captureWindowShot(side){
      const btn=document.getElementById('capture'+side);
      const timeId='time'+side;
      const imgId='preview'+side;
      const trashId='trash'+side;

      if(!navigator.mediaDevices?.getDisplayMedia){
        alert('이 브라우저에서는 화면 캡처 기능을 사용할 수 없습니다. Chrome/Edge 최신 버전에서 HTTPS 또는 localhost로 열어 주세요.');
        return;
      }

      let stream=null;
      try{
        btn.disabled=true;
        btn.textContent='창 선택 중...';

        stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
        const track=stream.getVideoTracks()[0];
        const settings=track?.getSettings?.()||{};

        const video=document.createElement('video');
        video.srcObject=stream;
        video.muted=true;
        video.playsInline=true;

        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new Error('캡처 화면을 불러오지 못했습니다.')),5000);
          video.onloadedmetadata=()=>{clearTimeout(timer);resolve()};
        });
        await video.play();
        await new Promise(r=>setTimeout(r,180));

        if(!video.videoWidth||!video.videoHeight)throw new Error('캡처할 화면 크기를 확인하지 못했습니다.');

        const canvas=document.createElement('canvas');
        canvas.width=video.videoWidth;
        canvas.height=video.videoHeight;
        canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);

        const blob=await new Promise((resolve,reject)=>{
          canvas.toBlob(b=>b?resolve(b):reject(new Error('이미지 생성에 실패했습니다.')),'image/png');
        });

        const now=new Date();
        const stamp=window.formatInputDate(now).replace(/[-: ]/g,'');
        const file=new File([blob],`RansWorld_capture_${side}_${stamp}.png`,{
          type:'image/png',
          lastModified:now.getTime()
        });

        await window.loadShotFile(file,imgId,timeId,false,trashId,side);
        document.getElementById(timeId).value=window.formatInputDate(now);

        const preview=document.getElementById(imgId);
        preview.classList.remove('capture-flash');
        void preview.offsetWidth;
        preview.classList.add('capture-flash');

        if(settings.displaySurface && settings.displaySurface!=='window' && typeof window.ocrStatus==='function'){
          window.ocrStatus(side,"캡처 완료 · 가능하면 공유 선택창에서 '창'의 랜스월드를 선택해 주세요. Lv / EXP 인식 중...",'working');
        }
      }catch(err){
        const name=err?.name||'';
        if(name!=='NotAllowedError'&&name!=='AbortError'){
          console.error(err);
          alert('화면 캡처에 실패했습니다. '+(err?.message||'브라우저 권한과 선택한 창을 확인해 주세요.'));
        }
      }finally{
        if(stream)stream.getTracks().forEach(t=>t.stop());
        btn.disabled=false;
        btn.textContent='▣ 랜스월드 창 캡처';
      }
    }

    document.getElementById('captureA').onclick=e=>{e.stopPropagation();captureWindowShot('A')};
    document.getElementById('captureB').onclick=e=>{e.stopPropagation();captureWindowShot('B')};
  },60);
})();