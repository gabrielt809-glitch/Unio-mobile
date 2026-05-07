/* Unio Base Organizada v26 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HÁBITOS — módulo profissional
   - frequências avançadas
   - streak atual e melhor streak
   - calendário mensal
   - estatísticas semanais/mensais
   - edição por modal interno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

var habSelectedDays=[1,2,3,4,5];
var habWeeklyTarget=3;

function normalizeHabit(h){
  if(!h)return null;
  let frequency=h.frequency||h.freq||'daily';
  if(frequency==='diario')frequency='daily';
  if(frequency==='semanal')frequency='weeklyTarget';
  return {
    id:h.id,
    name:h.name||'Hábito',
    emoji:h.emoji||'🔥',
    frequency,
    days:Array.isArray(h.days)?h.days:[1,2,3,4,5],
    weeklyTarget:Number(h.weeklyTarget)||1,
    log:Array.isArray(h.log)?h.log:[],
    streak:Number(h.streak)||0,
    bestStreak:Number(h.bestStreak)||0,
    createdAt:h.createdAt||Date.now(),
    updatedAt:h.updatedAt||h.createdAt||Date.now(),
    archived:!!h.archived
  };
}
function normalizeHabits(){
  if(!Array.isArray(S.habits))S.habits=[];
  S.habits=S.habits.map(normalizeHabit).filter(Boolean);
}
function habitFreqLabel(h){
  const f=h.frequency||'daily';
  if(f==='daily')return 'Diário';
  if(f==='weekdays')return 'Dias úteis';
  if(f==='weekend')return 'Fim de semana';
  if(f==='specific')return `Dias específicos`;
  if(f==='weeklyTarget')return `${h.weeklyTarget||1}x por semana`;
  return 'Diário';
}
function habitDueOnDate(h,k){
  const d=keyToDate(k);
  const dow=d.getDay();
  const f=h.frequency||'daily';
  if(f==='daily')return true;
  if(f==='weekdays')return dow>=1&&dow<=5;
  if(f==='weekend')return dow===0||dow===6;
  if(f==='specific')return (h.days||[]).map(Number).includes(dow);
  if(f==='weeklyTarget')return true;
  return true;
}
function habitDoneOnDate(h,k){return Array.isArray(h.log)&&h.log.includes(k);}
function habitWeekKeys(anchor){
  return weekKeys(anchor||dayKey(new Date()));
}
function habitMonthKeys(date=new Date()){
  const y=date.getFullYear(),m=date.getMonth();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  const arr=[];
  for(let d=1;d<=last.getDate();d++)arr.push(dayKey(new Date(y,m,d)));
  return arr;
}
function habitWeeklyProgress(h,anchor=dayKey(new Date())){
  const keys=habitWeekKeys(anchor);
  if(h.frequency==='weeklyTarget'){
    const done=keys.filter(k=>habitDoneOnDate(h,k)).length;
    const target=Math.max(1,Number(h.weeklyTarget)||1);
    return {done,target,due:target,pct:Math.min(100,Math.round(done/target*100))};
  }
  const dueKeys=keys.filter(k=>habitDueOnDate(h,k));
  const done=dueKeys.filter(k=>habitDoneOnDate(h,k)).length;
  const due=dueKeys.length||1;
  return {done,target:due,due,pct:Math.min(100,Math.round(done/due*100))};
}
function habitMonthlyProgress(h,date=new Date()){
  const keys=habitMonthKeys(date);
  const dueKeys=h.frequency==='weeklyTarget'?keys:keys.filter(k=>habitDueOnDate(h,k));
  const done=dueKeys.filter(k=>habitDoneOnDate(h,k)).length;
  return {done,due:dueKeys.length||1,pct:Math.min(100,Math.round(done/(dueKeys.length||1)*100))};
}
function habitCurrentStreak(h){
  if(h.frequency==='weeklyTarget')return habitWeeklyStreak(h,false);
  let count=0;
  const today=new Date();
  for(let i=0;i<730;i++){
    const d=addDays(today,-i);
    const k=dayKey(d);
    if(!habitDueOnDate(h,k))continue;
    if(habitDoneOnDate(h,k))count++;
    else break;
  }
  return count;
}
function habitBestStreak(h){
  if(h.frequency==='weeklyTarget')return habitWeeklyStreak(h,true);
  let best=0,current=0;
  const start=addDays(new Date(),-365);
  for(let i=0;i<=365;i++){
    const d=addDays(start,i);
    const k=dayKey(d);
    if(!habitDueOnDate(h,k))continue;
    if(habitDoneOnDate(h,k)){current++;best=Math.max(best,current);}
    else current=0;
  }
  return best;
}
function habitWeeklyStreak(h,bestOnly=false){
  const target=Math.max(1,Number(h.weeklyTarget)||1);
  let current=0,best=0;
  const today=new Date();
  const weeks=[];
  for(let i=52;i>=0;i--){
    const d=addDays(today,-i*7);
    const keys=habitWeekKeys(dayKey(d));
    const done=keys.filter(k=>habitDoneOnDate(h,k)).length;
    const ok=done>=target;
    weeks.push(ok);
  }
  weeks.forEach(ok=>{if(ok){current++;best=Math.max(best,current);}else current=0;});
  if(bestOnly)return best;
  let now=0;
  for(let i=weeks.length-1;i>=0;i--){if(weeks[i])now++;else break;}
  return now;
}
function updateHabitStats(h){
  h.streak=habitCurrentStreak(h);
  h.bestStreak=habitBestStreak(h);
  h.updatedAt=Date.now();
  return h;
}
function prepareHabitModal(){
  $('habNameInp').value='';
  habEmoji='💪';
  habFreq='daily';
  habSelectedDays=[1,2,3,4,5];
  habWeeklyTarget=3;
  const eg=$('habEmojiGrid');
  if(eg)eg.innerHTML=HAB_EMOJIS.map(e=>`<button class="eg-btn${e===habEmoji?' sel':''}" onclick="pickHabEmoji('${e}',this)">${e}</button>`).join('');
  document.querySelectorAll('#habModal .chip').forEach(c=>c.classList.toggle('on',c.dataset.freq==='daily'));
  renderHabitDayPicker();
  renderHabitModalControls();
}
function pickHabEmoji(e,el){
  habEmoji=e;
  document.querySelectorAll('.eg-btn').forEach(b=>b.classList.remove('sel'));
  el?.classList.add('sel');
}
function habPickFreq(f,el){
  habFreq=f;
  document.querySelectorAll('#habModal .chip').forEach(c=>c.classList.remove('on'));
  el?.classList.add('on');
  renderHabitModalControls();
}
function renderHabitModalControls(){
  const picker=$('habDaysPickerWrap');
  const target=$('habWeeklyTargetWrap');
  if(picker)picker.style.display=habFreq==='specific'?'block':'none';
  if(target)target.style.display=habFreq==='weeklyTarget'?'block':'none';
}
function renderHabitDayPicker(){
  const box=$('habDaysPicker');
  if(!box)return;
  box.innerHTML=DS.map((d,i)=>`<button type="button" class="habit-day-pick ${habSelectedDays.includes(i)?'on':''}" onclick="toggleHabitPickerDay(${i})">${d}</button>`).join('');
}
function toggleHabitPickerDay(day){
  if(habSelectedDays.includes(day))habSelectedDays=habSelectedDays.filter(d=>d!==day);
  else habSelectedDays.push(day);
  habSelectedDays.sort((a,b)=>a-b);
  renderHabitDayPicker();
}
function confirmHab(){
  normalizeHabits();
  const name=$('habNameInp').value.trim();
  if(!name){showToast('Informe o nome do hábito');return;}
  const weeklyTarget=Math.max(1,Math.min(7,parseInt($('habWeeklyTargetInp')?.value||habWeeklyTarget)||1));
  const habit=normalizeHabit({
    id:++habId,
    name,
    emoji:habEmoji,
    frequency:habFreq||'daily',
    days:habSelectedDays.length?habSelectedDays:[1,2,3,4,5],
    weeklyTarget,
    log:[],
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
  S.habits.push(habit);
  closeModal('habModal');
  commitHabits('Hábito criado');
}
function commitHabits(message){
  normalizeHabits();
  S.habits.forEach(updateHabitStats);
  renderHabits();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'🔥',1800);
}
function quickToggleHab(id){toggleHabToday(id);renderHome();}
function toggleHabToday(id){
  toggleHabDay(id,dayKey(new Date()));
}
function toggleHabDay(id,k){
  normalizeHabits();
  const h=S.habits.find(x=>String(x.id)===String(id));
  if(!h)return;
  if(!Array.isArray(h.log))h.log=[];
  h.log=h.log.includes(k)?h.log.filter(x=>x!==k):[...h.log,k];
  updateHabitStats(h);
  if(h.log.includes(k)){haptic('success');showToast(`${h.emoji} ${h.name} feito!`,'');}
  else haptic('light');
  checkStreakMilestones?.(h);
  commitHabits();
}
function recalcStreak(h){updateHabitStats(h);}
function editHabit(id){
  normalizeHabits();
  const h=S.habits.find(x=>String(x.id)===String(id));
  if(!h)return;
  openEditModal({
    title:'Editar hábito',
    subtitle:'Ajuste nome, frequência e metas.',
    fields:[
      {name:'name',label:'Nome',value:h.name||'',placeholder:'Nome do hábito'},
      {name:'emoji',label:'Emoji',value:h.emoji||'🔥',placeholder:'🔥'},
      {name:'frequency',label:'Frequência',type:'select',value:h.frequency||'daily',options:[
        {value:'daily',label:'Diário'},
        {value:'weekdays',label:'Dias úteis'},
        {value:'weekend',label:'Fim de semana'},
        {value:'specific',label:'Dias específicos'},
        {value:'weeklyTarget',label:'X vezes por semana'}
      ]},
      {name:'days',label:'Dias específicos',value:(h.days||[]).join(','),placeholder:'Ex: 1,3,5'},
      {name:'weeklyTarget',label:'Meta semanal',type:'number',value:h.weeklyTarget||1,inputmode:'numeric'}
    ],
    onSave(values){
      if(!String(values.name||'').trim()){showToast('Informe o nome do hábito');return false;}
      h.name=String(values.name).trim();
      h.emoji=String(values.emoji||'🔥').trim()||'🔥';
      h.frequency=values.frequency||'daily';
      h.days=String(values.days||'').split(',').map(x=>parseInt(x.trim())).filter(n=>n>=0&&n<=6);
      if(!h.days.length)h.days=[1,2,3,4,5];
      h.weeklyTarget=Math.max(1,Math.min(7,parseInt(values.weeklyTarget)||1));
      h.updatedAt=Date.now();
      updateHabitStats(h);
      commitHabits();
    }
  });
}
function rmHabit(id){
  if(!confirm('Excluir este hábito?'))return;
  S.habits=S.habits.filter(x=>String(x.id)!==String(id));
  commitHabits();
}
function renderHabits(){
  normalizeHabits();
  const list=$('habList'),em=$('habEmpty');
  if(!list)return;
  list.querySelectorAll('.hab-item').forEach(e=>e.remove());
  const today=new Date(),todayK=dayKey(today);
  const dueToday=S.habits.filter(h=>habitDueOnDate(h,todayK)||h.frequency==='weeklyTarget');
  const doneToday=dueToday.filter(h=>habitDoneOnDate(h,todayK)).length;
  const weekAvg=S.habits.length?Math.round(S.habits.reduce((a,h)=>a+habitWeeklyProgress(h).pct,0)/S.habits.length):0;
  const best=S.habits.reduce((a,h)=>Math.max(a,habitBestStreak(h)),0);
  if($('habSummary'))$('habSummary').textContent=`${doneToday} de ${dueToday.length} concluídos hoje`;
  renderHabitStats(doneToday,dueToday.length,weekAvg,best);
  if(em)em.style.display=S.habits.length?'none':'block';
  S.habits.forEach(h=>{
    updateHabitStats(h);
    const wrap=document.createElement('div');
    wrap.innerHTML=renderHabitItem(h);
    list.appendChild(wrap.firstElementChild);
  });
}
function renderHabitStats(doneToday,dueToday,weekAvg,best){
  const box=$('habStats');
  if(!box)return;
  box.innerHTML=`
    <div><span>Hoje</span><strong>${doneToday}/${dueToday}</strong></div>
    <div><span>Semana</span><strong>${weekAvg}%</strong></div>
    <div><span>Melhor sequência</span><strong>${best}</strong></div>
  `;
}
function renderHabitItem(h){
  const todayK=dayKey(new Date());
  const isDue=habitDueOnDate(h,todayK)||h.frequency==='weeklyTarget';
  const doneToday=habitDoneOnDate(h,todayK);
  const week=habitWeeklyProgress(h);
  const month=habitMonthlyProgress(h);
  return `<div class="hab-item v15">
    <div class="hab-top">
      <div class="hab-left">
        <div class="hab-emoji">${unioEscape(h.emoji)}</div>
        <div>
          <div class="hab-name">${unioEscape(h.name)}</div>
          <div class="hab-freq">${habitFreqLabel(h)} · semana ${week.done}/${week.target}</div>
        </div>
      </div>
      <div class="hab-actions">
        <button class="hab-edit" onclick="editHabit(${h.id})">Editar</button>
        <button class="hab-rm" onclick="rmHabit(${h.id})">×</button>
      </div>
    </div>
    <div class="hab-stat-row">
      <div><span>Atual</span><strong>🔥 ${h.streak||0}</strong></div>
      <div><span>Melhor</span><strong>🏆 ${h.bestStreak||0}</strong></div>
      <div><span>Mês</span><strong>${month.pct}%</strong></div>
    </div>
    ${renderHabitWeek(h)}
    <button class="hab-check-btn${doneToday?' done':''}" ${isDue?'':'style="opacity:.62;"'} onclick="toggleHabToday(${h.id})">${doneToday?'✓ Concluído hoje':isDue?'Marcar como feito hoje':'Marcar mesmo fora da frequência'}</button>
    ${renderHabitMonthCalendar(h)}
  </div>`;
}
function renderHabitWeek(h){
  const wk=weekKeys();
  return `<div class="hab-week">${wk.map(k=>{
    const d=keyToDate(k);
    const done=habitDoneOnDate(h,k);
    const due=habitDueOnDate(h,k)||h.frequency==='weeklyTarget';
    const today=k===dayKey(new Date());
    return `<div class="hab-day-dot ${done?'done':''} ${today?'today':''} ${due?'due':'skip'}" onclick="toggleHabDay(${h.id},'${k}')">${DS[d.getDay()][0]}</div>`;
  }).join('')}</div>`;
}
function renderHabitMonthCalendar(h){
  const keys=habitMonthKeys(new Date());
  return `<div class="habit-month">
    <div class="habit-month-head"><span>${MS[new Date().getMonth()]} · ${keys.filter(k=>habitDoneOnDate(h,k)).length} registros</span><span>${habitMonthlyProgress(h).pct}%</span></div>
    <div class="habit-month-grid">${keys.map(k=>`<button class="habit-month-cell ${habitDoneOnDate(h,k)?'done':''} ${(habitDueOnDate(h,k)||h.frequency==='weeklyTarget')?'due':'skip'}" onclick="toggleHabDay(${h.id},'${k}')">${keyToDate(k).getDate()}</button>`).join('')}</div>
  </div>`;
}
