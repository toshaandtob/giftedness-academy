/* Академия Одаренности — 3D-движок и первые сцены */
(function(){
'use strict';
if(typeof THREE==='undefined'){
 document.querySelectorAll('.scene-box').forEach(box=>{
  box.innerHTML='<div class="scene-fallback"><p>3D-сцена недоступна: WebGL не поддерживается.</p></div>';
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
 ctx.fillStyle='rgba(255,252,240,.94)';
 ctx.beginPath();ctx.roundRect(10,10,w-20,h-20,24);ctx.fill();
 ctx.strokeStyle='rgba(107,74,47,.55)';ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle='#3b2d20';ctx.font='600 42px Cormorant Garamond, Georgia, serif';
 ctx.textAlign='center';ctx.textBaseline='middle';
 const words=text.split(' ');let line='',lines=[];
 words.forEach(word=>{
  const test=line?line+' '+word:word;
  if(ctx.measureText(test).width>w-60){lines.push(line);line=word;}else line=test;
 });
 lines.push(line);
 const startY=h/2-(lines.length-1)*24;
 lines.forEach((l,i)=>ctx.fillText(l,w/2,startY+i*48));
 const tex=new THREE.CanvasTexture(canvas);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
 sprite.scale.set(3.4,.85,1);
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
 const mat=new THREE.PointsMaterial({color,size,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending});
 return new THREE.Points(geo,mat);
}

function tree(color,scale){
 const g=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,1.8,8),new THREE.MeshStandardMaterial({color:0x6b4a2f,roughness:.9}));
 trunk.position.y=.9;g.add(trunk);
 const c1=new THREE.Mesh(new THREE.SphereGeometry(.9,14,12),new THREE.MeshStandardMaterial({color,roughness:.85}));
 c1.position.y=2.1;g.add(c1);
 const c2=new THREE.Mesh(new THREE.SphereGeometry(.7,12,10),new THREE.MeshStandardMaterial({color,roughness:.85}));
 c2.position.set(.45,2.6,.2);g.add(c2);
 const c3=new THREE.Mesh(new THREE.SphereGeometry(.6,12,10),new THREE.MeshStandardMaterial({color,roughness:.85}));
 c3.position.set(-.4,2.5,-.2);g.add(c3);
 g.scale.setScalar(scale||1);return g;
}

function lantern(x,z){
 const g=new THREE.Group();
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.6,8),new THREE.MeshStandardMaterial({color:0x4a3320,roughness:.8}));
 post.position.y=1.3;g.add(post);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),new THREE.MeshStandardMaterial({color:0xffe9a8,emissive:0xffd27a,emissiveIntensity:1.4,roughness:.4}));
 lamp.position.y=2.7;g.add(lamp);
 if(!mobile){
  const light=new THREE.PointLight(0xffd9a0,1.2,8);
  light.position.set(0,2.7,0);g.add(light);
 }
 g.position.set(x,0,z);return g;
}

function book(x,y,z,color){
 const g=new THREE.Group();
 const cover=new THREE.Mesh(new THREE.BoxGeometry(.7,.16,.5),new THREE.MeshStandardMaterial({color,roughness:.6}));
 g.add(cover);
 const pages=new THREE.Mesh(new THREE.BoxGeometry(.62,.12,.42),new THREE.MeshStandardMaterial({color:0xf6ecd8,roughness:.9}));
 pages.position.y=.02;g.add(pages);
 g.position.set(x,y,z);g.rotation.y=Math.random()*Math.PI;return g;
}

function tower(x,z){
 const g=new THREE.Group();
 for(let i=0;i<3;i++){
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(1.6-i*.25,1.8-i*.25,1.2,18),new THREE.MeshStandardMaterial({color:0xefe0c4,roughness:.7}));
  floor.position.y=i*1.3;g.add(floor);
 }
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.4,1.6,18),new THREE.MeshStandardMaterial({color:0x6f9a5d,roughness:.7}));
 roof.position.y=4.4;g.add(roof);
 for(let i=0;i<3;i++){
  const win=new THREE.Mesh(new THREE.BoxGeometry(.3,.5,.05),new THREE.MeshStandardMaterial({color:0xffe9a8,emissive:0xffd27a,emissiveIntensity:1.2}));
  win.position.set(0,1+i*1.3,1.55);g.add(win);
 }
 g.position.set(x,0,z);return g;
}

function portal(x,z){
 const g=new THREE.Group();
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.6,.18,12,40),new THREE.MeshStandardMaterial({color:0xd9a441,roughness:.4,metalness:.4}));
 ring.position.y=1.8;g.add(ring);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(1.5,40),new THREE.MeshBasicMaterial({color:0x8fc4d6,transparent:true,opacity:.35,blending:THREE.AdditiveBlending}));
 disc.position.y=1.8;g.add(disc);
 g.position.set(x,0,z);return g;
}

