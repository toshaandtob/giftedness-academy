/* Академия Одаренности — улучшенные процедурные 3D-сцены Three.js */
(function(){
'use strict';
if(typeof THREE==='undefined'){
 document.querySelectorAll('.scene-box').forEach(box=>{
  box.innerHTML='<div class="scene-fallback"><p>3D-сцена недоступна: WebGL не поддерживается. Материал раздела и игра остаются полностью доступными ниже.</p></div>';
 });
 return;
}

const isMobile=window.matchMedia('(max-width:760px)').matches;
const scenes=[];

function makeScene(box,build){
 const width=box.clientWidth||360,height=box.clientHeight||340;
 const renderer=new THREE.WebGLRenderer({antialias:!isMobile,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.5:2));
 renderer.setSize(width,height);
 renderer.shadowMap.enabled=false;
 box.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xf8eeda,20,70);
 const camera=new THREE.PerspectiveCamera(50,width/height,.1,150);
 camera.position.set(0,3.4,12);
 scene.add(new THREE.HemisphereLight(0xfff3d0,0x8fae7d,1.15));
 const sun=new THREE.DirectionalLight(0xffe8b0,1.2);
 sun.position.set(6,9,7);scene.add(sun);
 const group=new THREE.Group();scene.add(group);
 const state={renderer,scene,camera,group,box,active:false,spin:0,items:[]};
 build(state);

 // Вращение мышью и пальцем
 let down=false,lastX=0;
 const onDown=e=>{down=true;lastX=e.touches?e.touches[0].clientX:e.clientX;};
 const onMove=e=>{
  if(!down)return;
  const x=e.touches?e.touches[0].clientX:e.clientX;
  group.rotation.y+=(x-lastX)*.007;lastX=x;
 };
 const onUp=()=>down=false;
 box.addEventListener('pointerdown',onDown);
 window.addEventListener('pointermove',onMove,{passive:true});
 window.addEventListener('pointerup',onUp);
 window.addEventListener('touchmove',onMove,{passive:true});
 window.addEventListener('touchend',onUp);

 const io=new IntersectionObserver(entries=>{entries.forEach(en=>state.active=en.isIntersecting);},{threshold:.05});
 io.observe(box);
 scenes.push(state);
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
 const mat=new THREE.PointsMaterial({color,size,transparent:true,opacity:.8,depthWrite:false});
 return new THREE.Points(geo,mat);
}

function tree(color,scale){
 const g=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,1.7,8),new THREE.MeshLambertMaterial({color:0x6b4a2f}));
 trunk.position.y=.85;g.add(trunk);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.95,12,10),new THREE.MeshLambertMaterial({color}));
 crown.position.y=2;crown.scale.y=1.2;g.add(crown);
 g.scale.setScalar(scale||1);
 return g;
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

function banner(color,x){
 const g=new THREE.Group();
 const cloth=new THREE.Mesh(new THREE.PlaneGeometry(.9,2.2),new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));
 cloth.position.y=2.6;g.add(cloth);
 const rod=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.2,8),new THREE.MeshLambertMaterial({color:0x6b4a2f}));
 rod.rotation.z=Math.PI/2;rod.position.y=3.7;g.add(rod);
 g.position.x=x;return g;
}

/* Врата Академии */
makeScene(document.querySelector('[data-scene="gates"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(16,48),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-1;s.group.add(ground);
 const path=new THREE.Mesh(new THREE.PlaneGeometry(4,14),new THREE.MeshLambertMaterial({color:0xd9c9a8}));
 path.rotation.x=-Math.PI/2;path.position.set(0,-.98,4);s.group.add(path);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(2.6,.3,12,40,Math.PI),new THREE.MeshLambertMaterial({color:0xd9a441}));
 arch.position.y=1.5;s.group.add(arch);
 [-2.6,2.6].forEach(x=>{
  const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.4,.5,4.4,12),new THREE.MeshLambertMaterial({color:0xefe0c4}));
  pillar.position.set(x,1.2,0);s.group.add(pillar);
 });
 const portal=new THREE.Mesh(new THREE.CircleGeometry(2.2,40),new THREE.MeshBasicMaterial({color:0x8fc4d6,transparent:true,opacity:.4}));
 portal.position.set(0,1.6,0);s.group.add(portal);
 s.group.add(banner(0x6f9a5d,-3.6));s.group.add(banner(0xb6a3d6,3.6));
 for(let i=0;i<10;i++){const t=tree(i%2?0x6f9a5d:0x84ad6b,.8+Math.random()*.6);t.position.set((Math.random()-.5)*20,0,(Math.random()-.5)*12-5);s.group.add(t);}
 s.group.add(particles(isMobile?80:160,0xffe9a8,.1,20));
 s.group.add(runes(10,5,0xb6a3d6));
});

/* Башня трех подходов */
makeScene(document.querySelector('[data-scene="tower"]'),s=>{
 const colors=[0x8fc4d6,0xd9a441,0x6f9a5d];
 for(let i=0;i<3;i++){
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.6-i*.4,3-i*.4,1,20),new THREE.MeshLambertMaterial({color:colors[i]}));
  floor.position.y=i*1.15;s.group.add(floor);
 }
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.9,1.9,20),new THREE.MeshLambertMaterial({color:0xb6a3d6}));
 roof.position.y=4;s.group.add(roof);
 const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.7),new THREE.MeshBasicMaterial({color:0xd9a441,side:THREE.DoubleSide}));
 flag.position.set(.7,5.2,0);s.group.add(flag);
 s.group.add(runes(12,4,0xffe9a8));
 s.group.add(particles(isMobile?60:120,0xfff0c0,.09,16));
});

