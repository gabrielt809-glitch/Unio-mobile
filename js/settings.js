/* Unio Base Organizada v23 */
/* ━━━━ SETTINGS PREMIUM ━━━━ */
function settingsNumber(value,fallback=0){
  const raw=String(value??'').replace(/\./g,'').replace(',','.');
  const n=Number(raw);
  return Number.isFinite(n)?n:fallback;
}
function settingsCurrentName(){
  try{return localStorage.getItem('unio_name')||S_name||'';}catch(_){return S_name||'';}
}
function renderTabToggles(){
  const box=document.getElementById('tabToggles');
  if(!box)return;
  const pinned=S.pinnedTabs||[];
  const ordered=[...ALL_TABS].sort((a,b)=>{
    const ai=pinned.indexOf(a.id),bi=pinned.indexOf(b.id);
    if(ai>=0&&bi>=0)return ai-bi;
    if(ai>=0)return -1;
    if(bi>=0)return 1;
    return 0;
  });
  box.innerHTML=ordered.map(t=>{
    const on=pinned.includes(t.id);
    return `<div class="set-tab-row v22 ${on?'on':''}">
      <div class="set-tab-main">
        <div class="set-tab-ico">${t.ico}</div>
        <div><strong>${t.lbl}</strong><span>${t.sub||t.title||''}</span></div>
      </div>
      <div class="toggle${on?' on':''}" onclick="toggleTabPin('${t.id}')"></div>
    </div>`;
  }).join('');
  const count=document.getElementById('settingsTabCount');
  if(count)count.textContent=`${pinned.length}/4`;
}
function toggleTabPin(id){
  if(S.pinnedTabs.includes(id)){
    if(S.pinnedTabs.length<=1){showToast?.('Mantenha pelo menos uma aba fixa');return;}
    S.pinnedTabs=S.pinnedTabs.filter(x=>x!==id);
  }else{
    if(S.pinnedTabs.length>=4){showToast?.('Limite de 4 abas fixas');return;}
    S.pinnedTabs.push(id);
  }
  renderTabToggles();
  renderSettingsAbout?.();
}
function populateSettingsFields(){
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val??'';};
  set('profileNameInp',settingsCurrentName());
  set('weightInp',S.weight||70);
  set('settingsWaterGoalInp',S.water?.goal||DEFAULT_WATER_GOAL);
  set('settingsSleepGoalInp',S.sleepGoal||DEFAULT_SLEEP_GOAL);
  set('settingsFocusMinInp',S.focus?.type||25);
  set('settingsBreakMinInp',S.focus?.brkType||5);
  set('settingsCaloriesInp',S.nutr?.goals?.calories||'');
  set('settingsProteinInp',S.nutr?.goals?.protein||'');
}
function applySuggestedSettings(){
  const weight=settingsNumber(document.getElementById('weightInp')?.value,S.weight||70);
  const water=Math.round((weight*(typeof WATER_GOAL_ML_PER_KG!=='undefined'?WATER_GOAL_ML_PER_KG:35))/50)*50;
  const waterInp=document.getElementById('settingsWaterGoalInp');
  const sleepInp=document.getElementById('settingsSleepGoalInp');
  const focusInp=document.getElementById('settingsFocusMinInp');
  const brkInp=document.getElementById('settingsBreakMinInp');
  if(waterInp)waterInp.value=water;
  if(sleepInp&&!sleepInp.value)sleepInp.value=8;
  if(focusInp&&!focusInp.value)focusInp.value=25;
  if(brkInp&&!brkInp.value)brkInp.value=5;
  showToast?.('Sugestões aplicadas','✨');
}
function saveSettings(){
  const name=(document.getElementById('profileNameInp')?.value||'').trim();
  S_name=name;
  localStorage.setItem('unio_name',name);

  const w=parseInt(document.getElementById('weightInp')?.value,10);
  if(w>0&&w<400)S.weight=w;

  const waterGoal=parseInt(document.getElementById('settingsWaterGoalInp')?.value,10);
  if(waterGoal>0){
    S.water.goal=waterGoal;
    if(typeof waterArchiveDay==='function')waterArchiveDay(dayKey(new Date()));
  }

  const sleepGoal=settingsNumber(document.getElementById('settingsSleepGoalInp')?.value,S.sleepGoal||DEFAULT_SLEEP_GOAL);
  if(sleepGoal>=4&&sleepGoal<=12)S.sleepGoal=sleepGoal;

  const focusMin=parseInt(document.getElementById('settingsFocusMinInp')?.value,10);
  const breakMin=parseInt(document.getElementById('settingsBreakMinInp')?.value,10);
  if(focusMin>0&&focusMin<=180){
    S.focus.type=focusMin;
    if(!S.focus.running&&!S.focus.onBreak)S.focus.remaining=focusMin*60;
  }
  if(breakMin>0&&breakMin<=60)S.focus.brkType=breakMin;
  S.focus.custom={focus:S.focus.type,break:S.focus.brkType};
  if(!S.focus.preset)S.focus.preset='custom';

  if(!S.nutr.goals)S.nutr.goals={...DEFAULT_NUTRITION_GOALS};
  const calories=settingsNumber(document.getElementById('settingsCaloriesInp')?.value,0);
  const protein=settingsNumber(document.getElementById('settingsProteinInp')?.value,0);
  S.nutr.goals.calories=Math.max(0,calories);
  S.nutr.goals.protein=Math.max(0,protein);

  if(!S.pinnedTabs.includes(S.curTab))S.curTab=S.pinnedTabs[0]||'home';
  buildTabBar();
  renderCurrentTab?.();
  saveState?.();
  renderSettingsAbout();
  renderDataTools?.();
  showToast?.('Configurações salvas','✅');
  closeModal('settingsModal');
}
function settingsStorageLabel(bytes){
  const kb=Math.max(1,Math.round((bytes||0)/1024));
  return kb>=1024?`${(kb/1024).toFixed(1)} MB`:`${kb} KB`;
}
function renderSettingsAbout(){
  const box=document.getElementById('settingsAboutBox');
  if(!box)return;
  const d=typeof getAppDiagnostics==='function'?getAppDiagnostics():{};
  const version=typeof APP_PUBLIC_VERSION!=='undefined'?APP_PUBLIC_VERSION:'v23';
  const cache=typeof APP_CACHE_LABEL!=='undefined'?APP_CACHE_LABEL:'unio-v23-cache-2026-05-06';
  box.innerHTML=`
    <div class="settings-about-grid">
      <div><span>Versão</span><strong>${version}</strong></div>
      <div><span>Schema</span><strong>${d.appSchemaVersion||APP_SCHEMA_VERSION}</strong></div>
      <div><span>Finanças</span><strong>${d.financeSchemaVersion||FINANCE_SCHEMA_VERSION}</strong></div>
      <div><span>Dados</span><strong>${settingsStorageLabel(d.storageBytes)}</strong></div>
    </div>
    <div class="settings-about-list">
      <div><span>Cache</span><strong>${cache}</strong></div>
      <div><span>Abas fixas</span><strong>${(S.pinnedTabs||[]).join(', ')}</strong></div>
      <div><span>Último diagnóstico</span><strong>${new Date().toLocaleString('pt-BR')}</strong></div>
    </div>`;
}
function renderSettingsPremium(){
  populateSettingsFields();
  renderTabToggles();
  renderDataTools?.();
  renderSettingsAbout();
}
