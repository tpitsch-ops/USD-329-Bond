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

function textureCanvas(w,h,draw,repeatX=1,repeatY=1){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const ctx=c.getContext('2d'); draw(ctx,w,h);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(repeatX,repeatY);
  return t;
}
const stoneTexture=textureCanvas(512,512,(ctx,w,h)=>{
  ctx.fillStyle='#c7b992';ctx.fillRect(0,0,w,h);
  let y=0,row=0;
  while(y<h){
    const rh=44+(row%3)*8; let x=-(row%2)*35;
    while(x<w){
      const sw=58+((x+y+row*17)%52);
      ctx.fillStyle=['#c9bc98','#b7aa86','#d2c5a5','#aa9c79'][(row+Math.floor(x/50)+8)%4];
      ctx.fillRect(x+3,y+3,sw-6,rh-6);
      ctx.strokeStyle='rgba(238,231,213,.92)';ctx.lineWidth=4;ctx.strokeRect(x+2,y+2,sw-4,rh-4);
      x+=sw;
    }
    y+=rh;row++;
  }
},3.2,2.0);
const stoneDarkTexture=stoneTexture.clone(); stoneDarkTexture.repeat.set(2.2,2.6);
const roofTexture=textureCanvas(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#7a3a32';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=16){ctx.fillStyle=y%32===0?'#8a4338':'#6e302b';ctx.fillRect(0,y,w,9);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(0,y,w,2);}
},4,2);
const redMetalTexture=textureCanvas(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#b41f2d';ctx.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=18){ctx.fillStyle='rgba(78,0,9,.22)';ctx.fillRect(x,0,3,h);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(x+4,0,2,h);}
},4.2,1.25);
const stone = new THREE.MeshStandardMaterial({ map:stoneTexture, color:0xffffff, roughness:0.94 });
const stoneDark = new THREE.MeshStandardMaterial({ map:stoneDarkTexture, color:0xb4a583, roughness:0.98 });
const roofRed = new THREE.MeshStandardMaterial({ map:roofTexture, color:0xffffff, roughness:0.84 });
const glass = new THREE.MeshStandardMaterial({ color: 0x183747, roughness: 0.18, metalness: 0.12 });
const black = new THREE.MeshStandardMaterial({ color: 0x17222b, roughness: 0.68 });
const school = new THREE.Group();
scene.add(school);

function box(w,h,d,mat,x,y,z,parent=scene){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

// Clean, continuous high-school massing. No stray left-side extrusion.
box(12.2,4.9,4.0,stone,3.35,2.48,1.1,school);
box(12.65,.56,4.35,roofRed,3.35,5.18,1.1,school);
box(12.35,.26,4.15,roofRed,3.35,4.82,1.1,school);

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
  for (const y of windowYs) {
    box(1.05,.82,.12,glass,x,y,-.96,school);
    box(.045,.82,.145,black,x,y,-1.03,school);
    box(1.05,.045,.145,black,x,y,-1.03,school);
    box(.055,.92,.15,black,x-.55,y,-1.03,school);
    box(.055,.92,.15,black,x+.55,y,-1.03,school);
  }
}
box(.95,.9,.12,glass,3.35,4.0,-1.42,school);
box(.045,.9,.145,black,3.35,4.0,-1.49,school);
box(.95,.045,.145,black,3.35,4.0,-1.49,school);

// Side windows on west end with mullions.
for (const y of windowYs) {
  box(.12,.78,.92,glass,-2.77,y,.2,school);
  box(.145,.045,.92,black,-2.84,y,.2,school);
  box(.145,.78,.045,black,-2.84,y,.2,school);
}

// Historic entry trim and exterior stair rails.
box(.12,2.15,.18,stoneDark,2.72,1.85,-1.45,school);
box(.12,2.15,.18,stoneDark,3.98,1.85,-1.45,school);
for (const sx of [2.58,4.12]) {
  for (const sy of [.56,.92,1.28]) box(.06,.55,.06,black,sx,sy,-1.78,school);
  const rail=box(.06,.06,1.28,black,sx,1.12,-1.72,school); rail.rotation.x=-.36;
}
// Explicit stone treatment on the exposed west-side wall above the CTE junction.
box(.13,1.55,4.02,stone,-2.80,4.08,1.1,school);

// CTE building — attached directly to the west side of WHS.
// Controlled rebuild from the last clean model: preserve the approved WHS silhouette
// and align the CTE north/south ends with the existing high-school footprint.
const cte = new THREE.Group();
scene.add(cte);
const redMetal = new THREE.MeshStandardMaterial({ map:redMetalTexture, color:0xffffff, roughness:.76, metalness:.16 });
const redMetalCut = redMetal.clone(); redMetalCut.transparent = true; redMetalCut.opacity = .28; redMetalCut.depthWrite = false;
const cteRoofMat = new THREE.MeshStandardMaterial({ color: 0x5d2528, roughness: .8, metalness: .12 });
const cteDepth = 4.0;
const cteZ = 1.1;
const cteFloor = box(6.7,.18,cteDepth,new THREE.MeshStandardMaterial({color:0xc4c5c2,roughness:1}),-6.1,.1,cteZ,cte);
const wallNorth = box(7.4,3.15,.18,redMetal,-6.45,1.67,-0.81,cte);
const wallSouth = box(7.4,3.15,.18,redMetal,-6.45,1.67,3.01,cte);
const wallWest = box(.18,3.15,cteDepth,redMetal,-9.36,1.67,cteZ,cte);
const wallEast = box(.18,3.15,cteDepth,redMetal,-2.84,1.67,cteZ,cte);
const cteRoof = box(6.95,.3,4.25,cteRoofMat,-6.1,3.37,cteZ,cte);

