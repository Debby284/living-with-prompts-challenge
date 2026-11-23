/* Larkline Estates · Prototype v1
   Only one job: the two-step valuation form. Everything else is CSS. */
(function () {
  var form = document.getElementById('valuation-form');
  if (!form) return;

  var step1 = form.querySelector('[data-step="1"]');
  var step2 = form.querySelector('[data-step="2"]');
  var done = form.querySelector('.form-done');
  var dots = form.querySelectorAll('.progress-dot');
  var note = form.querySelector('.form-note');
  var sending = false;

  function validate(scope) {
    var ok = true;
    scope.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('.field-input, .field-check');
      var valid = input.type === 'checkbox' ? input.checked : (input.checkValidity() && input.value.trim() !== '');
      field.classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid && ok) { input.focus(); ok = false; }
    });
    return ok;
  }

  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid') && (e.target.type === 'checkbox' ? e.target.checked : e.target.checkValidity())) {
      field.classList.remove('is-invalid');
    }
  });

  form.querySelector('[data-next]').addEventListener('click', function () {
    if (!validate(step1)) return;
    step1.hidden = true;
    step2.hidden = false;
    dots[1].classList.add('is-active');
    progress.classList.add('is-step-2');
    try { history.pushState({ valuationStep: 2 }, ''); } catch (err) {}
    step2.querySelector('.field-input').focus();
  });

  /* Going back never checks step 2: you can always return to step 1, also with empty fields.
     Back works with the button, with the first progress dot and with the browser's own back button. */
  var progress = form.querySelector('.form-progress');
  function showStep1() {
    if (step2.hidden) return;
    step2.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-invalid'); });
    step2.hidden = true;
    step1.hidden = false;
    dots[1].classList.remove('is-active');
    progress.classList.remove('is-step-2');
    step1.querySelector('.field-input').focus();
  }
  function goBack() {
    var viaHistory = false;
    try { viaHistory = history.state && history.state.valuationStep === 2; } catch (err) {}
    if (viaHistory) history.back(); else showStep1();
  }
  form.querySelector('[data-back]').addEventListener('click', goBack);
  dots[0].addEventListener('click', function () { if (!step2.hidden) goBack(); });
  window.addEventListener('popstate', showStep1);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending || !validate(step2)) return;
    sending = true; /* prevents double submits */

    var village = form.querySelector('#v-village');
    var agent = village.options[village.selectedIndex].getAttribute('data-agent') || 'Your agent';
    var name = form.querySelector('#v-name').value.trim().split(' ')[0];

    done.querySelector('[data-out="name"]').textContent = name;
    done.querySelector('[data-out="agent"]').textContent = agent;
    done.querySelector('[data-out="home"]').textContent = form.querySelector('#v-address').value.trim() + ', ' + village.value + ' · ' + form.querySelector('#v-type').value;
    done.querySelector('[data-out="phone"]').textContent = form.querySelector('#v-phone').value.trim();
    done.querySelector('[data-out="email"]').textContent = form.querySelector('#v-email').value.trim();
    step2.hidden = true;
    form.querySelector('.form-progress').hidden = true;
    note.hidden = true;
    done.hidden = false;
    done.focus();
  });

  /* Start over: an empty form at step 1 */
  done.querySelector('[data-again]').addEventListener('click', function () {
    form.reset(); sending = false;
    done.hidden = true; step2.hidden = true; step1.hidden = false;
    form.querySelector('.form-progress').hidden = false; note.hidden = false;
    dots[1].classList.remove('is-active');
    step1.querySelector('.field-input').focus();
  });
})();

/* Homes: carousel, filter chips and the search bar in the hero */
(function () {
  var section = document.getElementById('homes');
  if (!section) return;
  var track = section.querySelector('.carousel-track');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.home-card'));
  var dotsBox = section.querySelector('.carousel-dots');
  var empty = section.querySelector('.search-empty');
  var search = { type: 'all', village: '', street: '', min: 0, max: 0 };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = false, timer;

  function visible() { return cards.filter(function (c) { return !c.classList.contains('is-hidden'); }); }
  function perPage() {
    var v = visible(); if (!v.length) return 1;
    return Math.max(1, Math.round(track.clientWidth / v[0].getBoundingClientRect().width));
  }
  function pages() { return Math.max(1, Math.ceil(visible().length / perPage())); }
  function current() {
    var v = visible(); if (!v.length) return 0;
    var step = v[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    return Math.min(pages() - 1, Math.round(track.scrollLeft / (step * perPage())));
  }
  function goTo(p) {
    var v = visible(); var n = pages();
    p = (p + n) % n;
    var target = v[p * perPage()];
    if (target) track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }
  function drawDots() {
    dotsBox.innerHTML = '';
    for (var i = 0; i < pages(); i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'carousel-dot'; b.tabIndex = -1;
      b.addEventListener('click', goTo.bind(null, i));
      dotsBox.appendChild(b);
    }
    markDot();
  }
  function markDot() {
    var c = current();
    Array.prototype.forEach.call(dotsBox.children, function (d, i) { d.classList.toggle('is-active', i === c); });
  }
  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var price = +c.dataset.price;
      var ok = (search.type === 'all' || c.dataset.type === search.type) &&
               (!search.village || c.dataset.village === search.village) &&
               (!search.street || c.dataset.street.toLowerCase().indexOf(search.street) > -1) &&
               (!search.min || price >= search.min) &&
               (!search.max || price <= search.max);
      c.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    track.scrollLeft = 0;
    drawDots();
  }

  section.querySelectorAll('input[name="home-filter"]').forEach(function (r) {
    r.addEventListener('change', function () { search.type = r.value; apply(); });
  });
  section.querySelector('[data-prev]').addEventListener('click', function () { goTo(current() - 1); });
  section.querySelector('[data-next-slide]').addEventListener('click', function () { goTo(current() + 1); });
  section.querySelector('[data-clear-search]').addEventListener('click', function () {
    search = { type: 'all', village: '', street: '', min: 0, max: 0 };
    section.querySelector('#f-all').checked = true;
    var f = document.getElementById('home-search'); if (f) f.reset();
    apply();
  });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(markDot); });
  window.addEventListener('resize', drawDots);

  /* Moves on its own every 5 seconds; stops while you hover, touch or use the keyboard */
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (e) { section.addEventListener(e, function () { paused = true; }, { passive: true }); });
  ['mouseleave', 'focusout'].forEach(function (e) { section.addEventListener(e, function () { paused = false; }); });
  if (!reduce) timer = setInterval(function () { if (!paused && !document.hidden) goTo(current() + 1); }, 5000);

  var form = document.getElementById('home-search');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    search.type = form.querySelector('#s-type').value;
    search.village = form.querySelector('#s-village').value;
    search.street = form.querySelector('#s-street').value.trim().toLowerCase();
    search.min = +form.querySelector('#s-min').value;
    search.max = +form.querySelector('#s-max').value;
    var radio = section.querySelector('#f-' + search.type); if (radio) radio.checked = true;
    apply();
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Keep the listing filters and the selected card when visiting a property. */
  var returnKey = 'larkline-listing:' + location.pathname;
  section.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link || !/property\.html(?:[?#]|$)/.test(link.getAttribute('href'))) return;
    var card = link.closest('.home-card');
    var state = { search: search, card: cards.indexOf(card), left: track.scrollLeft };
    try { sessionStorage.setItem(returnKey, JSON.stringify(state)); } catch (err) {}
  });
  function restoreListing() {
    if (!new URLSearchParams(location.search).has('returnToHomes')) return;
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(returnKey)); } catch (err) {}
    if (saved && saved.search) {
      search = saved.search;
      var radio = section.querySelector('#f-' + search.type); if (radio) radio.checked = true;
      if (form) ['type', 'village', 'street', 'min', 'max'].forEach(function (key) {
        var field = form.querySelector('#s-' + key); if (field) field.value = String(search[key] || (key === 'min' || key === 'max' ? '0' : ''));
      });
      apply();
    }
    paused = true;
    function position() {
      var chosen = saved && cards[saved.card];
      track.scrollTo({ left: chosen ? chosen.offsetLeft - track.offsetLeft : (saved && saved.left || 0), behavior: 'instant' });
      section.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    requestAnimationFrame(function () { requestAnimationFrame(position); });
    if (document.readyState !== 'complete') window.addEventListener('load', position, { once: true });
  }
  drawDots();
  restoreListing();
})();

/* New homes by WhatsApp */
(function () {
  var form = document.getElementById('alert-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('input');
    if (input.value.replace(/\D/g, '').length < 9) { input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    input.hidden = true;
    form.querySelector('button').hidden = true;
    form.querySelector('.alert-done').hidden = false;
  });
})();

/* Team: 3D ring. Turns slowly, pauses on hover, can be dragged, arrows step one person */
(function () {
  var root = document.querySelector('[data-ring]');
  if (!root) return;
  var stage = root.querySelector('.ring-stage');
  var ring = root.querySelector('.ring');
  var cards = Array.prototype.slice.call(ring.children);
  var n = cards.length, step = 360 / n;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var angle = 0, vel = 0, hovering = false, focused = false, dragging = false, paused = false;
  var tween = null, last = 0, startX = 0, lastX = 0, lastT = 0, moved = 0, suppressClick = false;

  function norm(a) { return ((a % 360) + 540) % 360 - 180; }
  function layout() {
    var w = cards[0].offsetWidth;
    var r = (w / 2) / Math.tan(Math.PI / n) + 24;
    root.style.setProperty('--ring-r', r + 'px');
    cards.forEach(function (c, i) { c.style.setProperty('--card-angle', (i * step) + 'deg'); });
    var h = 0; cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
    stage.style.height = (h + 64) + 'px';
  }
  function render() {
    ring.style.setProperty('--ring-angle', angle + 'deg');
    cards.forEach(function (c, i) {
      var a = Math.abs(norm(i * step + angle)), t = a / 180;
      c.style.opacity = (1 - 0.7 * t).toFixed(3);
      c.style.filter = t > 0.08 ? 'blur(' + (t * 3).toFixed(2) + 'px)' : 'none';
      c.classList.toggle('is-front', a < step / 2);
    });
  }
  function frontIndex() { return ((Math.round(-angle / step) % n) + n) % n; }
  function goTo(i) {
    var target = -i * step, delta = norm(target - angle);
    vel = 0;
    if (reduced) { angle += delta; tween = null; render(); return; }
    tween = { from: angle, to: angle + delta, start: performance.now(), dur: 650 };
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function loop(ts) {
    var dt = last ? Math.min(ts - last, 50) : 16; last = ts;
    if (tween) {
      var p = Math.min((ts - tween.start) / tween.dur, 1);
      angle = tween.from + (tween.to - tween.from) * ease(p);
      if (p >= 1) tween = null;
    } else if (!dragging) {
      if (Math.abs(vel) > 0.002) { angle += vel * dt; vel *= Math.pow(0.94, dt / 16); }
      else if (!reduced && !hovering && !focused && !paused && !dialogOpen()) { angle -= 0.006 * dt; }
    }
    render();
    requestAnimationFrame(loop);
  }

  root.querySelector('[data-ring-prev]').addEventListener('click', function () { goTo((frontIndex() - 1 + n) % n); });
  root.querySelector('[data-ring-next]').addEventListener('click', function () { goTo((frontIndex() + 1) % n); });
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', function () { hovering = false; });
  root.addEventListener('focusin', function (e) {
    focused = true;
    var card = e.target.closest('.ring-card');
    if (card && !card.classList.contains('is-front')) goTo(cards.indexOf(card));
  });
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) focused = false; });

  stage.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    dragging = true; tween = null; vel = 0; moved = 0;
    startX = lastX = e.clientX; lastT = performance.now();
    stage.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var now = performance.now(), dx = e.clientX - lastX;
    angle += dx * 0.3; moved += Math.abs(dx);
    vel = (dx * 0.3) / Math.max(now - lastT, 1);
    lastX = e.clientX; lastT = now;
  });
  window.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false; stage.classList.remove('is-dragging');
    if (reduced) vel = 0;
    suppressClick = moved > 6;
  });
  ring.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    var card = e.target.closest('.ring-card');
    if (card && !card.classList.contains('is-front')) { e.preventDefault(); goTo(cards.indexOf(card)); return; }
    if (card && !e.target.closest('a')) openCard(card);
  }, true);

  /* Pause button between the arrows */
  var pauseBtn = root.querySelector('[data-ring-pause]');
  pauseBtn.addEventListener('click', function () {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', (window.lkT || String)(paused ? 'Start the turning' : 'Pause the turning'));
    pauseBtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  });

  /* The front card opens as a large card with everything clickable, and a back button */
  var dialog = document.querySelector('.agent-dialog');
  function dialogOpen() { return dialog && dialog.open; }
  function openCard(card) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var img = card.querySelector('.ring-photo');
    dialog.querySelector('.agent-dialog-photo').src = img.currentSrc || img.src;
    dialog.querySelector('.agent-dialog-photo').alt = img.alt;
    dialog.querySelector('#agent-dialog-name').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('.agent-dialog-role').textContent = card.querySelector('.ring-body p').textContent;
    dialog.querySelector('.agent-dialog-bio').textContent = card.getAttribute('data-bio') || '';
    var box = dialog.querySelector('.agent-dialog-actions'); box.innerHTML = '';
    card.querySelectorAll('.agent-actions a').forEach(function (a, i) {
      var b = a.cloneNode(true); b.className = i === 0 ? 'btn-solid' : 'btn-outline'; box.appendChild(b);
    });
    dialog.showModal();
  }
  /* "Ask Daniel" buttons in the village picker open the same agent card */
  window.lkOpenAgent = function (first) {
    var cards = document.querySelectorAll('.ring-card');
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].querySelector('h3').textContent.indexOf(first) === 0) { openCard(cards[i]); return; }
    }
  };
  document.querySelectorAll('[data-agent]').forEach(function (b) {
    if (b.tagName !== 'BUTTON') return;
    b.addEventListener('click', function (e) { e.stopPropagation(); window.lkOpenAgent(b.getAttribute('data-agent')); });
  });
  if (dialog) {
    dialog.querySelector('[data-dialog-back]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  layout(); render();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  requestAnimationFrame(loop);
})();

