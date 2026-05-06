/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOCUS — foco e bem-estar
   - presets completos
   - sessão personalizada
   - histórico, notas e métricas
   - sequência de dias com foco
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function normalizeFocusState(){
  if(!S.focus)S.focus={type:25,brkType:5,running:false,onBreak:false,remaining:25*60,sessions:0,iv:null,preset:'pomodoro',logs:[],startedAt:null,currentStartedAt:null,custom:{focus:30,break:5}};
  if(!Array.isArray(S.focus.logs))S.focus.logs=[];
  if(!S.focus.custom)S.focus.custom={focus:30,break:5};
  if(!S.focus.type)S.focus.type=25;
  if(!S.focus.brkType)S.focus.brkType=5;
  if(!S.focus.remaining)S.focus.remaining=S.focus.type*60;
  if(!S.focus.preset)S.focus.preset='pomodoro';
  S.focus.logs=S.focus.logs.map((l,i)=>({
    id:l.id||Date.now()+i,
    date:l.date||dayKey(new Date(l.endedAt||l.createdAt||Date.now())),
    duration:Number(l.duration)||Number(l.minutes)||S.focus.type||25,
    focusLevel:Number(l.focusLevel)||3,
    distraction:Number(l.distraction)||1,
    note:l.note||'',
    label:l.label||'Sessão de foco',
    startedAt:l.startedAt||l.createdAt||Date.now(),
    endedAt:l.endedAt||l.createdAt||Date.now(),
    completed:l.completed!==false
  })).sort((a,b)=>(b.endedAt||0)-(a.endedAt||0));
  S.focus.sessions=focusTodayLogs().length;
}
function focusTodayKey(){return dayKey(new Date());}
function focusTodayLogs(){
  const k=focusTodayKey();
  return (S.focus?.logs||[]).filter(l=>l.date===k&&l.completed!==false);
}
function focusWeekKeys(){return weekKeys(focusTodayKey());}
function focusLogsForDate(k){return (S.focus?.logs||[]).filter(l=>l.date===k&&l.completed!==false);}
function focusWeekLogs(){
  const set=new Set(focusWeekKeys());
  return (S.focus?.logs||[]).filter(l=>set.has(l.date)&&l.completed!==false);
}
function focusMinutes(logs=focusTodayLogs()){
  return logs.reduce((a,l)=>a+Number(l.duration||0),0);
}
function focusStreak(){
  normalizeFocusStateSoft();
  let streak=0;
  const today=new Date();
  for(let i=0;i<365;i++){
    const k=dayKey(addDays(today,-i));
    const count=focusLogsForDate(k).length;
    if(count>0)streak++;
    else if(i===0)continue;
    else break;
  }
  return streak;
}
function normalizeFocusStateSoft(){
  if(!S.focus)S.focus={type:25,brkType:5,running:false,onBreak:false,remaining:25*60,sessions:0,iv:null,preset:'pomodoro',logs:[],startedAt:null,currentStartedAt:null,custom:{focus:30,break:5}};
  if(!Array.isArray(S.focus.logs))S.focus.logs=[];
  if(!S.focus.custom)S.focus.custom={focus:30,break:5};
}
function focusPresetById(id){
  return (DEFAULT_FOCUS_PRESETS||[]).find(p=>p.id===id)||DEFAULT_FOCUS_PRESETS[0];
}
function setFocusPreset(id){
  if(S.focus.running)return;
  const p=focusPresetById(id);
  S.focus.preset=p.id;
  S.focus.type=p.focus;
  S.focus.brkType=p.break;
  S.focus.onBreak=false;
  S.focus.remaining=p.focus*60;
  renderFocusTimer();
  renderFocusPresets();
  saveState?.();
  haptic('light');
}
function applyCustomFocus(){
  if(S.focus.running)return;
  const f=clamp(parseInt($('focusCustomMin')?.value)||30,1,180);
  const b=clamp(parseInt($('focusCustomBreak')?.value)||5,1,60);
  S.focus.custom={focus:f,break:b};
  S.focus.preset='custom';
  S.focus.type=f;
  S.focus.brkType=b;
  S.focus.onBreak=false;
  S.focus.remaining=f*60;
  renderFocusTimer();
  renderFocusPresets();
  saveState?.();
  showToast('Sessão personalizada aplicada','🎯');
}
function setFocusType(min,el){
  if(S.focus.running)return;
  S.focus.type=min;
  S.focus.remaining=min*60;
  S.focus.preset='manual';
  document.querySelectorAll('.focus-type-btn').forEach(b=>b.classList.remove('sel'));
  el?.classList.add('sel');
  renderFocusTimer();
  renderFocusPresets();
}
function setBreakType(min,el){
  if(S.focus.running)return;
  S.focus.brkType=min;
  document.querySelectorAll('.focus-brk-btn').forEach(b=>b.classList.remove('sel'));
  el?.classList.add('sel');
  renderFocusTimer();
  renderFocusPresets();
}
function toggleFocus(){
  normalizeFocusState();
  const btn=document.getElementById('fBtn');
  if(S.focus.running){
    clearInterval(S.focus.iv);
    S.focus.running=false;
    if(btn){btn.textContent='▶ Retomar';btn.style.background='var(--orange)';}
    saveState?.();
    return;
  }
  S.focus.running=true;
  if(!S.focus.currentStartedAt)S.focus.currentStartedAt=Date.now();
  if(!S.focus.startedAt)S.focus.startedAt=Date.now();
  if(btn){btn.textContent='⏸ Pausar';btn.style.background='var(--pink)';}
  clearInterval(S.focus.iv);
  S.focus.iv=setInterval(tickFocus,1000);
  saveState?.();
}
function tickFocus(){
  if(!S.focus.running)return;
  S.focus.remaining=Math.max(0,(Number(S.focus.remaining)||0)-1);
  renderFocusTimer();
  if(S.focus.remaining<=0){
    clearInterval(S.focus.iv);
    S.focus.running=false;
    beep();
    if(!S.focus.onBreak){
      const sessionId=completeFocusSession();
      S.focus.onBreak=true;
      S.focus.remaining=S.focus.brkType*60;
      const mode=document.getElementById('fModeLbl'),btn=document.getElementById('fBtn'),ring=document.getElementById('fRing');
      if(mode)mode.textContent='Pausa ☕';
      if(btn){btn.textContent='▶ Iniciar pausa';btn.style.background='var(--teal)';}
      if(ring)ring.style.stroke='var(--teal)';
      setTimeout(()=>reviewFocusSession(sessionId),450);
    }else{
      S.focus.onBreak=false;
      S.focus.remaining=S.focus.type*60;
      S.focus.currentStartedAt=null;
      S.focus.startedAt=null;
      const mode=document.getElementById('fModeLbl'),btn=document.getElementById('fBtn'),ring=document.getElementById('fRing');
      if(mode)mode.textContent='Foco 🎯';
      if(btn){btn.textContent='▶ Iniciar foco';btn.style.background='var(--pink)';}
      if(ring)ring.style.stroke='var(--pink)';
    }
    renderFocusTimer();
    commitFocus();
  }
}
function completeFocusSession(){
  normalizeFocusStateSoft();
  const now=Date.now();
  const duration=Number(S.focus.type)||25;
  const id=now;
  const preset=S.focus.preset==='custom'?'Personalizado':(focusPresetById(S.focus.preset)?.label||'Foco');
  S.focus.logs.unshift({
    id,
    date:focusTodayKey(),
    duration,
    focusLevel:3,
    distraction:1,
    note:'',
    label:preset,
    startedAt:S.focus.currentStartedAt||S.focus.startedAt||now-duration*60000,
    endedAt:now,
    completed:true
  });
  S.focus.sessions=focusTodayLogs().length;
  S.focus.currentStartedAt=null;
  showToast('Sessão de foco concluída','🎯');
  haptic('success');
  return id;
}
function reviewFocusSession(id){
  const log=(S.focus.logs||[]).find(l=>String(l.id)===String(id));
  if(!log)return;
  openEditModal({
    title:'Revisar sessão',
    subtitle:`${log.duration} minutos de foco concluídos.`,
    fields:[
      {name:'focusLevel',label:'Nível de foco',type:'select',value:log.focusLevel||3,options:DEFAULT_FOCUS_LEVELS.map(x=>({value:x.id,label:x.label}))},
      {name:'distraction',label:'Distração',type:'select',value:log.distraction||1,options:[
        {value:0,label:'Nenhuma'},
        {value:1,label:'Baixa'},
        {value:2,label:'Média'},
        {value:3,label:'Alta'}
      ]},
      {name:'note',label:'O que você fez?',value:log.note||'',placeholder:'Ex: estudei contabilidade, revisei planilha...'}
    ],
    onSave(values){
      log.focusLevel=Number(values.focusLevel)||3;
      log.distraction=Number(values.distraction)||0;
      log.note=String(values.note||'').trim();
      log.updatedAt=Date.now();
      commitFocus('Sessão revisada');
    }
  });
}
function editFocusLog(id){reviewFocusSession(id);}
function deleteFocusLog(id){
  if(!confirm('Excluir esta sessão de foco?'))return;
  S.focus.logs=(S.focus.logs||[]).filter(l=>String(l.id)!==String(id));
  commitFocus();
}
function resetFocus(){
  clearInterval(S.focus.iv);
  S.focus.running=false;
  S.focus.onBreak=false;
  S.focus.remaining=S.focus.type*60;
  S.focus.currentStartedAt=null;
  S.focus.startedAt=null;
  const btn=document.getElementById('fBtn'),mode=document.getElementById('fModeLbl'),ring=document.getElementById('fRing');
  if(btn){btn.textContent='▶ Iniciar';btn.style.background='var(--pink)';}
  if(mode)mode.textContent='Foco';
  if(ring)ring.style.stroke='var(--pink)';
  renderFocusTimer();
  saveState?.();
}
function skipBreak(){
  if(!S.focus.onBreak)return;
  clearInterval(S.focus.iv);
  S.focus.running=false;
  S.focus.onBreak=false;
  S.focus.remaining=S.focus.type*60;
  S.focus.currentStartedAt=null;
  const btn=document.getElementById('fBtn'),mode=document.getElementById('fModeLbl'),ring=document.getElementById('fRing');
  if(btn){btn.textContent='▶ Iniciar foco';btn.style.background='var(--pink)';}
  if(mode)mode.textContent='Foco 🎯';
  if(ring)ring.style.stroke='var(--pink)';
  renderFocusTimer();
  saveState?.();
}
function commitFocus(message){
  normalizeFocusState();
  renderFocusTimer();
  renderFocusStats();
  renderFocusHistory();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'🎯',1800);
}
function renderFocusTimer(){
  normalizeFocusStateSoft();
  const rem=Math.max(0,Number(S.focus.remaining)||0);
  const total=Math.max(1,(S.focus.onBreak?S.focus.brkType:S.focus.type)*60);
  const fTime=document.getElementById('fTime');
  if(fTime)fTime.textContent=String(Math.floor(rem/60)).padStart(2,'0')+':'+String(rem%60).padStart(2,'0');
  const ring=document.getElementById('fRing');
  if(ring)ring.style.strokeDashoffset=553*(1-rem/total);
  const sessions=document.getElementById('fSessions');
  if(sessions)sessions.textContent=focusTodayLogs().length;
  const mode=document.getElementById('fModeLbl');
  if(mode)mode.textContent=S.focus.onBreak?'Pausa ☕':'Foco 🎯';
  renderFocusStats();
  renderFocusHistory();
  renderFocusPresets();
}
function renderFocusPresets(){
  const box=$('focusPresetBox');
  if(!box)return;
  const customActive=S.focus.preset==='custom';
  box.innerHTML=(DEFAULT_FOCUS_PRESETS||[]).map(p=>`<button class="focus-preset-btn ${S.focus.preset===p.id?'on':''}" onclick="setFocusPreset('${p.id}')"><span>${p.emoji}</span><strong>${p.label}</strong><em>${p.focus}/${p.break} min</em></button>`).join('')+
  `<button class="focus-preset-btn ${customActive?'on':''}" onclick="applyCustomFocus()"><span>⚙️</span><strong>Personalizado</strong><em>${S.focus.custom?.focus||30}/${S.focus.custom?.break||5} min</em></button>`;
}
function renderFocusStats(){
  normalizeFocusStateSoft();
  const today=focusTodayLogs();
  const week=focusWeekLogs();
  const minutesToday=focusMinutes(today);
  const minutesWeek=focusMinutes(week);
  const avgFocus=today.length?Math.round(today.reduce((a,l)=>a+Number(l.focusLevel||0),0)/today.length*10)/10:0;
  const set=(id,val)=>{const el=$(id);if(el)el.textContent=val;};
  set('focusTodayMin',minutesToday+'m');
  set('focusTodaySessions',today.length);
  set('focusWeekMin',minutesWeek+'m');
  set('focusStreak',focusStreak()+'d');
  set('focusAvgLevel',avgFocus?avgFocus+'/5':'—');
  const box=$('focusWeekBox');
  if(box){
    const keys=focusWeekKeys();
    box.innerHTML=`<div class="focus-week-grid">${keys.map(k=>{
      const logs=focusLogsForDate(k);
      const mins=focusMinutes(logs);
      const pct=Math.min(100,Math.round(mins/120*100));
      const d=keyToDate(k);
      return `<div class="${logs.length?'hit':''}"><strong>${DS[d.getDay()]}</strong><div class="focus-week-bar"><span style="height:${Math.max(4,pct)}%"></span></div><em>${mins}m</em></div>`;
    }).join('')}</div>`;
  }
}
function renderFocusHistory(){
  const list=$('focusHistory');
  if(!list)return;
  const logs=(S.focus.logs||[]).slice(0,12);
  list.innerHTML=logs.length?logs.map(l=>{
    const d=keyToDate(l.date);
    const note=l.note?`<div class="focus-log-note">${unioEscape(l.note)}</div>`:'';
    return `<div class="focus-log-item">
      <div style="min-width:0;flex:1;">
        <strong>${unioEscape(l.label||'Sessão de foco')} · ${l.duration} min</strong>
        <span>${DS[d.getDay()]}, ${d.getDate()} de ${MS[d.getMonth()]} · foco ${l.focusLevel}/5 · distração ${l.distraction}</span>
        ${note}
      </div>
      <div class="focus-log-actions"><button onclick="editFocusLog(${l.id})">Editar</button><button onclick="deleteFocusLog(${l.id})">×</button></div>
    </div>`;
  }).join(''):'<div class="empty"><em>🎯</em>Nenhuma sessão registrada ainda.</div>';
}
function beep(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.8);o.start();o.stop(ctx.currentTime+0.8);}catch(e){}}
