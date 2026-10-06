import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const stage=document.querySelector('#elementary-model-stage');
const canvas=document.querySelector('#elementary-canvas');
const loading=document.querySelector('#elementary-model-loading');
if(!stage||!canvas) throw new Error('Elementary 3D model stage is missing.');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xdbe9f3);
scene.fog=new THREE.Fog(0xdbe9f3,34,72);
const camera=new THREE.PerspectiveCamera(41,1,.1,110);
camera.position.set(.6,5.2,-16.5);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.06;
controls.minDistance=8;controls.maxDistance=44;controls.maxPolarAngle=Math.PI/2.05;
controls.target.set(.2,1.6,-.4);

scene.add(new THREE.HemisphereLight(0xeaf5ff,0x77816c,1.75));
const sun=new THREE.DirectionalLight(0xffffff,2.35);
sun.position.set(-10,22,-12);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);scene.add(sun);

function tex(w,h,draw,rx=1,ry=1){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t;
}
const brickTex=tex(512,256,(x,w,h)=>{
  x.fillStyle='#8f3d2f';x.fillRect(0,0,w,h);
  const bh=25,bw=54;
  for(let r=0;r<Math.ceil(h/bh);r++){
    const off=(r%2)*bw/2;
    for(let cx=-off;cx<w;cx+=bw){
      x.fillStyle=['#a44b38','#8b352b','#b3533d','#793129'][(r+Math.floor(cx/bw)+8)%4];
      x.fillRect(cx+2,r*bh+2,bw-4,bh-4);
      x.strokeStyle='rgba(229,216,194,.75)';x.lineWidth=2;x.strokeRect(cx+1,r*bh+1,bw-2,bh-2);
    }
  }
},4.2,2.2);
const stoneTex=tex(512,256,(x,w,h)=>{
  x.fillStyle='#d5ccb7';x.fillRect(0,0,w,h);
  let y=0,row=0;while(y<h){const rh=38+(row%2)*7;let cx=-(row%2)*28;
    while(cx<w){const sw=52+((cx+y+500)%40);x.fillStyle=['#efe9db','#d4c7ad','#c5b99e','#e2d7c2'][(row+Math.floor(cx/50)+8)%4];x.fillRect(cx+3,y+3,sw-6,rh-6);x.strokeStyle='#f5f0e7';x.lineWidth=3;x.strokeRect(cx+2,y+2,sw-4,rh-4);cx+=sw;} y+=rh;row++;}
},2.6,2.2);
const panelTex=tex(256,256,(x,w,h)=>{
  x.fillStyle='#c8b797';x.fillRect(0,0,w,h);
  for(let px=0;px<w;px+=62){x.strokeStyle='rgba(111,92,68,.32)';x.lineWidth=2;x.strokeRect(px+2,2,58,h-4);}
},3.5,1.15);
const darkMetalTex=tex(256,256,(x,w,h)=>{
  x.fillStyle='#202a32';x.fillRect(0,0,w,h);
  for(let px=0;px<w;px+=18){x.fillStyle='rgba(255,255,255,.09)';x.fillRect(px,0,2,h);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(px+3,0,2,h);}
},3,1);

const brick=new THREE.MeshStandardMaterial({map:brickTex,color:0xffffff,roughness:.92});
const stone=new THREE.MeshStandardMaterial({map:stoneTex,color:0xffffff,roughness:.94});
const tanPanel=new THREE.MeshStandardMaterial({map:panelTex,color:0xffffff,roughness:.88});
const charcoal=new THREE.MeshStandardMaterial({map:darkMetalTex,color:0xffffff,roughness:.7,metalness:.18});
const black=new THREE.MeshStandardMaterial({color:0x17222b,roughness:.68});
const glass=new THREE.MeshStandardMaterial({color:0x274f63,roughness:.14,metalness:.1,transparent:true,opacity:.82});
const concrete=new THREE.MeshStandardMaterial({color:0xd9d5cb,roughness:1});
const green=new THREE.MeshStandardMaterial({color:0x536f42,roughness:1});

