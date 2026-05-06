/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — renderização
   Somente HTML/estado visual da aba.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ━━━━ NAVIGATION / UI STATE ━━━━ */
function setFinanceView(view){
  financeEnsureUi();
  S.finance.view=view;
  S.finance.ui.actionOpen=false;
  S.finance.ui.activeAction=null;
  renderFinance();
}
function shiftFinanceMonth(delta){
  const d=financeParseMonth(financeCurrentMonth());
  d.setMonth(d.getMonth()+delta);
  S.finance.month=financeMonthKey(d);
  financeEnsureUi();
  S.finance.ui.actionOpen=false;
  renderFinance();
}
function financeToggleActionMenu(){
  financeEnsureUi();
  S.finance.ui.actionOpen=!S.finance.ui.actionOpen;
  renderFinance();
}
function financeCloseActionMenu(){
  financeEnsureUi();
  S.finance.ui.actionOpen=false;
  renderFinance();
}
function financeSelectAction(type){
  financeEnsureUi();
  S.finance.ui.activeAction=type;
  S.finance.ui.actionOpen=false;
  renderFinance();
  setTimeout(()=>{
    const el=document.getElementById('financeActiveForm');
    if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
    financeSyncTxForm?.();
  },80);
}
function financeCancelActiveForm(){
  financeEnsureUi();
  S.finance.ui.activeAction=null;
  S.finance.ui.actionOpen=false;
  renderFinance();
}

/* ━━━━ RENDER ROOT ━━━━ */
function renderFinance(){
  if(!S.finance)return;
  financeCurrentMonth();
  financeEnsureUi();
  const root=document.getElementById('financeContent');
  if(!root)return;
  document.getElementById('financeMonthLabel').textContent=financeMonthLabel(S.finance.month);
  document.querySelectorAll('.fin-seg-btn').forEach(b=>b.classList.toggle('on',b.dataset.view===S.finance.view));
  root.innerHTML=S.finance.view==='house'?renderFinanceHouse():renderFinancePersonal();
  if(S.finance.view==='personal')setTimeout(financeSyncTxForm,0);
}
function financeMetric(title,value,sub,color){
  return `<div class="fin-metric"><div class="fin-metric-title">${title}</div><div class="fin-metric-value" style="color:${color}">${value}</div><div class="fin-metric-sub">${sub}</div></div>`;
}
function renderFinanceActionLauncher(scope){
  financeEnsureUi();
  const isHouse=scope==='house';
  const opts=isHouse
    ?[
      {type:'houseBill',title:'Conta da casa',sub:'Mercado, internet, reforma ou outra despesa compartilhada.'},
      {type:'houseConfig',title:'Editar divisão',sub:'Nomes, rendas e modo 50/50 ou proporcional.'}
    ]
    :[
      {type:'expense',title:'Despesa',sub:'Gasto pago por conta bancária ou carteira.'},
      {type:'income',title:'Receita',sub:'Salário, reembolso, rendimento ou entrada.'},
      {type:'transfer',title:'Transferência',sub:'Movimento entre suas contas.'},
      {type:'card',title:'Gasto no cartão',sub:'Compra lançada no cartão de crédito.'}
    ];
  return `<div class="fin-add-zone">
    <button class="fin-plus-main" type="button" onclick="financeToggleActionMenu()">
      <span>＋</span><strong>${isHouse?'Adicionar na casa':'Novo lançamento'}</strong>
    </button>
    ${S.finance.ui.actionOpen?`<div class="fin-action-sheet">
      ${opts.map(o=>`<button type="button" class="fin-action-option ${o.type}" onclick="financeSelectAction('${o.type}')">
        <span class="fin-action-ico">${financeActionIcon(o.type)}</span>
        <span><strong>${o.title}</strong><em>${o.sub}</em></span>
      </button>`).join('')}
    </div>`:''}
  </div>`;
}

