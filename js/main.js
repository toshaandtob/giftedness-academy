/* Академия Одаренности — игровая логика: перетаскивание, поиск, квесты */
(function(){
'use strict';

/* ---------- Атмосфера: листья, светлячки, пылинки ---------- */
(function spawnParticles(){
 const host=document.getElementById('particles');
 if(!host)return;
 const isMobile=window.matchMedia('(max-width:760px)').matches;
 const counts={leaf:isMobile?10:18,fire:isMobile?12:22,dust:isMobile?16:30};
 Object.entries(counts).forEach(([type,count])=>{
  for(let i=0;i<count;i++){
   const el=document.createElement('span');
   el.className='p '+type;
   el.style.left=Math.random()*100+'%';
   el.style.animationDuration=(12+Math.random()*18)+'s';
   el.style.animationDelay=(-Math.random()*20)+'s';
   el.style.setProperty('--dx',(Math.random()*120-60)+'px');
   if(type==='leaf')el.style.opacity=.4+Math.random()*.5;
   host.appendChild(el);
  }
 });
})();

/* ---------- Навигация и прогресс ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link=>{
 link.addEventListener('click',e=>{
  const target=document.querySelector(link.getAttribute('href'));
  if(!target)return;
  e.preventDefault();
  const top=target.getBoundingClientRect().top+window.scrollY-72;
  window.scrollTo({top,behavior:'smooth'});
 });
});
const bar=document.getElementById('progressBar');
function updateProgress(){
 const h=document.documentElement;
 const value=h.scrollTop/(h.scrollHeight-h.clientHeight)*100;
 bar.style.width=Math.min(100,Math.max(0,value))+'%';
}
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();

/* ---------- Хранилище прогресса ---------- */
const store={
 get(k){try{return JSON.parse(localStorage.getItem('ga_'+k)||'null')}catch(e){return null}},
 set(k,v){try{localStorage.setItem('ga_'+k,JSON.stringify(v))}catch(e){}}
};

/* ---------- Универсальный drag-and-drop (мышь + палец) ---------- */
class DragGame{
 constructor(name,cfg){
  this.name=name;this.cfg=cfg;this.root=document.querySelector('[data-game="'+name+'"]');
  if(!this.root)return;
  this.state=store.get(name)||{placed:[]};
  this.render();
  const restart=document.querySelector('[data-restart="'+name+'"]');
  if(restart)restart.addEventListener('click',()=>{this.state={placed:[]};store.set(name,this.state);this.render();feedback(name,'Игра начата заново.');});
 }
 render(){
  const cfg=this.cfg;
  this.root.innerHTML='';
  const pool=document.createElement('div');pool.className='token-pool';
  const zonesWrap=document.createElement('div');zonesWrap.className='zones-grid';
  this.root.append(pool,zonesWrap);
  cfg.tokens.forEach(t=>{
   if(this.state.placed.includes(t.id))return;
   const el=document.createElement('div');el.className='token';el.dataset.id=t.id;el.dataset.cat=t.cat;el.textContent=t.label;
   el.setAttribute('role','button');el.setAttribute('tabindex','0');
   pool.appendChild(el);
  });
  cfg.zones.forEach(z=>{
   const zone=document.createElement('div');zone.className='zone';zone.dataset.cat=z.id;
   zone.innerHTML='<span class="zone-label">'+z.label+'</span>';
   zonesWrap.appendChild(zone);
  });
  this.correct=cfg.tokens.length;
  this.done=this.state.placed.length;
  this.updateScore();
  this.bind();
  if(this.done===this.correct)feedback(this.name,cfg.success,true);
 }
 updateScore(){
  const el=document.querySelector('[data-score="'+this.name+'"]');
  if(el)el.textContent=this.done+' / '+this.correct;
 }
 bind(){
  let drag=null,ghost=null,offset={x:0,y:0};
  const move=(e)=>{
   if(!drag)return;
   const x=(e.touches?e.touches[0].clientX:e.clientX)-offset.x;
   const y=(e.touches?e.touches[0].clientY:e.clientY)-offset.y;
   ghost.style.left=x+'px';ghost.style.top=y+'px';
   const zone=document.elementFromPoint(x+ghost.offsetWidth/2,y+ghost.offsetHeight/2)?.closest('.zone');
   this.root.querySelectorAll('.zone').forEach(z=>z.classList.toggle('over',z===zone));
  };
  const up=(e)=>{
   if(!drag)return;
   const x=(e.changedTouches?e.changedTouches[0].clientX:e.clientX)-offset.x;
   const y=(e.changedTouches?e.changedTouches[0].clientY:e.clientY)-offset.y;
   const zone=document.elementFromPoint(x+ghost.offsetWidth/2,y+ghost.offsetHeight/2)?.closest('.zone');
   ghost.remove();ghost=null;
   drag.classList.remove('dragging');
   this.root.querySelectorAll('.zone').forEach(z=>z.classList.remove('over'));
   if(zone)this.drop(drag,zone);
   drag=null;
  };
  this.root.querySelectorAll('.token').forEach(token=>{
   token.addEventListener('pointerdown',e=>{
    e.preventDefault();drag=token;
    const rect=token.getBoundingClientRect();
    offset.x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    offset.y=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
    ghost=token.cloneNode(true);ghost.className='token dragging';
    ghost.style.position='fixed';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';
    ghost.style.width=rect.width+'px';ghost.style.pointerEvents='none';
    document.body.appendChild(ghost);
    token.classList.add('dragging');
   });
   token.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
     e.preventDefault();
     const zone=this.root.querySelector('.zone:focus')||this.root.querySelector('.zone');
     if(zone)this.drop(token,zone);
    }
   });
  });
  window.addEventListener('pointermove',move,{passive:false});
  window.addEventListener('pointerup',up);
  window.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('touchend',up);
  this.root.querySelectorAll('.zone').forEach(zone=>{
   zone.addEventListener('click',()=>{
    const token=this.root.querySelector('.token:not(.placed)');
    if(token)this.drop(token,zone);
   });
  });
 }
 drop(token,zone){
  if(token.dataset.cat===zone.dataset.cat){
   const chip=document.createElement('span');chip.className='token placed';chip.textContent=token.textContent;
   zone.appendChild(chip);zone.classList.add('correct');
   token.classList.add('placed');token.remove();
   this.state.placed.push(token.dataset.id);store.set(this.name,this.state);
   this.done++;this.updateScore();
   feedback(this.name,this.done===this.correct?this.cfg.success:'Верно! Осталось '+(this.correct-this.done)+'.',true);
  }else{
   zone.classList.add('wrong');setTimeout(()=>zone.classList.remove('wrong'),450);
   feedback(this.name,'Не подходит к этой категории. Подумайте о смысле утверждения.',false);
  }
 }
}

