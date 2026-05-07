/* Unio Base Organizada v25 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   WATER — hidratação completa
   - meta personalizada e sugestão por peso
   - presets editáveis
   - registro manual
   - edição/exclusão de registros
   - histórico semanal e sequência
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function waterTodayKey(){return dayKey(new Date());}
function normalizeWaterState(){
  if(!S.water)S.water={amt:0,goal:DEFAULT_WATER_GOAL,log:[],history:{},presets:DEFAULT_WATER_PRESETS.slice()};
  if(!Array.isArray(S.water.log))S.water.log=[];
  if(!S.water.history||typeof S.water.history!=='object')S.water.history={};
  if(!Array.isArray(S.water.presets)||!S.water.presets.length)S.water.presets=DEFAULT_WATER_PRESETS.slice();
  S.water.goal=Number(S.water.goal)||DEFAULT_WATER_GOAL;
  const today=waterTodayKey();
  S.water.log=S.water.log.map((it,i)=>({
    id:it.id||Date.now()+i,
    ml:Number(it.ml)||0,
    time:it.time||new Date().toISOString(),
    date:it.date||today
  })).filter(it=>it.ml>0);
  S.water.amt=waterDayAmount(today);
  waterArchiveDay(today);
}
function waterParseAmount(value){
  const n=Number(String(value||'').replace(/\./g,'').replace(',','.'));
  return Number.isFinite(n)?Math.round(n):0;
}
function waterSuggestedGoal(){
  const kg=Number(S.weight)||70;
  return Math.round((kg*WATER_GOAL_ML_PER_KG)/50)*50;
}
function waterArchiveDay(dateKey){
  if(!dateKey)return;
  const items=(S.water.log||[]).filter(it=>(it.date||waterTodayKey())===dateKey);
  const amt=items.reduce((a,it)=>a+Number(it.ml||0),0);
  const current=S.water.history?.[dateKey]||{};
  S.water.history[dateKey]={
    date:dateKey,
    amt,
    goal:Number(current.goal||S.water.goal||DEFAULT_WATER_GOAL),
    count:items.length,
    hit:amt>=Number(current.goal||S.water.goal||DEFAULT_WATER_GOAL),
    updatedAt:Date.now()
  };
}
function waterDayAmount(dateKey){
  return (S.water.log||[]).filter(it=>(it.date||waterTodayKey())===dateKey).reduce((a,it)=>a+Number(it.ml||0),0);
}
function waterSummaryForDate(dateKey){
  normalizeWaterStateSoft();
  if(dateKey===waterTodayKey())waterArchiveDay(dateKey);
  const h=S.water.history?.[dateKey];
  if(h)return h;
  return {date:dateKey,amt:0,goal:S.water.goal,count:0,hit:false};
}
function normalizeWaterStateSoft(){
  if(!S.water)S.water={amt:0,goal:DEFAULT_WATER_GOAL,log:[],history:{},presets:DEFAULT_WATER_PRESETS.slice()};
  if(!Array.isArray(S.water.log))S.water.log=[];
  if(!S.water.history||typeof S.water.history!=='object')S.water.history={};
  if(!Array.isArray(S.water.presets)||!S.water.presets.length)S.water.presets=DEFAULT_WATER_PRESETS.slice();
  S.water.goal=Number(S.water.goal)||DEFAULT_WATER_GOAL;
}
function waterWeekKeys(){return weekKeys(waterTodayKey());}
function waterWeekSummary(){
  const keys=waterWeekKeys();
  const days=keys.map(k=>waterSummaryForDate(k));
  const avg=days.length?Math.round(days.reduce((a,d)=>a+Number(d.amt||0),0)/days.length):0;
  const hits=days.filter(d=>d.hit).length;
  const total=days.reduce((a,d)=>a+Number(d.amt||0),0);
  return {keys,days,avg,hits,total};
}
function waterStreak(){
  normalizeWaterStateSoft();
  let streak=0;
  const today=new Date();
  for(let i=0;i<365;i++){
    const k=dayKey(addDays(today,-i));
    const s=waterSummaryForDate(k);
    if(s.hit)streak++;
    else if(i===0 && s.amt===0)continue;
    else break;
  }
  return streak;
}
function waterNeed(){
  return Math.max(0,(Number(S.water.goal)||DEFAULT_WATER_GOAL)-(Number(S.water.amt)||0));
}
function waterPct(){
  const goal=Number(S.water.goal)||DEFAULT_WATER_GOAL;
  return goal?Math.min(100,Math.round((Number(S.water.amt)||0)/goal*100)):0;
}
function toggleCustomCupSave(){const t=$('cwSaveToggle');if(t)t.classList.toggle('on');}
function addWater(ml){
  normalizeWaterStateSoft();
  ml=waterParseAmount(ml);
  if(ml<=0)return;
  haptic('light');
  const today=waterTodayKey();
  S.water.log.unshift({id:Date.now(),ml,time:new Date().toISOString(),date:today});
  S.water.amt=waterDayAmount(today);
  waterArchiveDay(today);
  commitWater();
  if(S.water.amt>=S.water.goal&&S.water.amt-ml<S.water.goal){showBadge('Meta de água atingida!','Parabéns! 💧','🎯');}
}
function addWP(i){addWater(S.water.presets[i]);}
function addManualWater(){
  const v=waterParseAmount($('waterManualInp')?.value);
  if(v<=0){showToast('Informe uma quantidade válida');return;}
  addWater(v);
  if($('waterManualInp'))$('waterManualInp').value='';
}
function addCustomW(){
  const v=waterParseAmount($('cwInp')?.value);
  if(v<=0)return;
  const saveCup=$('cwSaveToggle')?.classList.contains('on');
  if(saveCup&&!S.water.presets.includes(v)){
    S.water.presets.push(v);
    S.water.presets=S.water.presets.filter(x=>x>0).slice(0,12);
    showToast('Copo salvo como botão rápido','💧');
  }
  addWater(v);
  $('cwInp').value='';
  closeModal('customWater');
  renderWater();
}
function editWaterPreset(i){
  normalizeWaterStateSoft();
  const old=S.water.presets[i];
  openEditModal({
    title:'Editar copo rápido',
    subtitle:'Ajuste a quantidade do botão.',
    fields:[{name:'ml',label:'Quantidade em ml',type:'number',value:old||250,inputmode:'numeric'}],
    onSave(values){
      const ml=waterParseAmount(values.ml);
      if(ml<=0){showToast('Quantidade inválida');return false;}
      S.water.presets[i]=ml;
      S.water.presets=[...new Set(S.water.presets.filter(x=>x>0))].slice(0,12);
      commitWater('Copo rápido atualizado');
    }
  });
}
function addWaterPreset(){
  const ml=waterParseAmount($('waterPresetInp')?.value);
  if(ml<=0){showToast('Informe uma quantidade válida');return;}
  normalizeWaterStateSoft();
  if(!S.water.presets.includes(ml))S.water.presets.push(ml);
  S.water.presets=[...new Set(S.water.presets.filter(x=>x>0))].slice(0,12);
  if($('waterPresetInp'))$('waterPresetInp').value='';
  commitWater('Preset adicionado');
}
function removeWaterPreset(i){
  normalizeWaterStateSoft();
  if(S.water.presets.length<=1){showToast('Mantenha pelo menos um preset');return;}
  const ml=S.water.presets[i];
  S.water.presets.splice(i,1);
  showToast(`Copo de ${ml}ml removido`,'');
  commitWater();
}
function removeWater(i){
  normalizeWaterStateSoft();
  const item=S.water.log[i];
  if(!item)return;
  S.water.log.splice(i,1);
  S.water.amt=waterDayAmount(waterTodayKey());
  waterArchiveDay(item.date||waterTodayKey());
  commitWater();
}
function editWaterLog(i){
  normalizeWaterStateSoft();
  const item=S.water.log[i];
  if(!item)return;
  const tm=item.time instanceof Date?item.time:new Date(item.time);
  const time=`${String(tm.getHours()).padStart(2,'0')}:${String(tm.getMinutes()).padStart(2,'0')}`;
  openEditModal({
    title:'Editar registro de água',
    subtitle:'Ajuste quantidade e horário.',
    fields:[
      {name:'ml',label:'Quantidade em ml',type:'number',value:item.ml,inputmode:'numeric'},
      {name:'time',label:'Horário',type:'time',value:time}
    ],
    onSave(values){
      const ml=waterParseAmount(values.ml);
      if(ml<=0){showToast('Quantidade inválida');return false;}
      item.ml=ml;
      if(values.time){
        const [h,m]=values.time.split(':').map(Number);
        const d=new Date(item.time||Date.now());
        d.setHours(h||0,m||0,0,0);
        item.time=d.toISOString();
      }
      S.water.amt=waterDayAmount(waterTodayKey());
      waterArchiveDay(item.date||waterTodayKey());
      commitWater('Registro atualizado');
    }
  });
}
function saveGoal(){
  const v=waterParseAmount($('goalInp')?.value);
  if(v>0){
    S.water.goal=v;
    waterArchiveDay(waterTodayKey());
    commitWater('Meta de hidratação salva');
  }
  closeModal('goalModal');
}
function applySuggestedWaterGoal(){
  const v=waterSuggestedGoal();
  if($('goalInp'))$('goalInp').value=v;
}
function commitWater(message){
  normalizeWaterStateSoft();
  S.water.amt=waterDayAmount(waterTodayKey());
  waterArchiveDay(waterTodayKey());
  renderWater();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'💧',1800);
}
function renderWater(){
  normalizeWaterState();
  const{amt,goal,log}=S.water;
  const pct=waterPct(),col=pct>=100?'#34C759':'#5AC8FA';
  const wAmt=$('wAmt'); if(wAmt)wAmt.textContent=amt;
  const wGoalT=$('wGoalT'); if(wGoalT)wGoalT.textContent='de '+goal+'ml';
  const wGoalD=$('wGoalD'); if(wGoalD)wGoalD.textContent=goal+' ml';
  const wPct=$('wPct'); if(wPct)wPct.textContent=pct+'%';
  const wNeed=$('wNeed'); if(wNeed)wNeed.textContent=waterNeed()+'ml';
  const wStreak=$('wStreak'); if(wStreak)wStreak.textContent=waterStreak();
  const r=$('wRing');
  if(r){r.style.strokeDashoffset=490*(1-Math.min(pct/100,1));r.style.stroke=col;}
  if(wAmt)wAmt.style.color=col;
  const suggested=waterSuggestedGoal();
  const sug=$('waterSuggestedGoal'); if(sug)sug.textContent=`Sugestão pelo peso atual: ${suggested}ml`;
  const row=$('waterPresetRow');
  if(row){
    row.innerHTML=S.water.presets.map((ml,i)=>`<div class="water-preset v19">
      <button class="qa-btn" onclick="addWP(${i})">+${ml}ml</button>
      <div class="wp-actions"><button onclick="editWaterPreset(${i})">✎</button><button onclick="removeWaterPreset(${i})">×</button></div>
    </div>`).join('');
  }
  renderWaterWeek();
  renderWaterPresetsManager();
  renderWaterLog();
}
function renderWaterPresetsManager(){
  const box=$('waterPresetManager');
  if(!box)return;
  box.innerHTML=`<div class="water-preset-list">${S.water.presets.map((ml,i)=>`<span>${ml}ml <button onclick="editWaterPreset(${i})">editar</button></span>`).join('')}</div>
  <div class="water-preset-add"><input class="field" id="waterPresetInp" inputmode="numeric" placeholder="Novo preset em ml"><button onclick="addWaterPreset()">Adicionar</button></div>`;
}
function renderWaterWeek(){
  const box=$('waterWeekBox');
  if(!box)return;
  const wk=waterWeekSummary();
  box.innerHTML=`<div class="water-week-grid">${wk.days.map(d=>{
    const pct=d.goal?Math.min(100,Math.round(d.amt/d.goal*100)):0;
    const date=keyToDate(d.date);
    return `<div class="${d.hit?'hit':''}">
      <strong>${DS[date.getDay()]}</strong>
      <div class="water-week-bar"><span style="height:${Math.max(4,pct)}%"></span></div>
      <em>${Math.round(d.amt/100)/10}L</em>
    </div>`;
  }).join('')}</div>
  <div class="water-week-summary">
    <div><span>Média</span><strong>${wk.avg}ml</strong></div>
    <div><span>Dias na meta</span><strong>${wk.hits}/7</strong></div>
    <div><span>Total</span><strong>${Math.round(wk.total/100)/10}L</strong></div>
  </div>`;
}
function renderWaterLog(){
  const logEl=$('wLog'),em=$('wEmpty');
  if(!logEl||!em)return;
  logEl.querySelectorAll('.w-log-item').forEach(e=>e.remove());
  const today=waterTodayKey();
  const todayLog=(S.water.log||[]).filter(it=>(it.date||today)===today);
  em.style.display=todayLog.length?'none':'block';
  todayLog.forEach((it,i)=>{
    const globalIndex=S.water.log.findIndex(x=>x.id===it.id);
    const d=document.createElement('div');
    d.className='w-log-item v19';
    const tm=it.time instanceof Date?it.time:new Date(it.time);
    const hh=String(tm.getHours()).padStart(2,'0'),mm=String(tm.getMinutes()).padStart(2,'0');
    d.innerHTML=`<div style="display:flex;align-items:center;min-width:0;"><div class="w-dot"></div><span style="font-size:15px;font-weight:700;">${it.ml}ml</span></div>
    <div class="water-log-actions"><span>${hh}:${mm}</span><button onclick="editWaterLog(${globalIndex})">Editar</button><button class="w-del" onclick="removeWater(${globalIndex})">×</button></div>`;
    logEl.appendChild(d);
  });
}


/* ━━━━ V25 — WATER UX CLEANUP / PRESETS LIMPOS ━━━━ */
function waterEnsureUi(){
  if(!S.water.ui)S.water.ui={managePresets:false};
}
function toggleWaterPresetManager(){
  normalizeWaterStateSoft();
  waterEnsureUi();
  S.water.ui.managePresets=!S.water.ui.managePresets;
  renderWaterPresetsManager();
  saveState?.();
}
function waterOpenActionSheet(title,actions=[]){
  waterCloseActionSheet();
  window.__unioWaterActions=actions;
  const overlay=document.createElement('div');
  overlay.className='finance-action-modal water-action-modal';
  overlay.id='waterActionModal';
  overlay.onclick=ev=>{if(ev.target===overlay)waterCloseActionSheet();};
  overlay.innerHTML=`<div class="finance-action-card">
    <div class="finance-action-head">
      <div><strong>${unioEscape(title)}</strong><span>Escolha uma ação</span></div>
      <button onclick="waterCloseActionSheet()">×</button>
    </div>
    <div class="finance-action-list">
      ${actions.map((a,i)=>`<button class="${a.tone||''}" onclick="waterRunAction(${i})"><span>${a.ico||'💧'}</span><div><strong>${unioEscape(a.label)}</strong>${a.sub?`<em>${unioEscape(a.sub)}</em>`:''}</div></button>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}
