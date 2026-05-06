/* Unio Base Organizada v24 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP FORMS — helpers seguros para formulários
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function formValue(id,fallback=''){
  const el=typeof id==='string'?document.getElementById(id):id;
  const value=el?.value;
  return value===undefined||value===null?fallback:String(value).trim();
}
function formNumber(id,fallback=0){
  const value=formValue(id,'');
  if(value==='')return fallback;
  const normalized=String(value).replace(/\./g,'').replace(',','.');
  const n=Number(normalized);
  return Number.isFinite(n)?n:fallback;
}
function formDate(id,fallback){
  const value=formValue(id,'');
  if(isDateInputValue(value))return value;
  return fallback||dayKey(new Date());
}
function isDateInputValue(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;
  const d=new Date(String(value)+'T00:00:00');
  return !Number.isNaN(d.getTime());
}
function formatDateBR(value,opts={}){
  if(!value)return opts.fallback||'Sem data';
  const d=new Date(String(value)+'T00:00:00');
  if(Number.isNaN(d.getTime()))return opts.fallback||'Sem data';
  return d.toLocaleDateString('pt-BR',opts.short?{day:'2-digit',month:'2-digit'}:{day:'2-digit',month:'2-digit',year:'numeric'});
}
function getMonthKeyFromDate(value){
  return isDateInputValue(value)?String(value).slice(0,7):'';
}
function isSameMonthKey(dateValue,monthKey){
  return getMonthKeyFromDate(dateValue)===(monthKey||'');
}
function resetFormFields(ids=[]){
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.value='';
  });
}
