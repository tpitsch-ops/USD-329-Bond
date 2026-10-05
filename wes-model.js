import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('#wes-model-stage');
const canvas = document.querySelector('#wes-canvas');
const loading = document.querySelector('#wes-model-loading');
if (!stage || !canvas) throw new Error('WES 3D model stage is missing.');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbe8f1);
scene.fog = new THREE.Fog(0xdbe8f1, 38, 78);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
camera.position.set(18, 12, -23);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 52;
controls.maxPolarAngle = Math.PI / 2.04;
controls.target.set(0, 1.7, 0);

scene.add(new THREE.HemisphereLight(0xeef7ff, 0x74806e, 1.65));
const sun = new THREE.DirectionalLight(0xffffff, 2.25);
sun.position.set(-12, 22, -13);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(72,72),
  new THREE.MeshStandardMaterial({color:0x7d9472,roughness:1})
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

function box(w,h,d,mat,x,y,z,parent=scene){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function slab(w,d,x,z,color=0xd7d7d2){
  return box(w,.08,d,new THREE.MeshStandardMaterial({color,roughness:1}),x,.04,z);
}
function labelTexture(text,bg='#0b2f57',fg='#ffffff'){
  const c=document.createElement('canvas'); c.width=1024; c.height=180;
  const ctx=c.getContext('2d'); ctx.fillStyle=bg; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle=fg; ctx.font='900 60px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text,c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
function spriteLabel(text,x,y,z,scale=2.4,bg='#0b2f57'){
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(text,bg),transparent:true}));
  s.scale.set(scale,.42,1); s.position.set(x,y,z); scene.add(s); return s;
}

const stone = new THREE.MeshStandardMaterial({color:0xc8b995,roughness:.98});
const brick = new THREE.MeshStandardMaterial({color:0xb88b68,roughness:.96});
const roof = new THREE.MeshStandardMaterial({color:0x6f3533,roughness:.88});
const glass = new THREE.MeshStandardMaterial({color:0x27495e,roughness:.22,metalness:.08,transparent:true,opacity:.88});
const navy = new THREE.MeshStandardMaterial({color:0x0b2f57,roughness:.75});
const red = new THREE.MeshStandardMaterial({color:0xcb2533,roughness:.72});
const door = new THREE.MeshStandardMaterial({color:0x243b4d,roughness:.65});
const concrete = new THREE.MeshStandardMaterial({color:0xdeddd8,roughness:1});

slab(34,3.2,0,-7.4,0x70787d);
slab(3.0,13.0,0,-1.5);
slab(20,1.4,0,3.5);

const school = new THREE.Group(); scene.add(school);
const annex = new THREE.Group(); scene.add(annex);

// Conceptual WES massing on the left.
box(12.4,4.2,7.4,stone,-8.4,2.12,0,school);
box(12.8,.48,7.8,roof,-8.4,4.42,0,school);
box(2.3,4.8,1.05,brick,-2.65,2.4,-2.8,school);
for(const x of [-12.2,-10.2,-8.2,-6.2]){
  box(1.25,1.05,.12,glass,x,2.0,-3.76,school);
}
box(1.25,2.05,.13,door,-3.55,1.1,-3.78,school);
spriteLabel('WES',-8.4,3.55,-3.86,2.3);

// Conceptual Annex massing on the right.
box(10.4,3.7,6.5,brick,8.1,1.87,.25,annex);
box(10.8,.42,6.9,roof,8.1,3.95,.25,annex);
for(const x of [5.0,7.0,9.0,11.0]){
  box(1.15,.95,.12,glass,x,1.85,-3.06,annex);
}
box(1.15,1.95,.13,door,3.25,1.05,-3.08,annex);
spriteLabel('ANNEX',8.1,3.2,-3.18,2.8);

// Existing/current condition: open-air separation and simple path.
const currentGroup = new THREE.Group(); scene.add(currentGroup);
slab(5.8,2.2,0,-3.0);
const currentPath = box(.95,.035,4.8,new THREE.MeshStandardMaterial({color:0xe6cf58,roughness:1}),0,.09,-3.0,currentGroup);
const currentLabel = spriteLabel('CURRENT: OPEN-AIR GAP',0,1.0,-4.2,3.4,'#607185');
currentGroup.add(currentLabel);

