/*  ============================================================
 *  HUB — коллекция игр
 *  ============================================================
 *  Главное на этой странице — сами игры. Статистика свёрнута
 *  в одну полосу в шапке и занимает минимум места.
 *  ============================================================ */

(function () {
  'use strict';

  var C = window.Completionist;
  var PREFS_KEY = 'completionist:v1:hubPrefs';

  var state = { filter: 'all', sort: 'recent', query: '' };

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  }

  /* ---------- Настройки вида (не данные) -------------------- */

  function loadPrefs() {
    try {
      var saved = JSON.parse(localStorage.getItem(PREFS_KEY));
      if (saved) {
        if (saved.filter) state.filter = saved.filter;
        if (saved.sort) state.sort = saved.sort;
      }
    } catch (e) { /* первый запуск */ }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY,
        JSON.stringify({ filter: state.filter, sort: state.sort }));
    } catch (e) { /* приватный режим */ }
  }

  /* ---------- Полоса статистики -----------------------------
   *  Вся сводка по коллекции в одну строку: она нужна, но не
   *  должна занимать первый экран вместо игр.
   * --------------------------------------------------------- */

  function renderTicker() {
    var host = qs('[data-ticker]');
    if (!host) return;

    var s = C.stats();

    var cells = [
      { value: s.goalsPct + '%', label: 'целей закрыто', accent: '#7c5cff',
        bar: s.goalsPct },
      { value: s.perfect + '/' + s.total, label: 'игр на 100%', accent: '#3ddc97' },
      { value: s.hours, label: C.plural(s.hours, 'час', 'часа', 'часов'),
        accent: '#ffb347' },
      { value: s.avgRating == null ? '—' : (Math.round(s.avgRating * 10) / 10),
        label: 'средняя оценка', accent: '#4ddbff' },
    ];

    host.innerHTML = cells.map(function (c) {
      return '<div class="ticker__cell" style="--tc:' + c.accent + '">' +
        '<b class="ticker__value">' + C.escapeHtml(String(c.value)) + '</b>' +
        '<span class="ticker__label">' + C.escapeHtml(c.label) + '</span>' +
        (c.bar != null
          ? '<span class="ticker__bar"><i style="width:' + c.bar + '%"></i></span>'
          : '') +
      '</div>';
    }).join('');
  }

  /* ---------- Фильтры --------------------------------------- */

  function renderFilters() {
    var host = qs('[data-filters]');
    if (!host) return;

    var s = C.stats();

    var chips = ['<button type="button" class="chip" data-status="all" ' +
      'aria-pressed="false" style="--chip:#7c5cff"><i></i>Все <b>' +
      s.total + '</b></button>'];

    C.STATUSES.forEach(function (st) {
      chips.push(
        '<button type="button" class="chip" data-status="' + st.id + '" ' +
        'aria-pressed="false" style="--chip:' + st.accent + '"><i></i>' +
        st.label + ' <b>' + s.counts[st.id] + '</b></button>'
      );
    });

    host.innerHTML = chips.join('');

    host.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      state.filter = chip.getAttribute('data-status');
      savePrefs();
      syncUI();
      renderCollection();
    });
  }

  function syncUI() {
    qsa('[data-filters] .chip').forEach(function (chip) {
      chip.setAttribute('aria-pressed',
        String(chip.getAttribute('data-status') === state.filter));
    });
    var sortEl = qs('[data-sort]');
    if (sortEl) sortEl.value = state.sort;
  }

  /* ---------- Сортировка ------------------------------------ */

  var SORTERS = {
    recent: function (a, b) {
      return (b.finished || b.started || '0000')
        .localeCompare(a.finished || a.started || '0000');
    },
    progress: function (a, b) { return C.progress(b).pct - C.progress(a).pct; },
    title: function (a, b) { return a.title.localeCompare(b.title, 'ru'); },
    hours: function (a, b) { return (+b.hours || 0) - (+a.hours || 0); },
    rating: function (a, b) { return (+b.rating || -1) - (+a.rating || -1); },
    status: function (a, b) {
      return C.status(a.status).order - C.status(b.status).order;
    },
  };

  /* ---------- Карточки --------------------------------------
   *  Карточка строится вокруг широкого кадра из игры с
   *  логотипом поверх — так коллекция читается как полка
   *  постеров, а не как таблица.
   * --------------------------------------------------------- */

  function angleFor(slug) {
    var sum = 0;
    for (var i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
    return 70 + (sum % 90);
  }

  function cardHtml(game, index) {
    var st = C.status(game.status);
    var p = C.progress(game);
    var art = C.art(game);
    var accent = game.accent || st.accent;
    var alt = game.accentAlt || accent;

    var meta = [];
    if (game.platform) meta.push(C.escapeHtml(game.platform));
    if (game.year) meta.push(game.year);
    if (game.hours) {
      meta.push(game.hours + ' ' + C.plural(game.hours, 'час', 'часа', 'часов'));
    }
    if (typeof game.rating === 'number') meta.push('★ ' + game.rating);

    /* Вертикальная обложка: она скомпонована как постер, в отличие
       от library_hero, у которого центр намеренно пустой под
       интерфейс библиотеки Steam. Если обложки нет — берём широкий
       кадр, а если и его нет, остаётся процедурный градиент. */
    var sceneSrc = art.capsule || art.hero || art.banner;
    var scene = sceneSrc
      ? '<img class="poster__scene" src="' + C.escapeHtml(sceneSrc) + '" alt="" ' +
        'loading="lazy" decoding="async">'
      : '';

    /* Логотип накладываем ТОЛЬКО когда обложки нет: вертикальная
       обложка уже содержит логотип, и второй поверх — мусор. */
    var logo = (!art.capsule && art.logo)
      ? '<img class="poster__logo" src="' + C.escapeHtml(art.logo) + '" alt="" ' +
        'loading="lazy" decoding="async">'
      : '';

    return (
      '<a class="poster reveal" href="games/' + encodeURIComponent(game.slug) + '/" ' +
        'style="--card-rgb:' + C.rgb(accent) +
        ';--card-alt-rgb:' + C.rgb(alt) +
        ';--card-status:' + st.accent +
        ';--card-angle:' + angleFor(game.slug) + 'deg' +
        ';transition-delay:' + Math.min(index * 60, 420) + 'ms">' +

        '<div class="poster__frame">' +
          '<span class="poster__glyph" aria-hidden="true">' +
            C.escapeHtml(game.title.charAt(0)) + '</span>' +
          scene +
          '<span class="poster__scrim" aria-hidden="true"></span>' +

          '<span class="poster__status">' + C.escapeHtml(st.label) + '</span>' +
          (p.perfect
            ? '<span class="poster__seal" title="Закрыта полностью">100%</span>'
            : '') +

          '<div class="poster__plate"' +
              (sceneSrc ? ' data-has-art' : '') + '>' +
            logo +
            '<h2 class="poster__title">' + C.escapeHtml(game.title) + '</h2>' +
            '<p class="poster__meta">' + meta.join('<i>·</i>') + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="poster__foot">' +
          '<div class="poster__track">' +
            '<div class="poster__fill" data-fill="' + p.pct + '"></div>' +
          '</div>' +
          '<div class="poster__nums">' +
            '<span><b>' + p.must.done + '</b>/' + p.must.total + ' обязательных</span>' +
            '<span class="poster__pct">' + p.pct + '%</span>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  var EMPTY_HTML =
    '<div class="empty">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
        'stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>' +
      '</svg>' +
      '<h3>Здесь пока пусто</h3>' +
      '<p>В этой категории нет игр — или поиск ничего не нашёл.</p>' +
    '</div>';

  function renderCollection() {
    var host = qs('[data-collection]');
    if (!host) return;

    var list = C.games();

    if (state.filter !== 'all') {
      list = list.filter(function (g) { return g.status === state.filter; });
    }

    if (state.query) {
      var q = state.query.toLowerCase();
      list = list.filter(function (g) {
        return [g.title, g.developer, g.platform]
          .concat(g.tags || []).join(' ').toLowerCase().indexOf(q) !== -1;
      });
    }

    list.sort(SORTERS[state.sort] || SORTERS.recent);

    host.innerHTML = list.length ? list.map(cardHtml).join('') : EMPTY_HTML;

    var count = qs('[data-visible-count]');
    if (count) {
      count.textContent = list.length + ' ' +
        C.plural(list.length, 'игра', 'игры', 'игр');
    }

    attachCardBehaviour(host);
  }

  /* ---------- Поведение карточек ---------------------------- */

  function attachCardBehaviour(host) {
    /* Кадр и логотип показываем только после успешной загрузки. */
    qsa('.poster__scene', host).forEach(function (img) {
      function ok() { img.closest('.poster').classList.add('has-scene'); }
      if (img.complete) { img.naturalWidth ? ok() : img.remove(); return; }
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.remove(); });
    });

    qsa('.poster__logo', host).forEach(function (img) {
      function ok() { img.closest('.poster').classList.add('has-logo'); }
      if (img.complete) { img.naturalWidth ? ok() : img.remove(); return; }
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.remove(); });
    });

    var cards = qsa('.poster', host);

    if ('IntersectionObserver' in window && !C.reducedMotion()) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          var fill = qs('.poster__fill', entry.target);
          if (fill) fill.style.width = fill.getAttribute('data-fill') + '%';
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

      cards.forEach(function (card) { io.observe(card); });
    } else {
      cards.forEach(function (card) {
        card.classList.add('is-in');
        var fill = qs('.poster__fill', card);
        if (fill) fill.style.width = fill.getAttribute('data-fill') + '%';
      });
    }

    if (C.reducedMotion() || window.matchMedia('(hover: none)').matches) return;

    /* Лёгкий параллакс кадра за курсором. */
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var box = card.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        var py = (e.clientY - box.top) / box.height - 0.5;
        card.style.setProperty('--px', (px * 14).toFixed(2) + 'px');
        card.style.setProperty('--py', (py * 10).toFixed(2) + 'px');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--px', '0px');
        card.style.setProperty('--py', '0px');
      });
    });
  }

  /* ---------- Фон ------------------------------------------- */

  function initStars() {
    var canvas = qs('#stars');
    if (!canvas || C.reducedMotion()) return;

    var ctx = canvas.getContext('2d');
    var dots = [];
    var mouse = { x: 0, y: 0 };
    var w = 0, h = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(110, (w * h) / 15000));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          z: Math.random() * 0.75 + 0.25,
          tw: Math.random() * Math.PI * 2,
        });
      }
    }

    var HUES = ['124, 92, 255', '77, 219, 255', '61, 220, 151', '255, 255, 255'];

    function frame() {
      ctx.clearRect(0, 0, w, h);
      dots.forEach(function (d, i) {
        d.x += d.vx; d.y += d.vy; d.tw += 0.016;
        if (d.x < -5) d.x = w + 5;
        if (d.x > w + 5) d.x = -5;
        if (d.y < -5) d.y = h + 5;
        if (d.y > h + 5) d.y = -5;

        var alpha = (0.16 + Math.sin(d.tw) * 0.11) * d.z;
        ctx.beginPath();
        ctx.arc(d.x + mouse.x * 24 * d.z, d.y + mouse.y * 24 * d.z,
          d.r * d.z + 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + HUES[i % HUES.length] + ', ' + alpha.toFixed(3) + ')';
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);
  }

  /* ---------- Запуск ---------------------------------------- */

  function init() {
    loadPrefs();
    renderTicker();
    renderFilters();
    syncUI();
    renderCollection();

    var search = qs('[data-search]');
    if (search) {
      var timer;
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.query = search.value.trim();
          renderCollection();
        }, 120);
      });
    }

    var sortEl = qs('[data-sort]');
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        state.sort = sortEl.value;
        savePrefs();
        renderCollection();
      });
    }

    document.addEventListener('keydown', function (e) {
      var input = qs('[data-search]');
      var typing = document.activeElement === input;
      if (e.key === '/' && !typing) { e.preventDefault(); if (input) input.focus(); }
      if (e.key === 'Escape' && typing) {
        input.value = '';
        state.query = '';
        renderCollection();
        input.blur();
      }
    });

    var year = qs('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    initStars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
