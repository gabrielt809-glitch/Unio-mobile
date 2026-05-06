/* Unio Base Organizada v8.8 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILS — segurança, datas e rotina diária
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function $(id){return document.getElementById(id);}
function unioEscape(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function safeNumber(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;}
function nowTime(){const n=new Date();return String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
function keyToDate(k){
  const [y,m,d]=String(k||dayKey(new Date())).split('-').map(Number);
  return new Date(y,m||0,d||1);
}
function startOfWeek(date){const d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-d.getDay());return d;}
function sameDayKey(a,b){return dayKey(keyToDate(a))===dayKey(keyToDate(b));}
function weekRangeFromAnchor(anchorKey){
  const start=startOfWeek(keyToDate(anchorKey||dayKey(new Date())));
  return Array.from({length:7},(_,i)=>addDays(start,i));
}
function weekRangeLabel(anchorKey){
  const days=weekRangeFromAnchor(anchorKey);
  const first=days[0],last=days[6];
  const sameMonth=first.getMonth()===last.getMonth();
  if(sameMonth)return `${first.getDate()} a ${last.getDate()} de ${MS[last.getMonth()]}`;
  return `${first.getDate()} ${MS[first.getMonth()]} a ${last.getDate()} ${MS[last.getMonth()]}`;
}
function ensureDailyState(opts={}){
  const today=dayKey(new Date());
  let changed=false;
  if(!S.activeDay){S.activeDay=today;changed=true;}
  if(!S.taskWeekAnchor){S.taskWeekAnchor=S.selDay||today;changed=true;}
  if(S.activeDay!==today){
    S.activeDay=today;
    S.selDay=today;
    S.taskWeekAnchor=today;
    S.water.amt=0;
    S.water.log=[];
    S.nutr={b:[],l:[],d:[],s:[]};
    if(!S.health)S.health={steps:0,acts:[]};
    S.health.steps=0;
    if(S.focus){S.focus.sessions=0;}
    changed=true;
    if(!opts.silent)showToast?.('Novo dia iniciado. Registros diários zerados.','🌅',2600);
  }
  if(!S.nutr)S.nutr={b:[],l:[],d:[],s:[]};
  ['b','l','d','s'].forEach(k=>{if(!Array.isArray(S.nutr[k]))S.nutr[k]=[];});
  if(!S.water)S.water={amt:0,goal:2000,log:[],presets:[150,250,350,500]};
  if(!Array.isArray(S.water.log))S.water.log=[];
  if(!Array.isArray(S.water.presets)||!S.water.presets.length)S.water.presets=[150,250,350,500];
  if(!S.health)S.health={steps:0,acts:[]};
  if(!Array.isArray(S.health.acts))S.health.acts=[];
  if(!Array.isArray(S.tasks))S.tasks=[];
  if(!Array.isArray(S.habits))S.habits=[];
  if(changed && typeof saveState==='function')saveState();
  return changed;
}
function refreshAll(){
  try{
    renderWeekStrip?.();renderTasks?.();renderWater?.();renderNutr?.();renderSleep?.();renderSleepChart?.();renderHealth?.();renderBreathMode?.();renderHabits?.();renderFocusTimer?.();renderHome?.();buildTabBar?.();
  }catch(e){console.warn('Unio refresh error',e);}
}
