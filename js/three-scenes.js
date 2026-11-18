/* Легкие процедурные 3D-сцены Three.js для мобильных устройств */
(function(){
'use strict';
if(typeof THREE==='undefined'){
 document.querySelectorAll('.scene-box').forEach(box=>{
  box.innerHTML='<div class="scene-fallback"><p>3D-сцена недоступна: WebGL не поддерживается. Материал раздела и игра остаются полностью доступными ниже.</p></div>';
 });
 return;
}

const isMobile=window.matchMedia('(max-width: 760px)').matches;
const scenes=[];

function makeScene(box,build){
 const width=box.clientWidth||320,height=box.clientHeight||300;
 const renderer=new THREE.WebGLRenderer({antialias:!isMobile,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.4:2));
 renderer.setSize(width,height);
 renderer.shadowMap.enabled=false;
 box.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xf8eeda,18,60);
 const camera=new THREE.PerspectiveCamera(48,width/height,.1,120);
 camera.position.set(0,3.2,11);
 const ambient=new THREE.HemisphereLight(0xfff3d0,0x8fae7d,1.05);
 scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xffe8b0,1.1);
 sun.position.set(5,8,6);scene.add(sun);
 const group=new THREE.Group();scene.add(group);
 const state={renderer,scene,camera,group,box,active:false,pointer:{down:false,x:0}};
 build(state);

 // Управление вращением мышью и пальцем
 const onDown=e=>{state.pointer.down=true;state.pointer.x=e.touches?e.touches[0].clientX:e.clientX;};
 const onMove=e=>{
  if(!state.pointer.down)return;
  const x=e.touches?e.touches[0].clientX:e.clientX;
  state.group.rotation.y+=(x-state.pointer.x)*.006;
  state.pointer.x=x;
 };
 const onUp=()=>state.pointer.down=false;
 box.addEventListener('pointerdown',onDown);
 window.addEventListener('pointermove',onMove);
 window.addEventListener('pointerup',onUp);

 // Сцена активна только когда видна — экономим ресурсы телефона
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>state.active=entry.isIntersecting);
 },{threshold:.08});
 observer.observe(box);
 scenes.push(state);
 return state;
}

function particles(count,color,size,spread){
 const geometry=new THREE.BufferGeometry();
 const positions=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  positions[i*3]=(Math.random()-.5)*spread;
  positions[i*3+1]=Math.random()*9;
  positions[i*3+2]=(Math.random()-.5)*spread;
 }
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.PointsMaterial({color,size,transparent:true,opacity:.75,depthWrite:false});
 return new THREE.Points(geometry,material);
}

function tree(color,scale){
 const group=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.6,7),new THREE.MeshLambertMaterial({color:0x6b4a2f}));
 trunk.position.y=.8;group.add(trunk);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.85,10,8),new THREE.MeshLambertMaterial({color}));
 crown.position.y=1.8;crown.scale.y=1.15;group.add(crown);
 group.scale.setScalar(scale||1);
 return group;
}

function runes(count,radius,color){
 const group=new THREE.Group();
 for(let i=0;i<count;i++){
  const rune=new THREE.Mesh(new THREE.PlaneGeometry(.5,.7),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.55,side:THREE.DoubleSide}));
  const angle=i/count*Math.PI*2;
  rune.position.set(Math.cos(angle)*radius,2+Math.sin(i)*1.2,Math.sin(angle)*radius);
  rune.lookAt(0,2,0);group.add(rune);
 }
 return group;
}

// Врата Академии
makeScene(document.querySelector('[data-scene="gates"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-1;s.group.add(ground);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(2.4,.28,10,36,Math.PI),new THREE.MeshLambertMaterial({color:0xd9a441}));
 arch.position.y=1.4;s.group.add(arch);
 [-2.4,2.4].forEach(x=>{
  const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,4,10),new THREE.MeshLambertMaterial({color:0xefe0c4}));
  pillar.position.set(x,1,0);s.group.add(pillar);
 });
 const portal=new THREE.Mesh(new THREE.CircleGeometry(2,32),new THREE.MeshBasicMaterial({color:0x8fc4d6,transparent:true,opacity:.35}));
 portal.position.set(0,1.5,0);s.group.add(portal);
 for(let i=0;i<8;i++){const t=tree(i%2?0x6f9a5d:0x84ad6b,.8+Math.random()*.5);t.position.set((Math.random()-.5)*16,0,(Math.random()-.5)*10-4);s.group.add(t);}
 s.group.add(particles(isMobile?70:140,0xffe9a8,.09,18));
 s.group.add(runes(8,4.5,0xb6a3d6));
});

// Башня трех подходов
makeScene(document.querySelector('[data-scene="tower"]'),s=>{
 const colors=[0x8fc4d6,0xd9a441,0x6f9a5d];
 for(let i=0;i<3;i++){
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.4-i*.35,2.7-i*.35,.9,18),new THREE.MeshLambertMaterial({color:colors[i]}));
  floor.position.y=i*1.05;s.group.add(floor);
 }
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,1.7,18),new THREE.MeshLambertMaterial({color:0xb6a3d6}));
 roof.position.y=3.6;s.group.add(roof);
 s.group.add(runes(10,3.6,0xffe9a8));
 s.group.add(particles(isMobile?50:100,0xfff0c0,.08,14));
});

