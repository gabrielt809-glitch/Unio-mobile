/* Unio Base Organizada v26 */
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


/* ━━━━ V24 — FINANCE UX CLEANUP / FLUXOS GUIADOS ━━━━ */
function financePanel(){
  financeEnsureUi();
  return S.finance.ui.panel||'overview';
}
function financeSetPanel(panel){
  financeEnsureUi();
  S.finance.ui.panel=S.finance.ui.panel===panel?'overview':panel;
  S.finance.ui.activeAction=null;
  S.finance.ui.actionOpen=false;
  renderFinance();
  saveState?.();
}
function financeShowAction(action,panel){
  financeEnsureUi();
  if(panel)S.finance.ui.panel=panel;
  financeSelectAction(action);
}
function financeActionBtn(label,onclick,variant=''){
  return `<button class="fin-manage-btn ${variant}" type="button" onclick="${onclick}">${label}</button>`;
}
function renderFinanceManageHub(){
  const panel=financePanel();
  const items=[
    {id:'accounts',ico:'🏦',title:'Contas',sub:`${(S.finance.accounts||[]).length} cadastrada(s)`},
    {id:'cards',ico:'💳',title:'Cartões',sub:`${(S.finance.cards||[]).length} cadastrado(s)`},
    {id:'planning',ico:'📊',title:'Planejamento',sub:'recorrências, categorias e orçamentos'}
  ];
  return `<div class="fin-card fin-manage-hub">
    <div class="fin-card-head compact">
      <div><div class="fin-card-title">Central financeira</div><div class="fin-card-sub">Os cadastros ficam agrupados aqui para deixar a tela mais limpa.</div></div>
    </div>
    <div class="fin-manage-grid">
      ${items.map(i=>`<button class="fin-manage-card ${panel===i.id?'on':''}" onclick="financeSetPanel('${i.id}')">
        <span>${i.ico}</span><strong>${i.title}</strong><em>${i.sub}</em>
      </button>`).join('')}
    </div>
  </div>`;
}
function renderFinancePanel(){
  const panel=financePanel();
  if(panel==='accounts')return renderFinanceAccounts();
  if(panel==='cards')return renderFinanceCards();
  if(panel==='planning')return renderFinancePlanning();
  return '';
}
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
    ${renderFinanceManageHub()}
    ${renderFinancePanel()}
    ${renderFinanceTxList(s.txs)}
  `;
}
function renderFinanceAccounts(){
  const active=S.finance.ui?.activeAction;
  return `<div class="fin-card fin-compact-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Contas</div><div class="fin-card-sub">Saldos e contas ficam em uma área de gestão separada.</div></div>
      ${financeActionBtn('+ Conta',"financeShowAction('accountAdd','accounts')",'green')}
    </div>
    ${active==='accountAdd'?renderFinanceAccountAddForm():''}
    <div class="fin-list">${(S.finance.accounts||[]).map(a=>`<div class="fin-row fin-row-editable">
      <div>
        <strong>${unioEscape(a.name)}</strong>
        <span>${unioEscape(a.type||'Conta')} · saldo ${financeMoney(a.balance)}</span>
      </div>
      <div class="fin-row-actions"><button class="fin-more-btn" onclick="financeAccountActions(${a.id})">Ações</button></div>
    </div>`).join('')||'<div class="empty"><em>🏦</em>Nenhuma conta.</div>'}</div>
  </div>`;
}
function renderFinanceAccountAddForm(){
  return `<div class="fin-inline-form">
    <input class="field" id="finAccName" placeholder="Nome da conta">
    <input class="field" id="finAccBalance" inputmode="decimal" placeholder="Saldo atual">
    <button onclick="addFinanceAccount()">Adicionar conta</button>
  </div>`;
}
function renderFinanceCards(){
  const active=S.finance.ui?.activeAction;
  return `<div class="fin-card fin-compact-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Cartões e faturas</div><div class="fin-card-sub">Cartões, limites, fechamento e pagamento de fatura.</div></div>
      ${financeActionBtn('+ Cartão',"financeShowAction('cardAdd','cards')",'pink')}
    </div>
    ${active==='cardAdd'?renderFinanceCardAddForm():''}
    <div class="fin-list fin-card-list">${(S.finance.cards||[]).map(c=>renderFinanceCardItem(c)).join('')||'<div class="empty"><em>💳</em>Nenhum cartão.</div>'}</div>
  </div>`;
}
function renderFinanceCardAddForm(){
  return `<div class="fin-inline-form">
    <input class="field" id="finCardName" placeholder="Nome do cartão">
    <input class="field" id="finCardLimit" inputmode="decimal" placeholder="Limite">
    <button onclick="addFinanceCard()">Adicionar cartão</button>
  </div>`;
}
function renderFinanceCardItem(c){
  const inv=financeCardInvoice(c.id);
  return `<div class="fin-card-invoice compact">
    <div class="fin-card-invoice-head">
      <div>
        <strong>${unioEscape(c.name)}</strong>
        <span>Fecha dia ${c.closingDay||'—'} · vence dia ${c.dueDay||'—'}</span>
      </div>
      <button class="fin-more-btn" onclick="financeCardActions(${c.id})">Ações</button>
    </div>
    <div class="fin-invoice-grid">
      <div><span>Fatura</span><strong>${financeMoney(inv.used)}</strong></div>
      <div><span>Pago</span><strong>${financeMoney(inv.paid)}</strong></div>
      <div><span>Aberto</span><strong>${financeMoney(inv.open)}</strong></div>
      <div><span>Disponível</span><strong>${financeMoney(inv.available)}</strong></div>
    </div>
  </div>`;
}
function renderFinancePlanning(){
  return `<div class="fin-card fin-compact-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Planejamento</div><div class="fin-card-sub">Recorrências, categorias e orçamento mensal concentrados em uma única área.</div></div>
    </div>
    <div class="fin-planning-grid">
      ${renderFinanceRecurring()}
      ${renderFinanceBudgets()}
      ${renderFinanceCategoryManager()}
    </div>
  </div>`;
}
function renderFinanceBudgets(){
  const categories=(S.finance.categories||[]).filter(c=>c!=='Casa');
  const active=S.finance.ui?.activeAction;
  return `<div class="fin-subcard">
    <div class="fin-subcard-head">
      <div><strong>Orçamentos</strong><span>Limites por categoria no mês.</span></div>
      ${financeActionBtn('+ Orçamento',"financeShowAction('budgetAdd','planning')",'blue')}
    </div>
    ${active==='budgetAdd'?renderFinanceBudgetAddForm():''}
    <div class="fin-budget-list">${categories.length?categories.map(c=>renderFinanceBudgetItem(c)).join(''):'<div class="empty"><em>📊</em>Sem categorias.</div>'}</div>
  </div>`;
}
function renderFinanceBudgetAddForm(){
  return `<div class="fin-inline-form">
    <select class="field" id="finBudgetCategory">${financeCategoryOptions('Outros')}</select>
    <input class="field" id="finBudgetAmount" inputmode="decimal" placeholder="Orçamento mensal">
    <button onclick="setFinanceBudget()">Salvar orçamento</button>
  </div>`;
}
function renderFinanceBudgetItem(category){
  const u=financeBudgetUsage(category);
  const pct=u.budget>0?Math.min(100,u.pct):0;
  const tone=u.budget>0&&u.spent>u.budget?'danger':u.pct>=80?'warning':'success';
  return `<div class="fin-budget-item compact">
    <div class="fin-budget-head">
      <div><strong>${unioEscape(category)}</strong><span>${financeMoney(u.spent)} usados ${u.budget>0?`de ${financeMoney(u.budget)}`:'· sem limite'}</span></div>
      <button class="fin-more-btn" onclick="financeBudgetActions('${encodeURIComponent(category)}')">Ações</button>
    </div>
    <div class="fin-budget-bar"><span class="${tone}" style="width:${pct}%"></span></div>
    <div class="fin-budget-foot">${u.budget>0?`${u.pct}% · restante ${financeMoney(u.remaining)}`:'Defina um orçamento para acompanhar melhor.'}</div>
  </div>`;
}
function renderFinanceRecurring(){
  const list=S.finance.recurring||[];
  const active=S.finance.ui?.activeAction;
  return `<div class="fin-subcard">
    <div class="fin-subcard-head">
      <div><strong>Recorrências</strong><span>Receitas e despesas fixas.</span></div>
      ${financeActionBtn('+ Recorrência',"financeShowAction('recurringAdd','planning')",'green')}
    </div>
    ${active==='recurringAdd'?renderFinanceRecurringAddForm():''}
    <div class="fin-list">
      ${list.length?list.map(r=>renderFinanceRecurringItem(r)).join(''):'<div class="empty"><em>🔁</em>Nenhuma recorrência.</div>'}
    </div>
  </div>`;
}
function renderFinanceRecurringAddForm(){
  return `<div class="fin-inline-form">
    <select class="field" id="finRecType"><option value="expense">Despesa fixa</option><option value="income">Receita fixa</option></select>
    <input class="field" id="finRecTitle" placeholder="Descrição">
    <input class="field" id="finRecAmount" inputmode="decimal" placeholder="Valor">
    <select class="field" id="finRecCategory">${financeCategoryOptions('Outros')}</select>
    <button onclick="addFinanceRecurring()">Adicionar recorrência</button>
  </div>`;
}
function renderFinanceRecurringItem(r){
  return `<div class="fin-row fin-recurring-row ${r.active===false?'muted':''}">
    <div><strong>${r.type==='income'?'⬆️':'⬇️'} ${unioEscape(r.title)}</strong><span>${financeMoney(r.amount)} · ${unioEscape(r.category||'Outros')} · desde ${financeMonthLabel(r.startMonth)}</span></div>
    <div class="fin-row-actions"><button class="fin-more-btn" onclick="financeRecurringActions(${r.id})">Ações</button></div>
  </div>`;
}
function renderFinanceCategoryManager(){
  const active=S.finance.ui?.activeAction;
  return `<div class="fin-subcard">
    <div class="fin-subcard-head">
      <div><strong>Categorias</strong><span>Usadas em lançamentos e orçamentos.</span></div>
      ${financeActionBtn('+ Categoria',"financeShowAction('categoryAdd','planning')",'brand')}
    </div>
    ${active==='categoryAdd'?renderFinanceCategoryAddForm():''}
    <div class="fin-category-grid">
      ${(S.finance.categories||[]).map(c=>`<span class="fin-category-chip compact">${unioEscape(c)}<button onclick="financeCategoryActions('${encodeURIComponent(c)}')">Ações</button></span>`).join('')}
    </div>
  </div>`;
}
function renderFinanceCategoryAddForm(){
  return `<div class="fin-inline-form">
    <input class="field" id="finNewCategory" placeholder="Nova categoria">
    <button onclick="addFinanceCategory()">Adicionar categoria</button>
  </div>`;
}
function renderFinanceTxList(txs){
  return `<div class="fin-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Últimos lançamentos</div><div class="fin-card-sub">${txs.length} no mês selecionado</div></div></div>
    <div class="fin-list fin-tx-list">${txs.length?txs.map(t=>financeTxItem(t)).join(''):'<div class="empty"><em>💰</em>Nenhum lançamento neste mês.</div>'}</div>
  </div>`;
}
function financeTxItem(t){
  if(t.recurringVirtual){
    return `<div class="fin-tx recurring ${t.type==='income'?'income':'expense'}">
      <div><strong>${unioEscape(t.title)} · recorrente</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${financeAccountName(t.accountId)}</span></div>
      <div class="fin-tx-side"><b>${t.type==='income'?'+':'-'} ${financeMoney(t.amount)}</b><button class="fin-more-btn" onclick="financeRecurringActions(${t.recurringId})">Ações</button></div>
    </div>`;
  }
  const sign=t.type==='income'?'+':t.type==='transfer'?'↔':'-';
  const cls=t.type==='income'?'income':t.type==='transfer'?'transfer':'expense';
  const meta=t.type==='card'?financeCardName(t.cardId):t.cardPayment?`Pagamento ${financeCardName(t.cardId)}`:t.type==='transfer'?`${financeAccountName(t.fromAccountId)} → ${financeAccountName(t.toAccountId)}`:financeAccountName(t.accountId);
  const parcel=financeCardInvoiceLabel(t);
  return `<div class="fin-tx ${cls}">
    <div><strong>${unioEscape(t.title)}${parcel}</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${unioEscape(meta)}</span></div>
    <div class="fin-tx-side"><b>${sign} ${financeMoney(t.amount)}</b><button class="fin-more-btn" onclick="financeTxActions(${t.id})">Ações</button></div>
  </div>`;
}
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
    ${renderFinanceActionLauncher('house')}
    ${S.finance.ui?.activeAction==='houseConfig'?renderHouseConfig():''}
    ${S.finance.ui?.activeAction==='houseBill'?renderHouseBillForm():''}
    ${renderHouseBillList(s.bills,s.split)}
    ${renderHouseProjects(s.projectsSummary)}
  `;
}
function renderHouseSummary(summary){
  const p=S.finance.house.people||[];
  const mode=S.finance.house.splitMode==='income'?'Proporcional por renda':'50/50';
  return `<div class="fin-card house-summary-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Resumo da casa</div><div class="fin-card-sub">${mode} · ${p[0]?.name||'Pessoa 1'} ${financeMoney(summary.split.a)} · ${p[1]?.name||'Pessoa 2'} ${financeMoney(summary.split.b)}</div></div>
      <button class="fin-more-btn" onclick="financeHouseSummaryActions()">Ações</button>
    </div>
    <div class="house-mini-grid">
      <div><span>Projetos pagos</span><strong>${financeMoney(summary.projectsSummary.paid)}</strong></div>
      <div><span>Itens planejados</span><strong>${summary.projectsSummary.items}</strong></div>
    </div>
  </div>`;
}
function renderHouseBillList(bills,split){
  const p=S.finance.house.people||[];
  return `<div class="fin-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Contas da casa</div><div class="fin-card-sub">${p[0]?.name||'Gabriel'}: ${financeMoney(split.a)} · ${p[1]?.name||'Giulianna'}: ${financeMoney(split.b)}</div></div></div>
    <div class="fin-list">${bills.length?bills.map(b=>`<div class="fin-tx ${b.paid?'income':'expense'}">
      <div><strong>${unioEscape(b.title)}</strong><span>${financeDateLabel(b.date)} · ${unioEscape(b.category)} · ${financeHouseProjectName(b.projectId)} · ${b.paid?'Pago':'Pendente'}</span></div>
      <div class="fin-tx-side"><b>${financeMoney(b.amount)}</b><button class="fin-more-btn" onclick="financeHouseBillActions(${b.id})">Ações</button></div>
    </div>`).join(''):'<div class="empty"><em>🏠</em>Nenhuma conta da casa neste mês.</div>'}</div>
  </div>`;
}
function renderHouseProjects(projectsSummary=financeHouseProjectsSummary()){
  return `<div class="fin-card house-projects-card">
    <div class="fin-card-head">
      <div><div class="fin-card-title">Projetos da casa</div><div class="fin-card-sub">Reforma, compras, sonhos e reserva organizados sem campos fixos na tela.</div></div>
      ${financeActionBtn('+ Projeto',"financeShowAction('houseProjectAdd','houseProjects')",'green')}
    </div>
    ${S.finance.ui?.activeAction==='houseProjectAdd'?renderHouseProjectAddForm():''}
    <div class="house-project-list">
      ${projectsSummary.summaries.map(s=>renderHouseProjectItem(s.project,s)).join('')}
    </div>
  </div>`;
}
function renderHouseProjectAddForm(){
  return `<div class="fin-inline-form house-project-add compact" id="financeActiveForm">
    <input class="field" id="houseProjectEmoji" placeholder="Emoji" maxlength="3">
    <input class="field" id="houseProjectName" placeholder="Novo projeto">
    <input class="field" id="houseProjectGoal" inputmode="decimal" placeholder="Meta/planejado">
    <button onclick="addHouseProject()">Adicionar projeto</button>
  </div>`;
}
function renderHouseProjectItem(project,summary){
  const tone=summary.pct>=100?'success':summary.pct>=70?'warning':'';
  const showAdd=String(S.finance.ui?.houseItemProjectId||'')===String(project.id);
  return `<div class="house-project compact">
    <div class="house-project-head">
      <div>
        <strong>${unioEscape(project.emoji||'🏠')} ${unioEscape(project.name)}</strong>
        <span>${financeMoney(summary.paid)} pago de ${financeMoney(summary.planned)} planejado</span>
      </div>
      <button class="fin-more-btn" onclick="financeHouseProjectActions(${project.id})">Ações</button>
    </div>
    <div class="fin-budget-bar"><span class="${tone}" style="width:${summary.pct}%"></span></div>
    <div class="house-project-foot">${summary.pct}% concluído · restante ${financeMoney(summary.remaining)}</div>
    <div class="house-project-items">
      ${(project.items||[]).length?(project.items||[]).map(item=>renderHouseProjectSubItem(project.id,item)).join(''):'<div class="house-project-empty">Nenhum item planejado.</div>'}
    </div>
    ${showAdd?renderHouseProjectItemAddForm(project.id):''}
  </div>`;
}
function renderHouseProjectItemAddForm(projectId){
  return `<div class="fin-inline-form house-item-add compact">
    <input class="field" id="houseItemTitle_${projectId}" placeholder="Item">
    <input class="field" id="houseItemEstimated_${projectId}" inputmode="decimal" placeholder="Estimado">
    <input class="field" id="houseItemPaid_${projectId}" inputmode="decimal" placeholder="Pago">
    <button onclick="addHouseProjectItem(${projectId})">Adicionar item</button>
  </div>`;
}
function renderHouseProjectSubItem(projectId,item){
  return `<div class="house-subitem ${item.status==='done'||item.status==='paid'?'done':''}">
    <div><strong>${unioEscape(item.title)}</strong><span>${financeHouseProjectStatusLabel(item.status)} · estimado ${financeMoney(item.estimated)} · pago ${financeMoney(item.paid)}</span></div>
    <div class="fin-row-actions compact"><button class="fin-more-btn" onclick="financeHouseProjectItemActions(${projectId},${item.id})">Ações</button></div>
  </div>`;
}


