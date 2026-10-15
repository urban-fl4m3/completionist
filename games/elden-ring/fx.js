/*  ============================================================
 *  ELDEN RING — VFX
 *  ------------------------------------------------------------
 *  1. Угли, поднимающиеся снизу вверх с мерцанием.
 *  2. Золотая вспышка-искра при закрытии цели.
 *  ============================================================ */

(function () {
  'use strict';

  var reduced = window.Completionist.reducedMotion();

  /* ---------- 1. Угли --------------------------------------- */

  (function embers() {
    var canvas = document.getElementById('embers');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var parts = [];
    var w = 0, h = 0;

    function spawn(atBottom) {
      return {
        x: Math.random() * w,
        y: atBottom ? h + Math.random() * 60 : Math.random() * h,
        r: Math.random() * 1.7 + 0.5,
        /* Угли летят вверх, слегка покачиваясь. */
        vy: -(Math.random() * 0.45 + 0.18),
        drift: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        life: Math.random() * 0.6 + 0.4,
        hot: Math.random() > 0.72,
      };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(110, (w * h) / 15000));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(false));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];

        p.y += p.vy;
        p.phase += 0.03;
        p.x += p.drift + Math.sin(p.phase) * 0.35;

        /* Улетел за верхнюю кромку — рождаем заново внизу. */
        if (p.y < -20) parts[i] = spawn(true);

        /* Чем выше поднялся уголь, тем он тусклее. */
        var height = 1 - p.y / h;
        var fade = Math.max(0, 1 - height * 0.85);
        var flicker = 0.55 + Math.sin(p.phase * 2.1) * 0.45;
        var alpha = p.life * fade * flicker * 0.85;

        if (alpha <= 0.01) continue;

        var color = p.hot ? '255, 190, 110' : '255, 120, 50';

        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, 'rgba(' + color + ', ' + alpha.toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + color + ', 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(frame);
  })();

  /* ---------- 2. Искра при закрытии цели -------------------- */

  document.addEventListener('completionist:toggle', function (e) {
    if (reduced || !e.detail.done) return;

    var item = e.detail.element;
    item.classList.remove('just-done');
    /* Форсируем перезапуск анимации. */
    void item.offsetWidth;
    item.classList.add('just-done');

    setTimeout(function () { item.classList.remove('just-done'); }, 900);
  });
})();