function waterRunAction(i){
  const action=window.__unioWaterActions?.[i];
  waterCloseActionSheet();
  if(action&&typeof action.run==='function')action.run();
}
function waterCloseActionSheet(){
  document.getElementById('waterActionModal')?.remove();
  window.__unioWaterActions=null;
}
function waterPresetActions(i){
  const ml=S.water.presets[i];
  waterOpenActionSheet(`${ml}ml`,[
    {ico:'💧',label:`Adicionar ${ml}ml`,run:()=>addWP(i)},
    {ico:'✏️',label:'Editar copo rápido',run:()=>editWaterPreset(i)},
    {ico:'🗑️',label:'Excluir copo rápido',tone:'danger',run:()=>removeWaterPreset(i)}
  ]);
}
function waterLogActions(globalIndex){
  const item=S.water.log?.[globalIndex];
  waterOpenActionSheet(item?`${item.ml}ml`:'Registro',[
    {ico:'✏️',label:'Editar registro',run:()=>editWaterLog(globalIndex)},
    {ico:'🗑️',label:'Excluir registro',tone:'danger',run:()=>removeWater(globalIndex)}
  ]);
}
function renderWater(){
  normalizeWaterState();
  waterEnsureUi();
  const{amt,goal}=S.water;
  const pct=waterPct(),col=pct>=100?'#34C759':'#5AC8FA';
  const wAmt=$('wAmt'); if(wAmt)wAmt.textContent=amt;
  const wGoalT=$('wGoalT'); if(wGoalT)wGoalT.textContent='de '+goal+'ml';
  const wGoalD=$('wGoalD'); if(wGoalD)wGoalD.textContent=goal+' ml';
  const wPct=$('wPct'); if(wPct)wPct.textContent=pct+'%';
  const wNeed=$('wNeed'); if(wNeed)wNeed.textContent=waterNeed()+'ml';
  const wStreak=$('wStreak'); if(wStreak)wStreak.textContent=waterStreak();
  const r=$('wRing');
  if(r){r.style.strokeDashoffset=490*(1-Math.min(pct/100,1));r.style.stroke=col;}
  if(wAmt)wAmt.style.color=col;
  const suggested=waterSuggestedGoal();
  const sug=$('waterSuggestedGoal'); if(sug)sug.textContent=`Sugestão pelo peso atual: ${suggested}ml`;
  const row=$('waterPresetRow');
  if(row){
    row.innerHTML=S.water.presets.map((ml,i)=>`<button class="water-chip-v25" onclick="addWP(${i})" oncontextmenu="event.preventDefault();waterPresetActions(${i})">+${ml}ml</button>`).join('');
  }
  renderWaterWeek();
  renderWaterPresetsManager();
  renderWaterLog();
}
function renderWaterPresetsManager(){
  const box=$('waterPresetManager');
  if(!box)return;
  waterEnsureUi();
  const opened=!!S.water.ui.managePresets;
  box.innerHTML=`<button class="water-manage-toggle" onclick="toggleWaterPresetManager()">${opened?'Fechar ajustes':'Gerenciar copos rápidos'}</button>
  ${opened?`<div class="water-manage-panel">
    <div class="water-preset-list">${S.water.presets.map((ml,i)=>`<span>${ml}ml <button onclick="waterPresetActions(${i})">Ações</button></span>`).join('')}</div>
    <div class="water-preset-add"><input class="field" id="waterPresetInp" inputmode="numeric" placeholder="Novo copo em ml"><button onclick="addWaterPreset()">Adicionar</button></div>
  </div>`:''}`;
}
function renderWaterLog(){
  const logEl=$('wLog'),em=$('wEmpty');
  if(!logEl||!em)return;
  logEl.querySelectorAll('.w-log-item').forEach(e=>e.remove());
  const today=waterTodayKey();
  const todayLog=(S.water.log||[]).filter(it=>(it.date||today)===today);
  em.style.display=todayLog.length?'none':'block';
  todayLog.forEach((it)=>{
    const globalIndex=S.water.log.findIndex(x=>x.id===it.id);
    const d=document.createElement('div');
    d.className='w-log-item v25';
    const tm=it.time instanceof Date?it.time:new Date(it.time);
    const hh=String(tm.getHours()).padStart(2,'0'),mm=String(tm.getMinutes()).padStart(2,'0');
    d.innerHTML=`<div style="display:flex;align-items:center;min-width:0;"><div class="w-dot"></div><span style="font-size:15px;font-weight:700;">${it.ml}ml</span></div>
    <div class="water-log-actions"><span>${hh}:${mm}</span><button onclick="waterLogActions(${globalIndex})">Ações</button></div>`;
    logEl.appendChild(d);
  });
}
