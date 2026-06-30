/* ============== GAME STATE ============== */
let state = {
  current: 0,
  completed: JSON.parse(localStorage.getItem('brs_completed')||'[]'),
  stars: parseInt(localStorage.getItem('brs_stars')||'0',10)
};

const $ = sel => document.querySelector(sel);
const scene = $('#sceneInner');
const codearea = $('#codearea');
const wordbank = $('#wordbank');
const runBtn = $('#runBtn');
const hintRow = $('#hintRow');

let filledBlanks = {};
let currentLevel = null;

/* ============== SCENE BUILDING ============== */
function clearScene(){ scene.innerHTML=''; }

function buildScene(level){
  clearScene();
  const ground = document.createElement('div');
  ground.className = 'ground '+level.ground;
  scene.appendChild(ground);

  // buildings
  const bCount = 4;
  for(let i=0;i<bCount;i++){
    const b = document.createElement('div');
    b.className='building';
    const w = 70+Math.random()*40;
    const h = 110+Math.random()*120;
    b.style.width = w+'px';
    b.style.height = h+'px';
    b.style.left = (8 + i*23)+'%';
    scene.appendChild(b);
    // windows
    const rows = Math.floor(h/26), cols = Math.floor(w/22);
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(Math.random()>0.4){
          const win = document.createElement('div');
          win.className='window';
          win.style.left=(8+c*22)+'px';
          win.style.top=(10+r*26)+'px';
          if(level.ground==='fire' && Math.random()>0.7) win.style.background='#ff7b00';
          b.appendChild(win);
        }
      }
    }
    if(level.ground==='quake'){
      for(let k=0;k<3;k++){
        const cr = document.createElement('div');
        cr.className='crack';
        cr.style.width='2px';
        cr.style.height=(20+Math.random()*40)+'px';
        cr.style.left=(10+Math.random()*(w-20))+'px';
        cr.style.top=(Math.random()*(h-40))+'px';
        cr.style.transform=`rotate(${(Math.random()*40-20)}deg)`;
        b.appendChild(cr);
      }
    }
  }

  // ambient fx
  for(let i=0;i<6;i++){
    const fx = document.createElement('div');
    fx.className='fx';
    fx.style.left=(5+Math.random()*90)+'%';
    fx.style.bottom=(40+Math.random()*15)+'%';
    if(level.ground==='fire'){
      fx.classList.add(Math.random()>0.5?'smoke':'flame');
    } else if(level.ground==='flood'){
      fx.classList.add('drip');
      fx.style.top = (Math.random()*30)+'%';
    } else {
      fx.classList.add('smoke');
      fx.style.opacity='.4';
    }
    fx.style.animationDelay = (Math.random()*2)+'s';
    scene.appendChild(fx);
  }

  // civilians
  currentCivilianEls = [];
  level.civilians.forEach((c,i)=>{
    const el = document.createElement('div');
    el.className='civilian waving';
    el.style.left = c.x+'%';
    el.style.bottom = '43%';
    el.style.fontSize='22px';
    el.style.textAlign='center';
    el.innerHTML = `<div style="font-size:22px;">${c.emoji}</div>`;
    scene.appendChild(el);
    currentCivilianEls.push(el);
  });

  // robot
  const robot = document.createElement('div');
  robot.id='robot';
  robot.className='robot';
  robot.style.left='2%';
  robot.style.bottom='40%';
  robot.innerHTML = `
    <div class="antenna"></div>
    <div class="rbody"><div class="eye"></div><div class="eye r"></div></div>
    <div class="legs"><i></i><i></i></div>`;
  scene.appendChild(robot);
}
let currentCivilianEls = [];

function moveRobotTo(xPercent, cb){
  const robot = $('#robot');
  robot.classList.add('walking');
  let walkSound = setInterval(()=>sfx('walk'), 140);
  robot.style.left = xPercent+'%';
  setTimeout(()=>{
    clearInterval(walkSound);
    robot.classList.remove('walking');
    if(cb) cb();
  }, 1150);
}

