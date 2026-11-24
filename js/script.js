(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var lock=$('lock'),intro=$('intro'),main=$('main'),hero=$('hero'),player=$('player'),song=$('song'),pb=$('playBtn'),msg=$('playMsg');
var started=false,audioOK=true;
var weak=(navigator.hardwareConcurrency||4)<=4||innerWidth<700;

/* ---------- text splitting ---------- */
function splitWords(el){
  var t=el.textContent.trim();el.setAttribute('aria-label',t);el.textContent='';
  if(el.dataset.base)el.style.setProperty('--base',el.dataset.base+'s');
  t.split(/\s+/).forEach(function(w,i){
    var o=document.createElement('span');o.className='w';o.setAttribute('aria-hidden','true');
    var s=document.createElement('span');s.textContent=w;s.style.setProperty('--i',i);
    o.appendChild(s);el.appendChild(o);el.appendChild(document.createTextNode(' '));
  });
}
$$('[data-split]').forEach(splitWords);
(function(){var n=0;$$('#wHead .wd').forEach(function(w){var t=w.textContent;w.textContent='';
  t.split('').forEach(function(c){var s=document.createElement('span');s.className='ch';s.setAttribute('aria-hidden','true');s.style.setProperty('--i',n++);s.textContent=c;w.appendChild(s)});
  w.setAttribute('aria-hidden','true')});
  $('wHead').setAttribute('aria-label','Happy 21st Birthday, Ambrose!');})();
intro.addEventListener('pointerdown',function(e){if(e.target.id!=='openBtn')intro.classList.add('all')});

/* ---------- canvases: ambient dust + celebration fx ---------- */
var cv=$('dust'),cx=cv.getContext('2d'),fxc=$('fx'),fc=fxc.getContext('2d'),W=0,H=0,dpr=1,P=[],inten=1,tInten=1,last=0;
function sizeCv(){dpr=Math.min(window.devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;
  [cv,fxc].forEach(function(c){c.width=W*dpr;c.height=H*dpr});cx.setTransform(dpr,0,0,dpr,0,0);fc.setTransform(dpr,0,0,dpr,0,0)}
function mk(init){return{x:Math.random()*W,y:init?Math.random()*H:H+10,r:.6+Math.random()*1.5,vy:-(.1+Math.random()*.3),vx:(Math.random()-.5)*.15,a:.25+Math.random()*.6,p:Math.random()*6.28}}
function frame(t){
  requestAnimationFrame(frame);
  if(document.hidden||t-last<(weak?40:16))return;last=t;
  inten+=(tInten-inten)*.03;
  cx.clearRect(0,0,W,H);
  var n=Math.floor(P.length*Math.min(1,inten));
  for(var i=0;i<n;i++){var p=P[i];p.x+=p.vx+Math.sin(t/2500+p.p)*.12;p.y+=p.vy;
    if(p.y<-10){P[i]=p=mk(false)}
    var a=p.a*(.6+.4*Math.sin(t/700+p.p))*Math.min(1,inten);
    cx.fillStyle='rgba(222,188,115,'+a.toFixed(3)+')';cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill();}
}
if(!reduced){sizeCv();var N=weak?26:60;for(var k=0;k<N;k++)P.push(mk(true));requestAnimationFrame(frame);
  window.addEventListener('resize',sizeCv);}

/* fx engine: runs only while particles exist */
var FP=[],fRun=false,fLast=0,MAX=weak?220:420;
var GOLD=['#e8d3a0','#cdaa62','#fff3d0','#f3ecdc','#b98f4a','#f0d58a'],ACC=['#e9a6a0','#9fb8e0'];
function col(){return Math.random()<.08?ACC[(Math.random()*ACC.length)|0]:GOLD[(Math.random()*GOLD.length)|0]}
function kick(){if(!fRun){fRun=true;fLast=performance.now();requestAnimationFrame(fstep)}}
function room(n){return Math.min(n,Math.max(0,MAX-FP.length))}
function burst(x,y,n,pw){
  if(reduced)return;n=room(weak?Math.round(n*.6):n);var c1=col();
  for(var i=0;i<n;i++){var a=Math.random()*6.283,s=(.6+Math.random())*(pw||4.5);
    FP.push({t:0,x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:0,m:55+Math.random()*45,c:Math.random()<.7?c1:col(),r:1+Math.random()*1.4})}
  kick();
}
function confetti(x,y,n,ang,spread,pw){
  if(reduced)return;n=room(weak?Math.round(n*.55):n);
  for(var i=0;i<n;i++){var a=ang+(Math.random()-.5)*spread,s=(.5+Math.random())*pw;
    FP.push({t:1,x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:0,m:150+Math.random()*90,c:col(),w:4+Math.random()*5,h:2+Math.random()*4,rot:Math.random()*6.28,vr:(Math.random()-.5)*.3,ph:Math.random()*6.28})}
  kick();
}
function rocket(tx,ty,n){
  if(reduced)return;var sx=tx+(Math.random()-.5)*120;
  FP.push({t:2,x:sx,y:H+10,tx:tx,ty:ty,vx:(tx-sx)/50,vy:(ty-H)/50,l:0,n:n||70,c:'#fff3d0'});kick();
}
function rain(ms){var end=performance.now()+ms;(function go(){if(performance.now()>end||document.hidden&&0)return;
  confetti(Math.random()*W,-10,5,1.57,1.2,1.6);setTimeout(go,170)})()}
function fstep(now){
  var dt=Math.min(2.5,(now-fLast)/16.67);fLast=now;
  fc.globalCompositeOperation='destination-out';fc.fillStyle='rgba(0,0,0,.2)';fc.fillRect(0,0,W,H);fc.globalCompositeOperation='source-over';
  for(var i=FP.length-1;i>=0;i--){var p=FP[i];p.l+=dt;
    if(p.t===2){p.x+=p.vx*dt;p.y+=p.vy*dt;fc.fillStyle=p.c;fc.fillRect(p.x-1,p.y-1,2,2);
      if(p.l>=50||p.y<=p.ty){FP.splice(i,1);burst(p.x,p.y,p.n,5.2);}continue}
    if(p.l>p.m){FP.splice(i,1);continue}
    var f=1-p.l/p.m;
    if(p.t===0){p.vx*=.97;p.vy=p.vy*.97+.045*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      fc.globalAlpha=f;fc.fillStyle=p.c;fc.beginPath();fc.arc(p.x,p.y,p.r*(.5+f),0,6.283);fc.fill();}
    else{p.vx*=.985;p.vy=Math.min(p.vy+.05*dt,2.2);p.x+=(p.vx+Math.sin(p.l*.08+p.ph)*.6)*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
      if(p.y>H+20){FP.splice(i,1);continue}
      fc.globalAlpha=Math.min(1,f*2.2);fc.save();fc.translate(p.x,p.y);fc.rotate(p.rot);fc.scale(1,Math.cos(p.l*.15+p.ph));fc.fillStyle=p.c;fc.fillRect(-p.w/2,-p.h/2,p.w,p.h);fc.restore();}
  }
  fc.globalAlpha=1;
  if(FP.length&&!document.hidden){requestAnimationFrame(fstep)}else if(FP.length){setTimeout(function(){fLast=performance.now();requestAnimationFrame(fstep)},500)}else{fc.clearRect(0,0,W,H);fRun=false}
}
function center(el){var r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}
function finale(n){ // choreographed fireworks
  if(reduced)return;n=n||5;
  for(var i=0;i<n;i++)(function(i){setTimeout(function(){rocket(W*(.15+Math.random()*.7),H*(.18+Math.random()*.32),weak?45:75)},i*420)})(i);
  confetti(0,H*.8,40,-1.05,.6,9);confetti(W,H*.8,40,-2.09,.6,9);
}

/* ---------- audio ---------- */
var qt;function flash(keep){msg.classList.remove('quiet');clearTimeout(qt);if(!keep)qt=setTimeout(function(){msg.classList.add('quiet')},3500)}
function setPlaying(on){flash();player.classList.toggle('playing',on);pb.setAttribute('aria-pressed',on);pb.setAttribute('aria-label',on?'Pause music':'Play music');msg.textContent=on?'Now playing':'Paused'}
function fadeIn(){if(reduced){song.volume=.8;return}song.volume=0;var v=0,iv=setInterval(function(){v=Math.min(.8,v+.04);song.volume=v;if(v>=.8)clearInterval(iv)},120)}
song.addEventListener('error',function(){audioOK=false;player.classList.remove('playing');msg.textContent='Audio unavailable';flash(true)});
song.addEventListener('play',function(){setPlaying(true)});
song.addEventListener('pause',function(){setPlaying(false)});
pb.addEventListener('click',function(){
  if(!audioOK){msg.textContent='Audio unavailable';flash(true);return}
  if(song.paused){song.volume=.8;var pr=song.play();if(pr&&pr.catch)pr.catch(function(){msg.textContent='Tap again to play';flash(true)})}else{song.pause()}
});
function startAudio(){
  if(started)return;started=true;fadeIn();
  var pr=song.play();if(pr&&pr.catch)pr.catch(function(){if(audioOK){setPlaying(false);msg.textContent='Tap to play music';flash(true)}});
}

/* ---------- STAGE 1: lock screen ---------- */
var CODE='2005',code='',busy=false,unlocked=false,bad=0;
var panel=$('lkPanel'),digs=$$('.dg',$('lkDigits')),lmsg=$('lkMsg');
function render(){digs.forEach(function(d,i){d.textContent=code.charAt(i);d.classList.toggle('on',i<code.length);d.classList.toggle('cur2',i===code.length)});
  if(!lmsg.classList.contains('bad'))lmsg.textContent=code.length?code.length+' of 4':''}
function say(t,b){lmsg.textContent=t;lmsg.classList.toggle('bad',!!b)}
function press(d){if(busy||unlocked||code.length>=4)return;lmsg.classList.remove('bad');code+=d;render();
  if(code.length===4){busy=true;setTimeout(submit,260)}}
function back(){if(busy||unlocked)return;lmsg.classList.remove('bad');code=code.slice(0,-1);render()}
function clear(){if(busy||unlocked)return;lmsg.classList.remove('bad');code='';render()}
function submit(){
  if(unlocked)return;
  if(code.length<4){busy=false;say('Please enter all four digits.',true);return}
  busy=true;
  if(code===CODE)return unlock();
  bad++;say(bad%2?'Not quite! Give it another try.':'Hmm, that is not it. Try once more!',true);
  panel.classList.remove('shake');void panel.offsetWidth;panel.classList.add('shake','warn');
  setTimeout(function(){panel.classList.remove('shake','warn');code='';render();lmsg.textContent='Not quite! Give it another try.';lmsg.classList.add('bad');busy=false},reduced?300:750);
}
$('lkPad').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var k=b.getAttribute('data-k');
  if(k==='back')back();else if(k==='clear')clear();else press(k)});
