/* Академия Одаренности — интерактивные 3D-сцены с перетаскиванием объектов */
(function(){
'use strict';
if(typeof THREE==='undefined'){
 document.querySelectorAll('.scene-box').forEach(box=>{
  box.innerHTML='<div class="scene-fallback"><p>3D-сцена недоступна: WebGL не поддерживается. Материал раздела остается доступным выше.</p></div>';
 });
 return;
}

const mobile=window.matchMedia('(max-width:760px)').matches;
const scenes=[];
const games={};

/* ---------- Утилиты ---------- */
function label(text,color){
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 const w=512,h=128;canvas.width=w;canvas.height=h;
 ctx.fillStyle='rgba(255,252,240,.92)';
 ctx.beginPath();ctx.roundRect(10,10,w-20,h-20,24);ctx.fill();
 ctx.strokeStyle='rgba(107,74,47,.5)';ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle='#3b2d20';ctx.font='600 44px Cormorant Garamond, Georgia, serif';
 ctx.textAlign='center';ctx.textBaseline='middle';
 const words=text.split(' ');let line='',lines=[];
 words.forEach(word=>{
  const test=line?line+' '+word:word;
  if(ctx.measureText(test).width>w-60){lines.push(line);line=word;}else line=test;
 });
 lines.push(line);
 const startY=h/2-(lines.length-1)*26;
 lines.forEach((l,i)=>ctx.fillText(l,w/2,startY+i*52));
 const tex=new THREE.CanvasTexture(canvas);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
 sprite.scale.set(3.2,0.8,1);
 return sprite;
}

function particles(count,color,size,spread){
 const geo=new THREE.BufferGeometry();
 const pos=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  pos[i*3]=(Math.random()-.5)*spread;
  pos[i*3+1]=Math.random()*10;
  pos[i*3+2]=(Math.random()-.5)*spread;
 }
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 return new THREE.Points(geo,new THREE.PointsMaterial({color,size,transparent:true,opacity:.8,depthWrite:false}));
}

function tree(color,scale){
 const g=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,1.7,8),new THREE.MeshLambertMaterial({color:0x6b4a2f}));
 trunk.position.y=.85;g.add(trunk);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.95,12,10),new THREE.MeshLambertMaterial({color}));
 crown.position.y=2;crown.scale.y=1.2;g.add(crown);
 g.scale.setScalar(scale||1);return g;
}

function runes(count,radius,color){
 const g=new THREE.Group();
 for(let i=0;i<count;i++){
  const r=new THREE.Mesh(new THREE.PlaneGeometry(.55,.8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,side:THREE.DoubleSide}));
  const a=i/count*Math.PI*2;
  r.position.set(Math.cos(a)*radius,2.2+Math.sin(i*1.7)*1.3,Math.sin(a)*radius);
  r.lookAt(0,2.2,0);g.add(r);
 }
 return g;
}

