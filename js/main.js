/* Основная логика сайта: навигация, прогресс, игры и сохранение результата */
(function(){
'use strict';

// Плавная прокрутка с учетом фиксированной шапки
 document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
   const target=document.querySelector(link.getAttribute('href'));
   if(!target)return;
   e.preventDefault();
   const top=target.getBoundingClientRect().top+window.scrollY-70;
   window.scrollTo({top,behavior:'smooth'});
  });
 });

// Индикатор прохождения пути
 const bar=document.getElementById('progressBar');
 function updateProgress(){
  const h=document.documentElement;
  const value=(h.scrollTop)/(h.scrollHeight-h.clientHeight)*100;
  bar.style.width=Math.min(100,Math.max(0,value))+'%';
 }
 window.addEventListener('scroll',updateProgress,{passive:true});
 window.addEventListener('resize',updateProgress);
 updateProgress();

// Сохранение прогресса игр в localStorage
 const storage={
  get(key){try{return JSON.parse(localStorage.getItem('giftedness_'+key)||'null')}catch(e){return null}},
  set(key,value){try{localStorage.setItem('giftedness_'+key,JSON.stringify(value))}catch(e){}}
 };

// Универсальный механизм: выбрать токен, затем целевую зону
 function bindTokenZone(root,onMatch){
  let selected=null;
  root.querySelectorAll('.token').forEach(token=>{
   token.addEventListener('click',()=>{
    root.querySelectorAll('.token').forEach(t=>t.classList.remove('selected'));
    token.classList.add('selected');selected=token;
   });
   token.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',token.dataset.value);});
  });
  root.querySelectorAll('.dropzone').forEach(zone=>{
   zone.addEventListener('click',()=>{
    if(selected){onMatch(selected,zone);selected=null;}
   });
   zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('over');});
   zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
   zone.addEventListener('drop',e=>{
    e.preventDefault();zone.classList.remove('over');
    const value=e.dataTransfer.getData('text/plain');
    const token=[...root.querySelectorAll('.token')].find(t=>t.dataset.value===value);
    if(token)onMatch(token,zone);
   });
  });
 }

 function setFeedback(name,text,ok){
  const box=document.querySelector('[data-feedback="'+name+'"]');
  if(!box)return;
  box.textContent=text;
  box.style.color=ok===false?'#a8503c':ok===true?'#3f6b4a':'#6f5b45';
 }

// Игра «Собери свиток» и другие игры на соответствие
 const scrollData={
  'Одаренность':'Системное качество психики, развивающееся в течение жизни',
  'Способности':'Индивидуальные особенности для успешного освоения деятельности',
  'Психометрика':'Наука об измерении психологических характеристик',
  'Креативность':'Создание новых и значимых идей и решений',
  'Познавательная активность':'Инициативное стремление исследовать и узнавать'
 };
 function buildMatchGame(name,pairs,hint){
  const root=document.querySelector('[data-game="'+name+'"]');
  if(!root)return;
  const saved=storage.get(name)||{done:[]};
  root.innerHTML='<p class="hint">'+hint+'</p><div class="match-row"><div class="tokens"></div></div><div class="zones"></div>';
  const tokens=root.querySelector('.tokens'),zones=root.querySelector('.zones');
  Object.entries(pairs).forEach(([term,definition])=>{
   const token=document.createElement('button');token.className='token';token.type='button';token.textContent=term;token.dataset.value=term;token.draggable=true;tokens.appendChild(token);
   const row=document.createElement('div');row.className='match-row';
   row.innerHTML='<div class="match-prompt">'+definition+'</div><div class="dropzone" data-value="'+term+'">Перетащите или выберите понятие</div>';
   zones.appendChild(row);
  });
  let correct=0;
  bindTokenZone(root,(token,zone)=>{
   if(token.dataset.value===zone.dataset.value){
    zone.textContent=token.textContent;zone.classList.add('correct');token.remove();correct++;saved.done.push(token.dataset.value);storage.set(name,saved);
    setFeedback(name,correct===Object.keys(pairs).length?'Отлично! Свиток собран: вы различаете ключевые понятия диагностики.':'Верно! Осталось '+(Object.keys(pairs).length-correct)+' фрагментов.',true);
   }else{
    zone.classList.add('wrong');setTimeout(()=>zone.classList.remove('wrong'),700);
    setFeedback(name,'Этот фрагмент относится к другому понятию. Перечитайте определения.',false);
   }
  });
 }

 buildMatchGame('scroll',scrollData,'Соберите свиток: соотнесите понятия и определения.');
 buildMatchGame('herzen',{
  'А. И. Савенков':'Интеллектуально-творческий потенциал и пролонгированное наблюдение',
  'Н. Б. Шумакова':'Скрытая одаренность и возрастная динамика',
  'И. А. Баева':'Психологически безопасная образовательная среда',
  'В. Н. Дружинин':'Психометрика, интеллект и креативность'
 },'Соотнесите ученых РГПУ им. А. И. Герцена с их вкладом.');
 buildMatchGame('artifacts',{
  'Шкалы Векслера':'Интеллект',
  'Матрицы Равена':'Закономерности',
  'Тест Амтхауэра':'Умственное развитие',
  'Тесты Гилфорда':'Дивергентное мышление',
  'Тесты Торренса':'Креативность',
  'Тест Медника':'Ассоциативное мышление'
 },'Разместите артефакты-методики у верных свойств.');

