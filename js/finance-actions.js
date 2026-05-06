/* Unio Base Organizada v24 */
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
  if(type==='card'){
    const installments=clamp(parseInt(financeVal('finTxInstallments'))||1,1,36);
    const groupId=`card-${Date.now()}`;
    const perInstallment=Math.round((Number(payload.amount)/installments)*100)/100;
    const generated=[];
    for(let i=0;i<installments;i++){
      const txPayload={
        ...payload,
        amount:i===installments-1?Math.round((Number(payload.amount)-(perInstallment*(installments-1)))*100)/100:perInstallment,
        date:financeShiftDateMonth(payload.date,i),
        installment:i+1,
        installments,
        installmentGroupId:groupId,
        totalAmount:Number(payload.amount)
      };
      generated.push(createFinanceTransaction(txPayload));
    }
    S.finance.transactions.unshift(...generated.reverse());
    showToast(installments>1?'Compra parcelada adicionada':'Gasto no cartão adicionado');
  }else{
    S.finance.transactions.unshift(createFinanceTransaction(payload));
    showToast('Lançamento adicionado');
  }
  if(S.finance.ui)S.finance.ui.activeAction=null;
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
  if(S.finance?.ui)S.finance.ui.activeAction=null;
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
  if(S.finance?.ui)S.finance.ui.activeAction=null;
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


