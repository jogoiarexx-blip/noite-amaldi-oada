"use strict";
class ObjectPool {
  constructor(factory, reset){ this.factory=factory; this.reset=reset||(()=>{}); this.free=[]; }
  acquire(data){ const obj=this.free.pop()||this.factory(); this.reset(obj,data||{}); return obj; }
  release(obj){ if(!obj) return; this.free.push(obj); }
  clear(){ this.free.length=0; }
}
const Pools = {
  projectile:new ObjectPool(()=>({}), (o,d)=>{ Object.keys(o).forEach(k=>delete o[k]); Object.assign(o,d); if(!o.hitSet)o.hitSet=new Set(); else o.hitSet.clear(); }),
  enemyProjectile:new ObjectPool(()=>({}), (o,d)=>{ Object.keys(o).forEach(k=>delete o[k]); Object.assign(o,d); }),
  particle:new ObjectPool(()=>({}), (o,d)=>{ Object.assign(o,d); }),
  soul:new ObjectPool(()=>({}), (o,d)=>{ Object.assign(o,d); }),
  fragment:new ObjectPool(()=>({}), (o,d)=>{ Object.assign(o,d); }),
  damageText:new ObjectPool(()=>({}), (o,d)=>{ Object.assign(o,d); }),
  enemy:new ObjectPool(()=>({}), (o,d)=>{ Object.keys(o).forEach(k=>delete o[k]); Object.assign(o,d); })
};
function releaseArrayToPool(arr,pool){ while(arr.length) pool.release(arr.pop()); }