function popHeart(xPercent){
  const h = document.createElement('div');
  h.className='heart';
  h.textContent='💚';
  h.style.left = xPercent+'%';
  h.style.bottom = '46%';
  scene.appendChild(h);
  setTimeout(()=>h.remove(), 850);
}

/* ============== CODE RENDERING ============== */
function renderCode(level){
  codearea.innerHTML='';
  filledBlanks = {};
  level.codeLines.forEach(line=>{
    const div = document.createElement('div');
    div.className='codeline';
    if(line.indent) div.style.paddingLeft='28px';
    line.parts.forEach(p=>{
      if(p.t==='sp'){ div.appendChild(document.createTextNode(' ')); return; }
      if(p.blank){
        const span = document.createElement('span');
        span.className='blank';
        span.dataset.blankId = p.blank;
        span.textContent = '____';
        div.appendChild(span);
        return;
      }
      const span = document.createElement('span');
      if(p.t==='kw') span.className='kw';
      else if(p.t==='fn') span.className='fn';
      else if(p.t==='str') span.className='str';
      else if(p.t==='docstr') span.className='docstr';
      span.textContent = p.v;
      div.appendChild(span);
    });
    codearea.appendChild(div);
  });
}

function renderWordbank(level){
  wordbank.innerHTML='';
  // gather all options across blanks, but show per-blank as one combined bank
  // We present a single bank built from all blanks' options, shuffled, each clickable;
  // clicking attempts to fill the next empty blank that accepts it (first match in document order).
  let pool = [];
  level.blanks.forEach(b=>{
    b.options.forEach(opt=>{
      pool.push({text:opt, correctFor:b.id, isAnswer: opt===b.answer});
    });
  });
  // dedupe identical text entries that are wrong-everywhere duplicates, but keep enough distractors
  const seen = {};
  pool = pool.filter(p=>{
    const k=p.text+'|'+p.correctFor;
    if(seen[k]) return false;
    seen[k]=true; return true;
  });
  shuffle(pool);
  pool.forEach(p=>{
    const btn = document.createElement('button');
    btn.className='wbtn';
    btn.textContent = p.text;
    btn.onclick = ()=>tryFill(p, btn, level);
    wordbank.appendChild(btn);
  });
  hintRow.textContent = '';
}

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }

function tryFill(option, btn, level){
  sfx('click');
  // find first unfilled blank in DOM order whose expected answer === option's text AND option.correctFor matches an unfilled blank id with same answer
  const blankEls = Array.from(codearea.querySelectorAll('.blank'));
  let targetEl = null, targetBlankDef = null;
  for(const el of blankEls){
    const id = el.dataset.blankId;
    if(filledBlanks[id]) continue;
    const bdef = level.blanks.find(b=>b.id===id);
    if(bdef.answer === option.text){
      targetEl = el; targetBlankDef = bdef; break;
    }
  }
  if(targetEl){
    filledBlanks[targetBlankDef.id] = option.text;
    targetEl.textContent = option.text;
    targetEl.classList.add('filled');
    btn.classList.add('used');
    sfx('fill');
    checkAllFilled(level);
  } else {
    btn.classList.add('wrong');
    sfx('wrong');
    hintRow.textContent = '🤔 Not quite — check which blank that word belongs to.';
    setTimeout(()=>btn.classList.remove('wrong'), 350);
  }
}

function checkAllFilled(level){
  const total = level.blanks.length;
  const filled = Object.keys(filledBlanks).length;
  runBtn.disabled = filled < total;
  if(filled>=total){ hintRow.textContent='✅ All set! Hit RUN CODE.'; }
}

/* ============== LEVEL FLOW ============== */
function loadLevel(idx){
  currentLevel = LEVELS[idx];
  state.current = idx;
  $('#levelLabel').textContent = `Level ${idx+1} / ${LEVELS.length}`;
  $('#briefTitle').textContent = currentLevel.title;
  $('#briefText').textContent = currentLevel.story;
  $('#sirenText').textContent = currentLevel.ground==='fire'?'FIRE RESPONSE':currentLevel.ground==='flood'?'FLOOD RESPONSE':'EARTHQUAKE RESPONSE';
  buildScene(currentLevel);
  renderCode(currentLevel);
  renderWordbank(currentLevel);
  runBtn.disabled = true;
  showIntro(currentLevel);
}

