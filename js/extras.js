/* extras.js — loads AFTER script.js. Self-contained; delete its <script> tag to undo. */
(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var low=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory&&navigator.deviceMemory<=3)||innerWidth<=420;
if(low)document.documentElement.classList.add('lowend');

function once(el,fn,th){
  if(!el)return;
  if(!('IntersectionObserver' in window)){fn();return}
  var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();fn()}},{threshold:th||.5});io.observe(el);
}

/* --- spotlight sweep across the hero portrait --- */
var beam=$('beam');
if(beam){
  var fr=beam.parentNode,st={x:12,y:40,r:12,touched:false,done:false},idle;
  var paint=function(){beam.style.setProperty('--bx',st.x.toFixed(1)+'%');beam.style.setProperty('--by',st.y.toFixed(1)+'%');beam.style.setProperty('--br',st.r.toFixed(1)+'%')};
  var finish=function(){if(!st.done){st.done=true;beam.classList.add('done')}};
  var aim=function(e){var b=fr.getBoundingClientRect();st.touched=true;st.r=22;
    st.x=Math.max(0,Math.min(100,(e.clientX-b.left)/b.width*100));st.y=Math.max(0,Math.min(100,(e.clientY-b.top)/b.height*100));
    paint();clearTimeout(idle);idle=setTimeout(finish,2200)};
  fr.addEventListener('pointermove',aim);fr.addEventListener('pointerdown',aim);
  once(fr,function(){
    if(reduced){finish();return}
    var t0=null,dur=3200;
    (function step(t){
      if(st.done)return;if(t0===null)t0=t;
      var p=Math.min(1,(t-t0)/dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      if(!st.touched){st.x=12+76*e;st.y=42+16*Math.sin(p*Math.PI*2);st.r=12+9*e;paint()}
      if(p<1)requestAnimationFrame(step);else if(!st.touched)setTimeout(finish,800);
    })(performance.now());
  },.45);
}

/* --- 2005 to 2026 counter --- */
var yr=$('yr'),yn=$('yrN');
once(yr,function(){
  if(reduced){yn.textContent='2026';yr.classList.add('go','done');return}
  yr.classList.add('go');var t0=null,dur=2600;
  requestAnimationFrame(function s(t){
    if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    yn.textContent=Math.round(2005+21*e);
    if(p<1)requestAnimationFrame(s);else yr.classList.add('done');
  });
},.3);

/* --- gentle haptics on phones that support them (Android Chrome) --- */
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
var pad=$('lkPad');if(pad)pad.addEventListener('click',function(e){if(e.target.closest('button'))buzz(8)});
var msg=$('lkMsg');
if(msg&&'MutationObserver' in window)new MutationObserver(function(){if(/not quite/i.test(msg.textContent))buzz([70,50,70])}).observe(msg,{childList:true,characterData:true,subtree:true});
var intro=$('intro');
if(intro&&'MutationObserver' in window){var mo=new MutationObserver(function(){if(intro.getAttribute('aria-hidden')==='false'){buzz([30,60,30,60,140]);mo.disconnect()}});mo.observe(intro,{attributes:true,attributeFilter:['aria-hidden']})}
var ob=$('openBtn');if(ob)ob.addEventListener('click',function(){buzz(40)});
})();
