/* Unio Base Organizada v8.4 */
/* ━━━━ SPLASH ━━━━ */
function startApp(){
  const willOnboard=!localStorage.getItem(STORE_KEY+'_onboarded');
  const splash=$('splash');
  splash.classList.remove('sp-loading');
  splash.classList.add('out');
  $('app').style.opacity='1';
  setTimeout(()=>{splash.style.display='none';if(willOnboard)showOnboarding();},560);
}

/* ━━━━ CLOCK ━━━━ */
function tick(){const n=new Date(),h=String(n.getHours()).padStart(2,'0'),m=String(n.getMinutes()).padStart(2,'0');$('clock').textContent=h+':'+m;}
tick();setInterval(tick,30000);

/* ━━━━ MENU ━━━━ */
function openMenu(){renderMenuItems();$('menuOverlay').classList.add('on');$('sideMenu').classList.add('on');}
function closeMenu(){$('menuOverlay').classList.remove('on');$('sideMenu').classList.remove('on');}
function renderMenuItems(){$('menuItems').innerHTML=ALL_TABS.map(t=>`<div class="menu-item${S.curTab===t.id?' act':''}" onclick="switchTabById('${t.id}');closeMenu();"><div class="mi-ico">${t.ico}</div><div class="mi-nm">${t.lbl}</div></div>`).join('');}

/* ━━━━ TABS ━━━━ */
function buildTabBar(){
  const bar=$('tabbar');
  const pinned=S.pinnedTabs&&S.pinnedTabs.length?S.pinnedTabs:['home','water','habits','focus'];
  bar.style.setProperty('--tab-count',pinned.length);
  bar.setAttribute('role','tablist');
  bar.setAttribute('aria-label','Navegação principal');
  bar.innerHTML=pinned.map(id=>{
    const t=ALL_TABS.find(x=>x.id===id)||ALL_TABS[0];
    const active=S.curTab===id;
    return`<button type="button" class="tab${active?' active':''}" onclick="switchTabById('${id}')" aria-label="${t.lbl}" aria-current="${active?'page':'false'}"><span class="tab-ico" aria-hidden="true">${t.ico}</span><span class="tab-lbl">${t.lbl}</span></button>`;
  }).join('');
}
function switchTabById(id){
  ensureDailyState?.({silent:true});
  const t=ALL_TABS.find(x=>x.id===id);
  if(!t)return;
  if(id===S.curTab){renderCurrentTab();return;}
  haptic('light');
  const allIds=ALL_TABS.map(x=>x.id);
  const prevIdx=allIds.indexOf(S.curTab);
  const nextIdx=allIds.indexOf(id);
  const dir=nextIdx>prevIdx?'right':'left';
  const contentEl=document.querySelector('.content');
  if(contentEl)contentEl.scrollTop=0;
  document.querySelectorAll('.panel').forEach(p=>{p.classList.remove('active','slide-in-right','slide-in-left');});
  const newPanel=$('tab-'+id);
  if(newPanel){newPanel.classList.add('active',dir==='right'?'slide-in-right':'slide-in-left');setTimeout(()=>newPanel.classList.remove('slide-in-right','slide-in-left'),300);}
  S.curTab=id;
  buildTabBar();
  const now=new Date();
  const sub=id==='tasks'?`${DL[now.getDay()]}, ${now.getDate()} de ${MS[now.getMonth()]}`:t.sub;
  animateHeader(t.title,sub);
  renderCurrentTab();
  saveState?.();
}
function renderCurrentTab(){
  ensureDailyState?.({silent:true});
  if(S.curTab==='home')renderHome();
  if(S.curTab==='water')renderWater();
  if(S.curTab==='tasks'){renderWeekStrip();renderTasks();}
  if(S.curTab==='sleep'){renderSleep();renderSleepChart();}
  if(S.curTab==='nutrition')renderNutr();
  if(S.curTab==='health')renderHealth();
  if(S.curTab==='habits')renderHabits();
  if(S.curTab==='focus')renderFocusTimer();
}

/* ━━━━ MODALS ━━━━ */
function openModal(id){
  if(id==='goalModal'){$('goalInp').value=S.water.goal||2000;}
  if(id==='customWater'){$('cwInp').value='';}
  if(id==='settingsModal'){$('weightInp').value=S.weight;renderTabToggles();}
  if(id==='habModal'){
    $('habNameInp').value='';
    habEmoji='💪';habFreq='diario';
    const eg=$('habEmojiGrid');
    eg.innerHTML=HAB_EMOJIS.map(e=>`<button class="eg-btn${e===habEmoji?' sel':''}" onclick="pickHabEmoji('${e}',this)">${e}</button>`).join('');
    document.querySelectorAll('#habModal .chip').forEach((c,i)=>c.classList.toggle('on',i===0));
  }
  $(id).classList.remove('off');
}
function closeModal(id){$(id).classList.add('off');}
['goalModal','customWater','habModal','settingsModal'].forEach(id=>{$(id).addEventListener('click',function(e){if(e.target===this)closeModal(id);});});
