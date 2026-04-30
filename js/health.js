/* Unio Base Organizada v1 */
/* ━━━━ HEALTH ━━━━ */
function saveSteps(){const v=parseInt(document.getElementById('stepsInp').value)||0;S.health.steps=v;renderHealth();}
function addSteps(n){S.health.steps+=n;document.getElementById('stepsInp').value=S.health.steps;renderHealth();}
function renderActOptions(q=''){
  const re=document.getElementById('actRes');
  if(!re)return;
  const term=(q||'').trim();
  const hits=term
    ? ACTL.filter(a=>norm(a.n).includes(norm(term))||norm(a.cat).includes(norm(term)))
    : ACTL;
  const shown=term?hits.slice(0,24):hits;
  const c30=a=>Math.round(a.met*S.weight*0.5);
  if(!shown.length){
    re.innerHTML='<div class="empty" style="padding:14px;font-size:12px;"><em>🔎</em>Nenhuma atividade encontrada</div>';
    re.classList.add('on');
    return;
  }
  re.innerHTML=shown.map(a=>`<div class="dr-item" onclick="openActModal(${a.id})"><div style="flex:1;min-width:0;"><div class="dr-name">${a.n}</div><div class="dr-info">${a.cat} · ~${c30(a)} kcal/30min</div></div><button class="dr-add" style="background:var(--orange);" onclick="event.stopPropagation();openActModal(${a.id})">+</button></div>`).join('');
  re.classList.add('on');
}
function showActList(){renderActOptions(document.getElementById('actQ')?.value||'');}
function searchAct(q){renderActOptions(q);}
function openActModal(id){selAct=ACTL.find(a=>a.id===id);document.getElementById('mActNm').textContent=selAct.n;document.getElementById('actMinInp').value=30;updateActPrev();openModal('actModal');}
function updateActPrev(){if(!selAct)return;const m=parseInt(document.getElementById('actMinInp').value)||0;document.getElementById('actCalPrev').textContent=`≈ ${Math.round(selAct.met*S.weight*(m/60))} kcal queimadas`;}
function confirmAct(){if(!selAct)return;const m=parseInt(document.getElementById('actMinInp').value)||0;const cal=Math.round(selAct.met*S.weight*(m/60));S.health.acts.unshift({id:Date.now(),n:selAct.n,min:m,cal,cat:selAct.cat});closeModal('actModal');document.getElementById('actQ').value='';haptic('success');showToast('Atividade registrada! 🏃','');renderHealth();showActList();}
function rmAct(id){S.health.acts=S.health.acts.filter(x=>x.id!==id);renderHealth();}
function renderHealth(){const{steps,acts}=S.health;const totalCal=acts.reduce((a,x)=>a+x.cal,0),totalMin=acts.reduce((a,x)=>a+x.min,0);document.getElementById('hSteps').textContent=steps.toLocaleString('pt-BR');document.getElementById('hCalB').textContent=totalCal;document.getElementById('hActN').textContent=acts.length;document.getElementById('hActMin').textContent=totalMin;document.getElementById('stepsInp').value=steps||'';const log=document.getElementById('actLog'),em=document.getElementById('actEmpty');log.querySelectorAll('.act-item').forEach(e=>e.remove());em.style.display=acts.length?'none':'block';acts.forEach(a=>{const d=document.createElement('div');d.className='act-item';d.innerHTML=`<div><div class="act-nm">${a.n}</div><div class="act-det">${a.cat} · ${a.min} min</div></div><div style="display:flex;align-items:center;gap:5px;"><div class="act-cal">${a.cal} kcal</div><button class="act-rm" onclick="rmAct(${a.id})">×</button></div>`;log.appendChild(d);});}
