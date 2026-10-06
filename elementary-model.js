import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const stage=document.querySelector('#elementary-model-stage');
const canvas=document.querySelector('#elementary-canvas');
const loading=document.querySelector('#elementary-model-loading');
if(!stage||!canvas) throw new Error('Elementary 3D model stage is missing.');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xcfe2f2);
scene.fog=new THREE.Fog(0xcfe2f2,34,76);

const camera=new THREE.PerspectiveCamera(42,1,.1,110);
camera.position.set(1.0,5.8,-18.5);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.06;
controls.minDistance=8; controls.maxDistance=46; controls.maxPolarAngle=Math.PI/2.05;
controls.target.set(.8,1.55,.1);

scene.add(new THREE.HemisphereLight(0xeaf5ff,0x727a69,1.75));
const sun=new THREE.DirectionalLight(0xffffff,2.35);
sun.position.set(-10,22,-12); sun.castShadow=true; sun.shadow.mapSize.set(1536,1536); scene.add(sun);

const loader=new THREE.TextureLoader();
function photoTexture(path,rx=1,ry=1){
  const t=loader.load(path);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(rx,ry);
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  return t;
}
function box(w,h,d,mat,x,y,z,parent=scene){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function plane(path,w,h,x,y,z,rotY=0,transparent=false,parent=scene){
  const tex=loader.load(path); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent,alphaTest:transparent?0.02:0});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  p.position.set(x,y,z); p.rotation.y=rotY; parent.add(p); return p;
}

const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x696c68,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);

const brick=new THREE.MeshStandardMaterial({map:photoTexture('./assets/wes-brick-site.jpg',3.0,1.6),color:0xffffff,roughness:.92});
const annex=new THREE.MeshStandardMaterial({map:photoTexture('./assets/wes-annex-panel-site.jpg',2.0,1.35),color:0xffffff,roughness:.9});
const stone=new THREE.MeshStandardMaterial({color:0xd8cfba,roughness:.92});
const charcoal=new THREE.MeshStandardMaterial({color:0x202930,roughness:.7,metalness:.18});
const glass=new THREE.MeshStandardMaterial({color:0x21475b,roughness:.12,metalness:.1,transparent:true,opacity:.72});
const concrete=new THREE.MeshStandardMaterial({color:0xd2d1cd,roughness:1});
const roofRed=new THREE.MeshStandardMaterial({color:0x7a2d2f,roughness:.82});
const black=new THREE.MeshStandardMaterial({color:0x111820,roughness:.72});

const campus=new THREE.Group(); scene.add(campus);

// Real-site massing: brick elementary on LEFT, tan/brick Annex on RIGHT, with the actual paved gap between them.
box(8.0,3.55,5.0,brick,-4.8,1.80,.55,campus);
box(8.15,.30,5.12,charcoal,-4.8,3.70,.55,campus);
box(8.05,.55,5.04,stone,-4.8,.30,.55,campus);

box(4.8,3.85,5.1,annex,5.4,1.95,.70,campus);
box(4.98,.30,5.25,roofRed,5.4,3.98,.70,campus);

// Photo-textured corridor side walls from the actual gap photo.
plane('./assets/wes-brick-site.jpg',4.65,3.2,-.77,1.82,.65,-Math.PI/2,false,campus);
plane('./assets/wes-annex-panel-site.jpg',4.65,3.25,2.97,1.85,.65,Math.PI/2,false,campus);

// Enclosed secure connector physically bridges both building faces across the real gap.
box(4.05,3.05,3.55,stone,1.08,1.54,-.15,campus);
box(4.35,.30,3.82,charcoal,1.08,3.10,-.15,campus);

// Project the polished concept entrance directly onto the connector's public face.
plane('./assets/wes-entry-concept.jpg',4.00,2.68,1.08,1.52,-1.945,Math.PI,false,campus);

