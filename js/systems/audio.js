"use strict";

// ---------- Audio (synthesized, no external files) ----------
let actx = null;
let audioEnabled = true;
let sfxVolume = 0.8, musicVolume = 0.6, muted = false;
function ensureAudio() {
  if (!actx) {
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { audioEnabled = false; }
  }
  if (actx && actx.state === 'suspended') actx.resume();
}
function playTone(freq, dur, type, vol, freqEnd) {
  if (!audioEnabled || !actx || muted) return;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd,1), actx.currentTime+dur);
  gain.gain.setValueAtTime((vol||0.15)*sfxVolume, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime+dur);
  osc.connect(gain); gain.connect(actx.destination);
  osc.start(); osc.stop(actx.currentTime+dur);
}
function playNoise(dur, vol) {
  if (!audioEnabled || !actx || muted) return;
  const bufferSize = Math.floor(actx.sampleRate*dur);
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
  const noise = actx.createBufferSource();
  noise.buffer = buffer;
  const gain = actx.createGain();
  gain.gain.setValueAtTime((vol||0.1)*sfxVolume, actx.currentTime);
  noise.connect(gain); gain.connect(actx.destination);
  noise.start();
}
function sfxHit() { playTone(rand(180,260), 0.08, 'square', 0.05, 80); }
function sfxEnemyDeath() { playNoise(0.15, 0.1); playTone(120,0.12,'sawtooth',0.05,40); }
function sfxBossDeath() { playNoise(0.5,0.22); playTone(80,0.5,'sawtooth',0.18,25); }
function sfxWeaponFire(type) {
  const freqMap = { adaga: 520, chicote: 180, grimorio: 340, cruz: 660, foice: 250, lanterna: 300 };
  if (type==='chicote' || type==='foice') playNoise(0.08,0.045);
  playTone(freqMap[type]||400, 0.06, 'triangle', 0.035);
}
function sfxLevelUp() {
  [440,554,659,880].forEach((f,i)=> setTimeout(()=>playTone(f,0.18,'triangle',0.09), i*70));
}
function sfxPickup() { playTone(rand(700,900),0.045,'sine',0.025); }
function sfxPlayerHurt() { playTone(140,0.18,'sawtooth',0.12,60); }
function sfxBlock() { playTone(500,0.1,'triangle',0.06,300); }
function sfxBossSpawn() { playTone(60,0.8,'sawtooth',0.18,40); playNoise(0.6,0.15); }
function sfxSummon() { playTone(200,0.3,'sine',0.08,100); }
function sfxGameOver() { [220,196,164,110].forEach((f,i)=> setTimeout(()=>playTone(f,0.35,'sawtooth',0.12),i*160)); }

let droneOsc1=null, droneOsc2=null, droneGain=null;
function startAmbient() {
  if (!actx || droneOsc1 || !audioEnabled) return;
  droneGain = actx.createGain();
  droneGain.gain.setValueAtTime(muted?0:0.022*musicVolume, actx.currentTime);
  droneOsc1 = actx.createOscillator(); droneOsc1.type='sine'; droneOsc1.frequency.value=55;
  droneOsc2 = actx.createOscillator(); droneOsc2.type='sine'; droneOsc2.frequency.value=82.5;
  droneOsc1.connect(droneGain); droneOsc2.connect(droneGain); droneGain.connect(actx.destination);
  droneOsc1.start(); droneOsc2.start();
}
function stopAmbient() {
  if (droneOsc1) { try{droneOsc1.stop();droneOsc2.stop();}catch(e){} droneOsc1=null; droneOsc2=null; }
}
function updateDroneGain() {
  if (droneGain) droneGain.gain.setValueAtTime(muted?0:0.022*musicVolume, actx.currentTime);
}
