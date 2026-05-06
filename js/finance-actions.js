/* Unio Base Organizada v9.5.1 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — ações
   Mutação do estado, commit, edição e exclusão.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function commitFinance(opts={}){
  try{
    if(typeof saveState==='function')saveState();
    if(opts.render!==false&&typeof renderFinance==='function')renderFinance();
    if(opts.home!==false&&typeof renderHome==='function')renderHome();
  }catch(error){
    handleAppError?.(error,'Não foi possível atualizar Finanças.');
    console.warn('Unio finance commit error',error);
  }
}
/* ━━━━ ACTIONS — PERSONAL ━━━━ */
function addFinanceTx(){
  const type=financeVal('finTxType')||S.finance.ui?.activeAction||'expense';
  const payload={
    type,
    amount:financeNum('finTxAmount'),
    title:financeVal('finTxTitle')||financeActionLabel(type),
    date:financeVal('finTxDate')||financeDefaultDate(),
    category:financeVal('finTxCategory')||'Outros',
    accountId:financeVal('finTxAccount'),
    fromAccountId:financeVal('finTxFrom'),
    toAccountId:financeVal('finTxTo'),
    cardId:financeVal('finTxCard')
  };
  const validation=validateFinanceTransactionPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.month=payload.date.slice(0,7);
  S.finance.transactions.unshift(createFinanceTransaction(payload));
  if(S.finance.ui)S.finance.ui.activeAction=null;
  showToast('Lançamento adicionado');
  commitFinance();
}
function editFinanceTx(id){
  const t=(S.finance.transactions||[]).find(x=>x.id===id);
  if(!t)return;
  openEditModal({
    title:'Editar lançamento',
    subtitle:'Atualize descrição, valor e data.',
    fields:[
      {name:'title',label:'Descrição',value:t.title||'',placeholder:'Descrição'},
      {name:'amount',label:'Valor',value:String(t.amount||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'date',label:'Data',type:'date',value:t.date||financeDateToday()}
    ],
    onSave(values){
      const n=financeParseAmount(values.amount);
      if(n<=0){showToast('Valor inválido');return false;}
      if(!isDateInputValue(values.date)){showToast('Data inválida');return false;}
      t.title=String(values.title||'').trim()||t.title;
      t.amount=n;
      t.date=values.date;
      t.updatedAt=Date.now();
      commitFinance();
    }
  });
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
  openEditModal({
    title:'Editar conta',
    subtitle:'Ajuste nome, tipo e saldo atual.',
    fields:[
      {name:'name',label:'Nome da conta',value:a.name||'',placeholder:'Ex: Nubank'},
      {name:'type',label:'Tipo',value:a.type||'Conta',placeholder:'Conta corrente, carteira...'},
      {name:'balance',label:'Saldo atual',value:String(a.balance||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'}
    ],
    onSave(values){
      if(!String(values.name||'').trim()){showToast('Informe o nome da conta');return false;}
      a.name=String(values.name).trim();
      a.type=String(values.type||'Conta').trim()||'Conta';
      a.balance=financeParseAmount(values.balance);
      a.updatedAt=Date.now();
      commitFinance();
    }
  });
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
  openEditModal({
    title:'Editar cartão',
    subtitle:'Ajuste limite, fechamento e vencimento.',
    fields:[
      {name:'name',label:'Nome do cartão',value:c.name||'',placeholder:'Ex: Nubank'},
      {name:'limit',label:'Limite',value:String(c.limit||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'closingDay',label:'Dia de fechamento',type:'number',value:c.closingDay||20,inputmode:'numeric'},
      {name:'dueDay',label:'Dia de vencimento',type:'number',value:c.dueDay||27,inputmode:'numeric'}
    ],
    onSave(values){
      if(!String(values.name||'').trim()){showToast('Informe o nome do cartão');return false;}
      c.name=String(values.name).trim();
      c.limit=financeParseAmount(values.limit);
      c.closingDay=clamp(parseInt(values.closingDay)||20,1,31);
      c.dueDay=clamp(parseInt(values.dueDay)||27,1,31);
      c.updatedAt=Date.now();
      commitFinance();
    }
  });
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
    date:financeVal('houseBillDate')||financeDefaultDate(),
    category:financeVal('houseBillCategory')||'Casa',
    paidBy:financeVal('houseBillPaidBy')||'none'
  };
  const validation=validateHouseBillPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.month=payload.date.slice(0,7);
  S.finance.house.bills.unshift(createHouseBill(payload));
  if(S.finance.ui)S.finance.ui.activeAction=null;
  showToast('Conta da casa adicionada');
  commitFinance();
}
function editHouseBill(id){
  const b=(S.finance.house.bills||[]).find(x=>x.id===id);
  if(!b)return;
  openEditModal({
    title:'Editar conta da casa',
    subtitle:'Atualize descrição, valor e data.',
    fields:[
      {name:'title',label:'Descrição',value:b.title||'',placeholder:'Ex: Internet, mercado'},
      {name:'amount',label:'Valor',value:String(b.amount||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'date',label:'Data',type:'date',value:b.date||financeDateToday()}
    ],
    onSave(values){
      const n=financeParseAmount(values.amount);
      if(n<=0){showToast('Valor inválido');return false;}
      if(!isDateInputValue(values.date)){showToast('Data inválida');return false;}
      b.title=String(values.title||'').trim()||b.title;
      b.amount=n;
      b.date=values.date;
      b.updatedAt=Date.now();
      commitFinance();
    }
  });
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

