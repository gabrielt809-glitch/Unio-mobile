/* Unio Base Organizada v10 */
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
    financeSchemaVersion:S.finance?.schemaVersion||null,
    activeTab:S.curTab,
    pinnedTabs:Array.isArray(S.pinnedTabs)?S.pinnedTabs.slice():[],
    tasks:Array.isArray(S.tasks)?S.tasks.length:0,
    habits:Array.isArray(S.habits)?S.habits.length:0,
    sleep:Array.isArray(S.sleep)?S.sleep.length:0,
    healthActivities:Array.isArray(S.health?.acts)?S.health.acts.length:0,
    finance:{
      accounts:Array.isArray(S.finance?.accounts)?S.finance.accounts.length:0,
      cards:Array.isArray(S.finance?.cards)?S.finance.cards.length:0,
      transactions:Array.isArray(S.finance?.transactions)?S.finance.transactions.length:0,
      houseBills:Array.isArray(S.finance?.house?.bills)?S.finance.house.bills.length:0
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
