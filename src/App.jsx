import { useState, useMemo, useEffect, useRef } from "react";
import "./index.css";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwyDZhP0qQNROZPoyDq364K9r4CVBHk32giHcRzIu6JWw-SFlMyG_mpj2vZA-8J52QG/exec"
const B = import.meta.env.BASE_URL;

async function sheetGet(action){try{const r=await fetch(`${SHEET_URL}?action=${action}`);return await r.json();}catch(e){return null;}}
async function sheetPost(body){try{await fetch(SHEET_URL,{method:"POST",body:JSON.stringify(body)});}catch(e){}}

function compressImage(u,mw=300,q=0.45){return new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),rt=Math.min(mw/i.width,1);c.width=i.width*rt;c.height=i.height*rt;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",q));};i.onerror=()=>r(u);i.src=u;});}

// Local storage helpers (replacing window.storage)
const storage = {
  set: (k,v) => { try { localStorage.setItem(k,v); } catch(e){} },
  get: (k) => { try { const v=localStorage.getItem(k); return v?{value:v}:null; } catch(e){ return null; } },
  delete: (k) => { try { localStorage.removeItem(k); } catch(e){} }
};

function nkey(n){return encodeURIComponent((n||"").trim().toLowerCase());}
async function sDay(name,day,d){storage.set(`u:${nkey(name)}:day:${day}`,JSON.stringify(d));}
async function lDay(name,day){try{const r=storage.get(`u:${nkey(name)}:day:${day}`);if(r?.value)return JSON.parse(r.value);}catch(e){}return null;}
async function lRoster(){try{const r=storage.get("roster");if(r?.value)return JSON.parse(r.value);}catch(e){}return[];}
async function sRoster(l){storage.set("roster",JSON.stringify(l));}
async function lLastUser(){try{const r=storage.get("lastUser");if(r?.value)return JSON.parse(r.value);}catch(e){}return null;}
async function sLastUser(n){if(n)storage.set("lastUser",JSON.stringify(n));else storage.delete("lastUser");}
async function addRoster(n){const l=await lRoster();if(!l.some(x=>nkey(x)===nkey(n))){l.push(n.trim());await sRoster(l);}return l;}

const DAYS=7;
const MS=[
  {key:"breakfast",label:"Breakfast",emoji:"🌿",col:"#6E7A2E",bg:"#EFEFD6",bdr:"#CBD08A"},
  {key:"lunch",label:"Lunch",emoji:"🌻",col:"#A06A1E",bg:"#F7E9CC",bdr:"#E0C060"},
  {key:"dinner",label:"Dinner",emoji:"🥥",col:"#A84F33",bg:"#F2E0D6",bdr:"#D6A88E"},
  {key:"snack",label:"Snack",emoji:"🍭",col:"#9C4A52",bg:"#F5DEDE",bdr:"#D9A0A4"},
];
const CATS=["Restaurant","Convenience & Street food","Cafe","Skipped"];
const PHYS=["Satisfied","Full","Light","Heavy","Energized","Nauseous","Still hungry"];
const EMOS=["Happy","Comforted","Adventurous","Nostalgic","Proud","Meh","Regret"];
const POS=["Happy","Comforted","Adventurous","Nostalgic","Proud"];
const NEG=["Meh","Regret"];

function dDate(i,start){const d=new Date(start||Date.now());d.setDate(d.getDate()+i);return d;}
function dLabel(i,start){return dDate(i,start).toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function dWeekday(i,start){return dDate(i,start).toLocaleDateString("en-US",{weekday:"short"});}
function todayIdx(start){if(!start)return 0;return Math.max(0,Math.floor((new Date().setHours(0,0,0,0)-new Date(start).setHours(0,0,0,0))/864e5));}

const C={bg:"#F4E6D8",bgA:"#E6D0BC",paper:"#FBF3EA",paperD:"#E0CDB8",red:"#A84F33",redL:"#F2E0D6",redD:"#7A3622",gold:"#BD8A3C",goldL:"#F3E7CF",goldD:"#8A6020",teal:"#B05E40",tealL:"#F0DED4",tealD:"#7A3622",ink:"#3D2417",inkL:"#6E4A37",inkLL:"#9E7E6B",bdr:"#D6B89C",bdrL:"#E9D6C3",accent:"#8A3F26",accentL:"#F2E0D6",stamp1:"#A84F33",stamp2:"#B05E40",stamp3:"#BD8A3C"};

const eMeal=()=>({category:null,physical:null,emotional:null,location:"",foodName:"",photo:null,loggedAt:null});
const eDay=()=>Object.fromEntries(MS.map(s=>[s.key,eMeal()]));
const initData=()=>Object.fromEntries(Array.from({length:DAYS},(_,i)=>[i,eDay()]));
const mDone=m=>m.category==="Skipped"||(!!m.category&&!!m.physical&&!!m.emotional);
const mLog=m=>!!m.category;
const dHasPhoto=d=>MS.some(s=>!!d[s.key].photo);
const dDone=(d,adm=false)=>{if(adm)return MS.some(s=>!!d[s.key].category);const logged=MS.filter(s=>d[s.key].category);if(logged.length<3)return false;return logged.every(s=>mDone(d[s.key]))&&dHasPhoto(d);};

function groupEggStage(goodDays){
  if(goodDays>=7)return{stage:"haechi",label:"Group Haechi Born! 🦁",desc:"Your entire group completed the journey together!"};
  if(goodDays>=5)return{stage:"chick",label:"Group Hatchling 🐤",desc:"Almost there — keep logging together!"};
  if(goodDays>=3)return{stage:"cracking",label:"Egg is Cracking 🥚✨",desc:"The group egg is cracking open!"};
  return{stage:"egg",label:"Group Egg 🥚",desc:"80% of the group logging each day hatches the egg!"};
}

const HAECHI=[
  {id:1,name:"Joyful Haechi",sub:"Bright · Good · Restaurant",desc:"Radiant and full of energy, this Haechi loves discovering new restaurants!",color:"bright",phys:"good",food:"restaurant"},
  {id:2,name:"Blissful Haechi",sub:"Bright · Good · Cafe",desc:"A dreamy Haechi who finds peace in every cup and sweet bite.",color:"bright",phys:"good",food:"cafe"},
  {id:3,name:"Hearty Haechi",sub:"Bright · Good · Street",desc:"Warm and glowing, fueled by street bites and quick convenience finds.",color:"bright",phys:"good",food:"street"},
  {id:4,name:"Spirited Haechi",sub:"Bright · Uncomfortable · Restaurant",desc:"Always chasing the next restaurant, even when the tummy protests!",color:"bright",phys:"uncomfortable",food:"restaurant"},
  {id:5,name:"Indulgent Haechi",sub:"Bright · Uncomfortable · Cafe",desc:"Can't resist one more pastry — happy but a little too full.",color:"bright",phys:"uncomfortable",food:"cafe"},
  {id:6,name:"Cozy Haechi",sub:"Bright · Uncomfortable · Street",desc:"Loved every street snack, but perhaps just a little too much.",color:"bright",phys:"uncomfortable",food:"street"},
  {id:7,name:"Brooding Haechi",sub:"Dark · Good · Restaurant",desc:"Thoughtful and quiet, finding comfort in familiar restaurant spots.",color:"dark",phys:"good",food:"restaurant"},
  {id:8,name:"Pensive Haechi",sub:"Dark · Good · Cafe",desc:"Sits alone with a latte, lost in deep thoughts.",color:"dark",phys:"good",food:"cafe"},
  {id:9,name:"Reflective Haechi",sub:"Dark · Good · Street",desc:"Quick bites soothe, but the heart still carries its weight.",color:"dark",phys:"good",food:"street"},
  {id:10,name:"Weary Haechi",sub:"Dark · Uncomfortable · Restaurant",desc:"Body and spirit both need a rest — too much dining out, too fast.",color:"dark",phys:"uncomfortable",food:"restaurant"},
  {id:11,name:"Heavy Haechi",sub:"Dark · Uncomfortable · Cafe",desc:"Too many late-night cafe runs left this Haechi drained.",color:"dark",phys:"uncomfortable",food:"cafe"},
  {id:12,name:"Burdened Haechi",sub:"Dark · Uncomfortable · Street",desc:"Even comfort snacks can't lift the heaviness today.",color:"dark",phys:"uncomfortable",food:"street"},
  {id:13,name:"Vibrant Haechi",sub:"Mixed · Good · Restaurant",desc:"An adventurous spirit who feels nostalgic with every restaurant discovery.",color:"mixed",phys:"good",food:"restaurant"},
  {id:14,name:"Whimsical Haechi",sub:"Mixed · Good · Cafe",desc:"Comforted and curious, this Haechi loves cafe adventures.",color:"mixed",phys:"good",food:"cafe"},
  {id:15,name:"Nostalgic Haechi",sub:"Mixed · Good · Street",desc:"Street food stirs up bittersweet memories and warm feelings.",color:"mixed",phys:"good",food:"street"},
  {id:16,name:"Restless Haechi",sub:"Mixed · Uncomfortable · Restaurant",desc:"Craving every menu — adventurous but overwhelmed.",color:"mixed",phys:"uncomfortable",food:"restaurant"},
  {id:17,name:"Wistful Haechi",sub:"Mixed · Uncomfortable · Cafe",desc:"A bittersweet week of too much coffee and complex feelings.",color:"mixed",phys:"uncomfortable",food:"cafe"},
  {id:18,name:"Tender Haechi",sub:"Mixed · Uncomfortable · Street",desc:"Nostalgic and overfed on snacks — the heart and stomach both need rest.",color:"mixed",phys:"uncomfortable",food:"street"},
  {id:19,name:"The Absent Haechi",sub:"Skipped",desc:"This Haechi wandered off without eating much... a mystery!",color:"skipped",phys:null,food:"skipped"},
];

const HAECHI_IMGS={
  1:`${B}haechi/1.png`,2:`${B}haechi/2.png`,3:`${B}haechi/3.png`,4:`${B}haechi/4.png`,
  5:`${B}haechi/5.png`,6:`${B}haechi/6.png`,7:`${B}haechi/7.png`,8:`${B}haechi/8.png`,
  9:`${B}haechi/9.png`,10:`${B}haechi/10.png`,11:`${B}haechi/11.png`,12:`${B}haechi/12.png`,
  13:`${B}haechi/13.png`,14:`${B}haechi/14.png`,15:`${B}haechi/15.png`,16:`${B}haechi/16.png`,
  17:`${B}haechi/17.png`,18:`${B}haechi/18.png`,19:`${B}haechi/19.png`,
};

function analyzeHaechi(data){
  let emos={bright:0,dark:0,mixed:0},phys={good:0,uncomfortable:0},food={restaurant:0,cafe:0,street:0},skippedCount=0,total=0;
  for(let i=0;i<DAYS;i++){for(const s of MS){const m=data[i][s.key];if(!m.category)continue;if(m.category==="Skipped"){skippedCount++;continue;}total++;if(m.category==="Restaurant")food.restaurant++;else if(m.category==="Cafe")food.cafe++;else if(m.category==="Convenience & Street food")food.street++;if(m.emotional){if(["Happy","Proud"].includes(m.emotional))emos.bright++;else if(["Meh","Regret"].includes(m.emotional))emos.dark++;else emos.mixed++;}if(m.physical){if(["Satisfied","Energized","Light"].includes(m.physical))phys.good++;else phys.uncomfortable++;}}}
  if(skippedCount/(skippedCount+total||1)>0.5)return HAECHI[18];
  const colorKey=emos.bright>=emos.dark&&emos.bright>=emos.mixed?"bright":emos.dark>=emos.mixed?"dark":"mixed";
  const physKey=phys.good>=phys.uncomfortable?"good":"uncomfortable";
  const foodKey=food.restaurant>=food.cafe&&food.restaurant>=food.street?"restaurant":food.cafe>=food.street?"cafe":"street";
  return HAECHI.find(h=>h.color===colorKey&&h.phys===physKey&&h.food===foodKey)||HAECHI[0];
}

function dMood(d){let p=0,n=0;for(const s of MS){const e=d[s.key].emotional;if(POS.includes(e))p++;else if(NEG.includes(e))n++;}const t=p+n;if(!t)return{m:"n",c:C.stamp3};const b=(p-n)/t;return b>0.3?{m:"h",c:C.stamp1}:b<-0.3?{m:"l",c:C.stamp2}:{m:"n",c:C.stamp3};}
function gStage(data,admin){if(admin)return{stage:"haechi",pct:1,logged:DAYS};const l=Array.from({length:DAYS},(_,i)=>dDone(data[i])).filter(Boolean).length;const p=l/DAYS;if(l>=DAYS)return{stage:"haechi",pct:p,logged:l};if(p>=0.7)return{stage:"chick",pct:p,logged:l};return{stage:"egg",pct:p,logged:l};}
function fRatios(data){const cc={};let t=0;for(let i=0;i<DAYS;i++)for(const s of MS){const m=data[i][s.key];if(m.category&&m.category!=="Skipped"){cc[m.category]=(cc[m.category]||0)+1;t++;}}if(!t)return[];return Object.entries(cc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,pct:Math.round(v/t*100)}));}
function cPhotos(data){const o=[];for(let i=0;i<DAYS;i++)for(const s of MS){const m=data[i][s.key];if(m.photo)o.push({photo:m.photo,day:i,slot:s,loc:m.location,foodName:m.foodName});}return o;}
function mkSample(hid){const h=HAECHI.find(x=>x.id===hid)||HAECHI[0];const d=initData();const rn=a=>a[Math.floor(Math.random()*a.length)];const foodPool=h.food==="restaurant"?["Restaurant"]:h.food==="cafe"?["Cafe"]:["Convenience & Street food"];const emoPool=h.color==="bright"?["Happy","Proud"]:h.color==="dark"?["Meh","Regret"]:["Comforted","Nostalgic","Adventurous"];const physPool=h.phys==="good"?["Satisfied","Energized","Light"]:["Full","Heavy","Nauseous"];const foods=["김치찌개 (Kimchi Jjigae)","떡볶이 (Tteokbokki)","아메리카노 (Americano)","비빔밥 (Bibimbap)","삼겹살 (Samgyeopsal)"];for(let i=0;i<DAYS;i++){for(const s of MS){const m=d[i][s.key];m.category=rn(foodPool);m.emotional=rn(emoPool);m.physical=rn(physPool);m.foodName=rn(foods);m.loggedAt=new Date(2025,5,16+i,8+Math.floor(Math.random()*12)).getTime();}d[i][MS[0].key].photo="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23C77DBB'/%3E%3C/svg%3E";}return d;}