/* ---------- Создание сцены ---------- */
function makeScene(box,build){
 const width=box.clientWidth||360,height=box.clientHeight||420;
 const renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.5:2));
 renderer.setSize(width,height);
 renderer.shadowMap.enabled=false;
 box.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xf8eeda,22,80);
 const camera=new THREE.PerspectiveCamera(50,width/height,.1,150);
 camera.position.set(0,4.5,13);
 camera.lookAt(0,1.5,0);
 scene.add(new THREE.HemisphereLight(0xfff3d0,0x8fae7d,1.15));
 const sun=new THREE.DirectionalLight(0xffe8b0,1.2);
 sun.position.set(6,10,7);scene.add(sun);
 const group=new THREE.Group();scene.add(group);
 const state={renderer,scene,camera,group,box,active:false,objects:[],targets:[],game:null,ray:new THREE.Raycaster(),pointer:new THREE.Vector2(),drag:null,selected:null,downPos:null,moved:false};
 build(state);

 // Взаимодействие: перетаскивание и выбор объектов
 const canvas=renderer.domElement;
 function setPointer(e){
  const rect=canvas.getBoundingClientRect();
  const x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
  const y=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
  state.pointer.x=(x/rect.width)*2-1;
  state.pointer.y=-(y/rect.height)*2+1;
 }
 function pick(list){
  state.ray.setFromCamera(state.pointer,camera);
  const hits=state.ray.intersectObjects(list,true);
  return hits.length?hits[0].object:null;
 }
 function onDown(e){
  setPointer(e);
  const obj=pick(state.objects.filter(o=>!o.userData.placed));
  if(obj){
   state.drag=obj;state.moved=false;
   state.downPos={x:e.touches?e.touches[0].clientX:e.clientX,y:e.touches?e.touches[0].clientY:e.clientY};
   obj.userData.origin=obj.position.clone();
   canvas.style.cursor='grabbing';
  }
 }
 function onMove(e){
  setPointer(e);
  if(!state.drag)return;
  const dx=(e.touches?e.touches[0].clientX:e.clientX)-state.downPos.x;
  const dy=(e.touches?e.touches[0].clientY:e.clientY)-state.downPos.y;
  if(Math.hypot(dx,dy)>8)state.moved=true;
  state.ray.setFromCamera(state.pointer,camera);
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-state.drag.position.y);
  const point=new THREE.Vector3();
  if(state.ray.ray.intersectPlane(plane,point)){
   state.drag.position.x=THREE.MathUtils.clamp(point.x,-7,7);
   state.drag.position.z=THREE.MathUtils.clamp(point.z,-5,5);
  }
 }
 function onUp(e){
  setPointer(e);
  if(!state.drag)return;
  const obj=state.drag;state.drag=null;canvas.style.cursor='';
  if(!state.moved){
   // Клик по объекту — выбрать / снять выбор
   if(state.selected===obj){state.selected=null;obj.material.emissive&&obj.material.emissive.setHex(0x000000);}
   else{
    if(state.selected&&state.selected.material.emissive)state.selected.material.emissive.setHex(0x000000);
    state.selected=obj;
    if(obj.material.emissive)obj.material.emissive.setHex(0x444400);
   }
   return;
  }
  const target=pick(state.targets.filter(t=>!t.userData.filled));
  if(target)tryPlace(state,obj,target);
  else obj.position.copy(obj.userData.origin);
 }
 function onTapTarget(){
  // Клик по цели после выбора объекта
  const target=pick(state.targets.filter(t=>!t.userData.filled));
  if(target&&state.selected)tryPlace(state,state.selected,target);
 }
 canvas.addEventListener('pointerdown',e=>{
  onDown(e);
  // Если объект уже выбран — проверяем цель
  if(state.selected&&!state.drag){
   setPointer(e);
   const target=pick(state.targets.filter(t=>!t.userData.filled));
   if(target)tryPlace(state,state.selected,target);
  }
 });
 canvas.addEventListener('pointermove',onMove,{passive:true});
 canvas.addEventListener('pointerup',onUp);
 canvas.addEventListener('touchmove',onMove,{passive:true});
 canvas.addEventListener('touchend',onUp);

 const io=new IntersectionObserver(entries=>{entries.forEach(en=>state.active=en.isIntersecting);},{threshold:.05});
 io.observe(box);
 scenes.push(state);
 return state;
}

/* ---------- Игровой движок внутри 3D ---------- */
function addGame(state,name,objects,targets){
 const game={name,objects:[],targets:[],done:0,total:objects.length};
 games[name]=game;
 state.game=name;
 objects.forEach(o=>{
  const mesh=makeObject(o);
  mesh.userData={game:name,id:o.id,cat:o.cat,placed:false,origin:mesh.position.clone()};
  state.group.add(mesh);game.objects.push(mesh);
  const lbl=label(o.label,'#d9a441');
  lbl.position.copy(mesh.position).add(new THREE.Vector3(0,1.1,0));
  state.group.add(lbl);mesh.userData.label=lbl;
 });
 targets.forEach(t=>{
  const mesh=makeTarget(t);
  mesh.userData={game:name,cat:t.cat,filled:false,label:t.label};
  state.group.add(mesh);game.targets.push(mesh);
  const lbl=label(t.label,'#4fa3a5');
  lbl.position.copy(mesh.position).add(new THREE.Vector3(0,1.4,0));
  state.group.add(lbl);mesh.userData.label=lbl;
 });
 updateScore(name);
}

