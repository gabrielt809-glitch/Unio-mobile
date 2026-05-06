/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP MIGRATIONS — migração global de estado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function migrateLoadedState(data){
  const d=data||{};
  if(!d.schemaVersion)d.schemaVersion=1;
  d.water=migrateWaterState(d.water);
  d.focus=migrateFocusState(d.focus);
  if(!Array.isArray(d.pinnedTabs)||!d.pinnedTabs.length)d.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(!Array.isArray(d.taskCategories)||!d.taskCategories.length)d.taskCategories=DEFAULT_TASK_CATEGORIES.slice();
  if(!d.taskView)d.taskView='today';
  if(Array.isArray(d.tasks))d.tasks=d.tasks.map(t=>({...t,priority:t.priority||'normal',category:t.category||'Pessoal',recurrence:t.recurrence||'none',completionLog:Array.isArray(t.completionLog)?t.completionLog:[]}));
  if(Array.isArray(d.habits))d.habits=migrateHabitState(d.habits);
  d.sleep=migrateSleepState(d.sleep);
  if(!d.sleepGoal)d.sleepGoal=DEFAULT_SLEEP_GOAL;
  d.health=migrateHealthState(d.health);
  d.nutr=migrateNutritionState(d.nutr);
  if(d.pinnedTabs.join('|')==='home|water|habits|focus')d.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(d.finance){
    d.finance.schemaVersion=FINANCE_SCHEMA_VERSION;
    if(!Array.isArray(d.finance.categories)||!d.finance.categories.length)d.finance.categories=DEFAULT_FINANCE_CATEGORIES.slice();
    if(!d.finance.ui)d.finance.ui={actionOpen:false,activeAction:null};
    if(!Array.isArray(d.finance.recurring))d.finance.recurring=[];
    if(!d.finance.budgets)d.finance.budgets={};
    if(!d.finance.house)d.finance.house={};
    if(!Array.isArray(d.finance.house.projects))d.finance.house.projects=JSON.parse(JSON.stringify(DEFAULT_HOUSE_PROJECTS||[]));
    if(typeof d.finance.ui.actionOpen!=='boolean')d.finance.ui.actionOpen=false;
    if(!('activeAction' in d.finance.ui))d.finance.ui.activeAction=null;
  }
  d.schemaVersion=APP_SCHEMA_VERSION;
  return d;
}
function normalizeStateAfterLoad(){
  S.water=migrateWaterState(S.water);
  S.focus=migrateFocusState(S.focus);
  if(!Array.isArray(S.pinnedTabs)||!S.pinnedTabs.length)S.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(!Array.isArray(S.taskCategories)||!S.taskCategories.length)S.taskCategories=DEFAULT_TASK_CATEGORIES.slice();
  if(!S.taskView)S.taskView='today';
  S.sleep=migrateSleepState(S.sleep);
  if(!S.sleepGoal)S.sleepGoal=DEFAULT_SLEEP_GOAL;
  S.health=migrateHealthState(S.health);
  S.nutr=migrateNutritionState(S.nutr);
  if(!S.finance) return;
  S.finance.schemaVersion=FINANCE_SCHEMA_VERSION;
  if(!Array.isArray(S.finance.categories)||!S.finance.categories.length)S.finance.categories=DEFAULT_FINANCE_CATEGORIES.slice();
  if(!S.finance.ui)S.finance.ui={actionOpen:false,activeAction:null};
  if(!Array.isArray(S.finance.recurring))S.finance.recurring=[];
  if(!S.finance.budgets)S.finance.budgets={};
  if(!S.finance.house)S.finance.house={};
  if(!Array.isArray(S.finance.house.projects))S.finance.house.projects=JSON.parse(JSON.stringify(DEFAULT_HOUSE_PROJECTS||[]));
}


/* ━━━━ V15 — MIGRAÇÃO DE HÁBITOS ━━━━ */
function migrateHabitState(list){
  if(!Array.isArray(list))return [];
  return list.map(h=>{
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
  });
}


/* ━━━━ V16 — MIGRAÇÃO DE SAÚDE ━━━━ */
function migrateHealthState(health){
  const h=health||{};
  h.steps=Number(h.steps)||0;
  if(!h.stepsLog||typeof h.stepsLog!=='object')h.stepsLog={};
  if(!Array.isArray(h.acts))h.acts=[];
  if(!Array.isArray(h.diary))h.diary=[];
  if(!Array.isArray(h.weightLog))h.weightLog=[];
  if(!Array.isArray(h.breathSessions))h.breathSessions=[];
  const today=dayKey(new Date());
  h.acts=h.acts.map(a=>({
    id:a.id||Date.now()+Math.floor(Math.random()*1000),
    name:a.name||a.n||'Atividade',
    min:Number(a.min??a.minutes)||0,
    intensity:a.intensity||'moderada',
    note:a.note||'',
    time:a.time||'',
    date:a.date||today
  }));
  h.diary=h.diary.map(d=>({
    id:d.id||Date.now()+Math.floor(Math.random()*1000),
    date:d.date||today,
    weight:Number(d.weight)||0,
    mood:d.mood||'neutral',
    energy:Math.max(1,Math.min(5,Number(d.energy)||3)),
    pain:Math.max(0,Math.min(5,Number(d.pain)||0)),
    note:d.note||'',
    createdAt:d.createdAt||Date.now(),
    updatedAt:d.updatedAt||d.createdAt||Date.now()
  }));
  h.weightLog=h.weightLog.map(w=>({
    id:w.id||Date.now()+Math.floor(Math.random()*1000),
    date:w.date||today,
    weight:Number(w.weight)||0,
    createdAt:w.createdAt||Date.now()
  })).filter(w=>w.weight>0);
  return h;
}


