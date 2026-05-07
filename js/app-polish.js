/* Unio Base Organizada v25 */
/* ━━━━ APP POLISH — ajustes finos globais de UX/layout ━━━━ */
(function(){
  function setViewportUnits(){
    const vh=window.innerHeight*0.01;
    document.documentElement.style.setProperty('--vh',`${vh}px`);
  }
  function setInputModeClass(){
    const active=document.activeElement;
    const typing=active&&['INPUT','TEXTAREA','SELECT'].includes(active.tagName);
    document.body.classList.toggle('keyboard-open',!!typing);
  }
  function markScrollablePanels(){
    document.querySelectorAll('.panel,.sheet,.edit-modal-body,.content').forEach(el=>{
      el.classList.add('polished-scroll');
    });
  }
  function installPolish(){
    setViewportUnits();
    markScrollablePanels();
    document.body.classList.add('unio-polished-v23');
    document.addEventListener('focusin',setInputModeClass);
    document.addEventListener('focusout',()=>setTimeout(setInputModeClass,120));
    window.addEventListener('resize',setViewportUnits,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(setViewportUnits,240),{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPolish);
  else installPolish();
})();
