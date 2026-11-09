'use strict';
const arenaRoles=[
 ['Gobelin · Éclaireur','Dague rapide','blade',58,13,.37],
 ['Nain · Berserker','Hache-clé','cleave',66,24,.65],
 ['Chevalier','Épée de garde','cleave',65,21,.62],
 ['Reptilien','Souffle azur','bolt',145,19,.60],
 ['Éclaireur','Flèche vive','bolt',175,16,.47],
 ['Chevalier doré','Frappe solaire','cleave',76,25,.70],
 ['Elfe · Guerrier','Lame des anciens','cleave',70,22,.58],
 ['Demi-orc · Barbare','Rage','cleave',68,27,.72],
 ['Halfeline · Magicienne','Projectile magique','bolt',175,18,.52],
 ['Elfe · Druide','Charge du spitz','bolt',155,21,.52],
 ['Dracaïde · Barbare','Hache de lave','cleave',76,28,.76],
 ['Elfe des bois · Assassin','Double dague','blade',62,16,.36],
 ['Druide','Épines','bolt',155,17,.48],
 ['Tieffelin · Barbare','Hache infernale','cleave',70,27,.73],
 ['Tieffeline · Magicienne','Orbe de feu','bolt',175,23,.62],
 ['Nain','Marteau de pierre','cleave',68,24,.65],
 ['Nain','Hache du foyer','cleave',69,25,.66],
 ['Tortle','Éclat féerique','bolt',155,20,.56],
 ['Guerrière · Inquisitrice','Lame inquisitrice','cleave',77,23,.61],
 ['Halfeline · Barbare','Grande hache','cleave',69,26,.68],
 ['Aventurier','Dagues flottantes','bolt',150,15,.39],
 ['Elfe des bois · Archère','Flèche de la forêt','bolt',185,18,.49],
 ['Guerrier','Épée enchantée','cleave',71,25,.62],
 ['Chevalier','Frappe de fer','cleave',72,24,.66],
 ['Tieffeline','Hache double','cleave',73,21,.56]
];
// One entry per arcade skin, in roster order.
const arenaGear=[
 ['dagger','focus','#e5dbad'],['axe','rage','#e28962'],['sword','rage','#c6dce4'],
 ['spell','mana','#79d4ee'],['bow','focus','#b3db92'],['sword','rage','#ffcd66'],
 ['sword','rage','#dce7fd'],['axe','rage','#f79f64'],['spell','mana','#90deff'],
 ['beast','wild','#c7eaa1'],['axe','rage','#ff703c'],['dagger','focus','#baa8f3'],
 ['thorn','wild','#aadd7c'],['axe','rage','#ef766b'],['spell','mana','#fa8bdf'],
 ['hammer','rage','#c7bfb5'],['axe','rage','#f3a574'],['spell','wild','#b8d39a'],
 ['sword','rage','#f2dfa3'],['axe','rage','#e6bc93'],['dagger','focus','#ffd6a1'],
 ['bow','focus','#abdf94'],['sword','rage','#7de1ff'],['sword','rage','#d6c6ca'],
 ['axe','rage','#ff9667']
];
const arenaBoosts={
 rage:{label:'Rage',color:'#f08656',damage:1.45,delay:1,seconds:7},
 mana:{label:'Surplus de mana',color:'#8cbcff',damage:1,delay:.60,seconds:8},
 focus:{label:'Précision',color:'#f0cf76',damage:1.18,delay:.81,seconds:7},
 wild:{label:'Éveil sauvage',color:'#a5d981',damage:1.28,delay:.82,seconds:7}
};
function equippedGear(){return arenaGear[skins.indexOf(selectedSkin)]??arenaGear[0]}
const arenaThemes=[
 ['Crypte des os','#24202e','#3d3446','#473d50','#847087','#ffc68a','bones'],
 ['Cour des ronces','#1b302c','#2c443c','#355147','#728f60','#b5d88b','roots'],
 ['Forge des braises','#382126','#502d2c','#613b36','#a35d47','#ff9c53','forge'],
 ['Salle des miroirs','#202d41','#2b4257','#354e67','#658ba9','#a8ecfa','ice'],
 ['Sanctuaire de la liche','#2c203e','#413351','#4d3a60','#8e69ac','#deb1ff','runes'],
 ['Ruines du dragon','#332b28','#514139','#614e42','#aa8c65','#ffdc9e','ruins']
];
function arenaTheme(wave){return arenaThemes[(wave-1)%arenaThemes.length]}
const arenaTypes=[
 {name:'Squelette',hp:23,speed:36,color:'#d5c5a0',eye:'#352b38',size:12},
 {name:'Gobelin',hp:17,speed:58,color:'#8eaf54',eye:'#42263d',size:11},
 {name:'Zombie',hp:41,speed:27,color:'#6f9a83',eye:'#f1bb82',size:13},
 {name:'Ogre',hp:70,speed:30,color:'#b99468',eye:'#49313c',size:17},
 {name:'Dragon rouge',hp:225,speed:34,color:'#d96153',eye:'#ffe184',size:25}
];
const monsterNames=['Squelette','Zombie','Goule','Araignée géante','Ogre','Mimique','Cube gélatineux','Ours-hibou','Bête éclipsante','Armure animée','Minotaure','Flagelleur mental','Tyrannœil','Liche','Dragon rouge'];
const arenaGoblin=new Image();arenaGoblin.src='gobelin-grille.png';
const monsterArt=[arenaGoblin,...monsterNames.map((_,i)=>{const image=new Image();image.src='monstre-'+(i+1)+'.png';return image;})];
const monsterKinds=[1,0,2,5,15,3,4,6,7,8,9,10,11,12,13,14];
const regularMonsters=[0,1,2,3,5,6,7,8,9,10,11];
const bossOrder=[4,12,13,14,15];
for(let i=5;i<monsterKinds.length;i++){
 const id=monsterKinds[i],boss=id>=11;
 arenaTypes.push({name:monsterNames[id-1],hp:boss?205:34+i*4,speed:boss?34:29+(i%4)*8,color:'#a66c8d',eye:'#ffe5b5',size:boss?24:13});
}
function isBoss(m){return monsterKinds[m.type]>=11}

