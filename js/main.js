/* Академия Одаренности — интерфейс: атмосфера, навигация, HUD игр */
(function(){
'use strict';

/* Атмосфера: листья, светлячки, пылинки */
(function(){
 const host=document.getElementById('particles');
 if(!host)return;
 const mobile=window.matchMedia('(max-width:760px)').matches;
 const counts={leaf:mobile?10:18,fire:mobile?12:22,dust:mobile?16:30};
 Object.entries(counts).forEach(([type,count])=>{
  for(let i=0;i<count;i++){
   const el=document.createElement('span');
   el.className='p '+type;
   el.style.left=Math.random()*100+'%';
   el.style.animationDuration=(12+Math.random()*18)+'s';
   el.style.animationDelay=(-Math.random()*20)+'s';
   el.style.setProperty('--dx',(Math.random()*120-60)+'px');
   host.appendChild(el);
  }
 });
})();

/* Плавная прокрутка */
document.querySelectorAll('a[href^="#"]').forEach(link=>{
 link.addEventListener('click',e=>{
  const target=document.querySelector(link.getAttribute('href'));
  if(!target)return;
  e.preventDefault();
  window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-72,behavior:'smooth'});
 });
});

/* Прогресс пути */
const bar=document.getElementById('progressBar');
function update(){
 const h=document.documentElement;
 bar.style.width=Math.min(100,Math.max(0,h.scrollTop/(h.scrollHeight-h.clientHeight)*100))+'%';
}
window.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',update);
update();

/* HUD игр: счет и обратная связь из 3D-сцен */
window.addEventListener('ga:score',e=>{
 const {game,done,total}=e.detail;
 const el=document.querySelector('[data-score="'+game+'"]');
 if(el)el.textContent=done+' / '+total;
});
window.addEventListener('ga:feedback',e=>{
 const {game,text,ok}=e.detail;
 const el=document.querySelector('[data-feedback="'+game+'"]');
 if(!el)return;
 el.textContent=text;
 el.style.color=ok===false?'#b3573f':ok===true?'#3f6b4a':'#6f5b45';
});

/* Перезапуск игры */
document.querySelectorAll('[data-restart]').forEach(btn=>{
 btn.addEventListener('click',()=>{
  const game=btn.dataset.restart;
  window.dispatchEvent(new CustomEvent('ga:restart',{detail:{game}}));
 });
});

})();