function feedback(name,text,ok){
 const box=document.querySelector('[data-feedback="'+name+'"]');
 if(!box)return;
 box.textContent=text;
 box.style.color=ok===false?'#b3573f':ok===true?'#3f6b4a':'#6f5b45';
}

/* ---------- Конфигурации игр ---------- */
new DragGame('scroll',{
 tokens:[
  {id:'odar',label:'Одаренность',cat:'odar'},
  {id:'spos',label:'Способности',cat:'spos'},
  {id:'psih',label:'Психометрика',cat:'psih'},
  {id:'kreat',label:'Креативность',cat:'kreat'},
  {id:'pozn',label:'Познавательная активность',cat:'pozn'}
 ],
 zones:[
  {id:'odar',label:'Системное качество психики, развивающееся в течение жизни'},
  {id:'spos',label:'Индивидуальные особенности для успешного освоения деятельности'},
  {id:'psih',label:'Наука об измерении психологических характеристик'},
  {id:'kreat',label:'Создание новых и значимых идей и решений'},
  {id:'pozn',label:'Инициативное стремление исследовать и узнавать'}
 ],
 success:'Свиток собран! Вы различаете ключевые понятия диагностики.'
});

new DragGame('tower',{
 tokens:[
  {id:'iq',label:'IQ и стандартизированные тесты',cat:'psih'},
  {id:'renz',label:'Модель Рензулли',cat:'multi'},
  {id:'gard',label:'Множественные интеллекты Гарднера',cat:'multi'},
  {id:'rab',label:'Рабочая концепция одаренности',cat:'sist'},
  {id:'kom',label:'Когнитивный, мотивационный и волевой компоненты',cat:'sist'},
  {id:'torr',label:'Тесты Торренса',cat:'psih'}
 ],
 zones:[
  {id:'psih',label:'Психометрический подход'},
  {id:'multi',label:'Многомерный подход'},
  {id:'sist',label:'Системный подход'}
 ],
 success:'Башня собрана: измерение, несколько условий и целостная система.'
});

