/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TASKS — módulo profissional
   - visões: hoje/semana/sem data/concluídas
   - prioridade, categoria, data e recorrência controlada
   - edição por modal interno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function taskDateObjFromKey(k){return keyToDate(k);}
function taskDayLabel(k){
  const d=taskDateObjFromKey(k);
  const today=dayKey(new Date());
  const tomorrow=dayKey(addDays(new Date(),1));
  if(k===today)return 'Hoje';
  if(k===tomorrow)return 'Amanhã';
  return `${DL[d.getDay()]}, ${d.getDate()} de ${MS[d.getMonth()]}`;
}
function taskKeyToInput(k){
  if(!k)return '';
  const d=keyToDate(k);
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function taskInputToKey(value){
  if(!value)return null;
  const [y,m,d]=String(value).split('-').map(Number);
  if(!y||!m||!d)return null;
  return dayKey(new Date(y,m-1,d));
}
function normalizeTasks(){
  if(!Array.isArray(S.tasks))S.tasks=[];
  if(!Array.isArray(S.taskCategories)||!S.taskCategories.length)S.taskCategories=DEFAULT_TASK_CATEGORIES.slice();
  if(!S.taskView)S.taskView='today';
  S.tasks=S.tasks.map(t=>({
    id:t.id,
    txt:t.txt||t.title||'Tarefa',
    done:!!t.done,
    date:t.date===undefined?S.selDay:t.date,
    priority:t.priority||'normal',
    category:t.category||'Pessoal',
    recurrence:t.recurrence||'none',
    completionLog:Array.isArray(t.completionLog)?t.completionLog:[],
    createdAt:t.createdAt||Date.now(),
    updatedAt:t.updatedAt||t.createdAt||Date.now(),
    doneAt:t.doneAt||null,
    archived:!!t.archived
  }));
}
function taskPriorityLabel(p){return ({low:'Baixa',normal:'Normal',high:'Alta'}[p]||'Normal');}
function taskPriorityIcon(p){return ({low:'⬇️',normal:'•',high:'⚡'}[p]||'•');}
function taskRecurrenceLabel(r){return ({none:'Sem repetição',daily:'Diária',weekdays:'Dias úteis',weekly:'Semanal'}[r]||'Sem repetição');}
function taskIsRecurring(t){return t.recurrence&&t.recurrence!=='none';}
function taskCompareKeys(a,b){
  const da=keyToDate(a),db=keyToDate(b);
  return da.getTime()-db.getTime();
}
function taskDueOnDate(t,k){
  if(t.archived)return false;
  if(!taskIsRecurring(t))return t.date===k;
  if(!t.date)return false;
  if(taskCompareKeys(k,t.date)<0)return false;
  const d=keyToDate(k),start=keyToDate(t.date);
  if(t.recurrence==='daily')return true;
  if(t.recurrence==='weekdays')return d.getDay()>=1&&d.getDay()<=5;
  if(t.recurrence==='weekly')return d.getDay()===start.getDay();
  return false;
}
function taskDoneForDate(t,k){
  if(taskIsRecurring(t))return (t.completionLog||[]).includes(k);
  return !!t.done;
}
function taskOccurrencesForDate(k,includeDone=true){
  normalizeTasks();
  return S.tasks
    .filter(t=>taskDueOnDate(t,k))
    .filter(t=>includeDone||!taskDoneForDate(t,k))
    .map(t=>({task:t,date:k,done:taskDoneForDate(t,k)}));
}
function taskOccurrencesForWeek(){
  const keys=weekKeys(S.taskWeekAnchor||S.selDay||dayKey(new Date()));
  const out=[];
  keys.forEach(k=>taskOccurrencesForDate(k,true).forEach(o=>out.push(o)));
  return out;
}
function taskDoneOccurrences(){
  const out=[];
  S.tasks.forEach(t=>{
    if(taskIsRecurring(t)){
      (t.completionLog||[]).forEach(k=>out.push({task:t,date:k,done:true}));
    }else if(t.done){
      out.push({task:t,date:t.date||dayKey(new Date()),done:true});
    }
  });
  return out.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function syncTaskNoDateButton(){
  const btn=$('tNodateBtn');
  if(!btn)return;
  btn.classList.toggle('on',!!S.tNoDate);
  $('tNodateIco').textContent=S.tNoDate?'📌':'📅';
  $('tNodateTxt').textContent=S.tNoDate?'Sem data':'Com data';
  const dateField=$('tDateInput');
  const recField=$('tRecurrence');
  if(dateField)dateField.disabled=!!S.tNoDate;
  if(recField)recField.disabled=!!S.tNoDate;
}
function renderTaskFormMeta(){
  const cat=$('tCategory');
  if(cat)cat.innerHTML=(S.taskCategories||DEFAULT_TASK_CATEGORIES).map(c=>`<option value="${unioEscape(c)}">${unioEscape(c)}</option>`).join('');
  const date=$('tDateInput');
  if(date&&!date.value)date.value=taskKeyToInput(S.selDay||dayKey(new Date()));
}
function setTaskView(view){
  normalizeTasks();
  S.taskView=view;
  renderTasks();
  saveState?.();
  haptic('light');
}
function selectTaskDay(mode){
  const d=new Date();
  if(mode==='tomorrow')d.setDate(d.getDate()+1);
  S.selDay=dayKey(d);
  S.taskWeekAnchor=S.selDay;
  S.taskView='today';
  renderWeekStrip();
  renderTasks();
  saveState?.();
  haptic('light');
}
function shiftTaskWeek(delta){
  const anchor=keyToDate(S.taskWeekAnchor||S.selDay||dayKey(new Date()));
  S.taskWeekAnchor=dayKey(addDays(anchor,delta*7));
  if(S.taskView==='today'){
    const days=weekRangeFromAnchor(S.taskWeekAnchor);
    S.selDay=dayKey(days[0]);
  }
  renderWeekStrip();
  renderTasks();
  saveState?.();
  haptic('light');
}
function toggleNoDate(btn){
  S.tNoDate=!S.tNoDate;
  syncTaskNoDateButton();
  haptic('light');
}
function renderWeekStrip(){
  normalizeTasks();
  syncTaskNoDateButton();
  renderTaskFormMeta();
  const strip=$('weekStrip');
  if(!strip)return;
  const todayK=dayKey(new Date());
  if(!S.taskWeekAnchor)S.taskWeekAnchor=S.selDay||todayK;
  const days=weekRangeFromAnchor(S.taskWeekAnchor);
  const title=$('taskWeekTitle');
  const sub=$('taskWeekSub');
  if(title)title.textContent=weekRangeLabel(S.taskWeekAnchor);
  if(sub){
    const undated=S.tasks.filter(t=>t.date===null&&!taskIsRecurring(t)&&!t.done).length;
    sub.textContent=undated?`${undated} sem data`:'Toque em um dia para ver as tarefas';
  }
  strip.innerHTML='';
  days.forEach(d=>{
    const k=dayKey(d),isT=k===todayK,isSel=k===S.selDay;
    const occ=taskOccurrencesForDate(k,true);
    const openCount=occ.filter(o=>!o.done).length;
    const doneCount=occ.filter(o=>o.done).length;
    const div=document.createElement('div');
    div.className='week-day'+(isT?' today':'')+(isSel?' sel':'');
    div.innerHTML=`<div class="wd-nm">${DS[d.getDay()]}</div><div class="wd-n">${d.getDate()}</div><div class="wd-dot${openCount?' on':''}${doneCount&&!openCount?' done':''}"></div>`;
    div.onclick=()=>{S.selDay=k;S.taskWeekAnchor=k;S.taskView='today';renderWeekStrip();renderTasks();saveState?.();};
    strip.appendChild(div);
  });
}
function addTask(){
  normalizeTasks();
  const inp=$('tInput'),v=(inp?.value||'').trim();
  if(!v)return;
  const priority=$('tPriority')?.value||'normal';
  const category=$('tCategory')?.value||'Pessoal';
  const recurrence=S.tNoDate?'none':($('tRecurrence')?.value||'none');
  const picked=taskInputToKey($('tDateInput')?.value)||S.selDay||dayKey(new Date());
  const date=S.tNoDate?null:picked;
  S.tasks.unshift({
    id:++tId,
    txt:v,
    done:false,
    date,
    priority,
    category,
    recurrence,
    completionLog:[],
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
  if(inp)inp.value='';
  S.taskView=S.tNoDate?'nodate':'today';
  if(date){S.selDay=date;S.taskWeekAnchor=date;}
  commitTasks('Tarefa adicionada');
}
function commitTasks(message){
  renderTasks();
  renderWeekStrip();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'✅',1800);
}
function toggleTask(id,dateKey){
  const t=S.tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  const k=dateKey||t.date||S.selDay||dayKey(new Date());
  if(taskIsRecurring(t)){
    if(!Array.isArray(t.completionLog))t.completionLog=[];
    if(t.completionLog.includes(k))t.completionLog=t.completionLog.filter(x=>x!==k);
    else t.completionLog.push(k);
  }else{
    t.done=!t.done;
    t.doneAt=t.done?Date.now():null;
  }
  t.updatedAt=Date.now();
  if(taskDoneForDate(t,k)){haptic('success');showToast('Tarefa concluída','✅');}
  else haptic('light');
  commitTasks();
}
function delTask(id){
  if(!confirm('Excluir esta tarefa?'))return;
  S.tasks=S.tasks.filter(x=>String(x.id)!==String(id));
  commitTasks();
}
function clearDoneTasks(){
  const before=S.tasks.length;
  S.tasks=S.tasks.filter(t=>!t.done);
  S.tasks.forEach(t=>{if(taskIsRecurring(t))t.completionLog=[];});
  const removed=before-S.tasks.length;
  commitTasks(removed?`${removed} concluída${removed>1?'s':''} removida${removed>1?'s':''}`:'Concluídas limpas');
}
function moveTaskToDay(id,k){
  const t=S.tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  t.date=k;
  t.done=false;
  t.recurrence='none';
  t.updatedAt=Date.now();
  S.selDay=k;
  S.taskWeekAnchor=k;
  S.taskView='today';
  commitTasks('Tarefa movida');
}
function editTask(id){
  const t=S.tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  openEditModal({
    title:'Editar tarefa',
    subtitle:'Ajuste data, prioridade, categoria e recorrência.',
    fields:[
      {name:'txt',label:'Tarefa',value:t.txt||'',placeholder:'Descrição'},
      {name:'date',label:'Data',type:'date',value:t.date?taskKeyToInput(t.date):''},
      {name:'priority',label:'Prioridade',type:'select',value:t.priority||'normal',options:[
        {value:'low',label:'Baixa'},
        {value:'normal',label:'Normal'},
        {value:'high',label:'Alta'}
      ]},
      {name:'category',label:'Categoria',type:'select',value:t.category||'Pessoal',options:(S.taskCategories||DEFAULT_TASK_CATEGORIES).map(c=>({value:c,label:c}))},
      {name:'recurrence',label:'Recorrência',type:'select',value:t.recurrence||'none',options:[
        {value:'none',label:'Sem repetição'},
        {value:'daily',label:'Diária'},
        {value:'weekdays',label:'Dias úteis'},
        {value:'weekly',label:'Semanal'}
      ]}
    ],
    onSave(values){
      if(!String(values.txt||'').trim()){showToast('Informe a tarefa');return false;}
      t.txt=String(values.txt).trim();
      t.date=values.date?taskInputToKey(values.date):null;
      t.priority=values.priority||'normal';
      t.category=values.category||'Pessoal';
      t.recurrence=t.date?(values.recurrence||'none'):'none';
      t.updatedAt=Date.now();
      if(t.date){S.selDay=t.date;S.taskWeekAnchor=t.date;}
      commitTasks();
    }
  });
}
function addTaskCategory(){
  const input=$('taskNewCategory');
  const value=(input?.value||'').trim();
  if(!value){showToast('Informe uma categoria');return;}
  if(value.length>24){showToast('Categoria muito longa');return;}
  if((S.taskCategories||[]).some(c=>c.toLowerCase()===value.toLowerCase())){showToast('Categoria já existe');return;}
  S.taskCategories.push(value);
  S.taskCategories.sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(input)input.value='';
  renderTaskFormMeta();
  renderTasks();
  saveState?.();
  showToast('Categoria adicionada');
}
function deleteTaskCategory(encoded){
  const category=decodeURIComponent(encoded);
  if(DEFAULT_TASK_CATEGORIES.includes(category)){showToast('Categoria padrão');return;}
  if(!confirm(`Excluir a categoria "${category}"?`))return;
  S.taskCategories=S.taskCategories.filter(c=>c!==category);
  S.tasks.forEach(t=>{if(t.category===category)t.category='Outros';});
  commitTasks();
}
function getTaskViewData(){
  normalizeTasks();
  const view=S.taskView||'today';
  if(view==='week'){
    const occ=taskOccurrencesForWeek();
    return {
      title:'Semana',
      subtitle:`${occ.filter(o=>!o.done).length} pendentes na semana`,
      pending:occ.filter(o=>!o.done),
      done:occ.filter(o=>o.done)
    };
  }
  if(view==='nodate'){
    const tasks=S.tasks.filter(t=>t.date===null&&!taskIsRecurring(t));
    return {title:'Sem data',subtitle:`${tasks.filter(t=>!t.done).length} pendentes`,pending:tasks.filter(t=>!t.done).map(t=>({task:t,date:null,done:false})),done:tasks.filter(t=>t.done).map(t=>({task:t,date:null,done:true}))};
  }
  if(view==='done'){
    const done=taskDoneOccurrences();
    return {title:'Concluídas',subtitle:`${done.length} registros concluídos`,pending:[],done};
  }
  const occ=taskOccurrencesForDate(S.selDay||dayKey(new Date()),true);
  return {title:taskDayLabel(S.selDay),subtitle:`${occ.filter(o=>!o.done).length} pendentes · ${occ.filter(o=>o.done).length} concluídas`,pending:occ.filter(o=>!o.done),done:occ.filter(o=>o.done)};
}
function renderTasks(){
  normalizeTasks();
  renderTaskFormMeta();
  syncTaskNoDateButton();
  document.querySelectorAll('.task-view-chip').forEach(b=>b.classList.toggle('on',b.dataset.view===S.taskView));
  const data=getTaskViewData();
  const dayCard=$('taskDayCard');
  if(dayCard)dayCard.innerHTML=`<div><strong>${unioEscape(data.title)}</strong><span>${unioEscape(data.subtitle)}</span></div>`;
  const list=$('taskList');
  const empty=$('tEmpty');
  const sections=[];
  if(data.pending.length)sections.push(`<div class="t-sec">${S.taskView==='done'?'Registros':'Pendentes'} (${data.pending.length})</div><div>${data.pending.map(renderTaskItem).join('')}</div>`);
  if(data.done.length)sections.push(`<div class="t-sec">Concluídas (${data.done.length})</div><div>${data.done.map(renderTaskItem).join('')}</div>`);
  if(list)list.innerHTML=sections.join('');
  if(empty)empty.style.display=(data.pending.length+data.done.length)?'none':'block';
  renderTaskCategoryManager();
}
function renderTaskItem(occ){
  const t=occ.task||occ;
  const k=occ.date||t.date||S.selDay||dayKey(new Date());
  const done=occ.done!==undefined?occ.done:taskDoneForDate(t,k);
  const isPin=t.date===null&&!taskIsRecurring(t);
  const today=dayKey(new Date());
  const tomorrowK=dayKey(addDays(new Date(),1));
  const pinActions=isPin&&!done?`<div class="task-mini-actions"><button onclick="moveTaskToDay(${t.id},'${today}')">Hoje</button><button onclick="moveTaskToDay(${t.id},'${tomorrowK}')">Amanhã</button></div>`:'';
  const dueLabel=isPin?'Sem data':taskDayLabel(k);
  return `<div class="task-item v14 ${done?'done':''} priority-${t.priority||'normal'} ${isPin?'pinned':''}">
    <div class="t-cb" onclick="toggleTask(${t.id},'${k}')"><span class="t-ck">✓</span></div>
    <div class="task-main">
      <span class="t-txt">${unioEscape(t.txt)}</span>
      <div class="task-meta">
        <span>${taskPriorityIcon(t.priority)} ${taskPriorityLabel(t.priority)}</span>
        <span>${unioEscape(t.category||'Pessoal')}</span>
        <span>${unioEscape(dueLabel)}</span>
        ${taskIsRecurring(t)?`<span>🔁 ${taskRecurrenceLabel(t.recurrence)}</span>`:''}
      </div>
      ${pinActions}
    </div>
    <div class="task-actions">
      <button onclick="editTask(${t.id})">Editar</button>
      <button class="t-del" onclick="delTask(${t.id})">×</button>
    </div>
  </div>`;
}
function renderTaskCategoryManager(){
  const box=$('taskCategoryManager');
  if(!box)return;
  box.innerHTML=`<div class="task-cat-list">${(S.taskCategories||[]).map(c=>`<span class="task-cat-chip">${unioEscape(c)}${DEFAULT_TASK_CATEGORIES.includes(c)?'':`<button onclick="deleteTaskCategory('${encodeURIComponent(c)}')">×</button>`}</span>`).join('')}</div>
  <div class="task-cat-add"><input class="field" id="taskNewCategory" placeholder="Nova categoria"><button onclick="addTaskCategory()">Adicionar</button></div>`;
}