function runes(count,radius,color){
 const g=new THREE.Group();
 for(let i=0;i<count;i++){
  const r=new THREE.Mesh(new THREE.PlaneGeometry(.6,.85),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
  const a=i/count*Math.PI*2;
  r.position.set(Math.cos(a)*radius,2.4+Math.sin(i*1.7)*1.4,Math.sin(a)*radius);
  r.lookAt(0,2.4,0);g.add(r);
 }
 return g;
}

function sky(){
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 canvas.width=2;canvas.height=256;
 const grad=ctx.createLinearGradient(0,0,0,256);
 grad.addColorStop(0,'#ffe9b8');grad.addColorStop(.5,'#cfe8e2');grad.addColorStop(1,'#f7ecd9');
 ctx.fillStyle=grad;ctx.fillRect(0,0,2,256);
 const tex=new THREE.CanvasTexture(canvas);
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(70,24,16),new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide}));
 return sphere;
}

function ground(color,radius){
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 canvas.width=256;canvas.height=256;
 const grad=ctx.createRadialGradient(128,128,10,128,128,128);
 grad.addColorStop(0,'#ffffff');grad.addColorStop(1,color);
 ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);
 const tex=new THREE.CanvasTexture(canvas);
 const mesh=new THREE.Mesh(new THREE.CircleGeometry(radius,48),new THREE.MeshStandardMaterial({map:tex,roughness:.95}));
 mesh.rotation.x=-Math.PI/2;return mesh;
}

function shadow(){
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 canvas.width=128;canvas.height=128;
 const grad=ctx.createRadialGradient(64,64,4,64,64,64);
 grad.addColorStop(0,'rgba(0,0,0,.35)');grad.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
 const tex=new THREE.CanvasTexture(canvas);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));
 sprite.scale.set(1.6,1.6,1);
 return sprite;
}

/* ---------- Игровые объекты ---------- */
function makeObject(o){
 let mesh;
 const mat=new THREE.MeshStandardMaterial({color:o.color,roughness:.35,metalness:.1,emissive:0x000000});
 if(o.shape==='orb')mesh=new THREE.Mesh(new THREE.SphereGeometry(.55,24,18),mat);
 else if(o.shape==='scroll')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,1.05,16),mat);
 else if(o.shape==='brick')mesh=new THREE.Mesh(new THREE.BoxGeometry(1.2,.6,.6),mat);
 else if(o.shape==='seed')mesh=new THREE.Mesh(new THREE.ConeGeometry(.35,.75,12),mat);
 else if(o.shape==='seal')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.2,24),mat);
 else if(o.shape==='book')mesh=new THREE.Mesh(new THREE.BoxGeometry(.75,.2,.55),mat);
 else mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.6),mat);
 mesh.position.set(...o.pos);
 const sh=shadow();sh.position.set(0,-mesh.geometry.parameters.height/2-.3,0);
 mesh.add(sh);
 return mesh;
}

function makeTarget(t){
 let mesh;
 const mat=new THREE.MeshStandardMaterial({color:t.color||0xefe0c4,roughness:.6,metalness:.1});
 if(t.shape==='pedestal')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,1,20),mat);
 else if(t.shape==='floor')mesh=new THREE.Mesh(new THREE.BoxGeometry(2.4,.55,1.5),mat);
 else if(t.shape==='pot')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.55,.4,.7,16),mat);
 else if(t.shape==='mirror')mesh=new THREE.Mesh(new THREE.TorusGeometry(1,.14,12,36),mat);
 else mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8),mat);
 mesh.position.set(...t.pos);
 if(t.shape==='mirror')mesh.rotation.x=Math.PI/2;
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.06,8,40),new THREE.MeshBasicMaterial({color:0x4fa3a5,transparent:true,opacity:.55,blending:THREE.AdditiveBlending}));
 ring.rotation.x=Math.PI/2;ring.position.y=.05;mesh.add(ring);
 mesh.userData.ring=ring;
 return mesh;
}