// Игры сортировки
 const sortData={
  tower:{
   categories:['Психометрический','Многомерный','Системный'],
   items:[['IQ и стандартизированные тесты','Психометрический'],['Модель Рензулли','Многомерный'],['Множественные интеллекты Гарднера','Многомерный'],['Рабочая концепция одаренности','Системный'],['Когнитивный, мотивационный и волевой компоненты','Системный'],['Тесты Торренса','Психометрический']],
   success:'Вы верно различили подходы: измерение, несколько условий и целостная система.'
  },
  profile:{
   categories:['Интеллектуальная','Творческая','Художественная','Спортивная','Социальная'],
   items:[['Решение сложных задач','Интеллектуальная'],['Новые идеи и нестандартные решения','Творческая'],['Рисунок и композиция','Художественная'],['Ловкость и выносливость','Спортивная'],['Организация команды','Социальная'],['Музыкальный слух','Художественная'],['Исследовательский проект','Интеллектуальная']],
   success:'Профиль одаренности складывается из разных сильных сторон, а не из одного общего балла.'
  },
  ai:{
   categories:['Возможности ИИ','Риски ИИ'],
   items:[['Анализ больших данных','Возможности ИИ'],['Выявление паттернов учебной деятельности','Возможности ИИ'],['Адаптивное тестирование','Возможности ИИ'],['Воспроизведение социокультурных смещений','Риски ИИ'],['Отсутствие понимания контекста','Риски ИИ'],['Редукция одаренности к цифрам','Риски ИИ']],
   success:'ИИ может быть советником, но не оракулом: решение остается за педагогом и психологом.'
  }
 };

 Object.entries(sortData).forEach(([name,data])=>{
  const root=document.querySelector('[data-game="'+name+'"]');
  if(!root)return;
  const saved=storage.get(name)||{done:[]};
  root.innerHTML='<div class="tokens"></div><div class="zones"></div>';
  const tokens=root.querySelector('.tokens'),zones=root.querySelector('.zones');
  data.items.forEach(([text,cat])=>{
   if(saved.done.includes(text))return;
   const token=document.createElement('button');token.className='token';token.type='button';token.textContent=text;token.dataset.value=cat;token.draggable=true;tokens.appendChild(token);
  });
  data.categories.forEach(cat=>{
   const zone=document.createElement('div');zone.className='dropzone';zone.dataset.value=cat;zone.innerHTML='<strong>'+cat+'</strong><br>Перетащите или выберите утверждение';zones.appendChild(zone);
  });
  let correct=saved.done.length;
  bindTokenZone(root,(token,zone)=>{
   if(token.dataset.value===zone.dataset.value){
    const label=document.createElement('span');label.className='token';label.textContent=token.textContent;zone.appendChild(label);token.remove();correct++;saved.done.push(token.textContent);storage.set(name,saved);
    setFeedback(name,correct===data.items.length?data.success:'Верно! Осталось '+(data.items.length-correct)+' утверждений.',true);
   }else{
    zone.classList.add('wrong');setTimeout(()=>zone.classList.remove('wrong'),700);
    setFeedback(name,'Не подходит к этой категории. Подумайте о смысле утверждения.',false);
   }
  });
 });

