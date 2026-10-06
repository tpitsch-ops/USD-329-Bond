import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const stage = document.querySelector('#model-stage');
const canvas = document.querySelector('#cte-canvas');
const loading = document.querySelector('#model-loading');

if (!stage || !canvas) throw new Error('3D model stage is missing.');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8e6f0);
scene.fog = new THREE.Fog(0xd8e6f0, 35, 70);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(18, 14, -24);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 9;
controls.maxDistance = 52;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 2, 0.5);

scene.add(new THREE.HemisphereLight(0xe9f4ff, 0x7e806f, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(-10, 24, -12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -28; sun.shadow.camera.right = 28; sun.shadow.camera.top = 28; sun.shadow.camera.bottom = -28;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(70, 70),
  new THREE.MeshStandardMaterial({ color: 0x789169, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const asphalt = new THREE.Mesh(
  new THREE.PlaneGeometry(48, 18),
  new THREE.MeshStandardMaterial({ color: 0x727b80, roughness: 1 })
);
asphalt.rotation.x = -Math.PI / 2;
asphalt.position.set(-2, 0.012, -12);
asphalt.receiveShadow = true;
scene.add(asphalt);

const concreteMat = new THREE.MeshStandardMaterial({ color: 0xdad9d3, roughness: 1 });
function slab(w,d,x,z,y=0.035){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,0.07,d), concreteMat);
  mesh.position.set(x,y,z); mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
slab(2.2, 12, 3.25, -6.1);
slab(26, 1.4, 1.0, -0.9);

const stone = new THREE.MeshStandardMaterial({ color: 0xc7b992, roughness: 0.96 });
const stoneDark = new THREE.MeshStandardMaterial({ color: 0xa99978, roughness: 1 });
const roofRed = new THREE.MeshStandardMaterial({ color: 0x75372f, roughness: 0.86 });
const glass = new THREE.MeshStandardMaterial({ color: 0x1d3443, roughness: 0.25, metalness: 0.1 });
const black = new THREE.MeshStandardMaterial({ color: 0x18232c, roughness: 0.75 });
const school = new THREE.Group();
scene.add(school);

function box(w,h,d,mat,x,y,z,parent=scene){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

// Clean, continuous high-school massing. No stray left-side extrusion.
box(12.2,4.9,4.0,stone,3.35,2.48,1.1,school);
// Roof correction: extend the existing roof over the full right-side building mass.
box(13.85,.56,4.45,roofRed,3.92,5.18,1.1,school);
box(13.55,.26,4.30,roofRed,3.82,4.82,1.1,school);

// Central entrance tower and architectural details.
box(2.15,5.35,.48,stoneDark,3.35,2.72,-1.14,school);
const gable = new THREE.Mesh(new THREE.ConeGeometry(1.25,.9,4),stoneDark);
gable.rotation.y = Math.PI/4;
gable.scale.z = .42;
gable.position.set(3.35,5.55,-1.12);
gable.castShadow = true; school.add(gable);
box(1.0,1.55,.18,glass,3.35,1.45,-1.42,school);
box(1.25,.18,.55,concreteMat,3.35,.55,-1.54,school);
box(1.55,.18,.72,concreteMat,3.35,.37,-1.75,school);
box(1.85,.18,.92,concreteMat,3.35,.19,-1.96,school);

// Front windows: aligned across the true school façade with no beige block on the left.
const windowXs = [-1.45,0.2,1.7,5.0,6.5,8.15];
const windowYs = [1.15,2.55,3.95];
for (const x of windowXs) {
  for (const y of windowYs) box(1.05,.82,.12,glass,x,y,-.96,school);
}
box(.95,.9,.12,glass,3.35,4.0,-1.42,school);

// Side windows on west end.
for (const y of windowYs) box(.12,.78,.92,glass,-2.77,y,.2,school);

// CTE building — substantial attached facility extending across the high-school elevation.
// The conceptual vision is the primary reference for CTE scale and proportion.
const cte = new THREE.Group();
scene.add(cte);
const redMetal = new THREE.MeshStandardMaterial({ color: 0xb41f2d, roughness: .76, metalness: .18 });
const redMetalCut = redMetal.clone(); redMetalCut.transparent = true; redMetalCut.opacity = .30; redMetalCut.depthWrite = false;
const cteRoofMat = new THREE.MeshStandardMaterial({ color: 0x7a252b, roughness: .80, metalness: .12 });
const cteWidth = 11.4;
const cteDepth = 4.2;
const cteX = 3.15;
const cteZ = -3.0;
const cteFloor = box(cteWidth,.18,cteDepth,new THREE.MeshStandardMaterial({color:0xc4c5c2,roughness:1}),cteX,.1,cteZ,cte);
const wallNorth = box(cteWidth,3.15,.18,redMetal,cteX,1.67,-5.01,cte);
const wallSouth = box(cteWidth,3.15,.18,redMetal,cteX,1.67,-.99,cte);
const wallWest = box(.18,3.15,cteDepth,redMetal,-2.46,1.67,cteZ,cte);
const wallEast = box(.18,3.15,cteDepth,redMetal,8.76,1.67,cteZ,cte);
const cteRoof = box(11.65,.3,4.45,cteRoofMat,cteX,3.37,cteZ,cte);

// Large overhead door and glazed instructional/entry openings on the public-facing elevation.
const doorMat = new THREE.MeshStandardMaterial({ color:0xe7e7df,roughness:.65,metalness:.08 });
box(2.75,2.25,.14,doorMat,-.65,1.2,-5.13,cte);
for (let i=0;i<5;i++) box(2.58,.025,.16,black,-.65,.45+i*.42,-5.22,cte);
box(1.05,1.95,.13,glass,6.95,1.05,-5.13,cte);
box(1.65,.92,.13,glass,5.25,1.85,-5.13,cte);
box(1.65,.92,.13,glass,3.25,1.85,-5.13,cte);
box(1.65,.92,.13,glass,1.25,1.85,-5.13,cte);

function labelTexture(text, fg='#ffffff', bg='#0b2f57'){
  const c=document.createElement('canvas'); c.width=1024; c.height=180;
  const ctx=c.getContext('2d'); ctx.fillStyle=bg; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle=fg; ctx.font='900 62px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,c.width/2,c.height/2);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}
const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.1,.82),new THREE.MeshBasicMaterial({map:labelTexture('WABAUNSEE CHARGERS • CTE'),transparent:false}));
sign.position.set(3.25,2.72,-5.115); cte.add(sign);

// Interior program layout.
const interior = new THREE.Group(); scene.add(interior); interior.visible = false;
const labColors = [0x6f7d8a,0x3e7196,0x8a735c,0x775a86];
const labs = [
  {name:'WELDING / CONSTRUCTION AG',x:-.35,z:-3.95,w:4.0,d:1.65,c:labColors[0]},
  {name:'PLUMBING',x:-.35,z:-2.10,w:4.0,d:1.55,c:labColors[2]},
  {name:'DIGITAL ARTS / SCREEN PRINT / AUTOCAD',x:5.55,z:-3.95,w:4.25,d:1.65,c:labColors[3]},
  {name:'ELECTRICAL',x:5.55,z:-2.10,w:4.25,d:1.55,c:labColors[1]}
];
for (const lab of labs){
  box(lab.w,.08,lab.d,new THREE.MeshStandardMaterial({color:lab.c,roughness:1}),lab.x,.22,lab.z,interior);
  const mat = new THREE.SpriteMaterial({ map: labelTexture(lab.name,'#ffffff','#17324f'), transparent:true });
  const sprite = new THREE.Sprite(mat); sprite.scale.set(Math.min(lab.w*0.82,3.7),.48,1); sprite.position.set(lab.x,1.05,lab.z); interior.add(sprite);
}
// Partition walls and a clear central circulation spine.
const partition = new THREE.MeshStandardMaterial({color:0xe4e0d6,roughness:1,transparent:true,opacity:.88});
box(.10,1.65,3.65,partition,2.55,1.05,-3.0,interior);
box(10.55,1.65,.10,partition,3.15,1.05,-3.02,interior);
box(.85,.06,3.55,new THREE.MeshStandardMaterial({color:0xd9c64a,roughness:1}),2.55,.28,-3.0,interior);

// Direct WHS-to-CTE connection at the existing high-school elevation.
box(1.20,1.92,.055,glass,3.35,1.04,-.915,scene);

// Light parking stripes.
const stripeMat = new THREE.MeshBasicMaterial({color:0xf4f4ef});
for(let i=0;i<10;i++){
  const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.09,2.5),stripeMat);
  stripe.rotation.x=-Math.PI/2; stripe.position.set(-12+i*1.7,.025,-12); scene.add(stripe);
}

function setInteriorMode(on){
  interior.visible = on;
  cteRoof.visible = !on;
  wallNorth.visible = !on;
  [wallSouth,wallWest,wallEast].forEach(w=>{w.material=on?redMetalCut:redMetal;});
  document.querySelector('#model-mode-label').textContent = on ? 'Interior cutaway concept' : 'Exterior concept';
  document.querySelectorAll('.mode-button').forEach(btn=>{
    const active = btn.dataset.mode === (on?'interior':'exterior');
    btn.classList.toggle('active',active); btn.setAttribute('aria-pressed',String(active));
  });
}

document.querySelectorAll('.mode-button').forEach(btn=>btn.addEventListener('click',()=>setInteriorMode(btn.dataset.mode==='interior')));

const views = {
  front:{p:[3.1,8.2,-28],t:[3.1,2.1,-1.8]},
  north:{p:[-2.5,7.8,-25],t:[2.5,2.0,-2.0]},
  west:{p:[18,7.5,-16],t:[2.6,2.0,-1.4]},
  south:{p:[3.0,8.2,20],t:[3.2,2.0,-1.2]},
  campus:{p:[20,17,-29],t:[2.6,1.8,-1.5]},
  approach:{p:[7.2,4.2,-15],t:[4.2,1.8,-3.1]},
  reset:{p:[19,14,-27],t:[2.5,2,-1.2]}
};
function applyView(name){
  const view=views[name]||views.reset;
  camera.position.set(...view.p); controls.target.set(...view.t); controls.update();
}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>applyView(btn.dataset.view)));
document.querySelectorAll('[data-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  camera.position.addScaledVector(dir,btn.dataset.zoom==='in'?2.5:-2.5); controls.update();
}));

function resize(){
  const rect=stage.getBoundingClientRect();
  const w=Math.max(320,Math.floor(rect.width)); const h=Math.max(360,Math.floor(rect.height));
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
const ro=new ResizeObserver(resize); ro.observe(stage); resize();

stage.classList.add('model-ready');
if (loading) loading.textContent='';
let modelVisible = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { modelVisible = entries[0]?.isIntersecting ?? true; }, {rootMargin:'240px'}).observe(stage);
}
renderer.setAnimationLoop(()=>{ if (!modelVisible) return; controls.update(); renderer.render(scene,camera); });