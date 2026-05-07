/* Unio Base Organizada v26 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SONO — módulo completo
   - duração automática
   - qualidade, meta, dívida e consistência
   - cochilos
   - histórico semanal/mensal
   - edição por modal interno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let selQual=3;

function sleepNormalizeTime(value,fallback='00:00'){
  return /^\d{2}:\d{2}$/.test(String(value||''))?value:fallback;
}
function sleepMinutesFromTime(value){
  const [h,m]=sleepNormalizeTime(value).split(':').map(Number);
  return h*60+m;
}
function sleepDurationMinutes(bed,wake){
  let mins=sleepMinutesFromTime(wake)-sleepMinutesFromTime(bed);
  if(mins<=0)mins+=1440;
  return mins;
}
function sleepHoursFromMinutes(mins){
  return Math.round((Number(mins)||0)/6)/10;
}
function sleepDateLabel(key){
  if(!key)return 'Sem data';
  const d=keyToDate(key);
  return `${DS[d.getDay()]}, ${d.getDate()} de ${MS[d.getMonth()]}`;
}
function sleepQualMeta(q){
  return (DEFAULT_SLEEP_QUALITIES||[]).find(x=>Number(x.id)===Number(q))||DEFAULT_SLEEP_QUALITIES[2];
}
function qualEmoji(q){return sleepQualMeta(q).emoji||'😐';}
function qualColor(q){
  const cols=['','#FF453A','#FF9F0A','#FFD60A','#34C759','#BF5AF2'];
  return cols[Number(q)]||'var(--lbl2)';
}
function sleepGoal(){
  return Number(S.sleepGoal)||DEFAULT_SLEEP_GOAL||8;
}
function sleepEntryMinutes(entry){
  if(entry.type==='nap')return Number(entry.minutes)||Math.round((Number(entry.h)||0)*60);
  if(entry.minutes)return Number(entry.minutes)||0;
  return Math.round((Number(entry.h)||0)*60);
}
function normalizeSleepEntries(){
  if(!Array.isArray(S.sleep))S.sleep=[];
  if(!S.sleepGoal)S.sleepGoal=DEFAULT_SLEEP_GOAL;
  const today=dayKey(new Date());
  S.sleep=S.sleep.map((e,idx)=>{
    const type=e.type||'night';
    const bed=sleepNormalizeTime(e.bed||e.start||'23:00','23:00');
    const wake=sleepNormalizeTime(e.wake||e.end||'07:00','07:00');
    const minutes=type==='nap'
      ? Number(e.minutes)||Math.round((Number(e.h)||0)*60)||20
      : Number(e.minutes)||sleepDurationMinutes(bed,wake);
    const dateKey=e.dateKey||e.key||today;
    return {
      id:e.id||Date.now()+idx,
      type,
      h:sleepHoursFromMinutes(minutes),
      minutes,
      bed,
      wake,
      day:e.day||DS[keyToDate(dateKey).getDay()],
      date:e.date||`${keyToDate(dateKey).getDate()} ${MS[keyToDate(dateKey).getMonth()]}`,
      dateKey,
      qual:Number(e.qual)||3,
      note:e.note||'',
      createdAt:e.createdAt||Date.now(),
      updatedAt:e.updatedAt||e.createdAt||Date.now()
    };
  }).sort((a,b)=>String(b.dateKey).localeCompare(String(a.dateKey)) || (b.createdAt||0)-(a.createdAt||0));
}
function sleepNightEntries(){
  normalizeSleepEntries();
  return S.sleep.filter(e=>e.type!=='nap');
}
function sleepNapEntries(){
  normalizeSleepEntries();
  return S.sleep.filter(e=>e.type==='nap');
}
function sleepRecentNights(n=7){
  return sleepNightEntries().slice(0,n);
}
function sleepEntriesForKeys(keys,nightOnly=false){
  const set=new Set(keys);
  return S.sleep.filter(e=>set.has(e.dateKey)).filter(e=>!nightOnly||e.type!=='nap');
}
function sleepWeekKeys(){return weekKeys(dayKey(new Date()));}
function sleepMonthKeys(){
  const now=new Date(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  return Array.from({length:last},(_,i)=>dayKey(new Date(now.getFullYear(),now.getMonth(),i+1)));
}
function sleepAvg(entries){
  const nights=entries.filter(e=>e.type!=='nap');
  return nights.length?nights.reduce((a,e)=>a+Number(e.h||0),0)/nights.length:0;
}
function sleepQualAvg(entries){
  const withQ=entries.filter(e=>e.qual);
  return withQ.length?withQ.reduce((a,e)=>a+Number(e.qual||0),0)/withQ.length:0;
}
function sleepDebt(entries=sleepRecentNights(7)){
  const goal=sleepGoal();
  const debt=entries.reduce((a,e)=>a+Math.max(0,goal-Number(e.h||0)),0);
  return Math.round(debt*10)/10;
}
function sleepConsistency(entries=sleepRecentNights(7)){
  const nights=entries.filter(e=>e.bed&&e.wake);
  if(nights.length<2)return {score:0,label:'Sem dados'};
  const bedMins=nights.map(e=>sleepMinutesFromTime(e.bed));
  const avg=bedMins.reduce((a,x)=>a+x,0)/bedMins.length;
  const dev=bedMins.reduce((a,x)=>a+Math.abs(x-avg),0)/bedMins.length;
  const score=clamp(Math.round(100-(dev/180*100)),0,100);
  const label=score>=80?'Ótima':score>=60?'Boa':score>=40?'Instável':'Muito instável';
  return {score,label,dev:Math.round(dev)};
}
function sleepScore(){
  const latest=sleepRecentNights(1)[0];
  if(!latest)return 0;
  const goal=sleepGoal();
  const durScore=Math.min(50,Math.round((latest.h/goal)*50));
  const qScore=Math.round((latest.qual||3)/5*30);
  const consistency=sleepConsistency().score;
  return clamp(Math.round(durScore+qScore+consistency*.2),0,100);
}
function pickQual(q,el){
  selQual=q;
  document.querySelectorAll('.s-qual-btn').forEach(b=>b.classList.remove('sel'));
  if(el)el.classList.add('sel');
  haptic('light');
}
function saveSleepGoal(){
  const goal=Number(String($('sleepGoalInp')?.value||'').replace(',','.'))||DEFAULT_SLEEP_GOAL;
  S.sleepGoal=clamp(goal,4,12);
  commitSleep('Meta de sono salva');
}
function logSleep(){
  normalizeSleepEntries();
  const sv=sleepNormalizeTime(document.getElementById('sStart')?.value,'23:00');
  const ev=sleepNormalizeTime(document.getElementById('sEnd')?.value,'07:00');
  const note=($('sleepNoteInp')?.value||'').trim();
  const minutes=sleepDurationMinutes(sv,ev);
  const now=new Date();
  const dateKey=dayKey(now);
  S.sleep=S.sleep.filter(e=>!(e.type!=='nap'&&e.dateKey===dateKey));
  S.sleep.unshift({
    id:Date.now(),
    type:'night',
    h:sleepHoursFromMinutes(minutes),
    minutes,
    bed:sv,
    wake:ev,
    day:DS[now.getDay()],
    date:`${now.getDate()} ${MS[now.getMonth()]}`,
    dateKey,
    qual:selQual,
    note,
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
  const noteEl=$('sleepNoteInp'); if(noteEl)noteEl.value='';
  haptic('success');
  commitSleep('Sono registrado! '+qualEmoji(selQual));
  const streak7=sleepRecentNights(7).filter(s=>s.h>=sleepGoal()).length;
  if(streak7===7)showBadge?.('Semana perfeita de sono!',`7 noites ≥${sleepGoal()}h seguidas`,'🌙');
  const btn=document.getElementById('sBtn');
  if(btn){
    btn.textContent='✓ Registrado!';
    btn.style.background='var(--green)';
    setTimeout(()=>{btn.textContent='Registrar sono';btn.style.background='var(--purple)';},1800);
  }
}
function logNap(){
  normalizeSleepEntries();
  const minutes=Math.max(5,parseInt($('napMinInp')?.value||'20')||20);
  const note=($('napNoteInp')?.value||'').trim();
  const now=new Date(),dateKey=dayKey(now);
  S.sleep.unshift({
    id:Date.now(),
    type:'nap',
    h:sleepHoursFromMinutes(minutes),
    minutes,
    bed:'',
    wake:'',
    day:DS[now.getDay()],
    date:`${now.getDate()} ${MS[now.getMonth()]}`,
    dateKey,
    qual:3,
    note,
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
  if($('napMinInp'))$('napMinInp').value='';
  if($('napNoteInp'))$('napNoteInp').value='';
  commitSleep('Cochilo registrado');
}
function editSleep(id){
  normalizeSleepEntries();
  const e=S.sleep.find(x=>String(x.id)===String(id));
  if(!e)return;
  if(e.type==='nap'){
    openEditModal({
      title:'Editar cochilo',
      subtitle:sleepDateLabel(e.dateKey),
      fields:[
        {name:'minutes',label:'Minutos',type:'number',value:e.minutes||20,inputmode:'numeric'},
        {name:'note',label:'Observação',value:e.note||'',placeholder:'Opcional'}
      ],
      onSave(values){
        const minutes=Math.max(5,parseInt(values.minutes)||20);
        e.minutes=minutes;
        e.h=sleepHoursFromMinutes(minutes);
        e.note=String(values.note||'').trim();
        e.updatedAt=Date.now();
        commitSleep();
      }
    });
    return;
  }
  openEditModal({
    title:'Editar sono',
    subtitle:sleepDateLabel(e.dateKey),
    fields:[
      {name:'bed',label:'Dormi às',type:'time',value:e.bed||'23:00'},
      {name:'wake',label:'Acordei às',type:'time',value:e.wake||'07:00'},
      {name:'qual',label:'Qualidade',type:'select',value:e.qual||3,options:DEFAULT_SLEEP_QUALITIES.map(q=>({value:q.id,label:`${q.emoji} ${q.label}`}))},
      {name:'note',label:'Observação',value:e.note||'',placeholder:'Opcional'}
    ],
    onSave(values){
      e.bed=sleepNormalizeTime(values.bed,'23:00');
      e.wake=sleepNormalizeTime(values.wake,'07:00');
      e.minutes=sleepDurationMinutes(e.bed,e.wake);
      e.h=sleepHoursFromMinutes(e.minutes);
      e.qual=Number(values.qual)||3;
      e.note=String(values.note||'').trim();
      e.updatedAt=Date.now();
      commitSleep();
    }
  });
}
function delSleep(idOrIndex){
  normalizeSleepEntries();
  const id=String(idOrIndex);
  S.sleep=S.sleep.filter((e,i)=>String(e.id)!==id && String(i)!==id);
  commitSleep();
}
function commitSleep(message){
  normalizeSleepEntries();
  renderSleep();
  renderSleepChart();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'',2000);
}
function renderSleep(){
  normalizeSleepEntries();
  const nights=sleepNightEntries();
  const recent=sleepRecentNights(7);
  const latest=nights[0];
  const weekKeys=sleepWeekKeys();
  const weekEntries=sleepEntriesForKeys(weekKeys);
  const monthEntries=sleepEntriesForKeys(sleepMonthKeys());
  const avg7=sleepAvg(recent);
  const avgQ=sleepQualAvg(recent);
  const good7=recent.filter(x=>x.h>=sleepGoal()).length;
  const debt=sleepDebt(recent);
  const consistency=sleepConsistency(recent);
  const set=(id,val)=>{const el=$(id);if(el)el.textContent=val;};
  set('sAvg',avg7?avg7.toFixed(1)+'h':'—');
  set('sLast',latest?latest.h+'h':'—');
  set('sGood',good7);
  set('sQualAvg',avgQ?qualEmoji(Math.round(avgQ)):'—');
  set('sDebt',debt?debt+'h':'0h');
  set('sScore',sleepScore()||'—');
  set('sConsistency',consistency.label);
  const goalInput=$('sleepGoalInp');
  if(goalInput&&!goalInput.matches(':focus'))goalInput.value=sleepGoal();
  renderSleepInsights(recent,weekEntries,monthEntries,consistency,debt);
  renderSleepHistory();
}
function renderSleepInsights(recent,weekEntries,monthEntries,consistency,debt){
  const box=$('sleepInsights');
  if(!box)return;
  const weekNights=weekEntries.filter(e=>e.type!=='nap');
  const naps=weekEntries.filter(e=>e.type==='nap');
  const monthNights=monthEntries.filter(e=>e.type!=='nap');
  const avgMonth=sleepAvg(monthNights);
  const avgWeek=sleepAvg(weekNights);
  const msg=debt>3?'Você acumulou dívida de sono relevante nesta semana.':consistency.score>=75?'Seu horário de dormir está bem consistente.':'Tente aproximar o horário de dormir nos próximos dias.';
  box.innerHTML=`
    <div class="sleep-insight-main"><strong>${msg}</strong><span>Meta atual: ${sleepGoal()}h por noite</span></div>
    <div class="sleep-insight-grid">
      <div><span>Semana</span><strong>${avgWeek?avgWeek.toFixed(1)+'h':'—'}</strong><em>${weekNights.length} noites</em></div>
      <div><span>Mês</span><strong>${avgMonth?avgMonth.toFixed(1)+'h':'—'}</strong><em>${monthNights.length} noites</em></div>
      <div><span>Cochilos</span><strong>${naps.length}</strong><em>${naps.reduce((a,e)=>a+e.minutes,0)} min</em></div>
      <div><span>Consistência</span><strong>${consistency.score||0}%</strong><em>${consistency.label}</em></div>
    </div>`;
}
function renderSleepHistory(){
  const he=document.getElementById('sHist'),em=document.getElementById('sEmpty');
  if(!he||!em)return;
  he.querySelectorAll('.s-hist-item').forEach(x=>x.remove());
  if(!S.sleep.length){
    em.style.display='block';
    document.getElementById('sCorrCard').style.display='none';
    return;
  }
  em.style.display='none';
  S.sleep.slice(0,30).forEach(e=>{
    const d=document.createElement('div');
    d.className='s-hist-item v18';
    const q=e.qual||3;
    const isNap=e.type==='nap';
    const hoursColor=isNap?'var(--teal)':e.h>=sleepGoal()?'var(--green)':e.h>=sleepGoal()-1?'var(--yellow)':'var(--red)';
    const note=e.note?`<div class="s-note">${unioEscape(e.note)}</div>`:'';
    d.innerHTML=`<div style="flex:1;min-width:0;">
      <div style="font-size:14px;font-weight:650;">${isNap?'💤 Cochilo':'🌙 Sono'} · ${sleepDateLabel(e.dateKey)}</div>
      <div style="font-size:11px;color:var(--lbl2);margin-top:2px;">${isNap?`${e.minutes} min`:`${e.bed} → ${e.wake}`} ${isNap?'':`· ${qualEmoji(q)} ${sleepQualMeta(q).label}`}</div>
      ${note}
    </div>
    <div class="s-hist-actions">
      <div class="s-hist-h" style="color:${hoursColor}">${isNap?e.minutes+'m':e.h+'h'}</div>
      <button onclick="editSleep(${e.id})">Editar</button>
      <button onclick="delSleep(${e.id})">×</button>
    </div>`;
    he.appendChild(d);
  });
  renderSleepCorrelation();
}
function renderSleepCorrelation(){
  const withQual=sleepNightEntries().filter(x=>x.qual);
  if(withQual.length>=2){
    document.getElementById('sCorrCard').style.display='block';
    const groups={};
    withQual.forEach(e=>{if(!groups[e.qual])groups[e.qual]=[];groups[e.qual].push(e.h);});
    document.getElementById('sCorrRow').innerHTML=Object.keys(groups).sort().map(q=>{
      const avg=(groups[q].reduce((a,x)=>a+x,0)/groups[q].length).toFixed(1);
      return`<div class="s-corr-item"><div style="font-size:18px;">${qualEmoji(q)}</div><div class="s-corr-val" style="color:${qualColor(+q)}">${avg}h</div><div class="s-corr-lbl">${groups[q].length} noite${groups[q].length>1?'s':''}</div></div>`;
    }).join('');
  }else document.getElementById('sCorrCard').style.display='none';
}
function renderSleepChart(){
  const ch=document.getElementById('sChart');
  if(!ch)return;
  ch.innerHTML='';
  const entries=[...sleepRecentNights(7)].reverse();
  const maxH=Math.max(sleepGoal()+1,9,...entries.map(e=>e.h));
  while(entries.length<7)entries.unshift(null);
  entries.forEach(e=>{
    const col=document.createElement('div');
    col.className='bar-col';
    const barColor=e?(e.qual?qualColor(e.qual):(e.h>=sleepGoal()?'var(--purple)':'rgba(191,90,242,.35)')):'rgba(191,90,242,.18)';
    const tooltip=e?`${e.h}h ${qualEmoji(e.qual||0)}`:'';
    col.innerHTML=`<div class="bar" style="height:${e?(e.h/maxH)*100:0}%;background:${barColor};"></div><div class="bar-lbl" title="${tooltip}">${e?DS[keyToDate(e.dateKey).getDay()]:'–'}</div>`;
    ch.appendChild(col);
  });
}
