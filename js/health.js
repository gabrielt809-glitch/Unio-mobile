/* Unio Base Organizada v25 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SAÚDE — diário completo
   - atividades sugeridas e livres
   - peso, humor, energia, dor e observações
   - histórico semanal/mensal
   - integração com respiração guiada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let healthIntensity='moderada';

function todayKey(){return dayKey(new Date());}
function safeArr(v){return Array.isArray(v)?v:[];}

function normalizeHealthState(){
  if(!S.health)S.health={steps:0,stepsLog:{},acts:[],diary:[],weightLog:[],breathSessions:[]};
  if(!Array.isArray(S.health.acts))S.health.acts=[];
  if(!Array.isArray(S.health.diary))S.health.diary=[];
  if(!Array.isArray(S.health.weightLog))S.health.weightLog=[];
  if(!Array.isArray(S.health.breathSessions))S.health.breathSessions=[];
  if(!S.health.stepsLog||typeof S.health.stepsLog!=='object')S.health.stepsLog={};
  const tk=todayKey();
  S.health.acts=S.health.acts.map(a=>{
    const min=Number(a.min ?? a.minutes ?? 0)||0;
    const name=a.name || a.n || 'Atividade';
    const intensity=a.intensity || (a.met>=8?'intensa':a.met>=4?'moderada':'leve');
    return {
      id:a.id || Date.now()+Math.floor(Math.random()*1000),
      name,
      min,
      intensity,
      note:a.note || (a.cat?String(a.cat):''),
      time:a.time || '',
      date:a.date || tk
    };
  });
  S.health.diary=S.health.diary.map(d=>({
    id:d.id||Date.now()+Math.floor(Math.random()*1000),
    date:d.date||tk,
    weight:Number(d.weight)||0,
    mood:d.mood||'neutral',
    energy:clamp(Number(d.energy)||3,1,5),
    pain:clamp(Number(d.pain)||0,0,5),
    note:d.note||'',
    createdAt:d.createdAt||Date.now(),
    updatedAt:d.updatedAt||d.createdAt||Date.now()
  }));
  S.health.weightLog=S.health.weightLog.map(w=>({
    id:w.id||Date.now()+Math.floor(Math.random()*1000),
    date:w.date||tk,
    weight:Number(w.weight)||0,
    createdAt:w.createdAt||Date.now()
  })).filter(w=>w.weight>0);
}

function getTodayHealthEntries(){
  normalizeHealthState();
  const tk=todayKey();
  return S.health.acts.filter(a=>!a.date || a.date===tk);
}
function getHealthEntriesByRange(keys){
  normalizeHealthState();
  const set=new Set(keys);
  return S.health.acts.filter(a=>set.has(a.date||todayKey()));
}
function getTodayHealthDiary(){
  normalizeHealthState();
  const tk=todayKey();
  return S.health.diary.find(d=>d.date===tk)||null;
}
function healthMoodMeta(id){
  return (DEFAULT_HEALTH_MOODS||[]).find(m=>m.id===id)||DEFAULT_HEALTH_MOODS[2];
}
function healthIntensityLabel(i){
  if(i==='intensa')return 'Intensa';
  if(i==='leve')return 'Leve';
  return 'Moderada';
}
function healthIntensityIcon(i){
  if(i==='intensa')return '⚡';
  if(i==='leve')return '🍃';
  return '🔥';
}
function dominantIntensity(entries){
  if(!entries.length)return '—';
  const score={leve:0,moderada:0,intensa:0};
  entries.forEach(e=>{score[e.intensity||'moderada']+=Math.max(1,e.min||1);});
  return Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0];
}
function healthWeekKeys(){return weekKeys(dayKey(new Date()));}
function healthMonthKeys(){
  const now=new Date(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  return Array.from({length:last},(_,i)=>dayKey(new Date(now.getFullYear(),now.getMonth(),i+1)));
}
function healthSummaryForKeys(keys){
  const entries=getHealthEntriesByRange(keys);
  const minutes=entries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const daysWithActivity=new Set(entries.map(e=>e.date)).size;
  const diary=S.health.diary.filter(d=>keys.includes(d.date));
  const energy=diary.length?Math.round(diary.reduce((a,d)=>a+(Number(d.energy)||0),0)/diary.length*10)/10:0;
  const pain=diary.length?Math.round(diary.reduce((a,d)=>a+(Number(d.pain)||0),0)/diary.length*10)/10:0;
  return {entries,minutes,daysWithActivity,diary,energy,pain};
}
function healthScore(){
  const today=getTodayHealthDiary();
  const entries=getTodayHealthEntries();
  let score=55;
  if((S.health.steps||0)>=8000)score+=15;
  else if((S.health.steps||0)>=4000)score+=8;
  if(entries.reduce((a,x)=>a+(Number(x.min)||0),0)>=30)score+=15;
  if(today){
    score+=((Number(today.energy)||3)-3)*5;
    score-=Number(today.pain||0)*4;
  }
  return clamp(Math.round(score),0,100);
}
function setHealthActivityName(name){
  const el=$('healthNameInp');
  if(el){el.value=name;el.focus();}
}
function saveSteps(){
  normalizeHealthState();
  const v=parseInt(document.getElementById('stepsInp')?.value,10)||0;
  S.health.steps=Math.max(0,v);
  S.health.stepsLog[todayKey()]=S.health.steps;
  commitHealth('Passos salvos');
}
function addSteps(n){
  normalizeHealthState();
  S.health.steps=Math.max(0,(Number(S.health.steps)||0)+n);
  S.health.stepsLog[todayKey()]=S.health.steps;
  const inp=document.getElementById('stepsInp');
  if(inp)inp.value=S.health.steps;
  commitHealth();
  haptic('light');
}
function pickHealthIntensity(intensity,el){
  healthIntensity=intensity;
  document.querySelectorAll('.h-intensity-btn').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  haptic('light');
}
function addHealthEntry(){
  normalizeHealthState();
  const nameEl=document.getElementById('healthNameInp');
  const minEl=document.getElementById('healthMinInp');
  const timeEl=document.getElementById('healthTimeInp');
  const noteEl=document.getElementById('healthNoteInp');
  const name=(nameEl?.value||'').trim();
  if(!name){
    showToast('Informe a atividade antes de adicionar.','',2200);
    haptic('error');
    return;
  }
  const min=Math.max(0,parseInt(minEl?.value||'0',10)||0);
  const now=new Date();
  const defaultTime=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  S.health.acts.unshift({
    id:Date.now(),
    name,
    min,
    intensity:healthIntensity,
    note:(noteEl?.value||'').trim(),
    time:timeEl?.value || defaultTime,
    date:todayKey()
  });
  if(nameEl)nameEl.value='';
  if(minEl)minEl.value='';
  if(noteEl)noteEl.value='';
  if(timeEl)timeEl.value='';
  healthIntensity='moderada';
  document.querySelectorAll('.h-intensity-btn').forEach(b=>b.classList.remove('on'));
  document.getElementById('hiModerada')?.classList.add('on');
  commitHealth('Atividade adicionada ao diário! 🏃');
  haptic('success');
}
function saveHealthCheckin(){
  normalizeHealthState();
  const weight=Number(String($('healthWeightInp')?.value||'').replace(/\./g,'').replace(',','.'))||0;
  const mood=$('healthMoodInp')?.value||'neutral';
  const energy=clamp(parseInt($('healthEnergyInp')?.value||'3'),1,5);
  const pain=clamp(parseInt($('healthPainInp')?.value||'0'),0,5);
  const note=($('healthDiaryNoteInp')?.value||'').trim();
  const tk=todayKey();
  let row=S.health.diary.find(d=>d.date===tk);
  if(!row){
    row={id:Date.now(),date:tk,createdAt:Date.now()};
    S.health.diary.unshift(row);
  }
  Object.assign(row,{weight,mood,energy,pain,note,updatedAt:Date.now()});
  if(weight>0){
    const existing=S.health.weightLog.find(w=>w.date===tk);
    if(existing){existing.weight=weight;existing.createdAt=Date.now();}
    else S.health.weightLog.unshift({id:Date.now()+1,date:tk,weight,createdAt:Date.now()});
    S.weight=weight;
  }
  commitHealth('Diário de saúde salvo');
}
function rmAct(id){
  S.health.acts=S.health.acts.filter(x=>String(x.id)!==String(id));
  commitHealth();
}
function clearHealthToday(){
  const entries=getTodayHealthEntries();
  if(!entries.length){
    showToast('Não há registros para limpar hoje.','',1800);
    return;
  }
  if(!confirm('Limpar todos os registros de saúde de hoje?'))return;
  const tk=todayKey();
  S.health.acts=S.health.acts.filter(a=>a.date && a.date!==tk);
  commitHealth('Registros de hoje limpos');
}
function editHealthEntry(id){
  const a=S.health.acts.find(x=>String(x.id)===String(id));
  if(!a)return;
  openEditModal({
    title:'Editar atividade',
    subtitle:'Atualize atividade, duração e observação.',
    fields:[
      {name:'name',label:'Atividade',value:a.name||'',placeholder:'Ex: Bike'},
      {name:'min',label:'Duração',type:'number',value:a.min||0,inputmode:'numeric'},
      {name:'time',label:'Horário',type:'time',value:a.time||''},
      {name:'intensity',label:'Intensidade',type:'select',value:a.intensity||'moderada',options:[
        {value:'leve',label:'Leve'},
        {value:'moderada',label:'Moderada'},
        {value:'intensa',label:'Intensa'}
      ]},
      {name:'note',label:'Observação',value:a.note||'',placeholder:'Observação'}
    ],
    onSave(values){
      if(!String(values.name||'').trim()){showToast('Informe a atividade');return false;}
      a.name=String(values.name).trim();
      a.min=Math.max(0,parseInt(values.min)||0);
      a.time=values.time||'';
      a.intensity=values.intensity||'moderada';
      a.note=values.note||'';
      commitHealth();
    }
  });
}
function commitHealth(message){
  normalizeHealthState();
  renderHealth();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'',2000);
}
function renderHealth(){
  normalizeHealthState();
  const steps=Number(S.health.steps)||0;
  const entries=getTodayHealthEntries();
  const totalMin=entries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const dom=dominantIntensity(entries);
  const diary=getTodayHealthDiary();
  const week=healthSummaryForKeys(healthWeekKeys());
  const month=healthSummaryForKeys(healthMonthKeys());

  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
  set('hSteps',steps.toLocaleString('pt-BR'));
  set('hActMin',totalMin);
  set('hActN',entries.length);
  set('hScore',healthScore());
  const intensityEl=document.getElementById('hIntensity');
  if(intensityEl)intensityEl.textContent=dom==='—'?'—':healthIntensityLabel(dom);
  const stepsInp=document.getElementById('stepsInp');
  if(stepsInp)stepsInp.value=steps||'';
  renderHealthActivityChips();
  renderHealthCheckin(diary);
  renderHealthHistory(week,month);
  renderHealthLog(entries);
}
function renderHealthActivityChips(){
  const box=$('healthActivityChips');
  if(!box)return;
  box.innerHTML=(DEFAULT_HEALTH_ACTIVITIES||[]).map(a=>`<button onclick="setHealthActivityName('${unioEscape(a)}')">${unioEscape(a)}</button>`).join('');
}
function renderHealthCheckin(diary){
  const weight=$('healthWeightInp');
  const mood=$('healthMoodInp');
  const energy=$('healthEnergyInp');
  const pain=$('healthPainInp');
  const note=$('healthDiaryNoteInp');
  if(weight && !weight.matches(':focus'))weight.value=diary?.weight||'';
  if(mood)mood.value=diary?.mood||'neutral';
  if(energy)energy.value=diary?.energy||3;
  if(pain)pain.value=diary?.pain||0;
  if(note && !note.matches(':focus'))note.value=diary?.note||'';
}
function renderHealthHistory(week,month){
  const box=$('healthHistoryBox');
  if(!box)return;
  const lastWeights=(S.health.weightLog||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,2);
  const weightTrend=lastWeights.length>=2?Number(lastWeights[0].weight-lastWeights[1].weight).toFixed(1):'—';
  box.innerHTML=`
    <div class="health-history-grid">
      <div><span>Semana</span><strong>${week.minutes} min</strong><em>${week.daysWithActivity} dias ativos</em></div>
      <div><span>Mês</span><strong>${month.minutes} min</strong><em>${month.entries.length} atividades</em></div>
      <div><span>Energia média</span><strong>${week.energy||'—'}</strong><em>últimos 7 dias</em></div>
      <div><span>Peso</span><strong>${lastWeights[0]?.weight?`${lastWeights[0].weight} kg`:'—'}</strong><em>${weightTrend==='—'?'sem tendência':`${weightTrend} kg`}</em></div>
    </div>
    <div class="health-mini-bars">${healthWeekKeys().map(k=>{
      const mins=getHealthEntriesByRange([k]).reduce((a,x)=>a+(Number(x.min)||0),0);
      const pct=Math.min(100,Math.round(mins/60*100));
      return `<div><span style="height:${Math.max(5,pct)}%"></span><em>${DS[keyToDate(k).getDay()][0]}</em></div>`;
    }).join('')}</div>`;
}
function renderHealthLog(entries){
  const log=document.getElementById('actLog');
  const em=document.getElementById('actEmpty');
  if(!log||!em)return;
  log.querySelectorAll('.act-item').forEach(e=>e.remove());
  em.style.display=entries.length?'none':'block';
  entries.forEach(a=>{
    const d=document.createElement('div');
    d.className='act-item v16';
    const note=a.note?`<div class="act-note">${unioEscape(a.note)}</div>`:'';
    const time=a.time?` · ${a.time}`:'';
    const minText=a.min?`${a.min} min · `:'';
    d.innerHTML=`
      <div style="flex:1;min-width:0;">
        <div class="act-nm">${unioEscape(a.name)}</div>
        <div class="act-det">${minText}${healthIntensityIcon(a.intensity)} ${healthIntensityLabel(a.intensity)}${unioEscape(time)}</div>
        ${note}
      </div>
      <div class="act-actions"><button onclick="editHealthEntry(${a.id})">Editar</button><button class="act-rm" onclick="rmAct(${a.id})">×</button></div>`;
    log.appendChild(d);
  });
}
