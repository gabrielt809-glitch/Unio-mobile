/* Unio Base Organizada v1 */
/* ━━━━ INIT ━━━━ */
loadState();
S_name=localStorage.getItem('unio_name')||'';
buildTabBar();
renderWeekStrip();renderTasks();renderWater();renderNutr();renderSleep();renderSleepChart();renderHealth();renderBreathMode();renderHabits();renderFocusTimer();renderHome();if(S.curTab==='health')setTimeout(showActList,0);
const initialTab=S.pinnedTabs.includes(S.curTab)?S.curTab:'home';
if(initialTab!=='home')switchTabById(initialTab);
if(localStorage.getItem(STORE_KEY+'_onboarded')){const lastToast=localStorage.getItem('unio_last_toast');const today=new Date().toDateString();if(lastToast!==today){localStorage.setItem('unio_last_toast',today);setTimeout(()=>showToast('Bem-vindo de volta! 👋','',2200),1200);}}
