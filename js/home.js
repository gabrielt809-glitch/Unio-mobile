/* Unio Base Organizada v8.1 */
/* ━━━━ HOME ━━━━ */
function renderHome(){
  const now=new Date(),h=now.getHours();
  const nameStr=S_name?', '+S_name:'';
  const gr=(h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+nameStr;
  document.getElementById('homeGreeting').textContent=gr;
  document.getElementById('homeDate').textContent=`${DL[now.getDay()]}, ${now.getDate()} de ${MS[now.getMonth()]}`;

  const todayK=dayKey(now);
  const waterGoal=Number(S.water?.goal)||2000;
  const waterAmt=Number(S.water?.amt)||0;
  const wPct=Math.min(waterAmt/waterGoal*100,100).toFixed(0);
  const healthEntries=(S.health?.acts||[]).filter(a=>!a.date||a.date===todayK);
  const totalHealthMin=healthEntries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const todaySleep=S.sleep[0]?S.sleep[0].h:null;
  const todayFoodCount=Object.values(S.nutr||{}).flat().length;
  const todayTasks=(S.tasks||[]).filter(t=>t.date===todayK);
  const doneTasks=todayTasks.filter(t=>t.done).length;
  const pendingTasks=todayTasks.length-doneTasks;
  const doneHabits=(S.habits||[]).filter(h=>h.log&&h.log.includes(todayK)).length;

  const habRow=document.getElementById('homeHabitsRow');
  if(S.habits&&S.habits.length){
    habRow.style.display='block';
    document.getElementById('homeHabPct').textContent=`${doneHabits}/${S.habits.length}`;
    document.getElementById('homeHabStrip').innerHTML=S.habits.slice(0,8).map(h=>{
      const isDone=h.log&&h.log.includes(todayK);
      return`<div class="hhab-dot" onclick="quickToggleHab(${h.id})">
        <div class="hhab-circle${isDone?' done':''}" style="background:${isDone?'rgba(52,199,89,.18)':'var(--bg3)'};">${h.emoji}</div>
        <div class="hhab-lbl">${unioEscape(h.name)}</div>
      </div>`;
    }).join('');
  }else{
    habRow.style.display='none';
  }

  const focusEl=document.getElementById('homeTodayFocus');
  if(focusEl){
    const waterState=Number(wPct)>=100?'Meta de água batida':`${wPct}% da meta de água`;
    const taskState=pendingTasks?`${pendingTasks} tarefa${pendingTasks>1?'s':''} pendente${pendingTasks>1?'s':''}`:'Tarefas em dia';
    const moveState=totalHealthMin?`${totalHealthMin} min ativos hoje`:'Sem atividade registrada';
    focusEl.innerHTML=`
      <section class="home-brief" aria-label="Resumo do dia">
        <div class="home-brief-head">
          <div class="home-brief-title">Resumo de hoje</div>
          <div class="home-brief-pill">v8</div>
        </div>
        <div class="home-brief-grid">
          <div class="hfm-item"><span>💧</span><strong>${waterState}</strong></div>
          <div class="hfm-item"><span>✅</span><strong>${taskState}</strong></div>
          <div class="hfm-item"><span>🏃</span><strong>${moveState}</strong></div>
        </div>
      </section>`;
  }

  const cards=[
    {id:'water',ico:'💧',title:'Água',val:waterAmt+'ml',sub:`${wPct}% da meta`,bar:wPct,clr:'var(--teal)',glow:'rgba(90,200,250,.18)'},
    {id:'tasks',ico:'✅',title:'Tarefas',val:doneTasks+'/'+todayTasks.length,sub:pendingTasks?`${pendingTasks} pendentes`:'tarefas em dia',bar:todayTasks.length?doneTasks/todayTasks.length*100:0,clr:'var(--blue)',glow:'rgba(0,122,255,.18)'},
    {id:'habits',ico:'🔥',title:'Hábitos',val:doneHabits+'/'+(S.habits?.length||0),sub:'hábitos hoje',bar:S.habits?.length?doneHabits/S.habits.length*100:0,clr:'var(--orange)',glow:'rgba(255,159,10,.18)'},
    {id:'focus',ico:'🎯',title:'Foco',val:(S.focus?.sessions||0)+'x',sub:`${S.focus?.type||25} min por sessão`,bar:Math.min((S.focus?.sessions||0)/4*100,100),clr:'var(--pink)',glow:'rgba(255,55,95,.16)'},
    {id:'nutrition',ico:'🥗',title:'Nutrição',val:todayFoodCount+' itens',sub:'registros no diário',bar:Math.min(todayFoodCount/6*100,100),clr:'var(--green)',glow:'rgba(52,199,89,.16)'},
    {id:'sleep',ico:'🌙',title:'Sono',val:todaySleep?todaySleep+'h':'—',sub:todaySleep?'última noite':'sem registro',bar:todaySleep?Math.min(todaySleep/8*100,100):0,clr:'var(--purple)',glow:'rgba(191,90,242,.16)'},
  ];
  document.getElementById('homeGrid').innerHTML=cards.map(c=>`
    <div class="hcard" onclick="switchTabById('${c.id}')" style="--cardGlow:${c.glow}">
      <div class="hcard-ico">${c.ico}</div>
      <div class="hcard-title">${c.title}</div>
      <div class="hcard-val" style="color:${c.clr}">${c.val}</div>
      <div class="hcard-sub">${c.sub}</div>
      <div class="hcard-bar"><div class="hcard-fill" style="width:${c.bar}%;background:${c.clr}"></div></div>
    </div>`).join('');

  document.getElementById('homeFocusSub').textContent=`${S.focus?.type||25} min · ${S.focus?.sessions||0} sessões hoje`;

  const weekSumEl=document.getElementById('homeWeekSummary');
  if(weekSumEl){
    const wkSleep=S.sleep.slice(0,7);
    const wkKeys=weekKeys();
    const weekSet=new Set(wkKeys);
    const wkActs=(S.health?.acts||[]).filter(a=>!a.date||weekSet.has(a.date));
    const wkMins=wkActs.reduce((a,x)=>a+(Number(x.min)||0),0);
    const wkTasks=(S.tasks||[]).filter(t=>t.date&&weekSet.has(t.date));
    const wkDoneTasks=wkTasks.filter(t=>t.done);
    const wkHabRate=S.habits.length?Math.round(S.habits.reduce((a,h)=>{
      const done=wkKeys.filter(k=>h.log&&h.log.includes(k)).length;
      return a+done/7;
    },0)/S.habits.length*100):0;
    if(S.sleep.length||wkActs.length||S.tasks.length||S.habits.length){
      weekSumEl.style.display='block';
      document.getElementById('wsBadge').textContent=now.getDay()===1?'Resumo da semana':'Esta semana';
      document.getElementById('wsContent').innerHTML=`
        <div class="ws-grid">
          ${wkSleep.length?`<div class="ws-pill" style="color:var(--purple);">🌙 ${(wkSleep.reduce((a,x)=>a+x.h,0)/wkSleep.length).toFixed(1)}h média</div>`:''}
          ${wkActs.length?`<div class="ws-pill" style="color:var(--orange);">🏃 ${wkMins} min ativos</div>`:''}
          ${wkTasks.length?`<div class="ws-pill" style="color:var(--blue);">✅ ${wkDoneTasks.length}/${wkTasks.length} tarefas</div>`:''}
          ${S.habits.length?`<div class="ws-pill" style="color:var(--orange);">🔥 ${wkHabRate}% hábitos</div>`:''}
        </div>`;
    }else{
      weekSumEl.style.display='none';
    }
  }
}