/* ---------- Движок сцены ---------- */
function createScene(box,build){
 const width=box.clientWidth||360,height=box.clientHeight||420;
 const renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.5:2));
 renderer.setSize(width,height);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.1;
 if(!mobile){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;}
 box.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xf8eeda,24,90);
 scene.add(sky());
 const camera=new THREE.PerspectiveCamera(50,width/height,.1,200);
 camera.position.set(0,5,14);camera.lookAt(0,1.5,0);
 scene.add(new THREE.HemisphereLight(0xfff3d0,0x8fae7d,1.1));
 const sun=new THREE.DirectionalLight(0xffe8b0,1.3);
 sun.position.set(8,12,8);
 if(!mobile){sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);}
 scene.add(sun);
 const rim=new THREE.DirectionalLight(0xb6a3d6,.5);
 rim.position.set(-6,4,-8);scene.add(rim);
 const group=new THREE.Group();scene.add(group);
 const state={renderer,scene,camera,group,box,active:false,objects:[],targets:[],game:null,ray:new THREE.Raycaster(),pointer:new THREE.Vector2(),drag:null,selected:null,downPos:null,moved:false};
 build(state);

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
   state.drag.position.x=THREE.MathUtils.clamp(point.x,-8,8);
   state.drag.position.z=THREE.MathUtils.clamp(point.z,-6,6);
  }
 }
 function onUp(e){
  setPointer(e);
  if(!state.drag)return;
  const obj=state.drag;state.drag=null;canvas.style.cursor='';
  if(!state.moved){
   if(state.selected===obj){state.selected=null;if(obj.material.emissive)obj.material.emissive.setHex(0x000000);}
   else{
    if(state.selected&&state.selected.material.emissive)state.selected.material.emissive.setHex(0x000000);
    state.selected=obj;
    if(obj.material.emissive)obj.material.emissive.setHex(0x554400);
   }
   return;
  }
  const target=pick(state.targets.filter(t=>!t.userData.filled));
  if(target)tryPlace(state,obj,target);
  else obj.position.copy(obj.userData.origin);
 }
 canvas.addEventListener('pointerdown',e=>{
  onDown(e);
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

 const io=new IntersectionObserver(entries=>{
  entries.forEach(en=>state.active=en.isIntersecting);
 },{threshold:.05});
 io.observe(box);
 scenes.push(state);
 return state;
}

/* ---------- Игровой движок ---------- */
function addGame(state,name,objects,targets){
 const game={name,objects:[],targets:[],done:0,total:objects.length};
 games[name]=game;
 state.game=name;
 objects.forEach(o=>{
  const mesh=makeObject(o);
  mesh.userData={game:name,id:o.id,cat:o.cat,placed:false,origin:mesh.position.clone()};
  state.group.add(mesh);game.objects.push(mesh);
  const lbl=label(o.label,'#d9a441');
  lbl.position.copy(mesh.position).add(new THREE.Vector3(0,1.2,0));
  state.group.add(lbl);mesh.userData.label=lbl;
 });
 targets.forEach(t=>{
  const mesh=makeTarget(t);
  mesh.userData={game:name,cat:t.cat,filled:false,label:t.label};
  state.group.add(mesh);game.targets.push(mesh);
  const lbl=label(t.label,'#4fa3a5');
  lbl.position.copy(mesh.position).add(new THREE.Vector3(0,1.6,0));
  state.group.add(lbl);mesh.userData.label=lbl;
 });
 updateScore(name);
}

function tryPlace(state,obj,target){
 const name=obj.userData.game;
 const game=games[name];
 if(obj.userData.cat===target.userData.cat){
  target.userData.filled=true;obj.userData.placed=true;
  const from=obj.position.clone(),to=target.position.clone().add(new THREE.Vector3(0,1.1,0));
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

/* ---------- Ленивая загрузка сцен ---------- */
const builders={};
function registerScene(name,builder){
 builders[name]=builder;
 const box=document.querySelector('[data-scene="'+name+'"]');
 if(!box)return;
 let state=null;
 const io=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
   if(en.isIntersecting&&!state){
    state=createScene(box,builder);
   }else if(!en.isIntersecting&&state){
    // Оставляем созданные сцены, но не рендерим вне экрана
   }
  });
 },{rootMargin:'200px 0px',threshold:.01});
 io.observe(box);
}

/* ---------- Первые сцены ---------- */
registerScene('gates',s=>{
 s.group.add(ground(0x9db97f,20));
 s.group.add(portal(0,0));
 s.group.add(tower(-6,-4));s.group.add(tower(6,-4));
 for(let i=0;i<10;i++){const t=tree(i%2?0x6f9a5d:0x84ad6b,.8+Math.random()*.6);t.position.set((Math.random()-.5)*24,0,(Math.random()-.5)*14-6);s.group.add(t);}
 s.group.add(lantern(-4,3));s.group.add(lantern(4,3));
 s.group.add(particles(mobile?80:160,0xffe9a8,.12,24));
 s.group.add(runes(10,6,0xb6a3d6));
});

