/* Unio Base Organizada v9.5 */
/* ━━━━ STATE ━━━━ */
const DS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const DL=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function dayKey(d){return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function weekKeys(anchor){
  const base=anchor?keyToDate(anchor):new Date();
  const sun=startOfWeek?startOfWeek(base):new Date(base.setDate(base.getDate()-base.getDay()));
  return Array.from({length:7},(_,i)=>{const d=new Date(sun);d.setDate(sun.getDate()+i);return dayKey(d);});
}

const S={
  schemaVersion:APP_SCHEMA_VERSION,
  activeDay:dayKey(new Date()),
  water:{amt:0,goal:2000,log:[],presets:[150,250,350,500]},
  tasks:[],
  sleep:[],
  nutr:{b:[],l:[],d:[],s:[]},
  health:{steps:0,acts:[]},
  habits:[],
  selDay:dayKey(new Date()),
  taskWeekAnchor:dayKey(new Date()),
  tNoDate:false,
  weight:70,
  pinnedTabs:DEFAULT_PINNED_TABS.slice(),
  curTab:'home',
  focus:{type:25,brkType:5,running:false,onBreak:false,remaining:25*60,sessions:0,iv:null},
  finance:{
    schemaVersion:FINANCE_SCHEMA_VERSION,
    view:'personal',
    month:null,
    ui:{actionOpen:false,activeAction:null},
    accounts:[
      {id:1,name:'Itaú',type:'Conta corrente',balance:0},
      {id:2,name:'Nubank',type:'Conta pagamento',balance:0},
      {id:3,name:'Mercado Pago',type:'Carteira digital',balance:0},
      {id:4,name:'Dinheiro',type:'Dinheiro físico',balance:0}
    ],
    cards:[{id:1,name:'Nubank',limit:0,closingDay:20,dueDay:27}],
    categories:DEFAULT_FINANCE_CATEGORIES.slice(),
    transactions:[],
    house:{
      splitMode:'fifty',
      people:[{id:'gabriel',name:'Gabriel',income:0},{id:'giulianna',name:'Giulianna',income:0}],
      bills:[]
    }
  },
  breathMode:'box',
};
let tId=0,habId=0,financeTxId=0,financeAccountId=4,financeCardId=1,financeBillId=0,selFood=null,selMeal='b',selAct=null,habFreq='diario',habEmoji='💪',breathTimer=null,breathPhaseIdx=0;
const HAB_EMOJIS=['💧','🏃','📚','🧘','💪','🥗','😴','✍️','🎯','🧹','🚶','🌅','🎸','📖','💊','🥤','🍎','🌿','🧠','⚡','🔥','🎨','🏊','🚴','🤸'];
