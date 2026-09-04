"use strict";
const META_KEY='noiteAmaldicoada_meta_v2';
const META_DEFS={
 dano:{name:'Lâmina Ancestral',icon:'⚔️',desc:'+4% Dano base',max:10,baseCost:20,costMult:1.35},
 vida:{name:'Sangue Antigo',icon:'❤️',desc:'+8 Vida máxima',max:10,baseCost:20,costMult:1.35},
 velocidade:{name:'Passo das Sombras',icon:'👢',desc:'+3% Velocidade',max:8,baseCost:18,costMult:1.35},
 recarga:{name:'Fluxo Temporal',icon:'⏳',desc:'-2% Recarga',max:8,baseCost:22,costMult:1.4},
 xp:{name:'Chamado das Almas',icon:'💜',desc:'+5% XP',max:8,baseCost:18,costMult:1.35},
 ima:{name:'Amuleto Ancestral',icon:'🧲',desc:'+15 Alcance de coleta',max:6,baseCost:15,costMult:1.3},
 sorte:{name:'Olho da Fortuna',icon:'🍀',desc:'+3% chance de Fragmento Eterno',max:8,baseCost:30,costMult:1.4},
 armadura:{name:'Pele de Pedra',icon:'🛡️',desc:'-2% dano recebido',max:8,baseCost:28,costMult:1.4}
};
function freshMeta(){const upgrades={};Object.keys(META_DEFS).forEach(k=>upgrades[k]=0);return{currency:0,upgrades,bestiary:{},achievements:{},wins:0};}
function loadMeta(){try{const raw=localStorage.getItem(META_KEY)||localStorage.getItem('noiteAmaldicoada_meta_v1');if(raw){const p=JSON.parse(raw);const f=freshMeta();Object.assign(f,p);f.upgrades=Object.assign(f.upgrades,p.upgrades||{});return f;}}catch(e){}return freshMeta();}
let meta=loadMeta();
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(meta));}catch(e){}}
function upgradeCost(k){const d=META_DEFS[k],l=meta.upgrades[k]||0;return Math.round(d.baseCost*Math.pow(d.costMult,l));}
function refreshCurrencyLabels(){currencyValue.textContent=meta.currency;storeCurrencyValue.textContent=meta.currency;if(window.runCurrencyValue)runCurrencyValue.textContent=runFragments;}
function addPermanentCurrency(amount){amount=Math.max(0,Math.floor(amount));meta.currency+=amount;runFragments+=amount;runStats.fragmentsCollected+=amount;saveMeta();refreshCurrencyLabels();}
function renderStore(){storeGrid.innerHTML='';Object.keys(META_DEFS).forEach(k=>{const d=META_DEFS[k],l=meta.upgrades[k]||0,maxed=l>=d.max,c=upgradeCost(k);const card=document.createElement('div');card.className='storeCard'+(maxed?' maxed':'');card.innerHTML=`<div class="icon">${d.icon}</div><div class="name">${d.name}</div><div class="desc">${d.desc}</div><div class="lvlRow">Nível ${l}/${d.max}</div><button ${maxed||meta.currency<c?'disabled':''}>${maxed?'MÁXIMO':'💠 '+c}</button>`;if(!maxed)card.querySelector('button').onclick=()=>{if(meta.currency>=c){meta.currency-=c;meta.upgrades[k]++;saveMeta();refreshCurrencyLabels();renderStore();}};storeGrid.appendChild(card);});}
storeBtn.addEventListener('click',()=>{ensureAudio();renderStore();refreshCurrencyLabels();storeScreen.classList.add('active');});
storeBackBtn.addEventListener('click',()=>storeScreen.classList.remove('active'));
refreshCurrencyLabels();
