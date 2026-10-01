const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
window.addEventListener("load",()=>setTimeout(()=>$("#loader").remove(),1900));

/* Starfield */
const canvas=$("#space"),ctx=canvas.getContext("2d");let W,H,stars=[];
function resize(){W=canvas.width=innerWidth*devicePixelRatio;H=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";stars=Array.from({length:Math.min(260,Math.floor(innerWidth/5))},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.4+.25)*devicePixelRatio,v:(Math.random()*.28+.04)*devicePixelRatio,a:Math.random()*6.28}))}
resize();addEventListener("resize",resize);
(function loop(){ctx.clearRect(0,0,W,H);for(const s of stars){s.y-=s.v;s.a+=.008;if(s.y<0)s.y=H;ctx.globalAlpha=.25+Math.abs(Math.sin(s.a))*.6;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(loop)})();

/* Mouse glow */
addEventListener("pointermove",e=>{const g=$(".pointer-glow");g.style.left=e.clientX+"px";g.style.top=e.clientY+"px"});

/* Scroll progress + subtle parallax */
addEventListener("scroll",()=>{const max=document.documentElement.scrollHeight-innerHeight;$("#scrollProgress").style.width=(scrollY/max*100)+"%";document.querySelector(".hero-content").style.transform=`translateY(${Math.min(scrollY*.12,80)}px)`},{passive:true});

/* Smooth links */
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.go).scrollIntoView({behavior:"smooth"})));

/* Reveal */
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.12});
$$(".reveal").forEach(x=>observer.observe(x));

/* Photo lightbox */
const photoSrc=["assets/photos/namira-huzefa-01.png","assets/photos/namira-huzefa-02.png"];
const titles=["The moment","Still us"];
$$(".memory-card").forEach(card=>card.addEventListener("click",()=>{const i=+card.dataset.photo;$("#modalPhoto").src=photoSrc[i];$("#modalTitle").textContent=titles[i];$("#photoModal").classList.add("open")}));
$("#photoClose").onclick=()=>$("#photoModal").classList.remove("open");
$("#photoModal").addEventListener("click",e=>{if(e.target.id==="photoModal")e.currentTarget.classList.remove("open")});

/* Star messages */
$$(".orbit-star").forEach(s=>s.addEventListener("click",()=>{$("#messageText").textContent=s.dataset.message;$("#messageModal").classList.add("open")}));
$("#messageClose").onclick=()=>$("#messageModal").classList.remove("open");
$("#messageModal").addEventListener("click",e=>{if(e.target.id==="messageModal")e.currentTarget.classList.remove("open")});

/* Reliable hold interaction: Pointer Events work for mouse + touch */
const hb=$("#heartButton"),ring=$("#ringProgress"),label=$("#holdLabel"),unlock=$("#unlock");
const CIRC=2*Math.PI*96; ring.style.strokeDasharray=CIRC; ring.style.strokeDashoffset=CIRC;
let holding=false,start=0,raf=0,done=false;
function holdFrame(t){
  if(!holding)return;
  const value=Math.min(1,(t-start)/2800);
  ring.style.strokeDashoffset=CIRC*(1-value);
  hb.style.transform=`scale(${1+value*.09})`;
  if(value>=1){finishHold();return}
  raf=requestAnimationFrame(holdFrame)
}
function beginHold(e){e.preventDefault();if(done)return;holding=true;start=performance.now();label.textContent="KEEP HOLDING ♥";cancelAnimationFrame(raf);raf=requestAnimationFrame(holdFrame);try{hb.setPointerCapture(e.pointerId)}catch{}}
function endHold(){if(!holding)return;holding=false;cancelAnimationFrame(raf);const current=1-(parseFloat(getComputedStyle(ring).strokeDashoffset)/CIRC);if(current<1){ring.style.strokeDashoffset=CIRC;hb.style.transform="scale(1)";label.textContent="PRESS & HOLD"}}
function finishHold(){holding=false;done=true;cancelAnimationFrame(raf);ring.style.strokeDashoffset=0;hb.style.transform="scale(1.12)";label.textContent="UNLOCKED ♥";unlock.classList.add("show");heartRain(65);toast("You unlocked the heartbeat ♥")}
hb.addEventListener("pointerdown",beginHold);hb.addEventListener("pointerup",endHold);hb.addEventListener("pointercancel",endHold);hb.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")endHold()});

/* Secret */
$("#secretBtn").onclick=()=>{$("#secretContent").classList.add("show");heartRain(45);toast("Secret unlocked ♥")};

/* Heart rain */
function heartRain(n=35){for(let i=0;i<n;i++){const x=document.createElement("div");x.textContent=Math.random()>.15?"♥":"✦";x.style.position="fixed";x.style.zIndex=160;x.style.left=Math.random()*100+"vw";x.style.top="-30px";x.style.pointerEvents="none";x.style.color=Math.random()>.5?"#ff5ca8":"#aa83ff";x.style.fontSize=12+Math.random()*25+"px";x.style.transition=`transform ${2+Math.random()*2}s cubic-bezier(.2,.7,.2,1),opacity 2.8s`;document.body.appendChild(x);requestAnimationFrame(()=>{x.style.transform=`translateY(${innerHeight+100}px) rotate(${Math.random()*700-350}deg)`;x.style.opacity="0"});setTimeout(()=>x.remove(),4500)}}

/* Toast */
let toastTimer;function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show-toast");clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove("show-toast"),2400)}

/* Generated ambient tone; no external audio required */
let audio=null,osc=null,gain=null,playing=false;
$("#sound").onclick=()=>{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();osc=audio.createOscillator();gain=audio.createGain();osc.type="sine";osc.frequency.value=196;gain.gain.value=.0001;osc.connect(gain).connect(audio.destination);osc.start()}
if(!playing){audio.resume();gain.gain.exponentialRampToValueAtTime(.025,audio.currentTime+.8);playing=true;$("#sound").textContent="Ⅱ";toast("Ambient mode ON ♫")}else{gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.5);playing=false;$("#sound").textContent="♫";toast("Ambient mode OFF")}};

/* Secret keyboard */
let keys="";addEventListener("keydown",e=>{keys=(keys+e.key.toLowerCase()).slice(-6);if(keys==="namira"){heartRain(55);toast("Secret code accepted — Namira ♥")}});