new DragGame('herzen',{
 tokens:[
  {id:'sav',label:'А. И. Савенков',cat:'sav'},
  {id:'shum',label:'Н. Б. Шумакова',cat:'shum'},
  {id:'bae',label:'И. А. Баева',cat:'bae'},
  {id:'dru',label:'В. Н. Дружинин',cat:'dru'}
 ],
 zones:[
  {id:'sav',label:'Интеллектуально-творческий потенциал и пролонгированное наблюдение'},
  {id:'shum',label:'Скрытая одаренность и возрастная динамика'},
  {id:'bae',label:'Психологически безопасная образовательная среда'},
  {id:'dru',label:'Психометрика, интеллект и креативность'}
 ],
 success:'Вы верно соотнесли вклад ученых РГПУ им. А. И. Герцена.'
});

new DragGame('artifacts',{
 tokens:[
  {id:'wech',label:'Шкалы Векслера',cat:'int'},
  {id:'rav',label:'Матрицы Равена',cat:'zak'},
  {id:'amt',label:'Тест Амтхауэра',cat:'um'},
  {id:'gil',label:'Тесты Гилфорда',cat:'div'},
  {id:'tor',label:'Тесты Торренса',cat:'kreat'},
  {id:'med',label:'Тест Медника',cat:'assoc'}
 ],
 zones:[
  {id:'int',label:'Интеллект'},
  {id:'zak',label:'Закономерности'},
  {id:'um',label:'Умственное развитие'},
  {id:'div',label:'Дивергентное мышление'},
  {id:'kreat',label:'Креативность'},
  {id:'assoc',label:'Ассоциативное мышление'}
 ],
 success:'Артефакты размещены верно: вы понимаете, что измеряет каждая методика.'
});

new DragGame('profile',{
 tokens:[
  {id:'zad',label:'Решение сложных задач',cat:'int'},
  {id:'ide',label:'Новые идеи и нестандартные решения',cat:'kreat'},
  {id:'ris',label:'Рисунок и композиция',cat:'hudo'},
  {id:'lov',label:'Ловкость и выносливость',cat:'sport'},
  {id:'org',label:'Организация команды',cat:'soc'},
  {id:'muz',label:'Музыкальный слух',cat:'hudo'},
  {id:'iss',label:'Исследовательский проект',cat:'int'}
 ],
 zones:[
  {id:'int',label:'Интеллектуальная сфера'},
  {id:'kreat',label:'Творческая сфера'},
  {id:'hudo',label:'Художественная сфера'},
  {id:'sport',label:'Спортивная сфера'},
  {id:'soc',label:'Социальная сфера'}
 ],
 success:'Профиль одаренности складывается из разных сильных сторон, а не из одного балла.'
});

new DragGame('ai',{
 tokens:[
  {id:'big',label:'Анализ больших данных',cat:'pos'},
  {id:'pat',label:'Выявление паттернов учебной деятельности',cat:'pos'},
  {id:'adap',label:'Адаптивное тестирование',cat:'pos'},
  {id:'smes',label:'Воспроизведение социокультурных смещений',cat:'ris'},
  {id:'kont',label:'Отсутствие понимания контекста',cat:'ris'},
  {id:'cifr',label:'Редукция одаренности к цифрам',cat:'ris'}
 ],
 zones:[
  {id:'pos',label:'Возможности ИИ'},
  {id:'ris',label:'Риски ИИ'}
 ],
 success:'ИИ может быть советником, но не оракулом: решение остается за педагогом и психологом.'
});