// Лес факторов
makeScene(document.querySelector('[data-scene="forest"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(15,40),new THREE.MeshLambertMaterial({color:0xa8c389}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.6;s.group.add(ground);
 for(let i=0;i<14;i++){const t=tree(0x6f9a5d,.7+Math.random()*.7);t.position.set((Math.random()-.5)*20,0,(Math.random()-.5)*12-3);s.group.add(t);}
 s.group.add(particles(isMobile?60:120,0xffe680,.14,16));
 const mist=new THREE.Mesh(new THREE.SphereGeometry(10,16,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.08}));
 mist.position.y=2;s.group.add(mist);
});

// Мастерская креативного поля
makeScene(document.querySelector('[data-scene="field"]'),s=>{
 const table=new THREE.Mesh(new THREE.BoxGeometry(5,.3,3),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.5;s.group.add(table);
 for(let i=0;i<5;i++){
  const scroll=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.9,10),new THREE.MeshLambertMaterial({color:0xf6ecd8}));
  scroll.rotation.z=Math.PI/2;scroll.position.set(-1.6+i*.8,1,0);s.group.add(scroll);
 }
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.7),new THREE.MeshPhongMaterial({color:0x4fa3a5,transparent:true,opacity:.8,shininess:80}));
 crystal.position.set(0,2.2,0);s.group.add(crystal);s.crystal=crystal;
 s.group.add(particles(isMobile?50:100,0xffe9a8,.08,12));
});

// Сад идей
makeScene(document.querySelector('[data-scene="garden"]'),s=>{
 const ground=new THREE.Mesh(new THREE.CircleGeometry(13,36),new THREE.MeshLambertMaterial({color:0x9db97f}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.5;s.group.add(ground);
 for(let i=0;i<6;i++){
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,1.4,7),new THREE.MeshLambertMaterial({color:0x5d7f4a}));
  const flower=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshLambertMaterial({color:[0xd9a441,0xb6a3d6,0x8fc4d6,0x6f9a5d,0x4fa3a5,0xf2d789][i]}));
  const plant=new THREE.Group();stem.position.y=.7;flower.position.y=1.5;plant.add(stem,flower);
  const angle=i/6*Math.PI*2;plant.position.set(Math.cos(angle)*4,0,Math.sin(angle)*3);s.group.add(plant);
 }
 s.group.add(particles(isMobile?50:100,0xfff0c0,.09,14));
});

// Алтарь артефактов
makeScene(document.querySelector('[data-scene="altar"]'),s=>{
 const base=new THREE.Mesh(new THREE.CylinderGeometry(3,3.5,.8,24),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 base.position.y=-.4;s.group.add(base);
 for(let i=0;i<6;i++){
  const scroll=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1,10),new THREE.MeshLambertMaterial({color:0xf6ecd8}));
  const angle=i/6*Math.PI*2;scroll.position.set(Math.cos(angle)*2.2,.9,Math.sin(angle)*2.2);scroll.rotation.z=Math.PI/2;s.group.add(scroll);
 }
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.75,18,14),new THREE.MeshPhongMaterial({color:0xb6a3d6,transparent:true,opacity:.85,shininess:90}));
 orb.position.y=2;s.group.add(orb);s.orb=orb;
 s.group.add(runes(9,4,0xffe9a8));
});

// Зал наблюдателя
makeScene(document.querySelector('[data-scene="observer"]'),s=>{
 const floor=new THREE.Mesh(new THREE.BoxGeometry(12,.3,8),new THREE.MeshLambertMaterial({color:0xefe0c4}));
 floor.position.y=-.4;s.group.add(floor);
 for(let i=0;i<4;i++){
  const desk=new THREE.Mesh(new THREE.BoxGeometry(1.5,.8,.8),new THREE.MeshLambertMaterial({color:0x8a623c}));
  desk.position.set(-3+i*2,.2,0);s.group.add(desk);
 }
 const board=new THREE.Mesh(new THREE.PlaneGeometry(4,2.2),new THREE.MeshLambertMaterial({color:0x6f9a5d}));
 board.position.set(0,2.4,-3);s.group.add(board);
 s.group.add(particles(isMobile?40:80,0xffe9a8,.08,12));
});

// Зал Совета
makeScene(document.querySelector('[data-scene="charter"]'),s=>{
 const table=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.7,.35,24),new THREE.MeshLambertMaterial({color:0x8a623c}));
 table.position.y=.4;s.group.add(table);
 const charter=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.7),new THREE.MeshLambertMaterial({color:0xf6ecd8,side:THREE.DoubleSide}));
 charter.position.y=1.4;charter.rotation.x=-.4;s.group.add(charter);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,.08,8,48),new THREE.MeshBasicMaterial({color:0xd9a441,transparent:true,opacity:.7}));
 ring.rotation.x=Math.PI/2;ring.position.y=.7;s.group.add(ring);s.ring=ring;
 s.group.add(particles(isMobile?50:100,0xffe9a8,.09,14));
});

function animate(){
 requestAnimationFrame(animate);
 const time=performance.now()*.001;
 scenes.forEach(s=>{
  if(!s.active)return;
  s.group.rotation.y+=.0016;
  s.group.children.forEach(child=>{
   if(child.isPoints){child.rotation.y-=.0012;child.position.y=Math.sin(time*.6)*.15;}
  });
  if(s.crystal)s.crystal.rotation.y+=.012;
  if(s.orb)s.orb.rotation.y+=.01;
  if(s.ring)s.ring.rotation.z+=.008;
  s.renderer.render(s.scene,s.camera);
 });
}
animate();

window.addEventListener('resize',()=>{
 scenes.forEach(s=>{
  const width=s.box.clientWidth,height=s.box.clientHeight;
  if(!width||!height)return;
  s.camera.aspect=width/height;s.camera.updateProjectionMatrix();s.renderer.setSize(width,height);
 });
});
})();