function payCardInvoice(cardId){
  const invoice=financeCardInvoice(cardId);
  if(invoice.open<=0){showToast('Não há fatura aberta neste mês');return;}
  const accounts=(S.finance.accounts||[]).map(a=>({value:a.id,label:a.name}));
  openEditModal({
    title:`Pagar fatura ${invoice.card.name||''}`,
    subtitle:`Valor aberto: ${financeMoney(invoice.open)} no mês selecionado.`,
    fields:[
      {name:'amount',label:'Valor pago',value:String(invoice.open).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'date',label:'Data do pagamento',type:'date',value:financeDefaultDate()},
      {name:'accountId',label:'Conta de pagamento',type:'select',value:S.finance.accounts?.[0]?.id||'',options:accounts}
    ],
    onSave(values){
      const amount=financeParseAmount(values.amount);
      if(amount<=0){showToast('Valor inválido');return false;}
      if(!isDateInputValue(values.date)){showToast('Data inválida');return false;}
      const payload={
        type:'expense',
        amount,
        title:`Pagamento fatura ${invoice.card.name||'cartão'}`,
        date:values.date,
        category:'Cartão',
        accountId:values.accountId,
        cardId:cardId,
        cardPayment:true
      };
      S.finance.month=payload.date.slice(0,7);
      S.finance.transactions.unshift(createFinanceTransaction(payload));
      showToast('Pagamento de fatura registrado');
      commitFinance();
    }
  });
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
    paidBy:financeVal('houseBillPaidBy')||'none',
    projectId:financeVal('houseBillProject')||''
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
      {name:'date',label:'Data',type:'date',value:b.date||financeDateToday()},
      {name:'projectId',label:'Projeto',type:'select',value:b.projectId||'',options:[{value:'',label:'Sem projeto'}].concat(financeHouseProjects().map(p=>({value:p.id,label:`${p.emoji||'🏠'} ${p.name}`})))}
    ],
    onSave(values){
      const n=financeParseAmount(values.amount);
      if(n<=0){showToast('Valor inválido');return false;}
      if(!isDateInputValue(values.date)){showToast('Data inválida');return false;}
      b.title=String(values.title||'').trim()||b.title;
      b.amount=n;
      b.date=values.date;
      b.projectId=values.projectId||'';
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



/* ━━━━ V11 ACTIONS — categorias, orçamento e recorrências ━━━━ */
function addFinanceCategory(){
  const raw=financeVal('finNewCategory');
  const validation=validateFinanceCategoryName(raw);
  if(!validation.ok){showToast(validation.message);return;}
  S.finance.categories.push(validation.data);
  S.finance.categories.sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(S.finance?.ui)S.finance.ui.activeAction=null;
  showToast('Categoria adicionada');
  commitFinance();
}
function deleteFinanceCategory(encodedCategory){
  const category=decodeURIComponent(encodedCategory);
  if(['Outros','Casa'].includes(category)){showToast('Essa categoria é padrão');return;}
  if(!confirm(`Excluir a categoria "${category}"? Lançamentos antigos continuarão com esse nome.`))return;
  S.finance.categories=(S.finance.categories||[]).filter(c=>c!==category);
  if(S.finance.budgets)delete S.finance.budgets[category];
  commitFinance();
}
function setFinanceBudget(){
  const category=financeVal('finBudgetCategory')||'Outros';
  const amount=financeNum('finBudgetAmount');
  if(amount<0){showToast('Informe um valor válido');return;}
  if(!S.finance.budgets)S.finance.budgets={};
  S.finance.budgets[category]=amount;
  if(S.finance?.ui)S.finance.ui.activeAction=null;
  showToast('Orçamento salvo');
  commitFinance();
}
function editFinanceBudget(encodedCategory){
  const category=decodeURIComponent(encodedCategory);
  openEditModal({
    title:'Editar orçamento',
    subtitle:`Categoria: ${category}`,
    fields:[
      {name:'amount',label:'Orçamento mensal',value:String(financeBudgetForCategory(category)||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'}
    ],
    onSave(values){
      const amount=financeParseAmount(values.amount);
      if(amount<0){showToast('Valor inválido');return false;}
      if(!S.finance.budgets)S.finance.budgets={};
      S.finance.budgets[category]=amount;
      commitFinance();
    }
  });
}
function addFinanceRecurring(){
  const payload={
    type:financeVal('finRecType')||'expense',
    title:financeVal('finRecTitle'),
    amount:financeNum('finRecAmount'),
    category:financeVal('finRecCategory')||'Outros',
    accountId:S.finance.accounts?.[0]?.id||null,
    startMonth:financeCurrentMonth()
  };
  const validation=validateFinanceRecurringPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  if(!Array.isArray(S.finance.recurring))S.finance.recurring=[];
  S.finance.recurring.unshift(createFinanceRecurring(payload));
  if(S.finance?.ui)S.finance.ui.activeAction=null;
  showToast('Recorrência adicionada');
  commitFinance();
}
function editFinanceRecurring(id){
  const r=financeRecurringById(id);
  if(!r)return;
  openEditModal({
    title:'Editar recorrência',
    subtitle:'Atualize valor, categoria e início.',
    fields:[
      {name:'title',label:'Descrição',value:r.title||'',placeholder:'Descrição'},
      {name:'amount',label:'Valor',value:String(r.amount||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'type',label:'Tipo',type:'select',value:r.type||'expense',options:[{value:'expense',label:'Despesa fixa'},{value:'income',label:'Receita fixa'}]},
      {name:'category',label:'Categoria',type:'select',value:r.category||'Outros',options:(S.finance.categories||[]).map(c=>({value:c,label:c}))},
      {name:'startMonth',label:'Mês inicial',type:'month',value:r.startMonth||financeCurrentMonth()}
    ],
    onSave(values){
      const amount=financeParseAmount(values.amount);
      if(amount<=0){showToast('Valor inválido');return false;}
      if(!/^\d{4}-\d{2}$/.test(String(values.startMonth||''))){showToast('Mês inválido');return false;}
      r.title=String(values.title||'').trim()||r.title;
      r.amount=amount;
      r.type=values.type==='income'?'income':'expense';
      r.category=values.category||'Outros';
      r.startMonth=values.startMonth;
      r.updatedAt=Date.now();
      commitFinance();
    }
  });
}
function toggleFinanceRecurring(id){
  const r=financeRecurringById(id);
  if(!r)return;
  r.active=r.active===false?true:false;
  r.updatedAt=Date.now();
  commitFinance();
}
function deleteFinanceRecurring(id){
  if(!confirm('Excluir esta recorrência?'))return;
  S.finance.recurring=(S.finance.recurring||[]).filter(r=>String(r.id)!==String(id));
  commitFinance();
}


/* ━━━━ V12 ACTIONS — projetos da casa ━━━━ */
function addHouseProject(){
  const payload={
    emoji:financeVal('houseProjectEmoji')||'🏠',
    name:financeVal('houseProjectName'),
    goal:financeNum('houseProjectGoal')
  };
  const validation=validateHouseProjectPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  financeHouseProjects().push(createHouseProject(payload));
  if(S.finance?.ui)S.finance.ui.activeAction=null;
  showToast('Projeto adicionado');
  commitFinance();
}
function editHouseProject(id){
  const project=financeHouseProjectById(id);
  if(!project)return;
  openEditModal({
    title:'Editar projeto',
    subtitle:'Atualize nome, emoji e valor planejado.',
    fields:[
      {name:'emoji',label:'Emoji',value:project.emoji||'🏠',placeholder:'🏠'},
      {name:'name',label:'Nome',value:project.name||'',placeholder:'Ex: Reforma'},
      {name:'goal',label:'Meta/planejado',value:String(project.goal||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'}
    ],
    onSave(values){
      if(!String(values.name||'').trim()){showToast('Informe o nome do projeto');return false;}
      project.emoji=String(values.emoji||'🏠').trim()||'🏠';
      project.name=String(values.name).trim();
      project.goal=financeParseAmount(values.goal);
      project.updatedAt=Date.now();
      commitFinance();
    }
  });
}
function deleteHouseProject(id){
  const project=financeHouseProjectById(id);
  if(!project)return;
  if(!confirm(`Excluir o projeto "${project.name}"? As contas vinculadas ficarão sem projeto.`))return;
  S.finance.house.projects=financeHouseProjects().filter(p=>String(p.id)!==String(id));
  (S.finance.house.bills||[]).forEach(b=>{if(String(b.projectId||'')===String(id))b.projectId='';});
  commitFinance();
}
function addHouseProjectItem(projectId){
  const project=financeHouseProjectById(projectId);
  if(!project)return;
  const payload={
    title:financeVal(`houseItemTitle_${projectId}`),
    estimated:financeNum(`houseItemEstimated_${projectId}`),
    paid:financeNum(`houseItemPaid_${projectId}`),
    status:financeNum(`houseItemPaid_${projectId}`)>0?'buying':'planned'
  };
  const validation=validateHouseProjectItemPayload(payload);
  if(!validation.ok){showToast(validation.message);return;}
  if(!Array.isArray(project.items))project.items=[];
  project.items.push(createHouseProjectItem(payload));
  project.updatedAt=Date.now();
  if(S.finance?.ui)S.finance.ui.houseItemProjectId=null;
  showToast('Item adicionado ao projeto');
  commitFinance();
}
function editHouseProjectItem(projectId,itemId){
  const project=financeHouseProjectById(projectId);
  const item=(project?.items||[]).find(i=>String(i.id)===String(itemId));
  if(!project||!item)return;
  openEditModal({
    title:'Editar item do projeto',
    subtitle:`Projeto: ${project.name}`,
    fields:[
      {name:'title',label:'Item',value:item.title||'',placeholder:'Ex: Piso, sofá, armário'},
      {name:'estimated',label:'Valor estimado',value:String(item.estimated||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'paid',label:'Valor pago',value:String(item.paid||0).replace('.',','),inputmode:'decimal',placeholder:'0,00'},
      {name:'status',label:'Status',type:'select',value:item.status||'planned',options:[
        {value:'planned',label:'Planejado'},
        {value:'buying',label:'Em compra'},
        {value:'paid',label:'Pago'},
        {value:'done',label:'Concluído'},
        {value:'cancelled',label:'Cancelado'}
      ]}
    ],
    onSave(values){
      if(!String(values.title||'').trim()){showToast('Informe o item');return false;}
      item.title=String(values.title).trim();
      item.estimated=financeParseAmount(values.estimated);
      item.paid=financeParseAmount(values.paid);
      item.status=values.status||'planned';
      item.updatedAt=Date.now();
      project.updatedAt=Date.now();
      commitFinance();
    }
  });
}
function toggleHouseProjectItemStatus(projectId,itemId){
  const project=financeHouseProjectById(projectId);
  const item=(project?.items||[]).find(i=>String(i.id)===String(itemId));
  if(!item)return;
  item.status=item.status==='done'?'planned':'done';
  item.updatedAt=Date.now();
  project.updatedAt=Date.now();
  commitFinance();
}
function deleteHouseProjectItem(projectId,itemId){
  const project=financeHouseProjectById(projectId);
  if(!project)return;
  if(!confirm('Excluir este item do projeto?'))return;
  project.items=(project.items||[]).filter(i=>String(i.id)!==String(itemId));
  project.updatedAt=Date.now();
  commitFinance();
}


/* ━━━━ V24 — FINANCE ACTION MENUS / AÇÕES CONTEXTUAIS ━━━━ */
function financeOpenActionSheet(title,actions=[]){
  financeCloseActionSheet();
  window.__unioFinanceActions=actions;
  const overlay=document.createElement('div');
  overlay.className='finance-action-modal';
  overlay.id='financeActionModal';
  overlay.onclick=(ev)=>{if(ev.target===overlay)financeCloseActionSheet();};
  overlay.innerHTML=`<div class="finance-action-card">
    <div class="finance-action-head">
      <div><strong>${unioEscape(title)}</strong><span>Escolha uma ação</span></div>
      <button onclick="financeCloseActionSheet()">×</button>
    </div>
    <div class="finance-action-list">
      ${actions.map((a,i)=>`<button class="${a.tone||''}" onclick="financeRunAction(${i})"><span>${a.ico||'•'}</span><div><strong>${unioEscape(a.label)}</strong>${a.sub?`<em>${unioEscape(a.sub)}</em>`:''}</div></button>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}
function financeRunAction(index){
  const action=window.__unioFinanceActions?.[index];
  financeCloseActionSheet();
  if(action&&typeof action.run==='function')action.run();
}
function financeCloseActionSheet(){
  const old=document.getElementById('financeActionModal');
  if(old)old.remove();
  window.__unioFinanceActions=null;
}
function financeTxActions(id){
  const t=(S.finance.transactions||[]).find(x=>String(x.id)===String(id));
  financeOpenActionSheet(t?.title||'Lançamento',[
    {ico:'✏️',label:'Editar lançamento',run:()=>editFinanceTx(id)},
    {ico:'🗑️',label:'Excluir lançamento',tone:'danger',run:()=>deleteFinanceTx(id)}
  ]);
}
function financeAccountActions(id){
  const a=financeAccountById(id);
  financeOpenActionSheet(a?.name||'Conta',[
    {ico:'✏️',label:'Editar conta',sub:'Nome, tipo e saldo',run:()=>editFinanceAccount(id)},
    {ico:'🗑️',label:'Excluir conta',tone:'danger',run:()=>deleteFinanceAccount(id)}
  ]);
}
function financeCardActions(id){
  const c=financeCardById(id);
  const inv=financeCardInvoice(id);
  const actions=[
    {ico:'💳',label:'Pagar fatura',sub:inv.open>0?financeMoney(inv.open):'Sem fatura aberta',run:()=>payCardInvoice(id)},
    {ico:'✏️',label:'Editar cartão',sub:'Limite, fechamento e vencimento',run:()=>editFinanceCard(id)},
    {ico:'🗑️',label:'Excluir cartão',tone:'danger',run:()=>deleteFinanceCard(id)}
  ];
  financeOpenActionSheet(c?.name||'Cartão',actions);
}
function financeRecurringActions(id){
  const r=financeRecurringById(id);
  financeOpenActionSheet(r?.title||'Recorrência',[
    {ico:'✏️',label:'Editar recorrência',run:()=>editFinanceRecurring(id)},
    {ico:r?.active===false?'↻':'✓',label:r?.active===false?'Reativar':'Pausar',run:()=>toggleFinanceRecurring(id)},
    {ico:'🗑️',label:'Excluir recorrência',tone:'danger',run:()=>deleteFinanceRecurring(id)}
  ]);
}
function financeBudgetActions(encodedCategory){
  const category=decodeURIComponent(encodedCategory);
  financeOpenActionSheet(category,[
    {ico:'✏️',label:'Editar orçamento',run:()=>editFinanceBudget(encodedCategory)},
    {ico:'🧹',label:'Remover limite',tone:'danger',run:()=>clearFinanceBudget(encodedCategory)}
  ]);
}
function clearFinanceBudget(encodedCategory){
  const category=decodeURIComponent(encodedCategory);
  if(!confirm(`Remover orçamento de "${category}"?`))return;
  if(S.finance.budgets)delete S.finance.budgets[category];
  commitFinance();
}
function financeCategoryActions(encodedCategory){
  const category=decodeURIComponent(encodedCategory);
  financeOpenActionSheet(category,[
    {ico:'🗑️',label:'Excluir categoria',tone:'danger',run:()=>deleteFinanceCategory(encodedCategory)}
  ]);
}
function financeHouseSummaryActions(){
  financeOpenActionSheet('Resumo da casa',[
    {ico:'👥',label:'Editar divisão da casa',sub:'Nomes, rendas e modo de divisão',run:()=>financeSelectAction('houseConfig')},
    {ico:'🏠',label:'Nova conta da casa',run:()=>financeSelectAction('houseBill')}
  ]);
}
function financeHouseBillActions(id){
  const b=(S.finance.house?.bills||[]).find(x=>String(x.id)===String(id));
  financeOpenActionSheet(b?.title||'Conta da casa',[
    {ico:'✏️',label:'Editar conta',run:()=>editHouseBill(id)},
    {ico:b?.paid?'↺':'✓',label:b?.paid?'Marcar como pendente':'Marcar como paga',run:()=>toggleHouseBillPaid(id)},
    {ico:'🗑️',label:'Excluir conta',tone:'danger',run:()=>deleteHouseBill(id)}
  ]);
}
function financeHouseProjectActions(id){
  const project=financeHouseProjectById(id);
  financeOpenActionSheet(project?.name||'Projeto',[
    {ico:'➕',label:'Adicionar item',sub:'Abrir formulário só neste projeto',run:()=>financeToggleHouseProjectItemForm(id)},
    {ico:'✏️',label:'Editar projeto',run:()=>editHouseProject(id)},
    {ico:'🗑️',label:'Excluir projeto',tone:'danger',run:()=>deleteHouseProject(id)}
  ]);
}
function financeToggleHouseProjectItemForm(id){
  financeEnsureUi();
  S.finance.ui.houseItemProjectId=String(S.finance.ui.houseItemProjectId||'')===String(id)?null:id;
  S.finance.ui.activeAction=null;
  renderFinance();
  setTimeout(()=>{
    const field=document.getElementById(`houseItemTitle_${id}`);
    if(field)field.focus();
  },120);
}
function financeHouseProjectItemActions(projectId,itemId){
  financeOpenActionSheet('Item do projeto',[
    {ico:'✏️',label:'Editar item',run:()=>editHouseProjectItem(projectId,itemId)},
    {ico:'✓',label:'Alternar status',run:()=>toggleHouseProjectItemStatus(projectId,itemId)},
    {ico:'🗑️',label:'Excluir item',tone:'danger',run:()=>deleteHouseProjectItem(projectId,itemId)}
  ]);
}