/* ━━━━ V25 — FINANCE EXPERIENCE / INSPIRAÇÃO MINHAS FINANÇAS ━━━━ */
function financeSetSearch(value){
  financeEnsureUi();
  S.finance.ui.search=String(value||'');
  renderFinance();
}
function financeSearchValue(){
  financeEnsureUi();
  return String(S.finance.ui.search||'');
}
function financeAccountIcon(account){
  const name=String(account?.name||'').toLowerCase();
  if(name.includes('nubank'))return 'nu';
  if(name.includes('itaú')||name.includes('itau'))return 'itaú';
  if(name.includes('mercado'))return 'mp';
  if(name.includes('dinheiro'))return 'R$';
  return '🏦';
}
function financeCardIcon(card){
  const name=String(card?.name||'').toLowerCase();
  if(name.includes('nubank'))return 'nu';
  if(name.includes('itaú')||name.includes('itau'))return 'it';
  return '💳';
}
function renderFinanceMonthHero(summary){
  const initial=summary.accountsTotal||0;
  const current=summary.balance||0;
  const predicted=current;
  return `<div class="mf-hero">
    <div class="mf-month-row">
      <button onclick="shiftFinanceMonth(-1)">‹</button>
      <strong>${financeMonthLabel(S.finance.month)}</strong>
      <button onclick="shiftFinanceMonth(1)">›</button>
    </div>
    <div class="mf-balance-track">
      <div><span>Inicial</span><strong>${financeMoney(initial)}</strong></div>
      <div class="current"><span>Saldo atual</span><strong>${financeMoney(current)}</strong></div>
      <div><span>Previsto</span><strong>${financeMoney(predicted)}</strong></div>
    </div>
  </div>`;
}
function renderFinanceSearch(){
  const value=financeSearchValue();
  return `<div class="mf-search">
    <span>📊</span>
    <input value="${unioEscape(value)}" oninput="financeSetSearch(this.value)" placeholder="Pesquisar no Unio Finanças">
    <button onclick="financeSetSearch('')">${value?'×':'🔍'}</button>
  </div>`;
}
function renderFinancePersonal(){
  const s=calculateFinancePersonalSummary();
  const action=S.finance.ui?.activeAction;
  return `
    ${renderFinanceMonthHero(s)}
    ${renderFinanceSearch()}
    ${FINANCE_PERSONAL_ACTIONS.includes(action)?renderFinanceTxForm(action):''}
    ${renderFinanceAccountsHome(s)}
    ${renderFinanceCardsHome(s)}
    ${renderFinanceManageHubV25()}
    ${renderFinancePanel()}
    ${renderFinanceTxList(s.txs)}
    ${renderFinanceFab('personal')}
  `;
}
function renderFinanceAccountsHome(summary){
  const accounts=S.finance.accounts||[];
  const total=accounts.reduce((a,x)=>a+Number(x.balance||0),0);
  return `<div class="mf-card">
    <div class="mf-card-head">
      <h3>Contas</h3>
      <div class="mf-head-actions">
        <button onclick="financeSetPanel('accounts')">↗</button>
        <button onclick="financeOpenAccountsMenu()">•••</button>
      </div>
    </div>
    <div class="mf-list">
      ${accounts.length?accounts.slice(0,4).map(a=>`<div class="mf-row" onclick="financeAccountActions(${a.id})">
        <div class="mf-left"><span class="mf-logo">${financeAccountIcon(a)}</span><div><strong>${unioEscape(a.name)}</strong><em>${unioEscape(a.type||'Conta')}</em></div></div>
        <div class="mf-right"><strong>${financeMoney(a.balance)}</strong><em>Atual</em></div>
      </div>`).join(''):'<div class="empty"><em>🏦</em>Nenhuma conta cadastrada.</div>'}
    </div>
    <div class="mf-total"><span>Total</span><strong>${financeMoney(total)}</strong></div>
  </div>`;
}
function renderFinanceCardsHome(summary){
  const cards=S.finance.cards||[];
  const totalOpen=cards.reduce((a,c)=>a+Number(financeCardInvoice(c.id).open||0),0);
  return `<div class="mf-card">
    <div class="mf-card-head">
      <h3>Cartões de crédito</h3>
      <div class="mf-head-actions">
        <button onclick="financeSetPanel('cards')">↗</button>
        <button onclick="financeOpenCardsMenu()">•••</button>
      </div>
    </div>
    <div class="mf-list">
      ${cards.length?cards.slice(0,4).map(c=>{
        const inv=financeCardInvoice(c.id);
        return `<div class="mf-row" onclick="financeCardActions(${c.id})">
          <div class="mf-left"><span class="mf-logo card">${financeCardIcon(c)}</span><div><strong>💳 ${unioEscape(c.name)}</strong><em>Fechamento ${c.closingDay||'—'} · Venc. ${c.dueDay||'—'}</em></div></div>
          <div class="mf-right"><strong>${financeMoney(inv.used)}</strong><em>${financeMoney(inv.open)} aberto</em></div>
        </div>`;
      }).join(''):'<div class="empty"><em>💳</em>Nenhum cartão cadastrado.</div>'}
    </div>
    <div class="mf-total"><span>Total aberto</span><strong>${financeMoney(totalOpen)}</strong></div>
  </div>`;
}
function renderFinanceManageHubV25(){
  const panel=financePanel();
  return `<div class="mf-manage-strip">
    <button class="${panel==='accounts'?'on':''}" onclick="financeSetPanel('accounts')">🏦 Contas</button>
    <button class="${panel==='cards'?'on':''}" onclick="financeSetPanel('cards')">💳 Cartões</button>
    <button class="${panel==='planning'?'on':''}" onclick="financeSetPanel('planning')">📊 Planejamento</button>
  </div>`;
}
function renderFinanceFab(scope='personal'){
  const isHouse=scope==='house';
  return `<button class="mf-fab" onclick="financeToggleActionMenu()">＋</button>
    ${S.finance.ui?.actionOpen?renderFinanceFloatingMenu(isHouse):''}`;
}
function renderFinanceFloatingMenu(isHouse=false){
  const opts=isHouse
    ?[
      {type:'houseBill',title:'Conta da casa',ico:'🏠'},
      {type:'houseProjectAdd',title:'Projeto',ico:'🛠️'},
      {type:'houseConfig',title:'Editar divisão',ico:'👥'}
    ]
    :[
      {type:'transfer',title:'Transferência',ico:'↕️'},
      {type:'income',title:'Receita',ico:'+'},
      {type:'expense',title:'Despesa',ico:'−'},
      {type:'card',title:'Despesa cartão',ico:'▭'}
    ];
  return `<div class="mf-fab-backdrop" onclick="financeCloseActionMenu()"></div>
    <div class="mf-fab-menu">
      ${opts.map(o=>`<button onclick="financeSelectAction('${o.type}')"><span>${o.ico}</span><strong>${o.title}</strong></button>`).join('')}
    </div>`;
}
function renderFinanceTxList(txs){
  const q=financeSearchValue().trim().toLowerCase();
  const filtered=q?txs.filter(t=>{
    const hay=[t.title,t.category,financeAccountName(t.accountId),financeCardName(t.cardId)].join(' ').toLowerCase();
    return hay.includes(q);
  }):txs;
  const grouped={};
  filtered.forEach(t=>{
    const key=t.date||financeDefaultDate();
    if(!grouped[key])grouped[key]=[];
    grouped[key].push(t);
  });
  const keys=Object.keys(grouped).sort((a,b)=>String(b).localeCompare(String(a)));
  return `<div class="mf-extract-card">
    <div class="mf-card-head"><h3>Extrato</h3><span>${filtered.length} lançamento(s)</span></div>
    ${keys.length?keys.map(k=>`<div class="mf-date-group">
      <div class="mf-date-label">${financeDateLongLabel(k)}</div>
      <div class="mf-timeline">${grouped[k].map(t=>financeTxItem(t)).join('')}</div>
    </div>`).join(''):'<div class="empty"><em>💰</em>Nenhum lançamento encontrado.</div>'}
  </div>`;
}
function financeDateLongLabel(date){
  const d=new Date(date+'T12:00:00');
  const day=String(d.getDate()).padStart(2,'0');
  const month=String(d.getMonth()+1).padStart(2,'0');
  const year=d.getFullYear();
  return `${day}/${month}/${year} · ${DL[d.getDay()]||''}`;
}
function financeTxCategoryIcon(t){
  if(t.type==='income')return '💵';
  if(t.type==='transfer')return '↕️';
  if(t.type==='card')return '💳';
  const cat=String(t.category||'').toLowerCase();
  if(cat.includes('aliment'))return '🍽️';
  if(cat.includes('casa'))return '🏠';
  if(cat.includes('trans'))return '🚗';
  if(cat.includes('saúde'))return '🏥';
  if(cat.includes('assin'))return '📄';
  return '•';
}
function financeTxItem(t){
  if(t.recurringVirtual){
    return `<div class="mf-tx recurring ${t.type==='income'?'income':'expense'}" onclick="financeRecurringActions(${t.recurringId})">
      <span class="mf-tx-ico">🔁</span>
      <div class="mf-tx-main"><strong>${unioEscape(t.title)}</strong><em>${unioEscape(t.category||'Outros')} · recorrente</em></div>
      <div class="mf-tx-value ${t.type==='income'?'income':'expense'}">${t.type==='income'?'+':'-'} ${financeMoney(t.amount)}</div>
    </div>`;
  }
  const sign=t.type==='income'?'+':t.type==='transfer'?'↔':'-';
  const cls=t.type==='income'?'income':t.type==='transfer'?'transfer':'expense';
  const meta=t.type==='card'?financeCardName(t.cardId):t.cardPayment?`Pagamento ${financeCardName(t.cardId)}`:t.type==='transfer'?`${financeAccountName(t.fromAccountId)} → ${financeAccountName(t.toAccountId)}`:financeAccountName(t.accountId);
  const parcel=financeCardInvoiceLabel(t);
  return `<div class="mf-tx ${cls}" onclick="financeTxActions(${t.id})">
    <span class="mf-tx-ico">${financeTxCategoryIcon(t)}</span>
    <div class="mf-tx-main"><strong>${unioEscape(t.title)}${parcel}</strong><em>${unioEscape(meta)} · ${unioEscape(t.category||'Outros')}</em></div>
    <div class="mf-tx-value ${cls}">${sign} ${financeMoney(t.amount)}</div>
  </div>`;
}
function renderFinanceHouse(){
  const s=calculateFinanceHouseSummary();
  return `
    <div class="mf-house-hero">
      <div><span>Total da casa</span><strong>${financeMoney(s.total)}</strong><em>${financeMoney(s.pending)} pendente</em></div>
      <div><span>Pago</span><strong>${financeMoney(s.paid)}</strong><em>${s.bills.length} conta(s)</em></div>
    </div>
    ${renderHouseSummary(s)}
    ${S.finance.ui?.activeAction==='houseConfig'?renderHouseConfig():''}
    ${S.finance.ui?.activeAction==='houseBill'?renderHouseBillForm():''}
    ${S.finance.ui?.activeAction==='houseProjectAdd'?renderHouseProjectAddForm():''}
    ${renderHouseBillList(s.bills,s.split)}
    ${renderHouseProjects(s.projectsSummary)}
    ${renderFinanceFab('house')}
  `;
}
function financeOpenAccountsMenu(){
  financeOpenActionSheet('Contas',[
    {ico:'➕',label:'Adicionar conta',run:()=>financeShowAction('accountAdd','accounts')},
    {ico:'↗',label:'Abrir gestão de contas',run:()=>financeSetPanel('accounts')}
  ]);
}
function financeOpenCardsMenu(){
  financeOpenActionSheet('Cartões',[
    {ico:'➕',label:'Adicionar cartão',run:()=>financeShowAction('cardAdd','cards')},
    {ico:'↗',label:'Abrir gestão de cartões',run:()=>financeSetPanel('cards')}
  ]);
}


