/* Unio Base Organizada v23 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP BACKUP — exportação, importação, CSV e segurança de dados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function buildStateSnapshot(){
  return {
    schemaVersion:APP_SCHEMA_VERSION,
    activeDay:S.activeDay,
    water:S.water,
    tasks:S.tasks,
    taskCategories:S.taskCategories,
    taskView:S.taskView,
    sleep:S.sleep,
    sleepGoal:S.sleepGoal,
    nutr:S.nutr,
    health:S.health,
    habits:S.habits,
    selDay:S.selDay,
    taskWeekAnchor:S.taskWeekAnchor,
    tNoDate:S.tNoDate,
    weight:S.weight,
    pinnedTabs:S.pinnedTabs,
    curTab:S.curTab,
    focus:{
      type:S.focus.type,
      brkType:S.focus.brkType,
      sessions:S.focus.sessions,
      onBreak:false,
      remaining:S.focus.running?S.focus.type*60:S.focus.remaining,
      preset:S.focus.preset||'pomodoro',
      custom:S.focus.custom||{focus:30,break:5},
      logs:Array.isArray(S.focus.logs)?S.focus.logs:[]
    },
    finance:S.finance,
    breathMode:S.breathMode,
    tId,
    habId,
    financeTxId,
    financeAccountId,
    financeCardId,
    financeBillId,
    savedAt:Date.now()
  };
}
function buildBackupPayload(){
  if(typeof saveState==='function')saveState();
  return {
    app:'Unio',
    backupVersion:1,
    appSchemaVersion:APP_SCHEMA_VERSION,
    financeSchemaVersion:FINANCE_SCHEMA_VERSION,
    exportedAt:new Date().toISOString(),
    diagnostics:typeof getAppDiagnostics==='function'?getAppDiagnostics():null,
    data:buildStateSnapshot()
  };
}
function downloadTextFile(filename,content,type='application/json;charset=utf-8'){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1200);
}
function exportBackup(){
  return safeRun(()=>{
    const payload=buildBackupPayload();
    const date=new Date().toISOString().slice(0,10);
    downloadTextFile(`unio-backup-${date}.json`,JSON.stringify(payload,null,2));
    showToast('Backup exportado');
  },'Não foi possível exportar o backup.');
}
function validateBackupPayload(payload){
  if(!payload||typeof payload!=='object')return {ok:false,message:'Arquivo inválido'};
  const data=payload.data||payload;
  if(!data||typeof data!=='object')return {ok:false,message:'Backup sem dados'};
  if(!data.finance&&!data.tasks&&!data.habits&&!data.water)return {ok:false,message:'Este arquivo não parece ser um backup do Unio'};
  return {ok:true,data};
}
function openBackupImport(){
  const input=document.getElementById('backupImportInput');
  if(input){input.value='';input.click();}
}
function handleBackupFile(input){
  const file=input?.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    safeRun(()=>{
      const parsed=JSON.parse(String(reader.result||'{}'));
      const validation=validateBackupPayload(parsed);
      if(!validation.ok){showToast(validation.message);return;}
      const diagnostics=parsed.diagnostics;
      const label=diagnostics?`Backup com ${diagnostics.tasks||0} tarefas, ${diagnostics.habits||0} hábitos e ${diagnostics.finance?.transactions||0} lançamentos.`:'Backup válido encontrado.';
      if(!confirm(`${label}\n\nImportar este backup vai substituir os dados atuais deste aparelho. Continuar?`))return;
      importBackupData(validation.data);
    },'Não foi possível importar o backup.');
  };
  reader.onerror=()=>showToast('Não foi possível ler o arquivo');
  reader.readAsText(file);
}
function importBackupData(data){
  const migrated=typeof migrateLoadedState==='function'?migrateLoadedState(data):data;
  localStorage.setItem(STORE_KEY,JSON.stringify(migrated));
  localStorage.setItem(STORE_KEY+'_onboarded','1');
  showToast('Backup importado');
  setTimeout(()=>location.reload(),900);
}
function csvCell(value){
  const raw=String(value??'');
  return `"${raw.replace(/"/g,'""')}"`;
}
function toCSV(rows){
  if(!rows.length)return '';
  const headers=Object.keys(rows[0]);
  return [headers.map(csvCell).join(';')].concat(rows.map(row=>headers.map(h=>csvCell(row[h])).join(';'))).join('\n');
}
function exportFinanceCSV(){
  return safeRun(()=>{
    const rows=[];
    (S.finance.transactions||[]).forEach(t=>rows.push({
      origem:'pessoal',
      tipo:t.type||'',
      data:t.date||'',
      descricao:t.title||'',
      categoria:t.category||'',
      valor:Number(t.amount)||0,
      conta:financeAccountName?.(t.accountId)||'',
      cartao:financeCardName?.(t.cardId)||'',
      parcela:t.installments?`${t.installment}/${t.installments}`:'',
      recorrente:'não',
      status:''
    }));
    (S.finance.recurring||[]).forEach(r=>rows.push({
      origem:'recorrencia',
      tipo:r.type||'',
      data:r.startMonth||'',
      descricao:r.title||'',
      categoria:r.category||'',
      valor:Number(r.amount)||0,
      conta:financeAccountName?.(r.accountId)||'',
      cartao:'',
      parcela:'',
      recorrente:'sim',
      status:r.active===false?'inativa':'ativa'
    }));
    (S.finance.house?.bills||[]).forEach(b=>rows.push({
      origem:'casa',
      tipo:'house_bill',
      data:b.date||'',
      descricao:b.title||'',
      categoria:b.category||'Casa',
      valor:Number(b.amount)||0,
      conta:b.paidBy||'',
      cartao:'',
      parcela:'',
      recorrente:'não',
      status:b.paid?'pago':'pendente'
    }));
    financeHouseProjects?.().forEach(project=>{
      (project.items||[]).forEach(item=>rows.push({
        origem:`projeto: ${project.name}`,
        tipo:'project_item',
        data:'',
        descricao:item.title||'',
        categoria:'Projeto da casa',
        valor:Number(item.estimated)||0,
        conta:'',
        cartao:'',
        parcela:'',
        recorrente:'não',
        status:item.status||''
      }));
    });
    const csv=toCSV(rows.length?rows:[{origem:'',tipo:'',data:'',descricao:'',categoria:'',valor:'',conta:'',cartao:'',parcela:'',recorrente:'',status:''}]);
    const date=new Date().toISOString().slice(0,10);
    downloadTextFile(`unio-financas-${date}.csv`,csv,'text/csv;charset=utf-8');
    showToast('CSV exportado');
  },'Não foi possível exportar o CSV.');
}
function renderDataTools(){
  const box=document.getElementById('dataToolsBox');
  if(!box)return;
  const d=typeof getAppDiagnostics==='function'?getAppDiagnostics():{};
  const kb=Math.max(1,Math.round((d.storageBytes||0)/1024));
  const totalRecords=[
    d.tasks||0,
    d.habits||0,
    d.sleep||0,
    d.nutritionItems||0,
    d.healthActivities||0,
    d.focusLogs||0,
    d.finance?.transactions||0,
    d.finance?.houseBills||0
  ].reduce((a,b)=>a+Number(b||0),0);
  box.innerHTML=`
    <div class="data-diag-grid v22">
      <div><span>Dados</span><strong>${kb} KB</strong></div>
      <div><span>Registros</span><strong>${totalRecords}</strong></div>
      <div><span>Home score</span><strong>${d.homeScore??'—'}</strong></div>
      <div><span>Schema</span><strong>${d.appSchemaVersion||APP_SCHEMA_VERSION}</strong></div>
    </div>
    <div class="data-module-grid">
      <div><span>Tarefas</span><strong>${d.tasks||0}</strong></div>
      <div><span>Hábitos</span><strong>${d.habits||0}</strong></div>
      <div><span>Sono</span><strong>${d.sleep||0}</strong></div>
      <div><span>Nutrição</span><strong>${d.nutritionItems||0}</strong></div>
      <div><span>Saúde</span><strong>${d.healthActivities||0}</strong></div>
      <div><span>Foco</span><strong>${d.focusLogs||0}</strong></div>
      <div><span>Finanças</span><strong>${d.finance?.transactions||0}</strong></div>
      <div><span>Casa</span><strong>${d.finance?.houseBills||0}</strong></div>
    </div>
    <div class="data-actions">
      <button onclick="exportBackup()">Exportar backup JSON</button>
      <button onclick="openBackupImport()">Importar backup</button>
      <button onclick="exportFinanceCSV()">Exportar finanças CSV</button>
      <button class="danger" onclick="confirmSafeReset()">Reset seguro</button>
    </div>
    <div class="data-hint">O backup fica salvo como arquivo no seu aparelho. Use antes de grandes atualizações.</div>
  `;
}

function confirmSafeReset(){
  const first=confirm('Antes de apagar, recomendamos exportar um backup. Quer continuar mesmo assim?');
  if(!first)return;
  const phrase=prompt('Digite APAGAR para confirmar o reset seguro.');
  if(String(phrase||'').trim().toUpperCase()!=='APAGAR'){showToast('Reset cancelado');return;}
  clearAllData();
}