function makeObject(o){
 let mesh;
 const mat=new THREE.MeshPhongMaterial({color:o.color,emissive:0x000000,shininess:80,transparent:true,opacity:.95});
 if(o.shape==='orb')mesh=new THREE.Mesh(new THREE.SphereGeometry(.55,20,16),mat);
 else if(o.shape==='scroll')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,1,14),mat);
 else if(o.shape==='brick')mesh=new THREE.Mesh(new THREE.BoxGeometry(1.1,.55,.55),mat);
 else if(o.shape==='seed')mesh=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,10),mat);
 else if(o.shape==='seal')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.18,20),mat);
 else mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.55),mat);
 mesh.position.set(...o.pos);
 return mesh;
}

function makeTarget(t){
 let mesh;
 const mat=new THREE.MeshPhongMaterial({color:t.color||0xefe0c4,transparent:true,opacity:.9,shininess:40});
 if(t.shape==='pedestal')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,.9,18),mat);
 else if(t.shape==='floor')mesh=new THREE.Mesh(new THREE.BoxGeometry(2.2,.5,1.4),mat);
 else if(t.shape==='bed')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.8,.9,.35,18),mat);
 else if(t.shape==='mirror')mesh=new THREE.Mesh(new THREE.TorusGeometry(.9,.12,10,32),mat);
 else mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),mat);
 mesh.position.set(...t.pos);
 if(t.shape==='mirror')mesh.rotation.x=Math.PI/2;
 return mesh;
}

function tryPlace(state,obj,target){
 const name=obj.userData.game;
 const game=games[name];
 if(obj.userData.cat===target.userData.cat){
  target.userData.filled=true;obj.userData.placed=true;
  // Анимация к цели
  const from=obj.position.clone(),to=target.position.clone().add(new THREE.Vector3(0,1,0));
  let t=0;
  const anim=()=>{
   t+=.08;
   obj.position.lerpVectors(from,to,Math.min(1,t));
   if(t<1)requestAnimationFrame(anim);
  };
  anim();
  game.done++;
  updateScore(name);
  feedback(name,game.done===game.total?successText(name):'Верно! Осталось '+(game.total-game.done)+'.',true);
  if(state.selected===obj)state.selected=null;
 }else{
  target.material.color.setHex(0xb3573f);
  setTimeout(()=>target.material.color.setHex(0xefe0c4),450);
  feedback(name,'Не подходит к этой цели. Подумайте о смысле.',false);
  obj.position.copy(obj.userData.origin);
 }
}

function updateScore(name){
 const game=games[name];
 window.dispatchEvent(new CustomEvent('ga:score',{detail:{game:name,done:game.done,total:game.total}}));
}
function feedback(name,text,ok){
 window.dispatchEvent(new CustomEvent('ga:feedback',{detail:{game:name,text,ok}}));
}
function successText(name){
 const map={
  concepts:'Свиток собран: вы различаете ключевые понятия диагностики.',
  tower:'Башня собрана: измерение, несколько условий и целостная система.',
  herzen:'Вы верно соотнесли вклад ученых РГПУ им. А. И. Герцена.',
  artifacts:'Артефакты размещены верно: вы понимаете, что измеряет каждая методика.',
  profile:'Профиль одаренности складывается из разных сильных сторон.',
  garden:'Сад идей вырос: вы проявили гибкость и оригинальность мышления.',
  ai:'ИИ может быть советником, но не оракулом.',
  charter:'Хартия одаренности собрана: диагностика комплексна и ориентирована на развитие.'
 };
 return map[name]||'Игра пройдена!';
}

/* Перезапуск */
window.addEventListener('ga:restart',e=>{
 const name=e.detail.game;const game=games[name];
 if(!game)return;
 game.done=0;
 game.objects.forEach(o=>{
  o.userData.placed=false;o.position.copy(o.userData.origin);
  if(o.material.emissive)o.material.emissive.setHex(0x000000);
 });
 game.targets.forEach(t=>{t.userData.filled=false;t.material.color.setHex(0xefe0c4);});
 updateScore(name);
 feedback(name,'Игра начата заново.');
});

/* ---------- Сцены ---------- */

