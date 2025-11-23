document.addEventListener('DOMContentLoaded', () => {

  // create eyes markup if it's missing
  if (!document.querySelector('.eyes')) {
    const container = document.createElement('div');
    container.className = 'eyes';

    const eye1 = document.createElement('div');
    eye1.className = 'eye eye1';
    const p1 = document.createElement('div');
    p1.className = 'pupil pupil1';
    eye1.appendChild(p1);

    const eye2 = document.createElement('div');
    eye2.className = 'eye eye2';
    const p2 = document.createElement('div');
    p2.className = 'pupil pupil2';
    eye2.appendChild(p2);

    container.appendChild(eye1);
    container.appendChild(eye2);

    // append to a preferred parent if present, else body
    const parent = document.querySelector('.hands') || document.body;
    parent.appendChild(container);
  }

  const eyes = document.querySelectorAll('.eye');
  console.log('eyes found:', eyes.length);

  // default movement fraction of the eye size (increase to allow more travel)
  const maxRatio = 0.07;

  function updatePupils(clientX, clientY) {
    eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil');
      if (!pupil) return;
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      // horizontal-only: compute dx only
      const dx = clientX - cx;

      // per-eye override via data-move (e.g. <div class="eye" data-move="0.25">)
      const ratio = parseFloat(eye.dataset.move) || maxRatio;
      const max = Math.min(r.width, r.height) * ratio;

      // clamp dx to [-max, max]
      const limitedX = Math.max(-max, Math.min(dx, max));
      pupil.style.setProperty('--dx', limitedX + 'px');

      // If you want vertical movement later, compute dy and set --dy similarly.
    });
  }

  function onMove(e) {
    const touch = e.touches && e.touches[0];
    const clientX = (touch && touch.clientX) || e.clientX;
    const clientY = (touch && touch.clientY) || e.clientY;
    if (clientX == null) return;
    updatePupils(clientX, clientY);
  }

  // global listeners so pupils follow cursor anywhere on the page
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', (ev) => { if (ev.touches && ev.touches[0]) onMove(ev.touches[0]); }, { passive: true });

  // reset to center when leaving window/tab
  window.addEventListener('mouseleave', () => {
    document.querySelectorAll('.pupil').forEach(p => {
      p.style.setProperty('--dx', '0px');
    });
  });

  // initialise centered
  document.querySelectorAll('.pupil').forEach(p => p.style.setProperty('--dx', '0px'));

  // --- draggable .box setup (add this inside the DOMContentLoaded handler) ---
  const box = document.querySelector('.box');
  if (box) {
    box.style.touchAction = 'none';
    let startX = 0, startY = 0, origLeft = 0, origTop = 0, dragging = false;

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try { box.setPointerCapture && box.setPointerCapture(e.pointerId); } catch {}
      dragging = true;
      box.classList.add('dragging');
      const cs = getComputedStyle(box);
      origLeft = parseFloat(cs.left) || box.getBoundingClientRect().left + window.scrollX;
      origTop  = parseFloat(cs.top)  || box.getBoundingClientRect().top  + window.scrollY;
      startX = e.clientX;
      startY = e.clientY;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp, { once: true });
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      box.style.left = (origLeft + dx) + 'px';
      box.style.top  = (origTop  + dy) + 'px';
    }

    function onPointerUp(e) {
      dragging = false;
      box.classList.remove('dragging');
      window.removeEventListener('pointermove', onPointerMove);
      try { box.releasePointerCapture && box.releasePointerCapture(e.pointerId); } catch {}
    }

    box.addEventListener('pointerdown', onPointerDown);
  }
});