"use strict";
const PLAYER_ANIM_META={
  idle:{frames:4,frameDuration:10,loop:true},
  walk:{frames:6,frameDuration:5,loop:true},
  attack:{frames:6,frameDuration:2.5,loop:false},
  cast:{frames:6,frameDuration:3,loop:false},
  hurt:{frames:3,frameDuration:4,loop:false},
  death:{frames:6,frameDuration:5,loop:false,holdLast:true}
};
const PLAYER_DIRS=['down','left','right','up'];
let playerMoveDX=0,playerMoveDY=0,playerMoving=false;
let playerAnim={state:'idle',dir:'down',frame:0,timer:0,locked:false,dying:false,onComplete:null};
function playerDirFromVector(dx,dy){
  if(Math.abs(dx)>Math.abs(dy)) return dx>=0?'right':'left';
  return dy>=0?'down':'up';
}
function playerDirFromFacing(){ return playerDirFromVector(Math.cos(lastFacing),Math.sin(lastFacing)); }
function resetPlayerAnimation(){ playerAnim={state:'idle',dir:'down',frame:0,timer:0,locked:false,dying:false,onComplete:null}; }
function setPlayerMovementIntent(dx,dy,moving){ playerMoveDX=dx||0; playerMoveDY=dy||0; playerMoving=!!moving; }
function startPlayerAnimState(state, opts){
  opts=opts||{};
  if(playerAnim.dying && state!=='death') return;
  playerAnim.state=state;
  playerAnim.frame=0;
  playerAnim.timer=0;
  playerAnim.locked=!!opts.locked;
  playerAnim.onComplete=opts.onComplete||null;
  if(opts.dir) playerAnim.dir=opts.dir;
}
function triggerPlayerAction(kind){
  if(playerAnim.dying || playerAnim.state==='hurt') return;
  const state=kind==='cast'?'cast':'attack';
  startPlayerAnimState(state,{locked:true,dir:playerDirFromFacing()});
}
function triggerPlayerHurt(){
  if(playerAnim.dying) return;
  startPlayerAnimState('hurt',{locked:true,dir:playerAnim.dir||playerDirFromFacing()});
}
function triggerPlayerDeath(onComplete){
  if(playerAnim.dying) return;
  playerAnim.dying=true;
  startPlayerAnimState('death',{locked:true,dir:playerAnim.dir||playerDirFromFacing(),onComplete});
}
function isPlayerDeathAnimating(){ return playerAnim.state==='death' && playerAnim.dying; }
function updatePlayerAnimation(dt){
  if(!playerAnim.locked && !playerAnim.dying){
    playerAnim.dir = playerMoving ? playerDirFromVector(playerMoveDX,playerMoveDY) : playerDirFromFacing();
    const wantedState = playerMoving ? 'walk' : 'idle';
    if(playerAnim.state!==wantedState){
      playerAnim.state=wantedState;
      playerAnim.frame=0;
      playerAnim.timer=0;
    }
  }
  const meta=PLAYER_ANIM_META[playerAnim.state]||PLAYER_ANIM_META.idle;
  playerAnim.timer += dt;
  while(playerAnim.timer >= meta.frameDuration){
    playerAnim.timer -= meta.frameDuration;
    if(playerAnim.frame < meta.frames-1){
      playerAnim.frame++;
      continue;
    }
    if(meta.loop){
      playerAnim.frame=0;
      continue;
    }
    if(playerAnim.state==='death'){
      playerAnim.frame=meta.frames-1;
      const cb=playerAnim.onComplete;
      playerAnim.onComplete=null;
      if(cb) cb();
      break;
    }
    playerAnim.locked=false;
    playerAnim.state=playerMoving ? 'walk' : 'idle';
    playerAnim.frame=0;
    playerAnim.timer=0;
    break;
  }
}
function getPlayerAnimFrameKey(){
  const meta=PLAYER_ANIM_META[playerAnim.state]||PLAYER_ANIM_META.idle;
  const dir=PLAYER_DIRS.includes(playerAnim.dir)?playerAnim.dir:'down';
  const frame=clamp(playerAnim.frame,0,meta.frames-1);
  return `player:${playerAnim.state}:${dir}:${frame}`;
}
function getPlayerAnimFallbackFrameKey(){
  const dir=PLAYER_DIRS.includes(playerAnim.dir)?playerAnim.dir:'down';
  return `player:idle:${dir}:0`;
}
