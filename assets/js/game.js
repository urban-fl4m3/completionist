/*  ============================================================
 *  GAME PAGE ENGINE
 *  ============================================================
 *  Один движок на все страницы игр. Он рисует чеклист целей и
 *  считает прогресс, но НИЧЕГО не решает про внешний вид —
 *  оформление целиком на CSS конкретной страницы.
 *
 *  КОНТРАКТ РАЗМЕТКИ
 *  -----------------
 *  <body data-game="slug">            — какую игру показывать
 *  [data-goals]                       — контейнер для чеклиста
 *  [data-ring]                        — контейнер для SVG-кольца
 *  [data-progress-pct]                — текст: 73
 *  [data-progress-done]               — текст: 11
 *  [data-progress-total]              — текст: 15
 *  [data-progress-bar]                — элемент, которому ставится
 *                                       style.width = "73%"
 *  [data-export]                      — кнопка «скопировать патч»
 *  [data-reset]                       — кнопка «сбросить локальное»
 *  [data-local-badge]                 — индикатор несохранённых отметок
 *
 *  СОБЫТИЯ (на document)
 *  ---------------------
 *  completionist:render   { game, progress }
 *  completionist:toggle   { game, goal, done, progress }  — для VFX
 *  ============================================================ */

(function () {
  'use strict';

  var C = window.Completionist;

  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="currentColor" ' +
    'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- Отрисовка чеклиста ---------------------------- */

  function renderGoals(game, container) {
    var groups = C.groupGoals(game);
    var html = groups.map(function (group) {
      var done = group.goals.filter(function (g) { return C.isDone(game, g); }).length;

      var items = group.goals.map(function (goal) {
        var isDone = C.isDone(game, goal);
        return (
          '<li class="g-goal' + (isDone ? ' is-done' : '') +
            (goal.optional ? ' is-optional' : '') + '" data-goal-id="' +
            C.escapeHtml(goal.id) + '">' +
            '<button type="button" class="g-goal__toggle" role="checkbox" ' +
              'aria-checked="' + isDone + '">' +
              '<span class="g-goal__box" aria-hidden="true">' + CHECK_SVG + '</span>' +
              '<span class="g-goal__body">' +
                '<span class="g-goal__title">' + C.escapeHtml(goal.title) + '</span>' +
                (goal.note
                  ? '<span class="g-goal__note">' + C.escapeHtml(goal.note) + '</span>'
                  : '') +
              '</span>' +
              (goal.optional
                ? '<span class="g-goal__flag">бонус</span>'
                : '') +
            '</button>' +
          '</li>'
        );
      }).join('');

      return (
        '<section class="g-group" data-group="' + C.escapeHtml(group.name) + '">' +
          '<header class="g-group__head">' +
            '<h3 class="g-group__name">' + C.escapeHtml(group.name) + '</h3>' +
            '<span class="g-group__count"><b>' + done + '</b>/' + group.goals.length + '</span>' +
          '</header>' +
          '<ul class="g-list">' + items + '</ul>' +
        '</section>'
      );
    }).join('');

    container.innerHTML = html;
  }

  /* ---------- Кольцо прогресса ------------------------------
   *  Рисуем SVG-кольцо. Толщину и размер можно задать через
   *  data-атрибуты, цвета — через CSS (stroke у .ring__value).
   * --------------------------------------------------------- */

  function buildRing(host) {
    var size = Number(host.getAttribute('data-ring-size')) || 160;
    var width = Number(host.getAttribute('data-ring-width')) || 10;
    var r = (size - width) / 2;
    var c = 2 * Math.PI * r;

    host.innerHTML =
      '<svg class="ring" viewBox="0 0 ' + size + ' ' + size + '" ' +
        'width="' + size + '" height="' + size + '" aria-hidden="true">' +
        '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 +
          '" r="' + r + '" fill="none" stroke-width="' + width + '"/>' +
        '<circle class="ring__value" cx="' + size / 2 + '" cy="' + size / 2 +
          '" r="' + r + '" fill="none" stroke-width="' + width + '" ' +
          'stroke-linecap="round" stroke-dasharray="' + c + '" ' +
          'stroke-dashoffset="' + c + '" ' +
          'transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
      '</svg>';

    return { circumference: c, value: qs('.ring__value', host) };
  }

  function setRing(ring, pct) {
    if (!ring || !ring.value) return;
    var offset = ring.circumference * (1 - pct / 100);
    ring.value.style.strokeDashoffset = offset;
  }

  /* ---------- Счётчик с анимацией --------------------------- */

  function animateNumber(el, to, duration) {
    if (!el) return;
    var from = Number(el.textContent) || 0;
    /* На скрытой вкладке rAF не вызывается — ставим значение сразу,
       иначе цифра зависла бы на старом состоянии. */
    if (C.reducedMotion() || document.hidden || from === to) {
      el.textContent = to;
      return;
    }

    var start = performance.now();
    var dur = duration || 600;

    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      /* easeOutCubic */
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Экспорт локальных отметок --------------------- */

  function buildPatch(game) {
    var lines = game.goals.map(function (goal) {
      return '  ' + goal.id + ': ' + (C.isDone(game, goal) ? 'done' : 'not done') +
        '   // ' + goal.title;
    });

    return (
      '# ' + game.title + ' — состояние целей на ' +
      new Date().toISOString().slice(0, 10) + '\n' +
      '# Прогресс: ' + C.progress(game).pct + '%\n\n' +
      lines.join('\n') + '\n'
    );
  }

  function copyPatch(game, button) {
    var text = buildPatch(game);
    var label = button.getAttribute('data-label') || button.textContent;

    function done(ok) {
      button.textContent = ok ? 'Скопировано' : 'Не удалось';
      button.classList.toggle('is-ok', ok);
      setTimeout(function () {
        button.textContent = label;
        button.classList.remove('is-ok');
      }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { done(true); },
        function () { done(false); }
      );
    } else {
      /* Фолбэк для старых браузеров и file:// */
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  }

  /* ---------- Сборка страницы ------------------------------- */

  function init() {
    var slug = document.body.getAttribute('data-game');
    if (!slug) return;

    var game = C.find(slug);
    if (!game) {
      console.error('[completionist] Игра не найдена в data/games.js:', slug);
      return;
    }

    /* Акцентные цвета игры прокидываем в CSS-переменные, чтобы
       разметка и VFX могли их использовать без дублирования. */
    var root = document.documentElement;
    if (game.accent) {
      root.style.setProperty('--accent', game.accent);
      root.style.setProperty('--accent-rgb', C.rgb(game.accent));
    }
    if (game.accentAlt) {
      root.style.setProperty('--accent-alt', game.accentAlt);
      root.style.setProperty('--accent-alt-rgb', C.rgb(game.accentAlt));
    }

    var goalsHost = qs('[data-goals]');
    var ringHost = qs('[data-ring]');
    var ring = ringHost ? buildRing(ringHost) : null;

    function refresh(animate) {
      var p = C.progress(game);

      qsa('[data-progress-pct]').forEach(function (el) {
        if (animate) animateNumber(el, p.pct);
        else el.textContent = p.pct;
      });
      qsa('[data-progress-done]').forEach(function (el) {
        if (animate) animateNumber(el, p.required.done);
        else el.textContent = p.required.done;
      });
      qsa('[data-progress-total]').forEach(function (el) {
        el.textContent = p.required.total;
      });
      qsa('[data-progress-bar]').forEach(function (el) {
        el.style.width = p.pct + '%';
      });

      setRing(ring, p.pct);

      document.body.classList.toggle('is-perfect', p.perfect);
      document.body.classList.toggle('is-absolute', p.absolute);

      var badge = qs('[data-local-badge]');
      if (badge) {
        badge.hidden = !C.hasLocalChanges(game);
      }

      return p;
    }

    if (goalsHost) {
      renderGoals(game, goalsHost);

      goalsHost.addEventListener('click', function (event) {
        var toggle = event.target.closest('.g-goal__toggle');
        if (!toggle) return;

        var item = toggle.closest('.g-goal');
        var goalId = item.getAttribute('data-goal-id');
        var goal = game.goals.filter(function (g) { return g.id === goalId; })[0];
        if (!goal) return;

        var next = !C.isDone(game, goal);
        C.setGoalLocal(slug, goalId, next);

        item.classList.toggle('is-done', next);
        toggle.setAttribute('aria-checked', String(next));

        /* Обновляем счётчик своей группы. */
        var section = item.closest('.g-group');
        if (section) {
          var all = qsa('.g-goal', section);
          var doneCount = all.filter(function (li) {
            return li.classList.contains('is-done');
          }).length;
          var counter = qs('.g-group__count b', section);
          if (counter) counter.textContent = doneCount;
        }

        var p = refresh(true);

        /* Сигнал для VFX конкретной страницы. */
        document.dispatchEvent(new CustomEvent('completionist:toggle', {
          detail: { game: game, goal: goal, done: next, progress: p, element: item },
        }));
      });
    }

    var exportBtn = qs('[data-export]');
    if (exportBtn) {
      exportBtn.setAttribute('data-label', exportBtn.textContent);
      exportBtn.addEventListener('click', function () { copyPatch(game, exportBtn); });
    }

    var resetBtn = qs('[data-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        C.clearLocal(slug);
        renderGoals(game, goalsHost);
        refresh(true);
      });
    }

    var initial = refresh(false);

    /* Плавный пуск кольца и счётчиков после первого кадра. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { refresh(true); });
    });

    document.dispatchEvent(new CustomEvent('completionist:render', {
      detail: { game: game, progress: initial },
    }));

    /* Экспортируем наружу — иногда fx.js хочет знать про игру. */
    window.CURRENT_GAME = game;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
