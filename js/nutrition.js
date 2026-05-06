/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NUTRIÇÃO — módulo completo
   - refeições por período
   - favoritos
   - metas opcionais
   - histórico semanal
   - refeições frequentes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

const MEAL_MAP={
  b:{el:'mB',kc:'kcB',label:'Café da manhã',emoji:'☀️'},
  l:{el:'mL',kc:'kcL',label:'Almoço',emoji:'🌤'},
  s:{el:'mS',kc:'kcS',label:'Lanche',emoji:'🍎'},
  d:{el:'mD',kc:'kcD',label:'Jantar',emoji:'🌙'},
  c:{el:'mC',kc:'kcC',label:'Ceia',emoji:'🌌'}
};

function nutritionParseNumber(value){
  const n=Number(String(value||'').replace(/\./g,'').replace(',','.'));
  return Number.isFinite(n)?n:0;
}
function normalizeNutr(){
  if(!S.nutr)S.nutr={b:[],l:[],s:[],d:[],c:[],favorites:[],goals:{...DEFAULT_NUTRITION_GOALS}};
  Object.keys(MEAL_MAP).forEach(k=>{if(!Array.isArray(S.nutr[k]))S.nutr[k]=[];});
  if(!Array.isArray(S.nutr.favorites))S.nutr.favorites=[];
  if(!S.nutr.goals||typeof S.nutr.goals!=='object')S.nutr.goals={...DEFAULT_NUTRITION_GOALS};
  S.nutr.goals.calories=Number(S.nutr.goals.calories)||0;
  S.nutr.goals.protein=Number(S.nutr.goals.protein)||0;
  Object.keys(MEAL_MAP).forEach(meal=>{
    S.nutr[meal]=S.nutr[meal].map(it=>({
      id:it.id||Date.now()+Math.floor(Math.random()*1000),
      n:it.n||it.name||'Registro',
      note:it.note||'',
      time:it.time||'',
      date:it.date||dayKey(new Date()),
      calories:Number(it.calories??it.c)||0,
      protein:Number(it.protein??it.p)||0,
      meal
    }));
  });
  S.nutr.favorites=S.nutr.favorites.map(f=>({
    id:f.id||Date.now()+Math.floor(Math.random()*1000),
    n:f.n||f.name||'Favorito',
    note:f.note||'',
    calories:Number(f.calories)||0,
    protein:Number(f.protein)||0,
    meal:f.meal&&MEAL_MAP[f.meal]?f.meal:'s',
    createdAt:f.createdAt||Date.now()
  }));
}
function nutritionAllItems(){
  normalizeNutr();
  return Object.keys(MEAL_MAP).flatMap(m=>(S.nutr[m]||[]).map(it=>({...it,meal:m})));
}
function nutritionTodayItems(){
  const today=dayKey(new Date());
  return nutritionAllItems().filter(it=>(it.date||today)===today);
}
function nutritionItemsByDate(dateKey){
  return nutritionAllItems().filter(it=>(it.date||'')===dateKey);
}
function nutritionTotals(items=nutritionTodayItems()){
  return items.reduce((acc,it)=>{
    acc.count++;
    acc.calories+=Number(it.calories)||0;
    acc.protein+=Number(it.protein)||0;
    return acc;
  },{count:0,calories:0,protein:0});
}
function nutritionWeekKeys(){return weekKeys(dayKey(new Date()));}
function nutritionFrequentMeals(limit=5){
  const map=new Map();
  nutritionAllItems().forEach(it=>{
    const key=norm(it.n);
    if(!key)return;
    const cur=map.get(key)||{name:it.n,count:0,calories:0,protein:0};
    cur.count++;
    cur.calories+=Number(it.calories)||0;
    cur.protein+=Number(it.protein)||0;
    map.set(key,cur);
  });
  return [...map.values()].sort((a,b)=>b.count-a.count).slice(0,limit);
}
function pickMeal(m,el){
  if(!MEAL_MAP[m])m='s';
  selMeal=m;
  document.querySelectorAll('.n-meal-btn').forEach(c=>c.classList.remove('on'));
  if(el)el.classList.add('on');
  haptic('light');
}
function addDiaryFood(){
  normalizeNutr();
  const name=$('foodNameInp')?.value.trim();
  if(!name)return;
  const note=$('foodNoteInp')?.value.trim()||'';
  const time=$('foodTimeInp')?.value||nowTime();
  const calories=nutritionParseNumber($('foodCalInp')?.value);
  const protein=nutritionParseNumber($('foodProteinInp')?.value);
  if(!Array.isArray(S.nutr[selMeal]))S.nutr[selMeal]=[];
  S.nutr[selMeal].push({id:Date.now(),n:name,note,time,date:dayKey(new Date()),calories,protein,meal:selMeal});
  ['foodNameInp','foodNoteInp','foodTimeInp','foodCalInp','foodProteinInp'].forEach(id=>{const el=$(id);if(el)el.value='';});
  haptic('success');
  commitNutr('Registro adicionado ao diário');
}
function editFood(m,id){
  normalizeNutr();
  const it=(S.nutr[m]||[]).find(x=>String(x.id)===String(id));
  if(!it)return;
  openEditModal({
    title:'Editar refeição',
    subtitle:MEAL_MAP[m]?.label||'Refeição',
    fields:[
      {name:'n',label:'Descrição',value:it.n||'',placeholder:'Ex: arroz, feijão e frango'},
      {name:'note',label:'Observação',value:it.note||'',placeholder:'Opcional'},
      {name:'time',label:'Horário',type:'time',value:it.time||''},
      {name:'calories',label:'Calorias',type:'number',value:it.calories||'',inputmode:'decimal',placeholder:'Opcional'},
      {name:'protein',label:'Proteína (g)',type:'number',value:it.protein||'',inputmode:'decimal',placeholder:'Opcional'},
      {name:'meal',label:'Refeição',type:'select',value:m,options:Object.keys(MEAL_MAP).map(k=>({value:k,label:`${MEAL_MAP[k].emoji} ${MEAL_MAP[k].label}`}))}
    ],
    onSave(values){
      if(!String(values.n||'').trim()){showToast('Informe a refeição');return false;}
      const target=values.meal&&MEAL_MAP[values.meal]?values.meal:m;
      it.n=String(values.n).trim();
      it.note=String(values.note||'').trim();
      it.time=values.time||'';
      it.calories=nutritionParseNumber(values.calories);
      it.protein=nutritionParseNumber(values.protein);
      if(target!==m){
        S.nutr[m]=S.nutr[m].filter(x=>String(x.id)!==String(id));
        it.meal=target;
        S.nutr[target].push(it);
      }
      commitNutr();
    }
  });
}
function rmFood(m,id){
  if(!S.nutr[m])return;
  S.nutr[m]=S.nutr[m].filter(x=>String(x.id)!==String(id));
  commitNutr();
}
function favoriteFood(m,id){
  normalizeNutr();
  const it=(S.nutr[m]||[]).find(x=>String(x.id)===String(id));
  if(!it)return;
  const exists=S.nutr.favorites.some(f=>norm(f.n)===norm(it.n));
  if(exists){showToast('Já está nos favoritos');return;}
  S.nutr.favorites.unshift({id:Date.now(),n:it.n,note:it.note||'',calories:Number(it.calories)||0,protein:Number(it.protein)||0,meal:m,createdAt:Date.now()});
  commitNutr('Adicionado aos favoritos');
}
function addFavoriteToDiary(id){
  normalizeNutr();
  const fav=S.nutr.favorites.find(f=>String(f.id)===String(id));
  if(!fav)return;
  const meal=fav.meal||selMeal||'s';
  S.nutr[meal].push({id:Date.now(),n:fav.n,note:fav.note||'',time:nowTime(),date:dayKey(new Date()),calories:Number(fav.calories)||0,protein:Number(fav.protein)||0,meal});
  commitNutr('Favorito adicionado ao dia');
}
function deleteFavorite(id){
  S.nutr.favorites=(S.nutr.favorites||[]).filter(f=>String(f.id)!==String(id));
  commitNutr();
}
function saveNutritionGoals(){
  normalizeNutr();
  S.nutr.goals.calories=nutritionParseNumber($('nutrGoalCalories')?.value);
  S.nutr.goals.protein=nutritionParseNumber($('nutrGoalProtein')?.value);
  commitNutr('Metas salvas');
}
function copyYesterdayNutrition(){
  normalizeNutr();
  const yesterday=dayKey(addDays(new Date(),-1));
  const today=dayKey(new Date());
  const items=nutritionItemsByDate(yesterday);
  if(!items.length){showToast('Não há refeições de ontem para copiar');return;}
  if(!confirm(`Copiar ${items.length} refeição${items.length>1?'ões':''} de ontem para hoje?`))return;
  items.forEach(it=>{
    const meal=it.meal||'s';
    S.nutr[meal].push({...it,id:Date.now()+Math.floor(Math.random()*1000),date:today,time:it.time||nowTime(),meal});
  });
  commitNutr('Refeições copiadas');
}
function commitNutr(message){
  normalizeNutr();
  renderNutr();
  renderHome?.();
  saveState?.();
  if(message)showToast(message,'🥗',1800);
}
function renderNutr(){
  normalizeNutr();
  const today=dayKey(new Date());
  const todayItems=nutritionTodayItems();
  const totals=nutritionTotals(todayItems);
  const goals=S.nutr.goals||DEFAULT_NUTRITION_GOALS;
  const countEl=$('nFoodCount');
  if(countEl)countEl.textContent=totals.count;
  const calEl=$('nCalCount'); if(calEl)calEl.textContent=Math.round(totals.calories);
  const prEl=$('nProteinCount'); if(prEl)prEl.textContent=Math.round(totals.protein)+'g';
  const goalCal=$('nutrGoalCalories'); if(goalCal&&!goalCal.matches(':focus'))goalCal.value=goals.calories||'';
  const goalPr=$('nutrGoalProtein'); if(goalPr&&!goalPr.matches(':focus'))goalPr.value=goals.protein||'';
  renderNutritionProgress(totals,goals);
  Object.keys(MEAL_MAP).forEach(m=>renderMealSection(m,today));
  renderNutritionFavorites();
  renderNutritionHistory();
}
function renderNutritionProgress(totals,goals){
  const box=$('nutritionProgress');
  if(!box)return;
  const calPct=goals.calories?Math.min(100,Math.round(totals.calories/goals.calories*100)):0;
  const proteinPct=goals.protein?Math.min(100,Math.round(totals.protein/goals.protein*100)):0;
  box.innerHTML=`
    <div class="nutr-progress-item">
      <div><strong>Calorias</strong><span>${Math.round(totals.calories)}${goals.calories?` / ${goals.calories}`:''} kcal</span></div>
      <div class="nutr-bar"><span style="width:${calPct}%"></span></div>
    </div>
    <div class="nutr-progress-item">
      <div><strong>Proteína</strong><span>${Math.round(totals.protein)}${goals.protein?` / ${goals.protein}`:''} g</span></div>
      <div class="nutr-bar protein"><span style="width:${proteinPct}%"></span></div>
    </div>`;
}
function renderMealSection(m,today){
  const map=MEAL_MAP[m];
  const items=(S.nutr[m]||[]).filter(it=>(it.date||today)===today);
  const kc=$(map.kc);
  if(kc)kc.textContent=items.length+' '+(items.length===1?'item':'itens');
  const el=$(map.el);
  if(!el)return;
  el.innerHTML=items.length?items.map(it=>{
    const note=it.note?`<div class="food-note">${unioEscape(it.note)}</div>`:'';
    const meta=[
      it.time?`🕒 ${unioEscape(it.time)}`:'',
      it.calories?`${Math.round(it.calories)} kcal`:'',
      it.protein?`${Math.round(it.protein)}g prot.`:''
    ].filter(Boolean).join(' · ');
    return`<div class="food-item v17">
      <div style="flex:1;min-width:0;">
        <div class="food-nm">${unioEscape(it.n)}</div>
        ${note}
        ${meta?`<div class="food-time">${meta}</div>`:''}
      </div>
      <div class="food-actions">
        <button onclick="favoriteFood('${m}',${it.id})">★</button>
        <button onclick="editFood('${m}',${it.id})">Editar</button>
        <button class="food-rm" onclick="rmFood('${m}',${it.id})">×</button>
      </div>
    </div>`;
  }).join(''):'<div class="empty" style="padding:12px;font-size:12px;">Vazio</div>';
}
function renderNutritionFavorites(){
  const box=$('nutritionFavorites');
  if(!box)return;
  const fav=S.nutr.favorites||[];
  box.innerHTML=fav.length?fav.slice(0,8).map(f=>`<div class="nutr-fav">
    <button onclick="addFavoriteToDiary(${f.id})"><strong>${unioEscape(f.n)}</strong><span>${MEAL_MAP[f.meal]?.emoji||'🍽️'} ${MEAL_MAP[f.meal]?.label||'Refeição'}${f.calories?` · ${Math.round(f.calories)} kcal`:''}${f.protein?` · ${Math.round(f.protein)}g prot.`:''}</span></button>
    <button class="nutr-fav-del" onclick="deleteFavorite(${f.id})">×</button>
  </div>`).join(''):'<div class="empty" style="padding:12px;font-size:12px;">Nenhum favorito ainda. Use ★ em uma refeição para salvar.</div>';
}
function renderNutritionHistory(){
  const box=$('nutritionHistory');
  if(!box)return;
  const keys=nutritionWeekKeys();
  const rows=keys.map(k=>({key:k,items:nutritionItemsByDate(k)}));
  const frequent=nutritionFrequentMeals(4);
  box.innerHTML=`
    <div class="nutr-week-grid">${rows.map(r=>{
      const totals=nutritionTotals(r.items);
      const d=keyToDate(r.key);
      return `<div><strong>${DS[d.getDay()]}</strong><span>${totals.count}</span><em>${Math.round(totals.calories)} kcal</em></div>`;
    }).join('')}</div>
    <div class="nutr-frequent">
      <div class="sec-lbl" style="margin:12px 0 8px;">Mais frequentes</div>
      ${frequent.length?frequent.map(f=>`<div class="nutr-freq-row"><span>${unioEscape(f.name)}</span><strong>${f.count}x</strong></div>`).join(''):'<div class="empty" style="padding:12px;font-size:12px;">Sem histórico suficiente.</div>'}
    </div>`;
}
