'use strict';

/* ---------- Данные ---------- */
const KEY = 'ecoPoints';

// Порядок заданий менять нельзя: в localStorage хранятся их номера.
const TASKS = [
  { icon: '♻️', title: 'Сдать пластик', pts: 20, cat: 'sort', text: 'Сдай чистую упаковку в подходящий контейнер.' },
  { icon: '📄', title: 'Сдать макулатуру', pts: 30, cat: 'sort', text: 'Отнеси сухую бумагу в пункт сбора.' },
  { icon: '🔋', title: 'Сдать батарейки', pts: 25, cat: 'sort', text: 'Используй специальный пункт приёма.' },
  { icon: '🛍️', title: 'Взять экосумку', pts: 10, cat: 'habit', text: 'Откажись от одноразового пакета.' },
  { icon: '💧', title: 'Взять многоразовую бутылку', pts: 10, cat: 'habit', text: 'Используй свою бутылку для воды.' },
  { icon: '🌳', title: 'Участие в субботнике', pts: 100, cat: 'community', text: 'Присоединись к организованной уборке.' },
  { icon: '🥤', title: 'Отказаться от одноразового стакана', pts: 15, cat: 'habit', text: 'Возьми собственную кружку.' },
  { icon: '💡', title: 'Сэкономить электроэнергию', pts: 10, cat: 'habit', text: 'Выключи ненужное освещение.' },
  { icon: '🚶', title: 'Пройти пешком', pts: 15, cat: 'habit', text: 'Замени короткую поездку прогулкой.' },
  { icon: '📚', title: 'Передать ненужную книгу', pts: 20, cat: 'community', text: 'Подари книгу или передай в буккроссинг.' }
];
const CATS = { all: 'Все', sort: 'Сортировка', habit: 'Привычки', community: 'Сообщество' };
const QUIZ_REWARD = 20;
const PASS_SCORE = 4;

const QUIZ = [
  { q: 'Куда сдавать батарейки?', a: ['В обычный бак', 'В специальный пункт', 'В макулатуру'], ok: 1,
    why: 'Батарейки содержат тяжёлые металлы, поэтому их принимают только специальные пункты.' },
  { q: 'Какая бумага подходит для макулатуры?', a: ['Чистая и сухая', 'Мокрая', 'Жирная'], ok: 0,
    why: 'Мокрая и жирная бумага плохо перерабатывается и портит остальное вторсырьё.' },
  { q: 'Что помогает уменьшить одноразовые отходы?', a: ['Новый пакет каждый раз', 'Одноразовый стакан', 'Многоразовая сумка'], ok: 2,
    why: 'Одна многоразовая сумка заменяет множество одноразовых пакетов.' },
  { q: 'Что делать перед сдачей упаковки?', a: ['Проверить правила пункта и очистить', 'Смешать с пищевыми отходами', 'Сжечь'], ok: 0,
    why: 'Загрязнённая упаковка снижает качество вторсырья, а правила у пунктов приёма могут отличаться.' },
  { q: 'Что означает повторное использование?', a: ['Выбросить вещь', 'Использовать вещь снова', 'Купить замену'], ok: 1,
    why: 'Вещь продолжает служить без переработки — это лучше, чем выбросить.' }
];

const LEVELS = [
  { n: 'Эко-новичок', min: 0 }, { n: 'Эко-активист', min: 100 }, { n: 'Защитник природы', min: 150 },
  { n: 'Эко-герой', min: 200 }, { n: 'Эко-лидер', min: 250 }
];

const BINS = { plastic: '♻️ Пластик', paper: '📄 Бумага', glass: '🍾 Стекло', metal: '🥫 Металл', battery: '🔋 Спецпункт', other: '🗑️ Общий бак' };
const SORT_ITEMS = [
  { i: '🧴', n: 'Чистая пластиковая бутылка', b: 'plastic' },
  { i: '📰', n: 'Сухая газета', b: 'paper' },
  { i: '🥫', n: 'Жестяная банка', b: 'metal' },
  { i: '🔋', n: 'Использованная батарейка', b: 'battery' },
  { i: '🫙', n: 'Стеклянная банка', b: 'glass' },
  { i: '📦', n: 'Сухая картонная коробка', b: 'paper' },
  { i: '🍌', n: 'Банановая кожура', b: 'other' },
  { i: '🍟', n: 'Пакет из-под чипсов', b: 'other' }
];

const GUIDE = [
  ['♻️ Пластик', 'Проверяй маркировку и требования конкретного контейнера. Упаковку очисти.'],
  ['📄 Бумага', 'Сдавай чистую сухую бумагу и картон.'],
  ['🍾 Стекло', 'Сдавай тарное стекло там, где его принимают.'],
  ['🔋 Батарейки', 'Только специальные пункты сбора.'],
  ['🥫 Металл', 'Чистые банки — по правилам пункта приёма.'],
  ['⚠️ Важно', 'Не смешивай вторсырьё с пищевыми отходами.']
];

