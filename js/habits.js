/* Unio Base Organizada v4 */
/* ━━━━ HABITS ━━━━ */
function pickHabEmoji(e,el){habEmoji=e;document.querySelectorAll('.eg-btn').forEach(b=>b.classList.remove('sel'));el.classList.add('sel');}
function habPickFreq(f,el){habFreq=f;document.querySelectorAll('#habModal .chip').forEach(c=>c.classList.remove('on'));el.classList.add('on');}
function confirmHab(){
  const name=$('habNameInp').value.trim();
  if(!name)return;
  S.habits.push({id:++habId,name,emoji:habEmoji,freq:habFreq,log:[],streak:0});
  closeModal('habModal');
  renderHabits();
  renderHome?.();
}
function quickToggleHab(id){toggleHabToday(id);renderHome();}
function toggleHabToday(id){
  const h=S.habits.find(x=>x.id===id);
  if(!h)return;
  if(!Array.isArray(h.log))h.log=[];
  const today=dayKey(new Date());
  if(h.log.includes(today)){h.log=h.log.filter(d=>d!==today);haptic('light');}
  else{h.log.push(today);haptic('success');showToast(`${h.emoji} ${h.name} feito!`,'');}
  recalcStreak(h);
  checkStreakMilestones(h);
  renderHabits();
  renderHome?.();
}
function recalcStreak(h){
  if(!Array.isArray(h.log))h.log=[];
  let streak=0;
  const today=new Date();
  for(let i=0;i<365;i++){
    const d=new Date(today);d.setDate(today.getDate()-i);
    if(h.log.includes(dayKey(d)))streak++;
    else break;
  }
  h.streak=streak;
}
function rmHabit(id){S.habits=S.habits.filter(x=>x.id!==id);renderHabits();renderHome?.();}
function renderHabits(){
  const list=$('habList'),em=$('habEmpty');
  list.querySelectorAll('.hab-item').forEach(e=>e.remove());
  em.style.display=S.habits.length?'none':'block';
  const today=new Date(),todayK=dayKey(today);
  const done=S.habits.filter(h=>Array.isArray(h.log)&&h.log.includes(todayK)).length;
  $('habSummary').textContent=`${done} de ${S.habits.length} concluídos hoje`;
  const wk=weekKeys();
  S.habits.forEach(h=>{
    if(!Array.isArray(h.log))h.log=[];
    recalcStreak(h);
    const isDoneToday=h.log.includes(todayK);
    const el=document.createElement('div');
    el.className='hab-item';
    const weekDots=wk.map((k,i)=>{
      const d=keyToDate(k);
      const isDone=h.log.includes(k);
      const isT=k===todayK;
      return`<div class="hab-day-dot${isDone?' done':''}${isT?' today':''}" onclick="toggleHabDay(${h.id},'${k}')">${DS[d.getDay()][0]}</div>`;
    }).join('');
    let cells='';
    for(let i=27;i>=0;i--){
      const dd=new Date();dd.setDate(dd.getDate()-i);
      const k=dayKey(dd);
      const cellDone=h.log.includes(k);
      cells+=`<div class="hh-cell${cellDone?' l3':''}"></div>`;
    }
    el.innerHTML=`
      <div class="hab-top">
        <div class="hab-left"><div class="hab-emoji">${unioEscape(h.emoji)}</div><div><div class="hab-name">${unioEscape(h.name)}</div><div class="hab-freq">${h.freq==='diario'?'Diário':'Semanal'}</div></div></div>
        <div style="display:flex;align-items:center;gap:8px;"><div class="hab-streak"><div class="hab-streak-n">🔥${h.streak}</div><div class="hab-streak-lbl">dias</div></div><button class="hab-rm" onclick="rmHabit(${h.id})">×</button></div>
      </div>
      <div class="hab-week">${weekDots}</div>
      <button class="hab-check-btn${isDoneToday?' done':''}" onclick="toggleHabToday(${h.id})">${isDoneToday?'✓ Concluído hoje':'Marcar como feito hoje'}</button>
      <div style="margin-top:10px;"><div style="font-size:10px;color:var(--lbl3);font-weight:600;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;">Últimos 28 dias</div><div class="hab-heat">${cells}</div></div>`;
    list.appendChild(el);
  });
}
function toggleHabDay(id,k){
  const h=S.habits.find(x=>x.id===id);
  if(!h)return;
  if(!Array.isArray(h.log))h.log=[];
  h.log=h.log.includes(k)?h.log.filter(x=>x!==k):[...h.log,k];
  recalcStreak(h);
  renderHabits();
  renderHome?.();
  saveState?.();
}
