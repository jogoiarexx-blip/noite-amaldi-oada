"use strict";
let camX=0,camY=0,shakeMag=0,shakeTime=0;function triggerShake(m,d){if(!gameplaySettings.screenShake)return;shakeMag=Math.max(shakeMag,m);shakeTime=Math.max(shakeTime,d);}
let fogParticles=[];function initFog(){fogParticles=[];const n=effectiveQuality==='low'?6:effectiveQuality==='medium'?12:22;for(let i=0;i<n;i++)fogParticles.push({x:rand(0,W),y:rand(0,H),r:rand(45,115),vx:rand(-.15,.15),vy:rand(-.08,.08),alpha:rand(.02,.06)});}
function updateFog(dt){for(const f of fogParticles){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.x<-150)f.x=W+150;if(f.x>W+150)f.x=-150;if(f.y<-150)f.y=H+150;if(f.y>H+150)f.y=-150;}}
function drawFog(){for(const f of fogParticles){const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,`rgba(90,40,90,${f.alpha})`);g.addColorStop(1,'rgba(90,40,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();}}
const OBSTACLE_DEFS={
 tumulo:{r:15,solid:true,glyph:'🪦'},arvoreMorta:{r:22,solid:true,glyph:'🌲'},pedra:{r:14,solid:true,glyph:'🪨'},cruz:{r:10,solid:false,glyph:'✝️'},pilarRuina:{r:18,solid:true,glyph:'🏛️'},escombros:{r:16,solid:true,glyph:'🧱'},
 muroQuebrado:{r:22,solid:true,glyph:'🧱'},estatua:{r:18,solid:true,glyph:'🗿'},braseiro:{r:12,solid:false,glyph:'🔥'},barricada:{r:20,solid:true,glyph:'🚧'},forca:{r:18,solid:true,glyph:'⚰️'},
 sarcofago:{r:22,solid:true,glyph:'⚰️'},pilastra:{r:19,solid:true,glyph:'🏛️'},ossos:{r:9,solid:false,glyph:'🦴'},altar:{r:20,solid:true,glyph:'🕯️'},vela:{r:7,solid:false,glyph:'🕯️'},
 espinhos:{r:17,solid:true,glyph:'🌿'},fonteSangue:{r:24,solid:true,glyph:'⛲'},arbustoMorto:{r:15,solid:true,glyph:'🥀'},
 altarAbismo:{r:23,solid:true,glyph:'🛕'},obelisco:{r:21,solid:true,glyph:'🔻'},circuloRitual:{r:18,solid:false,glyph:'⭕'},corrente:{r:10,solid:false,glyph:'⛓️'},
 colunaNegra:{r:24,solid:true,glyph:'🏛️'},tronoQuebrado:{r:25,solid:true,glyph:'🪑'},cristalAbismo:{r:16,solid:true,glyph:'💎'},braseiroNegro:{r:13,solid:false,glyph:'🔥'}
};
function weightedChoice(items,weights){let total=0;for(const w of weights||[])total+=w;if(!total)return choice(items);let r=Math.random()*total;for(let i=0;i<items.length;i++){r-=weights[i]||0;if(r<=0)return items[i];}return items[items.length-1];}
let obstacles=[];
function generateObstacles(){
 obstacles=[];
 const st=typeof getStage==='function'?getStage():null;
 const layoutId=st&&st.obstacles&&st.obstacles.layout?st.obstacles.layout:(st?st.id:'stage0');
 const layout=(typeof STAGE_OBSTACLE_LAYOUTS!=='undefined'&&STAGE_OBSTACLE_LAYOUTS[layoutId])||[];
 let decorativeIndex=0;
 for(const item of layout){
  const def=OBSTACLE_DEFS[item.type]||OBSTACLE_DEFS.pedra;
  // Collision geometry never changes with graphics quality.
  // Only non-solid decorative props may be hidden on weaker hardware.
  if(!def.solid){
   decorativeIndex++;
   if(effectiveQuality==='low'&&decorativeIndex%3!==0)continue;
   if(effectiveQuality==='medium'&&decorativeIndex%2===0)continue;
  }
  obstacles.push({x:item.x,y:item.y,r:def.r,type:item.type,solid:def.solid,glyph:def.glyph});
 }
 obstacleGrid.rebuild(obstacles.filter(o=>o.solid));
}
function clampPlayerToStage(){
 const b=typeof getStageBounds==='function'?getStageBounds():null;if(!b)return;
 const margin=player.r+16;
 player.x=clamp(player.x,b.minX+margin,b.maxX-margin);
 player.y=clamp(player.y,b.minY+margin,b.maxY-margin);
}
function resolveObstacleCollisions(){for(const o of nearbyObstacles(player.x,player.y,90)){const dx=player.x-o.x,dy=player.y-o.y,d=Math.hypot(dx,dy),m=o.r+player.r;if(d<m&&d>.001){player.x+=dx/d*(m-d);player.y+=dy/d*(m-d);}}for(const e of enemies){for(const o of nearbyObstacles(e.x,e.y,82)){const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),m=o.r+e.r;if(d<m&&d>.001){e.x+=dx/d*(m-d)*.5;e.y+=dy/d*(m-d)*.5;}}}}
function drawObstacles(){for(const o of obstacles){const [sx,sy]=worldToScreen(o.x,o.y);if(sx<-90||sx>W+90||sy<-90||sy>H+90)continue;ctx.font=o.r*1.85+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=o.solid?1:.62;ctx.fillText(o.glyph||(OBSTACLE_DEFS[o.type]||OBSTACLE_DEFS.pedra).glyph,sx,sy);ctx.globalAlpha=1;}}
const player={x:0,y:0,r:14,hp:100,maxHp:100,speed:2.6,level:1,xp:0,xpToNext:8,invuln:0,dmgMult:1,areaMult:1,cooldownMult:1,magnetR:70,regen:0};