const ROUTES = [['home', 'Главная'], ['tasks', 'Задания'], ['badges', 'Достижения'], ['rating', 'Рейтинг'],
                ['quiz', 'Экотест'], ['sorting', 'Сортировка'], ['profile', 'Профиль']];

/* ---------- Состояние ---------- */
const clean = v => (typeof v === 'string' ? v.slice(0, 40) : '');

function load() {
  const s = { name: 'Студент', group: '', done: [], quiz: false, score: 0 };
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || '{}');
    s.name = clean(o.name).trim() || s.name;
    s.group = clean(o.group);
    if (Array.isArray(o.done)) {
      s.done = [...new Set(o.done.filter(i => Number.isInteger(i) && i >= 0 && i < TASKS.length))];
    }
    s.quiz = o.quiz === true;
    s.score = Number.isInteger(o.score) ? Math.min(Math.max(o.score, 0), QUIZ.length) : 0;
  } catch (e) { /* повреждённые данные — начинаем с нуля */ }
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* приватный режим */ } }

let s = load();
let route = 'home';
let filter = 'all';
let answers = {};
let quizResult = null;       // { score, passed } после проверки
let game = newGame();

const $ = sel => document.querySelector(sel);
const nav = $('#nav'), view = $('#view'), chip = $('#chip'), toastEl = $('#toast');
const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pts = () => s.done.reduce((a, i) => a + TASKS[i].pts, 0) + (s.quiz ? QUIZ_REWARD : 0);
const level = () => LEVELS.reduce((l, x, i) => (pts() >= x.min ? i : l), 0);
const badges = () => [
  ['🌱', 'Первый шаг', 'Выполни любое задание', s.done.length > 0],
  ['⭐', 'Первая сотня', 'Набери 100 ЭБ', pts() >= 100],
  ['♻️', 'Сортировщик', 'Пластик, макулатура и батарейки', [0, 1, 2].every(i => s.done.includes(i))],
  ['🌳', 'Волонтёр', 'Прими участие в субботнике', s.done.includes(5)],
  ['🧠', 'Экознаток', 'Пройди экотест минимум на 4 из 5', s.quiz],
  ['🏆', 'Экомарафон', 'Выполни все 10 заданий', s.done.length === TASKS.length]
];

function newGame() {
  const order = SORT_ITEMS.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { order, step: 0, right: 0, last: null };
}

