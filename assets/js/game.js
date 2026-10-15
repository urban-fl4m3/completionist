/*  ============================================================
 *  GAME PAGE ENGINE
 *  ============================================================
 *  Сайт НЕ интерактивный. Движок только ПОКАЗЫВАЕТ состояние
 *  из data/games.js: ничего не кликается и никуда не пишется.
 *  Прогресс меняется промптом, а не мышкой.
 *
 *  Движок намеренно маленький: он отвечает за цифры, цели и
 *  подачу артов. Всё содержательное наполнение страницы —
 *  боссы, акты, предметы, карты — пишется прямо в HTML этой
 *  игры, чтобы каждая страница могла выглядеть как угодно.
 *
 *  КОНТРАКТ РАЗМЕТКИ
 *  -----------------
 *  <body data-game="slug">   какую игру показывать
 *  [data-goals]              контейнер для списка целей
 *  [data-ring]               контейнер для SVG-кольца
 *  [data-logo]               сюда встанет логотип, если загрузится
 *  [data-links]              сюда встанут ссылки игры
 *  [data-progress-pct]       число процентов
 *  [data-progress-done]      закрытых обязательных целей
 *  [data-progress-total]     всего обязательных целей
 *  [data-progress-bar]       элемент, которому ставится width
 *  [data-count-worth]        «стоит того»: сделано/всего
 *  [data-count-grind]        «душнина»: сделано/всего
 *
 *  CSS-ПЕРЕМЕННЫЕ на :root
 *  --accent, --accent-rgb, --accent-alt, --accent-alt-rgb
 *  --art-hero, --art-banner, --art-capsule, --art-logo
 *
 *  КЛАССЫ на <body>
 *  has-art, has-logo, logo-failed, is-perfect, is-absolute
 *  ============================================================ */

