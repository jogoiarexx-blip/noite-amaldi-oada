"use strict";
function aimAtNearestEnemy(maxDist){
  const t=nearestEnemy(player.x,player.y,maxDist||700);
  if(t) lastFacing=Math.atan2(t.y-player.y,t.x-player.x);
  return t;
}
function fireAdaga(){
  const l=playerWeapons.adaga;if(!l)return;
  const count=(1+Math.floor(l/2))+(evolvedWeapons.adaga?2:0),dmg=WEAPON_DEFS.adaga.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('adaga');
  const targets=nearbyEnemies(player.x,player.y,700).sort((a,b)=>dist2(player.x,player.y,a.x,a.y)-dist2(player.x,player.y,b.x,b.y)).slice(0,count);
  if(!targets.length)return;
  lastFacing=Math.atan2(targets[0].y-player.y,targets[0].x-player.x);
  triggerPlayerAction('attack');
  sfxWeaponFire('adaga');
  for(const t of targets){
    const a=Math.atan2(t.y-player.y,t.x-player.x);
    pushProjectile({x:player.x,y:player.y,vx:Math.cos(a)*7.5,vy:Math.sin(a)*7.5,r:5*player.areaMult,dmg,life:70,type:'adaga',pierce:evolvedWeapons.adaga?3:1,hitSet:new Set()});
  }
}
function fireChicote(){
  const l=playerWeapons.chicote;if(!l)return;
  const dmg=WEAPON_DEFS.chicote.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('chicote'),range=(evolvedWeapons.chicote?125:90)*player.areaMult,dirs=(l>=5||evolvedWeapons.chicote)?[1,-1]:[1];
  aimAtNearestEnemy(250);
  triggerPlayerAction('attack');
  sfxWeaponFire('chicote');
  for(const sign of dirs)slashes.push({x:player.x,y:player.y,angle:lastFacing+(sign===-1?Math.PI:0),range,life:14,maxLife:14,dmg,hitSet:new Set()});
}
function fireGrimorio(){
  const l=playerWeapons.grimorio;if(!l)return;
  const dmg=WEAPON_DEFS.grimorio.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('grimorio');
  const t=nearestEnemy(player.x,player.y,600),ang=t?Math.atan2(t.y-player.y,t.x-player.x):rand(0,Math.PI*2),count=(l>=6?2:1)+(evolvedWeapons.grimorio?1:0);
  lastFacing=ang;
  triggerPlayerAction('cast');
  sfxWeaponFire('grimorio');
  for(let i=0;i<count;i++){
    const a=ang+(i-(count-1)/2)*.4;
    pushProjectile({x:player.x,y:player.y,vx:Math.cos(a)*3.2,vy:Math.sin(a)*3.2,r:9*player.areaMult,dmg,life:150,type:'grimorio',pierce:evolvedWeapons.grimorio?6:3,hitSet:new Set(),homing:true});
  }
}
function fireCruz(){
  const l=playerWeapons.cruz;if(!l)return;
  const t=aimAtNearestEnemy(700);
  const base=t?lastFacing:lastFacing;
  const dmg=WEAPON_DEFS.cruz.baseDamage*player.dmgMult*(1+(l-1)*.18)*weaponDamageMult('cruz'),count=evolvedWeapons.cruz?3:1;
  triggerPlayerAction('cast');
  for(let i=0;i<count;i++){
    const a=base+(i-(count-1)/2)*.22;
    pushProjectile({x:player.x,y:player.y,vx:Math.cos(a)*6,vy:Math.sin(a)*6,r:11*player.areaMult,dmg,life:110,type:'cruz',pierce:99,hitSet:new Set()});
  }
  sfxWeaponFire('cruz');
}
let lastFacing=0;
function updateWeapons(dt){
  for(const k of Object.keys(playerWeapons)){
    const d=WEAPON_DEFS[k];
    if(k==='orbe'||k==='foice'||k==='lanterna')continue;
    weaponTimers[k]-=dt;
    if(weaponTimers[k]<=0){
      weaponTimers[k]=Math.max(12,d.baseCooldown*player.cooldownMult*(1-(playerWeapons[k]-1)*.04)*weaponCooldownMult(k));
      if(k==='adaga')fireAdaga();
      if(k==='chicote')fireChicote();
      if(k==='grimorio')fireGrimorio();
      if(k==='cruz')fireCruz();
    }
  }
}
