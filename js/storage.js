/* Unio Base Organizada v9 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PERSISTÊNCIA — localStorage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STORE_KEY='unio_v4';
function saveState(){
  try{
    const p={
      activeDay:S.activeDay,
      water:S.water,
      tasks:S.tasks,
      sleep:S.sleep,
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
        remaining:S.focus.running?S.focus.type*60:S.focus.remaining
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
    const d=JSON.parse(raw);
    if(d.activeDay)S.activeDay=d.activeDay;
    if(d.water)Object.assign(S.water,d.water);
    if(d.tasks)S.tasks=d.tasks;
    if(d.sleep)S.sleep=d.sleep;
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
    }
    if(d.tId)tId=d.tId;
    if(d.habId)habId=d.habId;
    if(d.financeTxId)financeTxId=d.financeTxId;
    if(d.financeAccountId)financeAccountId=d.financeAccountId;
    if(d.financeCardId)financeCardId=d.financeCardId;
    if(d.financeBillId)financeBillId=d.financeBillId;
    if(S.water.log)S.water.log=S.water.log.map(it=>({...it,time:new Date(it.time)}));
    ensureDailyState?.({silent:true});
    return true;
  }catch(e){console.warn('Unio load error',e);return false;}
}

function mergeFinanceState(saved){
  const base=JSON.parse(JSON.stringify(S.finance));
  const fin={...base,...saved};
  fin.accounts=Array.isArray(saved.accounts)?saved.accounts:base.accounts;
  fin.cards=Array.isArray(saved.cards)?saved.cards:base.cards;
  fin.categories=Array.isArray(saved.categories)?saved.categories:base.categories;
  fin.transactions=Array.isArray(saved.transactions)?saved.transactions:base.transactions;
  fin.house={...base.house,...(saved.house||{})};
  fin.house.people=Array.isArray(saved.house?.people)?saved.house.people:base.house.people;
  fin.house.bills=Array.isArray(saved.house?.bills)?saved.house.bills:base.house.bills;
  return fin;
}
function migratePinnedTabsForFinance(saved){
  const oldDefault=Array.isArray(saved.pinnedTabs)&&saved.pinnedTabs.join('|')==='home|water|habits|focus';
  if(oldDefault){S.pinnedTabs=['home','finance','water','habits'];return;}
  if(!Array.isArray(S.pinnedTabs)||!S.pinnedTabs.length)S.pinnedTabs=['home','finance','water','habits'];
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
