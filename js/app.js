/* Unio Base Organizada v9.1 */
/* ━━━━ INIT ━━━━ */
loadState();
ensureDailyState({silent:true});
S_name=localStorage.getItem('unio_name')||'';

const isOnboarded=localStorage.getItem(STORE_KEY+'_onboarded')==='1';
const splashEl=$('splash');
const appEl=$('app');

function finishBootSplash(){
  if(!splashEl||!appEl)return;
  appEl.style.opacity='1';
  splashEl.classList.add('out');
  setTimeout(()=>{splashEl.style.display='none';},520);
}

if(isOnboarded){
  if(splashEl){
    splashEl.style.display='flex';
    splashEl.classList.add('sp-loading');
  }
  if(appEl)appEl.style.opacity='0';
}else{
  if(splashEl){
    splashEl.style.display='flex';
    splashEl.classList.remove('sp-loading');
  }
  if(appEl)appEl.style.opacity='0';
}

buildTabBar();
refreshAll();

const initialTab=S.pinnedTabs.includes(S.curTab)?S.curTab:'home';
if(initialTab!=='home')switchTabById(initialTab);
else animateHeader('Início','');

if(isOnboarded){
  setTimeout(finishBootSplash,700);
  const lastToast=localStorage.getItem('unio_last_toast');
  const today=new Date().toDateString();
  if(lastToast!==today){
    localStorage.setItem('unio_last_toast',today);
    setTimeout(()=>showToast('Bem-vindo de volta! 👋','',2200),1500);
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
