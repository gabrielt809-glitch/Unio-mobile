/* Unio Base Organizada v9.4 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UI COMPONENTS — helpers HTML reutilizáveis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function uiEmptyState(icon,title,text=''){
  return `<div class="empty ui-empty">${icon?`<em>${unioEscape(icon)}</em>`:''}${unioEscape(title||'Nada por aqui')}${text?`<span>${unioEscape(text)}</span>`:''}</div>`;
}
function uiSectionHead(title,subtitle=''){
  return `<div class="ui-section-head"><div><div class="ui-section-title">${unioEscape(title)}</div>${subtitle?`<div class="ui-section-sub">${unioEscape(subtitle)}</div>`:''}</div></div>`;
}
function uiPill(label,tone=''){
  return `<span class="ui-pill ${tone}">${unioEscape(label)}</span>`;
}
function uiSafeText(value){
  return unioEscape(value);
}