/* Врата Академии */
makeScene(document.querySelector('[data-scene="gates"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(18,48),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-1;s.group.add(ground);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(2.8,.32,12,40,Math.PI),new THREE.MeshLambertMaterial({color:0xd9a441}));
 arch.position.y=1.6;s.group.add(arch);
 [-2.8,2.8].forEach(x=>{
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.42,.52,4.6,12),new THREE.MeshLambertMaterial({color:0xefe0c4}));
  p.position.set(x,1.3,0);s.group.add(p);
 });
 const portal=new THREE.Mesh(new THREE.CircleGeometry(2.4,40),new THREE.MeshBasicMaterial({color:0x8fc4d6,transparent:true,opacity:.4}));
 portal.position.set(0,1.7,0);s.group.add(portal);
 for(let i=0;i<10;i++){const t=tree(i%2?0x6f9a5d:0x84ad6b,.8+Math.random()*.6);t.position.set((Math.random()-.5)*22,0,(Math.random()-.5)*14-6);s.group.add(t);}
 s.group.add(particles(mobile?80:160,0xffe9a8,.1,22));
 s.group.add(runes(10,5.5,0xb6a3d6));
});

/* Понятия: 5 сфер -> 5 пьедесталов */
makeScene(document.querySelector('[data-scene="concepts"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 addGame(s,'concepts',[
  {id:'odar',label:'Одаренность',cat:'odar',shape:'orb',color:0xd9a441,pos:[-4,1,2]},
  {id:'spos',label:'Способности',cat:'spos',shape:'orb',color:0x6f9a5d,pos:[-2,1,3]},
  {id:'diag',label:'Диагностика',cat:'diag',shape:'orb',color:0x8fc4d6,pos:[0,1,3.5]},
  {id:'psih',label:'Психометрика',cat:'psih',shape:'orb',color:0xb6a3d6,pos:[2,1,3]},
  {id:'kreat',label:'Креативность',cat:'kreat',shape:'orb',color:0x4fa3a5,pos:[4,1,2]}
 ],[
  {id:'z1',cat:'odar',label:'Системное качество психики',shape:'pedestal',pos:[-4,0,0]},
  {id:'z2',cat:'spos',label:'Индивидуальные особенности',shape:'pedestal',pos:[-2,0,0]},
  {id:'z3',cat:'diag',label:'Процесс изучения ребенка',shape:'pedestal',pos:[0,0,0]},
  {id:'z4',cat:'psih',label:'Измерение характеристик',shape:'pedestal',pos:[2,0,0]},
  {id:'z5',cat:'kreat',label:'Новые идеи и решения',shape:'pedestal',pos:[4,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,16));
});

/* Башня подходов: 6 кирпичей -> 3 этажа */
makeScene(document.querySelector('[data-scene="tower"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 const colors=[0x8fc4d6,0xd9a441,0x6f9a5d];
 for(let i=0;i<3;i++){
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.8-i*.4,3.2-i*.4,1,20),new THREE.MeshLambertMaterial({color:colors[i]}));
  floor.position.y=i*1.3;s.group.add(floor);
 }
 const roof=new THREE.Mesh(new THREE.ConeGeometry(2,2,20),new THREE.MeshLambertMaterial({color:0xb6a3d6}));
 roof.position.y=4.6;s.group.add(roof);
 addGame(s,'tower',[
  {id:'iq',label:'IQ и тесты',cat:'psih',shape:'brick',color:0x8fc4d6,pos:[-5,1,3]},
  {id:'renz',label:'Модель Рензулли',cat:'multi',shape:'brick',color:0xd9a441,pos:[-3,1,3.5]},
  {id:'gard',label:'Интеллекты Гарднера',cat:'multi',shape:'brick',color:0xd9a441,pos:[-1,1,4]},
  {id:'rab',label:'Рабочая концепция',cat:'sist',shape:'brick',color:0x6f9a5d,pos:[1,1,4]},
  {id:'kom',label:'Компоненты системы',cat:'sist',shape:'brick',color:0x6f9a5d,pos:[3,1,3.5]},
  {id:'torr',label:'Тесты Торренса',cat:'psih',shape:'brick',color:0x8fc4d6,pos:[5,1,3]}
 ],[
  {id:'f1',cat:'psih',label:'Психометрический',shape:'floor',pos:[-3,0,0]},
  {id:'f2',cat:'multi',label:'Многомерный',shape:'floor',pos:[0,0,0]},
  {id:'f3',cat:'sist',label:'Системный',shape:'floor',pos:[3,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xfff0c0,.09,16));
});

