/* Unio Base Organizada v10 */
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

