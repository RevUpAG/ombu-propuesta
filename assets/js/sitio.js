/* OMBU Renovaciones · Interacciones del sitio. Sin dependencias. */
(function () {
  'use strict';

  var WA = '573105996809';
  var IMG = '../assets/img/proyectos/';
  var PROYECTOS = window.OMBU_PROYECTOS || [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* ---------- Encabezado ---------- */
  var hdr = $('#hdr');
  var hero = $('.hero');
  function onScroll() {
    var solid = window.scrollY > (hero ? hero.offsetHeight - 90 : 40);
    hdr.dataset.state = solid ? 'solid' : 'top';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Sección activa en la navegación de escritorio */
  var navLinks = $$('.hdr__nav a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger');
  var menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      var first = $('a', menu); if (first) first.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 350);
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Revelado al hacer scroll ---------- */
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

  /* ---------- Comparador antes / después ---------- */
  var ba = $('#ba');
  if (ba) {
    var stage = $('.ba__stage', ba);
    var range = $('.ba__range', ba);
    var setPos = function (v) {
      v = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', v + '%');
      range.value = Math.round(v);
      ba.dataset.edge = v < 12 ? 'left' : v > 88 ? 'right' : '';
    };
    range.addEventListener('input', function () { setPos(+range.value); });
    // Arrastre en toda la foto (en iOS el range solo responde tocando el pulgar)
    range.style.pointerEvents = 'none';
    var dragging = false;
    var fromEvent = function (e) {
      var r = stage.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); stopIntro();
    });
    stage.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) { stage.addEventListener(t, function () { dragging = false; }); });

    // Pequeña demostración al entrar en pantalla, para que se entienda que se desliza
    var introRaf = null;
    var stopIntro = function () { if (introRaf) cancelAnimationFrame(introRaf); introRaf = null; };
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = null, dur = 2200;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          setPos(50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p * 0.3));
          if (p < 1) introRaf = requestAnimationFrame(step); else { setPos(50); introRaf = null; }
        };
        setTimeout(function () { introRaf = requestAnimationFrame(step); }, 350);
      }, { threshold: 0.6 });
      io.observe(stage);
    }
  }

  /* ---------- Carriles (scroll-snap nativo) ---------- */
  function initRail(section) {
    var track = $('.rail__track', section);
    var bar = $('.rail__progress span', section);
    var prev = $('[data-rail-prev]', section);
    var next = $('[data-rail-next]', section);
    if (!track) return;
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var ratio = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      var p = max > 0 ? track.scrollLeft / max : 0;
      if (bar) { bar.style.width = (ratio * 100) + '%'; bar.style.marginLeft = (p * (1 - ratio) * 100) + '%'; }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    }
    function page(dir) {
      var item = track.firstElementChild;
      var w = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : track.clientWidth;
      var n = Math.max(1, Math.floor(track.clientWidth / w));
      track.scrollBy({ left: dir * w * n, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (prev) prev.addEventListener('click', function () { page(-1); });
    if (next) next.addEventListener('click', function () { page(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); page(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); page(-1); }
    });
    section._railUpdate = update;
    update();
  }

  /* ---------- Proyectos ---------- */
  var projSec = $('#proyectos');
  var track = $('#proj-track');
  function src(p, f) { return IMG + p.slug + '/' + f[0]; }
  function srcset(p, ph) { return src(p, ph[0]) + ' ' + ph[0][1] + 'w, ' + src(p, ph[1]) + ' ' + ph[1][1] + 'w'; }

  $('#proj-count').textContent = PROYECTOS.length;
  track.innerHTML = PROYECTOS.map(function (p, i) {
    var cover = p.despues[0];
    var total = p.despues.length + p.antes.length;
    return '<li class="card">' +
      '<button class="card__btn" type="button" data-open="' + p.slug + '" aria-label="Ver proyecto ' + p.nombre + '">' +
        '<div class="card__media">' +
          '<img src="' + src(p, cover[0]) + '" srcset="' + srcset(p, cover) + '" sizes="(min-width: 960px) 340px, 80vw"' +
          ' width="' + cover[0][1] + '" height="' + cover[0][2] + '" loading="' + (i < 2 ? 'eager' : 'lazy') + '" decoding="async" alt="">' +
        '</div>' +
        (p.antes.length ? '<span class="card__chip">Antes y después</span>' : '') +
        '<div class="card__info">' +
          '<span class="card__name">' + p.nombre + '</span>' +
          '<span class="card__meta"><span>' + total + ' fotos</span><span class="card__go" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span></span>' +
        '</div>' +
      '</button></li>';
  }).join('');
  initRail(projSec);
  initRail($('#testimonios'));

  var toggle = $('#proj-toggle');
  toggle.addEventListener('click', function () {
    var grid = !projSec.classList.contains('is-grid');
    projSec.classList.toggle('is-grid', grid);
    toggle.setAttribute('aria-expanded', String(grid));
    $('span', toggle).textContent = grid ? 'Ver en carrusel' : 'Ver todos';
    track.scrollLeft = 0;
    if (!grid) projSec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    projSec._railUpdate();
  });

  /* ---------- Testimonios largos: plegables ---------- */
  $$('.quote__text').forEach(function (t, i) {
    if (t.scrollHeight <= t.clientHeight + 4) return;
    t.id = t.id || 'q-text-' + i;
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'quote__more';
    more.setAttribute('aria-expanded', 'false');
    more.setAttribute('aria-controls', t.id);
    more.textContent = 'Leer completo';
    more.addEventListener('click', function () {
      var open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      t.classList.toggle('is-open', open);
      more.textContent = open ? 'Leer menos' : 'Leer completo';
      $('#testimonios')._railUpdate();
    });
    t.insertAdjacentElement('afterend', more);
  });

  /* ---------- Diálogos con animación de salida ---------- */
  function closeAnimated(dlg, done) {
    if (!dlg.open) return;
    if (reduceMotion) { dlg.close(); if (done) done(); return; }
    dlg.classList.add('is-closing');
    setTimeout(function () {
      dlg.classList.remove('is-closing'); dlg.close(); if (done) done();
    }, 280);
  }

  /* ---------- Ficha de proyecto ---------- */
  var sheet = $('#sheet');
  var scroller = $('.sheet__scroll', sheet);
  var gal = $('#panel-gal');
  var tabs = $$('.tab', sheet);
  var current = null;
  var currentTab = 'despues';
  var lastFocus = null;

  function renderGallery(kind) {
    currentTab = kind;
    var list = current[kind];
    tabs.forEach(function (t) {
      var on = t.dataset.tab === kind;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    gal.setAttribute('aria-labelledby', kind === 'despues' ? 'tab-d' : 'tab-a');
    gal.innerHTML = list.map(function (ph, i) {
      return '<figure class="gal__item"><button class="gal__btn" type="button" data-lb="' + i + '" aria-label="Ampliar foto ' + (i + 1) + ' de ' + list.length + ' (' + (kind === 'despues' ? 'después' : 'antes') + ')">' +
        '<img src="' + src(current, ph[0]) + '" width="' + ph[0][1] + '" height="' + ph[0][2] + '" loading="lazy" decoding="async" alt="">' +
        '</button></figure>';
    }).join('');
  }

  function openSheet(slug, push) {
    var p = PROYECTOS.filter(function (x) { return x.slug === slug; })[0];
    if (!p) return;
    current = p;
    lastFocus = lastFocus || document.activeElement;
    var cover = p.despues[0];
    var img = $('#sheet-cover');
    img.src = src(p, cover[1]); img.srcset = srcset(p, cover); img.sizes = '(min-width: 960px) 1040px, 100vw';
    img.width = cover[1][1]; img.height = cover[1][2];
    img.alt = 'Proyecto ' + p.nombre + ' terminado';
    $('#sheet-title').textContent = p.nombre;
    $('.sheet__bar-title', sheet).textContent = p.nombre;
    var meta = p.despues.length + ' fotos del resultado';
    if (p.antes.length) meta += ' · ' + p.antes.length + ' del estado inicial';
    $('#sheet-meta').textContent = meta;
    $('span', tabs[0]).textContent = '(' + p.despues.length + ')';
    $('span', tabs[1]).textContent = '(' + p.antes.length + ')';
    tabs[1].disabled = !p.antes.length;
    $('#sheet-wa').href = waLink('Hola OMBU, vi el proyecto ' + p.nombre + ' en su página y quiero algo así para mi espacio.');
    renderGallery('despues');
    scroller.scrollTop = 0;
    sheet.classList.remove('is-scrolled');
    if (!sheet.open) sheet.showModal();
    document.body.classList.add('sheet-open');
    $('[data-close]', sheet).focus({ preventScroll: true });
    if (push) history.pushState({ sheet: slug }, '', '#proyecto/' + slug);
  }

  function hideSheet() {
    closeAnimated(sheet, function () {
      document.body.classList.remove('sheet-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    });
  }
  function requestCloseSheet() {
    if (history.state && history.state.sheet) history.back(); // popstate cierra
    else { hideSheet(); if (location.hash.indexOf('#proyecto/') === 0) history.replaceState(null, '', location.pathname + location.search); }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]');
    if (b) { lastFocus = b; openSheet(b.dataset.open, true); }
  });
  $('[data-close]', sheet).addEventListener('click', requestCloseSheet);
  sheet.addEventListener('cancel', function (e) { e.preventDefault(); requestCloseSheet(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) requestCloseSheet(); });
  scroller.addEventListener('scroll', function () {
    sheet.classList.toggle('is-scrolled', scroller.scrollTop > $('.sheet__hero', sheet).offsetHeight - 70);
  }, { passive: true });

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      if (t.dataset.tab === currentTab) return;
      gal.classList.add('is-swapping');
      setTimeout(function () { renderGallery(t.dataset.tab); gal.classList.remove('is-swapping'); }, 150);
    });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var other = tabs[1 - i];
      if (other.disabled) return;
      other.focus(); other.click();
    });
  });

  $('[data-share]', sheet).addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#proyecto/' + current.slug;
    var data = { title: current.nombre + ' · OMBU Renovaciones', text: 'Mira este proyecto de OMBU Renovaciones', url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var btn = $('[data-share]', sheet);
        btn.setAttribute('aria-label', 'Enlace copiado');
        btn.classList.add('is-done');
        setTimeout(function () { btn.setAttribute('aria-label', 'Compartir proyecto'); btn.classList.remove('is-done'); }, 1800);
      });
    }
  });

  window.addEventListener('popstate', function () {
    var m = location.hash.match(/^#proyecto\/([\w-]+)/);
    if (m) openSheet(m[1], false);
    else if (sheet.open) { if (lb.open) lb.close(); hideSheet(); }
  });

  /* ---------- Visor de fotos ---------- */
  var lb = $('#lb');
  var lbTrack = $('#lb-track');
  var lbCount = $('#lb-count');
  var lbList = [];
  var lbIndex = 0;

  function lbGo(i, smooth) {
    lbIndex = Math.max(0, Math.min(lbList.length - 1, i));
    lbTrack.scrollTo({ left: lbIndex * lbTrack.clientWidth, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    lbUpdate();
  }
  function lbUpdate() {
    lbCount.textContent = (lbIndex + 1) + ' / ' + lbList.length + ' · ' + (currentTab === 'despues' ? 'Después' : 'Antes');
    $('[data-lb-prev]', lb).disabled = lbIndex === 0;
    $('[data-lb-next]', lb).disabled = lbIndex === lbList.length - 1;
  }
  gal.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lb]');
    if (!b) return;
    lbList = current[currentTab];
    lbTrack.innerHTML = lbList.map(function (ph, i) {
      return '<li><img src="' + src(current, ph[1]) + '" width="' + ph[1][1] + '" height="' + ph[1][2] + '"' +
        ' loading="' + (Math.abs(i - +b.dataset.lb) < 2 ? 'eager' : 'lazy') + '" decoding="async"' +
        ' alt="' + current.nombre + ', foto ' + (i + 1) + ' (' + (currentTab === 'despues' ? 'después' : 'antes') + ')"></li>';
    }).join('');
    lb.showModal();
    requestAnimationFrame(function () { lbGo(+b.dataset.lb, false); });
    lb._opener = b;
  });
  var lbScrollT;
  lbTrack.addEventListener('scroll', function () {
    clearTimeout(lbScrollT);
    lbScrollT = setTimeout(function () {
      var i = Math.round(lbTrack.scrollLeft / lbTrack.clientWidth);
      if (i !== lbIndex) { lbIndex = i; lbUpdate(); }
    }, 60);
  }, { passive: true });
  $('[data-lb-prev]', lb).addEventListener('click', function () { lbGo(lbIndex - 1, true); });
  $('[data-lb-next]', lb).addEventListener('click', function () { lbGo(lbIndex + 1, true); });
  $('[data-close]', lb).addEventListener('click', function () { lb.close(); });
  lb.addEventListener('close', function () { if (lb._opener) lb._opener.focus({ preventScroll: true }); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(lbIndex + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(lbIndex - 1, true); }
  });
  window.addEventListener('resize', function () { if (lb.open) lbGo(lbIndex, false); });

  /* Enlace directo a un proyecto (#proyecto/kuna-1002) */
  var initial = location.hash.match(/^#proyecto\/([\w-]+)/);
  if (initial) openSheet(initial[1], false);

  /* ---------- Formulario → WhatsApp ---------- */
  var form = $('#form');
  function setError(input, msg) {
    var err = $('#' + input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg || '';
  }
  function validate(input) {
    var v = input.value.trim();
    if (input.name === 'nombre') return v.length < 2 ? 'Escribe tu nombre.' : '';
    if (input.name === 'celular') {
      var digits = v.replace(/\D/g, '');
      if (!digits) return 'Escribe tu número de celular.';
      if (digits.length < 7) return 'Revisa el número: parece incompleto.';
    }
    return '';
  }
  $$('input[required]', form).forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value) setError(input, validate(input)); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') setError(input, validate(input)); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    $$('input[required]', form).forEach(function (input) {
      var msg = validate(input); setError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }
    var d = new FormData(form);
    var espacio = String(d.get('espacio'));
    var text = 'Hola OMBU, soy ' + d.get('nombre').trim() + '. Quiero transformar ' +
      (espacio === 'Otro espacio' ? 'un espacio' : 'mi ' + espacio.toLowerCase()) + '.';
    var idea = String(d.get('mensaje') || '').trim();
    if (idea) text += '\n\nMi idea: ' + idea;
    text += '\n\nMi celular: ' + d.get('celular').trim();
    window.open(waLink(text), '_blank', 'noopener');
  });

  /* ---------- WhatsApp flotante ---------- */
  var fab = $('#fab');
  var contact = $('#contacto');
  if ('IntersectionObserver' in window) {
    var heroVisible = true, contactVisible = false;
    var fabUpdate = function () { fab.classList.toggle('is-on', !heroVisible && !contactVisible); };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; fabUpdate(); }, { threshold: 0.25 }).observe(hero);
    new IntersectionObserver(function (e) { contactVisible = e[0].isIntersecting; fabUpdate(); }, { threshold: 0.1 }).observe(contact);
  } else { fab.classList.add('is-on'); }
})();
