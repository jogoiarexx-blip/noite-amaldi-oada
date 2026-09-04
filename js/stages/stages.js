"use strict";
const STAGES = [
  {id:'stage0',title:'NOITE I',name:'Ruínas do Castelo',duration:60,bossAt:45,boss:'lorde',background:ASSET_MANIFEST.backgrounds.stage0,enemyPool:['morcego','corvo','zumbi'],spawnBase:40,burstMax:3,eliteChance:.04,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage0'}},
  {id:'stage1',title:'NOITE II',name:'Pátio dos Condenados',duration:65,bossAt:48,boss:'ceifador',background:ASSET_MANIFEST.backgrounds.stage1,enemyPool:['corvo','zumbi','aranha','esqueleto'],spawnBase:36,burstMax:4,eliteChance:.06,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage1'}},
  {id:'stage2',title:'NOITE III',name:'Cripta Profanada',duration:70,bossAt:52,boss:'lorde',background:ASSET_MANIFEST.backgrounds.stage2,enemyPool:['zumbi','esqueleto','fantasma','gargula'],spawnBase:32,burstMax:4,eliteChance:.07,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage2'}},
  {id:'stage3',title:'NOITE IV',name:'Jardim de Sangue',duration:75,bossAt:55,boss:'condessa',background:ASSET_MANIFEST.backgrounds.stage3,enemyPool:['aranha','gargula','fantasma','lobisomem'],spawnBase:28,burstMax:5,eliteChance:.08,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage3'}},
  {id:'stage4',title:'NOITE V',name:'Santuário do Abismo',duration:80,bossAt:58,boss:'ceifador',background:ASSET_MANIFEST.backgrounds.stage4,enemyPool:['esqueleto','fantasma','necromante','lobisomem'],spawnBase:24,burstMax:6,eliteChance:.10,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage4'}},
  {id:'stage5',title:'NOITE VI',name:'Trono das Trevas',duration:90,bossAt:62,boss:'arquimago',background:ASSET_MANIFEST.backgrounds.stage5,enemyPool:['gargula','fantasma','necromante','lobisomem'],spawnBase:22,burstMax:6,eliteChance:.12,spawn:{x:0,y:0},bounds:{minX:-2350,maxX:2350,minY:-1750,maxY:1750},obstacles:{layout:'stage5'},final:true}
];
function getStage(){ return STAGES[currentStage]||STAGES[0]; }
function getStageBounds(){return getStage().bounds||{minX:-2400,maxX:2400,minY:-1800,maxY:1800};}
