/* Unio Base Organizada v3 */
/* ━━━━ HOME ━━━━ */
function renderHome(){
  const now=new Date(),h=now.getHours();
  const nameStr=S_name?', '+S_name:'';
  const gr=(h<12?'Bom dia 🌅':h<18?'Boa tarde ☀️':'Boa noite 🌙')+nameStr;
  document.getElementById('homeGreeting').textContent=gr;
  document.getElementById('homeDate').textContent=`${DL[now.getDay()]}, ${now.getDate()} de ${MS[now.getMonth()]}`;

  const todayK=dayKey(now);
  const habRow=document.getElementById('homeHabitsRow');
  if(S.habits.length){
    habRow.style.display='block';
    const done=S.habits.filter(h=>h.log&&h.log.includes(todayK)).length;
    document.getElementById('homeHabPct').textContent=`${done}/${S.habits.length}`;
    document.getElementById('homeHabStrip').innerHTML=S.habits.slice(0,8).map(h=>{
      const isDone=h.log&&h.log.includes(todayK);
      return`<div class="hhab-dot" onclick="quickToggleHab(${h.id})">
        <div class="hhab-circle${isDone?' done':''}" style="background:${isDone?'rgba(52,199,89,.18)':'var(--bg3)'};">${h.emoji}</div>
        <div class="hhab-lbl">${h.name}</div>
      </div>`;
    }).join('');
  }else{
    habRow.style.display='none';
  }

  const wPct=Math.min(S.water.amt/S.water.goal*100,100).toFixed(0);
  const healthEntries=(S.health?.acts||[]).filter(a=>!a.date||a.date===todayK);
  const totalHealthMin=healthEntries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const todaySleep=S.sleep[0]?S.sleep[0].h:null;
  const todayFoodCount=Object.values(S.nutr).flat().length;
  const todayTasks=S.tasks.filter(t=>t.date===todayK);
  const doneTasks=todayTasks.filter(t=>t.done).length;
  const pendingTasks=todayTasks.length-doneTasks;
  const doneHabits=S.habits.filter(h=>h.log&&h.log.includes(todayK)).length;

  const focusEl=document.getElementById('homeTodayFocus');
  if(focusEl){
    const waterState=Number(wPct)>=100?'Meta batida':`${wPct}% da água`;
    const taskState=pendingTasks?`${pendingTasks} tarefa${pendingTasks>1?'s':''} pendente${pendingTasks>1?'s':''}`:'Tarefas em dia';
    const moveState=totalHealthMin?`${totalHealthMin} min ativos`:'Sem movimento registrado';
    focusEl.innerHTML=`
      <div class="home-focus-mini">
        <div class="hfm-item"><span>💧</span><strong>${waterState}</strong></div>
        <div class="hfm-item"><span>✅</span><strong>${taskState}</strong></div>
        <div class="hfm-item"><span>🏃</span><strong>${moveState}</strong></div>
      </div>`;
  }

  const cards=[
    {id:'water',ico:'💧',title:'Água',val:S.water.amt+'ml',sub:`${wPct}% da meta`,bar:wPct,clr:'var(--teal)'},
    {id:'nutrition',ico:'🥗',title:'Nutrição',val:todayFoodCount+' itens',sub:'registros no diário',bar:Math.min(todayFoodCount/6*100,100),clr:'var(--green)'},
    {id:'health',ico:'🏃',title:'Saúde',val:totalHealthMin+' min',sub:`${healthEntries.length} registros · ${S.health.steps.toLocaleString('pt-BR')} passos`,bar:Math.min(totalHealthMin/60*100,100),clr:'var(--orange)'},
    {id:'sleep',ico:'🌙',title:'Sono',val:todaySleep?todaySleep+'h':'—',sub:todaySleep?'última noite':'sem registro',bar:todaySleep?Math.min(todaySleep/8*100,100):0,clr:'var(--purple)'},
    {id:'tasks',ico:'✅',title:'Tarefas',val:doneTasks+'/'+todayTasks.length,sub:pendingTasks?`${pendingTasks} pendentes`:'tarefas em dia',bar:todayTasks.length?doneTasks/todayTasks.length*100:0,clr:'var(--blue)'},
    {id:'habits',ico:'🔥',title:'Hábitos',val:doneHabits+'/'+S.habits.length,sub:'hábitos hoje',bar:S.habits.length?doneHabits/S.habits.length*100:0,clr:'var(--orange)'},
  ];
  document.getElementById('homeGrid').innerHTML=cards.map(c=>`
    <div class="hcard" onclick="switchTabById('${c.id}')">
      <div class="hcard-ico">${c.ico}</div>
      <div class="hcard-title">${c.title}</div>
      <div class="hcard-val" style="color:${c.clr}">${c.val}</div>
      <div class="hcard-sub">${c.sub}</div>
      <div class="hcard-bar"><div class="hcard-fill" style="width:${c.bar}%;background:${c.clr}"></div></div>
    </div>`).join('');

  document.getElementById('homeFocusSub').textContent=`${S.focus.type} min · ${S.focus.sessions} sessões hoje`;

  const weekSumEl=document.getElementById('homeWeekSummary');
  if(weekSumEl){
    const wkSleep=S.sleep.slice(0,7);
    const weekSet=new Set(weekKeys());
    const wkActs=(S.health?.acts||[]).filter(a=>!a.date||weekSet.has(a.date));
    const wkMins=wkActs.reduce((a,x)=>a+(Number(x.min)||0),0);
    const wkTasks=S.tasks.filter(t=>t.date&&t.date>=weekKeys()[0]);
    const wkDoneTasks=wkTasks.filter(t=>t.done);
    const wkHabRate=S.habits.length?Math.round(S.habits.reduce((a,h)=>{
      const done=weekKeys().filter(k=>h.log&&h.log.includes(k)).length;
      return a+done/7;
    },0)/S.habits.length*100):0;
    if(S.sleep.length||wkActs.length||S.tasks.length||S.habits.length){
      weekSumEl.style.display='block';
      document.getElementById('wsBadge').textContent=now.getDay()===1?'📊 Resumo da semana':'📊 Esta semana';
      document.getElementById('wsContent').innerHTML=`
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${wkSleep.length?`<div style="background:var(--bg3);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--purple);">🌙 ${(wkSleep.reduce((a,x)=>a+x.h,0)/wkSleep.length).toFixed(1)}h média sono</div>`:''}
          ${wkActs.length?`<div style="background:var(--bg3);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--orange);">🏃 ${wkMins} min ativos</div>`:''}
          ${wkTasks.length?`<div style="background:var(--bg3);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--blue);">✅ ${wkDoneTasks.length}/${wkTasks.length} tarefas</div>`:''}
          ${S.habits.length?`<div style="background:var(--bg3);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--orange);">🔥 ${wkHabRate}% hábitos</div>`:''}
        </div>`;
    }else{
      weekSumEl.style.display='none';
    }
  }
}
