"use strict";

const ASSET_MANIFEST = {
  enemies: {
    morcego:'assets/sprites/enemies/morcego.webp', corvo:'assets/sprites/enemies/corvo.webp',
    zumbi:'assets/sprites/enemies/zumbi.webp', aranha:'assets/sprites/enemies/aranha.webp',
    esqueleto:'assets/sprites/enemies/esqueleto.webp', gargula:'assets/sprites/enemies/gargula.webp',
    lobisomem:'assets/sprites/enemies/lobisomem.webp', fantasma:'assets/sprites/enemies/fantasma.webp',
    necromante:'assets/sprites/enemies/necromante.webp', lorde:'assets/sprites/enemies/lorde.webp',
    ceifador:'assets/sprites/enemies/ceifador.webp', condessa:'assets/sprites/enemies/condessa.webp',
    arquimago:'assets/sprites/enemies/arquimago.webp'
  },
  weapons: {
    adaga:'assets/sprites/weapons/adaga.webp', chicote:'assets/sprites/weapons/chicote.webp',
    orbe:'assets/sprites/weapons/orbe.webp', grimorio:'assets/sprites/weapons/grimorio.webp',
    cruz:'assets/sprites/weapons/cruz.webp', foice:'assets/sprites/weapons/foice.webp',
    lanterna:'assets/sprites/weapons/lanterna.webp'
  },
  backgrounds: {
    stage0:'assets/backgrounds/stage01.webp', stage1:'assets/backgrounds/stage02.webp',
    stage2:'assets/backgrounds/stage03.webp', stage3:'assets/backgrounds/stage04.webp',
    stage4:'assets/backgrounds/stage05.webp', stage5:'assets/backgrounds/stage06.webp'
  },
  obstacles: {
    tumulo:'assets/sprites/obstacles/tumulo.webp',
    arvoreMorta:'assets/sprites/obstacles/arvoreMorta.webp',
    pilarRuina:'assets/sprites/obstacles/pilarRuina.webp',
    escombros:'assets/sprites/obstacles/escombros.webp',
    cruz:'assets/sprites/obstacles/cruz.webp',
    pedra:'assets/sprites/obstacles/pedra.webp'
  }
};

const PLAYER_ASSET_LAYOUT={ idle:4, walk:6, attack:6, cast:6, hurt:3, death:6 };
const PLAYER_ASSET_DIRS=['down','left','right','up'];
const ENEMY_ASSET_LAYOUT={
  morcego:{ mode:'row', rows:{ fly:5, hurt:4, death:6 }, defaultState:'fly' },
  corvo:{ mode:'row', rows:{ fly:6, hurt:4, death:6 }, defaultState:'fly' },
  zumbi:{ mode:'dir', rows:{ down:6, left:6, right:6, up:6 }, defaultDir:'down' },
  lorde:{ mode:'boss', rows:{ down:6, left:6, right:6, attack:6 }, defaultDir:'down' }
};

const AssetManager = (() => {
  const images = new Map();
  const failed = new Set();
  function loadImage(key, src) {
    if (images.has(key) || failed.has(key)) return Promise.resolve(images.get(key)||null);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => { images.set(key,img); resolve(img); };
      img.onerror = () => { failed.add(key); resolve(null); };
      img.src = src;
    });
  }
  function queuePlayerAssets(tasks){
    for(const [state,count] of Object.entries(PLAYER_ASSET_LAYOUT)){
      for(const dir of PLAYER_ASSET_DIRS){
        for(let i=0;i<count;i++) tasks.push(loadImage(`player:${state}:${dir}:${i}`, `assets/sprites/player/${state}/${dir}_${i}.webp`));
      }
    }
  }
  function queueEnemyAssets(tasks, type){
    const spec = ENEMY_ASSET_LAYOUT[type];
    if(!spec) {
      if(ASSET_MANIFEST.enemies[type]) tasks.push(loadImage('enemy:'+type, ASSET_MANIFEST.enemies[type]));
      return;
    }
    for(const [row,count] of Object.entries(spec.rows)){
      for(let i=0;i<count;i++) tasks.push(loadImage(`enemy:${type}:${row}:${i}`, `assets/sprites/enemies/${type}/${row}_${i}.webp`));
    }
  }
  function queueObstacleAssets(tasks, stage){
    const layoutId = stage && stage.obstacles && stage.obstacles.layout ? stage.obstacles.layout : (stage ? stage.id : 'stage0');
    const layout = (typeof STAGE_OBSTACLE_LAYOUTS !== 'undefined' && STAGE_OBSTACLE_LAYOUTS[layoutId]) || [];
    const seen = new Set();
    for(const item of layout){
      const type = item.type;
      if(seen.has(type) || !ASSET_MANIFEST.obstacles[type]) continue;
      seen.add(type);
      tasks.push(loadImage('obstacle:'+type, ASSET_MANIFEST.obstacles[type]));
    }
  }
  async function preloadStage(stage) {
    const tasks=[];
    if(stage.background) tasks.push(loadImage('bg:'+stage.id, stage.background));
    queuePlayerAssets(tasks);
    (stage.enemyPool||[]).forEach(k=>queueEnemyAssets(tasks,k));
    if(stage.boss) queueEnemyAssets(tasks, stage.boss);
    queueObstacleAssets(tasks, stage);
    Object.keys(playerWeapons||{}).forEach(k=>{ if(ASSET_MANIFEST.weapons[k]) tasks.push(loadImage('weapon:'+k,ASSET_MANIFEST.weapons[k])); });
    await Promise.all(tasks);
  }
  function get(key){ return images.get(key)||null; }
  function unloadStage(stage){ images.delete('bg:'+stage.id); }
  return { loadImage, preloadStage, get, unloadStage, failed };
})();

