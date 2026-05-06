/* Unio Base Organizada v24 */
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


/* ━━━━ MODAL DE EDIÇÃO REUTILIZÁVEL ━━━━ */
var UI_EDIT_MODAL=null;

function ensureEditModal(){
  let modal=document.getElementById('editModal');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.id='editModal';
  modal.className='modal off edit-modal';
  modal.innerHTML=`
    <div class="modal-card edit-modal-card" role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
      <div class="modal-head">
        <div>
          <div class="modal-title" id="editModalTitle">Editar</div>
          <div class="modal-sub" id="editModalSub"></div>
        </div>
        <button class="modal-x" type="button" onclick="closeEditModal()">×</button>
      </div>
      <div class="edit-modal-body" id="editModalBody"></div>
      <div class="edit-modal-actions">
        <button class="edit-modal-cancel" type="button" onclick="closeEditModal()">Cancelar</button>
        <button class="edit-modal-save" type="button" onclick="saveEditModal()">Salvar</button>
      </div>
    </div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)closeEditModal();});
  document.body.appendChild(modal);
  return modal;
}
function openEditModal(config){
  const modal=ensureEditModal();
  UI_EDIT_MODAL=config||{};
  document.getElementById('editModalTitle').textContent=UI_EDIT_MODAL.title||'Editar';
  document.getElementById('editModalSub').textContent=UI_EDIT_MODAL.subtitle||'Atualize as informações abaixo.';
  document.getElementById('editModalBody').innerHTML=(UI_EDIT_MODAL.fields||[]).map(field=>renderEditField(field)).join('');
  modal.classList.remove('off');
  setTimeout(()=>document.querySelector('#editModalBody .field')?.focus(),80);
}
function renderEditField(field){
  const id=`edit_${field.name}`;
  const value=field.value??'';
  const label=unioEscape(field.label||field.name);
  const type=field.type||'text';
  const inputmode=field.inputmode?` inputmode="${field.inputmode}"`:'';
  const placeholder=field.placeholder?` placeholder="${unioEscape(field.placeholder)}"`:'';
  if(field.type==='select'){
    return `<div class="m-grp"><label class="m-lbl" for="${id}">${label}</label><select class="field" id="${id}">${(field.options||[]).map(o=>`<option value="${unioEscape(o.value)}"${String(o.value)===String(value)?' selected':''}>${unioEscape(o.label)}</option>`).join('')}</select></div>`;
  }
  return `<div class="m-grp"><label class="m-lbl" for="${id}">${label}</label><input class="field" id="${id}" type="${type}" value="${unioEscape(value)}"${inputmode}${placeholder}></div>`;
}
function collectEditModalValues(){
  const values={};
  (UI_EDIT_MODAL?.fields||[]).forEach(field=>{
    const el=document.getElementById(`edit_${field.name}`);
    values[field.name]=el?el.value:'';
  });
  return values;
}
function saveEditModal(){
  if(!UI_EDIT_MODAL||typeof UI_EDIT_MODAL.onSave!=='function'){closeEditModal();return;}
  const result=UI_EDIT_MODAL.onSave(collectEditModalValues());
  if(result===false)return;
  closeEditModal();
}
function closeEditModal(){
  const modal=document.getElementById('editModal');
  if(modal)modal.classList.add('off');
  UI_EDIT_MODAL=null;
}