/* Back to the top button: shows after the hero */
(function () {
  var btn = document.querySelector('.to-top');
  if (!btn) return;
  function check() { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8); }
  window.addEventListener('scroll', check, { passive: true });
  check();
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    var first = document.querySelector('.site-logo');
    if (first) first.focus({ preventScroll: true });
  });
})();


/* Visit us: it starts with the whole earth, made of little houses. The earth turns to Europe and the camera dives
   down to the Netherlands. Then Horst aan de Maas appears as a tiny planet: the village names light up one by one,
   and the camera flies down to our office. Places are approximate, the globe is an illustration. */
/* MODE 'office': ends with the flight to our office (Visit us). MODE 'area': stops at the municipality with every
   village lit, for the popup behind the location hint in the hero. */
function larklineGlobe(stage, MODE) {
  var labelsBox = stage.querySelector('.map-labels');
  var card = stage.querySelector('.map-office');
  var replay = stage.querySelector('.map-replay');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof THREE === 'undefined') { card.classList.add('is-visible'); card.style.left = '50%'; card.style.top = '50%'; card.style.transform = 'translate(-50%, -50%)'; return; }

  var LAT0 = 51.455, LON0 = 6.04, R = 14;
  function xz(lat, lon) { return [(lon - LON0) * 69.4, -(lat - LAT0) * 111.2]; }
  var villages = [
    ['Horst', 51.4542, 6.0517, 1.0, 'u'], ['Hegelsom', 51.4339, 6.0306, 0.45, 'd'], ['Meterik', 51.4470, 6.0200, 0.35, 'l'], ['Sevenum', 51.4106, 6.0369, 0.8, 'r'],
    ['Kronenberg', 51.4183, 5.9878, 0.45, 'l'], ['Evertsoord', 51.4058, 6.0050, 0.3, 'l'], ['America', 51.4369, 5.9806, 0.5, 'u'],
    ['Griendtsveen', 51.4517, 5.9058, 0.4, 'u'], ['Melderslo', 51.4639, 6.0867, 0.4, 'r'], ['Meerlo', 51.5133, 6.0839, 0.5, 'u'],
    ['Swolgen', 51.4950, 6.0892, 0.4, 'l'], ['Tienray', 51.4936, 6.1125, 0.4, 'd'], ['Broekhuizenvorst', 51.5050, 6.1490, 0.45, 'u'],
    ['Broekhuizen', 51.4872, 6.1640, 0.4, 'r'], ['Lottum', 51.4597, 6.1586, 0.5, 'r'], ['Grubbenvorst', 51.4206, 6.1458, 0.7, 'r']
  ];
  var OFFICE = xz(51.4550, 6.0497);
  var river = [[51.385, 6.158], [51.405, 6.163], [51.425, 6.168], [51.445, 6.176], [51.465, 6.179], [51.485, 6.180], [51.500, 6.171], [51.515, 6.156], [51.535, 6.135]].map(function (p) { return xz(p[0], p[1]); });

  function distSeg(px, pz, a, b) {
    var dx = b[0] - a[0], dz = b[1] - a[1], t = ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz);
    t = Math.max(0, Math.min(1, t)); var x = a[0] + t * dx - px, z = a[1] + t * dz - pz; return Math.sqrt(x * x + z * z);
  }
  function riverDist(x, z) { var d = 1e9; for (var i = 0; i < river.length - 1; i++) d = Math.min(d, distSeg(x, z, river[i], river[i + 1])); return d; }
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  /* The flat map is wrapped onto a ball: map x/z become angles on the sphere, the map centre sits on top */
  function sp(x, z, h) {
    var lon = x / R, lat = z / R, cl = Math.cos(lat), r = R + h;
    return new THREE.Vector3(Math.sin(lon) * cl * r, Math.cos(lon) * cl * r, Math.sin(lat) * r);
  }
  var up = new THREE.Vector3(0, 1, 0);
  function align(x, z) { return new THREE.Quaternion().setFromUnitVectors(up, sp(x, z, 0).normalize()); }

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: stage.querySelector('.map-canvas'), antialias: true, alpha: true }); }
  catch (e) { card.classList.add('is-visible'); return; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x211B16, 48, 90);
  var camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  scene.add(new THREE.AmbientLight(0xFBF7F2, 0.85));
  var sun = new THREE.DirectionalLight(0xFFE6CC, 0.65); sun.position.set(-8, 14, 10); scene.add(sun);
  var globe = new THREE.Group(); scene.add(globe);

  /* Streets follow the grid of the blocks: one row and one column through each village, side streets in the big ones,
     and L-shaped roads to the two nearest villages */
  var CELL = 0.3, X0 = -12, Z0 = -9.5, roadSet = {};
  function gi(x) { return Math.round((x - X0) / CELL); }
  function gj(z) { return Math.round((z - Z0) / CELL); }
  function run(i0, j0, i1, j1) {
    var i = i0, j = j0; roadSet[i + ',' + j] = 1;
    while (i !== i1) { i += i1 > i ? 1 : -1; roadSet[i + ',' + j] = 1; }
    while (j !== j1) { j += j1 > j ? 1 : -1; roadSet[i + ',' + j] = 1; }
  }
  var vp = villages.map(function (v) { return xz(v[1], v[2]); });
  vp.forEach(function (p, n) {
    var ci = gi(p[0]), cj = gj(p[1]), size = villages[n][3], len = Math.round((0.4 + size * 1.0) / CELL), len2 = Math.round(len * 0.8);
    run(ci - len, cj, ci + len, cj); run(ci, cj - len2, ci, cj + len2);
    if (size > 0.6) { run(ci - Math.round(len * 0.6), cj + 3, ci + Math.round(len * 0.6), cj + 3); run(ci - Math.round(len * 0.6), cj - 3, ci + Math.round(len * 0.6), cj - 3); }
    var d = vp.map(function (q, m) { return { m: m, d: Math.hypot(q[0] - p[0], q[1] - p[1]) }; }).filter(function (o) { return o.m !== n; }).sort(function (a, b) { return a.d - b.d; });
    d.slice(0, 2).forEach(function (o) { var q = vp[o.m]; run(ci, cj, gi(q[0]), gj(q[1])); });
  });

  /* Little houses like board-game pieces: walls plus a pitched roof. Villages are dense, the land between has the odd farm */
  var cells = [], vIndex = [], fields = [], roads = [];
  for (var ix = 0; X0 + ix * CELL <= 13; ix++) {
    for (var iz = 0; Z0 + iz * CELL <= 8.5; iz++) {
      var gx = X0 + ix * CELL, gz = Z0 + iz * CELL;
      var nx = (gx - 0.5) / 13, nz = (gz + 0.5) / 9.5;
      if (nx * nx + nz * nz + (rnd() - 0.5) * 0.15 > 1) continue;
      var rd = riverDist(gx, gz);
      if (rd < 0.38) continue;
      if (roadSet[ix + ',' + iz]) { roads.push({ x: gx, z: gz }); continue; }
      var east = gx > river[4][0];
      var near = -1, best = 0;
      villages.forEach(function (v, i) {
        var p = vp[i], dx = gx - p[0], dz = gz - p[1], r = 0.45 + v[3] * 0.55;
        var f = Math.exp(-(dx * dx + dz * dz) / (2 * r * r)) * v[3];
        if (f > best) { best = f; near = i; }
      });
      fields.push({ x: gx, z: gz, east: east, tone: rnd() });
      var isHouse = !east && (best > 0.14 ? rnd() < 0.34 + best * 0.25 : rnd() < 0.018);
      if (!isHouse) continue;
      var wall = 0.20 + rnd() * 0.10 + (best > 0.14 ? best * 0.14 * rnd() : 0);
      cells.push({ x: gx, z: gz, wall: wall, turn: rnd() < 0.5, v: best > 0.25 ? near : -1, w: 0.58 + rnd() * 0.14 });
    }
  }
  /* A prism for the roof: ridge along z, eaves at y 0, ridge at y 1 */
  var roofGeo = new THREE.BufferGeometry();
  var rv = [-0.5,0,-0.5, 0.5,0,-0.5, 0,1,-0.5,  -0.5,0,0.5, 0,1,0.5, 0.5,0,0.5,
            -0.5,0,-0.5, 0,1,-0.5, 0,1,0.5,  -0.5,0,-0.5, 0,1,0.5, -0.5,0,0.5,
             0.5,0,-0.5, 0.5,0,0.5, 0,1,0.5,  0.5,0,-0.5, 0,1,0.5, 0,1,-0.5];
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(rv, 3)); roofGeo.computeVertexNormals();
  var bodyGeo = new THREE.BoxGeometry(1, 1, 1); bodyGeo.translate(0, 0.5, 0);
  var tileGeo = new THREE.BoxGeometry(CELL * 0.94, 0.03, CELL * 0.94); tileGeo.translate(0, 0.015, 0);
  var roadGeo = new THREE.BoxGeometry(CELL * 1.02, 0.02, CELL * 1.02); roadGeo.translate(0, 0.012, 0);
  var bodies = new THREE.InstancedMesh(bodyGeo, new THREE.MeshLambertMaterial(), cells.length);
  var mesh = new THREE.InstancedMesh(roofGeo, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), cells.length);
  var tiles = new THREE.InstancedMesh(tileGeo, new THREE.MeshLambertMaterial(), fields.length);
  /* Streets: wider, light grey and partly see-through, so they sit quietly between the houses */
  var roadMesh = new THREE.InstancedMesh(roadGeo, new THREE.MeshLambertMaterial({ color: 0x9A8E82, transparent: true, opacity: 0.24, depthWrite: false }), roads.length);
  var m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), sc = new THREE.Vector3();
  var cWall = new THREE.Color(0xC8B89F), cRoof = new THREE.Color(0x78604B), cOrange = new THREE.Color(0xE86E14);
  var cField = new THREE.Color(0x51483E), cField2 = new THREE.Color(0x5B5145), cEast = new THREE.Color(0x4B4239);
  cells.forEach(function (c, i) {
    var w = CELL * c.w, d = CELL * c.w * 0.8, roofH = CELL * 0.64;
    var q = align(c.x, c.z).multiply(qt.setFromAxisAngle(up, c.turn ? Math.PI / 2 : 0));
    m4.compose(sp(c.x, c.z, 0.025), q, sc.set(w, c.wall, d)); bodies.setMatrixAt(i, m4);
    m4.compose(sp(c.x, c.z, c.wall + 0.025), q, sc.set(w * 1.12, roofH, d * 1.08)); mesh.setMatrixAt(i, m4);
    bodies.setColorAt(i, cWall.clone().multiplyScalar(0.85 + rnd() * 0.25));
    c.color = cRoof.clone().lerp(new THREE.Color(0x7A3606), rnd() * 0.35);
    mesh.setColorAt(i, c.color);
    if (c.v >= 0) (vIndex[c.v] = vIndex[c.v] || []).push(i);
  });
  fields.forEach(function (f, i) {
    m4.compose(sp(f.x, f.z, 0), align(f.x, f.z), sc.set(1, 1, 1)); tiles.setMatrixAt(i, m4);
    tiles.setColorAt(i, f.east ? cEast : cField.clone().lerp(cField2, f.tone));
  });
  roads.forEach(function (r, i) { m4.compose(sp(r.x, r.z, 0), align(r.x, r.z), sc.set(1, 1, 1)); roadMesh.setMatrixAt(i, m4); });
  /* A continuous spherical ground replaces the disconnected rectangular tiles.
     The soft texture belongs to the sphere; houses are separate raised objects. */
  var groundCanvas = document.createElement('canvas');
  groundCanvas.width = 1024; groundCanvas.height = 512;
  var groundCtx = groundCanvas.getContext('2d');
  groundCtx.fillStyle = '#706958'; groundCtx.fillRect(0, 0, 1024, 512);
  var groundSeed = 19;
  function groundRandom() { groundSeed = (groundSeed * 16807) % 2147483647; return (groundSeed - 1) / 2147483646; }
  for (var patch = 0; patch < 180; patch++) {
    var px = groundRandom() * 1024, py = groundRandom() * 512;
    var radius = 25 + groundRandom() * 80;
    var gradient = groundCtx.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, patch % 2 ? 'rgba(158,145,115,0.16)' : 'rgba(65,78,52,0.12)');
    gradient.addColorStop(1, 'rgba(112,105,88,0)');
    groundCtx.fillStyle = gradient; groundCtx.fillRect(px-radius, py-radius, radius*2, radius*2);
  }
  var groundTexture = new THREE.CanvasTexture(groundCanvas);
  var ball = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96), new THREE.MeshLambertMaterial({ map: groundTexture, color: 0xffffff }));
  globe.add(ball, roadMesh, bodies, mesh);

  /* The rest of the ball: fields and farms all the way round, so the whole planet is covered */
  (function () {
    var N = 13000, outT = [], outH = [], gold = Math.PI * (3 - Math.sqrt(5));
    for (var k = 0; k < N; k++) {
      var y = 1 - (k + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = k * gold;
      var dx = Math.cos(th) * rr, dz = Math.sin(th) * rr;
      var mx = Math.atan2(dx, y) * R, mz = Math.asin(dz) * R;
      var ex = (mx - 0.5) / 13.4, ez = (mz + 0.5) / 9.9;
      if (y > 0 && ex * ex + ez * ez < 1) continue;
      var n = new THREE.Vector3(dx, y, dz);
      outT.push(n);
      if (rnd() < 0.055) outH.push({ n: n, wall: 0.19 + rnd() * 0.10, turn: rnd() * Math.PI });
    }
    var oGeo = new THREE.BoxGeometry(0.4, 0.03, 0.4); oGeo.translate(0, 0.015, 0);
    var oTiles = new THREE.InstancedMesh(oGeo, new THREE.MeshLambertMaterial(), outT.length);
    var oBodies = new THREE.InstancedMesh(bodyGeo, new THREE.MeshLambertMaterial(), outH.length);
    var oRoofs = new THREE.InstancedMesh(roofGeo, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), outH.length);
    var qq = new THREE.Quaternion();
    outT.forEach(function (n, i) {
      qq.setFromUnitVectors(up, n).multiply(qt.setFromAxisAngle(up, Math.atan2(n.x, n.z)));
      m4.compose(n.clone().multiplyScalar(R), qq, sc.set(1, 1, 1)); oTiles.setMatrixAt(i, m4);
      oTiles.setColorAt(i, cField.clone().lerp(cField2, rnd()).multiplyScalar(0.92));
    });
    outH.forEach(function (h, i) {
      qq.setFromUnitVectors(up, h.n).multiply(qt.setFromAxisAngle(up, h.turn));
      var w = 0.23, d = 0.19;
      m4.compose(h.n.clone().multiplyScalar(R), qq, sc.set(w, h.wall, d)); oBodies.setMatrixAt(i, m4);
      m4.compose(h.n.clone().multiplyScalar(R + h.wall), qq, sc.set(w * 1.12, 0.19, d * 1.08)); oRoofs.setMatrixAt(i, m4);
      oBodies.setColorAt(i, cWall.clone().multiplyScalar(0.8 + rnd() * 0.25));
      oRoofs.setColorAt(i, cRoof.clone().lerp(new THREE.Color(0x7A3606), rnd() * 0.35));
    });
    globe.add(oBodies, oRoofs);
  })();

  /* The earth: land from a small built-in map of the continents (1.5 degree cells), each cell a field tile, many with a house */
  var MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADofwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj/n////2MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/++f///x8AACABgGkAAOABAAAAAAAAAAAAAAAAWPw//v///wMAAD8AAAAAAAA4AAAAAAAAAAAAAAAHAMAB/P///w8AAAwAAAAAAAgwAAAAAAAAAAAAAAC8cxgDAP7//wcAAAAAAIAHAMD/DwD0AAAAAAAAAOACAAAAAPz//wcAAAAAAGAAAPz/AQAAAAAAAAAAAOA/Y7UDAPD/vwEAAAAAABjAwP//9z9AAAAAA4AAAED8A2P/AeD/fwMAAAAAABDg9v///z//HwCAAPj/A0/8X4PkB9j//wAAAPA/AADj/v///////wc9A/7///8Hwp6hB8D/DwAAAPj/Y+z//f//////////N/D///////+Bf+D/AQAAAP6/x/+//v//////////GP7//////7/wJ+AfAH4AAD5++P//////////////AOD//////8sCH8AfAAwAwL////////////////9/APz//////wNxDIAPAAAI8M////////////////8fAPjf/////wHwAwAOAAAA+M///////////////+ADAPAB+P///wHwMwAAAAAA+A////////////9/YhgAAIAC4P///wPgfwAAAAAQABf///////////8fAB4AACAAAP///x/ofwAAAAAwYMb///////////8PAB8AAAQAgP7////5/wEAAABMwOD///////////8DAA8AAAAAAPz////5/wcAAADs8P////////////8/AAcAAAAAAPj////7/wMAAADi+f////////////+/AAEAAAAAAPj/////jwAAAAAw/v////////////+/gAAAAAAAAOD/////Gw4AAACA//////////////8fAAAAAAAAAOD/////HxAAAACA//////////////8fAAAAAAAAAOD/////PwAAAACA//9P/vj///////8PAAAAAAAAAOD/////EwAAAACA//wHfPz////////HAAAAAAAAAOD/////AQAAAAD8g/EH8Pj////////gAAAAAAAAAOD///9/AAAAAAD8Aebn+fH//////z8AAAAAAAAAAOD///9/AAAAAAD8AGD+//H//////xpgAAAAAAAAAMD///8/AAAAAAD8AMT8//H/////fzggAAAAAAAAAID///8fAAAAAAAQdADs//v//////zE4AAAAAAAAAID///8fAAAAAACwfwBD/////////zA/AAAAAAAAAAD+//8HAAAAAAD4fwAA/////////0AHAAAAAAAAAAD8//8DAAAAAAD8/2OA/////////4EAAAAAAAAAAADo//8DAAAAAAD+/+///////////wEAAAAAAAAAAAD4/xkCAAAAAAD+//////z//////wEAAAAAAAAAAADYfwACAAAAAID///8///n//////wAAAAAAAAAAAACgfwAGAAAAAMD///9//8H//////wAAAAAAAAAAAAAgfwAAAAAAAMD///9//jPg////fwAAAAAAAAAAAAAAfgAAAAAAAOD//////H/A////PwEAAAAAAAAAAAAAfAAIAAAAAOD//////f/A/+//BwAAAAAAAAAAAAAAfDBwAAAAAOD/////+X8A/sN/AAAAAAAAAAAAAAAA+DgAAwAAAOD/////+T8A/oA/AwAAAAAAAAAAAAAA4B8AAAAAAOD/////8x8AfoB/AAMAAAAAAAAAAAAAgPwAAAAAAOD/////8wcAPgD+AAEAAAAAAAAAAAAAAPgBAAAAAOD/////7wEAHAD+AQEAAAAAAAAAAAAAAMAAAAAAAOD/////PwAAHAD8AQAAAAAAAAAAAAAAAICAAgAAAOD/////HwMAGADgAQ4AAAAAAAAAAAAAAADBfgAAAID//////wMAOABAAAAAAAAAAAAAAAAAAADy/wAAAID//////wEAKAAEAAwAAAAAAAAAAAAAAADw/wEAAAD//////wEAYAAIAAgAAAAAAAAAAAAAAADw/x8AAAB88P///wAAAIAZ4AAAAAAAAAAAAAAAAADg/z8AAAAAwP///wAAAAAbMAAAAAAAAAAAAAAAAADw/z8AAAAAgP//PwAAAAAWfCAAAAAAAAAAAAAAAAD4/z8AAAAAwP//HwAAAAAMficAAAAAAAAAAAAAAAD8//8BAAAAwP//DwAAAAAYPiAFAAAAAAAAAAAAAAD8//8DAAAAwP//BwAAAAA8vgEZAAAAAAAAAAAAAAD8//8/AAAAgP//BwAAAABwMBL+AAAAAAAAAAAAAAD8////AAAAAP//BwAAAABgAADwAQAAAAAAAAAAAAD4////AQAAAP//AwAAAADAAADiAwAAAAAAAAAAAAD4////AQAAAP7/AwAAAAAAHATwBgAAAAAAAAAAAADw////AAAAAP7/AwAAAAAAAAQADAAAAAAAAAAAAADw//9/AAAAAP7/BwAAAAAAAIAAAAAAAAAAAAAAAADg//9/AAAAAP7/BwAAAAAAAICHAAAAAAAAAAAAAADg//8/AAAAAP//BwEAAAAAANDHAAAAAAAAAAAAAADA//8/AAAAAP//hwMAAAAAAPjHAQAAAAAAAAAAAAAA//8/AAAAAP//4QEAAAAAAP7fAQAAAAAAAAAAAAAA/v8/AAAAAP//4AEAAAAAAP7/AwAAAAAAAAAAAAAA/v8fAAAAAP5/wEAAAAAAgP//BwAAAAAAAAAAAAAA/v8fAAAAAP7/4AAAAAAA4P//D0AAAAAAAAAAAAAA/v8DAAAAAPz/4AAAAAAA8P//HwAAAAAAAAAAAAAA/v8AAAAAAPx/YAAAAAAA8P//PwAAAAAAAAAAAAAA/v8AAAAAAPw/AAAAAAAA+P//PwAAAAAAAAAAAAAA/v8AAAAAAPw/AAAAAAAA8P//PwAAAAAAAAAAAAAA/38AAAAAAPgfAAAAAAAA4P//PwAAAAAAAAAAAAAA/z8AAAAAAPAPAAAAAAAA4P//PwAAAAAAAAAAAAAA/x8AAAAAAPAHAAAAAAAA4B/+PwAAAAAAAAAAAAAA/w8AAAAAAPABAAAAAAAA4AP0HwAAAAAAAAAAAAAA/wMAAAAAAAAAAAAAAAAAAADwDwAIAAAAAAAAAACA/wMAAAAAAAAAAAAAAAAAAADgDwAQAAAAAAAAAACA/wEAAAAAAAAAAAAAAAAAAADAAgBwAAAAAAAAAACAfwAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAACAHwAAAAAAAAAAAAAAAAAAAAAABwAQAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAAAAABgAMAAAAAAAAAACADwAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAACABwAAAAAAAAAAAAAAAAAAAAAAAIADAAAAAAAAAADADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var earth = new THREE.Group(); scene.add(earth);
  var RE = 14, NL_LAT = 51.45 * Math.PI / 180, NL_LON = 6.04 * Math.PI / 180;
  function ev(lat, lon, h) { var r = RE + h, c = Math.cos(lat); return new THREE.Vector3(c * Math.sin(lon), Math.sin(lat), c * Math.cos(lon)).multiplyScalar(r); }
  (function () {
    var bin = atob(MASK), W = 240, H = 120, land = [];
    for (var j = 0; j < H; j++) {
      var lat = 90 - (j + 0.5) * 1.5;
      for (var i = 0; i < W; i++) {
        var k = j * W + i;
        if (!(bin.charCodeAt(k >> 3) & (1 << (k & 7)))) continue;
        if (Math.abs(lat) > 62 && (i % 2)) continue; /* fewer cells near the poles, where they bunch up */
        land.push([lat * Math.PI / 180, (-180 + (i + 0.5) * 1.5) * Math.PI / 180]);
      }
    }
    var eTileGeo = new THREE.BoxGeometry(0.33, 0.05, 0.33); eTileGeo.translate(0, 0.025, 0);
    var houses = land.filter(function () { return rnd() < 0.42; });
    var eTiles = new THREE.InstancedMesh(eTileGeo, new THREE.MeshLambertMaterial(), land.length);
    var eBodies = new THREE.InstancedMesh(bodyGeo, new THREE.MeshLambertMaterial(), houses.length);
    var eRoofs = new THREE.InstancedMesh(roofGeo, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), houses.length);
    var qq = new THREE.Quaternion(), cLand = new THREE.Color(0x5C4F43), cLand2 = new THREE.Color(0x6E6259);
    function near(p) { return Math.abs(p[0] - NL_LAT) < 0.035 && Math.abs(p[1] - NL_LON) < 0.05; }
    land.forEach(function (p, i) {
      var n = ev(p[0], p[1], 0).normalize();
      qq.setFromUnitVectors(up, n).multiply(qt.setFromAxisAngle(up, p[1]));
      m4.compose(ev(p[0], p[1], 0), qq, sc.set(1, 1, 1)); eTiles.setMatrixAt(i, m4);
      eTiles.setColorAt(i, near(p) ? cOrange : cLand.clone().lerp(cLand2, rnd()));
    });
    houses.forEach(function (p, i) {
      var n = ev(p[0], p[1], 0).normalize(), wall = 0.1 + rnd() * 0.1;
      qq.setFromUnitVectors(up, n).multiply(qt.setFromAxisAngle(up, p[1] + (rnd() < 0.5 ? 0 : Math.PI / 2)));
      m4.compose(ev(p[0], p[1], 0.05), qq, sc.set(0.2, wall, 0.16)); eBodies.setMatrixAt(i, m4);
      m4.compose(ev(p[0], p[1], 0.05 + wall), qq, sc.set(0.23, 0.12, 0.18)); eRoofs.setMatrixAt(i, m4);
      eBodies.setColorAt(i, cWall.clone().multiplyScalar(0.85 + rnd() * 0.25));
      eRoofs.setColorAt(i, near(p) ? cOrange : cRoof.clone().lerp(new THREE.Color(0x7A3606), rnd() * 0.45));
    });
    var sea = new THREE.Mesh(new THREE.SphereGeometry(RE - 0.01, 96, 64), new THREE.MeshLambertMaterial({ color: 0x463D34 }));
    earth.add(sea, eTiles, eBodies, eRoofs);
  })();
  /* Earth labels: Europe while the earth turns, then Amsterdam as a landmark everyone knows, then Horst aan de Maas */
  var eLabels = [['Europe', 54, 22], ['Amsterdam', 52.37, 4.9], ['Horst aan de Maas', 51.45, 6.04]].map(function (d, n) {
    var el = document.createElement('span'); el.className = 'map-label earth-label' + (n ? ' earth-city' : '') + (n === 1 ? ' earth-landmark' : ''); el.textContent = window.lkT ? window.lkT(d[0]) : d[0]; el.setAttribute('data-en', d[0]); labelsBox.appendChild(el);
    return { el: el, pos: ev(d[1] * Math.PI / 180, d[2] * Math.PI / 180, 0.3) };
  });
  var fade = document.createElement('div'); fade.className = 'map-fade'; fade.setAttribute('aria-hidden', 'true'); stage.appendChild(fade);

  /* Office marker: an orange pin with a pulsing ring, standing upright on the ball */
  var pin = new THREE.Group();
  var pinMat = new THREE.MeshLambertMaterial({ color: 0xE86E14, emissive: 0x7A3606 });
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), pinMat); head.position.y = 1.75;
  var tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 24), pinMat); tip.rotation.x = Math.PI; tip.position.y = 1.45;
  var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 12), pinMat); stem.position.y = 0.6;
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 40), new THREE.MeshBasicMaterial({ color: 0xE86E14, transparent: true, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
  pin.add(head, tip, stem, ring); pin.position.copy(sp(OFFICE[0], OFFICE[1], 0)); pin.quaternion.copy(align(OFFICE[0], OFFICE[1])); pin.visible = false; globe.add(pin);
  var OFFICE_TOP = sp(OFFICE[0], OFFICE[1], 0);

  /* Village name labels */
  var labels = villages.map(function (v, i) {
    var el = document.createElement('span'); el.className = 'map-label' + (v[3] < 0.45 ? ' is-minor' : ''); el.textContent = v[0]; labelsBox.appendChild(el);
    return { el: el, side: v[4], pos: sp(vp[i][0], vp[i][1], 0.3 + v[3] * 0.3) };
  });

  /* Camera: orbit around a target point. The ball turns gently into place, like the earth */
  var START = { tx: 0.5, ty: 0, tz: -0.5, dist: 50, polar: 14, az: -8 };
  var END = { tx: OFFICE_TOP.x, ty: OFFICE_TOP.y, tz: OFFICE_TOP.z, dist: 7.5, polar: 56, az: 24 };
  var TILT0 = -0.12, SPIN0 = -0.45;
  var cam = Object.assign({}, START);
  function placeCamera() {
    var p = cam.polar * Math.PI / 180, a = cam.az * Math.PI / 180;
    camera.position.set(cam.tx + cam.dist * Math.sin(p) * Math.sin(a), cam.ty + cam.dist * Math.cos(p), cam.tz + cam.dist * Math.sin(p) * Math.cos(a));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function size() {
    var w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    stage.classList.toggle('is-narrow', w < 600);
    START.dist = w / h < 1.1 ? 50 / Math.max(0.55, w / h) : 50; END.dist = w / h < 1.1 ? 9.5 : 7.5;
    camera.updateProjectionMatrix();
  }
  var v3 = new THREE.Vector3(), nrm = new THREE.Vector3(), toCam = new THREE.Vector3();
  function project(el, local, dy) {
    v3.copy(local).applyMatrix4(globe.matrixWorld);
    nrm.copy(v3).normalize(); toCam.copy(camera.position).sub(v3);
    var back = nrm.dot(toCam) < 0;
    v3.project(camera);
    var x = (v3.x * 0.5 + 0.5) * stage.clientWidth, y = (-v3.y * 0.5 + 0.5) * stage.clientHeight;
    el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(' + (dy || SIDE.u) + ')';
    el.style.opacity = back || v3.z > 1 ? 0 : '';
  }
  var SIDE = { u: '-50%, calc(-100% - 4px)', d: '-50%, 6px', l: 'calc(-100% - 8px), -50%', r: '8px, -50%' };
  function tintVillage(i, on) {
    (vIndex[i] || []).forEach(function (k) { mesh.setColorAt(k, on ? cOrange.clone().lerp(cells[k].color, 0.35) : cells[k].color); });
    mesh.instanceColor.needsUpdate = true;
  }
  function lightVillage(i, on) { labels[i].el.classList.toggle('is-lit', on); if (!dimmed || !on) tintVillage(i, on); }

  var LIGHT_START = 1.2, LIGHT_STEP = 0.22, FLY_START = 5.2, FLY_TIME = 4.8, TURN_TIME = 6.5;
  var EARTH_SPIN = 3.2, EARTH_DIVE = 4.4, EARTH_FLY = 3.4, EARTH = EARTH_SPIN + EARTH_DIVE + EARTH_FLY;
  var AMS_LAT = 52.37 * Math.PI / 180, AMS_LON = 4.9 * Math.PI / 180;
  /* Visit us starts right above Horst aan de Maas and only flies to the office; the earth journey is for the popup */
  if (MODE === 'office') { EARTH = 0; LIGHT_START = 0.3; LIGHT_STEP = 0.09; FLY_START = 2.2; TURN_TIME = 2.5; }
  var dimmed = false, t0 = null, done = false, running = false, visible = false, phase = 'earth';
  var elapsed = 0, lastFrame = null, orbit = 0;
  function updateVisibility() {
    if (visible && !document.hidden && !reduced) start();
    else lastFrame = null;
  }
  document.addEventListener('visibilitychange', updateVisibility);
  var camDir = new THREE.Vector3(0, Math.sin(NL_LAT), Math.cos(NL_LAT));
  function setPhase(p) {
    phase = p;
    earth.visible = p === 'earth'; globe.visible = p !== 'earth';
    if (p !== 'earth' && typeof route !== 'undefined' && route) route.style.opacity = 0;
    eLabels.forEach(function (l) { l.el.style.display = p === 'earth' ? '' : 'none'; });
    labels.forEach(function (l) { l.el.style.display = p === 'earth' ? 'none' : ''; });
  }
  /* The earth turns towards Europe, then the camera dives straight down to the Netherlands */
  function earthFrame(t) {
    var s = ease(Math.min(1, t / (EARTH_SPIN + 0.6)));
    var k = t < EARTH_SPIN ? 0 : ease(Math.min(1, (t - EARTH_SPIN) / EARTH_DIVE));
    /* After the dive: a short flight from Amsterdam to Horst, the globe turns under the arrow like under a plane */
    var fRaw = Math.max(0, Math.min(1, (t - EARTH_SPIN - EARTH_DIVE) / (EARTH_FLY - 0.6))), f = ease(fRaw);
    var lat = AMS_LAT + (NL_LAT - AMS_LAT) * f, lon = AMS_LON + (NL_LON - AMS_LON) * f;
    camDir.set(0, Math.sin(lat), Math.cos(lat));
    earth.rotation.set(0, -lon + 2.4 * (1 - s), 0);
    var d = (stage.clientWidth / stage.clientHeight < 1.1 ? 46 : 34) * Math.pow(7 / 34, k) * Math.pow(4.2 / 7, ease(Math.min(1, fRaw * 1.4)));
    camera.position.copy(camDir).multiplyScalar(RE + d);
    camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0);
    fade.classList.toggle('is-on', t > EARTH - 0.85);
    earth.updateMatrixWorld(); renderer.render(scene, camera);
    var pts = [];
    eLabels.forEach(function (l, i) {
      v3.copy(l.pos).applyMatrix4(earth.matrixWorld); nrm.copy(v3).normalize(); toCam.copy(camera.position).sub(v3);
      var back = nrm.dot(toCam) < 0; v3.project(camera);
      var x = (v3.x * 0.5 + 0.5) * stage.clientWidth, y = (-v3.y * 0.5 + 0.5) * stage.clientHeight;
      pts[i] = [x, y];
      l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(' + (i ? '-6px, -50%' : '-50%, -50%') + ')';
      var show = i === 0 ? t > 1.2 && k < 0.35 : i === 1 ? k > 0.12 && fRaw < 0.75 : fRaw > 0.7 && k > 0.5;
      l.el.classList.toggle('is-lit', show); l.el.style.opacity = back || !show ? 0 : '';
    });
    drawRoute(pts[1], pts[2], fRaw, t > EARTH - 0.45);
  }
  /* The flight arrow: a curved line from Amsterdam to Horst that draws itself, with an arrow head at the front */
  var route = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  route.setAttribute('class', 'map-route'); route.setAttribute('aria-hidden', 'true');
  route.innerHTML = '<path class="map-route-line"/><path class="map-route-head" d="M-9,-6 L3,0 L-9,6"/>';
  stage.appendChild(route);
  var routeLine = route.firstChild, routeHead = route.lastChild;
  function drawRoute(a, b, p, off) {
    if (!a || !b || p <= 0 || off) { route.style.opacity = 0; return; }
    route.style.opacity = 1;
    route.setAttribute('viewBox', '0 0 ' + stage.clientWidth + ' ' + stage.clientHeight);
    var lift = Math.max(110, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.8);
    var c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift];
    routeLine.setAttribute('d', 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' Q' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1));
    var len = routeLine.getTotalLength(), q = Math.min(1, p * 1.15);
    routeLine.style.strokeDasharray = len; routeLine.style.strokeDashoffset = len * (1 - q);
    var at = routeLine.getPointAtLength(len * q), back = routeLine.getPointAtLength(Math.max(0, len * q - 2));
    var ang = Math.atan2(at.y - back.y, at.x - back.x) * 180 / Math.PI;
    routeHead.setAttribute('transform', 'translate(' + at.x.toFixed(1) + ',' + at.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
  }
  function turnGlobe(t) { var u = ease(Math.min(1, t / TURN_TIME)); globe.rotation.set(TILT0 * (1 - u), SPIN0 * (1 - u), 0); }
  function frame(now) {
    if (!visible || document.hidden) { running = false; lastFrame = null; return; }
    var dt = lastFrame === null ? 0 : Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now; elapsed += dt;
    var t = elapsed;
    if (t < EARTH) {
      if (phase !== 'earth') setPhase('earth');
      earthFrame(t);
      if (visible) requestAnimationFrame(frame); else running = false;
      return;
    }
    if (phase === 'earth') { setPhase('region'); setTimeout(function () { fade.classList.remove('is-on'); }, 160); }
    t -= EARTH;
    turnGlobe(t);
    labels.forEach(function (l, i) { var on = t >= LIGHT_START + i * LIGHT_STEP; if (on !== l.lit) { l.lit = on; lightVillage(i, on); } });
    if (MODE === 'area') {
      /* The municipality: move in a little, keep every village lit, and let people point at the villages */
      if (!(typeof hot === 'number' && hot >= 0)) orbit += dt * 0.65;
      var kz = ease(Math.min(1, t / 6.5));
      var zin = stage.clientWidth / stage.clientHeight < 1.1 ? 0.04 : 0.22;
      cam = Object.assign({}, START); cam.dist = START.dist * (1 - zin * kz); cam.polar = START.polar + 14 * kz; cam.az = START.az + orbit;
      if (t > LIGHT_START + villages.length * LIGHT_STEP && !done) { done = true; replay.classList.add('is-visible'); }
    }
    else if (t < FLY_START) { cam = Object.assign({}, START); cam.az = START.az + t * 2.5; }
    else {
      var k = ease(Math.min(1, (t - FLY_START) / FLY_TIME)), from = START.az + FLY_START * 2.5;
      cam.tx = lerp(START.tx, END.tx, k); cam.ty = lerp(START.ty, END.ty, k); cam.tz = lerp(START.tz, END.tz, k);
      cam.dist = START.dist * Math.pow(END.dist / START.dist, k);
      cam.polar = lerp(START.polar, END.polar, k); cam.az = lerp(from, END.az, k);
      pin.visible = k > 0.55;
      if (k > 0.35 && !dimmed) { dimmed = true; labels.forEach(function (l, i) { tintVillage(i, false); }); }
      if (k >= 1 && !done) { done = true; labels[0].el.classList.add('is-hidden'); card.classList.add('is-visible'); replay.classList.add('is-visible'); }
      if (done) cam.az = END.az + Math.sin((t - FLY_START - FLY_TIME) * 0.25) * 6;
    }
    draw(t);
    if (visible) requestAnimationFrame(frame); else running = false;
  }
  function draw(t) {
    var pulse = (t * 0.6) % 1; ring.scale.setScalar(1 + pulse * 2.2); ring.material.opacity = 1 - pulse;
    head.position.y = 1.75 + Math.sin(t * 2) * 0.06; tip.position.y = 1.45 + Math.sin(t * 2) * 0.06;
    if (phase === 'earth') { earthFrame(t); return; }
    placeCamera(); globe.updateMatrixWorld(); renderer.render(scene, camera);
    labels.forEach(function (l) { project(l.el, l.pos, SIDE[l.side]); });
    if (typeof hot === 'number' && hot >= 0) project(mapTip, labels[hot].pos, '-50%, calc(-100% - 30px)');
    project(card, sp(OFFICE[0], OFFICE[1], 1.75), stage.clientWidth < 600 ? '-50%, calc(-100% - 28px)' : '28px, -50%');
  }
  function showEnd() {
    if (MODE === 'area') {
      labels.forEach(function (l, i) { l.lit = true; lightVillage(i, true); });
      globe.rotation.set(0, 0, 0); setPhase('region'); done = true;
      cam = Object.assign({}, START); cam.dist = START.dist * 0.78; cam.polar = START.polar + 14; draw(0); return;
    }
    labels.forEach(function (l, i) { l.lit = true; lightVillage(i, true); });
    dimmed = true; labels.forEach(function (l, i) { tintVillage(i, false); });
    globe.rotation.set(0, 0, 0); setPhase('region');
    cam = Object.assign({}, END); pin.visible = true; labels[0].el.classList.add('is-hidden'); card.classList.add('is-visible'); draw(0);
  }
  function start() {
    if (running || !visible || document.hidden || reduced) return; running = true; lastFrame = null; requestAnimationFrame(frame);
  }
  size(); setPhase(EARTH > 0 ? 'earth' : 'region'); turnGlobe(0); draw(0);
  if (reduced) { showEnd(); }
  else {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      updateVisibility();
    }, { threshold: 0.35 }).observe(stage);
  }
  replay.addEventListener('click', function () {
    done = false; dimmed = false; t0 = null; elapsed = 0; lastFrame = null; orbit = 0; fade.classList.remove('is-on'); pin.visible = false; setPhase(EARTH > 0 ? 'earth' : 'region'); labels[0].el.classList.remove('is-hidden'); card.classList.remove('is-visible'); replay.classList.remove('is-visible');
    labels.forEach(function (l, i) { l.lit = false; lightVillage(i, false); });
    if (reduced) showEnd(); else if (!running) start();
  });
  /* Hover (or tap) a village once the flight is over: it lights up and shows who to ask */
  var AGENT = { Horst: 'Daniel', Meterik: 'Daniel', Hegelsom: 'Daniel', Broekhuizen: 'Priya', Lottum: 'Priya', Broekhuizenvorst: 'Priya', Meerlo: 'Priya', Swolgen: 'Priya', Tienray: 'Priya',
    Sevenum: 'Marcus', Grubbenvorst: 'Marcus', Melderslo: 'Marcus', Evertsoord: 'Marcus', America: 'Sofia', Griendtsveen: 'Sofia', Kronenberg: 'Sofia' };
  var mapTip = document.createElement('span'); mapTip.className = 'map-tip'; labelsBox.appendChild(mapTip);
  var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), hot = -1;
  function pick(e) {
    if (!(done || reduced)) return;
    var r = stage.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    var hit = ray.intersectObject(ball)[0], found = -1;
    if (hit) {
      var p = globe.worldToLocal(hit.point.clone()), len = p.length();
      var hx = Math.atan2(p.x, p.y) * R, hz = Math.asin(p.z / len) * R, bestD = 1.3;
      vp.forEach(function (q, i) { var dd = Math.hypot(q[0] - hx, q[1] - hz) - villages[i][3] * 0.4; if (dd < bestD) { bestD = dd; found = i; } });
    }
    if (found === hot) return;
    if (hot >= 0) { if (MODE !== 'area') tintVillage(hot, false); labels[hot].el.classList.remove('is-hover'); }
    hot = found;
    stage.classList.toggle('is-pointing', hot >= 0);
    if (hot >= 0) {
      if (MODE !== 'area') tintVillage(hot, true); labels[hot].el.classList.add('is-hover');
      mapTip.innerHTML = '<strong>' + villages[hot][0] + '</strong>' + window.lkT('Ask ' + AGENT[villages[hot][0]]);
      mapTip.classList.add('is-visible');
      project(mapTip, labels[hot].pos, '-50%, calc(-100% - 30px)');
    } else mapTip.classList.remove('is-visible');
    if (!running) draw(0);
  }
  stage.addEventListener('pointermove', pick);
  stage.addEventListener('click', pick);
  stage.addEventListener('pointerleave', function () { if (hot >= 0) { if (MODE !== 'area') tintVillage(hot, false); labels[hot].el.classList.remove('is-hover'); hot = -1; mapTip.classList.remove('is-visible'); stage.classList.remove('is-pointing'); if (!running) draw(0); } });
  window.addEventListener('resize', function () { size(); if (reduced || !running) draw(0); });
  return { replay: function () { replay.click(); } };
}
document.querySelectorAll('[data-map]').forEach(function (el) { el.larklineGlobe = larklineGlobe(el, el.getAttribute('data-map') || 'office'); });

