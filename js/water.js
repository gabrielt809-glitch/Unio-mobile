/* Unio Base Organizada v9.4 */
/* ━━━━ WATER ━━━━ */
function toggleCustomCupSave(){const t=$('cwSaveToggle');if(t)t.classList.toggle('on');}
function addWater(ml){
  ml=parseInt(ml,10)||0;
  if(ml<=0)return;
  haptic('light');
  S.water.amt+=ml;
  S.water.log.unshift({ml,time:new Date(),date:dayKey(new Date())});
  renderWater();
  renderHome?.();
  if(S.water.amt>=S.water.goal&&S.water.amt-ml<S.water.goal){showBadge('Meta de água atingida!','Parabéns! 💧','🎯');}
}
function addWP(i){addWater(S.water.presets[i]);}
function addCustomW(){
  const v=parseInt($('cwInp').value,10)||0;
  if(v<=0)return;
  const saveCup=$('cwSaveToggle')?.classList.contains('on');
  if(saveCup&&!S.water.presets.includes(v)){
    S.water.presets.push(v);
    S.water.presets=S.water.presets.filter(x=>x>0).slice(0,10);
    showToast('Copo salvo como botão rápido','💧');
  }
  addWater(v);
  $('cwInp').value='';
  closeModal('customWater');
  renderWater();
}
function removeWaterPreset(i){if(i<4)return;const ml=S.water.presets[i];S.water.presets.splice(i,1);showToast(`Copo de ${ml}ml removido`,'');renderWater();}
function removeWater(i){S.water.amt=Math.max(0,S.water.amt-S.water.log[i].ml);S.water.log.splice(i,1);renderWater();renderHome?.();}
function saveGoal(){const v=parseInt($('goalInp').value,10);if(v>0){S.water.goal=v;renderWater();renderHome?.();}closeModal('goalModal');}
function renderWater(){
  if(!Array.isArray(S.water.presets)||!S.water.presets.length)S.water.presets=[150,250,350,500];
  const{amt,goal,log}=S.water;
  $('wAmt').textContent=amt;
  $('wGoalT').textContent='de '+goal+'ml';
  $('wGoalD').textContent=goal+' ml';
  const pct=Math.min(amt/goal,1),col=pct>=1?'#34C759':'#5AC8FA';
  const r=$('wRing');
  r.style.strokeDashoffset=490*(1-pct);
  r.style.stroke=col;
  $('wAmt').style.color=col;
  const row=$('waterPresetRow');
  if(row){row.innerHTML=S.water.presets.map((ml,i)=>`<div class="water-preset"><button class="qa-btn" onclick="addWP(${i})">+${ml}ml</button>${i>=4?`<button class="wp-del" onclick="event.stopPropagation();removeWaterPreset(${i})">×</button>`:''}</div>`).join('');}
  const logEl=$('wLog'),em=$('wEmpty');
  logEl.querySelectorAll('.w-log-item').forEach(e=>e.remove());
  em.style.display=log.length?'none':'block';
  log.forEach((it,i)=>{
    const d=document.createElement('div');
    d.className='w-log-item';
    const tm=it.time instanceof Date?it.time:new Date(it.time);
    const hh=String(tm.getHours()).padStart(2,'0'),mm=String(tm.getMinutes()).padStart(2,'0');
    d.innerHTML=`<div style="display:flex;align-items:center;"><div class="w-dot"></div><span style="font-size:15px;font-weight:500;">${it.ml}ml</span></div><div style="display:flex;align-items:center;gap:7px;"><span style="font-size:12px;color:var(--lbl2)">${hh}:${mm}</span><button class="w-del" onclick="removeWater(${i})">×</button></div>`;
    logEl.appendChild(d);
  });
}
