/*  ============================================================
 *  CORE — общий движок для хаба и всех страниц игр
 *  ============================================================
 *  Отвечает за: статусы, математику прогресса, локальный слой
 *  отметок (localStorage), агрегированную статистику.
 *
 *  Страницы игр используют только то, что здесь объявлено, —
 *  поэтому их можно оформлять как угодно, логика не ломается.
 *  ============================================================ */

window.Completionist = (function () {
  'use strict';

  var STORE_KEY = 'completionist:v1:progress';

  /* ---------- Статусы --------------------------------------- */

  var STATUSES = [
    { id: 'completed',   label: 'Пройдено',   verb: 'Пройдена',   accent: '#3ddc97', order: 0 },
    { id: 'in-progress', label: 'В процессе', verb: 'В процессе', accent: '#ffb347', order: 1 },
    { id: 'on-hold',     label: 'Отложено',   verb: 'Отложена',   accent: '#b48cff', order: 2 },
    { id: 'planned',     label: 'В планах',   verb: 'В планах',   accent: '#6aa6ff', order: 3 },
    { id: 'dropped',     label: 'Дропнуто',   verb: 'Дропнута',   accent: '#ff5f6d', order: 4 },
  ];

  var STATUS_MAP = {};
  STATUSES.forEach(function (s) { STATUS_MAP[s.id] = s; });

  function status(id) {
    return STATUS_MAP[id] || { id: id, label: id, verb: id, accent: '#8b90a3', order: 99 };
  }

  /* ---------- Локальный слой отметок ------------------------
   *  data/games.js — это «закоммиченная» правда. Галочки,
   *  которые ты ставишь на сайте, живут в localStorage как
   *  наложение сверху, чтобы ничего не терялось между
   *  коммитами. Кнопка «Экспорт» на странице игры отдаёт их
   *  в виде готового патча.
   * --------------------------------------------------------- */

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      return false;
    }
  }

  function overlayFor(slug) {
    var store = readStore();
    return store[slug] || {};
  }

  function setGoalLocal(slug, goalId, value) {
    var store = readStore();
    if (!store[slug]) store[slug] = {};
    store[slug][goalId] = !!value;
    writeStore(store);
  }

  function clearLocal(slug) {
    var store = readStore();
    delete store[slug];
    writeStore(store);
  }

  function hasLocalChanges(game) {
    var ov = overlayFor(game.slug);
    return game.goals.some(function (g) {
      return ov.hasOwnProperty(g.id) && ov[g.id] !== !!g.done;
    });
  }

  /** Итоговое состояние цели: локальная отметка важнее файла. */
  function isDone(game, goal) {
    var ov = overlayFor(game.slug);
    return ov.hasOwnProperty(goal.id) ? !!ov[goal.id] : !!goal.done;
  }

  /* ---------- Прогресс -------------------------------------- */

  /**
   * Обязательные цели формируют основной процент.
   * Цели с optional:true считаются бонусом и в процент не входят.
   */
  function progress(game) {
    var goals = game.goals || [];
    var req = { done: 0, total: 0 };
    var opt = { done: 0, total: 0 };

    goals.forEach(function (g) {
      var bucket = g.optional ? opt : req;
      bucket.total += 1;
      if (isDone(game, g)) bucket.done += 1;
    });

    var pct = req.total ? Math.round((req.done / req.total) * 100) : 0;

    return {
      required: req,
      optional: opt,
      pct: pct,
      all: { done: req.done + opt.done, total: req.total + opt.total },
      /* «Закрыта на 100%» = все обязательные цели выполнены. */
      perfect: req.total > 0 && req.done === req.total,
      /* «Абсолют» = закрыты даже опциональные челленджи. */
      absolute: req.total > 0 && req.done === req.total && opt.done === opt.total,
    };
  }

  /* ---------- Данные --------------------------------------- */

  function data() {
    return window.COMPLETIONIST_DATA || { profile: {}, games: [] };
  }

  function games() {
    return (data().games || []).slice();
  }

  function find(slug) {
    return games().filter(function (g) { return g.slug === slug; })[0] || null;
  }

  function byStatus(id) {
    return games().filter(function (g) { return g.status === id; });
  }

  /* ---------- Агрегированная статистика -------------------- */

  function stats() {
    var list = games();
    var counts = {};
    STATUSES.forEach(function (s) { counts[s.id] = 0; });

    var goalsDone = 0;
    var goalsTotal = 0;
    var hours = 0;
    var perfect = 0;
    var ratings = [];

    list.forEach(function (g) {
      if (counts.hasOwnProperty(g.status)) counts[g.status] += 1;

      var p = progress(g);
      goalsDone += p.required.done;
      goalsTotal += p.required.total;
      hours += Number(g.hours) || 0;
      if (p.perfect) perfect += 1;
      if (typeof g.rating === 'number') ratings.push(g.rating);
    });

    var avg = ratings.length
      ? ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length
      : null;

    return {
      total: list.length,
      counts: counts,
      goalsDone: goalsDone,
      goalsTotal: goalsTotal,
      goalsPct: goalsTotal ? Math.round((goalsDone / goalsTotal) * 100) : 0,
      hours: hours,
      perfect: perfect,
      avgRating: avg,
      /* Доля активных (в процессе + отложено) от общего числа. */
      active: counts['in-progress'] + counts['on-hold'],
    };
  }

  /* ---------- Утилиты оформления --------------------------- */

  /** Склонение русских существительных: plural(5, 'игра','игры','игр') */
  function plural(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function formatDate(iso) {
    if (!iso) return '—';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var d = Number(parts[2]);
    var m = Number(parts[1]) - 1;
    if (!MONTHS[m]) return iso;
    return d + ' ' + MONTHS[m] + ' ' + parts[0];
  }

  /** Сколько дней заняло прохождение. */
  function spanDays(from, to) {
    if (!from || !to) return null;
    var a = new Date(from);
    var b = new Date(to);
    if (isNaN(a) || isNaN(b)) return null;
    return Math.max(1, Math.round((b - a) / 86400000));
  }

  /** Группирует цели по полю group, сохраняя порядок появления. */
  function groupGoals(game) {
    var order = [];
    var map = {};
    (game.goals || []).forEach(function (g) {
      var key = g.group || 'Цели';
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(g);
    });
    return order.map(function (key) {
      return { name: key, goals: map[key] };
    });
  }

  /** Уважаем системную настройку «уменьшить анимацию». */
  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** hex -> "r, g, b" для использования внутри rgba(). */
  function rgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return '255, 255, 255';
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(', ');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Публичный интерфейс -------------------------- */

  return {
    STATUSES: STATUSES,
    status: status,
    data: data,
    games: games,
    find: find,
    byStatus: byStatus,
    progress: progress,
    stats: stats,
    isDone: isDone,
    setGoalLocal: setGoalLocal,
    clearLocal: clearLocal,
    overlayFor: overlayFor,
    hasLocalChanges: hasLocalChanges,
    groupGoals: groupGoals,
    plural: plural,
    formatDate: formatDate,
    spanDays: spanDays,
    reducedMotion: reducedMotion,
    rgb: rgb,
    escapeHtml: escapeHtml,
  };
})();
