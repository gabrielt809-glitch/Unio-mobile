/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — validações e fábricas
   Responsável por manter dados financeiros consistentes antes de salvar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function financeValidationResult(ok,message,data){
  return {ok:!!ok,message:message||'',data:data||null};
}
function financeIsValidDate(value){
  if(!value)return false;
  const d=new Date(String(value)+'T00:00:00');
  return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}
function validateFinanceAmount(amount){
  return Number.isFinite(Number(amount)) && Number(amount)>0;
}
function validateFinanceTransactionPayload(payload){
  const p=payload||{};
  if(!FINANCE_PERSONAL_ACTIONS.includes(p.type))return financeValidationResult(false,'Tipo de lançamento inválido');
  if(!validateFinanceAmount(p.amount))return financeValidationResult(false,'Informe um valor válido');
  if(!financeIsValidDate(p.date))return financeValidationResult(false,'Informe uma data válida');
  if(p.type==='transfer'){
    if(!p.fromAccountId||!p.toAccountId)return financeValidationResult(false,'Informe as contas da transferência');
    if(String(p.fromAccountId)===String(p.toAccountId))return financeValidationResult(false,'Escolha contas diferentes');
  }
  if((p.type==='expense'||p.type==='income') && !financeAccountById(p.accountId))return financeValidationResult(false,'Escolha uma conta válida');
  if(p.type==='card' && !financeCardById(p.cardId))return financeValidationResult(false,'Escolha um cartão válido');
  return financeValidationResult(true,'',p);
}
function validateFinanceAccountPayload(payload){
  const p=payload||{};
  if(!String(p.name||'').trim())return financeValidationResult(false,'Informe o nome da conta');
  return financeValidationResult(true,'',p);
}
function validateFinanceCardPayload(payload){
  const p=payload||{};
  if(!String(p.name||'').trim())return financeValidationResult(false,'Informe o nome do cartão');
  return financeValidationResult(true,'',p);
}
function validateHouseBillPayload(payload){
  const p=payload||{};
  if(!validateFinanceAmount(p.amount))return financeValidationResult(false,'Informe um valor válido');
  if(!financeIsValidDate(p.date))return financeValidationResult(false,'Informe uma data válida');
  return financeValidationResult(true,'',p);
}
function financeNextId(counterName){
  if(counterName==='tx')return ++financeTxId;
  if(counterName==='account')return ++financeAccountId;
  if(counterName==='card')return ++financeCardId;
  if(counterName==='bill')return ++financeBillId;
  return Date.now();
}
function createFinanceTransaction(payload){
  const p=payload||{};
  return {
    id:financeNextId('tx'),
    scope:'personal',
    type:p.type,
    amount:Number(p.amount)||0,
    title:String(p.title||financeActionLabel(p.type)).trim(),
    date:p.date||financeDateToday(),
    category:p.category||'Outros',
    accountId:p.accountId||null,
    fromAccountId:p.fromAccountId||null,
    toAccountId:p.toAccountId||null,
    cardId:p.cardId||null,
    cardPayment:!!p.cardPayment,
    installment:Number(p.installment)||null,
    installments:Number(p.installments)||null,
    installmentGroupId:p.installmentGroupId||null,
    totalAmount:Number(p.totalAmount)||null,
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
function createFinanceAccount(payload){
  const p=payload||{};
  return {
    id:financeNextId('account'),
    name:String(p.name||'Conta').trim(),
    type:String(p.type||'Conta').trim(),
    balance:Number(p.balance)||0,
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
function createFinanceCard(payload){
  const p=payload||{};
  return {
    id:financeNextId('card'),
    name:String(p.name||'Cartão').trim(),
    limit:Number(p.limit)||0,
    closingDay:clamp(parseInt(p.closingDay)||20,1,31),
    dueDay:clamp(parseInt(p.dueDay)||27,1,31),
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
function createHouseBill(payload){
  const p=payload||{};
  return {
    id:financeNextId('bill'),
    title:String(p.title||'Conta da casa').trim(),
    amount:Number(p.amount)||0,
    date:p.date||financeDateToday(),
    category:p.category||'Casa',
    paidBy:p.paidBy||'none',
    paid:p.paidBy&&p.paidBy!=='none',
    projectId:p.projectId||'',
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}


/* ━━━━ V11 VALIDATORS — categorias, orçamento e recorrências ━━━━ */
function validateFinanceCategoryName(name){
  const value=String(name||'').trim();
  if(!value)return financeValidationResult(false,'Informe o nome da categoria');
  if(value.length>28)return financeValidationResult(false,'Categoria muito longa');
  if((S.finance.categories||[]).some(c=>c.toLowerCase()===value.toLowerCase()))return financeValidationResult(false,'Categoria já existe');
  return financeValidationResult(true,'',value);
}
function validateFinanceRecurringPayload(payload){
  const p=payload||{};
  if(!['income','expense'].includes(p.type))return financeValidationResult(false,'Tipo de recorrência inválido');
  if(!validateFinanceAmount(p.amount))return financeValidationResult(false,'Informe um valor válido');
  if(!String(p.title||'').trim())return financeValidationResult(false,'Informe uma descrição');
  if(!/^\d{4}-\d{2}$/.test(String(p.startMonth||'')))return financeValidationResult(false,'Informe o mês inicial');
  return financeValidationResult(true,'',p);
}
function createFinanceRecurring(payload){
  const p=payload||{};
  return {
    id:Date.now(),
    type:p.type||'expense',
    title:String(p.title||'Recorrência').trim(),
    amount:Number(p.amount)||0,
    category:p.category||'Outros',
    accountId:p.accountId||null,
    startMonth:p.startMonth||financeCurrentMonth(),
    endMonth:p.endMonth||'',
    active:true,
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}


/* ━━━━ V12 VALIDATORS — projetos da casa ━━━━ */
function validateHouseProjectPayload(payload){
  const p=payload||{};
  if(!String(p.name||'').trim())return financeValidationResult(false,'Informe o nome do projeto');
  return financeValidationResult(true,'',p);
}
function validateHouseProjectItemPayload(payload){
  const p=payload||{};
  if(!String(p.title||'').trim())return financeValidationResult(false,'Informe o nome do item');
  if(Number(p.estimated)<0||Number(p.paid)<0)return financeValidationResult(false,'Valores não podem ser negativos');
  return financeValidationResult(true,'',p);
}
function createHouseProject(payload){
  const p=payload||{};
  return {
    id:Date.now(),
    name:String(p.name||'Projeto').trim(),
    emoji:String(p.emoji||'🏠').trim()||'🏠',
    goal:Number(p.goal)||0,
    items:[],
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
function createHouseProjectItem(payload){
  const p=payload||{};
  return {
    id:Date.now(),
    title:String(p.title||'Item').trim(),
    estimated:Number(p.estimated)||0,
    paid:Number(p.paid)||0,
    status:p.status||'planned',
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
