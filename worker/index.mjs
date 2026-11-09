import { assets } from './assets.mjs';

const DAY=86400000, encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(24)));
const hash=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
async function passwordHash(password,salt){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256));
}
function same(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
function reply(data,status=200,headers={}){
 return Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
}
function cookie(token,maxAge){
 return 'fdc_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+maxAge;
}
function bind(db,sql,...values){return db.prepare(sql).bind(...values)}
async function login(db,id){
 const token=random();
 await bind(db,'INSERT INTO sessions VALUES (?,?,?)',await hash(token),id,Date.now()+30*DAY).run();
 return reply({ok:true},200,{'Set-Cookie':cookie(token,30*86400)});
}
async function actor(request,db){
 const owner=request.headers.get('oai-authenticated-user-email')?.toLowerCase()==='axel.parra06@gmail.com'&&request.headers.get('oai-authenticated-user-id');
 if(owner){
  await bind(db,"INSERT OR IGNORE INTO players(id,name,name_key,role) VALUES ('owner','Axel','axel','admin')").run();
  return {id:'owner',name:'Axel',role:'admin'};
 }
 const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)fdc_session=([a-f0-9]{48})(?:;|$)/)?.[1];
 if(!token)return null;
 return bind(db,'SELECT p.id,p.name,p.role FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.token_hash=? AND s.expires>?',await hash(token),Date.now()).first();
}
function validPassword(value){return typeof value==='string'&&value.length>=8&&value.length<=128}
async function readWallet(db,playerId){
 const [wallet,{results}]=await Promise.all([
  bind(db,'SELECT gold,equipped FROM arcade_wallet WHERE player_id=?',playerId).first(),
  bind(db,'SELECT skin FROM arcade_skins WHERE player_id=?',playerId).all()
 ]);
 return {gold:wallet?.gold??0,equipped:wallet?.equipped??'gobelin',owned:['gobelin',...results.map(row=>row.skin)]};
}
async function api(request,db,url){
 const route=url.pathname.slice(5), now=Date.now();
 if(request.method==='GET'){
  if(route==='me'){
   const player=await actor(request,db);
   if(!player)return reply({player:null});
   return reply({player,wallet:await readWallet(db,player.id)});
  }
  if(route==='scores'){
   const requested=url.searchParams.get('game'),game=['tower','arena'].includes(requested)?requested:'run';
   const {results}=await bind(db,'SELECT p.name,s.score FROM scores s JOIN players p ON s.player_id=p.id WHERE game=? ORDER BY score DESC,p.name LIMIT 10',game).all();
   return reply({scores:results});
  }
  if(route==='players'){
   const player=await actor(request,db);
   if(player?.role!=='admin')return reply({error:'Accès administrateur requis.'},403);
   const {results}=await bind(db,"SELECT id,name FROM players WHERE role='player' ORDER BY name LIMIT 500").all();
   return reply({players:results});
  }
  return reply({error:'Route inconnue.'},404);
 }
 if(request.method!=='POST'||request.headers.get('Origin')!==url.origin)return reply({error:'Requête refusée.'},403);
 const raw=await request.text();
 if(raw.length>2048)return reply({error:'Requête trop longue.'},413);
 let body;try{body=JSON.parse(raw)}catch{return reply({error:'Requête invalide.'},400)}
 if(!body||typeof body!=='object')return reply({error:'Requête invalide.'},400);
 if(route==='register'||route==='login'){
  const name=typeof body.name==='string'?body.name.trim().normalize('NFC'):'';
  if(!/^[\p{L}\p{N}][\p{L}\p{N} _-]{1,23}$/u.test(name)||!validPassword(body.password))return reply({error:'Pseudo de 2 à 24 caractères et mot de passe de 8 à 128 caractères requis.'},400);
  if(name.toLowerCase()==='axel')return reply({error:'Le compte Axel est lié à son accès propriétaire.'},403);
  const key=name.toLocaleLowerCase('fr');
  if(route==='register'){
   const id=crypto.randomUUID(),salt=random(), password=await passwordHash(body.password,salt);
   const added=await bind(db,'INSERT OR IGNORE INTO players(id,name,name_key,password,salt) VALUES (?,?,?,?,?)',id,name,key,password,salt).run();
   if(!added.meta.changes)return reply({error:'Ce pseudo est déjà utilisé.'},409);
   return login(db,id);
  }
  const p=await bind(db,'SELECT * FROM players WHERE name_key=?',key).first();
  if(p?.retry_at>now)return reply({error:'Trop de tentatives. Réessaie dans quelques minutes.'},429);
  const valid=same(await passwordHash(body.password,p?.salt??'fdc-login-fallback'),p?.password);
  if(!valid){
   if(p)await bind(db,'UPDATE players SET failures=CASE WHEN failures>=4 THEN 0 ELSE failures+1 END,retry_at=CASE WHEN failures>=4 THEN ? ELSE 0 END WHERE id=?',now+300000,p.id).run();
   return reply({error:'Pseudo ou mot de passe incorrect.'},401);
  }
  await bind(db,'UPDATE players SET failures=0,retry_at=0 WHERE id=?',p.id).run();
  return login(db,p.id);
 }
 if(route==='reset'){
  if(!validPassword(body.password)||typeof body.token!=='string'||!/^[a-f0-9]{48}$/.test(body.token))return reply({error:'Lien ou mot de passe invalide.'},400);
  const resetHash=await hash(body.token);
  const p=await bind(db,'SELECT id FROM players WHERE reset_hash=? AND reset_until>?',resetHash,now).first();
  if(!p)return reply({error:'Lien expiré ou déjà utilisé.'},400);
  const salt=random(), password=await passwordHash(body.password,salt);
  const changed=await bind(db,'UPDATE players SET password=?,salt=?,reset_hash=NULL,reset_until=NULL,failures=0,retry_at=0 WHERE id=? AND reset_hash=? AND reset_until>?',password,salt,p.id,resetHash,Date.now()).run();
  if(!changed.meta.changes)return reply({error:'Lien expiré ou déjà utilisé.'},400);
  await bind(db,'DELETE FROM sessions WHERE player_id=?',p.id).run();
  return login(db,p.id);
 }
 if(route==='logout'){
  const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)fdc_session=([a-f0-9]{48})(?:;|$)/)?.[1];
  if(token)await bind(db,'DELETE FROM sessions WHERE token_hash=?',await hash(token)).run();
  return reply({ok:true},200,{'Set-Cookie':cookie('',0)});
 }
 const player=await actor(request,db);
 if(!player)return reply({error:'Connecte-toi pour continuer.'},401);
 if(route==='reset-link'){
  if(player.role!=='admin')return reply({error:'Accès administrateur requis.'},403);
  const token=random();
  const result=await bind(db,"UPDATE players SET reset_hash=?,reset_until=? WHERE id=? AND role='player'",await hash(token),now+3600000,body.id??'').run();
  return result.meta.changes?reply({link:url.origin+'/#reset='+token}):reply({error:'Joueur introuvable.'},404);
 }
 if(route==='skin'){
  if(body.playerId!==undefined&&body.playerId!==player.id)return reply({error:'Reconnecte-toi pour modifier tes skins.'},403);
  if(typeof body.id!=='string'||!/^skin-(?:[1-9]|1[0-9]|2[0-4])$|^gobelin$/.test(body.id))return reply({error:'Skin inconnu.'},400);
  await bind(db,'INSERT OR IGNORE INTO arcade_wallet(player_id) VALUES (?)',player.id).run();
  if(body.buy&&player.role!=='admin'&&body.id!=='gobelin'){
   await bind(db,'INSERT OR IGNORE INTO arcade_skins SELECT ?,? WHERE EXISTS (SELECT 1 FROM arcade_wallet WHERE player_id=? AND gold>=2500)',player.id,body.id,player.id).run();
  }
  const owned=body.id==='gobelin'||player.role==='admin'||await bind(db,'SELECT 1 FROM arcade_skins WHERE player_id=? AND skin=?',player.id,body.id).first();
  if(!owned)return reply({error:'Ce skin coûte 2 500 pièces d’or.'},400);
  if(!body.buy)await bind(db,'UPDATE arcade_wallet SET equipped=? WHERE player_id=?',body.id,player.id).run();
  return reply({wallet:await readWallet(db,player.id)});
 }
 if(route==='score'){
  if(body.playerId!==undefined&&body.playerId!==player.id)return reply({error:'Reconnecte-toi au compte de cette partie.'},403);
  if(!['run','tower','arena'].includes(body.game)||!Number.isSafeInteger(body.score)||body.score<0||body.score>1000000)return reply({error:'Score invalide.'},400);
  if(!Number.isSafeInteger(body.gold)||body.gold<0||body.gold>100000||typeof body.runId!=='string'||!/^[a-f0-9-]{36}$/.test(body.runId))return reply({error:'Partie invalide.'},400);
  await db.batch([
   bind(db,'INSERT OR IGNORE INTO arcade_runs VALUES (?,?,?)',player.id,body.runId,body.gold),
   bind(db,'INSERT INTO scores VALUES (?,?,?) ON CONFLICT(player_id,game) DO UPDATE SET score=max(score,excluded.score)',player.id,body.game,body.score)
  ]);
  return reply({ok:true});
 }
 return reply({error:'Route inconnue.'},404);
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/')){
  try{return await api(request,env.DB,url)}catch(error){console.error(error);return reply({error:'Service indisponible. Réessaie dans un instant.'},503)}
 }
 const path=url.pathname==='/'?'index.html':url.pathname.slice(1),asset=assets[path];
 if(!Array.isArray(asset))return new Response('Introuvable',{status:404});
 const [type,base64]=asset;
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 const headers=new Headers({'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
 let body=bytes,status=200;
 if(type==='video/mp4'){
  headers.set('Accept-Ranges','bytes');
  const range=/^bytes=(\d+)-(\d*)$/.exec(request.headers.get('Range')??'');
  if(range){
   const start=Number(range[1]),end=Math.min(bytes.length-1,range[2]?Number(range[2]):bytes.length-1);
   if(start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.length}});
   headers.set('Content-Range',`bytes ${start}-${end}/${bytes.length}`);
   body=bytes.subarray(start,end+1);
   status=206;
  }
  headers.set('Content-Length',String(body.length));
 }
 return new Response(request.method==='HEAD'?null:body,{status,headers});
}};
