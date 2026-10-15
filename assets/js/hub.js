/*  ============================================================
 *  HUB — статистика, фильтры, сетка карточек, фоновые эффекты
 *  ============================================================ */

(function () {
  'use strict';

  var C = window.Completionist;
  var PREFS_KEY = 'completionist:v1:hubPrefs';

  var state = {
    filter: 'all',
    sort: 'recent',
    query: '',
  };

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  }

  /* ---------- Настройки пользователя ------------------------ */

  function loadPrefs() {
    try {
      var saved = JSON.parse(localStorage.getItem(PREFS_KEY));
      if (saved) {
        if (saved.filter) state.filter = saved.filter;
        if (saved.sort) state.sort = saved.sort;
      }
    } catch (e) { /* первый запуск — ничего не делаем */ }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        filter: state.filter,
        sort: state.sort,
      }));
    } catch (e) { /* приватный режим — просто не сохраняем */ }
  }

  /* ---------- Анимированный счётчик ------------------------- */

  function countTo(el, to, suffix) {
    if (!el) return;
    /* На скрытой вкладке rAF не вызывается — пишем итог сразу. */
    if (C.reducedMotion() || document.hidden) {
      el.textContent = to + (suffix || '');
      return;
    }
    var start = performance.now();
    var dur = 1100;

    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = to % 1 === 0
        ? Math.round(to * eased)
        : (to * eased).toFixed(1);
      el.textContent = v + (suffix || '');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Статистика ------------------------------------ */

  function renderStats() {
    var s = C.stats();

    /* Кольцо общего прогресса по целям. */
    var ringHost = qs('[data-gauge-ring]');
    if (ringHost) {
      var size = 170, width = 12;
      var r = (size - width) / 2;
      var circ = 2 * Math.PI * r;

      ringHost.innerHTML =
        '<svg class="ring" viewBox="0 0 ' + size + ' ' + size + '" width="' + size +
          '" height="' + size + '" aria-hidden="true">' +
          '<defs><linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#4ddbff"/>' +
            '<stop offset="55%" stop-color="#7c5cff"/>' +
            '<stop offset="100%" stop-color="#3ddc97"/>' +
          '</linearGradient></defs>' +
          '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 +
            '" r="' + r + '" fill="none" stroke-width="' + width + '"/>' +
          '<circle class="ring__value" cx="' + size / 2 + '" cy="' + size / 2 +
            '" r="' + r + '" fill="none" stroke-width="' + width +
            '" stroke-linecap="round" stroke-dasharray="' + circ +
            '" stroke-dashoffset="' + circ + '" transform="rotate(-90 ' +
            size / 2 + ' ' + size / 2 + ')"/>' +
        '</svg>';

      var valueCircle = qs('.ring__value', ringHost);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          valueCircle.style.strokeDashoffset = circ * (1 - s.goalsPct / 100);
        });
      });
    }

    countTo(qs('[data-stat-pct]'), s.goalsPct);
    countTo(qs('[data-stat-total]'), s.total);
    countTo(qs('[data-stat-perfect]'), s.perfect);
    countTo(qs('[data-stat-hours]'), s.hours);
    countTo(qs('[data-stat-goals-done]'), s.goalsDone);

    var goalsTotal = qs('[data-stat-goals-total]');
    if (goalsTotal) goalsTotal.textContent = s.goalsTotal;

    var rating = qs('[data-stat-rating]');
    if (rating) {
      if (s.avgRating == null) rating.textContent = '—';
      else countTo(rating, Math.round(s.avgRating * 10) / 10);
    }

    var hoursWord = qs('[data-stat-hours-word]');
    if (hoursWord) {
      hoursWord.textContent = C.plural(s.hours, 'час', 'часа', 'часов');
    }

    var totalWord = qs('[data-stat-total-word]');
    if (totalWord) {
      totalWord.textContent = C.plural(s.total, 'игра', 'игры', 'игр');
    }

    var topMeta = qs('[data-top-meta]');
    if (topMeta) {
      topMeta.innerHTML = '<b>' + s.perfect + '</b> ' +
        C.plural(s.perfect, 'игра закрыта', 'игры закрыто', 'игр закрыто') + ' на 100%';
    }

    /* Полоса распределения по статусам. */
    var bar = qs('[data-spread-bar]');
    var legend = qs('[data-spread-legend]');
    if (bar && legend) {
      var active = C.STATUSES.filter(function (st) { return s.counts[st.id] > 0; });

      bar.innerHTML = active.map(function (st, i) {
        var share = (s.counts[st.id] / s.total) * 100;
        return '<div class="spread__seg" style="--seg:' + st.accent +
          ';flex:' + s.counts[st.id] + ';animation-delay:' + (i * 90) + 'ms" ' +
          'title="' + st.label + ': ' + s.counts[st.id] + ' (' +
          Math.round(share) + '%)"></div>';
      }).join('');

      legend.innerHTML = C.STATUSES.map(function (st) {
        return '<div class="spread__item" style="--seg:' + st.accent + '">' +
          '<i></i>' + st.label + ' <b>' + s.counts[st.id] + '</b></div>';
      }).join('');
    }
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
      syncFilterUI();
      renderCollection();
    });
  }

  function syncFilterUI() {
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
      var ka = a.finished || a.started || '0000';
      var kb = b.finished || b.started || '0000';
      return kb.localeCompare(ka);
    },
    progress: function (a, b) {
      return C.progress(b).pct - C.progress(a).pct;
    },
    title: function (a, b) {
      return a.title.localeCompare(b.title, 'ru');
    },
    hours: function (a, b) {
      return (Number(b.hours) || 0) - (Number(a.hours) || 0);
    },
    rating: function (a, b) {
      return (Number(b.rating) || -1) - (Number(a.rating) || -1);
    },
    status: function (a, b) {
      return C.status(a.status).order - C.status(b.status).order;
    },
  };

  /* ---------- Карточки -------------------------------------- */

  /* Угол штриховки на арте — стабильный, но разный для каждой игры. */
  function angleFor(slug) {
    var sum = 0;
    for (var i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
    return 70 + (sum % 90);
  }

  function cardHtml(game, index) {
    var st = C.status(game.status);
    var p = C.progress(game);
    var accent = game.accent || st.accent;
    var alt = game.accentAlt || accent;
    var art = C.art(game);

    /* Баннер кладём поверх процедурного арта. Если картинки нет
       или она не загрузилась — под ней остаётся градиент. */
    var cover = art.banner
      ? '<img class="card__cover" src="' + C.escapeHtml(art.banner) + '" alt="" ' +
        'loading="lazy" decoding="async">'
      : '';

    var meta = [];
    if (game.platform) meta.push('<span>' + C.escapeHtml(game.platform) + '</span>');
    if (game.year) meta.push('<span>' + game.year + '</span>');
    if (game.hours) {
      meta.push('<span>' + game.hours + ' ' +
        C.plural(game.hours, 'час', 'часа', 'часов') + '</span>');
    }
    if (typeof game.rating === 'number') {
      meta.push('<span>★ ' + game.rating + '</span>');
    }

    var tags = (game.tags || []).slice(0, 3).map(function (t) {
      return '<span class="card__tag">' + C.escapeHtml(t) + '</span>';
    }).join('');

    return (
      '<a class="card reveal" href="games/' + encodeURIComponent(game.slug) + '/" ' +
        'style="--card-rgb:' + C.rgb(accent) +
        ';--card-alt-rgb:' + C.rgb(alt) +
        ';--card-status:' + st.accent +
        ';--card-angle:' + angleFor(game.slug) + 'deg' +
        ';transition-delay:' + Math.min(index * 55, 440) + 'ms">' +

        '<div class="card__art">' +
          '<span class="card__glyph" aria-hidden="true">' +
            C.escapeHtml(game.title.charAt(0)) + '</span>' +
          cover +
          '<span class="card__scrim" aria-hidden="true"></span>' +
          '<span class="card__badge">' + C.escapeHtml(st.label) + '</span>' +
          (p.perfect ? '<span class="card__seal" title="Закрыта полностью">100%</span>' : '') +
        '</div>' +

        '<div class="card__body">' +
          '<h3 class="card__title">' + C.escapeHtml(game.title) + '</h3>' +
          '<div class="card__meta">' + meta.join('') + '</div>' +
          '<div class="card__tags">' + tags + '</div>' +

          '<div class="card__progress">' +
            '<div class="card__progress-head">' +
              '<span>Цели</span>' +
              '<span><b>' + p.required.done + '</b> / ' + p.required.total +
                ' &nbsp;·&nbsp; <b>' + p.pct + '%</b></span>' +
            '</div>' +
            '<div class="card__track">' +
              '<div class="card__fill" data-fill="' + p.pct + '"></div>' +
            '</div>' +
          '</div>' +

          '<span class="card__go" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
          '</span>' +
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
      '<p>В этой категории нет игр — или поиск ничего не нашёл. ' +
      'Новые игры добавляются в <code>data/games.js</code>.</p>' +
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
        var haystack = [g.title, g.developer, g.platform]
          .concat(g.tags || [])
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
    }

    list.sort(SORTERS[state.sort] || SORTERS.recent);

    host.innerHTML = list.length
      ? list.map(cardHtml).join('')
      : EMPTY_HTML;

    var count = qs('[data-visible-count]');
    if (count) {
      count.textContent = list.length + ' ' +
        C.plural(list.length, 'игра', 'игры', 'игр');
    }

    attachCardBehaviour(host);
  }

  /* ---------- Поведение карточек: reveal, tilt, полосы ------ */

  function attachCardBehaviour(host) {
    var cards = qsa('.card', host);

    /* Баннер показываем только после успешной загрузки, иначе
       убираем — под ним ждёт процедурный арт. */
    qsa('.card__cover', host).forEach(function (img) {
      function ok() { img.closest('.card').classList.add('has-cover'); }

      if (img.complete) {
        if (img.naturalWidth) ok();
        else img.remove();
        return;
      }
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.remove(); });
    });

    /* Появление при попадании в вьюпорт. */
    if ('IntersectionObserver' in window && !C.reducedMotion()) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          var fill = qs('.card__fill', entry.target);
          if (fill) fill.style.width = fill.getAttribute('data-fill') + '%';
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      cards.forEach(function (card) { io.observe(card); });
    } else {
      cards.forEach(function (card) {
        card.classList.add('is-in');
        var fill = qs('.card__fill', card);
        if (fill) fill.style.width = fill.getAttribute('data-fill') + '%';
      });
    }

    /* Наклон за курсором. */
    if (C.reducedMotion() || window.matchMedia('(hover: none)').matches) return;

    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var box = card.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        var py = (e.clientY - box.top) / box.height - 0.5;
        card.style.setProperty('--tilt-y', (px * 7).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-x', (-py * 7).toFixed(2) + 'deg');
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--tilt-x', '0deg');
      });
    });
  }

  /* ---------- Фон: дрейфующие частицы ----------------------- */

  function initStars() {
    var canvas = qs('#stars');
    if (!canvas || C.reducedMotion()) return;

    var ctx = canvas.getContext('2d');
    var dots = [];
    var mouse = { x: 0, y: 0 };
    var w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Плотность зависит от площади — на мобильных частиц меньше. */
      var count = Math.round(Math.min(130, (w * h) / 13000));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.35,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          /* Глубина: дальние частицы тусклее и слабее реагируют. */
          z: Math.random() * 0.75 + 0.25,
          tw: Math.random() * Math.PI * 2,
        });
      }
    }

    var HUES = ['124, 92, 255', '77, 219, 255', '61, 220, 151', '255, 255, 255'];

    function dotColor(i) { return HUES[i % HUES.length]; }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      dots.forEach(function (d, i) {
        d.x += d.vx;
        d.y += d.vy;
        d.tw += 0.016;

        /* Зацикливаем по краям. */
        if (d.x < -5) d.x = w + 5;
        if (d.x > w + 5) d.x = -5;
        if (d.y < -5) d.y = h + 5;
        if (d.y > h + 5) d.y = -5;

        /* Параллакс за курсором. */
        var ox = mouse.x * 26 * d.z;
        var oy = mouse.y * 26 * d.z;

        var alpha = (0.18 + Math.sin(d.tw) * 0.12) * d.z;

        ctx.beginPath();
        ctx.arc(d.x + ox, d.y + oy, d.r * d.z + 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + dotColor(i) + ', ' + alpha.toFixed(3) + ')';
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

  /* ---------- Горячие клавиши ------------------------------- */

  function initKeys() {
    document.addEventListener('keydown', function (e) {
      var input = qs('[data-search]');
      var typing = document.activeElement === input;

      /* «/» фокусирует поиск, Escape — очищает. */
      if (e.key === '/' && !typing) {
        e.preventDefault();
        if (input) input.focus();
        return;
      }
      if (e.key === 'Escape' && typing) {
        input.value = '';
        state.query = '';
        renderCollection();
        input.blur();
      }
    });
  }

  /* ---------- Запуск --------------------------------------- */

  function init() {
    loadPrefs();

    renderStats();
    renderFilters();
    syncFilterUI();
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

    var year = qs('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    initStars();
    initKeys();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
