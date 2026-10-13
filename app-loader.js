(async()=>{
  const files=["app-0.txt","app-1.txt","app-2.txt"];
  const parts=await Promise.all(files.map(async f=>{const r=await fetch(f,{cache:"no-cache"});if(!r.ok)throw new Error(`${f}: ${r.status}`);return r.text();}));
  (0,eval)(parts.join(""));
})().catch(e=>{console.error(e);alert("RansWorldSimulator 로딩 중 오류가 발생했습니다: "+e.message);});