/* ━━━━ PERSONAL RENDER ━━━━ */
function renderFinancePersonal(){
  const s=calculateFinancePersonalSummary();
  const action=S.finance.ui?.activeAction;
  return `
    <div class="fin-metrics">
      ${financeMetric('Saldo total',financeMoney(s.balance),'saldo das contas + mês','var(--green)')}
      ${financeMetric('Receitas',financeMoney(s.income),'no mês','var(--green)')}
      ${financeMetric('Despesas',financeMoney(s.expense),'no mês','var(--red)')}
      ${financeMetric('Cartão',financeMoney(s.cardUsed),'utilizado','var(--pink)')}
    </div>
    ${renderFinanceActionLauncher('personal')}
    ${FINANCE_PERSONAL_ACTIONS.includes(action)?renderFinanceTxForm(action):''}
    <div class="fin-two-col">
      ${renderFinanceAccounts()}
      ${renderFinanceCards()}
    </div>
    ${renderFinanceTxList(s.txs)}
  `;
}
function renderFinanceTxForm(activeType='expense'){
  const acc=S.finance.accounts?.[0]?.id||'';
  const card=S.finance.cards?.[0]?.id||'';
  return `<div class="fin-card fin-form-card" id="financeActiveForm">
    <div class="fin-card-head">
      <div>
        <div class="fin-card-title">${financeActionIcon(activeType)} ${financeActionLabel(activeType)}</div>
        <div class="fin-card-sub">${activeType==='card'?'Para compras parceladas, informe o valor total e a quantidade de parcelas.':'Preencha os dados principais. Você pode editar depois.'}</div>
      </div>
      <button class="fin-close-btn" type="button" onclick="financeCancelActiveForm()">×</button>
    </div>
    <input type="hidden" id="finTxType" value="${activeType}">
    <div class="fin-form-grid">
      <div class="m-grp"><label class="m-lbl">${activeType==='card'?'Valor total':'Valor'}</label><input class="field" id="finTxAmount" type="text" inputmode="decimal" placeholder="0,00"></div>
      <div class="m-grp fin-date-grp"><label class="m-lbl">Data</label><input class="field fin-date-field" id="finTxDate" type="date" value="${financeDefaultDate()}"></div>
      <div class="m-grp fin-wide"><label class="m-lbl">Descrição</label><input class="field" id="finTxTitle" type="text" placeholder="Ex: Mercado, salário, Uber" autocomplete="off"></div>
      <div class="m-grp" data-fin-type="expense,income"><label class="m-lbl">Conta</label><select class="field" id="finTxAccount">${financeAccountOptions(acc)}</select></div>
      <div class="m-grp" data-fin-type="transfer"><label class="m-lbl">De</label><select class="field" id="finTxFrom">${financeAccountOptions(acc)}</select></div>
      <div class="m-grp" data-fin-type="transfer"><label class="m-lbl">Para</label><select class="field" id="finTxTo">${financeAccountOptions(S.finance.accounts?.[1]?.id||acc)}</select></div>
      <div class="m-grp" data-fin-type="card"><label class="m-lbl">Cartão</label><select class="field" id="finTxCard">${financeCardOptions(card)}</select></div>
      <div class="m-grp" data-fin-type="card"><label class="m-lbl">Parcelas</label><input class="field" id="finTxInstallments" type="number" inputmode="numeric" min="1" max="36" value="1"></div>
      <div class="m-grp"><label class="m-lbl">Categoria</label><select class="field" id="finTxCategory">${financeCategoryOptions('Outros')}</select></div>
    </div>
    <button class="action-btn fin-submit" id="finAddTxBtn" onclick="addFinanceTx()">Adicionar ${financeActionLabel(activeType).toLowerCase()}</button>
  </div>`;
}
function financeSyncTxForm(){
  const type=document.getElementById('finTxType')?.value||S.finance.ui?.activeAction||'expense';
  document.querySelectorAll('[data-fin-type]').forEach(el=>{
    el.style.display=el.dataset.finType.split(',').includes(type)?'block':'none';
  });
  const btn=document.getElementById('finAddTxBtn');
  if(btn)btn.textContent=`Adicionar ${financeActionLabel(type).toLowerCase()}`;
}
function renderFinanceAccounts(){
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Contas</div><div class="fin-card-sub">Edite o saldo manual de cada conta.</div></div>
    </div>
    <div class="fin-list">${(S.finance.accounts||[]).map(a=>`<div class="fin-row fin-row-editable">
      <div>
        <strong>${unioEscape(a.name)}</strong>
        <span>${unioEscape(a.type||'Conta')} · saldo ${financeMoney(a.balance)}</span>
      </div>
      <div class="fin-row-actions">
        <button class="fin-edit-btn" onclick="editFinanceAccount(${a.id})">Editar</button>
        <button onclick="deleteFinanceAccount(${a.id})">×</button>
      </div>
    </div>`).join('')||'<div class="empty"><em>🏦</em>Nenhuma conta.</div>'}</div>
    <div class="fin-mini-form fin-account-add">
      <input class="field" id="finAccName" placeholder="Nova conta">
      <input class="field" id="finAccBalance" inputmode="decimal" placeholder="Saldo">
      <button onclick="addFinanceAccount()">Adicionar</button>
    </div>
  </div>`;
}
function renderFinanceCards(){
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Cartões e faturas</div><div class="fin-card-sub">Fatura do mês selecionado, limite e pagamento.</div></div>
    </div>
    <div class="fin-list fin-card-list">${(S.finance.cards||[]).map(c=>renderFinanceCardItem(c)).join('')||'<div class="empty"><em>💳</em>Nenhum cartão.</div>'}</div>
    <div class="fin-mini-form fin-card-add">
      <input class="field" id="finCardName" placeholder="Novo cartão">
      <input class="field" id="finCardLimit" inputmode="decimal" placeholder="Limite">
      <button onclick="addFinanceCard()">Adicionar</button>
    </div>
  </div>`;
}
function renderFinanceCardItem(c){
  const inv=financeCardInvoice(c.id);
  return `<div class="fin-card-invoice">
    <div class="fin-card-invoice-head">
      <div>
        <strong>${unioEscape(c.name)}</strong>
        <span>Fecha dia ${c.closingDay||'—'} · vence dia ${c.dueDay||'—'}</span>
      </div>
      <div class="fin-row-actions compact">
        <button class="fin-edit-btn" onclick="editFinanceCard(${c.id})">Editar</button>
        <button onclick="deleteFinanceCard(${c.id})">×</button>
      </div>
    </div>
    <div class="fin-invoice-grid">
      <div><span>Fatura</span><strong>${financeMoney(inv.used)}</strong></div>
      <div><span>Pago</span><strong>${financeMoney(inv.paid)}</strong></div>
      <div><span>Aberto</span><strong>${financeMoney(inv.open)}</strong></div>
      <div><span>Disponível</span><strong>${financeMoney(inv.available)}</strong></div>
    </div>
    <button class="fin-invoice-pay" onclick="payCardInvoice(${c.id})" ${inv.open<=0?'disabled':''}>Pagar fatura</button>
  </div>`;
}
function renderFinanceTxList(txs){
  return `<div class="fin-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Últimos lançamentos</div><div class="fin-card-sub">${txs.length} no mês selecionado</div></div></div>
    <div class="fin-list fin-tx-list">${txs.length?txs.map(t=>financeTxItem(t)).join(''):'<div class="empty"><em>💰</em>Nenhum lançamento neste mês.</div>'}</div>
  </div>`;
}
function financeTxItem(t){
  const sign=t.type==='income'?'+':t.type==='transfer'?'↔':'-';
  const cls=t.type==='income'?'income':t.type==='transfer'?'transfer':'expense';
  const meta=t.type==='card'?financeCardName(t.cardId):t.cardPayment?`Pagamento ${financeCardName(t.cardId)}`:t.type==='transfer'?`${financeAccountName(t.fromAccountId)} → ${financeAccountName(t.toAccountId)}`:financeAccountName(t.accountId);
  const parcel=financeCardInvoiceLabel(t);
  return `<div class="fin-tx ${cls}">
    <div><strong>${unioEscape(t.title)}${parcel}</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${unioEscape(meta)}</span></div>
    <div class="fin-tx-side"><b>${sign} ${financeMoney(t.amount)}</b><button class="fin-edit-btn" onclick="editFinanceTx(${t.id})">Editar</button><button onclick="deleteFinanceTx(${t.id})">×</button></div>
  </div>`;
}

