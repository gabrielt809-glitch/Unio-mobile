/* Unio Base Organizada v9.4 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — ações
   Mutação do estado, commit, edição e exclusão.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function commitFinance(opts={}){
  if(typeof commitModule==='function'){
    commitModule('finance',{home:opts.home});
    return;
  }
  if(typeof saveState==='function')saveState();
  if(opts.render!==false&&typeof renderFinance==='function')renderFinance();
  if(opts.home!==false&&typeof renderHome==='function')renderHome();
}
/* ━━━━ ACTIONS — PERSONAL ━━━━ */
function addFinanceTx(){
  const type=financeVal('finTxType')||S.finance.ui?.activeAction||'expense';
  const payload={
    type,
    amount:financeNum('finTxAmount'),
    title:financeVal('finTxTitle')||financeActionLabel(type),
    date:financeVal('finTxDate')||financeDateToday(),
    category:financeVal('finTxCategory')||'Outros',
    accountId:financeVal('finTxAccount'),
    fromAccountId:financeVal('finTxFrom'),
    toAccountId:financeVal('finTxTo'),
    cardId:financeVal('finTxCard')
  };
  const validation=validateFinanceTransactionPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.transactions.unshift(createFinanceTransaction(payload));
  if(S.finance.ui)S.finance.ui.activeAction=null;
  showToast('Lançamento adicionado');
  commitFinance();
}
function editFinanceTx(id){
  const t=(S.finance.transactions||[]).find(x=>x.id===id);
  if(!t)return;
  const title=prompt('Descrição do lançamento',t.title||'');
  if(title===null)return;
  const amount=prompt('Valor',String(t.amount||0).replace('.',','));
  if(amount===null)return;
  const date=prompt('Data no formato AAAA-MM-DD',t.date||financeDateToday());
  if(date===null)return;
  const n=financeParseAmount(amount);
  if(n<=0){showToast('Valor inválido');return;}
  t.title=title.trim()||t.title;
  t.amount=n;
  t.date=date.trim()||t.date;
  t.updatedAt=Date.now();
  commitFinance();
}
function deleteFinanceTx(id){
  if(!confirm('Excluir este lançamento?'))return;
  S.finance.transactions=S.finance.transactions.filter(t=>t.id!==id);
  commitFinance();
}
function addFinanceAccount(){
  const payload={name:financeVal('finAccName'),type:'Conta',balance:financeNum('finAccBalance')};
  const validation=validateFinanceAccountPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.accounts.push(createFinanceAccount(payload));
  commitFinance();
}
function editFinanceAccount(id){
  const a=financeAccountById(id);
  if(!a)return;
  const name=prompt('Nome da conta',a.name||'');
  if(name===null)return;
  const balance=prompt('Saldo atual da conta',String(a.balance||0).replace('.',','));
  if(balance===null)return;
  const type=prompt('Tipo da conta',a.type||'Conta');
  if(type===null)return;
  a.name=name.trim()||a.name;
  a.balance=financeParseAmount(balance);
  a.type=type.trim()||'Conta';
  a.updatedAt=Date.now();
  commitFinance();
}
function deleteFinanceAccount(id){
  if((S.finance.accounts||[]).length<=1){showToast('Mantenha pelo menos uma conta');return;}
  if(!confirm('Excluir esta conta? Lançamentos antigos continuarão salvos.'))return;
  S.finance.accounts=S.finance.accounts.filter(a=>a.id!==id);
  commitFinance();
}
function addFinanceCard(){
  const payload={name:financeVal('finCardName'),limit:financeNum('finCardLimit'),closingDay:20,dueDay:27};
  const validation=validateFinanceCardPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.cards.push(createFinanceCard(payload));
  commitFinance();
}
function editFinanceCard(id){
  const c=financeCardById(id);
  if(!c)return;
  const name=prompt('Nome do cartão',c.name||'');
  if(name===null)return;
  const limit=prompt('Limite do cartão',String(c.limit||0).replace('.',','));
  if(limit===null)return;
  const closing=prompt('Dia de fechamento',String(c.closingDay||20));
  if(closing===null)return;
  const due=prompt('Dia de vencimento',String(c.dueDay||27));
  if(due===null)return;
  c.name=name.trim()||c.name;
  c.limit=financeParseAmount(limit);
  c.closingDay=clamp(parseInt(closing)||20,1,31);
  c.dueDay=clamp(parseInt(due)||27,1,31);
  c.updatedAt=Date.now();
  commitFinance();
}
function deleteFinanceCard(id){
  if(!confirm('Excluir este cartão?'))return;
  S.finance.cards=S.finance.cards.filter(c=>c.id!==id);
  commitFinance();
}

/* ━━━━ ACTIONS — HOUSE ━━━━ */
function setHouseSplitMode(mode){
  S.finance.house.splitMode=mode;
  commitFinance({home:false});
}
function saveHousePeople(){
  S.finance.house.people=[
    {id:'gabriel',name:financeVal('houseP1')||'Gabriel',income:financeNum('houseI1')},
    {id:'giulianna',name:financeVal('houseP2')||'Giulianna',income:financeNum('houseI2')}
  ];
  if(S.finance.ui)S.finance.ui.activeAction=null;
  commitFinance({home:false});
}
function addHouseBill(){
  const payload={
    title:financeVal('houseBillTitle')||'Conta da casa',
    amount:financeNum('houseBillAmount'),
    date:financeVal('houseBillDate')||financeDateToday(),
    category:financeVal('houseBillCategory')||'Casa',
    paidBy:financeVal('houseBillPaidBy')||'none'
  };
  const validation=validateHouseBillPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.house.bills.unshift(createHouseBill(payload));
  if(S.finance.ui)S.finance.ui.activeAction=null;
  showToast('Conta da casa adicionada');
  commitFinance();
}
function editHouseBill(id){
  const b=(S.finance.house.bills||[]).find(x=>x.id===id);
  if(!b)return;
  const title=prompt('Descrição da conta',b.title||'');
  if(title===null)return;
  const amount=prompt('Valor',String(b.amount||0).replace('.',','));
  if(amount===null)return;
  const date=prompt('Data no formato AAAA-MM-DD',b.date||financeDateToday());
  if(date===null)return;
  const n=financeParseAmount(amount);
  if(n<=0){showToast('Valor inválido');return;}
  b.title=title.trim()||b.title;
  b.amount=n;
  b.date=date.trim()||b.date;
  b.updatedAt=Date.now();
  commitFinance();
}
function toggleHouseBillPaid(id){
  const b=S.finance.house.bills.find(x=>x.id===id);
  if(b){b.paid=!b.paid;b.updatedAt=Date.now();commitFinance({home:false});}
}
function deleteHouseBill(id){
  if(!confirm('Excluir esta conta da casa?'))return;
  S.finance.house.bills=S.finance.house.bills.filter(b=>b.id!==id);
  commitFinance();
}