function enemyFacingDir(enemy){
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  if(Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
  return dy >= 0 ? 'down' : 'up';
}
function enemyAnimFrame(count, speedMult, idOffset){
  const t = (typeof gameTime === 'number' ? gameTime : 0) * (speedMult || 8);
  return Math.floor((t + ((idOffset||0)%count)) % count);
}

const SpriteManager = {
  drawPlayer(x,y,size,fallback){
    const key=(typeof getPlayerAnimFrameKey==='function'?getPlayerAnimFrameKey():null);
    const img=(key&&AssetManager.get(key))||AssetManager.get(typeof getPlayerAnimFallbackFrameKey==='function'?getPlayerAnimFallbackFrameKey():'player:idle:down:0');
    if(img){
      const prev=ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled=false;
      ctx.drawImage(img,x-size/2,y-size/2,size,size); ctx.imageSmoothingEnabled=prev; return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'🧛‍♂️',x,y); return false;
  },
  drawEnemy(enemyOrType,x,y,size,fallback){
    const enemy = typeof enemyOrType === 'object' ? enemyOrType : null;
    const type = enemy ? enemy.type : enemyOrType;
    let img = null;
    if(enemy){
      const spec = ENEMY_ASSET_LAYOUT[type];
      if(spec){
        if(spec.mode === 'row'){
          const state = enemy.deadAnim ? 'death' : enemy.hitFlash > 0 ? 'hurt' : spec.defaultState;
          const count = spec.rows[state];
          img = AssetManager.get(`enemy:${type}:${state}:${enemyAnimFrame(count, state==='death'?10:9, enemy.id)}`);
        }else if(spec.mode === 'dir'){
          const dir = enemyFacingDir(enemy);
          const count = spec.rows[dir] || spec.rows[spec.defaultDir];
          img = AssetManager.get(`enemy:${type}:${dir}:${enemyAnimFrame(count, Math.max(5, enemy.speed*4.5), enemy.id)}`);
        }else if(spec.mode === 'boss'){
          let row = 'down';
          if(enemy.isBoss && typeof enemy.atkTimer === 'number' && typeof enemy.atkInterval === 'number' && enemy.atkTimer < enemy.atkInterval * 0.34) row = 'attack';
          else {
            const dir = enemyFacingDir(enemy);
            row = spec.rows[dir] ? dir : spec.defaultDir;
          }
          const count = spec.rows[row];
          img = AssetManager.get(`enemy:${type}:${row}:${enemyAnimFrame(count, row==='attack'?8:6, enemy.id)}`);
        }
      }
    }
    if(!img) img = AssetManager.get('enemy:'+type);
    if(img){
      const prev=ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled=false;
      const scaleBoost = (type==='lorde') ? 1.42 : (type==='zumbi' ? 1.28 : 1.16);
      const drawSize = size * scaleBoost;
      ctx.drawImage(img,x-drawSize/2,y-drawSize/2,drawSize,drawSize); ctx.imageSmoothingEnabled=prev; return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'?',x,y); return false;
  },
  drawObstacle(obstacle,x,y,size,fallback){
    const img = AssetManager.get('obstacle:'+obstacle.type);
    if(img){
      const prev = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
      const drawSize = obstacle.drawSize || size;
      ctx.drawImage(img, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
      ctx.imageSmoothingEnabled = prev;
      return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'?',x,y); return false;
  }
};
