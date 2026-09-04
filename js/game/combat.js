"use strict";
let pendingCombatActions=[];
function queueCombatAction(action){ pendingCombatActions.push(action); }
function getPrimaryImpactDelay(){
  const frameDur = (typeof PLAYER_ANIM_META!=='undefined' && PLAYER_ANIM_META.attack && PLAYER_ANIM_META.attack.frameDuration) ? PLAYER_ANIM_META.attack.frameDuration : 2.5;
  return frameDur * 3;
}
function updatePendingCombat(dt){
  for(let i=pendingCombatActions.length-1;i>=0;i--){
    const a = pendingCombatActions[i];
    a.delay -= dt;
    if(a.delay>0) continue;
    if(a.kind==='adaga'){
      sfxWeaponFire('adaga');
      for(const shot of a.shots){
        const ox=Math.cos(shot.angle)*22, oy=Math.sin(shot.angle)*22;
        pushProjectile({x:player.x+ox,y:player.y+oy,vx:Math.cos(shot.angle)*9.2,vy:Math.sin(shot.angle)*9.2,r:10*player.areaMult,dmg:shot.dmg,life:78,type:'adaga',pierce:shot.pierce,hitSet:new Set(),angle:shot.angle});
      }
    }
    pendingCombatActions.splice(i,1);
  }
}
function nearestEnemy(x,y,maxDist){
  const limit=maxDist||700,limit2=limit*limit;let best=null,bestD=limit2;
  for(const e of nearbyEnemies(x,y,limit)){if(!e||e.hp<=0)continue;const d=dist2(x,y,e.x,e.y);if(d<bestD){bestD=d;best=e;}}
  return best;
}
function pushProjectile(data){projectiles.push(Pools.projectile.acquire(data));}
function aimAtNearestEnemy(maxDist){const t=nearestEnemy(player.x,player.y,maxDist||700);if(t)lastFacing=Math.atan2(t.y-player.y,t.x-player.x);return t;}
function fireAdaga(){
  const l=playerWeapons.adaga;if(!l)return;
  const count=(1+Math.floor(l/2))+(evolvedWeapons.adaga?2:0),dmg=WEAPON_DEFS.adaga.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('adaga');
  const targets=nearbyEnemies(player.x,player.y,720).filter(e=>e&&e.hp>0).sort((a,b)=>dist2(player.x,player.y,a.x,a.y)-dist2(player.x,player.y,b.x,b.y)).slice(0,count);
  if(!targets.length)return;
  lastFacing=Math.atan2(targets[0].y-player.y,targets[0].x-player.x);
  triggerPlayerAction('attack');
  queueCombatAction({kind:'adaga',delay:getPrimaryImpactDelay(),shots:targets.map(t=>({angle:Math.atan2(t.y-player.y,t.x-player.x),dmg,pierce:evolvedWeapons.adaga?4:1}))});
}
function fireChicote(){const l=playerWeapons.chicote;if(!l)return;const dmg=WEAPON_DEFS.chicote.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('chicote'),range=(evolvedWeapons.chicote?125:90)*player.areaMult,dirs=(l>=5||evolvedWeapons.chicote)?[1,-1]:[1];aimAtNearestEnemy(250);triggerPlayerAction('attack');sfxWeaponFire('chicote');for(const sign of dirs)slashes.push({x:player.x,y:player.y,angle:lastFacing+(sign===-1?Math.PI:0),range,life:14,maxLife:14,dmg,hitSet:new Set()});}
function fireGrimorio(){const l=playerWeapons.grimorio;if(!l)return;const dmg=WEAPON_DEFS.grimorio.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('grimorio'),t=nearestEnemy(player.x,player.y,600),ang=t?Math.atan2(t.y-player.y,t.x-player.x):lastFacing,count=(l>=6?2:1)+(evolvedWeapons.grimorio?1:0);lastFacing=ang;triggerPlayerAction('cast');sfxWeaponFire('grimorio');for(let i=0;i<count;i++){const a=ang+(i-(count-1)/2)*.4;pushProjectile({x:player.x,y:player.y,vx:Math.cos(a)*3.2,vy:Math.sin(a)*3.2,r:9*player.areaMult,dmg,life:150,type:'grimorio',pierce:evolvedWeapons.grimorio?6:3,hitSet:new Set(),homing:true});}}
function fireCruz(){const l=playerWeapons.cruz;if(!l)return;aimAtNearestEnemy(700);const dmg=WEAPON_DEFS.cruz.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('cruz'),count=evolvedWeapons.cruz?3:1;triggerPlayerAction('cast');for(let i=0;i<count;i++){const a=lastFacing+(i-(count-1)/2)*.22;pushProjectile({x:player.x,y:player.y,vx:Math.cos(a)*6,vy:Math.sin(a)*6,r:11*player.areaMult,dmg,life:110,type:'cruz',pierce:99,hitSet:new Set()});}sfxWeaponFire('cruz');}
let lastFacing=0;
function updateWeapons(dt){for(const k of Object.keys(playerWeapons)){const d=WEAPON_DEFS[k];if(k==='orbe'||k==='foice'||k==='lanterna')continue;weaponTimers[k]-=dt;if(weaponTimers[k]<=0){weaponTimers[k]=Math.max(12,d.baseCooldown*player.cooldownMult*(1-(playerWeapons[k]-1)*.04)*weaponCooldownMult(k));if(k==='adaga')fireAdaga();if(k==='chicote')fireChicote();if(k==='grimorio')fireGrimorio();if(k==='cruz')fireCruz();}}}
