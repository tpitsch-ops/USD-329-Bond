import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const stage=document.querySelector('#elementary-model-stage');
const canvas=document.querySelector('#elementary-canvas');
const loading=document.querySelector('#elementary-model-loading');
if(!stage||!canvas) throw new Error('Elementary 3D model stage is missing.');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xdbe8f1);
scene.fog=new THREE.Fog(0xdbe8f1,32,68);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);
camera.position.set(14,10,-20);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.minDistance=8;
controls.maxDistance=42;
controls.maxPolarAngle=Math.PI/2.05;
controls.target.set(0,1.6,.3);

scene.add(new THREE.HemisphereLight(0xeaf5ff,0x7d806f,1.7));
const sun=new THREE.DirectionalLight(0xffffff,2.3);
sun.position.set(-10,22,-12);
sun.castShadow=true;
sun.shadow.mapSize.set(1536,1536);
scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(55,55),new THREE.MeshStandardMaterial({color:0x789169,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

function box(w,h,d,mat,x,y,z,parent=scene){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
const brick=new THREE.MeshStandardMaterial({color:0xb88a6f,roughness:.95});
const brickDark=new THREE.MeshStandardMaterial({color:0x8d6757,roughness:.98});
const roof=new THREE.MeshStandardMaterial({color:0x5f6770,roughness:.9});
const red=new THREE.MeshStandardMaterial({color:0xb41f2d,roughness:.77,metalness:.12});
const navy=new THREE.MeshStandardMaterial({color:0x0b2f57,roughness:.8});
const glass=new THREE.MeshStandardMaterial({color:0x23475a,roughness:.22,metalness:.08,transparent:true,opacity:.86});
const concrete=new THREE.MeshStandardMaterial({color:0xd5d3cb,roughness:1});
const frame=new THREE.MeshStandardMaterial({color:0x263746,roughness:.72});
const campus=new THREE.Group();scene.add(campus);

// Existing elementary massing and permanent Annex.
box(8.8,3.5,4.4,brick,-4.7,1.78,.7,campus);
box(9.1,.42,4.7,roof,-4.7,3.7,.7,campus);
box(6.0,3.1,4.0,brickDark,6.1,1.58,.9,campus);
box(6.25,.38,4.25,roof,6.1,3.3,.9,campus);

// Enclosed connection and secure visitor entry.
box(4.85,2.65,2.45,glass,.55,1.35,.25,campus);
box(5.15,.3,2.7,red,.55,2.78,.25,campus);
box(2.3,2.85,2.9,brick,.25,1.45,-2.35,campus);
box(2.55,.32,3.15,red,.25,3.0,-2.35,campus);
box(1.25,2.12,.12,glass,.25,1.12,-3.86,campus);
box(2.15,.28,.85,navy,.25,2.38,-3.92,campus);

// Office/reception and visitor-management zone visible through the connector.
box(1.35,1.25,.08,frame,-.75,1.0,-.55,campus);
box(1.35,.72,.08,glass,1.55,1.12,-.55,campus);
box(1.55,.75,.65,concrete,1.55,.48,-.25,campus);

// Windows along existing buildings.
for(const x of [-7.3,-5.2,-3.1,-1.2]){box(1.1,.9,.12,glass,x,1.65,-1.53,campus);box(1.1,.75,.12,glass,x,2.75,-1.53,campus);}
for(const x of [4.3,6.1,7.8]) box(1.05,.85,.12,glass,x,1.7,-1.15,campus);

// Walk and controlled approach.
box(3.0,.08,8.5,concrete,.25,.045,-7.0,campus);
box(12,.07,1.2,concrete,.0,.04,-3.65,campus);

// Simple Charger identity sign.
function signTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=190;
  const x=c.getContext('2d');x.fillStyle='#0b2f57';x.fillRect(0,0,c.width,c.height);
  x.fillStyle='#fff';x.font='900 58px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText('WABAUNSEE ELEMENTARY • CHARGERS',c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.5,.82),new THREE.MeshBasicMaterial({map:signTexture()}));
sign.position.set(-4.65,2.65,-1.57);campus.add(sign);

const views={
  entry:{p:[.3,5.1,-16],t:[.25,1.55,-1.2]},
  connection:{p:[-10,6,-9],t:[.2,1.5,.2]},
  campus:{p:[17,12,-22],t:[.4,1.5,.2]},
  side:{p:[17,6,-3],t:[1.0,1.5,.3]},
  reset:{p:[14,10,-20],t:[0,1.6,.3]}
};
function applyView(name){const v=views[name]||views.reset;camera.position.set(...v.p);controls.target.set(...v.t);controls.update();}
document.querySelectorAll('[data-elementary-view]').forEach(btn=>btn.addEventListener('click',()=>applyView(btn.dataset.elementaryView)));
document.querySelectorAll('[data-elementary-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);
  camera.position.addScaledVector(dir,btn.dataset.elementaryZoom==='in'?2.4:-2.4);controls.update();
}));

function resize(){
  const rect=stage.getBoundingClientRect();
  const w=Math.max(320,Math.floor(rect.width));const h=Math.max(360,Math.floor(rect.height));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);resize();
stage.classList.add('model-ready');
if(loading) loading.textContent='';

let visible=true;
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{rootMargin:'240px'}).observe(stage);
}
renderer.setAnimationLoop(()=>{if(!visible)return;controls.update();renderer.render(scene,camera);});