$('lkGo').addEventListener('click',function(){if(!busy&&!unlocked){busy=true;submit()}});
document.addEventListener('keydown',function(e){
  if(unlocked||e.ctrlKey||e.metaKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){e.preventDefault();press(e.key)}
  else if(e.key==='Backspace'){e.preventDefault();back()}
  else if(e.key==='Delete'||e.key==='Escape'){e.preventDefault();clear()}
  else if(e.key==='Enter'&&!(document.activeElement&&document.activeElement.tagName==='BUTTON')){e.preventDefault();if(!busy){busy=true;submit()}}
});
render();

function unlock(){
  unlocked=true;startAudio();
  say('Unlocked.',false);
  var t=reduced?[0,0,0,0,0]:[0,700,1000,1700,2250];
  digs.forEach(function(d,i){setTimeout(function(){d.classList.add('lit')},t[0]+i*160)});
  setTimeout(function(){lock.classList.add('lk-open')},t[1]);
  setTimeout(function(){
    var c=center($('lkEmblem'));lock.style.setProperty('--by',c.y+'px');$('lkBloom').style.top=c.y+'px';lock.classList.add('bloom');
    burst(c.x,c.y,70,6);setTimeout(function(){burst(c.x,c.y,40,3.2)},260);
  },t[2]);
  setTimeout(function(){lock.classList.add('out')},t[3]);
  setTimeout(function(){
    lock.classList.add('gone');player.hidden=false;
    intro.removeAttribute('aria-hidden');intro.classList.add('show');intro.focus({preventScroll:true});
    tInten=1;
    if(!reduced){setTimeout(function(){ // Surprise 2: the controlled hero confetti burst
      confetti(W*.5,H*.28,70,-1.57,2.4,7);confetti(0,H*.75,40,-1.0,.5,10);confetti(W,H*.75,40,-2.14,.5,10);
      setTimeout(function(){rocket(W*.22,H*.28,60);rocket(W*.78,H*.3,60)},500);
    },1600)}
  },t[4]);
  setTimeout(function(){lock.style.display='none'},t[4]+1200);
}

