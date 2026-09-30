/* OMBU Renovaciones · Propuesta. Sin dependencias. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* Revelado al hacer scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Cifras que cuentan al aparecer */
  var nums = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, end = +el.dataset.count, t0 = null, dur = 1400;
        var fmt = new Intl.NumberFormat('es-CO');
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = fmt.format(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* CTA fijo: aparece al dejar la portada y se oculta en el cierre */
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.p-hero__ctas');
  var end = document.querySelector('.p-end');
  if ('IntersectionObserver' in window) {
    var heroIn = true, endIn = false;
    var upd = function () { dock.classList.toggle('is-on', !heroIn && !endIn); };
    new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (e) { endIn = e[0].isIntersecting; upd(); }, { threshold: 0.2 }).observe(end);
  } else { dock.classList.add('is-on'); }

  /* Transición hacia el sitio: un círculo carbón que se expande desde el botón */
  var curtain = document.getElementById('curtain');
  $$('.go-site').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var r = a.getBoundingClientRect();
      curtain.style.setProperty('--cx', (r.left + r.width / 2) + 'px');
      curtain.style.setProperty('--cy', (r.top + r.height / 2) + 'px');
      curtain.classList.add('is-on');
      setTimeout(function () { window.location.href = a.href; }, 750);
    });
  });
  /* Al volver con el botón «atrás», la cortina no debe quedarse puesta */
  window.addEventListener('pageshow', function (e) { if (e.persisted) curtain.classList.remove('is-on'); });
})();
