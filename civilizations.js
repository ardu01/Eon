/* EON Civilization Systems v0.3 — MIT */
(function(){
const stages=[
{min:0,name:'Campamento nómada',building:'Refugios',government:'Consejo tribal'},
{min:12,name:'Aldea neolítica',building:'Cabañas y graneros',government:'Consejo de ancianos'},
{min:28,name:'Poblado de los metales',building:'Talleres y empalizadas',government:'Jefatura'},
{min:50,name:'Ciudad antigua',building:'Templos y murallas',government:'Ciudad-estado'},
{min:78,name:'Reino medieval',building:'Castillos y mercados',government:'Monarquía'},
{min:110,name:'Ciudad renacentista',building:'Palacios y academias',government:'Monarquía'},
{min:145,name:'Ciudad industrial',building:'Fábricas y estaciones',government:'Parlamento'},
{min:190,name:'Metrópolis moderna',building:'Hospitales y avenidas',government:'República'},
{min:245,name:'Ciudad digital',building:'Centros tecnológicos',government:'Democracia'},
{min:320,name:'Ciudad del futuro',building:'Torres inteligentes',government:'Federación'}];
function stage(c){let a=stages[0];for(const s of stages)if(c.tech>=s.min)a=s;return a}
function init(c){if(c.civVersion>=4)return;c.civVersion=4;c.farms=Math.max(4,c.farms||0);c.food=Math.max(500,c.food||0);c.wood=Math.max(160,c.wood||0);c.stone=Math.max(100,c.stone||0);c.houses=Math.max(5,c.houses||0);c.education=20;c.stability=75;c.prosperity=45;c.medicine=5;c.infrastructure=5;c.buildings=Array.isArray(c.buildings)?c.buildings:[];c.lastStage=stage(c).name;c.citizensBorn=0;c.citizensDied=0;c.buildings=c.buildings.filter(b=>land(Math.round(b.x),Math.round(b.y))&&tiles[idx(Math.round(b.x),Math.round(b.y))]!==4);for(let j=c.buildings.length;j<4;j++)addBuilding(c,j)}
const types=['Vivienda','Granja','Granero','Taller','Mercado','Escuela','Templo','Hospital','Fábrica','Universidad','Estación','Rascacielos'];
function available(c){let t=c.tech;return Math.min(types.length,t<12?3:t<28?4:t<50?5:t<78?7:t<145?8:t<190?10:t<245?11:12)}
function validSite(x,y,c){let ix=Math.round(x),iy=Math.round(y);if(!land(ix,iy))return false;if(tiles[idx(ix,iy)]===4)return false;if(Math.hypot(ix-c.x,iy-c.y)>16)return false;for(const city of cities)if(city!==c&&Math.hypot(ix-city.x,iy-city.y)<4)return false;for(const city of cities)for(const b of city.buildings||[])if(Math.hypot(ix-b.x,iy-b.y)<2.2)return false;return true}
function addBuilding(c,force){initSafe(c);if(c.buildings.length>=55)return false;let n=c.buildings.length,type=force===undefined?Math.floor(Math.random()*available(c)):force%available(c);for(let j=0;j<260;j++){let angle=(n+j)*2.399963,rad=2+Math.sqrt(n+j)*1.65,x=Math.round(c.x+Math.cos(angle)*rad),y=Math.round(c.y+Math.sin(angle)*rad);if(validSite(x,y,c)){c.buildings.push({id:'b'+c.id+n+'-'+j,type:types[type],x,y,level:1,year});return true}}return false}
function initSafe(c){if(!Array.isArray(c.buildings))c.buildings=[]}
for(const c of cities)init(c);
const prevUpdate=update;
update=function(){
for(const c of cities)init(c);
const before=new Map(cities.map(c=>[c.id,people.filter(p=>p.cityId===c.id).length]));
prevUpdate();
for(const c of cities){
init(c);const members=people.filter(p=>p.cityId===c.id),n=members.length;
const supply=c.farms*(4+c.tech*.055)+Math.max(2,n*.6);
c.food=Math.max(0,c.food+supply);
c.health=Math.min(100,c.health+(.15+c.medicine*.001));
c.education=Math.min(100,c.education+.005+n*.0004);
c.stability=Math.max(0,Math.min(100,c.stability+(c.food>n*2?.04:-.3)));
c.prosperity=Math.max(0,Math.min(100,c.prosperity+(c.food>n*3?.05:-.1)));
let old=before.get(c.id)||0;
if(n<old)c.citizensDied+=old-n;
else c.citizensBorn+=n-old;
if(n===0&&c.food>30){for(let i=0;i<8;i++){let p=createPerson(c.x+ri(5)-2,c.y+ri(5)-2,c);if(p){p.age=ri(24)+16;p.health=100;p.hunger=100}}log('Supervivientes repueblan '+c.name+'.')}
if(n>0&&n<10&&people.length<1600&&frame%3===0){let p=createPerson(c.x+ri(5)-2,c.y+ri(5)-2,c);if(p){p.age=ri(20)+12;p.health=100;p.hunger=100}}
if(frame%7===0&&c.buildings.length<Math.min(55,6+Math.floor(n/3)+Math.floor(c.tech/8))&&c.wood>20){if(addBuilding(c))c.wood-=20;}
if(stage(c).name!==c.lastStage){c.lastStage=stage(c).name;c.government=stage(c).government;log('🏛 '+c.name+' evoluciona: '+c.lastStage+'. Aparecen nuevas construcciones y formas de gobierno.');}
if(frame%30===0&&n>0){c.infrastructure=Math.min(100,c.infrastructure+.4);c.medicine=Math.min(100,c.medicine+.2);}
}
};
function drawBuilding(b,c){
const x=b.x,y=b.y,t=types.indexOf(b.type),eraIndex=stages.indexOf(stage(c));
ctx.save();ctx.translate(x,y);
ctx.fillStyle='#162e28aa';ctx.beginPath();ctx.ellipse(.3,.65,1.05,.35,0,0,7);ctx.fill();
if(t===1){ctx.fillStyle='#bd9d5b';ctx.fillRect(-.8,-.2,1.6,.7);ctx.strokeStyle='#e5c66e';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-.6+i*.4,-.2);ctx.lineTo(-.6+i*.4,-.65);ctx.stroke()}}
else if(t===0||t===2){ctx.fillStyle=eraIndex<4?'#c8a982':'#a7b6b2';ctx.beginPath();ctx.roundRect(-.7,-.45,1.4,1.1,.12);ctx.fill();ctx.fillStyle=eraIndex<5?'#91594a':'#566d76';ctx.beginPath();ctx.moveTo(-.95,-.45);ctx.lineTo(0,-1.25);ctx.lineTo(.95,-.45);ctx.fill();}
else if(t===11||eraIndex>=8){ctx.fillStyle='#9bbbc1';ctx.fillRect(-.65,-2.1,1.3,2.6);ctx.fillStyle='#b8f3ee';for(let j=0;j<4;j++)ctx.fillRect(-.4,-1.8+j*.5,.8,.14)}
else if(t===8||t===10){ctx.fillStyle='#82928e';ctx.fillRect(-1,-.9,2,1.5);ctx.fillStyle='#d0d5c8';ctx.fillRect(.5,-1.6,.3,.8)}
else {ctx.fillStyle=t===6?'#d4c29c':'#a8b4a9';ctx.fillRect(-.9,-.7,1.8,1.3);ctx.fillStyle='#687a77';ctx.beginPath();ctx.moveTo(-1,-.7);ctx.lineTo(0,-1.5);ctx.lineTo(1,-.7);ctx.fill();ctx.fillStyle='#f5d9a1';ctx.fillRect(-.2,-.35,.4,.45)}
ctx.restore()
}
const oldDraw=draw;
draw=function(){
oldDraw();
ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
for(const c of cities){init(c);for(const b of c.buildings){if(b.x*scale+ox>-40&&b.x*scale+ox<innerWidth+40&&b.y*scale+oy>-40&&b.y*scale+oy<innerHeight+40)drawBuilding(b,c)}}
ctx.restore();
};
const oldInspect=inspect;
inspect=function(type,obj,show=true){
oldInspect(type,obj,show);
if(type==='building'){let el=document.getElementById('inspector');el.innerHTML='<button style="float:right" id="closeBuilding">✕</button><small>CONSTRUCCIÓN</small><h2>'+esc(obj.type)+'</h2>'+kv('Nivel',obj.level)+kv('Año de construcción',obj.year<0?(-obj.year)+' a. C.':obj.year+' d. C.');document.getElementById('closeBuilding').onclick=()=>{el.classList.remove('show');selected=null};return}if(type!=='city')return;
init(obj);let el=document.getElementById('inspector');
let ext=document.createElement('div');ext.innerHTML='<h3 style="margin-top:18px">Sociedad y evolución</h3>'+kv('Etapa urbana',stage(obj).name)+kv('Edificios',obj.buildings.length)+kv('Educación',Math.round(obj.education)+'%')+kv('Estabilidad',Math.round(obj.stability)+'%')+kv('Prosperidad',Math.round(obj.prosperity)+'%')+kv('Medicina',Math.round(obj.medicine)+'%')+kv('Infraestructura',Math.round(obj.infrastructure)+'%')+kv('Nacimientos registrados',obj.citizensBorn)+kv('Descensos de población',obj.citizensDied)+'<h3>Construcciones</h3><div id="buildinglist"></div><button id="buildNow">Construir edificio</button>';
el.appendChild(ext);
const updateList=()=>{document.getElementById('buildinglist').innerHTML=obj.buildings.map(b=>'<div class="kv"><span>'+esc(b.type)+'</span><b>Nivel '+b.level+'</b></div>').join('')};
updateList();document.getElementById('buildNow').onclick=()=>{addBuilding(obj);updateList()};
};
const oldRestore=restore;
restore=function(s){oldRestore(s);for(const c of cities)init(c)};
const oldGen=gen;
gen=function(){oldGen();for(const c of cities)init(c)};
const oldCreateCity=createCity;
createCity=function(x,y,name){let c=oldCreateCity(x,y,name);if(c)init(c);return c};
log('EON v0.4: urbanismo con suelo edificable y separación de construcciones.');
})();