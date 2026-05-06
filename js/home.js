/* Unio Base Organizada v24 */
/* ━━━━ HOME INTELIGENTE ━━━━
   Score local, próximas ações, alertas e painel priorizado
*/
function homeClampPct(v){return clamp(Math.round(Number(v)||0),0,100);}
function homeTodayKey(){return dayKey(new Date());}
function homeSafeMoney(v){return typeof financeMoney==='function'?financeMoney(v):`R$ ${Number(v||0).toFixed(2)}`;}
function homeModuleOpen(tab){switchTabById(tab);}
function homeSetText(id,value){const el=$(id);if(el)el.textContent=value;}
function homeSetHTML(id,value){const el=$(id);if(el)el.innerHTML=value;}

function getHomeContext(){
  const now=new Date();
  const todayK=dayKey(now);
  const weekKeysArr=weekKeys(todayK);
  const weekSet=new Set(weekKeysArr);

  const waterGoal=Number(S.water?.goal)||DEFAULT_WATER_GOAL||2000;
  const waterAmt=Number(S.water?.amt)||0;
  const waterPct=waterGoal?homeClampPct(waterAmt/waterGoal*100):0;
  const wStreak=typeof waterStreak==='function'?waterStreak():0;
  const waterNeed=Math.max(0,waterGoal-waterAmt);

  const taskOcc=typeof taskOccurrencesForDate==='function'
    ? taskOccurrencesForDate(todayK,true)
    : (S.tasks||[]).filter(t=>t.date===todayK).map(t=>({task:t,done:!!t.done,date:t.date}));
  const tasksTotal=taskOcc.length;
  const tasksDone=taskOcc.filter(o=>o.done).length;
  const tasksPending=taskOcc.filter(o=>!o.done);

  const weekOcc=typeof taskOccurrencesForWeek==='function'
    ? taskOccurrencesForWeek()
    : (S.tasks||[]).filter(t=>t.date&&weekSet.has(t.date)).map(t=>({task:t,done:!!t.done,date:t.date}));
  const weekTasksTotal=weekOcc.length;
  const weekTasksDone=weekOcc.filter(o=>o.done).length;

  const dueHabits=typeof habitDueOnDate==='function'
    ? (S.habits||[]).filter(h=>habitDueOnDate(h,todayK)||h.frequency==='weeklyTarget')
    : (S.habits||[]);
  const habitsDone=dueHabits.filter(h=>h.log&&h.log.includes(todayK)).length;
  const habitsPending=dueHabits.filter(h=>!(h.log&&h.log.includes(todayK)));
  const habitPct=dueHabits.length?homeClampPct(habitsDone/dueHabits.length*100):100;
  const weekHabRate=(S.habits||[]).length?Math.round((S.habits||[]).reduce((a,h)=>{
    if(typeof habitWeeklyProgress==='function')return a+habitWeeklyProgress(h).pct/100;
    const done=weekKeysArr.filter(k=>h.log&&h.log.includes(k)).length;
    return a+done/7;
  },0)/(S.habits||[]).length*100):0;

  const todayHealthEntries=(S.health?.acts||[]).filter(a=>!a.date||a.date===todayK);
  const activeMin=todayHealthEntries.reduce((a,x)=>a+(Number(x.min)||0),0);
  const weekHealth=(S.health?.acts||[]).filter(a=>!a.date||weekSet.has(a.date));
  const weekHealthMin=weekHealth.reduce((a,x)=>a+(Number(x.min)||0),0);
  const healthDiary=typeof getTodayHealthDiary==='function'?getTodayHealthDiary():null;
  const healthScoreVal=typeof healthScore==='function'?healthScore():homeClampPct((S.health?.steps||0)/8000*60+Math.min(activeMin/30*40,40));

  const latestSleep=typeof sleepNightEntries==='function'?sleepNightEntries()[0]:(S.sleep||[]).find(s=>s.type!=='nap');
  const sleepHours=latestSleep?Number(latestSleep.h)||0:0;
  const sleepGoalVal=Number(S.sleepGoal)||DEFAULT_SLEEP_GOAL||8;
  const sleepPct=sleepHours?homeClampPct(sleepHours/sleepGoalVal*100):0;
  const sleepDebtVal=typeof sleepDebt==='function'?sleepDebt():0;
  const weekSleep=typeof sleepRecentNights==='function'?sleepRecentNights(7):(S.sleep||[]).filter(s=>s.type!=='nap').slice(0,7);
  const weekSleepAvg=weekSleep.length?weekSleep.reduce((a,x)=>a+Number(x.h||0),0)/weekSleep.length:0;

  const todayFoodItems=typeof nutritionTodayItems==='function'
    ? nutritionTodayItems()
    : Object.values(S.nutr||{}).filter(Array.isArray).flat().filter(it=>!it.date||it.date===todayK);
  const nutritionTotalsToday=typeof nutritionTotals==='function'
    ? nutritionTotals(todayFoodItems)
    : {count:todayFoodItems.length,calories:0,protein:0};
  const nutrGoals=S.nutr?.goals||{};
  const nutritionPct=nutrGoals.calories?homeClampPct(nutritionTotalsToday.calories/nutrGoals.calories*100):Math.min(100,todayFoodItems.length*20);

  const focusLogsToday=typeof focusTodayLogs==='function'?focusTodayLogs():[];
  const focusMin=typeof focusMinutes==='function'?focusMinutes(focusLogsToday):(S.focus?.sessions||0)*(S.focus?.type||25);
  const focusStreakVal=typeof focusStreak==='function'?focusStreak():0;
  const weekFocus=typeof focusWeekLogs==='function'?focusWeekLogs():[];
  const weekFocusMin=typeof focusMinutes==='function'?focusMinutes(weekFocus):0;

  const financeMonth=typeof financeCurrentMonth==='function'?financeCurrentMonth():String(todayK).slice(0,7);
  const monthTx=(S.finance?.transactions||[]).filter(t=>String(t.date||'').slice(0,7)===financeMonth);
  const monthExpenses=monthTx.filter(t=>(t.type==='expense'&&!t.cardPayment)||t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  const cardOpen=monthTx.filter(t=>t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  const houseBills=(S.finance?.house?.bills||[]).filter(b=>String(b.date||'').slice(0,7)===financeMonth);
  const housePending=houseBills.filter(b=>!b.paid).reduce((a,b)=>a+Number(b.amount||0),0);
  const budgetTotals=typeof financeCategoryTotals==='function'?financeCategoryTotals(financeMonth):{};
  const budgetWarnings=Object.keys(S.finance?.budgets||{}).filter(cat=>{
    const budget=Number(S.finance.budgets[cat])||0;
    const spent=Number(budgetTotals?.[cat]?.total)||0;
    return budget>0&&spent>=budget*.8;
  });

  return {
    now,todayK,weekKeysArr,
    water:{goal:waterGoal,amt:waterAmt,pct:waterPct,need:waterNeed,streak:wStreak},
    tasks:{total:tasksTotal,done:tasksDone,pending:tasksPending,weekTotal:weekTasksTotal,weekDone:weekTasksDone},
    habits:{due:dueHabits,done:habitsDone,pending:habitsPending,pct:habitPct,weekRate:weekHabRate},
    health:{entries:todayHealthEntries,activeMin,weekMin:weekHealthMin,diary:healthDiary,score:healthScoreVal,steps:Number(S.health?.steps)||0},
    sleep:{latest:latestSleep,hours:sleepHours,goal:sleepGoalVal,pct:sleepPct,debt:sleepDebtVal,weekAvg:weekSleepAvg,weekCount:weekSleep.length},
    nutrition:{items:todayFoodItems,count:todayFoodItems.length,totals:nutritionTotalsToday,pct:nutritionPct,goals:nutrGoals},
    focus:{logs:focusLogsToday,minutes:focusMin,streak:focusStreakVal,weekMin:weekFocusMin},
    finance:{month:financeMonth,expenses:monthExpenses,cardOpen,housePending,budgetWarnings}
  };
}

function homeScoreParts(ctx){
  return [
    {id:'water',label:'Água',score:ctx.water.pct,weight:.14},
    {id:'tasks',label:'Tarefas',score:ctx.tasks.total?ctx.tasks.done/ctx.tasks.total*100:85,weight:.15},
    {id:'habits',label:'Hábitos',score:ctx.habits.pct,weight:.15},
    {id:'sleep',label:'Sono',score:ctx.sleep.hours?ctx.sleep.pct:55,weight:.14},
    {id:'health',label:'Saúde',score:ctx.health.score,weight:.14},
    {id:'focus',label:'Foco',score:Math.min(100,ctx.focus.minutes/60*100),weight:.10},
    {id:'nutrition',label:'Nutrição',score:ctx.nutrition.count?Math.max(45,ctx.nutrition.pct):45,weight:.10},
    {id:'finance',label:'Finanças',score:ctx.finance.budgetWarnings.length?60:ctx.finance.housePending?72:86,weight:.08}
  ];
}
function calculateHomeScore(ctx){
  const parts=homeScoreParts(ctx);
  const total=parts.reduce((a,p)=>a+(homeClampPct(p.score)*p.weight),0);
  const weight=parts.reduce((a,p)=>a+p.weight,0);
  return homeClampPct(total/weight);
}
function homeScoreLabel(score){
  if(score>=85)return ['Dia muito bem encaminhado','Você está mantendo a maioria das áreas em ordem.'];
  if(score>=70)return ['Bom ritmo hoje','Existem poucos pontos para ajustar e manter o dia redondo.'];
  if(score>=50)return ['Dia em construção','Algumas áreas precisam de atenção para equilibrar melhor sua rotina.'];
  return ['Atenção ao básico','Comece por uma ação simples: água, tarefa ou registro principal.'];
}
function homePriorityText(ctx,score){
  if(ctx.tasks.pending.length)return `Prioridade: ${ctx.tasks.pending[0].task?.txt||'concluir uma tarefa pendente'}.`;
  if(ctx.water.pct<70)return `Prioridade: beber ${ctx.water.need}ml para se aproximar da meta.`;
  if(ctx.habits.pending.length)return `Prioridade: manter ${ctx.habits.pending[0].name||'um hábito'} hoje.`;
  if(!ctx.nutrition.count)return 'Prioridade: registrar pelo menos uma refeição.';
  if(!ctx.focus.minutes)return 'Prioridade: fazer uma sessão curta de foco.';
  return score>=80?'Prioridade: manter o ritmo e fechar o dia com consistência.':'Prioridade: escolher uma ação pequena e executar agora.';
}
function buildHomeActions(ctx){
  const actions=[];
  if(ctx.tasks.pending.length){
    const t=ctx.tasks.pending[0].task||{};
    actions.push({rank:100,tab:'tasks',ico:'✅',title:'Concluir tarefa pendente',sub:t.txt||`${ctx.tasks.pending.length} pendente(s) hoje`,accent:'var(--blue)'});
  }
  if(ctx.water.pct<100){
    actions.push({rank:ctx.water.pct<50?95:70,tab:'water',ico:'💧',title:'Beber água',sub:`Faltam ${ctx.water.need}ml para a meta`,accent:'var(--teal)'});
  }
  if(ctx.habits.pending.length){
    actions.push({rank:90,tab:'habits',ico:'🔥',title:'Manter hábito',sub:ctx.habits.pending[0].name||`${ctx.habits.pending.length} pendente(s)`,accent:'var(--orange)'});
  }
  if(!ctx.nutrition.count){
    actions.push({rank:72,tab:'nutrition',ico:'🥗',title:'Registrar alimentação',sub:'Nenhuma refeição registrada hoje',accent:'var(--green)'});
  }
  if(!ctx.health.activeMin){
    actions.push({rank:64,tab:'health',ico:'🏃',title:'Registrar movimento',sub:'Sem atividade física hoje',accent:'var(--green)'});
  }
  if(!ctx.focus.minutes){
    actions.push({rank:62,tab:'focus',ico:'🎯',title:'Fazer foco curto',sub:'Comece com 15 ou 25 minutos',accent:'var(--pink)'});
  }
  if(!ctx.sleep.latest){
    actions.push({rank:58,tab:'sleep',ico:'🌙',title:'Registrar sono',sub:'Sem sono principal registrado',accent:'var(--purple)'});
  }
  if(ctx.finance.housePending>0){
    actions.push({rank:74,tab:'finance',ico:'🏠',title:'Revisar contas da casa',sub:`${homeSafeMoney(ctx.finance.housePending)} pendente`,accent:'var(--yellow)'});
  }
  if(ctx.finance.cardOpen>0){
    actions.push({rank:54,tab:'finance',ico:'💳',title:'Acompanhar cartão',sub:`Fatura do mês: ${homeSafeMoney(ctx.finance.cardOpen)}`,accent:'var(--pink)'});
  }
  if(ctx.finance.budgetWarnings.length){
    actions.push({rank:76,tab:'finance',ico:'📊',title:'Revisar orçamento',sub:`Categoria em atenção: ${ctx.finance.budgetWarnings[0]}`,accent:'var(--orange)'});
  }
  return actions.sort((a,b)=>b.rank-a.rank).slice(0,5);
}
function buildHomeAlerts(ctx){
  const alerts=[];
  if(ctx.water.pct<40)alerts.push({level:'warn',ico:'💧',text:'Hidratação baixa para este horário.'});
  if(ctx.sleep.latest&&ctx.sleep.hours<ctx.sleep.goal-1)alerts.push({level:'warn',ico:'🌙',text:'Última noite abaixo da sua meta de sono.'});
  if(ctx.sleep.debt>=3)alerts.push({level:'warn',ico:'😴',text:`Dívida de sono: ${ctx.sleep.debt}h na semana.`});
  if(ctx.finance.budgetWarnings.length)alerts.push({level:'warn',ico:'📊',text:'Orçamento perto do limite em uma categoria.'});
  if(ctx.tasks.pending.length>=4)alerts.push({level:'info',ico:'✅',text:'Muitas tarefas pendentes hoje. Priorize as 2 principais.'});
  if(ctx.focus.minutes>=60)alerts.push({level:'good',ico:'🎯',text:'Boa entrega de foco hoje.'});
  if(ctx.water.pct>=100)alerts.push({level:'good',ico:'💧',text:'Meta de água batida hoje.'});
  return alerts.slice(0,4);
}
function buildHomeCards(ctx){
  const cards=[
    {id:'water',rank:ctx.water.pct<60?95:50,ico:'💧',title:'Água',val:ctx.water.amt+'ml',sub:ctx.water.streak?`${ctx.water.pct}% · ${ctx.water.streak}d sequência`:`${ctx.water.pct}% da meta`,bar:ctx.water.pct,clr:'var(--teal)',glow:'rgba(90,200,250,.18)'},
    {id:'tasks',rank:ctx.tasks.pending.length?100:45,ico:'✅',title:'Tarefas',val:ctx.tasks.done+'/'+ctx.tasks.total,sub:ctx.tasks.pending.length?`${ctx.tasks.pending.length} pendentes`:'tarefas em dia',bar:ctx.tasks.total?ctx.tasks.done/ctx.tasks.total*100:0,clr:'var(--blue)',glow:'rgba(0,122,255,.18)'},
    {id:'habits',rank:ctx.habits.pending.length?88:42,ico:'🔥',title:'Hábitos',val:ctx.habits.done+'/'+ctx.habits.due.length,sub:'hábitos hoje',bar:ctx.habits.due.length?ctx.habits.done/ctx.habits.due.length*100:0,clr:'var(--orange)',glow:'rgba(255,159,10,.18)'},
    {id:'focus',rank:ctx.focus.minutes?38:62,ico:'🎯',title:'Foco',val:ctx.focus.minutes+'m',sub:ctx.focus.streak?`${ctx.focus.logs.length} sessões · ${ctx.focus.streak}d sequência`:`${ctx.focus.logs.length} sessões hoje`,bar:Math.min(ctx.focus.minutes/120*100,100),clr:'var(--pink)',glow:'rgba(255,55,95,.16)'},
    {id:'nutrition',rank:ctx.nutrition.count?35:68,ico:'🥗',title:'Nutrição',val:ctx.nutrition.count+' itens',sub:`${Math.round(ctx.nutrition.totals.calories||0)} kcal hoje`,bar:Math.min(ctx.nutrition.count/6*100,100),clr:'var(--green)',glow:'rgba(52,199,89,.16)'},
    {id:'sleep',rank:!ctx.sleep.latest||ctx.sleep.hours<ctx.sleep.goal-1?80:40,ico:'🌙',title:'Sono',val:ctx.sleep.hours?ctx.sleep.hours+'h':'—',sub:ctx.sleep.latest?'última noite':'sem registro',bar:ctx.sleep.pct,clr:'var(--purple)',glow:'rgba(191,90,242,.16)'},
    {id:'health',rank:ctx.health.activeMin?36:58,ico:'🏃',title:'Saúde',val:ctx.health.activeMin+'m',sub:ctx.health.steps?`${ctx.health.steps.toLocaleString('pt-BR')} passos`:'movimento hoje',bar:Math.min(ctx.health.activeMin/45*100,100),clr:'var(--green)',glow:'rgba(52,199,89,.13)'},
    {id:'finance',rank:ctx.finance.budgetWarnings.length||ctx.finance.housePending?75:34,ico:'💰',title:'Finanças',val:homeSafeMoney(ctx.finance.expenses),sub:ctx.finance.cardOpen?`${homeSafeMoney(ctx.finance.cardOpen)} no cartão`:'gastos do mês',bar:ctx.finance.budgetWarnings.length?90:Math.min(ctx.finance.expenses/3000*100,100),clr:'var(--yellow)',glow:'rgba(255,214,10,.12)'}
  ];
  return cards.sort((a,b)=>b.rank-a.rank);
}
function renderHomeActions(actions){
  const html=actions.length?actions.map((a,i)=>`
    <button class="home-action-item" onclick="homeModuleOpen('${a.tab}')" style="--act:${a.accent}">
      <span class="home-action-rank">${i+1}</span>
      <span class="home-action-ico">${a.ico}</span>
      <span class="home-action-copy"><strong>${unioEscape(a.title)}</strong><em>${unioEscape(a.sub)}</em></span>
      <span class="home-action-go">›</span>
    </button>`).join(''):`<div class="home-empty-smart"><strong>Dia em ordem</strong><span>Nenhuma ação urgente no momento.</span></div>`;
  homeSetHTML('homeNextActions',html);
}
function renderHomeAlerts(alerts){
  const el=$('homeAlertStrip');
  if(!el)return;
  if(!alerts.length){el.style.display='none';el.innerHTML='';return;}
  el.style.display='flex';
  el.innerHTML=alerts.map(a=>`<div class="home-alert ${a.level}"><span>${a.ico}</span>${unioEscape(a.text)}</div>`).join('');
}
function renderHomeHabits(ctx){
  const habRow=$('homeHabitsRow');
  if(!habRow)return;
  if(S.habits&&S.habits.length){
    habRow.style.display='block';
    homeSetText('homeHabPct',`${ctx.habits.done}/${ctx.habits.due.length}`);
    homeSetHTML('homeHabStrip',S.habits.slice(0,8).map(h=>{
      const isDone=h.log&&h.log.includes(ctx.todayK);
      return`<div class="hhab-dot" onclick="quickToggleHab(${h.id})">
        <div class="hhab-circle${isDone?' done':''}" style="background:${isDone?'rgba(52,199,89,.18)':'var(--bg3)'};">${h.emoji}</div>
        <div class="hhab-lbl">${unioEscape(h.name)}</div>
      </div>`;
    }).join(''));
  }else{
    habRow.style.display='none';
  }
}
function renderHomeWeek(ctx){
  const weekSumEl=$('homeWeekSummary');
  if(!weekSumEl)return;
  const hasData=ctx.sleep.weekCount||ctx.health.weekMin||ctx.tasks.weekTotal||S.habits.length||ctx.focus.weekMin||ctx.water.amt;
  if(!hasData){weekSumEl.style.display='none';return;}
  weekSumEl.style.display='block';
  homeSetText('wsBadge',ctx.now.getDay()===1?'Resumo da semana':'Esta semana');
  const waterWeek=typeof waterWeekSummary==='function'?waterWeekSummary():{hits:0,avg:0,total:0};
  homeSetHTML('wsContent',`
    <div class="ws-grid smart">
      ${ctx.sleep.weekCount?`<div class="ws-pill" style="color:var(--purple);">🌙 ${ctx.sleep.weekAvg.toFixed(1)}h sono</div>`:''}
      ${ctx.health.weekMin?`<div class="ws-pill" style="color:var(--orange);">🏃 ${ctx.health.weekMin} min ativos</div>`:''}
      ${ctx.tasks.weekTotal?`<div class="ws-pill" style="color:var(--blue);">✅ ${ctx.tasks.weekDone}/${ctx.tasks.weekTotal} tarefas</div>`:''}
      ${S.habits.length?`<div class="ws-pill" style="color:var(--orange);">🔥 ${ctx.habits.weekRate}% hábitos</div>`:''}
      ${ctx.focus.weekMin?`<div class="ws-pill" style="color:var(--pink);">🎯 ${ctx.focus.weekMin} min foco</div>`:''}
      <div class="ws-pill" style="color:var(--teal);">💧 ${waterWeek.hits||0}/7 água</div>
    </div>`);
}
function renderHomeFinancePreview(ctx){
  homeSetText('homeFinanceKicker',ctx.finance.budgetWarnings.length?'Atenção':'Finanças');
  homeSetText('homeFinanceTitle',ctx.finance.budgetWarnings.length?'Orçamento em atenção':'Pessoal e Casa');
  const sub=ctx.finance.housePending?`Casa: ${homeSafeMoney(ctx.finance.housePending)} pendente.`:
    ctx.finance.cardOpen?`Cartão do mês: ${homeSafeMoney(ctx.finance.cardOpen)}.`:
    `Gastos do mês: ${homeSafeMoney(ctx.finance.expenses)}.`;
  homeSetText('homeFinanceSub',sub);
}
function renderHome(){
  const ctx=getHomeContext();
  const nameStr=S_name?', '+S_name:'';
  const h=ctx.now.getHours();
  const gr=(h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+nameStr;
  homeSetText('homeGreeting',gr);
  homeSetText('homeDate',`${DL[ctx.now.getDay()]}, ${ctx.now.getDate()} de ${MS[ctx.now.getMonth()]}`);

  const score=calculateHomeScore(ctx);
  const [label,sub]=homeScoreLabel(score);
  homeSetText('homeSmartScore',score);
  homeSetText('homeSmartScoreLabel',label);
  homeSetText('homeSmartScoreSub',sub);
  homeSetText('homePriorityText',homePriorityText(ctx,score));
  const ring=$('homeSmartRing');
  if(ring){
    ring.style.strokeDashoffset=365*(1-score/100);
    ring.style.stroke=score>=80?'var(--green)':score>=60?'var(--yellow)':score>=40?'var(--orange)':'var(--red)';
  }

  renderHomeAlerts(buildHomeAlerts(ctx));
  renderHomeActions(buildHomeActions(ctx));
  renderHomeHabits(ctx);

  const cards=buildHomeCards(ctx);
  homeSetHTML('homeGrid',cards.map(c=>`
    <div class="hcard smart" onclick="switchTabById('${c.id}')" style="--cardGlow:${c.glow}">
      <div class="hcard-topline"><div class="hcard-ico">${c.ico}</div><span>${Math.round(c.bar||0)}%</span></div>
      <div class="hcard-title">${c.title}</div>
      <div class="hcard-val" style="color:${c.clr}">${c.val}</div>
      <div class="hcard-sub">${c.sub}</div>
      <div class="hcard-bar"><div class="hcard-fill" style="width:${c.bar}%;background:${c.clr}"></div></div>
    </div>`).join(''));

  homeSetText('homeFocusSub',`${ctx.focus.minutes} min · ${ctx.focus.logs.length} sessões hoje`);
  renderHomeFinancePreview(ctx);
  renderHomeWeek(ctx);
}
