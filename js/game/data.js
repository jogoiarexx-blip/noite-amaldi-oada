"use strict";
const WEAPON_DEFS={
 adaga:{name:'Adaga Amaldiçoada',icon:'🗡️',maxLevel:8,desc:l=>`Corte Carmesim: lança ${1+Math.floor(l/2)} lâmina(s) amaldiçoada(s) após o golpe.`,baseCooldown:55,baseDamage:9},
 chicote:{name:'Chicote Sangrento',icon:'🩸',maxLevel:8,desc:l=>`Golpeia em arco à frente, ${l>=5?'atingindo dois lados':'atingindo inimigos próximos'}.`,baseCooldown:70,baseDamage:14},
 orbe:{name:'Orbe Sombrio',icon:'🔮',maxLevel:8,desc:l=>`Orbita causando dano contínuo. ${l>=4?'2 orbes.':'1 orbe.'}`,baseCooldown:0,baseDamage:6},
 grimorio:{name:'Grimório Amaldiçoado',icon:'📖',maxLevel:8,desc:l=>`Lança ${l>=6?'2 livros perseguidores':'um livro perseguidor'} por ciclo.`,baseCooldown:130,baseDamage:16},
 cruz:{name:'Crucifixo Invertido',icon:'✝️',maxLevel:8,desc:l=>'Atravessa inimigos em linha reta.',baseCooldown:160,baseDamage:20},
 foice:{name:'Foice Espectral',icon:'🔱',maxLevel:8,desc:l=>`Gira ao redor. ${l>=5?'2 foices.':'1 foice.'}`,baseCooldown:0,baseDamage:11},
 lanterna:{name:'Lanterna Amaldiçoada',icon:'🔦',maxLevel:8,desc:l=>`Feixe contínuo em cone. ${l>=5?'Cone mais largo.':''}`,baseCooldown:0,baseDamage:5}
};
const PASSIVE_DEFS={
 vigor:{name:'Coração Sombrio',icon:'❤️',desc:'+20 Vida máxima',maxLevel:5}, velocidade:{name:'Bota Espectral',icon:'👢',desc:'+10% Velocidade',maxLevel:5},
 forca:{name:'Sangue Ancestral',icon:'💪',desc:'+15% Dano',maxLevel:5}, area:{name:'Névoa Amaldiçoada',icon:'🌫️',desc:'+15% Área',maxLevel:5},
 cadencia:{name:'Relíquia do Tempo',icon:'⏳',desc:'-10% Recarga',maxLevel:5}, ima:{name:'Amuleto Ímã',icon:'🧲',desc:'+40 Coleta',maxLevel:5},
 regen:{name:'Pacto Vital',icon:'💗',desc:'+1 Vida/s',maxLevel:5}, vampirismo:{name:'Sede de Sangue',icon:'🩸',desc:'+2% Roubo de vida',maxLevel:5},
 escudo:{name:'Manto Sombrio',icon:'🛡️',desc:'+15% Bloqueio',maxLevel:3}, sorte:{name:'Favor das Trevas',icon:'🍀',desc:'+10% XP e drops',maxLevel:5}
};
const EVOLUTION_DEFS={
 adaga:{name:'Lâmina do Abismo',icon:'🗡️',requiresPassive:'forca',damage:1.55,cooldown:.72},
 chicote:{name:'Flagelo Carmesim',icon:'🩸',requiresPassive:'vampirismo',damage:1.45,cooldown:.78},
 orbe:{name:'Lua Negra',icon:'🌑',requiresPassive:'area',damage:1.55,cooldown:1},
 grimorio:{name:'Códice dos Mortos',icon:'📕',requiresPassive:'cadencia',damage:1.5,cooldown:.7},
 cruz:{name:'Relíquia Profana',icon:'✠',requiresPassive:'vigor',damage:1.65,cooldown:.75},
 foice:{name:'Ceifadora Eterna',icon:'⚔️',requiresPassive:'velocidade',damage:1.5,cooldown:1},
 lanterna:{name:'Olho do Vazio',icon:'👁️',requiresPassive:'ima',damage:1.5,cooldown:1}
};
let evolvedWeapons={};
function weaponDamageMult(key){return evolvedWeapons[key]?(EVOLUTION_DEFS[key]?.damage||1):1;}
function weaponCooldownMult(key){return evolvedWeapons[key]?(EVOLUTION_DEFS[key]?.cooldown||1):1;}

let playerWeapons={},playerPassives={},weaponTimers={};
let projectiles=[],enemyProjectiles=[],orbs=[],scythes=[],lanternaHitMap=new Map(),slashes=[],souls=[],particles=[],damageTexts=[],eternalFragments=[],chests=[];
let enemies=[],enemyId=0;
const ENEMY_TYPES={
 morcego:{name:'Morcego',hp:14,speed:2,dmg:6,r:10,color:'#6a3a7a',xp:1,glyph:'🦇'}, corvo:{name:'Corvo Amaldiçoado',hp:8,speed:3.2,dmg:5,r:9,color:'#2a2a3a',xp:1,glyph:'🐦'},
 zumbi:{name:'Zumbi Cadavérico',hp:30,speed:1.1,dmg:10,r:13,color:'#4a5a2a',xp:2,glyph:'🧟'}, aranha:{name:'Aranha Sombria',hp:22,speed:2.6,dmg:9,r:11,color:'#3a1a1a',xp:2,glyph:'🕷️'},
 esqueleto:{name:'Esqueleto Arqueiro',hp:20,speed:1.4,dmg:8,r:12,color:'#c8c0a0',xp:2,glyph:'💀'}, gargula:{name:'Gárgula Alada',hp:34,speed:1.6,dmg:12,r:13,color:'#4a4a5a',xp:3,glyph:'🗿'},
 lobisomem:{name:'Lobisomem',hp:60,speed:2.4,dmg:16,r:16,color:'#5a2a1a',xp:4,glyph:'🐺'}, fantasma:{name:'Fantasma Errante',hp:25,speed:1.8,dmg:9,r:12,color:'#8ab0d0',xp:3,glyph:'👻'},
 necromante:{name:'Necromante',hp:40,speed:.9,dmg:6,r:13,color:'#2a1a3a',xp:4,glyph:'🧙'}
};
const BOSS_TYPES={
 lorde:{name:'Lorde Vampiro',hp:800,speed:1.6,dmg:26,r:30,color:'#8a0a2a',xp:60,glyph:'🧛',atkInterval:100,atkSpread:1},
 ceifador:{name:'O Ceifador',hp:1400,speed:1.4,dmg:32,r:34,color:'#2a1a3a',xp:100,glyph:'💀',atkInterval:90,atkSpread:1},
 condessa:{name:'Condessa Sanguinária',hp:2200,speed:1.8,dmg:30,r:32,color:'#a01838',xp:160,glyph:'🧛‍♀️',atkInterval:70,atkSpread:3},
 arquimago:{name:'Arqui-Necromante',hp:3000,speed:1.3,dmg:28,r:34,color:'#3a0a55',xp:220,glyph:'🧙‍♂️',atkInterval:110,atkSpread:2,summon:true}
};
let gameTime=0,stageTime=0,killCount=0,eliteKills=0,bossKills=0,spawnTimer=0,running=false,paused=false,xpGainMult=1;
let currentStage=0,stageBossSpawned=false,stageBossDefeated=false,stageCompleting=false,runFragments=0;
let runStats={damageDealt:0,damageTaken:0,soulsCollected:0,fragmentsCollected:0,chestsOpened:0,highestLevel:1};
