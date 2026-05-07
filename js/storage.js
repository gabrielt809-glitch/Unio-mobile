/* Unio Base Organizada v25 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PERSISTÊNCIA — localStorage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STORE_KEY='unio_v4';
function saveState(){
  try{
    const p={
      schemaVersion:APP_SCHEMA_VERSION,
      activeDay:S.activeDay,
      water:S.water,
      tasks:S.tasks,
      taskCategories:S.taskCategories,
      taskView:S.taskView,
      sleep:S.sleep,
      sleepGoal:S.sleepGoal,
      nutr:S.nutr,
      health:S.health,
      habits:S.habits,
      selDay:S.selDay,
      taskWeekAnchor:S.taskWeekAnchor,
      tNoDate:S.tNoDate,
      weight:S.weight,
      pinnedTabs:S.pinnedTabs,
      curTab:S.curTab,
      focus:{
        type:S.focus.type,
        brkType:S.focus.brkType,
        sessions:S.focus.sessions,
        onBreak:false,
        remaining:S.focus.running?S.focus.type*60:S.focus.remaining,
        preset:S.focus.preset||'pomodoro',
        custom:S.focus.custom||{focus:30,break:5},
        logs:Array.isArray(S.focus.logs)?S.focus.logs:[]
      },
      finance:S.finance,
      breathMode:S.breathMode,
      tId,
      habId,
      financeTxId,
      financeAccountId,
      financeCardId,
      financeBillId,
      savedAt:Date.now()
    };
    localStorage.setItem(STORE_KEY,JSON.stringify(p));
  }catch(e){console.warn('Unio save error',e);}
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw)return false;
    let d=JSON.parse(raw);
    if(typeof migrateLoadedState==='function')d=migrateLoadedState(d);
    if(d.activeDay)S.activeDay=d.activeDay;
    if(d.water)Object.assign(S.water,d.water);
    if(d.tasks)S.tasks=d.tasks;
    if(d.taskCategories)S.taskCategories=d.taskCategories;
    if(d.taskView)S.taskView=d.taskView;
    if(d.sleep)S.sleep=d.sleep;
    if(d.sleepGoal)S.sleepGoal=d.sleepGoal;
    if(d.nutr)S.nutr=d.nutr;
    if(d.health)S.health=d.health;
    if(d.habits)S.habits=d.habits;
    if(d.selDay)S.selDay=d.selDay;
    if(d.taskWeekAnchor)S.taskWeekAnchor=d.taskWeekAnchor;
    if(typeof d.tNoDate==='boolean')S.tNoDate=d.tNoDate;
    if(d.weight)S.weight=d.weight;
    if(d.pinnedTabs)S.pinnedTabs=d.pinnedTabs;
    if(d.curTab)S.curTab=d.curTab;
    if(d.finance)S.finance=mergeFinanceState(d.finance);
    migratePinnedTabsForFinance(d);
    if(d.breathMode)S.breathMode=d.breathMode;
    if(d.focus){
      S.focus.type=d.focus.type??25;
      S.focus.brkType=d.focus.brkType??5;
      S.focus.sessions=d.focus.sessions??0;
      S.focus.onBreak=false;
      S.focus.running=false;
      S.focus.remaining=d.focus.remaining??(S.focus.type*60);
      S.focus.preset=d.focus.preset||'pomodoro';
      S.focus.custom=d.focus.custom||{focus:30,break:5};
      S.focus.logs=Array.isArray(d.focus.logs)?d.focus.logs:[];
      S.focus.startedAt=null;
      S.focus.currentStartedAt=null;
      S.focus.iv=null;
    }
    if(d.tId)tId=d.tId;
    if(d.habId)habId=d.habId;
    if(d.financeTxId)financeTxId=d.financeTxId;
    if(d.financeAccountId)financeAccountId=d.financeAccountId;
    if(d.financeCardId)financeCardId=d.financeCardId;
    if(d.financeBillId)financeBillId=d.financeBillId;
    if(S.water.log)S.water.log=S.water.log.map(it=>({...it,time:new Date(it.time)}));
    if(typeof normalizeStateAfterLoad==='function')normalizeStateAfterLoad();
    ensureDailyState?.({silent:true});
    return true;
  }catch(e){console.warn('Unio load error',e);return false;}
}

function mergeFinanceState(saved){
  const base=JSON.parse(JSON.stringify(S.finance));
  const source=saved||{};
  const fin={...base,...source};
  fin.schemaVersion=FINANCE_SCHEMA_VERSION;
  fin.accounts=Array.isArray(source.accounts)?source.accounts:base.accounts;
  fin.cards=Array.isArray(source.cards)?source.cards:base.cards;
  fin.categories=Array.isArray(source.categories)?source.categories:base.categories;
  fin.transactions=Array.isArray(source.transactions)?source.transactions:base.transactions;
  fin.recurring=Array.isArray(source.recurring)?source.recurring:(Array.isArray(base.recurring)?base.recurring:[]);
  fin.budgets={...(base.budgets||{}),...(source.budgets||{})};
  fin.ui={...base.ui,...(source.ui||{})};
  fin.house={...base.house,...(source.house||{})};
  fin.house.people=Array.isArray(source.house?.people)?source.house.people:base.house.people;
  fin.house.bills=Array.isArray(source.house?.bills)?source.house.bills:base.house.bills;
  fin.house.projects=Array.isArray(source.house?.projects)?source.house.projects:(Array.isArray(base.house?.projects)?base.house.projects:JSON.parse(JSON.stringify(DEFAULT_HOUSE_PROJECTS||[])));
  return migrateFinanceState(fin);
}
function migrateFinanceState(fin){
  fin.accounts=(fin.accounts||[]).map(a=>({
    id:a.id,
    name:a.name||'Conta',
    type:a.type||'Conta',
    balance:Number(a.balance)||0,
    createdAt:a.createdAt||Date.now(),
    updatedAt:a.updatedAt||a.createdAt||Date.now()
  }));
  fin.cards=(fin.cards||[]).map(c=>({
    id:c.id,
    name:c.name||'Cartão',
    limit:Number(c.limit)||0,
    closingDay:clamp(parseInt(c.closingDay)||20,1,31),
    dueDay:clamp(parseInt(c.dueDay)||27,1,31),
    createdAt:c.createdAt||Date.now(),
    updatedAt:c.updatedAt||c.createdAt||Date.now()
  }));
  fin.transactions=(fin.transactions||[]).map(t=>({
    ...t,
    scope:t.scope||'personal',
    amount:Number(t.amount)||0,
    title:t.title||financeActionLabel?.(t.type)||'Lançamento',
    date:t.date||financeDateToday?.()||dayKey(new Date()),
    category:t.category||'Outros',
    createdAt:t.createdAt||Date.now(),
    cardPayment:!!t.cardPayment,
    installment:Number(t.installment)||null,
    installments:Number(t.installments)||null,
    installmentGroupId:t.installmentGroupId||null,
    totalAmount:Number(t.totalAmount)||null,
    updatedAt:t.updatedAt||t.createdAt||Date.now()
  }));
  fin.house.bills=(fin.house.bills||[]).map(b=>({
    ...b,
    title:b.title||'Conta da casa',
    amount:Number(b.amount)||0,
    date:b.date||financeDateToday?.()||dayKey(new Date()),
    category:b.category||'Casa',
    paidBy:b.paidBy||'none',
    paid:!!b.paid,
    projectId:b.projectId||'',
    createdAt:b.createdAt||Date.now(),
    updatedAt:b.updatedAt||b.createdAt||Date.now()
  }));
  fin.recurring=(fin.recurring||[]).map(r=>({
    id:r.id||Date.now(),
    type:r.type==='income'?'income':'expense',
    title:r.title||'Recorrência',
    amount:Number(r.amount)||0,
    category:r.category||'Outros',
    accountId:r.accountId||null,
    startMonth:r.startMonth||r.startDate?.slice(0,7)||financeMonthKey?.()||'2026-05',
    endMonth:r.endMonth||'',
    active:r.active!==false,
    createdAt:r.createdAt||Date.now(),
    updatedAt:r.updatedAt||r.createdAt||Date.now()
  }));
  fin.budgets=Object.fromEntries(Object.entries(fin.budgets||{}).map(([k,v])=>[k,Number(v)||0]));
  fin.house.projects=(fin.house.projects&&fin.house.projects.length?fin.house.projects:JSON.parse(JSON.stringify(DEFAULT_HOUSE_PROJECTS||[]))).map(p=>({
    id:p.id||Date.now(),
    name:p.name||'Projeto',
    emoji:p.emoji||'🏠',
    goal:Number(p.goal)||0,
    items:Array.isArray(p.items)?p.items.map(i=>({
      id:i.id||Date.now(),
      title:i.title||'Item',
      estimated:Number(i.estimated)||0,
      paid:Number(i.paid)||0,
      status:i.status||'planned',
      createdAt:i.createdAt||Date.now(),
      updatedAt:i.updatedAt||i.createdAt||Date.now()
    })):[],
    createdAt:p.createdAt||Date.now(),
    updatedAt:p.updatedAt||p.createdAt||Date.now()
  }));
  return fin;
}
function migratePinnedTabsForFinance(saved){
  const oldDefault=Array.isArray(saved.pinnedTabs)&&saved.pinnedTabs.join('|')==='home|water|habits|focus';
  if(oldDefault){S.pinnedTabs=DEFAULT_PINNED_TABS.slice();return;}
  if(!Array.isArray(S.pinnedTabs)||!S.pinnedTabs.length)S.pinnedTabs=DEFAULT_PINNED_TABS.slice();
}
function clearAllData(){
  if(!confirm('Apagar todos os dados do Unio?\nEsta ação não pode ser desfeita.'))return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(STORE_KEY+'_onboarded');
  localStorage.removeItem('unio_name');
  location.reload();
}
function autoSave(fn){return function(...a){const r=fn.apply(this,a);saveState();return r;};}
saveGoal=autoSave(saveGoal);addWater=autoSave(addWater);removeWater=autoSave(removeWater);removeWaterPreset=autoSave(removeWaterPreset);addTask=autoSave(addTask);toggleTask=autoSave(toggleTask);delTask=autoSave(delTask);logSleep=autoSave(logSleep);addDiaryFood=autoSave(addDiaryFood);rmFood=autoSave(rmFood);saveSteps=autoSave(saveSteps);addSteps=autoSave(addSteps);addHealthEntry=autoSave(addHealthEntry);rmAct=autoSave(rmAct);confirmHab=autoSave(confirmHab);toggleHabToday=autoSave(toggleHabToday);toggleHabDay=autoSave(toggleHabDay);rmHabit=autoSave(rmHabit);saveSettings=autoSave(saveSettings);tickFocus=autoSave(tickFocus);toggleNoDate=autoSave(toggleNoDate);shiftTaskWeek=autoSave(shiftTaskWeek);selectTaskDay=autoSave(selectTaskDay);moveTaskToDay=autoSave(moveTaskToDay);setFinanceView=autoSave(setFinanceView);shiftFinanceMonth=autoSave(shiftFinanceMonth);addFinanceTx=autoSave(addFinanceTx);deleteFinanceTx=autoSave(deleteFinanceTx);addFinanceAccount=autoSave(addFinanceAccount);deleteFinanceAccount=autoSave(deleteFinanceAccount);addFinanceCard=autoSave(addFinanceCard);deleteFinanceCard=autoSave(deleteFinanceCard);addHouseBill=autoSave(addHouseBill);toggleHouseBillPaid=autoSave(toggleHouseBillPaid);deleteHouseBill=autoSave(deleteHouseBill);setHouseSplitMode=autoSave(setHouseSplitMode);saveHousePeople=autoSave(saveHousePeople);
