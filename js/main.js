/* ══════════════════════════════════════════════════════════════
   LÓGICA DEL QUIZ — CEA Fénix
   Las preguntas se cargan desde Supabase al iniciar la app.
   Fallback al banco local si Supabase no responde.
══════════════════════════════════════════════════════════════ */
const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 60;
const PASSING_SCORE = 7;

let PREGUNTAS_CARGADAS = [];

let quizState = {
  questions: [],
  current: 0,
  answers: [],
  correct: 0,
  timer: null,
  timeLeft: TIME_PER_QUESTION,
  totalTime: 0,
  timeStart: 0,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startQuiz() {
  const banco = PREGUNTAS_CARGADAS.length > 0 ? PREGUNTAS_CARGADAS : PREGUNTAS;
  quizState.questions = shuffle(banco).slice(0, TOTAL_QUESTIONS);
  quizState.current = 0;
  quizState.answers = [];
  quizState.correct = 0;
  quizState.totalTime = 0;
  quizState.timeStart = Date.now();
  showScreen('screen-quiz');
  loadQuestion();
}

function loadQuestion() {
  const q = quizState.questions[quizState.current];
  const idx = quizState.current;
  document.getElementById('q-num').textContent = idx + 1;
  document.getElementById('progress-fill').style.width = `${((idx + 1) / TOTAL_QUESTIONS) * 100}%`;
  document.getElementById('q-category').textContent = q.cat;
  document.getElementById('q-text').textContent = q.q;
  const qImg = document.getElementById('q-image');
  if (q.img) {
    qImg.src = q.img;
    qImg.style.display = 'block';
  } else {
    qImg.removeAttribute('src');
    qImg.style.display = 'none';
  }
  const fb = document.getElementById('feedback-box');
  fb.className = 'feedback-box';
  document.getElementById('btn-next').classList.remove('show');
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  const letters = ['A','B','C','D'];
  shuffle(q.opts.map((o, i) => ({ text: o, original: i }))).forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${opt.text}</span>`;
    btn.dataset.original = opt.original;
    btn.addEventListener('click', () => selectAnswer(btn, opt.original, q));
    grid.appendChild(btn);
  });
  startTimer();
}

function startTimer() {
  clearInterval(quizState.timer);
  quizState.timeLeft = TIME_PER_QUESTION;
  const timerEl = document.getElementById('timer');
  const timerVal = document.getElementById('timer-val');
  timerEl.className = 'timer';
  timerVal.textContent = quizState.timeLeft;
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    timerVal.textContent = quizState.timeLeft;
    if (quizState.timeLeft <= 10) timerEl.className = 'timer danger';
    else if (quizState.timeLeft <= 20) timerEl.className = 'timer warning';
    if (quizState.timeLeft <= 0) { clearInterval(quizState.timer); timeOut(); }
  }, 1000);
}

function timeOut() {
  const q = quizState.questions[quizState.current];
  quizState.answers.push({ q, selected: -1, correct: false });
  disableOptions();
  showFeedback(false, `⏱ Tiempo agotado. La respuesta correcta era: "${q.opts[q.ans]}"`);
  document.getElementById('btn-next').classList.add('show');
}

function selectAnswer(btn, selectedIdx, q) {
  clearInterval(quizState.timer);
  const isCorrect = selectedIdx === q.ans;
  if (isCorrect) quizState.correct++;
  quizState.answers.push({ q, selected: selectedIdx, correct: isCorrect });
  disableOptions();
  document.querySelectorAll('.option-btn').forEach(b => {
    const orig = parseInt(b.dataset.original);
    if (orig === q.ans) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });
  showFeedback(
    isCorrect,
    isCorrect ? `✅ ¡Correcto! ${q.exp}` : `❌ Incorrecto. Respuesta: "${q.opts[q.ans]}". ${q.exp}`
  );
  document.getElementById('btn-next').classList.add('show');
}

function showFeedback(ok, text) {
  const fb = document.getElementById('feedback-box');
  fb.className = `feedback-box show ${ok ? 'ok' : 'bad'}`;
  fb.querySelector('i').className = ok ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
  document.getElementById('feedback-text').textContent = text;
}

function disableOptions() {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current < TOTAL_QUESTIONS) {
    loadQuestion();
  } else {
    clearInterval(quizState.timer);
    quizState.totalTime = Math.round((Date.now() - quizState.timeStart) / 1000);
    showResults();
  }
}

function showResults() {
  showScreen('screen-results');
  const score = quizState.correct;
  const passed = score >= PASSING_SCORE;
  const circle = document.getElementById('result-circle');
  circle.className = `result-circle ${passed ? 'pass' : 'fail'}`;
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-title').textContent = passed ? '¡Aprobado! 🎉' : 'No aprobado';
  document.getElementById('result-msg').textContent = passed
    ? `Excelente desempeño. Obtuviste ${score}/10. ¡Estás listo para el examen real!`
    : `Obtuviste ${score}/10. Necesitas al menos 7. Practica más y vuelve a intentarlo.`;
  document.getElementById('stat-correct').textContent = score;
  document.getElementById('stat-wrong').textContent = 10 - score;
  const mins = Math.floor(quizState.totalTime / 60);
  const secs = quizState.totalTime % 60;
  document.getElementById('stat-time').textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function showReview() {
  showScreen('screen-review');
  const list = document.getElementById('review-list');
  list.innerHTML = '';
  quizState.answers.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = `review-item ${a.correct ? 'correct' : 'wrong'}`;
    const optsHtml = a.q.opts.map((opt, idx) => {
      let cls = '';
      if (idx === a.q.ans) cls = 'r-correct';
      else if (idx === a.selected && !a.correct) cls = 'r-wrong';
      return cls ? `<div class="review-opt ${cls}">${idx === a.q.ans ? '✅' : '❌'} ${opt}</div>` : '';
    }).join('');
    const imgHtml = a.q.img ? `<img class="q-img" src="${a.q.img}" alt="Señal de tránsito">` : '';
    div.innerHTML = `
      <p class="review-q">${i+1}. ${a.q.q}</p>
      ${imgHtml}
      <div class="review-opts">${optsHtml}</div>
      <p style="font-size:.8rem;color:var(--text-light);margin-top:.5rem"><i class="fa-solid fa-lightbulb"></i> ${a.q.exp}</p>
    `;
    list.appendChild(div);
  });
}

/* ── EVENTOS ── */
document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-next').addEventListener('click', nextQuestion);
document.getElementById('btn-retry').addEventListener('click', () => showScreen('screen-start'));
document.getElementById('btn-review').addEventListener('click', showReview);
document.getElementById('btn-back-results').addEventListener('click', () => showScreen('screen-results'));

/* ── DARK MODE ── */
const darkToggle = document.getElementById('dark-toggle');
if (localStorage.getItem('cale-dark') === '1') {
  document.body.classList.add('dark');
  darkToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('cale-dark', isDark ? '1' : '0');
  darkToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

/* ── CARGA INICIAL DESDE SUPABASE ── */
(async () => {
  const preguntas = await cargarPreguntas();
  if (preguntas && preguntas.length >= 10) {
    PREGUNTAS_CARGADAS = preguntas;
    console.log(`✅ ${preguntas.length} preguntas cargadas desde Supabase`);
  } else {
    console.warn("⚠️ Usando banco local como fallback");
  }
})();
