/* Unio Base Organizada v2 */
/* ━━━━ SPLASH ━━━━ */
function startApp(){const willOnboard=!localStorage.getItem(STORE_KEY+'_onboarded');document.getElementById('splash').classList.add('out');document.getElementById('app').style.opacity='1';setTimeout(()=>{document.getElementById('splash').style.display='none';if(willOnboard)showOnboarding();},600);}

/* ━━━━ CLOCK ━━━━ */
function tick(){const n=new Date(),h=String(n.getHours()).padStart(2,'0'),m=String(n.getMinutes()).padStart(2,'0');document.getElementById('clock').textContent=h+':'+m;}
tick();setInterval(tick,30000);

/* ━━━━ MENU ━━━━ */
function openMenu(){renderMenuItems();document.getElementById('menuOverlay').classList.add('on');document.getElementById('sideMenu').classList.add('on');}
function closeMenu(){document.getElementById('menuOverlay').classList.remove('on');document.getElementById('sideMenu').classList.remove('on');}
function renderMenuItems(){document.getElementById('menuItems').innerHTML=ALL_TABS.map(t=>`<div class="menu-item${S.curTab===t.id?' act':''}" onclick="switchTabById('${t.id}');closeMenu();"><div class="mi-ico">${t.ico}</div><div class="mi-nm">${t.lbl}</div></div>`).join('');}

/* ━━━━ TABS ━━━━ */
function buildTabBar(){document.getElementById('tabbar').innerHTML=S.pinnedTabs.map(id=>{const t=ALL_TABS.find(x=>x.id===id)||ALL_TABS[0];return`<div class="tab${S.curTab===id?' active':''}" onclick="switchTabById('${id}')"><div class="tab-ico">${t.ico}</div><div class="tab-lbl">${t.lbl}</div></div>`;}).join('');}
function switchTabById(id){const t=ALL_TABS.find(x=>x.id===id);if(!t)return;if(id===S.curTab){renderCurrentTab();return;}haptic('light');const allIds=ALL_TABS.map(x=>x.id);const prevIdx=allIds.indexOf(S.curTab);const nextIdx=allIds.indexOf(id);const dir=nextIdx>prevIdx?'right':'left';const contentEl=document.querySelector('.content');if(contentEl)contentEl.scrollTop=0;document.querySelectorAll('.panel').forEach(p=>{p.classList.remove('active','slide-in-right','slide-in-left');});const newPanel=document.getElementById('tab-'+id);if(newPanel){newPanel.classList.add('active',dir==='right'?'slide-in-right':'slide-in-left');setTimeout(()=>newPanel.classList.remove('slide-in-right','slide-in-left'),300);}S.curTab=id;buildTabBar();const now=new Date();const sub=id==='tasks'?`${DL[now.getDay()]}, ${now.getDate()} de ${MS[now.getMonth()]}`:t.sub;animateHeader(t.title,sub);renderCurrentTab();}
function renderCurrentTab(){if(S.curTab==='sleep')renderSleepChart();if(S.curTab==='tasks'){renderWeekStrip();renderTasks();}if(S.curTab==='health')renderHealth();if(S.curTab==='home')renderHome();}

/* ━━━━ MODALS ━━━━ */
function openModal(id){if(id==='settingsModal'){document.getElementById('weightInp').value=S.weight;renderTabToggles();}if(id==='habModal'){document.getElementById('habNameInp').value='';habEmoji='💪';habFreq='diario';const eg=document.getElementById('habEmojiGrid');eg.innerHTML=HAB_EMOJIS.map(e=>`<button class="eg-btn${e===habEmoji?' sel':''}" onclick="pickHabEmoji('${e}',this)">${e}</button>`).join('');document.querySelectorAll('#habModal .chip').forEach((c,i)=>c.classList.toggle('on',i===0));}document.getElementById(id).classList.remove('off');}
function closeModal(id){document.getElementById(id).classList.add('off');}
['goalModal','customWater','habModal','settingsModal'].forEach(id=>{document.getElementById(id).addEventListener('click',function(e){if(e.target===this)closeModal(id);});});
