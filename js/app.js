/* Unio Base Organizada v3 */
/* ━━━━ INIT ━━━━ */
loadState();
S_name=localStorage.getItem('unio_name')||'';

const isOnboarded=localStorage.getItem(STORE_KEY+'_onboarded')==='1';
const splashEl=document.getElementById('splash');
const appEl=document.getElementById('app');

if(isOnboarded){
  if(splashEl)splashEl.style.display='none';
  if(appEl)appEl.style.opacity='1';
}else{
  if(splashEl)splashEl.style.display='flex';
  if(appEl)appEl.style.opacity='0';
}

buildTabBar();
renderWeekStrip();renderTasks();renderWater();renderNutr();renderSleep();renderSleepChart();renderHealth();renderBreathMode();renderHabits();renderFocusTimer();renderHome();

const initialTab=S.pinnedTabs.includes(S.curTab)?S.curTab:'home';
if(initialTab!=='home')switchTabById(initialTab);

if(isOnboarded){
  const lastToast=localStorage.getItem('unio_last_toast');
  const today=new Date().toDateString();
  if(lastToast!==today){
    localStorage.setItem('unio_last_toast',today);
    setTimeout(()=>showToast('Bem-vindo de volta! 👋','',2200),900);
  }
}