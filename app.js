// app.js - نسخة محسّنة مع إصلاحات الوصول، المؤقت، والشريط

const questions = [
    {
        level: "المستكشفون الصغار",
        category: "🐸 البرمائيات",
        question: "أبدأ حياتي في الماء بذيل وأتنفس بالغلاصم (الخياشيم)، وعندما أُصبح كبيراً أعيش على اليابة وأتنفس بالرئتين.. فمن أنا؟",
        options: ["الضفدع", "الثعبان", "الأسد", "السمكة"],
        answer: 0,
        explanation: "إجابة موفقة! الضفدع يمر بتحول كامل من حياة مائية إلى برمائية."
    },
    {
        level: "المستكشفون الصغار",
        category: "🐾 الثدييات",
        question: "أي من هذه الحيوانات يُعتبر من الثدييات ويتميز بتغطية جسمه بالشعر أو الفرو ويرضع صغاره الحليب؟",
        options: ["السلحفاة", "القطة", "الصقر", "التمساح"],
        answer: 1,
        explanation: "صحيح تماماً! القطة حيوان ثديي يلد ولا يبيض ويرضع صغاره."
    },
    {
        level: "علماء الطبيعة الشباب",
        category: "🦎 الزواحف",
        question: "لماذا تُصنف السحالي والأفاعي ضمن الكائنات (متغيرة الحرارة)؟",
        options: [
            "لأنها تعيش في الأقطاب المتجمدة فقط",
            "لأن درجة حرارة أجسامها تتغير تبعاً لدرجة حرارة البيئة المحيطة",
            "لأنها تنتج حرارة ذاتية عالية جداً",
            "لأنها لا تتعرض لأشعة الشمس قط"
        ],
        answer: 1,
        explanation: "رائع! الزواحف تعتمد على مصدر حراري خارجي (مثل الشمس) لتدفئة أجسامها."
    },
    {
        level: "علماء الطبيعة الشباب",
        category: "🥚 تكاثر الحيوانات",
        question: "هل توجد أي حيوانات تُصنف ضمن (الثدييات) ولكنها تبيض بدلاً من أن تلد؟",
        options: [
            "لا، جميع الثدييات تلد قطعا",
            "نعم، مثل خلد الماء (المنقوش) وناكل النمل الشوكي",
            "نعم، جميع الحيتان تبيض",
            "لا توجد ثدييات تبيض إلا في الخيال"
        ],
        answer: 1,
        explanation: "معلومة متقدمة دقيقة! حيوان خلد الماء (Platypus) يعتبر من الثدييات الفريدة التي تضع بيضاً."
    },
    {
        level: "خبراء النظم البيئية",
        category: "🌿 التكيف والبيئة",
        question: "لماذا تُعد البرمائيات (مؤشراً حيوياً مبكراً) للتلوث البيئي في المسطحات المائية؟",
        options: [
            "لأنها تمشي بسرعة فائقة وتهرب من التلوث",
            "لأن جلودها الرطبة والنفاذة تمتص الملوثات والمواد السامة بسرعة",
            "لأنها لا تتأثر نهائياً بالمواد الكيميائية",
            "لأنها تتكاثر فقط في المياه الملوثة"
        ],
        answer: 1,
        explanation: "إجابة الخبراء! نفاذية جلد البرمائيات تجعلها حساسة للغاية لأقل تغيير في جودة البيئة."
    }
];

let state = {
    playerName: "",
    currentQuestionIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 30
};

// عناصر DOM
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const nameInput = document.getElementById('player-name');
const displayPlayer = document.getElementById('display-player');
const scoreEl = document.getElementById('score');
const categoryTag = document.getElementById('category-tag');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const timerEl = document.getElementById('timer');
const resultBadge = document.getElementById('result-badge');
const endTitle = document.getElementById('end-title');
const finalScoreText = document.getElementById('final-score-text');

// أحداث
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
nextBtn.addEventListener('click', nextQuestion);

// دعم Enter للبدء
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startGame(); });

// تحميل الاسم المحفوظ (تجربة مستخدم أفضل)
if (localStorage.getItem('playerName')) {
    nameInput.value = localStorage.getItem('playerName');
}

function startGame() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('لطفاً، أدخل اسمك لبدء المغامرة!');
        nameInput.focus();
        return;
    }
    state.playerName = name;
    localStorage.setItem('playerName', name);
    displayPlayer.innerText = `👤 ${state.playerName}`;

    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');

    state.currentQuestionIndex = 0;
    state.score = 0;
    updateScore();

    loadQuestion();
}

