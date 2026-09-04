"use strict";
let loadingTransition=false;
function setLoadingProgress(p,text){const v=clamp(p,0,100);loadingFill.style.width=v+'%';loadingPct.textContent=Math.round(v)+'%';if(text)loadingText.textContent=text;}
function yieldFrame(){return new Promise(r=>requestAnimationFrame(r));}
async function runStageLoading(stageIndex,initial){
 if(loadingTransition)return;loadingTransition=true;paused=true;const old=STAGES[currentStage];const st=STAGES[stageIndex]||STAGES[0];loadingTitle.textContent=st.title+' · '+st.name;loadingScreen.classList.add('active');
 setLoadingProgress(5,'Recolhendo almas restantes…');for(let i=0;i<souls.length;i++){const a=Math.PI*2*i/Math.max(1,souls.length),d=24+(i%8)*4;souls[i].x=player.x+Math.cos(a)*d;souls[i].y=player.y+Math.sin(a)*d;}await yieldFrame();
 setLoadingProgress(18,'Liberando entidades da área anterior…');releaseArrayToPool(projectiles,Pools.projectile);releaseArrayToPool(enemyProjectiles,Pools.enemyProjectile);releaseArrayToPool(particles,Pools.particle);releaseArrayToPool(damageTexts,Pools.damageText);slashes.length=0;for(const e of enemies)Pools.enemy.release(e);enemies.length=0;chests.length=0;await yieldFrame();
 if(!initial&&old)AssetManager.unloadStage(old);setLoadingProgress(35,'Carregando recursos da próxima noite…');await AssetManager.preloadStage(st);await yieldFrame();
 currentStage=stageIndex;stageTime=0;stageBossSpawned=false;stageBossDefeated=false;stageCompleting=false;if(!initial){player.x=st.spawn?.x||0;player.y=st.spawn?.y||0;}clampPlayerToStage();setLoadingProgress(58,'Construindo mapa fixo e colisões…');generateObstacles();rebuildSpatialGrids();await yieldFrame();
 setLoadingProgress(78,'Preparando névoa e iluminação…');initFog();await yieldFrame();spawnTimer=8;stageBadge.textContent=st.title+' · '+st.name.toUpperCase();setLoadingProgress(100,'Pronto. Entre nas trevas.');await new Promise(r=>setTimeout(r,120));loadingScreen.classList.remove('active');loadingTransition=false;paused=false;lastTs=performance.now();
}
async function completeStage(){if(stageCompleting)return;stageCompleting=true;const st=getStage();if(st.final){victoryGame();return;}spawnBanner('Noite purificada!');addPermanentCurrency(2+currentStage);await runStageLoading(currentStage+1,false);}
function checkStageProgress(){const st=getStage();if(!stageBossSpawned&&stageTime>=st.bossAt)spawnBoss(st.boss);if(stageBossDefeated&&stageTime>=st.bossAt&&!stageCompleting&&!chests.some(c=>!c.opened))completeStage();}
