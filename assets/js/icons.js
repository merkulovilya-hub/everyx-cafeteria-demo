/* Everyx Кафетерий льгот — inline SVG icon set (stroke-based, currentColor).
   Usage: ICON('health', 24)  ->  '<svg ...>...</svg>'                       */
(function () {
  const P = {
    /* benefit sections */
    health:    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.5 12h4l1.5-3 3 6 1.5-3h4"/>',
    sport:     '<path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
    education: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/><path d="M22 10v6"/>',
    travel:    '<path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.4.85l3.7 3.7-2 2-1.7-.4a.5.5 0 0 0-.45.84l2.4 2.4 2.4 2.4a.5.5 0 0 0 .84-.45l-.4-1.7 2-2 3.7 3.7a.5.5 0 0 0 .85-.4Z"/>',
    transport: '<path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M4 18V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10"/><path d="M5 18h14"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    support:   '<circle cx="12" cy="8" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M19 5a3 3 0 0 1 0 4"/><path d="M5 5a3 3 0 0 0 0 4"/>',
    family:    '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M15.5 20a4 4 0 0 1 6.5-3.1"/>',
    insurance: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    /* extra sections */
    merch:     '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    discount:  '<circle cx="9" cy="9" r="1.6"/><circle cx="15" cy="15" r="1.6"/><path d="M7 17 17 7"/><rect x="3" y="3" width="18" height="18" rx="4"/>',
    charity:   '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    base:      '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    wellbeing: '<path d="M12 3a4 4 0 0 0-4 4c0 1.5.8 2.5 1.5 3.3C10.5 11.5 12 13 12 13s1.5-1.5 2.5-2.7C15.2 9.5 16 8.5 16 7a4 4 0 0 0-4-4Z"/><path d="M5 21c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"/>',
    compensation: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/><path d="M12 3v3"/><path d="M9 9l3 3 3-3"/>',
    /* ui / nav */
    home:      '<path d="m3 10 9-7 9 7"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M9 21v-6h6v6"/>',
    grid:      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    wallet:    '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><circle cx="16.5" cy="13" r="1.3"/>',
    card:      '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    qr:        '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3"/><path d="M21 14v.01"/><path d="M14 21h.01"/><path d="M17 21h4v-4"/>',
    history:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
    gift:      '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8S10 2 7 4s5 4 5 4Z"/><path d="M12 8s2-6 5-4-5 4-5 4Z"/>',
    question:  '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1c0 2-3 2.5-3 4"/><path d="M12 17h.01"/>',
    chart:     '<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>',
    users:     '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.2"/><path d="M22 20a6 6 0 0 0-5-5.9"/>',
    box:       '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    coins:     '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.66 2.7 3 6 3s6-1.34 6-3"/><path d="M3 12v5c0 1.66 2.7 3 6 3 1 0 1.95-.12 2.8-.34"/><circle cx="17" cy="16" r="4"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 14.6H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 2.6V3a2 2 0 0 1 4 0v.09c.6.15 1.13.5 1.51 1a1.65 1.65 0 0 0 1.82.33h.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21.4 9H21a2 2 0 0 1 0 4Z"/>',
    bell:      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
    search:    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    filter:    '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
    check:     '<path d="m4 12 5 5L20 6"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    minus:     '<path d="M5 12h14"/>',
    close:     '<path d="M18 6 6 18M6 6l12 12"/>',
    chevR:     '<path d="m9 6 6 6-6 6"/>',
    chevD:     '<path d="m6 9 6 6 6-6"/>',
    chevL:     '<path d="m15 6-6 6 6 6"/>',
    arrowR:    '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp:   '<path d="M12 19V5M6 11l6-6 6 6"/>',
    arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    star:      '<path d="M12 2.5 15 9l7 .8-5.2 4.7L18.5 22 12 18.3 5.5 22 7.2 14.5 2 9.8 9 9Z"/>',
    heart:     '<path d="M19 5.6a5 5 0 0 0-7 .2l-.0.0-.0-.0a5 5 0 0 0-7 7l7 7 7-7a5 5 0 0 0 0-7Z"/>',
    download:  '<path d="M12 3v12M7 11l5 5 5-5"/><path d="M5 21h14"/>',
    doc:       '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/>',
    shieldCheck:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    bolt:      '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin:       '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    sun:       '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
    building:  '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/>',
    sparkles:  '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>',
    percent:   '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone:     '<path d="M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    eye:       '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    edit:      '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    play:      '<path d="M6 4l14 8-14 8V4Z"/>',
    info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    lock:      '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    refresh:   '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/>',
  };
  const COLOR_ICON = { /* names rendered as 2-tone filled (none here, all stroke) */ };
  window.ICON = function (name, size, extraClass) {
    const body = P[name];
    if (!body) return '';
    const s = size || 22;
    const cls = 'ico' + (extraClass ? ' ' + extraClass : '');
    return '<svg class="' + cls + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + '</svg>';
  };

  /* product illustrations for merch (stroke, currentColor, viewBox 48) */
  var ART = {
    tshirt: '<path d="M19 9 11 12 7 20 12 24 15 22V41H33V22l3 2 5-4-4-8-8-3"/><path d="M19 9c2 4 8 4 10 0"/>',
    hoodie: '<path d="M19 9 11 12 7 20 12 24 15 22V41H33V22l3 2 5-4-4-8-8-3"/><path d="M19 9c0-5 10-5 10 0"/><path d="M19 9c2 4 8 4 10 0"/><path d="M22 11v5M26 11v5"/><path d="M19 30h10"/>',
    mug: '<path d="M15 15h18l-2 26a1 1 0 0 1-1 1H18a1 1 0 0 1-1-1Z"/><path d="M14 11h20v4H14z"/><path d="M21 4c2 2-2 3 0 6M27 4c2 2-2 3 0 6"/>',
    backpack: '<path d="M13 18a8 8 0 0 1 8-8h6a8 8 0 0 1 8 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3Z"/><path d="M20 11a5 5 0 0 1 8 0"/><path d="M14 22h20"/><path d="M18 28h12v12"/>',
    charger: '<rect x="18" y="7" width="12" height="23" rx="2"/><path d="M22 27h4"/><path d="M11 39a13 4 0 0 0 26 0 13 4 0 0 0-26 0Z"/><path d="M24 30v5"/>',
    candle: '<path d="M16 22h16v17a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2Z"/><path d="M16 22c4-3 12-3 16 0"/><path d="M24 22v-4"/><path d="M24 8c3 4 3 7 0 9-3-2-3-5 0-9Z"/>',
    umbrella: '<path d="M6 24a18 13 0 0 1 36 0Z"/><path d="M24 5v2"/><path d="M24 7v31a4 4 0 0 1-8 0"/>',
    notebook: '<rect x="13" y="8" width="20" height="32" rx="2"/><path d="M18 8v32"/><path d="M28 8v32"/><path d="M21 17h3M21 22h3"/>',
    bottle: '<path d="M20 8h8v4l2 4v23a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V16l2-4Z"/><path d="M21 5h6v3h-6z"/><path d="M18 22h12"/>',
    powerbank: '<rect x="15" y="9" width="18" height="30" rx="3"/><path d="M20 15h8M20 20h8M20 25h4"/><path d="M22 34h4"/>',
  };
  window.MERCH = function (name, size) {
    var body = ART[name]; if (!body) return '';
    var s = size || 72;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 48 48" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };
})();
