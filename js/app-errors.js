/* Unio Base Organizada v9.5.1 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP ERRORS — execução segura e diagnóstico simples de erros
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function handleAppError(error,message='Ocorreu um erro no app.'){
  console.warn('[Unio]',message,error);
  try{showToast?.(message,'⚠️',2600);}catch(_){}
}
function safeRun(fn,message='Não foi possível concluir esta ação.'){
  try{return fn();}
  catch(error){handleAppError(error,message);return null;}
}
function safeJsonParse(raw,fallback=null){
  try{return JSON.parse(raw);}
  catch(error){handleAppError(error,'Não foi possível ler os dados salvos.');return fallback;}
}
