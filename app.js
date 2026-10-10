'use strict';

const TZ='Australia/Sydney', KEY='workoutTracker.v1', BAK='workoutTracker.v1.bak', SCAN_KEY='workoutTracker.scans.v1';
function readScanVault(){try{const r=JSON.parse(localStorage.getItem(SCAN_KEY)||'null');return Array.isArray(r)?r.filter(x=>x&&x.id):[];}catch(e){return [];}}
function writeScanVault(list){try{localStorage.setItem(SCAN_KEY,JSON.stringify(list||[]));}catch(e){}}
function mergeScanLists(primary,backup){const byId={};(backup||[]).forEach(s=>{if(s&&s.id)byId[s.id]=s;});(primary||[]).forEach(s=>{if(s&&s.id)byId[s.id]=Object.assign({},byId[s.id]||{},s);});return Object.keys(byId).map(k=>byId[k]);}
function ex(name,sets,reps,o){o=o||{};return {name,sets,reps,press:!!o.press,main:!!o.main,cardio:!!o.cardio,abs:!!o.abs};}
const ABS_UPPER=[ex('Dead bug',2,'8 each side',{abs:1}),ex('Cable crunch',2,'12',{abs:1}),ex('Side plank (knees)',2,'20-30s each side',{abs:1})];
const ABS_LOWER=[ex('Pallof press',2,'10 each side',{abs:1}),ex('Cable crunch',2,'12',{abs:1}),ex('Reverse crunch',2,'10',{abs:1})];
const ABS_SUNDAY=[ex('Dead bug',2,'8 each side',{abs:1}),ex('Side plank (knees)',2,'20s each side',{abs:1})];
const DEFAULT_PLAN=[
 {id:'upperA',name:'Upper A',exercises:[ex('Chest-supported row',4,'8-10'),ex('Lat pulldown (neutral grip)',4,'8-10'),ex('Neutral-grip DB press (low incline)',3,'10-12',{press:1}),ex('Cable chest fly',3,'12-15',{press:1}),ex('Face pull',3,'15'),ex('Cable lateral raise',3,'15',{press:1}),ex('Hammer curl',3,'12'),ex('Band external rotation',2,'15'),ex('DB shrug',3,'10-12'),...ABS_UPPER]},
 {id:'lowerA',name:'Lower A',exercises:[ex('Hack squat',4,'6-8',{main:1}),ex('Romanian deadlift',3,'8'),ex('Leg press',3,'10-12'),ex('Lying leg curl',3,'12'),ex('Standing calf raise',4,'12-15'),...ABS_LOWER]},
 {id:'upperB',name:'Upper B',exercises:[ex('Pull-ups / assisted',4,'AMRAP'),ex('Seated cable row',3,'12'),ex('Machine chest press',3,'12',{press:1}),ex('Pec deck',2,'12-15',{press:1}),ex('DB lateral raise',3,'15',{press:1}),ex('Rear delt fly',3,'15'),ex('Cable curl',3,'12'),ex('Rope pushdown',2,'15',{press:1}),ex('Chest-supported shrug',3,'10-12'),...ABS_UPPER]},
 {id:'lowerB',name:'Lower B',exercises:[ex('Trap bar deadlift',3,'5-6',{main:1}),ex('Bulgarian split squat',3,'10 each'),ex('Hip thrust',3,'10-12'),ex('Leg extension',3,'15'),ex('Seated calf raise',3,'15'),...ABS_LOWER]},
 {id:'sunday',name:'Sunday Pull & Conditioning',exercises:[ex('Single-arm DB row',3,'10'),ex('Straight-arm pulldown',3,'12'),ex('Face pull',3,'15'),ex('Hammer curl',3,'12'),ex('Intervals',1,'20 min',{cardio:1}),...ABS_SUNDAY]}
];
const ABS_BY_PLAN={upperA:ABS_UPPER,upperB:ABS_UPPER,lowerA:ABS_LOWER,lowerB:ABS_LOWER,sunday:ABS_SUNDAY};
const ABS_NOTE='Abs finisher · ~5–8 min · stop if lower-back pain increases; skip heavy loaded spinal flexion on flare days (use dead bug / bird dog / side plank instead of crunches).';
// Accessories flip each 4-week block. Mains (hack squat, RDL, leg press, trap bar, rows, pulldowns, pull-ups, presses) stay.
const ACCESSORY_B={
 'Face pull':ex('Rear delt fly',3,'15'),
 'Rear delt fly':ex('Face pull',3,'15'),
 'Cable lateral raise':ex('Machine lateral raise',3,'15',{press:1}),
 'Machine lateral raise':ex('Cable lateral raise',3,'15',{press:1}),
 'Hammer curl':ex('Cable curl',3,'12'),
 'Cable curl':ex('Hammer curl',3,'12'),
 'Lying leg curl':ex('Leg extension',3,'15'),
 'Leg extension':ex('Lying leg curl',3,'12'),
 'Standing calf raise':ex('Seated calf raise',4,'12-15'),
 'Seated calf raise':ex('Standing calf raise',4,'12-15'),
 'Cable crunch':ex('Hanging knee raise',2,'12',{abs:1}),
 'Hanging knee raise':ex('Cable crunch',2,'12',{abs:1}),
 'Cable chest fly':ex('Pec deck',3,'12-15',{press:1}),
 'Pec deck':ex('Cable chest fly',2,'12-15',{press:1}),
 'DB shrug':ex('Cable shrug',3,'10-12'),
 'Chest-supported shrug':ex('DB shrug',3,'10-12')
};

function mi(name,dose,sec,cue){return {name,dose,sec,cue};}
const DEFAULT_ROUTINES=[
 {id:'posture',name:'Posture & mobility',hint:'Daily · ~10 min',items:[
  mi('Chin tucks','2×10',60,'Glide head straight back (make a double chin), hold 2s; eyes level, no nodding.'),
  mi('Wall angels','2×10 · pain-free range',60,'Head, upper back & arms on wall; slide up only as far as pain-free — never force overhead.'),
  mi('Band pull-aparts','2×15',60,'Light band, straight arms at chest height; squeeze shoulder blades back & down, no shrug.'),
  mi('Doorway pec stretch','2×30s',30,'Forearms on frame, elbows BELOW shoulder height; step through gently — stretch, never pain.'),
  mi('Thoracic extension on foam roller','1 min',60,'Roller across upper back, hands support head; extend over it, shift a few cm, keep ribs down.'),
  mi('Open books','2×8 each side',60,'Side-lying, knees bent 90°; rotate top arm open, eyes follow hand; go slow, pain-free range.'),
  mi('Cat-cow','10 reps',45,'On all fours; round spine up, then gently arch — move segment by segment with your breath.'),
  mi('90/90 hip flow','1 min',60,'Sit with both knees bent 90°; rotate knees side to side, chest tall, use hands for support.'),
  mi('Kneeling hip flexor stretch','2×30s each side',30,'Half-kneel, tuck pelvis & squeeze glute, shift forward slightly; feel front of hip, not low back.'),
  mi("Child's pose",'45s',45,'Knees wide, hips to heels, arms by your sides if shoulder complains; breathe into lower back.')]},
 {id:'back',name:'Lower back care',hint:'~5 min · before lower days & on rest days',items:[
  mi('Dead bug','2×8 each side',60,'Low back gently pressed to floor, brace; slowly extend opposite arm & leg, exhale.'),
  mi('Bird dog','2×8 each side',60,'All fours, brace; reach opposite arm & leg long, hips stay level, hold 2s.'),
  mi('Glute bridge','2×12',45,'Feet flat, drive through heels, squeeze glutes at top; ribs down, don\'t arch the low back.'),
  mi('McGill curl-up','3×10s holds',10,'One knee bent, hands under low back; lift head & shoulders slightly as one unit, hold 10s.'),
  mi('Side plank (knees)','2×20s each side',20,'Forearm & knees, elbow under shoulder, hips forward in a line. Skip that side if shoulder hurts.')]},
 {id:'wuUpper',name:'Warm-up: Upper',hint:'~4 min before Upper A/B & Sunday',items:[
  mi('Arm circles','2×10 each way',40,'Small circles, then a bit bigger. Shoulder stays relaxed. Pain-free only.'),
  mi('Scap push-ups (light)','2×10',45,'Hands on wall or bench, arms straight; let chest sink between shoulder blades, then push apart. Pain-free only.'),
  mi('Prone Y-raise (no weight)','2×8',45,'Face down, thumbs up, lift arms into a Y. Squeeze the lower traps, no shrug.')]},
 {id:'wuLower',name:'Warm-up: Lower',hint:'~4 min before Lower A/B',items:[
  mi('Leg swings','10 each way',40,'Hold a rack. Swing one leg forward and back, then across the body. Stay in control.'),
  mi('Ankle rocks','2×10 each',30,'Foot close to a wall, heel stays down, knee tracks over the toes.'),
  mi('Bodyweight squats','2×10',45,'Controlled tempo, pain-free depth, knees track over toes, brace your core.')]}];
const MOB_LIB=[
 mi('Arm circles','2×10 each way',40,'Small circles, then a bit bigger. Shoulder stays relaxed. Pain-free only.'),
 mi('Prone Y-raise (no weight)','2×8',45,'Face down, thumbs up, lift arms into a Y. Squeeze the lower traps, no shrug.'),
 mi('Leg swings','10 each way',40,'Hold a rack. Swing one leg forward and back, then across the body. Stay in control.'),
 mi('Ankle rocks','2×10 each',30,'Foot close to a wall, heel stays down, knee tracks over the toes.'),
 mi('Band dislocates (light)','2×10',40,'Very light band, wide grip. Pass overhead only as far as the shoulder allows. Stop before pain.'),
 mi('Bodyweight good morning','2×8',40,'Hands on head, soft knees, hinge the hips back, back stays long. Small range.'),
 mi('World\'s greatest stretch','4 each side',45,'Lunge, same-side hand inside the foot, then rotate the chest open. Move slowly.'),
 mi('Dead hang','20–30s',30,'Hang from a bar, shoulders away from the ears. Skip if the shoulder complains.'),
 mi('Glute march','2×8 each',40,'Bridge up, then lift one foot a few centimetres. Hips stay level.')
];
const MOB_SWAP={
 posture:['Chin tucks','Wall angels','Band pull-aparts','Doorway pec stretch','Thoracic extension on foam roller','Open books','Cat-cow','90/90 hip flow','Kneeling hip flexor stretch',"Child's pose",'Arm circles','Prone Y-raise (no weight)','Band dislocates (light)','Scap push-ups (light)'],
 back:['Dead bug','Bird dog','Glute bridge','McGill curl-up','Side plank (knees)','Cat-cow',"Child's pose",'Glute march','Bodyweight good morning','Ankle rocks'],
 wuUpper:['Arm circles','Scap push-ups (light)','Prone Y-raise (no weight)','Band dislocates (light)','Wall angels','Chin tucks','Doorway pec stretch','Dead hang'],
 wuLower:['Leg swings','Ankle rocks','Bodyweight squats','World\'s greatest stretch','90/90 hip flow','Bodyweight good morning','Glute march','Cat-cow']
};
function mobTemplate(name){const k=nameKey(name);for(const r of DEFAULT_ROUTINES){const it=r.items.find(i=>nameKey(i.name)===k);if(it)return it;}return MOB_LIB.find(i=>nameKey(i.name)===k)||null;}
function openMobSwap(rid,x){const r=routineById(rid),it=r&&r.items[x];if(!it){toast('Exercise missing');return;}
 const used=todayNames();
 const alts=(MOB_SWAP[r.id]||[]).filter(n=>nameKey(n)!==nameKey(it.name)&&!used.has(nameKey(n)));
 if(!alts.length){toast('No unused swap left for today');return;}
 modal(`<h2 style="margin-top:0">Change exercise</h2>
  <p class="muted" style="margin-top:0">Swap <b>${esc(it.name)}</b> in ${esc(r.name)}. Already in today’s workout or mobility is hidden. The timer and cue update with the new move.</p>
  ${alts.map(n=>`<button class="btn sessbtn" data-a="mobSwapPick" data-r="${esc(r.id)}" data-x="${x}" data-n="${esc(n)}"><span>${esc(n)}</span><small>swap ›</small></button>`).join('')}
  <button class="btn wide" data-a="closeModal">Cancel</button>`);}
function applyMobSwap(rid,x,name){const r=routineById(rid),it=r&&r.items[x];if(!it||!name)return;const old=it.name,tpl=mobTemplate(name);
 it.name=name;if(tpl){it.dose=tpl.dose;it.sec=tpl.sec;it.cue=tpl.cue;}
 const e=mobEntry(rid,todayKey(),false);if(e){const i=e.d.indexOf(old);if(i>=0)e.d[i]=name;}
 save();closeModal();render();toast('Swapped · '+name);}
const ROTATION=['upperA','lowerA','upperB','lowerB'];
const SCHEDULE={Mon:'upperA',Tue:null,Wed:'lowerA',Thu:'upperB',Fri:null,Sat:'lowerB',Sun:'sunday'};
const CARDIO_TYPES=['Treadmill walk — flat','Treadmill walk — incline','Treadmill run — flat','Treadmill run — incline','StairMaster','Bike'];

// Same-muscle swaps when a machine is taken. Sets/reps stay; only the move changes.
const SWAP_GROUPS=[
 {id:'back',label:'Back',names:['Chest-supported row','Lat pulldown (neutral grip)','Pull-ups / assisted','Seated cable row','Single-arm DB row','Straight-arm pulldown','Machine row','Chest-supported DB row','Wide-grip lat pulldown','Helms row','Inverted row','Dumbbell pullover']},
 {id:'chest',label:'Chest / press',names:['Neutral-grip DB press (low incline)','Machine chest press','Incline DB press','Flat DB press','Smith machine press','Cable chest fly','Pec deck','Push-up']},
 {id:'shoulders',label:'Shoulders',names:['Face pull','Rear delt fly','Cable lateral raise','Machine lateral raise','DB lateral raise','Reverse pec deck','Band pull-aparts','Prone Y-raise (no weight)']},
 {id:'traps',label:'Traps',names:['DB shrug','Cable shrug','Chest-supported shrug','Farmer carry']},
 {id:'arms',label:'Arms',names:['Hammer curl','Cable curl','Rope pushdown','DB curl','Incline DB curl','EZ-bar curl','Overhead cable extension','Bayesian curl']},
 {id:'quads',label:'Quads',names:['Hack squat','Leg press','Bulgarian split squat','Leg extension','Goblet squat','Smith squat','Walking lunge','Step-up','Belt squat']},
 {id:'posterior',label:'Hamstrings / glutes',names:['Romanian deadlift','Trap bar deadlift','Hip thrust','Lying leg curl','Seated leg curl','Single-leg RDL','Good morning','Back extension','Cable pull-through','Swiss ball leg curl']},
 {id:'calves',label:'Calves',names:['Standing calf raise','Seated calf raise','Leg press calf raise','Single-leg calf raise']},
 {id:'abs',label:'Core',names:['Dead bug','Cable crunch','Side plank (knees)','Bird dog','McGill curl-up','Hanging knee raise','Pallof press','Reverse crunch','Plank','Ab wheel']},
 {id:'cardio',label:'Cardio',names:['Intervals'].concat(CARDIO_TYPES)}
];
const EXTRA_TPL=[
 ex('Machine lateral raise',3,'15',{press:1}),
 ex('Goblet squat',4,'8-10',{main:1}),
 ex('Seated leg curl',3,'12'),
 ex('Rear delt fly',3,'15'),
 ex('Incline DB press',3,'10-12',{press:1}),
 ex('Flat DB press',3,'10-12',{press:1}),
 ex('Smith machine press',3,'10-12',{press:1}),
 ex('DB lateral raise',3,'15',{press:1}),
 ex('Smith squat',4,'6-8',{main:1}),
 ex('Walking lunge',3,'10 each'),
 ex('Step-up',3,'10 each'),
 ex('Good morning',3,'8'),
 ex('Single-leg RDL',3,'8 each'),
 ex('Belt squat',4,'8-10',{main:1}),
 ex('Treadmill walk — flat',1,'20 min',{cardio:1}),
 ex('Treadmill walk — incline',1,'20 min',{cardio:1}),
 ex('Treadmill run — flat',1,'20 min',{cardio:1}),
 ex('Treadmill run — incline',1,'20 min',{cardio:1}),
 ex('StairMaster',1,'20 min',{cardio:1}),
 ex('Bike',1,'20 min',{cardio:1})
];
const DAY_GROUPS={upperA:['back','chest','shoulders','traps','arms','abs'],upperB:['back','chest','shoulders','traps','arms','abs'],lowerA:['quads','posterior','calves','abs'],lowerB:['quads','posterior','calves','abs'],sunday:['back','shoulders','traps','arms','cardio','abs']};
function groupsForPlan(planId){const ids=DAY_GROUPS[planId]||SWAP_GROUPS.map(g=>g.id);return ids.map(id=>SWAP_GROUPS.find(g=>g.id===id)).filter(Boolean);}
function catalogNames(){const set=new Set();SWAP_GROUPS.forEach(g=>g.names.forEach(n=>set.add(n)));allExerciseNames().forEach(n=>set.add(n));return [...set].sort((a,b)=>a.localeCompare(b));}
const nameKey=n=>String(n||'').trim().toLowerCase();
function namesMatch(a,b){const x=nameKey(a),y=nameKey(b);if(!x||!y)return false;if(x===y)return true;
 const norm=s=>s.replace(/\([^)]*\)/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const nx=norm(x),ny=norm(y);if(nx&&nx===ny)return true;
 const words=s=>s.split(' ').filter(w=>w.length>2);const wa=words(nx),wb=words(ny);if(wa.length<2||wb.length<2)return false;
 const [sh,lg]=wa.length<=wb.length?[wa,new Set(wb)]:[wb,new Set(wa)];return sh.every(w=>lg.has(w));}
function todayNames(){const set=new Set();const add=n=>{const k=nameKey(n);if(k)set.add(k);};
 const day=SCHEDULE[wday(Date.now())],p=day&&planById(day);
 if(p)applyBlockLetter(p.exercises,blockInfo().letter).forEach(e=>add(e.name));
 if(S.active)S.active.exercises.forEach(e=>add(e.name));
 const ids=['posture'];
 if(day==='lowerA'||day==='lowerB'||!day)ids.push('back','wuLower');else ids.push('wuUpper');
 ids.forEach(id=>{const r=routineById(id);if(r)r.items.forEach(i=>add(i.name));});
 return set;}
function swapGroupFor(name){const k=String(name||'').trim().toLowerCase();return SWAP_GROUPS.find(g=>g.names.some(n=>n.toLowerCase()===k))||null;}
function swapAlternatives(name){const g=swapGroupFor(name);if(!g)return [];const k=String(name).trim().toLowerCase();return g.names.filter(n=>n.toLowerCase()!==k);}
function templateFor(name){const hit=findTemplate(name);if(hit)return hit;const n=String(name||'').trim().toLowerCase();
 for(const p of DEFAULT_PLAN)for(const e of p.exercises)if(e.name.toLowerCase()===n)return e;
 for(const e of EXTRA_TPL)if(e.name.toLowerCase()===n)return e;return null;}
function openSwap(mode,i,x){
 const name=mode==='session'?(S.active&&S.active.exercises[i]&&S.active.exercises[i].name):(S.plan[i]&&S.plan[i].exercises[x]&&S.plan[i].exercises[x].name);
 if(!name){toast('Exercise missing');return;}
 const g=swapGroupFor(name),used=todayNames();
 const alts=swapAlternatives(name).filter(n=>!used.has(nameKey(n)));
 if(!alts.length){toast(g?'Every other '+g.label+' move is already in today':'No same-muscle swap saved for this move');return;}
 modal(`<h2 style="margin-top:0">Change exercise</h2>
  <p class="muted" style="margin-top:0">Gym doesn’t have <b>${esc(name)}</b>? Pick another <b>${esc(g.label)}</b> move. Moves already in today’s session, warm-up or mobility are hidden. Sets and reps stay.</p>
  ${alts.map(n=>`<button class="btn sessbtn" data-a="swapPick" data-mode="${mode}" data-i="${i}" data-x="${x==null?'':x}" data-n="${esc(n)}"><span>${esc(n)}</span><small>swap ›</small></button>`).join('')}
  <button class="btn wide" data-a="closeModal">Cancel</button>`);
}

const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function defaults(){return {version:1,plan:clone(DEFAULT_PLAN),sessions:[],cardio:[],body:[],active:null,routines:clone(DEFAULT_ROUTINES),mobLog:{},backPain:{},scans:[],cues:{},block:{start:null,letter:'A',number:1},meals:null,settings:{rest:90,restMain:120,lastExport:null}};}
function normalize(d){const s=Object.assign(defaults(),d||{});s.settings=Object.assign(defaults().settings,s.settings||{});
 ['sessions','cardio','body'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]}); if(!Array.isArray(s.plan)||!s.plan.length)s.plan=clone(DEFAULT_PLAN);else if(mergeAbsIntoPlan(s.plan))s._absMerged=1; if(!Array.isArray(s.routines)||!s.routines.length)s.routines=clone(DEFAULT_ROUTINES);else{const have=new Set(s.routines.map(r=>r.id));DEFAULT_ROUTINES.forEach(d=>{if(!have.has(d.id))s.routines.push(clone(d));});}
 if(!Array.isArray(s.scans))s.scans=[];
 const vault=readScanVault();
 if(vault.length){const merged=mergeScanLists(s.scans,vault);if(merged.length!==s.scans.length)s._deduped=1;s.scans=merged;}
 if(!s.settings.seededEvolt&&!s.scans.length){
  s.scans.push({id:'evolt-2026-10-02',date:'2026-10-02',t:Date.parse('2026-10-02T07:43:00+10:00'),notes:'Evolt 360 · 2 Oct 2026 · 07:43',weight:99.2,smm:48.4,bfp:12.8,bfm:12.7,lbm:86.5,vfl:7,bmr:2238,tee:3446,tbw:62.3,protein:18.4,minerals:5.8,bioAge:33,seg:{ra:{lean:5.11,fat:0.47},la:{lean:5.34,fat:0.4},tr:{lean:37.31,fat:8.33},rl:{lean:12.43,fat:1.78},ll:{lean:12.13,fat:1.71}}});
  if(!s.body.some(b=>b.date==='2026-10-02'))s.body.push({date:'2026-10-02',kg:99.2});
  s.settings.seededEvolt=1;s._deduped=1;
 }
 if(!s.settings.dedupedMob){const fix={
  wuUpper:{'Band external rotation':mi('Arm circles','2×10 each way',40,'Small circles, then a bit bigger. Shoulder stays relaxed. Pain-free only.'),'Band pull-aparts':mi('Prone Y-raise (no weight)','2×8',45,'Face down, thumbs up, lift arms into a Y. Squeeze the lower traps, no shrug.')},
  wuLower:{'Kneeling hip flexor stretch':mi('Leg swings','10 each way',40,'Hold a rack. Swing one leg forward and back, then across the body. Stay in control.'),'Glute bridge':mi('Ankle rocks','2×10 each',30,'Foot close to a wall, heel stays down, knee tracks over the toes.')}
 };(s.routines||[]).forEach(r=>{const map=fix[r.id];if(!map)return;(r.items||[]).forEach((it,i)=>{if(map[it.name])r.items[i]=clone(map[it.name]);});});s.settings.dedupedMob=1;s._deduped=1;}
 if(!s.settings.dedupedAbs){(s.plan||[]).forEach(p=>{if(p.id!=='lowerA'&&p.id!=='lowerB')return;const abs=(p.exercises||[]).filter(e=>e.abs).map(e=>e.name);
  if(abs.length===3&&['Bird dog','McGill curl-up','Side plank (knees)'].every(n=>abs.indexOf(n)>=0))p.exercises=p.exercises.filter(e=>!e.abs).concat(clone(ABS_LOWER));});s.settings.dedupedAbs=1;s._deduped=1;}
 if(!s.settings.addedChestFly){(s.plan||[]).forEach(p=>{if(!p||!Array.isArray(p.exercises))return;if(p.exercises.some(e=>/chest fly|pec deck/i.test(e.name||'')))return;
  const item=p.id==='upperA'?ex('Cable chest fly',3,'12-15',{press:1}):p.id==='upperB'?ex('Pec deck',2,'12-15',{press:1}):null;if(!item)return;
  const after=p.id==='upperA'?'Neutral-grip DB press (low incline)':'Machine chest press';
  let i=p.exercises.findIndex(e=>e.name===after);if(i<0){const a=p.exercises.findIndex(e=>e.abs);i=a>=0?a-1:-1;}
  p.exercises.splice(i>=0?i+1:p.exercises.length,0,item);});s.settings.addedChestFly=1;s._deduped=1;s._chestAdd=1;}
 if(!s.settings.droppedFrontDelt){(s.plan||[]).forEach(p=>{(p.exercises||[]).forEach(e=>{if(!e||!/landmine press|plate front raise|front raise/i.test(e.name||''))return;e.name='DB lateral raise';e.sets=3;e.reps='15';e.press=1;e.main=false;e.cardio=false;});});s.settings.droppedFrontDelt=1;s._deduped=1;s._frontDelt=1;}
 if(!s.settings.addedTraps){(s.plan||[]).forEach(p=>{if(!p||!Array.isArray(p.exercises)||p.exercises.some(e=>/shrug|farmer carry/i.test(e.name||'')))return;
  const item=p.id==='upperA'?ex('DB shrug',3,'10-12'):p.id==='upperB'?ex('Chest-supported shrug',3,'10-12'):null;if(!item)return;
  const a=p.exercises.findIndex(e=>e.abs);p.exercises.splice(a>=0?a:p.exercises.length,0,item);});s.settings.addedTraps=1;s._deduped=1;s._trapsAdd=1;}
 repairPlan(s.plan);
 ['mobLog','backPain','cues'].forEach(k=>{if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={}});if(!s.block||typeof s.block!=='object')s.block={start:null,letter:'A',number:1};s.block.letter=(s.block.letter==='B'?'B':'A');s.block.number=Math.max(1,parseInt(s.block.number)||1);if(s.block.start&&!/^\d{4}-\d{2}-\d{2}$/.test(s.block.start))s.block.start=null;s.meals=s.meals&&typeof s.meals==='object'?s.meals:null;return s;}
function repairPlan(plan){(plan||[]).forEach(p=>{if(!p||!Array.isArray(p.exercises))return;
 p.exercises.forEach(e=>{if(!e||!/landmine press|plate front raise|front raise/i.test(e.name||''))return;e.name='DB lateral raise';e.sets=3;e.reps='15';e.press=1;e.main=false;e.cardio=false;});
 const chest=p.id==='upperA'?ex('Cable chest fly',3,'12-15',{press:1}):p.id==='upperB'?ex('Pec deck',2,'12-15',{press:1}):null;
 if(chest&&!p.exercises.some(e=>/chest fly|pec deck/i.test(e.name||''))){const after=p.id==='upperA'?'Neutral-grip DB press (low incline)':'Machine chest press';let i=p.exercises.findIndex(e=>e.name===after);if(i<0){const a=p.exercises.findIndex(e=>e.abs);i=a>=0?a-1:-1;}p.exercises.splice(i>=0?i+1:p.exercises.length,0,chest);}
 const shrug=p.id==='upperA'?ex('DB shrug',3,'10-12'):p.id==='upperB'?ex('Chest-supported shrug',3,'10-12'):null;
 if(shrug&&!p.exercises.some(e=>/shrug|farmer carry/i.test(e.name||''))){const a=p.exercises.findIndex(e=>e.abs);p.exercises.splice(a>=0?a:p.exercises.length,0,shrug);}
});}
function repairSession(s){if(!s||!Array.isArray(s.exercises))return;
 s.exercises.forEach((e,i)=>{if(e&&/landmine press|plate front raise|front raise/i.test(e.name||'')&&!((e.sets||[]).some(st=>st&&st.done)))s.exercises[i]=mkEx(ex('DB lateral raise',3,'15',{press:1}));});
 const id=s.planId;if(id!=='upperA'&&id!=='upperB')return;
 if(!s.exercises.some(e=>/chest fly|pec deck/i.test(e.name||''))){const e=mkEx(ex(id==='upperA'?'Cable chest fly':'Pec deck',id==='upperA'?3:2,'12-15',{press:1}));const after=id==='upperA'?'Neutral-grip DB press (low incline)':'Machine chest press';let i=s.exercises.findIndex(x=>x.name===after);if(i<0)i=s.exercises.findIndex(x=>/press/i.test(x.name||'')&&!x.abs);s.exercises.splice(i>=0?i+1:s.exercises.length,0,e);}
 if(!s.exercises.some(e=>/shrug|farmer carry/i.test(e.name||''))){const e=mkEx(ex(id==='upperA'?'DB shrug':'Chest-supported shrug',3,'10-12'));const a=s.exercises.findIndex(x=>x.abs);s.exercises.splice(a>=0?a:s.exercises.length,0,e);}
}
function dataScore(x){if(!x||typeof x!=='object')return 0;const sess=Array.isArray(x.sessions)?x.sessions.length:0;let meals=0;if(x.meals&&x.meals.log&&typeof x.meals.log==='object')Object.keys(x.meals.log).forEach(k=>{meals+=(x.meals.log[k]||[]).length;});const body=Array.isArray(x.body)?x.body.length:0;return sess*10+meals+body;}
function mealDayCount(){if(!S.meals||!S.meals.log||typeof S.meals.log!=='object')return 0;return Object.keys(S.meals.log).filter(k=>Array.isArray(S.meals.log[k])&&S.meals.log[k].length).length;}
function readStore(k){try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch(e){return null;}}
let loadBroken=false;
function load(){const cur=readStore(KEY),bak=readStore(BAK);let pick=cur;
 if(bak&&dataScore(bak)>dataScore(cur))pick=bak;
 if(!pick){try{if(localStorage.getItem(KEY))loadBroken=true;}catch(e){loadBroken=true;}return defaults();}
 try{return normalize(pick);}catch(e){console.error(e);loadBroken=true;return Object.assign(defaults(),pick);}}
let S=load();
if(S._chestAdd&&S.active&&Array.isArray(S.active.exercises)&&!S.active.exercises.some(e=>/chest fly|pec deck/i.test(e.name||''))&&(S.active.planId==='upperA'||S.active.planId==='upperB')){
 const id=S.active.planId,letter=S.active.blockLetter==='B'?'B':'A';
 const name=id==='upperA'?(letter==='B'?'Pec deck':'Cable chest fly'):(letter==='B'?'Cable chest fly':'Pec deck');
 const e=mkEx(ex(name,id==='upperA'?3:2,'12-15',{press:1}));
 const after=id==='upperA'?'Neutral-grip DB press (low incline)':'Machine chest press';
 let i=S.active.exercises.findIndex(x=>x.name===after);if(i<0)i=S.active.exercises.findIndex(x=>/press/i.test(x.name||'')&&!x.abs);
 S.active.exercises.splice(i>=0?i+1:S.active.exercises.length,0,e);
}
if(S._frontDelt&&S.active&&Array.isArray(S.active.exercises)){
 S.active.exercises.forEach((e,i)=>{if(!e||!/landmine press|plate front raise|front raise/i.test(e.name||''))return;if((e.sets||[]).some(st=>st&&st.done))return;S.active.exercises[i]=mkEx(ex('DB lateral raise',3,'15',{press:1}));});
}
if(S._trapsAdd&&S.active&&Array.isArray(S.active.exercises)&&(S.active.planId==='upperA'||S.active.planId==='upperB')&&!S.active.exercises.some(e=>/shrug|farmer carry/i.test(e.name||''))){
 const id=S.active.planId,letter=S.active.blockLetter==='B'?'B':'A';
 const name=id==='upperA'?(letter==='B'?'Cable shrug':'DB shrug'):(letter==='B'?'DB shrug':'Chest-supported shrug');
 const e=mkEx(ex(name,3,'10-12')),a=S.active.exercises.findIndex(x=>x.abs);
 S.active.exercises.splice(a>=0?a:S.active.exercises.length,0,e);
}
delete S._chestAdd;delete S._frontDelt;delete S._trapsAdd;
if(S.active)repairSession(S.active);
let bakTimer=null,_bdb=null;
if(S._absMerged||S._deduped){delete S._absMerged;delete S._deduped;if(!loadBroken)save();}
function save(){if(loadBroken){toast('Saved workouts couldn’t be read, so nothing was overwritten');return;}
 try{const prevRaw=localStorage.getItem(KEY);const prev=readStore(KEY);const next=JSON.stringify(S);
  if(prev&&dataScore(prev)>dataScore(S))localStorage.setItem(BAK,prevRaw);
  else if(dataScore(S)>0)localStorage.setItem(BAK,next);
  localStorage.setItem(KEY,next);writeScanVault(S.scans);
  if(dataScore(S)>0){clearTimeout(bakTimer);bakTimer=setTimeout(()=>{try{backupNow('auto');}catch(e){}},800);}
 }catch(e){toast('⚠ Could not save: '+e.message)}}
function backupDb(){return _bdb||(_bdb=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open('workoutTrackerBackups',1);
 r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('snaps'))d.createObjectStore('snaps',{keyPath:'id'});};
 r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));}