new DragGame('garden',{
 tokens:[
  {id:'ris',label:'Рисовать',cat:'ris'},
  {id:'izm',label:'Измерять',cat:'izm'},
  {id:'igr',label:'Играть',cat:'igr'},
  {id:'ins',label:'Использовать как инструмент',cat:'ins'},
  {id:'art',label:'Создавать арт-объект',cat:'art'},
  {id:'nau',label:'Проводить опыт',cat:'nau'}
 ],
 zones:[
  {id:'ris',label:'Грядка рисования'},
  {id:'izm',label:'Грядка измерения'},
  {id:'igr',label:'Грядка игры'},
  {id:'ins',label:'Грядка инструментов'},
  {id:'art',label:'Грядка искусства'},
  {id:'nau',label:'Грядка науки'}
 ],
 success:'Сад идей вырос: вы проявили гибкость и оригинальность мышления.'
});

/* ---------- Игры поиска ---------- */
class FindGame{
 constructor(name,items,success){
  this.name=name;this.items=items;this.success=success;
  this.root=document.querySelector('[data-game="'+name+'"]');
  if(!this.root)return;
  this.state=store.get(name)||{found:[]};
  this.render();
  const restart=document.querySelector('[data-restart="'+name+'"]');
  if(restart)restart.addEventListener('click',()=>{this.state={found:[]};store.set(name,this.state);this.render();feedback(name,'Игра начата заново.');});
 }
 render(){
  this.root.innerHTML='<div class="find-grid"></div>';
  const grid=this.root.querySelector('.find-grid');
  this.items.forEach(([text,good])=>{
   const btn=document.createElement('button');btn.type='button';btn.className='find-item';btn.textContent=text;
   if(this.state.found.includes(text))btn.classList.add('correct');
   grid.appendChild(btn);
   btn.addEventListener('click',()=>{
    if(btn.classList.contains('correct'))return;
    if(good){
     btn.classList.add('correct');
     if(!this.state.found.includes(text)){this.state.found.push(text);store.set(this.name,this.state);}
     const need=this.items.filter(i=>i[1]).length;
     const found=grid.querySelectorAll('.correct').length;
     this.updateScore(found,need);
     feedback(this.name,found===need?this.success:'Найдено верное проявление! Продолжайте поиск.',true);
    }else{
     btn.classList.add('wrong');setTimeout(()=>btn.classList.remove('wrong'),450);
     feedback(this.name,'Это не относится к диагностически важным факторам.',false);
    }
   });
  });
  const need=this.items.filter(i=>i[1]).length;
  this.updateScore(this.state.found.length,need);
  if(this.state.found.length===need)feedback(this.name,this.success,true);
 }
 updateScore(done,need){
  const el=document.querySelector('[data-score="'+this.name+'"]');
  if(el)el.textContent=done+' / '+need;
 }
}

new FindGame('fireflies',[
 ['Возрастная динамика',true],['Социокультурный контекст',true],['Скрытая одаренность',true],['Двойная исключительность',true],['Субъективность оценок',true],
 ['Цвет школьной формы',false],['Номер кабинета',false],['Любимый цвет ребенка',false]
],'Вы нашли важные факторы: возраст, контекст, скрытые возможности, особенности развития и субъективность оценок.');

new FindGame('observer',[
 ['Задает исследовательские вопросы',true],['Возвращается к трудной задаче',true],['Предлагает необычное решение',true],['Самостоятельно ищет информацию',true],
 ['Сидит молча весь урок',false],['Заполняет дневник по шаблону',false]
],'Вы заметили проявления познавательной активности, настойчивости и оригинальности мышления.');

