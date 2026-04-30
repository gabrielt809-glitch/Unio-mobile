/* Unio Base Organizada v3 */
/* ━━━━ TASKS ━━━━ */
function taskDateObjFromKey(k){
  const [y,m,d]=String(k).split('-').map(Number);
  return new Date(y,m,d);
}
function taskDayLabel(k){
  const d=taskDateObjFromKey(k);
  const today=dayKey(new Date());
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  if(k===today)return 'Hoje';
  if(k===dayKey(tomorrow))return 'Amanhã';
  return `${DL[d.getDay()]}, ${d.getDate()} de ${MS[d.getMonth()]}`;
}
function selectTaskDay(mode){
  const d=new Date();
  if(mode==='tomorrow')d.setDate(d.getDate()+1);
  S.selDay=dayKey(d);
  renderWeekStrip();
  renderTasks();
  haptic('light');
}
function toggleNoDate(btn){
  S.tNoDate=!S.tNoDate;
  btn.classList.toggle('on',S.tNoDate);
  document.getElementById('tNodateIco').textContent=S.tNoDate?'📌':'📅';
  document.getElementById('tNodateTxt').textContent=S.tNoDate?'Sem data (tarefa fixa)':'Vinculada ao dia selecionado';
}
function renderWeekStrip(){
  const strip=document.getElementById('weekStrip');
  strip.innerHTML='';
  const today=new Date(),sun=new Date(today);
  sun.setDate(today.getDate()-today.getDay());
  for(let i=0;i<7;i++){
    const d=new Date(sun);d.setDate(sun.getDate()+i);
    const k=dayKey(d),isT=k===dayKey(today),isSel=k===S.selDay;
    const has=S.tasks.some(t=>t.date===k&&!t.done);
    const div=document.createElement('div');
    div.className='week-day'+(isT?' today':'')+(isSel?' sel':'');
    div.innerHTML=`<div class="wd-nm">${DS[d.getDay()]}</div><div class="wd-n">${d.getDate()}</div><div class="wd-dot${has?' on':''}"></div>`;
    div.onclick=()=>{S.selDay=k;renderWeekStrip();renderTasks();};
    strip.appendChild(div);
  }
}
function addTask(){
  const inp=document.getElementById('tInput'),v=inp.value.trim();
  if(!v)return;
  S.tasks.unshift({id:++tId,txt:v,done:false,date:S.tNoDate?null:S.selDay,createdAt:Date.now()});
  inp.value='';
  renderTasks();
  renderWeekStrip();
  haptic('light');
}
function toggleTask(id){
  const t=S.tasks.find(x=>x.id===id);
  if(!t)return;
  t.done=!t.done;
  t.doneAt=t.done?Date.now():null;
  if(t.done){haptic('success');showToast('Tarefa concluída','✅');}
  else haptic('light');
  renderTasks();
}
function delTask(id){
  S.tasks=S.tasks.filter(x=>x.id!==id);
  renderTasks();
  renderWeekStrip();
}
function clearDoneTasks(){
  const before=S.tasks.length;
  S.tasks=S.tasks.filter(t=>!t.done);
  const removed=before-S.tasks.length;
  renderTasks();
  renderWeekStrip();
  saveState();
  showToast(removed?`${removed} concluída${removed>1?'s':''} removida${removed>1?'s':''}`:'Nenhuma concluída para limpar','',2000);
}
function moveTaskToDay(id,k){
  const t=S.tasks.find(x=>x.id===id);
  if(!t)return;
  t.date=k;
  t.done=false;
  renderTasks();
  renderWeekStrip();
  saveState();
}
function renderTasks(){
  const day=S.tasks.filter(t=>t.date===S.selDay);
  const pinned=S.tasks.filter(t=>t.date===null);
  const pend=day.filter(t=>!t.done),done=day.filter(t=>t.done);
  const dayCard=document.getElementById('taskDayCard');
  if(dayCard){
    dayCard.innerHTML=`<div><strong>${taskDayLabel(S.selDay)}</strong><span>${pend.length} pendente${pend.length!==1?'s':''} · ${done.length} concluída${done.length!==1?'s':''}</span></div>`;
  }
  document.getElementById('tEmpty').style.display=(day.length+pinned.length)?'none':'block';
  document.getElementById('tPinnedSec').style.display=pinned.length?'block':'none';
  document.getElementById('tPendSec').style.display=pend.length?'block':'none';
  document.getElementById('tDoneSec').style.display=done.length?'block':'none';
  document.getElementById('tPendLbl').textContent=`Pendentes (${pend.length})`;
  ['tPinned','tPend','tDone'].forEach(id=>document.getElementById(id).innerHTML='');
  pinned.forEach(t=>document.getElementById('tPinned').appendChild(mkTask(t,true)));
  pend.forEach(t=>document.getElementById('tPend').appendChild(mkTask(t,false)));
  done.forEach(t=>document.getElementById('tDone').appendChild(mkTask(t,false)));
}
function mkTask(t,pin){
  const d=document.createElement('div');
  d.className='task-item'+(t.done?' done':'')+(pin?' pinned':'');
  const today=dayKey(new Date());
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowK=dayKey(tomorrow);
  const pinActions=pin?`<div class="task-mini-actions"><button onclick="moveTaskToDay(${t.id},'${today}')">Hoje</button><button onclick="moveTaskToDay(${t.id},'${tomorrowK}')">Amanhã</button></div>`:'';
  d.innerHTML=`
    <div class="t-cb" onclick="toggleTask(${t.id})"><span class="t-ck">✓</span></div>
    <div class="task-main"><span class="t-txt">${t.txt}</span>${pinActions}</div>
    <button class="t-del" onclick="delTask(${t.id})">×</button>`;
  return d;
}
