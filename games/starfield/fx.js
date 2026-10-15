/*  ============================================================
 *  STARFIELD — VFX
 *  ------------------------------------------------------------
 *  1. Звёздное поле с медленным дрейфом и редкими «сканами».
 *  2. Импульс телеметрии при закрытии цели.
 *  ============================================================ */

(function () {
  'use strict';

  var reduced = window.Completionist.reducedMotion();

  /* ---------- 1. Звёздное поле ------------------------------ */

  (function field() {
    var canvas = document.getElementById('field');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var stars = [];
    var w = 0, h = 0;
    var tilt = { x: 0, y: 0 };

    /* Сканирующая линия пробегает сверху вниз раз в ~9 секунд. */
    var scan = { y: -100, active: false, next: 2600 };

    function make() {
      var z = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: z,
        r: 0.25 + z * 1.15,
        /* Дрейф очень медленный — корабль стоит на приколе. */
        vx: -(0.02 + z * 0.09),
        phase: Math.random() * Math.PI * 2,
        /* Редкие звёзды отдают в оранжевый. */
        warm: Math.random() > 0.9,
      };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(220, (w * h) / 7000));
      stars = [];
      for (var i = 0; i < count; i++) stars.push(make());
    }

    var last = 0;

    function frame(now) {
      var dt = Math.min(48, now - last);
      last = now;

      ctx.clearRect(0, 0, w, h);

      /* Таймер сканирующей линии. */
      scan.next -= dt;
      if (scan.next <= 0 && !scan.active) {
        scan.active = true;
        scan.y = -60;
      }
      if (scan.active) {
        scan.y += dt * 0.55;
        if (scan.y > h + 60) {
          scan.active = false;
          scan.next = 7000 + Math.random() * 5000;
        }
      }

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];

        s.x += s.vx;
        s.phase += 0.009;

        if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }

        var px = s.x + tilt.x * 18 * s.z;
        var py = s.y + tilt.y * 18 * s.z;

        var twinkle = 0.65 + Math.sin(s.phase) * 0.35;
        var alpha = (0.14 + s.z * 0.5) * twinkle;

        /* Звезда ярко вспыхивает, когда её задевает скан-линия. */
        if (scan.active) {
          var dist = Math.abs(py - scan.y);
          if (dist < 46) alpha = Math.min(1, alpha + (1 - dist / 46) * 0.75);
        }

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? 'rgba(255, 150, 100, ' + alpha.toFixed(3) + ')'
          : 'rgba(216, 232, 244, ' + alpha.toFixed(3) + ')';
        ctx.fill();
      }

      /* Сама линия скана — тонкая и почти незаметная. */
      if (scan.active) {
        var grad = ctx.createLinearGradient(0, scan.y - 40, 0, scan.y + 40);
        grad.addColorStop(0, 'rgba(255, 122, 61, 0)');
        grad.addColorStop(0.5, 'rgba(255, 122, 61, 0.11)');
        grad.addColorStop(1, 'rgba(255, 122, 61, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scan.y - 40, w, 80);
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', function (e) {
      tilt.x = e.clientX / window.innerWidth - 0.5;
      tilt.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);
  })();
})();