/* Questions: tabs, and "See all questions" opens the faded last row */
(function () {
  var faq = document.getElementById('faq');
  if (!faq) return;
  var tabs = faq.querySelectorAll('.faq-tab'), panels = faq.querySelectorAll('.faq-panel');
  var more = faq.querySelector('.faq-more-btn'), open = false;
  function apply() {
    panels.forEach(function (p) { p.classList.toggle('is-open', open); });
    more.textContent = open ? 'Show fewer questions' : 'See all questions';
    more.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o, j) { o.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
      panels.forEach(function (p, j) { p.hidden = i !== j; });
    });
  });
  more.addEventListener('click', function () { open = !open; apply(); });
})();

/* v14: villages as a calm picker. Names on the left, one big photo on the right that changes on click (and on hover with a mouse). */
(function () {
  var root = document.querySelector('#villages .village-picker');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.village-tab'));
  var slides = Array.prototype.slice.call(root.querySelectorAll('.village-slide'));
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var hoverTimer;
  function show(i) {
    tabs.forEach(function (t, j) { t.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
    slides.forEach(function (s, j) { s.classList.toggle('is-active', i === j); if (i === j) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('mouseenter', function () { if (!fine.matches) return; clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { show(i); }, 120); });
    t.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
  });
  /* Each village has a few photos: the small ones under the big photo switch it, like on the home cards */
  slides.forEach(function (slide) {
    var photos = slide.querySelectorAll('.village-photo');
    var thumbs = slide.querySelectorAll('.village-thumb');
    thumbs.forEach(function (b, k) {
      function pick() {
        photos.forEach(function (ph, j) { ph.classList.toggle('is-shown', j === k); });
        thumbs.forEach(function (o, j) { o.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      }
      b.addEventListener('click', pick);
      b.addEventListener('mouseenter', function () { if (fine.matches) pick(); });
    });
  });
  /* After a filter change, show the first village that is still in the list */
  document.querySelectorAll('#villages .filter-input').forEach(function (input) {
    input.addEventListener('change', function () {
      var current = tabs.findIndex(function (t) { return t.getAttribute('aria-pressed') === 'true'; });
      if (current > -1 && tabs[current].offsetParent !== null) return;
      var first = tabs.findIndex(function (t) { return t.offsetParent !== null; });
      if (first > -1) show(first);
    });
  });
})();

/* v11 add-on: hide the to-top button while the valuation form is visible (it would cover form text on phones) */
(function () {
  var btn = document.querySelector('.to-top');
  var form = document.querySelector('#valuation form') || document.querySelector('#valuation');
  if (!btn || !form || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    btn.classList.toggle('is-tucked', entries[0].isIntersecting);
  }).observe(form);
})();

/* Close the mobile menu when its navigation takes the visitor elsewhere. */
(function () {
  var menuToggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.header-rows');
  if (!menuToggle || !menu) return;
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a[href]')) menuToggle.checked = false;
  });
})();

/* v12: header search. The magnifier opens a compact field; searching takes you to the homes */
(function () {
  var box = document.querySelector('.header-search');
  if (!box) return;
  var btn = box.querySelector('.header-search-toggle'), input = box.querySelector('.header-search-input');
  function setOpen(open) {
    box.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', window.lkT(open ? 'Close search' : 'Open search'));
    input.tabIndex = open ? 0 : -1;
    if (open) input.focus();
  }
  btn.addEventListener('click', function () {
    if (box.classList.contains('is-open') && input.value.trim()) { box.requestSubmit ? box.requestSubmit() : box.submit(); return; }
    setOpen(!box.classList.contains('is-open'));
  });
  input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!box.contains(e.target) && !input.value.trim()) setOpen(false); });
  /* Design only: a search goes to the homes and fills in the street field */
  box.addEventListener('submit', function (e) {
    var street = document.querySelector('#home-search [name="street"], #home-search input[type="text"], #home-search input[type="search"]');
    var homes = document.getElementById('homes');
    if (!homes) return;
    e.preventDefault();
    if (street) street.value = input.value.trim();
    var menuToggle = document.querySelector('.nav-toggle');
    if (menuToggle) menuToggle.checked = false;
    homes.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  });
})();

