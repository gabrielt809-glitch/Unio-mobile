/* Unio Base Organizada v2 */
/* ━━━━ STATE ━━━━ */
const DS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const DL=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function dayKey(d){return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function weekKeys(){const today=new Date(),sun=new Date(today);sun.setDate(today.getDate()-today.getDay());return Array.from({length:7},(_,i)=>{const d=new Date(sun);d.setDate(sun.getDate()+i);return dayKey(d);});}

const S={
  water:{amt:0,goal:2000,log:[],presets:[150,250,350,500]},tasks:[],sleep:[],nutr:{b:[],l:[],d:[],s:[]},health:{steps:0,acts:[]},habits:[],selDay:dayKey(new Date()),tNoDate:false,weight:70,pinnedTabs:['home','water','habits','focus'],curTab:'home',focus:{type:25,brkType:5,running:false,onBreak:false,remaining:25*60,sessions:0,iv:null},breathMode:'box',
};
let tId=0,habId=0,selFood=null,selMeal='b',selAct=null,habFreq='diario',habEmoji='💪',breathTimer=null,breathPhaseIdx=0;
const HAB_EMOJIS=['💧','🏃','📚','🧘','💪','🥗','😴','✍️','🎯','🧹','🚶','🌅','🎸','📖','💊','🥤','🍎','🌿','🧠','⚡','🔥','🎨','🏊','🚴','🤸'];
