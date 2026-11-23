(function () {
  'use strict';
  const dialog = document.querySelector('.property-photo-dialog');
  const links = Array.from(document.querySelectorAll('.gallery-item'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.property-photo-large');
  let index = 0, opener = null, previousOverflow = '';
  const section = document.querySelector('[data-property-loop]');
  if (section) {
    const viewport = section.querySelector('.property-loop-viewport');
    const track = section.querySelector('.property-loop-track');
    const pause = section.querySelector('[data-gallery-pause]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches, hover = false, focused = false, last = 0, position = 0;
    const originals = Array.from(track.children);
    originals.forEach(function(link) {
      const copy = link.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true'); copy.tabIndex = -1;
      copy.addEventListener('click', function(event) { event.preventDefault(); link.click(); });
      track.append(copy);
    });
    const dots = originals.map(function(link, i) {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'property-loop-dot';
      dot.setAttribute('aria-label', 'Foto ' + (i + 1));
      dot.addEventListener('click', function() {
        position = link.offsetLeft - originals[0].offsetLeft;
        viewport.scrollLeft = position;
        syncDots();
      });
      section.querySelector('[data-gallery-dots]').append(dot);
      return dot;
    });
    function syncDots() {
      const cycle = track.children[originals.length].offsetLeft - originals[0].offsetLeft;
      const current = cycle > 0 ? viewport.scrollLeft % cycle : 0;
      let nearest = 0, distance = Infinity;
      originals.forEach(function(link, i) {
        const offset = link.offsetLeft - originals[0].offsetLeft;
        const gap = Math.abs(offset - current);
        const wrapped = Math.min(gap, Math.abs(cycle - gap));
        if (wrapped < distance) { distance = wrapped; nearest = i; }
      });
      dots.forEach(function(dot, i) { dot.setAttribute('aria-current', String(i === nearest)); });
    }
    viewport.addEventListener('scroll', syncDots, { passive:true });
    window.addEventListener('resize', syncDots);
    syncDots();
    function syncPause() {
      pause.setAttribute('aria-pressed', String(paused));
      const text = paused ? 'Play slideshow' : 'Pause slideshow';
      pause.textContent = window.lkT ? window.lkT(text) : text;
    }
    pause.addEventListener('click', function() { paused = !paused; syncPause(); });
    reduced.addEventListener('change', function() { paused = reduced.matches; syncPause(); });
    section.addEventListener('mouseenter', function() { hover = true; });
    section.addEventListener('mouseleave', function() { hover = false; });
    section.addEventListener('focusin', function() { focused = true; });
    section.addEventListener('focusout', function(event) { focused = section.contains(event.relatedTarget); });
    new MutationObserver(syncPause).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    function tick(time) {
      const delta = last ? Math.min(time - last, 60) : 0; last = time;
      if (!paused && !hover && !focused && !dialog.open && !document.hidden && viewport.clientWidth) {
        position += delta * .028;
        const cycle = track.children[originals.length].offsetLeft - track.children[0].offsetLeft;
        if (cycle > 0 && position >= cycle) position -= cycle;
        viewport.scrollLeft = position;
      }
      else { position = viewport.scrollLeft; }
      requestAnimationFrame(tick);
    }
    syncPause(); requestAnimationFrame(tick);
  }
  function showPhoto(next) {
    index = (next + links.length) % links.length;
    const thumbnail = links[index].querySelector('img');
    image.src = links[index].href;
    image.alt = thumbnail.alt;
    dialog.querySelector('[data-photo-caption]').textContent = window.lkT ? window.lkT(thumbnail.alt) : thumbnail.alt;
    dialog.querySelector('[data-photo-counter]').textContent = (index + 1) + ' / ' + links.length;
  }
  links.forEach(function (link, i) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      showPhoto(i);
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('[data-photo-close]').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('[data-photo-previous]').addEventListener('click', function () { showPhoto(index - 1); });
  dialog.querySelector('[data-photo-next]').addEventListener('click', function () { showPhoto(index + 1); });
  new MutationObserver(function() { if (dialog.open) showPhoto(index); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(index + 1); }
  });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    document.body.style.overflow = previousOverflow;
    if (opener) opener.focus({ preventScroll: true });
  });
})();
