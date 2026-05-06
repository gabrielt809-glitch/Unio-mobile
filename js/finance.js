/* Unio Base Organizada v9.1 */
/* ━━━━ FINANÇAS ━━━━ */
function financeMonthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function financeMonthLabel(k){const [y,m]=(k||financeMonthKey()).split('-').map(Number);return `${MS[(m||1)-1]} ${y}`;}
function financeParseMonth(k){const [y,m]=(k||financeMonthKey()).split('-').map(Number);return new Date(y,(m||1)-1,1);}
function financeCurrentMonth(){if(!S.finance.month)S.finance.month=financeMonthKey();return S.finance.month;}
function financeMoney(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function financeDateLabel(date){if(!date)return 'Sem data';const d=new Date(date+'T00:00:00');return Number.isNaN(d.getTime())?'Sem data':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
function financeNum(id){return Number((document.getElementById(id)?.value||'').replace(',','.'))||0;}
function financeVal(id){return (document.getElementById(id)?.value||'').trim();}
function financeScopeTxs(){const m=financeCurrentMonth();return (S.finance.transactions||[]).filter(t=>(t.date||'').slice(0,7)===m);}
function financePersonalTxs(){return financeScopeTxs().filter(t=>t.scope!=='house');}
function financeHouseBills(){const m=financeCurrentMonth();return (S.finance.house?.bills||[]).filter(b=>(b.date||'').slice(0,7)===m);}
function financeAccountName(id){return (S.finance.accounts||[]).find(a=>String(a.id)===String(id))?.name||'—';}
function financeCardName(id){return (S.finance.cards||[]).find(c=>String(c.id)===String(id))?.name||'—';}
function financeCategoryOptions(selected){return (S.finance.categories||[]).map(c=>`<option value="${unioEscape(c)}"${c===selected?' selected':''}>${unioEscape(c)}</option>`).join('');}
function financeAccountOptions(selected){return (S.finance.accounts||[]).map(a=>`<option value="${a.id}"${String(a.id)===String(selected)?' selected':''}>${unioEscape(a.name)}</option>`).join('');}
function financeCardOptions(selected){return (S.finance.cards||[]).map(c=>`<option value="${c.id}"${String(c.id)===String(selected)?' selected':''}>${unioEscape(c.name)}</option>`).join('');}
function setFinanceView(view){S.finance.view=view;renderFinance();}
function shiftFinanceMonth(delta){const d=financeParseMonth(financeCurrentMonth());d.setMonth(d.getMonth()+delta);S.finance.month=financeMonthKey(d);renderFinance();}
function renderFinance(){
  if(!S.finance) return;
  financeCurrentMonth();
  const root=document.getElementById('financeContent');
  if(!root)return;
  document.getElementById('financeMonthLabel').textContent=financeMonthLabel(S.finance.month);
  document.querySelectorAll('.fin-seg-btn').forEach(b=>b.classList.toggle('on',b.dataset.view===S.finance.view));
  root.innerHTML=S.finance.view==='house'?renderFinanceHouse():renderFinancePersonal();
  if(S.finance.view==='personal')setTimeout(financeSyncTxForm,0);
}
function renderFinancePersonal(){
  const txs=financePersonalTxs();
  const income=txs.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount||0),0);
  const expense=txs.filter(t=>t.type==='expense'||t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  const balance=(S.finance.accounts||[]).reduce((a,x)=>a+Number(x.balance||0),0)+income-expense;
  const cardUsed=txs.filter(t=>t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  return `
    <div class="fin-metrics">
      ${financeMetric('Saldo total',financeMoney(balance),'Contas + mês','var(--green)')}
      ${financeMetric('Receitas',financeMoney(income),'no mês','var(--green)')}
      ${financeMetric('Despesas',financeMoney(expense),'no mês','var(--red)')}
      ${financeMetric('Cartão',financeMoney(cardUsed),'utilizado','var(--pink)')}
    </div>
    <div class="fin-actions-grid">
      <button class="fin-action income" onclick="financePickType('income')">+ Receita</button>
      <button class="fin-action expense" onclick="financePickType('expense')">+ Despesa</button>
      <button class="fin-action transfer" onclick="financePickType('transfer')">Transferência</button>
      <button class="fin-action card" onclick="financePickType('card')">Gasto cartão</button>
    </div>
    ${renderFinanceTxForm()}
    <div class="fin-two-col">
      ${renderFinanceAccounts()}
      ${renderFinanceCards()}
    </div>
    ${renderFinanceTxList(txs)}
  `;
}
function financeMetric(title,value,sub,color){return `<div class="fin-metric"><div class="fin-metric-title">${title}</div><div class="fin-metric-value" style="color:${color}">${value}</div><div class="fin-metric-sub">${sub}</div></div>`;}
function financePickType(type){const el=document.getElementById('finTxType');if(el){el.value=type;financeSyncTxForm();}}
function financeSyncTxForm(){
  const type=document.getElementById('finTxType')?.value||'expense';
  document.querySelectorAll('[data-fin-type]').forEach(el=>{el.style.display=el.dataset.finType.split(',').includes(type)?'block':'none';});
  const btn=document.getElementById('finAddTxBtn');
  if(btn)btn.textContent=type==='income'?'Adicionar receita':type==='transfer'?'Adicionar transferência':type==='card'?'Adicionar gasto no cartão':'Adicionar despesa';
}
function renderFinanceTxForm(){
  const acc=S.finance.accounts?.[0]?.id||'';
  const card=S.finance.cards?.[0]?.id||'';
  return `<div class="fin-card fin-form-card">
    <div class="fin-card-head"><div><div class="fin-card-title">Novo lançamento</div><div class="fin-card-sub">Registre receitas, despesas, cartão ou transferência.</div></div></div>
    <div class="fin-form-grid">
      <div class="m-grp"><label class="m-lbl">Tipo</label><select class="field" id="finTxType" onchange="financeSyncTxForm()"><option value="expense">Despesa</option><option value="income">Receita</option><option value="transfer">Transferência</option><option value="card">Gasto no cartão</option></select></div>
      <div class="m-grp"><label class="m-lbl">Valor</label><input class="field" id="finTxAmount" type="number" step="0.01" inputmode="decimal" placeholder="0,00"></div>
      <div class="m-grp fin-wide"><label class="m-lbl">Descrição</label><input class="field" id="finTxTitle" type="text" placeholder="Ex: Mercado, salário, Uber" autocomplete="off"></div>
      <div class="m-grp fin-date-grp"><label class="m-lbl">Data</label><input class="field fin-date-field" id="finTxDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="m-grp" data-fin-type="expense,income"><label class="m-lbl">Conta</label><select class="field" id="finTxAccount">${financeAccountOptions(acc)}</select></div>
      <div class="m-grp" data-fin-type="transfer"><label class="m-lbl">De</label><select class="field" id="finTxFrom">${financeAccountOptions(acc)}</select></div>
      <div class="m-grp" data-fin-type="transfer"><label class="m-lbl">Para</label><select class="field" id="finTxTo">${financeAccountOptions(S.finance.accounts?.[1]?.id||acc)}</select></div>
      <div class="m-grp" data-fin-type="card"><label class="m-lbl">Cartão</label><select class="field" id="finTxCard">${financeCardOptions(card)}</select></div>
      <div class="m-grp"><label class="m-lbl">Categoria</label><select class="field" id="finTxCategory">${financeCategoryOptions('Outros')}</select></div>
    </div>
    <button class="action-btn fin-submit" id="finAddTxBtn" onclick="addFinanceTx()">Adicionar despesa</button>
  </div>`;
}
function addFinanceTx(){
  const type=financeVal('finTxType')||'expense';
  const amount=financeNum('finTxAmount');
  const title=financeVal('finTxTitle')||'Lançamento';
  const date=financeVal('finTxDate')||new Date().toISOString().slice(0,10);
  if(amount<=0){showToast('Informe um valor válido');return;}
  const tx={id:++financeTxId,scope:'personal',type,amount,title,date,category:financeVal('finTxCategory')||'Outros',createdAt:Date.now()};
  if(type==='transfer'){tx.fromAccountId=financeVal('finTxFrom');tx.toAccountId=financeVal('finTxTo');}
  else if(type==='card'){tx.cardId=financeVal('finTxCard');}
  else tx.accountId=financeVal('finTxAccount');
  S.finance.transactions.unshift(tx);
  showToast('Lançamento adicionado');
  renderFinance();renderHome?.();
}
function deleteFinanceTx(id){if(!confirm('Excluir este lançamento?'))return;S.finance.transactions=S.finance.transactions.filter(t=>t.id!==id);renderFinance();renderHome?.();}
function renderFinanceAccounts(){
  return `<div class="fin-card"><div class="fin-card-title">Contas</div><div class="fin-list">${(S.finance.accounts||[]).map(a=>`<div class="fin-row"><div><strong>${unioEscape(a.name)}</strong><span>${unioEscape(a.type||'Conta')}</span></div><button onclick="deleteFinanceAccount(${a.id})">×</button></div>`).join('')||'<div class="empty"><em>🏦</em>Nenhuma conta.</div>'}</div><div class="fin-mini-form"><input class="field" id="finAccName" placeholder="Nova conta"><button onclick="addFinanceAccount()">Adicionar</button></div></div>`;
}
function addFinanceAccount(){const name=financeVal('finAccName');if(!name)return;S.finance.accounts.push({id:++financeAccountId,name,type:'Conta',balance:0});renderFinance();}
function deleteFinanceAccount(id){if((S.finance.accounts||[]).length<=1){showToast('Mantenha pelo menos uma conta');return;}S.finance.accounts=S.finance.accounts.filter(a=>a.id!==id);renderFinance();}
function renderFinanceCards(){
  return `<div class="fin-card"><div class="fin-card-title">Cartões</div><div class="fin-list">${(S.finance.cards||[]).map(c=>`<div class="fin-row"><div><strong>${unioEscape(c.name)}</strong><span>Fecha ${c.closingDay||'—'} · vence ${c.dueDay||'—'}</span></div><button onclick="deleteFinanceCard(${c.id})">×</button></div>`).join('')||'<div class="empty"><em>💳</em>Nenhum cartão.</div>'}</div><div class="fin-mini-form"><input class="field" id="finCardName" placeholder="Novo cartão"><button onclick="addFinanceCard()">Adicionar</button></div></div>`;
}
function addFinanceCard(){const name=financeVal('finCardName');if(!name)return;S.finance.cards.push({id:++financeCardId,name,limit:0,closingDay:20,dueDay:27});renderFinance();}
function deleteFinanceCard(id){S.finance.cards=S.finance.cards.filter(c=>c.id!==id);renderFinance();}
function renderFinanceTxList(txs){
  return `<div class="fin-card"><div class="fin-card-head"><div><div class="fin-card-title">Últimos lançamentos</div><div class="fin-card-sub">${txs.length} no mês selecionado</div></div></div><div class="fin-list fin-tx-list">${txs.length?txs.map(t=>financeTxItem(t)).join(''):'<div class="empty"><em>💰</em>Nenhum lançamento neste mês.</div>'}</div></div>`;
}
function financeTxItem(t){
  const sign=t.type==='income'?'+':t.type==='transfer'?'↔':'-';
  const cls=t.type==='income'?'income':t.type==='transfer'?'transfer':'expense';
  const meta=t.type==='card'?financeCardName(t.cardId):t.type==='transfer'?`${financeAccountName(t.fromAccountId)} → ${financeAccountName(t.toAccountId)}`:financeAccountName(t.accountId);
  return `<div class="fin-tx ${cls}"><div><strong>${unioEscape(t.title)}</strong><span>${financeDateLabel(t.date)} · ${unioEscape(t.category||'Outros')} · ${unioEscape(meta)}</span></div><div class="fin-tx-side"><b>${sign} ${financeMoney(t.amount)}</b><button onclick="deleteFinanceTx(${t.id})">×</button></div></div>`;
}
function renderFinanceHouse(){
  const bills=financeHouseBills();
  const total=bills.reduce((a,b)=>a+Number(b.amount||0),0);
  const paid=bills.filter(b=>b.paid).reduce((a,b)=>a+Number(b.amount||0),0);
  const pending=total-paid;
  const split=financeHouseSplit(total);
  return `
    <div class="fin-metrics">
      ${financeMetric('Casa',financeMoney(total),'despesas do mês','var(--green)')}
      ${financeMetric('Pago',financeMoney(paid),'já quitado','var(--blue)')}
      ${financeMetric('Pendente',financeMoney(pending),'a pagar','var(--orange)')}
      ${financeMetric('Divisão',financeMoney(split.a),'Gabriel estimado','var(--brand)')}
    </div>
    ${renderHouseConfig()}
    ${renderHouseBillForm()}
    ${renderHouseBillList(bills,split)}
  `;
}
function financeHouseSplit(total){
  const people=S.finance.house.people||[];
  const a=people[0]||{income:0},b=people[1]||{income:0};
  if(S.finance.house.splitMode==='income'){
    const ta=Number(a.income)||0,tb=Number(b.income)||0,sum=ta+tb;
    if(sum>0)return {a:total*(ta/sum),b:total*(tb/sum)};
  }
  return {a:total/2,b:total/2};
}
function renderHouseConfig(){
  const p=S.finance.house.people||[];
  return `<div class="fin-card"><div class="fin-card-head"><div><div class="fin-card-title">Divisão da casa</div><div class="fin-card-sub">Configure nomes, rendas e modo de divisão.</div></div></div>
  <div class="fin-seg small"><button class="fin-seg-btn ${S.finance.house.splitMode==='fifty'?'on':''}" onclick="setHouseSplitMode('fifty')">50/50</button><button class="fin-seg-btn ${S.finance.house.splitMode==='income'?'on':''}" onclick="setHouseSplitMode('income')">Proporcional</button></div>
  <div class="fin-form-grid"><div class="m-grp"><label class="m-lbl">Pessoa 1</label><input class="field" id="houseP1" value="${unioEscape(p[0]?.name||'Gabriel')}"></div><div class="m-grp"><label class="m-lbl">Renda</label><input class="field" id="houseI1" type="number" value="${Number(p[0]?.income)||0}"></div><div class="m-grp"><label class="m-lbl">Pessoa 2</label><input class="field" id="houseP2" value="${unioEscape(p[1]?.name||'Giulianna')}"></div><div class="m-grp"><label class="m-lbl">Renda</label><input class="field" id="houseI2" type="number" value="${Number(p[1]?.income)||0}"></div></div><button class="action-btn fin-submit" onclick="saveHousePeople()">Salvar divisão</button></div>`;
}
function setHouseSplitMode(mode){S.finance.house.splitMode=mode;renderFinance();}
function saveHousePeople(){S.finance.house.people=[{id:'gabriel',name:financeVal('houseP1')||'Gabriel',income:financeNum('houseI1')},{id:'giulianna',name:financeVal('houseP2')||'Giulianna',income:financeNum('houseI2')}];renderFinance();}
function renderHouseBillForm(){return `<div class="fin-card"><div class="fin-card-title">Nova conta da casa</div><div class="fin-form-grid"><div class="m-grp fin-wide"><label class="m-lbl">Descrição</label><input class="field" id="houseBillTitle" placeholder="Ex: Internet, mercado, reforma"></div><div class="m-grp"><label class="m-lbl">Valor</label><input class="field" id="houseBillAmount" type="number" step="0.01" placeholder="0,00"></div><div class="m-grp fin-date-grp"><label class="m-lbl">Data</label><input class="field fin-date-field" id="houseBillDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="m-grp"><label class="m-lbl">Categoria</label><select class="field" id="houseBillCategory">${financeCategoryOptions('Casa')}</select></div><div class="m-grp"><label class="m-lbl">Quem pagou</label><select class="field" id="houseBillPaidBy"><option value="gabriel">${unioEscape(S.finance.house.people?.[0]?.name||'Gabriel')}</option><option value="giulianna">${unioEscape(S.finance.house.people?.[1]?.name||'Giulianna')}</option><option value="none">Ninguém ainda</option></select></div></div><button class="action-btn fin-submit" onclick="addHouseBill()">Adicionar conta da casa</button></div>`;}
function addHouseBill(){const amount=financeNum('houseBillAmount'),title=financeVal('houseBillTitle')||'Conta da casa';if(amount<=0){showToast('Informe um valor válido');return;}S.finance.house.bills.unshift({id:++financeBillId,title,amount,date:financeVal('houseBillDate')||new Date().toISOString().slice(0,10),category:financeVal('houseBillCategory')||'Casa',paidBy:financeVal('houseBillPaidBy')||'none',paid:financeVal('houseBillPaidBy')!=='none',createdAt:Date.now()});showToast('Conta da casa adicionada');renderFinance();renderHome?.();}
function toggleHouseBillPaid(id){const b=S.finance.house.bills.find(x=>x.id===id);if(b){b.paid=!b.paid;renderFinance();}}
function deleteHouseBill(id){if(!confirm('Excluir esta conta da casa?'))return;S.finance.house.bills=S.finance.house.bills.filter(b=>b.id!==id);renderFinance();renderHome?.();}
function renderHouseBillList(bills,split){const p=S.finance.house.people||[];return `<div class="fin-card"><div class="fin-card-head"><div><div class="fin-card-title">Contas da casa</div><div class="fin-card-sub">${p[0]?.name||'Gabriel'}: ${financeMoney(split.a)} · ${p[1]?.name||'Giulianna'}: ${financeMoney(split.b)}</div></div></div><div class="fin-list">${bills.length?bills.map(b=>`<div class="fin-tx ${b.paid?'income':'expense'}"><div><strong>${unioEscape(b.title)}</strong><span>${financeDateLabel(b.date)} · ${unioEscape(b.category)} · ${b.paid?'Pago':'Pendente'}</span></div><div class="fin-tx-side"><b>${financeMoney(b.amount)}</b><button onclick="toggleHouseBillPaid(${b.id})">${b.paid?'↺':'✓'}</button><button onclick="deleteHouseBill(${b.id})">×</button></div></div>`).join(''):'<div class="empty"><em>🏠</em>Nenhuma conta da casa neste mês.</div>'}</div></div>`;}
