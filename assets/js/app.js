/* ============================================================================
   Everyx — Кафетерий льгот · app shell + router
   ========================================================================== */
(function () {
  const U = UI, D = () => window.DB;

  /* ---- navigation maps ------------------------------------------------ */
  const NAV_EMP = [
    { g: 'Главное' },
    { r: 'emp/dashboard', t: 'Главная', i: 'home' },
    { g: 'Льготы' },
    { r: 'emp/catalog', t: 'Каталог льгот', i: 'grid' },
    { r: 'emp/discounts', t: 'Корпоративные скидки', i: 'discount', tag: 'ПрофПлюс' },
    { r: 'emp/merch', t: 'Мерч', i: 'merch' },
    { r: 'emp/base', t: 'Базовые льготы', i: 'base' },
    { r: 'emp/wellbeing', t: 'Everyx Баланс', i: 'wellbeing' },
    { r: 'emp/charity', t: 'Благотворительность', i: 'charity' },
    { g: 'Мой аккаунт' },
    { r: 'emp/reward', t: 'Моё вознаграждение', i: 'sparkles' },
    { r: 'emp/compensation', t: 'Компенсация', i: 'compensation' },
    { r: 'emp/history', t: 'История', i: 'history' },
    { r: 'emp/faq', t: 'Помощь', i: 'question' },
  ];
  const NAV_ADM = [
    { g: 'Главное' },
    { r: 'adm/dashboard', t: 'Дашборд', i: 'chart' },
    { g: 'Управление' },
    { r: 'adm/employees', t: 'Сотрудники', i: 'users' },
    { r: 'adm/orders', t: 'Заказы и заявки', i: 'box', tag: String(D().orders.length) },
    { r: 'adm/accruals', t: 'Начисление баллов', i: 'coins' },
    { r: 'adm/catalog', t: 'Каталог льгот', i: 'grid' },
    { g: 'Отчётность' },
    { r: 'adm/reports', t: 'Отчёты', i: 'doc' },
    { g: 'Система' },
    { r: 'adm/settings', t: 'Настройки', i: 'settings' },
  ];

  const VIEW = { emp: () => window.VIEWS_EMP, adm: () => window.VIEWS_ADM };

  let current = location.hash.replace('#', '') || 'emp/dashboard';

  /* ---- theme ---------------------------------------------------------- */
  function initTheme() {
    let dark = false;
    try { dark = localStorage.getItem('evx-theme') === 'dark'; } catch (e) {}
    document.documentElement.classList.toggle('dark', dark);
    updateLogos();
  }
  function toggleTheme() {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('evx-theme', dark ? 'dark' : 'light'); } catch (e) {}
    updateLogos(); renderTopbar();
  }
  function updateLogos() {
    const dark = document.documentElement.classList.contains('dark');
    U.$$('.evx-logo').forEach(img => { img.src = 'assets/img/everyx-logo' + (dark ? '-dark' : '') + '.svg'; });
  }
  window.setBrandColor = function (hex) {
    const root = document.documentElement;
    root.style.setProperty('--primary', hex);
    root.style.setProperty('--ring', hex);
  };

  /* ---- shell ---------------------------------------------------------- */
  function role() { return current.split('/')[0]; }

  function renderShell() {
    document.getElementById('app').innerHTML = `
      <div class="shell">
        <aside class="sidebar" id="sidebar">
          <div class="sb-head">
            <a href="index.html"><img class="evx-logo sb-logo" src="assets/img/everyx-logo.svg" alt="Everyx"></a>
            <div class="sb-company"><span>${ICON('building', 16)}</span><div><b>${U.esc(D().company.name)}</b><br><span>Кафетерий льгот</span></div></div>
          </div>
          <nav class="sb-nav" id="sbnav"></nav>
          <div class="sb-foot" id="sbfoot"></div>
        </aside>
        <div class="main">
          <header class="topbar" id="topbar"></header>
          <div class="content" id="content"></div>
        </div>
      </div>`;
    renderNav(); renderTopbar(); renderRoute();
  }

  function renderNav() {
    const nav = role() === 'adm' ? NAV_ADM : NAV_EMP;
    U.$('#sbnav').innerHTML = nav.map(n => {
      if (n.g) return `<div class="sb-group">${U.esc(n.g)}</div>`;
      const active = current === n.r || (n.r !== 'emp/dashboard' && n.r !== 'adm/dashboard' && current.startsWith(n.r));
      return `<a class="sb-link ${active ? 'active' : ''}" data-go="${n.r}">${ICON(n.i, 19)}<span>${U.esc(n.t)}</span>${n.tag ? `<span class="tag">${U.esc(n.tag)}</span>` : ''}</a>`;
    }).join('');
    renderFoot();
  }
  function renderFoot() {
    if (role() === 'adm') {
      U.$('#sbfoot').innerHTML = `<div class="sb-company" style="background:transparent;padding:6px 4px">
        <div class="avatar avatar-sm" style="background:var(--h6)">МК</div><div><b style="font-size:12.5px">Мария Кузнецова</b><br><span>Администратор C&B</span></div></div>
        <a class="sb-link" href="index.html" style="margin-top:6px">${ICON('logout', 18)}<span>На лендинг</span></a>`;
    } else {
      const u = D().user;
      U.$('#sbfoot').innerHTML = `<div class="card" style="padding:12px;background:var(--secondary);border:0;margin-bottom:8px">
          <div class="kicker">Доступно баллов</div>
          <div style="font-family:var(--font-display);font-size:22px;color:var(--primary)" id="sbBal">${U.fmt(u.balance)}</div></div>
        <a class="sb-link" href="index.html">${ICON('logout', 18)}<span>На лендинг</span></a>`;
    }
  }

  function renderTopbar() {
    const v = currentView();
    const dark = document.documentElement.classList.contains('dark');
    const profName = role() === 'adm' ? 'Мария Кузнецова' : D().user.name;
    const profSub = role() === 'adm' ? 'Администратор C&B' : D().user.position;
    const profIni = role() === 'adm' ? 'МК' : D().user.initials;
    U.$('#topbar').innerHTML = `
      <button class="iconbtn menu-btn" id="menuBtn">${ICON('menu', 19)}</button>
      <div><div class="tb-title">${U.esc(v.title || '')}</div>${v.sub ? `<div class="tb-sub">${U.esc(v.sub)}</div>` : ''}</div>
      <div class="spacer"></div>
      <div class="roleswitch">
        <a class="${role() === 'emp' ? 'active' : ''}" data-go="emp/dashboard">${ICON('support', 15)}<span>Сотрудник</span></a>
        <a class="${role() === 'adm' ? 'active' : ''}" data-go="adm/dashboard">${ICON('chart', 15)}<span>HR / C&B</span></a>
      </div>
      <button class="iconbtn" id="themeBtn" title="Тема">${ICON(dark ? 'sun' : 'moon', 19)}</button>
      <button class="iconbtn" id="bellBtn" title="Уведомления">${ICON('bell', 19)}<span class="ping"></span></button>
      <div class="row" style="gap:9px"><div class="avatar avatar-sm">${profIni}</div>
        <div class="stack" style="gap:0"><b style="font-size:13px;line-height:1.2">${U.esc(profName)}</b><span style="font-size:11px;color:var(--muted-foreground)">${U.esc(profSub)}</span></div></div>`;
    U.$('#themeBtn').addEventListener('click', toggleTheme);
    U.$('#bellBtn').addEventListener('click', () => U.toast('Уведомления', 'Новых уведомлений нет', 'info'));
    const mb = U.$('#menuBtn');
    mb && mb.addEventListener('click', () => U.$('#sidebar').classList.toggle('open'));
  }

  function currentView() {
    const [r, name, param] = current.split('/');
    const set = (VIEW[r] || VIEW.emp)();
    const fn = set[name] || set.dashboard;
    return fn(param);
  }

  function renderRoute(soft) {
    const v = currentView();
    const content = U.$('#content');
    if (!content) return;
    content.innerHTML = typeof v.html === 'string' ? v.html : '';
    if (!soft) window.scrollTo(0, 0);
    if (v.mount) try { v.mount(content); } catch (e) { console.error(e); }
    U.animateBars(content);
  }

  /* ---- navigation ----------------------------------------------------- */
  window.go = function (route) {
    const prevRole = role();
    current = route;
    location.hash = route;
    if (role() !== prevRole) { renderNav(); }
    else { highlightNav(); }
    renderTopbar(); renderRoute();
    const sb = U.$('#sidebar'); sb && sb.classList.remove('open');
  };
  window.refresh = () => renderRoute(true);
  window.refreshWallet = function () {
    // update sidebar balance + re-render current view softly
    renderRoute(true);
    const sb = U.$('#sbBal'); if (sb) sb.textContent = U.fmt(D().user.balance);
  };

  function highlightNav() {
    const nav = role() === 'adm' ? NAV_ADM : NAV_EMP;
    U.$$('#sbnav .sb-link').forEach((a, idx) => {});
    renderNav();
  }

  /* ---- global click delegation --------------------------------------- */
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); window.go(go.getAttribute('data-go')); return; }
    const buy = e.target.closest('[data-buy]');
    if (buy) { e.preventDefault(); window.openCheckout(buy.getAttribute('data-buy')); return; }
    // close mobile sidebar when clicking scrim
    if (e.target.classList && e.target.classList.contains('scrim')) U.$('#sidebar').classList.remove('open');
  });
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (h && h !== current) { current = h; renderNav(); renderTopbar(); renderRoute(); }
  });

  /* ---- boot ----------------------------------------------------------- */
  initTheme();
  renderShell();
})();
