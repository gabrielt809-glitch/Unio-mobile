/* Unio Base Organizada v2 */
/* ━━━━ HEALTH — diário livre ━━━━ */
let healthIntensity='moderada';

function todayKey(){return dayKey(new Date());}
function safeArr(v){return Array.isArray(v)?v:[];}

function normalizeHealthEntries(){
  if(!S.health)S.health={steps:0,acts:[]};
  if(!Array.isArray(S.health.acts))S.health.acts=[];
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
}

function getTodayHealthEntries(){
  normalizeHealthEntries();
  const tk=todayKey();
  return S.health.acts.filter(a=>!a.date || a.date===tk);
}

function saveSteps(){
  const v=parseInt(document.getElementById('stepsInp').value,10)||0;
  S.health.steps=Math.max(0,v);
  renderHealth();
  haptic('light');
}

function addSteps(n){
  S.health.steps=Math.max(0,(Number(S.health.steps)||0)+n);
  document.getElementById('stepsInp').value=S.health.steps;
  renderHealth();
  haptic('light');
}

function pickHealthIntensity(intensity,el){
  healthIntensity=intensity;
  document.querySelectorAll('.h-intensity-btn').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  haptic('light');
}

function addHealthEntry(){
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
  renderHealth();
  haptic('success');
  showToast('Atividade adicionada ao diário! 🏃','',2200);
}

function rmAct(id){
  S.health.acts=S.health.acts.filter(x=>x.id!==id);
  renderHealth();
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
  renderHealth();
  saveState();
}

function intensityLabel(i){
  if(i==='intensa')return 'Intensa';
  if(i==='leve')return 'Leve';
  return 'Moderada';
}

function intensityIcon(i){
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

function renderHealth(){
  normalizeHealthEntries();
  const steps=Number(S.health.steps)||0;
  const entries=getTodayHealthEntries();
  const totalMin=entries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const dom=dominantIntensity(entries);

  document.getElementById('hSteps').textContent=steps.toLocaleString('pt-BR');
  document.getElementById('hActMin').textContent=totalMin;
  document.getElementById('hActN').textContent=entries.length;
  const intensityEl=document.getElementById('hIntensity');
  if(intensityEl)intensityEl.textContent=dom==='—'?'—':intensityLabel(dom);
  const stepsInp=document.getElementById('stepsInp');
  if(stepsInp)stepsInp.value=steps||'';

  const log=document.getElementById('actLog');
  const em=document.getElementById('actEmpty');
  if(!log||!em)return;
  log.querySelectorAll('.act-item').forEach(e=>e.remove());
  em.style.display=entries.length?'none':'block';

  entries.forEach(a=>{
    const d=document.createElement('div');
    d.className='act-item';
    const note=a.note?`<div class="act-note">${a.note}</div>`:'';
    const time=a.time?` · ${a.time}`:'';
    const minText=a.min?`${a.min} min · `:'';
    d.innerHTML=`
      <div style="flex:1;min-width:0;">
        <div class="act-nm">${a.name}</div>
        <div class="act-det">${minText}${intensityIcon(a.intensity)} ${intensityLabel(a.intensity)}${time}</div>
        ${note}
      </div>
      <button class="act-rm" onclick="rmAct(${a.id})">×</button>`;
    log.appendChild(d);
  });
}
