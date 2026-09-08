"use strict";

const ASSET_MANIFEST = {
  enemies: {
    morcego:'assets/sprites/enemies/morcego.webp', corvo:'assets/sprites/enemies/corvo.webp',
    zumbi:'assets/sprites/enemies/zumbi.webp', aranha:'assets/sprites/enemies/aranha.webp',
    esqueleto:'assets/sprites/enemies/esqueleto.webp', gargula:'assets/sprites/enemies/gargula.webp',
    lobisomem:'assets/sprites/enemies/lobisomem.webp', fantasma:'assets/sprites/enemies/fantasma.webp',
    necromante:'assets/sprites/enemies/necromante.webp'
  },
  bosses: {
    lorde:'assets/sprites/bosses/lorde.webp',
    ceifador:'assets/sprites/bosses/ceifador.webp',
    condessa:'assets/sprites/bosses/condessa.webp',
    arquimago:'assets/sprites/bosses/arquimago.webp'
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
  },
  grounds: {
    stage0: {
      stoneA:'assets/tiles/stage01/stoneA.webp',
      stoneB:'assets/tiles/stage01/stoneB.webp',
      dirt:'assets/tiles/stage01/dirt.webp',
      moss:'assets/tiles/stage01/moss.webp',
      decalGrass:'assets/tiles/stage01/decal_grass.webp',
      decalCrack:'assets/tiles/stage01/decal_crack.webp',
      decalBlood:'assets/tiles/stage01/decal_blood.webp',
      pattern:'assets/tiles/stage01/ground_pattern.webp'
    }
  },
  pickups: {
    soul:'assets/sprites/pickups/soul.webp',
    fragment:'assets/sprites/pickups/fragment.webp',
    chest:'assets/sprites/pickups/chest.webp'
  },
  passives: {
    vigor:'assets/sprites/passives/vigor.webp',
    velocidade:'assets/sprites/passives/velocidade.webp',
    forca:'assets/sprites/passives/forca.webp',
    area:'assets/sprites/passives/area.webp',
    cadencia:'assets/sprites/passives/cadencia.webp',
    ima:'assets/sprites/passives/ima.webp',
    regen:'assets/sprites/passives/regen.webp',
    vampirismo:'assets/sprites/passives/vampirismo.webp',
    escudo:'assets/sprites/passives/escudo.webp',
    sorte:'assets/sprites/passives/sorte.webp'
  },
  meta: {
    dano:'assets/sprites/meta/dano.webp',
    vida:'assets/sprites/meta/vida.webp',
    velocidade:'assets/sprites/meta/velocidade.webp',
    recarga:'assets/sprites/meta/recarga.webp',
    xp:'assets/sprites/meta/xp.webp',
    ima:'assets/sprites/meta/ima.webp',
    sorte:'assets/sprites/meta/sorte.webp',
    armadura:'assets/sprites/meta/armadura.webp'
  }
};

const PLAYER_ASSET_LAYOUT={ idle:4, walk:6, attack:6, cast:6, hurt:3, death:6 };
const PLAYER_ASSET_DIRS=['down','left','right','up'];
const BOSS_ASSET_TYPES=new Set(['lorde','ceifador','condessa','arquimago']);
const WEAPON_ANIM_LAYOUT={
  adaga:{frames:4,speed:10}, chicote:{frames:4,speed:11}, orbe:{frames:4,speed:8}, grimorio:{frames:4,speed:7},
  cruz:{frames:4,speed:6}, foice:{frames:4,speed:9}, lanterna:{frames:4,speed:7}
};
function isBossAssetType(type){return BOSS_ASSET_TYPES.has(type);}