/* ---------- Страницы ---------- */
const PAGES = {
  home() {
    const lv = level(), cur = LEVELS[lv], next = LEVELS[lv + 1];
    const pct = next ? Math.round(((pts() - cur.min) / (next.min - cur.min)) * 100) : 100;
    const hint = next ? `До уровня «${next.n}» — ${next.min - pts()} ЭБ` : 'Максимальный уровень — ты эко-лидер!';
    const nextTask = TASKS.findIndex((_, i) => !s.done.includes(i));
    return `
      <div class="hero">
        <div>
          <small>Маленькие действия — большие перемены</small>
          <h1>${s.name === 'Студент' ? 'Привет!' : `Привет, ${esc(s.name)}!`} Твой вклад в чистый город</h1>
          <p>Выполняй задания, копи баллы и открывай достижения.</p>
          <a class="btn" href="#/tasks">Начать действовать →</a>
        </div>
        <div class="hero-score">
          <small>Твой баланс</small>
          <div class="balance">${pts()} ЭБ</div>
          <div class="level">${cur.n}</div>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Прогресс до следующего уровня"><i style="width:${pct}%"></i></div>
          <small>${hint}</small>
        </div>
      </div>
      <h2>Твой прогресс</h2>
      <div class="grid">
        <div class="card"><small>Задания</small><div class="num">${s.done.length}/${TASKS.length}</div></div>
        <div class="card"><small>Достижения</small><div class="num">${badges().filter(b => b[3]).length}/${badges().length}</div></div>
        <div class="card"><small>Экотест</small><div class="num">${s.quiz ? 'Пройден' : 'Не пройден'}</div></div>
      </div>
      ${nextTask >= 0 ? `
      <h2>Следующий шаг</h2>
      <div class="card next"><span class="ico">${TASKS[nextTask].icon}</span><h3>${TASKS[nextTask].title}</h3>
        <p>${TASKS[nextTask].text}</p><span class="tag">+${TASKS[nextTask].pts} ЭБ</span><br>
        <button type="button" data-act="done" data-id="${nextTask}">Я это сделал(а)</button></div>` : ''}`;
  },

  tasks() {
    const list = TASKS.map((t, i) => ({ ...t, i })).filter(t => filter === 'all' || t.cat === filter);
    return `
      <h1>Экологические задания</h1>
      <p class="muted">Отмечай только действительно выполненные действия. Каждое задание доступно один раз в демоверсии.</p>
      <div class="filters" role="group" aria-label="Категория заданий">
        ${Object.entries(CATS).map(([k, n]) => `<button type="button" data-act="filter" data-id="${k}" aria-pressed="${k === filter}">${n}</button>`).join('')}
      </div>
      <div class="grid">${list.map(t => {
        const d = s.done.includes(t.i);
        return `<div class="card ${d ? 'done' : ''}"><span class="ico">${t.icon}</span><h3>${t.title}</h3><p>${t.text}</p>
          <span class="tag">+${t.pts} ЭБ</span><br>
          <button type="button" ${d ? 'disabled' : ''} data-act="done" data-id="${t.i}">${d ? '✓ Выполнено' : 'Подтвердить'}</button></div>`;
      }).join('')}</div>`;
  },

  badges() {
    return `<h1>Достижения</h1>
      <p class="muted">Открыто ${badges().filter(b => b[3]).length} из ${badges().length}.</p>
      <div class="grid">${badges().map(b => `
        <div class="card ${b[3] ? 'done' : 'locked'}"><span class="ico">${b[0]}</span><h3>${b[1]}</h3>
          <p>${b[2]}</p><small>${b[3] ? '✓ Открыто' : 'Пока закрыто'}</small></div>`).join('')}</div>`;
  },

  rating() {
    const rows = [
      { n: 'Демо: группа А', v: 180 }, { n: 'Демо: группа Б', v: 90 },
      { n: esc(s.group || s.name) + ' (вы)', v: pts(), me: true }
    ].sort((a, b) => b.v - a.v);
    return `<h1>Рейтинг</h1>
      <p class="muted">Демонстрационное сравнение: другие участники вымышлены, сетевого рейтинга нет.</p>
      <div class="card">${rows.map((r, i) => `<div class="line ${r.me ? 'me' : ''}"><span>${i + 1}. ${r.n}</span><b>${r.v} ЭБ</b></div>`).join('')}</div>`;
  },

  quiz() {
    if (s.quiz) {
      return `<h1>Экотест</h1><div class="result pass">✅ Тест пройден: ${s.score}/${QUIZ.length}. Начислено ${QUIZ_REWARD} ЭБ.</div>
        <p class="muted">Награда выдаётся один раз. Повторить тест можно, сбросив прогресс в профиле.</p>`;
    }
    const checked = quizResult !== null;
    const done = Object.keys(answers).length === QUIZ.length;
    return `<h1>Проверь экологические знания</h1>
      <p class="muted">Нужно минимум ${PASS_SCORE} верных ответов из ${QUIZ.length}, чтобы получить ${QUIZ_REWARD} ЭБ.</p>
      ${checked ? `<div class="result fail" role="alert">Верных ответов: ${quizResult.score}/${QUIZ.length}. Нужно минимум ${PASS_SCORE}. Прочитай пояснения и попробуй снова.</div>` : ''}
      ${QUIZ.map((q, i) => {
        const wrong = checked && answers[i] !== q.ok;
        return `<div class="card quiz ${checked ? (wrong ? 'bad' : 'ok') : ''}"><h3>${i + 1}. ${q.q}</h3>
          ${q.a.map((a, j) => `<button type="button" data-act="pick" data-q="${i}" data-a="${j}" aria-pressed="${answers[i] === j}" ${checked ? 'disabled' : ''}>${a}</button>`).join('')}
          ${wrong ? `<div class="why">Правильный ответ: <b>${q.a[q.ok]}</b>. ${q.why}</div>` : ''}</div>`;
      }).join('')}
      ${checked
        ? '<button type="button" data-act="retry">Попробовать снова</button>'
        : `<button type="button" data-act="check" ${done ? '' : 'disabled'}>Проверить ответы${done ? '' : ` (${Object.keys(answers).length}/${QUIZ.length})`}</button>`}`;
  },

  sorting() {
    const fin = game.step >= SORT_ITEMS.length;
    let play;
    if (fin) {
      play = `<div class="card game"><div class="item">🏁</div><h3>Готово: ${game.right} из ${SORT_ITEMS.length}</h3>
        <p class="muted">Это тренировка — баллы за неё не начисляются.</p>
        <button type="button" data-act="regame">Сыграть ещё раз</button></div>`;
    } else {
      const it = SORT_ITEMS[game.order[game.step]];
      const lock = game.last !== null;
      play = `<div class="card game"><small>Предмет ${game.step + 1} из ${SORT_ITEMS.length}</small>
        <div class="item" aria-hidden="true">${it.i}</div><div class="item-name">${it.n}</div>
        <div class="bins">${Object.entries(BINS).map(([k, n]) => `<button type="button" data-act="bin" data-id="${k}" ${lock ? 'disabled' : ''}>${n}</button>`).join('')}</div>
        <div class="feedback ${lock ? (game.last.ok ? 'good' : 'wrong') : ''}" role="status">${lock
          ? (game.last.ok ? '✓ Верно!' : `✗ Нет, правильно: ${BINS[it.b]}`) : ''}</div>
        ${lock ? '<button type="button" data-act="nextitem">Дальше →</button>' : ''}</div>`;
    }
    return `<h1>Как сортировать отходы</h1>
      <div class="grid">${GUIDE.map(r => `<div class="card"><h3>${r[0]}</h3><p>${r[1]}</p></div>`).join('')}</div>
      <h2>Мини-игра: куда это выбросить?</h2>${play}`;
  },

  profile() {
    return `<h1>Личный кабинет</h1>
      <div class="card"><form id="profile" autocomplete="off">
        <label for="nm">Имя или псевдоним</label><input id="nm" maxlength="40" value="${esc(s.name)}">
        <label for="gr">Учебная группа (необязательно)</label><input id="gr" maxlength="40" value="${esc(s.group)}">
        <div class="row"><button type="submit">Сохранить</button>
        <button type="button" class="ghost" data-act="reset">Сбросить прогресс</button></div>
        <p><small>Данные хранятся только в этом браузере и никуда не отправляются.</small></p>
      </form></div>`;
  }
};