/* Лес факторов: 8 светлячков, 5 верных */
makeScene(document.querySelector('[data-scene="forest"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(16,44),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.7;s.group.add(ground);
 for(let i=0;i<14;i++){const t=tree(0x6f9a5d,.7+Math.random()*.8);t.position.set((Math.random()-.5)*24,0,(Math.random()-.5)*14-4);s.group.add(t);}
 addGame(s,'fireflies',[
  {id:'age',label:'Возрастная динамика',cat:'good',shape:'orb',color:0xffe680,pos:[-5,2,2]},
  {id:'cult',label:'Социокультурный контекст',cat:'good',shape:'orb',color:0xffe680,pos:[-3,2.5,3]},
  {id:'hid',label:'Скрытая одаренность',cat:'good',shape:'orb',color:0xffe680,pos:[-1,3,3.5]},
  {id:'double',label:'Двойная исключительность',cat:'good',shape:'orb',color:0xffe680,pos:[1,2.5,3]},
  {id:'subj',label:'Субъективность оценок',cat:'good',shape:'orb',color:0xffe680,pos:[3,2,2]},
  {id:'color',label:'Цвет формы',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[5,2,1]},
  {id:'room',label:'Номер кабинета',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[-6,2,0]},
  {id:'fav',label:'Любимый цвет',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[6,2,0]}
 ],[
  {id:'goal',cat:'good',label:'Важные факторы',shape:'pedestal',pos:[0,0,0]}
 ]);
 s.group.add(particles(mobile?60:120,0xffe680,.16,18));
});

/* Герценовцы: 4 медальона -> 4 пьедестала */
makeScene(document.querySelector('[data-scene="herzen"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 addGame(s,'herzen',[
  {id:'sav',label:'А. И. Савенков',cat:'sav',shape:'orb',color:0xd9a441,pos:[-4.5,1.5,3]},
  {id:'shum',label:'Н. Б. Шумакова',cat:'shum',shape:'orb',color:0x6f9a5d,pos:[-1.5,1.5,3.5]},
  {id:'bae',label:'И. А. Баева',cat:'bae',shape:'orb',color:0x8fc4d6,pos:[1.5,1.5,3.5]},
  {id:'dru',label:'В. Н. Дружинин',cat:'dru',shape:'orb',color:0xb6a3d6,pos:[4.5,1.5,3]}
 ],[
  {id:'z1',cat:'sav',label:'Потенциал и наблюдение',shape:'pedestal',pos:[-4.5,0,0]},
  {id:'z2',cat:'shum',label:'Скрытая одаренность',shape:'pedestal',pos:[-1.5,0,0]},
  {id:'z3',cat:'bae',label:'Безопасная среда',shape:'pedestal',pos:[1.5,0,0]},
  {id:'z4',cat:'dru',label:'Психометрика и креативность',shape:'pedestal',pos:[4.5,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,16));
});

/* Креативное поле: 5 кристаллов -> 5 гнезд */
makeScene(document.querySelector('[data-scene="field"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 const table=new THREE.Mesh(new THREE.BoxGeometry(8,.4,4),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.5;s.group.add(table);
 addGame(s,'field',[
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
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,14));
});

/* Профиль Савенкова: 5 сфер -> 5 частей */
makeScene(document.querySelector('[data-scene="profile"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 addGame(s,'profile',[
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
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,16));
});

/* Сад идей: 6 семян -> 6 грядок */
makeScene(document.querySelector('[data-scene="garden"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 addGame(s,'garden',[
  {id:'ris',label:'Рисовать',cat:'ris',shape:'seed',color:0xd9a441,pos:[-5,1,3]},
  {id:'izm',label:'Измерять',cat:'izm',shape:'seed',color:0x8fc4d6,pos:[-3,1,3.5]},
  {id:'igr',label:'Играть',cat:'igr',shape:'seed',color:0x6f9a5d,pos:[-1,1,4]},
  {id:'ins',label:'Инструмент',cat:'ins',shape:'seed',color:0xb6a3d6,pos:[1,1,4]},
  {id:'art',label:'Арт-объект',cat:'art',shape:'seed',color:0x4fa3a5,pos:[3,1,3.5]},
  {id:'nau',label:'Опыт',cat:'nau',shape:'seed',color:0xf2d789,pos:[5,1,3]}
 ],[
  {id:'b1',cat:'ris',label:'Грядка рисования',shape:'bed',pos:[-5,0,0]},
  {id:'b2',cat:'izm',label:'Грядка измерения',shape:'bed',pos:[-3,0,0]},
  {id:'b3',cat:'igr',label:'Грядка игры',shape:'bed',pos:[-1,0,0]},
  {id:'b4',cat:'ins',label:'Грядка инструментов',shape:'bed',pos:[1,0,0]},
  {id:'b5',cat:'art',label:'Грядка искусства',shape:'bed',pos:[3,0,0]},
  {id:'b6',cat:'nau',label:'Грядка науки',shape:'bed',pos:[5,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xfff0c0,.1,16));
});

