/* Unio Base Organizada v9.5 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP MIGRATIONS — migração global de estado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function migrateLoadedState(data){
  const d=data||{};
  if(!d.schemaVersion)d.schemaVersion=1;
  if(!Array.isArray(d.pinnedTabs)||!d.pinnedTabs.length)d.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(d.pinnedTabs.join('|')==='home|water|habits|focus')d.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(d.finance){
    d.finance.schemaVersion=FINANCE_SCHEMA_VERSION;
    if(!Array.isArray(d.finance.categories)||!d.finance.categories.length)d.finance.categories=DEFAULT_FINANCE_CATEGORIES.slice();
    if(!d.finance.ui)d.finance.ui={actionOpen:false,activeAction:null};
    if(typeof d.finance.ui.actionOpen!=='boolean')d.finance.ui.actionOpen=false;
    if(!('activeAction' in d.finance.ui))d.finance.ui.activeAction=null;
  }
  d.schemaVersion=APP_SCHEMA_VERSION;
  return d;
}
function normalizeStateAfterLoad(){
  if(!Array.isArray(S.pinnedTabs)||!S.pinnedTabs.length)S.pinnedTabs=DEFAULT_PINNED_TABS.slice();
  if(!S.finance) return;
  S.finance.schemaVersion=FINANCE_SCHEMA_VERSION;
  if(!Array.isArray(S.finance.categories)||!S.finance.categories.length)S.finance.categories=DEFAULT_FINANCE_CATEGORIES.slice();
  if(!S.finance.ui)S.finance.ui={actionOpen:false,activeAction:null};
}