(function () {
  'use strict';

  var C = window.Completionist;

  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="currentColor" ' +
    'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var BOOK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13' +
    'a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4' +
    'H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z"/></svg>';

  var LINK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M14 4h6v6M20 4l-8.5 8.5"/>' +
    '<path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- Цели ------------------------------------------ */

  function goalHtml(game, goal) {
    var done = C.isDone(game, goal);
    var t = C.tier(goal);

    var link = goal.link
      ? '<a class="g-goal__link" href="' + C.escapeHtml(goal.link) + '" ' +
          'target="_blank" rel="noopener noreferrer" ' +
          'title="' + C.escapeHtml(goal.linkLabel || 'Открыть гайд') + '">' +
          '<span class="sr-only">Гайд: ' + C.escapeHtml(goal.title) + '</span>' +
          BOOK_SVG +
        '</a>'
      : '';

    /* Метку показываем только у необязательных — «маст» и так
       понятен по умолчанию и не должен шуметь в списке. */
    var flag = t.id === 'must'
      ? ''
      : '<span class="g-goal__flag" data-tier="' + t.id + '">' +
          C.escapeHtml(t.short) + '</span>';

    return (
      '<li class="g-goal' + (done ? ' is-done' : '') + '" ' +
        'data-goal-id="' + C.escapeHtml(goal.id) + '" ' +
        'data-tier="' + t.id + '">' +
        '<span class="g-goal__state" role="img" ' +
          'aria-label="' + (done ? 'Выполнено' : 'Не выполнено') + '">' +
          '<span class="g-goal__box" aria-hidden="true">' + CHECK_SVG + '</span>' +
        '</span>' +
        '<span class="g-goal__body">' +
          '<span class="g-goal__title">' + C.escapeHtml(goal.title) + '</span>' +
          (goal.note
            ? '<span class="g-goal__note">' + C.escapeHtml(goal.note) + '</span>'
            : '') +
        '</span>' +
        flag + link +
      '</li>'
    );
  }

  function renderGoals(game, container) {
    container.innerHTML = C.groupGoals(game).map(function (group) {
      var done = group.goals.filter(function (g) {
        return C.isDone(game, g);
      }).length;

      return (
        '<section class="g-group" data-group="' + C.escapeHtml(group.name) + '">' +
          '<header class="g-group__head">' +
            '<h3 class="g-group__name">' + C.escapeHtml(group.name) + '</h3>' +
            '<span class="g-group__count"><b>' + done + '</b>/' +
              group.goals.length + '</span>' +
          '</header>' +
          '<ul class="g-list">' +
            group.goals.map(function (g) { return goalHtml(game, g); }).join('') +
          '</ul>' +
        '</section>'
      );
    }).join('');
  }

  /* ---------- Кольцо прогресса ------------------------------ */

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

  /* ---------- Арты ------------------------------------------ */

  function applyArt(game, root) {
    var art = C.art(game);

    ['hero', 'banner', 'capsule', 'logo'].forEach(function (key) {
      root.style.setProperty(
        '--art-' + key,
        art[key] ? 'url("' + art[key] + '")' : 'none'
      );
    });

    document.body.classList.toggle('has-art', !!art.hero);

    var host = qs('[data-logo]');
    if (!host || !art.logo) return;

    var img = new Image();
    img.className = 'game-logo';
    img.alt = game.title;

    img.onload = function () {
      host.appendChild(img);
      document.body.classList.add('has-logo');
    };
    img.onerror = function () {
      document.body.classList.add('logo-failed');
    };

    img.src = art.logo;
  }

  /* ---------- Ссылки ---------------------------------------- */

  function renderLinks(game) {
    var host = qs('[data-links]');
    if (!host) return;

    var list = C.links(game);
    if (!list.length) { host.hidden = true; return; }

    host.innerHTML = list.map(function (link) {
      return '<a class="g-link" data-kind="' + C.escapeHtml(link.kind || 'other') +
        '" href="' + C.escapeHtml(link.url) + '" target="_blank" ' +
        'rel="noopener noreferrer">' +
        '<span>' + C.escapeHtml(link.label) + '</span>' + LINK_SVG +
      '</a>';
    }).join('');
  }

  /* ---------- Сборка ---------------------------------------- */

  function init() {
    var slug = document.body.getAttribute('data-game');
    if (!slug) return;

    var game = C.find(slug);
    if (!game) {
      console.error('[completionist] Игра не найдена в data/games.js:', slug);
      return;
    }

    var root = document.documentElement;
    if (game.accent) {
      root.style.setProperty('--accent', game.accent);
      root.style.setProperty('--accent-rgb', C.rgb(game.accent));
    }
    if (game.accentAlt) {
      root.style.setProperty('--accent-alt', game.accentAlt);
      root.style.setProperty('--accent-alt-rgb', C.rgb(game.accentAlt));
    }

    applyArt(game, root);
    renderLinks(game);

    var goalsHost = qs('[data-goals]');
    if (goalsHost) renderGoals(game, goalsHost);

    var p = C.progress(game);

    qsa('[data-progress-pct]').forEach(function (el)   { el.textContent = p.pct; });
    qsa('[data-progress-done]').forEach(function (el)  { el.textContent = p.must.done; });
    qsa('[data-progress-total]').forEach(function (el) { el.textContent = p.must.total; });

    qsa('[data-count-worth]').forEach(function (el) {
      el.textContent = p.worth.done + '/' + p.worth.total;
    });
    qsa('[data-count-grind]').forEach(function (el) {
      el.textContent = p.grind.done + '/' + p.grind.total;
    });

    document.body.classList.toggle('is-perfect', p.perfect);
    document.body.classList.toggle('is-absolute', p.absolute);

    /* Кольцо и полосу запускаем через кадр, чтобы сыграла анимация. */
    var ringHost = qs('[data-ring]');
    var ring = ringHost ? buildRing(ringHost) : null;

    function fill() {
      if (ring && ring.value) {
        ring.value.style.strokeDashoffset =
          ring.circumference * (1 - p.pct / 100);
      }
      qsa('[data-progress-bar]').forEach(function (el) {
        el.style.width = p.pct + '%';
      });
    }

    if (C.reducedMotion() || document.hidden) fill();
    else requestAnimationFrame(function () { requestAnimationFrame(fill); });

    window.CURRENT_GAME = game;

    document.dispatchEvent(new CustomEvent('completionist:render', {
      detail: { game: game, progress: p },
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