let arena=null;
const arenaClamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function arenaRole(){return arenaRoles[skins.indexOf(selectedSkin)]??arenaRoles[0]}
const arenaBonusSets=[
 [['power','Puissance · +5 % dégâts'],['pace','Vitesse · +4 % déplacement'],['guard','Vitalité · +6 PV max et +8 PV']],
 [['tempo','Cadence · +4 % cadence'],['reach','Allonge · +5 % de portée'],['armor','Armure · dégâts reçus réduits de 4 %']],
 [['power','Puissance · +5 % dégâts'],['reach','Allonge · +5 % de portée'],['guard','Vitalité · +6 PV max et +8 PV']]
];
function arenaAnnouncement(screen,title,detail,delay,next){
 const a=arena, panel=$('arena-announcement');
 panel.classList.toggle('victory',screen==='arena-win');
 mode=screen;pointer=null;a.stick=null;arenaSpecialHud();
 $('arena-announcement-title').textContent=title;
 $('arena-announcement-detail').textContent=detail;
 panel.hidden=false;
 setTimeout(()=>{
  if(arena!==a||mode!==screen)return;
  panel.hidden=true;next();
 },delay);
}
function announceArenaStart(){
 nextArenaWave();arenaHud();
 arenaAnnouncement('arena-intro','Niveau '+arena.wave,arenaTheme(arena.wave)[0],1100,()=>{
  mode='arena';arenaSpecialHud();
 });
}
function startArena(){
 startAccountRun();
 gameType='arena';game.dataset.play='arena';mode='arena-intro';pointer=null;gold=0;
 arena={x:w/2,y:h*.57,stick:null,side:1,hp:100,max:100,wave:0,done:0,kills:0,level:1,cooldown:0,inv:0,spawn:0,left:0,mobs:[],flashes:[],bolts:[],boss:null,time:0,power:1,pace:1,range:1,tempo:1,armor:1,drops:[],hasBossReward:false,rolled:false,hasUpgrade:false,boost:0,special:null,shield:0,haste:0,pulse:0,gate:0};
 $('arena-upgrades').hidden=true;$('opening').hidden=true;$('card').hidden=true;
 $('gold').textContent='◆ 0 or';
 announceArenaStart();syncMusic();
}
function arenaPressure(wave){return Math.min(1,Math.max(0,(wave-1)/9))}
function nextArenaWave(){
 arena.wave++;
 arena.left=Math.min(23,3+Math.ceil(arena.wave*1.55));
 arena.spawn=.45;
 if(arena.wave%3===0)arena.boss=arenaSpawn(bossOrder[(arena.wave/3-1)%bossOrder.length]);
}
function arenaHudBottom(){
 const height=$('arena-hud').offsetHeight;
 const cssHeight=canvas.clientHeight;
 return height&&cssHeight?Math.ceil(height*h/cssHeight):0;
}
function arenaMinY(){
 return Math.min(h-20,arenaHudBottom()+56);
}
function arenaDoorY(top){
 return Math.max(arenaMinY(),h*(top?.30:.73));
}
function arenaSpawn(type){
 const unit=arenaTypes[type];
 const door=arena.gate++%4;
 const x=door%2?w-19:19,y=arenaDoorY(door<2);
 const pressure=arenaPressure(arena.wave);
 const early=monsterKinds[type]>=11?.59+pressure*.41:.74+pressure*.26;
 const hp=Math.round(unit.hp*early*(1+Math.max(0,arena.wave-1)*.11));
 const mob={x,y,hp,max:hp,type,hit:0,fire:1.7};
 arena.mobs.push(mob);return mob;
}
function aimArena(e,begin=false){
 const box=canvas.getBoundingClientRect();
 const x=(e.clientX-box.left)*w/box.width,y=(e.clientY-box.top)*h/box.height;
 if(begin||!arena.stick)arena.stick={x,y,dx:0,dy:0};
 const stick=arena.stick,dx=x-stick.x,dy=y-stick.y;
 const scale=Math.max(27,Math.hypot(dx,dy));
 stick.dx=dx/scale;stick.dy=dy/scale;
}
function arenaDamage(amount){
 const a=arena;if(a.inv||a.shield>0)return;
 amount=Math.max(1,Math.round(amount*a.armor));
 a.hp=Math.max(0,a.hp-amount);a.inv=.6;
 a.flashes.push({x:a.x,y:a.y-36,style:'hurt',amount,life:.45});
}
function arenaHud(){
 const a=arena;
 const info={
  'arena-stage-name':'Arène '+a.wave+' · '+arenaTheme(a.wave)[0],
  'arena-hud-gold':'◆ '+gold+' or',
  'arena-hp-label':'Points de vie · '+selectedSkin.name,
  'arena-hp-value':Math.ceil(a.hp)+' / '+a.max
 };
 for(const [id,value] of Object.entries(info)){const item=$(id);if(item.textContent!==value)item.textContent=value}
 const bar=$('arena-hp-bar');
 if(bar.max!==a.max)bar.max=a.max;
 if(bar.value!==a.hp)bar.value=a.hp;
 $('zone').textContent=a.boss?'BOSS · '+arenaTypes[a.boss.type].name.toUpperCase():arenaTheme(a.wave)[0]+' · '+(a.boost>0?arenaBoosts[a.boostKind].label+' '+Math.ceil(a.boost)+' s':arenaRole()[1]);
}
function arenaSpecialHud(){
 const button=$('arena-special'), power=arena?.special;
 button.hidden=mode!=='arena'||!power;
 if(power){button.textContent=power.icon;button.setAttribute('aria-label',power.name);button.title=power.name}
}
function finishArenaWave(){
 const a=arena;
 a.done++;a.level++;a.max+=6;a.hp=Math.min(a.max,a.hp+30);
 const reward=8+a.wave*3+(a.wave%3===0?12:0);
 earn(reward);
 submitScore('arena',a.done,reward,crypto.randomUUID());
 a.bolts=[];
 a.chestReward=reward;
 mode='arena-settle';arenaSpecialHud();
 arenaHud();
 $('arena-chest').hidden=false;
}
function collectArenaChest(){
 if(mode!=='arena-settle')return;
 $('arena-chest').hidden=true;
 pointer=null;arena.stick=null;
 openArenaRewards(arena,arena.chestReward);
}
$('arena-chest').onclick=collectArenaChest;
function stepArenaChest(dt){
 const a=arena;
 a.flashes=a.flashes.filter(f=>(f.life-=dt)>0);
 if(a.attack)a.attack.life=Math.max(0,a.attack.life-dt);
 moveArenaPlayer(a,dt);
 const chest=$('arena-chest');
 const y=Math.max(arenaMinY(),(chest.getBoundingClientRect().bottom-canvas.getBoundingClientRect().top)*h/canvas.clientHeight);
 if(pointer!==null&&Math.abs(a.x-w/2)<26&&a.y>=y-18&&a.y<=y+20)collectArenaChest();
}
function openArenaRewards(a,reward){
 mode='arena-upgrade';
 $('arena-reward').textContent='Arène '+a.done+' terminée · +'+reward+' pièces';
 a.hasBossReward=a.wave%3===0;a.rolled=false;a.rolling=false;a.pendingUpgrade=null;
 $('boss-face').textContent='';$('boss-die').hidden=true;$('boss-die').classList.remove('rolling');arenaSpecialHud();
 $('boss-roll').hidden=!a.hasBossReward;$('boss-roll').disabled=false;
 $('boss-result').textContent=a.hasBossReward?(a.special?'Le nouveau lancer remplacera ton pouvoir en réserve.':'Lance le D20 pour continuer.'):'';
 $('arena-next').hidden=a.hasBossReward;$('arena-next').disabled=true;
 $('arena-menu-title').textContent=a.hasBossReward?'Récompense du boss':'Choisis un bonus';
 const options=arenaBonusSets[(a.done-1)%arenaBonusSets.length];
 document.querySelectorAll('[data-arena-upgrade]').forEach((button,i)=>{
  const [id,label]=options[i];button.dataset.arenaUpgrade=id;
  button.textContent=label;button.hidden=a.hasBossReward;button.disabled=a.hasBossReward;button.setAttribute('aria-pressed','false');
 });
 $('arena-upgrades').hidden=false;
 arenaHud();
}
function arenaEnd(now){
 mode='over';overAt=now;pointer=null;arenaSpecialHud();
 submitScore('arena',arena.done,0);
 $('eyebrow').textContent='FUMBLE ARENA';$('title').textContent=arena.done+' arène'+(arena.done===1?'':'s');
 $('instructions').textContent=arena.kills+' monstres vaincus · '+gold+' pièces d’or';
 $('prompt').textContent='TOUCHE POUR REJOUER';$('card').hidden=false;
}
function moveArenaPlayer(a,dt){
 if(pointer!==null&&a.stick){
  const {dx,dy}=a.stick;
  a.x+=dx*165*a.pace*dt;a.y+=dy*165*a.pace*dt;
  if(Math.abs(dx)>.06)a.side=Math.sign(dx);
 }
 a.x=arenaClamp(a.x,15,w-15);a.y=arenaClamp(a.y,arenaMinY(),h-20);
}
function stepArena(dt,now){
 const a=arena,[,,style,baseReach,base,rate]=arenaRole(),reach=baseReach*a.range;
 const pressure=arenaPressure(a.wave);
 const [weapon,boostKind,tint]=equippedGear(),boost=a.boost>0?arenaBoosts[a.boostKind]:null;
 a.time+=dt;a.shield=Math.max(0,a.shield-dt);a.haste=Math.max(0,a.haste-dt);a.pulse=Math.max(0,a.pulse-dt);a.boost=Math.max(0,a.boost-dt);a.inv=Math.max(0,a.inv-dt);a.cooldown-=dt;
 if(a.attack)a.attack.life-=dt;
 a.flashes=a.flashes.filter(f=>(f.life-=dt)>0);
 moveArenaPlayer(a,dt);
 a.spawn-=dt;
 if(a.left>0&&a.spawn<=0){
  a.left--;a.spawn=Math.max(.30,1.24-a.wave*.083);
  const pool=Math.min(regularMonsters.length,3+Math.floor(a.wave/2));
  arenaSpawn(regularMonsters[Math.floor(Math.random()*pool)]);
 }
 let closest=null,min=reach;
 for(const m of a.mobs){
  const type=arenaTypes[m.type],dx=a.x-m.x,dy=a.y-m.y,d=Math.hypot(dx,dy);
  if(d<min){closest=m;min=d}
  if(d>4){const k=Math.min(d,type.speed*(.78+.22*pressure)*dt)/d;m.x+=dx*k;m.y+=dy*k}
  if(isBoss(m)){
   if(m.cast){
    m.cast.left-=dt;
    if(m.cast.left<=0){
     const {angle}=m.cast;
     for(const spread of [-.22,0,.22])a.bolts.push({x:m.x,y:m.y-12,dx:Math.cos(angle+spread)*155,dy:Math.sin(angle+spread)*155,life:2.6});
     m.cast=null;m.fire=2;
    }
   }else if((m.fire-=dt)<=0&&d>10){
    m.cast={left:.65,angle:Math.atan2(a.y-m.y,a.x-m.x)};
   }
  }
  if(d<type.size+9)arenaDamage((isBoss(m)?25:m.type===3?19:12)*(.64+.36*pressure));
  m.hit=Math.max(0,m.hit-dt);
 }
 if(closest&&a.cooldown<=0){
  a.cooldown=rate*a.tempo*(boost?.delay??1)*(a.haste>0?.5:1);
  const targets=style==='cleave'?a.mobs.filter(m=>Math.hypot(m.x-a.x,m.y-a.y)<=reach):[closest];
  for(const m of targets){m.hp-=Math.round(base*(style==='bolt'?.63:1)*a.power*(boost?.damage??1)*(1+(a.level-1)*.09));m.hit=.14}
  a.attack={life:.28,angle:Math.atan2(closest.y-a.y,closest.x-a.x),weapon,tint};
  a.flashes.push({x:closest.x,y:closest.y,fromX:a.x,fromY:a.y-18,style,weapon,tint,life:.28});
 }
 for(const b of a.bolts){
  b.x+=b.dx*dt;b.y+=b.dy*dt;b.life-=dt;
  if(!a.inv&&Math.hypot(b.x-a.x,b.y-a.y+8)<13){arenaDamage(19*(.64+.36*pressure));b.life=0}
 }
 a.bolts=a.bolts.filter(b=>b.life>0);
 a.mobs=a.mobs.filter(m=>{
  if(m.hp>0)return true;
  a.kills++;
  if(a.boss===m)a.boss=null;
  else if(Math.random()<.31)a.drops.push({x:m.x,y:m.y,kind:Math.random()<.56?'heal':boostKind,life:13});
  return false;
 });
 for(const drop of a.drops){
  drop.life-=dt;
  if(Math.hypot(drop.x-a.x,drop.y-a.y)<19){
   if(drop.kind==='heal')a.hp=Math.min(a.max,a.hp+16);else{a.boostKind=drop.kind;a.boost=arenaBoosts[drop.kind].seconds;}
   a.flashes.push({x:drop.x,y:drop.y-20,style:'pickup',amount:drop.kind==='heal'?'+16 PV':arenaBoosts[drop.kind].label,life:.55});
   drop.life=0;
  }
 }
 a.drops=a.drops.filter(drop=>drop.life>0);
 if(a.hp<=0){a.hp=0;arenaHud();arenaEnd(now);return}
 if(!a.left&&!a.mobs.length)finishArenaWave();
 arenaHud();
}
function drawArenaFloor(a){
 const [,wall,stone,alt,trim,light,detail]=arenaTheme(a.wave);
 rect(0,0,w,h,wall);
 for(let y=70;y<h;y+=22)for(let x=0;x<w;x+=34){
  const col=Math.floor(x/34),row=Math.floor(y/22),seed=(col*17+row*29+a.wave*13)%37;
  rect(x,y,33,21,seed%3?stone:alt);
  if(seed%5===0)rect(x+7,y+13,9,2,trim);
  if(seed%11!==0)continue;
  if(detail==='bones'){rect(x+6,y+8,13,2,light);rect(x+5,y+6,4,6,trim);rect(x+17,y+6,4,6,trim)}
  if(detail==='roots')poly([[x+2,y+17],[x+10,y+8],[x+16,y+10],[x+25,y+3],[x+21,y+14],[x+12,y+12]],trim);
  if(detail==='forge'){rect(x+3,y+8,24,5,wall);for(let j=5;j<26;j+=5)rect(x+j,y+9,2,3,light)}
  if(detail==='ice')poly([[x+8,y+17],[x+13,y+3],[x+17,y+9],[x+22,y+5],[x+23,y+17]],light);
  if(detail==='runes'){ctx.save();ctx.globalAlpha=.62;poly([[x+17,y+4],[x+23,y+10],[x+17,y+17],[x+11,y+10]],light);rect(x+15,y+8,4,5,stone);ctx.restore()}
  if(detail==='ruins'){rect(x+6,y+10,8,6,trim);rect(x+15,y+6,10,9,wall);rect(x+17,y+7,7,2,light)}
 }
 // Decorative banners, masonry and flickering motes frame the play area.
 for(const x of [w*.28,w*.72]){
  rect(x-11,72,22,2,trim);
  poly([[x-8,74],[x+8,74],[x+8,94],[x,99],[x-8,94]],alt);
  poly([[x,78],[x+4,85],[x,91],[x-4,85]],light);
 }
 for(let i=0;i<9;i++){
  const x=(i*71+a.wave*19)%w,y=92+(i*37+a.wave*11)%Math.max(1,h-100);
  const flicker=Math.sin(a.time*3+i);
  if(flicker>0)rect(x+flicker*3,y-flicker*5,2,2,light);
 }
 for(let x=4;x<w-4;x+=18){
  rect(x,h-13,15,2,trim);rect(x+4,h-10,1,7,wall);
 }
 for(const y of [arenaDoorY(true),arenaDoorY(false)])for(const x of [19,w-19]){
  rect(x-16,y-19,32,24,trim);rect(x-11,y-24,22,8,trim);rect(x-12,y-16,24,21,'#171421');
  for(let i=-9;i<=9;i+=6)rect(x+i,y-15,2,14,stone);
  rect(x-14,y+5,28,3,light);
  rect(x-15,y-9,2,5,light);rect(x+13,y-9,2,5,light);
 }
 rect(0,arenaHudBottom(),w,3,trim);
 for(const x of [13,w-13])for(let y=91;y<h;y+=82){
  rect(x-5,y-1,10,14,wall);rect(x-3,y,6,11,trim);
  const flicker=Math.floor(Math.sin(a.time*12+y)*2);
  rect(x-3,y-6,6,7,trim);rect(x-1,y-8-flicker,3,8,light);
 }
}
function drawArenaImpact(f){
 const t=arenaClamp(1-f.life/.28,0,1);
 ctx.save();
 if(f.style==='bolt'){
  const travel=Math.min(1,t*1.65);
  const dx=f.x-f.fromX,dy=f.y-12-f.fromY;
  ctx.translate(f.fromX+dx*travel,f.fromY+dy*travel);
  ctx.rotate(Math.atan2(dy,dx));
  if(f.weapon==='bow'){
   rect(-14,-1,23,2,'#ddc194');poly([[8,-4],[15,0],[8,4]],f.tint);
   rect(-15,-3,5,6,'#ddf0bd');
  }else if(f.weapon==='dagger'){
   rect(-8,-1,7,2,'#a56e4c');poly([[-2,-3],[10,0],[-2,3]],f.tint);
  }else if(f.weapon==='beast'){
   for(let j=-1;j<=1;j++)poly([[-8,j*5],[8,j*5-4],[3,j*5+2]],f.tint);
  }else{
   for(let j=0;j<4;j++)rect(-j*5,-2+(j%2)*3,4,3,f.tint);
   poly([[0,-6],[8,0],[0,6],[-5,0]],f.tint);
   rect(0,-2,4,4,'#fff5cb');
  }
  ctx.restore();
 }else ctx.restore();
 if(t>.34){
  const burst=(t-.34)*22;
  ctx.save();ctx.globalAlpha=1-t;
  for(let i=0;i<7;i++){
   const angle=i*Math.PI*2/7;
   rect(f.x+Math.cos(angle)*burst,f.y-12+Math.sin(angle)*burst,2+i%2,2,f.tint);
  }
  ctx.restore();
 }
}
function drawArenaWeapon(a){
 const {angle,life,weapon,tint}=a.attack,t=1-life/.28;
 if(['spell','bow','thorn','beast'].includes(weapon)){
  ctx.save();ctx.translate(a.x,a.y-19);ctx.rotate(angle);
  if(weapon==='bow'){
   poly([[9,-11],[16,-7],[18,0],[16,7],[9,11],[13,5],[14,0],[13,-5]],'#c49c69');
   rect(9,-9,1,18,'#f6e8bd');
  }else{
   ctx.globalAlpha=1-t;rect(13,-4,7,8,tint);rect(15,-6,3,12,'#fff1c4');
  }
  ctx.restore();return;
 }
 const swing=angle+(t-.48)*(weapon==='dagger'?1.15:2.2);
 ctx.save();ctx.translate(a.x,a.y-15);ctx.rotate(swing);
 ctx.globalAlpha=.31*(1-t);
 poly([[5,-2],[27,-17],[39,-10],[43,1],[32,8],[33,-3],[26,-9]],tint);
 ctx.globalAlpha=1;rect(4,-2,15,4,'#806045');rect(15,-4,4,8,'#d2b176');
 if(weapon==='axe')poly([[22,-10],[34,-12],[39,-7],[37,3],[27,6],[23,3]],tint);
 else if(weapon==='hammer'){rect(22,-8,14,16,tint);rect(24,-6,3,11,'#fbdfad')}
 else poly([[18,-3],[weapon==='dagger'?30:40,0],[18,4]],tint);
 ctx.restore();
}
function drawArena(){
 const a=arena;
 a.y=arenaClamp(a.y,arenaMinY(),h-20);
 drawArenaFloor(a);
 for(const m of a.mobs){
  const u=arenaTypes[m.type],r=u.size,x=m.x,y=m.y;
  const sprite=monsterArt[monsterKinds[m.type]],face=a.x<x?-1:1;
  if(sprite?.complete&&sprite.naturalWidth){
   const height=isBoss(m)?65:m.type===3?45:37,width=height*sprite.naturalWidth/sprite.naturalHeight;
   const hop=Math.round(Math.abs(Math.sin(a.time*(isBoss(m)?5:10)+m.max))*3);
   ctx.save();ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y-hop));ctx.scale(face,1);
   if(m.hit)ctx.filter='brightness(1.35)';
   ctx.drawImage(sprite,-Math.round(width/2),-height,width,height);ctx.restore();
  }else if(isBoss(m)){
   poly([[x-r*1.8,y-22],[x-r,y-34],[x-4,y-14],[x+4,y-14],[x+r,y-34],[x+r*1.8,y-22],[x+r*.65,y]],'#843d53');
   rect(x-r*.65,y-27,r*1.3,27,m.hit?'#ffe5be':u.color);
   rect(x-r*.4,y-33,r*.8,7,'#f29362');
  }else{
   rect(x-r*.63,y-12,r*1.26,16,m.hit?'#ffe5be':u.color);
   rect(x-r*.55,y-19,r*1.1,10,m.hit?'#ffe5be':u.color);
   if(m.type===1){rect(x-r,y-16,r*2,3,u.color)}
  }
  if(!sprite?.naturalWidth){rect(x-5,y-15,3,3,u.eye);rect(x+3,y-15,3,3,u.eye)}
  if(m.cast){
   ctx.save();ctx.globalAlpha=.44;
   const angle=m.cast.angle,fx=x+Math.cos(angle)*105,fy=y-12+Math.sin(angle)*105;
   poly([[x,y-12],[fx-14*Math.sin(angle),fy+14*Math.cos(angle)],[fx+14*Math.sin(angle),fy-14*Math.cos(angle)]],'#f9a052');
   ctx.restore();
  }
  rect(x-r,y-40,r*2,2,'#231c2a');rect(x-r,y-40,r*2*m.hp/m.max,2,'#eb876e');
 }
 for(const b of a.bolts){rect(b.x-5,b.y-4,10,8,'#e46543');rect(b.x-2,b.y-2,4,4,'#ffe299')}
 for(const d of a.drops){
  const y=d.y-7-Math.round(Math.sin(a.time*6+d.x)*3);
  rect(d.x-7,y-5,14,11,'#31263d');
  rect(d.x-5,y-4,10,9,d.kind==='heal'?'#70bd83':arenaBoosts[d.kind].color);
  if(d.kind==='heal'){rect(d.x-1,y-3,3,7,'#f9f6d1');rect(d.x-3,y-1,7,3,'#f9f6d1')}
  else poly([[d.x,y-4],[d.x+4,y],[d.x,y+5],[d.x-4,y]],'#ffeb9f');
 }
 for(const f of a.flashes){
  if(f.style==='pickup'){ctx.fillStyle='#c8edab';ctx.font='bold 12px monospace';ctx.fillText(f.amount,f.x,f.y-(.55-f.life)*24);continue}
  if(f.style==='hurt'){ctx.fillStyle='#ff8d79';ctx.font='bold 12px monospace';ctx.fillText('-'+f.amount,f.x,f.y-(.45-f.life)*28);continue}
  drawArenaImpact(f);
 }
 if(a.attack?.life>0)drawArenaWeapon(a);
 ctx.save();if(a.inv&&Math.floor(a.time*18)%2)ctx.filter='brightness(1.35)';
 if(a.attack?.life>0){
  const t=Math.sin((.28-a.attack.life)/.28*Math.PI);
  ctx.translate(Math.cos(a.attack.angle)*t*7,Math.sin(a.attack.angle)*t*5);
 }
 const moving=pointer!==null&&a.stick&&Math.hypot(a.stick.dx,a.stick.dy)>.08;
 drawSkin(a.x,a.y,moving?'run':a.attack?.life>0?'land':'idle',a.time*18,a.side);ctx.restore();
 if(a.shield>0||a.pulse>0){
  ctx.save();ctx.strokeStyle=a.shield>0?'#9ae8ff':'#ffd17a';ctx.lineWidth=3;ctx.globalAlpha=a.shield>0?.8:a.pulse/.55;
  ctx.beginPath();ctx.arc(a.x,a.y-18,a.shield>0?25:20+(1-a.pulse/.55)*105,0,Math.PI*2);ctx.stroke();ctx.restore();
 }

}
document.querySelectorAll('[data-arena-upgrade]').forEach(button=>{
 button.onclick=()=>{
  if(mode!=='arena-upgrade'||arena.hasBossReward)return;
  arena.pendingUpgrade=button.dataset.arenaUpgrade;
  document.querySelectorAll('[data-arena-upgrade]').forEach(choice=>{
   choice.setAttribute('aria-pressed',String(choice===button));
  });
  $('arena-next').disabled=false;
 };
});

