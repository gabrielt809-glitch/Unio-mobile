/* Unio Base Organizada v2 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ONBOARDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const OB_STEPS=5;let obStep=0;
const OB_HABS_OPTS=[{emoji:'💧',name:'Beber água'},{emoji:'🏃',name:'Exercitar'},{emoji:'📚',name:'Ler'},{emoji:'🧘',name:'Meditar'},{emoji:'😴',name:'Dormir bem'},{emoji:'🥗',name:'Comer bem'},{emoji:'✍️',name:'Escrever'},{emoji:'🚶',name:'Caminhar'}];
let obSelHabs=new Set();let S_name='';
function showOnboarding(){const ob=document.getElementById('onboarding');ob.style.display='flex';ob.style.opacity='1';document.getElementById('obProg').innerHTML=Array.from({length:OB_STEPS+1},(_,i)=>`<div class="ob-dot${i===0?' on':''}"></div>`).join('');document.getElementById('obHabGrid').innerHTML=OB_HABS_OPTS.map((h,i)=>`<div class="ob-hab-opt" id="obhab${i}" onclick="toggleObHab(${i},this)"><div class="ob-hab-ico">${h.emoji}</div>${h.name}</div>`).join('');}
function toggleObHab(i,el){haptic('light');el.classList.toggle('sel');if(obSelHabs.has(i))obSelHabs.delete(i);else obSelHabs.add(i);}
function obNext(){haptic('light');if(obStep===1){const v=document.getElementById('obName').value.trim();if(v)S_name=v;localStorage.setItem('unio_name',S_name);}if(obStep===2){const v=parseInt(document.getElementById('obWeight').value)||0;if(v>0&&v<400)S.weight=v;}if(obStep===3){const v=parseInt(document.getElementById('obWater').value)||0;if(v>0)S.water.goal=v;}if(obStep===4){obSelHabs.forEach(i=>{const h=OB_HABS_OPTS[i];S.habits.push({id:++habId,name:h.name,emoji:h.emoji,freq:'diario',log:[],streak:0});});if(S_name)document.getElementById('obReadyTitle').textContent='Tudo pronto, '+S_name+'!';}obStep++;if(obStep>OB_STEPS){finishOnboarding();return;}document.querySelectorAll('.ob-dot').forEach((d,i)=>d.classList.toggle('on',i===obStep));document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));document.getElementById('ob'+obStep).classList.add('active');}
function finishOnboarding(){haptic('success');const ob=document.getElementById('onboarding');ob.classList.add('out');saveState();setTimeout(()=>{ob.style.display='none';renderHome();renderHabits();renderWater();},450);localStorage.setItem(STORE_KEY+'_onboarded','1');}