/* ---------- Отрисовка ---------- */
function render(focus) {
  nav.innerHTML = ROUTES.map(([k, n]) =>
    `<a href="#/${k}" class="${k === route ? 'active' : ''}" ${k === route ? 'aria-current="page"' : ''}>${n}</a>`).join('');
  chip.textContent = `${pts()} ЭБ · ${LEVELS[level()].n}`;
  view.innerHTML = PAGES[route]();
  document.title = (route === 'home' ? '' : ROUTES.find(r => r[0] === route)[1] + ' — ') + 'ЭкоБаллы';
  if (focus) { view.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}

let toastTimer;
function toast(msg, ms = 2600) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function onHash() {
  const k = location.hash.replace(/^#\/?/, '');
  route = ROUTES.some(r => r[0] === k) ? k : 'home';
  render(true);
}

/* ---------- Действия ---------- */
const ACTIONS = {
  done(el) {
    const id = +el.dataset.id;
    if (s.done.includes(id)) return;
    const lvBefore = level(), badgesBefore = badges().filter(b => b[3]).length;
    s.done.push(id); save(); render();
    toast(`+${TASKS[id].pts} ЭБ — «${TASKS[id].title}»`);
    if (level() > lvBefore) setTimeout(() => toast(`🎉 Новый уровень: ${LEVELS[level()].n}!`, 3200), 1800);
    else if (badges().filter(b => b[3]).length > badgesBefore) setTimeout(() => toast('🏅 Открыто новое достижение!', 3000), 1800);
  },
  filter(el) { filter = el.dataset.id; render(); },
  pick(el) { answers[el.dataset.q] = +el.dataset.a; render(); },
  check() {
    const score = QUIZ.filter((q, i) => answers[i] === q.ok).length;
    if (score >= PASS_SCORE) {
      s.quiz = true; s.score = score; save(); quizResult = null; render();
      toast(`🧠 Тест пройден: +${QUIZ_REWARD} ЭБ`);
    } else { quizResult = { score }; render(); window.scrollTo(0, 0); }
  },
  retry() { answers = {}; quizResult = null; render(); window.scrollTo(0, 0); },
  bin(el) {
    const it = SORT_ITEMS[game.order[game.step]];
    const ok = el.dataset.id === it.b;
    if (ok) game.right++;
    game.last = { ok }; render();
  },
  nextitem() { game.step++; game.last = null; render(); },
  regame() { game = newGame(); render(); },
  reset() {
    if (!confirm('Удалить локальный прогресс?')) return;
    s.done = []; s.quiz = false; s.score = 0; answers = {}; quizResult = null; save(); render();
    toast('Прогресс сброшен');
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && !el.disabled && ACTIONS[el.dataset.act]) ACTIONS[el.dataset.act](el);
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'profile') return;
  e.preventDefault();
  s.name = $('#nm').value.trim().slice(0, 40) || 'Студент';
  s.group = $('#gr').value.trim().slice(0, 40);
  save(); render(); toast('Профиль сохранён');
});
window.addEventListener('hashchange', onHash);
onHash();