registerScene('concepts',s=>{
 s.group.add(ground(0xa8c389,18));
 for(let i=0;i<6;i++){const b=book((Math.random()-.5)*10,.1,(Math.random()-.5)*6-3,[0x6f9a5d,0xd9a441,0xb6a3d6][i%3]);s.group.add(b);}
 addGame(s,'concepts',[
  {id:'odar',label:'Одаренность',cat:'odar',shape:'orb',color:0xd9a441,pos:[-4,1,3]},
  {id:'spos',label:'Способности',cat:'spos',shape:'orb',color:0x6f9a5d,pos:[-2,1,3.5]},
  {id:'diag',label:'Диагностика',cat:'diag',shape:'orb',color:0x8fc4d6,pos:[0,1,4]},
  {id:'psih',label:'Психометрика',cat:'psih',shape:'orb',color:0xb6a3d6,pos:[2,1,3.5]},
  {id:'kreat',label:'Креативность',cat:'kreat',shape:'orb',color:0x4fa3a5,pos:[4,1,3]}
 ],[
  {id:'z1',cat:'odar',label:'Системное качество психики',shape:'pedestal',pos:[-4,0,0]},
  {id:'z2',cat:'spos',label:'Индивидуальные особенности',shape:'pedestal',pos:[-2,0,0]},
  {id:'z3',cat:'diag',label:'Процесс изучения ребенка',shape:'pedestal',pos:[0,0,0]},
  {id:'z4',cat:'psih',label:'Измерение характеристик',shape:'pedestal',pos:[2,0,0]},
  {id:'z5',cat:'kreat',label:'Новые идеи и решения',shape:'pedestal',pos:[4,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xffe9a8,.1,18));
});

registerScene('tower',s=>{
 s.group.add(ground(0xa8c389,18));
 const colors=[0x8fc4d6,0xd9a441,0x6f9a5d];
 for(let i=0;i<3;i++){
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.8-i*.4,3.2-i*.4,1.1,20),new THREE.MeshStandardMaterial({color:colors[i],roughness:.6}));
  floor.position.y=i*1.4;s.group.add(floor);
 }
 const roof=new THREE.Mesh(new THREE.ConeGeometry(2,2,20),new THREE.MeshStandardMaterial({color:0xb6a3d6,roughness:.6}));
 roof.position.y=4.8;s.group.add(roof);
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
 s.group.add(particles(mobile?50:100,0xfff0c0,.1,18));
});

registerScene('forest',s=>{
 s.group.add(ground(0xa8c389,20));
 for(let i=0;i<16;i++){const t=tree(0x6f9a5d,.7+Math.random()*.8);t.position.set((Math.random()-.5)*26,0,(Math.random()-.5)*16-4);s.group.add(t);}
 s.group.add(lantern(-3,2));s.group.add(lantern(3,2));
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
 s.group.add(particles(mobile?60:120,0xffe680,.18,20));
});

registerScene('herzen',s=>{
 s.group.add(ground(0xa8c389,18));
 s.group.add(tower(-5,-4));s.group.add(tower(5,-4));
 addGame(s,'herzen',[
  {id:'sav',label:'А. И. Савенков',cat:'sav',shape:'book',color:0xd9a441,pos:[-4.5,1.5,3]},
  {id:'shum',label:'Н. Б. Шумакова',cat:'shum',shape:'book',color:0x6f9a5d,pos:[-1.5,1.5,3.5]},
  {id:'bae',label:'И. А. Баева',cat:'bae',shape:'book',color:0x8fc4d6,pos:[1.5,1.5,3.5]},
  {id:'dru',label:'В. Н. Дружинин',cat:'dru',shape:'book',color:0xb6a3d6,pos:[4.5,1.5,3]}
 ],[
  {id:'z1',cat:'sav',label:'Потенциал и наблюдение',shape:'pedestal',pos:[-4.5,0,0]},
  {id:'z2',cat:'shum',label:'Скрытая одаренность',shape:'pedestal',pos:[-1.5,0,0]},
  {id:'z3',cat:'bae',label:'Безопасная среда',shape:'pedestal',pos:[1.5,0,0]},
  {id:'z4',cat:'dru',label:'Психометрика и креативность',shape:'pedestal',pos:[4.5,0,0]}
 ]);
 s.group.add(particles(mobile?50:100,0xffe9a8,.1,18));
});

/* Экспорт для второго файла сцен */
window.GA3D={registerScene,addGame,ground,tree,lantern,book,tower,portal,runes,particles,mobile};

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

/* Подключаем дополнительные сцены */
const extra=document.createElement('script');
extra.src='js/scenes-extra.js';
document.body.appendChild(extra);

})();