/* Алтарь артефактов: 6 свитков -> 6 пьедесталов */
makeScene(document.querySelector('[data-scene="altar"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(3.4,4,1,28),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 base.position.y=-.4;s.group.add(base);
 addGame(s,'artifacts',[
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
 s.group.add(runes(10,4.5,0xffe9a8));
});

/* Наблюдатель: 6 hotspot-ов, 4 верных */
makeScene(document.querySelector('[data-scene="observer"]'),s=>{
 const ground=new THREE.Mesh(new THREE.BoxGeometry(16,.4,10),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 ground.position.y=-.5;s.group.add(ground);
 for(let i=0;i<5;i++){
  const desk=new THREE.Mesh(new THREE.BoxGeometry(1.8,1,.9),new THREE.MeshLambertMaterial({color:0x8a623c}));
  desk.position.set(-4+i*2,.25,0);s.group.add(desk);
 }
 const board=new THREE.Mesh(new THREE.PlaneGeometry(5,2.6),new THREE.MeshLambertMaterial({color:0x6f9a5d}));
 board.position.set(0,3,-3.5);s.group.add(board);
 addGame(s,'observer',[
  {id:'q',label:'Исследовательские вопросы',cat:'good',shape:'orb',color:0xffe680,pos:[-4,2,2]},
  {id:'pers',label:'Настойчивость',cat:'good',shape:'orb',color:0xffe680,pos:[-2,2.5,2.5]},
  {id:'orig',label:'Оригинальность',cat:'good',shape:'orb',color:0xffe680,pos:[0,3,3]},
  {id:'info',label:'Самостоятельный поиск',cat:'good',shape:'orb',color:0xffe680,pos:[2,2.5,2.5]},
  {id:'silence',label:'Молчит весь урок',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[4,2,2]},
  {id:'template',label:'Дневник по шаблону',cat:'bad',shape:'orb',color:0x8fc4d6,pos:[-6,2,1]}
 ],[
  {id:'goal',cat:'good',label:'Важные проявления',shape:'pedestal',pos:[0,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,14));
});

/* Зеркало ИИ: 6 кристаллов -> 2 зеркала */
makeScene(document.querySelector('[data-scene="ai"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 addGame(s,'ai',[
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
 s.group.add(particles(mobile?50:100,0xffe9a8,.09,16));
});

/* Хартия: 8 печатей, 5 верных */
makeScene(document.querySelector('[data-scene="charter"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 const table=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,.5,28),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.4;s.group.add(table);
 const charter=new THREE.Mesh(new THREE.PlaneGeometry(4,2.6),new THREE.MeshLambertMaterial({color:0xf6ecd8,side:THREE.DoubleSide}));
 charter.position.set(0,1.8,0);charter.rotation.x=-.4;s.group.add(charter);
 addGame(s,'charter',[
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
 s.group.add(particles(mobile?50:100,0xffe9a8,.1,16));
});

/* ---------- Анимация ---------- */
function animate(){
 requestAnimationFrame(animate);
 const t=performance.now()*.001;
 scenes.forEach(s=>{
  if(!s.active)return;
  s.group.rotation.y+=.0012;
  s.group.children.forEach(c=>{
   if(c.isPoints){c.rotation.y-=.0012;c.position.y=Math.sin(t*.7)*.2;}
  });
  s.renderer.render(s.scene,s.camera);
 });
}
animate();

window.addEventListener('resize',()=>{
 scenes.forEach(s=>{
  const w=s.box.clientWidth,h=s.box.clientHeight;
  if(!w||!h)return;
  s.camera.aspect=w/h;s.camera.updateProjectionMatrix();s.renderer.setSize(w,h);
 });
});

})();