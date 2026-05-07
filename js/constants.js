/* Unio Base Organizada v26 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONSTANTS — versões, defaults e chaves estáveis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
var APP_SCHEMA_VERSION=26;
var FINANCE_SCHEMA_VERSION=6;
var DEFAULT_PINNED_TABS=['home','finance','water','habits'];
var DEFAULT_FINANCE_CATEGORIES=['Alimentação','Transporte','Casa','Lazer','Saúde','Educação','Compras','Assinaturas','Investimentos','Outros'];
var DEFAULT_FINANCE_ACCOUNTS=[
  {id:1,name:'Itaú',type:'Conta corrente',balance:0},
  {id:2,name:'Nubank',type:'Conta pagamento',balance:0},
  {id:3,name:'Mercado Pago',type:'Carteira digital',balance:0},
  {id:4,name:'Dinheiro',type:'Dinheiro físico',balance:0}
];
var DEFAULT_FINANCE_CARDS=[
  {id:1,name:'Nubank',limit:0,closingDay:20,dueDay:27}
];


var DEFAULT_HOUSE_PROJECTS=[
  {id:1,name:'Reforma',emoji:'🛠️',goal:0,items:[]},
  {id:2,name:'Compras',emoji:'🛒',goal:0,items:[]},
  {id:3,name:'Sonhos',emoji:'✨',goal:0,items:[]},
  {id:4,name:'Reserva',emoji:'🛡️',goal:0,items:[]}
];

var DEFAULT_TASK_CATEGORIES=['Pessoal','Casa','Trabalho','Estudos','Saúde','Financeiro','Outros'];


var DEFAULT_HABIT_FREQUENCIES=[
  {id:'daily',label:'Diário'},
  {id:'weekdays',label:'Dias úteis'},
  {id:'weekend',label:'Fim de semana'},
  {id:'specific',label:'Dias específicos'},
  {id:'weeklyTarget',label:'X vezes/semana'}
];


var DEFAULT_HEALTH_ACTIVITIES=[
  'Caminhada','Corrida','Bike','Musculação','Futebol','Funcional','Alongamento','Mobilidade',
  'Treino em casa','Natação','Escada','Dança','Yoga','Pilates','Luta','Basquete','Vôlei','Remo'
];
var DEFAULT_HEALTH_MOODS=[
  {id:'great',label:'Muito bem',emoji:'😄'},
  {id:'good',label:'Bem',emoji:'🙂'},
  {id:'neutral',label:'Normal',emoji:'😐'},
  {id:'tired',label:'Cansado',emoji:'😴'},
  {id:'bad',label:'Ruim',emoji:'😔'}
];


var DEFAULT_NUTRITION_MEALS={
  b:{label:'Café da manhã',emoji:'☀️'},
  l:{label:'Almoço',emoji:'🌤'},
  s:{label:'Lanche',emoji:'🍎'},
  d:{label:'Jantar',emoji:'🌙'},
  c:{label:'Ceia',emoji:'🌌'}
};
var DEFAULT_NUTRITION_GOALS={calories:0,protein:0};


var DEFAULT_SLEEP_GOAL=8;
var DEFAULT_SLEEP_QUALITIES=[
  {id:1,label:'Péssima',emoji:'😩'},
  {id:2,label:'Ruim',emoji:'😕'},
  {id:3,label:'Regular',emoji:'😐'},
  {id:4,label:'Boa',emoji:'😊'},
  {id:5,label:'Ótima',emoji:'😴'}
];


var DEFAULT_WATER_GOAL=2000;
var DEFAULT_WATER_PRESETS=[150,250,350,500,700];
var WATER_GOAL_ML_PER_KG=35;


var DEFAULT_FOCUS_PRESETS=[
  {id:'pomodoro',label:'Pomodoro',focus:25,break:5,emoji:'🎯'},
  {id:'deep',label:'Foco profundo',focus:50,break:10,emoji:'🔥'},
  {id:'sprint',label:'Sprint',focus:15,break:3,emoji:'⚡'},
  {id:'flow',label:'Flow',focus:90,break:15,emoji:'🌊'}
];
var DEFAULT_FOCUS_LEVELS=[
  {id:1,label:'Baixo'},
  {id:2,label:'Ok'},
  {id:3,label:'Bom'},
  {id:4,label:'Muito bom'},
  {id:5,label:'Excelente'}
];


var APP_PUBLIC_VERSION='v26';
var APP_CACHE_LABEL='unio-v26-cache-2026-05-06';