const ENEMY_ASSET_LAYOUT={
  morcego:{ mode:'row', rows:{ fly:5, hurt:4, death:6 }, defaultState:'fly' },
  corvo:{ mode:'row', rows:{ fly:6, hurt:4, death:6 }, defaultState:'fly' },
  zumbi:{ mode:'dir', rows:{ down:6, left:6, right:6, up:6 }, defaultDir:'down' },
  aranha:{ mode:'dir', rows:{ down:4, left:4, right:4, up:4 }, defaultDir:'down' },
  esqueleto:{ mode:'dir', rows:{ down:4, left:4, right:4, up:4 }, defaultDir:'down' },
  gargula:{ mode:'mob', rows:{ down:4, left:4, right:4, up:4, dash:4 }, defaultDir:'down' },
  lobisomem:{ mode:'dir', rows:{ down:4, left:4, right:4, up:4 }, defaultDir:'down' },
  fantasma:{ mode:'dir', rows:{ down:4, left:4, right:4, up:4 }, defaultDir:'down' },
  necromante:{ mode:'mob', rows:{ down:4, left:4, right:4, up:4, cast:4 }, defaultDir:'down' },
  lorde:{ mode:'boss', rows:{ down:6, left:6, right:6, attack:6 }, defaultDir:'down' },
  ceifador:{ mode:'boss', rows:{ down:6, left:6, right:6, up:6, attack:6, cast:6 }, defaultDir:'down' },
  condessa:{ mode:'boss', rows:{ down:6, left:6, right:6, up:6, attack:6, cast:6 }, defaultDir:'down' },
  arquimago:{ mode:'boss', rows:{ down:6, left:6, right:6, up:6, attack:6, cast:6 }, defaultDir:'down' }
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
    const boss = isBossAssetType(type);
    if(!spec) {
      const manifest = boss ? ASSET_MANIFEST.bosses : ASSET_MANIFEST.enemies;
      if(manifest && manifest[type]) tasks.push(loadImage('enemy:'+type, manifest[type]));
      return;
    }
    const root = boss ? 'assets/sprites/bosses' : 'assets/sprites/enemies';
    for(const [row,count] of Object.entries(spec.rows)){
      for(let i=0;i<count;i++) tasks.push(loadImage(`enemy:${type}:${row}:${i}`, `${root}/${type}/${row}_${i}.webp`));
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
  function queueGroundAssets(tasks, stage){
    const manifest = ASSET_MANIFEST.grounds && ASSET_MANIFEST.grounds[stage && stage.id];
    if(!manifest) return;
    for(const [key,src] of Object.entries(manifest)) tasks.push(loadImage(`ground:${stage.id}:${key}`, src));
  }
  function queuePickupAssets(tasks){
    if(!ASSET_MANIFEST.pickups) return;
    for(const [key,src] of Object.entries(ASSET_MANIFEST.pickups)) tasks.push(loadImage('pickup:'+key, src));
  }
  function queueWeaponAssets(tasks){
    for(const [key,src] of Object.entries(ASSET_MANIFEST.weapons||{})){
      tasks.push(loadImage('weapon:'+key,src));
      const spec = WEAPON_ANIM_LAYOUT[key];
      if(spec){
        for(let i=0;i<spec.frames;i++) tasks.push(loadImage(`weaponAnim:${key}:${i}`, `assets/sprites/weapons/${key}/frame_${i}.webp`));
      }
    }
  }
  async function preloadStage(stage) {
    const tasks=[];
    if(stage.background) tasks.push(loadImage('bg:'+stage.id, stage.background));
    queuePlayerAssets(tasks);
    (stage.enemyPool||[]).forEach(k=>queueEnemyAssets(tasks,k));
    if(stage.boss) queueEnemyAssets(tasks, stage.boss);
    queueObstacleAssets(tasks, stage);
    queueGroundAssets(tasks, stage);
    queuePickupAssets(tasks);
    queueWeaponAssets(tasks);
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
function getGroundAsset(stageId, key){ return AssetManager.get(`ground:${stageId}:${key}`); }
function getWeaponAsset(key){ return AssetManager.get(`weapon:${key}`); }
function getWeaponAnimAsset(key, frame){ return AssetManager.get(`weaponAnim:${key}:${frame}`) || getWeaponAsset(key); }
function getWeaponAnimFrameIndex(key, phase){ const spec=WEAPON_ANIM_LAYOUT[key]; if(!spec) return 0; const t=(typeof gameTime==='number'?gameTime:0)*(spec.speed||8) + (phase||0); return Math.floor(t%spec.frames); }

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
        }else if(spec.mode === 'mob'){
          let row = null;
          if(type==='gargula' && enemy.dashing && spec.rows.dash) row='dash';
          else if(type==='necromante' && typeof enemy.summonTimer==='number' && enemy.summonTimer<34 && spec.rows.cast) row='cast';
          if(!row){ const dir=enemyFacingDir(enemy); row=spec.rows[dir]?dir:spec.defaultDir; }
          const count=spec.rows[row];
          let frame=enemyAnimFrame(count,row==='dash'?12:row==='cast'?9:Math.max(5,enemy.speed*4.2),enemy.id);
          if(row==='dash' && typeof enemy.dashTimeLeft==='number'){
            const progress=clamp(1-enemy.dashTimeLeft/18,0,.999); frame=Math.min(count-1,Math.floor(progress*count));
          }
          img=AssetManager.get(`enemy:${type}:${row}:${frame}`);
        }else if(spec.mode === 'boss'){
          let row = 'down';
          if(enemy.animAction && spec.rows[enemy.animAction]) row = enemy.animAction;
          else {
            const dir = enemyFacingDir(enemy);
            row = spec.rows[dir] ? dir : spec.defaultDir;
          }
          const count = spec.rows[row];
          const speed = (row==='attack'||row==='cast') ? 10 : 6;
          let frame = enemyAnimFrame(count, speed, enemy.id);
          if((row==='attack'||row==='cast') && typeof enemy.animActionTimer==='number' && typeof enemy.animActionDuration==='number'){
            const progress=clamp(1-enemy.animActionTimer/Math.max(1,enemy.animActionDuration),0,.999);
            frame=Math.min(count-1,Math.floor(progress*count));
          }
          img = AssetManager.get(`enemy:${type}:${row}:${frame}`);
        }
      }
    }
    if(!img) img = AssetManager.get('enemy:'+type);
    if(img){
      const prev=ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled=false;
      const scaleBoost = type==='lorde'?1.42:(type==='ceifador'||type==='condessa'||type==='arquimago'?1.48:(type==='zumbi'?1.28:(type==='aranha'?1.30:(type==='esqueleto'?1.30:(type==='gargula'?1.38:(type==='lobisomem'?1.36:(type==='fantasma'?1.42:(type==='necromante'?1.42:1.16))))))));
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
  },
  drawPickup(type,x,y,size,fallback){
    const img = AssetManager.get('pickup:'+type);
    if(img){
      const prev=ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled=false;
      ctx.drawImage(img,x-size/2,y-size/2,size,size); ctx.imageSmoothingEnabled=prev; return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'?',x,y); return false;
  },
  drawWeapon(type,x,y,size,rotation,fallback,frame){
    const img = frame==null ? AssetManager.get('weapon:'+type) : getWeaponAnimAsset(type, frame);
    if(img){
      const prev=ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled=false;
      ctx.save();
      ctx.translate(x,y);
      if(rotation) ctx.rotate(rotation);
      ctx.drawImage(img,-size/2,-size/2,size,size);
      ctx.restore();
      ctx.imageSmoothingEnabled=prev;
      return true;
    }
    ctx.save();
    if(rotation){ctx.translate(x,y);ctx.rotate(rotation);ctx.translate(-x,-y);}
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'?',x,y);
    ctx.restore();
    return false;
  }
};