// Overhead doors stay centered on the aligned north and south faces.
const doorMat = new THREE.MeshStandardMaterial({ color:0xe7e7df,roughness:.65,metalness:.08 });
box(2.4,2.25,.14,doorMat,-7.25,1.2,-0.93,cte);
box(2.4,2.25,.14,doorMat,-7.25,1.2,3.13,cte);
for (let i=0;i<5;i++){
  box(2.25,.025,.16,black,-7.25,.45+i*.42,-1.02,cte);
  box(2.25,.025,.16,black,-7.25,.45+i*.42,3.22,cte);
}
// Personnel door and windows toward the school connection.
box(.9,1.9,.13,glass,-3.9,1.05,-0.93,cte);
box(1.4,.8,.13,glass,-5.0,1.8,-0.93,cte);

function labelTexture(text, fg='#ffffff', bg='#0b2f57'){
  const c=document.createElement('canvas'); c.width=1024; c.height=180;
  const ctx=c.getContext('2d'); ctx.fillStyle=bg; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle=fg; ctx.font='900 62px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,c.width/2,c.height/2);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}
const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.7,.82),new THREE.MeshBasicMaterial({map:labelTexture('WABAUNSEE CHARGERS • CTE'),transparent:false,side:THREE.DoubleSide}));
sign.position.set(-6.45,2.72,-0.915); cte.add(sign);

// Interior program layout.
const interior = new THREE.Group(); scene.add(interior); interior.visible = false;
const labColors = [0x6f7d8a,0x3e7196,0x8a735c,0x775a86];
const labs = [
  {name:'WELDING / CONSTRUCTION AG',x:-7.72,z:0.05,w:3.0,d:1.5,c:labColors[0]},
  {name:'ELECTRICAL',x:-4.5,z:0.05,w:3.0,d:1.5,c:labColors[1]},
  {name:'PLUMBING',x:-7.72,z:2.15,w:3.0,d:1.5,c:labColors[2]},
  {name:'DIGITAL ARTS / SCREEN PRINT / AUTOCAD',x:-4.5,z:2.15,w:3.0,d:1.5,c:labColors[3]}
];
for (const lab of labs){
  box(lab.w,.08,lab.d,new THREE.MeshStandardMaterial({color:lab.c,roughness:1}),lab.x,.22,lab.z,interior);
  const mat = new THREE.SpriteMaterial({ map: labelTexture(lab.name,'#ffffff','#17324f'), transparent:true });
  const sprite = new THREE.Sprite(mat); sprite.scale.set(2.75,.48,1); sprite.position.set(lab.x,1.05,lab.z); interior.add(sprite);
}
// Partition walls and central circulation.
const partition = new THREE.MeshStandardMaterial({color:0xe4e0d6,roughness:1,transparent:true,opacity:.88});
box(.10,1.65,3.35,partition,-6.12,1.05,1.1,interior);
box(6.0,1.65,.10,partition,-6.1,1.05,1.1,interior);
box(.8,.06,3.55,new THREE.MeshStandardMaterial({color:0xd9c64a,roughness:1}),-6.1,.28,1.1,interior);

// Direct WHS-to-CTE connection.
// The two building masses already meet at the west wall of WHS, so do not add a
// separate tan connector volume here. The earlier connector box projected beyond
// the clean WHS facade and read as an unintended beige extension. A thin, flush
// glazed doorway marks the connection without changing the school silhouette.
box(.055,1.92,1.0,glass,-2.745,1.04,1.1,scene);
box(.10,2.18,.12,stoneDark,-2.80,1.15,.55,scene);
box(.10,2.18,.12,stoneDark,-2.80,1.15,1.65,scene);
box(.38,.16,1.45,black,-2.98,2.18,1.1,scene);

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
  front:{p:[1.5,8,-23],t:[-.7,2,1]},
  north:{p:[-1.5,7,-21],t:[-1.2,2,1]},
  west:{p:[18,7,-12],t:[2.3,2,.8]},
  south:{p:[-6,7,20],t:[-5.6,1.6,1.4]},
  campus:{p:[18,16,-25],t:[-1.3,1.8,1.2]},
  approach:{p:[3.4,3.8,-13],t:[3.35,1.8,-.5]},
  reset:{p:[18,14,-24],t:[0,2,.5]}
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
renderer.setAnimationLoop(()=>{ controls.update(); renderer.render(scene,camera); });