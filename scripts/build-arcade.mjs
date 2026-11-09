import fs from 'node:fs';
const types={html:'text/html; charset=utf-8',png:'image/png',wav:'audio/wav',mp4:'video/mp4',js:'text/javascript; charset=utf-8'};
const assets={};
for(const name of fs.readdirSync('web')){
 const type=types[name.split('.').pop()];
 if(type)assets[name]=[type,fs.readFileSync('web/'+name).toString('base64')];
}
fs.mkdirSync('dist/server',{recursive:true});
const worker=fs.readFileSync('worker/index.mjs','utf8').replace("import { assets } from './assets.mjs';",'const assets='+JSON.stringify(assets)+';');
fs.writeFileSync('dist/server/index.js',worker);
