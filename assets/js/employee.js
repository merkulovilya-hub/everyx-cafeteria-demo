/* ============================================================================
   Everyx — Личный кабинет сотрудника (global: window.VIEWS_EMP)
   ========================================================================== */
(function () {
  const U = UI;
  const { fmt, money, pts, esc, el, brandChip, brandLogo, toast, modal, closeModal, confetti, ring, animateBars } = U;
  const D = () => window.DB;
  const hue = (h) => `var(--h${h || 4})`;

  /* ---------- shared fragments ----------------------------------------- */
  function benefitCard(it, sec) {
    const s = sec || D().section(it.section);
    const free = it.price === 0;
    const isReq = it.type === 'request' || it.type === 'service';
    const priceHtml = free
      ? `<div class="ben-price free">Бесплатно</div>`
      : it.topup
        ? `<div class="ben-price">от ${fmt(it.price)} <small>баллов</small></div>`
        : `<div class="ben-price">${fmt(it.price)} <small>баллов</small></div>`;
    const cta = isReq ? (it.type === 'service' ? 'Подключить' : 'Получить условия') : 'Оформить';
    const covers = (it.covers || []).slice(0, 4).map(c => `<span>${esc(c)}</span>`).join('') +
      ((it.covers || []).length > 4 ? `<span>+${it.covers.length - 4}</span>` : '');
    return `<div class="card card-hover ben-card">
      <div class="ben-top">
        <div class="ben-ico" style="background:${hue(s.hue)}">${ICON(s.icon, 22)}</div>
        ${it.badge ? `<span class="badge ${it.badge === 'Бесплатно' ? 'badge-free' : it.badge === 'Хит' || it.badge === 'Популярно' ? 'badge-primary' : 'badge-honey'}" style="margin-left:auto">${esc(it.badge)}</span>` : ''}
      </div>
      <div class="ben-body">
        <h3>${esc(it.name)}</h3>
        <div class="b-short">${esc(it.short)}</div>
        <div class="ben-covers">${covers}</div>
        <div class="ben-foot">
          ${priceHtml}
          <button class="btn btn-primary btn-sm" data-buy="${it.id}">${cta} ${ICON('arrowR', 16)}</button>
        </div>
      </div>
    </div>`;
  }

  function catCard(s) {
    return `<a class="cat-card hue-${s.hue}" data-go="emp/section/${s.id}">
      <div class="c-art">${ICON(s.icon, 24)}</div>
      <div class="c-ico">${ICON(s.icon, 24)}</div>
      <div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.tagline)}</p>
        <div class="c-count">${s.items.length} ${U.plural(s.items.length, ['льгота', 'льготы', 'льгот'])} ${ICON('arrowR', 14)}</div>
      </div>
    </a>`;
  }

  function partnerStrip() {
    return `<div class="card card-pad">
      <div class="between mb14"><div><div class="kicker">Партнёрская сеть</div>
      <h3 style="font-size:16px;margin-top:4px">${D().brand.partners} провайдеров по всей России</h3></div>
      <span class="badge badge-soft">${ICON('pin', 13)} 9 городов присутствия</span></div>
      <div class="wrap-row">${D().partners.map(p => brandChip(p)).join('')}</div>
    </div>`;
  }

  /* ---------- CHECKOUT flow -------------------------------------------- */
  function openCheckout(id) {
    const it = D().item(id);
    if (!it) return;
    const sec = D().section(it.section);
    const isReq = it.type === 'request' || it.type === 'service';
    const balance = D().user.balance;
    let amount = it.topup ? Math.max(it.price, 3000) : it.price;
    let step = 1;
    let payExtra = false;

    const m = modal('', { sticky: false });
    render();

    function header(title, sub) {
      return `<div class="modal-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>
        <button class="iconbtn" data-close>${ICON('close', 18)}</button></div>`;
    }
    function stepbar() {
      const labels = isReq ? ['Условия', 'Заявка', 'Готово'] : ['Сумма', 'Оплата', 'Готово'];
      return `<div class="steps mb18">${labels.map((l, i) => {
        const n = i + 1;
        return `<div class="st ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}"><span class="n">${step > n ? '✓' : n}</span>${l}</div>` +
          (i < labels.length - 1 ? '<div class="ln"></div>' : '');
      }).join('')}</div>`;
    }

    function render() {
      if (isReq) return renderRequest();
      if (step === 1) return renderAmount();
      if (step === 2) return renderPay();
      return renderDone();
    }

    function renderAmount() {
      const max = it.topup ? Math.max(balance, it.price) + 20000 : it.price;
      const min = it.price;
      m.innerHTML = header(esc(it.name), esc(sec.name)) +
        `<div class="modal-body">${stepbar()}
          <div class="amount-box">
            <div class="kicker">${it.topup ? 'Сумма пополнения' : 'Стоимость'}</div>
            <div class="av" id="av">${fmt(amount)} <small>баллов</small></div>
          </div>
          ${it.topup ? `<input type="range" class="range mt14" id="rng" min="${min}" max="${max}" step="500" value="${amount}">
            <div class="between mt6"><span class="hint">${fmt(min)}</span><span class="hint">${fmt(max)}</span></div>
            <div class="wrap-row mt14" style="justify-content:center">
              ${[3000, 5000, 10000, 20000].map(v => `<button class="chip" data-amt="${v}">${fmt(v)}</button>`).join('')}
            </div>` : ''}
          <div class="card card-pad mt18" style="background:var(--secondary);border:0">
            <div class="between"><span class="muted">Ваш баланс</span><b>${pts(balance)}</b></div>
            <div class="between mt6"><span class="muted">Останется после оформления</span>
              <b id="rest" style="color:${balance - amount < 0 ? 'var(--warning)' : 'var(--success)'}">${fmt(Math.max(0, balance - amount))} баллов</b></div>
            ${balance - amount < 0 ? `<div class="alert alert-warning mt10">${ICON('info', 18)}<div>Не хватает <b>${fmt(amount - balance)} баллов</b>. На следующем шаге можно доплатить картой.</div></div>` : ''}
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button>
          <button class="btn btn-primary" id="next">Продолжить ${ICON('arrowR', 16)}</button></div>`;
      const av = m.querySelector('#av'), rest = m.querySelector('#rest');
      const upd = () => {
        av.innerHTML = `${fmt(amount)} <small>баллов</small>`;
        const r = balance - amount;
        rest.textContent = `${fmt(Math.max(0, r))} баллов`;
        rest.style.color = r < 0 ? 'var(--warning)' : 'var(--success)';
      };
      const rng = m.querySelector('#rng');
      if (rng) rng.addEventListener('input', e => { amount = +e.target.value; upd(); });
      m.querySelectorAll('[data-amt]').forEach(b => b.addEventListener('click', () => { amount = +b.dataset.amt; if (rng) rng.value = amount; upd(); }));
      m.querySelector('#next').addEventListener('click', () => { step = 2; render(); });
    }

    function renderPay() {
      const fromPoints = Math.min(amount, balance);
      const extra = Math.max(0, amount - balance);
      payExtra = extra > 0;
      m.innerHTML = header('Оплата', esc(it.name)) +
        `<div class="modal-body">${stepbar()}
          <div class="card card-pad" style="background:var(--secondary);border:0">
            <div class="between"><span class="muted">${esc(it.name)}</span><b>${fmt(amount)} баллов</b></div>
            <hr class="divider" style="margin:12px 0">
            <div class="between"><span>Списываем баллами</span><b>${fmt(fromPoints)} баллов</b></div>
            ${extra > 0 ? `<div class="between mt6"><span>Доплата банковской картой</span><b style="color:var(--primary)">${money(extra)}</b></div>` : ''}
          </div>
          ${extra > 0 ? `
          <div class="lbl mt18">Карта для доплаты</div>
          <div class="card card-pad" style="display:flex;align-items:center;gap:12px">
            <div class="ben-ico" style="background:var(--h7);width:38px;height:38px">${ICON('card', 18)}</div>
            <div style="flex:1"><b>Mir •••• ${D().user.cardLast4}</b><div class="hint" style="margin-top:0">Оплата через Mir Pay</div></div>
            <span class="dot dot-ok"></span>
          </div>
          <div class="hint mt10">${ICON('lock', 13)} Доплата проходит на платформе — без перехода на сторонние сайты.</div>
          ` : `<div class="alert alert-success mt18">${ICON('checkCircle', 18)}<div>Баллов достаточно — доплата не требуется.</div></div>`}
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" id="back">Назад</button>
          <button class="btn btn-primary" id="pay">${extra > 0 ? `Оплатить ${money(extra)}` : 'Подтвердить'} ${ICON('check', 16)}</button></div>`;
      m.querySelector('#back').addEventListener('click', () => { step = 1; render(); });
      m.querySelector('#pay').addEventListener('click', () => { commit(amount, Math.max(0, amount - balance)); step = 3; render(); });
    }

    function renderDone() {
      const code = genCode();
      m.innerHTML = `<div class="modal-body" style="text-align:center;padding-top:30px">
          <div class="ben-ico" style="background:var(--h3);width:64px;height:64px;margin:0 auto 16px;border-radius:50%">${ICON('check', 30)}</div>
          <h3 style="font-size:22px">Льгота оформлена!</h3>
          <p class="muted" style="margin-top:8px">${esc(it.name)} — ${esc(sec.name)}</p>
          <div class="card card-pad mt18" style="text-align:left;background:var(--secondary);border:0">
            <div class="kicker mb6">Код активации</div>
            <div class="row" style="justify-content:space-between">
              <span class="mono" style="font-size:20px;letter-spacing:2px">${code}</span>
              <button class="btn btn-ghost btn-sm" id="copy">${ICON('doc', 15)} Копировать</button>
            </div>
          </div>
          <div class="alert alert-info mt14" style="text-align:left">${ICON('mail', 18)}<div>Уведомление с кодом активации отправлено на <b>${esc(D().user.email)}</b>. ${it.type === 'policy' ? 'Заявка на полис передана в страховую компанию.' : 'Карта доступна в разделе «Мои карты».'}</div></div>
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" data-close>Закрыть</button>
          <button class="btn btn-primary" id="toHist">${ICON('history', 16)} В историю</button></div>`;
      m.querySelector('#copy').addEventListener('click', () => { toast('Скопировано', 'Код активации в буфере обмена', 'info'); });
      m.querySelector('#toHist').addEventListener('click', () => { closeModal(); window.go('emp/history'); });
      confetti();
    }

    function renderRequest() {
      if (step === 1) {
        m.innerHTML = header(esc(it.name), esc(sec.name)) +
          `<div class="modal-body">${stepbar()}
            <p style="font-size:14px">${esc(it.short)}</p>
            <div class="ben-covers mt14">${(it.covers || []).map(c => `<span>${esc(c)}</span>`).join('')}</div>
            ${it.type === 'service'
              ? `<div class="alert alert-success mt18">${ICON('checkCircle', 18)}<div>Сервис доступен бесплатно для всех сотрудников.</div></div>`
              : `<div class="alert alert-info mt18">${ICON('info', 18)}<div>Оставьте заявку — менеджер Everyx пришлёт персональный промокод на специальные условия у партнёра.</div></div>`}
          </div>
          <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button>
            <button class="btn btn-primary" id="next">${it.type === 'service' ? 'Подключить' : 'Оставить заявку'}</button></div>`;
        m.querySelector('#next').addEventListener('click', () => { step = 3; render(); });
      } else {
        m.innerHTML = `<div class="modal-body" style="text-align:center;padding-top:30px">
          <div class="ben-ico" style="background:var(--h3);width:64px;height:64px;margin:0 auto 16px;border-radius:50%">${ICON('check', 30)}</div>
          <h3 style="font-size:22px">${it.type === 'service' ? 'Сервис подключён!' : 'Заявка принята!'}</h3>
          <p class="muted" style="margin-top:8px">${esc(it.name)}</p>
          ${it.type === 'service'
            ? `<div class="card card-pad mt18" style="background:var(--secondary);border:0;text-align:left">${ICON('phone', 18)} Горячая линия и онлайн-доступ откроются в течение часа.</div>`
            : `<div class="card card-pad mt18" style="text-align:left;background:var(--secondary);border:0">
                <div class="kicker mb6">Промокод партнёра</div>
                <span class="mono" style="font-size:20px;letter-spacing:2px">${genCode()}</span></div>`}
          <div class="alert alert-info mt14" style="text-align:left">${ICON('mail', 18)}<div>Подробности отправлены на <b>${esc(D().user.email)}</b>.</div></div>
        </div>
        <div class="modal-foot"><button class="btn btn-primary" data-close>Готово</button></div>`;
        confetti();
      }
    }

    function commit(amt, extra) {
      const u = D().user;
      u.spent += (amt - extra); // points spent (extra is card co-pay)
      D().history.unshift({ id: 'n' + Date.now(), date: today(), name: it.name, section: sec.name, points: amt - extra, extra, status: it.type === 'policy' ? 'В обработке' : 'Активна', type: it.type });
      window.refreshWallet && window.refreshWallet();
      toast('Готово', `${esc(it.name)} — оформлено`, 'success');
    }
  }

  function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s.replace(/(....)(....)(....)/, '$1-$2-$3');
  }
  function today() {
    return '06.06.2026';
  }

  /* ====================================================================
     VIEWS
     ==================================================================== */
  const dashboard = () => ({
    title: 'Главная', sub: D().company.name,
    html: `
      <div class="page-head"><h1>Добрый день, ${esc(D().user.first)} 👋</h1>
      <p>Распределите бюджет льгот на ${D().company.fyLabel} год — выберите, что важно именно вам.</p></div>

      <div class="grid g2" style="grid-template-columns: 1.4fr 1fr; align-items:stretch">
        ${walletHtml()}
        <div class="card card-pad" style="display:flex;flex-direction:column;gap:14px">
          <div class="between"><div class="kicker">Использование бюджета</div><span class="badge badge-warning">${ICON('clock', 12)} до ${D().user.burnDate}</span></div>
          <div class="row" style="gap:18px">
            ${ring(Math.round(D().user.spent / D().user.allocated * 100), 110)}
            <div class="stack" style="gap:10px">
              <div><div class="kicker">Потрачено</div><b style="font-family:var(--font-display);font-size:20px">${fmt(D().user.spent)}</b></div>
              <div><div class="kicker">Доступно</div><b style="font-family:var(--font-display);font-size:20px;color:var(--primary)">${fmt(D().user.balance)}</b></div>
            </div>
          </div>
          <div class="hint" style="margin-top:auto">${ICON('info', 13)} Баллы нельзя обналичить — только потратить на льготы.</div>
        </div>
      </div>

      <div class="grid g3 mt18">
        ${stat('coins', 'Бюджет на год', fmt(D().user.allocated), 'баллов', '')}
        ${stat('gift', 'Оформлено льгот', D().history.length, '', 'за 2026 год')}
        ${stat('percent', 'Экономия на налогах', '34', '%', 'vs индексация ФОТ')}
      </div>

      <div class="between mt24 mb14"><h2 style="font-size:20px">Каталог льгот</h2><a class="btn btn-ghost btn-sm" data-go="emp/catalog">Все разделы ${ICON('arrowR', 15)}</a></div>
      <div class="grid g4">${D().sections.slice(0, 8).map(catCard).join('')}</div>

      <div class="grid g2 mt24" style="grid-template-columns:1.2fr 1fr">
        <div class="card card-pad">
          <div class="between mb14"><h3 style="font-size:16px">Последние операции</h3><a class="muted" data-go="emp/history" style="font-size:13px">Вся история ${ICON('arrowR', 13)}</a></div>
          ${D().history.slice(0, 4).map(txnRow).join('')}
        </div>
        <div class="card card-pad" style="display:flex;flex-direction:column;background:linear-gradient(135deg,var(--card),color-mix(in srgb,var(--honey) 12%,var(--card)))">
          <div class="ben-ico" style="background:var(--h2);width:44px;height:44px">${ICON('discount', 22)}</div>
          <h3 style="font-size:17px;margin-top:14px">Корпоративные скидки ${D().brand.discountPlatform}</h3>
          <p class="muted" style="font-size:13.5px;margin-top:6px;flex:1">${D().discounts.length}+ предложений от известных брендов по всей России — бесплатно для всех сотрудников.</p>
          <div class="wrap-row mt14">${D().partners.slice(0, 5).map(p => brandChip(p)).join('')}</div>
          <button class="btn btn-primary mt14" data-go="emp/discounts">Открыть каталог скидок ${ICON('arrowR', 16)}</button>
        </div>
      </div>

      <div class="mt24">${partnerStrip()}</div>
    `,
    mount(root) { animateBars(root); },
  });

  function walletHtml() {
    const u = D().user, pct = Math.round(u.spent / u.allocated * 100);
    return `<div class="wallet">
      <span class="badge badge-honey w-badge">${ICON('sparkles', 12)} ${D().brand.product}</span>
      <div class="w-k">Доступно баллов</div>
      <div class="w-bal" id="wbal">${fmt(u.balance)} <small>баллов</small></div>
      <div class="w-sub">из ${fmt(u.allocated)} начисленных · 1 балл = 1 ₽</div>
      <div class="w-bar"><i data-w="${pct}" style="width:0%"></i></div>
      <div class="w-row">
        <div class="w-stat"><b>${fmt(u.spent)}</b><span>Потрачено</span></div>
        <div class="w-stat"><b>${u.accrualNext}</b><span>Следующее начисление</span></div>
        <div class="w-stat"><b>Mir •••• ${u.cardLast4}</b><span>Карта для доплат</span></div>
      </div>
    </div>`;
  }
  function stat(icon, label, val, unit, delta) {
    return `<div class="card stat stat-accent">
      <div class="s-top">${ICON(icon, 18)}<span>${label}</span></div>
      <div class="s-val">${val}${unit ? ` <small>${unit}</small>` : ''}</div>
      ${delta ? `<div class="s-delta muted" style="color:var(--muted-foreground)">${esc(delta)}</div>` : ''}
    </div>`;
  }
  function txnRow(t) {
    const ic = { card: 'card', certificate: 'doc', policy: 'shieldCheck', merch: 'box', charity: 'charity', service: 'support', request: 'doc' }[t.type] || 'coins';
    return `<div class="row" style="padding:11px 0;border-top:1px solid var(--border)">
      <div class="lr-ico" style="width:36px;height:36px">${ICON(ic, 18)}</div>
      <div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(t.name)}</b><div class="hint" style="margin-top:0">${esc(t.date)} · ${esc(t.section)}</div></div>
      <div style="text-align:right"><b class="tnum">−${fmt(t.points)}</b>${t.extra ? `<div class="hint" style="margin-top:0">+${money(t.extra)} картой</div>` : ''}</div>
    </div>`;
  }

  /* ---- catalog -------------------------------------------------------- */
  const catalog = () => ({
    title: 'Каталог льгот', sub: 'Выберите раздел',
    html: `
      <div class="page-head"><h1>Каталог льгот</h1>
      <p>Восемь разделов льгот. Внутри каждого — карты, полисы и сертификаты, которые можно оформить за баллы.</p></div>
      <div class="card card-pad mb18" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div class="ben-ico" style="background:var(--h6);width:40px;height:40px">${ICON('sparkles', 20)}</div>
        <div style="flex:1;min-width:200px"><b>Витрина настроена под вас</b>
        <div class="hint" style="margin-top:0">Грейд: <b>${esc(D().user.grade)}</b> · Город: <b>${esc(D().user.city)}</b> · Доступный бюджет: <b>${pts(D().user.allocated)}</b></div></div>
        <select class="select" id="grade" style="max-width:200px">
          <option>Грейд: Специалист</option><option>Грейд: Рабочий</option><option>Грейд: Руководитель</option>
        </select>
      </div>
      <div class="grid g3">${D().sections.map(catCard).join('')}</div>
      <div class="mt24">${partnerStrip()}</div>
    `,
    mount(root) {
      const sel = root.querySelector('#grade');
      sel && sel.addEventListener('change', () => toast('Витрина пересобрана', 'Доступные льготы обновлены под выбранный грейд', 'info'));
    },
  });

  /* ---- section detail ------------------------------------------------- */
  const section = (id) => {
    const s = D().section(id);
    if (!s) return { title: 'Раздел', html: '<p>Раздел не найден.</p>' };
    return {
      title: s.name, sub: 'Каталог льгот',
      html: `
        <div class="breadcrumb"><a data-go="emp/catalog">Каталог</a>${ICON('chevR', 14)}<span>${esc(s.name)}</span></div>
        <div class="sec-hero hue-${s.hue} mb18">
          <div class="ico-big">${ICON(s.icon, 24)}</div>
          <h1>${esc(s.name)}</h1>
          <p>${esc(s.blurb)}</p>
        </div>
        <div class="grid g3">${s.items.map(it => benefitCard(it, s)).join('')}</div>
      `,
    };
  };

  /* ---- merch ---------------------------------------------------------- */
  const merch = () => ({
    title: 'Мерч', sub: 'Витрина продукции',
    html: `
      <div class="page-head"><h1>Корпоративный мерч</h1>
      <p>Брендированная продукция ${esc(D().company.name)}. Оформите заказ за баллы — заявка уйдёт ответственному, а баллы спишутся автоматически.</p></div>
      <div class="grid g4">${D().merch.map(merchCard).join('')}</div>
    `,
    mount(root) {
      root.querySelectorAll('[data-merch]').forEach(b => b.addEventListener('click', () => openMerch(b.dataset.merch)));
    },
  });
  function merchCard(m) {
    const out = m.stock === 0;
    const col = U.hueSolid[m.hue] || '#d2553b';
    return `<div class="card card-hover ben-card">
      <div class="merch-art" style="background:linear-gradient(140deg,color-mix(in srgb,${col} 10%,var(--card)),color-mix(in srgb,${col} 26%,var(--card)));color:${col}">
        ${MERCH(m.art, 84)}
        <span class="badge badge-soft m-corner">${esc(m.cat)}</span>
      </div>
      <div class="ben-body">
        <div class="between">${out ? '<span class="badge badge-outline">Нет в наличии</span>' : `<span class="hint" style="margin-top:0">${m.stock} шт. в наличии</span>`}<span class="badge badge-soft">Мерч</span></div>
        <h3 style="margin-top:8px">${esc(m.name)}</h3>
        <div class="ben-foot" style="margin-top:14px">
          <div class="ben-price">${fmt(m.price)} <small>баллов</small></div>
          <button class="btn btn-primary btn-sm" data-merch="${m.id}" ${out ? 'disabled' : ''}>В заказ</button>
        </div>
      </div>
    </div>`;
  }
  function openMerch(id) {
    const m = D().merch.find(x => x.id === id);
    const col = U.hueSolid[m.hue] || '#d2553b';
    const node = modal(`<div class="modal-head"><div><h3>${esc(m.name)}</h3><p>Оформление заказа мерча</p></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body">
        <div class="row" style="gap:16px">
          <div class="merch-art" style="width:124px;height:100px;flex:none;border-radius:var(--r);background:linear-gradient(140deg,color-mix(in srgb,${col} 10%,var(--card)),color-mix(in srgb,${col} 26%,var(--card)));color:${col}">${MERCH(m.art, 60)}</div>
          <div><b style="font-size:16px">${esc(m.name)}</b><div class="hint">${esc(m.cat)} · ${m.stock} шт. в наличии</div>
          <div class="ben-price mt6">${fmt(m.price)} <small>баллов</small></div></div>
        </div>
        ${m.sizes ? `<div class="lbl mt18">Размер</div><div class="wrap-row">${m.sizes.map((sz, i) => `<button class="chip ${i === 1 ? 'active' : ''}" data-sz>${sz}</button>`).join('')}</div>` : ''}
        <div class="lbl mt18">Адрес выдачи</div>
        <select class="select"><option>Офис «Москва-Сити», стойка ресепшн</option><option>Площадка «Тольятти»</option><option>Доставка курьером</option></select>
        <div class="alert alert-info mt18">${ICON('info', 18)}<div>Заявка уйдёт ответственному сотруднику, ${fmt(m.price)} баллов спишутся с баланса. О готовности придёт уведомление.</div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="ord">Заказать за ${fmt(m.price)} баллов</button></div>`);
    node.querySelectorAll('[data-sz]').forEach(b => b.addEventListener('click', () => { node.querySelectorAll('[data-sz]').forEach(x => x.classList.remove('active')); b.classList.add('active'); }));
    node.querySelector('#ord').addEventListener('click', () => {
      D().user.spent += m.price;
      D().history.unshift({ id: 'm' + Date.now(), date: today(), name: m.name + ' (мерч)', section: 'Мерч', points: m.price, extra: 0, status: 'Комплектуется', type: 'merch' });
      window.refreshWallet && window.refreshWallet();
      closeModal(); confetti(); toast('Заказ оформлен', `${esc(m.name)} — комплектуется`, 'success');
    });
  }

  /* ---- discounts (ProfPlus) ------------------------------------------ */
  const discounts = () => {
    let cat = 'Все', q = '';
    const view = {
      title: 'Корпоративные скидки', sub: D().brand.discountPlatform,
      html: `
        <div class="page-head"><h1>Корпоративные скидки и привилегии</h1>
        <p>Федеральная платформа привилегий <b>${esc(D().brand.discountPlatform)}</b> — повышенные скидки и промокоды у ${D().discounts.length}+ партнёров. Доступно бесплатно всем сотрудникам.</p></div>
        <div class="input-wrap mb14">${ICON('search', 18)}<input class="input" id="dsearch" placeholder="Поиск по бренду или услуге…"></div>
        <div class="wrap-row mb18" id="dcats">${D().discountCats.map(c => `<button class="chip ${c === 'Все' ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <div class="grid g4" id="dgrid"></div>
      `,
      mount(root) {
        const grid = root.querySelector('#dgrid');
        const draw = () => {
          let list = D().discounts;
          if (cat !== 'Все') list = list.filter(d => d.cat === cat);
          if (q) list = list.filter(d => (d.brand + ' ' + d.cat + ' ' + d.deal).toLowerCase().includes(q.toLowerCase()));
          grid.innerHTML = list.length ? list.map(discCard).join('') :
            `<div class="card card-pad" style="grid-column:1/-1;text-align:center;color:var(--muted-foreground)">Ничего не найдено</div>`;
          grid.querySelectorAll('[data-promo]').forEach(b => b.addEventListener('click', () => openPromo(b.dataset.promo)));
          grid.querySelectorAll('.fav').forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
        };
        root.querySelector('#dsearch').addEventListener('input', e => { q = e.target.value; draw(); });
        root.querySelectorAll('#dcats .chip').forEach(c => c.addEventListener('click', () => {
          cat = c.dataset.cat; root.querySelectorAll('#dcats .chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); draw();
        }));
        draw();
      },
    };
    return view;
  };
  const kindBadge = { percent: 'Скидка', fix: 'Скидка', cashback: 'Кешбэк', promo: 'Акция' };
  function discCard(d) {
    return `<div class="card card-hover disc-card">
      <div class="disc-top">${brandLogo(d.brand, d.domain)}<button class="fav">${ICON('heart', 15)}</button></div>
      <div class="disc-deal">${esc(d.deal)}</div>
      <div><div class="d-brand">${esc(d.brand)} <span class="badge badge-soft" style="font-weight:600;font-size:10.5px;padding:2px 7px;vertical-align:middle">${kindBadge[d.kind] || 'Скидка'}</span></div><div class="d-cat">${esc(d.cat)}</div></div>
      ${d.note ? `<div class="d-note">${ICON('info', 12)} ${esc(d.note)}</div>` : ''}
      <button class="btn btn-outline btn-sm btn-block" data-promo="${d.id}">${d.kind === 'promo' ? 'Активировать' : 'Получить промокод'}</button>
    </div>`;
  }
  function openPromo(id) {
    const d = D().discounts.find(x => x.id === id);
    modal(`<div class="modal-head"><div class="row" style="gap:12px">${brandLogo(d.brand, d.domain, 44)}<div><h3 style="font-size:17px">${esc(d.brand)}</h3><p>${esc(d.cat)}</p></div></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body" style="text-align:center">
        <div class="disc-deal" style="font-size:30px">${esc(d.deal)}</div>
        ${d.note ? `<p class="muted mt6">${esc(d.note)}</p>` : ''}
        <div class="card card-pad mt18" style="background:var(--secondary);border:0">
          <div class="kicker mb6">Промокод</div>
          <div class="row" style="justify-content:space-between"><span class="mono" style="font-size:22px;letter-spacing:2px">EVRX-${(d.brand.replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 4).toUpperCase() || 'PROMO')}${Math.floor(100 + Math.random() * 900)}</span>
          <button class="btn btn-ghost btn-sm" data-close>${ICON('doc', 15)} Копировать</button></div>
        </div>
        <p class="hint mt14">Промокод применяется на сайте или в приложении партнёра при оформлении заказа.</p>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Закрыть</button><button class="btn btn-primary" data-close>Перейти к партнёру ${ICON('arrowR', 16)}</button></div>`);
  }

  /* ---- base benefits -------------------------------------------------- */
  const base = () => ({
    title: 'Базовые льготы', sub: 'Доступно всем',
    html: `<div class="page-head"><h1>Базовые льготы</h1>
      <p>Программы, которые компания предоставляет всем сотрудникам сверх кафетерия — без списания баллов.</p></div>
      <div class="grid g2">${D().baseBenefits.map(b => `
        <div class="list-row"><div class="lr-ico">${ICON(b.icon, 20)}</div>
        <div><b>${esc(b.name)}</b><div class="hint" style="margin-top:2px">${esc(b.desc)}</div></div></div>`).join('')}</div>`,
  });

  /* ---- wellbeing (Everyx Баланс) ------------------------------------- */
  const wellbeing = () => ({
    title: 'Everyx Баланс', sub: 'Благополучие',
    html: `<div class="sec-hero hue-6 mb18"><div class="ico-big">${ICON('wellbeing', 24)}</div>
      <h1>Everyx Баланс</h1><p>Программы благополучия: забота о ментальном и физическом здоровье, финансовая грамотность и активный образ жизни.</p></div>
      <div class="grid g2">${D().wellbeing.map(w => `
        <div class="card card-pad card-hover row" style="align-items:flex-start;gap:14px">
          <div class="ben-ico" style="background:var(--h6)">${ICON(w.icon, 22)}</div>
          <div><b style="font-size:15px">${esc(w.name)}</b><div class="hint" style="margin-top:4px">${esc(w.desc)}</div></div>
        </div>`).join('')}</div>`,
  });

  /* ---- charity -------------------------------------------------------- */
  const charity = () => ({
    title: 'Благотворительность', sub: 'Помочь баллами',
    html: `<div class="page-head"><h1>Благотворительность</h1><p>Направьте часть баллов в проверенные благотворительные фонды. Компания удвоит ваш вклад.</p></div>
      <div class="grid g2">${D().charity.map(c => `
        <div class="card card-pad card-hover">
          <div class="between"><span class="badge badge-soft">${esc(c.cat)}</span><div class="ben-ico" style="background:var(--h4);width:38px;height:38px">${ICON('charity', 18)}</div></div>
          <h3 style="font-size:16px;margin-top:12px">${esc(c.name)}</h3>
          <p class="hint" style="margin-top:6px">${esc(c.desc)}</p>
          <button class="btn btn-primary btn-sm mt14" data-charity="${c.id}">Помочь баллами</button>
        </div>`).join('')}</div>`,
    mount(root) {
      root.querySelectorAll('[data-charity]').forEach(b => b.addEventListener('click', () => openCharity(b.dataset.charity)));
    },
  });
  function openCharity(id) {
    const c = D().charity.find(x => x.id === id);
    let amt = 1000;
    const node = modal(`<div class="modal-head"><div><h3>${esc(c.name)}</h3><p>Пожертвование баллами</p></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body">
        <div class="amount-box"><div class="kicker">Сумма пожертвования</div><div class="av" id="cav">${fmt(amt)} <small>баллов</small></div></div>
        <input type="range" class="range mt14" id="crng" min="500" max="10000" step="500" value="1000">
        <div class="alert alert-success mt18">${ICON('heart', 18)}<div>Компания удвоит ваш вклад: фонд получит <b id="cdbl">${fmt(amt * 2)} ₽</b>.</div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="cgo">Пожертвовать</button></div>`);
    const av = node.querySelector('#cav'), dbl = node.querySelector('#cdbl');
    node.querySelector('#crng').addEventListener('input', e => { amt = +e.target.value; av.innerHTML = `${fmt(amt)} <small>баллов</small>`; dbl.textContent = `${fmt(amt * 2)} ₽`; });
    node.querySelector('#cgo').addEventListener('click', () => {
      D().user.spent += amt;
      D().history.unshift({ id: 'ch' + Date.now(), date: today(), name: 'Пожертвование — ' + c.name, section: 'Благотворительность', points: amt, extra: 0, status: 'Выполнено', type: 'charity' });
      window.refreshWallet && window.refreshWallet();
      closeModal(); confetti(); toast('Спасибо!', 'Ваш вклад удвоен компанией', 'success');
    });
  }

  /* ---- compensation (salary deduction) ------------------------------- */
  const compensation = () => ({
    title: 'Компенсация', sub: 'Удержание из ЗП',
    html: `<div class="page-head"><h1>Компенсация из заработной платы</h1>
      <p>Если баллов не хватает на нужную льготу, оформите запрос на удержание разницы из заработной платы. Запрос уходит на согласование ответственному.</p></div>
      <div class="grid g2" style="grid-template-columns:1.3fr 1fr">
        <div class="card card-pad">
          <div class="field mb14"><label>Льгота или услуга</label><input class="input" id="cmpItem" placeholder="Напр.: Полис ДМС «Семья»"></div>
          <div class="field mb14"><label>Сумма к удержанию, ₽</label><input class="input" id="cmpSum" type="number" value="15000"></div>
          <div class="field mb14"><label>Период удержания</label><select class="select"><option>Единовременно</option><option>2 месяца</option><option>3 месяца</option><option>6 месяцев</option></select></div>
          <div class="field"><label>Комментарий</label><textarea class="textarea" placeholder="Необязательно"></textarea></div>
          <button class="btn btn-primary mt18" id="cmpSend">Отправить запрос</button>
        </div>
        <div class="card card-pad" style="background:var(--secondary);border:0">
          <h3 style="font-size:15px">Как это работает</h3>
          <ol style="margin:14px 0 0 18px;font-size:13.5px;line-height:1.9;color:var(--muted-foreground)">
            <li>Вы заполняете форму запроса.</li>
            <li>Запрос уходит ответственному C&B на согласование.</li>
            <li>После согласования сумма удерживается из ЗП.</li>
            <li>Баллы на льготу зачисляются в личный кабинет.</li>
          </ol>
          <div class="alert alert-info mt18">${ICON('info', 18)}<div>Форма выгружается по заданному шаблону и при необходимости передаётся в 1С ЗУП через интеграцию.</div></div>
        </div>
      </div>`,
    mount(root) {
      root.querySelector('#cmpSend').addEventListener('click', () => {
        toast('Запрос отправлен', 'Передан на согласование ответственному C&B', 'success'); confetti();
      });
    },
  });

  /* ---- history -------------------------------------------------------- */
  const history = () => ({
    title: 'История', sub: 'Операции и заказы',
    html: `<div class="page-head"><h1>История операций</h1><p>Все оформленные льготы, списания баллов и доплаты картой.</p></div>
      <div class="grid g4 mb18">
        ${stat('coins', 'Потрачено баллов', fmt(D().user.spent), '', '')}
        ${stat('gift', 'Всего операций', D().history.length, '', '')}
        ${stat('card', 'Доплат картой', money(D().history.reduce((a, h) => a + (h.extra || 0), 0)), '', '')}
        ${stat('wallet', 'Остаток', fmt(D().user.balance), 'баллов', '')}
      </div>
      <div class="card"><div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Дата</th><th>Льгота</th><th>Раздел</th><th>Баллы</th><th>Доплата</th><th>Статус</th></tr></thead>
        <tbody>${D().history.map(h => `<tr>
          <td class="mono">${esc(h.date)}</td><td><b>${esc(h.name)}</b></td><td class="muted">${esc(h.section)}</td>
          <td class="amt">−${fmt(h.points)}</td><td>${h.extra ? money(h.extra) : '—'}</td>
          <td><span class="badge ${statusClass(h.status)}">${esc(h.status)}</span></td></tr>`).join('')}</tbody>
      </table></div></div>`,
  });
  function statusClass(s) {
    if (['Активна', 'Выполнено', 'Доставлено', 'Выполнен'].includes(s)) return 'badge-success';
    if (['В обработке', 'Комплектуется', 'На согласовании'].includes(s)) return 'badge-warning';
    if (s === 'Использована') return 'badge-soft';
    return 'badge-soft';
  }

  /* ---- Total Reward Statement ---------------------------------------- */
  const reward = () => {
    const tr = D().totalReward;
    return {
      title: 'Моё вознаграждение', sub: 'Total Reward',
      html: `<div class="page-head"><h1>Полное вознаграждение</h1>
        <p>Полная стоимость вашего пакета в ${D().company.fyLabel} году — зарплата, премии и все льготы за счёт компании.</p></div>
        <div class="grid g2" style="grid-template-columns:1fr 1.2fr">
          <div class="card card-pad" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
            <div class="kicker">Итого за год</div>
            <div style="font-family:var(--font-display);font-size:46px;letter-spacing:-.02em;margin:8px 0;color:var(--primary)">${fmt(tr.total)} <span style="font-size:24px;color:var(--foreground)">₽</span></div>
            <p class="muted" style="font-size:13.5px">Это на <b>${Math.round((tr.total / tr.salary - 1) * 100)}%</b> больше вашего оклада за счёт премий и льгот.</p>
          </div>
          <div class="card card-pad">
            <h3 style="font-size:16px" class="mb18">Структура вознаграждения</h3>
            <div class="hbars">${tr.items.map(i => {
              const pct = Math.round(i.v / tr.total * 100);
              return `<div class="hbar"><span>${esc(i.k)}</span>
                <div class="hb-track"><i data-w="${pct}" style="width:0%;background:var(--h${i.hue})"></i></div>
                <span class="hb-val">${fmt(i.v)}</span></div>`;
            }).join('')}</div>
          </div>
        </div>
        <div class="alert alert-info mt18">${ICON('sparkles', 18)}<div><b>Total Reward Statement</b> наглядно показывает сотруднику реальную ценность работы в компании — сильный инструмент удержания и мотивации.</div></div>`,
      mount(root) { animateBars(root); },
    };
  };

  /* ---- FAQ ------------------------------------------------------------ */
  const faq = () => ({
    title: 'Помощь', sub: 'Вопросы и ответы',
    html: `<div class="page-head"><h1>Задать вопрос</h1><p>Часто задаваемые вопросы о кафетерии льгот. Не нашли ответ — напишите в поддержку.</p></div>
      <div class="grid g2" style="grid-template-columns:1.4fr 1fr;align-items:start">
        <div>${D().faq.map((f, i) => `<div class="acc${i === 0 ? ' open' : ''}"><div class="acc-head">${esc(f.q)} ${ICON('chevD', 18)}</div><div class="acc-body">${esc(f.a)}</div></div>`).join('')}</div>
        <div class="card card-pad">
          <h3 style="font-size:16px">Не нашли ответ?</h3>
          <p class="hint mt6">Отправьте вопрос — ответ придёт на почту и появится здесь.</p>
          <div class="field mt14"><label>Тема</label><input class="input" placeholder="Коротко о вопросе"></div>
          <div class="field mt14"><label>Сообщение</label><textarea class="textarea" placeholder="Опишите вопрос…"></textarea></div>
          <button class="btn btn-primary mt14 btn-block" id="askSend">Отправить в поддержку</button>
          <div class="hint mt14">${ICON('phone', 13)} Поддержка Everyx: 8 800 000-00-00</div>
        </div>
      </div>`,
    mount(root) {
      root.querySelectorAll('.acc-head').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
      root.querySelector('#askSend').addEventListener('click', () => toast('Вопрос отправлен', 'Ответ придёт на вашу почту', 'success'));
    },
  });

  window.VIEWS_EMP = { dashboard, catalog, section, merch, discounts, base, wellbeing, charity, compensation, history, reward, faq };
  window.openCheckout = openCheckout;
  window._walletHtml = walletHtml;
})();