// Add depth behind the concept façade: glass side walls and visitor/reception area.
box(.08,2.45,2.65,glass,-.91,1.38,-.10,campus);
box(.08,2.45,2.65,glass,3.07,1.38,-.10,campus);
box(1.40,.80,.80,concrete,1.95,.48,.55,campus);
box(1.35,.95,.06,glass,2.10,1.20,.10,campus);

// WABAUNSEE ELEMENTARY canopy lettering remains geometric and readable from multiple angles.
function signTexture(){
  const c=document.createElement('canvas'); c.width=1024;c.height=180; const x=c.getContext('2d');
  x.fillStyle='#202930';x.fillRect(0,0,c.width,c.height);
  x.fillStyle='#fff';x.font='900 64px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('WABAUNSEE ELEMENTARY',c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.65,.60),new THREE.MeshBasicMaterial({map:signTexture(),side:THREE.DoubleSide}));
sign.position.set(1.08,2.67,-1.985); sign.rotation.y=Math.PI; campus.add(sign);

// Charger identity on the Annex facade.
const logoTex=loader.load('./assets/charger-logo.jpg'); logoTex.colorSpace=THREE.SRGBColorSpace;
const logo=new THREE.Mesh(new THREE.PlaneGeometry(2.15,2.15),new THREE.MeshBasicMaterial({map:logoTex,side:THREE.DoubleSide}));
logo.position.set(5.65,2.05,-1.875); logo.rotation.y=Math.PI; campus.add(logo);

// Existing-site windows and a deeper corridor opening behind the connector.
const winMat=glass;
for(const x of [-7.2,-5.25,-3.3,-1.6]) box(1.05,.95,.10,winMat,x,1.75,-1.98,campus);
box(1.15,2.05,.10,winMat,4.15,1.35,-1.89,campus);

// Pavement/approach mirrors the real site photo rather than a lawn-only scene.
box(15.2,.06,8.8,new THREE.MeshStandardMaterial({color:0x6d6f70,roughness:1}),.5,.035,-5.2,campus);
box(4.1,.08,5.8,concrete,1.08,.05,-4.0,campus);

const green=new THREE.MeshStandardMaterial({color:0x536d43,roughness:1});
for(const bx of [-7.5,-6.4,-5.3,-4.2,-3.1]){
  const b=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),green);b.scale.set(1.4,.7,.8);b.position.set(bx,.27,-2.15);campus.add(b);
}
for(const bx of [4.2,5.1,6.0,6.9]){
  const b=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8),green);b.scale.set(1.35,.7,.8);b.position.set(bx,.26,-2.10);campus.add(b);
}

const views={
  entry:{p:[1.0,5.8,-18.5],t:[1.0,1.55,-.4]},
  connection:{p:[-9.5,6.5,-7.8],t:[1.0,1.45,.2]},
  campus:{p:[16,11,-22],t:[.4,1.5,.3]},
  side:{p:[14,6,2],t:[1.1,1.5,.3]},
  reset:{p:[1.0,5.8,-18.5],t:[1.0,1.55,-.4]}
};
function applyView(name){const v=views[name]||views.reset;camera.position.set(...v.p);controls.target.set(...v.t);controls.update();}
document.querySelectorAll('[data-elementary-view]').forEach(btn=>btn.addEventListener('click',()=>applyView(btn.dataset.elementaryView)));
document.querySelectorAll('[data-elementary-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);camera.position.addScaledVector(dir,btn.dataset.elementaryZoom==='in'?2.4:-2.4);controls.update();
}));
function resize(){
  const rect=stage.getBoundingClientRect(); const w=Math.max(320,Math.floor(rect.width)); const h=Math.max(360,Math.floor(rect.height));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();
stage.classList.add('model-ready'); if(loading) loading.textContent='';
let visible=true;
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{rootMargin:'240px'}).observe(stage);
renderer.setAnimationLoop(()=>{if(!visible)return;controls.update();renderer.render(scene,camera);});
