// app.js - نظام أسئلة متقدم: مستويات، تلميحات، مؤثرات، لوحة متصدرين

const DATA_URL = 'questions.json';
let questions = [];
let state = {
  playerName: '',
  levelKey: '',
  current: 0,
  score: 0,
  timer: null,
  timeLeft: 30,
  usedHint: false,
  modePractice: false
};

// عناصر DOM
const el = {
  welcome: document.getElementById('welcome-screen'),
  game: document.getElementById('game-screen'),
  end: document.getElementById('end-screen'),
  startBtn: document.getElementById('start-btn'),
  practiceBtn: document.getElementById('practice-btn'),
  nameInput: document.getElementById('player-name'),
  levelSelect: document.getElementById('level-select'),
  displayPlayer: document.getElementById('display-player'),
  score: document.getElementById('score'),
  questionText: document.getElementById('question-text'),
  optionsContainer: document.getElementById('options-container'),
  progressBar: document.getElementById('progress-bar'),
  levelBadge: document.getElementById('level-badge'),
  timeLeft: document.getElementById('time-left'),
  timerEl: document.getElementById('timer'),
  hintBtn: document.getElementById('hint-btn'),
  hintText: document.getElementById('hint-text'),
  feedback: document.getElementById('feedback'),
  nextBtn: document.getElementById('next-btn'),
  quitBtn: document.getElementById('quit-btn'),
  endTitle: document.getElementById('end-title'),
  finalScore: document.getElementById('final-score'),
  leaderboard: document.getElementById('leaderboard'),
  playAgain: document.getElementById('play-again'),
  backHome: document.getElementById('back-home'),
  shareBtn: document.getElementById('btn-share'),
  printCert: document.getElementById('print-cert'),
  shareResult: document.getElementById('share-result')
};

// تحميل البيانات
async function loadData(){
  try{
    const res = await fetch(DATA_URL);
    questions = await res.json();
    initLevels();
  }catch(e){
    console.error('Failed load questions',e);
  }
}

function initLevels(){
  // استخرج المستويات الفريدة من الأسئلة
  const levels = Array.from(new Set(questions.map(q=>q.level)));
  el.levelSelect.innerHTML = '';
  levels.forEach(l=>{
    const opt = document.createElement('option'); opt.value = l; opt.innerText = l;
    el.levelSelect.appendChild(opt);
  });
}

// أحداث
el.startBtn.addEventListener('click', ()=>startGame(false));
el.practiceBtn.addEventListener('click', ()=>startGame(true));
el.hintBtn.addEventListener('click', useHint);
el.nextBtn.addEventListener('click', nextQuestion);
el.quitBtn.addEventListener('click', ()=>{ if(confirm('هل تريد الخروج؟ سيفقد تقدم هذه الجولة.')) showWelcome(); });
el.playAgain.addEventListener('click', ()=>{ showWelcome(); });
el.backHome.addEventListener('click', ()=>{ showWelcome(); });
el.shareBtn.addEventListener('click', shareApp);
el.printCert.addEventListener('click', printCertificate);
el.shareResult.addEventListener('click', shareResult);

function startGame(practice=false){
  const name = el.nameInput.value.trim() || 'مستكشف';
  state.playerName = name; state.modePractice = practice;
  el.displayPlayer.innerText = `👤 ${state.playerName}`;
  localStorage.setItem('playerName', state.playerName);

  state.levelKey = el.levelSelect.value;
  state.current = 0; state.score = 0; state.usedHint = false;

  // اختر أسئلة هذا المستوى واختر تشكيلة عشوائية
  state.pool = questions.filter(q=>q.level===state.levelKey);
  shuffle(state.pool);
  if(!state.pool.length){ alert('لا توجد أسئلة لهذا المستوى'); return; }

  el.score.innerText = state.score;
  el.levelBadge.innerText = state.levelKey;

  showGame();
  loadQuestion();
}

function showWelcome(){ el.welcome.classList.remove('hidden'); el.game.classList.add('hidden'); el.end.classList.add('hidden'); }
function showGame(){ el.welcome.classList.add('hidden'); el.game.classList.remove('hidden'); el.end.classList.add('hidden'); }
function showEnd(){ el.welcome.classList.add('hidden'); el.game.classList.add('hidden'); el.end.classList.remove('hidden'); }

function loadQuestion(){
  clearTimer(); el.hintText.classList.add('hidden'); el.hintText.innerText=''; el.hintBtn.disabled=false; el.feedback.classList.add('hidden'); el.nextBtn.classList.add('hidden');
  const q = state.pool[state.current];
  el.questionText.innerText = q.question;
  el.optionsContainer.innerHTML='';
  if(q.image){ const img = document.createElement('div'); img.className='question-image'; img.innerText=q.image; el.optionsContainer.appendChild(img);} // using emoji or text image

  q.options.forEach((opt,i)=>{
    const b = document.createElement('button'); b.className='option-btn'; b.innerText = opt; b.onclick = ()=>selectAnswer(i,b); el.optionsContainer.appendChild(b);
  });

  updateProgress();
  startTimer(q.time || 30);
}

