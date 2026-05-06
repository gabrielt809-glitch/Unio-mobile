/* Unio Base Organizada v9.4 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINANÇAS — cálculos
   Totais pessoais, totais da casa e divisão.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ━━━━ CALCULATIONS ━━━━ */
function calculateFinancePersonalSummary(){
  const txs=financePersonalTxs();
  const accountsTotal=(S.finance.accounts||[]).reduce((a,x)=>a+Number(x.balance||0),0);
  const income=txs.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount||0),0);
  const expense=txs.filter(t=>t.type==='expense'||t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  const cardUsed=txs.filter(t=>t.type==='card').reduce((a,t)=>a+Number(t.amount||0),0);
  return {txs,accountsTotal,income,expense,cardUsed,balance:accountsTotal+income-expense};
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
function calculateFinanceHouseSummary(){
  const bills=financeHouseBills();
  const total=bills.reduce((a,b)=>a+Number(b.amount||0),0);
  const paid=bills.filter(b=>b.paid).reduce((a,b)=>a+Number(b.amount||0),0);
  const pending=total-paid;
  const split=financeHouseSplit(total);
  return {bills,total,paid,pending,split};
}

