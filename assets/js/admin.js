/* ============================================================================
   Everyx — Панель администратора C&B (global: window.VIEWS_ADM)
   ========================================================================== */
(function () {
  const U = UI;
  const { fmt, money, pts, esc, el, brandChip, toast, modal, closeModal, confetti, ring, donut, donutLegend, animateBars } = U;
  const D = () => window.DB;

  /* ---- shared chart helpers ------------------------------------------ */
  function statTile(icon, label, val, unit, delta, up) {
    return `<div class="card stat">
      <div class="s-top">${ICON(icon, 18)}<span>${label}</span></div>
      <div class="s-val">${val}${unit ? ` <small>${unit}</small>` : ''}</div>
      ${delta ? `<div class="s-delta ${up ? 'up' : up === false ? 'down' : ''}">${up !== undefined ? ICON(up ? 'arrowUp' : 'arrowDown', 13) : ''}${esc(delta)}</div>` : ''}
    </div>`;
  }
  function vbars(data, alt) {
    const max = Math.max(...data.map(d => d.v));
    return `<div class="chart-bars">${data.map(d => `<div class="cb ${alt ? 'alt' : ''}">
      <b>${d.v}%</b><i data-h="${Math.round(d.v / max * 100)}" style="height:0%"></i><span>${esc(d.k)}</span></div>`).join('')}</div>`;
  }
  function hbars(data) {
    const max = Math.max(...data.map(d => d.v));
    return `<div class="hbars">${data.map(d => `<div class="hbar"><span>${esc(d.k)}</span>
      <div class="hb-track"><i data-w="${Math.round(d.v / max * 100)}" style="width:0%"></i></div>
      <span class="hb-val">${d.v}%</span></div>`).join('')}</div>`;
  }

  /* ====================================================================
     DASHBOARD (BI)
     ==================================================================== */
  const dashboard = () => {
    const a = D().analytics, k = a.kpi, c = D().company;
    return {
      title: 'Дашборд C&B', sub: c.name,
      html: `
        <div class="page-head"><div class="between">
          <div><h1>Аналитика программы льгот</h1><p>${c.name} · ${fmt(c.employees)} сотрудников · ${c.cities} городов · бюджет ${fmt(c.annualBudget)} ₽ на ${c.fyLabel}</p></div>
          <div class="wrap-row"><select class="select" id="slice" style="width:auto"><option>Срез: вся компания</option><option>По подразделениям</option><option>По грейдам</option><option>По городам</option></select>
          <button class="btn btn-primary btn-sm" id="exp">${ICON('download', 16)} Выгрузить</button></div>
        </div></div>

        <div class="grid g3 mb18">
          ${statTile('chart', 'Утилизация бюджета', k.utilization, '%', '+12 п.п. к прошлому году', true)}
          ${statTile('users', 'Активных сотрудников', k.activeShare, '%', fmt(c.active) + ' из ' + fmt(c.employees), true)}
          ${statTile('percent', 'Экономия на налогах', k.taxSaving, '%', 'vs индексация ФОТ', true)}
          ${statTile('sparkles', 'eNPS вовлечённости', k.enps, '', '+9 за полгода', true)}
          ${statTile('gift', 'Льгот на сотрудника', k.avgBenefits, '', 'в среднем за год', true)}
          ${statTile('settings', 'Ресурс HR (FTE)', k.fte, '', 'на администрирование', false)}
        </div>

        <div class="grid g2 mb18" style="grid-template-columns:1fr 1.3fr">
          <div class="card card-pad">
            <h3 style="font-size:16px" class="mb14">Распределение по категориям</h3>
            <div class="row" style="gap:20px;align-items:center">
              <div>${donut(a.byCategory, 170)}</div>
              <div style="flex:1">${donutLegend(a.byCategory)}</div>
            </div>
          </div>
          <div class="card card-pad">
            <div class="between mb14"><h3 style="font-size:16px">Динамика утилизации, ${c.fyLabel}</h3><span class="badge badge-success">${ICON('arrowUp', 12)} цель 90%</span></div>
            ${vbars(a.byMonth)}
          </div>
        </div>

        <div class="grid g2 mb18">
          <div class="card card-pad"><h3 style="font-size:16px" class="mb14">Утилизация по городам</h3>${hbars(a.byCity)}</div>
          <div class="card card-pad"><h3 style="font-size:16px" class="mb14">Утилизация по грейдам</h3>${hbars(a.byGrade)}</div>
        </div>

        <div class="grid g2" style="grid-template-columns:1.4fr 1fr">
          <div class="card card-pad">
            <div class="between mb14"><h3 style="font-size:16px">Последние заказы</h3><a class="muted" data-go="adm/orders" style="font-size:13px">Все заказы ${ICON('arrowR', 13)}</a></div>
            <div class="tbl-wrap"><table class="tbl"><tbody>
              ${D().orders.slice(0, 5).map(o => `<tr><td><b>${esc(o.id)}</b></td><td>${esc(o.emp)}</td><td class="muted">${esc(o.item)}</td>
                <td class="amt">${o.points ? fmt(o.points) : '—'}</td><td><span class="badge ${ordClass(o.status)}">${esc(o.status)}</span></td></tr>`).join('')}
            </tbody></table></div>
          </div>
          <div class="card card-pad">
            <h3 style="font-size:16px" class="mb14">Доверенные провайдеры</h3>
            <div class="wrap-row">${D().partners.map(p => brandChip(p)).join('')}</div>
            <div class="alert alert-info mt18">${ICON('shieldCheck', 18)}<div>${D().brand.partners} провайдеров · соответствие 152-ФЗ · взаиморасчёты внутри платформы.</div></div>
          </div>
        </div>
      `,
      mount(root) {
        animateBars(root);
        root.querySelector('#exp').addEventListener('click', () => toast('Выгрузка готовится', 'Дашборд будет выгружен в XLSX', 'info'));
        root.querySelector('#slice').addEventListener('change', e => toast('Срез применён', e.target.value, 'info'));
      },
    };
  };
  function ordClass(s) {
    if (['Выполнен', 'Выполнено'].includes(s)) return 'badge-success';
    if (['В обработке', 'Комплектуется', 'На согласовании'].includes(s)) return 'badge-warning';
    return 'badge-soft';
  }

  /* ====================================================================
     EMPLOYEES
     ==================================================================== */
  const employees = () => {
    let q = '', dept = 'Все';
    const depts = ['Все', ...Array.from(new Set(D().employees.map(e => e.dept)))];
    return {
      title: 'Сотрудники', sub: fmt(D().company.employees) + ' человек',
      html: `<div class="page-head"><div class="between"><div><h1>Сотрудники</h1><p>Балансы баллов, грейды и статусы. Импорт из 1С ЗУП или Excel.</p></div>
        <div class="wrap-row"><button class="btn btn-ghost btn-sm" id="imp">${ICON('download', 16)} Импорт из 1С</button><button class="btn btn-primary btn-sm" id="add">${ICON('plus', 16)} Добавить</button></div></div></div>
        <div class="wrap-row mb18">
          <div class="input-wrap" style="flex:1;min-width:220px">${ICON('search', 18)}<input class="input" id="esearch" placeholder="Поиск по ФИО…"></div>
          <select class="select" id="edept" style="width:auto">${depts.map(d => `<option>${esc(d)}</option>`).join('')}</select>
        </div>
        <div class="card"><div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Сотрудник</th><th>Подразделение</th><th>Грейд</th><th>Город</th><th>Начислено</th><th>Потрачено</th><th>Остаток</th><th>Статус</th><th></th></tr></thead>
          <tbody id="ebody"></tbody>
        </table></div></div>`,
      mount(root) {
        const body = root.querySelector('#ebody');
        const draw = () => {
          let list = D().employees;
          if (dept !== 'Все') list = list.filter(e => e.dept === dept);
          if (q) list = list.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
          body.innerHTML = list.map(e => `<tr>
            <td><div class="row" style="gap:10px"><div class="avatar avatar-sm">${U.initials(e.name)}</div><b>${esc(e.name)}</b></div></td>
            <td class="muted">${esc(e.dept)}</td><td>${esc(e.grade)}</td><td class="muted">${esc(e.city)}</td>
            <td class="amt">${fmt(e.alloc)}</td><td class="amt">${fmt(e.spent)}</td><td class="amt" style="color:var(--primary)">${fmt(e.alloc - e.spent)}</td>
            <td><span class="badge ${e.status === 'Активен' ? 'badge-success' : e.status === 'Приглашён' ? 'badge-warning' : 'badge-soft'}">${esc(e.status)}</span></td>
            <td><button class="btn btn-ghost btn-sm" data-adj="${e.id}">${ICON('edit', 14)}</button></td></tr>`).join('');
          body.querySelectorAll('[data-adj]').forEach(b => b.addEventListener('click', () => openAdjust(b.dataset.adj, draw)));
        };
        root.querySelector('#esearch').addEventListener('input', e => { q = e.target.value; draw(); });
        root.querySelector('#edept').addEventListener('change', e => { dept = e.target.value; draw(); });
        root.querySelector('#imp').addEventListener('click', () => toast('Импорт', 'Синхронизация с 1С ЗУП запущена', 'info'));
        root.querySelector('#add').addEventListener('click', () => toast('Новый сотрудник', 'Откроется форма добавления', 'info'));
        draw();
      },
    };
  };
  function openAdjust(id, redraw) {
    const e = D().employees.find(x => x.id === id);
    const node = modal(`<div class="modal-head"><div class="row" style="gap:10px"><div class="avatar avatar-sm">${U.initials(e.name)}</div><div><h3 style="font-size:16px">${esc(e.name)}</h3><p>${esc(e.dept)} · ${esc(e.grade)}</p></div></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body">
        <div class="grid g2 mb18">
          <div class="card card-pad" style="background:var(--secondary);border:0"><div class="kicker">Начислено</div><b style="font-family:var(--font-display);font-size:22px">${fmt(e.alloc)}</b></div>
          <div class="card card-pad" style="background:var(--secondary);border:0"><div class="kicker">Остаток</div><b style="font-family:var(--font-display);font-size:22px;color:var(--primary)">${fmt(e.alloc - e.spent)}</b></div>
        </div>
        <div class="field"><label>Ручная корректировка баланса, баллов</label>
          <div class="row"><input class="input" id="adjV" type="number" value="0"><select class="select" style="width:auto"><option>Начислить</option><option>Списать</option></select></div></div>
        <div class="field mt14"><label>Причина</label><input class="input" placeholder="Напр.: бонус за наставничество"></div>
        <div class="alert alert-warning mt18">${ICON('info', 18)}<div>Корректировка попадёт в журнал и пройдёт проверку перед публикацией в ЛК сотрудника.</div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="adjGo">Применить</button></div>`);
    node.querySelector('#adjGo').addEventListener('click', () => {
      const v = +node.querySelector('#adjV').value || 0;
      e.alloc += v;
      closeModal(); redraw && redraw(); toast('Баланс изменён', `${e.name}: ${v >= 0 ? '+' : ''}${fmt(v)} баллов`, 'success');
    });
  }

  /* ====================================================================
     ORDERS
     ==================================================================== */
  const orders = () => {
    let f = 'Все';
    const stat = ['Все', 'В обработке', 'Выполнен', 'Комплектуется', 'На согласовании'];
    return {
      title: 'Заказы и заявки', sub: D().orders.length + ' активных',
      html: `<div class="page-head"><h1>Заказы и заявки</h1><p>Оформленные льготы, заявки на полисы, заказы мерча и запросы на компенсацию.</p></div>
        <div class="wrap-row mb18" id="ofilters">${stat.map(s => `<button class="chip ${s === 'Все' ? 'active' : ''}" data-f="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        <div class="card"><div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Заказ</th><th>Сотрудник</th><th>Льгота</th><th>Раздел</th><th>Баллы</th><th>Дата</th><th>Статус</th></tr></thead>
          <tbody id="obody"></tbody></table></div></div>`,
      mount(root) {
        const body = root.querySelector('#obody');
        const draw = () => {
          let list = D().orders;
          if (f !== 'Все') list = list.filter(o => o.status === f);
          body.innerHTML = list.map(o => `<tr style="cursor:pointer" data-ord="${esc(o.id)}">
            <td><b>${esc(o.id)}</b></td><td>${esc(o.emp)}</td><td>${esc(o.item)}</td><td class="muted">${esc(o.section)}</td>
            <td class="amt">${o.points ? fmt(o.points) : '—'}</td><td class="mono">${esc(o.date)}</td>
            <td><span class="badge ${ordClass(o.status)}">${esc(o.status)}</span></td></tr>`).join('');
          body.querySelectorAll('[data-ord]').forEach(r => r.addEventListener('click', () => openOrder(r.dataset.ord)));
        };
        root.querySelectorAll('#ofilters .chip').forEach(c => c.addEventListener('click', () => {
          f = c.dataset.f; root.querySelectorAll('#ofilters .chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); draw();
        }));
        draw();
      },
    };
  };
  function openOrder(id) {
    const o = D().orders.find(x => x.id === id);
    modal(`<div class="modal-head"><div><h3>Заказ ${esc(o.id)}</h3><p>${esc(o.date)}</p></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body">
        <div class="list-row mb14"><div class="avatar avatar-sm">${U.initials(o.emp)}</div><div><b>${esc(o.emp)}</b><div class="hint" style="margin-top:0">Сотрудник</div></div></div>
        <div class="card card-pad" style="background:var(--secondary);border:0">
          <div class="between"><span class="muted">Льгота</span><b>${esc(o.item)}</b></div>
          <div class="between mt6"><span class="muted">Раздел</span><b>${esc(o.section)}</b></div>
          <div class="between mt6"><span class="muted">Списано баллов</span><b>${o.points ? fmt(o.points) : '—'}</b></div>
          <div class="between mt6"><span class="muted">Статус</span><span class="badge ${ordClass(o.status)}">${esc(o.status)}</span></div>
        </div>
        <div class="alert alert-info mt18">${ICON('info', 18)}<div>Просмотр заказа доступен администратору C&B. Корректировки выполняются провайдером Everyx по запросу.</div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Закрыть</button><button class="btn btn-primary" data-close>${ICON('download', 16)} Выгрузить</button></div>`);
  }

  /* ====================================================================
     ACCRUALS (начисление баллов)
     ==================================================================== */
  const accruals = () => ({
    title: 'Начисление баллов', sub: 'Правила и запуск',
    html: `<div class="page-head"><div class="between"><div><h1>Начисление баллов</h1><p>Правила начисления по категориям сотрудников. Запуск — раз в год по триггеру, с проверкой перед публикацией.</p></div>
      <button class="btn btn-primary" id="run">${ICON('bolt', 16)} Запустить начисление на 2027</button></div></div>
      <div class="card mb18"><div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Категория</th><th>Базовое начисление</th><th>За KPI</th><th>За стаж</th><th>Сотрудников</th><th></th></tr></thead>
        <tbody>${D().accrualRules.map(r => `<tr>
          <td><b>${esc(r.grade)}</b></td><td class="amt">${fmt(r.base)} баллов</td><td class="muted">${esc(r.kpi)}</td>
          <td class="muted">${esc(r.tenure)}</td><td class="amt">${fmt(r.count)}</td>
          <td><button class="btn btn-ghost btn-sm">${ICON('edit', 14)} Изменить</button></td></tr>`).join('')}</tbody>
      </table></div></div>
      <div class="grid g3">
        <div class="card card-pad"><div class="ben-ico" style="background:var(--h6)">${ICON('refresh', 20)}</div><h3 style="font-size:15px;margin-top:12px">Автоматический триггер</h3><p class="hint mt6">Начисление запускается ежегодно 1 января по заложенным алгоритмам.</p></div>
        <div class="card card-pad"><div class="ben-ico" style="background:var(--h4)">${ICON('edit', 20)}</div><h3 style="font-size:15px;margin-top:12px">Ручная корректировка</h3><p class="hint mt6">Точечная корректировка алгоритмов и начислений отдельным группам или сотрудникам.</p></div>
        <div class="card card-pad"><div class="ben-ico" style="background:var(--h3)">${ICON('checkCircle', 20)}</div><h3 style="font-size:15px;margin-top:12px">Проверка перед публикацией</h3><p class="hint mt6">Контроль корректности начислений до публикации в личных кабинетах.</p></div>
      </div>`,
    mount(root) {
      root.querySelector('#run').addEventListener('click', openAccrualRun);
    },
  });
  function openAccrualRun() {
    let stage = 0;
    const node = modal('', { sticky: true });
    draw();
    function draw() {
      if (stage === 0) {
        node.innerHTML = `<div class="modal-head"><div><h3>Начисление на 2027 год</h3><p>Шаг 1 — расчёт по правилам</p></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
          <div class="modal-body">
            <div class="card card-pad" style="background:var(--secondary);border:0">
              ${D().accrualRules.map(r => `<div class="between ${'' }" style="padding:8px 0"><span>${esc(r.grade)} · ${fmt(r.count)} чел.</span><b>${fmt(r.base)} × ${fmt(r.count)} = ${fmt(r.base * r.count)}</b></div>`).join('')}
              <hr class="divider" style="margin:10px 0"><div class="between"><b>Итого к начислению</b><b style="color:var(--primary)">${fmt(D().accrualRules.reduce((a, r) => a + r.base * r.count, 0))} баллов</b></div>
            </div>
            <div class="alert alert-warning mt18">${ICON('info', 18)}<div>Перед публикацией система проверит корректность начислений по каждому сотруднику.</div></div>
          </div>
          <div class="modal-foot"><button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="chk">Проверить начисления ${ICON('arrowR', 16)}</button></div>`;
        node.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
        node.querySelector('#chk').addEventListener('click', () => { stage = 1; draw(); });
      } else if (stage === 1) {
        node.innerHTML = `<div class="modal-head"><div><h3>Проверка корректности</h3><p>Шаг 2 — контроль перед публикацией</p></div></div>
          <div class="modal-body" style="text-align:center;padding:34px">
            <div class="ben-ico" style="width:56px;height:56px;border-radius:50%;background:var(--h6);margin:0 auto 16px">${ICON('refresh', 26)}</div>
            <h3>Проверяем начисления…</h3><p class="muted mt6">3 960 сотрудников · автоматическая валидация</p>
            <div class="bar mt18"><i id="pb" style="width:0%"></i></div>
          </div>`;
        const pb = node.querySelector('#pb');
        setTimeout(() => pb.style.width = '100%', 60);
        setTimeout(() => { stage = 2; draw(); }, 1400);
      } else {
        node.innerHTML = `<div class="modal-body" style="text-align:center;padding-top:30px">
          <div class="ben-ico" style="width:64px;height:64px;border-radius:50%;background:var(--h3);margin:0 auto 16px">${ICON('check', 30)}</div>
          <h3 style="font-size:22px">Проверка пройдена</h3>
          <p class="muted mt6">Ошибок не найдено. Начисления готовы к публикации.</p>
          <div class="grid g2 mt18"><div class="card card-pad" style="background:var(--secondary);border:0"><div class="kicker">Проверено</div><b style="font-family:var(--font-display);font-size:20px">3 960</b></div>
          <div class="card card-pad" style="background:var(--secondary);border:0"><div class="kicker">Ошибок</div><b style="font-family:var(--font-display);font-size:20px;color:var(--success)">0</b></div></div>
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" data-close>Позже</button><button class="btn btn-primary" id="pub">Опубликовать в ЛК</button></div>`;
        node.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
        node.querySelector('#pub').addEventListener('click', () => { closeModal(); confetti(); toast('Опубликовано', 'Баллы на 2027 начислены и видны сотрудникам', 'success'); });
      }
    }
  }

  /* ====================================================================
     CATALOG management
     ==================================================================== */
  const catalog = () => ({
    title: 'Каталог льгот', sub: 'Конструктор витрины',
    html: `<div class="page-head"><h1>Конструктор каталога</h1><p>Состав разделов и категорий витрины. Включайте льготы, доступные сотрудникам ${esc(D().company.name)}.</p></div>
      <div class="grid g2">${D().sections.map(s => `
        <div class="card card-pad">
          <div class="row" style="gap:12px"><div class="ben-ico" style="background:var(--h${s.hue})">${ICON(s.icon, 20)}</div>
            <div style="flex:1"><b>${esc(s.name)}</b><div class="hint" style="margin-top:0">${s.items.length} ${U.plural(s.items.length, ['льгота', 'льготы', 'льгот'])}</div></div>
            <button class="switch on" data-sw></button></div>
          <div class="ben-covers mt14">${s.items.slice(0, 5).map(i => `<span>${esc(i.name)}</span>`).join('')}${s.items.length > 5 ? `<span>+${s.items.length - 5}</span>` : ''}</div>
        </div>`).join('')}</div>
      <div class="alert alert-info mt18">${ICON('info', 18)}<div>Брендирование витрины в фирменных цветах и с логотипом компании — бесплатно. Изменения наполнения вносит провайдер Everyx по запросу.</div></div>`,
    mount(root) {
      root.querySelectorAll('[data-sw]').forEach(s => s.addEventListener('click', () => { s.classList.toggle('on'); toast('Обновлено', 'Раздел ' + (s.classList.contains('on') ? 'включён' : 'скрыт'), 'info'); }));
    },
  });

  /* ====================================================================
     REPORTS
     ==================================================================== */
  const reports = () => ({
    title: 'Отчёты', sub: 'Выгрузки',
    html: `<div class="page-head"><h1>Отчёты</h1><p>Готовые выгрузки для C&B и бухгалтерии. Еженедельные отчёты о списаниях формируются автоматически.</p></div>
      <div class="grid g2">${D().reports.map(r => `
        <div class="card card-pad card-hover row" style="align-items:flex-start;gap:14px">
          <div class="lr-ico" style="width:46px;height:46px">${ICON(r.icon, 22)}</div>
          <div style="flex:1"><div class="between"><b>${esc(r.name)}</b><span class="badge badge-soft">${esc(r.period)}</span></div>
            <div class="hint" style="margin-top:6px">${esc(r.desc)}</div>
            <div class="row mt14" style="gap:8px"><span class="hint" style="margin:0">${r.rows} строк</span><span class="spacer"></span>
              <button class="btn btn-ghost btn-sm" data-prev="${r.id}">${ICON('eye', 15)} Предпросмотр</button>
              <button class="btn btn-primary btn-sm" data-dl="${r.id}">${ICON('download', 15)} XLSX</button></div></div>
        </div>`).join('')}</div>`,
    mount(root) {
      root.querySelectorAll('[data-dl]').forEach(b => b.addEventListener('click', () => toast('Выгрузка', 'Отчёт формируется в XLSX', 'info')));
      root.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => openReport(b.dataset.prev)));
    },
  });
  function openReport(id) {
    const r = D().reports.find(x => x.id === id);
    let table = '';
    if (id === 'r1') { // НДФЛ
      table = `<table class="tbl"><thead><tr><th>Таб. №</th><th>ФИО</th><th>Подразделение</th><th>Доп. доход</th><th>НДФЛ</th><th>Тип</th></tr></thead><tbody>
        ${[['004217', 'Лебедева А.', 'Финансы', 21500, 2795, 'Кафетерий'], ['004102', 'Петров И.', 'Продажи', 58200, 7566, 'Кафетерий'], ['003980', 'Кузнецова М.', 'HR', 74300, 9659, 'ДМС'], ['004310', 'Волков Д.', 'ИТ', 33000, 4290, 'Обучение']]
          .map(x => `<tr><td class="mono">${x[0]}</td><td>${x[1]}</td><td class="muted">${x[2]}</td><td class="amt">${fmt(x[3])} ₽</td><td class="amt">${fmt(x[4])} ₽</td><td><span class="badge badge-soft">${x[5]}</span></td></tr>`).join('')}
      </tbody></table>`;
    } else if (id === 'r2') {
      table = `<table class="tbl"><thead><tr><th>Дата</th><th>ФИО</th><th>Товар</th><th>Сумма</th><th>Локация</th></tr></thead><tbody>
        ${[['30.05', 'Смирнова Е.', 'Худи ДЕМО-Холдинг', 4500, 'Казань'], ['28.05', 'Морозов С.', 'Термокружка', 1800, 'Н.Новгород'], ['25.05', 'Попова А.', 'Рюкзак городской', 6200, 'Казань']]
          .map(x => `<tr><td class="mono">${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td class="amt">${fmt(x[3])}</td><td class="muted">${x[4]}</td></tr>`).join('')}
      </tbody></table>`;
    } else {
      table = `<table class="tbl"><thead><tr><th>Позиция</th><th>Значение</th></tr></thead><tbody>
        <tr><td class="muted">Период</td><td>${esc(r.period)}</td></tr><tr><td class="muted">Строк в выгрузке</td><td class="amt">${r.rows}</td></tr>
        <tr><td class="muted">Формат</td><td>XLSX по шаблону</td></tr></tbody></table>`;
    }
    modal(`<div class="modal-head"><div><h3>${esc(r.name)}</h3><p>${esc(r.period)} · предпросмотр</p></div><button class="iconbtn" data-close>${ICON('close', 18)}</button></div>
      <div class="modal-body"><div class="tbl-wrap">${table}</div></div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Закрыть</button><button class="btn btn-primary" data-close>${ICON('download', 16)} Скачать XLSX</button></div>`, { wide: true });
  }

  /* ====================================================================
     SETTINGS / branding / integrations / roles
     ==================================================================== */
  const settings = () => ({
    title: 'Настройки', sub: 'Брендирование и интеграции',
    html: `<div class="page-head"><h1>Настройки платформы</h1><p>Брендирование в фирменных цветах, роли доступа и интеграции с корпоративными системами.</p></div>
      <div class="grid g2" style="align-items:start">
        <div class="card card-pad">
          <h3 style="font-size:16px" class="mb14">Брендирование</h3>
          <div class="field mb14"><label>Название компании</label><input class="input" value="${esc(D().company.name)}"></div>
          <div class="lbl">Фирменный цвет</div>
          <div class="wrap-row mb14" id="themes">
            ${[['#D2553B', 'Коралл'], ['#482973', 'Everyx'], ['#2E7B73', 'Бирюза'], ['#3F7349', 'Изумруд'], ['#A8182C', 'Рубин'], ['#1f4f4a', 'Сталь']]
              .map((c, i) => `<button class="chip" data-theme="${c[0]}" style="gap:8px"><span class="dot" style="width:14px;height:14px;background:${c[0]}"></span>${c[1]}</button>`).join('')}
          </div>
          <div class="lbl">Логотип</div>
          <div class="list-row"><div class="lr-ico">${ICON('building', 20)}</div><div style="flex:1"><b>logo.svg</b><div class="hint" style="margin-top:0">SVG или PNG, до 1 МБ</div></div><button class="btn btn-ghost btn-sm">${ICON('download', 14)} Загрузить</button></div>
          <div class="alert alert-success mt18">${ICON('check', 18)}<div>Брендирование в тонах компании и с её логотипом — бесплатно.</div></div>
        </div>
        <div>
          <div class="card card-pad mb18">
            <h3 style="font-size:16px" class="mb14">Роли доступа</h3>
            ${[['Сотрудник', 'ЛК, заказ льгот, списание баллов'], ['Администратор C&B', 'Просмотр заказов, статистики и отчётов'], ['Администратор IT', 'Управление правами доступа, SSO']]
              .map(r => `<div class="list-row mb10"><div class="lr-ico">${ICON('users', 18)}</div><div style="flex:1"><b>${esc(r[0])}</b><div class="hint" style="margin-top:0">${esc(r[1])}</div></div><span class="dot dot-ok"></span></div>`).join('')}
          </div>
          <div class="card card-pad">
            <h3 style="font-size:16px" class="mb14">Интеграции</h3>
            ${[['1С ЗУП', 'Справочник сотрудников, начисления', true], ['SAP HR', 'Переходный период', true], ['SSO / Active Directory', 'Единый вход по корп. почте', false], ['Страховые (бордеро)', 'Передача данных по ДМС', false]]
              .map(x => `<div class="row mb10" style="gap:12px"><div class="lr-ico" style="width:38px;height:38px">${ICON('refresh', 18)}</div><div style="flex:1"><b>${esc(x[0])}</b><div class="hint" style="margin-top:0">${esc(x[1])}</div></div><button class="switch ${x[2] ? 'on' : ''}" data-sw></button></div>`).join('')}
          </div>
        </div>
      </div>`,
    mount(root) {
      root.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => {
        window.setBrandColor(b.dataset.theme);
        root.querySelectorAll('[data-theme]').forEach(x => x.classList.remove('active')); b.classList.add('active');
        toast('Тема применена', 'Платформа перекрашена в фирменный цвет', 'success');
      }));
      root.querySelectorAll('[data-sw]').forEach(s => s.addEventListener('click', () => { s.classList.toggle('on'); toast('Интеграция', s.classList.contains('on') ? 'Включена' : 'Отключена', 'info'); }));
    },
  });

  window.VIEWS_ADM = { dashboard, employees, orders, accruals, catalog, reports, settings };
})();
