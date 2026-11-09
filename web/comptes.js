'use strict';
let player=null, accountWallet=null, panelReturn=null, runAccount=null, runId=null;
const accountPanel=document.getElementById('account-panel');
const accountBody=document.getElementById('account-body');
const accountMessage=document.getElementById('account-message');
const accountStatus=document.getElementById('account-status');
const accountButton=document.getElementById('account-open');
async function arcadeApi(path,body){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{
  const response=await fetch('/api/'+path,{
   signal:controller.signal,
   ...(body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  });
  const result=await response.json();
  if(!response.ok)throw Error(result.error??'Service indisponible.');
  return result;
 }catch(error){
  if(controller.signal.aborted)throw Error('Le serveur met trop de temps à répondre. Réessaie.');
  if(error instanceof SyntaxError)throw Error('Service indisponible. Réessaie.');
  throw error;
 }finally{clearTimeout(timeout)}
}
function node(tag,label){
 const item=document.createElement(tag);if(label)item.textContent=label;return item;
}
function action(label,callback){
 const button=node('button',label);button.type='button';button.onclick=callback;return button;
}
async function guarded(callback){
 accountMessage.textContent='';
 try{await callback()}catch(error){accountMessage.textContent=error.message}
}
function openAccount(){
 if(accountPanel.hidden){
  panelReturn=mode;mode='account';pointer=null;duck=false;accountPanel.hidden=false;
 }
}
function closeAccount(){
 accountPanel.hidden=true;mode=panelReturn??'ready';panelReturn=null;
}
document.getElementById('account-close').onclick=closeAccount;
function updateAccount(){
 document.getElementById('account-name').textContent=player?'Bonjour '+player.name.trim().split(/\s+/)[0]:'Connexion';
 const treasure=document.getElementById('home-treasure');
 const balance=(accountWallet??wallet).gold;
 treasure.hidden=!player;
 treasure.textContent='Trésor · '+goldFormat.format(balance)+(balance===1?' pièce d’or':' pièces d’or');
 accountStatus.textContent=player?.role==='admin'?'Axel · Administrateur':player?'Connecté · '+player.name:'Invité';
}
let accountRefreshId=0;
async function refreshAccount(){
 const request=++accountRefreshId;
 const result=await arcadeApi('me');
 if(request!==accountRefreshId)return;
 player=result.player;accountWallet=result.wallet??null;
 if(player){selectedSkin=skins.find(s=>s.id===accountWallet?.equipped&&ownsSkin(s.id))??skins[0];}
 else{try{selectedSkin=skins.find(s=>s.id===localStorage.getItem('fdc-run-skin')&&ownsSkin(s.id))??skins[0]}catch{}}
 refreshEquipped();updateAccount();
 if(mode==='menu'&&!skinBusy)renderShop();
}
function passwordInput(form,autocomplete){
 const label=node('label','Mot de passe');
 const input=node('input');input.type='password';input.required=true;input.minLength=8;input.maxLength=128;input.autocomplete=autocomplete;
 label.append(input);
 const toggle=action('Afficher le mot de passe',()=>{
  const show=input.type==='password';input.type=show?'text':'password';
  toggle.textContent=show?'Masquer le mot de passe':'Afficher le mot de passe';
  toggle.setAttribute('aria-pressed',String(show));
 });
 toggle.setAttribute('aria-pressed','false');form.append(label,toggle);
 return input;
}
function addSoundSetting(){
 const setting=action('',toggleSound);
 setting.id='account-sound';
 accountBody.append(setting);
 updateSound();
}
function authForm(kind='login'){
 openAccount();accountMessage.textContent='';accountBody.replaceChildren();
 const create=kind==='register', form=node('form');
 const label=node('label','Pseudo'), name=node('input');name.required=true;name.minLength=2;name.maxLength=24;name.autocomplete='username';label.append(name);form.append(label);
 const password=passwordInput(form,create?'new-password':'current-password');
 const submit=node('button',create?'Créer mon compte':'Me connecter');
 form.append(submit);form.onsubmit=e=>{
  e.preventDefault();submit.disabled=true;
  guarded(async()=>{await arcadeApi(kind,{name:name.value,password:password.value});await refreshAccount();void flushScores();showAccount()}).finally(()=>{submit.disabled=false});
 };
 accountBody.append(node('h2',create?'Créer un compte':'Connexion'),form,action(create?'Déjà un compte ?':'Créer un compte',()=>authForm(create?'login':'register')));
 addSoundSetting();
}
function showAccount(){
 if(!player){authForm();return}
 openAccount();accountMessage.textContent='';
 accountBody.replaceChildren(node('h2',player.name),node('p',player.role==='admin'?'Administrateur · Tous les skins sont disponibles.':'Ton meilleur score par jeu apparaît au classement.'));
 addSoundSetting();
 if(player.role==='admin')accountBody.append(action('Gérer les mots de passe',showPlayers));
 else accountBody.append(action('Se déconnecter',()=>guarded(async()=>{await arcadeApi('logout',{});await refreshAccount();authForm()})));
}
function showPlayers(){
 openAccount();
 guarded(async()=>{
  const {players}=await arcadeApi('players');
  accountBody.replaceChildren(node('h2','Réinitialiser un mot de passe'),node('p','Génère un lien valable une heure et transmets-le au joueur.'));
  if(!players.length)accountBody.append(node('p','Aucun autre compte pour le moment.'));
  for(const p of players){
   const row=node('div');row.className='account-row';
   row.append(node('span',p.name),action('Générer un lien',()=>guarded(async()=>{
    const {link}=await arcadeApi('reset-link',{id:p.id});
    const existing=row.querySelector('input');if(existing)existing.remove();
    const input=node('input');input.readOnly=true;input.value=link;input.setAttribute('aria-label','Lien de récupération');
    row.append(input);input.select();
    try{await navigator.clipboard.writeText(link);accountMessage.textContent='Lien copié.'}catch{accountMessage.textContent='Copie le lien affiché.'}
   })));
   accountBody.append(row);
  }
 });
}
async function showScores(game='run'){
 openAccount();
 accountMessage.textContent='';
 const games={run:'Gobelin Run',tower:'Dungeon Jump',arena:'Fumble Arena'};
 const tabs=node('nav');tabs.className='score-tabs';tabs.setAttribute('aria-label','Classements par jeu');
 for(const [id,name] of Object.entries(games)){
  const button=action(name,()=>showScores(id));
  button.setAttribute('aria-pressed',String(id===game));
  tabs.append(button);
 }
 const status=node('p','Chargement du classement…');status.setAttribute('role','status');
 const board=node('section');board.className='quest-board';
 const kicker=node('p','Registre de la guilde');kicker.className='quest-kicker';
 board.append(kicker,node('h2','Tableau des hauts faits'),tabs,status);
 accountBody.replaceChildren(board);
 try{
  const {scores}=await arcadeApi('scores?game='+game);
  if(!status.isConnected)return;
  if(!scores.length){status.textContent='Aucun score enregistré pour ce jeu.';return}
  const table=node('table');table.className='score-table';table.setAttribute('aria-label','Classement de '+games[game]);
  const header=table.createTHead().insertRow();
  for(const label of ['Rang','Joueur',game==='arena'?'Arènes':'Score']){
   const cell=node('th',label);cell.scope='col';header.append(cell);
  }
  const body=table.createTBody();
  scores.forEach((entry,index)=>{
   const row=body.insertRow();
   row.classList.toggle('podium',index<3);
   row.classList.toggle('own-score',entry.name===player?.name);
   row.insertCell().textContent=['🥇 1','🥈 2','🥉 3'][index]??String(index+1);
   row.insertCell().textContent=entry.name;
   row.insertCell().textContent=goldFormat.format(entry.score)+(game==='arena'?'':' m');
  });
  status.replaceWith(table);
 }catch(error){
  if(status.isConnected)status.textContent=error.message;
 }
}
function showReset(token){
 openAccount();
 accountBody.replaceChildren(node('h2','Choisir un nouveau mot de passe'));
 const form=node('form'),password=passwordInput(form,'new-password'),submit=node('button','Enregistrer');
 form.append(submit);accountBody.append(form);
 form.onsubmit=e=>{
  e.preventDefault();submit.disabled=true;
  guarded(async()=>{await arcadeApi('reset',{token,password:password.value});history.replaceState(null,'',location.pathname);await refreshAccount();void flushScores();showAccount()}).finally(()=>{submit.disabled=false});
 };
}
function ownsSkin(id){return player?.role==='admin'||(accountWallet??wallet).owned.includes(id)}
function startAccountRun(){runAccount=player?.id??null;runId=crypto.randomUUID()}
const pendingScores=new Map();
const scorePrefix='fdc-pending-score:';
let savingScores=false;
async function flushScores(){
 if(savingScores||!player)return;
 const playerId=player.id;
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(key?.startsWith(scorePrefix+playerId+':'))pendingScores.set(key,JSON.parse(localStorage.getItem(key)));
  }
 }catch{}
 savingScores=true;
 try{
  for(const [key,score] of pendingScores){
   if(player?.id!==playerId)break;
   if(score.playerId!==playerId)continue;
   await arcadeApi('score',score);
   pendingScores.delete(key);
   try{localStorage.removeItem(key)}catch{}
   await refreshAccount();
  }
 }catch{
  accountStatus.textContent='Partie en attente de synchronisation';
 }finally{
  savingScores=false;
  if(player&&player.id!==playerId)void flushScores();
 }
}
function submitScore(game,score,reward=gold,receipt=runId){
 if(!runAccount)return;
 const key=scorePrefix+runAccount+':'+receipt;
 const result={playerId:runAccount,game,score:Math.floor(score),gold:reward,runId:receipt};
 pendingScores.set(key,result);
 try{localStorage.setItem(key,JSON.stringify(result))}catch{}
 void flushScores();
}
window.addEventListener('online',flushScores);
async function accountSkin(id,buy){
 const playerId=player.id;
 const {wallet:updatedWallet}=await arcadeApi('skin',{id,buy,playerId});
 if(player?.id!==playerId)return;
 ++accountRefreshId;
 accountWallet=updatedWallet;
 selectedSkin=skins.find(s=>s.id===updatedWallet.equipped)??skins[0];
 updateAccount();
 // A score credit may have arrived while the shop action was processing.
 void refreshAccount().catch(()=>{});
}
accountButton.onclick=showAccount;
document.getElementById('scores-open').onclick=()=>showScores();
refreshAccount().then(flushScores).catch(()=>{accountStatus.textContent='Comptes indisponibles'});
if(location.hash.startsWith('#reset='))showReset(location.hash.slice(7));
