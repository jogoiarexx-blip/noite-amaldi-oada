"use strict";
const INPUT_KEY='noiteAmaldicoada_input_v2';
let inputSettings={up:'w',down:'s',left:'a',right:'d',gamepad:true,deadzone:.18};
try{Object.assign(inputSettings,JSON.parse(localStorage.getItem(INPUT_KEY)||'{}'));}catch(e){}
function saveInputSettings(){try{localStorage.setItem(INPUT_KEY,JSON.stringify(inputSettings));}catch(e){}}
function actionPressed(action){
  const k=(inputSettings[action]||'').toLowerCase();
  if(keys[k]) return true;
  if(action==='up'&&keys.arrowup)return true; if(action==='down'&&keys.arrowdown)return true; if(action==='left'&&keys.arrowleft)return true; if(action==='right'&&keys.arrowright)return true;
  return false;
}
function readGamepad(){
  if(!inputSettings.gamepad || !navigator.getGamepads) return {x:0,y:0,active:false};
  const pads=navigator.getGamepads(); const p=Array.from(pads||[]).find(Boolean); if(!p) return {x:0,y:0,active:false};
  let x=p.axes[0]||0,y=p.axes[1]||0; const dz=inputSettings.deadzone||.18;
  if(Math.abs(x)<dz)x=0;if(Math.abs(y)<dz)y=0;
  if(p.buttons[12]?.pressed)y=-1;if(p.buttons[13]?.pressed)y=1;if(p.buttons[14]?.pressed)x=-1;if(p.buttons[15]?.pressed)x=1;
  if(p.buttons[9]?.pressed && running && !manualPause && !paused) openPause();
  return {x,y,active:!!(x||y)};
}