// Игры поиска
 const findData={
  fireflies:{
   items:[['Возрастная динамика',true],['Социокультурный контекст',true],['Скрытая одаренность',true],['Двойная исключительность',true],['Субъективность оценок',true],['Цвет школьной формы',false],['Номер кабинета',false],['Любимый цвет ребенка',false]],
   success:'Вы нашли важные факторы: возраст, контекст, скрытые возможности, особенности развития и субъективность оценок.'
  },
  observer:{
   items:[['Задает исследовательские вопросы',true],['Возвращается к трудной задаче',true],['Предлагает необычное решение',true],['Самостоятельно ищет информацию',true],['Сидит молча весь урок',false],['Заполняет дневник по шаблону',false]],
   success:'Вы заметили проявления познавательной активности, настойчивости и оригинальности мышления.'
  }
 };

 Object.entries(findData).forEach(([name,data])=>{
  const root=document.querySelector('[data-game="'+name+'"]');
  if(!root)return;
  const saved=storage.get(name)||{done:[]};
  root.innerHTML='<div class="find-grid"></div>';
  const grid=root.querySelector('.find-grid');
  data.items.forEach(([text,good])=>{
   const item=document.createElement('button');item.type='button';item.className='find-item';item.textContent=text;item.dataset.good=good?'1':'0';
   if(saved.done.includes(text))item.classList.add('correct');
   grid.appendChild(item);
   item.addEventListener('click',()=>{
    if(item.classList.contains('correct'))return;
    if(good){item.classList.add('correct');saved.done.push(text);storage.set(name,saved);
     const found=grid.querySelectorAll('.correct').length;
     setFeedback(name,found===data.items.filter(i=>i[1]).length?data.success:'Найдено верное проявление! Продолжайте поиск.',true);
    }else{item.classList.add('wrong');setTimeout(()=>item.classList.remove('wrong'),700);setFeedback(name,'Это не относится к диагностически важным факторам.',false);}
   });
  });
 });

// Креативное поле
 const fieldAnswer=document.getElementById('fieldAnswer');
 const fieldButton=document.querySelector('[data-action="check-field"]');
 let fieldInitiatives=storage.get('field')||[];
 if(fieldButton){
  fieldButton.addEventListener('click',()=>{
   if(fieldAnswer.value.trim()==='32'){
    setFeedback('field','Верно: каждое следующее число вдвое больше предыдущего. А теперь исследуйте закономерность дальше.',true);
   }else{
    setFeedback('field','Проверьте правило: каждое число умножается на 2.',false);
   }
  });
 }
 document.querySelectorAll('[data-initiative]').forEach(button=>{
  button.addEventListener('click',()=>{
   const id=button.dataset.initiative;
   if(!fieldInitiatives.includes(id)){fieldInitiatives.push(id);storage.set('field',fieldInitiatives);}
   button.classList.add('correct');
   setFeedback('field','Отличная исследовательская инициатива! В методе Богоявленской ценится выход за пределы обязательного задания.',true);
  });
 });

// Сад идей
 const gardenRoot=document.querySelector('[data-game="garden"]');
 if(gardenRoot){
  const status=gardenRoot.querySelector('[data-garden]');
  let ideas=storage.get('garden')||[];
  function render(){
   status.innerHTML='Выращено направлений идей: <strong>'+ideas.length+'</strong> из 6.<br>'+(ideas.length?ideas.map(i=>'🌱 '+i).join(' · '):'Выберите первый способ использования карандаша.');
   setFeedback('garden',ideas.length>=4?'Сад идей вырос: вы проявили гибкость и оригинальность мышления.':ideas.length?'Хорошее начало. Попробуйте найти идеи из другой категории.':'Выберите способы использования предмета.',ideas.length>=4);
  }
  gardenRoot.querySelectorAll('[data-idea]').forEach(button=>{
   button.addEventListener('click',()=>{
    const idea=button.dataset.idea;
    if(!ideas.includes(idea)){ideas.push(idea);storage.set('garden',ideas);button.classList.add('correct');}
    render();
   });
  });
  render();
 }

// Финальный квест «Совет Академии»
 const charterRoot=document.querySelector('[data-game="charter"]');
 if(charterRoot){
  const options=[['Комплексность диагностики',true],['Учет контекста',true],['Наблюдение в деятельности',true],['Создание развивающей среды',true],['Осторожное использование ИИ',true],['Оценка ребенка только по одному тесту',false],['Игнорирование мотивации',false],['Сравнение детей без учета условий',false]];
  charterRoot.innerHTML='<div class="find-grid"></div>';
  const grid=charterRoot.querySelector('.find-grid');
  let chosen=storage.get('charter')||[];
  options.forEach(([text,good])=>{
   const button=document.createElement('button');button.type='button';button.className='find-item';button.textContent=text;
   if(chosen.includes(text))button.classList.add('correct');
   grid.appendChild(button);
   button.addEventListener('click',()=>{
    if(good){
     if(!chosen.includes(text)){chosen.push(text);storage.set('charter',chosen);}
     button.classList.add('correct');
     const need=options.filter(o=>o[1]).length;
     setFeedback('charter',chosen.length===need?'Хартия одаренности собрана! Диагностика комплексна, контекстна и ориентирована на развитие.':'Принцип добавлен в Хартию. Осталось '+(need-chosen.length)+'.',true);
    }else{
     button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),700);
     setFeedback('charter','Этот принцип противоречит комплексному пониманию одаренности.',false);
    }
   });
  });
 }
})();