/* ━━━━ V17 — MIGRAÇÃO DE NUTRIÇÃO ━━━━ */
function migrateNutritionState(nutr){
  const n=nutr||{};
  const today=dayKey(new Date());
  ['b','l','s','d','c'].forEach(k=>{if(!Array.isArray(n[k]))n[k]=[];});
  if(!Array.isArray(n.favorites))n.favorites=[];
  if(!n.goals||typeof n.goals!=='object')n.goals={...DEFAULT_NUTRITION_GOALS};
  n.goals.calories=Number(n.goals.calories)||0;
  n.goals.protein=Number(n.goals.protein)||0;
  ['b','l','s','d','c'].forEach(meal=>{
    n[meal]=n[meal].map(it=>({
      id:it.id||Date.now()+Math.floor(Math.random()*1000),
      n:it.n||it.name||'Registro',
      note:it.note||'',
      time:it.time||'',
      date:it.date||today,
      calories:Number(it.calories??it.c)||0,
      protein:Number(it.protein??it.p)||0,
      meal
    }));
  });
  n.favorites=n.favorites.map(f=>({
    id:f.id||Date.now()+Math.floor(Math.random()*1000),
    n:f.n||f.name||'Favorito',
    note:f.note||'',
    calories:Number(f.calories)||0,
    protein:Number(f.protein)||0,
    meal:f.meal&&DEFAULT_NUTRITION_MEALS[f.meal]?f.meal:'s',
    createdAt:f.createdAt||Date.now()
  }));
  return n;
}


/* ━━━━ V18 — MIGRAÇÃO DE SONO ━━━━ */
function migrateSleepState(list){
  if(!Array.isArray(list))return [];
  const today=dayKey(new Date());
  return list.map((e,idx)=>{
    const type=e.type||'night';
    const bed=/^\d{2}:\d{2}$/.test(String(e.bed||''))?e.bed:'23:00';
    const wake=/^\d{2}:\d{2}$/.test(String(e.wake||''))?e.wake:'07:00';
    const dateKey=e.dateKey||e.key||today;
    let minutes=Number(e.minutes)||0;
    if(!minutes && e.h)minutes=Math.round(Number(e.h)*60);
    if(!minutes && type!=='nap'){
      const bm=Number(bed.split(':')[0])*60+Number(bed.split(':')[1]);
      const wm=Number(wake.split(':')[0])*60+Number(wake.split(':')[1]);
      minutes=wm-bm;
      if(minutes<=0)minutes+=1440;
    }
    if(!minutes)minutes=type==='nap'?20:480;
    return {
      id:e.id||Date.now()+idx,
      type,
      h:Math.round(minutes/6)/10,
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


/* ━━━━ V19 — MIGRAÇÃO DE ÁGUA ━━━━ */
function migrateWaterState(water){
  const w=water||{};
  const today=dayKey(new Date());
  w.amt=Number(w.amt)||0;
  w.goal=Number(w.goal)||DEFAULT_WATER_GOAL;
  if(!Array.isArray(w.log))w.log=[];
  if(!w.history||typeof w.history!=='object')w.history={};
  if(!Array.isArray(w.presets)||!w.presets.length)w.presets=DEFAULT_WATER_PRESETS.slice();
  w.log=w.log.map((it,i)=>({
    id:it.id||Date.now()+i,
    ml:Number(it.ml)||0,
    time:it.time||new Date().toISOString(),
    date:it.date||today
  })).filter(it=>it.ml>0);
  Object.keys(w.history).forEach(k=>{
    const h=w.history[k]||{};
    w.history[k]={
      date:k,
      amt:Number(h.amt)||0,
      goal:Number(h.goal)||w.goal,
      count:Number(h.count)||0,
      hit:!!h.hit,
      updatedAt:h.updatedAt||Date.now()
    };
  });
  const todayAmt=w.log.filter(it=>it.date===today).reduce((a,it)=>a+Number(it.ml||0),0);
  w.amt=todayAmt || (w.amt&&w.log.some(it=>it.date===today)?w.amt:todayAmt);
  w.history[today]={date:today,amt:w.amt,goal:w.goal,count:w.log.filter(it=>it.date===today).length,hit:w.amt>=w.goal,updatedAt:Date.now()};
  return w;
}


/* ━━━━ V20 — MIGRAÇÃO DE FOCO ━━━━ */
function migrateFocusState(focus){
  const f=focus||{};
  f.type=Number(f.type)||25;
  f.brkType=Number(f.brkType)||5;
  f.running=false;
  f.onBreak=!!f.onBreak;
  f.remaining=Number(f.remaining)||f.type*60;
  f.sessions=Number(f.sessions)||0;
  f.iv=null;
  f.preset=f.preset||'pomodoro';
  f.custom=f.custom||{focus:30,break:5};
  if(!Array.isArray(f.logs))f.logs=[];
  const today=dayKey(new Date());
  f.logs=f.logs.map((l,i)=>({
    id:l.id||Date.now()+i,
    date:l.date||dayKey(new Date(l.endedAt||l.createdAt||Date.now())),
    duration:Number(l.duration)||Number(l.minutes)||f.type,
    focusLevel:Number(l.focusLevel)||3,
    distraction:Number(l.distraction)||1,
    note:l.note||'',
    label:l.label||'Sessão de foco',
    startedAt:l.startedAt||l.createdAt||Date.now(),
    endedAt:l.endedAt||l.createdAt||Date.now(),
    completed:l.completed!==false
  })).sort((a,b)=>(b.endedAt||0)-(a.endedAt||0));
  f.sessions=f.logs.filter(l=>l.date===today&&l.completed!==false).length;
  f.startedAt=null;
  f.currentStartedAt=null;
  return f;
}
