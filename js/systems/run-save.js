"use strict";
const RUN_SAVE_KEY='noiteAmaldicoada_run_v2';
function saveRun(){
  if(!running || paused || loadingTransition) return false;
  const snapshot={version:3,currentStage,stageTime,gameTime,killCount,runFragments,player:{x:player.x,y:player.y,hp:player.hp,maxHp:player.maxHp,level:player.level,xp:player.xp,xpToNext:player.xpToNext,speed:player.speed,dmgMult:player.dmgMult,areaMult:player.areaMult,cooldownMult:player.cooldownMult,magnetR:player.magnetR,regen:player.regen,lifesteal:player.lifesteal,blockChance:player.blockChance,soulBonus:player.soulBonus,damageReduction:player.damageReduction},playerWeapons,playerPassives,evolvedWeapons,stageBossSpawned,stageBossDefeated};
  try{localStorage.setItem(RUN_SAVE_KEY,JSON.stringify(snapshot));return true;}catch(e){return false;}
}
function hasRunSave(){try{return !!localStorage.getItem(RUN_SAVE_KEY);}catch(e){return false;}}
function clearRunSave(){try{localStorage.removeItem(RUN_SAVE_KEY);}catch(e){}}
function loadRun(){
  try{const s=JSON.parse(localStorage.getItem(RUN_SAVE_KEY)||'null'); if(!s||s.version!==3)return false; resetGame(); currentStage=clamp(s.currentStage||0,0,STAGES.length-1); stageTime=s.stageTime||0; gameTime=s.gameTime||0; killCount=s.killCount||0; runFragments=s.runFragments||0; Object.assign(player,s.player||{}); playerWeapons=Object.assign({adaga:1},s.playerWeapons||{}); playerPassives=Object.assign({},s.playerPassives||{}); weaponTimers={adaga:0,chicote:0,orbe:0,grimorio:0,cruz:0,foice:0,lanterna:0}; applyMetaUpgrades(false); rebuildOrbs(); rebuildScythes(); updateWeaponBar(); updateHud(); runStageLoading(currentStage,true); return true;}catch(e){return false;}
}
setInterval(()=>{ if(running&&!paused&&!manualPause) saveRun(); },15000);
