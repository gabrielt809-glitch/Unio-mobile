/* Unio Base Organizada v23 */
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


/* ━━━━ V11 HELPERS — recorrências, categorias e orçamento ━━━━ */
function financePrevMonthKey(k=financeCurrentMonth()){
  const d=financeParseMonth(k);
  d.setMonth(d.getMonth()-1);
  return financeMonthKey(d);
}
function financeCompareMonthKeys(a,b){
  return String(a||'').localeCompare(String(b||''));
}
function financeRecurringIsActive(item,monthKey=financeCurrentMonth()){
  if(!item||item.active===false)return false;
  const start=item.startMonth||item.startDate?.slice(0,7)||financeMonthKey();
  const end=item.endMonth||'9999-12';
  return financeCompareMonthKeys(monthKey,start)>=0 && financeCompareMonthKeys(monthKey,end)<=0;
}
function financeRecurringForMonth(monthKey=financeCurrentMonth()){
  return (S.finance.recurring||[])
    .filter(item=>financeRecurringIsActive(item,monthKey))
    .map(item=>({
      id:`rec-${item.id}-${monthKey}`,
      recurringId:item.id,
      recurringVirtual:true,
      scope:'personal',
      type:item.type||'expense',
      amount:Number(item.amount)||0,
      title:item.title||'Recorrência',
      date:`${monthKey}-01`,
      category:item.category||'Outros',
      accountId:item.accountId||null,
      createdAt:item.createdAt||Date.now(),
      updatedAt:item.updatedAt||item.createdAt||Date.now()
    }));
}
function financeActualPersonalTxs(monthKey=financeCurrentMonth()){
  return (S.finance.transactions||[]).filter(t=>t.scope!=='house'&&(t.date||'').slice(0,7)===monthKey);
}
function financeAllPersonalItems(monthKey=financeCurrentMonth()){
  return [...financeRecurringForMonth(monthKey),...financeActualPersonalTxs(monthKey)]
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function financeCategoryTotals(monthKey=financeCurrentMonth()){
  const totals={};
  financeAllPersonalItems(monthKey).forEach(t=>{
    const cat=t.category||'Outros';
    if(!totals[cat])totals[cat]={income:0,expense:0,card:0,total:0};
    if(t.type==='income')totals[cat].income+=Number(t.amount)||0;
    if((t.type==='expense'&&!t.cardPayment)||t.type==='card'){
      totals[cat].expense+=Number(t.amount)||0;
      totals[cat].total+=Number(t.amount)||0;
    }
    if(t.type==='card')totals[cat].card+=Number(t.amount)||0;
  });
  return totals;
}
function financeBudgetForCategory(category){
  return Number(S.finance.budgets?.[category]||0);
}
function financeBudgetUsage(category,monthKey=financeCurrentMonth()){
  const totals=financeCategoryTotals(monthKey);
  const spent=Number(totals[category]?.total||0);
  const budget=financeBudgetForCategory(category);
  const pct=budget>0?Math.min(999,Math.round(spent/budget*100)):0;
  return {category,spent,budget,pct,remaining:Math.max(0,budget-spent)};
}
function financeRecurringById(id){
  return (S.finance.recurring||[]).find(x=>String(x.id)===String(id));
}
function financeCategoryBudgetOptions(selected){
  return (S.finance.categories||[]).map(c=>`<option value="${unioEscape(c)}"${c===selected?' selected':''}>${unioEscape(c)}</option>`).join('');
}


/* ━━━━ V12 HELPERS — casa, projetos e itens planejados ━━━━ */
function financeHouseProjects(){
  if(!S.finance.house.projects)S.finance.house.projects=JSON.parse(JSON.stringify(DEFAULT_HOUSE_PROJECTS||[]));
  return S.finance.house.projects;
}
function financeHouseProjectById(id){
  return financeHouseProjects().find(p=>String(p.id)===String(id));
}
function financeHouseProjectName(id){
  const p=financeHouseProjectById(id);
  return p?`${p.emoji||'🏠'} ${p.name}`:'Sem projeto';
}
function financeHouseProjectOptions(selected){
  return [`<option value="">Sem projeto</option>`].concat(financeHouseProjects().map(p=>`<option value="${p.id}"${String(p.id)===String(selected)?' selected':''}>${unioEscape(p.emoji||'🏠')} ${unioEscape(p.name)}</option>`)).join('');
}
function financeHouseProjectSummary(project){
  const items=project.items||[];
  const estimated=items.reduce((a,i)=>a+Number(i.estimated||0),0);
  const paidItems=items.reduce((a,i)=>a+Number(i.paid||0),0);
  const bills=(S.finance.house.bills||[]).filter(b=>String(b.projectId||'')===String(project.id));
  const billsPaid=bills.filter(b=>b.paid).reduce((a,b)=>a+Number(b.amount||0),0);
  const billsTotal=bills.reduce((a,b)=>a+Number(b.amount||0),0);
  const goal=Number(project.goal)||0;
  const planned=goal||estimated||billsTotal;
  const paid=paidItems+billsPaid;
  const remaining=Math.max(0,planned-paid);
  const pct=planned>0?Math.min(100,Math.round(paid/planned*100)):0;
  return {items,estimated,paidItems,bills,billsPaid,billsTotal,goal,planned,paid,remaining,pct};
}
function financeHouseProjectsSummary(){
  const projects=financeHouseProjects();
  const summaries=projects.map(p=>({project:p,...financeHouseProjectSummary(p)}));
  return {
    projects,
    summaries,
    planned:summaries.reduce((a,s)=>a+Number(s.planned||0),0),
    paid:summaries.reduce((a,s)=>a+Number(s.paid||0),0),
    items:summaries.reduce((a,s)=>a+(s.items?.length||0),0)
  };
}
function financeHouseProjectStatusLabel(status){
  const map={planned:'Planejado',buying:'Em compra',paid:'Pago',done:'Concluído',cancelled:'Cancelado'};
  return map[status]||'Planejado';
}
