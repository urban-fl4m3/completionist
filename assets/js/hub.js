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

  /* ---------- Полоса игры ----------------------------------
   *  Каждая игра — длинный баннер во всю ширину. Арт широкий
   *  (ключевой или кадр), а не коробочная обложка: в полосе
   *  обложка режется и теряет смысл.
   *
   *  data-skin включает оформление под конкретную игру:
   *  рамки, углы и подсветка у каждой свои, см. hub.css.
   * --------------------------------------------------------- */

  function bandHtml(game, index) {
    var st = C.status(game.status);
    var p = C.progress(game);
    var art = C.art(game);
    var accent = game.accent || st.accent;

    var meta = [];
    if (game.platform) meta.push(C.escapeHtml(game.platform));
    if (game.year) meta.push(game.year);
    if (game.hours) {
      meta.push(game.hours + ' ' + C.plural(game.hours, 'час', 'часа', 'часов'));
    }
    if (typeof game.rating === 'number') meta.push('★ ' + game.rating);

    var wide = art.hero || art.banner;

    return (
      '<a class="band reveal" href="games/' + encodeURIComponent(game.slug) + '/" ' +
        'data-boot="' + C.escapeHtml(game.slug) + '" ' +
        'data-skin="' + C.escapeHtml(game.slug) + '" ' +
        'data-status="' + C.escapeHtml(game.status) + '" ' +
        'style="--card-rgb:' + C.rgb(accent) +
        ';--card-alt-rgb:' + C.rgb(game.accentAlt || accent) +
        ';--card-status:' + st.accent +
        ';transition-delay:' + Math.min(index * 70, 420) + 'ms">' +

        (wide
          ? '<img class="band__art" src="' + C.escapeHtml(wide) + '" alt="" ' +
            'loading="lazy" decoding="async">'
          : '') +
        '<span class="band__scrim" aria-hidden="true"></span>' +
        '<span class="band__edge" aria-hidden="true"></span>' +

        '<div class="band__body">' +
          '<p class="band__status">' + C.escapeHtml(st.label) + '</p>' +
          (art.logo
            ? '<img class="band__logo" src="' + C.escapeHtml(art.logo) + '" alt="">'
            : '') +
          '<h2 class="band__title">' + C.escapeHtml(game.title) + '</h2>' +
          '<p class="band__meta">' + meta.join('<i>·</i>') + '</p>' +
        '</div>' +

        '<div class="band__side">' +
          (p.perfect ? '<span class="band__seal">100%</span>' : '') +
          '<span class="band__pct">' + p.pct + '<i>%</i></span>' +
          '<span class="band__count"><b>' + p.must.done + '</b>/' +
            p.must.total + ' обязательных</span>' +
          '<span class="band__track"><i data-fill="' + p.pct + '"></i></span>' +
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

    host.innerHTML = list.length ? list.map(bandHtml).join('') : EMPTY_HTML;

    var count = qs('[data-visible-count]');
    if (count) {
      count.textContent = list.length + ' ' +
        C.plural(list.length, 'игра', 'игры', 'игр');
    }

    attachCardBehaviour(host);
  }

  /* ---------- Поведение карточек ---------------------------- */

  function attachCardBehaviour(host) {
    /* Арт и логотип показываем только после успешной загрузки —
       иначе под ними остаётся процедурный фон полосы. */
    qsa('.band__art', host).forEach(function (img) {
      function ok() { img.closest('.band').classList.add('has-art'); }
      if (img.complete) { img.naturalWidth ? ok() : img.remove(); return; }
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.remove(); });
    });

    qsa('.band__logo', host).forEach(function (img) {
      function ok() { img.closest('.band').classList.add('has-logo'); }
      if (img.complete) { img.naturalWidth ? ok() : img.remove(); return; }
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.remove(); });
    });

    var bands = qsa('.band', host);

    function fill(band) {
      var bar = qs('.band__track i', band);
      if (bar) bar.style.width = bar.getAttribute('data-fill') + '%';
    }

    if ('IntersectionObserver' in window && !C.reducedMotion()) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          fill(entry.target);
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
      bands.forEach(function (b) { io.observe(b); });
    } else {
      bands.forEach(function (b) { b.classList.add('is-in'); fill(b); });
    }

    if (C.reducedMotion() || window.matchMedia('(hover: none)').matches) return;

    /* Арт едет за курсором — полоса перестаёт быть статичной. */
    bands.forEach(function (band) {
      band.addEventListener('pointermove', function (e) {
        var box = band.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        band.style.setProperty('--px', (px * 18).toFixed(1) + 'px');
      });
      band.addEventListener('pointerleave', function () {
        band.style.setProperty('--px', '0px');
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

    /* Клик по игре запускает её загрузочный экран. */
    if (window.Boot) window.Boot.attach(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
