
/* ============== AUDIO (synth, no files needed) ============== */
let actx = null;
let muted = false;
function ac(){ if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)(); return actx; }
function beep(freq, dur, type='sine', vol=.18, delay=0){
  if(muted) return;
  const c = ac();
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator(); const gain = c.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0+0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0+dur);
  osc.connect(gain); gain.connect(c.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}
function sfx(name){
  if(muted) return;
  switch(name){
    case 'click': beep(520,.06,'square',.12); break;
    case 'fill': beep(660,.09,'triangle',.15); break;
    case 'wrong': beep(140,.18,'sawtooth',.15); break;
    case 'walk': beep(300+Math.random()*60,.05,'square',.06); break;
    case 'success': [523,659,784,1046].forEach((f,i)=>beep(f,.18,'triangle',.16,i*0.11)); break;
    case 'rescue': beep(880,.07,'sine',.2); beep(1175,.12,'sine',.18,.08); break;
    case 'levelup': [392,494,587,659,784].forEach((f,i)=>beep(f,.2,'square',.13,i*0.09)); break;
    case 'open': beep(440,.08,'sine',.14); beep(660,.1,'sine',.12,.06); break;
    case 'siren': beep(700,.15,'sawtooth',.07); beep(500,.15,'sawtooth',.07,.15); break;
    case 'fanfare': [523,523,523,698,880,1046,880,1046].forEach((f,i)=>beep(f,.22,'triangle',.15,i*0.12)); break;
  }
}

