/* Unio Base Organizada v24 */
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
    const previousDay=S.activeDay;
    if(typeof waterArchiveDay==='function')waterArchiveDay(previousDay);
    S.activeDay=today;
    S.selDay=today;
    S.taskWeekAnchor=today;
    if(!S.water)S.water={amt:0,goal:DEFAULT_WATER_GOAL,log:[],history:{},presets:DEFAULT_WATER_PRESETS.slice()};
    if(!S.water.history)S.water.history={};
    S.water.amt=0;
    S.water.log=(S.water.log||[]).filter(it=>it.date&&it.date===today);
    /* Nutrição v17 mantém histórico por data; não zerar arrays. */
    if(!S.health)S.health={steps:0,stepsLog:{},acts:[],diary:[],weightLog:[],breathSessions:[]};
    if(!S.health.stepsLog)S.health.stepsLog={};
    S.health.stepsLog[previousDay]=S.health.steps||0;
    S.health.steps=0;
    if(S.focus){S.focus.sessions=0;S.focus.startedAt=null;S.focus.currentStartedAt=null;S.focus.running=false;S.focus.iv=null;}
    changed=true;
    if(!opts.silent)showToast?.('Novo dia iniciado. Registros diários zerados.','🌅',2600);
  }
  if(!S.nutr)S.nutr={b:[],l:[],s:[],d:[],c:[],favorites:[],goals:{...DEFAULT_NUTRITION_GOALS}};
  ['b','l','s','d','c'].forEach(k=>{if(!Array.isArray(S.nutr[k]))S.nutr[k]=[];});
  if(!Array.isArray(S.nutr.favorites))S.nutr.favorites=[];
  if(!S.nutr.goals)S.nutr.goals={...DEFAULT_NUTRITION_GOALS};
  if(!S.water)S.water={amt:0,goal:DEFAULT_WATER_GOAL,log:[],history:{},presets:DEFAULT_WATER_PRESETS.slice()};
  if(!Array.isArray(S.water.log))S.water.log=[];
  if(!S.water.history||typeof S.water.history!=='object')S.water.history={};
  if(!Array.isArray(S.water.presets)||!S.water.presets.length)S.water.presets=DEFAULT_WATER_PRESETS.slice();
  if(!S.health)S.health={steps:0,stepsLog:{},acts:[],diary:[],weightLog:[],breathSessions:[]};
  if(!S.health.stepsLog||typeof S.health.stepsLog!=='object')S.health.stepsLog={};
  if(!Array.isArray(S.health.acts))S.health.acts=[];
  if(!Array.isArray(S.health.diary))S.health.diary=[];
  if(!Array.isArray(S.health.weightLog))S.health.weightLog=[];
  if(!Array.isArray(S.health.breathSessions))S.health.breathSessions=[];
  if(!Array.isArray(S.tasks))S.tasks=[];
  if(!S.sleepGoal)S.sleepGoal=DEFAULT_SLEEP_GOAL;
  if(!Array.isArray(S.habits))S.habits=[];
  if(!S.focus)S.focus={type:25,brkType:5,running:false,onBreak:false,remaining:25*60,sessions:0,iv:null,preset:'pomodoro',logs:[],startedAt:null,currentStartedAt:null,custom:{focus:30,break:5}};
  if(!Array.isArray(S.focus.logs))S.focus.logs=[];
  if(changed && typeof saveState==='function')saveState();
  return changed;
}
function refreshAll(){
  try{
    renderWeekStrip?.();renderTasks?.();renderWater?.();renderNutr?.();renderSleep?.();renderSleepChart?.();renderHealth?.();renderBreathMode?.();renderHabits?.();renderFocusTimer?.();renderFinance?.();renderHome?.();buildTabBar?.();
  }catch(e){console.warn('Unio refresh error',e);}
}
