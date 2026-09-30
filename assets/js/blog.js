/* OMBU Renovaciones · Blog: filtro por tema y compartir artículo. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Filtro por tema (índice del blog) ---------- */
  var filters = $$('.filter');
  var feature = $('.feature');
  var posts = $$('#posts .post');
  var empty = $('#posts-empty');
  function apply(cat) {
    filters.forEach(function (f) { f.setAttribute('aria-pressed', String(f.dataset.filter === cat)); });
    // Sin filtro, el artículo más reciente va destacado arriba y no se repite en la lista
    if (feature) feature.hidden = !!cat;
    var visibles = 0;
    posts.forEach(function (p) {
      var show = cat ? p.dataset.cat === cat : !p.classList.contains('post--dup');
      p.hidden = !show;
      if (show) visibles++;
    });
    if (empty) empty.hidden = visibles > 0;
  }
  filters.forEach(function (f) { f.addEventListener('click', function () { apply(f.dataset.filter); }); });
  if (filters.length) apply('');

  /* ---------- Compartir (artículo) ---------- */
  var wa = $('[data-share-wa]');
  if (wa) wa.href += encodeURIComponent(location.href.split('#')[0]);
  var copy = $('[data-copy]');
  var ok = $('.share__ok');
  if (copy) {
    copy.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      var done = function () {
        ok.textContent = 'Enlace copiado';
        copy.classList.add('is-done');
        setTimeout(function () { ok.textContent = ''; copy.classList.remove('is-done'); }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () {});
      else { window.prompt('Copia el enlace:', url); }
    });
  }
})();
