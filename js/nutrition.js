/* Unio Base Organizada v9.4 */
/* ━━━━ NUTRITION ━━━━ */
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
const MEAL_MAP={b:{el:'mB',kc:'kcB',label:'Café da manhã'},l:{el:'mL',kc:'kcL',label:'Almoço'},d:{el:'mD',kc:'kcD',label:'Jantar'},s:{el:'mS',kc:'kcS',label:'Lanche'}};
function pickMeal(m,el){selMeal=m;document.querySelectorAll('.n-meal-btn').forEach(c=>c.classList.remove('on'));if(el)el.classList.add('on');haptic('light');}
function addDiaryFood(){
  const name=$('foodNameInp').value.trim();
  if(!name)return;
  const note=$('foodNoteInp').value.trim();
  const time=$('foodTimeInp').value||nowTime();
  if(!Array.isArray(S.nutr[selMeal]))S.nutr[selMeal]=[];
  S.nutr[selMeal].push({id:Date.now(),n:name,note,time,date:dayKey(new Date())});
  $('foodNameInp').value='';
  $('foodNoteInp').value='';
  $('foodTimeInp').value='';
  haptic('success');
  showToast('Registro adicionado ao diário','🥗');
  renderNutr();
  renderHome?.();
}
function rmFood(m,id){S.nutr[m]=S.nutr[m].filter(x=>x.id!==id);renderNutr();renderHome?.();}
function renderNutr(){
  let total=0;
  Object.keys(MEAL_MAP).forEach(m=>{
    if(!Array.isArray(S.nutr[m]))S.nutr[m]=[];
    const items=S.nutr[m];
    total+=items.length;
    $(MEAL_MAP[m].kc).textContent=items.length+' '+(items.length===1?'item':'itens');
    const el=$(MEAL_MAP[m].el);
    el.innerHTML=items.length?items.map(it=>{
      const note=it.note?`<div class="food-note">${unioEscape(it.note)}</div>`:(it.por?`<div class="food-note">${safeNumber(it.por)}g${it.c?` · registro antigo com ${safeNumber(it.c)} kcal`:''}</div>`:'');
      const time=it.time?`<div class="food-time">🕒 ${unioEscape(it.time)}</div>`:'';
      return`<div class="food-item"><div style="flex:1;min-width:0;"><div class="food-nm">${unioEscape(it.n)}</div>${note}${time}</div><button class="food-rm" onclick="rmFood('${m}',${it.id})">×</button></div>`;
    }).join(''):'<div class="empty" style="padding:12px;font-size:12px;">Vazio</div>';
  });
  const countEl=$('nFoodCount');
  if(countEl)countEl.textContent=total;
}
