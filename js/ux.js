/* Unio Base Organizada v2 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UX — Haptics, Toast, Badge, Swipe, Header
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function haptic(type='light'){try{if(type==='light')navigator.vibrate&&navigator.vibrate(8);else if(type==='med')navigator.vibrate&&navigator.vibrate(18);else if(type==='success')navigator.vibrate&&navigator.vibrate([10,60,14]);else if(type==='error')navigator.vibrate&&navigator.vibrate([30,40,30]);}catch(e){}}
function showToast(msg,ico='',duration=2400){const c=document.getElementById('toastContainer');const t=document.createElement('div');t.className='toast';t.textContent=(ico?ico+' ':'')+msg;c.appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),280);},duration);}
function showBadge(title,sub,ico='🏆'){const b=document.createElement('div');b.className='badge-pop';b.innerHTML=`<div class="badge-ico">${ico}</div><div class="badge-txt"><div class="badge-title">${title}</div><div class="badge-sub">${sub}</div></div>`;document.body.appendChild(b);setTimeout(()=>{b.classList.add('out');setTimeout(()=>b.remove(),280);},3200);}
function checkStreakMilestones(hab){const s=hab.streak;if(s===3)showBadge('3 dias seguidos! 🔥',hab.name,'⚡');if(s===7)showBadge('1 semana de streak!',hab.name,'🔥');if(s===14)showBadge('2 semanas seguidas!',hab.name,'💪');if(s===30)showBadge('30 dias! Incrível!',hab.name,'🏆');if(s===100)showBadge('100 dias! Lendário!',hab.name,'👑');}
function animateHeader(title,sub){const titleEl=document.getElementById('pgTitle');const subEl=document.getElementById('pgSub');titleEl.style.transition='none';titleEl.style.opacity='0';titleEl.style.transform='translateY(6px)';subEl.style.opacity='0';requestAnimationFrame(()=>{titleEl.textContent=title;subEl.textContent=sub;titleEl.style.transition='opacity .22s ease,transform .22s ease';subEl.style.transition='opacity .22s ease .06s';requestAnimationFrame(()=>{titleEl.style.opacity='1';titleEl.style.transform='translateY(0)';subEl.style.opacity='1';});});}
(function(){
  let sx=0,sy=0,swipeArmed=false,swipeBlocked=false;
  const content=document.querySelector('.content');
  if(!content)return;
  const interactive='button,input,select,textarea,a,.drop-res,.dr-item,.week-day,.task-item,.hcard,.qa-btn,.chip,.toggle,.hab-day-dot,.hab-check-btn,.breath-ring,.focus-type-btn,.focus-brk-btn,.s-qual-btn';
  function modalOpen(){return !!document.querySelector('.overlay:not(.off)')||document.getElementById('sideMenu')?.classList.contains('on');}
  content.addEventListener('touchstart',e=>{
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
    swipeArmed=false;
    swipeBlocked=modalOpen()||!!e.target.closest(interactive);
  },{passive:true});
  content.addEventListener('touchmove',e=>{
    if(swipeBlocked||swipeArmed)return;
    const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(Math.abs(dy)>42)return;
    if(Math.abs(dx)>95&&Math.abs(dx)>Math.abs(dy)*3.0)swipeArmed=true;
  },{passive:true});
  content.addEventListener('touchend',e=>{
    if(swipeBlocked||!swipeArmed)return;
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)<110||Math.abs(dy)>45||Math.abs(dx)<Math.abs(dy)*3.0)return;
    const ids=S.pinnedTabs,cur=ids.indexOf(S.curTab);
    if(dx<0&&cur<ids.length-1)switchTabById(ids[cur+1]);
    else if(dx>0&&cur>0)switchTabById(ids[cur-1]);
  });
})();