/* Лес факторов */
makeScene(document.querySelector('[data-scene="forest"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(17,48),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.7;s.group.add(ground);
 for(let i=0;i<16;i++){const t=tree(0x6f9a5d,.7+Math.random()*.8);t.position.set((Math.random()-.5)*24,0,(Math.random()-.5)*14-4);s.group.add(t);}
 s.group.add(particles(isMobile?70:140,0xffe680,.16,18));
 const mist=new THREE.Mesh(new THREE.SphereGeometry(12,18,14),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.08}));
 mist.position.y=2.5;s.group.add(mist);
});

/* Мастерская */
makeScene(document.querySelector('[data-scene="field"]'),s=>{
 const table=new THREE.Mesh(new THREE.BoxGeometry(6,.35,3.4),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.6;s.group.add(table);
 for(let i=0;i<6;i++){
  const scroll=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1,12),new THREE.MeshLambertMaterial({color:0xf6ecd8}));
  scroll.rotation.z=Math.PI/2;scroll.position.set(-2+i*.8,1.1,0);s.group.add(scroll);
 }
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.8),new THREE.MeshPhongMaterial({color:0x4fa3a5,transparent:true,opacity:.85,shininess:90}));
 crystal.position.set(0,2.6,0);s.group.add(crystal);s.crystal=crystal;
 s.group.add(particles(isMobile?60:120,0xffe9a8,.09,14));
});

/* Сад идей */
makeScene(document.querySelector('[data-scene="garden"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 const colors=[0xd9a441,0xb6a3d6,0x8fc4d6,0x6f9a5d,0x4fa3a5,0xf2d789];
 for(let i=0;i<6;i++){
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.6,8),new THREE.MeshLambertMaterial({color:0x5d7f4a}));
  const flower=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),new THREE.MeshLambertMaterial({color:colors[i]}));
  const plant=new THREE.Group();stem.position.y=.8;flower.position.y=1.8;plant.add(stem,flower);
  const a=i/6*Math.PI*2;plant.position.set(Math.cos(a)*4.5,0,Math.sin(a)*3.5);s.group.add(plant);s.items.push(plant);
 }
 s.group.add(particles(isMobile?60:120,0xfff0c0,.1,16));
});

/* Алтарь артефактов */
makeScene(document.querySelector('[data-scene="altar"]'),s=>{
 const base=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.8,.9,28),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 base.position.y=-.5;s.group.add(base);
 for(let i=0;i<6;i++){
  const scroll=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,1.1,12),new THREE.MeshLambertMaterial({color:0xf6ecd8}));
  const a=i/6*Math.PI*2;scroll.position.set(Math.cos(a)*2.4,1,Math.sin(a)*2.4);scroll.rotation.z=Math.PI/2;s.group.add(scroll);
 }
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.85,20,16),new THREE.MeshPhongMaterial({color:0xb6a3d6,transparent:true,opacity:.9,shininess:100}));
 orb.position.y=2.4;s.group.add(orb);s.orb=orb;
 s.group.add(runes(10,4.4,0xffe9a8));
});

/* Зал наблюдателя */
makeScene(document.querySelector('[data-scene="observer"]'),s=>{
 const floor=new THREE.Mesh(new THREE.BoxGeometry(14,.35,9),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 floor.position.y=-.5;s.group.add(floor);
 for(let i=0;i<5;i++){
  const desk=new THREE.Mesh(new THREE.BoxGeometry(1.6,.9,.9),new THREE.MeshLambertMaterial({color:0x8a623c}));
  desk.position.set(-4+i*2,.25,0);s.group.add(desk);
 }
 const board=new THREE.Mesh(new THREE.PlaneGeometry(5,2.6),new THREE.MeshLambertMaterial({color:0x6f9a5d}));
 board.position.set(0,2.8,-3.5);s.group.add(board);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),new THREE.MeshBasicMaterial({color:0xffe9a8}));
 lamp.position.set(0,4.5,-2);s.group.add(lamp);s.lamp=lamp;
 s.group.add(particles(isMobile?50:100,0xffe9a8,.09,14));
});

/* Зал Совета */
makeScene(document.querySelector('[data-scene="charter"]'),s=>{
 const table=new THREE.Mesh(new THREE.CylinderGeometry(2.6,3,.4,28),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.5;s.group.add(table);
 const charter=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshLambertMaterial({color:0xf6ecd8,side:THREE.DoubleSide}));
 charter.position.y=1.6;charter.rotation.x=-.45;s.group.add(charter);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.1,10,52),new THREE.MeshBasicMaterial({color:0xd9a441,transparent:true,opacity:.75}));
 ring.rotation.x=Math.PI/2;ring.position.y=.8;s.group.add(ring);s.ring=ring;
 s.group.add(particles(isMobile?60:120,0xffe9a8,.1,16));
});

function animate(){
 requestAnimationFrame(animate);
 const t=performance.now()*.001;
 scenes.forEach(s=>{
  if(!s.active)return;
  s.spin+=.0018;
  s.group.rotation.y=s.spin;
  s.group.children.forEach(c=>{
   if(c.isPoints){c.rotation.y-=.0014;c.position.y=Math.sin(t*.7)*.2;}
  });
  if(s.crystal)s.crystal.rotation.y+=.014;
  if(s.orb)s.orb.rotation.y+=.012;
  if(s.ring)s.ring.rotation.z+=.01;
  if(s.lamp)s.lamp.position.y=4.5+Math.sin(t*2)*.15;
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