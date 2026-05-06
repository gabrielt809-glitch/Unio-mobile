/* Unio Base Organizada v10 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — core/helpers
   Funções puras, formatação e acesso básico ao estado.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ━━━━ CORE / HELPERS ━━━━ */
var FINANCE_PERSONAL_ACTIONS=['income','expense','transfer','card'];
var FINANCE_HOUSE_ACTIONS=['houseBill','houseConfig'];

function financeMonthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function financeMonthLabel(k){const [y,m]=(k||financeMonthKey()).split('-').map(Number);return `${MS[(m||1)-1]} ${y}`;}
function financeParseMonth(k){const [y,m]=(k||financeMonthKey()).split('-').map(Number);return new Date(y,(m||1)-1,1);}
function financeCurrentMonth(){if(!S.finance.month)S.finance.month=financeMonthKey();return S.finance.month;}
function financeMoney(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function financeDateLabel(date){if(!date)return 'Sem data';const d=new Date(date+'T00:00:00');return Number.isNaN(d.getTime())?'Sem data':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
function financeNum(id){return financeParseAmount(document.getElementById(id)?.value||'');}
function financeVal(id){return (document.getElementById(id)?.value||'').trim();}
function financeParseAmount(value){
  const raw=String(value??'').trim().replace(/\./g,'').replace(',','.');
  const n=Number(raw);
  return Number.isFinite(n)?n:0;
}
function financeDateToday(){return new Date().toISOString().slice(0,10);}
function financeDefaultDate(){
  const selected=financeCurrentMonth();
  const today=financeDateToday();
  return today.slice(0,7)===selected?today:`${selected}-01`;
}
function financeEnsureUi(){
  if(!S.finance.ui)S.finance.ui={actionOpen:false,activeAction:null};
  if(typeof S.finance.ui.actionOpen!=='boolean')S.finance.ui.actionOpen=false;
}
function financeScopeTxs(){
  const m=financeCurrentMonth();
  return (S.finance.transactions||[]).filter(t=>(t.date||'').slice(0,7)===m);
}
function financePersonalTxs(){return financeScopeTxs().filter(t=>t.scope!=='house');}
function financeHouseBills(){
  const m=financeCurrentMonth();
  return (S.finance.house?.bills||[]).filter(b=>(b.date||'').slice(0,7)===m);
}
function financeAccountById(id){return (S.finance.accounts||[]).find(a=>String(a.id)===String(id));}
function financeCardById(id){return (S.finance.cards||[]).find(c=>String(c.id)===String(id));}
function financeAccountName(id){return financeAccountById(id)?.name||'—';}
function financeCardName(id){return financeCardById(id)?.name||'—';}
function financeCategoryOptions(selected){
  return (S.finance.categories||[]).map(c=>`<option value="${unioEscape(c)}"${c===selected?' selected':''}>${unioEscape(c)}</option>`).join('');
}
function financeAccountOptions(selected){
  return (S.finance.accounts||[]).map(a=>`<option value="${a.id}"${String(a.id)===String(selected)?' selected':''}>${unioEscape(a.name)}</option>`).join('');
}
function financeCardOptions(selected){
  return (S.finance.cards||[]).map(c=>`<option value="${c.id}"${String(c.id)===String(selected)?' selected':''}>${unioEscape(c.name)}</option>`).join('');
}
function financeActionLabel(type){
  const map={income:'Receita',expense:'Despesa',transfer:'Transferência',card:'Gasto no cartão',houseBill:'Conta da casa',houseConfig:'Editar divisão'};
  return map[type]||'Lançamento';
}
function financeActionIcon(type){
  const map={income:'⬆️',expense:'⬇️',transfer:'↔️',card:'💳',houseBill:'🏠',houseConfig:'👥'};
  return map[type]||'＋';
}


/* ━━━━ V10 HELPERS — mês, cartão e fatura ━━━━ */
function financeShiftDateMonth(dateValue,delta){
  const base=isDateInputValue?.(dateValue)?new Date(String(dateValue)+'T00:00:00'):new Date();
  base.setMonth(base.getMonth()+Number(delta||0));
  const y=base.getFullYear(),m=String(base.getMonth()+1).padStart(2,'0'),d=String(base.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function financeCardTransactions(cardId,monthKey=financeCurrentMonth()){
  return (S.finance.transactions||[]).filter(t=>t.type==='card'&&String(t.cardId)===String(cardId)&&(t.date||'').slice(0,7)===monthKey);
}
function financeCardPayments(cardId,monthKey=financeCurrentMonth()){
  return (S.finance.transactions||[]).filter(t=>t.cardPayment&&String(t.cardId)===String(cardId)&&(t.date||'').slice(0,7)===monthKey);
}
function financeCardInvoice(cardId,monthKey=financeCurrentMonth()){
  const card=financeCardById(cardId)||{};
  const purchases=financeCardTransactions(cardId,monthKey);
  const payments=financeCardPayments(cardId,monthKey);
  const used=purchases.reduce((a,t)=>a+Number(t.amount||0),0);
  const paid=payments.reduce((a,t)=>a+Number(t.amount||0),0);
  const open=Math.max(0,used-paid);
  const available=Math.max(0,(Number(card.limit)||0)-open);
  return {card,purchases,payments,used,paid,open,available};
}
function financeCardInvoiceLabel(t){
  if(!t.installments||t.installments<=1)return '';
  return ` · ${t.installment}/${t.installments}`;
}
