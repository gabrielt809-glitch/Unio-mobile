/* Unio Base Organizada v9.5 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONSTANTS — versões, defaults e chaves estáveis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
var APP_SCHEMA_VERSION=5;
var FINANCE_SCHEMA_VERSION=3;
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
