"use strict";
class SpatialHash {
  constructor(cellSize){ this.cellSize=cellSize||160; this.cells=new Map(); }
  clear(){ this.cells.clear(); }
  key(cx,cy){ return cx+','+cy; }
  insert(obj){ const c=this.cellSize; const cx=Math.floor(obj.x/c), cy=Math.floor(obj.y/c); const k=this.key(cx,cy); let a=this.cells.get(k); if(!a){a=[];this.cells.set(k,a);} a.push(obj); }
  rebuild(list){ this.clear(); for(const o of list)this.insert(o); }
  query(x,y,r){ const c=this.cellSize, minX=Math.floor((x-r)/c), maxX=Math.floor((x+r)/c), minY=Math.floor((y-r)/c), maxY=Math.floor((y+r)/c); const out=[]; for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++){ const a=this.cells.get(this.key(cx,cy)); if(a) out.push(...a); } return out; }
}
const enemyGrid=new SpatialHash(180);
const obstacleGrid=new SpatialHash(220);
function rebuildSpatialGrids(){ enemyGrid.rebuild(enemies); obstacleGrid.rebuild(obstacles.filter(o=>o.solid)); }
function nearbyEnemies(x,y,r){ return enemyGrid.query(x,y,r); }
function nearbyObstacles(x,y,r){ return obstacleGrid.query(x,y,r); }
