/* Unio Base Organizada v8 */
/* ━━━━ TASKS ━━━━ */
function taskDateObjFromKey(k){return keyToDate(k);}
function taskDayLabel(k){
  const d=taskDateObjFromKey(k);
  const today=dayKey(new Date());
  const tomorrow=dayKey(addDays(new Date(),1));
  if(k===today)return 'Hoje';
  if(k===tomorrow)return 'Amanhã';
  return `${DL[d.getDay()]}, ${d.getDate()} de ${MS[d.getMonth()]}`;
}
function syncTaskNoDateButton(){
  const btn=$('tNodateBtn');
  if(!btn)return;
  btn.classList.toggle('on',!!S.tNoDate);
  $('tNodateIco').textContent=S.tNoDate?'📌':'📅';
  $('tNodateTxt').textContent=S.tNoDate?'Sem data (tarefa fixa)':'Vinculada ao dia selecionado';
}
function selectTaskDay(mode){
  const d=new Date();
  if(mode==='tomorrow')d.setDate(d.getDate()+1);
  S.selDay=dayKey(d);
  S.taskWeekAnchor=S.selDay;
  renderWeekStrip();
  renderTasks();
  haptic('light');
}
function shiftTaskWeek(delta){
  const anchor=keyToDate(S.taskWeekAnchor||S.selDay||dayKey(new Date()));
  S.taskWeekAnchor=dayKey(addDays(anchor,delta*7));
  renderWeekStrip();
  renderTasks();
  haptic('light');
}
function toggleNoDate(btn){
  S.tNoDate=!S.tNoDate;
  syncTaskNoDateButton();
  haptic('light');
}
function renderWeekStrip(){
  syncTaskNoDateButton();
  const strip=$('weekStrip');
  if(!strip)return;
  const todayK=dayKey(new Date());
  if(!S.taskWeekAnchor)S.taskWeekAnchor=S.selDay||todayK;
  const days=weekRangeFromAnchor(S.taskWeekAnchor);
  const weekKeysArr=days.map(dayKey);
  if(S.selDay && !weekKeysArr.includes(S.selDay)){
    const selected=keyToDate(S.selDay);
    const anchor=keyToDate(S.taskWeekAnchor);
    const diff=Math.abs(selected-anchor)/(1000*60*60*24);
    if(diff>7 && !weekKeysArr.includes(todayK)){
      // mantém a semana navegada, sem forçar retorno automático
    }
  }
  const title=$('taskWeekTitle');
  const sub=$('taskWeekSub');
  if(title)title.textContent=weekRangeLabel(S.taskWeekAnchor);
  if(sub){
    const undated=S.tasks.filter(t=>t.date===null).length;
    sub.textContent=undated?`${undated} tarefa${undated>1?'s':''} sem data`:'Toque em um dia para ver as tarefas';
  }
  strip.innerHTML='';
  days.forEach(d=>{
    const k=dayKey(d),isT=k===todayK,isSel=k===S.selDay;
    const openCount=S.tasks.filter(t=>t.date===k&&!t.done).length;
    const doneCount=S.tasks.filter(t=>t.date===k&&t.done).length;
    const div=document.createElement('div');
    div.className='week-day'+(isT?' today':'')+(isSel?' sel':'');
    div.innerHTML=`<div class="wd-nm">${DS[d.getDay()]}</div><div class="wd-n">${d.getDate()}</div><div class="wd-dot${openCount?' on':''}${doneCount&&!openCount?' done':''}"></div>`;
    div.onclick=()=>{S.selDay=k;S.taskWeekAnchor=k;renderWeekStrip();renderTasks();saveState?.();};
    strip.appendChild(div);
  });
}
function addTask(){
  const inp=$('tInput'),v=inp.value.trim();
  if(!v)return;
  S.tasks.unshift({id:++tId,txt:v,done:false,date:S.tNoDate?null:S.selDay,createdAt:Date.now()});
  inp.value='';
  renderTasks();
  renderWeekStrip();
  renderHome?.();
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
  renderWeekStrip();
  renderHome?.();
}
function delTask(id){
  S.tasks=S.tasks.filter(x=>x.id!==id);
  renderTasks();
  renderWeekStrip();
  renderHome?.();
}
function clearDoneTasks(){
  const before=S.tasks.length;
  S.tasks=S.tasks.filter(t=>!t.done);
  const removed=before-S.tasks.length;
  renderTasks();
  renderWeekStrip();
  renderHome?.();
  saveState?.();
  showToast(removed?`${removed} concluída${removed>1?'s':''} removida${removed>1?'s':''}`:'Nenhuma concluída para limpar','',2000);
}
function moveTaskToDay(id,k){
  const t=S.tasks.find(x=>x.id===id);
  if(!t)return;
  t.date=k;
  t.done=false;
  S.selDay=k;
  S.taskWeekAnchor=k;
  renderTasks();
  renderWeekStrip();
  renderHome?.();
  saveState?.();
}
function renderTasks(){
  const day=S.tasks.filter(t=>t.date===S.selDay);
  const pinned=S.tasks.filter(t=>t.date===null);
  const pend=day.filter(t=>!t.done),done=day.filter(t=>t.done);
  const dayCard=$('taskDayCard');
  if(dayCard){
    const pinInfo=pinned.length?` · ${pinned.length} sem data`:'';
    dayCard.innerHTML=`<div><strong>${unioEscape(taskDayLabel(S.selDay))}</strong><span>${pend.length} pendente${pend.length!==1?'s':''} · ${done.length} concluída${done.length!==1?'s':''}${pinInfo}</span></div>`;
  }
  $('tEmpty').style.display=(day.length+pinned.length)?'none':'block';
  $('tPinnedSec').style.display=pinned.length?'block':'none';
  $('tPendSec').style.display=pend.length?'block':'none';
  $('tDoneSec').style.display=done.length?'block':'none';
  $('tPendLbl').textContent=`Pendentes (${pend.length})`;
  ['tPinned','tPend','tDone'].forEach(id=>$(id).innerHTML='');
  pinned.forEach(t=>$('tPinned').appendChild(mkTask(t,true)));
  pend.forEach(t=>$('tPend').appendChild(mkTask(t,false)));
  done.forEach(t=>$('tDone').appendChild(mkTask(t,false)));
}
function mkTask(t,pin){
  const d=document.createElement('div');
  d.className='task-item'+(t.done?' done':'')+(pin?' pinned':'');
  const today=dayKey(new Date());
  const tomorrowK=dayKey(addDays(new Date(),1));
  const pinActions=pin?`<div class="task-mini-actions"><button onclick="moveTaskToDay(${t.id},'${today}')">Hoje</button><button onclick="moveTaskToDay(${t.id},'${tomorrowK}')">Amanhã</button></div>`:'';
  d.innerHTML=`
    <div class="t-cb" onclick="toggleTask(${t.id})"><span class="t-ck">✓</span></div>
    <div class="task-main"><span class="t-txt">${unioEscape(t.txt)}</span>${pinActions}</div>
    <button class="t-del" onclick="delTask(${t.id})">×</button>`;
  return d;
}
