/* Unio Base Organizada v3 */
/* ━━━━ SETTINGS ━━━━ */
function renderTabToggles(){document.getElementById('tabToggles').innerHTML=ALL_TABS.map(t=>`<div class="set-tab-row"><div style="font-size:14px;font-weight:500;">${t.ico} ${t.lbl}</div><div class="toggle${S.pinnedTabs.includes(t.id)?' on':''}" onclick="toggleTabPin('${t.id}')"></div></div>`).join('');}
function toggleTabPin(id){if(S.pinnedTabs.includes(id)){if(S.pinnedTabs.length<=1)return;S.pinnedTabs=S.pinnedTabs.filter(x=>x!==id);}else{if(S.pinnedTabs.length>=4)return;S.pinnedTabs.push(id);}renderTabToggles();}
function saveSettings(){const w=parseInt(document.getElementById('weightInp').value);if(w>0&&w<400)S.weight=w;if(!S.pinnedTabs.includes(S.curTab))S.curTab=S.pinnedTabs[0];buildTabBar();closeModal('settingsModal');}
