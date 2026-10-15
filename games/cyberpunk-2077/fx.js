/*  ============================================================
 *  CYBERPUNK 2077 — VFX
 *  ------------------------------------------------------------
 *  1. Потоки данных, стекающие вниз (цифровой дождь).
 *  2. Глитч-вспышка на цели при её закрытии.
 *  3. Короткий сбой развёртки всей страницы на каждой 3-й отметке.
 *  ============================================================ */

(function () {
  'use strict';

  var reduced = window.Completionist.reducedMotion();

  /* ---------- 1. Цифровой дождь ----------------------------- */

  (function rain() {
    var canvas = document.getElementById('rain');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var GLYPHS = 'アイウエオカキクケコｱｲｳ0123456789<>[]{}/\\|=+*#@$%';
    var cols = [];
    var w = 0, h = 0;
    var SIZE = 14;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.ceil(w / SIZE);
      cols = [];
      for (var i = 0; i < count; i++) {
        cols.push({
          y: Math.random() * -h,
          speed: Math.random() * 2.4 + 0.7,
          /* Большинство колонок приглушены, редкие — яркие. */
          bright: Math.random() > 0.86,
          len: Math.floor(Math.random() * 14) + 5,
        });
      }
    }

    var last = 0;

    function frame(now) {
      /* Ограничиваем до ~24 кадров — так дождь выглядит «цифровым»
         и не греет процессор. */
      if (now - last < 42) { requestAnimationFrame(frame); return; }
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.font = SIZE + 'px "Share Tech Mono", monospace';
      ctx.textBaseline = 'top';

      for (var i = 0; i < cols.length; i++) {
        var col = cols[i];
        var x = i * SIZE;

        for (var j = 0; j < col.len; j++) {
          var y = col.y - j * SIZE;
          if (y < -SIZE || y > h) continue;

          /* Голова потока светлее хвоста. */
          var fade = 1 - j / col.len;
          var ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

          if (j === 0) {
            ctx.fillStyle = 'rgba(252, 238, 10, ' + (0.8 * fade).toFixed(2) + ')';
          } else if (col.bright) {
            ctx.fillStyle = 'rgba(0, 240, 255, ' + (0.42 * fade).toFixed(2) + ')';
          } else {
            ctx.fillStyle = 'rgba(0, 240, 255, ' + (0.16 * fade).toFixed(2) + ')';
          }

          ctx.fillText(ch, x, y);
        }

        col.y += col.speed * SIZE * 0.5;
        if (col.y - col.len * SIZE > h) {
          col.y = Math.random() * -120;
          col.speed = Math.random() * 2.4 + 0.7;
          col.bright = Math.random() > 0.86;
        }
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(frame);
  })();

  /* ---------- 2–3. Реакция на закрытие цели ----------------- */

  var hits = 0;

  document.addEventListener('completionist:toggle', function (e) {
    if (reduced || !e.detail.done) return;

    var item = e.detail.element;
    item.classList.remove('just-done');
    void item.offsetWidth;
    item.classList.add('just-done');
    setTimeout(function () { item.classList.remove('just-done'); }, 600);

    /* Каждая третья закрытая цель даёт сбой развёртки всей страницы. */
    hits += 1;
    if (hits % 3 !== 0) return;

    var sheet = document.createElement('div');
    sheet.style.cssText =
      'position:fixed;inset:0;z-index:90;pointer-events:none;' +
      'background:linear-gradient(180deg,rgba(0,240,255,.14),rgba(255,0,85,.12));' +
      'mix-blend-mode:screen';
    document.body.appendChild(sheet);

    var steps = 0;
    var timer = setInterval(function () {
      steps += 1;
      sheet.style.transform =
        'translate(' + (Math.random() * 10 - 5).toFixed(1) + 'px,' +
        (Math.random() * 6 - 3).toFixed(1) + 'px)';
      if (steps > 5) {
        clearInterval(timer);
        sheet.remove();
      }
    }, 45);
  });
})();
