/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP DIAGNOSTICS — diagnóstico local para futuras telas de backup/suporte
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function getAppDiagnostics(){
  let storageBytes=0;
  try{
    const raw=localStorage.getItem(STORE_KEY)||'';
    storageBytes=new Blob([raw]).size;
  }catch(_){}
  return {
    appSchemaVersion:typeof APP_SCHEMA_VERSION!=='undefined'?APP_SCHEMA_VERSION:null,
    water:{goal:S.water?.goal||0,amount:S.water?.amt||0,logs:Array.isArray(S.water?.log)?S.water.log.length:0,history:S.water?.history?Object.keys(S.water.history).length:0,presets:Array.isArray(S.water?.presets)?S.water.presets.length:0},
    financeSchemaVersion:S.finance?.schemaVersion||null,
    profileName:(typeof S_name!=='undefined'?S_name:''),
    visualPolishVersion:'v23',
    activeTab:S.curTab,
    pinnedTabs:Array.isArray(S.pinnedTabs)?S.pinnedTabs.slice():[],
    tasks:Array.isArray(S.tasks)?S.tasks.length:0,
    taskCategories:Array.isArray(S.taskCategories)?S.taskCategories.length:0,
    habits:Array.isArray(S.habits)?S.habits.length:0,
    habitLogs:Array.isArray(S.habits)?S.habits.reduce((a,h)=>a+(Array.isArray(h.log)?h.log.length:0),0):0,
    sleep:Array.isArray(S.sleep)?S.sleep.length:0,
    sleepNaps:Array.isArray(S.sleep)?S.sleep.filter(s=>s.type==='nap').length:0,
    sleepGoal:S.sleepGoal||DEFAULT_SLEEP_GOAL,
    nutritionItems:S.nutr?Object.values(S.nutr).filter(Array.isArray).flat().length:0,
    nutritionFavorites:Array.isArray(S.nutr?.favorites)?S.nutr.favorites.length:0,
    healthActivities:Array.isArray(S.health?.acts)?S.health.acts.length:0,
    healthDiary:Array.isArray(S.health?.diary)?S.health.diary.length:0,
    healthWeights:Array.isArray(S.health?.weightLog)?S.health.weightLog.length:0,
    breathSessions:Array.isArray(S.health?.breathSessions)?S.health.breathSessions.length:0,
    focusLogs:Array.isArray(S.focus?.logs)?S.focus.logs.length:0,
    focusSessionsToday:typeof focusTodayLogs==='function'?focusTodayLogs().length:(S.focus?.sessions||0),
    homeScore:typeof getHomeContext==='function'&&typeof calculateHomeScore==='function'?calculateHomeScore(getHomeContext()):null,
    finance:{
      accounts:Array.isArray(S.finance?.accounts)?S.finance.accounts.length:0,
      cards:Array.isArray(S.finance?.cards)?S.finance.cards.length:0,
      transactions:Array.isArray(S.finance?.transactions)?S.finance.transactions.length:0,
      houseBills:Array.isArray(S.finance?.house?.bills)?S.finance.house.bills.length:0,
      recurring:Array.isArray(S.finance?.recurring)?S.finance.recurring.length:0,
      budgets:S.finance?.budgets?Object.keys(S.finance.budgets).length:0,
      houseProjects:Array.isArray(S.finance?.house?.projects)?S.finance.house.projects.length:0
    },
    storageBytes,
    savedAt:new Date().toISOString()
  };
}
function logAppDiagnostics(){
  const diagnostics=getAppDiagnostics();
  console.table?.(diagnostics);
  console.log('[Unio diagnostics]',diagnostics);
  return diagnostics;
}