/* ---------- STAGE 2 -> 3: begin the celebration ---------- */
$('openBtn').addEventListener('click',function(e){
  var c=center(e.currentTarget);burst(c.x,c.y,50,5);confetti(c.x,c.y,30,-1.57,2,6);
  main.hidden=false;window.scrollTo(0,0);
  tInten=.45;intro.classList.add('gone');
  document.body.classList.remove('locked');
  initReveal();initCursor();onScroll();
  setTimeout(function(){intro.style.display='none'},1900);
});

/* ---------- reveals ---------- */
var firedFinal=false;
function initReveal(){
  var els=$$('[data-split],.ph,.tl li,.pline,.final,.hero,.wish');
  if(reduced||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});hero.classList.add('live');return}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){var t=x.target;t.classList.add('in');io.unobserve(t);
    if(t===hero)hero.classList.add('live');
    if(t.tagName==='LI'){var d=t.querySelector('.dot');if(d){var c=center(d);setTimeout(function(){burst(c.x,c.y,14,2.2)},500)}}
    if(t.id==='final'&&!firedFinal){firedFinal=true;setTimeout(function(){finale(6);rain(2600)},700)}
  }})},{threshold:.2,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
}

/* ---------- scroll: progress, parallax, timeline, ambience ---------- */
var tl=document.querySelector('ol.tl'),fin=$('final'),prog=document.querySelector('.prog'),ticking=false;
function clamp(v){return Math.max(0,Math.min(1,v))}
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(function(){ticking=false;
    var y=window.pageYOffset,vh=window.innerHeight,max=document.documentElement.scrollHeight-vh;
    prog.style.transform='scaleX('+(max>0?clamp(y/max):0)+')';
    if(!reduced&&y<vh*1.4){hero.style.setProperty('--py',(y*.08).toFixed(1)+'px');hero.style.setProperty('--py2',(y*-.12).toFixed(1)+'px')}
    var r=tl.getBoundingClientRect();tl.style.setProperty('--p',clamp((vh*.65-r.top)/r.height).toFixed(3));
    var f=fin.getBoundingClientRect();
    tInten=f.top<vh*.6?1.3:.45;
  });
}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);

