/*  ============================================================
 *  HOLLOW KNIGHT — VFX
 *  ------------------------------------------------------------
 *  1. Светящиеся споры, парящие в глубине (три слоя параллакса).
 *  2. Фонарь, мягко следующий за курсором.
 *  3. Волна света при закрытии цели.
 *  ============================================================ */

(function () {
  'use strict';

  var reduced = window.Completionist.reducedMotion();

  /* ---------- 1. Споры -------------------------------------- */

  (function spores() {
    var canvas = document.getElementById('spores');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var motes = [];
    var w = 0, h = 0;
    var pointer = { x: 0, y: 0 };

    function make() {
      /* z: 0 — далеко (мелко, тускло), 1 — близко. */
      var z = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: z,
        r: 0.6 + z * 2.1,
        vy: -(0.06 + z * 0.22),
        vx: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        /* Редкие споры фиолетовые, остальные бирюзовые. */
        violet: Math.random() > 0.78,
      };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(120, (w * h) / 14000));
      motes = [];
      for (var i = 0; i < count; i++) motes.push(make());
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];

        m.y += m.vy;
        m.phase += 0.012;
        m.x += m.vx + Math.sin(m.phase) * 0.22;

        if (m.y < -12) { m.y = h + 12; m.x = Math.random() * w; }
        if (m.x < -12) m.x = w + 12;
        if (m.x > w + 12) m.x = -12;

        /* Ближние слои сильнее смещаются за курсором. */
        var px = m.x + pointer.x * 34 * m.z;
        var py = m.y + pointer.y * 34 * m.z;

        var pulse = 0.5 + Math.sin(m.phase * 1.7) * 0.5;
        var alpha = (0.1 + m.z * 0.42) * (0.45 + pulse * 0.55);

        var color = m.violet ? '201, 160, 255' : '127, 212, 232';
        var glow = ctx.createRadialGradient(px, py, 0, px, py, m.r * 6);
        glow.addColorStop(0, 'rgba(' + color + ', ' + alpha.toFixed(3) + ')');
        glow.addColorStop(0.4, 'rgba(' + color + ', ' + (alpha * 0.3).toFixed(3) + ')');
        glow.addColorStop(1, 'rgba(' + color + ', 0)');

        ctx.beginPath();
        ctx.arc(px, py, m.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        /* Яркое ядро споры. */
        ctx.beginPath();
        ctx.arc(px, py, m.r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230, 243, 248, ' + (alpha * 0.85).toFixed(3) + ')';
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);
  })();

  /* ---------- 2. Фонарь ------------------------------------- */

  (function lantern() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;

    var root = document.documentElement;

    window.addEventListener('pointermove', function (e) {
      root.style.setProperty('--lx', e.clientX + 'px');
      root.style.setProperty('--ly', e.clientY + 'px');
    }, { passive: true });
  })();
})();