function snapReq(mode,fn){return backupDb().then(d=>new Promise((res,rej)=>{const t=d.transaction('snaps',mode);let out;const q=fn(t.objectStore('snaps'));if(q)q.onsuccess=()=>{out=q.result;};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);}));}
function backupNow(reason){if(typeof todayKey!=='function'||dataScore(S)<=0)return;const payload=clone(S);const at=Date.now();
 const rec={id:'latest',at,day:todayKey(),reason:reason||'auto',score:dataScore(payload),data:payload};
 snapReq('readwrite',s=>s.put(rec)).catch(()=>{});
 if(reason==='workout'||reason==='morning'){snapReq('readwrite',s=>s.put(Object.assign({},rec,{id:reason+'-'+rec.day+'-'+at}))).then(()=>pruneSnaps()).catch(()=>{});}}
function pruneSnaps(){return snapReq('readonly',s=>s.getAll()).then(all=>{const w=(all||[]).filter(x=>x&&String(x.id).indexOf('workout-')===0).sort((a,b)=>b.at-a.at);
 const m=(all||[]).filter(x=>x&&String(x.id).indexOf('morning-')===0).sort((a,b)=>b.at-a.at);
 const drop=w.slice(30).concat(m.slice(14));if(!drop.length)return;return snapReq('readwrite',s=>{drop.forEach(x=>s.delete(x.id));});}).catch(()=>{});}
function downloadBackup(){try{const blob=new Blob([JSON.stringify(S)],{type:'application/json'});const a=document.createElement('a');
 const hm=new Date().toLocaleTimeString('en-AU',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).replace(':','');
 a.href=URL.createObjectURL(blob);a.download='workout-backup-'+todayKey()+'-'+hm+'.json';document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2500);}catch(e){toast('Backup file failed');}}
function restoreFromBackup(){return snapReq('readonly',s=>s.getAll()).then(all=>{let best=null;(all||[]).forEach(s=>{if(s&&s.data&&(!best||dataScore(s.data)>dataScore(best.data)))best=s;});
 if(!best||dataScore(best.data)<=dataScore(S))return false;S=normalize(best.data);loadBroken=false;save();
 toast('Restored phone backup · '+S.sessions.length+' workouts',6000);return true;}).catch(()=>false);}
function morningCheck(){restoreFromBackup().then(()=>{const today=todayKey();if(S.settings.lastMorningCheck===today)return;
 S.settings.lastMorningCheck=today;save();
 if(dataScore(S)>0){backupNow('morning');toast('Morning check: '+S.sessions.length+' workouts · '+mealDayCount()+' meal days still saved',5500);}
 else toast('Morning check: nothing is saved in this app. Import a workout-backup file from Downloads if you have one.',7000);
}).catch(()=>{});}
if(!loadBroken)writeScanVault(S.scans);

// ---- dates (Australia/Sydney) ----
const fmtKey=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
const dKey=t=>fmtKey.format(new Date(t));
const todayKey=()=>dKey(Date.now());
const keyAdd=(k,n)=>new Date(Date.parse(k+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const keyT=k=>Date.parse(k+'T00:00:00Z');
const wday=t=>new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short'}).format(new Date(t));
const fmtDate=t=>new Date(t).toLocaleDateString('en-AU',{timeZone:TZ,weekday:'short',day:'numeric',month:'short',year:'numeric'});
const fmtShort=t=>new Date(t).toLocaleDateString('en-AU',{timeZone:TZ,day:'numeric',month:'short'});
const fmtTime=t=>new Date(t).toLocaleTimeString('en-AU',{timeZone:TZ,hour:'numeric',minute:'2-digit'});
const fmtKeyDate=k=>new Date(keyT(k)).toLocaleDateString('en-AU',{timeZone:'UTC',weekday:'short',day:'numeric',month:'short',year:'numeric'});
const fmtKeyShort=k=>new Date(keyT(k)).toLocaleDateString('en-AU',{timeZone:'UTC',day:'numeric',month:'short'});

// ---- helpers ----
const planById=id=>S.plan.find(p=>p.id===id);
function ensureBlock(){if(!S.block)S.block={start:null,letter:'A',number:1};if(!S.block.start){S.block.start=todayKey();S.block.letter=S.block.letter==='B'?'B':'A';S.block.number=Math.max(1,parseInt(S.block.number)||1);save();}}
function blockWeekNum(start,onKey){const days=Math.floor((keyT(onKey||todayKey())-keyT(start))/864e5);return Math.floor(Math.max(0,days)/7)+1;}
function advanceBlock(fromAuto){ensureBlock();S.block.letter=S.block.letter==='A'?'B':'A';S.block.number=(parseInt(S.block.number)||1)+1;S.block.start=todayKey();save();toast((fromAuto?'New block started · ':'')+'Block '+S.block.number+S.block.letter+' · Week 1 of 4');}
function blockInfo(){ensureBlock();let week=blockWeekNum(S.block.start),auto=false;
 while(week>4){S.block.letter=S.block.letter==='A'?'B':'A';S.block.number=(parseInt(S.block.number)||1)+1;S.block.start=keyAdd(S.block.start,28);week=blockWeekNum(S.block.start);auto=true;}
 if(auto)save();
 const end=keyAdd(S.block.start,27),nextLetter=S.block.letter==='A'?'B':'A';
 return {letter:S.block.letter,number:S.block.number,week,deload:week===4,start:S.block.start,end,nextStart:keyAdd(S.block.start,28),nextLetter,label:'Block '+S.block.number+S.block.letter+' · Week '+week+' of 4'};}
function applyBlockLetter(exercises,letter){if(letter!=='B')return clone(exercises);
 return exercises.map(e=>{const sw=ACCESSORY_B[e.name];if(!sw)return clone(e);const out=clone(sw);out.abs=!!(sw.abs||e.abs);out.press=!!(sw.press||e.press);out.main=!!e.main;out.cardio=!!e.cardio;return out;});}
function deloadSets(n){n=Math.max(1,parseInt(n)||1);return Math.max(1,Math.round(n*2/3));}
function mergeAbsIntoPlan(plan){let changed=false;plan.forEach(p=>{const block=ABS_BY_PLAN[p.id];if(!block||!Array.isArray(p.exercises))return;
  if(p.exercises.some(e=>e.abs))return;
  if(p.id==='lowerA')p.exercises=p.exercises.filter(e=>e.name!=='Dead bug');
  if(p.id==='lowerB')p.exercises=p.exercises.filter(e=>e.name!=='Hanging knee raise');
  p.exercises=p.exercises.concat(clone(block));changed=true;
 });return changed;}

function topReps(r){const m=String(r||'').match(/(\d+)\s*(?:-\s*(\d+))?/);if(!m||/amrap|min/i.test(r))return 0;return +(m[2]||m[1]);}
const doneSets=e=>(e.sets||[]).filter(s=>s.done);
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null};
function sortedSessions(){return S.sessions.slice().sort((a,b)=>b.start-a.start);}
function setKg(st){if(!st)return null;const raw=st.w!=null&&String(st.w).trim()!==''?st.w:(st.kg!=null&&String(st.kg).trim()!==''?st.kg:st.weight);if(raw==null||String(raw).trim()==='')return null;return num(raw);}
function loggedSets(e){const sets=Array.isArray(e&&e.sets)?e.sets:[];const done=sets.filter(s=>s&&s.done&&setKg(s)!=null);return done.length?done:sets.filter(s=>s&&setKg(s)!=null);}
function performed(x){if(!x)return false;if(x.cardio)return !!num(x.minutes);if(loggedSets(x).length||doneSets(x).length)return true;return Array.isArray(x.sets)&&x.sets.some(st=>st&&String(st.r||'').trim()!=='');}
function lastFor(name,excludeId){const n=nameKey(name);if(!n)return null;
 for(const s of sortedSessions()){if(!s||s.id===excludeId||!Array.isArray(s.exercises))continue;
  const e=s.exercises.find(x=>x&&namesMatch(x.name,n)&&performed(x));
  if(e)return Object.assign({date:s.start},e);}
 return null;}
function hitTop(last){const top=topReps(last.target&&last.target.reps);if(!top)return false;const d=doneSets(last);
 return d.length>0&&d.length>=((last.target&&last.target.sets)||d.length)&&d.every(s=>(num(s.r)||0)>=top);}
function bottomReps(r){const m=String(r||'').match(/(\d+)/);if(!m||/amrap|min/i.test(r))return 0;return +m[1];}
function loadStep(w,main){if(main||w>=40)return 2.5;if(w>=12)return 2;return 1;}
function roundLoad(w,step){return Math.round(Math.round(w/step)*step*100)/100;}
function nextLoad(e,bi){if(!e||e.cardio)return null;const last=lastFor(e.name,S.active&&S.active.id);
 if(!last)return null;const sets=doneSets(last).length?doneSets(last):loggedSets(last);const ws=sets.map(setKg).filter(n=>n>0);if(!ws.length)return null;
 const w=Math.max.apply(null,ws),step=loadStep(w,e.main),pain=e.press&&last.pain!=null&&last.pain>3;
 if(bi.deload){const kg=Math.max(step,roundLoad(w*0.9,step));return {kg,note:'Deload week · '+kg+' kg (about 90% of '+w+' kg)'};}
 if(bi.week<=1)return {kg:w,note:'Week 1 · '+w+' kg, same as last time. The load steps up from week 2 if every set hits the top reps.'};
 if(pain)return {kg:w,note:'Stay at '+w+' kg — pain was '+last.pain+'/10 last time'};
 if(hitTop(last)){const kg=roundLoad(w+step,step);return {kg,note:'Week '+bi.week+' · '+kg+' kg (+'+step+' from '+w+' kg). You hit the top of the rep range.'};}
 const bot=bottomReps(last.target&&last.target.reps),missed=bot&&sets.some(s=>(num(s.r)||0)<bot);
 if(missed){const kg=Math.max(step,roundLoad(w-step,step));return {kg,note:'Week '+bi.week+' · '+kg+' kg (−'+step+'). Last time missed the bottom of the rep range.'};}
 return {kg:w,note:'Week '+bi.week+' · stay at '+w+' kg until every set hits the top reps.'};}
function stampLoad(e,bi){if(!e||e.cardio||!Array.isArray(e.sets))return false;if(!bi)bi=blockInfo();
 const o=nextLoad(e,bi),last=lastFor(e.name,S.active&&S.active.id),prev=last?loggedSets(last):[];
 if(!o&&!prev.length)return false;const same=!o||/same as last|stay at|Week 1/i.test(o.note||'');let changed=false;
 e.sets.forEach((st,j)=>{if(!st||st.done||st.touched)return;const p=prev[j]||prev[prev.length-1]||{};
  if(String(st.w||'').trim()===''){let kg=null;if(o&&!same)kg=o.kg;else{kg=setKg(p);if(kg==null&&o)kg=o.kg;}
   if(kg!=null){st.w=String(kg);changed=true;}}
  if(String(st.r||'').trim()===''&&p&&p.r!=null&&String(p.r).trim()!==''){st.r=String(p.r);changed=true;}});
 if(o)e.ol=o.note;return changed;}
function suggested(){const last=sortedSessions().find(s=>ROTATION.includes(s.planId));
 const id=last?ROTATION[(ROTATION.indexOf(last.planId)+1)%ROTATION.length]:ROTATION[0];return planById(id)?id:(S.plan[0]&&S.plan[0].id);}
function allExerciseNames(){const set=new Set();S.plan.forEach(p=>p.exercises.forEach(e=>set.add(e.name)));S.sessions.forEach(s=>s.exercises.forEach(e=>set.add(e.name)));return [...set].sort();}
function toast(msg,ms){const d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),ms||2200);}
function modal(html){closeModal();const bg=document.createElement('div');bg.className='modalbg';bg.id='modal';bg.innerHTML='<div class="modal">'+html+'</div>';
 bg.addEventListener('click',e=>{if(e.target===bg)closeModal()});document.body.appendChild(bg);const f=bg.querySelector('input,textarea');if(f&&!f.dataset.nofocus)setTimeout(()=>f.focus(),50);}
function closeModal(){if(typeof stopBarcode==='function')stopBarcode();const m=document.getElementById('modal');if(m)m.remove();}

