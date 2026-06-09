/* ============================================================================
   Everyx — UI helpers (global: window.UI)
   ========================================================================== */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* number with thin-space thousands: 60000 -> "60 000" */
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const money = (n) => fmt(n) + ' ₽';

  /* Russian plural: plural(3, ['балл','балла','баллов']) */
  function plural(n, f) {
    n = Math.abs(n) % 100; const n1 = n % 10;
    if (n > 10 && n < 20) return f[2];
    if (n1 > 1 && n1 < 5) return f[1];
    if (n1 === 1) return f[0];
    return f[2];
  }
  const pts = (n) => fmt(n) + ' ' + plural(n, ['балл', 'балла', 'баллов']);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* parse HTML string -> element */
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* deterministic brand color from name (warm-leaning palette) */
  const PALETTE = ['#D2553B', '#C2722A', '#4E8A5B', '#2E7B73', '#B14A2C', '#9C5A22',
    '#7C2D20', '#335E3B', '#1F4F4A', '#6E5D53', '#A8182C', '#875110'];
  function brandColor(name) {
    let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }
  function brandChip(name) {
    const c = brandColor(name);
    const label = name.length > 12 ? name.slice(0, 11) + '…' : name;
    return `<span class="brandchip" style="background:${c}">${esc(label)}</span>`;
  }
  function initials(name) {
    const p = name.trim().split(/\s+/);
    return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || '');
  }
  /* real brand logo (favicon) with graceful monogram fallback when offline */
  function brandLogo(name, domain, size) {
    const c = brandColor(name);
    const mono = (name.match(/[A-Za-zА-Яа-я0-9]/g) || ['?']).slice(0, 2).join('').toUpperCase();
    const s = size || 40;
    const src = domain ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=128' : '';
    const img = src
      ? `<img src="${src}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer"
           onerror="this.style.display='none';var p=this.parentNode;p.classList.add('blogo-fb');p.style.background='${c}'">`
      : '';
    const fbClass = src ? '' : ' blogo-fb';
    const fbStyle = src ? '' : `background:${c}`;
    return `<span class="blogo${fbClass}" style="width:${s}px;height:${s}px;${fbStyle}">${img}<span class="blogo-mono">${esc(mono)}</span></span>`;
  }

  /* hue helper -> gradient var */
  const hueGrad = (h) => `var(--h${h || 4})`;
  const hueSolid = { 2: '#c2722a', 3: '#4e8a5b', 4: '#d2553b', 5: '#6e5d53', 6: '#2e7b73', 7: '#b14a2c' };

  /* ---- toast ---------------------------------------------------------- */
  function toast(title, msg, type) {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = el('<div class="toast-wrap"></div>'); document.body.appendChild(wrap); }
    type = type || 'success';
    const map = {
      success: { bg: 'color-mix(in srgb,var(--success) 16%,transparent)', col: 'var(--success)', ic: 'checkCircle' },
      info: { bg: 'color-mix(in srgb,var(--info) 16%,transparent)', col: 'var(--info)', ic: 'info' },
      warning: { bg: 'color-mix(in srgb,var(--warning) 18%,transparent)', col: 'var(--warning)', ic: 'bell' },
    };
    const m = map[type] || map.success;
    const t = el(`<div class="toast"><div class="t-ico" style="background:${m.bg};color:${m.col}">${ICON(m.ic, 18)}</div>
      <div><b>${esc(title)}</b>${msg ? `<span style="display:block">${esc(msg)}</span>` : ''}</div></div>`);
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 3600);
  }

  /* ---- modal ---------------------------------------------------------- */
  function modal(content, opts) {
    opts = opts || {};
    closeModal();
    const ov = el('<div class="overlay"></div>');
    const m = el(`<div class="modal${opts.wide ? ' wide' : ''}"></div>`);
    m.innerHTML = content;
    ov.appendChild(m);
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    ov.addEventListener('click', (e) => { if (e.target === ov && !opts.sticky) closeModal(); });
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModal));
    window._modal = ov;
    return m;
  }
  function closeModal() {
    if (window._modal) { window._modal.remove(); window._modal = null; document.body.style.overflow = ''; }
  }

  /* ---- confetti ------------------------------------------------------- */
  function confetti() {
    const c = el('<div class="confetti"></div>');
    document.body.appendChild(c);
    const cols = ['#D2553B', '#E9A35B', '#4E8A5B', '#2E7B73', '#FFD166', '#B14A2C'];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * .35) + 's';
      p.style.transform = `translateY(-20px) rotate(${Math.random() * 360}deg)`;
      c.appendChild(p);
    }
    setTimeout(() => c.remove(), 3200);
  }

  /* ---- SVG progress ring ---------------------------------------------- */
  function ring(percent, size, opts) {
    opts = opts || {};
    const s = size || 120, sw = opts.stroke || 11, r = (s - sw) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
    const col = opts.color || 'var(--primary)';
    return `<div class="ring-wrap" style="width:${s}px;height:${s}px">
      <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="var(--secondary)" stroke-width="${sw}"/>
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
          transform="rotate(-90 ${s/2} ${s/2})" style="transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"/>
      </svg>
      <div class="ring-label">${opts.label || `<div style="font-family:var(--font-display);font-size:${s*.22}px">${percent}%</div>`}</div>
    </div>`;
  }

  /* ---- SVG donut chart ------------------------------------------------- */
  const DONUT_COLORS = ['#D2553B', '#E9A35B', '#4E8A5B', '#2E7B73', '#B14A2C', '#91806F', '#C77E1A', '#9C3826'];
  function donut(data, size) {
    const s = size || 180, sw = 26, r = (s - sw) / 2, c = 2 * Math.PI * r;
    const total = data.reduce((a, d) => a + d.v, 0) || 1;
    let acc = 0;
    const segs = data.map((d, i) => {
      const frac = d.v / total, len = frac * c, gap = c - len;
      const seg = `<circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${DONUT_COLORS[i % DONUT_COLORS.length]}"
        stroke-width="${sw}" stroke-dasharray="${len} ${gap}" stroke-dashoffset="${-acc}"
        transform="rotate(-90 ${s/2} ${s/2})"/>`;
      acc += len; return seg;
    }).join('');
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${segs}</svg>`;
  }
  function donutLegend(data) {
    return `<div class="legend">${data.map((d, i) =>
      `<div class="lg"><i style="background:${DONUT_COLORS[i % DONUT_COLORS.length]}"></i>${esc(d.k)} · ${d.v}%</div>`).join('')}</div>`;
  }

  /* ---- animated count-up --------------------------------------------- */
  function countUp(node, to, opts) {
    opts = opts || {}; const dur = opts.dur || 900, from = opts.from || 0;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * e);
      node.textContent = (opts.fmt || fmt)(val);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* animate width / height bars after mount */
  function animateBars(root) {
    $$('[data-w]', root || document).forEach(b => {
      const w = b.getAttribute('data-w');
      requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = w + '%'; }));
    });
    $$('[data-h]', root || document).forEach(b => {
      const h = b.getAttribute('data-h');
      requestAnimationFrame(() => requestAnimationFrame(() => { b.style.height = h + '%'; }));
    });
  }

  window.UI = { $, $$, fmt, money, pts, plural, esc, el, brandColor, brandChip, brandLogo, initials,
    hueGrad, hueSolid, toast, modal, closeModal, confetti, ring, donut, donutLegend,
    DONUT_COLORS, countUp, animateBars };
})();