function loadQuestion() {
    // تأكد من تنظيف أي مؤقت سابق
    clearTimer();

    const q = questions[state.currentQuestionIndex];

    // تحديث شريط التقدم (تصحيح الحساب بتضمين السؤال الحالي)
    const progressPercent = ((state.currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    categoryTag.innerText = q.category;
    questionText.innerText = q.question;

    // توليد الخيارات مع دعم لوحة المفاتيح وسمات الوصول
    optionsContainer.innerHTML = '';

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.type = 'button';
        btn.innerText = option;
        btn.setAttribute('data-index', index);
        btn.setAttribute('aria-pressed', 'false');
        btn.tabIndex = 0;

        btn.addEventListener('click', () => selectAnswer(index, btn));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAnswer(index, btn);
            }
        });

        optionsContainer.appendChild(btn);
    });

    // إخفاء التالي والتغذية الراجعة
    nextBtn.classList.add('hidden');
    feedbackEl.classList.add('hidden');

    // بدء المؤقت
    resetTimer();

    // وضع الفوكس على أول خيار لسهولة الوصول
    const firstOption = optionsContainer.querySelector('.option-btn');
    if (firstOption) firstOption.focus();
}

function resetTimer() {
    clearTimer();
    state.timeLeft = 30;
    timerEl.innerText = `⏱️ ${state.timeLeft} ثانية`;

    state.timer = setInterval(() => {
        state.timeLeft--;
        timerEl.innerText = `⏱️ ${state.timeLeft} ثانية`;
        if (state.timeLeft <= 0) {
            clearTimer();
            handleTimeOut();
        }
    }, 1000);
}

function clearTimer() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
}

function handleTimeOut() {
    const q = questions[state.currentQuestionIndex];
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    const correctBtn = buttons[q.answer];
    if (correctBtn) correctBtn.classList.add('correct');

    showFeedback(`انتهى الوقت! ⌛ ${q.explanation}`, false);
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
}

function selectAnswer(selectedIndex, selectedBtn) {
    clearTimer();

    const q = questions[state.currentQuestionIndex];
    const buttons = optionsContainer.querySelectorAll('.option-btn');

    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.answer) {
        selectedBtn.classList.add('correct');
        state.score += 20; // 20 نقطة لكل سؤال صحيح
        updateScore();
        showFeedback(`إجابة صحيحة وبطلة! 🎉 ${q.explanation}`, true);
    } else {
        selectedBtn.classList.add('incorrect');
        const correctBtn = buttons[q.answer];
        if (correctBtn) correctBtn.classList.add('correct');
        showFeedback(`إجابة خاطئة! ❌ ${q.explanation}`, false);
    }

    nextBtn.classList.remove('hidden');
    nextBtn.focus();
}

function showFeedback(text, isCorrect) {
    feedbackEl.innerText = text;
    feedbackEl.className = `feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
    feedbackEl.classList.remove('hidden');
}

function nextQuestion() {
    state.currentQuestionIndex++;
    if (state.currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showEndScreen();
    }
}

function updateScore() {
    scoreEl.innerText = state.score;
}

function showEndScreen() {
    clearTimer();
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');

    if (state.score >= 80) {
        resultBadge.innerText = '🌟🏆';
        endTitle.innerText = `هنيئاً لك يا ${state.playerName}!`;
        finalScoreText.innerHTML = `أنت خبير حقيقي في العلوم الطبيعية وعالم الحيوان!<br>مجموع نقاطك: <strong>${state.score} / 100</strong>`;
    } else if (state.score >= 40) {
        resultBadge.innerText = '🥈📘';
        endTitle.innerText = `عمل رائع يا ${state.playerName}!`;
        finalScoreText.innerHTML = `لديك معلومات ممتازة وتحتاج لمراجعة بسيطة لتكون خبيراً مطلقاً.<br>مجموع نقاطك: <strong>${state.score} / 100</strong>`;
    } else {
        resultBadge.innerText = '🌱💡';
        endTitle.innerText = `حاول مرة أخرى يا ${state.playerName}!`;
        finalScoreText.innerHTML = `المملكة مليئة بالأسرار، جرب التحدي مجدداً لترفع رصيدك المعرفي.<br>مجموع نقاطك: <strong>${state.score} / 100</strong>`;
    }

    // حفظ نتيجة بسيطة في localStorage (لإمكانية إضافة لوحة لاحقاً)
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({ name: state.playerName, score: state.score, date: new Date().toISOString() });
    localStorage.setItem('history', JSON.stringify(history));
}

function restartGame() {
    clearTimer();
    state.currentQuestionIndex = 0;
    state.score = 0;
    updateScore();

    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    loadQuestion();
}

// تحسّن: تأمين العرض على إعادة تحميل الصفحة إن كانت اللعبة جارية
window.addEventListener('beforeunload', () => { clearTimer(); });

// تجربة مستخدم: ضع الفوكس مباشرة على حقل الاسم عند تحميل الصفحة
window.addEventListener('load', () => { nameInput.focus(); });