function updateProgress(){
  const pct = Math.round(((state.current)/state.pool.length)*100);
  el.progressBar.style.width = pct + '%';
}

function startTimer(seconds){ state.timeLeft = seconds; el.timeLeft.innerText = state.timeLeft; clearTimer(); state.timer = setInterval(()=>{ state.timeLeft--; el.timeLeft.innerText = state.timeLeft; if(state.timeLeft<=0){ clearTimer(); handleTimeout(); } },1000); }
function clearTimer(){ if(state.timer){ clearInterval(state.timer); state.timer=null; } }

function handleTimeout(){ const q=state.pool[state.current]; revealCorrect(); showFeedback('انتهى الوقت!','incorrect'); el.nextBtn.classList.remove('hidden'); }

function selectAnswer(idx, btn){ clearTimer(); const q=state.pool[state.current]; const buttons = document.querySelectorAll('.option-btn'); buttons.forEach(b=>b.disabled=true);
  if(idx===q.answer){ btn.classList.add('correct'); state.score+=q.points||10; el.score.innerText = state.score; showConfetti(); playSound('success'); showFeedback('إجابة صحيحة!','correct'); } else { btn.classList.add('incorrect'); revealCorrect(); playSound('fail'); showFeedback('إجابة خاطئة','incorrect'); }
  el.nextBtn.classList.remove('hidden');
}

function revealCorrect(){ const q=state.pool[state.current]; const buttons = document.querySelectorAll('.option-btn'); if(buttons[q.answer]) buttons[q.answer].classList.add('correct'); }

function nextQuestion(){ state.current++; if(state.current<state.pool.length){ loadQuestion(); } else { finishGame(); } }

function finishGame(){ clearTimer(); el.finalScore.innerText = state.score; updateLeaderboard(state.playerName,state.score,state.levelKey); showEnd(); }

function useHint(){ if(state.usedHint) return; const q=state.pool[state.current]; if(q.hint){ state.score = Math.max(0,state.score-5); el.score.innerText = state.score; el.hintText.innerText = q.hint; el.hintText.classList.remove('hidden'); state.usedHint=true; el.hintBtn.disabled=true; } else { alert('لا يوجد تلميح لهذا السؤال'); } }

function showFeedback(text,type){ el.feedback.innerText = text; el.feedback.className = `feedback ${type==='correct'?'correct-feedback':'incorrect-feedback'}`; el.feedback.classList.remove('hidden'); }

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

// Leaderboard (local)
function updateLeaderboard(name,score,level){ const key='mh_leaderboard'; const history = JSON.parse(localStorage.getItem(key)||'[]'); history.push({name,score,level,date:new Date().toISOString()}); history.sort((a,b)=>b.score-a.score); localStorage.setItem(key,JSON.stringify(history)); renderLeaderboard(); }
function renderLeaderboard(){ const key='mh_leaderboard'; const history = JSON.parse(localStorage.getItem(key)||'[]'); el.leaderboard.innerHTML=''; if(history.length===0){ const li=document.createElement('li'); li.innerText='لا توجد نتائج بعد'; el.leaderboard.appendChild(li); return; } history.slice(0,10).forEach(h=>{ const li=document.createElement('li'); const d=new Date(h.date); li.innerText = `${h.name} — ${h.score} نقطة — ${h.level} (${d.toLocaleDateString()})`; el.leaderboard.appendChild(li); }); }

// confetti
function showConfetti(){ try{ confetti({particleCount:60,spread:70,origin:{y:0.6}}); }catch(e){} }

// sounds
const audio = { success:new Audio(), fail:new Audio() };
function initSounds(){ try{ audio.success.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='; audio.fail.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='; }catch(e){} }
function playSound(k){ try{ if(audio[k]) audio[k].play(); }catch(e){} }

// share
function shareApp(){ const url = location.href; if(navigator.share){ navigator.share({title:'مملكة الحيوان��ت',text:'جرب هذه اللعبة التعليمية!',url}); } else { prompt('انسخ الرابط وشاركه مع أصدقائك:',url); } }
function shareResult(){ const text = `لقد حصلت على ${state.score} نقطة في مملكة الحيوانات!`; if(navigator.share){ navigator.share({title:'نتيجتي في مملكة الحيوانات',text,url:location.href}); } else { const wa = `https://wa.me/?text=${encodeURIComponent(text+' '+location.href)}`; window.open(wa,'_blank'); } }

// certificate
function printCertificate(){ const win = window.open('','_blank'); win.document.write(`<h1>شهادة إتمام</h1><p>المستكشف: ${state.playerName}</p><p>المجموع: ${state.score}</p>`); win.print(); win.close(); }

// Utils load saved name
window.addEventListener('load', ()=>{ initSounds(); loadData().then(()=>{ if(localStorage.getItem('playerName')) el.nameInput.value = localStorage.getItem('playerName'); renderLeaderboard(); }); });