// Proposed secure connection.
const proposed = new THREE.Group(); scene.add(proposed);
const floor = box(5.8,.16,4.8,concrete,0,.12,-.15,proposed);
const leftWall = box(.18,3.15,4.8,brick,-2.82,1.66,-.15,proposed);
const rightWall = box(.18,3.15,4.8,brick,2.82,1.66,-.15,proposed);
const frontGlass = box(5.7,2.75,.16,glass,0,1.55,-2.48,proposed);
const rearGlass = box(5.7,2.75,.16,glass,0,1.55,2.18,proposed);
const roofMesh = box(5.95,.28,5.05,roof,0,3.25,-.15,proposed);
box(1.25,2.15,.13,door,0,1.15,-2.58,proposed);
box(1.1,.25,.16,red,0,2.55,-2.59,proposed);

const chargerSign = new THREE.Mesh(
  new THREE.PlaneGeometry(3.8,.72),
  new THREE.MeshBasicMaterial({map:labelTexture('WABAUNSEE CHARGERS','#0b2f57'),transparent:false})
);
chargerSign.position.set(0,2.72,-2.66); proposed.add(chargerSign);

// Interior security-flow elements.
const interior = new THREE.Group(); scene.add(interior);
const partition = new THREE.MeshStandardMaterial({color:0xe8e5dd,roughness:1,transparent:true,opacity:.92});
box(.10,2.2,2.0,partition,-.95,1.18,-.65,interior);
box(1.9,2.2,.10,partition,-1.85,1.18,.35,interior);
box(1.25,.95,.12,glass,-1.82,1.65,-.70,interior); // office/check-in glazing
box(1.25,.82,.48,navy,-1.82,.55,-.4,interior); // reception counter
box(1.0,2.05,.13,door,1.45,1.1,1.95,interior); // controlled interior door
box(.72,.045,3.8,new THREE.MeshStandardMaterial({color:0xf1cd47,roughness:1}),0,.24,-.25,interior);
const checkIn = spriteLabel('OFFICE CHECK-IN',-1.8,1.25,.7,2.6,'#cb2533');
const controlled = spriteLabel('CONTROLLED DOOR',1.45,1.35,1.6,2.5,'#0b2f57');
const vestibule = spriteLabel('SECURE VESTIBULE',0,2.25,-1.45,2.8,'#0b2f57');
interior.add(checkIn,controlled,vestibule);

let condition = 'proposed';
let mode = 'exterior';

function refresh(){
  const isProposed = condition === 'proposed';
  proposed.visible = isProposed;
  currentGroup.visible = !isProposed;
  const cutaway = isProposed && mode === 'interior';
  interior.visible = cutaway;
  roofMesh.visible = !cutaway;
  frontGlass.material.opacity = cutaway ? .23 : .88;
  rearGlass.material.opacity = cutaway ? .23 : .88;
  document.querySelector('#wes-model-label').textContent =
    !isProposed ? 'Current condition concept' :
    cutaway ? 'Proposed secure-entry interior cutaway' : 'Proposed secure-entry exterior';

  document.querySelectorAll('.wes-state-button').forEach(btn=>{
    const active=btn.dataset.wesState===condition;
    btn.classList.toggle('active',active); btn.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('.wes-mode-button').forEach(btn=>{
    const active=btn.dataset.wesMode===mode;
    btn.classList.toggle('active',active); btn.setAttribute('aria-pressed',String(active));
  });
}

document.querySelectorAll('.wes-state-button').forEach(btn=>btn.addEventListener('click',()=>{
  condition=btn.dataset.wesState;
  if(condition==='current') mode='exterior';
  refresh();
}));
document.querySelectorAll('.wes-mode-button').forEach(btn=>btn.addEventListener('click',()=>{
  mode=btn.dataset.wesMode;
  if(mode==='interior') condition='proposed';
  refresh();
}));

const views = {
  front:{p:[17,9,-24],t:[0,1.7,-.4]},
  approach:{p:[2.5,4.2,-14],t:[0,1.5,-1.2]},
  overhead:{p:[16,22,-15],t:[0,1,0]},
  interior:{p:[8.5,6.3,-9],t:[0,1.3,-.1]},
  reset:{p:[18,12,-23],t:[0,1.7,0]}
};
function applyView(name){
  if(name==='interior'){condition='proposed';mode='interior';refresh();}
  const v=views[name]||views.reset;
  camera.position.set(...v.p); controls.target.set(...v.t); controls.update();
}
document.querySelectorAll('[data-wes-view]').forEach(btn=>btn.addEventListener('click',()=>applyView(btn.dataset.wesView)));
document.querySelectorAll('[data-wes-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  camera.position.addScaledVector(dir,btn.dataset.wesZoom==='in'?2.5:-2.5); controls.update();
}));

function resize(){
  const rect=stage.getBoundingClientRect();
  const w=Math.max(320,Math.floor(rect.width));
  const h=Math.max(360,Math.floor(rect.height));
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize(); refresh();
stage.classList.add('model-ready');
if(loading) loading.textContent='';
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
