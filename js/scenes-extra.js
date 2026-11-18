/* Академия Одаренности — дополнительные 3D-сцены */
(function(){
'use strict';
const G=window.GA3D;
if(!G)return;

/* Креативное поле: 5 кристаллов -> 5 гнезд */
G.registerScene('field',s=>{
 s.group.add(G.ground(0xa8c389,18));
 const table=new THREE.Mesh(new THREE.BoxGeometry(10,.4,4),new THREE.MeshStandardMaterial({color:0x8a623c,roughness:.7}));
 table.position.y=.5;s.group.add(table);
 G.addGame(s,'field',[
  {id:'c1',label:'2',cat:'1',shape:'crystal',color:0x4fa3a5,pos:[-4,1.4,1]},
  {id:'c2',label:'4',cat:'2',shape:'crystal',color:0x4fa3a5,pos:[-2,1.4,1.5]},
  {id:'c3',label:'8',cat:'3',shape:'crystal',color:0x4fa3a5,pos:[0,1.4,2]},
  {id:'c4',label:'16',cat:'4',shape:'crystal',color:0x4fa3a5,pos:[2,1.4,1.5]},
  {id:'c5',label:'?',cat:'5',shape:'crystal',color:0xb6a3d6,pos:[4,1.4,1]}
 ],[
  {id:'g1',cat:'1',label:'Гнездо 1',shape:'pedestal',pos:[-4,0,0]},
  {id:'g2',cat:'2',label:'Гнездо 2',shape:'pedestal',pos:[-2,0,0]},
  {id:'g3',cat:'3',label:'Гнездо 3',shape:'pedestal',pos:[0,0,0]},
  {id:'g4',cat:'4',label:'Гнездо 4',shape:'pedestal',pos:[2,0,0]},
  {id:'g5',cat:'5',label:'Гнездо 5',shape:'pedestal',pos:[4,0,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xffe9a8,.1,16));
});

/* Профиль Савенкова: 5 сфер -> 5 частей */
G.registerScene('profile',s=>{
 s.group.add(G.ground(0xa8c389,18));
 G.addGame(s,'profile',[
  {id:'int',label:'Интеллект',cat:'int',shape:'orb',color:0x8fc4d6,pos:[-4,1,3]},
  {id:'kreat',label:'Творчество',cat:'kreat',shape:'orb',color:0xd9a441,pos:[-2,1,3.5]},
  {id:'hudo',label:'Художественное',cat:'hudo',shape:'orb',color:0xb6a3d6,pos:[0,1,4]},
  {id:'sport',label:'Спорт',cat:'sport',shape:'orb',color:0x6f9a5d,pos:[2,1,3.5]},
  {id:'soc',label:'Социальное',cat:'soc',shape:'orb',color:0x4fa3a5,pos:[4,1,3]}
 ],[
  {id:'z1',cat:'int',label:'Интеллектуальная сфера',shape:'pedestal',pos:[-4,0,0]},
  {id:'z2',cat:'kreat',label:'Творческая сфера',shape:'pedestal',pos:[-2,0,0]},
  {id:'z3',cat:'hudo',label:'Художественная сфера',shape:'pedestal',pos:[0,0,0]},
  {id:'z4',cat:'sport',label:'Спортивная сфера',shape:'pedestal',pos:[2,0,0]},
  {id:'z5',cat:'soc',label:'Социальная сфера',shape:'pedestal',pos:[4,0,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xffe9a8,.1,18));
});

/* Сад идей: 6 семян -> 6 горшков */
G.registerScene('garden',s=>{
 s.group.add(G.ground(0x9db97f,18));
 for(let i=0;i<8;i++){const t=G.tree(0x6f9a5d,.7+Math.random()*.6);t.position.set((Math.random()-.5)*20,0,(Math.random()-.5)*10-4);s.group.add(t);}
 G.addGame(s,'garden',[
  {id:'ris',label:'Рисовать',cat:'ris',shape:'seed',color:0xd9a441,pos:[-5,1,3]},
  {id:'izm',label:'Измерять',cat:'izm',shape:'seed',color:0x8fc4d6,pos:[-3,1,3.5]},
  {id:'igr',label:'Играть',cat:'igr',shape:'seed',color:0x6f9a5d,pos:[-1,1,4]},
  {id:'ins',label:'Инструмент',cat:'ins',shape:'seed',color:0xb6a3d6,pos:[1,1,4]},
  {id:'art',label:'Арт-объект',cat:'art',shape:'seed',color:0x4fa3a5,pos:[3,1,3.5]},
  {id:'nau',label:'Опыт',cat:'nau',shape:'seed',color:0xf2d789,pos:[5,1,3]}
 ],[
  {id:'b1',cat:'ris',label:'Горшок рисования',shape:'pot',pos:[-5,0,0]},
  {id:'b2',cat:'izm',label:'Горшок измерения',shape:'pot',pos:[-3,0,0]},
  {id:'b3',cat:'igr',label:'Горшок игры',shape:'pot',pos:[-1,0,0]},
  {id:'b4',cat:'ins',label:'Горшок инструментов',shape:'pot',pos:[1,0,0]},
  {id:'b5',cat:'art',label:'Горшок искусства',shape:'pot',pos:[3,0,0]},
  {id:'b6',cat:'nau',label:'Горшок науки',shape:'pot',pos:[5,0,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xfff0c0,.11,18));
});

/* Алтарь артефактов: 6 свитков -> 6 пьедесталов */
G.registerScene('altar',s=>{
 s.group.add(G.ground(0xa8c389,18));
 const base=new THREE.Mesh(new THREE.CylinderGeometry(3.6,4.2,1,28),new THREE.MeshStandardMaterial({color:0xefe0c4,roughness:.6}));
 base.position.y=-.4;s.group.add(base);
 G.addGame(s,'artifacts',[
  {id:'wech',label:'Векслер',cat:'int',shape:'scroll',color:0xf6ecd8,pos:[-5,1.5,3]},
  {id:'rav',label:'Равен',cat:'zak',shape:'scroll',color:0xf6ecd8,pos:[-3,1.5,3.5]},
  {id:'amt',label:'Амтхауэр',cat:'um',shape:'scroll',color:0xf6ecd8,pos:[-1,1.5,4]},
  {id:'gil',label:'Гилфорд',cat:'div',shape:'scroll',color:0xf6ecd8,pos:[1,1.5,4]},
  {id:'tor',label:'Торренс',cat:'kreat',shape:'scroll',color:0xf6ecd8,pos:[3,1.5,3.5]},
  {id:'med',label:'Медник',cat:'assoc',shape:'scroll',color:0xf6ecd8,pos:[5,1.5,3]}
 ],[
  {id:'z1',cat:'int',label:'Интеллект',shape:'pedestal',pos:[-5,0,0]},
  {id:'z2',cat:'zak',label:'Закономерности',shape:'pedestal',pos:[-3,0,0]},
  {id:'z3',cat:'um',label:'Умственное развитие',shape:'pedestal',pos:[-1,0,0]},
  {id:'z4',cat:'div',label:'Дивергентное мышление',shape:'pedestal',pos:[1,0,0]},
  {id:'z5',cat:'kreat',label:'Креативность',shape:'pedestal',pos:[3,0,0]},
  {id:'z6',cat:'assoc',label:'Ассоциативное мышление',shape:'pedestal',pos:[5,0,0]}
 ]);
 s.group.add(G.runes(10,5,0xffe9a8));
});

/* Зал наблюдателя: 6 hotspot-ов, 4 верных */
G.registerScene('observer',s=>{
 const floor=new THREE.Mesh(new THREE.BoxGeometry(18,.4,12),new THREE.MeshStandardMaterial({color:0xefe0c4,roughness:.8}));
 floor.position.y=-.5;s.group.add(floor);
 for(let i=0;i<5;i++){
  const desk=new THREE.Mesh(new THREE.BoxGeometry(2,1,.9),new THREE.MeshStandardMaterial({color:0x8a623c,roughness:.7}));
  desk.position.set(-4+i*2,.25,0);s.group.add(desk);
 }
 const board=new THREE.Mesh(new THREE.PlaneGeometry(6,3),new THREE.MeshStandardMaterial({color:0x6f9a5d,roughness:.6}));
 board.position.set(0,3,-4);s.group.add(board);
 G.addGame(s,'observer',[
  {id:'q',label:'Исследовательские вопросы',cat:'good',shape:'orb',color:0xffe680,pos:[-4,2,2]},
  {id:'pers',label:'Настойчивость',cat:'good',shape:'orb',color:0xffe680,pos:[-2,2.5,2.5]},
  {id:'orig',label:'Оригинальность',cat:'good',shape:'orb',color:0xffe680,pos:[0,3,3]},
  {id:'info',label:'Самостоятельный поиск',cat:'good',shape:'orb',color:0xffe680,pos:[2,2.5,2.5]},
  {id:'silence',label:'Молчит весь урок',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[4,2,2]},
  {id:'template',label:'Дневник по шаблону',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[-6,2,1]}
 ],[
  {id:'goal',cat:'good',label:'Важные проявления',shape:'pedestal',pos:[0,0,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xffe9a8,.1,16));
});

/* Зеркало ИИ: 6 кристаллов -> 2 зеркала */
G.registerScene('ai',s=>{
 s.group.add(G.ground(0xa8c389,18));
 G.addGame(s,'ai',[
  {id:'big',label:'Большие данные',cat:'pos',shape:'crystal',color:0x8fc4d6,pos:[-4,1.5,3]},
  {id:'pat',label:'Паттерны учебы',cat:'pos',shape:'crystal',color:0x8fc4d6,pos:[-2,1.5,3.5]},
  {id:'adap',label:'Адаптивные тесты',cat:'pos',shape:'crystal',color:0x8fc4d6,pos:[0,1.5,4]},
  {id:'smes',label:'Смещения',cat:'risk',shape:'crystal',color:0xb3573f,pos:[2,1.5,3.5]},
  {id:'kont',label:'Нет контекста',cat:'risk',shape:'crystal',color:0xb3573f,pos:[4,1.5,3]},
  {id:'cifr',label:'Только цифры',cat:'risk',shape:'crystal',color:0xb3573f,pos:[6,1.5,2.5]}
 ],[
  {id:'m1',cat:'pos',label:'Возможности ИИ',shape:'mirror',pos:[-3,1,0]},
  {id:'m2',cat:'risk',label:'Риски ИИ',shape:'mirror',pos:[3,1,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xffe9a8,.1,18));
});

/* Хартия: 8 печатей, 5 верных */
G.registerScene('charter',s=>{
 s.group.add(G.ground(0xa8c389,18));
 const table=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.6,.6,28),new THREE.MeshStandardMaterial({color:0x8a623c,roughness:.7}));
 table.position.y=.4;s.group.add(table);
 const charter=new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.8),new THREE.MeshStandardMaterial({color:0xf6ecd8,roughness:.8,side:THREE.DoubleSide}));
 charter.position.set(0,1.9,0);charter.rotation.x=-.4;s.group.add(charter);
 G.addGame(s,'charter',[
  {id:'complex',label:'Комплексность',cat:'good',shape:'seal',color:0xd9a441,pos:[-5,1.5,3]},
  {id:'context',label:'Учет контекста',cat:'good',shape:'seal',color:0xd9a441,pos:[-3,1.5,3.5]},
  {id:'observ',label:'Наблюдение',cat:'good',shape:'seal',color:0xd9a441,pos:[-1,1.5,4]},
  {id:'env',label:'Развивающая среда',cat:'good',shape:'seal',color:0xd9a441,pos:[1,1.5,4]},
  {id:'ai',label:'Осторожный ИИ',cat:'good',shape:'seal',color:0xd9a441,pos:[3,1.5,3.5]},
  {id:'one',label:'Один тест',cat:'bad',shape:'seal',color:0xb3573f,pos:[5,1.5,3]},
  {id:'nomot',label:'Игнор мотивации',cat:'bad',shape:'seal',color:0xb3573f,pos:[-6,1.5,2]},
  {id:'compare',label:'Сравнение без условий',cat:'bad',shape:'seal',color:0xb3573f,pos:[6,1.5,2]}
 ],[
  {id:'char',cat:'good',label:'Хартия одаренности',shape:'pedestal',pos:[0,0,0]}
 ]);
 s.group.add(G.particles(G.mobile?50:100,0xffe9a8,.11,18));
});

})();