/* ━━━━ HOUSE RENDER ━━━━ */
function renderFinanceHouse(){
  const s=calculateFinanceHouseSummary();
  return `
    <div class="fin-metrics">
      ${financeMetric('Casa',financeMoney(s.total),'despesas do mês','var(--green)')}
      ${financeMetric('Pago',financeMoney(s.paid),'já quitado','var(--blue)')}
      ${financeMetric('Pendente',financeMoney(s.pending),'a pagar','var(--orange)')}
      ${financeMetric('Divisão',financeMoney(s.split.a),'pessoa 1 estimado','var(--brand)')}
    </div>
    ${renderHouseSummary(s)}
    ${renderFinanceActionLauncher('house')}
    ${S.finance.ui?.activeAction==='houseConfig'?renderHouseConfig():''}
    ${S.finance.ui?.activeAction==='houseBill'?renderHouseBillForm():''}
    ${renderHouseBillList(s.bills,s.split)}
  `;
}
function renderHouseSummary(summary){
  const p=S.finance.house.people||[];
  const mode=S.finance.house.splitMode==='income'?'Proporcional por renda':'50/50';
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Resumo da casa</div><div class="fin-card-sub">${mode} · ${p[0]?.name||'Pessoa 1'} ${financeMoney(summary.split.a)} · ${p[1]?.name||'Pessoa 2'} ${financeMoney(summary.split.b)}</div></div>
      <button class="fin-edit-btn fin-head-btn" onclick="financeSelectAction('houseConfig')">Editar</button>
    </div>
  </div>`;
}
function renderHouseConfig(){
  const p=S.finance.house.people||[];
  return `<div class="fin-card" id="financeActiveForm">
    <div class="fin-card-head">
      <div><div class="fin-card-title">👥 Divisão da casa</div><div class="fin-card-sub">Configure nomes, rendas e modo de divisão.</div></div>
      <button class="fin-close-btn" type="button" onclick="financeCancelActiveForm()">×</button>
    </div>
    <div class="fin-seg small"><button class="fin-seg-btn ${S.finance.house.splitMode==='fifty'?'on':''}" onclick="setHouseSplitMode('fifty')">50/50</button><button class="fin-seg-btn ${S.finance.house.splitMode==='income'?'on':''}" onclick="setHouseSplitMode('income')">Proporcional</button></div>
    <div class="fin-form-grid">
      <div class="m-grp"><label class="m-lbl">Pessoa 1</label><input class="field" id="houseP1" value="${unioEscape(p[0]?.name||'Gabriel')}"></div>
      <div class="m-grp"><label class="m-lbl">Renda</label><input class="field" id="houseI1" type="text" inputmode="decimal" value="${Number(p[0]?.income)||0}"></div>
      <div class="m-grp"><label class="m-lbl">Pessoa 2</label><input class="field" id="houseP2" value="${unioEscape(p[1]?.name||'Giulianna')}"></div>
      <div class="m-grp"><label class="m-lbl">Renda</label><input class="field" id="houseI2" type="text" inputmode="decimal" value="${Number(p[1]?.income)||0}"></div>
    </div>
    <button class="action-btn fin-submit" onclick="saveHousePeople()">Salvar divisão</button>
  </div>`;
}
function renderHouseBillForm(){
  return `<div class="fin-card" id="financeActiveForm">
    <div class="fin-card-head">
      <div><div class="fin-card-title">🏠 Nova conta da casa</div><div class="fin-card-sub">Registre despesas compartilhadas do mês.</div></div>
      <button class="fin-close-btn" type="button" onclick="financeCancelActiveForm()">×</button>
    </div>
    <div class="fin-form-grid">
      <div class="m-grp fin-wide"><label class="m-lbl">Descrição</label><input class="field" id="houseBillTitle" placeholder="Ex: Internet, mercado, reforma"></div>
      <div class="m-grp"><label class="m-lbl">Valor</label><input class="field" id="houseBillAmount" type="text" inputmode="decimal" placeholder="0,00"></div>
      <div class="m-grp fin-date-grp"><label class="m-lbl">Data</label><input class="field fin-date-field" id="houseBillDate" type="date" value="${financeDefaultDate()}"></div>
      <div class="m-grp"><label class="m-lbl">Categoria</label><select class="field" id="houseBillCategory">${financeCategoryOptions('Casa')}</select></div>
      <div class="m-grp"><label class="m-lbl">Quem pagou</label><select class="field" id="houseBillPaidBy"><option value="gabriel">${unioEscape(S.finance.house.people?.[0]?.name||'Gabriel')}</option><option value="giulianna">${unioEscape(S.finance.house.people?.[1]?.name||'Giulianna')}</option><option value="none">Ninguém ainda</option></select></div>
    </div>
    <button class="action-btn fin-submit" onclick="addHouseBill()">Adicionar conta da casa</button>
  </div>`;
}
function renderHouseBillList(bills,split){
  const p=S.finance.house.people||[];
  return `<div class="fin-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Contas da casa</div><div class="fin-card-sub">${p[0]?.name||'Gabriel'}: ${financeMoney(split.a)} · ${p[1]?.name||'Giulianna'}: ${financeMoney(split.b)}</div></div></div>
    <div class="fin-list">${bills.length?bills.map(b=>`<div class="fin-tx ${b.paid?'income':'expense'}">
      <div><strong>${unioEscape(b.title)}</strong><span>${financeDateLabel(b.date)} · ${unioEscape(b.category)} · ${b.paid?'Pago':'Pendente'}</span></div>
      <div class="fin-tx-side"><b>${financeMoney(b.amount)}</b><button class="fin-edit-btn" onclick="editHouseBill(${b.id})">Editar</button><button onclick="toggleHouseBillPaid(${b.id})">${b.paid?'↺':'✓'}</button><button onclick="deleteHouseBill(${b.id})">×</button></div>
    </div>`).join(''):'<div class="empty"><em>🏠</em>Nenhuma conta da casa neste mês.</div>'}</div>
  </div>`;
}



/* ━━━━ V11 RENDER — categorias, orçamento e recorrências ━━━━ */
function renderFinancePersonal(){
  const s=calculateFinancePersonalSummary();
  const action=S.finance.ui?.activeAction;
  return `
    <div class="fin-metrics">
      ${financeMetric('Saldo total',financeMoney(s.balance),'saldo das contas + mês','var(--green)')}
      ${financeMetric('Receitas',financeMoney(s.income),'no mês','var(--green)')}
      ${financeMetric('Despesas',financeMoney(s.expense),'no mês','var(--red)')}
      ${financeMetric('Cartão',financeMoney(s.cardUsed),'utilizado','var(--pink)')}
    </div>
    ${renderFinanceComparison()}
    ${renderFinanceActionLauncher('personal')}
    ${FINANCE_PERSONAL_ACTIONS.includes(action)?renderFinanceTxForm(action):''}
    ${renderFinanceBudgets()}
    ${renderFinanceRecurring()}
    <div class="fin-two-col">
      ${renderFinanceAccounts()}
      ${renderFinanceCards()}
    </div>
    ${renderFinanceCategoryManager()}
    ${renderFinanceTxList(s.txs)}
  `;
}
function renderFinanceComparison(){
  const cmp=calculateFinanceMonthComparison();
  const expTone=cmp.expenseDelta>0?'danger':cmp.expenseDelta<0?'success':'';
  const incTone=cmp.incomeDelta>0?'success':cmp.incomeDelta<0?'danger':'';
  return `<div class="fin-card fin-compare-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Comparativo mensal</div><div class="fin-card-sub">Comparação com ${financeMonthLabel(cmp.previousMonth)}</div></div>
    </div>
    <div class="fin-compare-grid">
      <div><span>Receitas</span><strong class="${incTone}">${cmp.incomeDelta>=0?'+':''}${financeMoney(cmp.incomeDelta)}</strong></div>
      <div><span>Despesas</span><strong class="${expTone}">${cmp.expenseDelta>=0?'+':''}${financeMoney(cmp.expenseDelta)}</strong></div>
    </div>
  </div>`;
}
function renderFinanceBudgets(){
  const categories=S.finance.categories||[];
  const withBudget=categories.filter(c=>financeBudgetForCategory(c)>0);
  const visible=withBudget.length?withBudget:categories.slice(0,4);
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Orçamento por categoria</div><div class="fin-card-sub">Defina limites mensais e acompanhe o uso no mês selecionado.</div></div>
    </div>
    <div class="fin-budget-list">
      ${visible.map(c=>renderFinanceBudgetItem(c)).join('')||'<div class="empty"><em>📊</em>Nenhuma categoria para orçamento.</div>'}
    </div>
    <div class="fin-mini-form fin-budget-form">
      <select class="field" id="finBudgetCategory">${financeCategoryBudgetOptions(visible[0]||'Outros')}</select>
      <input class="field" id="finBudgetAmount" inputmode="decimal" placeholder="Orçamento mensal">
      <button onclick="setFinanceBudget()">Salvar</button>
    </div>
  </div>`;
}
function renderFinanceBudgetItem(category){
  const u=financeBudgetUsage(category);
  const pct=u.budget>0?Math.min(100,u.pct):0;
  const tone=u.budget>0&&u.spent>u.budget?'danger':u.pct>=80?'warning':'success';
  return `<div class="fin-budget-item">
    <div class="fin-budget-head">
      <div><strong>${unioEscape(category)}</strong><span>${financeMoney(u.spent)} usados ${u.budget>0?`de ${financeMoney(u.budget)}`:'· sem limite'}</span></div>
      <button class="fin-edit-btn" onclick="editFinanceBudget('${encodeURIComponent(category)}')">Editar</button>
    </div>
    <div class="fin-budget-bar"><span class="${tone}" style="width:${pct}%"></span></div>
    <div class="fin-budget-foot">${u.budget>0?`${u.pct}% · restante ${financeMoney(u.remaining)}`:'Defina um orçamento para acompanhar melhor.'}</div>
  </div>`;
}
function renderFinanceRecurring(){
  const list=S.finance.recurring||[];
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Recorrências</div><div class="fin-card-sub">Receitas e despesas fixas entram automaticamente no mês selecionado.</div></div>
    </div>
    <div class="fin-list">
      ${list.length?list.map(r=>renderFinanceRecurringItem(r)).join(''):'<div class="empty"><em>🔁</em>Nenhuma recorrência cadastrada.</div>'}
    </div>
    <div class="fin-mini-form fin-rec-form">
      <select class="field" id="finRecType"><option value="expense">Despesa fixa</option><option value="income">Receita fixa</option></select>
      <input class="field" id="finRecTitle" placeholder="Descrição">
      <input class="field" id="finRecAmount" inputmode="decimal" placeholder="Valor">
      <select class="field" id="finRecCategory">${financeCategoryOptions('Outros')}</select>
      <button onclick="addFinanceRecurring()">Adicionar</button>
    </div>
  </div>`;
}
function renderFinanceRecurringItem(r){
  return `<div class="fin-row fin-recurring-row ${r.active===false?'muted':''}">
    <div><strong>${r.type==='income'?'⬆️':'⬇️'} ${unioEscape(r.title)}</strong><span>${financeMoney(r.amount)} · ${unioEscape(r.category||'Outros')} · desde ${financeMonthLabel(r.startMonth)}</span></div>
    <div class="fin-row-actions">
      <button class="fin-edit-btn" onclick="editFinanceRecurring(${r.id})">Editar</button>
      <button onclick="toggleFinanceRecurring(${r.id})">${r.active===false?'↻':'✓'}</button>
      <button onclick="deleteFinanceRecurring(${r.id})">×</button>
    </div>
  </div>`;
}
function renderFinanceCategoryManager(){
  return `<div class="fin-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Categorias</div><div class="fin-card-sub">Gerencie categorias usadas em lançamentos, recorrências e orçamentos.</div></div>
    </div>
    <div class="fin-category-grid">
      ${(S.finance.categories||[]).map(c=>`<span class="fin-category-chip">${unioEscape(c)}<button onclick="deleteFinanceCategory('${encodeURIComponent(c)}')">×</button></span>`).join('')}
    </div>
    <div class="fin-mini-form fin-cat-form">
      <input class="field" id="finNewCategory" placeholder="Nova categoria">
      <button onclick="addFinanceCategory()">Adicionar</button>
    </div>
  </div>`;
}
function financeTxItem(t){
  if(t.recurringVirtual){
    return `<div class="fin-tx recurring ${t.type==='income'?'income':'expense'}">
      <div><strong>${unioEscape(t.title)} · recorrente</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${financeAccountName(t.accountId)}</span></div>
      <div class="fin-tx-side"><b>${t.type==='income'?'+':'-'} ${financeMoney(t.amount)}</b><button class="fin-edit-btn" onclick="editFinanceRecurring(${t.recurringId})">Editar</button></div>
    </div>`;
  }
  const sign=t.type==='income'?'+':t.type==='transfer'?'↔':'-';
  const cls=t.type==='income'?'income':t.type==='transfer'?'transfer':'expense';
  const meta=t.type==='card'?financeCardName(t.cardId):t.cardPayment?`Pagamento ${financeCardName(t.cardId)}`:t.type==='transfer'?`${financeAccountName(t.fromAccountId)} → ${financeAccountName(t.toAccountId)}`:financeAccountName(t.accountId);
  const parcel=financeCardInvoiceLabel(t);
  return `<div class="fin-tx ${cls}">
    <div><strong>${unioEscape(t.title)}${parcel}</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${unioEscape(meta)}</span></div>
    <div class="fin-tx-side"><b>${sign} ${financeMoney(t.amount)}</b><button class="fin-edit-btn" onclick="editFinanceTx(${t.id})">Editar</button><button onclick="deleteFinanceTx(${t.id})">×</button></div>
  </div>`;
}


/* ━━━━ V12 RENDER — casa, projetos e itens planejados ━━━━ */
function renderFinanceHouse(){
  const s=calculateFinanceHouseSummary();
  return `
    <div class="fin-metrics">
      ${financeMetric('Casa',financeMoney(s.total),'despesas do mês','var(--green)')}
      ${financeMetric('Pago',financeMoney(s.paid),'já quitado','var(--blue)')}
      ${financeMetric('Pendente',financeMoney(s.pending),'a pagar','var(--orange)')}
      ${financeMetric('Projetos',financeMoney(s.projectsSummary.planned),'planejado','var(--brand)')}
    </div>
    ${renderHouseSummary(s)}
    ${renderHouseProjects(s.projectsSummary)}
    ${renderFinanceActionLauncher('house')}
    ${S.finance.ui?.activeAction==='houseConfig'?renderHouseConfig():''}
    ${S.finance.ui?.activeAction==='houseBill'?renderHouseBillForm():''}
    ${renderHouseBillList(s.bills,s.split)}
  `;
}
function renderHouseSummary(summary){
  const p=S.finance.house.people||[];
  const mode=S.finance.house.splitMode==='income'?'Proporcional por renda':'50/50';
  return `<div class="fin-card house-summary-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Resumo da casa</div><div class="fin-card-sub">${mode} · ${p[0]?.name||'Pessoa 1'} ${financeMoney(summary.split.a)} · ${p[1]?.name||'Pessoa 2'} ${financeMoney(summary.split.b)}</div></div>
      <button class="fin-edit-btn fin-head-btn" onclick="financeSelectAction('houseConfig')">Editar</button>
    </div>
    <div class="house-mini-grid">
      <div><span>Projetos pagos</span><strong>${financeMoney(summary.projectsSummary.paid)}</strong></div>
      <div><span>Itens planejados</span><strong>${summary.projectsSummary.items}</strong></div>
    </div>
  </div>`;
}
function renderHouseBillForm(){
  return `<div class="fin-card" id="financeActiveForm">
    <div class="fin-card-head">
      <div><div class="fin-card-title">🏠 Nova conta da casa</div><div class="fin-card-sub">Registre despesas compartilhadas e, se quiser, vincule a um projeto.</div></div>
      <button class="fin-close-btn" type="button" onclick="financeCancelActiveForm()">×</button>
    </div>
    <div class="fin-form-grid">
      <div class="m-grp fin-wide"><label class="m-lbl">Descrição</label><input class="field" id="houseBillTitle" placeholder="Ex: Internet, mercado, reforma"></div>
      <div class="m-grp"><label class="m-lbl">Valor</label><input class="field" id="houseBillAmount" type="text" inputmode="decimal" placeholder="0,00"></div>
      <div class="m-grp fin-date-grp"><label class="m-lbl">Data</label><input class="field fin-date-field" id="houseBillDate" type="date" value="${financeDefaultDate()}"></div>
      <div class="m-grp"><label class="m-lbl">Categoria</label><select class="field" id="houseBillCategory">${financeCategoryOptions('Casa')}</select></div>
      <div class="m-grp"><label class="m-lbl">Projeto</label><select class="field" id="houseBillProject">${financeHouseProjectOptions('')}</select></div>
      <div class="m-grp"><label class="m-lbl">Quem pagou</label><select class="field" id="houseBillPaidBy"><option value="gabriel">${unioEscape(S.finance.house.people?.[0]?.name||'Gabriel')}</option><option value="giulianna">${unioEscape(S.finance.house.people?.[1]?.name||'Giulianna')}</option><option value="none">Ninguém ainda</option></select></div>
    </div>
    <button class="action-btn fin-submit" onclick="addHouseBill()">Adicionar conta da casa</button>
  </div>`;
}
function renderHouseBillList(bills,split){
  const p=S.finance.house.people||[];
  return `<div class="fin-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Contas da casa</div><div class="fin-card-sub">${p[0]?.name||'Gabriel'}: ${financeMoney(split.a)} · ${p[1]?.name||'Giulianna'}: ${financeMoney(split.b)}</div></div></div>
    <div class="fin-list">${bills.length?bills.map(b=>`<div class="fin-tx ${b.paid?'income':'expense'}">
      <div><strong>${unioEscape(b.title)}</strong><span>${financeDateLabel(b.date)} · ${unioEscape(b.category)} · ${financeHouseProjectName(b.projectId)} · ${b.paid?'Pago':'Pendente'}</span></div>
      <div class="fin-tx-side"><b>${financeMoney(b.amount)}</b><button class="fin-edit-btn" onclick="editHouseBill(${b.id})">Editar</button><button onclick="toggleHouseBillPaid(${b.id})">${b.paid?'↺':'✓'}</button><button onclick="deleteHouseBill(${b.id})">×</button></div>
    </div>`).join(''):'<div class="empty"><em>🏠</em>Nenhuma conta da casa neste mês.</div>'}</div>
  </div>`;
}
function renderHouseProjects(projectsSummary=financeHouseProjectsSummary()){
  return `<div class="fin-card house-projects-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Projetos da casa</div><div class="fin-card-sub">Organize reforma, compras, sonhos e reserva com itens planejados.</div></div>
    </div>
    <div class="house-project-list">
      ${projectsSummary.summaries.map(s=>renderHouseProjectItem(s.project,s)).join('')}
    </div>
    <div class="fin-mini-form house-project-add">
      <input class="field" id="houseProjectEmoji" placeholder="Emoji" maxlength="3">
      <input class="field" id="houseProjectName" placeholder="Novo projeto">
      <input class="field" id="houseProjectGoal" inputmode="decimal" placeholder="Meta/planejado">
      <button onclick="addHouseProject()">Adicionar</button>
    </div>
  </div>`;
}
function renderHouseProjectItem(project,summary){
  const tone=summary.pct>=100?'success':summary.pct>=70?'warning':'';
  return `<div class="house-project">
    <div class="house-project-head">
      <div>
        <strong>${unioEscape(project.emoji||'🏠')} ${unioEscape(project.name)}</strong>
        <span>${financeMoney(summary.paid)} pago de ${financeMoney(summary.planned)} planejado</span>
      </div>
      <div class="fin-row-actions compact">
        <button class="fin-edit-btn" onclick="editHouseProject(${project.id})">Editar</button>
        <button onclick="deleteHouseProject(${project.id})">×</button>
      </div>
    </div>
    <div class="fin-budget-bar"><span class="${tone}" style="width:${summary.pct}%"></span></div>
    <div class="house-project-foot">${summary.pct}% concluído · restante ${financeMoney(summary.remaining)}</div>
    <div class="house-project-items">
      ${(project.items||[]).length?(project.items||[]).map(item=>renderHouseProjectSubItem(project.id,item)).join(''):'<div class="house-project-empty">Nenhum item planejado.</div>'}
    </div>
    <div class="fin-mini-form house-item-add">
      <input class="field" id="houseItemTitle_${project.id}" placeholder="Item">
      <input class="field" id="houseItemEstimated_${project.id}" inputmode="decimal" placeholder="Estimado">
      <input class="field" id="houseItemPaid_${project.id}" inputmode="decimal" placeholder="Pago">
      <button onclick="addHouseProjectItem(${project.id})">Adicionar item</button>
    </div>
  </div>`;
}
function renderHouseProjectSubItem(projectId,item){
  return `<div class="house-subitem ${item.status==='done'||item.status==='paid'?'done':''}">
    <div><strong>${unioEscape(item.title)}</strong><span>${financeHouseProjectStatusLabel(item.status)} · estimado ${financeMoney(item.estimated)} · pago ${financeMoney(item.paid)}</span></div>
    <div class="fin-row-actions compact">
      <button class="fin-edit-btn" onclick="editHouseProjectItem(${projectId},${item.id})">Editar</button>
      <button onclick="toggleHouseProjectItemStatus(${projectId},${item.id})">${item.status==='done'?'↺':'✓'}</button>
      <button onclick="deleteHouseProjectItem(${projectId},${item.id})">×</button>
    </div>
  </div>`;
}
