/* EON 0.5: autonomous civilization decisions */
(function(){
const previous=update;
function setup(c){if(c.sim5)return;c.sim5=true;c.populationHistory=[];c.decision='Organizando la comunidad';c.development=0;c.research=0;c.births=0;c.deaths=0;c.events=[];c.trade=0;c.famineYears=0;c.infrastructure=c.infrastructure||5;c.medicine=c.medicine||5;c.education=c.education||20;c.stability=c.stability||75;c.prosperity=c.prosperity||45;}
function count(c){return people.filter(p=>p.cityId===c.id).length}
function event(c,s){c.events.unshift({year,text:s});c.events.length=Math.min(18,c.events.length);log(c.name+': '+s)}
function plan(c){const n=count(c);if(!n){c.decision='Recuperando población';return}let foodPerCapita=c.food/Math.max(n,1);let housing=c.houses*5;
if(foodPerCapita<4){c.decision='Prioridad: evitar hambruna';if(c.wood>=24){c.farms++;c.wood-=24;event(c,'Se amplían los cultivos para alimentar a la población.')}else c.wood+=Math.max(2,n*.05);return}
if(housing<n*1.15){c.decision='Construyendo viviendas';if(c.wood>=30){c.houses++;c.wood-=30;event(c,'Nuevas viviendas permiten el crecimiento de la población.')}return}
if(c.health<65){c.decision='Mejorando la salud pública';if(c.food>40&&c.stone>10){c.food-=20;c.stone-=10;c.medicine+=2;c.health=Math.min(100,c.health+7);event(c,'Se organiza una mejora sanitaria.')}return}
if(c.tech<12){c.decision='Domesticación y agricultura';c.research+=2;return}
if(c.wood<70){c.decision='Recolectando madera';c.wood+=Math.max(6,n*.12);return}
if(c.stone<45){c.decision='Extrayendo piedra';c.stone+=Math.max(4,n*.08);return}
if(c.education<Math.min(90,30+c.tech*.16)){c.decision='Educación y transmisión de conocimientos';if(c.food>60){c.food-=15;c.education=Math.min(100,c.education+3);c.research+=2}return}
c.decision='Investigación y desarrollo';c.research+=2+Math.sqrt(n)*.2;
}
update=function(){for(const c of cities)setup(c);const before=new Map(cities.map(c=>[c.id,count(c)]));previous();for(const c of cities){setup(c);let n=count(c),old=before.get(c.id)||0;if(n>old)c.births+=n-old;else c.deaths+=old-n;
c.populationHistory.push(n);if(c.populationHistory.length>120)c.populationHistory.shift();
if(c.food<Math.max(10,n)){c.famineYears++;c.stability=Math.max(0,c.stability-.2)}else{c.famineYears=Math.max(0,c.famineYears-1);c.stability=Math.min(100,c.stability+.04)}
if(frame%8===0)plan(c);
if(frame%5===0&&n){const farmers=Math.max(1,Math.floor(n*.3));c.food+=farmers*(.4+c.tech*.005);c.wood+=Math.max(1,n*.04);c.stone+=Math.max(.5,n*.015)}
if(frame%12===0&&n>3&&c.food>n*3&&c.stability>40){c.research+=n*.025*(1+c.education/100);if(c.research>=12+Math.sqrt(c.tech+1)*2){c.research=0;c.tech++;if(c.tech%10===0)event(c,'Se descubre una nueva técnica de producción y organización.')}}
if(frame%45===0&&n>15){for(const other of cities){if(other===c||Math.hypot(other.x-c.x,other.y-c.y)>35)continue;let surplus=Math.max(0,c.food-n*8);let shortage=Math.max(0,n*5-other.food);let amount=Math.min(20,surplus,shortage);if(amount>5){c.food-=amount;other.food+=amount;c.trade+=amount;other.trade=(other.trade||0)+amount;event(c,'Intercambia alimentos con '+other.name+'.');break}}}
}};
const previousInspect=inspect;
inspect=function(type,obj,show=true){previousInspect(type,obj,show);if(type!=='city')return;setup(obj);const el=document.getElementById('inspector');const panel=document.createElement('div');panel.innerHTML='<h3 style="margin-top:18px">Motor social · v0.5</h3>'+kv('Decisión actual',obj.decision)+kv('Nacimientos observados',obj.births)+kv('Muertes observadas',obj.deaths)+kv('Investigación acumulada',Math.round(obj.research))+kv('Comercio realizado',Math.round(obj.trade))+kv('Años de escasez',obj.famineYears)+'<h3>Historia de esta sociedad</h3>'+obj.events.slice(0,8).map(e=>'<p><small>'+e.year+'</small><br>'+esc(e.text)+'</p>').join('')+'<h3>Evolución demográfica</h3><canvas id="populationChart" width="290" height="90" style="position:static;width:100%;height:90px;touch-action:auto"></canvas>';el.appendChild(panel);const chart=el.querySelector('#populationChart');const g=chart.getContext('2d'),vals=obj.populationHistory;if(vals.length>1){g.strokeStyle='#7be3be';g.lineWidth=2;g.beginPath();let max=Math.max(10,...vals);vals.forEach((v,i)=>{let x=i/(vals.length-1)*288,y=86-v/max*80;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}};
})();