function showIntro(level){
  $('#introTitle').textContent = `Level ${level.id}: ${level.title}`;
  $('#introStory').textContent = level.story;
  $('#introTutorial').textContent = '🎓 '+level.concept+': '+level.tutorial;
  $('#introOverlay').classList.remove('hidden');
  sfx('open');
}

$('#introStart').onclick = ()=>{ $('#introOverlay').classList.add('hidden'); sfx('siren'); };

$('#tutorBtn').onclick = ()=>{
  hintRow.textContent = '💡 '+currentLevel.hint;
  sfx('click');
};

runBtn.onclick = ()=>{
  runBtn.disabled = true;
  sfx('rescue');
  const targets = currentLevel.civilians;
  let i = 0;
  function nextRescue(){
    if(i>=targets.length){ finishLevel(); return; }
    const c = targets[i];
    moveRobotTo(c.x, ()=>{
      popHeart(c.x);
      sfx('rescue');
      if(currentCivilianEls[i]) currentCivilianEls[i].classList.add('saved');
      i++;
      setTimeout(nextRescue, 400);
    });
  }
  nextRescue();
};

function finishLevel(){
  sfx('success');
  if(!state.completed.includes(currentLevel.id)){
    state.completed.push(currentLevel.id);
    state.stars += 1;
    localStorage.setItem('brs_completed', JSON.stringify(state.completed));
    localStorage.setItem('brs_stars', state.stars);
    $('#stars').textContent = '⭐ '+state.stars;
  }
  $('#successTitle').textContent = currentLevel.title+' — Complete! 🎉';
  $('#successText').textContent = currentLevel.successText;
  $('#successFact').textContent = currentLevel.successFact;
  $('#successOverlay').classList.remove('hidden');
}

$('#nextBtn').onclick = ()=>{
  $('#successOverlay').classList.add('hidden');
  const nextIdx = state.current+1;
  if(nextIdx >= LEVELS.length){
    sfx('fanfare');
    $('#finaleOverlay').classList.remove('hidden');
  } else {
    loadLevel(nextIdx);
  }
};

$('#replayBtn').onclick = ()=>{
  $('#finaleOverlay').classList.add('hidden');
  loadLevel(0);
};

/* MAP */
function buildMap(){
  const grid = $('#levelGrid');
  grid.innerHTML='';
  LEVELS.forEach((lv,idx)=>{
    const chip = document.createElement('div');
    const done = state.completed.includes(lv.id);
    const locked = idx>0 && !state.completed.includes(LEVELS[idx-1].id) && !done;
    chip.className='levelchip'+(done?' done':'')+(locked?' locked':'');
    chip.innerHTML = `${done?'✅':locked?'🔒':'▶️'}<br>${lv.id}. ${lv.title}`;
    if(!locked){
      chip.onclick = ()=>{ $('#mapOverlay').classList.add('hidden'); loadLevel(idx); sfx('click'); };
    }
    grid.appendChild(chip);
  });
}

$('#mapBtn').onclick = ()=>{ buildMap(); $('#mapOverlay').classList.remove('hidden'); sfx('open'); };
$('#closeMap').onclick = ()=>{ $('#mapOverlay').classList.add('hidden'); sfx('click'); };

$('#muteBtn').onclick = ()=>{
  muted = !muted;
  $('#muteBtn').textContent = muted?'🔇':'🔊';
  $('#muteCheck').checked = muted;
};
$('#muteCheck').onchange = (e)=>{ muted = e.target.checked; $('#muteBtn').textContent = muted?'🔇':'🔊'; };

$('#startBtn').onclick = ()=>{
  ac(); // unlock audio context on user gesture
  $('#startOverlay').classList.add('hidden');
  $('#stars').textContent = '⭐ '+state.stars;
  const resumeIdx = state.completed.length>0 ? Math.min(state.completed.length, LEVELS.length-1) : 0;
  loadLevel(resumeIdx);
};

