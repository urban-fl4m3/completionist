/*  ============================================================
 *  FIRE EMBLEM: FORTUNE'S WEAVE — VFX
 *  ------------------------------------------------------------
 *  У игры нет артов, поэтому весь визуал — процедурный.
 *
 *  1. Нити судьбы: золотые и индиговые линии медленно ткут
 *     полотно, появляясь и растворяясь.
 *  2. Стежок при закрытии цели.
 *  ============================================================ */

(function () {
  'use strict';

  var reduced = window.Completionist.reducedMotion();

  /* ---------- 1. Нити судьбы -------------------------------- */

  (function threads() {
    var canvas = document.getElementById('threads');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var list = [];
    var w = 0, h = 0;

    /* Нить — ломаная из нескольких точек, которая «ткётся»
       слева направо, живёт и затухает. */
    function make() {
      var y = Math.random() * h;
      var points = [];
      var segments = Math.floor(Math.random() * 3) + 3;
      var step = w / segments;

      for (var i = 0; i <= segments; i++) {
        points.push({
          x: i * step,
          y: y + (Math.random() - 0.5) * 150,
        });
      }

      return {
        points: points,
        gold: Math.random() > 0.45,
        width: Math.random() * 1.1 + 0.35,
        life: 0,
        /* Полный цикл нити — 9–16 секунд. */
        span: Math.random() * 7000 + 9000,
      };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(16, w / 110));
      list = [];
      for (var i = 0; i < count; i++) {
        var t = make();
        /* Разводим фазы, чтобы нити не вспыхивали разом. */
        t.life = Math.random() * t.span;
        list.push(t);
      }
    }

    var last = 0;

    function frame(now) {
      var dt = Math.min(50, now - last);
      last = now;

      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        t.life += dt;

        if (t.life > t.span) { list[i] = make(); continue; }

        var p = t.life / t.span;

        /* Первая треть — нить тянется, последняя — растворяется. */
        var draw = Math.min(1, p / 0.34);
        var fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        var alpha = 0.5 * fade;

        if (alpha <= 0.01) continue;

        ctx.beginPath();
        ctx.moveTo(t.points[0].x, t.points[0].y);

        /* Сглаживаем ломаную квадратичными кривыми. */
        var upTo = 1 + (t.points.length - 2) * draw;
        for (var j = 1; j < upTo; j++) {
          var cur = t.points[j];
          var next = t.points[j + 1] || cur;
          ctx.quadraticCurveTo(cur.x, cur.y,
            (cur.x + next.x) / 2, (cur.y + next.y) / 2);
        }

        ctx.strokeStyle = t.gold
          ? 'rgba(184, 137, 58, ' + alpha.toFixed(3) + ')'
          : 'rgba(91, 74, 158, ' + (alpha * 0.8).toFixed(3) + ')';
        ctx.lineWidth = t.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(frame);
  })();

  /* ---------- 2. Стежок при закрытии цели ------------------- */

  document.addEventListener('completionist:toggle', function (e) {
    if (reduced || !e.detail.done) return;

    var item = e.detail.element;
    item.classList.remove('just-done');
    void item.offsetWidth;
    item.classList.add('just-done');

    setTimeout(function () { item.classList.remove('just-done'); }, 800);
  });
})();
