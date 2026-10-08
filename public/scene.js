// Synthetic, periodic 240 m course terrain. Use cameraY = terrain(cameraX, cameraZ) + 2.1.
// This is the exact same formula used to sample rolling_course.json.
const COURSE_LENGTH = 240;
const COURSE_MOUNDS = [[-11, 29, 1.55, 11, 17], [15, 61, 2.0, 13, 19], [-19, 103, 1.8, 14, 21], [12, 132, 1.3, 12, 18], [-10, 182, 1.9, 14, 23], [19, 221, 1.75, 12, 17], [-43, 52, 4.3, 21, 38], [44, 116, 5.1, 23, 42], [-49, 177, 5.6, 20, 34], [47, 224, 3.8, 19, 34]];
const COURSE_BUNKERS = [[17.5, 91, 4.8, 8.5, -0.28, 0.32], [-20, 153, 5.6, 9.0, 0.55, 1.15], [12, 205, 5.5, 7.7, -0.45, 2.45]];
function courseDeltaZ(a, b) { return ((a - b + 120) % 240 + 240) % 240 - 120; }
function courseRouteX(z) { return 8 * Math.sin(2 * Math.PI * z / COURSE_LENGTH); }
function courseBunkerQ(x, z, b) {
  const [bx,bz,rx,rz,rot,ph] = b;
  const xx = x-bx, zz = courseDeltaZ(z,bz), c = Math.cos(rot), s = Math.sin(rot);
  const u = (xx*c-zz*s)/rx, v = (xx*s+zz*c)/rz, a = Math.atan2(v,u);
  const shape = 1 + .12*Math.sin(3*a+ph) + .075*Math.cos(2*a-ph) + .035*Math.sin(5*a+.7);
  return Math.hypot(u,v)/shape;
}
function terrain(x, z) {
  const t = 2*Math.PI*z/COURSE_LENGTH, d = x-courseRouteX(z);
  let y = .68*Math.sin(t-.6) + .52*Math.sin(2*t+.6) + .26*Math.cos(3*t+x*.042);
  y += .23*Math.sin(x*.115+2*t) + .12*Math.sin(x*.23-3*t);
  y += .00155*d*d*(.80+.20*Math.sin(t+.4));
  for (const [mx,mz,a,wx,wz] of COURSE_MOUNDS) {
    y += a*Math.exp(-.5*((x-mx)/wx)**2 - .5*(courseDeltaZ(z,mz)/wz)**2);
  }
  for (const b of COURSE_BUNKERS) {
    const q = courseBunkerQ(x,z,b);
    if (q < 1.7) {
      y += .24*Math.exp(-(((q-1.10)/.22)**2));
      if (q < 1) y -= .52*(1-q*q)**1.25;
    }
  }
  return y;
}

// Conceptual interactive course; not measured Stella geometry.
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),button=document.getElementById('motion'),icon=document.getElementById('motionPath'),tour=document.getElementById('tour'),hint=document.getElementById('driveHint');
let w=innerWidth,h=innerHeight,last=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,points=[],L=240,manual=false,velocity=0,drag=null;
let camZ=54,camX=courseRouteX(54),yaw=Math.atan(8*2*Math.PI/240*Math.cos(54*2*Math.PI/240)),camY=terrain(camX,camZ)+2.1;
const keys=new Set(),colors=['139,167,136','112,142,117','158,162,144','131,159,129','182,180,154','139,167,136','243,236,202','160,166,153'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function size(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',size);
function state(){document.documentElement.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('driving',manual);button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.title=paused?'Play animation':'Pause animation';icon.setAttribute('d',paused?'M7 5l7 5-7 5z':'M7 5v10M13 5v10');tour.textContent=manual?'Resume tour':'Take the wheel';tour.setAttribute('aria-label',manual?'Resume guided tour':'Switch to manual driving');hint.textContent=manual?'↑ ↓ Drive · ← → Steer · Drag to drive':'Arrow keys or drag to explore'}state();
function takeControl(){manual=true;paused=false;state()}
button.onclick=()=>{paused=!paused;keys.clear();drag=null;velocity=0;state()};
tour.onclick=()=>{manual=!manual;paused=false;velocity=0;keys.clear();drag=null;state()};
addEventListener('keydown',e=>{if(document.getElementById('contactDialog').open)return;if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;e.preventDefault();if(!manual||paused)takeControl();keys.add(e.key)});
addEventListener('keyup',e=>keys.delete(e.key));
addEventListener('blur',()=>{keys.clear();drag=null;velocity=0});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();drag=null;velocity=0}});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;takeControl();drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging')});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.dx=clamp((e.clientX-drag.x)/140,-1,1);drag.dy=clamp((drag.y-e.clientY)/140,-1,1)});
function release(e){if(drag&&drag.id===e.pointerId){drag=null;velocity=0;canvas.classList.remove('is-dragging')}}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
function advance(dt){if(paused||document.hidden)return;
 if(manual){const throttle=(keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0)+(drag?drag.dy:0),steer=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0)+(drag?drag.dx:0);velocity+=(clamp(throttle,-1,1)*6-velocity)*Math.min(1,dt*7);yaw+=clamp(steer,-1,1)*dt*.9;camX=clamp(camX+Math.sin(yaw)*velocity*dt,-49,49);camZ=((camZ+Math.cos(yaw)*velocity*dt)%L+L)%L;
 }else{camZ=(camZ+4.8*dt)%L;camX+=(courseRouteX(camZ)-camX)*Math.min(1,dt*1.8);const target=Math.atan(8*2*Math.PI/L*Math.cos(camZ*2*Math.PI/L)),delta=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));yaw+=delta*Math.min(1,dt*1.8)}
 camY=terrain(camX,camZ)+2.1;
}
function draw(){ctx.clearRect(0,0,w,h);const fov=Math.max(w*.88,h*.88),horizon=h*.46,cy=Math.cos(yaw),sy=Math.sin(yaw),stride=w<650?2:1;
 for(let i=0;i<points.length;i+=stride){const p=points[i],x=p[0]-camX,base=((p[2]-camZ+L/2)%L+L)%L-L/2;
  for(let tile=-1;tile<=1;tile++){const z=base+tile*L,X=x*cy-z*sy,Z=x*sy+z*cy;if(Z<1.6||Z>140)continue;const sx=w*.5+X/Z*fov,yy=horizon-(p[1]-camY)/Z*fov;if(sx<-6||sx>w+6||yy<-6||yy>h+6)continue;const fog=Math.pow(1-Z/150,1.35),near=Math.min(1,(Z-1.6)/4),a=Math.min(.94,(.36+p[4]*.72)*fog*near),r=Math.min(3.1,.6+30/Z);ctx.fillStyle=`rgba(${colors[p[3]]||colors[1]},${a})`;ctx.fillRect(sx,yy,r,r)}
 }
}
function loop(ts){const dt=last?Math.min((ts-last)/1000,.045):0;last=ts;advance(dt);draw();requestAnimationFrame(loop)}
fetch('assets/course.json').then(r=>{if(!r.ok)throw Error('landscape unavailable');return r.json()}).then(data=>{points=data.points;L=data.length||240;requestAnimationFrame(loop)}).catch(()=>{hint.textContent='Landscape unavailable. Please refresh.';tour.disabled=true;draw()});