/* ━━━━ V25.1 — FINANCE VIEW SWITCH VISÍVEL ━━━━ */
function renderFinanceViewSwitch(){
  const view=S.finance.view||'personal';
  return `<div class="mf-view-switch">
    <button class="${view==='personal'?'on':''}" onclick="setFinanceView('personal')">Pessoal</button>
    <button class="${view==='house'?'on':''}" onclick="setFinanceView('house')">Casa</button>
  </div>`;
}
function renderFinancePersonal(){
  const s=calculateFinancePersonalSummary();
  const action=S.finance.ui?.activeAction;
  return `
    ${renderFinanceViewSwitch()}
    ${renderFinanceMonthHero(s)}
    ${renderFinanceSearch()}
    ${FINANCE_PERSONAL_ACTIONS.includes(action)?renderFinanceTxForm(action):''}
    ${renderFinanceAccountsHome(s)}
    ${renderFinanceCardsHome(s)}
    ${renderFinanceManageHubV25()}
    ${renderFinancePanel()}
    ${renderFinanceTxList(s.txs)}
    ${renderFinanceFab('personal')}
  `;
}
function renderFinanceHouse(){
  const s=calculateFinanceHouseSummary();
  return `
    ${renderFinanceViewSwitch()}
    <div class="mf-house-hero">
      <div><span>Total da casa</span><strong>${financeMoney(s.total)}</strong><em>${financeMoney(s.pending)} pendente</em></div>
      <div><span>Pago</span><strong>${financeMoney(s.paid)}</strong><em>${s.bills.length} conta(s)</em></div>
    </div>
    ${renderHouseSummary(s)}
    ${S.finance.ui?.activeAction==='houseConfig'?renderHouseConfig():''}
    ${S.finance.ui?.activeAction==='houseBill'?renderHouseBillForm():''}
    ${S.finance.ui?.activeAction==='houseProjectAdd'?renderHouseProjectAddForm():''}
    ${renderHouseBillList(s.bills,s.split)}
    ${renderHouseProjects(s.projectsSummary)}
    ${renderFinanceFab('house')}
  `;
}


