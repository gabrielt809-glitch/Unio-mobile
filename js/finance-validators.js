/* Unio Base Organizada v9.5 */
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
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}
