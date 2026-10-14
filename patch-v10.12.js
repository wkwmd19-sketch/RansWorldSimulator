(()=>{
  const wait=setInterval(()=>{
    const version=document.querySelector('.version');
    const pq=document.getElementById('pqDetails');
    if(!version||!pq||!document.getElementById('pqControls')) return;
    clearInterval(wait);

    // v10.11 · simplify Party Quest configuration.
    const body=pq.querySelector('.pq-body');
    if(body){
      body.innerHTML=`
        <label class="pq-enable">
          <input id="pqEnabled" type="checkbox">
          <span><b>환생 예상일까지 매일 09:00 갱신분 반영</b><small>현재 보상 주기부터 각 후보 Lv의 예상 도달 시각까지 동일한 파티퀘스트/난이도를 반복 적용합니다.</small></span>
        </label>
        <div id="pqControls" class="pq-controls disabled">
          <div class="pq-simple-grid">
            <label>현재 보상 주기 반영 횟수
              <select id="pqRemaining"><option value="0">0회</option><option value="1">1회</option><option value="2">2회</option><option value="3" selected>3회</option></select>
            </label>
            <label>파티퀘스트
              <select id="pqQuest"><option value="">파티퀘스트 선택</option><option value="balrog">마왕발록</option><option value="orbis">오르비스</option></select>
            </label>
            <label>난이도
              <select id="pqDiff"><option value="">난이도 선택</option><option value="easy">쉬움</option><option value="normal">보통</option><option value="hard">어려움</option></select>
            </label>
          </div>
          <div id="pqSimpleReward" class="pq-simple-reward">현재 주기 합계 - · 이후 매일 3회</div>
          <div class="pq-window-note pq-window-note-wide">보상 주기 <b>09:00 ~ 익일 08:59</b> · 마왕발록/오르비스 통합 최대 3회<br>다음 09:00부터는 예상 환생 시각까지 매 보상 주기마다 3회를 자동 반영합니다.</div>
          <div class="pq-brief">계산상 파티퀘스트 3판은 <b>1시간(1판 20분)</b>으로 고정합니다. 실제 클리어 시간은 파티 구성과 진행 상황에 따라 달라질 수 있습니다.</div>
        </div>`;
    }

    const st=document.createElement('style');
    st.textContent=`
      .pq-simple-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:end;margin-top:8px}
      .pq-simple-grid label{display:flex;flex-direction:column;gap:5px;color:var(--muted);font-size:10px}
      .pq-simple-grid select{width:100%;border:1px solid #334a70;border-radius:8px;background:#121e33;color:#eef5ff;padding:8px 9px;outline:0}
      .pq-simple-reward{text-align:right;color:#bfe1ff;font-size:10px;margin-top:8px}
      .pq-window-note-wide{margin-top:8px}
      @media(max-width:620px){.pq-simple-grid{grid-template-columns:1fr}}
      #versionEasterEgg{cursor:default;user-select:none}
      .version-egg-backdrop{position:fixed;inset:0;z-index:1700;display:none;place-items:center;padding:18px;background:rgba(3,7,14,.82);backdrop-filter:blur(8px)}
      .version-egg-backdrop.show{display:grid}
      .version-egg-card{position:relative;width:min(720px,94vw);max-height:90vh;padding:10px;border:1px solid #40577c;border-radius:18px;background:linear-gradient(180deg,#18243b,#101827);box-shadow:0 28px 90px rgba(0,0,0,.58)}
      .version-egg-card img{display:block;width:100%;max-height:84vh;object-fit:contain;border-radius:12px}
      .version-egg-close{position:absolute;top:14px;right:14px;z-index:2;width:38px;height:38px;border:1px solid #57739b;border-radius:10px;background:rgba(10,17,30,.86);color:#fff;font-size:24px;font-weight:900;display:grid;place-items:center;line-height:1}
    `;
    document.head.appendChild(st);

    const rewards={balrog:{easy:3e8,normal:17e8,hard:60e8},orbis:{easy:200e8,normal:300e8,hard:400e8}};
    const reward=(q,d)=>Number(rewards?.[q]?.[d]||0);
    const rewardText=v=>v>0?((v/1e8).toLocaleString('ko-KR')+'억 EXP'):'-';

    window.getPartyQuestConfig=function(){
      const enabled=!!document.getElementById('pqEnabled')?.checked;
      if(!enabled)return {enabled:false,currentRuns:[],futureEnabled:false,futureReward:0};
      const remaining=Math.max(0,Math.min(3,Number(document.getElementById('pqRemaining')?.value)||0));
      const quest=document.getElementById('pqQuest')?.value||'';
      const diff=document.getElementById('pqDiff')?.value||'';
      const r=reward(quest,diff);
      return {enabled:true,currentRuns:Array.from({length:remaining},()=>({quest,diff,reward:r})),futureEnabled:true,futureQuest:quest,futureDiff:diff,futureReward:r};
    };

    window.updatePartyQuestUI=function(){
      const enabled=!!document.getElementById('pqEnabled')?.checked;
      document.getElementById('pqControls')?.classList.toggle('disabled',!enabled);
      const remaining=Math.max(0,Math.min(3,Number(document.getElementById('pqRemaining')?.value)||0));
      const r=reward(document.getElementById('pqQuest')?.value,document.getElementById('pqDiff')?.value);
      const txt=document.getElementById('pqSimpleReward');
      if(txt)txt.textContent=r>0?`현재 주기 합계 ${rewardText(r*remaining)} · 이후 매일 ${rewardText(r*3)}`:'현재 주기 합계 - · 이후 매일 3회';
      const summary=document.getElementById('pqSummary');
      if(summary){const ok=enabled&&r>0;summary.textContent=ok?'사용 · 매일 반복':'미사용';summary.classList.toggle('used',ok)}
    };
    ['pqEnabled','pqRemaining','pqQuest','pqDiff'].forEach(id=>document.getElementById(id)?.addEventListener('change',window.updatePartyQuestUI));
    window.updatePartyQuestUI();

    const formula=document.getElementById('rebirthFormulaModal');
    if(formula)formula.innerHTML=formula.innerHTML
      .replace('다음 09:00 갱신 이후의 3회도 반영','환생 예상일까지 매일 09:00 갱신분 반영')
      .replace('지정한 파티퀘스트/난이도로 새 보상 3회를 매일 사용할 수 있다고 가정합니다.','현재 보상 주기에는 선택한 반영 횟수를 사용하고, 이후에는 동일한 파티퀘스트/난이도를 매일 3회 반복 적용합니다.');

    // v10.12 · version 3-click easter egg.
    version.textContent='v10.12';
    version.id='versionEasterEgg';
    version.setAttribute('role','button');
    version.setAttribute('tabindex','0');

    const modal=document.createElement('div');
    modal.id='versionEggModal';
    modal.className='version-egg-backdrop';
    modal.innerHTML=`<div class="version-egg-card"><button id="versionEggClose" class="version-egg-close" type="button" aria-label="닫기">×</button><img src="data:image/webp;base64,UklGRkAdAABXRUJQVlA4IDQdAABQbgCdASq0AJ8APp08lkiloyGhMvb92LATiWwAwVI42l6j+vHpDci9zHz+OU+UfJ/6HrB27Xmi83301/4j1AP71/jOtg9ADy7vZx/vv/hwRjz3+J/7jwl/HPpf9N/eP8f+v/t45a+wzUg+b/kP+f5s/9H+/+P/yL1DvzD+mf7n02YWOlfoL+6P3P/meJh/remf2q9gHy88LGgN+qvVg/xv/l/svSv+if63/4+4h+vPXV9J8uhv6iWGwKvPSTGD6cQ17Hb7Rb+ZenzxhnoJdTLxRXPo3cLm+uB0Myx5I1dRhwZoxnzbvfnu0LF5GyL3o9qf1HJEYWGvW2EmuUhvtDD81RTg5hO/gqEZFiOavG6YNaLfCfqtCDnj8K8+5uuddNpI8nBrKeWfQyXObu2y6FuaNlSEOPfEh0af4vhRpKY8vsPDVPBYAWTMuIaRM64gevzkC5XQUQbyyrWlDy6TyMsvsf1LoWiBj2dKP+jImR53QqVdh8hXUVNTzakIpitJObrFhiBNKf0h/n8taGV3bz9yRF7Avfu8b4LrmrvWYZ13wQqGIVf83DsFw/m6MFzdxMl5sOLdAyoHL+Av9Onhx/738pYisOvn+jbivY4FaPtc3cjc76iZbcpzgC+egcTdGS75nYcP2d3LRlo0BjHyFFd77gZ6PZDmOuZhcqtSwjdoNrY7ulgTNcgJZPv9KSGClqnyNXtOKrH56RsUiE0jW0Mabg11DPLI1SeSeL+Gc6WphMm2TOMbWo0BJa/p0ZhIv3mVPlTpR3W+eCi46BtEKgqww7ZHPrKNe40rc1jZpBbncB+1uFpKYQkxc+np8NoiiLgtg4aH77hzSLuZlQpvvbgXghdxVR/aBvK22WkRdVvEYqMEQ7tH8o5mp2js5oCAh/5s7DmRoFuduWM8SVxDpDjYNkWSkJQnoNdMcg0lsQ2dfwvzXW9MQHsB/Pl5p+OfeLnb/7Nj1AyH/e/9/d3ZBXYYbrFSn8/7B5bQbDWvUbrLh8FBbH01+5QQqco5JgbHbUSiWf0rd7BAtTa7riE6G+U+vvv1ha8q4LLkYYUuPXNVn/Mi6WvnhZhUBDmu74D1aSBUsYWqWz5WZTJsIJ//xsi4WGR10epncgL6ro3Z7NqSrwEnZfM/f12322Sxa8IPOu63ZXpfBv2bNdYPiIfUN7yVegJTOpub3Vn8WQAA/BUB6+qeNK0MBp9GP06KzMH/Oi2byOwdoq1nJscPFtQTXPKFz6YJD17+48lnuFp2q4V/GPj0SLqi7kA5xv/NJQksfZX97wG0tdPpKoXV/iEsTJTi+BY7X2LenpXs6tGoITfchPIvKAJuKfqktd/cTpTnFcE8OLkE3Ps41wsiQyyPK5EQVb56ba3nBbHfZtTjS/WjJR3HAYkd79j94qNW3Dd/H2wJXPKn/UcYx4rI5poSoUta2chax+CIHKCeBtWFxnXWB/DjaAw702QKL/qwbsgeGWtottZ8vyjYuWGHLkSRoyNTZpFlw2+f5DGlrdJbgCjQLrmBUnB3VyaUQghx8dx6QUJiQKbr7zX9DF2bl9iQ1A0kmee+5UZtF1Vc/5BLUOTh51LhezwOebNUcLSv++UPcbBca34KJf6bQcT+mUdU42A0g11zeZnKDW03UAEdJqxBsMNhkTDXZ4Yon8iwWoeIu3W4PgUDqPNOMTWfWCq9Owcoccu5DCRW/d8qm0dDNvc96cU27j5LySvMvipDzoXHaDvHeoKCA7PZSoqRuXUiihPPR4ebV+M8C4ceuSo8OKu4gx9WX7qTf6qYfVm2jWeUEzfVx66kbfqNxUKhRxFWQoKrLU8HP6sf/AhaRSxsFC91Zvb3xr79xSHP1/OfCO97Xfctnv89Uoh7VOV4wJ7Al25zlPEupZ/wTL0IH3wAT+s1cmofuZvqRUVHI1WGXDcjiAwgTZj6dVuIOJAKE6cS+fKVi0zt9a2v7z00mRWywz4f0nBUszPIRTeAGYjDJ61ALLHYSxEdBMWhSjseeOuhhvZYJBNTlt1iT4rDoKtzQqSc6GwdRt+COeJ9qMDWldq0vKRaZOfYtPmQZEGNJBxhJZRfxjOmywZQvjrM9w6Cz7OSyZ5ol44KYiRMaZZa5dI40SC/JYNar8TywFakoXUjiSvXm0CuakpRiB8qt69JXRhTmdIzwjaN8aXVniFjYwzXs3+TPXViGUkVg19PZsk3X8GmmexWfpQXOjznOtIlXXrkkF2G2n5sjcQSLyRT6kaTxI7h3IKwatuXWCWqHpWk3pQLDVEDUz8fBBS762PoywuRIoJ9SQ98bHmc+wUcJPJjolp9jzcxotWnoRyW2CF1aqgy0ol2nv5KQqqsRhk1aw8OXKObgU8ravp6w7PsDPQfvPTltNimBFI2dDHzouieonEku4Aush2AnNWVoRe5/KN1/uHyxj+TveRvrtFTWFQgG+l91COu0QEMIpN0F8G8aKCKZ4iXA4rTvGaR0CbBkYHChEL1uPmPH8YdOaJLtpiTeiOziEnhwkFe8UeniTL123HF6QfFyECDNnmtWraNGH/eNAyM3iOEQP9zlMAbkOud+mraPhegrRDzALl5+tbozmDo9ZNqy6YbcTaUra+InCHkN2Usd2vSKTs3QPDcsZaQ3nmxROkdLF+Uen3nNjnPEi8eUOEM5WVLC+iy1HvjbSTrLjg8j50Q7pZFhVu3GWJN8SQU476gFOrrVTFTn9XEoYgVwZLT0Ipn3aeHTnjNaRnsj+aMfmR+32YCalI7Z8B28XrjvFoAJ+/DBTnkyWY67coICjbbepf/2sCqZK7X/dR+qfaIXvANcTlLr90lOk3QzKmxrwncuhGnyP0o+OTHK+YUmvscae/w+x1903s2aUy6iTeG0eynZZeHRROMDZ52TjaoT4HzUvikL45SoAOnu1w3JaXBUd23H5ky37vagIFUM4M20zzBuP4ic04d+HqrNzP8Y0pQkJlJGWaJzmfKShTbUcBc66H9buUD2adq/2gSJjIqT7PUyb3cplTU54yIWqNGSEDhFPmtdFZ67vTf4/ExJ7whcD5RmG1PWVEBO1HEGTQzJ9YiFRpQNemh548J22jtVK10Rbgzvbh2MylH2lOpaq6ii2DsaVUfkWmNt+lD9GB66IJXdWMmdm2qB96oghgkJYQvvhJ99NJjRIyWYFvcNBPOAwG1eWzTn0hroNLb2zfgyhdkfrruh2iiPGzbCdRIZrrC7KtLfqu866TS2bYuBT6gvj1PkGbkX8P4dwN72x50gekow51uC/ulN/PB1xRlDPQlJYOPX7UNNbdZmyEweD69XA19grwBqap7/RWoWtW0L8Q6BF6uZ5vYTFdZWGvovRQsFrNz5RijLuid94cmcjKB5KTNaoAxL21v/mbrHZGPt9IMOZnr9r9Vn9ZtCNwVTaIbGt++UG0bkrwnB7pVVDNkWC9WsnqxTJeDeb/UAR0Ido2XkopuFPA0GoDPgswmKmf6eY3X2y0/5VXrTOUevczR+yy7B1hpicSSQeR+JsI7EPGeaxb1AqRCcIbBJB6SQpD8MUk6G8aZ6PAtWmTNxzivw7UzwIQLfvNK9zwayFZCKEV2K9R0fyjSWdOxrac8iiizL4/iZirlGwM9c4ycmQjvzzheGFB/gfSSTyLMz4HOiH2i8zz0/CjV/KFTXV1+tuOePE/SLI8qh3wMwlQv1NRPPpN/JphgWF/UN5IK03g1blIYOg97+Q78oGgypBWTxonSD5JIIyySRlYUoSbcsSlm+Ho5JWyfs2Vxu1Lx29IyMn9n3LG+QY2R43Im5n3DR3QSvOQnNu5wWBUBinxIIpva2ajNGS+fcgxDuO0OoallWjfRw+658LgvJx/hLbR594Oua0m+9euPmIR3jW249q1UI996TG1V512OLubfZXnS/9uteB450CJUR9ipPuXzoh45HAERypbE4zbTVOWnFDbDDinSJuWOcLWlLO1xd3pDNTaNaQUS0ldsXJyQo9lW0+4ji5+/8hfi2D6LP/PAG2v/kV/vCKXwfZlHUVCia0LKNdfhOv0bMRz0e+ZLZZqdf6QhjB6t6X6He/7NfhlfEXKo4m77dMrJr10tdgh3H3HNKuaiV9IK+u26BkDqMtNN42Ot56A8u5/0riFm7a136HY0NXbxYgDlrm/5Qy/Mm170C7kw88w9enk4ejvcMItc0qKy/S1D8zsx+Zz/iOpI45mqYnUlJH0sQpk+NyCDumKrBf3hup6kH/gIPiDv79EVcRrPByTpXdWXFzKE6cd4DNnDCcW0RSQVWkBYsWWBJz04qJ3flQoZ0uFGhN/sKkIZwaDWntMAr14tXI3tWrGs7I//DXZQ1m+9oEfrW61YEV9yVwXk+aqPQ5r+0jUYibsZbVc8DzIksSaFcl86p5uOCbYpkeAR5mL6cjFUNdsmuih1D1uhPXerhQ7qBFJDWwC/TTxVrmI5t9I16OdDhs3+BaKyc1QtnQLfUEnqyani3IxQue+NGMvjgyrhT6xUEnZUpFWwWHMVv35yNzqh66MV55MtRy6tGnusGFTaE+/FXdLMOKDROBRAhyMAFVlnFdSpVdbCNPiWuQ5Zwn7lkvpheBBYEkaWDSyX8VipQaACkWLAvjja4NSlJmSc8rJhdURi9Ytf15ytVruLpuoFdxXWhBXHQ9c+jaFzO/EOFKAtgOYnAVxetYrd9UFXtzYrY0jRlYXakY8IoZdtnKNCCNBVV06qMwMPgQgjMEfzUVAtOMMTX0aORO+Db7BdmLxsRnSkhnlu6IecSbdjo4SjvYg6RvdX5Q/ZZgwqEw6Fr1TuFrPKrLA2izZ58+2xu/+7yWDTQfOw1hl/tmC0GcgtT/AGKZv6WZqnYzjE1yo7+wRZ/3FD26zed3QtPzrF85cEbtr/BajX9PdQNScLbmo5sLrIIf+LZ10DUUMTnkKQtvIbiWbkL7+7SsyOQr7MN3MndmYWp4iFoEMZ4Qqt/Aswzi2jqFdWT7dG7A2dRB7tyuHSZJO0Zw7g3dRl5YXwjTc3Pq37jsY43yZzqY61T7HSMPfQy4Pnumrn+pZuAtXWNoO4naYoHje+rVetu56ibFyL9cXqjYQ5+EmpmYnJ5g9OqwDwU+tV1QCl86LDG8Kwfd6yfkFyYTeXGywVm4c1Ruufd836M5i29C4EuXx7zdz+CPHi+4+CU+2hgy1x/KmGsJOQrpltTXY5a45Ff4RjhqxVxP75ASqCb67++X8SQYIuJxu16qWDL2VsHA30DKXTRFPxrXcWdyaOvMM2qEQtyjLX8bxvqDK5RoU1EnSyNRjNekHiPn6w7XghS8ksCtyHwOzoFfKr6c9nR9pfAbrQtGask+v3QH2cNfQqjvHtfPS4pYwMFb5Q4SeeVXQ4sNWc7KnBc6XwhXagXhftg51sEAUNrMCyNHYaKqytI/YISskTS0qI0H3jJoRqvoBmZ9UB+y+6FF29SfOyPfGDa9JbrRgN7wyXmyAWp1M1orS2dSaNw6oS2XWwGAE+cOlizUHScrkpniOpmu/1KnjnNihU6Q6Yaxkp5DVLH3PX4p8pHUQZMgp5fo9QSVav1x8S135MnYAUg8xVzP8QDj4isB6GslfNQ8eR2YCFZ6f1zFkHDDkNf5TdOznBqbSxlAqkXhbJ2o0aWBAx2WLNP0fxgbJqbG+IJLTxnCrjIqBl2GSsQL4hoPYQ+aRyOtJ6dIjiq0cY9+bjps2hDBd+qN+2HBzoPw+0zI5H74wPZ4bT/SXruFSrJLD5oXoX9obzuDvU5my/V9yVGQ69T4FNZlyTiZbmCryMU28yVx0vcZAQ952k9eywn3wZomRcqORGfm3iUjCOslUV52o6SX+3wcqiJVqNrtYogst7gRUsZ/xC0Qtp+QPvscPTyWR6ubkz8rIi8+kM/lTf9NS17UCRfemohq7NVI8zvav/WBh6/WW5fChcCbi30EijTzMliPr/vsyEsNAwBlWATx9frE9sqyRKnmnd2xwrsvSytXJ9bDwMwdVS+nBbvPKUMT9X/Y4kXYwUcYN0QBiAYToAV3+Tq/k4vWfSe1LZHvnwNzPPHceCC73IDcTXYdGNVDg/7WK5wF1iXOejdL1GTsD0cZ3lgHsRg+PtF6+t2ZnNLPlDyaIRIKUyWLayYwefdZTploQD3v4x0V/HatDksJIa0t9NedZ/fDo2PzyOTwJxKI1AE6m+ICCwNFH7AxLYrj562rI4UPJl/5wtTVE1Lu5Z7EiXuTbAeSy28CyyZxmumNjq6pXJy9Bsyujz11ZjeETq3VdHxDLum5fowYY2OsD4olR+mcf/sXjiUcvIAzTrpQwmatWC+0jXXgr6FxT4xTIuNTT4bQiUYxtfZXpmzzxVWZIW7Cx7X/f4Fyv8/xzrqEiz9DNeTMyjcEk4nBeF6zm+zrfh699T/zBj/pvKblNPICUOg8GkO8qn+GS6H+KrTcAXty6h/ksW957/eTG2BOEJinZg+RpHda2hRzgRlfwmPIIB0gY1HscYL9IKAskFE17eIcCsUh6HvIXGfwtsdLjA3zlr5oYEGOiaM97k1ROq1LpiYtb6EvxT0t7gEKtdA+0zxLm/OGL8oR6iap7oE6MYWs1CjsiI4nZrYE9bFuN+mw3oNhGCMZRTgJ+47LKYJ5I0QOnozZemmeQSiZqOSUDw1LMTP3gOOwPpo3wxTG7djy8fGNkp/tcIL0lMKauDXV5BaeWbgeR4CPGgajZHc+JCVLdx7ULU7IjTNultQ4SyB03KXxhALR8Jt82UFH5CuCFMB0hL++vmsdfwGFsPhRDps1IA7/SBM6/RXQRz2Q9V5TzneHAKrRpHATlM/ari7CD51qDuueZDhSjiOBcG1+gJcZakVJ61yPRbBfuGBSDNCwU2gYt1ejCzqUdhVggd3gXyHDPmveCUkJ+QoiyZBxSMcTmQVjKuDOG8oP3GQuZt9xUPd2u32Rb4GzLcdlkAXIHEQWjWLjS2kZJD23sy6/JjLWsdW8BMJk837+PhI1/WHmxg5AMwHJmluz9eOzJP1dr8Dki1kAtQb5EbOek98RZftdPbL8r4k2zGrw01WmwwnNjE+J7GMkBv7ViHjYYVJbkyeeHHvhuFKaZPH4tRa6Sx7dSxh08KXAZ1K1V9hGvBUAMUFRHV0Hk4E1D/l8PTyJT0bhFimCFoAuC7SfMWCUVoiEourPvu8rQv/REct9r+a7Knyqfl3VkWgYIIM9oe9U1sVemEuJs+pAqsDZC9ijDv2IK/VUOkLfMO7YjGo5OGuQYnT0kbn61WequqBDBmITKMplFvGxMq9RQb0x85NghJJDm9x0mCMxEkneFH/4lG+kM8My49SvZl0w2GERX6lkNPrZkPQGwgdtItR1MXiwup+Pxe/LB9BA87EiY7hGuwgw5WB8ofz0QEfbYB3pkAzuzMmRchnfYFqgmfcQPM9Lu0gZ2d4falUPnqE40bzbleaxDMfVF4eWXwLWsD6/xtIPAh9SjsTFuyxy7zsitaHn5LNKMSv9qp6qxpvaU5aXsf+JANIf8E0EmO/rrxNOrK5hLsSKWCOYvGlfcT88X0fAFPbIHt+jRRPL6DbgXSDNQjzFxDZFPdsNR8gQYahN6EqAcA0q1VAUyj3GYk/1qPxUY1IsZ9cGGEpLXTDBljVDaNMe61FTgK8KRX8vzByifJ92v+WgS02MWcnJyxQrEhiq+N7qa8Lyucp4eIdOqgVJ42YHB2l/PBhMinTwi6s12ff/TWNlVv1B0SJacEDuqPpBiZNN+CE/+7A9XqnSBJKPfiVAUp1qfCtpqkjnStdnhdzGRm5hMrh0+sx5PgVo01pf4LB2hjOrNpEm/XI7mdZfc4G5xsLXxdlv2hd547hAZBxX8zj7UHV9g4h+EktD7lSGHLVR/pCmS3PB6hwoIZTLyiB0bC1utE0W9q2IjeWUcVwg+U3UcTgiBdqPFc/c6XZyuKUpnBGP2gVsclSiG6+QJQo3c94u2NbDp7jyLQhDPu0d3qyQmbq9KGZ3S50YDjdvxls1F0LV8e24yjBOEk1dSFtOy3ue+6OzflEOVS6kkm0acxNixH5v5vsbWr/tp4fpXhq6DNda7gjdF9Barm+ETxvCYev4UAD3+O3vLlJiKE0CEfw48oqm11pzT2QD/IO8Ix4V9Rj1Bxo4mVVbWvWGUox+cfqG+qeRDJ3Idqs0NBM08vJlNRRXWzaRyTtG8t8l8ShF7zbdCILWpxFbW2WjbKIuxquV+sITMOw/OkV/JQjQInwG5gHWxpAMZA7qulNGmASCHV0mL7iMK/9K91H+gh2LmVB4H38/C2/jimQjfCs74CFQ+Gz4bHKxox7e4UdCMC+OMGN7cC2tt2nMJlqu5djEoSVFPYToGrlmKR5jPv7PO+KmFr5nemmOFwG66zpvkPeUTmL9ewV3b53j69X2uCDWMcek6AqSPFpzLLPbf8q58+N13uyF0r3IEfPNSsVsZRRJu/I+WyTGhDxtBQV/rVJig5Cdsv90P0UmX3rHmUoSrNBeEiJvOV/DuYB1gwiuq+78WKzyrUoh2SHE/FLEAwsEqLeotV1ywKiywDLpBjgWJYdRG6pH6uhdZ33fP497WHTwlgJ+4Zgt0KKGenNgszWe10JKDYPL/rZi5unkDMZCPaHqcRUubAPxy2BANQEh6in35GCu5tUs7UczJuggjNpRaySVCyH26Y63KLFC8eyTBiBQeAhXlOXwfKQK1fixV1jznsYyMLwqlns3dFXlbgqYmMf7ocfSaqW1dJQdMCmEBue2rrhA1IXYY5VMYSxLUnQtR8C8q6OTQK7RnT2+OpFP3+noLg2eGEkXa/c03N3Yxa0fxIgU2KUz5EjMV1AmMHHU3/EiOT9r+1JzctVSDyqyUcc8INyXlZ0tAqvMdKLhJMCJis6PpU1zZ4eDgkZQtiJeZzmJYz4KkLXXpuCVXlUsBgxlDSo7ZATrRgUmkq3r45ELYFNhPnEfQsWQnEAZ8tY+Bsu2Aja54dWcTrVUupub8iaavFPA+0vFS1hmqYfBygqPCKgclo3PVTO/LOzjGYH2LdqIxLhHTZx4lmqRMDa0IJzSyKV0wCdTPC6Tzm3Lfywew4/jfhcO0fuZn8uHeVy/+Y8uDY6voor3Pikvms1ocRWCR6iLuCwOw7c/4snIIJQ8YRbZCMnmffPqnVTh8xS6k2zQC2iy7sEWg2FtV6rW+uxosGvuzM15F/Jb86LmM75unACUXT3zq18ul3WQd/qplR5vC+urtUi65TVTsTY6apqcS0WNtdfAIm6MmKwgjUkWAI+R6L6kk27hZRcRZXsP11ulJOtPVrzOPA6S3PmAeaXXw3ROieh38esv3/kQNoZkcwpPOoiAoebt00YWq2d0bfovWJoFlvByBulaAegajZOBwEqWjc1Scz/HC+pYxo5sUjPTwqTvVXO48qSuVK8AMRPRD0PorOIrpEp1v8+8xm2DaJECSXcsUEPgwol5eZ6cwc4MNbV0wdGOIcaiQHVpKHT/AizlVRTIHKB13aUboeHqYBlPrGEWhkxZjQD7zI8DFJ0HSBAiUOANSErW+hRkdJKRIuJBD35SCmU4NbirCcuGmRw0weDTxl3EO2sBVSZXmGG0pS1wA6FsItquUfpzkRE1SZxPoSR5+99sxfbGBL0fqpxSXgHnQUt/2yVjk3grIYINJ5DiPElTKeIwCdhjVJCKU3EA3QkdShbaKBBXZFWyJ++JorBqx1cfRQAt3xN95RYJksCzCalT0JvQ5PaPHWFamHMTUIHEvQocvv73TQ24iMC/lkqEhzFXPeLV44U8gHAhqAe1L+i+7wHMBOBf2eizxQmUx+xCGtXpiVrIozEviJLBNqHjyGAsi4J0Mhkpw9D2L/R4u147cWWxD+gLK3ItC1xp+oQKID90Z6XiKVCGWbSxwKmlX916UWQrgqiFsso652K4r7WTBZInTEjpBvbvKt/cjPrIUSG1Rb9h3rReNaCXgv3vEM5xUt0P4LNnhRBew2WxJhjMNDJjfcfTt8R71SIStAEwzMKQ1OgAA=" alt="랜스월드 이미지"></div>`;
    document.body.appendChild(modal);

    let count=0,timer=null;
    const hit=()=>{count++;clearTimeout(timer);if(count>=3){count=0;modal.classList.add('show');return}timer=setTimeout(()=>count=0,2500)};
    version.addEventListener('click',hit);
    version.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hit()}});
    document.getElementById('versionEggClose')?.addEventListener('click',()=>modal.classList.remove('show'));
    modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('show')});
  },50);
  setTimeout(()=>clearInterval(wait),15000);
})();