/* Visit us: once the office card shows on the globe, a panel with a map and a route button opens under it */
(function () {
  var card = document.querySelector('#visit-map .map-office'), panel = document.getElementById('location-details');
  if (!card || !panel) return;
  function reveal() {
    if (!card.classList.contains('is-visible')) return;
    panel.hidden = false;
    var frame = panel.querySelector('iframe');
    if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
  }
  new MutationObserver(reveal).observe(card, { attributes: true, attributeFilter: ['class'] }); reveal();
})();

/* v12: language switch EN | NL. Swaps every text on the page without reloading and remembers the choice.
   The Dutch texts live in this file; English stays the default. */
(function () {
  var NL = {
"Larkline Estates · Estate agents in Horst aan de Maas": "Larkline Estates · Makelaars in Horst aan de Maas",
"Skip to content": "Naar de inhoud",
"New homes by WhatsApp": "Nieuwe woningen via WhatsApp",
"Free valuation": "Gratis waardebepaling",
"How we help": "Wat we doen",
"Villages": "Dorpen",
"Homes for sale": "Woningen te koop",
"Our team": "Ons team",
"Questions": "Vragen",
"For sale": "Te koop",
"Estate agents in Horst aan de Maas": "Makelaars in Horst aan de Maas",
"One agent, from the first coffee to the closing.": "Eén makelaar, van de eerste koffie tot de notaris.",
"We take on fewer clients, so the agent who values your home is the one who sells it.": "We nemen minder klanten aan. Zo verkoopt de makelaar die uw huis taxeert het ook zelf.",
"Plan a free valuation": "Plan een gratis waardebepaling",
"See homes for sale": "Bekijk woningen te koop",
"Our office at Gasthuisstraat 12, Horst.": "Ons kantoor aan de Gasthuisstraat 12 in Horst.",
"Small on purpose": "Bewust klein",
"Fewer clients, so nobody gets passed around.": "Minder klanten, zodat niemand wordt doorgeschoven.",
"Claire Morgan started Larkline nine years ago, after seeing clients handed from desk to desk at a big firm. Today it is Claire and four agents at the office in Horst. We know the streets, and we help you decide.": "Claire Morgan begon Larkline negen jaar geleden, nadat ze bij een groot kantoor zag hoe klanten van bureau naar bureau gingen. Nu zijn het Claire en vier makelaars op het kantoor in Horst. Wij kennen de straten en helpen u kiezen.",
"One agent per client, start to finish": "Eén makelaar per klant, van begin tot eind",
"Four local agents, some looking after several villages": "Vier lokale makelaars, sommigen voor meerdere dorpen",
"Sales only, no rentals": "Alleen verkoop, geen verhuur",
"What we do": "Wat we doen",
"How can we help?": "Waarmee kunnen we helpen?",
"Selling or buying in Horst aan de Maas, you always deal with one agent who knows your village.": "Verkopen of kopen in Horst aan de Maas: u heeft altijd één makelaar die uw dorp kent.",
"Sell your home": "Uw huis verkopen",
"One agent from the first visit to the notary.": "Eén makelaar, van het eerste bezoek tot de notaris.",
"Talk to us": "Praat met ons",
"Buy a home": "Een huis kopen",
"Find a home and call the agent directly.": "Vind een huis en bel de makelaar direct.",
"See homes": "Bekijk woningen",
"Free valuation ": "Gratis waardebepaling",
"An honest price, at your own kitchen table.": "Een eerlijke prijs, aan uw eigen keukentafel.",
"Plan a valuation": "Plan een waardebepaling",
"Choose your village": "Kies uw dorp",
"Honest advice on where you would feel at home.": "Eerlijk advies over waar u zich thuis zou voelen.",
"The villages": "De dorpen",
"Choose the village first. Then the house.": "Kies eerst het dorp. Dan het huis.",
"Horst aan de Maas is a municipality of villages, each with its own pace. Our agents live and work here, and they will tell you honestly where you would feel at home.": "Horst aan de Maas is een gemeente van dorpen, elk met een eigen tempo. Onze makelaars wonen en werken hier en vertellen u eerlijk waar u zich thuis zou voelen.",
"All villages": "Alle dorpen",
"By the Maas": "Aan de Maas",
"Countryside and the Peel": "Platteland en de Peel",
"Lively village centres": "Levendige dorpskernen",
"The centre. Shops, the market and café terraces within walking distance.": "Het centrum. Winkels, de markt en terrassen op loopafstand.",
"Ask Daniel": "Vraag het Daniel",
"Small and green, a short bike ride from Horst.": "Klein en groen, een kort fietstochtje van Horst.",
"Right on the Maas, with the river and the ferry close by.": "Direct aan de Maas, met de rivier en het veer vlakbij.",
"Ask Priya": "Vraag het Priya",
"The rose village, between open fields and the river.": "Het rozendorp, tussen open velden en de rivier.",
"A lively village centre with everything for daily life.": "Een levendige dorpskern met alles voor elke dag.",
"Ask Marcus": "Vraag het Marcus",
"An old village heart near the Maas, and quick to Venlo.": "Een oud dorpshart bij de Maas, en snel in Venlo.",
"Wide fields, with the nature of the Peel on your doorstep.": "Weidse velden, met de natuur van de Peel om de hoek.",
"Ask Sofia": "Vraag het Sofia",
"A quiet peat village with nature all around.": "Een rustig veendorp met overal natuur.",
"Found your village? Search the homes there.": "Uw dorp gevonden? Zoek daar naar woningen.",
"Type": "Soort",
"All homes": "Alle woningen",
"Houses": "Huizen",
"Apartments": "Appartementen",
"Village": "Dorp",
"Street": "Straat",
"Min. price": "Min. prijs",
"No minimum": "Geen minimum",
"Max. price": "Max. prijs",
"No maximum": "Geen maximum",
"Search": "Zoeken",
"For sale now": "Nu te koop",
"Homes we are selling right now": "Woningen die we nu verkopen",
"Village Home": "Dorpswoning",
"Gasthuisstraat, Horst · Terraced house": "Gasthuisstraat, Horst · Tussenwoning",
"Riverside Classic": "Klassieker aan de rivier",
"Veerweg, Broekhuizen · Village house": "Veerweg, Broekhuizen · Dorpshuis",
"Sevenum Centre Residence": "Residentie Sevenum Centrum",
"Kerkstraat, Sevenum · Apartment": "Kerkstraat, Sevenum · Appartement",
"Melderslo Country House": "Landhuis Melderslo",
"Broekhuizerdijk, Melderslo · Detached house": "Broekhuizerdijk, Melderslo · Vrijstaand huis",
"America Country House": "Landhuis America",
"Pastoor Jeukenstraat, America · Detached house": "Pastoor Jeukenstraat, America · Vrijstaand huis",
"Peel Village Home": "Peeldorp-woning",
"Helenaveenseweg, Griendtsveen · Semi-detached house": "Helenaveenseweg, Griendtsveen · Twee-onder-een-kap",
"Hegelsom Apartment": "Appartement Hegelsom",
"Stationsstraat, Hegelsom · Apartment": "Stationsstraat, Hegelsom · Appartement",
"Under contract": "Onder bod",
"Village View Residence": "Residentie Dorpszicht",
"Hoofdstraat, Lottum · Apartment": "Hoofdstraat, Lottum · Appartement",
"Kronenberg Apartment": "Appartement Kronenberg",
"Peelstraat, Kronenberg · Apartment": "Peelstraat, Kronenberg · Appartement",
"No homes match this search right now.": "Er zijn nu geen woningen die bij deze zoekopdracht passen.",
"Show all homes": "Toon alle woningen",
"Be the first to hear about new homes": "Hoor als eerste over nieuwe woningen",
"Get a WhatsApp message before a home appears on the big portals. Free, and you can stop at any time.": "Krijg een WhatsApp-bericht voordat een woning op de grote sites verschijnt. Gratis, en u kunt altijd stoppen.",
"Your mobile number": "Uw mobiele nummer",
"Sign me up": "Meld mij aan",
"You are on the list.": "U staat op de lijst.",
"The people who pick up the phone": "De mensen die de telefoon opnemen",
"“I left a big firm because clients were passed around. Here, one agent stays with you from the first coffee to the closing.”": "“Ik ben weggegaan bij een groot kantoor omdat klanten werden doorgeschoven. Hier blijft één makelaar bij u, van de eerste koffie tot de notaris.”",
"Founder and managing director": "Oprichter en directeur",
"Founder · All villages": "Oprichter · Alle dorpen",
"Call": "Bellen",
"Senior agent · Horst, Meterik, Hegelsom": "Senior makelaar · Horst, Meterik, Hegelsom",
"Senior agent · Broekhuizen, Lottum, Broekhuizenvorst": "Senior makelaar · Broekhuizen, Lottum, Broekhuizenvorst",
"Agent · Sevenum, Grubbenvorst, Melderslo": "Makelaar · Sevenum, Grubbenvorst, Melderslo",
"Agent · America, Griendtsveen, Kronenberg": "Makelaar · America, Griendtsveen, Kronenberg",
"Click a card to see the whole person.": "Klik op een kaart om de hele persoon te zien.",
"Back to the team": "Terug naar het team",
"What is your home worth?": "Wat is uw huis waard?",
"Tell us where you live. The agent for your village comes by, looks at your home and the street, and gives you an honest price. No cost, no obligation.": "Vertel ons waar u woont. De makelaar van uw dorp komt langs, bekijkt uw huis en de straat en geeft u een eerlijke prijs. Gratis en vrijblijvend.",
"Sample review": "Voorbeeldreview",
"“Priya knew our street better than we did. She answered every WhatsApp, even on a Saturday.”": "“Priya kende onze straat beter dan wij. Ze beantwoordde elk WhatsApp-bericht, zelfs op zaterdag.”",
"Seller in Broekhuizen": "Verkoper in Broekhuizen",
"Your home": "Uw huis",
"Step 1 of 2": "Stap 1 van 2",
"Street and house number": "Straat en huisnummer",
"Please fill in your street and house number.": "Vul uw straat en huisnummer in.",
"Choose a village": "Kies een dorp",
"Another village": "Een ander dorp",
"Please choose your village.": "Kies uw dorp.",
"Type of home": "Soort woning",
"Choose a type": "Kies een soort",
"Terraced house": "Tussenwoning",
"Semi-detached house": "Twee-onder-een-kap",
"Detached house": "Vrijstaand huis",
"Apartment": "Appartement",
"Village house or farmhouse": "Dorpshuis of boerderij",
"Please choose a type.": "Kies een soort woning.",
"Next: your details": "Volgende: uw gegevens",
"How can we reach you?": "Hoe kunnen we u bereiken?",
"Step 2 of 2": "Stap 2 van 2",
"Your name": "Uw naam",
"Please fill in your name.": "Vul uw naam in.",
"Phone": "Telefoon",
"Please fill in a phone number.": "Vul een telefoonnummer in.",
"Email": "E-mail",
"Please fill in a valid email address.": "Vul een geldig e-mailadres in.",
"I agree that Larkline uses my details only to contact me about this valuation. Read our": "Ik ga ermee akkoord dat Larkline mijn gegevens alleen gebruikt om contact met mij op te nemen over deze waardebepaling. Lees onze",
"privacy policy": "privacyverklaring",
"Please tick the box, so we may contact you.": "Vink het vakje aan, dan mogen we contact met u opnemen.",
"Back": "Terug",
"Send my request": "Verstuur mijn aanvraag",
"Thank you,": "Dank u,",
"we have it": "we hebben het ontvangen",
"Your request has been sent.": "Uw aanvraag is verstuurd.",
"Your agent": "Uw makelaar",
"will call you to plan a visit. Your request is logged, so it will not get lost in an inbox.": "belt u om een bezoek te plannen. Uw aanvraag is vastgelegd, dus die raakt niet kwijt in een inbox.",
"Home": "Woning",
"We call you on": "We bellen u op",
"Confirmation sent to": "Bevestiging verstuurd naar",
"Send another request": "Nog een aanvraag versturen",
"Rather call?": "Liever bellen?",
"Your questions, answered at the kitchen table": "Uw vragen, beantwoord aan de keukentafel",
"The questions we hear most, in plain words. Not here? Send us a WhatsApp and your agent answers.": "De vragen die we het vaakst horen, in gewone woorden. Staat uw vraag er niet bij? Stuur ons een WhatsApp en uw makelaar antwoordt.",
"Ask your question": "Stel uw vraag",
"Buying": "Kopen",
"Selling": "Verkopen",
"Do I always get the same agent?": "Krijg ik altijd dezelfde makelaar?",
"Yes. One agent stays with you from the first viewing to the notary. You get their own mobile number and WhatsApp.": "Ja. Eén makelaar blijft bij u van de eerste bezichtiging tot de notaris. U krijgt zijn of haar eigen mobiele nummer en WhatsApp.",
"How do I hear about new homes first?": "Hoe hoor ik als eerste over nieuwe woningen?",
"Sign up for WhatsApp alerts. You get a message before a home appears on the big portals. Free, and you can stop at any time.": "Meld u aan voor WhatsApp-meldingen. U krijgt een bericht voordat een woning op de grote sites verschijnt. Gratis, en u kunt altijd stoppen.",
"Can you help me buy a home you do not sell?": "Kunnen jullie helpen bij het kopen van een huis dat jullie niet verkopen?",
"Yes. Your agent can guide you as a buying agent, check the price and the house, and negotiate for you.": "Ja. Uw makelaar kan u begeleiden als aankoopmakelaar, de prijs en het huis controleren en voor u onderhandelen.",
"Can I view a home in the evening or on Saturday?": "Kan ik 's avonds of op zaterdag een huis bekijken?",
"Often, yes. Ask your agent. We plan viewings around your working day, not ours.": "Vaak wel. Vraag het uw makelaar. We plannen bezichtigingen rond uw werkdag, niet de onze.",
"What should I arrange before I make an offer?": "Wat moet ik regelen voordat ik een bod doe?",
"Know your budget. A talk with a mortgage advisor first makes your offer stronger and saves you stress later.": "Ken uw budget. Een gesprek met een hypotheekadviseur maakt uw bod sterker en scheelt later stress.",
"Do you also rent out homes?": "Verhuren jullie ook woningen?",
"No. We only help people buy and sell homes. That is all we do, so we can do it well.": "Nee. We helpen mensen alleen met kopen en verkopen. Dat is alles wat we doen, zodat we het goed kunnen doen.",
"Can you tell me about a street before I buy?": "Kunnen jullie me iets over een straat vertellen voordat ik koop?",
"Yes. Our agents live here. They tell you honestly about noise, schools, traffic and the neighbours.": "Ja. Onze makelaars wonen hier. Ze vertellen u eerlijk over geluid, scholen, verkeer en de buren.",
"How long does buying take?": "Hoe lang duurt het kopen?",
"From an accepted offer to the notary usually takes two to three months. Your agent keeps you up to date at every step.": "Van een geaccepteerd bod tot de notaris duurt meestal twee tot drie maanden. Uw makelaar houdt u bij elke stap op de hoogte.",
"Can I call outside office hours?": "Kan ik buiten kantoortijden bellen?",
"You can always send a WhatsApp. Your agent answers as soon as they can, also in the evening.": "U kunt altijd een WhatsApp sturen. Uw makelaar antwoordt zo snel mogelijk, ook 's avonds.",
"What does a valuation cost?": "Wat kost een waardebepaling?",
"Nothing. The agent for your village comes by, looks at your home and the street, and gives you an honest price. No obligation.": "Niets. De makelaar van uw dorp komt langs, bekijkt uw huis en de straat en geeft u een eerlijke prijs. Vrijblijvend.",
"Who sells my home?": "Wie verkoopt mijn huis?",
"The same agent who valued it. You will not be handed to a colleague you have never met.": "Dezelfde makelaar die het heeft getaxeerd. U wordt niet doorgegeven aan een collega die u nooit heeft ontmoet.",
"How do you set the asking price?": "Hoe bepalen jullie de vraagprijs?",
"We look at recent sales in your street and village, the state of your home and the market today. Then we explain the price to you.": "We kijken naar recente verkopen in uw straat en dorp, de staat van uw huis en de markt van nu. Daarna leggen we u de prijs uit.",
"Who takes the photos?": "Wie maakt de foto's?",
"We arrange a professional photographer, so your home looks its best online.": "We regelen een professionele fotograaf, zodat uw huis online op zijn mooist staat.",
"Do I need to be home for viewings?": "Moet ik thuis zijn bij bezichtigingen?",
"No. Your agent leads every viewing and tells you afterwards what people said.": "Nee. Uw makelaar doet elke bezichtiging en vertelt u daarna wat mensen zeiden.",
"How fast will my home sell?": "Hoe snel wordt mijn huis verkocht?",
"That depends on the village and the price. Your agent gives you an honest estimate at the kitchen table.": "Dat hangt af van het dorp en de prijs. Uw makelaar geeft u aan de keukentafel een eerlijke inschatting.",
"Can I sell before I have found a new home?": "Kan ik verkopen voordat ik een nieuw huis heb gevonden?",
"Yes. Your agent can help you plan both, so you do not end up with two mortgages or no home at all.": "Ja. Uw makelaar helpt u beide te plannen, zodat u niet met twee hypotheken of zonder huis komt te zitten.",
"What happens to my request?": "Wat gebeurt er met mijn aanvraag?",
"It is logged, so it will not get lost in an inbox. Your agent calls you to plan a visit.": "Die wordt vastgelegd, dus raakt niet kwijt in een inbox. Uw makelaar belt u om een bezoek te plannen.",
"Do you sell homes outside Horst aan de Maas?": "Verkopen jullie ook woningen buiten Horst aan de Maas?",
"We focus on the sixteen villages of our municipality. That is where we know every street.": "We richten ons op de zestien dorpen van onze gemeente. Daar kennen we elke straat.",
"Which village suits me best?": "Welk dorp past het best bij mij?",
"Tell us how you live and work. Your agent will tell you honestly where you would feel at home.": "Vertel ons hoe u woont en werkt. Uw makelaar vertelt u eerlijk waar u zich thuis zou voelen.",
"Where are the shops and the market?": "Waar zijn de winkels en de markt?",
"In Horst. The centre has shops, the market and café terraces within walking distance.": "In Horst. In het centrum zijn winkels, de markt en terrassen op loopafstand.",
"Which villages are close to the Maas?": "Welke dorpen liggen dicht bij de Maas?",
"Broekhuizen, Broekhuizenvorst, Lottum and Grubbenvorst lie near the river.": "Broekhuizen, Broekhuizenvorst, Lottum en Grubbenvorst liggen bij de rivier.",
"Where is it quiet and green?": "Waar is het rustig en groen?",
"Griendtsveen, America and Kronenberg, with the nature of the Peel close by.": "Griendtsveen, America en Kronenberg, met de natuur van de Peel dichtbij.",
"Which village is quick to Venlo?": "Vanuit welk dorp ben je snel in Venlo?",
"Grubbenvorst and Sevenum. From there you are in Venlo in a few minutes.": "Grubbenvorst en Sevenum. Van daaruit bent u in een paar minuten in Venlo.",
"Are there schools in every village?": "Is er in elk dorp een school?",
"Most villages have a primary school. Secondary schools are in Horst and Venlo.": "De meeste dorpen hebben een basisschool. Middelbare scholen zijn in Horst en Venlo.",
"How many villages are there?": "Hoeveel dorpen zijn er?",
"Sixteen. Each one has its own pace and its own character.": "Zestien. Elk dorp heeft een eigen tempo en een eigen karakter.",
"Is there public transport?": "Is er openbaar vervoer?",
"Horst-Sevenum has a train station. Buses connect most villages with Horst and Venlo.": "Horst-Sevenum heeft een treinstation. Bussen verbinden de meeste dorpen met Horst en Venlo.",
"Can I visit the office first?": "Kan ik eerst langskomen op kantoor?",
"Yes. The coffee is on us, no appointment needed. Monday to Friday, 09:00 to 18:00.": "Ja. De koffie staat klaar, een afspraak is niet nodig. Maandag tot vrijdag, 09:00 tot 18:00.",
"See all questions": "Bekijk alle vragen",
"Thinking of selling?": "Denkt u aan verkopen?",
"Start with a cup of coffee and an honest price.": "Begin met een kop koffie en een eerlijke prijs.",
"Visit us": "Kom langs",
"Visit address": "Bezoekadres",
"Monday to Friday, 09:00 to 18:00. The coffee is on us, no appointment needed.": "Maandag tot vrijdag, 09:00 tot 18:00. De koffie staat klaar, een afspraak is niet nodig.",
"Plan your route": "Plan uw route",
"Play again": "Opnieuw afspelen",
"Map of the sixteen villages of Horst aan de Maas. The camera flies to our office at Gasthuisstraat 12 in Horst.": "Kaart van de zestien dorpen van Horst aan de Maas. De camera vliegt naar ons kantoor aan de Gasthuisstraat 12 in Horst.",
"Address": "Adres",
"Limburg, the Netherlands": "Limburg, Nederland",
"Call or write": "Bel of schrijf",
"Explore": "Ontdekken",
"Selling your home": "Uw huis verkopen",
"© 2026 Larkline Estates. Sales only, no rentals.": "© 2026 Larkline Estates. Alleen verkoop, geen verhuur.",
"Prototype v14. Photos are placeholders from Unsplash.": "Prototype v14. Foto's zijn voorbeelden van Unsplash.",
"Village Home, Horst · Larkline Estates": "Dorpswoning, Horst · Larkline Estates",
"3 bedrooms": "3 slaapkamers",
"2 bathrooms": "2 badkamers",
"195 m² living area": "195 m² woonoppervlak",
"+ 8 photos": "+ 8 foto's",
"A family home in the heart of Horst": "Een gezinswoning in het hart van Horst",
"A terraced house on Gasthuisstraat with 195 m² of living space, three bedrooms and two bathrooms. Shops, the weekly market and the café terraces are a short walk away.": "Een tussenwoning aan de Gasthuisstraat met 195 m² woonruimte, drie slaapkamers en twee badkamers. Winkels, de weekmarkt en de terrassen liggen op een paar minuten lopen.",
"Placeholder text. Daniel writes the full description here: the light in the living room, the layout, what the neighbours are like, and why the house works for a family. Short paragraphs, written the way he would tell it at a viewing.": "Voorbeeldtekst. Daniel schrijft hier de volledige omschrijving: het licht in de woonkamer, de indeling, hoe de buren zijn en waarom het huis goed werkt voor een gezin. Korte alinea's, zoals hij het bij een bezichtiging zou vertellen.",
"What stands out": "Wat opvalt",
"Walking distance to shops and the market": "Op loopafstand van winkels en de markt",
"Three bedrooms on the first floor": "Drie slaapkamers op de eerste verdieping",
"Two bathrooms": "Twee badkamers",
"Private garden at the back": "Eigen tuin aan de achterkant",
"The details": "De details",
"Living area": "Woonoppervlak",
"Bedrooms": "Slaapkamers",
"Bathrooms": "Badkamers",
"Location": "Locatie",
"Asking price": "Vraagprijs",
"Status": "Status",
"Your agent for this home": "Uw makelaar voor deze woning",
"Questions or a viewing? Call or message Daniel directly. He knows this house and this street, and you get an answer today.": "Vragen of een bezichtiging? Bel of app Daniel direct. Hij kent dit huis en deze straat, en u krijgt vandaag antwoord.",
"Call Daniel": "Bel Daniel",
"WhatsApp Daniel": "WhatsApp Daniel",
"Or email": "Of mail",
"Senior agent for Horst, Meterik and Hegelsom.": "Senior makelaar voor Horst, Meterik en Hegelsom.",
"Living here": "Hier wonen",
"Life on Gasthuisstraat": "Leven aan de Gasthuisstraat",
"You live in the village centre. Daily shopping, a coffee on a terrace and the market are all on foot, and the countryside starts a few minutes away by bike.": "U woont in de dorpskern. Dagelijkse boodschappen, een kop koffie op een terras en de markt doet u te voet, en het buitengebied begint op een paar minuten fietsen.",
"Daniel can tell you more about the street, the schools and the neighbours. Just ask.": "Daniel vertelt u graag meer over de straat, de scholen en de buren. Vraag het gewoon.",
"More homes from Daniel": "Meer woningen van Daniel",
"See all homes for sale": "Bekijk alle woningen te koop",
"Sold": "Verkocht",
"Meterik Village Home": "Dorpswoning Meterik",
"Crommentuijnstraat, Meterik · Semi-detached house": "Crommentuijnstraat, Meterik · Twee-onder-een-kap",
"Own a home nearby?": "Heeft u een huis in de buurt?",
"Ask Daniel what your home is worth": "Vraag Daniel wat uw huis waard is",
"He sells in Horst, Meterik and Hegelsom, and knows what homes on your street go for.": "Hij verkoopt in Horst, Meterik en Hegelsom en weet wat huizen in uw straat opbrengen.",
"Open menu": "Menu openen",
"Larkline Estates, home": "Larkline Estates, home",
"Main": "Hoofdmenu",
"Email hello@larkline.example": "Mail hello@larkline.example",
"Call 077 555 0100": "Bel 077 555 0100",
"The Larkline team at work in the office": "Het Larkline-team aan het werk op kantoor",
"Filter villages": "Dorpen filteren",
"A quiet street with brick houses": "Een rustige straat met bakstenen huizen",
"A brick house behind tall trees on a village lane": "Een bakstenen huis achter hoge bomen aan een dorpslaan",
"The river at sunset with trees along the bank": "De rivier bij zonsondergang met bomen langs de oever",
"An old church between green fields and trees": "Een oude kerk tussen groene velden en bomen",
"People walking and cycling through a sunny village street": "Mensen wandelen en fietsen door een zonnige dorpsstraat",
"A cobbled street with a church tower behind the houses": "Een straat met keien en een kerktoren achter de huizen",
"A sandy path through blooming heather": "Een zandpad door bloeiende heide",
"Red brick houses with gardens on a quiet corner": "Rode bakstenen huizen met tuinen op een rustige hoek",
"Search homes for sale": "Zoek woningen te koop",
"Any street": "Elke straat",
"Filter homes": "Woningen filteren",
"Previous homes": "Vorige woningen",
"Next homes": "Volgende woningen",
"Previous person": "Vorige persoon",
"Pause the turning": "Draaien pauzeren",
"Next person": "Volgende persoon",
"For example Kerkstraat 12": "Bijvoorbeeld Kerkstraat 12",
"Question topics": "Onderwerpen",
"The glass entrance of the Larkline office at Gasthuisstraat 12 in Horst": "De glazen ingang van het Larkline-kantoor aan de Gasthuisstraat 12 in Horst",
"Larkline on social media": "Larkline op sociale media",
"Facebook (placeholder link)": "Facebook (voorbeeldlink)",
"Instagram (placeholder link)": "Instagram (voorbeeldlink)",
"LinkedIn (placeholder link)": "LinkedIn (voorbeeldlink)",
"YouTube (placeholder link)": "YouTube (voorbeeldlink)",
"Back to the top": "Terug naar boven",
"Breadcrumb": "Kruimelpad",
"Photos": "Foto's",
"Front of the terraced house on Gasthuisstraat": "Voorkant van de tussenwoning aan de Gasthuisstraat",
"Living room with wooden shelves and soft daylight": "Woonkamer met houten planken en zacht daglicht",
"Kitchen with dining space by the window": "Keuken met eethoek bij het raam",
"Bedroom with white linen and a plant": "Slaapkamer met wit beddengoed en een plant",
"Garden path towards the back of the house": "Tuinpad naar de achterkant van het huis",
"A shopping street with brick buildings and flags": "Een winkelstraat met bakstenen gebouwen en vlaggen",
"Café tables outside a brick building": "Caféterrasjes voor een bakstenen gebouw",
"Village Home, Gasthuisstraat, Horst": "Dorpswoning, Gasthuisstraat, Horst",
"Riverside Classic, Veerweg, Broekhuizen": "Klassieker aan de rivier, Veerweg, Broekhuizen",
"Sevenum Centre Residence, Kerkstraat, Sevenum": "Residentie Sevenum Centrum, Kerkstraat, Sevenum",
"Melderslo Country House, Broekhuizerdijk, Melderslo": "Landhuis Melderslo, Broekhuizerdijk, Melderslo",
"America Country House, Pastoor Jeukenstraat, America": "Landhuis America, Pastoor Jeukenstraat, America",
"Peel Village Home, Helenaveenseweg, Griendtsveen": "Peeldorp-woning, Helenaveenseweg, Griendtsveen",
"Hegelsom Apartment, Stationsstraat, Hegelsom": "Appartement Hegelsom, Stationsstraat, Hegelsom",
"Village View Residence, Hoofdstraat, Lottum": "Residentie Dorpszicht, Hoofdstraat, Lottum",
"Kronenberg Apartment, Peelstraat, Kronenberg": "Appartement Kronenberg, Peelstraat, Kronenberg",
"Meterik Village Home, Crommentuijnstraat, Meterik": "Dorpswoning Meterik, Crommentuijnstraat, Meterik",
"WhatsApp us": "App ons",
"Search the site": "Zoek op de site",
"Open search": "Zoeken openen",
"Close search": "Zoeken sluiten",
"Search homes, villages or questions": "Zoek woningen, dorpen of vragen",
"Language": "Taal",
"Europe": "Europa",
"Find us here": "Hier vind je ons",
"Visit Larkline": "Kom langs bij Larkline",
"See the map and plan your route.": "Bekijk de kaart en plan je route naar ons.",
"Plan your route": "Plan je route",
"Example address for this practice website. Map: © OpenStreetMap contributors. The route opens in Google Maps.": "Voorbeeldadres voor deze oefenwebsite. Kaart: © OpenStreetMap-bijdragers. De route opent in Google Maps.",
"Map of Gasthuisstraat 12 in Horst": "Kaart van Gasthuisstraat 12 in Horst",
"The Larkline team at the office in Horst.": "Het team van Larkline op kantoor in Horst.",
"The Larkline team together at the office table": "Het team van Larkline samen aan de kantoortafel",
"Photo 1 of 3": "Foto 1 van 3",
"Photo 2 of 3": "Foto 2 van 3",
"Photo 3 of 3": "Foto 3 van 3",
"Claire Morgan, founder": "Claire Morgan, oprichter",
"See where we are": "Bekijk waar we zijn",
"Amsterdam": "Amsterdam",
"Where we are": "Waar we zijn",
"Horst aan de Maas, North Limburg": "Horst aan de Maas, Noord-Limburg",
"Close": "Sluiten",
"Point at a village to see who to ask.": "Wijs een dorp aan en zie wie u het kunt vragen.",
"A globe that turns from the earth to Europe and then shows the sixteen villages of Horst aan de Maas.": "Een wereldbol die van de aarde naar Europa draait en dan de zestien dorpen van Horst aan de Maas laat zien.",
"The Netherlands": "Nederland",
"Contact": "Contact",
"Claire started Larkline nine years ago, after years at a big firm in Venlo. She still takes on her own clients in every village, and she pours the coffee at the office.": "Claire begon Larkline negen jaar geleden, na jaren bij een groot kantoor in Venlo. Ze heeft nog steeds eigen klanten in elk dorp, en ze schenkt de koffie op kantoor.",
"Daniel grew up in Hegelsom and has sold homes in and around Horst for fifteen years. He knows which streets flood after heavy rain and which ones get the evening sun.": "Daniel groeide op in Hegelsom en verkoopt al vijftien jaar huizen in en rond Horst. Hij weet welke straten onderlopen na flinke regen en welke de avondzon krijgen.",
"Priya lives in Lottum, two streets from the Maas. She handles the river villages and answers WhatsApp messages faster than anyone in the office.": "Priya woont in Lottum, twee straten van de Maas. Zij doet de dorpen aan de rivier en beantwoordt WhatsApp-berichten sneller dan wie dan ook op kantoor.",
"Marcus moved to Sevenum for the space and stayed for the people. He specialises in family homes and first-time buyers.": "Marcus verhuisde naar Sevenum voor de ruimte en bleef voor de mensen. Hij is gespecialiseerd in gezinswoningen en starters.",
"Sofia covers the quiet villages near the Peel. She is the one to ask about old farmhouses, large plots and living close to nature.": "Sofia doet de rustige dorpen bij de Peel. Bij haar moet u zijn voor oude boerderijen, grote kavels en wonen dicht bij de natuur.",
"Start the turning": "Draaien starten",
"In North Limburg, the Netherlands, in the beautiful municipality of Horst aan de Maas": "In Noord-Limburg, Nederland, in de prachtige gemeente Horst aan de Maas"
};
  Object.assign(NL, {
  "America Country House, America - Larkline Estates": "Landhuis America, America - Larkline Estates",
  "View photos": "Bekijk foto’s",
  "Home type": "Woningtype",
  "A country home with character in America": "Een landhuis met karakter in America",
  "A detached home on Pastoor Jeukenstraat in America with 297 m² of living space, four bedrooms and four bathrooms. A characterful facade, green front gate and garden set the scene.": "Een vrijstaande woning aan de Pastoor Jeukenstraat in America met 297 m² woonoppervlak, vier slaapkamers en vier badkamers. De karakteristieke gevel, het groene tuinhek en de tuin bepalen de sfeer.",
  "Characterful facade and green front gate": "Karakteristieke gevel en groen tuinhek",
  "Four bedrooms": "Vier slaapkamers",
  "Four bathrooms": "Vier badkamers",
  "I know this home. Ask me anything.": "Ik ken deze woning. Stel me gerust je vragen.",
  "Your property contact": "Jouw contactpersoon voor deze woning",
  "Email Daniel": "Mail Daniel",
  "STEP INSIDE": "KIJK BINNEN",
  "Find your favourite room": "Ontdek jouw favoriete kamer",
  "Rotate the house and choose a room to see its photo.": "Draai de woning en kies een kamer om de foto te bekijken.",
  "Ground floor": "Begane grond",
  "First floor": "Eerste verdieping",
  "Reset view": "Beginweergave",
  "Drag to rotate · Select a room below": "Sleep om te draaien · Kies hieronder een kamer",
  "Living room": "Woonkamer",
  "A quiet place to come home to.": "Een rustige plek om thuis te komen.",
  "Illustrative layout. Room positions and proportions are examples, not a measured floor plan. Photos are placeholders.": "Illustratieve indeling. Kamerposities en verhoudingen zijn voorbeelden, geen ingemeten plattegrond. De foto’s zijn voorbeeldbeelden.",
  "Life in America": "Wonen in America",
  "America is one of the villages in Horst aan de Maas. Ask Daniel about the local surroundings, daily amenities and routes from this home.": "America is een van de dorpen in Horst aan de Maas. Vraag Daniel naar de omgeving, dagelijkse voorzieningen en verbindingen vanuit deze woning.",
  "Back to property": "Terug naar de woning",
  "Previous photo": "Vorige foto",
  "Next photo": "Volgende foto",
  "Click a photo to enlarge": "Klik op een foto om deze te vergroten",
  "Pause slideshow": "Diavoorstelling pauzeren",
  "Play slideshow": "Diavoorstelling afspelen",
  "Property photo carousel": "Fotogalerij van de woning",
  "Photos": "Foto’s",
  "Property photos": "Woningfoto’s",
  "Front of America Country House with its green picket fence": "Voorzijde van Landhuis America met het groene tuinhek",
  "Living room with wooden shelves and soft daylight": "Woonkamer met houten planken en zacht daglicht",
  "Kitchen with dining space by the window": "Keuken met eethoek bij het raam",
  "Bedroom with white linen and a plant": "Slaapkamer met wit beddengoed en een plant",
  "Garden path towards the back of the house": "Tuinpad naar de achterkant van de woning",
  "Illustrative hallway with stairs and a painting": "Voorbeeld van een hal met trap en schilderij",
  "Illustrative second bedroom with a bed and stool": "Voorbeeld van een tweede slaapkamer met bed en kruk",
  "Illustrative third bedroom with a woven headboard and garden doors": "Voorbeeld van een derde slaapkamer met gevlochten hoofdbord en tuindeuren",
  "Illustrative bathroom with warm neutral walls and a bathtub": "Voorbeeld van een badkamer met warme neutrale muren en een bad",
  "Illustrative 3D house layout. Choose a room using the buttons below.": "Illustratieve 3D-indeling van de woning. Kies een kamer met de knoppen hieronder.",
  "Floor": "Verdieping",
  "Choose a room": "Kies een kamer"
});
  window.lkT = function (s) { return document.documentElement.lang === 'nl' && NL[s] ? NL[s] : s; };
  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title', 'data-bio'];
  var texts = [], attrs = [], titleEn = document.title, collected = false;
  function collect() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.closest && n.parentNode.closest('script, style, svg');
        return p ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      var key = n.nodeValue.replace(/\s+/g, ' ').trim();
      if (NL[key]) texts.push({ node: n, en: n.nodeValue, nl: n.nodeValue.replace(/\S[\s\S]*\S|\S/, NL[key]) });
    }
    document.querySelectorAll('[' + ATTRS.join('],[') + ']').forEach(function (el) {
      ATTRS.forEach(function (a) { var v = el.getAttribute(a); if (v && NL[v.trim()]) attrs.push({ el: el, a: a, en: v, nl: NL[v.trim()] }); });
    });
    collected = true;
  }
  function apply(lang) {
    if (!collected) collect();
    var nl = lang === 'nl';
    texts.forEach(function (t) { t.node.nodeValue = nl ? t.nl : t.en; });
    attrs.forEach(function (t) { t.el.setAttribute(t.a, nl ? t.nl : t.en); });
    document.querySelectorAll('[data-en][data-nl]').forEach(function(el) { el.textContent = el.getAttribute(nl ? 'data-nl' : 'data-en'); });
    document.documentElement.lang = nl ? 'nl' : 'en';
    document.title = nl && NL[titleEn] ? NL[titleEn] : titleEn;
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  var saved = 'en';
  try { saved = localStorage.getItem('larkline-lang') || 'en'; } catch (e) {}
  if (saved === 'nl') apply('nl');
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.getAttribute('data-lang');
      apply(lang);
      try { localStorage.setItem('larkline-lang', lang); } catch (e) {}
    });
  });
})();

/* v14: the location hint in the hero opens a popup with the globe: earth, Europe, then Horst aan de Maas with all villages */
(function () {
  var link = document.querySelector('[data-to-map]');
  var dialog = document.querySelector('.globe-dialog');
  if (!link || !dialog || typeof dialog.showModal !== 'function') return;
  var stage = dialog.querySelector('[data-map]');
  link.addEventListener('click', function (e) {
    e.preventDefault();
    dialog.showModal();
    if (stage.larklineGlobe) { window.dispatchEvent(new Event('resize')); stage.larklineGlobe.replay(); }
  });
  dialog.querySelector('[data-globe-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { link.focus(); });
})();
