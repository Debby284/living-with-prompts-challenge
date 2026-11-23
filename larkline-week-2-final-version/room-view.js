(function(){
'use strict';
const photos=[{"src":"https://images.unsplash.com/photo-1779983646041-1eef6de0f34a?auto=format&fit=crop&w=1400&q=75","alt":"Front of America Country House with its green picket fence"},{"src":"https://images.unsplash.com/photo-1772797583328-f83bc3f94f80?auto=format&fit=crop&w=700&q=75","alt":"Living room with wooden shelves and soft daylight"},{"src":"https://images.unsplash.com/photo-1585128833500-ec98262cb4f5?auto=format&fit=crop&w=700&q=75","alt":"Kitchen with dining space by the window"},{"src":"https://images.unsplash.com/photo-1657040899594-34f4b6739988?auto=format&fit=crop&w=700&q=75","alt":"Bedroom with white linen and a plant"},{"src":"https://images.unsplash.com/photo-1662236337008-e546a2359f45?auto=format&fit=crop&w=700&q=75","alt":"Garden path towards the back of the house"},{"src":"https://images.unsplash.com/photo-1722247481561-9d00962daf6d?auto=format&fit=crop&w=1000&q=80","alt":"Illustrative hallway with stairs and a painting","source":"https://unsplash.com/photos/iYs7V9uv0P0","credit":"Lisa Anna / Unsplash"},{"src":"https://images.unsplash.com/photo-1721738857280-f4e7c1c43f2f?auto=format&fit=crop&w=1000&q=80","alt":"Illustrative second bedroom with a bed and stool","source":"https://unsplash.com/photos/531S9J6W510","credit":"Alex Tyson / Unsplash"},{"src":"https://images.unsplash.com/photo-1722247480769-de6954b0b20f?auto=format&fit=crop&w=1000&q=80","alt":"Illustrative third bedroom with a woven headboard and garden doors","source":"https://unsplash.com/photos/cty6Z4-hzVk","credit":"Lisa Anna / Unsplash"},{"src":"https://images.unsplash.com/photo-1754574741164-a41418029cfb?auto=format&fit=crop&w=1000&q=80","alt":"Illustrative bathroom with warm neutral walls and a bathtub","source":"https://unsplash.com/photos/xS608no3sTk","credit":"Ela De Pure / Unsplash"}];
const svg=document.getElementById('room-model'); if(!svg)return;
const css=getComputedStyle(document.documentElement),color=n=>css.getPropertyValue(n).trim();
const rooms=[
{id:'living',floor:0,x:-4,z:0,w:5,d:5,en:'Living room',nl:'Woonkamer',photo:1,text:'A quiet place to come home to.',textNl:'Een rustige plek om thuis te komen.'},
{id:'kitchen',floor:0,x:-4,z:-5,w:5,d:5,en:'Kitchen',nl:'Keuken',photo:2,text:'Space to cook, sit and spend time together.',textNl:'Ruimte om te koken, te zitten en samen te zijn.'},
{id:'hall',floor:0,x:1,z:-5,w:2,d:10,en:'Hall & stairs',nl:'Hal en trap',photo:5,text:'A welcoming hallway and staircase.',textNl:'Een uitnodigende hal met trap.'},
{id:'bedroom',floor:1,x:-4,z:0,w:5,d:5,en:'Main bedroom',nl:'Hoofdslaapkamer',photo:3,text:'Soft daylight and a place to unwind.',textNl:'Zacht daglicht en een plek om tot rust te komen.'},
{id:'bedroom2',floor:1,x:-4,z:-5,w:3,d:5,en:'Bedroom 2',nl:'Slaapkamer 2',photo:6,text:'A calm guest bedroom.',textNl:'Een rustige logeerkamer.'},
{id:'bedroom3',floor:1,x:-1,z:-5,w:4,d:3,en:'Bedroom 3',nl:'Slaapkamer 3',photo:7,text:'A bedroom with natural textures and soft light.',textNl:'Een slaapkamer met natuurlijke materialen en zacht licht.'},
{id:'bath',floor:1,x:1,z:-2,w:2,d:7,en:'Bathroom / landing',nl:'Badkamer / overloop',photo:8,text:'A bathroom in warm neutral tones.',textNl:'Een badkamer in warme neutrale tinten.'}];
let floor=0,selected='living',angle=-0.6,drag=null,moved=false;
const lang=()=>document.documentElement.lang.toLowerCase().startsWith('nl')?'nl':'en';
const label=r=>r[lang()];
const el=(tag,attrs)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const k in attrs)n.setAttribute(k,attrs[k]);return n;};
function project(x,y,z){const a=x*Math.cos(angle)-z*Math.sin(angle),b=x*Math.sin(angle)+z*Math.cos(angle);return [380+a*37,260+b*19-y*37];}
function polygon(points,fill,room){const n=el('polygon',{points:points.map(p=>project(...p).join(',')).join(' '),fill:fill,class:'room-surface'+(room===selected?' is-selected':'')});if(room)n.dataset.room=room;svg.append(n);return n;}
// Materials are drawn locally: no image downloads or texture dependencies.
function materials(){
 const defs=el('defs',{});
 const linen=el('pattern',{id:'room-linen',width:5,height:5,patternUnits:'userSpaceOnUse'});
 linen.append(el('rect',{width:5,height:5,fill:color('--room-linen')}),el('path',{d:'M0 1H5 M1 0V5',stroke:'#a79680','stroke-opacity':'.2','stroke-width':'.5'}));
 defs.append(linen);
 [['room-plaster','#faf3e6','#d8c8b2'],['room-side','#d5c2a7','#ac9274']].forEach(([id,a,b])=>{const g=el('linearGradient',{id,x1:'0%',y1:'0%',x2:'80%',y2:'100%'});g.append(el('stop',{offset:'0%','stop-color':a}),el('stop',{offset:'100%','stop-color':b}));defs.append(g);});
 svg.append(defs);
}
function oakFloor(r){
 const tones=['#c9a377','#d5b388','#be9568','#dcb98e','#c6a077'];
 for(let col=0;col<Math.ceil(r.w/.38);col++){
  const x=r.x+col*.38,w=Math.min(.38,r.x+r.w-x);
  for(let row=-1;row<Math.ceil(r.d/1.8);row++){
   const z=Math.max(r.z,r.z+row*1.8+(col%3)*.6),end=Math.min(r.z+r.d,r.z+(row+1)*1.8+(col%3)*.6);
   if(end<=z)continue;
   const p=polygon([[x,.056,z],[x+w,.056,z],[x+w,.056,end],[x,.056,end]],tones[(col*7+row+6)%tones.length],r.id);
   p.setAttribute('class','room-plank');p.setAttribute('stroke','#94714e');p.setAttribute('stroke-opacity','.3');p.setAttribute('stroke-width','.45');
   for(let grain=1;grain<=2;grain++){
    const a=project(x+w*grain/3,.058,z+.06),b=project(x+w*grain/3+.015,.058,end-.06);
    svg.append(el('path',{d:`M${a.join(' ')} L${b.join(' ')}`,stroke:'#775536','stroke-opacity':'.12','stroke-width':'.55','pointer-events':'none'}));
   }
  }
 }
}
function box(x,z,w,d,y,height,fill,room){polygon([[x,y,z],[x+w,y,z],[x+w,y,z+d],[x,y,z+d]],fill,room);if(height){polygon([[x,y,z+d],[x+w,y,z+d],[x+w,y+height,z+d],[x,y+height,z+d]],'url(#room-side)');polygon([[x+w,y,z],[x+w,y,z+d],[x+w,y+height,z+d],[x+w,y+height,z]],'url(#room-side)');polygon([[x,y+height,z],[x+w,y+height,z],[x+w,y+height,z+d],[x,y+height,z+d]],fill,room);}}
function outerWalls(front){
 const walls=[{x:-4.15,z:-5.15,w:7.3,d:.15,nx:0,nz:-1},{x:-4.15,z:5,w:7.3,d:.15,nx:0,nz:1},{x:-4.15,z:-5,w:.15,d:10,nx:-1,nz:0},{x:3,z:-5,w:.15,d:10,nx:1,nz:0}];
 walls.filter(w=>(w.nx*Math.sin(angle)+w.nz*Math.cos(angle)>0)===front).forEach(w=>{
  // Camera-facing walls become cutaways; the other two retain full height.
  const h=front?.85:1.9,alongX=w.w>w.d,len=alongX?w.w:w.d,sill=h*.29,top=h*.84;
  function piece(start,length,y,height){box(w.x+(alongX?start:0),w.z+(alongX?0:start),alongX?length:w.w,alongX?w.d:length,y,height,'url(#room-plaster)');}
  piece(0,len,.05,sill);piece(0,len,.05+top,h-top);
  const openings=[[len*.16,len*.41],[len*.56,len*.81]];
  let end=0;
  openings.forEach(([a,b])=>{
   piece(end,a-end,.05+sill,top-sill);
   const p=t=>[w.x+(alongX?t:w.w/2),.05,w.z+(alongX?w.d/2:t)];
   const l=p(a),r=p(b);
   const glass=polygon([[l[0],sill+.05,l[2]],[r[0],sill+.05,r[2]],[r[0],top+.05,r[2]],[l[0],top+.05,l[2]]],'#b9d8db');
   glass.setAttribute('fill-opacity','.58');glass.setAttribute('stroke','#fff9ed');glass.setAttribute('stroke-width','2.5');
   const mid=p((a+b)/2),u=project(mid[0],sill+.05,mid[2]),v=project(mid[0],top+.05,mid[2]);
   svg.append(el('path',{d:`M${u.join(' ')}L${v.join(' ')}`,stroke:'#fff9ed','stroke-width':'2'}));
   piece(a-.03,b-a+.06,.05+sill-.04,.07);end=b;
  });
  piece(end,len-end,.05+sill,top-sill);
 });
}
function draw(){svg.replaceChildren();materials();const rs=rooms.filter(r=>r.floor===floor);box(-4.3,-5.3,7.6,10.6,-.32,.3,color('--primary-light-3'));rs.slice().sort((a,b)=>project(a.x,0,a.z)[1]-project(b.x,0,b.z)[1]).forEach((r,i)=>{box(r.x,r.z,r.w,r.d,0,.05,color('--room-floor'),r.id);oakFloor(r);});
outerWalls(false);
if(floor===0){box(.95,-5,.12,10,.05,.65,'url(#room-plaster)');box(-4,0,5,.12,.05,.65,'url(#room-plaster)');box(-3.5,1,1.2,3,.1,.55,'url(#room-linen)','living');box(-1.6,2,1.5,1.3,.1,.3,color('--room-floor-alt'),'living');box(-3.6,-4.5,3.7,.65,.1,.8,color('--room-furniture'),'kitchen');box(-2,-2.5,2,1.2,.1,.55,color('--room-furniture'),'kitchen');for(let i=0;i<8;i++)box(1.5,3-i*.6,1,.52,.1,i*.12,'url(#room-side)');}
else{box(-3.1,1,2.4,3.2,.1,.5,'url(#room-linen)','bedroom');box(-2.95,1.15,2.1,.65,.61,.08,'url(#room-plaster)','bedroom');box(-4,-.05,5,.12,.05,.65,'url(#room-plaster)');box(-1.1,-5,.12,5,.05,.65,'url(#room-plaster)');box(-3.5,-4.5,1.6,3,.1,.4,'url(#room-linen)','bedroom2');box(0,-4.7,1.6,2,.1,.4,'url(#room-linen)','bedroom3');}
outerWalls(true);
rs.forEach(r=>{const p=project(r.x+r.w/2,.15,r.z+r.d*.7);const t=el('text',{x:p[0],y:p[1],class:'room-model-label'});t.textContent=label(r);svg.append(t);});}
function select(id){const r=rooms.find(r=>r.id===id);if(!r)return;selected=id;floor=r.floor;const available=rooms.filter(q=>q.floor===floor);const choices=document.getElementById('room-choices');choices.replaceChildren();available.forEach(q=>{const b=document.createElement('button');b.type='button';b.className='room-control';b.textContent=label(q);b.setAttribute('aria-pressed',q.id===id);b.onclick=()=>select(q.id);choices.append(b);});document.querySelectorAll('[data-floor]').forEach(b=>{b.setAttribute('aria-pressed',Number(b.dataset.floor)===floor);b.textContent=lang()==='nl'?(b.dataset.floor==='0'?'Begane grond':'Eerste verdieping'):(b.dataset.floor==='0'?'Ground floor':'First floor');});document.getElementById('room-reset').textContent=lang()==='nl'?'Beginweergave':'Reset view';document.querySelector('.room-hint').textContent=lang()==='nl'?'Sleep om te draaien · Kies hieronder een kamer':'Drag to rotate · Select a room below';document.getElementById('room-name').textContent=label(r);const image=document.getElementById('room-photo');image.hidden=r.photo===null;if(r.photo!==null){image.src=photos[r.photo].src;image.alt=window.lkT?window.lkT(photos[r.photo].alt):photos[r.photo].alt;}document.getElementById('room-caption').textContent=r.photo===null?(lang()==='nl'?'Voor deze ruimte is geen foto beschikbaar.':'No photo is available for this room.'):(lang()==='nl'?r.textNl:r.text);document.getElementById('room-count').textContent=String(available.indexOf(r)+1).padStart(2,'0')+' / '+String(available.length).padStart(2,'0');draw();}
svg.addEventListener('pointerdown',e=>{drag={x:e.clientX,a:angle};moved=false;});svg.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)>5){moved=true;if(!svg.hasPointerCapture(e.pointerId))svg.setPointerCapture(e.pointerId);angle=drag.a+(e.clientX-drag.x)*.008;draw();}});svg.addEventListener('pointerup',e=>{drag=null;if(!moved&&e.target.dataset.room)select(e.target.dataset.room);});svg.addEventListener('pointercancel',()=>drag=null);window.addEventListener('pointerup',()=>drag=null);
document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>select(rooms.find(r=>r.floor===Number(b.dataset.floor)).id));document.getElementById('room-reset').onclick=()=>{angle=-.6;draw();};new MutationObserver(()=>select(selected)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});select(selected);
})();
