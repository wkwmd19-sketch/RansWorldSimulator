/* RWS v10.35: installed immediately after app-base and before legacy feature patches. */
(function(){
  "use strict";
  const expected="v10.35";
  function update(){
    const badge=document.querySelector(".header-meta .version");
    if(badge&&badge.textContent.trim()!==expected){badge.textContent=expected;badge.title="업데이트 내역";}
  }
  function watch(){
    const header=document.querySelector(".header-meta");if(!header){setTimeout(watch,40);return;}
    new MutationObserver(update).observe(header,{subtree:true,childList:true,characterData:true});
    update();
  }
  watch();
})();