// ---- chart ----
function chart(pts,opt){opt=opt||{};pts=pts.filter(p=>p.y!=null&&isFinite(p.y)).sort((a,b)=>a.t-b.t);
 if(!pts.length)return '<div class="muted">No data yet.</div>';
 const W=340,H=180,pl=40,pr=12,pt=14,pb=26,line=(opt.line||[]).filter(p=>p.y!=null);
 const ys=pts.map(p=>p.y).concat(line.map(p=>p.y));let x0=pts[0].t,x1=pts[pts.length-1].t;if(x0===x1){x0-=864e5*3;x1+=864e5*3}
 let y0=Math.min(...ys),y1=Math.max(...ys);if(y1-y0<2){y0-=1;y1+=1}const py=(y1-y0)*.12;y0-=py;y1+=py;
 const X=t=>pl+(t-x0)/(x1-x0)*(W-pl-pr),Y=v=>pt+(1-(v-y0)/(y1-y0))*(H-pt-pb);
 let g='';for(let i=0;i<=3;i++){const v=y0+(y1-y0)*i/3,y=Y(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="#2e3340" stroke-width="1"/><text x="${pl-6}" y="${y+4}" fill="#8b93a7" font-size="11" text-anchor="end">${+v.toFixed(1)}</text>`;}
 const poly=a=>a.map(p=>X(p.t).toFixed(1)+','+Y(p.y).toFixed(1)).join(' ');
 let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}`;
 if(line.length>1)s+=`<polyline fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="5 4" points="${poly(line)}"/>`;
 if(pts.length>1)s+=`<polyline fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linejoin="round" points="${poly(pts)}"/>`;
 pts.forEach(p=>s+=`<circle cx="${X(p.t)}" cy="${Y(p.y)}" r="${pts.length>40?2:3.5}" fill="#4ade80"/>`);
 const fl=t=>new Date(t).toLocaleDateString('en-AU',{timeZone:opt.utc?'UTC':TZ,day:'numeric',month:'short'});
 s+=`<text x="${pl}" y="${H-7}" fill="#8b93a7" font-size="11">${fl(pts[0].t)}</text>`;
 if(pts.length>1)s+=`<text x="${W-pr}" y="${H-7}" fill="#8b93a7" font-size="11" text-anchor="end">${fl(pts[pts.length-1].t)}</text>`;
 return s+'</svg>'+(opt.legend?`<div class="muted" style="margin-top:4px">${opt.legend}</div>`:'');}

// ---- router ----
let view='home',viewArg=null,progEx=null;
function go(v,arg){view=v;viewArg=arg;render();window.scrollTo(0,0);}
function render(){const V={home:vHome,session:vSession,history:vHistory,detail:vDetail,body:vBody,settings:vSettings,mobility:vMobility,photos:vPhotos,meals:vMeals}[view]||vHome;
 document.getElementById('app').innerHTML=V();renderNav();
 const sug=document.getElementById('sugBox');if(sug)sug.addEventListener('toggle',()=>{sugOpen=sug.open;});
 const yf=document.getElementById('yfBox');if(yf)yf.addEventListener('toggle',()=>{yfOpen=yf.open;});if(view==='photos')hydrateFull();if(view==='session'&&S.active){ensureClock();tickClocks();}else stopClock();}
function renderNav(){const tabs=[['train','🏋️','Train'],['mobility','🧘','Mobility'],['photos','📸','Photos'],['body','⚖️','Body'],['meals','🍽️','Meals'],['history','📈','History']];
 const cur={home:'train',session:'train',settings:'train',detail:'history'}[view]||view;
 document.getElementById('nav').innerHTML=tabs.map(([v,i,l])=>`<button data-a="nav" data-v="${v}" class="${cur===v?'on':''} ${v==='train'&&S.active&&view!=='session'?'live':''}"><span>${i}</span>${v==='train'&&S.active?'● Train':l}</button>`).join('');}

// ---- HOME ----
function vHome(){const sug=suggested(),sp=planById(sug),wd=wday(Date.now()),todays=SCHEDULE[wd];
 const bi=blockInfo();
 let h=`<div class="hrow"><h1>Workout</h1><button class="btn sm" data-a="nav" data-v="settings" aria-label="Settings">⚙️ Settings</button></div><div class="muted">${fmtDate(Date.now())} · Pressing: stop if pain over 3/10 · 6p · rest beeps, then the next set starts itself</div>
 <div class="muted">Stored in this app icon: ${S.sessions.length} workout${S.sessions.length===1?'':'s'} · ${mealDayCount()} meal day${mealDayCount()===1?'':'s'}.${S.settings.lastBackupAt?' Last workout backup '+fmtDate(S.settings.lastBackupAt)+'.':''} A backup file is saved when you finish a workout.</div>
 ${S.sessions.length||mealDayCount()?'':`<div class="hint warn">This copy of the app has no saved workouts or meals. Open the same home-screen icon you used before. A browser tab or a second shortcut does not share that data. Settings → Import if you downloaded a backup.</div>`}
 <div class="blockbanner ${bi.deload?'deload':''}"><div class="hrow"><b>${esc(bi.label)}${bi.deload?' · DELOAD':''}</b><span class="muted">Accessories ${bi.letter}</span></div>
 <div class="muted" style="margin-top:4px">${bi.deload?'Fewer sets (~⅔) · use ~90% of usual weights · recover hard.':'Main lifts stay; accessories rotate each new block.'} · ${fmtKeyShort(bi.start)}–${fmtKeyShort(bi.end)}</div>
 <div class="muted" style="margin-top:4px">Next: Block ${bi.number+1}${bi.nextLetter} from ${fmtKeyShort(bi.nextStart)} · this block: ${bi.letter==='A'?'face pull, cable lateral, DB shrug, hammer curl, standing calf':'rear delt, machine lateral, cable shrug, cable curl, seated calf'}</div>
 ${bi.week>=4?`<div class="row"><button class="btn sm primary" data-a="blockNext">Start next block now</button></div>`:''}</div>`;
 const pr=routineProg('posture',todayKey()),st=streak('posture');
 h+=`<button class="btn sessbtn" data-a="mobGo" data-r="${suggestedRoutine()}"><span>🧘 ${esc(routineById(suggestedRoutine())?routineById(suggestedRoutine()).name:'Mobility')}<br><small>Suggested today · posture ${pr.n}/${pr.of} · 🔥 ${st}-day streak</small></span><small>›</small></button>`;
 if(S.active)h+=`<div class="card" style="border-color:var(--wa)"><h3>Session in progress: ${esc(S.active.name)}</h3><div class="muted">Started ${fmtTime(S.active.start)}</div><button class="btn primary wide" data-a="nav" data-v="session">Resume session</button></div>`;
 if(sp){const prev=applyBlockLetter(sp.exercises,bi.letter);h+=`<div class="card hero"><div class="muted">Suggested next${bi.deload?' · deload volume':''}</div><h1 style="margin:2px 0 8px">${esc(sp.name)}</h1>
  <div class="muted">${prev.map(e=>esc(e.name)).join(' · ')}</div>
  <button class="btn primary wide" data-a="start" data-id="${sug}">▶ Start ${esc(sp.name)}</button></div>`;}
 h+=`<div class="card"><h3>This week</h3><div class="week">${Object.keys(SCHEDULE).map(d=>{const p=planById(SCHEDULE[d]);
   const lab=SCHEDULE[d]==='sunday'?'Pull*':(p?p.name.replace(/Upper /,'Up ').replace(/Lower /,'Lo '):'Rest');
   return `<div class="day ${d===wd?'today':''} ${p?'':'rest'}"><b>${d}</b>${esc(lab)}</div>`}).join('')}</div>
  <div class="muted" style="margin-top:6px">Mon Upper A · Wed Lower A · Thu Upper B · Sat Lower B · Sun optional pull &amp; conditioning${todays&&planById(todays)?` — <b style="color:var(--ac)">today: ${esc(planById(todays).name)}</b>`:''}</div></div>`;
 h+=`<h2>Start a session</h2>`+S.plan.map(p=>`<button class="btn sessbtn" data-a="start" data-id="${p.id}"><span>${esc(p.name)}</span><small>${p.exercises.length} exercises ›</small></button>`).join('')+
  `<button class="btn sessbtn" data-a="start" data-id="custom"><span>Custom</span><small>build as you go ›</small></button>`;
 h+=`<h2>Log cardio</h2><div class="card"><label class="lbl">Type</label><select id="cType">${CARDIO_TYPES.map((t,i)=>`<option value="${esc(t)}" ${i===0?'selected':''}>${esc(t)}</option>`).join('')}</select>
  <div class="grid2"><div><label class="lbl">Minutes</label><input id="cMin" inputmode="numeric" type="number" min="1" placeholder="30"></div>
  <div><label class="lbl">Calories burned</label><input id="cKcal" inputmode="numeric" type="number" min="0" step="1" placeholder="machine est."></div></div>
  <label class="lbl">Date</label><input id="cDate" type="date" value="${todayKey()}">
  <button class="btn primary wide" data-a="logCardio">+ Save cardio</button></div>`;
 return h;}

// ---- SESSION ----
function vSession(){const s=S.active;if(!s){view='home';return vHome();}
 if(Array.isArray(s.exercises)){const bi=blockInfo();let dirty=false;s.exercises.forEach(e=>{if(stampLoad(e,bi))dirty=true;});if(dirty)save();}
 const nDone=s.exercises.reduce((a,e)=>a+(e.cardio?(e.done?1:0):doneSets(e).length),0);
 const wu=/^lower/i.test(s.planId)?'wuLower':'wuUpper',wp=routineProg(wu,todayKey());
 const sessSec=Math.floor((Date.now()-s.start)/1000);
 let h=`<div class="hrow"><h1>${esc(s.name)}</h1><button class="btn sm" data-a="home">‹ Home</button></div>
 <div class="sessclock"><span class="muted">Session</span><b id="sessElapsed">${fmtMMSS(sessSec)}</b></div>
 <div class="muted">${fmtDate(s.start)} · started ${fmtTime(s.start)} · ${nDone} sets done${s.blockLetter?` · Block ${s.blockLetter} W${s.blockWeek||''}`:''} · 6p</div>
 ${s.deload?`<div class="hint warn">Deload week — fewer sets programmed · keep weights ~90% of usual · stop short of failure</div>`:''}
 ${routineById(wu)?`<button class="btn sessbtn ${wp.complete?'':'hero'}" data-a="mobGo" data-r="${wu}" type="button"><span>🔥 ${esc(wu==='wuLower'?'Do Lower warm-up (Mobility)':'Do Upper warm-up (Mobility)')}<br><small>${wp.complete?'Warm-up done — open checklist ›':`Checklist &amp; timers · ${wp.n}/${wp.of} ›`}</small></span><small>›</small></button>`:''}`;
 if(!s.exercises.length)h+=`<div class="card muted">No exercises yet — add one below.</div>`;
 let absShown=false;
 s.exercises.forEach((e,i)=>{if(e.abs&&!absShown){absShown=true;h+=`<div class="abshead"><b>🧘 Abs</b><span class="muted">${ABS_NOTE}</span></div>`;}h+=exCard(e,i);});
 h+=`<div class="card addex" style="border-style:dashed;border-color:#2d6a45;background:linear-gradient(135deg,#12351f22,#1a1d24)">
 <button class="btn primary wide" data-a="addEx" style="margin:0;font-weight:800">+ Add exercise</button>
 <div class="muted" style="margin-top:8px;text-align:center;font-size:13px">Pick or type a name · sets &amp; reps optional · works with Start set → rest</div>
 </div>
 <label class="lbl">Session notes</label><textarea data-f="sNotes" rows="3" placeholder="How did it feel? Sleep, energy, shoulder/elbow…">${esc(s.notes)}</textarea>
 <div class="row" style="margin-top:14px"><button class="btn danger" data-a="discard">Discard</button><button class="btn primary grow" data-a="finish">✓ Finish &amp; save</button></div>`;
 return h;}
function sidePair(text){return /each side|\beach\b|per side|a side/i.test(String(text||''));}
function holdSecs(text){const m=String(text||'').match(/(\d+)\s*(?:-\s*\d+)?\s*s\b/i);return m?parseInt(m[1],10):0;}
function isBodyweight(e){if(!e||e.cardio)return false;const n=nameKey(e.name);if(/cable|pallof|weighted|dumbbell|\bdb\b|barbell/.test(n))return false;return /dead bug|side plank|reverse crunch|bird dog|mcgill|hanging knee|ab wheel|\bplank\b|push-up|pushup|glute bridge/.test(n);}
function exCard(e,i){const last=lastFor(e.name,S.active.id),bw=isBodyweight(e);let hints='';
 if(last){const lsShow=loggedSets(last);
  if(!e.cardio&&!bw&&!lsShow.length)hints+=`<div class="last">Last (${fmtShort(last.date)}): this exercise was saved, but no kilograms were stored, so they can’t be copied in.</div>`;
  else if(e.cardio||lsShow.length){const lt=last.cardio?`${last.minutes} min${last.kcal!=null&&last.kcal!==''?' · '+last.kcal+' kcal':''}`:(bw?lsShow.map(x=>`${x.r||'—'} reps`).join(', '):lsShow.map(x=>`${setKg(x)||0}kg×${x.r||0}`).join(', '));
  hints+=`<div class="last">Last (${fmtShort(last.date)}): ${esc(lt)}${last.press&&last.pain!=null?` · pain ${last.pain}/10`:''}${last.durationSec?` · work ${fmtMMSS(last.durationSec)}`:''}</div>`;
  if(e.press&&last.pain!=null&&last.pain>3)hints+=`<div class="hint warn">⚠ Pain was ${last.pain}/10 last time — keep weight same or lighter</div>`;
  else if(!e.cardio&&!bw&&hitTop(last))hints+=`<div class="hint up">⬆ Go up in weight — you hit the top of the rep range on all sets</div>`;}}
 else{const prior=sortedSessions().find(s=>s&&s.id!==S.active.id&&(s.planId===S.active.planId||nameKey(s.name)===nameKey(S.active.name))&&Array.isArray(s.exercises));
  if(!bw)hints+=prior?`<div class="last">No saved kg for this exercise. Last ${esc(prior.name)} on this phone was ${fmtShort(prior.start)}.</div>`:`<div class="last">No earlier ${esc(S.active.name)} is saved. A workout is kept only after Finish & save.</div>`;}
 if(e.ol)hints+=`<div class="hint up">${esc(e.ol)}</div>`;
 const tags=(e.main?'<span class="tag main">MAIN</span>':'')+(e.abs?'<span class="tag abs">ABS</span>':'')+(e.press?'<span class="tag">PRESS</span>':'')+(e.cardio?'<span class="tag cardio">CARDIO</span>':'');
 let h=`<div class="card ex" id="ex${i}"><h3><span><button class="linkbtn" data-a="demo" data-n="${esc(e.name)}">${esc(e.name)}</button>${tags}</span><span class="muted" style="white-space:nowrap">${e.target.sets}×${esc(e.target.reps)}</span></h3>${hints}`;
 if(e.cardio){h+=`<div class="set ${e.done?'done':''}" style="grid-template-columns:1fr 1fr 60px"><input inputmode="numeric" type="number" data-f="min" data-i="${i}" value="${esc(e.minutes)}" placeholder="${topReps(e.target.reps)||parseInt(e.target.reps)||20} min" aria-label="minutes"><input inputmode="numeric" type="number" data-f="ckcal" data-i="${i}" value="${esc(e.kcal==null?'':e.kcal)}" placeholder="kcal" aria-label="calories burned"><button class="tick" data-a="tickC" data-i="${i}">✓</button></div>`;}
 else{const ls=last?loggedSets(last):[];const g=bw?' style="grid-template-columns:30px 1fr 60px"':'';
  const hold=holdSecs(e.target.reps),paired=sidePair(e.target.reps)&&hold>0;
  h+=`<div class="sethdr"${g}><span>#</span>${bw?'':'<span>kg</span>'}<span>${hold?'time':'reps'}</span><span>done</span></div>`;
  e.sets.forEach((st,j)=>{const p=ls[j]||ls[ls.length-1]||{};const pr=p.r||topReps(e.target.reps)||'';
   h+=`<div class="set ${st.done?'done':''}"${g}><span class="sn">${j+1}</span>
   ${bw?'':`<input inputmode="decimal" data-f="w" data-i="${i}" data-j="${j}" value="${esc(st.w)}" placeholder="${esc(p.w||'kg')}" aria-label="weight kg">`}
   <input inputmode="numeric" data-f="r" data-i="${i}" data-j="${j}" value="${esc(st.r)}" placeholder="${esc(pr||(hold?'sec':'reps'))}" aria-label="${hold?'seconds':'reps'}">
   <button class="tick" data-a="tick" data-i="${i}" data-j="${j}" aria-label="set done">✓</button></div>`;});}
 if(e.press)h+=`<div class="pain"><span class="grow">Pain (0–10)</span><button class="btn sm" data-a="pain" data-i="${i}" data-d="-1">−</button><span class="v ${e.pain>3?'hi':''}">${e.pain==null?'–':e.pain}</span><button class="btn sm" data-a="pain" data-i="${i}" data-d="1">+</button></div>`;
 const rest=restSecFor(e);
 const nextJ=nextOpenSet(e);
 const allDone=!e.cardio&&e.sets.every(st=>st.done);
 const swOn=!!e._swOn;
 const sideing=tMode==='side'&&tExIdx===i&&!!tInt;
 const going=tMode==='go'&&tExIdx===i&&!!tInt;
 const resting=tInt&&tExIdx===i&&!tAwaitStart&&!sideing&&!going;
 const ready=tAwaitStart&&tExIdx===i;
 let swCls=swOn?'running':ready?'ready':sideing?'running':going?'ready':resting?'resting':'';
 const hold=holdSecs(e.target&&e.target.reps),paired=sidePair(e.target&&e.target.reps)&&hold>0;
 let swMsg='';
 if(e.cardio)swMsg='';
 else if(sideing)swMsg=tHoldN<tHoldOf?`Side ${tHoldN} of ${tHoldOf} · ${tHoldSec}s, then the other side`:`Side ${tHoldN} of ${tHoldOf} · ${tHoldSec}s`;
 else if(going)swMsg='Get ready — this set starts by itself';
 else if(swOn)swMsg=`Set ${(nextJ>=0?nextJ:e.sets.length-1)+1} · working — tick ✓ when done`;
 else if(ready)swMsg='Rest done — start next set';
 else if(resting)swMsg='Resting. A low beep, then this set starts itself in 5 seconds. Press Next to skip the rest.';
 else if(allDone)swMsg='All sets done';
 else if(paired&&nextJ===0)swMsg=`Start set once. It runs ${hold}s each side, then rests and starts the next set.`;
 else if(nextJ===0)swMsg='Tap Start set once. After that, the next set starts itself.';
 else swMsg=`Ready for set ${nextJ+1}`;
 if(!e.cardio){
  h+=`<div class="sw ${swCls}" id="swrow${i}"><span class="swlab">Work</span><span class="swtt" id="sw${i}">${fmtMMSS(swNow(e))}</span>`;
  if(!allDone&&!swOn&&!resting&&!going)h+=`<button class="btn sm primary" data-a="swStart" data-i="${i}">Start set</button>`;
  else if(swOn)h+=`<button class="btn sm" data-a="swPause" data-i="${i}">Pause</button>`;
  h+=`${swMsg?`<div class="swmsg">${swMsg}</div>`:''}</div>`;
 }
 h+=`<div class="tools">${e.cardio?'':`<button class="btn sm" data-a="addSet" data-i="${i}">+ Set</button><button class="btn sm" data-a="delSet" data-i="${i}">− Set</button><button class="btn sm" data-a="rest" data-s="${rest}" data-i="${i}">⏱ Rest ${rest}s</button>`}
  <button class="btn sm" data-a="exSwap" data-i="${i}">Change</button><button class="btn sm" data-a="exNote" data-i="${i}">📝${e.notes?' ✓':''}</button><button class="btn sm" data-a="exMove" data-i="${i}" aria-label="move up">↑</button><button class="btn sm danger" data-a="delEx" data-i="${i}">✕</button></div>`;
 if(e.notes||e._showNote)h+=`<textarea data-f="exNotes" data-i="${i}" rows="2" style="margin-top:8px" placeholder="Exercise notes (seat height, grip…)">${esc(e.notes)}</textarea>`;
 return h+'</div>';}
function mkEx(t){const e={name:t.name,press:!!t.press,main:!!t.main,cardio:!!t.cardio,abs:!!t.abs,target:{sets:Math.max(1,parseInt(t.sets)||1),reps:String(t.reps||'')},notes:'',pain:null,durationSec:0};
 if(e.cardio){e.minutes='';e.kcal=null;e.done=false;}else e.sets=Array.from({length:e.target.sets},()=>({w:'',r:'',done:false}));return e;}
function startSession(id){if(S.active){if(!confirm('Save the session in progress, then start a new one?'))return;flushSetInputs();const prev=S.active;prev.end=Date.now();prev.exercises.forEach(e=>{swFreeze(e);delete e._showNote;delete e._swOn;delete e._swT0;if(!e.durationSec)delete e.durationSec;});const worth=prev.exercises.some(e=>e&&(e.cardio?num(e.minutes):performed(e)));if(worth)S.sessions.push(prev);S.active=null;}
 const p=planById(id),bi=blockInfo();
 let raw=p?applyBlockLetter(p.exercises,bi.letter):[];
 if(bi.deload)raw=raw.map(e=>{e=clone(e);if(!e.cardio)e.sets=deloadSets(e.sets);return e;});
 S.active={id:uid(),planId:p?p.id:'custom',name:p?p.name:'Custom',start:Date.now(),notes:'',blockLetter:bi.letter,blockWeek:bi.week,deload:!!bi.deload,exercises:raw.map(mkEx)};
 S.active.exercises.forEach(e=>stampLoad(e,bi));
 save();go('session');wake(true);}
function exModal(target){
 const sess=target==='session';
 const planHint=sess&&S.active&&S.active.planId&&S.active.planId!=='custom'?planById(S.active.planId):(!sess?S.plan[+target]:null);
 const groups=groupsForPlan(planHint&&planHint.id);
 const used=new Set();
 if(sess&&S.active)S.active.exercises.forEach(e=>used.add(nameKey(e.name)));
 else if(planHint)(planHint.exercises||[]).forEach(e=>used.add(nameKey(e.name)));
 const opt=g=>g.names.filter(n=>!used.has(nameKey(n))).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 modal(`<h2 style="margin-top:0">+ Add exercise</h2>
 <p class="muted" style="margin:0 0 8px">Choose from today’s groups, or search if you want something else.</p>
 <label class="lbl">Group · ${esc(planHint?planHint.name:'this session')}</label>
 <select id="mGroup">${groups.map(g=>`<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('')}</select>
 <label class="lbl">Exercise</label>
 <select id="mPick">${opt(groups[0]||{names:[]})||'<option value="">Nothing left in this group</option>'}</select>
 <label class="lbl">Or search any exercise</label>
 <input id="mSearch" placeholder="Type to search, or a name that isn’t listed" autocomplete="off">
 <div id="mHits"></div>
 <div class="grid2"><div><label class="lbl">Sets <span class="muted">(optional)</span></label><input id="mSets" type="number" inputmode="numeric" min="1" placeholder="3" value=""></div>
 <div><label class="lbl">Reps / target <span class="muted">(optional)</span></label><input id="mReps" placeholder="8-12 or AMRAP" value=""></div></div>
 <label class="chk"><input type="checkbox" id="mPress"> Pressing exercise (track pain)</label>
 <label class="chk"><input type="checkbox" id="mMain"> Main lift (${S.settings.restMain}s rest)</label>
 <label class="chk"><input type="checkbox" id="mAbs"> Abs finisher</label>
 <label class="chk"><input type="checkbox" id="mCardio"> Cardio (log minutes)</label>
 ${sess&&planHint?`<label class="chk"><input type="checkbox" id="mToPlan"> Also keep in ${esc(planHint.name)} plan</label>`:''}
 <div class="row"><button class="btn grow" data-a="closeModal">Cancel</button><button class="btn primary grow" data-a="exModalOk" data-t="${target}">Add to session</button></div>`);
 const fill=name=>{const t=templateFor(name);if(!t)return;mSets.value=t.sets||'';mReps.value=t.reps||'';mPress.checked=!!t.press;mMain.checked=!!t.main;mAbs.checked=!!t.abs;mCardio.checked=!!t.cardio;};
 const grp=document.getElementById('mGroup'),pick=document.getElementById('mPick'),search=document.getElementById('mSearch'),hits=document.getElementById('mHits');
 const refill=()=>{const g=SWAP_GROUPS.find(x=>x.id===grp.value)||{names:[]};pick.innerHTML=opt(g)||'<option value="">Nothing left in this group</option>';if(pick.value)fill(pick.value);};
 grp.addEventListener('change',()=>{search.value='';hits.innerHTML='';refill();});
 pick.addEventListener('change',()=>{search.value='';hits.innerHTML='';if(pick.value)fill(pick.value);});
 if(pick.value)fill(pick.value);
 const all=catalogNames();
 search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();
  const list=!q?[]:all.filter(n=>n.toLowerCase().includes(q)).slice(0,8);
  hits.innerHTML=list.map(n=>`<button type="button" class="btn sessbtn" data-hit="${esc(n)}"><span>${esc(n)}</span><small>use ›</small></button>`).join('');
  hits.querySelectorAll('[data-hit]').forEach(b=>b.addEventListener('click',()=>{search.value=b.getAttribute('data-hit');hits.innerHTML='';fill(search.value);}));
 });
 if(!sess){const ok=document.querySelector('#modal [data-a=exModalOk]');if(ok)ok.textContent='Add to plan';}
}
function findTemplate(name){const n=name.trim().toLowerCase();for(const p of S.plan)for(const e of p.exercises)if(e.name.toLowerCase()===n)return e;return null;}
function insertSessionEx(ex){const a=S.active.exercises;let idx=a.length;
 if(!ex.abs){const absAt=a.findIndex(e=>e.abs);if(absAt>=0)idx=absAt;}
 a.splice(idx,0,ex);if(tExIdx!=null&&tExIdx>=idx)tExIdx++;return idx;}
function insertPlanEx(p,tpl){const pe={name:tpl.name,sets:Math.max(1,parseInt(tpl.sets)||3),reps:String(tpl.reps||''),press:!!tpl.press,main:!!tpl.main,abs:!!tpl.abs,cardio:!!tpl.cardio};
 let idx=p.exercises.length;if(!pe.abs){const absAt=p.exercises.findIndex(e=>e.abs);if(absAt>=0)idx=absAt;}
 p.exercises.splice(idx,0,pe);return idx;}

// ---- rest timer (guided set → rest → next set) ----
let tEnd=0,tInt=null,tExIdx=null,tAwaitStart=false,tMode='rest',tHoldSec=0,tHoldN=0,tHoldOf=0,audio=null,wakeLock=null;
function beep(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();[0,.25,.5].forEach(d=>{const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=880;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.3,audio.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d+.2);o.start(audio.currentTime+d);o.stop(audio.currentTime+d+.2);});}catch(e){}}
function beepRest(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();[[0,196,.2],[.24,146,.32]].forEach(([d,f,len])=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.55,audio.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d+len);o.start(audio.currentTime+d);o.stop(audio.currentTime+d+len+.02);});}catch(e){}}
function toneStart(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();[[0,523,.16],[.2,784,.2],[.42,1046,.36]].forEach(([d,f,len])=>{const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.55,audio.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d+len);o.start(audio.currentTime+d);o.stop(audio.currentTime+d+len+.02);});}catch(e){}}
function restSecFor(e){return e&&e.main?S.settings.restMain:S.settings.rest;}
function nextOpenSet(e){if(!e||!e.sets)return -1;return e.sets.findIndex(st=>!st.done);}
function setTimerActs(mode){const acts=document.getElementById('tActs');if(!acts)return;
 if(mode==='go'){acts.innerHTML=`<button class="btn sm" data-a="tStop">Cancel</button>`;return;}
 if(mode==='done'){
  if(tExIdx!=null)acts.innerHTML=`<button class="btn sm primary" data-a="tStartSet">Start set</button><button class="btn sm" data-a="tStop">Dismiss</button>`;
  else acts.innerHTML=`<button class="btn sm" data-a="tStop">Dismiss</button>`;}
 else if(mode==='hold'){acts.innerHTML=`<button class="btn sm" data-a="tAdj" data-d="-15">−15</button><button class="btn sm" data-a="tAdj" data-d="15">+15</button><button class="btn sm" data-a="tStop">Skip</button>`;}
 else{acts.innerHTML=`<button class="btn sm" data-a="tAdj" data-d="-15">−15</button><button class="btn sm" data-a="tAdj" data-d="15">+15</button><button class="btn sm" data-a="tReady">Next</button>`;}}
function nextWorkIndex(from){const a=S.active&&S.active.exercises;if(!a)return -1;for(let k=from+1;k<a.length;k++){const e=a[k];if(e&&!e.cardio&&e.sets&&e.sets.some(st=>!st.done))return k;}return -1;}
function armNextSet(){if(tExIdx==null||!S.active||!S.active.exercises[tExIdx]){stopTimer();return;}
 beepRest();if(navigator.vibrate)navigator.vibrate([220,90,220]);
 tMode='go';tAwaitStart=false;tEnd=Date.now()+5000;
 const el=document.getElementById('timer'),lab=document.getElementById('tLab');
 el.classList.remove('hidden');el.classList.add('fin');if(lab)lab.textContent='Get ready';
 const tt=document.getElementById('tt');if(tt)tt.textContent='0:05';setTimerActs('go');
 if(!tInt)tInt=setInterval(tick,250);
 if(view==='session')render();}
function startTimer(sec,exIdx){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){}
 tMode='rest';tHoldN=0;tHoldOf=0;
 tExIdx=(exIdx==null||exIdx==='')?null:+exIdx;tAwaitStart=false;tEnd=Date.now()+Math.max(1,sec)*1000;
 const el=document.getElementById('timer'),lab=document.getElementById('tLab');
 el.classList.remove('hidden','fin');if(lab)lab.textContent='Rest';setTimerActs('rest');
 clearInterval(tInt);tInt=setInterval(tick,250);tick();}
function startHold(sec,sides,exIdx){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){}
 tMode='side';tHoldSec=Math.max(1,parseInt(sec)||1);tHoldOf=sides>=2?2:1;tHoldN=1;
 tExIdx=(exIdx==null||exIdx==='')?null:+exIdx;tAwaitStart=false;tEnd=Date.now()+tHoldSec*1000;
 const el=document.getElementById('timer'),lab=document.getElementById('tLab');
 el.classList.remove('hidden','fin');if(lab)lab.textContent=tHoldOf===2?'Side 1 of 2':'Hold';setTimerActs('hold');
 clearInterval(tInt);tInt=setInterval(tick,250);tick();}
function tick(){const el=document.getElementById('timer'),left=Math.round((tEnd-Date.now())/1000),lab=document.getElementById('tLab');
 if(left<=0){
  if(tMode==='side'&&tHoldN<tHoldOf){tHoldN++;tEnd=Date.now()+tHoldSec*1000;el.classList.remove('fin');if(lab)lab.textContent='Side '+tHoldN+' of '+tHoldOf;document.getElementById('tt').textContent=Math.floor(tHoldSec/60)+':'+String(tHoldSec%60).padStart(2,'0');if(navigator.vibrate)navigator.vibrate([180,80,180]);beep();if(view==='session')render();return;}
  if(tMode==='side'){const idx=tExIdx,e=idx!=null&&S.active&&S.active.exercises[idx];beep();if(e){swFreeze(e);startTimer(restSecFor(e),idx);if(view==='session')render();}else{stopTimer();toast('Both sides done');}return;}
  if(tMode==='go'){const idx=tExIdx;clearInterval(tInt);tInt=null;tAwaitStart=false;tExIdx=null;tMode='rest';el.classList.add('hidden');el.classList.remove('fin');toneStart();if(navigator.vibrate)navigator.vibrate(280);if(idx!=null&&S.active&&S.active.exercises[idx]){beginSet(idx);const e=S.active.exercises[idx],n=nextOpenSet(e);save();toast('Set '+(n>=0?n+1:e.sets.length)+' started');if(view==='session')render();}return;}
  if(tMode==='rest'&&tExIdx!=null){armNextSet();return;}
  if(!el.classList.contains('fin')){el.classList.add('fin');tAwaitStart=false;clearInterval(tInt);tInt=null;setTimerActs('done');
   if(lab)lab.textContent='Rest done';
   document.getElementById('tt').textContent='Rest done!';
   if(navigator.vibrate)navigator.vibrate([400,150,400,150,400]);beep();
   setTimeout(()=>{if(document.getElementById('timer').classList.contains('fin')&&tExIdx==null&&tMode!=='go')stopTimer()},6000);}
  return;}
 if(tMode==='go'){if(lab)lab.textContent='Next set';}
 else if(tMode==='side'){if(lab)lab.textContent=tHoldOf===2?('Side '+tHoldN+' of '+tHoldOf):'Hold';}
 else if(lab)lab.textContent='Rest';
 document.getElementById('tt').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');}
function stopTimer(){clearInterval(tInt);tInt=null;tAwaitStart=false;tExIdx=null;tMode='rest';tHoldN=0;tHoldOf=0;const el=document.getElementById('timer');el.classList.add('hidden');el.classList.remove('fin');setTimerActs('rest');const lab=document.getElementById('tLab');if(lab)lab.textContent='Rest';}
function beginSet(i){const e=S.active&&S.active.exercises[i];if(!e)return;startWork(i);const sec=holdSecs(e.target&&e.target.reps);if(isBodyweight(e)&&sidePair(e.target&&e.target.reps)&&sec>0)startHold(sec,2,i);}
// ---- exercise work timer (guided; accumulates durationSec) ----
let clockInt=null;
function fmtMMSS(sec){sec=Math.max(0,Math.floor(sec||0));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function swNow(e){const base=e.durationSec||0;return e._swOn&&e._swT0?base+Math.max(0,Math.floor((Date.now()-e._swT0)/1000)):base;}
function swFreeze(e){if(e&&e._swOn){e.durationSec=swNow(e);e._swOn=false;delete e._swT0;}}
function startWork(i){if(!S.active)return;S.active.exercises.forEach((e,j)=>{if(j!==i)swFreeze(e);});
 const e=S.active.exercises[i];if(!e||e.cardio)return;if(tInt||tAwaitStart)stopTimer();
 if(!e._swOn){e._swOn=true;e._swT0=Date.now();}ensureClock();}
function ensureClock(){if(clockInt)return;clockInt=setInterval(tickClocks,250);}
function stopClock(){clearInterval(clockInt);clockInt=null;}
function tickClocks(){if(!S.active){stopClock();return;}
 const se=document.getElementById('sessElapsed');if(se)se.textContent=fmtMMSS(Math.floor((Date.now()-S.active.start)/1000));
 S.active.exercises.forEach((e,i)=>{const el=document.getElementById('sw'+i);if(el){el.textContent=fmtMMSS(swNow(e));const row=document.getElementById('swrow'+i)||el.closest('.sw');
  if(row){row.classList.toggle('running',!!e._swOn||(tMode==='side'&&tExIdx===i));row.classList.toggle('ready',!!((tAwaitStart||tMode==='go')&&tExIdx===i));row.classList.toggle('resting',!!(tInt&&tExIdx===i&&!tAwaitStart&&tMode!=='side'&&tMode!=='go'));}}});}
async function wake(on){try{if(on&&'wakeLock' in navigator&&!wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>wakeLock=null);}else if(!on&&wakeLock){await wakeLock.release();wakeLock=null;}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(S.active&&view==='session'){wake(true);tickClocks();}if(tInt)tick();}});

// ---- HISTORY ----
function exSeries(name){const n=name.toLowerCase(),pts=[];let bw=true;
 S.sessions.forEach(s=>s.exercises.forEach(e=>{if(e.name.toLowerCase()!==n)return;
  if(e.cardio){const m=num(e.minutes);if(m)pts.push({t:s.start,y:m,c:1});return;}
  const d=doneSets(e);if(!d.length)return;const w=Math.max(...d.map(x=>num(x.w)||0)),r=Math.max(...d.map(x=>num(x.r)||0));if(w>0)bw=false;pts.push({t:s.start,w,r});}));
 if(pts.length&&pts[0].c)return {pts,unit:'minutes'};
 return bw?{pts:pts.map(p=>({t:p.t,y:p.r})),unit:'top reps (bodyweight)'}:{pts:pts.filter(p=>p.w>0).map(p=>({t:p.t,y:p.w})),unit:'top-set weight (kg)'};}
function vHistory(){const names=[];const seen=new Set();sortedSessions().forEach(s=>s.exercises.forEach(e=>{const k=e.name.toLowerCase();if(!seen.has(k)&&(e.cardio?num(e.minutes):doneSets(e).length)){seen.add(k);names.push(e.name);}}));
 if(!progEx||!seen.has(progEx.toLowerCase()))progEx=names[0]||null;
 let h=`<h1>History</h1><h2>Progress</h2><div class="card">`;
 if(progEx){const sr=exSeries(progEx);const best=sr.pts.length?Math.max(...sr.pts.map(p=>p.y)):0;
  h+=`<select data-f="progEx">${names.map(n=>`<option ${n===progEx?'selected':''}>${esc(n)}</option>`).join('')}</select><div style="height:8px"></div>${chart(sr.pts,{legend:`${sr.unit} · best ${best} · ${sr.pts.length} sessions`})}`;}
 else h+='<div class="muted">Finish a session to see progress charts.</div>';
 h+='</div><h2>Sessions &amp; cardio</h2>';
 const items=S.sessions.map(s=>({t:s.start,s})).concat(S.cardio.map(c=>({t:c.t,c}))).sort((a,b)=>b.t-a.t);
 if(!items.length)return h+'<div class="card muted">Nothing logged yet.</div>';
 let lastDay='';h+='<div class="card list" style="padding:4px 12px">';
 items.forEach(it=>{const day=dKey(it.t);if(day!==lastDay){h+=`<div class="muted" style="margin-top:10px;font-weight:700">${fmtDate(it.t)}</div>`;lastDay=day;}
  if(it.s){const s=it.s,n=s.exercises.reduce((a,e)=>a+(e.cardio?(e.done?1:0):doneSets(e).length),0),dur=s.end?Math.round((s.end-s.start)/60000):0;
   h+=`<button class="item" data-a="detail" data-id="${s.id}"><span><b>${esc(s.name)}</b><br><span class="muted">${fmtTime(s.start)} · ${n} sets · ${dur} min</span></span><span>›</span></button>`;}
  else{const c=it.c;const kc=c.kcal!=null&&c.kcal!==''?` · ${c.kcal} kcal`:'';h+=`<div class="item"><span><b>🏃 ${esc(c.type)}</b><br><span class="muted">${c.minutes} min cardio${kc}</span></span><button class="btn sm danger" data-a="delCardio" data-id="${c.id}">✕</button></div>`;}});
 return h+'</div>';}
function vDetail(){const s=S.sessions.find(x=>x.id===viewArg);if(!s){view='history';return vHistory();}
 const dur=s.end?Math.round((s.end-s.start)/60000):0;
 let h=`<button class="btn sm" data-a="nav" data-v="history">‹ Back</button><h1>${esc(s.name)}</h1><div class="muted">${fmtDate(s.start)} · ${fmtTime(s.start)}${s.end?'–'+fmtTime(s.end):''} · ${dur} min</div>`;
 s.exercises.forEach(e=>{h+=`<div class="card"><h3><span><button class="linkbtn" data-a="demo" data-n="${esc(e.name)}">${esc(e.name)}</button>${e.press?'<span class="tag">PRESS</span>':''}</span><button class="btn sm" data-a="prog" data-n="${esc(e.name)}">📈</button></h3>`;
  if(e.cardio)h+=`<div>${e.minutes?esc(e.minutes)+' min':'—'}${e.kcal!=null&&e.kcal!==''?' · '+esc(e.kcal)+' kcal':''}</div>`;
  else{const d=e.sets;h+=`<table class="dt">${d.map((x,j)=>`<tr style="${x.done?'':'opacity:.4'}"><td class="muted">Set ${j+1}</td><td><b>${esc(x.w||0)} kg × ${esc(x.r||0)}</b></td><td>${x.done?'✓':'skipped'}</td></tr>`).join('')}</table>`;}
  if(e.durationSec)h+=`<div class="muted">Work time: <b>${fmtMMSS(e.durationSec)}</b></div>`;
  if(e.press&&e.pain!=null)h+=`<div class="muted">Pain: <b style="color:${e.pain>3?'var(--da)':'var(--tx)'}">${e.pain}/10</b></div>`;
  if(e.notes)h+=`<div class="muted">📝 ${esc(e.notes)}</div>`;h+='</div>';});
 if(s.notes)h+=`<div class="card"><b>Notes</b><div>${esc(s.notes).replace(/\n/g,'<br>')}</div></div>`;
 return h+`<button class="btn danger wide" data-a="delSession" data-id="${s.id}">Delete this session</button>`;}

// ---- BODY ----
function vBody(){const b=S.body.slice().sort((a,c)=>a.date<c.date?-1:1),tk=todayKey();
 const avg=(from,to)=>{const a=b.filter(x=>x.date>=from&&x.date<=to);return a.length?a.reduce((s,x)=>s+x.kg,0)/a.length:null;};
 const a7=avg(keyAdd(tk,-6),tk),p7=avg(keyAdd(tk,-13),keyAdd(tk,-7)),latest=b[b.length-1];
 const roll=b.map(x=>({t:keyT(x.date),y:avg(keyAdd(x.date,-6),x.date)}));
 let h=`<h1>Body weight</h1><div class="card"><div class="grid2"><div><label class="lbl">Date</label><input id="bDate" type="date" value="${tk}"></div>
  <div><label class="lbl">Weight (kg)</label><input id="bKg" inputmode="decimal" placeholder="${latest?latest.kg:'95.0'}"></div></div>
  <button class="btn primary wide" data-a="logBody">+ Save weight</button></div>
  <div class="grid2"><div class="card"><div class="muted">7-day average</div><div class="stat">${a7!=null?a7.toFixed(1):'–'}<span class="muted"> kg</span></div>
  <div class="muted">${a7!=null&&p7!=null?((a7-p7>=0?'+':'')+(a7-p7).toFixed(1)+' kg vs prev week'):'&nbsp;'}</div></div>
  <div class="card"><div class="muted">Latest</div><div class="stat">${latest?latest.kg.toFixed(1):'–'}<span class="muted"> kg</span></div><div class="muted">${latest?fmtKeyDate(latest.date):'&nbsp;'}</div></div></div>
  <div class="card">${chart(b.map(x=>({t:keyT(x.date),y:x.kg})),{line:roll,utc:1,legend:'● daily weigh-in &nbsp; <span style="color:var(--bl)">- - 7-day average</span>'})}</div>`;
 if(b.length)h+='<div class="card list" style="padding:4px 12px">'+b.slice().reverse().slice(0,60).map(x=>`<div class="item"><span>${fmtKeyDate(x.date)}</span><span><b>${x.kg.toFixed(1)} kg</b> <button class="btn sm danger" data-a="delBody" data-d="${x.date}">✕</button></span></div>`).join('')+'</div>';
 return h+vScans();}

// ---- SETTINGS ----
function vSettings(){const le=S.settings.lastExport;
 let h=`<h1>Settings</h1><h2>Backup</h2><div class="card"><div class="muted">Finishing a workout downloads a backup file and keeps another copy on the phone. Each morning the app checks that copy and restores it if the main save is empty. Last export: ${le?fmtDate(le):'never'}.</div>
  <button class="btn primary wide" data-a="export">⬇ Export data (.json)</button>
  <button class="btn wide" data-a="exportPh">⬇ Export data + photos &amp; scan images (.json, larger)</button>
  ${navigator.canShare?'<button class="btn wide" data-a="share">📤 Share backup (Files / AirDrop / email)</button>':''}
  <button class="btn wide" data-a="import">⬆ Import backup from file</button>
  <button class="btn wide" data-a="paste">📋 Import by pasting JSON</button>
  <div class="muted">${S.sessions.length} sessions · ${S.cardio.length} cardio · ${S.body.length} weigh-ins · ${S.scans.length} scans${PH?' · '+PH.length+' photos':''}. Importing replaces data; photos in a backup are merged.</div></div>
  <h2>Training block</h2><div class="card">${(()=>{const b=blockInfo();return `<div><b>${esc(b.label)}${b.deload?' · DELOAD':''}</b></div>
  <div class="muted">Accessories set ${b.letter} · ${fmtKeyDate(b.start)} → ${fmtKeyDate(b.end)}. Mains stay the same; accessories flip A↔B each new block.</div>
  <label class="lbl">Block start date</label><input type="date" id="blockStart" value="${b.start}">
  <div class="grid2" style="margin-top:8px"><button class="btn" data-a="blockSaveStart">Save start date</button><button class="btn" data-a="blockNext">Start next block (${b.letter}→${b.nextLetter})</button></div>
  <button class="btn wide" data-a="blockReset" style="margin-top:6px">Reset to Block 1A starting today</button>`;})()}</div>
  <h2>Meal targets</h2><div class="card"><div class="muted" style="margin-bottom:6px">Pick a goal. Calories use your stats, not the Evolt TEE: male, 186 cm, born 16 Nov 1988, your latest weight (or 95 kg), training 4–5 days. Maintenance is resting burn × 1.55. Lose weight is 15% under, build & lose is 5% under, maintain is that number, build muscle is 10% over, bulk is 18% over. Cardio calories you log are taken off that day’s food total. Editing the calorie box keeps your number until you pick a goal.</div>
  ${goalPicker()}
  <div class="grid2">${(()=>{ensureMeals();const t=Object.assign({},MEAL_TARGETS,S.meals.targets||{});return `
   <div><label class="lbl">Calories (kcal)</label><input type="number" inputmode="numeric" min="1" step="10" data-f="mealTgt" data-k="kcal" value="${t.kcal}"></div>
   <div><label class="lbl">Protein (g)</label><input type="number" inputmode="numeric" min="1" step="1" data-f="mealTgt" data-k="protein" value="${t.protein}"></div>
   <div><label class="lbl">Carbs (g)</label><input type="number" inputmode="numeric" min="1" step="1" data-f="mealTgt" data-k="carbs" value="${t.carbs}"></div>
   <div><label class="lbl">Fat (g)</label><input type="number" inputmode="numeric" min="1" step="1" data-f="mealTgt" data-k="fat" value="${t.fat}"></div>`;})()}</div></div>
  <h2>Rest timer</h2><div class="card grid2"><div><label class="lbl">Default (s)</label><input type="number" inputmode="numeric" data-f="rest" data-k="rest" value="${S.settings.rest}"></div>
  <div><label class="lbl">Main lifts (s)</label><input type="number" inputmode="numeric" data-f="rest" data-k="restMain" value="${S.settings.restMain}"></div></div>
  <h2>Plan</h2><div class="muted">Changes save automatically and apply to new sessions. P = pressing, M = main lift, C = cardio, A = abs finisher. Missing abs blocks are auto-added once for older saved plans; use Reset plan to fully restore defaults.</div>`;
 S.plan.forEach((p,pi)=>{h+=`<details class="card"><summary>${esc(p.name)} <span class="muted" style="margin-left:6px">(${p.exercises.length})</span></summary>
  <label class="lbl">Session name</label><input data-f="plName" data-p="${pi}" value="${esc(p.name)}">`;
  p.exercises.forEach((e,xi)=>{const a=`data-p="${pi}" data-x="${xi}"`;h+=`<div class="pe"><input data-f="pl" data-k="name" ${a} value="${esc(e.name)}" aria-label="name"><input data-f="pl" data-k="sets" ${a} type="number" inputmode="numeric" value="${e.sets}" aria-label="sets"><input data-f="pl" data-k="reps" ${a} value="${esc(e.reps)}" aria-label="reps"></div>
   <div class="pe2">${['press','main','cardio','abs'].map(k=>`<label class="chk"><input type="checkbox" data-f="plc" data-k="${k}" ${a} ${e[k]?'checked':''}>${k[0].toUpperCase()}</label>`).join('')}<span class="grow"></span>
   <button class="btn sm" data-a="plSwap" ${a}>Change</button><button class="btn sm" data-a="demo" data-n="${esc(e.name)}" aria-label="demo">ⓘ</button><button class="btn sm" data-a="plMove" ${a}>↑</button><button class="btn sm danger" data-a="plDel" ${a}>✕</button></div>`;});
  h+=`<button class="btn wide" data-a="plAdd" data-p="${pi}">+ Add exercise</button></details>`;});
 h+=`<button class="btn wide" data-a="plReset">Reset plan to default</button>
  <h2>Mobility routines</h2><div class="muted">Edit items, dose, timer seconds and cues.</div>`;
 S.routines.forEach((r,ri)=>{h+=`<details class="card"><summary>${esc(r.name)} <span class="muted" style="margin-left:6px">(${r.items.length})</span></summary>
  <div class="grid2"><div><label class="lbl">Name</label><input data-f="rtName" data-r="${ri}" value="${esc(r.name)}"></div><div><label class="lbl">Hint</label><input data-f="rtHint" data-r="${ri}" value="${esc(r.hint||'')}"></div></div>`;
  r.items.forEach((it,xi)=>{const a=`data-r="${ri}" data-x="${xi}"`;h+=`<div class="pe3" style="border-bottom:1px solid var(--line);padding:8px 0"><div class="pe" style="grid-template-columns:1fr 110px 64px;margin:0"><input data-f="rt" data-k="name" ${a} value="${esc(it.name)}" aria-label="name"><input data-f="rt" data-k="dose" ${a} value="${esc(it.dose)}" aria-label="dose"><input data-f="rt" data-k="sec" type="number" inputmode="numeric" ${a} value="${it.sec||0}" aria-label="timer seconds"></div>
   <div class="row" style="margin:4px 0 0"><input class="grow" data-f="rt" data-k="cue" ${a} value="${esc(it.cue||'')}" placeholder="How-to cue" aria-label="cue"><button class="btn sm" data-a="mobSwap" data-r="${esc(r.id)}" data-x="${xi}">Change</button><button class="btn sm" data-a="demo" data-n="${esc(it.name)}" aria-label="demo">ⓘ</button><button class="btn sm" data-a="rtMove" ${a}>↑</button><button class="btn sm danger" data-a="rtDel" ${a}>✕</button></div></div>`;});
  h+=`<button class="btn wide" data-a="rtAdd" data-r="${ri}">+ Add item</button></details>`;});
 h+=`<button class="btn wide" data-a="rtReset">Reset mobility routines to default</button>
  <h2>Exercise cues</h2><div class="muted">Tap any exercise name (or ⓘ) for a demo. Exercises without a built-in demo can have your own cues here.</div>${cueList()}
  <h2>Danger zone</h2><div class="card"><button class="btn danger wide" data-a="clear">🗑 Clear all data</button></div>
  <div class="muted" style="text-align:center;margin:16px 0">Workout Tracker · offline, single-file · data stored in localStorage</div>`;
 return h;}
async function doExport(withPhotos){let data=S;if(withPhotos===true){toast('Preparing photos…');data=Object.assign({},S,{photos:await idbExport(),scanImages:await scanImgExport()});}
 const blob=new Blob([JSON.stringify(data,null,withPhotos===true?0:2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`workout-backup-${withPhotos===true?'with-photos-':''}${todayKey()}.json`;
 document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);S.settings.lastExport=Date.now();save();toast('Backup downloaded');if(view==='settings')render();}
async function doImport(text){let d;try{d=JSON.parse(text);}catch(e){toast('⚠ Not valid JSON');return;}
 if(!d||typeof d!=='object'||!(Array.isArray(d.sessions)||Array.isArray(d.plan)||Array.isArray(d.body))){toast('⚠ Not a workout backup file');return;}
 if(!confirm(`Replace current data with backup?\n(${(d.sessions||[]).length} sessions, ${(d.body||[]).length} weigh-ins, ${(d.scans||[]).length} Evolt scans, ${(d.photos||[]).length} photos)`))return;
 const photos=Array.isArray(d.photos)?d.photos:[],scanImgs=Array.isArray(d.scanImages)?d.scanImages:[];delete d.photos;delete d.scanImages;S=normalize(d);save();
 if(scanImgs.length){try{for(const x of scanImgs)if(x&&x.id&&x.full)await idbPutFull('scan_'+x.id,x.full);}catch(e){toast('⚠ Scan image import failed: '+e.message,4000);}}
 if(photos.length){try{for(const ph of photos){const full=ph.full;const rec=Object.assign({},ph);delete rec.full;if(rec.id&&full)await idbPut(rec,full);}PH=null;}catch(e){toast('⚠ Photo import failed: '+e.message,4000);}}closeModal();toast('✓ Backup imported');render();}

function flushSetInputs(){if(!S.active||!Array.isArray(S.active.exercises))return;
 document.querySelectorAll('#app input[data-f="w"],#app input[data-f="r"]').forEach(inp=>{
  const e=S.active.exercises[+inp.dataset.i];if(!e||!Array.isArray(e.sets))return;
  const st=e.sets[+inp.dataset.j];if(!st)return;st[inp.dataset.f]=inp.value.trim();});}
// ---- actions ----
const A={
 nav:t=>{let v=t.dataset.v;if(v==='train'){v=S.active?'session':'home';mobFromSession=false;}else if(v!=='mobility')mobFromSession=false;go(v);},
 home:()=>go('home'),
 start:t=>startSession(t.dataset.id),
 logCardio:()=>{const type=document.getElementById('cType').value.trim()||'Cardio',m=num(document.getElementById('cMin').value),kcalRaw=document.getElementById('cKcal').value,kcal=kcalRaw===''||kcalRaw==null?null:num(kcalRaw),d=document.getElementById('cDate').value||todayKey();
  if(!m||m<=0){toast('Enter minutes');return;}if(kcal!=null&&kcal<0){toast('Calories must be ≥ 0');return;}const t=d===todayKey()?Date.now():keyT(d)+2*3600e3;
  S.cardio.push({id:uid(),type,minutes:m,kcal,date:d,t});save();toast(`✓ ${m} min ${type}${kcal!=null?' · '+kcal+' kcal':''}`);render();},
 tick:t=>{const i=+t.dataset.i,e=S.active.exercises[i],st=e.sets[+t.dataset.j],row=t.closest('.set');
  if(!st.done){const wi=row.querySelector('input[data-f="w"]'),ri=row.querySelector('input[data-f="r"]');if(wi&&wi.value.trim()!=='')st.w=wi.value.trim();else if(wi&&st.w===''&&wi.placeholder&&wi.placeholder!=='kg')st.w=wi.placeholder;if(ri&&ri.value.trim()!=='')st.r=ri.value.trim();else if(st.r===''&&ri&&ri.placeholder&&ri.placeholder!=='reps'&&ri.placeholder!=='sec')st.r=ri.placeholder;
   st.done=true;swFreeze(e); // end work for this set
   const more=e.sets.some(x=>!x.done),nxt=more?i:nextWorkIndex(i);
   if(nxt>=0)startTimer(restSecFor(e),nxt);else{stopTimer();toast('✓ '+e.name+' done');}
  }else{st.done=false;if(tExIdx===i)stopTimer();}save();render();},
 tickC:t=>{const e=S.active.exercises[+t.dataset.i];if(!e.done&&!e.minutes)e.minutes=String(parseInt(e.target.reps)||20);e.done=!e.done;save();render();},
 pain:t=>{const e=S.active.exercises[+t.dataset.i];e.pain=Math.max(0,Math.min(10,(e.pain==null?0:e.pain)+ +t.dataset.d));save();render();},
 addSet:t=>{const e=S.active.exercises[+t.dataset.i],l=e.sets[e.sets.length-1];e.sets.push({w:l?l.w:'',r:'',done:false});save();render();},
 delSet:t=>{const e=S.active.exercises[+t.dataset.i];if(e.sets.length>1){e.sets.pop();save();render();}},
 rest:t=>{const i=t.dataset.i!=null?+t.dataset.i:tExIdx;if(i!=null&&S.active)swFreeze(S.active.exercises[i]);startTimer(+t.dataset.s,i);},
 hold:t=>{startHold(+t.dataset.s,+t.dataset.sides||2,null);},
 swStart:t=>{beginSet(+t.dataset.i);save();render();},
 swPause:t=>{swFreeze(S.active.exercises[+t.dataset.i]);save();render();},
 swReset:t=>{const e=S.active.exercises[+t.dataset.i];e.durationSec=0;e._swOn=false;delete e._swT0;save();render();},
 tStartSet:()=>{const i=tExIdx;stopTimer();if(i==null||!S.active||!S.active.exercises[i])return;beginSet(i);save();render();
  const card=document.getElementById('ex'+i);if(card)card.scrollIntoView({behavior:'smooth',block:'nearest'});},
 exNote:t=>{const e=S.active.exercises[+t.dataset.i];e._showNote=!e._showNote;render();const ta=document.querySelector(`textarea[data-i="${t.dataset.i}"]`);if(ta)ta.focus();},
 exSwap:t=>openSwap('session',+t.dataset.i),
 swapPick:t=>{
  const name=t.dataset.n,mode=t.dataset.mode,tpl=templateFor(name);
  if(mode==='session'){
   if(!S.active){toast('No active session');return;}
   const e=S.active.exercises[+t.dataset.i];if(!e)return;
   e.swappedFrom=e.swappedFrom||e.name;e.name=name;
   if(tpl){e.press=!!tpl.press;e.main=!!tpl.main;e.abs=!!tpl.abs;e.cardio=!!tpl.cardio;}
   if(e.cardio){if(!('minutes' in e))e.minutes='';if(e.done==null)e.done=false;delete e.sets;}
   else if(!Array.isArray(e.sets)){const n=Math.max(1,(e.target&&e.target.sets)||(tpl&&tpl.sets)||3);e.sets=Array.from({length:n},()=>({w:'',r:'',done:false}));if(e.target)e.target.sets=n;}
   stampLoad(e,blockInfo());
   save();closeModal();render();toast('Swapped for this session · '+name);
   const card=document.getElementById('ex'+t.dataset.i);if(card)card.scrollIntoView({behavior:'smooth',block:'nearest'});
  }else{
   const p=S.plan[+t.dataset.i],e=p&&p.exercises[+t.dataset.x];if(!e)return;
   e.name=name;
   if(tpl){e.press=!!tpl.press;e.main=!!tpl.main;e.abs=!!tpl.abs;e.cardio=!!tpl.cardio;}
   save();closeModal();renderKeepOpen();toast('Plan updated · '+name);
  }
 },
 exMove:t=>{const i=+t.dataset.i,a=S.active.exercises;if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];save();render();}},
 delEx:t=>{const i=+t.dataset.i;if(confirm(`Remove ${S.active.exercises[i].name} from this session?`)){S.active.exercises.splice(i,1);save();render();}},
 addEx:()=>exModal('session'),
 closeModal,
 exModalOk:t=>{const typed=(document.getElementById('mSearch').value||'').trim(),picked=(document.getElementById('mPick').value||'').trim(),name=typed||picked;if(!name){toast('Pick or type an exercise');return;}
  if(t.dataset.t==='session'&&S.active&&S.active.exercises.some(e=>nameKey(e.name)===nameKey(name))){toast('Already in this session');return;}
  const setsRaw=(document.getElementById('mSets').value||'').trim(),repsRaw=(document.getElementById('mReps').value||'').trim();
  const tpl={name,sets:setsRaw||'3',reps:repsRaw,press:mPress.checked,main:mMain.checked,abs:mAbs.checked,cardio:mCardio.checked};
  if(t.dataset.t==='session'){
   if(!S.active){toast('No active session');return;}
   const ex=mkEx(tpl);stampLoad(ex,blockInfo());const idx=insertSessionEx(ex);
   const toPlan=document.getElementById('mToPlan');
   if(toPlan&&toPlan.checked&&S.active.planId&&S.active.planId!=='custom'){const p=planById(S.active.planId);if(p)insertPlanEx(p,tpl);}
   save();closeModal();render();toast('✓ Added '+name);setTimeout(()=>{const c=document.getElementById('ex'+idx);if(c)c.scrollIntoView({behavior:'smooth',block:'nearest'});},50);
  }else{const p=S.plan[+t.dataset.t];if(!p){toast('Plan not found');return;}insertPlanEx(p,tpl);save();closeModal();renderKeepOpen();toast('✓ Added to plan');}
  },
 discard:()=>{if(confirm('Discard this session? Nothing will be saved.')){S.active=null;save();stopTimer();stopClock();wake(false);go('home');}},
 finish:()=>{flushSetInputs();const s=S.active,n=s.exercises.reduce((a,e)=>a+(e.cardio?(e.done?1:0):doneSets(e).length),0);
  if(!n&&!confirm('No sets ticked done. Save anyway?'))return;s.end=Date.now();
  s.exercises.forEach(e=>{swFreeze(e);delete e._showNote;delete e._swOn;delete e._swT0;if(!e.durationSec)delete e.durationSec;});
  S.sessions.push(s);S.active=null;S.settings.lastBackupAt=Date.now();save();downloadBackup();backupNow('workout');stopTimer();stopClock();wake(false);toast('✓ Session saved · backup downloaded');go('detail',s.id);},
 detail:t=>go('detail',t.dataset.id),
 prog:t=>{progEx=t.dataset.n;go('history');},
 delSession:t=>{if(confirm('Delete this session permanently?')){S.sessions=S.sessions.filter(s=>s.id!==t.dataset.id);save();go('history');}},
 delCardio:t=>{if(confirm('Delete this cardio entry?')){S.cardio=S.cardio.filter(c=>c.id!==t.dataset.id);save();render();}},
 logBody:()=>{const kg=num(document.getElementById('bKg').value),d=document.getElementById('bDate').value||todayKey();
  if(!kg||kg<30||kg>300){toast('Enter a valid weight');return;}S.body=S.body.filter(x=>x.date!==d);S.body.push({date:d,kg});save();toast(`✓ ${kg} kg saved`);render();},
 delBody:t=>{if(confirm('Delete this weigh-in?')){S.body=S.body.filter(x=>x.date!==t.dataset.d);save();render();}},
 export:()=>doExport(false),
 exportPh:()=>doExport(true).catch(e=>toast('⚠ '+e.message)),
 share:async()=>{try{const f=new File([JSON.stringify(S,null,2)],`workout-backup-${todayKey()}.json`,{type:'application/json'});
  if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Workout backup'});S.settings.lastExport=Date.now();save();render();}else doExport();}catch(e){if(e.name!=='AbortError')doExport();}},
 import:()=>{const i=document.getElementById('imp');i.value='';i.click();},
 paste:()=>modal(`<h2 style="margin-top:0">Paste backup JSON</h2><textarea id="pasteTa" rows="8" placeholder='{"version":1,...}'></textarea><div class="row"><button class="btn grow" data-a="closeModal">Cancel</button><button class="btn primary grow" data-a="pasteOk">Import</button></div>`),
 pasteOk:()=>doImport(document.getElementById('pasteTa').value),
 plAdd:t=>exModal(t.dataset.p),
 plSwap:t=>openSwap('plan',+t.dataset.p,+t.dataset.x),
 plMove:t=>{const a=S.plan[+t.dataset.p].exercises,i=+t.dataset.x;if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];save();renderKeepOpen();}},
 plDel:t=>{const a=S.plan[+t.dataset.p].exercises,i=+t.dataset.x;if(confirm(`Remove ${a[i].name} from the plan?`)){a.splice(i,1);save();renderKeepOpen();}},
 plReset:()=>{if(confirm('Reset the plan to the default program? (History is kept. Training block is unchanged.)')){S.plan=clone(DEFAULT_PLAN);save();render();toast('Plan reset');}},
 blockSaveStart:()=>{const v=(document.getElementById('blockStart')||{}).value;if(!v){toast('Pick a date');return;}S.block.start=v;save();toast('Block start saved');render();},
 blockNext:()=>{if(!confirm('Start the next 4-week block now? Accessories flip A↔B and week resets to 1.'))return;advanceBlock(false);render();},
 blockReset:()=>{if(!confirm('Reset training block to Block 1A starting today?'))return;S.block={start:todayKey(),letter:'A',number:1};save();toast('Block reset to 1A');render();},
 clear:()=>modal(`<h2 style="margin-top:0;color:var(--da)">Clear all data?</h2><p>This deletes all sessions, cardio, body weight and plan edits from this device. Export a backup first!</p><label class="lbl">Type DELETE to confirm</label><input id="clrTa" autocomplete="off" autocapitalize="characters"><div class="row"><button class="btn grow" data-a="closeModal">Cancel</button><button class="btn danger grow" data-a="clearOk">Delete everything</button></div>`),
 clearOk:()=>{if(document.getElementById('clrTa').value.trim().toUpperCase()!=='DELETE'){toast('Type DELETE to confirm');return;}localStorage.removeItem(KEY);localStorage.removeItem(SCAN_KEY);S=defaults();S.settings.seededEvolt=1;save();idbClear().catch(()=>{});PH=null;stopTimer();closeModal();toast('All data cleared');go('home');},
 mobGo:t=>{const id=t.dataset.r;if(!routineById(id)){toast('Warm-up routine missing — reset mobility routines in Settings');return;}mobSel=id;mobFromSession=!!S.active;go('mobility');requestAnimationFrame(()=>{const chip=document.querySelector('.chips [data-r="'+id+'"]');if(chip)chip.scrollIntoView({inline:'center',block:'nearest',behavior:'instant'});const list=document.getElementById('mobList');if(list)list.scrollIntoView({behavior:'smooth',block:'start'});});},
 mobSel:t=>{mobSel=t.dataset.r;render();},
 mobTick:t=>{mobToggle(t.dataset.r,+t.dataset.x);render();},
 mobSwap:t=>openMobSwap(t.dataset.r,+t.dataset.x),
 mobSwapPick:t=>applyMobSwap(t.dataset.r,+t.dataset.x,t.dataset.n),
 mobAll:t=>{const r=routineById(t.dataset.r),e=mobEntry(t.dataset.r,todayKey(),true);e.d=r.items.map(i=>i.name);e.c=true;save();render();toast('✓ '+r.name+' complete');},
 mobReset:t=>{const L=S.mobLog[todayKey()];if(L){delete L[t.dataset.r];save();render();}},
 bp:t=>{const k=todayKey();if(S.backPain[k]===+t.dataset.v)delete S.backPain[k];else S.backPain[k]=+t.dataset.v;save();render();},
 phPose:t=>{phPose=t.dataset.v;render();},
 phMode:t=>{phMode=t.dataset.v;render();},
 cmpPose:t=>{cmp.pose=t.dataset.v;cmp.a=cmp.b=null;render();},
 phCam:()=>{const i=document.getElementById('phCam');i.value='';i.click();},
 phUp:()=>{const i=document.getElementById('phUp');i.value='';i.click();},
 phView:t=>phViewer(t.dataset.id),
 phDel:async t=>{if(!confirm('Delete this photo permanently?'))return;await idbDel(t.dataset.id);PH=null;closeModal();toast('Photo deleted');render();},
 rtAdd:t=>{S.routines[+t.dataset.r].items.push(mi('New item','2×10',30,''));save();renderKeepOpen();},
 rtMove:t=>{const a=S.routines[+t.dataset.r].items,i=+t.dataset.x;if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];save();renderKeepOpen();}},
 rtDel:t=>{const a=S.routines[+t.dataset.r].items,i=+t.dataset.x;if(confirm(`Remove ${a[i].name}?`)){a.splice(i,1);save();renderKeepOpen();}},
 rtReset:()=>{if(confirm('Reset mobility routines to default? (Completion log is kept.)')){S.routines=clone(DEFAULT_ROUTINES);save();render();toast('Routines reset');}},
 scanAdd:()=>scanForm(null),
 scanEdit:t=>scanForm(S.scans.find(x=>x.id===t.dataset.id)),
 scanView:t=>scanViewer(t.dataset.id),
 scanCmp:t=>{scanCmp=t.dataset.v;render();},
 scanImgPick:()=>{const i=document.getElementById('scanImg');i.value='';i.click();},
 scanSave:t=>scanSave(t.dataset.id).catch(e=>toast('⚠ '+e.message,4000)),
 scanDel:async t=>{if(!confirm('Delete this Evolt scan (and its report image)?'))return;S.scans=S.scans.filter(x=>x.id!==t.dataset.id);save();try{await idbDelFull('scan_'+t.dataset.id);}catch(e){}closeModal();toast('Scan deleted');render();},
 demo:t=>demoModal(t.dataset.n),
 demoPause:t=>t.classList.toggle('paused'),
 tAdj:t=>{if(tAwaitStart||tMode==='go')return;tEnd=Math.max(Date.now()+1000,tEnd+ +t.dataset.d*1000);document.getElementById('timer').classList.remove('fin');tick();},
 tStop:()=>{stopTimer();if(view==='session')render();},
 tReady:()=>{if(tMode==='rest'&&tExIdx!=null)armNextSet();},
 mealDay:t=>{mealDay=t.dataset.d;if(/^\d{4}-\d{2}-\d{2}$/.test(mealDay||'')&&mealMonth&&mealDay.slice(0,7)!==mealMonth)mealMonth=mealDay.slice(0,7);render();},
 mealMonth:t=>{const cur=mealMonth||mealDayKey().slice(0,7);const [y,m]=cur.split('-').map(Number);const d=new Date(Date.UTC(y,m-1+(+t.dataset.d||0),1));mealMonth=d.toISOString().slice(0,7);render();},
 mealToday:()=>{mealDay=todayKey();mealMonth=mealDay.slice(0,7);render();},
 mealTab:t=>{mealTab=t.dataset.v;render();},
 goal:t=>{const got=writeGoal(t.dataset.v);if(!got){toast('Could not set that goal');return;}save();render();toast(got.label+' · '+got.kcal+' kcal');},
 mealSlot:t=>{mealSlot=t.dataset.v;render();},
 yfEat:t=>toggleYoufoodz(t.dataset.id,t.checked),
 yfPastAdd:t=>{
  ensureMeals();const it=(S.meals.yfPast||[]).find(x=>x.id===t.dataset.id);if(!it){toast('Meal missing');return;}
  const day=mealDayKey(),slot=currentSlot();
  dayLog(day).push({name:it.name,kcal:n0(it.kcal),protein:n0(it.protein),carbs:it.carbs==null?null:n0(it.carbs),fat:it.fat==null?null:n0(it.fat),slot,source:'youfoodz',yfId:it.id,at:Date.now()});
  save();toast('✓ '+it.name+' → '+slotName(slot)+' · '+fmtKeyShort(day));render();
 },
 mealEat:t=>togglePlanItem(t.dataset.d,t.dataset.id,t.checked),
 mealRecipe:t=>mealRecipeModal(t.dataset.kind,t.dataset.id,t.dataset.d),
 bcScan:()=>openBarcodeScanner(),
 bcManual:()=>{stopBarcode();modal(`<h2 style="margin-top:0">Enter barcode</h2><input id="bcNum" inputmode="numeric" placeholder="Barcode number" autocomplete="off"><div class="row"><button class="btn grow" data-a="bcClose">Cancel</button><button class="btn primary grow" data-a="bcLookup">Look up</button></div>`);setTimeout(()=>{const i=document.getElementById('bcNum');if(i)i.focus();},80);},
 bcClose:()=>{stopBarcode();closeModal();},
 bcLookup:()=>{const n=(document.getElementById('bcNum')||{}).value;stopBarcode();lookupBarcode(n);},
 bcAmt:t=>{document.getElementById('bcMode').value=t.dataset.m;document.querySelectorAll('#bcAmtMode .btn').forEach(b=>b.classList.toggle('on',b.dataset.m===t.dataset.m));},
 bcAdd:()=>{const code=(document.getElementById('bcCode')||{}).value||'';const name=(document.getElementById('bcName')||{}).value||'Food';
  const m=computeBcMacros();if(!m.kcal&&!m.protein){toast('Enter amount');return;}
  const food={name,kcal:m.kcal,protein:m.protein,carbs:m.carbs,fat:m.fat,barcode:code,source:'off'};
  if((document.getElementById('bcSaveLib')||{}).checked)saveToLibrary(code,food);
  stopBarcode();closeModal();addFoodToLog(food);},
 foodMissAdd:()=>{const name=((document.getElementById('fName')||{}).value||'').trim();if(!name){toast('Enter a name');return;}
  const food={name,kcal:n0((document.getElementById('fK')||{}).value),protein:n0((document.getElementById('fP')||{}).value),carbs:n0((document.getElementById('fC')||{}).value),fat:(document.getElementById('fF')||{}).value===''?null:n0((document.getElementById('fF')||{}).value),barcode:(document.getElementById('bcCode')||{}).value||null,source:'manual'};
  if((document.getElementById('bcSaveLib')||{}).checked&&food.barcode)saveToLibrary(food.barcode,food);
  closeModal();addFoodToLog(food);},
 foodCustom:()=>customFoodModal(),
 foodCustomOk:()=>{const name=((document.getElementById('fName')||{}).value||'').trim();if(!name){toast('Enter a name');return;}
  const food={name,kcal:n0((document.getElementById('fK')||{}).value),protein:n0((document.getElementById('fP')||{}).value),carbs:n0((document.getElementById('fC')||{}).value),fat:(document.getElementById('fF')||{}).value===''?null:n0((document.getElementById('fF')||{}).value),source:'manual'};
  if((document.getElementById('bcSaveLib')||{}).checked){ensureMeals();const id='custom_'+uid();S.meals.library[id]=Object.assign({barcode:id},food);}
  closeModal();addFoodToLog(food);},
 foodLibAdd:t=>{ensureMeals();const f=S.meals.library[t.dataset.id];if(!f)return;showFoodAddModal(Object.assign({barcode:f.barcode||t.dataset.id},f));},
 foodLibOk:()=>{const mult=n0((document.getElementById('fMult')||{}).value)||1;
  const food={name:(document.getElementById('fBaseName')||{}).value,kcal:n0((document.getElementById('fBaseK')||{}).value)*mult,protein:n0((document.getElementById('fBaseP')||{}).value)*mult,carbs:n0((document.getElementById('fBaseC')||{}).value)*mult,fat:(document.getElementById('fBaseF')||{}).value===''?null:n0((document.getElementById('fBaseF')||{}).value)*mult,barcode:(document.getElementById('bcCode')||{}).value||null,source:'library'};
  closeModal();addFoodToLog(food);},
 foodLogDel:t=>{ensureMeals();const L=dayLog(t.dataset.d);L.splice(+t.dataset.i,1);save();render();},
 favQuickAdd:t=>{ensureMeals();const id=t.dataset.id;const f=S.meals.library[id]||favById(id);if(!f){toast('Favourite missing');return;}
  closeModal();
  addFoodToLog({name:f.short||f.label||f.name,kcal:f.kcal,protein:f.protein,carbs:f.carbs,fat:f.fat,barcode:f.barcode||id,source:'favourite'},
   '✓ '+(f.short||f.label||'Favourite')+' · 1 serve');},
 favInfo:t=>favInfoModal(t.dataset.id)
};
function renderKeepOpen(){const open=[...document.querySelectorAll('details')].map(d=>d.open),y=scrollY;render();document.querySelectorAll('details').forEach((d,i)=>d.open=!!open[i]);scrollTo(0,y);}
document.addEventListener('click',e=>{try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(err){}const t=e.target.closest('[data-a]');if(!t)return;if(t.type==='checkbox'||t.type==='radio')return;const f=A[t.dataset.a];if(f){e.preventDefault();f(t,e);}});
document.addEventListener('input',e=>{const t=e.target,f=t.dataset.f;
 if(t.id==='phDate'){phForm.date=t.value;if(phForm.kg==null){const k=document.getElementById('phKg');if(k)k.value=bodyOn(t.value);}}else if(t.id==='phKg')phForm.kg=t.value;else if(t.id==='phNote')phForm.note=t.value;
 if(!f)return;
 if(f==='w'||f==='r'){const st=S.active.exercises[+t.dataset.i].sets[+t.dataset.j];st[f]=t.value.trim();st.touched=1;save();}
 else if(f==='min'){S.active.exercises[+t.dataset.i].minutes=t.value;save();}
 else if(f==='ckcal'){const v=t.value.trim();S.active.exercises[+t.dataset.i].kcal=v===''?null:(num(v));save();}
 else if(f==='sNotes'){S.active.notes=t.value;save();}
 else if(f==='exNotes'){S.active.exercises[+t.dataset.i].notes=t.value;save();}
 else if(f==='rest'){const v=parseInt(t.value);if(v>0){S.settings[t.dataset.k]=v;save();}}
 else if(f==='mealTgt'){ensureMeals();const v=num(t.value);if(v!=null&&v>0){S.meals.targets[t.dataset.k]=v;if(t.dataset.k==='kcal')S.meals.targets.kcalManual=true;save();}}
 else if(f==='cue'){const k=t.dataset.n;if(t.value.trim())S.cues[k]=t.value;else delete S.cues[k];save();}
 else if(f==='rtName'){S.routines[+t.dataset.r].name=t.value;save();}
 else if(f==='rtHint'){S.routines[+t.dataset.r].hint=t.value;save();}
 else if(f==='rt'){const it=S.routines[+t.dataset.r].items[+t.dataset.x];it[t.dataset.k]=t.dataset.k==='sec'?(parseInt(t.value)||0):t.value;save();}
 else if(f==='plName'){S.plan[+t.dataset.p].name=t.value;save();}
 else if(f==='pl'){const e=S.plan[+t.dataset.p].exercises[+t.dataset.x];e[t.dataset.k]=t.dataset.k==='sets'?(parseInt(t.value)||1):t.value;save();}});
document.addEventListener('change',e=>{const t=e.target,f=t.dataset.f;
 if(t.dataset&&t.dataset.a==='yfEat'){A.yfEat(t);return;}
 if(t.dataset&&t.dataset.a==='mealEat'){A.mealEat(t);return;}
 if(f==='progEx'){progEx=t.value;render();}
 else if(f==='cmpA'||f==='cmpB'){cmp[f==='cmpA'?'a':'b']=t.value;render();}
 else if((t.id==='phCam'||t.id==='phUp')&&t.files.length){addPhotos([...t.files]);}
 else if(t.id==='scanImg'&&t.files.length){pendingScanImg=t.files[0];const l=document.getElementById('scanImgLbl');if(l)l.textContent='📎 '+(t.files[0].name||(isPdfFile(t.files[0])?'PDF':'image'))+' selected';fillScanFromFile(pendingScanImg);}
 else if(f==='plc'){S.plan[+t.dataset.p].exercises[+t.dataset.x][t.dataset.k]=t.checked;save();}
 else if(t.id==='imp'&&t.files[0]){const r=new FileReader();r.onload=()=>doImport(r.result);r.readAsText(t.files[0]);}});
window.addEventListener('storage',e=>{if(e.key===KEY){S=load();render();}});

// ---- MOBILITY ----
let mobSel=null,mobFromSession=false;
const routineById=id=>S.routines.find(r=>r.id===id);
function mobEntry(rid,k,create){if(!S.mobLog[k]){if(!create)return null;S.mobLog[k]={};}const L=S.mobLog[k];if(!L[rid]){if(!create)return null;L[rid]={d:[],c:false};}return L[rid];}
function routineProg(rid,k){const r=routineById(rid),e=mobEntry(rid,k,false),d=e?e.d:[];const of=r?r.items.length:0,n=r?r.items.filter(i=>d.includes(i.name)).length:0;return {n,of,complete:!!(e&&e.c)};}
function mobToggle(rid,x){const r=routineById(rid),it=r.items[x],e=mobEntry(rid,todayKey(),true),i=e.d.indexOf(it.name);
 if(i>=0)e.d.splice(i,1);else{e.d.push(it.name);}const was=e.c;e.c=r.items.every(q=>e.d.includes(q.name));save();if(e.c&&!was)toast('🔥 '+r.name+' complete!');}
function streak(rid){let k=todayKey(),n=0;const done=k2=>{const e=mobEntry(rid,k2,false);return !!(e&&e.c);};if(!done(k))k=keyAdd(k,-1);while(done(k)){n++;k=keyAdd(k,-1);}return n;}
function suggestedRoutine(){const p=SCHEDULE[wday(Date.now())];if(!routineProg('posture',todayKey()).complete&&p!=='lowerA'&&p!=='lowerB'&&p)return 'posture';
 if(p==='lowerA'||p==='lowerB'||!p)return routineProg('back',todayKey()).complete?'posture':'back';return 'posture';}
function vMobility(){const tk=todayKey();if(!mobSel||!routineById(mobSel))mobSel=suggestedRoutine();if(!routineById(mobSel))mobSel=S.routines[0]&&S.routines[0].id;
 const st=streak('posture'),bc=Array.from({length:7},(_,i)=>keyAdd(tk,-i)).filter(k=>{const e=mobEntry('back',k,false);return e&&e.c}).length;
 let h=`<h1>Mobility &amp; posture</h1><div class="muted">Pain-free range only · no loaded overhead or painful shoulder stretches</div>
 ${S.active&&mobFromSession?`<button class="btn primary wide" data-a="nav" data-v="train">‹ Back to ${esc(S.active.name)} session</button>`:S.active?`<button class="btn wide" data-a="nav" data-v="train">‹ Resume ${esc(S.active.name)}</button>`:''}
 <div class="grid2"><div class="card"><div class="muted">Posture streak</div><div class="stat">🔥 ${st}<span class="muted"> day${st===1?'':'s'}</span></div></div>
 <div class="card"><div class="muted">Back care (7 days)</div><div class="stat">${bc}<span class="muted">/7</span></div></div></div>
 <div class="card"><div class="muted">Last 14 days — posture routine</div><div class="dots">${Array.from({length:14},(_,i)=>{const k=keyAdd(tk,i-13),pr=routineProg('posture',k);return `<i class="${pr.complete?'f':pr.n?'p':''} ${k===tk?'t':''}" title="${k}"></i>`}).join('')}</div></div>
 <div class="chips">${S.routines.map(r=>{const pr=routineProg(r.id,tk);return `<button class="btn ${r.id===mobSel?'on':''}" data-a="mobSel" data-r="${r.id}">${pr.complete?'✓ ':''}${esc(r.name)} ${pr.complete?'':`<small class="muted">${pr.n}/${pr.of}</small>`}</button>`}).join('')}</div>`;
 const r=routineById(mobSel);
 if(r){const e=mobEntry(r.id,tk,false),d=e?e.d:[],pr=routineProg(r.id,tk);
  h+=`<div class="card" id="mobList"><div class="hrow"><div><h3>${esc(r.name)}</h3><div class="muted">${esc(r.hint||'')}</div></div><div class="stat" style="font-size:20px">${pr.n}/${pr.of}</div></div>`;
  r.items.forEach((it,x)=>{const dn=d.includes(it.name);h+=`<div class="mi ${dn?'done':''}"><button class="tick" data-a="mobTick" data-r="${r.id}" data-x="${x}" aria-label="done">✓</button>
   <div class="grow"><button class="linkbtn" data-a="demo" data-n="${esc(it.name)}"><b>${esc(it.name)}</b></button> <span class="muted">· ${esc(it.dose)}</span><div class="cue">${esc(it.cue||'')}</div></div>${it.sec?`<button class="btn" data-a="${sidePair(it.dose)?'hold':'rest'}" data-s="${it.sec}" data-sides="${sidePair(it.dose)?2:1}">⏱ ${sidePair(it.dose)?(it.sec+'s ×2'):(it.sec>=60&&it.sec%60===0?it.sec/60+'m':it.sec+'s')}</button>`:''}<button class="btn sm" data-a="mobSwap" data-r="${esc(r.id)}" data-x="${x}">Change</button></div>`;});
  h+=`<div class="row"><button class="btn sm" data-a="mobReset" data-r="${r.id}">Reset today</button><button class="btn primary grow" data-a="mobAll" data-r="${r.id}">✓ Mark all done</button></div></div>`;}
 const bp=S.backPain[tk];
 h+=`<h2>Lower back pain today</h2><div class="card"><div class="muted" style="margin-bottom:8px">0 = none · 10 = worst. ${bp!=null?`Logged: <b>${bp}/10</b>`:'Not logged yet today.'}</div>
  <div class="pgrid">${Array.from({length:11},(_,v)=>`<button class="btn ${bp===v?'on':''}" data-a="bp" data-v="${v}">${v}</button>`).join('')}</div>
  <div style="height:10px"></div>${chart(Object.keys(S.backPain).sort().slice(-90).map(k=>({t:keyT(k),y:S.backPain[k]})),{utc:1,legend:'Lower back pain (0–10), last 90 entries'})}</div>`;
 return h;}

// ---- PHOTOS (IndexedDB) ----
let PH=null,phPose='Front',phMode='gallery';const phForm={date:null,kg:null,note:''};const cmp={pose:'Front',a:null,b:null};const POSES=['Front','Side','Back'];
let _db=null;
function idb(){return _db||(_db=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('IndexedDB not available'));const r=indexedDB.open('workoutTrackerPhotos',1);
 r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos',{keyPath:'id'});if(!d.objectStoreNames.contains('full'))d.createObjectStore('full');};
 r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));}
function idbReq(store,mode,fn){return idb().then(d=>new Promise((res,rej)=>{const t=d.transaction(store,mode);let out;const q=fn(t);if(q)q.onsuccess=()=>{out=q.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('Transaction aborted (storage full?)'));}));}
const idbAll=()=>idbReq('photos','readonly',t=>t.objectStore('photos').getAll());
const idbFull=id=>idbReq('full','readonly',t=>t.objectStore('full').get(id));
const idbPut=(rec,full)=>idbReq(['photos','full'],'readwrite',t=>{t.objectStore('photos').put(rec);t.objectStore('full').put(full,rec.id);});
const idbDel=id=>idbReq(['photos','full'],'readwrite',t=>{t.objectStore('photos').delete(id);t.objectStore('full').delete(id);});
const idbClear=()=>idbReq(['photos','full'],'readwrite',t=>{t.objectStore('photos').clear();t.objectStore('full').clear();});
async function idbExport(){const all=await idbAll(),out=[];for(const r of all)out.push(Object.assign({},r,{full:await idbFull(r.id)}));return out;}
async function loadPhotos(){try{PH=(await idbAll()).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.t-a.t);}catch(e){PH=[];toast('⚠ Photos unavailable: '+e.message,4000);}}
function loadImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{res(i);setTimeout(()=>URL.revokeObjectURL(u),2000)};i.onerror=()=>rej(new Error('Could not read '+(file.name||'image')));i.src=u;});}
function resizeImg(img,max,q){const sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);
 const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);return {url:c.toDataURL('image/jpeg',q),w:c.width,h:c.height};}
async function addPhotos(files){const date=(document.getElementById('phDate')||{}).value||todayKey(),kgv=num((document.getElementById('phKg')||{}).value||''),note=((document.getElementById('phNote')||{}).value||'').trim();
 let ok=0;toast('Processing '+files.length+' photo'+(files.length>1?'s':'')+'…');
 for(const f of files){try{const img=await loadImg(f),full=resizeImg(img,1080,.82),th=resizeImg(img,360,.7);
   await idbPut({id:uid(),date,pose:phPose,kg:kgv,note,t:Date.now(),w:full.w,h:full.h,thumb:th.url},full.url);ok++;}catch(e){toast('⚠ '+e.message,4000);}}
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}
 PH=null;if(ok)toast(`✓ ${ok} ${phPose} photo${ok>1?'s':''} saved`);if(view==='photos')render();}
function hydrateFull(){document.querySelectorAll('img[data-full]').forEach(async im=>{try{const u=await idbFull(im.dataset.full);if(u)im.src=u;}catch(e){}});}
async function phViewer(id){const r=(PH||[]).find(p=>p.id===id);if(!r)return;
 modal(`<div class="hrow"><h2 style="margin:0">${esc(r.pose)} · ${fmtKeyShort(r.date)}</h2><button class="btn sm" data-a="closeModal">Close</button></div>
 <div class="muted" style="margin:6px 0">${fmtKeyDate(r.date)}${r.kg?` · ${r.kg} kg`:''}${r.note?` · ${esc(r.note)}`:''}</div>
 <img class="full" id="phFull" src="${r.thumb}" alt="${esc(r.pose)} photo"><button class="btn danger wide" data-a="phDel" data-id="${r.id}">Delete photo</button>`);
 try{const u=await idbFull(id);const el=document.getElementById('phFull');if(u&&el)el.src=u;}catch(e){}}
function bodyOn(k){const b=S.body.find(x=>x.date===k);return b?b.kg:'';}
function vPhotos(){if(PH===null){loadPhotos().then(()=>{if(view==='photos')render();});return '<h1>Progress photos</h1><div class="muted">Loading…</div>';}
 const tk=todayKey();
 let h=`<h1>Progress photos</h1><div class="muted">Same spot, light & time of day each time (e.g. morning, before food). Stored on this device only.</div>
 <div class="card"><div class="seg">${POSES.map(p=>`<button class="btn ${phPose===p?'on':''}" data-a="phPose" data-v="${p}">${p}</button>`).join('')}</div>
 <div class="grid2"><div><label class="lbl">Date</label><input id="phDate" type="date" value="${phForm.date||tk}"></div><div><label class="lbl">Weight (kg, optional)</label><input id="phKg" inputmode="decimal" value="${phForm.kg!=null?esc(phForm.kg):bodyOn(phForm.date||tk)}" placeholder="kg"></div></div>
 <label class="lbl">Note (optional)</label><input id="phNote" value="${esc(phForm.note)}" placeholder="e.g. week 4, fasted">
 <div class="grid2" style="margin-top:10px"><button class="btn primary" data-a="phCam">📷 Take ${phPose}</button><button class="btn" data-a="phUp">🖼 Upload</button></div></div>
 <div class="seg"><button class="btn ${phMode==='gallery'?'on':''}" data-a="phMode" data-v="gallery">Gallery (${PH.length})</button><button class="btn ${phMode==='compare'?'on':''}" data-a="phMode" data-v="compare">Compare</button></div>`;
 if(!PH.length)return h+'<div class="card muted">No photos yet. Pick a pose and tap Take or Upload.</div>';
 if(phMode==='gallery'){const by={};PH.forEach(p=>(by[p.date]=by[p.date]||[]).push(p));
  Object.keys(by).sort().reverse().forEach(k=>{const kg=by[k].map(p=>p.kg).find(Boolean)||bodyOn(k);
   h+=`<div class="muted" style="margin:14px 0 6px;font-weight:700">${fmtKeyDate(k)}${kg?` · ${kg} kg`:''}</div><div class="thumbs">${by[k].sort((a,b)=>POSES.indexOf(a.pose)-POSES.indexOf(b.pose)).map(p=>`<button data-a="phView" data-id="${p.id}"><img src="${p.thumb}" alt="${esc(p.pose)} ${k}" loading="lazy"><span>${esc(p.pose)}</span></button>`).join('')}</div>`;});}
 else{const list=PH.filter(p=>p.pose===cmp.pose),byDate={};list.forEach(p=>{if(!byDate[p.date]||byDate[p.date].t<p.t)byDate[p.date]=p;});
  const dates=Object.keys(byDate).sort();
  h+=`<div class="seg">${POSES.map(p=>`<button class="btn ${cmp.pose===p?'on':''}" data-a="cmpPose" data-v="${p}">${p}</button>`).join('')}</div>`;
  if(dates.length<2)h+=`<div class="card muted">Need ${cmp.pose} photos on at least 2 different dates to compare (have ${dates.length}).</div>`;
  else{if(!byDate[cmp.a])cmp.a=dates[0];if(!byDate[cmp.b])cmp.b=dates[dates.length-1];const A=byDate[cmp.a],B=byDate[cmp.b];
   const sel=(f,v)=>`<select data-f="${f}">${dates.map(d=>`<option value="${d}" ${d===v?'selected':''}>${fmtKeyShort(d)} ${d.slice(0,4)}</option>`).join('')}</select>`;
   const ka=A.kg||bodyOn(A.date),kb=B.kg||bodyOn(B.date),days=Math.round((keyT(B.date)-keyT(A.date))/864e5);
   h+=`<div class="cmp">${sel('cmpA',cmp.a)}${sel('cmpB',cmp.b)}<div><img data-full="${A.id}" src="${A.thumb}" alt="before"><div class="muted">${fmtKeyDate(A.date)}${ka?` · ${ka} kg`:''}</div></div><div><img data-full="${B.id}" src="${B.thumb}" alt="after"><div class="muted">${fmtKeyDate(B.date)}${kb?` · ${kb} kg`:''}</div></div></div>
   <div class="card"><b>${Math.abs(days)} days apart</b>${ka&&kb?` · ${(kb-ka>=0?'+':'')+(kb-ka).toFixed(1)} kg`:''}</div>`;}}
 return h;}

// ---- EVOLT SCANS ----
// [key,label,unit,direction(+1 up is good, -1 down is good, 0 neutral),decimals]
const SCAN_F=[['weight','Weight','kg',0,1],['smm','Skeletal muscle mass','kg',1,1],['bfp','Body fat','%',-1,1],['bfm','Body fat mass','kg',-1,1],['lbm','Lean body mass','kg',1,1],['vfl','Visceral fat level','',-1,1],['bmr','BMR','kcal',1,0],['tee','TEE','kcal',0,0],['tbw','Total body water','L',0,1],['protein','Protein','kg',1,1],['minerals','Minerals','kg',1,2],['bioAge','Biological age','yrs',-1,0]];
const SEGS=[['ra','Right arm'],['la','Left arm'],['tr','Trunk'],['rl','Right leg'],['ll','Left leg']];
const SEG_F=[];SEGS.forEach(([k,n])=>{SEG_F.push(['seg.'+k+'.lean',n+' lean','kg',1,2]);SEG_F.push(['seg.'+k+'.fat',n+' fat','kg',-1,2]);});
let scanCmp='prev',pendingScanImg=null;
const sv=(sc,k)=>{if(k.startsWith('seg.')){const [,g,f]=k.split('.');return sc.seg&&sc.seg[g]&&sc.seg[g][f]!=null?sc.seg[g][f]:null;}return sc[k]!=null?sc[k]:null;};
const fmtN=(v,d)=>v==null?'–':(+v).toFixed(d);
const idbPutFull=(k,v)=>idbReq('full','readwrite',t=>{t.objectStore('full').put(v,k);});
const idbDelFull=k=>idbReq('full','readwrite',t=>{t.objectStore('full').delete(k);});
const isPdfFile=f=>!!(f&&(f.type==='application/pdf'||/\.pdf$/i.test(f.name||'')));
function readFileDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('Could not read '+(file.name||'file')));r.readAsDataURL(file);});}
function pdfBlobUrl(dataUrl){const b64=String(dataUrl).split(',')[1]||'';const bin=atob(b64);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));}
function loadPdfJs(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);return new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';res(window.pdfjsLib);}catch(e){rej(e);}};s.onerror=()=>rej(new Error('PDF reader needs internet once'));document.head.appendChild(s);});}
function evoltFirstNum(s){const m=String(s).replace(/,/g,'').match(/^(\d+(?:\.\d+)?)(?:\s*%)?(?:\s*\/\s*[A-Za-z]+)?(?:\s*kcal)?\s*$/i);return m?+m[1]:null;}
function evoltDate(s){const iso=String(s).match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);if(iso)return iso[1]+'-'+iso[2].padStart(2,'0')+'-'+iso[3].padStart(2,'0');const m=String(s).match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);if(!m)return null;let a=+m[1],b=+m[2],y=m[3];if(a>12)return y+'-'+String(b).padStart(2,'0')+'-'+String(a).padStart(2,'0');if(b>12)return y+'-'+String(a).padStart(2,'0')+'-'+String(b).padStart(2,'0');return y+'-'+String(b).padStart(2,'0')+'-'+String(a).padStart(2,'0');}
function evoltBelow(items,label){const hits=items.filter(it=>it.y<label.y-1&&label.y-it.y<48&&it.x>=label.x-8&&it.x<label.x+110&&!/^\s*\[/.test(it.s)&&evoltFirstNum(it.s)!=null);hits.sort((a,b)=>b.y-a.y||a.x-b.x);return hits[0]||null;}
function evoltLabel(items,re,pred){return items.find(it=>re.test(it.s)&&(!pred||pred(it)))||null;}
function parseEvoltItems(items){const out={};const wt=items.find(it=>/^\d+(?:\.\d+)?\s*(kg|lb)\b/i.test(it.s));if(wt){const m=wt.s.match(/^(\d+(?:\.\d+)?)\s*(kg|lb)\b/i);out.weight=+m[1];out.unit=m[2].toLowerCase();}
 const dt=items.map(it=>evoltDate(it.s)).find(Boolean);if(dt)out.date=dt;
 const map=[['lbm',/^LEAN BODY MASS$/],['smm',/^SKELETAL MUSCLE MASS$/],['protein',/^PROTEIN$/],['minerals',/^MINERAL$/],['tbw',/^TOTAL BODY WATER$/],['bfm',/^BODY FAT MASS$/],['vfl',/^VISCERAL FAT LEVEL$/],['bmr',/^BMR$/],['tee',/^TEE\b|TOTAL ENERGY EXPENDITURE/i],['bfp',/^TOTAL BODY FAT PERCENTAGE$/],['bioAge',/^BIO AGE$/]];
 map.forEach(([k,re])=>{const lab=evoltLabel(items,re,it=>k!=='protein'||it.x<80);if(!lab)return;const v=evoltBelow(items,lab);if(v)out[k]=evoltFirstNum(v.s);});
 if(out.tee==null){const kc=items.filter(it=>/kcal/i.test(it.s)&&evoltFirstNum(it.s)!=null).map(it=>({n:evoltFirstNum(it.s),y:it.y})).sort((a,b)=>b.y-a.y);const other=kc.find(x=>x.n!==out.bmr);if(other)out.tee=other.n;}
 const parts=[['la',/^LEFT ARM$/],['ra',/^RIGHT ARM$/],['tr',/^TORSO$/],['ll',/^LEFT LEG$/],['rl',/^RIGHT LEG$/]];
 out.seg={};parts.forEach(([k,re])=>{const lab=evoltLabel(items,re);if(!lab)return;const band=items.filter(it=>it.y<lab.y-4&&lab.y-it.y<55&&evoltFirstNum(it.s)!=null&&!/^\s*\[/.test(it.s)&&!/\b(in|cm)\b/i.test(it.s)&&(lab.x<280?it.x<250:it.x>280));band.sort((a,b)=>a.x-b.x);if(band[0])(out.seg[k]=out.seg[k]||{}).lean=evoltFirstNum(band[0].s);if(band[1])(out.seg[k]=out.seg[k]||{}).fat=evoltFirstNum(band[1].s);});
 if(!Object.keys(out.seg).length)delete out.seg;return out;}
function evoltToKg(p){if(p.unit!=='lb')return p;const mass=['weight','lbm','smm','protein','minerals','tbw','bfm'];const c=n=>n==null?n:Math.round(n*0.45359237*100)/100;mass.forEach(k=>{if(p[k]!=null)p[k]=c(p[k]);});if(p.seg)Object.keys(p.seg).forEach(k=>['lean','fat'].forEach(f=>{if(p.seg[k][f]!=null)p.seg[k][f]=c(p.seg[k][f]);}));return p;}
async function evoltItemsFromPdf(file){const pdfjs=await loadPdfJs();const data=new Uint8Array(await file.arrayBuffer());const doc=await pdfjs.getDocument({data}).promise;const page=await doc.getPage(1);const tc=await page.getTextContent();return tc.items.filter(it=>it.str&&it.str.trim()).map(it=>({s:it.str.trim(),x:it.transform[4],y:it.transform[5]}));}
async function fillScanFromFile(file){if(!isPdfFile(file)){toast('Numbers are read from the Evolt PDF. A photo still attaches, but type the values in.',5000);return;}
 try{toast('Reading report…');const parsed=evoltToKg(parseEvoltItems(await evoltItemsFromPdf(file)));
  const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null&&v!=='')el.value=String(v);};
  set('sf_date',parsed.date);['weight','smm','bfp','bfm','lbm','vfl','bmr','tee','tbw','protein','minerals','bioAge'].forEach(k=>set('sf_'+k,parsed[k]));
  let n=['weight','smm','bfp','bfm','lbm','vfl','bmr','tee','tbw','protein','minerals','bioAge','date'].filter(k=>parsed[k]!=null).length;
  if(parsed.seg){Object.keys(parsed.seg).forEach(k=>['lean','fat'].forEach(f=>{if(parsed.seg[k][f]!=null){set('sf_seg_'+k+'_'+f,parsed.seg[k][f]);n++;}}));const d=document.querySelector('#modal details');if(d)d.open=true;}
  if(n<3)toast('Could not read this PDF. Type the numbers, or send a clearer Evolt sheet.',5000);
  else toast('Filled '+n+' fields'+(parsed.unit==='lb'?' (converted from lb to kg)':'')+'. Check them, then save.',5000);
 }catch(e){toast('Could not read the PDF. '+(e&&e.message?e.message:''),5000);}}
async function scanImgExport(){const out=[];for(const sc of S.scans)if(sc.img){try{const f=await idbFull('scan_'+sc.id);if(f)out.push({id:sc.id,full:f});}catch(e){}}return out;}
const sortedScans=()=>S.scans.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.t||0)-(b.t||0));
function scanDelta(ref,cur,spec){const [k,l,u,dir,d]=spec,a=sv(ref,k),b=sv(cur,k);if(a==null&&b==null)return null;
 if(a==null||b==null)return {l,u,d,a,b,kind:'miss'};
 const r=+(b-a).toFixed(d);return {l,u,d,a,b,r,kind:r===0?'same':dir===0?'flat':(r*dir>0?'up':'down')};}
function scanDeltas(ref,cur){return SCAN_F.concat(SEG_F).map(s=>scanDelta(ref,cur,s)).filter(Boolean);}
function scanChg(x){const sign=x.r>0?'+':'';return sign+x.r.toFixed(x.d)+(x.u?(' '+x.u):'');}
function scanSummary(ref,cur){const rows=scanDeltas(ref,cur),up=rows.filter(x=>x.kind==='up'),down=rows.filter(x=>x.kind==='down'),flat=rows.filter(x=>x.kind==='flat');
 const li=xs=>xs.length?xs.map(x=>`<li><b>${esc(x.l)}</b> ${esc(scanChg(x))}</li>`).join(''):'<li class="muted">None</li>';
 const also=flat.length?`<div class="muted" style="margin-top:8px">Also changed: ${flat.map(x=>esc(x.l)+' '+esc(scanChg(x))).join(' · ')}</div>`:'';
 return `<div class="scandiff"><div class="upbox"><b>Improved</b><ul>${li(up)}</ul></div><div class="downbox"><b>Gone backwards</b><ul>${li(down)}</ul></div></div>${also}`;}
function scanTable(ref,cur){const row=x=>{if(!x)return '';
  let ch='<span class="neu">–</span>';if(x.r!=null){const cls=x.kind==='up'?'good':x.kind==='down'?'bad':'neu';ch=`<span class="${cls}">${x.r>0?'▲ +':x.r<0?'▼ ':''}${x.r===0?'0':x.r.toFixed(x.d)}</span>`;}
  const rc=x.kind==='up'?'rowgood':x.kind==='down'?'rowbad':'';
  return `<tr class="${rc}"><td>${esc(x.l)}${x.u?` <span class="muted">${x.u}</span>`:''}</td><td class="n muted">${fmtN(x.a,x.d)}</td><td class="n">${fmtN(x.b,x.d)}</td><td class="n">${ch}</td></tr>`;};
 const main=SCAN_F.map(s=>row(scanDelta(ref,cur,s))).join(''),seg=SEG_F.map(s=>row(scanDelta(ref,cur,s))).join('');
 return `<table class="cmpt"><tr><th>Metric</th><th class="n">${fmtKeyShort(ref.date)}</th><th class="n">${fmtKeyShort(cur.date)}</th><th class="n">Change</th></tr>${main}${seg?`<tr class="sec"><td colspan="4">Segmental</td></tr>${seg}`:''}</table>`;}
function vScans(){const sc=sortedScans(),tk=todayKey(),last=sc[sc.length-1],since=last?Math.round((keyT(tk)-keyT(last.date))/864e5):null;
 let h=`<h2>Evolt 360 scans</h2><div class="card"><div class="muted">📅 Rescan every 2–4 weeks at the same time of day — ideally morning, fasted, before training, normal hydration — so results are comparable.</div>
 ${last?`<div style="margin-top:6px"><b>Last scan ${since} day${since===1?'':'s'} ago</b> · ${since<14?`next from ${fmtKeyShort(keyAdd(last.date,14))}–${fmtKeyShort(keyAdd(last.date,28))}`:since<=28?'<span class="good">due now</span>':'<span style="color:var(--wa);font-weight:700">overdue</span>'}</div>`:''}
 <button class="btn primary wide" data-a="scanAdd">+ Add Evolt scan</button></div>`;
 if(!sc.length)return h+'<div class="card muted">No scans yet. Add your first Evolt 360 result to track muscle vs fat.</div>';
 if(sc.length>=2){const ref=scanCmp==='first'?sc[0]:sc[sc.length-2],days=Math.round((keyT(last.date)-keyT(ref.date))/864e5);
  h+=`<div class="card" id="scanCmpCard"><h3>Latest vs ${scanCmp==='first'?'first':'previous'}</h3><div class="seg"><button class="btn ${scanCmp==='prev'?'on':''}" data-a="scanCmp" data-v="prev">vs previous</button><button class="btn ${scanCmp==='first'?'on':''}" data-a="scanCmp" data-v="first">vs first</button></div>
  <div class="muted">${fmtKeyDate(ref.date)} → ${fmtKeyDate(last.date)} · ${days} days</div>${scanSummary(ref,last)}${scanTable(ref,last)}</div>`;}
 else h+=`<div class="card"><h3>Latest scan · ${fmtKeyDate(last.date)}</h3>${scanTable(last,last).replace(/<th class="n">Change<\/th>/,'<th class="n"></th>')}<div class="muted">Add another scan to see changes.</div></div>`;
 [['weight','Weight (kg)'],['smm','Skeletal muscle mass (kg)'],['bfp','Body fat (%)'],['vfl','Visceral fat level']].forEach(([k,l])=>{
  h+=`<div class="card"><h3 style="margin-bottom:6px">${l}</h3>${chart(sc.filter(x=>x[k]!=null).map(x=>({t:keyT(x.date),y:x[k]})),{utc:1})}</div>`;});
 h+='<h3 style="margin-top:16px">Scan history</h3><div class="card list" style="padding:4px 12px">'+sc.slice().reverse().map(x=>`<button class="item" data-a="scanView" data-id="${x.id}"><span><b>${fmtKeyDate(x.date)}</b>${x.img?' 📎':''}<br><span class="muted">${[x.weight!=null?x.weight+' kg':'',x.smm!=null?'SMM '+x.smm:'',x.bfp!=null?'BF '+x.bfp+'%':'',x.vfl!=null?'VF '+x.vfl:''].filter(Boolean).join(' · ')||'—'}</span></span><span>›</span></button>`).join('')+'</div>';
 return h;}
function scanForm(sc){pendingScanImg=null;const v=k=>{const x=sc?sv(sc,k):null;return x==null?'':x;};
 modal(`<div class="hrow"><h2 style="margin:0">${sc?'Edit':'Add'} Evolt scan</h2><button class="btn sm" data-a="closeModal">Cancel</button></div>
 <label class="lbl">Scan date</label><input id="sf_date" type="date" data-nofocus="1" value="${sc?sc.date:todayKey()}">
 <div class="grid2">${SCAN_F.map(([k,l,u])=>`<div><label class="lbl">${esc(l)}${u?` (${u})`:''}</label><input id="sf_${k}" inputmode="decimal" value="${v(k)}"></div>`).join('')}</div>
 <details ${sc&&sc.seg?'open':''} style="margin-top:10px"><summary>Segmental lean &amp; fat (optional)</summary>
 <div class="segf muted" style="font-size:13px"><span></span><span>Lean (kg)</span><span>Fat (kg)</span></div>
 ${SEGS.map(([k,n])=>`<div class="segf"><span>${n}</span><input id="sf_seg_${k}_lean" inputmode="decimal" value="${v('seg.'+k+'.lean')}" aria-label="${n} lean"><input id="sf_seg_${k}_fat" inputmode="decimal" value="${v('seg.'+k+'.fat')}" aria-label="${n} fat"></div>`).join('')}</details>
 <label class="lbl">Notes</label><textarea id="sf_notes" rows="2" placeholder="Time of day, fasted?, hydration…">${esc(sc?sc.notes||'':'')}</textarea>
 <button class="btn wide" data-a="scanImgPick" id="scanImgLbl">📎 ${sc&&sc.img?'Replace':'Attach'} report PDF (fills the numbers) or photo</button>
 ${sc?'':`<label class="chk"><input type="checkbox" id="sf_tobody" checked> Also add weight to bodyweight log</label>`}
 <button class="btn primary wide" data-a="scanSave" data-id="${sc?sc.id:''}">✓ Save scan</button>`);}
async function scanSave(id){const date=document.getElementById('sf_date').value;if(!date){toast('Pick a date');return;}
 const old=id?S.scans.find(x=>x.id===id):null,rec={id:id||uid(),date,t:old?old.t:Date.now(),img:old?!!old.img:false,pdf:old?!!old.pdf:false};
 let any=false;SCAN_F.forEach(([k])=>{const n=num(document.getElementById('sf_'+k).value);if(n!=null){rec[k]=n;any=true;}});
 const seg={};SEGS.forEach(([k])=>['lean','fat'].forEach(f=>{const n=num(document.getElementById(`sf_seg_${k}_${f}`).value);if(n!=null){(seg[k]=seg[k]||{})[f]=n;any=true;}}));if(Object.keys(seg).length)rec.seg=seg;
 const notes=document.getElementById('sf_notes').value.trim();if(notes)rec.notes=notes;
 if(!any&&!pendingScanImg&&!notes){toast('Enter at least one value');return;}
 if(pendingScanImg){if(isPdfFile(pendingScanImg)){toast('Saving PDF…');const url=await readFileDataUrl(pendingScanImg);await idbPutFull('scan_'+rec.id,url);rec.img=true;rec.pdf=true;}
 else{toast('Compressing report image…');const img=await loadImg(pendingScanImg),full=resizeImg(img,1600,.85);await idbPutFull('scan_'+rec.id,full.url);rec.img=true;rec.pdf=false;}
 pendingScanImg=null;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}}
 const tb=document.getElementById('sf_tobody');if(tb&&tb.checked&&rec.weight&&!S.body.some(b=>b.date===date))S.body.push({date,kg:rec.weight});
 ensureMeals();
 if(!S.meals.targets.kcalManual){const mode=S.meals.targets.goal||'maintain';const cal=kcalForGoal(mode,rec.weight?rec:null);
  if(cal){S.meals.targets.kcal=cal.kcal;S.meals.targets.kcalNote=cal.note;}}
 const cal=S.meals.targets.kcalManual?null:{kcal:S.meals.targets.kcal,note:S.meals.targets.kcalNote};
 S.scans=S.scans.filter(x=>x.id!==rec.id);S.scans.push(rec);save();closeModal();render();
 const list=sortedScans(),i=list.findIndex(x=>x.id===rec.id),prev=i>0?list[i-1]:null;
 const calLine=cal?`<div class="card" style="margin-top:8px"><b>Daily calories now ${cal.kcal} kcal</b><div class="muted">${esc(cal.note)}</div></div>`:'';
 if(!prev){toast(cal?`✓ Scan saved · ${cal.kcal} kcal goal`:'✓ Scan saved');return;}
 modal(`<div class="hrow"><h2 style="margin:0">vs ${fmtKeyShort(prev.date)}</h2><button class="btn sm" data-a="closeModal">Close</button></div>
 <div class="muted">${fmtKeyDate(prev.date)} → ${fmtKeyDate(rec.date)} · saved</div>${calLine}${scanSummary(prev,rec)}`);}
async function scanViewer(id){const sc=S.scans.find(x=>x.id===id);if(!sc)return;
 const rows=SCAN_F.concat(SEG_F).filter(([k])=>sv(sc,k)!=null).map(([k,l,u,,d])=>`<tr><td>${esc(l)}</td><td class="n"><b>${fmtN(sv(sc,k),d)}</b> <span class="muted">${u}</span></td></tr>`).join('');
 modal(`<div class="hrow"><h2 style="margin:0">Evolt · ${fmtKeyShort(sc.date)}</h2><button class="btn sm" data-a="closeModal">Close</button></div><div class="muted">${fmtKeyDate(sc.date)}</div>
 <table class="cmpt">${rows||'<tr><td class="muted">No values</td></tr>'}</table>${sc.notes?`<div class="muted" style="margin-top:8px">📝 ${esc(sc.notes)}</div>`:''}
 ${sc.img?(sc.pdf?'<iframe id="scanPdf" title="Evolt report PDF" style="width:100%;height:70vh;border:0;margin-top:10px;background:#fff;border-radius:8px"></iframe><a class="btn wide" id="scanPdfOpen" style="margin-top:8px">Open PDF</a>':'<img class="full" id="scanFull" alt="Evolt report" style="margin-top:10px;min-height:100px">'):''}
 <div class="row"><button class="btn danger" data-a="scanDel" data-id="${sc.id}">Delete</button><button class="btn grow" data-a="scanEdit" data-id="${sc.id}">✎ Edit</button></div>`);
 if(sc.img){try{const u=await idbFull('scan_'+sc.id);if(!u)return;const pdf=sc.pdf||String(u).indexOf('data:application/pdf')===0;
  if(pdf){const blob=pdfBlobUrl(u),frame=document.getElementById('scanPdf'),a=document.getElementById('scanPdfOpen');if(frame)frame.src=blob;if(a){a.href=blob;a.target='_blank';}}
  else{const el=document.getElementById('scanFull');if(el)el.src=u;}}catch(e){}}}

// ---- EXERCISE DEMOS ----
// img: file prefix in ./img (free-exercise-db, Unlicense). svg: inline diagram key. approx: closest-match note.
const DEMOS=[
 {n:['Chest-supported row','Chest supported row','Incline DB row'],img:'Lying_T-Bar_Row',approx:'Lying T-bar row (chest-supported) shown',s:'Set an incline bench ~30–45°, chest on the pad, feet planted, neutral grip.',m:'Pull elbows back toward hips, squeeze shoulder blades, pause, lower under control to a full stretch.',x:'Lifting chest off the pad; shrugging; yanking with momentum.',w:'Chest support takes load off your lower back — keep it on the pad. Right elbow: neutral grip, don\'t over-squeeze the handles.'},
 {n:['Lat pulldown (neutral grip)','Lat pulldown','Neutral grip pulldown'],img:'V-Bar_Pulldown',approx:'Close/neutral-grip (V-bar) pulldown shown',s:'Thighs under pads, neutral (palms-facing) handle, slight lean back, chest up.',m:'Drive elbows down to your sides, bring handle to upper chest, control it back up to near full stretch.',x:'Pulling behind the neck; leaning way back; letting shoulders shrug up at the top.',w:'Stay in a pain-free top position — no need to fully hang at the top if the left shoulder pinches. Never pull behind the neck.'},
 {n:['Neutral-grip DB press (low incline)','Neutral-grip DB press low incline','Incline DB press','Neutral grip DB press'],img:'Hammer_Grip_Incline_DB_Bench_Press',approx:'Hammer-grip incline DB press shown — use a LOW incline (15–30°)',s:'Bench at a low incline, dumbbells at chest with palms facing each other, shoulder blades back & down.',m:'Press up and slightly in, elbows ~30–45° from body, lower slowly until a comfortable stretch.',x:'Elbows flared to 90°; bouncing out of the bottom; going too deep.',w:'PRESS: rate pain 0–10. Left shoulder: shorten the range (stop ~2–3 cm above chest) and keep elbows tucked. Pain >3 = keep weight same or lighter.'},
 {n:['Face pull','Face pulls'],img:'Face_Pull',s:'Rope on a cable at upper-chest/face height, overhand or thumbs-up grip, step back, stand tall.',m:'Pull the rope toward your eyes, hands apart, elbows high-ish and back, rotate hands back; pause.',x:'Going too heavy and leaning back; shrugging; elbows dropping low.',w:'Great for posture and shoulder health. Keep it light and smooth; if the left shoulder complains, lower the pulley to chest height.'},
 {n:['DB shrug','Dumbbell shrug','Shrug'],s:'Stand tall, dumbbells at your sides, arms long, chin tucked slightly.',m:'Shrug the shoulders straight up toward the ears, pause, lower slowly until the shoulders are fully down.',x:'Rolling the shoulders in circles; bouncing; bending the elbows into a curl; craning the neck.',w:'Upper traps. Do not roll the shoulders. Stop if the neck or left shoulder goes over 3/10. Keep the weights at your sides so this stays off the lower back.'},
 {n:['Cable shrug'],s:'Cable set low, straight bar or rope in both hands, stand close, arms long.',m:'Shrug straight up, pause, lower until the shoulders drop and the cable stays taut.',x:'Leaning back; turning it into an upright row; yanking the stack.',w:'Same upper-trap job as the dumbbell shrug. Stop if the neck or left shoulder pinches.'},
 {n:['Chest-supported shrug','Kelso shrug'],s:'Chest on an incline bench, dumbbells hanging straight down, neck neutral.',m:'Without bending the elbows, shrug the shoulder blades up and slightly together, pause, lower to a full stretch.',x:'Turning it into a row; lifting the chest off the pad; shrugging the neck.',w:'Hits the traps without loading the lower back. Keep the chest glued to the pad.'},
 {n:['Machine lateral raise','Seated lateral raise','Seated side lateral raise'],img:'Seated_Side_Lateral_Raise',approx:'Seated/machine-style lateral raise shown — stop at shoulder height, pain-free',s:'Seat upright, pads or DBs at sides, slight elbow bend, chest up.',m:'Raise arms out to about shoulder height (thumbs slightly up / scaption), lower slowly.',x:'Shrugging; swinging; going above the ears.',w:'PRESS: left shoulder bursitis — stop at or below shoulder height; skip if pain >3.'},
 {n:['Cable lateral raise','Lateral raise'],img:'Cable_Seated_Lateral_Raise',approx:'Cable lateral raise (two-handle version) shown — one arm at a time is fine',s:'Low pulley, handle in the opposite hand, stand side-on, slight forward lean, soft elbow.',m:'Raise arm out to the side to about shoulder height (thumb slightly up), lower slowly.',x:'Swinging; shrugging; raising above shoulder height.',w:'PRESS-marked for pain tracking. Left shoulder: stop at or below shoulder height, "scaption" (arm ~30° forward) is usually friendlier. Skip if painful.'},
 {n:['Hammer curl','Hammer curls'],img:'Hammer_Curls',s:'Stand tall, dumbbells at sides, palms facing in, elbows by ribs.',m:'Curl up without moving the elbows, squeeze, lower slowly to full extension.',x:'Swinging the torso; elbows drifting forward; dropping the weight.',w:'Right elbow bursitis: don\'t rest or lean the elbow on anything, avoid slamming into lockout, keep reps smooth.'},
 {n:['Band external rotation','External rotation'],img:'External_Rotation_with_Band',s:'Band at elbow height, elbow bent 90° and tucked at your side (towel roll between elbow and ribs).',m:'Rotate forearm outward away from the belly, keep elbow pinned, return slowly.',x:'Elbow drifting away from the body; too heavy a band; rotating the torso.',w:'Rotator-cuff friendly; use a light band and pain-free range for the left shoulder.'},
 {n:['Hack squat','Hack squats'],img:'Hack_Squat',approx:'Machine hack squat shown — Goblet squat is a good free-weight alternative if no machine',s:'Back and hips against the pads, feet shoulder-width mid-platform (slightly lower = more quads), shoulders under the pads, release the safety handles.',m:'Lower under control until thighs are about parallel (or as deep as you can keep hips/low back against the pad), drive up through mid-foot without locking hard.',x:'Feet too high (turns into more glute/ham); rounding or lifting hips off the pad at the bottom; locking knees hard at the top; bouncing.',w:'Low back: keep hips and low back glued to the pad — stop the descent the moment your pelvis wants to tuck. Prefer this over barbell back squat. No machine? Use Goblet squat (DB/kettlebell at chest, elbows in, upright torso) instead.'},
 {n:['Goblet squat','Goblet squats'],svg:'goblet',s:'Hold a dumbbell or kettlebell at chest height ("goblet"), elbows in, feet shoulder-width, toes slightly out.',m:'Sit down between the heels with an upright torso, elbows tracking inside the knees, drive up through mid-foot.',x:'Leaning forward; elbows flaring out; heels lifting; rounding the back.',w:'Low back: keep the chest up and weight at the sternum so the torso stays upright — a back-friendlier alternative to a barbell back squat. Shoulders/elbows: hug the weight in; don\'t let it hang and stress the joints.'},
 {n:['Back squat','Squat','Barbell squat'],img:'Hack_Squat',approx:'Barbell back squat avoided for low-back — showing machine hack squat (preferred alternative)',s:'Prefer Hack squat (machine) or Goblet squat instead of a barbell on your back.',m:'See Hack squat / Goblet squat demos for form.',x:'Loading a barbell on the back when the lower back is symptomatic.',w:'Low back: skip barbell back squats while the back is irritable. Use Hack squat (machine) or Goblet squat instead — both keep the torso more upright and unload the spine.'},
 {n:['Romanian deadlift','RDL'],img:'Romanian_Deadlift',s:'Stand holding bar/DBs at hips, soft knees, shoulder blades back, brace.',m:'Push hips back, slide weight down the thighs until you feel hamstrings (usually mid-shin), then drive hips forward.',x:'Rounding the back; turning it into a squat; bar drifting away from the legs.',w:'Low back pain: stop the descent the moment your back wants to round; go lighter and shorter range; DBs are often easier to keep close.'},
 {n:['Leg press'],img:'Leg_Press',s:'Back and hips flat on the pad, feet shoulder-width mid-platform.',m:'Lower until knees ~90° (or before your hips tuck under), press through whole foot, don\'t lock knees hard.',x:'Going so deep your tailbone lifts off the pad; locking out knees; pushing through toes.',w:'Low back: the depth where your pelvis starts to curl up is your limit — stop just before it.'},
 {n:['Seated leg curl'],img:'Seated_Leg_Curl',s:'Seat adjusted so the pad sits on the lower Achilles, knees lined up with the pivot.',m:'Curl heels under the seat, squeeze hamstrings, lower slowly.',x:'Hips lifting; using momentum; incomplete range.',w:'Low back: keep hips planted; don\'t yank.'},
 {n:['Lying leg curl','Leg curl'],img:'Lying_Leg_Curls',s:'Lie face down, pad just above heels, knees just off the bench edge, hold handles.',m:'Curl heels toward glutes, squeeze, lower slowly.',x:'Hips lifting off the pad; jerking; half reps.',w:'Press hips gently into the pad to avoid arching the lower back.'},
 {n:['Standing calf raise','Calf raise'],img:'Standing_Calf_Raises',s:'Balls of feet on the step, heels hanging, knees straight but not locked.',m:'Rise as high as possible, pause 1 s, lower slowly into a deep stretch.',x:'Bouncing; bending knees; tiny range of motion.',w:''},
 {n:['Dead bug'],img:'Dead_Bug',s:'On your back, arms to the ceiling, hips & knees at 90°, low back gently pressed down.',m:'Slowly extend opposite arm and leg toward the floor while exhaling, keep low back down, return and switch.',x:'Low back arching off the floor; rushing; holding breath.',w:'Back-friendly core exercise. If reaching overhead bothers the left shoulder, keep arms pointing at the ceiling and move legs only.'},
 {n:['Pull-ups / assisted','Pull-ups','Pull-up','Assisted pull-up','Chin-up'],img:'Band_Assisted_Pull-Up',approx:'Band-assisted pull-up shown (assisted machine works too)',s:'Grip the bar (neutral handles if available), band or assist machine as needed, start from a controlled hang with shoulders engaged.',m:'Pull elbows down to your ribs, chest toward the bar, lower slowly.',x:'Kipping; half reps; shrugging into the ears at the bottom.',w:'Shoulder/elbow: neutral grip is friendliest; don\'t dead-hang if it hurts — start with shoulders slightly pulled down. Use assistance to keep reps clean.'},
 {n:['Seated cable row','Cable row'],img:'Seated_Cable_Rows',s:'Feet on platform, knees soft, neutral spine, V-handle.',m:'Pull handle to lower ribs, elbows close, squeeze shoulder blades, return with control keeping torso still.',x:'Rocking back and forth; rounding the lower back to reach; shrugging.',w:'Low back: keep the torso upright and still — move only the arms and shoulder blades.'},
 {n:['Machine chest press','Chest press'],img:'Leverage_Chest_Press',approx:'Leverage chest-press machine shown',s:'Seat so handles are at mid-chest, neutral handles if available, shoulder blades back.',m:'Press forward without locking hard, return slowly to a comfortable stretch.',x:'Seat too low (handles high); elbows flared; shoulders rolling forward.',w:'PRESS: rate pain. Limit the back range (don\'t let hands go behind your chest line) for the left shoulder; keep right elbow soft at lockout.'},
 {n:['Landmine press'],img:'Landmine_Linear_Jammer',approx:'Closest match: two-hand landmine press (jammer) — do it one arm at a time, slow, no jump',s:'Bar end in a landmine, hold the end at shoulder with one hand, staggered stance or half-kneeling, brace.',m:'Press up and forward along the bar\'s arc, reach slightly at the top, lower under control.',x:'Leaning back; arching the lower back; shrugging.',w:'PRESS: the angled path is usually kinder than overhead. Left shoulder: stop short of full reach if it pinches. Half-kneeling protects the low back.'},
 {n:['Rear delt fly','Reverse fly'],img:'Cable_Rear_Delt_Fly',approx:'Cable rear-delt fly shown (reverse pec-deck works too)',s:'Cables crossed at shoulder height (or pec-deck facing the pad), slight elbow bend.',m:'Open arms out and back in a wide arc, squeeze upper back, return slowly.',x:'Using momentum; bending elbows to turn it into a row; shrugging.',w:'Light and controlled — great for posture.'},
 {n:['Cable curl','Biceps cable curl'],img:'Standing_Biceps_Cable_Curl',s:'Low pulley, straight or EZ bar, elbows by your sides.',m:'Curl up without moving the elbows, squeeze, lower fully and slowly.',x:'Leaning back; elbows moving forward; letting the stack slam.',w:'Right elbow: an EZ/rope handle may feel better than a straight bar; avoid snapping into lockout.'},
 {n:['Rope pushdown','Triceps pushdown'],img:'Triceps_Pushdown_-_Rope_Attachment',s:'High pulley, rope, elbows pinned to your sides, slight forward lean.',m:'Push down and spread the rope at the bottom, return slowly to ~90°.',x:'Elbows flaring; leaning over the rope; using body weight.',w:'Right elbow bursitis: PRESS-marked for pain. Keep it light, stop before painful lockout; skip if pain >3.'},
 {n:['Cable crunch','Kneeling cable crunch','Rope crunch'],img:'Cable_Crunch',approx:'Kneeling cable crunch shown — hanging knee raise is a fine swap on upper days',s:'High pulley, rope, kneel facing the stack, hands by temples, hips locked.',m:'Crunch ribs toward hips (not hips toward floor), pause, return slowly without yanking.',x:'Pulling with the arms; hinging at the hips; using momentum; going too heavy.',w:'Low back: stop immediately if pain increases. On a flare day skip loaded flexion — swap for Dead bug or Side plank. Keep the range small and controlled.'},
 {n:['Trap bar deadlift','Hex bar deadlift'],img:'Trap_Bar_Deadlift',s:'Stand in the centre, feet hip-width, grip handles, hips down, chest up, brace hard.',m:'Push the floor away, stand tall squeezing glutes, lower by sitting hips back.',x:'Rounding the back; hips shooting up first; leaning back at the top.',w:'Low back: trap bar is the back-friendliest deadlift. Use high handles if needed and stop sets before form breaks.'},
 {n:['Bulgarian split squat','Split squat'],img:'One_Leg_Barbell_Squat',approx:'Barbell version shown — dumbbells at your sides are easier on shoulders & back',s:'Rear foot on a bench, front foot far enough forward that the knee stays over mid-foot.',m:'Lower straight down until the back knee nearly touches, drive up through the front heel.',x:'Front foot too close; torso collapsing; knee caving inward.',w:'Hold DBs (or nothing) instead of a barbell to spare the left shoulder. A slight forward lean is fine — keep spine neutral.'},
 {n:['Hip thrust'],img:'Barbell_Hip_Thrust',s:'Upper back on bench edge, bar (padded) over hips, feet flat, shins vertical at the top.',m:'Drive through heels, lift hips until body is flat, chin tucked, squeeze glutes 1 s, lower.',x:'Arching the lower back at the top; feet too far/close; pushing through toes.',w:'Low back: finish with glutes, not by arching — ribs down, tuck pelvis slightly at the top.'},
 {n:['Leg extension'],img:'Leg_Extensions',s:'Knee joint lined up with the machine pivot, pad on lower shin.',m:'Extend to straight, squeeze quads, lower slowly.',x:'Swinging; lifting hips; letting the stack drop.',w:''},
 {n:['Seated calf raise'],img:'Seated_Calf_Raise',s:'Pad snug on lower thighs, balls of feet on the platform.',m:'Lower heels deep, then press up high, pause at top.',x:'Bouncing; short range.',w:''},
 {n:['Hanging knee raise','Knee raise','Captain\'s chair knee raise'],img:'Knee_Hip_Raise_On_Parallel_Bars',approx:'Captain\'s-chair knee raise shown — kinder than hanging for shoulders & back',s:'Forearms on the pads (or hang from a bar), back against the pad, brace.',m:'Curl knees up toward chest by tilting the pelvis, lower slowly without swinging.',x:'Swinging; just lifting thighs without curling the pelvis; arching the back.',w:'Left shoulder / elbow: the captain\'s chair or lying reverse crunch is safer than dead-hanging. Low back: keep the back pressed into the pad.'},
 {n:['Single-arm DB row','One-arm dumbbell row','Single arm DB row'],img:'One-Arm_Dumbbell_Row',s:'Hand and knee on a bench, flat back, dumbbell hanging under the shoulder.',m:'Row the dumbbell toward your hip, elbow close, pause, lower to full stretch.',x:'Rotating the torso; shrugging; rounding the back.',w:'Supported position protects the low back. Right elbow: use straps if gripping aggravates it.'},
 {n:['Straight-arm pulldown','Straight arm pulldown'],img:'Straight-Arm_Pulldown',s:'High pulley, bar or rope, step back, hinge slightly, arms straight with soft elbows.',m:'Sweep the bar down to your thighs using the lats, return slowly to about eye level.',x:'Bending elbows (turns into a pushdown); letting it pull you too high.',w:'Left shoulder: don\'t let arms travel above head height at the top.'},
 {n:['Intervals','Cardio intervals','Bike intervals'],img:'Bicycling_Stationary',approx:'Stationary bike shown — rower, bike or incline walk all work',s:'Warm up 3–5 min easy.',m:'e.g. 30–60 s hard / 60–90 s easy × 8–10, then cool down.',x:'Going all-out on every interval so quality drops; skipping the warm-up.',w:'Rower loads the low back and shoulders — bike or incline walking is safer on bad days.'},
 {n:['Band pull-aparts','Band pull-apart','Band pull apart'],img:'Band_Pull_Apart',s:'Light band, arms straight at chest height, shoulder-width grip.',m:'Pull the band apart by squeezing shoulder blades together, pause, return slowly.',x:'Shrugging; bending elbows; arching the back.',w:'Keep at chest height (not overhead) for the left shoulder; light band.'},
 {n:['Cat-cow','Cat cow'],img:'Cat_Stretch',approx:'"Cat" (rounded) and neutral positions shown — add a gentle arch for "cow"',s:'Hands under shoulders, knees under hips.',m:'Exhale and round the spine up (cat), inhale and gently let the belly drop and chest open (cow). Slow and segmental.',x:'Forcing the arch; rushing.',w:'Low back: keep the "cow" arch gentle and pain-free.'},
 {n:['Kneeling hip flexor stretch','Hip flexor stretch'],img:'Kneeling_Hip_Flexor',s:'Half-kneel with a pad under the back knee, torso tall.',m:'Tuck the pelvis (squeeze the back-leg glute), then shift forward slightly until you feel the front of the hip.',x:'Arching the lower back instead of tucking; lunging too far.',w:'Tight hip flexors often feed lower back pain — the pelvic tuck is the key.'},
 {n:['Child\'s pose','Childs pose'],img:'Childs_Pose',s:'Kneel, big toes together, knees wide.',m:'Sit hips back toward heels, arms forward or by your sides, breathe slowly into your back.',x:'Forcing hips down; holding breath.',w:'Left shoulder: rest arms by your sides instead of overhead if reaching forward hurts.'},
 {n:['Glute bridge','Glute bridge march'],img:'Butt_Lift_Bridge',approx:'Two-leg glute bridge shown — for a march, hold the top and slowly lift one foot a few cm then switch',s:'On your back, knees bent, feet flat hip-width, arms by sides.',m:'Drive through heels, lift hips until knees-hips-shoulders line up, squeeze glutes, lower slowly.',x:'Arching the lower back; pushing through toes; hamstrings cramping (feet too far).',w:'Low back: ribs down, lift with glutes, stop before the back arches.'},
 {n:['Side plank (knees)','Side plank','Side bridge'],img:'Side_Bridge',approx:'Side bridge shown — bend knees for the easier version',s:'Lie on your side, elbow directly under shoulder, knees bent (easier) or legs straight.',m:'Lift hips so the body forms a straight line, hold, breathe.',x:'Hips sagging or piking; elbow not under shoulder; shrugging.',w:'Left shoulder bursitis: if lying on the left elbow hurts, do that side against a wall/bench (standing incline) or skip it.'},
 {n:['Bodyweight squats','Bodyweight squat','Air squat'],img:'Bodyweight_Squat',s:'Feet shoulder-width, toes slightly out, arms forward for balance.',m:'Sit down between the heels, chest up, stand up through mid-foot.',x:'Heels lifting; knees caving; rounding.',w:'Warm-up pace — pain-free depth only.'},
 // ---- inline SVG diagrams ----
 {n:['Chin tucks','Chin tuck'],svg:'chin',s:'Sit or stand tall, eyes level, shoulders relaxed.',m:'Glide the head straight back ("double chin") as if on a shelf, hold 2 s, release.',x:'Nodding down; tilting the head up; pushing too hard.',w:'Should feel like a stretch at the base of the skull — never pain or tingling.'},
 {n:['Wall angels','Wall angel'],svg:'angel',s:'Back against the wall, feet ~15 cm out, head, upper back and tailbone touching, arms in a "W".',m:'Slide arms up the wall toward a "Y" only as far as you can keep contact and stay pain-free, slide back down.',x:'Arching the lower back off the wall; forcing arms up; shrugging.',w:'Left shoulder bursitis: stay in the pain-free range — even a small slide counts. Ribs down to protect the low back.'},
 {n:['Doorway pec stretch','Pec stretch'],svg:'door',s:'Stand in a doorway, forearms on the frame with elbows BELOW shoulder height.',m:'Step one foot through and lean gently until you feel a stretch across the chest, breathe.',x:'Elbows above shoulders; leaning too hard; arching the back.',w:'Bursitis: elbows low, gentle stretch only — stop if the left shoulder or right elbow aches. One arm at a time is fine.'},
 {n:['Thoracic extension on foam roller','Thoracic extension','Foam roller thoracic extension'],svg:'roller',s:'Sit with a foam roller across the upper back (below shoulder blades), hands supporting the head, hips on the floor.',m:'Gently extend back over the roller, pause, return; shift up a few cm and repeat.',x:'Rolling onto the lower back; arching from the low back; pulling on the neck.',w:'Keep ribs down and stay on the upper back only — never extend over the lower back.'},
 {n:['Open books','Open book'],svg:'book',s:'Lie on your side, hips & knees bent 90°, arms straight out in front, palms together.',m:'Open the top arm like a book, rotating through the upper back and following your hand with your eyes, return slowly.',x:'Knees lifting apart; forcing the arm to the floor.',w:'Left shoulder: keep the arm lower (below shoulder level) or bend the elbow; pain-free range only.'},
 {n:['90/90 hip flow','90/90','90 90 hip switch'],svg:'ninety',s:'Sit with both knees bent ~90°, feet wide, hands behind you for support.',m:'Rotate both knees side to side, keeping the chest tall; pause in each position.',x:'Slumping; forcing the knees to the floor.',w:'Use hands for support to keep the low back comfortable.'},
 {n:['Bird dog'],svg:'birddog',s:'Hands under shoulders, knees under hips, neutral spine, brace.',m:'Reach opposite arm and leg long without the hips rotating, hold 2 s, return and switch.',x:'Arching the lower back; hips tipping; lifting the leg too high.',w:'Left shoulder: if lifting the arm hurts, do legs only. Low back: keep the spine neutral — think "long", not "high".'},
 {n:['McGill curl-up','Curl-up'],svg:'curlup',s:'Lie on your back, one knee bent, the other leg straight, hands under the natural arch of the low back.',m:'Brace and lift head & shoulders slightly off the floor as one unit (no neck bend), hold 10 s, lower.',x:'Flattening the low back; tucking the chin; crunching high.',w:'Designed for sensitive backs — keep the lift small.'},
 {n:['Scap push-ups (light)','Scap push-ups','Scap push-up'],svg:'scap',s:'Hands on a wall or bench, arms straight, body in a line.',m:'Keeping elbows straight, let the chest sink so the shoulder blades squeeze together, then push the floor/wall away to spread them.',x:'Bending the elbows; sagging hips; shrugging.',w:'Left shoulder / right elbow: wall version, pain-free only.'}
];
const nKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const DEMO_IDX={};DEMOS.forEach(d=>d.n.forEach(a=>DEMO_IDX[nKey(a)]=d));
function findDemo(name){const k=nKey(name);if(DEMO_IDX[k])return DEMO_IDX[k];
 const k2=nKey(String(name).replace(/\(.*?\)/g,''));return DEMO_IDX[k2]||null;}
// stick-figure diagrams: each frame = joints; props drawn under figure
function fig(j,col){const L=(a,b,c)=>j[a]&&j[b]?`<line x1="${j[a][0]}" y1="${j[a][1]}" x2="${j[b][0]}" y2="${j[b][1]}" stroke="${c||col}" stroke-width="6" stroke-linecap="round"/>`:'';
 const far='#7c8599';let s='';
 if(j.shl){j.sl=j.shl;j.sr=j.shr;}else{j.sl=j.neck;j.sr=j.neck;}
 s+=L('sr','er',far)+L('er','hr',far)+L('hip','kr',far)+L('kr','fr',far);if(j.shl)s+=L('shl','shr');
 s+=j.mid?L('neck','mid')+L('mid','hip'):L('neck','hip');
 s+=L('hip','kl')+L('kl','fl')+L('sl','el')+L('el','hl');
 if(j.head)s+=`<circle cx="${j.head[0]}" cy="${j.head[1]}" r="10" fill="${col}"/>`;return s;}
const DIAG={
 chin:{props:'<line x1="10" y1="136" x2="190" y2="136" stroke="#555" stroke-width="3"/>',
  f:[{head:[116,34],neck:[102,54],hip:[100,96],kl:[100,118],fl:[100,134],kr:[96,118],fr:[96,134],el:[100,76],hl:[104,96],er:[98,76],hr:[100,96]},
     {head:[101,32],neck:[100,54],hip:[100,96],kl:[100,118],fl:[100,134],kr:[96,118],fr:[96,134],el:[100,76],hl:[104,96],er:[98,76],hr:[100,96]}],
  lab:['Head forward','Chin tucked back']},
 angel:{props:'<rect x="20" y="6" width="160" height="128" fill="#2a2f3a"/><line x1="10" y1="136" x2="190" y2="136" stroke="#555" stroke-width="3"/>',
  f:[{head:[100,30],neck:[100,48],shl:[86,50],shr:[114,50],hip:[100,92],kl:[90,114],fl:[86,134],kr:[110,114],fr:[114,134],el:[64,52],hl:[62,28],er:[136,52],hr:[138,28]},
     {head:[100,30],neck:[100,48],shl:[86,50],shr:[114,50],hip:[100,92],kl:[90,114],fl:[86,134],kr:[110,114],fr:[114,134],el:[72,30],hl:[78,8],er:[128,30],hr:[122,8]}],
  lab:['"W" — elbows at shoulder height','Slide up (pain-free range)']},
 door:{props:'<rect x="66" y="4" width="8" height="132" fill="#6b5b45"/><line x1="10" y1="136" x2="190" y2="136" stroke="#555" stroke-width="3"/>',
  f:[{head:[104,26],neck:[100,44],hip:[100,90],kl:[100,112],fl:[100,134],kr:[96,112],fr:[94,134],el:[76,58],hl:[74,36],er:[80,60],hr:[76,40]},
     {head:[118,28],neck:[112,46],hip:[108,90],kl:[126,110],fl:[128,134],kr:[98,112],fr:[90,134],el:[76,58],hl:[74,36],er:[80,60],hr:[76,40]}],
  lab:['Forearm on frame, elbow below shoulder','Step through gently']},
 roller:{props:'<line x1="10" y1="128" x2="190" y2="128" stroke="#555" stroke-width="3"/><circle cx="92" cy="112" r="14" fill="#3b82f6" opacity=".8"/>',
  f:[{head:[70,86],neck:[84,96],hip:[134,120],kl:[156,96],fl:[172,122],kr:[152,98],fr:[166,122],el:[80,74],hl:[68,80],er:[84,76],hr:[70,82]},
     {head:[64,104],neck:[80,100],hip:[134,120],kl:[156,96],fl:[172,122],kr:[152,98],fr:[166,122],el:[70,84],hl:[60,96],er:[74,86],hr:[62,98]}],
  lab:['Roller under upper back','Extend over it — ribs down']},
 book:{props:'<line x1="10" y1="124" x2="190" y2="124" stroke="#555" stroke-width="3"/>',
  f:[{head:[46,104],neck:[62,108],hip:[118,112],kl:[140,92],fl:[160,108],kr:[142,96],fr:[162,112],el:[84,92],hl:[104,86],er:[84,98],hr:[104,92]},
     {head:[46,104],neck:[62,108],hip:[118,112],kl:[140,92],fl:[160,108],kr:[142,96],fr:[162,112],el:[56,84],hl:[36,74],er:[84,98],hr:[104,92]}],
  lab:['Side-lying, arms together','Open top arm — rotate upper back']},
 ninety:{props:'<line x1="10" y1="130" x2="190" y2="130" stroke="#555" stroke-width="3"/>',
  f:[{head:[100,24],neck:[100,42],shl:[86,44],shr:[114,44],hip:[100,108],kl:[62,112],fl:[70,128],kr:[132,122],fr:[160,112],el:[80,74],hl:[78,108],er:[120,74],hr:[122,108]},
     {head:[100,24],neck:[100,42],shl:[86,44],shr:[114,44],hip:[100,108],kl:[138,112],fl:[130,128],kr:[68,122],fr:[40,112],el:[80,74],hl:[78,108],er:[120,74],hr:[122,108]}],
  lab:['Knees to one side','Rotate to the other side']},
 birddog:{props:'<line x1="10" y1="124" x2="190" y2="124" stroke="#555" stroke-width="3"/>',
  f:[{head:[58,70],neck:[72,80],hip:[134,82],kl:[134,122],fl:[168,122],kr:[130,122],fr:[164,122],el:[72,102],hl:[72,122],er:[76,102],hr:[76,122]},
     {head:[58,70],neck:[72,80],hip:[134,82],kl:[164,80],fl:[192,82],kr:[130,122],fr:[164,122],el:[48,76],hl:[26,72],er:[76,102],hr:[76,122]}],
  lab:['All fours, neutral spine','Opposite arm & leg long']},
 curlup:{props:'<line x1="10" y1="124" x2="190" y2="124" stroke="#555" stroke-width="3"/>',
  f:[{head:[38,112],neck:[54,116],hip:[112,118],kl:[138,94],fl:[152,120],kr:[140,118],fr:[178,120],el:[80,122],hl:[104,120],er:[82,124],hr:[106,122]},
     {head:[44,100],neck:[58,108],hip:[112,118],kl:[138,94],fl:[152,120],kr:[140,118],fr:[178,120],el:[82,120],hl:[104,120],er:[84,122],hr:[106,122]}],
  lab:['Hands under low back, one knee bent','Lift head & shoulders slightly — hold 10 s']},
 scap:{props:'<rect x="26" y="4" width="8" height="132" fill="#2a2f3a"/><line x1="10" y1="136" x2="190" y2="136" stroke="#555" stroke-width="3"/>',
  f:[{head:[60,40],neck:[72,54],mid:[98,82],hip:[118,96],kl:[132,116],fl:[146,134],kr:[128,116],fr:[142,134],el:[52,56],hl:[36,58],er:[54,58],hr:[36,60]},
     {head:[56,34],neck:[70,50],mid:[98,74],hip:[118,96],kl:[132,116],fl:[146,134],kr:[128,116],fr:[142,134],el:[52,54],hl:[36,58],er:[54,56],hr:[36,60]}],
  lab:['Chest sinks, blades squeeze','Push away, blades spread']},
 goblet:{props:'<line x1="10" y1="136" x2="190" y2="136" stroke="#555" stroke-width="3"/><circle cx="100" cy="52" r="9" fill="#4ade80" opacity=".5"/>',
  f:[{head:[100,22],neck:[100,40],shl:[86,42],shr:[114,42],hip:[100,88],kl:[86,110],fl:[80,134],kr:[114,110],fr:[120,134],el:[90,58],hl:[100,52],er:[110,58],hr:[100,52]},
     {head:[100,34],neck:[100,52],shl:[86,54],shr:[114,54],hip:[100,100],kl:[78,112],fl:[72,134],kr:[122,112],fr:[128,134],el:[90,70],hl:[100,64],er:[110,70],hr:[100,64]}],
  lab:['DB/KB at chest, upright','Sit between heels — torso tall']}
};
function diagSvg(k){const d=DIAG[k];if(!d)return '';
 return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${k} diagram"><rect width="200" height="140" fill="#161a21"/>${d.props}
  <g class="f0">${fig(d.f[0],'#4ade80')}</g><g class="f1">${fig(d.f[1],'#4ade80')}</g></svg>`;}
function demoModal(name){const d=findDemo(name),k=nKey(name),mine=(S.cues||{})[k]||'';
 const yt='https://www.youtube.com/results?search_query='+encodeURIComponent(name+' exercise form');
 let media='';
 if(d&&d.img)media=`<div class="demo" data-a="demoPause"><img class="f0" src="img/${d.img}-0.jpg" alt="${esc(name)} start" onerror="this.parentNode.classList.add('noimg')"><img class="f1" src="img/${d.img}-1.jpg" alt="${esc(name)} end" onerror="this.parentNode.classList.add('noimg')"><span class="lab f0">Start</span><span class="lab f1">End</span><span class="off">Image unavailable offline — cues below</span></div>`;
 else if(d&&d.svg)media=`<div class="demo svg" data-a="demoPause">${diagSvg(d.svg)}<span class="lab f0">${esc(DIAG[d.svg].lab[0])}</span><span class="lab f1">${esc(DIAG[d.svg].lab[1])}</span></div>`;
 let h=`<div class="hrow"><h2 style="margin:0">${esc(name)}</h2><button class="btn sm" data-a="closeModal">Close</button></div>`;
 if(d){h+=media+`<div class="muted" style="font-size:12px;margin:4px 0">${d.img?'Photos: free-exercise-db (public domain / Unlicense)':'Diagram'} · tap image to pause${d.approx?`<br>ℹ️ ${esc(d.approx)}`:''}</div>
  <div class="cueb"><b>Setup</b><div>${esc(d.s)}</div></div><div class="cueb"><b>Movement</b><div>${esc(d.m)}</div></div><div class="cueb"><b>Common mistakes</b><div>${esc(d.x)}</div></div>
  ${d.w?`<div class="hint warn" style="font-weight:500">⚠ <b>Safety</b> — ${esc(d.w)}</div>`:''}`;}
 else h+=`<div class="muted" style="margin:8px 0">No built-in demo for this exercise. Add your own cues below (also editable in Settings).</div>`;
 h+=`<label class="lbl">My cues</label><textarea data-f="cue" data-n="${esc(k)}" data-nofocus="1" rows="2" placeholder="e.g. seat height 4, pin 7, neutral grip">${esc(mine)}</textarea>
  <a class="btn wide" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="${yt}" target="_blank" rel="noopener">▶ Search YouTube for “${esc(name)}”</a>`;
 modal(h);}
function cueList(){const seen=new Set(),list=[];const add=n=>{const k=nKey(n);if(!n||seen.has(k))return;seen.add(k);if(!findDemo(n))list.push(n);};
 S.plan.forEach(p=>p.exercises.forEach(e=>add(e.name)));S.routines.forEach(r=>r.items.forEach(i=>add(i.name)));S.sessions.forEach(x=>x.exercises.forEach(e=>add(e.name)));
 if(!list.length)return '<div class="card muted">Every exercise in your plan and routines has a built-in demo.</div>';
 return '<div class="card">'+list.map(n=>`<label class="lbl">${esc(n)} · <a style="color:var(--bl)" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(n+' exercise form')}">YouTube ↗</a></label><textarea data-f="cue" data-n="${esc(nKey(n))}" rows="2" placeholder="Your cues for ${esc(n)}">${esc(S.cues[nKey(n)]||'')}</textarea>`).join('')+'</div>';}

// ---- MEALS (Youfoodz plan + daily log + barcode) ----
const MEAL_TARGETS={kcal:2450,protein:180,carbs:250,fat:70};
const GOAL_MODES=[
 {id:'cut',label:'Lose weight',mult:0.85,hint:'15% under'},
 {id:'recomp',label:'Build & lose',mult:0.95,hint:'5% under'},
 {id:'maintain',label:'Maintain',mult:1,hint:'Evolt need'},
 {id:'build',label:'Build muscle',mult:1.1,hint:'10% over'},
 {id:'bulk',label:'Bulk',mult:1.18,hint:'18% over'}
];
function goalMode(id){return GOAL_MODES.find(m=>m.id===id)||GOAL_MODES.find(m=>m.id==='maintain');}
function latestEnergyScan(){return sortedScans().filter(x=>(x.tee>=800)||(x.bmr>=800)).pop()||null;}
function profileKg(extra){
 const rows=[];
 (S.body||[]).forEach(b=>{if(b&&b.kg>=40)rows.push({date:b.date||'',kg:b.kg});});
 (S.scans||[]).forEach(sc=>{if(sc&&sc.weight>=40)rows.push({date:sc.date||'',kg:sc.weight});});
 if(extra&&extra.weight>=40)rows.push({date:extra.date||'',kg:extra.weight});
 rows.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
 return rows.length?rows[rows.length-1].kg:95;
}
function ageYears(dateKey){
 const d=dateKey||todayKey(),p=d.split('-').map(Number),y=p[0],m=p[1],day=p[2];
 let age=y-1988; if(m<11||(m===11&&day<16))age--; return Math.max(18,age);
}
function mifflin(kg,dateKey){return 10*kg+6.25*186-5*ageYears(dateKey)+5;}
function kcalForGoal(mode,extra){
 const kg=profileKg(extra),base=Math.round(mifflin(kg,todayKey())*1.55/10)*10,m=goalMode(mode);
 let kcal=Math.round(base*m.mult/10)*10;
 const floor=Math.round(mifflin(kg,todayKey())/10)*10;
 if(kcal<floor)kcal=floor;
 const w=Math.round(kg*10)/10;
 return {kcal,mode:m.id,label:m.label,note:m.label+' · '+w+' kg · 186 cm · gym 4–5 days'};
}
function writeGoal(mode){ensureMeals();const got=kcalForGoal(mode);if(!got)return null;
 const t=S.meals.targets;t.goal=got.mode;t.kcal=got.kcal;t.kcalNote=got.note;t.kcalManual=false;return got;}
function goalPicker(){ensureMeals();const cur=S.meals.targets.goal||'maintain';
 return `<div class="goals">${GOAL_MODES.map(m=>{const got=kcalForGoal(m.id);return `<button type="button" class="btn ${cur===m.id?'on':''}" data-a="goal" data-v="${m.id}"><b>${m.label}</b><small>${got.kcal} kcal</small></button>`;}).join('')}</div>`;}
function evoltKcalOf(sc){return kcalForGoal((S.meals&&S.meals.targets&&S.meals.targets.goal)||'maintain',sc);}
/* S.meals.delivery shape (refresh each weekly Youfoodz order):
 * {
 *   week: '2026-W40', status: 'Delivered',
 *   date: '2026-09-30', area: 'Cecil Park 2178',
 *   items: [{ id, name, kcal, protein, carbs?, fat?,
 *     flag?, allergens?, ingredients?, note?, url?,
 *     damaged?, status?,  // damaged items not tickable
 *     eaten: false, eatenOn?: 'YYYY-MM-DD'  // tick → macros on that day (selected/today)
 *   }]
 * }
 * Youfoodz are NOT assigned to plan days — tick logs macros to the selected Meals day.
 * Home plan days are flexible suggestions only.
 */
const YF_BASE='https://www.youfoodz.com/my-deliveries/2026-W40';
const YF_ITEMS=[
 {id:'yf-butter',name:'Butter Chicken — with Naan & Brown Rice',kcal:871,protein:40.9,carbs:90.7,fat:36.4,
  allergens:'milk, gluten, wheat',
  ingredients:'brown rice (32%), coconut cream (22%), chicken (21%), naan bread (8%), water, sweet chilli sauce, marinade, garlic, milk powder, tomato paste, vegetable booster, curry powder, sweet paprika, modified starch, butter, vinegar powder, cumin, coriander, vinegar/cultured sugar',
  note:'Mildly spiced creamy tomato-coconut sauce with naan and brown rice.',
  flag:'Contains tomato paste',
  url:YF_BASE+'?recipeId=6a0ff42edea7c5717bde6735&week=2026-W40'},
 {id:'yf-portuguese',name:'Portuguese Chicken & Rice — with Paprika & Turmeric Spice',kcal:718,protein:44.9,carbs:86.5,fat:19.9,
  allergens:'milk, sulphites',
  ingredients:'basmati rice (36%), chicken (28%), thickened cream, corn, tomato sauce, sweet chilli, sriracha, brown sugar, canola oil, chicken booster, smoked paprika, garlic, lemon/lime juice, Cajun, vinegar, Dijon, turmeric, sweet paprika, thyme',
  note:'Paprika & turmeric spiced chicken with rice.',
  flag:'Contains tomato sauce',
  url:YF_BASE+'?recipeId=6a0ffe34dea7c5717bde673a&week=2026-W40'},
 {id:'yf-bolognese',name:'Spaghetti Bolognese — with Classic Beef Ragu',kcal:626,protein:40.7,carbs:76.9,fat:15.7,
  allergens:'gluten, wheat, milk (may contain)',
  ingredients:'spaghetti, beef ragu (crushed tomato, tomato paste, beef mince, onion, garlic, herbs), cheese',
  note:'Classic beef ragu — tomato-heavy.',
  flag:'Tomato-heavy (crushed tomato, tomato paste)',
  url:YF_BASE+'?recipeId=6a100129dea7c5717bde673c&week=2026-W40'},
 {id:'yf-lasagne',name:'Beef Lasagne',kcal:701,protein:43.2,carbs:36.4,fat:41.6,
  allergens:'milk, gluten, wheat, egg',
  ingredients:'pasta sheets, beef mince, tomato sauce/paste, béchamel, cheese',
  note:'Tomato-heavy lasagne. Parcel arrived damaged — Youfoodz issuing credit.',
  flag:'Tomato-heavy',
  damaged:true,status:'Damaged · credit',
  url:YF_BASE+'?recipeId=6a1001d0dea7c5717bde673d&week=2026-W40'},
 {id:'yf-shawarma',name:'Lebanese Chicken Shawarma — with Roast Potatoes & Spicy Sour Cream',kcal:584,protein:50,carbs:42.7,fat:21.5,
  allergens:'milk',
  ingredients:'chicken shawarma, roast potatoes, spicy sour cream, spices',
  note:'Roast potatoes (not mash). Already eaten Wed 30 Sep.',
  url:YF_BASE+'?recipeId=6a6942bcbafbcbc27ebbbc82&week=2026-W40',
  eaten:true,eatenOn:'2026-09-30',slot:'lunch'},
 {id:'yf-carbonara',name:'Chicken Carbonara — with Ham & Mushrooms',kcal:542,protein:41,carbs:54.4,fat:16.2,
  allergens:'milk, gluten, wheat, egg',
  ingredients:'pasta, chicken, ham, mushrooms, creamy carbonara sauce',
  note:'Contains pork (ham).',
  flag:'Contains pork (ham)',
  url:YF_BASE+'?recipeId=6a0ff25bdea7c5717bde6733&week=2026-W40'}
];
/* Upcoming W41 (Wed 7 Oct) — not primary UI; Monday sync / next delivery will replace. See MEAL-PLAN-W41.md */
const YF_W41_NOTE='Next delivery Wed 7 Oct 2026 (W41) — app will switch on sync; data kept in MEAL-PLAN-W41.md';

function mkPlanItem(id,name,slot,kcal,protein,carbs,source,extra){
 const o={id,name,slot,kcal,protein,carbs:carbs==null?null:carbs,source:source||'home',eaten:false};
 if(extra)Object.keys(extra).forEach(k=>o[k]=extra[k]);
 return o;
}
function R(ingredients,method,allergens,note){
 return {ingredients:ingredients||'',method:method||'',allergens:allergens||'',note:note||''};
}

/* Quick-add favourites (seeded into S.meals.library + S.meals.favourites). Macros = one labelled serve. */
const MEAL_FAVOURITES=[
 {id:'fav-wpi-banana',
  name:'International Protein Amino Charged WPI — Banana Ice Cream',
  short:'WPI Banana',
  label:'Amino Charged WPI · Banana',
  button:'+ Protein shake',
  serving:'40g (≈1⅓ scoops)',
  kcal:152,protein:35.3,carbs:1.4,fat:0.3,sodium:138,
  note:'Whey protein isolate. Mix with water or milk. Values from product nutrition label (per 40g serve).',
  allergens:'milk'},
 {id:'fav-maccas-mocha',
  name:"McDonald's McCafé Mocha — Large, full cream milk",
  short:'Large mocha',
  label:'Macca’s mocha · large',
  button:'+ Large mocha',
  serving:'1 large (full cream milk)',
  kcal:356,protein:12.9,carbs:46.4,fat:12,sodium:219,
  note:'McCafé Australia, large mocha with full cream milk (356 kcal / 1490 kJ). Skim or almond milk will be lower. Source: CalorieKing AU.',
  allergens:'milk'},
 {id:'fav-zombie-water',
  name:'Zombie Labs Protein Water — 1 scoop',
  short:'Protein water',
  label:'Zombie Labs · 1 scoop',
  button:'+ Protein water',
  serving:'15g (1 scoop) in 250–300 ml water',
  kcal:50,protein:11.3,carbs:2.2,fat:0,sodium:75,
  note:'Label per 15g scoop: 209 kJ, 11.3g protein, 2.2g carbs, 0g fat. Tap twice for 2 scoops (≈100 kcal, 22.6g protein).',
  allergens:'fish'}
];
function favById(id){return MEAL_FAVOURITES.find(x=>x.id===id)||null;}
function favToLibraryEntry(f){
 return {name:f.name,short:f.short||f.name,label:f.label||f.short||f.name,kcal:f.kcal,protein:f.protein,carbs:f.carbs,fat:f.fat,
  sodium:f.sodium!=null?f.sodium:null,serving:f.serving||'',note:f.note||'',allergens:f.allergens||'',
  barcode:f.id,favourite:true,source:'favourite'};
}

function defaultMeals(){
 const days={};
 // Plan week Mon 28 Sep – Sun 4 Oct (covers delivery Wed 30 until next Wed 7). Home suggestions only — Youfoodz are a separate checklist.
 // Mon 28 — Upper · late (pre-delivery)
 days['2026-09-28']={notes:'Upper A · work 12–9 · late dinner. Youfoodz delivery Wed.',items:[
  mkPlanItem('m28-bf','Oats 60g + high-pro milk + banana + whey','breakfast',520,42,55,'home',Object.assign({fat:12},R(
   'Rolled oats 60g, Pauls PLUS or similar 250ml, banana 1, whey scoop 1, honey optional',
   'Microwave oats with milk 2–3 min. Stir in whey off-heat. Top with sliced banana.',
   'milk','High-protein breakfast bowl.'))),
  mkPlanItem('m28-sn1','YoPRO yoghurt + honey','snack',220,27,22,'home',Object.assign({fat:3},R(
   'YoPRO tub 160–170g, honey 1 tsp','Eat cold. Drizzle honey.','milk',''))),
  mkPlanItem('m28-lu','Chicken wrap + cheese + salad veg (no tomato)','lunch',560,48,45,'home',Object.assign({fat:18},R(
   'Wholemeal wrap, cooked chicken breast 150g, cheese slice, lettuce, cucumber, mayo or hummus',
   'Warm wrap briefly. Fill with chicken, cheese, salad. No tomato.',
   'gluten, wheat, milk','Work-friendly packed lunch.'))),
  mkPlanItem('m28-sn2','Protein shake + 2 rice cakes + PB','snack',340,32,28,'home',Object.assign({fat:12},R(
   'Whey 1 scoop + water/milk, rice cakes ×2, peanut butter 1 tbsp','Shake whey. Spread PB on rice cakes.','milk, peanuts',''))),
  mkPlanItem('m28-di','Eggs on toast (3) + cheese + spinach — easy post-9pm','dinner',580,38,40,'home',Object.assign({fat:28},R(
   'Eggs 3, bread 2 slices, cheese, baby spinach, butter or spray oil',
   'Toast bread. Scramble or fry eggs. Wilt spinach in pan. Cheese on toast or eggs.',
   'egg, gluten, wheat, milk','Quick late dinner.'))),
  mkPlanItem('m28-sw','Muscle Nation chocolate protein pudding','snack',160,25,8,'home',Object.assign({fat:3},R(
   '1 ready pudding cup','Eat cold from fridge.','milk',''))),
  mkPlanItem('m28-tr','Treat allowance (~180 kcal)','treat',180,2,18,'home',Object.assign({fat:8},R(
   'Dark chocolate / ice cream / chips ~180 kcal','Optional — skip if macros already high.','','')))
 ]};
 // Tue 29 — rest
 days['2026-09-29']={notes:'Rest day · work 8–6. Pre-delivery.',items:[
  mkPlanItem('m29-bf','3 eggs + 2 toast + avocado','breakfast',520,32,35,'home',Object.assign({fat:28},R(
   'Eggs 3, bread 2, avocado ½','Toast; fry/poach eggs; mash avocado on toast.','egg, gluten, wheat',''))),
  mkPlanItem('m29-sn1','Cottage cheese 200g + honey + berries','snack',280,28,20,'home',Object.assign({fat:6},R(
   'Cottage cheese 200g, honey 1 tsp, frozen berries handful','Bowl and eat.','milk',''))),
  mkPlanItem('m29-lu','Beef mince pasta, creamy mushroom sauce (no tomato)','lunch',650,48,55,'home',Object.assign({fat:22},R(
   'Lean beef mince 150g, pasta 80g dry, mushrooms, thickened cream or cream cheese, garlic, onion, spinach',
   'Cook pasta. Brown mince with onion/garlic/mushrooms. Stir in cream + spinach. No tomato sauce.',
   'gluten, wheat, milk','Avoid tomato-forward sauces.'))),
  mkPlanItem('m29-sn2','YoPRO + apple','snack',260,26,28,'home',Object.assign({fat:3},R('YoPRO + apple 1','','milk',''))),
  mkPlanItem('m29-di','Chicken thigh tray-bake + roast potato + broccoli','dinner',620,45,40,'home',Object.assign({fat:24},R(
   'Chicken thigh 2, potato 1 large (cubed), broccoli, olive oil, paprika, salt',
   'Oven 200°C ~35 min: oil + spice chicken and potato on tray; add broccoli last 15 min. Not mash.',
   '','Roast potato OK — no mash.'))),
  mkPlanItem('m29-sw','Greek yoghurt + honey + cacao','snack',200,18,18,'home',Object.assign({fat:4},R(
   'Greek yoghurt 150g, honey, cacao powder','Stir together.','milk',''))),
  mkPlanItem('m29-tr','Treat allowance (~170 kcal)','treat',170,1,20,'home',Object.assign({fat:8},R('~170 kcal treat','Optional','','')))
 ]};
 // Wed 30 — Lower · delivery (Shawarma already eaten — tick Youfoodz checklist; home suggestions fill the rest)
 days['2026-09-30']={notes:'Lower A · OFF · Youfoodz delivered today (Cecil Park). Shawarma already eaten — ticked on checklist. Pick other Youfoodz when you want them.',items:[
  mkPlanItem('m30-bf','Weet-Bix ×3 + high-pro milk + whey','breakfast',420,38,45,'home',Object.assign({fat:6},R(
   'Weet-Bix 3, high-pro milk 250ml, whey ½–1 scoop','Bowl + milk; shake whey separately or stir in.','gluten, wheat, milk',''))),
  mkPlanItem('m30-sn1','YoPRO yoghurt','snack',160,25,10,'home',Object.assign({fat:2},R('YoPRO tub','','milk',''))),
  mkPlanItem('m30-lu','Chicken sandwich (no tomato) + banana','lunch',480,35,45,'home',Object.assign({fat:12},R(
   'Bread 2, chicken 100–120g, cheese optional, lettuce/cucumber, banana 1',
   'Build sandwich without tomato. Banana on the side.',
   'gluten, wheat, milk',''))),
  mkPlanItem('m30-sn2','High-protein milk (250 ml)','snack',150,15,12,'home',Object.assign({fat:4},R('Pauls PLUS 250ml','Drink cold.','milk',''))),
  mkPlanItem('m30-sw','Protein pudding','snack',160,25,8,'home',Object.assign({fat:3},R('Muscle Nation or similar','','milk',''))),
  mkPlanItem('m30-di','Home dinner or Youfoodz from checklist (Butter Chicken etc.)','dinner',550,40,45,'home',Object.assign({fat:18},R(
   'If not using Youfoodz: chicken breast 150g, microwave rice, frozen veg, olive oil',
   'Cook chicken in pan; heat rice + veg. Or tick a Youfoodz meal on the checklist for tonight.',
   '','Flexible — Youfoodz macros count when you tick the checklist.'))),
  mkPlanItem('m30-tr','Treat allowance (~180 kcal)','treat',180,1,20,'home',Object.assign({fat:8},R('~180 kcal','Optional','','')))
 ]};
 // Thu 1 Oct — Upper late
 days['2026-10-01']={notes:'Upper B · work 12–9. Tick a Youfoodz after 9pm if you want an easy heat-up.',items:[
  mkPlanItem('m01-bf','Oats + whey + berries + honey','breakfast',450,35,50,'home',Object.assign({fat:8},R(
   'Oats 50g, whey, berries, honey, milk','Microwave oats; stir whey; top berries + honey.','milk',''))),
  mkPlanItem('m01-sn1','Cottage cheese + rice cakes','snack',250,22,18,'home',Object.assign({fat:5},R(
   'Cottage cheese 150g, rice cakes 2','','milk',''))),
  mkPlanItem('m01-lu','Chicken + microwave rice + frozen veg','lunch',520,42,50,'home',Object.assign({fat:10},R(
   'Chicken 150g, microwave rice cup, frozen veg mix','Cook chicken; heat rice + veg. Season soy/garlic — no tomato sauce.','',''))),
  mkPlanItem('m01-sn2','YoPRO yoghurt','snack',160,25,10,'home',Object.assign({fat:2},R('YoPRO','','milk',''))),
  mkPlanItem('m01-di','Easy dinner — eggs/toast or tick Youfoodz','dinner',500,38,35,'home',Object.assign({fat:22},R(
   'Eggs 3 + toast + spinach, OR heat a Youfoodz from the checklist',
   'Late finish: scramble eggs or microwave Youfoodz per pack.',
   'egg, gluten, wheat','Portuguese / Butter Chicken are solid post-9 options.'))),
  mkPlanItem('m01-sw','Greek yoghurt + honey','snack',180,15,16,'home',Object.assign({fat:4},R('Greek yoghurt + honey','','milk',''))),
  mkPlanItem('m01-tr','Treat allowance (~180 kcal)','treat',180,1,20,'home',Object.assign({fat:8},R('~180 kcal','Optional','','')))
 ]};
 // Fri 2 — rest
 days['2026-10-02']={notes:'Rest · work 8–6. Flexible Youfoodz day if you take one to work.',items:[
  mkPlanItem('m02-bf','Eggs + toast + high-pro milk','breakfast',480,35,30,'home',Object.assign({fat:22},R(
   'Eggs 3, toast 2, high-pro milk 250ml','','egg, gluten, wheat, milk',''))),
  mkPlanItem('m02-sn1','YoPRO + banana','snack',250,26,28,'home',Object.assign({fat:3},R('YoPRO + banana','','milk',''))),
  mkPlanItem('m02-lu','Chicken wrap + cheese (no tomato)','lunch',520,42,40,'home',Object.assign({fat:16},R(
   'Wrap, chicken, cheese, salad veg','No tomato.','gluten, wheat, milk',''))),
  mkPlanItem('m02-sn2','Cottage cheese + honey','snack',220,20,14,'home',Object.assign({fat:5},R('Cottage cheese 150g + honey','','milk',''))),
  mkPlanItem('m02-di','Creamy mushroom chicken pasta (no tomato) OR Youfoodz','dinner',620,45,55,'home',Object.assign({fat:18},R(
   'Chicken 150g, pasta 80g, mushrooms, cream/cream cheese, garlic, spinach',
   'Cook pasta; pan chicken + mushrooms; finish with cream + spinach. Or tick Youfoodz.',
   'gluten, wheat, milk','No tomato sauce.'))),
  mkPlanItem('m02-sw','Protein pudding','snack',160,25,8,'home',Object.assign({fat:3},R('Protein pudding','','milk',''))),
  mkPlanItem('m02-tr','Treat allowance (~180 kcal)','treat',180,1,20,'home',Object.assign({fat:8},R('~180 kcal','Optional','','')))
 ]};
 // Sat 3 — Lower
 days['2026-10-03']={notes:'Lower B · OFF · higher carbs around training.',items:[
  mkPlanItem('m03-bf','Oats + whey + peanut butter','breakfast',520,40,48,'home',Object.assign({fat:16},R(
   'Oats 60g, whey, PB 1 tbsp, milk','','milk, peanuts',''))),
  mkPlanItem('m03-sn1','YoPRO yoghurt','snack',160,25,10,'home',Object.assign({fat:2},R('YoPRO','','milk',''))),
  mkPlanItem('m03-lu','Chicken rice bowl + veg (no tomato)','lunch',580,45,55,'home',Object.assign({fat:12},R(
   'Chicken 150g, rice 1–1.5 cups cooked, broccoli/frozen veg, soy/garlic',
   'Cook and bowl up. Or take a Youfoodz to work instead.',
   '','',''))),
  mkPlanItem('m03-sn2','Cottage cheese + honey','snack',220,20,14,'home',Object.assign({fat:5},R('Cottage cheese + honey','','milk',''))),
  mkPlanItem('m03-di','Steak + baked potato + green salad (no tomato)','dinner',650,48,45,'home',Object.assign({fat:28},R(
   'Steak 180–200g, baked potato 1, lettuce/cucumber/oil-vinegar, butter optional',
   'Bake potato ~45 min. Pan/grill steak. Salad without tomato.',
   '','Potato baked — not mash.'))),
  mkPlanItem('m03-sw','Greek yoghurt + honey','snack',180,15,16,'home',Object.assign({fat:4},R('Greek yoghurt + honey','','milk',''))),
  mkPlanItem('m03-tr','Treat allowance (~180 kcal)','treat',180,1,20,'home',Object.assign({fat:8},R('~180 kcal','Optional','','')))
 ]};
 // Sun 4 — optional
 days['2026-10-04']={notes:'Optional Sunday pull · OFF. Use remaining Youfoodz before next Wed delivery.',items:[
  mkPlanItem('m04-bf','Eggs + toast + avocado + high-pro milk','breakfast',540,36,32,'home',Object.assign({fat:28},R(
   'Eggs 3, toast 2, avocado ½, high-pro milk','','egg, gluten, wheat, milk',''))),
  mkPlanItem('m04-sn1','YoPRO yoghurt','snack',160,25,10,'home',Object.assign({fat:2},R('YoPRO','','milk',''))),
  mkPlanItem('m04-lu','Chicken stir-fry + rice (soy/garlic — no tomato)','lunch',580,42,55,'home',Object.assign({fat:14},R(
   'Chicken 150g, rice, mixed stir-fry veg, soy sauce, garlic, ginger',
   'Hot wok/pan; serve over rice. No tomato sauces.',
   'soy','',''))),
  mkPlanItem('m04-sn2','Protein shake + banana','snack',280,28,28,'home',Object.assign({fat:4},R('Whey + banana + water/milk','','milk',''))),
  mkPlanItem('m04-di','Leftover protein + roast potato + veg OR Youfoodz','dinner',550,42,40,'home',Object.assign({fat:18},R(
   'Chicken/beef leftover 150g, roast potato, greens',
   'Reheat protein; roast or microwave potato; steam veg. Or finish a Youfoodz.',
   '','',''))),
  mkPlanItem('m04-sw','Protein pudding','snack',160,25,8,'home',Object.assign({fat:3},R('Protein pudding','','milk',''))),
  mkPlanItem('m04-tr','Treat allowance (~180 kcal)','treat',180,1,20,'home',Object.assign({fat:8},R('~180 kcal','Optional','','')))
 ]};
 const lib={};const favIds=[];
 MEAL_FAVOURITES.forEach(f=>{lib[f.id]=favToLibraryEntry(f);favIds.push(f.id);});
 return {
  delivery:{
   week:'2026-W40',date:'2026-09-30',area:'Cecil Park 2178',status:'Delivered',source:'seed',
   items:YF_ITEMS.map(x=>Object.assign({eaten:false},x))
  },
  planWeekStart:'2026-09-28',
  days,
  targets:Object.assign({},MEAL_TARGETS),
  log:{},
  library:lib,
  favourites:favIds
 };
}
function yfSnap(it,week){return {id:it.id,name:it.name,kcal:it.kcal,protein:it.protein,carbs:it.carbs!=null?it.carbs:null,fat:it.fat!=null?it.fat:null,allergens:it.allergens||'',ingredients:it.ingredients||'',note:it.note||'',flag:it.flag||'',url:it.url||'',week:week||it.week||''};}
function rememberYf(items,week){if(!S.meals)return;if(!Array.isArray(S.meals.yfPast))S.meals.yfPast=[];
 const by={};S.meals.yfPast.forEach(i=>{if(i&&i.id)by[i.id]=i;});
 (items||[]).forEach(it=>{if(!it||!it.id||it.damaged)return;by[it.id]=Object.assign({},by[it.id]||{},yfSnap(it,week));});
 S.meals.yfPast=Object.keys(by).map(id=>by[id]);}
function parkEatenYf(it){if(!it||it.parked||!it.eaten||it.damaged||!/^\d{4}-\d{2}-\d{2}$/.test(it.eatenOn||''))return;
 if(!S.meals.log||typeof S.meals.log!=='object'||Array.isArray(S.meals.log))S.meals.log={};
 if(!Array.isArray(S.meals.log[it.eatenOn]))S.meals.log[it.eatenOn]=[];
 const log=S.meals.log[it.eatenOn];if(!log.some(x=>x&&x.yfId===it.id))log.push({name:it.name,kcal:n0(it.kcal),protein:n0(it.protein),carbs:it.carbs==null?null:n0(it.carbs),fat:it.fat==null?null:n0(it.fat),slot:it.slot||'lunch',source:'youfoodz',yfId:it.id,at:Date.now()});
 it.parked=1;}
function ensureMeals(){
 if(!S.meals||typeof S.meals!=='object'){S.meals=defaultMeals();return S.meals;}
 const d=defaultMeals();
 if(!Array.isArray(S.meals.yfPast))S.meals.yfPast=[];
 if(!S.meals.delivery||!Array.isArray(S.meals.delivery.items)||!S.meals.delivery.week){
  S.meals.delivery=clone(d.delivery);
 }else if(S.meals.delivery.week===d.delivery.week){
  const oldItems=S.meals.delivery.items||[],byId={};
  oldItems.forEach(i=>{if(i&&i.id)byId[i.id]=i;});
  const seedIds=new Set(d.delivery.items.map(i=>i.id));
  const dropped=oldItems.filter(i=>i&&i.id&&!seedIds.has(i.id));
  dropped.forEach(parkEatenYf);rememberYf(dropped,S.meals.delivery.week);
  S.meals.delivery=Object.assign({},d.delivery,S.meals.delivery,{
   week:d.delivery.week,date:d.delivery.date,area:d.delivery.area||S.meals.delivery.area,
   status:d.delivery.status||S.meals.delivery.status,source:S.meals.delivery.source||'seed'
  });
  S.meals.delivery.items=d.delivery.items.map(def=>{
   const prev=byId[def.id];
   if(!prev)return clone(def);
   return Object.assign({},def,{eaten:!!prev.eaten,eatenOn:prev.eatenOn||def.eatenOn||null,slot:prev.slot||def.slot||null,parked:prev.parked?1:0});
  });
 }else{
  const old=S.meals.delivery;
  (old.items||[]).forEach(parkEatenYf);rememberYf(old.items,old.week);
  const manualFuture=old.source==='manual'&&String(old.week)>String(d.delivery.week);
  if(manualFuture){
   S.meals.delivery.items=(old.items||[]).map(it=>Object.assign({eaten:false},it,{eaten:!!it.eaten}));
   const ids=new Set((S.meals.delivery.items||[]).map(i=>i&&i.id));
   rememberYf(d.delivery.items.filter(i=>i&&!ids.has(i.id)),d.delivery.week);
  }else S.meals.delivery=clone(d.delivery);
 }
 (S.meals.delivery.items||[]).forEach(parkEatenYf);
 // Plan week: force to seed when different (W41 week → W40 week)
 if(S.meals.planWeekStart!==d.planWeekStart){
  S.meals.planWeekStart=d.planWeekStart;
  if(!S.meals.days||typeof S.meals.days!=='object')S.meals.days={};
  Object.keys(d.days).forEach(k=>{S.meals.days[k]=clone(d.days[k]);});
 }else if(!S.meals.days||typeof S.meals.days!=='object'){
  S.meals.days=d.days;
 }else{
  Object.keys(d.days).forEach(k=>{
   if(!S.meals.days[k])S.meals.days[k]=clone(d.days[k]);
   else{
    const byId={};(S.meals.days[k].items||[]).forEach(i=>{if(i&&i.id)byId[i.id]=i;});
    S.meals.days[k]={
     notes:(S.meals.days[k].notes!=null&&S.meals.days[k].notes!=='')?S.meals.days[k].notes:d.days[k].notes,
     items:d.days[k].items.map(def=>{
      const prev=byId[def.id];
      return prev?Object.assign({},def,{eaten:!!prev.eaten}):clone(def);
     })
    };
   }
  });
 }
 S.meals.targets=Object.assign({},MEAL_TARGETS,S.meals.targets||{});
 if(!S.meals.targets.goal)S.meals.targets.goal='maintain';
 if(!S.meals.targets.kcalManual){const got=kcalForGoal(S.meals.targets.goal);if(got){S.meals.targets.kcal=got.kcal;S.meals.targets.kcalNote=got.note;}}
 if(!S.meals.log||typeof S.meals.log!=='object'||Array.isArray(S.meals.log))S.meals.log={};
 if(!S.meals.library||typeof S.meals.library!=='object'||Array.isArray(S.meals.library))S.meals.library={};
 if(!Array.isArray(S.meals.favourites))S.meals.favourites=[];
 // Seed / refresh known favourites in library + favourites list (user can add more later)
 MEAL_FAVOURITES.forEach(f=>{
  S.meals.library[f.id]=Object.assign({},S.meals.library[f.id]||{},favToLibraryEntry(f));
  if(!S.meals.favourites.includes(f.id))S.meals.favourites.push(f.id);
 });
 return S.meals;
}
let mealDay=null,mealMonth=null,mealTab='plan',mealSlot=null,sugOpen=false,yfOpen=false; // plan | log
const MEAL_SLOTS=[{id:'breakfast',label:'Breakfast'},{id:'lunch',label:'Lunch'},{id:'dinner',label:'Dinner'},{id:'snack',label:'Snacks'}];
function defaultMealSlot(){
 const h=+new Intl.DateTimeFormat('en-AU',{timeZone:TZ,hour:'numeric',hourCycle:'h23'}).format(new Date());
 if(h<11)return 'breakfast'; if(h<15)return 'lunch'; if(h<17)return 'snack'; return 'dinner';
}
function currentSlot(){if(!mealSlot)mealSlot=defaultMealSlot();return mealSlot;}
function normSlot(s){if(s==='breakfast'||s==='lunch'||s==='dinner')return s;return 'snack';}
function slotName(id){const s=MEAL_SLOTS.find(x=>x.id===normSlot(id));return s?s.label:'Snacks';}
let bcStream=null,bcDetector=null,bcLoop=0,bcBusy=false;
function mealDayKey(){ensureMeals();if(/^\d{4}-\d{2}-\d{2}$/.test(mealDay||''))return mealDay;return mealDay=todayKey();}
function monthCells(ym){
 const [y,m]=ym.split('-').map(Number),first=y+'-'+String(m).padStart(2,'0')+'-01';
 const lead=(new Date(Date.parse(first+'T00:00:00Z')).getUTCDay()+6)%7,start=keyAdd(first,-lead),cells=[];
 for(let i=0;i<42;i++)cells.push(keyAdd(start,i));
 while(cells.length>28&&cells.slice(-7).every(k=>k.slice(0,7)!==ym))cells.splice(-7,7);
 return cells;
}
function dayMarked(k){
 ensureMeals();
 const log=S.meals.log&&S.meals.log[k];
 if(Array.isArray(log)&&log.length)return true;
 const p=S.meals.days&&S.meals.days[k];
 if(p&&(p.items||[]).some(i=>i&&i.eaten))return true;
 return false;
}
function mealCalHtml(selected){
 const ym=mealMonth||selected.slice(0,7);mealMonth=ym;
 const title=new Date(Date.parse(ym+'-01T00:00:00Z')).toLocaleDateString('en-AU',{timeZone:'UTC',month:'long',year:'numeric'});
 const tk=todayKey();
 const cells=monthCells(ym).map(k=>{
  const cls=(k===selected?' on':'')+(k===tk?' tod':'')+(k.slice(0,7)!==ym?' out':'');
  return `<button type="button" class="${cls}" data-a="mealDay" data-d="${k}">${+k.slice(8)}${dayMarked(k)?'<i></i>':'<i class="off"></i>'}</button>`;
 }).join('');
 return `<style>.mcal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}.mcal .dow{text-align:center;color:var(--mu);font-size:11px;font-weight:700;padding:2px 0}.mcal button{appearance:none;background:var(--card2);color:var(--tx);border:1px solid transparent;border-radius:10px;min-height:42px;padding:4px 0 2px;font:inherit;font-weight:700;font-size:14px}.mcal button.on{border-color:var(--ac);color:var(--ac)}.mcal button.tod{box-shadow:inset 0 0 0 2px var(--wa)}.mcal button.out{opacity:.38}.mcal i{display:block;width:5px;height:5px;border-radius:50%;background:var(--ac);margin:1px auto 0}.mcal i.off{background:transparent}</style>
  <div class="card" style="padding:10px 10px 12px"><div class="hrow"><button type="button" class="btn sm" data-a="mealMonth" data-d="-1" aria-label="Previous month">‹</button><b>${esc(title)}</b><button type="button" class="btn sm" data-a="mealMonth" data-d="1" aria-label="Next month">›</button></div>
  ${selected!==tk?'<button type="button" class="btn sm wide" data-a="mealToday">Jump to today</button>':''}
  <div class="mcal">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="dow">${d}</div>`).join('')}${cells}</div>
  <div class="muted" style="margin-top:6px">Tap a day to log it. Green dot means something is already logged.</div></div>`;
}
function dayPlan(k){ensureMeals();return S.meals.days[k]||{items:[],notes:''};}
function dayLog(k){ensureMeals();if(!Array.isArray(S.meals.log[k]))S.meals.log[k]=[];return S.meals.log[k];}
function n0(v){const n=num(v);return n==null?0:n;}
function sumMacros(list){return list.reduce((a,x)=>({kcal:a.kcal+n0(x.kcal),protein:a.protein+n0(x.protein),carbs:a.carbs+n0(x.carbs),fat:a.fat+n0(x.fat)}),{kcal:0,protein:0,carbs:0,fat:0});}
function yfEatenOnDay(k){
 ensureMeals();
 return (S.meals.delivery.items||[]).filter(i=>i&&i.eaten&&!i.damaged&&i.eatenOn===k);
}
function dayEatenTotals(k){
 const plan=(dayPlan(k).items||[]).filter(i=>i.eaten);
 const log=dayLog(k);
 return sumMacros(plan.concat(log));
}
function cardioKcal(k){
 let n=0;
 (S.cardio||[]).forEach(c=>{if(c&&c.date===k)n+=n0(c.kcal);});
 const add=s=>{if(!s||dKey(s.start)!==k)return;(s.exercises||[]).forEach(e=>{if(e.cardio&&e.done)n+=n0(e.kcal);});};
 (S.sessions||[]).forEach(add);
 if(S.active)add(S.active);
 return Math.round(n);
}
function dayPlannedTotals(k){return sumMacros(dayPlan(k).items||[]);}
function macroBar(tot,burn,foodKcal){
 ensureMeals();
 const t=Object.assign({},MEAL_TARGETS,S.meals.targets||{});
 const rows=[
  {key:'kcal',label:burn?'Calories (net)':'Calories',unit:'',goal:Math.max(1,n0(t.kcal)||MEAL_TARGETS.kcal),cur:n0(tot.kcal),round:v=>Math.round(v)},
  {key:'protein',label:'Protein',unit:'g',goal:Math.max(1,n0(t.protein)||MEAL_TARGETS.protein),cur:n0(tot.protein),round:v=>Math.round(v*10)/10},
  {key:'carbs',label:'Carbs',unit:'g',goal:Math.max(1,n0(t.carbs)||MEAL_TARGETS.carbs),cur:n0(tot.carbs),round:v=>Math.round(v)},
  {key:'fat',label:'Fat',unit:'g',goal:Math.max(1,n0(t.fat)||MEAL_TARGETS.fat),cur:n0(tot.fat),round:v=>Math.round(v*10)/10}
 ];
 const body=rows.map(r=>{
  const pct=r.goal?r.cur/r.goal*100:0;
  const w=Math.max(0,Math.min(100,Math.round(pct)));
  const cls=pct>=115?'way':(pct>=90?'near':'');
  const u=r.unit;
  return `<div class="mr"><span class="lbl">${r.label}</span>
   <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="${r.goal}" aria-valuenow="${r.round(r.cur)}" aria-label="${r.label}"><div class="fill ${cls}" style="width:${w}%"></div></div>
   <span class="vals">${r.round(r.cur)}${u} / ${r.round(r.goal)}${u}</span></div>`;
 }).join('');
 return `<div class="card" style="padding:10px 12px"><div class="hrow"><b>Daily macros</b><span class="muted">vs goals</span></div>
  ${goalPicker()}
  <div class="mbar">${body}</div>${burn?`<div class="muted" style="margin-top:6px">Food ${Math.round(foodKcal)} kcal · cardio −${burn} kcal</div>`:''}${t.kcalNote&&!t.kcalManual?`<div class="muted" style="margin-top:6px">${esc(t.kcalNote)}</div>`:t.kcalManual?'<div class="muted" style="margin-top:6px">Custom calories. Pick a goal to use your stats again.</div>':''}</div>`;
}
function slotLabel(s){return ({breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',treat:'Treat'}[s]||s||'Meal');}
function findYf(id){ensureMeals();return (S.meals.delivery.items||[]).find(x=>x.id===id)||(S.meals.yfPast||[]).find(x=>x.id===id)||null;}
function findPlanItem(day,id){const d=dayPlan(day);return (d.items||[]).find(x=>x.id===id)||null;}
function mealRecipeModal(kind,id,day){
 ensureMeals();
 let it=null,srcLabel='';
 if(kind==='yf'){it=findYf(id);srcLabel='Youfoodz';}
 else{it=findPlanItem(day||mealDayKey(),id);srcLabel=it&&it.source==='youfoodz'?'Youfoodz':'Home suggestion';}
 if(!it){toast('Recipe not found');return;}
 const flag=it.flag?`<div class="hint warn" style="margin-top:8px">⚠ ${esc(it.flag)}</div>`:'';
 const dmg=it.damaged?`<div class="hint warn" style="margin-top:8px">🚫 ${esc(it.status||'Damaged · credit')} — not available to eat</div>`:'';
 const all=it.allergens?`<div style="margin-top:10px"><div class="muted" style="font-size:12px">Allergens</div><b>${esc(it.allergens)}</b></div>`:'';
 const ing=it.ingredients?`<div style="margin-top:10px"><div class="muted" style="font-size:12px">Ingredients</div><div style="white-space:pre-wrap">${esc(it.ingredients)}</div></div>`:'';
 const meth=it.method?`<div style="margin-top:10px"><div class="muted" style="font-size:12px">Method</div><div style="white-space:pre-wrap">${esc(it.method)}</div></div>`:'';
 const note=it.note?`<div class="muted" style="margin-top:8px">${esc(it.note)}</div>`:'';
 const url=it.url?`<p style="margin-top:12px"><a style="color:var(--bl)" target="_blank" rel="noopener" href="${esc(it.url)}">Open on Youfoodz ↗</a></p>`:'';
 const fat=it.fat!=null?` · ${it.fat}g F`:'';
 modal(`<div class="hrow"><h2 style="margin:0;flex:1">${esc(it.name)}</h2><button class="btn sm" data-a="closeModal">Close</button></div>
  <div class="muted">${esc(srcLabel)}${it.damaged?' · damaged':''}${it.eaten&&it.eatenOn?' · eaten '+esc(fmtKeyShort(it.eatenOn)):''}</div>
  <div class="card" style="margin-top:8px"><b>${it.kcal} kcal · ${it.protein}g P${it.carbs!=null?' · '+it.carbs+'g C':''}${fat}</b></div>
  ${dmg}${flag}${note}${all}${ing}${meth}${url}`);
}
function vMeals(){
 ensureMeals();
 const k=mealDayKey(),del=S.meals.delivery,eaten=dayEatenTotals(k),burn=cardioKcal(k),tot=Object.assign({},eaten,{kcal:eaten.kcal-burn}),planTot=dayPlannedTotals(k),day=dayPlan(k);
 const st=del.status?` · ${esc(del.status)}`:'';
 let h=`<h1>Meals</h1><div class="muted">W40 · Youfoodz checklist + home suggestions · local only</div>`;
 // Delivery card — checklist, no day assignment
 const yfAvail=(del.items||[]).filter(i=>!i.damaged);
 const yfDone=yfAvail.filter(i=>i.eaten).length;
 h+=`<details class="card hero" id="yfBox" ${yfOpen?'open':''}><summary style="justify-content:space-between;width:100%"><b>🍽️ Youfoodz this week</b><span class="muted">${yfDone}/${yfAvail.length} eaten</span></summary>
  <div class="muted" style="margin-top:4px">Delivery ${fmtKeyDate(del.date)} · ${esc(del.area||'')} · ${esc(del.week)}${st}. Tick when you eat one — macros go to <b>the selected day</b> below (not pre-assigned).</div>
  <div class="hint up" style="margin-top:8px">${esc(YF_W41_NOTE)}</div>
  <div style="margin-top:8px">${(del.items||[]).map(it=>{
   const flag=it.flag?`<div class="hint warn" style="margin:4px 0 0">⚠ ${esc(it.flag)}</div>`:'';
   const dmg=it.damaged;
   const onDay=!dmg&&(S.meals.log[k]||[]).some(x=>x&&x.yfId===it.id);
   const days=yfDays(it.id);
   const status=dmg?`<div class="hint warn" style="margin:4px 0 0">🚫 ${esc(it.status||'Damaged · credit')}</div>`:
    (days.length?`<div class="muted" style="margin:4px 0 0;font-size:12px">Logged ${days.map(d=>esc(fmtKeyShort(d))).join(', ')}</div>`:'');
   const dis=dmg?'disabled':'';
   const chk=onDay?'checked':'';
   return `<div class="hrow" style="align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
    <label class="chk grow" style="align-items:flex-start;min-height:0;margin:0"><input type="checkbox" data-a="yfEat" data-id="${esc(it.id)}" ${chk} ${dis}>
     <span><b>${esc(it.name)}</b><br><span class="muted">${it.kcal} kcal · ${it.protein}g P${it.carbs!=null?' · '+it.carbs+'g C':''}${it.fat!=null?' · '+it.fat+'g F':''}</span>${flag}${status}</span></label>
    <button type="button" class="btn sm" data-a="mealRecipe" data-kind="yf" data-id="${esc(it.id)}" title="Recipe / info" aria-label="Recipe">ⓘ</button>
   </div>`;
  }).join('')}</div>
  ${(()=>{const past=(S.meals.yfPast||[]).filter(p=>p&&p.id&&!(del.items||[]).some(i=>i.id===p.id));if(!past.length)return '';
   return `<div class="muted" style="margin-top:10px"><b>Previous meals</b> · kept so you can log them again</div>`+past.map(it=>`<div class="hrow" style="align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
    <span class="grow"><b>${esc(it.name)}</b><br><span class="muted">${it.kcal} kcal · ${it.protein}g P${it.carbs!=null?' · '+it.carbs+'g C':''}${it.fat!=null?' · '+it.fat+'g F':''}${it.week?' · '+esc(it.week):''}</span></span>
    <button type="button" class="btn sm" data-a="mealRecipe" data-kind="yf" data-id="${esc(it.id)}" aria-label="Recipe">ⓘ</button>
    <button type="button" class="btn sm primary" data-a="yfPastAdd" data-id="${esc(it.id)}">+ Log</button>
   </div>`).join('');})()}
  </details>`;

 // Calendar — any date, not just the seeded 28 Sep–4 Oct plan week
 h+=mealCalHtml(k);
 h+=`<div class="slots">${MEAL_SLOTS.map(s=>`<button type="button" class="btn ${currentSlot()===s.id?'on':''}" data-a="mealSlot" data-v="${s.id}">${s.label}</button>`).join('')}</div>`;
 h+=`<div class="muted" style="margin:-2px 0 8px">Tick a meal to log it into <b>${esc(slotName(currentSlot()))}</b> on ${esc(fmtKeyShort(k))}. Bars are the full day.</div>`;
 h+=`<div class="seg"><button class="btn ${mealTab==='plan'?'on':''}" data-a="mealTab" data-v="plan">Week plan</button>
  <button class="btn ${mealTab==='log'?'on':''}" data-a="mealTab" data-v="log">Log / scan</button></div>`;
 h+=macroBar(tot,burn,eaten.kcal);
 if(day.notes)h+=`<div class="hint up">${esc(day.notes)}</div>`;
 h+=favouritesRow(k);

 const logged=mealEntryRows(k);
 h+=`<h2>Logged ${fmtKeyShort(k)}</h2>`+renderSlotGroups(logged);

 if(mealTab==='plan'){
  const groups={breakfast:[],lunch:[],dinner:[],snack:[]};
  (day.items||[]).forEach(it=>groups[normSlot(it.slot)].push(it));
  const nSug=(day.items||[]).length;
  const slots=MEAL_SLOTS.map(s=>{
   const list=groups[s.id];
   if(!list.length)return '';
   const body=list.map(it=>{
    const flag=it.flag?`<div class="hint warn" style="margin:4px 0 0;font-size:12px">⚠ ${esc(it.flag)}</div>`:'';
    const fat=it.fat!=null?` · ${it.fat}g F`:'';
    return `<div class="hrow" style="align-items:flex-start;gap:8px">
     <label class="chk" style="margin-top:10px"><input type="checkbox" data-a="mealEat" data-d="${k}" data-id="${esc(it.id)}" ${it.eaten?'checked':''} aria-label="Log ${esc(it.name)}"></label>
     <button type="button" class="btn sessbtn grow" data-a="mealRecipe" data-kind="plan" data-d="${k}" data-id="${esc(it.id)}"><span><b>${esc(it.name)}</b><br><small>${it.kcal} kcal · ${it.protein}g P${it.carbs!=null?' · '+it.carbs+'g C':''}${fat}</small>${flag}</span><small>Recipe ›</small></button>
    </div>`;
   }).join('');
   return `<div class="slothead">${s.label}</div>${body}`;
  }).join('');
  h+=`<details class="card" id="sugBox" ${sugOpen?'open':''}><summary>Suggestions${nSug?' ('+nSug+')':''}</summary>${slots||'<div class="muted">Nothing planned</div>'}</details>`;
 }else{
  h+=`<div class="row"><button class="btn primary grow" data-a="bcScan">📷 Scan barcode</button>
   <button class="btn grow" data-a="bcManual"># Enter barcode</button></div>
  <button class="btn wide" data-a="foodCustom">+ Add custom food</button>`;
  const libKeys=Object.keys(S.meals.library||{});
  if(libKeys.length)h+=`<details class="card"><summary>Saved foods (${libKeys.length})</summary>`+
   libKeys.slice(0,40).map(bk=>{const f=S.meals.library[bk];return `<button class="btn sessbtn" data-a="foodLibAdd" data-id="${esc(bk)}"><span>${esc(f.name)}<br><small>${f.kcal} kcal · ${f.protein||0}g P</small></span><small>+ ${esc(slotName(currentSlot()))}</small></button>`;}).join('')+'</details>';
 }
 return h;
}
function mealEntryRows(k){
 const rows=[];
 (dayPlan(k).items||[]).forEach(it=>{
  if(!it.eaten)return;
  rows.push({slot:normSlot(it.slot),html:`<div class="item" style="cursor:default"><span><b>${esc(it.name)}</b><br><span class="muted">${it.kcal} kcal · ${it.protein}g P · suggestion</span></span><button class="btn sm" data-a="mealRecipe" data-kind="plan" data-d="${k}" data-id="${esc(it.id)}">ⓘ</button></div>`});
 });
 dayLog(k).forEach((x,i)=>{
  rows.push({slot:normSlot(x.slot),html:`<div class="item" style="cursor:default"><span><b>${esc(x.name)}</b><br><span class="muted">${Math.round(n0(x.kcal))} kcal · ${n0(x.protein)}g P · ${n0(x.carbs)}g C · ${x.fat!=null?n0(x.fat)+'g F':'—'}${x.source==='youfoodz'?' · Youfoodz':''}</span></span><button class="btn sm danger" data-a="foodLogDel" data-d="${k}" data-i="${i}">✕</button></div>`});
 });
 return rows;
}
function renderSlotGroups(rows){
 return MEAL_SLOTS.map(s=>{
  const list=rows.filter(r=>r.slot===s.id);
  const body=list.length?list.map(r=>r.html).join(''):'<div class="muted" style="padding:8px 2px">Nothing yet</div>';
  return `<div class="slothead">${s.label}</div><div class="card list" style="padding:4px 12px">${body}</div>`;
 }).join('');
}
function favouritesRow(dayKey){
 ensureMeals();
 const ids=(S.meals.favourites&&S.meals.favourites.length)?S.meals.favourites:MEAL_FAVOURITES.map(f=>f.id);
 if(!ids.length)return '';
 const dayLbl=fmtKeyShort(dayKey||mealDayKey());
 let h=`<div class="card hero" style="padding:12px"><div class="hrow"><b>⚡ Quick add</b><span class="muted">1 serve → ${esc(dayLbl)}</span></div>`;
 ids.forEach(id=>{
  const seed=favById(id)||{};
  const f=Object.assign({},seed,S.meals.library[id]||{});
  if(!f||(!f.name&&!f.short))return;
  const btn=seed.button||('+ '+(f.short||f.label||'Favourite'));
  const sub=esc(f.label||f.short||f.name)+' · '+n0(f.kcal)+' kcal · '+n0(f.protein)+'g P';
  h+=`<div class="favrow"><button type="button" class="btn primary favbtn" data-a="favQuickAdd" data-id="${esc(id)}"><span>${esc(btn)}</span><small>${sub}</small></button>
   <button type="button" class="btn sm favinfo" data-a="favInfo" data-id="${esc(id)}" title="Serve size / macros" aria-label="Info">ⓘ</button></div>`;
 });
 h+=`<div class="muted" style="margin-top:8px;font-size:12px">Saved in favourites / food library — tap ⓘ for full label info.</div></div>`;
 return h;
}
function favInfoModal(id){
 ensureMeals();
 const seed=favById(id)||{};
 const f=Object.assign({},seed,S.meals.library[id]||{});
 if(!f||(!f.name&&!f.short)){toast('Favourite not found');return;}
 const fat=f.fat!=null?` · ${f.fat}g F`:'';
 const sod=f.sodium!=null?`<div style="margin-top:8px"><div class="muted" style="font-size:12px">Sodium</div><b>${f.sodium} mg</b></div>`:'';
 const serv=f.serving?`<div style="margin-top:8px"><div class="muted" style="font-size:12px">Serving</div><b>${esc(f.serving)}</b></div>`:'';
 const all=f.allergens?`<div style="margin-top:8px"><div class="muted" style="font-size:12px">Allergens</div><b>${esc(f.allergens)}</b></div>`:'';
 const note=f.note?`<div class="muted" style="margin-top:10px">${esc(f.note)}</div>`:'';
 modal(`<div class="hrow"><h2 style="margin:0;flex:1">${esc(f.short||f.label||f.name)}</h2><button class="btn sm" data-a="closeModal">Close</button></div>
  <div class="muted">${esc(f.name||'')}</div>
  <div class="card" style="margin-top:8px"><b>${n0(f.kcal)} kcal · ${n0(f.protein)}g P · ${n0(f.carbs)}g C${fat}</b></div>
  ${serv}${sod}${all}${note}
  <button class="btn primary wide" data-a="favQuickAdd" data-id="${esc(id)}" style="margin-top:12px">${esc(seed.button||'+ Add 1 serve')}</button>`);
}
function addFoodToLog(entry,toastMsg){
 ensureMeals();const k=mealDayKey();
 const slot=entry.slot||currentSlot();
 const row={id:uid(),name:entry.name,kcal:n0(entry.kcal),protein:n0(entry.protein),carbs:n0(entry.carbs),fat:entry.fat==null||entry.fat===''?null:n0(entry.fat),barcode:entry.barcode||null,t:Date.now(),source:entry.source||'manual',slot};
 dayLog(k).push(row);save();toast((toastMsg||('✓ '+row.name))+' · '+slotName(slot));mealTab='log';render();
}
function stopBarcode(){
 bcLoop++;
 if(bcStream){try{bcStream.getTracks().forEach(t=>t.stop());}catch(e){}bcStream=null;}
 bcDetector=null;bcBusy=false;
}
async function openBarcodeScanner(){
 stopBarcode();
 const support=!!(window.BarcodeDetector&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
 modal(`<h2 style="margin-top:0">Scan barcode</h2>
  <div class="muted">${support?'Point the camera at a food barcode.':'Live camera scan not supported in this browser — use manual entry below.'}</div>
  ${support?`<div style="position:relative;margin:10px 0;border-radius:12px;overflow:hidden;background:#000;aspect-ratio:3/4;max-height:50vh">
   <video id="bcVid" playsinline muted style="width:100%;height:100%;object-fit:cover"></video>
   <div id="bcStatus" class="lab" style="position:absolute;left:8px;top:8px;background:#000c;color:#fff;font-size:12px;font-weight:700;padding:4px 8px;border-radius:8px">Starting camera…</div>
  </div>`:`<div class="hint warn">BarcodeDetector / camera unavailable. Enter the number instead.</div>`}
  <label class="lbl">Or type barcode</label>
  <input id="bcNum" inputmode="numeric" placeholder="e.g. 9300657…" autocomplete="off">
  <div class="row"><button class="btn grow" data-a="bcClose">Close</button>
  <button class="btn primary grow" data-a="bcLookup">Look up</button></div>`);
 if(!support){setTimeout(()=>{const i=document.getElementById('bcNum');if(i)i.focus();},80);return;}
 try{
  bcStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
  const v=document.getElementById('bcVid');if(!v){stopBarcode();return;}
  v.srcObject=bcStream;await v.play();
  const formats=['ean_13','ean_8','upc_a','upc_e','code_128'];
  try{bcDetector=new BarcodeDetector({formats});}catch(e){bcDetector=new BarcodeDetector();}
  const st=document.getElementById('bcStatus');if(st)st.textContent='Scanning…';
  const my=++bcLoop;
  const tick=async()=>{
   if(my!==bcLoop||!bcDetector)return;
   try{
    const v2=document.getElementById('bcVid');if(!v2||v2.readyState<2){requestAnimationFrame(tick);return;}
    if(!bcBusy){
     bcBusy=true;
     const codes=await bcDetector.detect(v2);
     bcBusy=false;
     if(codes&&codes.length){
      const raw=(codes[0].rawValue||'').replace(/\D/g,'');
      if(raw.length>=8){stopBarcode();lookupBarcode(raw);return;}
     }
    }
   }catch(e){bcBusy=false;}
   if(my===bcLoop)setTimeout(()=>requestAnimationFrame(tick),120);
  };
  requestAnimationFrame(tick);
 }catch(e){
  const st=document.getElementById('bcStatus');
  if(st)st.textContent='Camera blocked — type barcode';
  toast('Camera unavailable: '+(e.message||'permission denied'),3500);
 }
}
function offNutri(p){
 const n=p.nutriments||{};
 const kcal100=n['energy-kcal_100g']!=null?n['energy-kcal_100g']:(n['energy_100g']!=null?n['energy_100g']/4.184:null);
 const prot100=n.proteins_100g,carb100=n.carbohydrates_100g,fat100=n.fat_100g;
 const servKcal=n['energy-kcal_serving']!=null?n['energy-kcal_serving']:(n.energy_serving!=null?n.energy_serving/4.184:null);
 return {kcal100,prot100,carb100,fat100,servKcal,servP:n.proteins_serving,servC:n.carbohydrates_serving,servF:n.fat_serving,serving:p.serving_size||null,name:p.product_name||p.generic_name||'Unknown product',brands:p.brands||''};
}
async function lookupBarcode(code){
 code=String(code||'').replace(/\D/g,'');
 if(code.length<6){toast('Enter a valid barcode');return;}
 ensureMeals();
 if(S.meals.library[code]){showFoodAddModal(Object.assign({barcode:code,source:'library'},S.meals.library[code]));return;}
 toast('Looking up…');
 try{
  const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json',{headers:{'User-Agent':'WorkoutTrackerPWA/1.0 (local)'}});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const d=await r.json();
  if(d.status!==1||!d.product){showFoodMissModal(code);return;}
  const nu=offNutri(d.product);
  showFoodHitModal(code,nu);
 }catch(e){toast('Lookup failed: '+(e.message||'network'),3500);showFoodMissModal(code);}
}
function showFoodHitModal(code,nu){
 const hasServ=nu.servKcal!=null||(nu.serving&&nu.kcal100!=null);
 modal(`<h2 style="margin-top:0">${esc(nu.name)}</h2>
  <div class="muted">${esc(nu.brands)}${nu.brands?' · ':''}#${esc(code)} · Open Food Facts</div>
  <div class="card" style="margin-top:8px"><div class="muted">Per 100g</div>
   <b>${nu.kcal100!=null?Math.round(nu.kcal100)+' kcal': '—'} · P ${nu.prot100!=null?nu.prot100:'—'}g · C ${nu.carb100!=null?nu.carb100:'—'}g · F ${nu.fat100!=null?nu.fat100:'—'}g</b>
   ${nu.serving?`<div class="muted" style="margin-top:6px">Serving: ${esc(nu.serving)}${nu.servKcal!=null?' · ~'+Math.round(nu.servKcal)+' kcal':''}</div>`:''}</div>
  <label class="lbl">Amount</label>
  <div class="seg" id="bcAmtMode">
   <button type="button" class="btn on" data-a="bcAmt" data-m="100">Per 100g ×</button>
   ${hasServ?`<button type="button" class="btn" data-a="bcAmt" data-m="serv">Servings ×</button>`:''}
   <button type="button" class="btn" data-a="bcAmt" data-m="g">Grams</button>
  </div>
  <input id="bcQty" type="number" inputmode="decimal" min="0" step="0.1" value="${hasServ?'1':'1'}">
  <input type="hidden" id="bcMode" value="${hasServ?'serv':'100'}">
  <input type="hidden" id="bcCode" value="${esc(code)}">
  <input type="hidden" id="bcName" value="${esc(nu.name)}">
  <input type="hidden" id="bcK100" value="${nu.kcal100!=null?nu.kcal100:''}">
  <input type="hidden" id="bcP100" value="${nu.prot100!=null?nu.prot100:''}">
  <input type="hidden" id="bcC100" value="${nu.carb100!=null?nu.carb100:''}">
  <input type="hidden" id="bcF100" value="${nu.fat100!=null?nu.fat100:''}">
  <input type="hidden" id="bcKS" value="${nu.servKcal!=null?nu.servKcal:''}">
  <input type="hidden" id="bcPS" value="${nu.servP!=null?nu.servP:''}">
  <input type="hidden" id="bcCS" value="${nu.servC!=null?nu.servC:''}">
  <input type="hidden" id="bcFS" value="${nu.servF!=null?nu.servF:''}">
  <label class="chk" style="margin-top:8px"><input type="checkbox" id="bcSaveLib" checked> Save to my food library</label>
  <div class="row"><button class="btn grow" data-a="bcClose">Cancel</button>
  <button class="btn primary grow" data-a="bcAdd">Add to today</button></div>`);
 if(hasServ){const m=document.getElementById('bcMode');if(m)m.value='serv';
  document.querySelectorAll('#bcAmtMode .btn').forEach(b=>b.classList.toggle('on',b.dataset.m==='serv'));}
 else{document.querySelectorAll('#bcAmtMode .btn').forEach(b=>b.classList.toggle('on',b.dataset.m==='100'));}
}
function showFoodMissModal(code){
 modal(`<h2 style="margin-top:0">Not in Open Food Facts</h2>
  <div class="muted">Barcode #${esc(code)} — enter macros manually. You can save it for next time.</div>
  <label class="lbl">Name</label><input id="fName" placeholder="Food name">
  <div class="grid2"><div><label class="lbl">kcal</label><input id="fK" inputmode="decimal" type="number"></div>
   <div><label class="lbl">Protein g</label><input id="fP" inputmode="decimal" type="number"></div></div>
  <div class="grid2"><div><label class="lbl">Carbs g</label><input id="fC" inputmode="decimal" type="number"></div>
   <div><label class="lbl">Fat g</label><input id="fF" inputmode="decimal" type="number"></div></div>
  <input type="hidden" id="bcCode" value="${esc(code)}">
  <label class="chk" style="margin-top:8px"><input type="checkbox" id="bcSaveLib" checked> Save barcode → food in library</label>
  <div class="row"><button class="btn grow" data-a="bcClose">Cancel</button>
  <button class="btn primary grow" data-a="foodMissAdd">Add to today</button></div>`);
}
function showFoodAddModal(f){
 modal(`<h2 style="margin-top:0">${esc(f.name)}</h2>
  <div class="muted">${f.barcode?'#'+esc(f.barcode)+' · ':''}${f.kcal} kcal · ${f.protein||0}g P</div>
  <label class="lbl">Multiplier (e.g. 1 = one serve)</label>
  <input id="fMult" type="number" inputmode="decimal" min="0" step="0.1" value="1">
  <input type="hidden" id="fBaseK" value="${n0(f.kcal)}"><input type="hidden" id="fBaseP" value="${n0(f.protein)}">
  <input type="hidden" id="fBaseC" value="${n0(f.carbs)}"><input type="hidden" id="fBaseF" value="${f.fat==null?'':n0(f.fat)}">
  <input type="hidden" id="fBaseName" value="${esc(f.name)}"><input type="hidden" id="bcCode" value="${esc(f.barcode||'')}">
  <div class="row"><button class="btn grow" data-a="bcClose">Cancel</button>
  <button class="btn primary grow" data-a="foodLibOk">Add to today</button></div>`);
}
function customFoodModal(){
 modal(`<h2 style="margin-top:0">Add custom food</h2>
  <label class="lbl">Name</label><input id="fName" placeholder="e.g. Homemade chicken wrap">
  <div class="grid2"><div><label class="lbl">kcal</label><input id="fK" inputmode="decimal" type="number"></div>
   <div><label class="lbl">Protein g</label><input id="fP" inputmode="decimal" type="number"></div></div>
  <div class="grid2"><div><label class="lbl">Carbs g</label><input id="fC" inputmode="decimal" type="number"></div>
   <div><label class="lbl">Fat g (optional)</label><input id="fF" inputmode="decimal" type="number"></div></div>
  <label class="chk" style="margin-top:8px"><input type="checkbox" id="bcSaveLib"> Also save to library</label>
  <div class="row"><button class="btn grow" data-a="closeModal">Cancel</button>
  <button class="btn primary grow" data-a="foodCustomOk">Add to today</button></div>`);
}
/** Tick Youfoodz: log macros to the currently selected Meals day (or today). Damaged items ignored. */
function yfDays(id){ensureMeals();const days=[];Object.keys(S.meals.log||{}).sort().forEach(d=>{if((S.meals.log[d]||[]).some(x=>x&&x.yfId===id))days.push(d);});return days;}
function toggleYoufoodz(yfId,eaten){
 ensureMeals();
 const day=mealDayKey();
 const slot=currentSlot();
 const it=(S.meals.delivery.items||[]).find(x=>x.id===yfId);if(!it)return;
 if(it.damaged){toast('Damaged — credit only, not edible');render();return;}
 const log=dayLog(day);
 const idx=log.findIndex(x=>x&&x.yfId===yfId);
 if(eaten){
  const row={name:it.name,kcal:n0(it.kcal),protein:n0(it.protein),carbs:it.carbs==null?null:n0(it.carbs),fat:it.fat==null?null:n0(it.fat),slot,source:'youfoodz',yfId:it.id,at:Date.now()};
  if(idx<0)log.push(row);else log[idx]=Object.assign({},log[idx],row);
  it.eaten=true;it.eatenOn=day;it.slot=slot;it.parked=1;
  toast('✓ '+it.name+' → '+slotName(slot)+' · '+fmtKeyShort(day));
 }else{
  if(idx>=0)log.splice(idx,1);
  const left=yfDays(yfId);
  it.eaten=left.length>0;it.eatenOn=left.length?left[left.length-1]:null;it.slot=it.eaten?it.slot:null;
  toast('Removed from this day — other days stay');
 }
 save();render();
}
function togglePlanItem(day,id,eaten){
 ensureMeals();const dayObj=S.meals.days[day];if(!dayObj)return;
 const it=(dayObj.items||[]).find(x=>x.id===id);if(!it)return;
 it.eaten=!!eaten;save();render();
}
function computeBcMacros(){
 const mode=(document.getElementById('bcMode')||{}).value||'100';
 const qty=n0((document.getElementById('bcQty')||{}).value)||0;
 const g=id=>n0((document.getElementById(id)||{}).value);
 let kcal=0,protein=0,carbs=0,fat=null;
 if(mode==='serv'){kcal=g('bcKS')*qty;protein=g('bcPS')*qty;carbs=g('bcCS')*qty;fat=g('bcFS')?g('bcFS')*qty:null;
  if(!g('bcKS')&&g('bcK100')){kcal=g('bcK100')*qty;protein=g('bcP100')*qty;carbs=g('bcC100')*qty;fat=g('bcF100')?g('bcF100')*qty:null;}
 }else if(mode==='g'){const m=qty/100;kcal=g('bcK100')*m;protein=g('bcP100')*m;carbs=g('bcC100')*m;fat=g('bcF100')?g('bcF100')*m:null;}
 else{kcal=g('bcK100')*qty;protein=g('bcP100')*qty;carbs=g('bcC100')*qty;fat=g('bcF100')?g('bcF100')*qty:null;}
 return {kcal,protein,carbs,fat};
}
function saveToLibrary(code,food){
 if(!code)return;ensureMeals();
 S.meals.library[code]={name:food.name,kcal:n0(food.kcal),protein:n0(food.protein),carbs:n0(food.carbs),fat:food.fat==null?null:n0(food.fat),barcode:code};
}

/** Replace Youfoodz checklist for a new delivery week. Preserves library/log; resets eaten on new items. */
function applyYoufoodzDelivery(payload){
 ensureMeals();
 if(!payload||!payload.week||!Array.isArray(payload.items)){toast('Invalid delivery');return;}
 if(S.meals.delivery&&S.meals.delivery.week&&S.meals.delivery.week!==payload.week){
  (S.meals.delivery.items||[]).forEach(parkEatenYf);rememberYf(S.meals.delivery.items,S.meals.delivery.week);
 }
 S.meals.delivery={
  week:payload.week,date:payload.date||'',area:payload.area||S.meals.delivery.area||'',
  status:payload.status||'',source:'manual',
  items:payload.items.map(it=>Object.assign({eaten:false},it,{eaten:!!it.eaten,eatenOn:it.eatenOn||null}))
 };
 save();toast('✓ Youfoodz '+payload.week+' loaded');render();
}


ensureMeals();

// ---- icons + manifest (generated at runtime so start_url is absolute) ----
function makeIcon(sz){try{const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),u=sz/64;
 x.fillStyle='#0f1115';x.fillRect(0,0,sz,sz);x.fillStyle='#4ade80';
 [[8,20,6,24],[15,16,6,32],[43,16,6,32],[50,20,6,24],[21,29,22,6]].forEach(r=>x.fillRect(r[0]*u,r[1]*u,r[2]*u,r[3]*u));return c.toDataURL('image/png');}catch(e){return null;}}
(function(){const i180=makeIcon(180),i512=makeIcon(512),i192=makeIcon(192);const ati=document.getElementById('ati');if(i180&&ati)ati.href=i180;
 const base=location.href.split('#')[0];
 const m={name:'Workout Tracker',short_name:'Workout',description:'Offline gym workout tracker',start_url:base,scope:base.replace(/[^/]*$/,''),display:'standalone',orientation:'portrait',background_color:'#0f1115',theme_color:'#0f1115',
  icons:i512?[{src:i192,sizes:'192x192',type:'image/png',purpose:'any'},{src:i512,sizes:'512x512',type:'image/png',purpose:'any maskable'}]:[]};
 const mf=document.getElementById('mf');if(mf&&/^https?:/.test(base))mf.href='data:application/manifest+json,'+encodeURIComponent(JSON.stringify(m));})();

if(document.getElementById('app')){if(S.active)view='session';render();}
setTimeout(morningCheck,400);
window.WTRender=function(){if(document.getElementById('app'))render();};
try{window.dispatchEvent(new Event('wt-ready'));}catch(e){}