/* ---------- Креативное поле ---------- */
(function creativeField(){
 const root=document.querySelector('[data-game="field"]');
 if(!root)return;
 root.innerHTML='<div class="field-row"><div class="seq"><span>2</span>→<span>4</span>→<span>8</span>→<span>16</span>→</div><input id="fieldAnswer" inputmode="numeric" placeholder="?" aria-label="Продолжите последовательность"><button class="btn small" id="fieldCheck">Проверить</button></div><div class="initiative-box"><p><strong>Исследовательская инициатива:</strong> что вы можете сделать дальше?</p><div class="find-grid"><button class="find-item" data-init="1">Проверить, что будет дальше</button><button class="find-item" data-init="2">Найти другое правило</button><button class="find-item" data-init="3">Придумать свою последовательность</button><button class="find-item" data-init="4">Объяснить закономерность словами</button></div></div>';
 let done=store.get('field')||[];
 const answer=document.getElementById('fieldAnswer');
 const check=document.getElementById('fieldCheck');
 const update=()=>{
  const el=document.querySelector('[data-score="field"]');
  if(el)el.textContent=done.length+' / 5';
 };
 check.addEventListener('click',()=>{
  if(answer.value.trim()==='32'){
   if(!done.includes('answer')){done.push('answer');store.set('field',done);}
   feedback('field','Верно: каждое следующее число вдвое больше предыдущего. А теперь исследуйте закономерность дальше.',true);
  }else{
   feedback('field','Проверьте правило: каждое число умножается на 2.',false);
  }
  update();
 });
 root.querySelectorAll('[data-init]').forEach(btn=>{
  btn.addEventListener('click',()=>{
   const id=btn.dataset.init;
   if(!done.includes(id)){done.push(id);store.set('field',done);}
   btn.classList.add('correct');
   feedback('field','Отличная исследовательская инициатива! В методе Богоявленской ценится выход за пределы обязательного задания.',true);
   update();
  });
 });
 update();
})();

/* ---------- Финальный квест: Хартия ---------- */
(function charter(){
 const root=document.querySelector('[data-game="charter"]');
 if(!root)return;
 const options=[
  ['Комплексность диагностики',true],['Учет контекста',true],['Наблюдение в деятельности',true],['Создание развивающей среды',true],['Осторожное использование ИИ',true],
  ['Оценка ребенка только по одному тесту',false],['Игнорирование мотивации',false],['Сравнение детей без учета условий',false]
 ];
 let chosen=store.get('charter')||[];
 root.innerHTML='<div class="token-pool"></div><div class="zone" id="charterZone"><span class="zone-label">Хартия одаренности</span></div>';
 const pool=root.querySelector('.token-pool'),zone=root.querySelector('#charterZone');
 options.forEach(([text,good])=>{
  const token=document.createElement('div');token.className='token';token.textContent=text;token.dataset.good=good?'1':'0';
  if(chosen.includes(text))token.classList.add('placed');
  pool.appendChild(token);
  token.addEventListener('click',()=>{
   if(good){
    if(!chosen.includes(text)){chosen.push(text);store.set('charter',chosen);}
    token.classList.add('placed');
    const seal=document.createElement('span');seal.className='token placed';seal.textContent=text;zone.appendChild(seal);
    const need=options.filter(o=>o[1]).length;
    const el=document.querySelector('[data-score="charter"]');
    if(el)el.textContent=chosen.length+' / '+need;
    feedback('charter',chosen.length===need?'Хартия одаренности собрана! Диагностика комплексна, контекстна и ориентирована на развитие.':'Печать добавлена в Хартию. Осталось '+(need-chosen.length)+'.',true);
   }else{
    token.classList.add('wrong');setTimeout(()=>token.classList.remove('wrong'),450);
    feedback('charter','Эта печать противоречит комплексному пониманию одаренности.',false);
   }
  });
 });
 const el=document.querySelector('[data-score="charter"]');
 if(el)el.textContent=chosen.length+' / 5';
})();

})();