/* ---------- cursor + tilt (fine pointers only) ---------- */
var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function initCursor(){
  if(reduced||!fine)return;
  var c=document.querySelector('.cur'),x=0,y=0,cx2=0,cy2=0,run=false;
  document.addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;c.classList.add('on');
    c.classList.toggle('big',!!e.target.closest('a,button'));if(!run){run=true;loop()}});
  document.addEventListener('mouseleave',function(){c.classList.remove('on')});
  function loop(){cx2+=(x-cx2)*.18;cy2+=(y-cy2)*.18;c.style.transform='translate('+cx2.toFixed(1)+'px,'+cy2.toFixed(1)+'px)';requestAnimationFrame(loop)}
}
if(!reduced&&fine){
  var wf=$('wFrame');
  intro.addEventListener('mousemove',function(e){wf.style.setProperty('--ry',((e.clientX/innerWidth-.5)*10).toFixed(1)+'deg');wf.style.setProperty('--rx',(-(e.clientY/innerHeight-.5)*8).toFixed(1)+'deg')});
  $$('.ph').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--tx',(((e.clientX-r.left)/r.width-.5)*8).toFixed(1)+'deg');b.style.setProperty('--ty',(-((e.clientY-r.top)/r.height-.5)*8).toFixed(1)+'deg')});
    b.addEventListener('mouseleave',function(){b.style.setProperty('--tx','0deg');b.style.setProperty('--ty','0deg')});
  });
}

