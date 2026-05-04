/* Unio Base Organizada v4 */
/* ━━━━ INIT ━━━━ */
loadState();
ensureDailyState({silent:true});
S_name=localStorage.getItem('unio_name')||'';

const isOnboarded=localStorage.getItem(STORE_KEY+'_onboarded')==='1';
const splashEl=$('splash');
const appEl=$('app');

if(isOnboarded){
  if(splashEl)splashEl.style.display='none';
  if(appEl)appEl.style.opacity='1';
}else{
  if(splashEl)splashEl.style.display='flex';
  if(appEl)appEl.style.opacity='0';
}

buildTabBar();
refreshAll();

const initialTab=S.pinnedTabs.includes(S.curTab)?S.curTab:'home';
if(initialTab!=='home')switchTabById(initialTab);
else animateHeader('Início','');

if(isOnboarded){
  const lastToast=localStorage.getItem('unio_last_toast');
  const today=new Date().toDateString();
  if(lastToast!==today){
    localStorage.setItem('unio_last_toast',today);
    setTimeout(()=>showToast('Bem-vindo de volta! 👋','',2200),900);
  }
}

setInterval(()=>{
  const changed=ensureDailyState({silent:false});
  if(changed)refreshAll();
},60000);

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    const changed=ensureDailyState({silent:true});
    if(changed)refreshAll();
  }
});
