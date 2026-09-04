"use strict";
let lastTs=0,fpsClock=0,fpsFrames=0,shownFps=0;
function loop(ts){
  requestAnimationFrame(loop);
  const frameMin=1000/(videoSettings.fps||60);
  if(lastTs&&ts-lastTs<frameMin*.92)return;
  if(!lastTs)lastTs=ts;
  let dtMs=ts-lastTs;lastTs=ts;if(dtMs>100)dtMs=100;
  const dt=dtMs/16.67;
  fpsFrames++;
  if(ts-fpsClock>=500){shownFps=Math.round(fpsFrames*1000/(ts-fpsClock||500));fpsFrames=0;fpsClock=ts;perfBadge.textContent=(videoSettings.quality==='auto'?'AUTO/'+effectiveQuality.toUpperCase():effectiveQuality.toUpperCase())+' · '+shownFps+' FPS · '+W+'×'+H+(gpuAvailable?' · GPU OK':'');}
  if(!running)return;
  if(!paused&&!manualPause&&!loadingTransition){
    gameTime+=dtMs/1000;stageTime+=dtMs/1000;rebuildSpatialGrids();checkStageProgress();updatePlayer(dt);updateWeapons(dt);updatePendingCombat(dt);updateOrbs(dt);updateScythes(dt);updateLanterna(dt);updateProjectiles(dt);updateEnemyProjectiles(dt);updateSlashes(dt);updateEnemies(dt);resolveObstacleCollisions();updateParticles(dt);updatePickups(dt);updateFog(dt);spawnTimer-=dt;const st=getStage(),rate=Math.max(8,st.spawnBase-stageTime*.12);if(spawnTimer<=0&&!stageBossDefeated){spawnTimer=rate;const burst=Math.min(st.burstMax,1+Math.floor(stageTime/25));for(let i=0;i<burst;i++)spawnEnemy();}updateHud();
  } else if(isPlayerDeathAnimating()) {
    updatePlayerAnimation(dt);
  }
  if(!paused&&!manualPause&&!loadingTransition) updatePlayerAnimation(dt);
  let sx=0,sy=0;if(shakeTime>0){shakeTime-=dt;sx=rand(-shakeMag,shakeMag);sy=rand(-shakeMag,shakeMag);shakeMag*=.9;}else shakeMag=0;
  ctx.save();ctx.translate(sx,sy);drawBackground();drawObstacles();drawSouls();drawSlashes();drawOrbs();drawScythes();drawLanterna();drawProjectiles();drawEnemyProjectiles();drawEnemies();drawPlayer();drawParticles();drawDamageTexts();ctx.restore();drawVignette();drawBossHealthBar();drawBanner();
}
startBtn.addEventListener('click',async()=>{ensureAudio();startAmbient();startScreen.style.display='none';resetGame();await runStageLoading(0,true);});
if(continueBtn)continueBtn.addEventListener('click',()=>{ensureAudio();startAmbient();startScreen.style.display='none';if(!loadRun())startScreen.style.display='flex';});
requestAnimationFrame(loop);