$('play-arena').onclick=startArena;

$('arena-next').onclick=()=>{
 if(mode!=='arena-upgrade'||arena.rolling||!(arena.hasBossReward?arena.rolled:arena.pendingUpgrade))return;
 const upgrade=arena.pendingUpgrade;arena.pendingUpgrade=null;
 if(upgrade==='power')arena.power*=1.05;
 if(upgrade==='pace')arena.pace=Math.min(1.65,arena.pace*1.04);
 if(upgrade==='guard'){arena.max+=6;arena.hp=Math.min(arena.max,arena.hp+8)}
 if(upgrade==='tempo')arena.tempo/=1.04;
 if(upgrade==='reach')arena.range*=1.05;
 if(upgrade==='armor')arena.armor*=.96;
 $('arena-upgrades').hidden=true;announceArenaStart();
};
function arenaPowerFor(roll){
 if(roll>=18)return {kind:'burst',name:'Onde du dragon · dégâts de zone',icon:'✷',amount:95};
 if(roll>=11)return {kind:'haste',name:'Élan fulgurant · attaques accélérées',icon:'⚡',seconds:roll>=15?9:6};
 return {kind:'shield',name:'Bouclier · bloque les dégâts',icon:'⬢',seconds:roll>=6?7:4};
}
$('boss-roll').onclick=()=>{
 const a=arena;
 if(mode!=='arena-upgrade'||!a.hasBossReward||a.rolled||a.rolling)return;
 a.rolling=true;$('boss-roll').disabled=true;$('arena-next').disabled=true;
 const die=$('boss-die');
 die.hidden=false;die.classList.add('rolling');$('boss-result').textContent='';
 const roll=1+Math.floor(Math.random()*20);
 setTimeout(()=>{
  if(arena!==a||mode!=='arena-upgrade')return;
  a.rolling=false;a.rolled=true;a.special=arenaPowerFor(roll);
  die.classList.remove('rolling');$('arena-next').disabled=false;$('arena-next').hidden=false;
  $('boss-face').textContent=roll;
  $('boss-result').textContent=roll+' sur 20 · '+a.special.name+' en réserve.';
 },750);
};
$('arena-special').onclick=()=>{
 if(mode!=='arena'||!arena.special)return;
 const a=arena,p=a.special;a.special=null;
 if(p.kind==='shield')a.shield=p.seconds;
 if(p.kind==='haste'){a.haste=p.seconds;a.cooldown=0}
 if(p.kind==='burst'){
  a.pulse=.55;
  for(const m of a.mobs)if(Math.hypot(m.x-a.x,m.y-a.y)<125){m.hp-=p.amount;m.hit=.28}
 }
 arenaSpecialHud();
};
