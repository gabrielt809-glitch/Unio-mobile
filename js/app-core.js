/* Unio Base Organizada v9.5.1 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP CORE — commit global e renderização controlada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function commitApp(options={}){
  return (typeof safeRun==='function')?safeRun(()=>{
    if(typeof saveState==='function')saveState();
    if(options.render===false)return;
    const targets=Array.isArray(options.targets)?options.targets:[];
    if(!targets.length){
      if(typeof refreshAll==='function')refreshAll();
      return;
    }
    targets.forEach(target=>{
    if(target==='home'&&typeof renderHome==='function')renderHome();
    if(target==='finance'&&typeof renderFinance==='function')renderFinance();
    if(target==='water'&&typeof renderWater==='function')renderWater();
    if(target==='tasks'){
      if(typeof renderWeekStrip==='function')renderWeekStrip();
      if(typeof renderTasks==='function')renderTasks();
    }
    if(target==='sleep'){
      if(typeof renderSleep==='function')renderSleep();
      if(typeof renderSleepChart==='function')renderSleepChart();
    }
    if(target==='nutrition'&&typeof renderNutr==='function')renderNutr();
    if(target==='health'&&typeof renderHealth==='function')renderHealth();
    if(target==='habits'&&typeof renderHabits==='function')renderHabits();
    if(target==='focus'&&typeof renderFocusTimer==='function')renderFocusTimer();
    if(target==='tabs'&&typeof buildTabBar==='function')buildTabBar();
    });
  },'Não foi possível atualizar o app.'):null;
}
function commitModule(moduleName,options={}){
  const targets=[moduleName];
  if(options.home!==false && moduleName!=='home')targets.push('home');
  commitApp({targets});
}
