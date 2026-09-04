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
  }
};

const PLAYER_ASSET_LAYOUT={ idle:4, walk:6, attack:6, cast:6, hurt:3, death:6 };
const PLAYER_ASSET_DIRS=['down','left','right','up'];

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
        for(let i=0;i<count;i++){
          tasks.push(loadImage(`player:${state}:${dir}:${i}`, `assets/sprites/player/${state}/${dir}_${i}.webp`));
        }
      }
    }
  }
  async function preloadStage(stage) {
    const tasks=[];
    if(stage.background) tasks.push(loadImage('bg:'+stage.id, stage.background));
    queuePlayerAssets(tasks);
    (stage.enemyPool||[]).forEach(k=>tasks.push(loadImage('enemy:'+k,ASSET_MANIFEST.enemies[k])));
    if(stage.boss && ASSET_MANIFEST.enemies[stage.boss]) tasks.push(loadImage('enemy:'+stage.boss,ASSET_MANIFEST.enemies[stage.boss]));
    Object.keys(playerWeapons||{}).forEach(k=>{ if(ASSET_MANIFEST.weapons[k]) tasks.push(loadImage('weapon:'+k,ASSET_MANIFEST.weapons[k])); });
    await Promise.all(tasks);
  }
  function get(key){ return images.get(key)||null; }
  function unloadStage(stage){ images.delete('bg:'+stage.id); }
  return { loadImage, preloadStage, get, unloadStage, failed };
})();

const SpriteManager = {
  drawPlayer(x,y,size,fallback){
    const key=(typeof getPlayerAnimFrameKey==='function'?getPlayerAnimFrameKey():null);
    const img=(key&&AssetManager.get(key))||AssetManager.get(typeof getPlayerAnimFallbackFrameKey==='function'?getPlayerAnimFallbackFrameKey():'player:idle:down:0');
    if(img){
      const prev=ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(img,x-size/2,y-size/2,size,size);
      ctx.imageSmoothingEnabled=prev;
      return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'🧛‍♂️',x,y); return false;
  },
  drawEnemy(type,x,y,size,fallback){
    const img=AssetManager.get('enemy:'+type);
    if(img){
      const prev=ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(img,x-size/2,y-size/2,size,size);
      ctx.imageSmoothingEnabled=prev;
      return true;
    }
    ctx.font=size+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(fallback||'?',x,y); return false;
  }
};