/* ---------- 21 sparks ---------- */
var sparkBox=$('sparks'),sCount=$('sparkCount'),sparks=[],lit=0,sDone=false;
for(var s=1;s<=21;s++){(function(n){var b=document.createElement('button');b.type='button';b.className='sp';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Light spark '+n+' of 21');
  b.innerHTML='<span class="st" aria-hidden="true"></span>';sparkBox.appendChild(b);sparks.push(b);
  b.addEventListener('click',function(){light(b,true)})})(s)}
function light(b,fx){
  if(b.getAttribute('aria-pressed')==='true')return;
  b.classList.add('lit');b.setAttribute('aria-pressed','true');lit++;
  if(fx){var c=center(b);burst(c.x,c.y,12,2.4)}
  sCount.textContent=lit+' of 21 lit';
  if(lit===21&&!sDone){sDone=true;sCount.classList.add('done');sCount.textContent='All 21 lit. Make your wish.';finale(4)}
}
$('lightAll').addEventListener('click',function(){
  sparks.forEach(function(b,i){setTimeout(function(){light(b,i%4===0)},reduced?0:i*55)});
});
$('fwBtn').addEventListener('click',function(){finale(4)});
$('fwAgain').addEventListener('click',function(){finale(5);rain(1800)});
$('replay').addEventListener('click',function(){location.reload()});

/* ---------- wishes ---------- */
$$('.wish').forEach(function(w){w.addEventListener('click',function(){
  var open=w.getAttribute('aria-expanded')==='true';w.setAttribute('aria-expanded',!open);
  if(!open){var c=center(w);burst(c.x,c.y,26,3.6)}
})});

/* ---------- letter ---------- */
var env=$('envBtn'),box=$('letterBox'),hint=$('envHint'),paper=$('paper'),stage=document.querySelector('.env-stage'),timer;
function openLetter(){
  env.classList.add('open');stage.classList.add('open');env.setAttribute('aria-expanded','true');hint.textContent='';
  var c=center(env);burst(c.x,c.y,40,4);
  timer=setTimeout(function(){box.classList.add('open');confetti(c.x,c.y,26,-1.57,1.6,5);
    setTimeout(function(){paper.focus({preventScroll:true});paper.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'})},reduced?0:700)},reduced?0:1300);
}
function closeLetter(){
  clearTimeout(timer);box.classList.remove('open');stage.classList.remove('open');
  setTimeout(function(){env.classList.remove('open');env.setAttribute('aria-expanded','false');hint.textContent='Break the seal to open';env.focus({preventScroll:true});env.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'})},reduced?0:900);
}
env.addEventListener('click',function(){if(!env.classList.contains('open'))openLetter()});
$('closeLetter').addEventListener('click',closeLetter);

/* ---------- lightbox ---------- */
var lb=$('lb'),lbImg=$('lbImg'),lbCap=$('lbCap'),items=$$('.ph'),cur=0,tx=0,roman=['I','II','III','IV'];
function show(i,instant){
  cur=(i+items.length)%items.length;var im=items[cur].querySelector('img');
  function set(){lbImg.src=im.getAttribute('src');lbImg.alt=im.alt;lbCap.textContent='Plate '+roman[cur]+' of IV';lbImg.classList.remove('sw')}
  if(instant||reduced){set();return}
  lbImg.classList.add('sw');setTimeout(set,300);
}
items.forEach(function(b,i){b.addEventListener('click',function(){show(i,true);lb.showModal()})});
$('lbClose').addEventListener('click',function(){lb.close()});
$('lbPrev').addEventListener('click',function(){show(cur-1)});
$('lbNext').addEventListener('click',function(){show(cur+1)});
lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
lb.addEventListener('touchstart',function(e){tx=e.changedTouches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>60)show(cur+(d<0?1:-1))},{passive:true});
})();