function box(w,h,d,mat,x,y,z,parent=scene){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function windowFront(x,y,w=1.55,h=1.05,z=-1.78,parent=scene){
  box(w,h,.12,glass,x,y,z,parent);
  box(.055,h,.16,black,x,y,z-.07,parent);box(w,.055,.16,black,x,y,z-.07,parent);
  box(.055,h+.12,.17,black,x-w/2,y,z-.07,parent);box(.055,h+.12,.17,black,x+w/2,y,z-.07,parent);
  box(w+.12,.055,.17,black,x,y-h/2,z-.07,parent);box(w+.12,.055,.17,black,x,y+h/2,z-.07,parent);
}
function signTexture(text){
  const c=document.createElement('canvas');c.width=1024;c.height=180;const x=c.getContext('2d');
  x.fillStyle='#151d24';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.font='900 66px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,c.height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

const campus=new THREE.Group();scene.add(campus);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x789169,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

// Existing red-brick elementary building, including light stone base.
box(10.4,3.55,4.5,brick,4.75,1.82,.45,campus);
box(10.55,.65,4.58,stone,4.75,.34,.45,campus);
box(10.75,.36,4.72,charcoal,4.75,3.72,.45,campus);
for(const wx of [8.1,6.0,3.9,1.8]) windowFront(wx,1.75,1.45,1.05,-1.84,campus);

// Tan Annex with panel character and dark roof edge.
box(5.5,3.75,4.2,tanPanel,-6.15,1.92,.55,campus);
box(5.72,.34,4.42,charcoal,-6.15,3.90,.55,campus);
for(const wx of [-4.45,-8.0]) windowFront(wx,1.58,.95,.9,-1.58,campus);

// Light-stone secure entrance / enclosed connector.
box(4.05,2.95,2.45,stone,.55,1.50,-1.05,campus);
box(4.55,.28,2.85,charcoal,.55,3.05,-1.18,campus);
box(4.95,.24,1.35,charcoal,.55,2.72,-2.52,campus);

// Glass double entry doors and sidelights.
box(1.52,2.18,.12,glass,.55,1.18,-2.34,campus);
box(.055,2.18,.16,black,.55,1.18,-2.41,campus);
box(1.52,.055,.16,black,.55,1.36,-2.41,campus);
box(.055,2.30,.16,black,-.24,1.18,-2.41,campus);box(.055,2.30,.16,black,1.34,1.18,-2.41,campus);
box(.72,2.18,.12,glass,-.86,1.18,-2.34,campus);box(.72,2.18,.12,glass,1.96,1.18,-2.34,campus);

// Reception window left of the entry.
windowFront(-1.55,1.45,1.15,.85,-2.34,campus);

// Black canopy columns and sign band.
for(const px of [-1.65,2.75]) box(.15,2.65,.15,black,px,1.38,-2.80,campus);
const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.25,.68),new THREE.MeshBasicMaterial({map:signTexture('WABAUNSEE ELEMENTARY'),side:THREE.DoubleSide}));
sign.position.set(.55,2.63,-3.205);sign.rotation.y=Math.PI;campus.add(sign);

// Glass connector continuing toward Annex.
box(2.15,2.45,1.85,glass,-3.15,1.28,-.20,campus);
box(2.35,.28,2.08,charcoal,-3.15,2.60,-.20,campus);
for(const gx of [-2.45,-3.15,-3.85]) box(.05,2.18,.08,black,gx,1.25,-1.15,campus);

// Charger identity on Annex.
const logoTex=new THREE.TextureLoader().load('./assets/charger-logo.jpg');
logoTex.colorSpace=THREE.SRGBColorSpace;
const logo=new THREE.Mesh(new THREE.PlaneGeometry(2.35,2.35),new THREE.MeshBasicMaterial({map:logoTex,side:THREE.DoubleSide}));
logo.position.set(-6.25,2.02,-1.59);logo.rotation.y=Math.PI;campus.add(logo);

// Walkway, planting beds and landscape accents.
box(3.1,.08,8.5,concrete,.45,.04,-6.4,campus);
box(15,.07,1.1,concrete,.35,.035,-3.30,campus);
for(const bx of [8.4,7.2,5.9,4.7,3.5,2.3]){
  const bush=new THREE.Mesh(new THREE.SphereGeometry(.34,16,10),green);bush.scale.set(1.25,.8,.8);bush.position.set(bx,.33,-2.25);bush.castShadow=true;campus.add(bush);
}
for(const bx of [-4.25,-5.15,-7.65,-8.35]){
  const bush=new THREE.Mesh(new THREE.SphereGeometry(.28,16,10),green);bush.scale.set(1.2,.75,.75);bush.position.set(bx,.28,-2.00);bush.castShadow=true;campus.add(bush);
}

const views={
  entry:{p:[.6,5.2,-16.5],t:[.6,1.55,-1.0]},
  connection:{p:[-10.5,6.5,-10],t:[1.2,1.45,-.25]},
  campus:{p:[18,12,-23],t:[.4,1.5,.1]},
  side:{p:[18,6,-4],t:[1.0,1.5,.2]},
  reset:{p:[.6,5.2,-16.5],t:[.6,1.55,-1.0]}
};
function applyView(name){const v=views[name]||views.reset;camera.position.set(...v.p);controls.target.set(...v.t);controls.update();}
document.querySelectorAll('[data-elementary-view]').forEach(btn=>btn.addEventListener('click',()=>applyView(btn.dataset.elementaryView)));
document.querySelectorAll('[data-elementary-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);camera.position.addScaledVector(dir,btn.dataset.elementaryZoom==='in'?2.4:-2.4);controls.update();
}));
function resize(){
  const rect=stage.getBoundingClientRect();const w=Math.max(320,Math.floor(rect.width));const h=Math.max(360,Math.floor(rect.height));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);resize();
stage.classList.add('model-ready');if(loading)loading.textContent='';
let visible=true;
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{rootMargin:'240px'}).observe(stage);
renderer.setAnimationLoop(()=>{if(!visible)return;controls.update();renderer.render(scene,camera);});