/* ━━━━ V25.2 — BUSCA SEM PERDA DE FOCO ━━━━ */
function financeSearchCommit(value){
  financeEnsureUi();
  S.finance.ui.search=String(value||'');
  renderFinance();
}
function renderFinanceSearch(){
  const value=financeSearchValue();
  return `<div class="mf-search">
    <span>📊</span>
    <input value="${unioEscape(value)}" onchange="financeSearchCommit(this.value)" onkeydown="if(event.key==='Enter')financeSearchCommit(this.value)" placeholder="Pesquisar no Unio Finanças">
    <button onclick="financeSearchCommit('')">${value?'×':'🔍'}</button>
  </div>`;
}


/* ━━━━ V26 — EXTRATOS SEPARADOS POR CONTA E CARTÃO ━━━━ */
function financeTxMatchesSearch(t,q){
  if(!q)return true;
  const hay=[
    t.title,
    t.category,
    financeAccountName(t.accountId),
    financeAccountName(t.fromAccountId),
    financeAccountName(t.toAccountId),
    financeCardName(t.cardId)
  ].join(' ').toLowerCase();
  return hay.includes(String(q).toLowerCase());
}
function financeTxBelongsToAccount(t,accountId){
  return String(t.accountId||'')===String(accountId)
    || String(t.fromAccountId||'')===String(accountId)
    || String(t.toAccountId||'')===String(accountId);
}
function financeTxBelongsToCard(t,cardId){
  return String(t.cardId||'')===String(cardId) && (t.type==='card'||t.cardPayment||t.installmentGroupId);
}
function financeTxSignedAmountForAccount(t,accountId){
  const v=Number(t.amount)||0;
  if(t.type==='income')return v;
  if(t.type==='expense')return -v;
  if(t.type==='transfer'){
    if(String(t.fromAccountId||'')===String(accountId))return -v;
    if(String(t.toAccountId||'')===String(accountId))return v;
  }
  if(t.cardPayment)return -v;
  return 0;
}
function financeTxSignedAmountForCard(t){
  const v=Number(t.amount)||0;
  if(t.cardPayment)return -v;
  return v;
}
function financeGroupTxByDate(txs){
  const grouped={};
  txs.forEach(t=>{
    const key=t.date||financeDefaultDate();
    if(!grouped[key])grouped[key]=[];
    grouped[key].push(t);
  });
  return Object.keys(grouped).sort((a,b)=>String(b).localeCompare(String(a))).map(k=>({date:k,items:grouped[k]}));
}
function financeExtractEmpty(title,sub,icon='💰'){
  return `<div class="mf-extract-section empty-section">
    <div class="mf-extract-section-head">
      <div><span>${icon}</span><div><strong>${unioEscape(title)}</strong><em>${unioEscape(sub)}</em></div></div>
    </div>
    <div class="empty"><em>${icon}</em>Nenhum lançamento neste extrato.</div>
  </div>`;
}
function renderFinanceExtractSection({kind,id,title,subtitle,icon,txs,total}){
  const groups=financeGroupTxByDate(txs);
  return `<div class="mf-extract-section ${kind}">
    <div class="mf-extract-section-head" onclick="${kind==='account'?`financeAccountActions(${id})`:`financeCardActions(${id})`}">
      <div><span>${icon}</span><div><strong>${unioEscape(title)}</strong><em>${unioEscape(subtitle)}</em></div></div>
      <b class="${total<0?'negative':'positive'}">${financeMoney(Math.abs(total))}</b>
    </div>
    ${groups.length?groups.map(g=>`<div class="mf-date-group compact">
      <div class="mf-date-label">${financeDateLongLabel(g.date)}</div>
      <div class="mf-timeline">${g.items.map(t=>financeTxItem(t)).join('')}</div>
    </div>`).join(''):'<div class="empty"><em>💰</em>Nenhum lançamento neste extrato.</div>'}
  </div>`;
}
function renderFinanceAccountExtracts(txs,q){
  const accounts=S.finance.accounts||[];
  const sections=accounts.map(a=>{
    const list=txs.filter(t=>financeTxBelongsToAccount(t,a.id)&&financeTxMatchesSearch(t,q));
    const total=list.reduce((sum,t)=>sum+financeTxSignedAmountForAccount(t,a.id),0);
    return {
      kind:'account',
      id:a.id,
      title:a.name,
      subtitle:`${a.type||'Conta'} · ${list.length} lançamento(s)`,
      icon:financeAccountIcon(a),
      txs:list,
      total
    };
  }).filter(s=>s.txs.length);
  return `<div class="mf-extract-block">
    <div class="mf-extract-title"><h3>Extratos por conta</h3><span>${sections.length} conta(s)</span></div>
    ${sections.length?sections.map(renderFinanceExtractSection).join(''):financeExtractEmpty('Nenhuma conta com lançamentos','Crie receitas, despesas ou transferências vinculadas a uma conta.','🏦')}
  </div>`;
}
function renderFinanceCardExtracts(txs,q){
  const cards=S.finance.cards||[];
  const sections=cards.map(c=>{
    const list=txs.filter(t=>financeTxBelongsToCard(t,c.id)&&financeTxMatchesSearch(t,q));
    const total=list.reduce((sum,t)=>sum+financeTxSignedAmountForCard(t),0);
    const inv=financeCardInvoice(c.id);
    return {
      kind:'card',
      id:c.id,
      title:c.name,
      subtitle:`Fatura aberta ${financeMoney(inv.open)} · ${list.length} lançamento(s)`,
      icon:financeCardIcon(c),
      txs:list,
      total
    };
  }).filter(s=>s.txs.length);
  return `<div class="mf-extract-block">
    <div class="mf-extract-title"><h3>Extratos por cartão</h3><span>${sections.length} cartão(ões)</span></div>
    ${sections.length?sections.map(renderFinanceExtractSection).join(''):financeExtractEmpty('Nenhum cartão com lançamentos','Crie despesas cartão para ver o extrato separado por fatura/cartão.','💳')}
  </div>`;
}
function renderFinanceTxList(txs){
  const q=financeSearchValue().trim();
  const searched=q?txs.filter(t=>financeTxMatchesSearch(t,q)):txs;
  return `<div class="mf-extract-card split">
    <div class="mf-card-head">
      <h3>Extratos</h3>
      <span>${searched.length} lançamento(s)</span>
    </div>
    <div class="mf-extract-helper">Separado por conta e por cartão para evitar misturar carteira, banco e fatura.</div>
    ${renderFinanceAccountExtracts(txs,q)}
    ${renderFinanceCardExtracts(txs,q)}
  </div>`;
}
