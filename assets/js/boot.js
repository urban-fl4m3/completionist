/*  ============================================================
 *  BOOT — переход с коллекции на страницу игры
 *  ============================================================
 *  Клик по игре запускает не общий фейд, а «загрузочный экран»
 *  этой конкретной игры: у каждой свой рисунок, свой ритм и свой
 *  способ заполнять экран.
 *
 *  Пока идёт анимация, страница игры и её арты подгружаются
 *  фоном, поэтому к моменту перехода она уже готова.
 *
 *  Добавляя игру, добавь сюда её сцену в SCENES. Без записи
 *  сработает нейтральный запасной вариант.
 *  ============================================================ */

window.Boot = (function () {
  'use strict';

  var C = window.Completionist;

  /* ---------- Вспомогательное ------------------------------- */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /** Греем картинки страницы игры, пока играет анимация. */
  function preload(game) {
    var art = C.art(game);
    [art.hero, art.logo].forEach(function (src) {
      if (src) { var i = new Image(); i.src = src; }
    });
  }

  /** Канвас во весь слой с учётом плотности пикселей. */
  function canvasIn(host) {
    var cv = el('canvas', 'boot__canvas');
    host.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth;
    var h = host.clientHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv: cv, ctx: ctx, w: w, h: h };
  }

  /** Цикл анимации на заданную длительность, 0 → 1. */
  function run(duration, draw) {
    return new Promise(function (resolve) {
      var start = performance.now();
      (function step(now) {
        var t = Math.min(1, (now - start) / duration);
        draw(t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      })(performance.now());
    });
  }

  /*  ==========================================================
   *  СЦЕНЫ
   *  Каждая возвращает промис, который разрешается, когда пора
   *  уходить на страницу игры.
   *  ========================================================== */

  var SCENES = {

    /* ------------------------------------------------------
     *  CYBERPUNK 2077 — взлом сети.
     *  Жёлтая развёртка, колонки шестнадцатеричных данных,
     *  глитч-полосы и строка протокола.
     * ------------------------------------------------------ */
    'cyberpunk-2077': function (layer, game) {
      layer.classList.add('boot--cp');

      layer.appendChild(el('div', 'boot-cp__sweep'));
      layer.appendChild(el('div', 'boot-cp__bars'));

      var hud = el('div', 'boot-cp__hud',
        '<p class="boot-cp__line">BREACH PROTOCOL // INITIATED</p>' +
        '<p class="boot-cp__target">' + C.escapeHtml(game.title.toUpperCase()) + '</p>' +
        '<p class="boot-cp__pct"><b>0</b>%</p>');
      layer.appendChild(hud);

      var g = canvasIn(layer);
      var cols = Math.ceil(g.w / 11);
      var heads = [];
      for (var i = 0; i < cols; i++) {
        heads.push({ y: Math.random() * -g.h, speed: Math.random() * 16 + 7 });
      }

      var GLYPH = '0123456789ABCDEF<>/\\|=+*#';
      var pct = hud.querySelector('b');

      return run(1500, function (t) {
        g.ctx.clearRect(0, 0, g.w, g.h);
        g.ctx.font = '13px "Share Tech Mono", monospace';
        g.ctx.textBaseline = 'top';

        /* Колонки данных обрушиваются сверху и ускоряются. */
        for (var i = 0; i < heads.length; i++) {
          var head = heads[i];
          head.y += head.speed * (0.4 + t * 1.8);

          for (var j = 0; j < 16; j++) {
            var y = head.y - j * 14;
            if (y < -15 || y > g.h) continue;
            var fade = (1 - j / 16) * (0.35 + t * 0.65);
            g.ctx.fillStyle = j === 0
              ? 'rgba(252, 238, 10, ' + fade.toFixed(2) + ')'
              : 'rgba(0, 240, 255, ' + (fade * 0.5).toFixed(2) + ')';
            g.ctx.fillText(GLYPH[(Math.random() * GLYPH.length) | 0], i * 11, y);
          }
        }

        pct.textContent = Math.round(t * 100);
      });
    },

    /* ------------------------------------------------------
     *  ELDEN RING — руна зажигается.
     *  Золотое кольцо вычерчивается по дуге, внутри разгораются
     *  лучи, снизу поднимаются угли.
     * ------------------------------------------------------ */
    'elden-ring': function (layer, game) {
      layer.classList.add('boot--er');

      var R = Math.min(window.innerWidth, window.innerHeight) * 0.21;
      var rays = 8;

      layer.appendChild(el('div', 'boot-er__title',
        '<span>' + C.escapeHtml(game.title.toUpperCase()) + '</span>'));

      var g = canvasIn(layer);
      var cx = g.w / 2;
      var cy = g.h / 2;

      var embers = [];
      for (var i = 0; i < 70; i++) {
        embers.push({
          x: Math.random() * g.w,
          y: g.h + Math.random() * g.h * 0.5,
          r: Math.random() * 1.8 + 0.5,
          v: Math.random() * 2.2 + 0.8,
          p: Math.random() * Math.PI * 2,
        });
      }

      return run(1700, function (t) {
        g.ctx.clearRect(0, 0, g.w, g.h);

        /* Угли поднимаются всё время. */
        for (var i = 0; i < embers.length; i++) {
          var e = embers[i];
          e.y -= e.v * (0.5 + t * 1.6);
          e.p += 0.05;
          var ex = e.x + Math.sin(e.p) * 10;
          var a = (1 - e.y / g.h) * 0.75 * t;
          if (a <= 0) continue;
          var grd = g.ctx.createRadialGradient(ex, e.y, 0, ex, e.y, e.r * 6);
          grd.addColorStop(0, 'rgba(255, 170, 80, ' + a.toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(255, 120, 40, 0)');
          g.ctx.fillStyle = grd;
          g.ctx.beginPath();
          g.ctx.arc(ex, e.y, e.r * 6, 0, Math.PI * 2);
          g.ctx.fill();
        }

        /* Кольцо вычерчивается от верхней точки по часовой. */
        var ease = 1 - Math.pow(1 - Math.min(1, t / 0.75), 3);
        g.ctx.save();
        g.ctx.translate(cx, cy);
        g.ctx.rotate(-Math.PI / 2);

        g.ctx.strokeStyle = 'rgba(243, 217, 155, 0.95)';
        g.ctx.lineWidth = 2.5;
        g.ctx.shadowColor = 'rgba(255, 170, 70, 0.9)';
        g.ctx.shadowBlur = 26;
        g.ctx.beginPath();
        g.ctx.arc(0, 0, R, 0, Math.PI * 2 * ease);
        g.ctx.stroke();

        /* Лучи внутри кольца разгораются во второй половине. */
        if (t > 0.45) {
          var rt = (t - 0.45) / 0.55;
          g.ctx.lineWidth = 1.2;
          g.ctx.strokeStyle = 'rgba(212, 164, 76, ' + (rt * 0.75).toFixed(2) + ')';
          for (var k = 0; k < rays; k++) {
            var ang = (Math.PI * 2 / rays) * k;
            g.ctx.beginPath();
            g.ctx.moveTo(0, 0);
            g.ctx.lineTo(Math.cos(ang) * R * rt, Math.sin(ang) * R * rt);
            g.ctx.stroke();
          }
        }

        g.ctx.restore();
      });
    },

    /* ------------------------------------------------------
     *  HOLLOW KNIGHT — спуск в глубину.
     *  Экран уходит вниз, навстречу поднимаются споры,
     *  в центре медленно раскрывается светлая маска.
     * ------------------------------------------------------ */
    'hollow-knight': function (layer, game) {
      layer.classList.add('boot--hk');

      layer.appendChild(el('div', 'boot-hk__mask',
        '<svg viewBox="0 0 100 120" aria-hidden="true">' +
          '<path d="M50 6c18 0 30 16 30 38 0 26-14 46-30 70C34 90 20 70 20 44 20 22 32 6 50 6z"/>' +
          '<ellipse class="eye" cx="37" cy="44" rx="7" ry="11"/>' +
          '<ellipse class="eye" cx="63" cy="44" rx="7" ry="11"/>' +
        '</svg>'));

      layer.appendChild(el('p', 'boot-hk__name',
        C.escapeHtml(game.title)));

      var g = canvasIn(layer);
      var motes = [];
      for (var i = 0; i < 110; i++) {
        motes.push({
          x: Math.random() * g.w,
          y: Math.random() * g.h,
          z: Math.random(),
          p: Math.random() * Math.PI * 2,
        });
      }

      return run(1750, function (t) {
        g.ctx.clearRect(0, 0, g.w, g.h);
        g.ctx.globalCompositeOperation = 'lighter';

        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          /* Чем дальше спуск, тем быстрее споры летят вверх. */
          m.y -= (0.4 + m.z * 2.4) * (0.6 + t * 4);
          m.p += 0.02;
          if (m.y < -10) m.y = g.h + 10;

          var x = m.x + Math.sin(m.p) * 14 * m.z;
          var r = (0.7 + m.z * 2.4) * (1 + t * 1.6);
          var a = (0.14 + m.z * 0.5) * (0.4 + Math.sin(m.p * 1.6) * 0.6);
          if (a <= 0) continue;

          var grd = g.ctx.createRadialGradient(x, m.y, 0, x, m.y, r * 5);
          grd.addColorStop(0, 'rgba(127, 212, 232, ' + a.toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(127, 212, 232, 0)');
          g.ctx.fillStyle = grd;
          g.ctx.beginPath();
          g.ctx.arc(x, m.y, r * 5, 0, Math.PI * 2);
          g.ctx.fill();
        }

        g.ctx.globalCompositeOperation = 'source-over';
      });
    },

    /* ------------------------------------------------------
     *  STARFIELD — выход на орбиту.
     *  Три кольца доворачиваются до совмещения, телеметрия
     *  отсчитывает готовность, звёзды разлетаются от центра.
     * ------------------------------------------------------ */
    'starfield': function (layer, game) {
      layer.classList.add('boot--sf');

      var hud = el('div', 'boot-sf__hud',
        '<p class="boot-sf__id">NAV // ' + C.escapeHtml(game.title.toUpperCase()) + '</p>' +
        '<p class="boot-sf__readout"><b>0</b> <span>ALIGNMENT</span></p>');
      layer.appendChild(hud);

      var g = canvasIn(layer);
      var cx = g.w / 2, cy = g.h / 2;
      var R = Math.min(g.w, g.h) * 0.2;

      var stars = [];
      for (var i = 0; i < 160; i++) {
        stars.push({
          a: Math.random() * Math.PI * 2,
          d: Math.random() * R * 0.6,
          s: Math.random() * 2.2 + 0.6,
        });
      }

      var readout = hud.querySelector('b');

      return run(1600, function (t) {
        g.ctx.clearRect(0, 0, g.w, g.h);

        /* Звёзды разлетаются от центра — ощущение разгона. */
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i];
          var d = s.d + t * t * g.w * 0.75 * (s.s / 2.2);
          var x = cx + Math.cos(s.a) * d;
          var y = cy + Math.sin(s.a) * d;
          if (x < 0 || x > g.w || y < 0 || y > g.h) continue;
          g.ctx.strokeStyle = 'rgba(216, 232, 244, ' + (0.15 + t * 0.5).toFixed(2) + ')';
          g.ctx.lineWidth = s.s * 0.5;
          g.ctx.beginPath();
          g.ctx.moveTo(x, y);
          g.ctx.lineTo(cx + Math.cos(s.a) * (d - s.s * 14 * t),
                       cy + Math.sin(s.a) * (d - s.s * 14 * t));
          g.ctx.stroke();
        }

        /* Три кольца сходятся к общему углу. */
        var ease = 1 - Math.pow(1 - t, 3);
        var specs = [
          { r: R,        from: -2.4, arc: 1.7,  w: 2.5, c: '255, 122, 61' },
          { r: R * 1.26, from: 1.9,  arc: 2.3,  w: 1.5, c: '159, 180, 199' },
          { r: R * 0.74, from: 0.6,  arc: 1.2,  w: 1.5, c: '159, 180, 199' },
        ];

        for (var k = 0; k < specs.length; k++) {
          var sp = specs[k];
          var rot = sp.from * (1 - ease);
          g.ctx.strokeStyle = 'rgba(' + sp.c + ', ' + (0.3 + ease * 0.7).toFixed(2) + ')';
          g.ctx.lineWidth = sp.w;
          g.ctx.shadowColor = 'rgba(255, 122, 61, 0.7)';
          g.ctx.shadowBlur = k === 0 ? 18 * ease : 0;
          g.ctx.beginPath();
          g.ctx.arc(cx, cy, sp.r, rot, rot + sp.arc);
          g.ctx.stroke();
        }
        g.ctx.shadowBlur = 0;

        readout.textContent = String(Math.round(ease * 100)).padStart(3, '0');
      });
    },

    /* ------------------------------------------------------
     *  FIRE EMBLEM — полотно ткётся.
     *  Светлая сцена: нити идут навстречу друг другу и
     *  затягивают экран, поверх проступает ромб.
     * ------------------------------------------------------ */
    'fire-emblem-fortunes-weave': function (layer, game) {
      layer.classList.add('boot--fe');

      layer.appendChild(el('div', 'boot-fe__sigil',
        '<svg viewBox="0 0 100 100" aria-hidden="true">' +
          '<rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/>' +
          '<circle cx="50" cy="50" r="9"/>' +
        '</svg>'));

      layer.appendChild(el('p', 'boot-fe__name', C.escapeHtml(game.title)));

      var g = canvasIn(layer);
      var threads = [];
      var count = Math.ceil(g.h / 26) + 6;

      for (var i = 0; i < count; i++) {
        threads.push({
          y: i * 26 - 20,
          dir: i % 2 ? 1 : -1,
          gold: i % 3 !== 0,
          delay: (i % 7) * 0.045,
          wob: Math.random() * 24 + 8,
        });
      }

      return run(1650, function (t) {
        g.ctx.clearRect(0, 0, g.w, g.h);

        for (var i = 0; i < threads.length; i++) {
          var th = threads[i];
          var p = Math.max(0, Math.min(1, (t - th.delay) / (1 - th.delay)));
          if (p <= 0) continue;

          var ease = 1 - Math.pow(1 - p, 2.4);
          var len = g.w * ease;
          var x0 = th.dir > 0 ? 0 : g.w;
          var x1 = th.dir > 0 ? len : g.w - len;

          g.ctx.beginPath();
          g.ctx.moveTo(x0, th.y);
          /* Нить идёт не по прямой, а слегка провисает. */
          g.ctx.quadraticCurveTo((x0 + x1) / 2, th.y + Math.sin(t * 3 + i) * th.wob,
                                 x1, th.y);
          g.ctx.strokeStyle = th.gold
            ? 'rgba(184, 137, 58, ' + (0.75 * ease).toFixed(2) + ')'
            : 'rgba(91, 74, 158, ' + (0.6 * ease).toFixed(2) + ')';
          g.ctx.lineWidth = th.gold ? 1.6 : 1.1;
          g.ctx.lineCap = 'round';
          g.ctx.stroke();
        }
      });
    },
  };

  /* Запасной вариант для игр без своей сцены. */
  function fallback(layer, game) {
    layer.classList.add('boot--plain');
    layer.appendChild(el('p', 'boot-plain__name', C.escapeHtml(game.title)));
    return wait(900);
  }

  /* ---------- Запуск перехода ------------------------------- */

  var busy = false;

  function go(game, href) {
    if (busy) return;
    busy = true;

    preload(game);

    var layer = el('div', 'boot');
    layer.setAttribute('role', 'status');
    layer.setAttribute('aria-label', 'Загрузка: ' + game.title);
    layer.style.setProperty('--accent', game.accent || '#7c5cff');
    layer.style.setProperty('--accent-alt', game.accentAlt || '#4ddbff');
    document.body.appendChild(layer);

    /* Даём слою кадр, чтобы сыграло появление фона. */
    requestAnimationFrame(function () {
      layer.classList.add('is-on');

      var scene = SCENES[game.slug] || fallback;
      var done;
      try {
        done = scene(layer, game);
      } catch (err) {
        console.error('[boot] сцена упала:', err);
        done = wait(300);
      }

      Promise.resolve(done).then(function () {
        layer.classList.add('is-out');
        return wait(220);
      }).then(function () {
        location.href = href;
        /* Если переход не состоялся (якорь на той же странице,
           заблокированная навигация) — убираем слой и
           разблокируем клики, иначе сайт залипнет. */
        setTimeout(function () {
          layer.remove();
          busy = false;
        }, 1200);
      });
    });
  }

  /* ---------- Подключение к ссылкам ------------------------- */

  function attach(root) {
    (root || document).addEventListener('click', function (e) {
      var link = e.target.closest('[data-boot]');
      if (!link) return;

      /* Не мешаем открыть в новой вкладке. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var slug = link.getAttribute('data-boot');
      var game = C.find(slug);
      if (!game) return;

      /* При выключенной анимации уходим сразу. */
      if (C.reducedMotion()) return;

      e.preventDefault();
      go(game, link.getAttribute('href'));
    });

    /* Наведение — повод заранее прогреть арты. */
    (root || document).addEventListener('pointerenter', function (e) {
      var link = e.target.closest && e.target.closest('[data-boot]');
      if (!link) return;
      var game = C.find(link.getAttribute('data-boot'));
      if (game) preload(game);
    }, true);
  }

  return { attach: attach, go: go, SCENES: SCENES };
})();