function RevealText({text,delay=0,speed=38,tag="span",style={}}){const Tag=tag;return(<Tag style={style}>{[...text].map((ch,i)=>(<span key={i} style={{display:"inline",animation:"revealChar .25s ease both",animationDelay:`${delay+i*speed}ms`}}>{ch}</span>))}</Tag>);}
function DanChungBorder(){return(<svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" style={{display:"block"}}><rect width="400" height="12" fill="#A84F33"/><rect width="400" height="1.5" y="0" fill="#C0694A" opacity=".7"/><rect width="400" height="1.5" y="10.5" fill="#7A3622" opacity=".8"/>{Array.from({length:10},(_,i)=>(<g key={i} transform={`translate(${i*40+20},6)`}><circle cx="0" cy="0" r="2.6" fill="none" stroke="#F2DCC4" strokeWidth="1.1"/><circle cx="0" cy="0" r="1" fill="#E8B98A"/><line x1="-16" y1="0" x2="-7" y2="0" stroke="#F2DCC4" strokeWidth="1" opacity=".5"/><line x1="7" y1="0" x2="16" y2="0" stroke="#F2DCC4" strokeWidth="1" opacity=".5"/></g>))}</svg>);}
function KoreanPattern({opacity=1}){return(<svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",top:0,left:0,pointerEvents:"none",opacity}}>{/* diagonal gold lines */}{Array.from({length:12},(_,i)=>(<line key={i} x1={i*40-20} y1="0" x2={i*40+60} y2="80" stroke="#C49A3C" strokeWidth=".7" opacity=".18"/>))}{/* corner diamonds */}{[[0,0],[400,0],[0,80],[400,80]].map(([x,y],i)=>(<g key={i} transform={`translate(${x},${y})`}><polygon points="0,-18 10,-8 0,2 -10,-8" fill="#C49A3C" opacity=".22"/></g>))}{/* center ornament row */}{[60,140,200,260,340].map((x,i)=>(<g key={i} transform={`translate(${x},40)`}><circle cx="0" cy="0" r="3" fill="none" stroke="#C49A3C" strokeWidth="1.2" opacity=".35"/><circle cx="0" cy="0" r="1" fill="#C49A3C" opacity=".45"/><line x1="-12" y1="0" x2="-6" y2="0" stroke="#C49A3C" strokeWidth=".8" opacity=".25"/><line x1="6" y1="0" x2="12" y2="0" stroke="#C49A3C" strokeWidth=".8" opacity=".25"/></g>))}{/* top & bottom thin gold border */}<line x1="0" y1="2" x2="400" y2="2" stroke="#C49A3C" strokeWidth=".6" opacity=".3"/><line x1="0" y1="78" x2="400" y2="78" stroke="#C49A3C" strokeWidth=".6" opacity=".3"/></svg>);}

function EggSVG({pct,sz=130}){const cl=Math.min(pct/.7,1);return(<svg viewBox="0 0 130 130" width={sz} height={sz}><ellipse cx="65" cy="120" rx="34" ry="6" fill="#00000010"/><defs><radialGradient id="eg" cx="42%" cy="35%"><stop offset="0%" stopColor="#FFFBF0"/><stop offset="70%" stopColor="#F0E5D2"/><stop offset="100%" stopColor="#E0A858"/></radialGradient></defs><path d="M65 18 C92 18 105 58 105 82 C105 104 88 116 65 116 C42 116 25 104 25 82 C25 58 38 18 65 18 Z" fill="url(#eg)" stroke={C.gold} strokeWidth="2"/>{cl>.15&&<path d="M65 40 L60 52 L68 60 L62 70" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"/>}{cl>.4&&<path d="M68 60 L78 64 L74 74 L82 80" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"/>}{cl>.6&&<path d="M62 70 L52 76 L58 86" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round"/>}{cl>.85&&<path d="M45 60 L40 70 M88 55 L94 64" fill="none" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/>}<path d="M95 30 l2 5 l5 2 l-5 2 l-2 5 l-2-5 l-5-2 l5-2z" fill={C.red} opacity=".8"/></svg>);}
function ChickSVG({sz=130}){return(<div style={{width:sz,height:sz,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}><img src={`${B}haechi/chick.png`} alt="chick" style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/></div>);}

function KoreanGameHero(){
  return(
    <div style={{position:"relative",width:260,height:205,margin:"0 auto 0.25rem"}}>
      <svg width="260" height="205" viewBox="0 0 260 205" style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
        <defs>
          <radialGradient id="hglow" cx="50%" cy="55%"><stop offset="0%" stopColor="#FFFBF0" stopOpacity="0.95"/><stop offset="100%" stopColor="#E8F0E9" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="130" cy="118" rx="95" ry="82" fill="url(#hglow)"/>
        <path d="M0 100 Q130 10 260 100 L260 110 Q130 20 0 110 Z" fill={C.red}/>
        {Array.from({length:14},(_,i)=>(<rect key={i} x={i*18.6} y="100" width="9" height="10" fill={[C.teal,C.gold,C.red,"#EFF5EF"][i%4]}/>))}
        <path d="M0 100 Q130 10 260 100" fill="none" stroke={C.gold} strokeWidth="1.5"/>
        <rect x="8" y="99" width="20" height="103" rx="2" fill={C.redD}/>
        {[0,1,2,3,4].map(j=>(<rect key={j} x="8" y={99+j*20} width="20" height="9" fill={[C.teal,C.gold,C.red,"#EFF5EF",C.teal][j]}/>))}
        <rect x="232" y="99" width="20" height="103" rx="2" fill={C.redD}/>
        {[0,1,2,3,4].map(j=>(<rect key={j} x="232" y={99+j*20} width="20" height="9" fill={[C.teal,C.gold,C.red,"#EFF5EF",C.teal][j]}/>))}
        <rect x="8" y="196" width="244" height="8" rx="2" fill={C.redD}/>
        {Array.from({length:13},(_,i)=>(<rect key={i} x={8+i*18.8} y="196" width="9" height="8" fill={[C.red,C.teal,C.gold,"#EFF5EF"][i%4]}/>))}
        <line x1="60" y1="87" x2="60" y2="103" stroke={C.gold} strokeWidth="1.5"/>
        <ellipse cx="60" cy="118" rx="10" ry="16" fill={C.red}/>
        <line x1="50" y1="113" x2="70" y2="113" stroke={C.gold} strokeWidth="1.2"/>
        <line x1="50" y1="123" x2="70" y2="123" stroke={C.gold} strokeWidth="1.2"/>
        <ellipse cx="60" cy="118" rx="3" ry="5" fill="#EBF2EC" opacity="0.5"/>
        <rect x="56" y="133" width="8" height="5" rx="1" fill={C.gold}/>
        <path d="M57 138 L60 148 L63 138" fill={C.gold} opacity="0.6"/>
        <line x1="200" y1="87" x2="200" y2="103" stroke={C.gold} strokeWidth="1.5"/>
        <ellipse cx="200" cy="118" rx="10" ry="16" fill={C.red}/>
        <line x1="190" y1="113" x2="210" y2="113" stroke={C.gold} strokeWidth="1.2"/>
        <line x1="190" y1="123" x2="210" y2="123" stroke={C.gold} strokeWidth="1.2"/>
        <ellipse cx="200" cy="118" rx="3" ry="5" fill="#EBF2EC" opacity="0.5"/>
        <rect x="196" y="133" width="8" height="5" rx="1" fill={C.gold}/>
        <path d="M197 138 L200 148 L203 138" fill={C.gold} opacity="0.6"/>
        {[[130,14],[78,50],[182,50],[42,73],[218,73]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y-5} L${x+1.3},${y-1.3} L${x+5},${y} L${x+1.3},${y+1.3} L${x},${y+5} L${x-1.3},${y+1.3} L${x-5},${y} L${x-1.3},${y-1.3}Z`}
            fill={i%2===0?C.gold:C.red} opacity={i===0?0.9:0.65}/>
        ))}
        <text x="130" y="186" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.gold} fontFamily="Georgia" opacity="0.5">食</text>
      </svg>
      <div style={{position:"absolute",top:65,left:"50%",transform:"translateX(-50%)",width:185}}>
        <img src={`${B}haechi/stamp.png`} alt="stamp" style={{width:"100%",objectFit:"contain",display:"block"}}/>
      </div>
    </div>
  );
}

function HaechiBadge({haechi,sz=220}){
  const img=HAECHI_IMGS[haechi.id];
  const colorMap={bright:"#E5EFE6",dark:"#C5D6CB",mixed:"#D7E5DA",skipped:"#CFDDD3"};
  const bg=colorMap[haechi.color]||"#E5EFE6";
  if(img){return(<div style={{width:sz,height:sz,margin:"0 auto",background:bg,borderRadius:16,overflow:"hidden"}}><img src={img} alt={haechi.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>);}
  return(<svg viewBox="0 0 220 220" width={sz} height={sz}><circle cx="110" cy="110" r="105" fill={bg} stroke={C.gold} strokeWidth="4"/><text x="110" y="125" textAnchor="middle" fontSize="80">🦁</text></svg>);
}

function Stamp({day,idx=0,sz=58,big=false}){const done=dDone(day);if(!done)return(<svg viewBox="0 0 58 58" width={sz} height={sz}><circle cx="29" cy="29" r="20" fill="none" stroke={C.bdrL} strokeWidth="2" strokeDasharray="4,3"/></svg>);const rot=((idx*23)%15)-7;if(big)return(<div style={{width:sz,height:sz,display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible",position:"relative"}}><img src={`${B}haechi/stamp.png`} alt="stamp" style={{width:sz*2.1,height:sz*2.1,objectFit:"contain",transform:`rotate(${rot}deg)`,opacity:.88,filter:"sepia(10%) saturate(120%) drop-shadow(0 2px 6px rgba(168,79,51,.3))",position:"absolute"}}/></div>);return(<div style={{width:sz,height:sz,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={`${B}haechi/stamp.png`} alt="stamp" style={{width:"92%",height:"92%",objectFit:"contain",transform:`rotate(${rot}deg)`,opacity:.9,filter:"drop-shadow(0 2px 8px rgba(168,79,51,.35))"}}/></div>);}

function LeafTree({leafCount,totalUsers}){
  const MAX=Math.max((totalUsers||10)*DAYS,70);
  const count=Math.min(leafCount,MAX);
  const COLORS=["#52b788","#74c69d","#95d5b2","#f9c74f","#f8961e","#f3722c","#e63946","#a8dadc","#457b9d","#6a4c93","#c77dff","#80b918","#ff6b6b","#ffd166","#06d6a0","#ffb4a2","#b5e48c","#48cae4"];
  const rng=s=>((s*9301+49297)%233280)/233280;
  const zones=[{cx:108,cy:182,r:38},{cx:186,cy:170,r:34},{cx:120,cy:138,r:44},{cx:170,cy:130,r:38},{cx:150,cy:112,r:50},{cx:148,cy:158,r:52}];
  const leaves=Array.from({length:MAX},(_,i)=>{const z=zones[i%zones.length];const a=rng(i*5+1)*Math.PI*2;const d=rng(i*7+2)*z.r;return{x:z.cx+Math.cos(a)*d,y:z.cy+Math.sin(a)*d,rx:7+rng(i*3)*5,ry:4+rng(i*3+1)*3,rot:rng(i*4)*360,color:COLORS[Math.floor(rng(i*11)*COLORS.length)]};});
  return(
    <svg viewBox="0 0 300 280" width="100%" style={{maxWidth:300,display:"block",margin:"0 auto"}}>
      <ellipse cx="150" cy="273" rx="44" ry="7" fill="rgba(0,0,0,0.07)"/>
      <rect x="141" y="210" width="18" height="63" rx="4" fill="#795548"/>
      <path d="M148 222 Q124 208 106 190" fill="none" stroke="#795548" strokeWidth="7" strokeLinecap="round"/>
      <path d="M152 214 Q174 200 186 178" fill="none" stroke="#795548" strokeWidth="6" strokeLinecap="round"/>
      <path d="M145 196 Q126 166 120 142" fill="none" stroke="#795548" strokeWidth="5" strokeLinecap="round"/>
      <path d="M155 190 Q172 158 170 132" fill="none" stroke="#795548" strokeWidth="4" strokeLinecap="round"/>
      <path d="M150 210 L150 125" fill="none" stroke="#795548" strokeWidth="5" strokeLinecap="round"/>
      {leaves.slice(0,count).map((l,i)=>(
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill={l.color} opacity="0.88" transform={`rotate(${l.rot},${l.x},${l.y})`}/>
      ))}
    </svg>
  );
}

function MemoryReel({photos,onClose}){
  const [idx,setIdx]=useState(0);
  const [fade,setFade]=useState(false);
  const timerRef=useRef(null);
  const idxRef=useRef(0);
  const go=(dir)=>{
    clearInterval(timerRef.current);
    setFade(true);
    setTimeout(()=>{
      const next=(idxRef.current+dir+photos.length)%photos.length;
      idxRef.current=next;setIdx(next);setFade(false);
      timerRef.current=setInterval(()=>go(1),4000);
    },240);
  };
  useEffect(()=>{
    if(!photos.length)return;
    timerRef.current=setInterval(()=>go(1),4000);
    return()=>clearInterval(timerRef.current);
  },[]);
  if(!photos.length)return null;
  const ph=photos[idx]||{};
  const MAX_DOTS=16;
  return(
    <div style={{position:"fixed",inset:0,background:"#0a0400",zIndex:200,display:"flex",flexDirection:"column",userSelect:"none"}}>
      <div style={{padding:"1rem 1.25rem .5rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{color:"rgba(255,255,255,.45)",fontSize:13,fontWeight:700,letterSpacing:".08em"}}>{idx+1} / {photos.length}</div>
        <button onClick={onClose} style={{color:"rgba(255,255,255,.75)",background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,fontSize:14,cursor:"pointer",padding:"5px 18px",fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif"}}>Continue →</button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 .75rem",cursor:"pointer"}}
        onClick={e=>{const half=window.innerWidth/2;go(e.clientX>half?1:-1);}}>
        <img src={ph.photoUrl} alt="" style={{maxWidth:"100%",maxHeight:"calc(100vh - 200px)",borderRadius:20,objectFit:"contain",opacity:fade?0:1,transform:fade?"scale(.94)":"scale(1)",transition:"opacity .22s ease,transform .22s ease",boxShadow:"0 16px 64px rgba(0,0,0,.8)",display:"block"}} onError={e=>{e.target.style.opacity="0";}}/>
      </div>
      <div style={{padding:".875rem 1.25rem 2.5rem",textAlign:"center",flexShrink:0}}>
        {ph.foodName&&<div style={{color:"rgba(255,255,255,.82)",fontSize:15,fontWeight:700,marginBottom:10,fontFamily:"'Playfair Display',Georgia,serif"}}>{ph.foodName}</div>}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:5,flexWrap:"wrap",maxWidth:240,margin:"0 auto 10px"}}>
          {photos.slice(0,MAX_DOTS).map((_,i)=>(
            <div key={i} onClick={e=>{e.stopPropagation();idxRef.current=i;setIdx(i);}} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,.22)",transition:"width .3s,background .3s",cursor:"pointer"}}/>
          ))}
          {photos.length>MAX_DOTS&&<span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>+{photos.length-MAX_DOTS}</span>}
        </div>
        <div style={{color:"rgba(255,255,255,.28)",fontSize:12}}>Tap left / right to navigate</div>
      </div>
    </div>
  );
}

function PassportBadge({prof,haechi,stamps,stats,onClose}){
  const ref=useRef();
  const [hImg,setHImg]=useState(null);
  useEffect(()=>{
    const src=HAECHI_IMGS[haechi.id];
    if(!src)return;
    fetch(src).then(r=>r.blob()).then(blob=>{const rd=new FileReader();rd.onload=()=>setHImg(rd.result);rd.readAsDataURL(blob);}).catch(()=>{});
  },[haechi.id]);
  function download(){const svg=ref.current;const data=new XMLSerializer().serializeToString(svg);const blob=new Blob([data],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`haechi-passport-${prof.name}.svg`;a.click();URL.revokeObjectURL(url);}
  const issuedDate=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  return(<div style={{position:"fixed",inset:0,background:"rgba(44,24,16,.92)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem",overflowY:"auto"}}>
    <svg ref={ref} viewBox="0 0 320 480" width="280" height="420" style={{borderRadius:16,boxShadow:"0 8px 40px rgba(0,0,0,.4)"}}>
      <defs><clipPath id="pc"><circle cx="160" cy="118" r="54"/></clipPath></defs>
      <rect width="320" height="480" rx="16" fill="#FBF3EA" stroke="#C49A3C" strokeWidth="4"/>
      {Array.from({length:16},(_,i)=>(<rect key={i} x={i*20} y="0" width="10" height="8" fill={i%4===0?"#A84F33":i%4===1?"#A84F33":i%4===2?"#C49A3C":"#E9D6C3"}/>))}
      <text x="160" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8A3F26" fontFamily="Georgia" letterSpacing="3">KOREA FOOD JOURNEY</text>
      <text x="160" y="54" textAnchor="middle" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="2">TRAVEL FOOD PASSPORT</text>
      <circle cx="160" cy="118" r="57" fill="#F2E0D6" stroke="#C49A3C" strokeWidth="3"/>
      {hImg
        ?<image href={hImg} x="106" y="64" width="108" height="108" preserveAspectRatio="xMidYMid meet" clipPath="url(#pc)"/>
        :<text x="160" y="136" textAnchor="middle" fontSize="60">🦁</text>}
      <text x="160" y="196" textAnchor="middle" fontSize="11" fill="#8A3F26" fontFamily="Georgia" fontStyle="italic">{haechi.name}</text>
      <line x1="30" y1="212" x2="290" y2="212" stroke="#D6B89C" strokeWidth="1"/>
      <text x="30" y="225" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">BEARER</text>
      <text x="30" y="242" fontSize="16" fontWeight="700" fill="#3D2417" fontFamily="Georgia">{prof.name}</text>
      <text x="30" y="270" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">STAMPS EARNED</text>
      <text x="30" y="285" fontSize="14" fontWeight="700" fill="#A84F33" fontFamily="Georgia">{stamps} / {DAYS} days</text>
      <text x="160" y="270" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">FAVOURITE FOOD</text>
      <text x="160" y="285" fontSize="13" fontWeight="700" fill="#3D2417" fontFamily="Georgia">{stats.tc?stats.tc[0]:"—"}</text>
      <text x="30" y="310" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">TOP EMOTION</text>
      <text x="30" y="325" fontSize="13" fontWeight="700" fill="#A84F33" fontFamily="Georgia">{stats.te?stats.te[0]:"—"}</text>
      <text x="160" y="310" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">HAECHI TYPE</text>
      <text x="160" y="325" fontSize="11" fontWeight="700" fill="#C49A3C" fontFamily="Georgia">{haechi.sub.split("·")[0].trim()}</text>
      <rect x="30" y="345" width="260" height="80" rx="8" fill="#F4E6D8" stroke="#D6B89C" strokeWidth="1.5" strokeDasharray="4,3"/>
      <text x="160" y="365" textAnchor="middle" fontSize="9" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">JOURNEY STAMPS</text>
      {Array.from({length:DAYS},(_,i)=>(<circle key={i} cx={50+i*34} cy="395" r="12" fill={i<stamps?"#A84F33":"#E9D6C3"} stroke="#D6B89C" strokeWidth="1"/>))}
      {Array.from({length:stamps},(_,i)=>(<text key={i} x={50+i*34} y="400" textAnchor="middle" fontSize="10" fill="#FBF3EA" fontFamily="Georgia">食</text>))}
      <text x="160" y="422" textAnchor="middle" fontSize="8" fill="#9E7E6B" fontFamily="Georgia" letterSpacing="1">ISSUED ON</text>
      <text x="160" y="436" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8A3F26" fontFamily="Georgia">{issuedDate}</text>
      {Array.from({length:16},(_,i)=>(<rect key={i} x={i*20} y="472" width="10" height="8" fill={i%4===0?"#A84F33":i%4===1?"#A84F33":i%4===2?"#C49A3C":"#E9D6C3"}/>))}
      <text x="160" y="462" textAnchor="middle" fontSize="8" fill="#9E7E6B" fontFamily="Georgia">June 16 – 22, 2025</text>
    </svg>
    <button onClick={download} style={{marginTop:16,background:C.red,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:17,fontWeight:700,cursor:"pointer"}}>Download Passport</button>
    <button onClick={onClose} style={{marginTop:10,background:"none",color:"rgba(255,255,255,.7)",border:"none",fontSize:15,cursor:"pointer"}}>Close</button>
  </div>);
}

const REFLECT_QS=[
  {q:"Satisfied with your eating this week?",o:["Very satisfied","Mostly","Neutral","Not really"]},
  {q:"What improved most?",o:["Trying new food","Consistent logging","Emotional awareness","Balanced meals"]},
  {q:"Did food affect your mood?",o:["A lot","A little","Not sure"]},
  {q:"Will you log again next week?",o:["Definitely","Maybe","Probably not"]},
];

const RESTAURANT_LINKS={
  "Somerset":[
    {name:"Crazy Fry",type:"snack food",url:"https://naver.me/GDa2FuMF",emoji:"🍟"},
    {name:"Namdo Siggaeg",type:"korean food",url:"https://naver.me/FV7YnwPi",emoji:"🍲"},
    {name:"Bukchon Gamasot Sundubu",type:"Tofu soup",url:"https://naver.me/58NdQsvc",emoji:"🫕"},
    {name:"Dodam 1988",type:"Korean food",url:"https://naver.me/G2EwX7BL",emoji:"🍱"},
    {name:"Anlaehong",type:"K-style Chinese food",url:"https://naver.me/5qDjKsNN",emoji:"🥡"},
    {name:"Clear beef soup Goeum",type:"Beef soup",url:"https://naver.me/xhlaGbQD",emoji:"🥘"},
    {name:"Kkangjangjib",type:"Korean food",url:"https://naver.me/5nejzptV",emoji:"🍲"},
    {name:"Odojib gimchijjim",type:"Korean food",url:"https://naver.me/Fy2FHBhU",emoji:"🌶️"},
    {name:"Gyeongseongchicken",type:"Fried chicken",url:"https://naver.me/5bVsnMsv",emoji:"🍗"},
    {name:"Samcheongdong Shabu",type:"Korean hotpot(Shabu-shabu)",url:"https://naver.me/Gpl9MmDj",emoji:"🫕"},
    {name:"Itali budaejjigae",type:"Korean Army Stew",url:"https://naver.me/5PVazMpx",emoji:"🍲"},
    {name:"Elle Sandwich",type:"Sandwich",url:"https://naver.me/x8tpyEWV",emoji:"🥪"},
    {name:"Jongro Sujebi",type:"Hand-pulled dough soup",url:"https://naver.me/FbOnQAyC",emoji:"🍜"}
  ],
  "Botanik":[
    {name:"Cheongsong Handmade Noodles",type:"noodle soup",url:"https://naver.me/xUw9QP60",emoji:"🍜"},
    {name:"Hobanjip",type:"Chicken Soup",url:"https://naver.me/xyTGvX4o",emoji:"🍲"},
    {name:"Palpal Neoguri Haejang",type:"hangover soup, braised pork",url:"https://naver.me/xAA6GZyW",emoji:"🥘"},
    {name:"Sarangbang Kalguksu",type:"noodle soup",url:"https://naver.me/F5D1zONn",emoji:"🍜"},
    {name:"Aunt Snack",type:"Street K-food",url:"https://naver.me/5JpyWHXm",emoji:"🌮"},
    {name:"Park Man-bae Arirang Bossam",type:"Braised pork",url:"https://naver.me/IgMBMjpf",emoji:"🥩"},
    {name:"Yongsam Restaurant",type:"Meat dishes",url:"https://naver.me/GOhOkGol",emoji:"🍖"},
    {name:"Gayaseong",type:"K-style Chinese food",url:"https://naver.me/5A3TXHcx",emoji:"🥡"},
    {name:"Sangol Makguksu",type:"Cold noodle",url:"https://naver.me/xrSGJlYb",emoji:"🍨"},
    {name:"Andongjang",type:"K-style Chinese food",url:"https://naver.me/GHvqUJMA",emoji:"🥡"},
    {name:"Korean Restaurant Pungryu",type:"Popular Korean soups",url:"https://naver.me/Gn0JUBV4",emoji:"🍲"},
    {name:"Yoon's Family's eongbu Budaejjigae",type:"Korean Army Stew",url:"https://naver.me/Fk7V7YZy",emoji:"🍲"},
    {name:"Cheonggye Wang Sundae",type:"Korean sausage",url:"https://naver.me/G65t7sP9",emoji:"🌭"}
  ]
};

const NAV_TABS=[["map","Map"],["group","Group"],["recap","Diary"],["hatch","Haechi"]];

export default function App(){
  const [ld,sLd]=useState(true);
  const [prof,sProf]=useState(null);
  const [rost,sRost]=useState([]);
  const [ni,sNi]=useState("");
  const [intr,sIntr]=useState(false);
  const [showNew,sShowNew]=useState(false);
  const [scr,sScr]=useState("map");
  const [tab,sTab]=useState("map");
  const [ad,sAd]=useState(0);
  const [am,sAm]=useState(null);
  const [data,sData]=useState(initData);
  const [selectedArea,sSelectedArea]=useState(null);
  const [adm,sAdm]=useState(false);
  const [admH,sAdmH]=useState(1);
  const [eva,sEva]=useState({});
  const [goal,sGoal]=useState(null);
  const [pv,sPv]=useState(null);
  const [showPassport,sShowPassport]=useState(false);
  const [groupData,sGroupData]=useState({totalUsers:0,uniqueTodayUsers:0,goodDays:0,todayPct:0});
  const [leaderboard,sLeaderboard]=useState([]);
  const [feed,sFeed]=useState([]);
  const [restArea,sRestArea]=useState(null);
  const [restStats,sRestStats]=useState({});
  const [showReel,sShowReel]=useState(false);
  const [reelPhotos,sReelPhotos]=useState([]);
  const [startDate,sStartDate]=useState(null);

  useEffect(()=>{(async()=>{
    try{
      const r=await lRoster();sRost(r);
      const last=await lLastUser();
      if(last){const sd=storage.get(`sd:${nkey(last)}`);if(!sd){await sLastUser(null);}else{const o=initData();for(let i=0;i<DAYS;i++){try{const d=await lDay(last,i);if(d)o[i]=d;}catch(e){}}sData(o);sStartDate(parseInt(sd.value));sProf({name:last});sScr("map");sTab("map");}}
    }catch(e){}
    sLd(false);
  })();},[]);

  async function loadGroupData(){const d=await sheetGet("getGroupEgg");if(d&&typeof d==="object"&&!Array.isArray(d))sGroupData(d);const rs=await sheetGet("getRestaurantStats");if(rs&&typeof rs==="object"&&!Array.isArray(rs))sRestStats(rs);const lb=await sheetGet("getLeaderboard");if(Array.isArray(lb))sLeaderboard(lb);const fd=await sheetGet("getFeed");if(Array.isArray(fd))sFeed(fd);}
  async function loadUD(n){const o=initData();for(let i=0;i<DAYS;i++){try{const d=await lDay(n,i);if(d)o[i]=d;}catch(e){}}sData(o);}
  async function selUser(n){await loadUD(n);await sLastUser(n);const sd=storage.get(`sd:${nkey(n)}`);sStartDate(sd?parseInt(sd.value):null);sProf({name:n});sScr("map");sTab("map");}
  async function mkUser(){const n=ni.trim();if(!n)return;if(n.toLowerCase()==="admin03"){sData(mkSample(1));sAdm(true);sAdmH(1);sProf({name:"Admin Preview"});sScr("admin");sTab("admin");return;}await sheetPost({action:"registerUser",nickname:n});const l=await addRoster(n);sRost(l);sNi("");if(!storage.get(`sd:${nkey(n)}`))storage.set(`sd:${nkey(n)}`,String(Date.now()));await selUser(n);}
  function logout(){sProf(null);sIntr(false);sAdm(false);sStartDate(null);sLastUser(null);sData(initData());}
  function swAdm(hid){sAdmH(hid);sData(mkSample(hid));}
  function setF(d,m,f,v){sData(prev=>{const x=JSON.parse(JSON.stringify(prev));x[d][m][f]=v;if(f==="category"&&v&&!x[d][m].loggedAt)x[d][m].loggedAt=Date.now();sDay(prof.name,d,x[d]);return x;});}
  function togC(d,m,f,v){sData(prev=>{const x=JSON.parse(JSON.stringify(prev));x[d][m][f]=x[d][m][f]===v?null:v;if(f==="category"&&x[d][m][f])x[d][m].loggedAt=Date.now();sDay(prof.name,d,x[d]);return x;});}
  function hPh(d,m,e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async ev=>{const c=await compressImage(ev.target.result);setF(d,m,"photo",c);};r.readAsDataURL(f);}


  const ti=todayIdx(startDate);

  useEffect(()=>{
    if(!prof)return;
    for(let i=0;i<DAYS;i++){
      const dlKey=`dl:${nkey(prof.name)}:${i}`;
      if(!storage.get(dlKey)&&dDone(data[i],adm)){storage.set(dlKey,"1");const topFood=MS.map(s=>data[i][s.key]).find(m=>m.foodName)?.foodName||"";const cat=MS.map(s=>data[i][s.key]).find(m=>m.category&&m.category!=="Skipped")?.category||"";sheetPost({action:"logDaily",nickname:prof.name,day:i+1,foodName:topFood,category:cat});}
    }
  },[data,prof,adm]);

  const stamps=useMemo(()=>Array.from({length:DAYS},(_,i)=>dDone(data[i],adm)).filter(Boolean).length,[data,adm]);
  const growth=useMemo(()=>gStage(data,adm),[data,adm]);
  const haechi=useMemo(()=>adm?HAECHI.find(h=>h.id===admH)||HAECHI[0]:analyzeHaechi(data),[data,adm,admH]);
  const ratios=useMemo(()=>fRatios(data),[data]);
  const photos=useMemo(()=>cPhotos(data),[data]);
  const stats=useMemo(()=>{const cc={},pc={},ec={};for(let i=0;i<DAYS;i++)for(const s of MS){const m=data[i][s.key];if(m.category)cc[m.category]=(cc[m.category]||0)+1;if(m.physical)pc[m.physical]=(pc[m.physical]||0)+1;if(m.emotional)ec[m.emotional]=(ec[m.emotional]||0)+1;}return{tc:Object.entries(cc).sort((a,b)=>b[1]-a[1])[0],tp:Object.entries(pc).sort((a,b)=>b[1]-a[1])[0],te:Object.entries(ec).sort((a,b)=>b[1]-a[1])[0]};},[data]);
  const reflectDone=REFLECT_QS.every((_,qi)=>!!eva[qi]);
  const reflectAndGoal=reflectDone&&!!goal;

  if(ld)return(<div style={{padding:"3rem",textAlign:"center",color:C.inkLL,fontSize:20,background:C.bg,minHeight:"100vh"}}>Loading…</div>);

  const Hdr=({title,subtitle,backLabel="Map",onBack})=>(<div style={{position:"sticky",top:0,zIndex:20,boxShadow:"0 4px 20px rgba(60,25,12,.35)"}}>
    <div style={{background:"#6B2E1C",textAlign:"right",padding:"2px 14px",fontSize:9.5,fontFamily:"'Playfair Display',Georgia,serif",fontStyle:"italic",letterSpacing:".16em",color:"#E8B98A",fontWeight:600}}>made by. Luna Shim 우솔</div>
    <DanChungBorder/>
    <div style={{padding:"1rem 1.25rem .85rem",position:"relative",overflow:"hidden",minHeight:70,background:"linear-gradient(135deg,#5C2418 0%,#8A3F26 55%,#6B2E1C 100%)"}}>
      <KoreanPattern opacity={1}/>
      {/* decorative stamp — right side */}
      <img src={`${B}haechi/stamp.png`} alt="" style={{position:"absolute",right:-8,top:"65%",transform:"translateY(-50%) rotate(12deg)",width:80,height:80,objectFit:"contain",opacity:.9,filter:"brightness(0) saturate(100%) invert(82%) sepia(45%) saturate(600%) hue-rotate(345deg) brightness(1.05)",pointerEvents:"none",zIndex:1}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".25rem",position:"relative",zIndex:2}}>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,.45)",fontWeight:700,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Playfair Display',Georgia,serif"}}>Official Program</span>
          <span style={{fontSize:12,color:"#F2D9A8",fontWeight:900,letterSpacing:".2em",textTransform:"uppercase",fontFamily:"'Playfair Display',Georgia,serif",textShadow:"0 1px 8px rgba(0,0,0,.4)"}}>CIEE Korea</span>
        </div>
        {onBack&&<button onClick={onBack} style={{background:"none",border:"none",color:"#E8B98A",fontSize:15,cursor:"pointer",padding:0,fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif"}}>{backLabel}</button>}
      </div>
      {title&&<h1 style={{fontSize:22,fontWeight:900,color:"#F7E8CE",position:"relative",zIndex:2,animation:"popIn .35s ease both"}}>{title}</h1>}
      {subtitle&&<p style={{fontSize:15,color:"rgba(245,220,195,.8)",marginTop:4,fontWeight:600,position:"relative",zIndex:2,animation:"revealBlock .3s ease .1s both"}}>{subtitle}</p>}
    </div>
  </div>);

  const Nav=({current})=>{const tabs=[...NAV_TABS,...(adm?[["admin","Admin"]]:[])];const icons={"map":"🗺","recap":"📖","group":"👥","hatch":"🐉","admin":"⚙️"};return(<div style={{display:"flex",background:C.paper,borderTop:`2px solid ${C.bdrL}`,boxShadow:"0 -2px 10px rgba(120,60,30,.08)"}}>{tabs.map(([t,lb])=>{const active=current===t;return(<button key={t} style={{flex:1,padding:".55rem .2rem .5rem",fontSize:10,color:active?C.red:C.inkLL,background:active?"rgba(139,58,42,.06)":"none",border:"none",cursor:"pointer",fontWeight:800,fontFamily:"'Playfair Display',Georgia,serif",borderTop:`3px solid ${active?C.red:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3,letterSpacing:".04em",textTransform:"uppercase",transition:"color .15s,background .15s"}} onClick={()=>{sTab(t);sScr(t);if(t==="group"){loadGroupData();}}}><span style={{fontSize:20,lineHeight:1}}>{icons[t]||"·"}</span>{lb}</button>);})}</div>);};

  if(!prof&&!intr)return(<div className="app">
    <div style={{flex:1,overflowY:"auto"}}>
      <DanChungBorder/>
      <div style={{padding:".3rem .875rem .1rem",textAlign:"left"}}><span style={{fontSize:8.5,color:C.inkLL,fontWeight:800,letterSpacing:".13em",textTransform:"uppercase",fontFamily:"'Playfair Display',Georgia,serif"}}>CIEE Korea</span></div>

      {/* Hero - Stamp image + title */}
      <div style={{textAlign:"center",padding:"1.25rem 1.5rem 0"}}>
        <div style={{margin:"0 auto .625rem",width:140,height:140,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,rgba(168,79,51,.15) 0%,transparent 70%)`,filter:"blur(8px)"}}/>
          <img src={`${B}haechi/stamp.png`} alt="stamp" style={{width:"100%",height:"100%",objectFit:"contain",display:"block",position:"relative",filter:"drop-shadow(0 6px 20px rgba(168,79,51,.3)) drop-shadow(0 2px 8px rgba(0,0,0,.15))"}}/>
        </div>
        <RevealText text="한국 음식 여행" delay={300} speed={60} tag="div" style={{fontSize:11,letterSpacing:".3em",color:C.inkLL,textTransform:"uppercase",marginBottom:".4rem"}}/>
        <div style={{fontSize:30,marginBottom:".5rem",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:"#8B3A2A",lineHeight:1.2}}><RevealText text="CIEE Korea" delay={700} speed={55}/><br/><RevealText text="Food Journey" delay={1200} speed={55}/></div>
        <div style={{fontSize:15,color:C.inkL,marginBottom:".25rem",lineHeight:1.5,fontStyle:"italic",animation:"revealBlock .7s ease 1.8s both"}}>"Log your meals each day,<br/>and watch your Haechi come to life."</div>
        <div style={{marginBottom:".5rem",animation:"revealBlock .7s ease 2.1s both"}}>
          <span style={{fontSize:11,fontFamily:"'Playfair Display',Georgia,serif",fontStyle:"italic",letterSpacing:".18em",color:"#A8A8A8",fontWeight:600}}>made by. Luna Shim 우솔</span>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:".4rem"}}>
          {Array.from({length:DAYS},(_,i)=>(
            <svg key={i} viewBox="0 0 58 58" width={40} height={40}>
              <circle cx="29" cy="29" r="22" fill="none" stroke={i%3===0?C.red:i%3===1?C.teal:C.gold} strokeWidth="2.5" strokeDasharray="4,3" opacity="0.55"/>
              <text x="29" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill={i%3===0?C.red:i%3===1?C.teal:C.gold} fontFamily="Georgia" opacity="0.45">食</text>
            </svg>
          ))}
        </div>
        <div style={{fontSize:13,letterSpacing:".12em",color:C.inkLL,marginBottom:"1rem"}}>7 days · 7 stamps</div>
      </div>

      {/* Continue Your Journey — always shown if roster exists */}
      {rost.length>0&&(
        <div style={{padding:"0 1.25rem 1.25rem"}}>
          <div style={{background:C.paper,border:`2px solid ${C.bdr}`,borderRadius:18,overflow:"hidden",boxShadow:"0 4px 24px rgba(120,60,30,.18)"}}>
            <div style={{background:`linear-gradient(135deg,${C.red},${C.accent})`,padding:".9rem 1.25rem",position:"relative",overflow:"hidden"}}>
              <KoreanPattern opacity={0.12}/>
              <div style={{fontSize:10,letterSpacing:".18em",color:"rgba(255,255,255,.7)",textTransform:"uppercase",marginBottom:2}}>여행 계속하기</div>
              <div style={{fontSize:19,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:"#fff"}}>Continue Your Journey</div>
            </div>
            <div style={{padding:".875rem",display:"flex",flexDirection:"column",gap:8}}>
              {rost.map(n=>(<div key={n} style={{display:"flex",alignItems:"center",gap:6}}>
                <button onClick={()=>selUser(n)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",flex:1,background:C.bg,border:`2px solid ${C.bdrL}`,borderLeft:`4px solid ${C.red}`,borderRadius:12,padding:"13px 16px",fontSize:17,color:C.ink,cursor:"pointer",fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",textAlign:"left"}}>
                  <span style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:17}}>🏮</span><span>{n}</span></span>
                  <span style={{color:C.red,fontSize:20}}>›</span>
                </button>
                <button onClick={async()=>{if(!window.confirm(`Are you sure you want to delete "${n}"? You can't cancel.`))return;const l=rost.filter(x=>x!==n);await sRoster(l);sRost(l);}} style={{flexShrink:0,background:"none",border:`1.5px solid ${C.bdrL}`,borderRadius:10,padding:"10px 12px",fontSize:15,color:C.inkLL,cursor:"pointer",fontWeight:700}}>✕</button>
              </div>))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom dancheong */}
      <div style={{padding:"0 1.25rem .5rem"}}><DanChungBorder/></div>

      {/* New user entry */}
      <div style={{textAlign:"center",paddingBottom:"2rem",paddingTop:".5rem"}}>
        <div style={{padding:"0 1.25rem",animation:"fadeIn .2s"}}>
          <input className="iinp" style={{maxWidth:"100%",marginBottom:6,fontSize:14}} placeholder="e.g. Erica1 or MinJun02" value={ni} onChange={e=>sNi(e.target.value)} maxLength={20} onKeyDown={e=>{if(e.key==="Enter"&&ni.trim())sIntr(true);}}/>
          <div style={{fontSize:12,color:C.inkLL,marginBottom:8,fontStyle:"italic"}}>Use your name + a number to keep it unique!</div>
          <button className="ibtn" style={{maxWidth:"100%",fontSize:15,padding:"10px"}} disabled={!ni.trim()} onClick={()=>sIntr(true)}>→</button>
        </div>
      </div>
    </div>
  </div>);

  if(!prof&&intr)return(<div className="app"><DanChungBorder/><div style={{padding:".3rem .875rem .1rem",textAlign:"left"}}><span style={{fontSize:8.5,color:C.inkLL,fontWeight:800,letterSpacing:".13em",textTransform:"uppercase",fontFamily:"'Playfair Display',Georgia,serif"}}>CIEE Korea</span></div><div style={{flex:1,overflowY:"auto",padding:"1rem 1.25rem 1.5rem",textAlign:"center"}}>
    <div style={{fontSize:26,marginTop:".25rem",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:C.accent,animation:"popIn .5s cubic-bezier(.34,1.56,.64,1) .1s both"}}>Welcome, {ni.trim()}!</div>
    <div style={{fontSize:14,color:C.inkL,margin:".3rem 0 .875rem",lineHeight:1.6,fontStyle:"italic",animation:"revealBlock .6s ease .5s both"}}>Your 7-day food journey begins now.</div>
    {[["How To Grow Your Haechi",[["🥚","Egg — Cracks appear as you log meals."],["🐣","Hatchling — Appears after 5 days logged."],["🦁","Haechi — Born on Day 7, shaped by your week!"]]],["How To Earn Stamps",[["📝","Log at least 3 meals (Type + Physical + Emotional)"],["📸","Upload at least one photo each day"]]],["Group Egg 🥚",[["👥","When 80% of all participants log each day, the group egg hatches one stage!"]]]].map(([title,rows])=>(<div key={title} className="sbox" style={{marginBottom:".75rem",padding:".875rem"}}><h3 style={{fontSize:15,marginBottom:".5rem"}}>{title}</h3>{rows.map(([e,t])=>(<div key={t} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:".5rem"}}><span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0}}>{e}</span><span style={{fontSize:13,lineHeight:1.5}}>{t}</span></div>))}</div>))}
    <button className="ibtn" style={{marginBottom:8,fontSize:16,padding:"12px"}} onClick={mkUser}>Start Journey →</button>
    <button onClick={()=>sIntr(false)} style={{width:"100%",maxWidth:320,margin:"0 auto",background:C.bg,border:`2px solid ${C.bdr}`,borderRadius:10,padding:"10px 16px",fontSize:14,color:C.ink,cursor:"pointer",fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",display:"block"}}>← Change nickname</button>
  </div></div>);

  return(<div className="app">
    {showPassport&&<PassportBadge prof={prof} haechi={haechi} stamps={stamps} stats={stats} onClose={()=>sShowPassport(false)}/>}
    {showReel&&<MemoryReel photos={reelPhotos} onClose={()=>sShowReel(false)}/>}

    {scr==="map"&&<><Hdr onBack={logout} backLabel="‹ Switch User" title={`${prof?.name}'s Journey`} subtitle={`${stamps}/${DAYS} stamps earned`}/><Nav current="map"/>
      <div style={{flex:1,overflowY:"auto",padding:"1rem .75rem 1.5rem"}}>
        {/* Restaurant Guide */}
        <div style={{background:"linear-gradient(135deg,#5C2418 0%,#8A3F26 100%)",border:"2px solid #B05E40",borderRadius:12,padding:".65rem .85rem",boxShadow:"0 4px 20px rgba(80,30,15,.25)",marginBottom:".875rem"}}>
          <div style={{fontSize:14,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:"#F2D9A8",marginBottom:8,textAlign:"center",letterSpacing:".06em",textShadow:"0 1px 8px rgba(0,0,0,.3)"}}>🍚 {selectedArea?`${selectedArea} Restaurants`:"Restaurant Guide"}</div>
          {!selectedArea?(
            <div style={{display:"flex",gap:8}}>
              {[{name:"Somerset",emoji:"🐮"},{name:"Botanik",emoji:"🐨"}].map(({name,emoji})=>(<button key={name} onClick={()=>sSelectedArea(name)} style={{flex:1,padding:"9px 8px",borderRadius:10,border:"2px solid rgba(242,217,168,.35)",background:"rgba(255,255,255,.1)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif",color:"#F2D9A8"}}>{emoji} {name}</button>))}
            </div>
          ):(
            <div>
              <button onClick={()=>sSelectedArea(null)} style={{fontSize:12,color:"#F2D9A8",background:"none",border:"none",cursor:"pointer",fontWeight:700,marginBottom:8,fontFamily:"'Playfair Display',Georgia,serif"}}>← Back</button>
              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:7}}>
                {RESTAURANT_LINKS[selectedArea].map((rest,i)=>(<a key={i} href={rest.url} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"9px 11px",borderRadius:10,border:"1.5px solid rgba(242,217,168,.25)",background:"rgba(255,255,255,.08)",color:"#F7E8CE",textDecoration:"none",fontWeight:700,cursor:"pointer",transition:"all .2s ease"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.15)";e.currentTarget.style.borderColor="rgba(242,217,168,.55)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.borderColor="rgba(242,217,168,.25)";}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:18,flexShrink:0}}>{rest.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:"#F7E8CE",fontWeight:700}}>{rest.name}</div>
                      <div style={{fontSize:11,color:"rgba(242,217,168,.7)",fontWeight:600}}>{rest.type}</div>
                    </div>
                    <span style={{color:"#F2D9A8",fontSize:14,flexShrink:0}}>›</span>
                  </div>
                </a>))}
              </div>
            </div>
          )}
        </div>
        <div style={{fontSize:11,color:C.inkLL,textAlign:"center",marginBottom:".4rem",letterSpacing:".05em"}}>Tap a day to log your meals</div>
        {/* Calendar grid — roadmap style */}
        <div style={{position:"relative",marginBottom:"1rem"}}><div style={{position:"absolute",top:44,left:"3%",right:"3%",height:2,background:`repeating-linear-gradient(90deg,${C.bdr} 0px,${C.bdr} 7px,transparent 7px,transparent 13px)`,zIndex:0,opacity:.55}}/><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,position:"relative",zIndex:1}}>{Array.from({length:DAYS},(_,i)=>{const done=dDone(data[i],adm),ul=true,cur=i===ti,dep=i===DAYS-1;return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div onClick={()=>{sAd(i);sAm(null);sScr("day");if(i===DAYS-1){const all=photos.map(p=>({photoUrl:p.photo,foodName:p.foodName})).filter(p=>p.photoUrl);if(all.length>0){const arr=[...all];for(let j=arr.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[arr[j],arr[k]]=[arr[k],arr[j]];}sReelPhotos(arr);sShowReel(true);}}}} style={{width:"100%",minHeight:88,borderRadius:12,cursor:"pointer",border:done?"2px solid transparent":cur?`2px solid ${C.red}`:`2px solid ${C.bdr}`,background:done?"transparent":C.paper,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:cur&&!done?`0 0 14px rgba(168,79,51,.32)`:"none",position:"relative"}}>{done?<Stamp day={data[i]} idx={i} sz={52} big={true}/>:cur?<span style={{fontSize:20}}>📍</span>:<div style={{width:9,height:9,borderRadius:"50%",background:C.bdrL}}/>}</div><div style={{textAlign:"center",paddingTop:2}}><div style={{fontSize:8,color:C.inkLL,fontWeight:800,letterSpacing:".15em",textTransform:"uppercase",lineHeight:1.4}}>Day</div><div style={{fontSize:16,color:done?C.accent:cur?C.red:C.inkLL,fontWeight:900,lineHeight:1.1}}>{i+1}</div>{dep&&<div style={{fontSize:7,background:C.goldL,color:C.goldD,padding:"0 3px",borderRadius:3,fontWeight:800,marginTop:1,letterSpacing:".05em"}}>LAST</div>}</div></div>);})}</div></div>
        {/* Progress bar */}
        <div style={{margin:"0 .25rem .875rem"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:15,color:C.inkL,fontWeight:700,marginBottom:5}}><span>Progress</span><span>{Math.round(stamps/DAYS*100)}%</span></div><div style={{height:12,background:C.bgA,borderRadius:6,overflow:"hidden",border:`1.5px solid ${C.bdr}`}}><div style={{height:"100%",width:`${stamps/DAYS*100}%`,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:6,transition:"width .4s"}}/></div></div>
        {/* Memory Egg — bottom */}
        <div onClick={()=>{sScr("hatch");sTab("hatch");}} style={{background:C.paper,border:`2px solid ${C.bdr}`,borderRadius:12,padding:".5rem .75rem",boxShadow:"0 2px 10px rgba(120,60,30,.10)",cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",gap:".65rem",marginTop:".75rem"}}>
          <KoreanPattern opacity={0.06}/>
          <div style={{flexShrink:0}}>
            {growth.stage==="egg"&&<EggSVG pct={growth.pct} sz={52}/>}
            {growth.stage==="chick"&&<ChickSVG sz={52}/>}
            {growth.stage==="haechi"&&<HaechiBadge haechi={haechi} sz={52}/>}
          </div>
          <div style={{textAlign:"left",flex:1}}>
            {growth.stage==="egg"&&<><div style={{fontSize:14,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent}}>Memory Egg</div><div style={{fontSize:11,color:C.inkL,marginTop:1}}>Log meals to grow · {Math.round(growth.pct/.7*100)}%</div></>}
            {growth.stage==="chick"&&<><div style={{fontSize:14,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent}}>Hatchling!</div><div style={{fontSize:11,color:C.inkL,marginTop:1}}>Almost ready — keep logging</div></>}
            {growth.stage==="haechi"&&<><div style={{fontSize:14,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent}}>{haechi.name}</div><div style={{fontSize:11,color:C.inkL,marginTop:1}}>Tap to see your results</div></>}
          </div>
          <span style={{color:C.inkLL,fontSize:16,flexShrink:0}}>›</span>
        </div>
      </div>
    </>}

    {scr==="day"&&<><Hdr onBack={()=>{if(am)sAm(null);else sScr("map");}} backLabel={`‹ ${am?"Meals":"Map"}`} title={`Day ${ad+1} — ${dLabel(ad,startDate)}`} subtitle={dDone(data[ad],adm)?"Stamp earned!":"Log 3+ meals & add a photo"}/>
      <div style={{flex:1,overflowY:"auto",padding:"1rem .75rem 2rem"}}>
        {!am&&<>
          <div style={{fontSize:17,color:C.inkL,textAlign:"center",marginBottom:".875rem",lineHeight:1.6}}>Fill <strong style={{color:C.accent}}>3+ meals</strong> (Type + Physical + Emotional) and add <strong style={{color:C.accent}}>one photo</strong> to earn your stamp.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>{MS.map(s=>{const m=data[ad][s.key],c=mDone(m),st=mLog(m);return(<div key={s.key} onClick={()=>{sAm(s.key);sRestArea(null);}} style={{background:c?s.bg:C.paper,border:`2px solid ${c?s.bdr:C.bdr}`,borderRadius:14,padding:"1.25rem .75rem",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,position:"relative"}}>{c&&<span style={{position:"absolute",top:8,right:10,color:s.col,fontSize:18}}>✓</span>}{st&&!c&&<span style={{position:"absolute",top:6,right:10,color:C.gold,fontSize:20,fontWeight:700}}>…</span>}<span style={{fontSize:34}}>{s.emoji}</span><span style={{fontSize:20,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:c?s.col:C.ink}}>{s.label}</span></div>);})}</div>
          {(()=>{const lm=MS.filter(s=>mDone(data[ad][s.key])).length,ph=dHasPhoto(data[ad]),ok=dDone(data[ad],adm);return(<div style={{marginTop:"1rem",padding:12,borderRadius:10,fontSize:17,fontWeight:700,textAlign:"center",background:ok?C.tealL:C.bgA,color:ok?C.teal:C.inkLL}}>{ok?"Stamp earned for this day!":`${lm}/3 meals completed   ${ph?"✓":"○"} Photo`}</div>);})()}
        </>}
        {am&&(()=>{const sl=MS.find(s=>s.key===am),m=data[ad][am],hasPhoto=dHasPhoto(data[ad]);return(<div style={{background:C.paper,border:`2px solid ${sl.bdr}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{background:sl.bg,padding:".9rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`2px solid ${sl.bdr}`}}>
            <span style={{fontSize:21,display:"flex",alignItems:"center",gap:8,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:sl.col}}><span style={{fontSize:24}}>{sl.emoji}</span>{sl.label}</span>
          </div>
          <div style={{padding:"1.1rem"}}>
            <div className="cl" style={{color:"#6E7A2E"}}>What did you eat?</div>
            <input className="linp" style={{marginBottom:6}} placeholder="e.g. 김치찌개 (Kimchi Jjigae)..." value={m.foodName||""} onChange={e=>setF(ad,am,"foodName",e.target.value)}/>
            <div style={{fontSize:14,color:C.inkLL,marginBottom:12,fontStyle:"italic"}}>Write in Korean and English! e.g. 비빔밥 (Bibimbap)</div>
            <div className="cl" style={{color:"#A06A1E"}}>Meal Type</div>
            <div className="cps">{CATS.map(v=>(<button key={v} className={`cp${m.category===v?" sc":""}`} onClick={()=>togC(ad,am,"category",v)}>{v}</button>))}</div>
            {m.category==="Restaurant"&&<><div className="cl" style={{marginTop:10,color:"#A84F33"}}>Which Area?</div><div style={{display:"flex",gap:8,marginBottom:10}}>{["Somerset","Botanik"].map(a=>(<button key={a} style={{flex:1,padding:"9px 0",borderRadius:10,cursor:"pointer",border:`2px solid ${restArea===a?C.red:C.bdrL}`,background:restArea===a?C.redL:C.bg,fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,color:restArea===a?C.red:C.ink}} onClick={()=>sRestArea(a)}>{a==="Somerset"?"🐮":"🐨"} {a}</button>))}</div>{restArea&&<><div className="cl" style={{color:"#A84F33"}}>Pick a Restaurant</div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{(RESTAURANT_LINKS[restArea]||[]).map(r=>(<button key={r.name} style={{fontSize:13,padding:"7px 12px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${m.foodName===r.name?C.red:C.bdrL}`,background:m.foodName===r.name?C.redL:C.bg,fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",color:m.foodName===r.name?C.red:C.ink}} onClick={()=>{setF(ad,am,"foodName",r.name);sheetPost({action:"logRestaurant",nickname:prof.name,restaurant:r.name,area:restArea});}}>{r.emoji} {r.name}</button>))}</div><div className="cl" style={{color:"#A84F33"}}>Or type a name</div><input className="linp" style={{marginBottom:6}} placeholder="Restaurant name…" value={m.foodName||""} onChange={e=>setF(ad,am,"foodName",e.target.value)}/></>}</>}
            {m.category&&m.category!=="Skipped"&&<>
              <div className="dv"/><div className="cl" style={{color:"#8A5A2E"}}>How Did You Feel Physically?</div>
              <div className="cps">{PHYS.map(v=>(<button key={v} className={`cp${m.physical===v?" sp":""}`} onClick={()=>togC(ad,am,"physical",v)}>{v}</button>))}</div>
              <div className="cl" style={{color:"#9C4A52"}}>How Did You Feel Emotionally?</div>
              <div className="cps">{EMOS.map(v=>(<button key={v} className={`cp${m.emotional===v?" se":""}`} onClick={()=>togC(ad,am,"emotional",v)}>{v}</button>))}</div>
            </>}
            <div className="dv"/><div className="cl" style={{color:"#B05E40"}}>Where Did You Eat?</div>
            <input className="linp" placeholder="e.g. Hongdae pocha, GS25…" value={m.location} onChange={e=>setF(ad,am,"location",e.target.value)}/>
            <div className="dv"/><div className="cl" style={{color:"#8A6020"}}>Photo (required for stamp)</div>
            {m.photo?<div><img src={m.photo} alt="" style={{width:"100%",borderRadius:12,display:"block"}}/><button onClick={()=>setF(ad,am,"photo",null)} style={{fontSize:15,color:C.red,background:"none",border:"none",cursor:"pointer",marginTop:6,fontWeight:700}}>✕ Remove</button></div>:<div onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>hPh(ad,am,e);inp.click();}} style={{border:`2px dashed ${C.bdr}`,borderRadius:12,padding:"1.25rem",textAlign:"center",cursor:"pointer",color:C.inkLL,fontSize:17,background:C.bg,fontWeight:700}}>Tap to add a photo</div>}
            <div style={{marginTop:"1rem",padding:12,borderRadius:10,fontSize:17,fontWeight:700,textAlign:"center",background:(mDone(m)&&hasPhoto)?C.tealL:C.bgA,color:(mDone(m)&&hasPhoto)?C.teal:C.inkLL}}>{mDone(m)?(hasPhoto?"✓ Complete!":"✓ Meal done — add a photo to earn stamp"):"Fill Type + Physical + Emotional to complete"}</div>
            {mDone(m)&&!hasPhoto&&<div style={{marginTop:".5rem",padding:"10px 12px",borderRadius:10,fontSize:15,fontWeight:700,textAlign:"center",background:C.goldL,color:C.goldD}}>A photo is still needed for today's stamp</div>}
          </div>
        </div>);})()}
      </div>
    </>}

    {scr==="hatch"&&<><Hdr onBack={()=>{sScr(adm?"admin":"map");sTab(adm?"admin":"map");}} backLabel={adm?"‹ Admin":"‹ Map"} title="My Haechi" subtitle={growth.stage==="haechi"?"Your Haechi is born!":growth.stage==="chick"?"Hatching…":"Growing…"}/>
      <div style={{flex:1,overflowY:"auto",padding:"1.5rem 1.25rem 2rem",textAlign:"center"}}>
        {growth.stage==="egg"&&<><div style={{fontSize:13,letterSpacing:".14em",textTransform:"uppercase",color:C.inkL,fontWeight:700,marginBottom:".5rem"}}>Stage 1 · The Egg</div><EggSVG pct={growth.pct} sz={160}/><div style={{fontSize:22,marginTop:".875rem",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:C.accent}}>Memory Egg</div><div style={{fontSize:14,marginTop:"1rem",lineHeight:1.9,background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",textAlign:"left"}}>Log your meals each day to crack the egg open.<br/>Hatches after <strong>5 days</strong> logged.<br/><br/><strong>{growth.logged} days</strong> logged so far.</div></>}
        {growth.stage==="chick"&&<><div style={{fontSize:13,letterSpacing:".14em",textTransform:"uppercase",color:C.inkL,fontWeight:700,marginBottom:".5rem"}}>Stage 2 · The Hatchling</div><ChickSVG sz={160}/><div style={{fontSize:22,marginTop:".875rem",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:C.accent}}>A Hatchling Appeared!</div><div style={{fontSize:14,marginTop:"1rem",lineHeight:1.9,background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",textAlign:"left"}}>Keep logging until Day 7 and your Haechi will reveal itself!</div></>}
        {growth.stage==="haechi"&&(()=>{const tf=ratios[0]?ratios[0].name:"good food";return(<>
          <div style={{fontSize:13,letterSpacing:".14em",textTransform:"uppercase",color:C.inkL,fontWeight:700,marginBottom:".5rem"}}>Your Haechi</div>
          <HaechiBadge haechi={haechi} sz={180}/>
          <RevealText text={haechi.name} tag="div" delay={500} speed={65} style={{fontSize:24,marginTop:".875rem",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:C.accent}}/>
          <RevealText text={haechi.sub} tag="div" delay={900} speed={32} style={{fontSize:14,color:C.inkL,marginTop:4,fontStyle:"italic"}}/>
          <div style={{fontSize:14,marginTop:"1rem",lineHeight:1.9,background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",textAlign:"center",fontStyle:"italic",animation:"revealBlock .7s ease 1.4s both"}}>{haechi.desc}</div>
          <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",marginTop:"1rem",textAlign:"left"}}>
            <div style={{fontSize:20,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:".875rem"}}>This Week, You Ate…</div>
            {ratios.length>0?<>{ratios.slice(0,5).map(r=>(<div key={r.name} style={{marginBottom:".875rem"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:700,marginBottom:4}}><span>{r.name}</span><span style={{color:C.red}}>{r.pct}%</span></div><div style={{height:12,background:C.bgA,borderRadius:6,overflow:"hidden",border:`1px solid ${C.bdrL}`}}><div style={{height:"100%",width:`${r.pct}%`,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:6}}/></div></div>))}<div style={{fontSize:15,color:C.inkLL,textAlign:"right",marginTop:4}}>across your week!</div></>:<div style={{fontSize:16,color:C.inkLL}}>No meals logged yet</div>}
          </div>
          <div style={{background:C.goldL,border:`2px solid ${C.bdr}`,borderRadius:14,padding:"1.25rem",marginTop:"1rem",textAlign:"left"}}>
            <RevealText text="A Letter From Your Haechi" tag="div" delay={0} speed={42} style={{fontSize:21,color:C.accent,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,marginBottom:".7rem"}}/>
            <div style={{fontSize:14,lineHeight:2,whiteSpace:"pre-line",fontStyle:"italic",animation:"revealBlock 1s ease .7s both"}}>{`Dear ${prof?.name},\n\nI am your ${haechi.name}, born from a week of ${tf.toLowerCase()} and honest feelings.\n\n${haechi.desc}\n\nThank you for every meal you recorded. Each entry shaped who I am.\n\nUntil next week. 🦁`}</div>
          </div>
          {photos.length>0&&<div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",marginTop:"1rem",textAlign:"left"}}>
            <div style={{fontSize:20,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:".875rem"}}>Your Memories ({photos.length} photos)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{photos.map((ph,i)=>(<div key={i} onClick={()=>sPv(ph)} style={{position:"relative",aspectRatio:1,borderRadius:10,overflow:"hidden",cursor:"pointer",border:`2px solid ${C.bdrL}`}}><img src={ph.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/><span style={{position:"absolute",bottom:3,left:4,fontSize:12,color:"#fff",background:"rgba(0,0,0,.55)",padding:"2px 6px",borderRadius:5,fontWeight:700}}>D{ph.day+1}{ph.foodName?` · ${ph.foodName.split("(")[0].trim()}`:""}</span></div>))}</div>
          </div>}
          <div style={{marginTop:"1rem",textAlign:"left",background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem"}}>
            {[["Days Logged",`${growth.logged}/${DAYS}`],["Most Eaten",stats.tc?stats.tc[0]:"—"],["Top Emotion",stats.te?stats.te[0]:"—"],["Your Haechi",haechi.name]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:700,padding:"8px 0",borderBottom:`1.5px solid ${C.bdrL}`}}><span>{k}</span><span>{v}</span></div>))}
          </div>
          {growth.stage==="haechi"&&<button onClick={()=>{sheetPost({action:"addBadge",nickname:prof?.name,haechiName:haechi.name,haechiSub:haechi.sub,stampsEarned:stamps,topFood:stats.tc?stats.tc[0]:"",topEmotion:stats.te?stats.te[0]:""});sShowPassport(true);}} style={{width:"100%",marginTop:20,background:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:"#fff",border:"none",borderRadius:10,padding:16,fontSize:20,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700}}>Download Passport 🎫</button>}
          <button onClick={()=>sScr("reflect")} style={{width:"100%",marginTop:12,background:C.teal,color:"#fff",border:"none",borderRadius:10,padding:14,fontSize:19,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700}}>Self-Reflection & Challenge →</button>
          <div style={{marginTop:"1.25rem",fontSize:19,color:C.inkL,lineHeight:1.9,fontStyle:"italic"}}>"You showed up this week, {prof?.name}.<br/>This Haechi is yours and yours alone."</div>
        </>);})()}
      </div>
    </>}

    {scr==="reflect"&&<><Hdr onBack={()=>sScr("hatch")} backLabel="‹ My Haechi" title="Reflection" subtitle={reflectDone?"All done! Pick your challenge.":"Answer all questions to continue."}/>
      <div style={{flex:1,overflowY:"auto",padding:"1.5rem 1.25rem 2rem",textAlign:"center"}}>
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",textAlign:"left"}}>
          <div style={{fontSize:20,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:".875rem"}}>Self-Reflection</div>
          {REFLECT_QS.map((it,qi)=>(<div key={qi} style={{marginBottom:"1rem"}}>
            <div style={{fontSize:17,fontWeight:700,marginBottom:8}}>{eva[qi]?<span style={{color:C.teal,marginRight:6}}>✓</span>:<span style={{color:C.redL,marginRight:6}}>○</span>}{it.q}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{it.o.map(o=>(<button key={o} onClick={()=>sEva(p=>({...p,[qi]:o}))} style={{fontSize:16,padding:"9px 15px",borderRadius:20,border:`1.5px solid ${eva[qi]===o?C.teal:C.bdr}`,background:eva[qi]===o?C.teal:C.bg,color:eva[qi]===o?"#fff":C.ink,cursor:"pointer",fontWeight:700}}>{o}</button>))}</div>
          </div>))}
          {!reflectDone&&<div style={{fontSize:15,color:C.red,fontWeight:700,textAlign:"center",marginTop:8,padding:10,background:C.redL,borderRadius:10}}>Please answer all {REFLECT_QS.length} questions to continue.</div>}
        </div>
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",marginTop:"1rem",textAlign:"left",opacity:reflectDone?1:.5,pointerEvents:reflectDone?"auto":"none"}}>
          <div style={{fontSize:20,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:".875rem"}}>Next Week's Challenge</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["🥗","Eat more veggies"],["🌅","Never skip breakfast"],["💧","Drink more water"],["🌙","Cut late-night snacks"]].map(([ic,g])=>(<button key={g} onClick={()=>reflectDone&&sGoal(g)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"1.1rem",borderRadius:14,border:`2px solid ${goal===g?C.red:C.bdr}`,background:goal===g?C.redL:C.bg,cursor:"pointer",fontWeight:700,fontSize:17,color:goal===g?C.red:C.ink}}><span style={{fontSize:28}}>{ic}</span><span>{g}</span></button>))}</div>
          {!goal&&reflectDone&&<div style={{fontSize:15,color:C.gold,fontWeight:700,textAlign:"center",marginTop:8,padding:10,background:C.goldL,borderRadius:10}}>Pick a challenge to continue.</div>}
        </div>
        <button disabled={!reflectAndGoal} onClick={()=>{sheetPost({action:"addReflection",nickname:prof?.name,answers:REFLECT_QS.map((it,qi)=>it.q+": "+eva[qi]).join(" | "),goal,haechiName:haechi.name});sScr("next");}} style={{width:"100%",maxWidth:320,marginTop:20,background:reflectAndGoal?`linear-gradient(135deg,${C.red},${C.accent})`:"#ccc",color:"#fff",border:"none",borderRadius:10,padding:16,fontSize:20,cursor:reflectAndGoal?"pointer":"default",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,boxShadow:reflectAndGoal?"0 4px 16px rgba(168,79,51,.3)":"none"}}>Complete Journey →</button>
      </div>
    </>}

    {scr==="next"&&<><Hdr onBack={()=>sScr("reflect")} backLabel="‹ Reflection" title="Next Journey" subtitle="A new week awaits."/>
      <div style={{flex:1,overflowY:"auto",padding:"1.5rem 1.25rem 2rem",textAlign:"center"}}>
        <div style={{fontSize:80,margin:"1rem 0"}}>🥚</div>
        <div style={{fontSize:30,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,color:C.accent}}>A New Egg Awaits</div>
        <div style={{fontSize:18,marginTop:"1rem",lineHeight:1.9,background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1.1rem",textAlign:"left"}}>Your goal: <strong>{goal}</strong><br/><br/>Carry this into your next week and raise a new Haechi from scratch.<br/><br/>Every record is the start of something new.</div>
        <button onClick={()=>{sScr("map");sTab("map");}} style={{width:"100%",maxWidth:320,marginTop:20,background:`linear-gradient(135deg,${C.red},${C.accent})`,color:"#fff",border:"none",borderRadius:10,padding:16,fontSize:20,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700}}>Back to Map</button>
      </div>
    </>}

    {scr==="recap"&&<><Hdr onBack={()=>{sScr("map");sTab("map");}} backLabel="‹ Map" title="Travel Diary" subtitle={`${stamps}/${DAYS} stamps · ${prof?.name}`}/><Nav current="recap"/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:"2rem"}}>
        <div style={{display:"flex",gap:6,padding:".75rem .875rem"}}>
          {[{icon:"🍽️",label:"Most Eaten",val:stats.tc?stats.tc[0]:"—",badge:stats.tc?`×${stats.tc[1]}`:"",col:C.accent},{icon:"💭",label:"Emotion",val:stats.te?stats.te[0]:"—",badge:"",col:C.teal},{icon:"⚡",label:"Physical",val:stats.tp?stats.tp[0]:"—",badge:"",col:C.goldD},{icon:"🏅",label:"Stamps",val:`${stamps}/${DAYS}`,badge:stamps===DAYS?"FULL!":"",col:C.red}].map(({icon,label,val,badge,col})=>(
            <div key={label} style={{background:C.paper,border:`1.5px solid ${C.bdrL}`,borderRadius:12,padding:"10px 6px",textAlign:"center",flex:1,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:col,borderRadius:"12px 12px 0 0"}}/>
              <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
              <div style={{fontSize:11,fontWeight:900,color:col,lineHeight:1.3,wordBreak:"break-word"}}>{val}</div>
              {badge&&<div style={{fontSize:9,color:"#fff",fontWeight:800,marginTop:3,background:col,borderRadius:6,padding:"1px 5px",display:"inline-block"}}>{badge}</div>}
              <div style={{fontSize:9,color:C.inkLL,marginTop:4,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{margin:"0 .75rem .5rem",border:`2px solid ${C.bdr}`,borderRadius:14,overflow:"hidden",background:C.paper}}>
          <div style={{background:C.bgA,padding:".9rem 1rem",fontSize:19,fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",display:"flex",justifyContent:"space-between"}}><span>This Week</span><span>{stamps}/{DAYS} stamps</span></div>
          {Array.from({length:DAYS},(_,i)=>(<div key={i} style={{padding:".9rem 1rem",borderTop:`1.5px solid ${C.bdrL}`,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flexShrink:0,width:48,height:48}}><Stamp day={data[i]} idx={i} sz={48}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,color:C.teal,marginBottom:7,fontWeight:700}}>Day {i+1} · {dLabel(i,startDate)} ({dWeekday(i,startDate)}){i===DAYS-1?" · Last Day":""}</div>
              {MS.map(s=>{const m=data[i][s.key];return(<div key={s.key} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}><span style={{fontSize:17,flexShrink:0}}>{s.emoji}</span>{mLog(m)?<div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>{m.foodName&&<span style={{fontSize:14,padding:"4px 10px",borderRadius:10,fontWeight:700,background:C.accentL,color:C.accent}}>🍽️ {m.foodName.length>15?m.foodName.slice(0,15)+"…":m.foodName}</span>}{m.category&&<span style={{fontSize:14,padding:"4px 10px",borderRadius:10,fontWeight:700,background:C.tealL,color:C.teal}}>{m.category}</span>}{m.physical&&<span style={{fontSize:14,padding:"4px 10px",borderRadius:10,fontWeight:700,background:C.redL,color:C.red}}>{m.physical}</span>}{m.emotional&&<span style={{fontSize:14,padding:"4px 10px",borderRadius:10,fontWeight:700,background:C.goldL,color:C.goldD}}>{m.emotional}</span>}{m.location&&<span style={{fontSize:14,padding:"4px 10px",borderRadius:10,fontWeight:700,background:C.bgA,color:C.inkL}}>📍{m.location}</span>}{m.photo&&<img src={m.photo} style={{width:38,height:38,borderRadius:6,objectFit:"cover",flexShrink:0}} alt=""/>}</div>:<span style={{color:C.inkLL,fontStyle:"italic",fontSize:16}}>—</span>}</div>);})}
            </div>
          </div>))}
        </div>
      </div>
    </>}

    {scr==="group"&&<><Hdr onBack={()=>{sScr("map");sTab("map");}} backLabel="‹ Map" title="Group Journey" subtitle="Everyone's progress"/><Nav current="group"/>
      <div style={{flex:1,overflowY:"auto",padding:"1rem .75rem 2rem"}}>
        <div style={{textAlign:"right",marginBottom:".5rem"}}><button onClick={()=>loadGroupData()} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:8,padding:"4px 12px",fontSize:12,fontWeight:700,color:C.inkL,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif"}}>↻ Refresh</button></div>
        {leaderboard.filter(r=>r.days>=DAYS).length>0&&<div style={{background:`linear-gradient(135deg,${C.goldL},#FFF8E8)`,border:`2px solid ${C.gold}`,borderRadius:14,padding:".85rem 1rem",marginBottom:"1rem",textAlign:"center"}}><span style={{fontSize:22}}>🏅</span><span style={{fontSize:17,fontWeight:900,color:C.goldD,fontFamily:"'Playfair Display',Georgia,serif",marginLeft:8}}>{leaderboard.filter(r=>r.days>=DAYS).length} Haechi born so far!</span></div>}
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:12}}>🏅 Journey Leaderboard</div>
          {leaderboard.length===0?<div style={{textAlign:"center",padding:"1rem",color:C.inkLL,fontStyle:"italic"}}>No data yet</div>:leaderboard.map((row,i)=>{const medals=["🥇","🥈","🥉"];const isMe=row.nickname===prof?.name;const pct=Math.round(row.days/DAYS*100);return(<div key={row.nickname} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<leaderboard.length-1?`1px solid ${C.bdrL}`:"none",background:isMe?"rgba(168,79,51,.06)":"none",borderRadius:isMe?8:"none",padding:isMe?"6px 8px":"6px 0"}}><span style={{flexShrink:0,fontSize:i<3?16:13,fontWeight:700,color:C.inkLL,width:22,textAlign:"center"}}>{i<3?medals[i]:`${i+1}`}</span><span style={{flex:1,fontSize:13,fontWeight:isMe?900:700,color:isMe?C.red:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.nickname}{isMe?" (me)":""}</span><div style={{width:60,height:6,background:C.bgA,borderRadius:3,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",width:`${pct}%`,background:row.days>=DAYS?C.gold:C.red,borderRadius:3}}/></div><span style={{flexShrink:0,fontSize:12,fontWeight:800,color:row.days>=DAYS?C.goldD:C.inkL,marginLeft:4,minWidth:28,textAlign:"right"}}>{row.days}/{DAYS}</span></div>);})}
        </div>
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1rem",textAlign:"center",marginBottom:"1rem"}}>
          <div style={{fontSize:17,color:C.inkL}}><span style={{fontWeight:900,color:C.teal,fontSize:24}}>{groupData.uniqueTodayUsers}</span> of <span style={{fontWeight:700}}>{groupData.totalUsers||"—"}</span> logged today</div>
          <div style={{fontSize:13,color:C.inkLL,fontStyle:"italic",marginTop:4}}>Total participants: {groupData.totalUsers||"—"}</div>
        </div>
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:14,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:10}}>🌏 What Everyone's Eating</div>
          {feed.length===0?<div style={{textAlign:"center",padding:"1rem",color:C.inkLL,fontStyle:"italic"}}>No activity yet</div>:feed.map((row,i)=>{const catEmoji={"Restaurant":"🍽️","Convenience & Street food":"🥡","Cafe":"☕"}[row.category]||"🍴";const isMe=row.nickname===prof?.name;return(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:i<feed.length-1?`1px solid ${C.bdrL}`:"none"}}><div style={{width:32,height:32,borderRadius:"50%",background:isMe?C.redL:C.bgA,border:`1.5px solid ${isMe?C.red:C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{catEmoji}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:isMe?C.red:C.ink}}>{row.nickname}{isMe?" (me)":""} <span style={{fontWeight:500,color:C.inkLL}}>· Day {row.day}</span></div>{row.foodName&&<div style={{fontSize:12,color:C.inkL,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.foodName}</div>}</div><div style={{fontSize:10,color:C.inkLL,flexShrink:0,marginTop:2}}>{row.timeAgo}</div></div>);})}</div>
        <div style={{background:C.paper,border:`2px solid ${C.bdr}`,borderRadius:14,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:C.accent,marginBottom:10}}>🍽️ Most Visited Restaurants</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>{["Somerset","Botanik"].map(area=>{const medals=["🥇","🥈","🥉"];const areaStats=(restStats[area]||[]).slice(0,3);return(<div key={area}><div style={{fontSize:12,fontWeight:800,color:C.inkL,letterSpacing:".1em",textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${C.bdrL}`}}>{area==="Somerset"?"🐮":"🐨"} {area}</div>{areaStats.length===0?<div style={{color:C.inkLL,fontStyle:"italic",fontSize:12,padding:"4px 0"}}>No visits yet</div>:areaStats.map(([name,count],i)=>{const r=(RESTAURANT_LINKS[area]||[]).find(x=>x.name===name);return(<div key={name} style={{display:"flex",alignItems:"center",padding:"5px 0",borderBottom:i<areaStats.length-1?`1px solid ${C.bdrL}`:"none"}}><span style={{flexShrink:0,fontSize:14,marginRight:6}}>{medals[i]}</span><span style={{flex:1,fontSize:13,fontWeight:700,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r?.emoji||"🍴"} {name}</span><span style={{flexShrink:0,fontSize:12,fontWeight:900,color:C.teal,marginLeft:8,background:C.tealL,borderRadius:6,padding:"1px 7px"}}>{count}명</span></div>);})}</div>);})}</div>
        </div>
      </div>
    </>}

    {scr==="admin"&&<><Hdr onBack={()=>{sScr("map");sTab("map");}} backLabel="‹ Map" title="Admin" subtitle="Preview & controls"/><Nav current="admin"/>
      <div style={{flex:1,overflowY:"auto",padding:"1rem .75rem 2rem"}}>
        <div style={{background:C.goldL,border:`1.5px solid ${C.bdr}`,borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontWeight:700,color:C.goldD,marginBottom:10,fontFamily:"'Playfair Display',Georgia,serif"}}>Haechi Preview</div>
          <select onChange={e=>swAdm(parseInt(e.target.value))} value={admH} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.bdr}`,fontSize:14,background:C.paper,fontWeight:700,color:C.ink,marginBottom:14}}>{HAECHI.map(h=>(<option key={h.id} value={h.id}>{h.id}. {h.name} — {h.sub}</option>))}</select>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <HaechiBadge haechi={haechi} sz={140}/>
            <div style={{fontSize:19,fontWeight:900,color:C.accent,fontFamily:"'Playfair Display',Georgia,serif"}}>{haechi.name}</div>
            <div style={{fontSize:14,color:C.inkL,fontStyle:"italic",textAlign:"center",lineHeight:1.6}}>{haechi.desc}</div>
          </div>
          <button onClick={()=>{sScr("hatch");sTab("hatch");}} style={{width:"100%",marginTop:14,background:C.teal,color:"#fff",border:"none",borderRadius:8,padding:"10px",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif"}}>View Full Hatch Screen →</button>
        </div>
        <div style={{background:C.paper,border:`1.5px solid ${C.bdrL}`,borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontWeight:700,color:C.accent,marginBottom:12,fontFamily:"'Playfair Display',Georgia,serif"}}>Growth Stages</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[{label:"Stage 1",name:"Egg",bg:C.bgA,border:C.bdr,node:<EggSVG pct={0.4} sz={72}/>,desc:"Log meals\nto crack open"},{label:"Stage 2",name:"Chick",bg:C.goldL,border:C.gold,node:<ChickSVG sz={72}/>,desc:"5+ days\nlogged"},{label:"Stage 3",name:"Haechi",bg:C.redL,border:C.red,node:<HaechiBadge haechi={haechi} sz={72}/>,desc:"All 7 days\non 7 dates"}].map(({label,name,bg,border,node,desc})=>(
              <div key={name} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:10,padding:".6rem .4rem",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{fontSize:9,letterSpacing:".12em",textTransform:"uppercase",color:C.inkLL,fontWeight:800}}>{label}</div>
                {node}
                <div style={{fontSize:12,fontWeight:800,color:C.accent,fontFamily:"'Playfair Display',Georgia,serif"}}>{name}</div>
                <div style={{fontSize:9.5,color:C.inkL,textAlign:"center",lineHeight:1.5,whiteSpace:"pre-line"}}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:11,color:C.inkLL,textAlign:"center",fontStyle:"italic"}}>Passport unlocks when all 7 days are logged on different calendar dates</div>
        </div>
        <div style={{background:C.paper,border:`2px solid ${C.bdrL}`,borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontSize:17,fontWeight:700,color:C.accent,marginBottom:10,fontFamily:"'Playfair Display',Georgia,serif"}}>Group Data</div>
          {[["Total Users",groupData.totalUsers],["Today Logged",groupData.uniqueTodayUsers],["Good Days",groupData.goodDays],["Today %",`${groupData.todayPct}%`]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700,padding:"8px 0",borderBottom:`1px solid ${C.bdrL}`}}><span style={{color:C.inkL}}>{k}</span><span style={{color:C.accent}}>{v}</span></div>))}
        </div>
        <button onClick={()=>{sAdm(false);logout();}} style={{width:"100%",background:C.redL,color:C.red,border:`1.5px solid ${C.red}`,borderRadius:10,padding:12,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif"}}>Exit Admin Mode</button>
      </div>
    </>}

    {pv&&<div onClick={()=>sPv(null)} style={{position:"fixed",inset:0,background:"rgba(44,24,16,.92)",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem",cursor:"pointer"}}><img src={pv.photo} alt="" style={{maxWidth:"100%",maxHeight:"75vh",borderRadius:14}}/><div style={{fontWeight:700,fontSize:17,marginTop:"1rem",textAlign:"center",color:"#fff"}}>{pv.foodName&&<div style={{fontSize:18,marginBottom:4}}>{pv.foodName}</div>}Day {pv.day+1} · {pv.slot.label}{pv.loc?` · ${pv.loc}`:""}</div><div style={{color:"rgba(255,255,255,.6)",fontSize:15,marginTop:".5rem"}}>Tap to close</div></div>}
  </div>);
}