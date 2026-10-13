// Bereich "Steuern & Haushalte": Steuerlast typischer Haushalte, Tarifkurve und
// eine Reform-Werkbank, deren Aufkommenswirkung in den Bundeshaushalt übernommen
// werden kann.

const taxState = {
  p: { ...TAX_BASE },
  custom: { incomes: [65000, 30000], married: true, kids: 1, singleParent: false },
  curveMax: 300000,
  applied: null
};

const TAX_PRESETS = [
  { label: "Status quo 2026", apply: p => Object.assign(p, TAX_BASE) },
  { label: "Kalte Progression +3 %", apply: p => Object.assign(p, TAX_BASE, {
      freibetrag: Math.round(TAX_BASE.freibetrag * 1.03), knickAbstand: Math.round(TAX_BASE.knickAbstand * 1.03),
      spitzeAb: Math.round(TAX_BASE.spitzeAb * 1.03), reichAb: Math.round(TAX_BASE.reichAb * 1.03) }) },
  { label: "Grundfreibetrag 15.000 €", apply: p => Object.assign(p, TAX_BASE, { freibetrag: 15000 }) },
  { label: "Soli abschaffen", apply: p => Object.assign(p, TAX_BASE, { soliSatz: 0 }) },
  { label: "Spitzensatz 45 %, Reichensatz 48 %", apply: p => Object.assign(p, TAX_BASE, { spitzensatz: 45, reichsatz: 48 }) },
  { label: "Individualbesteuerung", apply: p => Object.assign(p, TAX_BASE, { splitting: false }) },
  { label: "Kindergeld 300 €", apply: p => Object.assign(p, TAX_BASE, { kindergeld: 300 }) }
];

const TAX_FIELDS = [
  { key: "freibetrag", label: "Grundfreibetrag", min: 8000, max: 20000, step: 100, fmt: v => fmtEUR(v) },
  { key: "eingangssatz", label: "Eingangssteuersatz", min: 0, max: 25, step: 0.5, fmt: v => fmtPct(v) },
  { key: "spitzensatz", label: "Spitzensteuersatz", min: 30, max: 60, step: 0.5, fmt: v => fmtPct(v) },
  { key: "spitzeAb", label: "Spitzensteuersatz ab (zvE)", min: 40000, max: 150000, step: 500, fmt: v => fmtEUR(v) },
  { key: "reichsatz", label: "Reichensteuersatz", min: 30, max: 75, step: 0.5, fmt: v => fmtPct(v) },
  { key: "reichAb", label: "Reichensteuer ab (zvE)", min: 100000, max: 1000000, step: 5000, fmt: v => fmtEUR(v) },
  { key: "soliSatz", label: "Solidaritätszuschlag", min: 0, max: 10, step: 0.1, fmt: v => fmtPct(v) },
  { key: "soliFreigrenze", label: "Soli-Freigrenze (ESt-Betrag)", min: 0, max: 60000, step: 50, fmt: v => fmtEUR(v) },
  { key: "kindergeld", label: "Kindergeld je Kind/Monat", min: 150, max: 400, step: 1, fmt: v => fmtEUR(v) }
];

// Tarifgrenzen konsistent halten (Spitzensatz nicht vor dem Knick usw.)
function effectiveTaxParams() {
  const p = { ...taxState.p };
  p.spitzeAb = Math.max(p.spitzeAb, p.freibetrag + p.knickAbstand + 1000);
  p.reichAb = Math.max(p.reichAb, p.spitzeAb);
  return p;
}

function isTaxReform() {
  return Object.keys(TAX_BASE).some(k => taxState.p[k] !== TAX_BASE[k]);
}

const NET_COLORS = { net: "var(--series-1)", sv: "var(--series-3)", est: "var(--series-2)", soli: "var(--series-7)" };

pageView({
  id: "steuern",
  title: "Steuern & Haushalte",
  icon: "⚖",
  teaser() {
    const r = computeHousehold(HOUSEHOLDS.find(x => x.id === "median"));
    return { value: fmtPct((r.sv + r.est + r.soli) / r.gross * 100, 0), label: "Abgaben zahlt ein Single mit Medianlohn" };
  },
  render: renderTaxPage
});

function renderTaxPage(el) {
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner wide" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Einkommensteuer, Soli & Sozialabgaben · Rechtsstand 2026",
      "Was Steuern für typische Haushalte bedeuten",
      "Vom Mindestlohn bis zum obersten Prozent: Brutto, Abgaben und Netto im Vergleich. Links lässt sich der Tarif umbauen – die Wirkung auf jeden Haushalt und auf den Bundeshaushalt erscheint sofort."));

    const layout = h("div", { class: "workbench" });
    const controls = h("aside", { class: "controls card" });
    const content = h("div", { class: "workbench-main" });
    layout.append(controls, content);
    wrap.appendChild(layout);

    const rerender = () => renderTaxContent(content, controls.querySelector(".revenue-box"));
    renderTaxControls(controls, rerender, () => renderTaxPage(el));
    rerender();
    wrap.appendChild(sourceNote("Vereinfachtes Modell für sozialversicherungspflichtig Beschäftigte: Tarif nach § 32a EStG 2026, Arbeitnehmerpauschbetrag, Vorsorgepauschale, Soli mit Milderungszone, Günstigerprüfung Kindergeld/Kinderfreibetrag, Entlastungsbetrag für Alleinerziehende, Sozialabgaben mit Beitragsbemessungsgrenzen 2026 und durchschnittlichem Zusatzbeitrag. Ohne Kirchensteuer, Kapitalerträge und Midijob-Regeln. Die Aufkommensschätzung überträgt die relative Änderung einer Modellverteilung von rd. 48,5 Mio. Steuerpflichtigen auf das Haushalts-Soll 2027 und berücksichtigt keine Verhaltensänderungen."));
}

function renderTaxControls(controls, rerender, fullRender) {
  controls.innerHTML = "";
  controls.appendChild(h("h2", { class: "card-title" }, "Reform-Werkbank"));

  const chips = h("div", { class: "chips" });
  TAX_PRESETS.forEach(preset => chips.appendChild(h("button", { type: "button", class: "chip",
    onclick: () => { preset.apply(taxState.p); taxState.applied = null; fullRender(); } }, preset.label)));
  controls.appendChild(chips);

  TAX_FIELDS.forEach(f => controls.appendChild(rangeField({
    label: f.label, min: f.min, max: f.max, step: f.step, value: taxState.p[f.key], base: TAX_BASE[f.key], format: f.fmt,
    onInput: v => { taxState.p[f.key] = v; taxState.applied = null; rerender(); }
  })));

  const select = h("select", {},
    h("option", { value: "1" }, "Ehegattensplitting (heute)"),
    h("option", { value: "0" }, "Individualbesteuerung, Grundfreibetrag übertragbar"));
  select.value = taxState.p.splitting ? "1" : "0";
  select.addEventListener("change", () => { taxState.p.splitting = select.value === "1"; taxState.applied = null; rerender(); });
  controls.appendChild(h("label", { class: "select-field" }, h("span", {}, "Besteuerung von Ehepaaren"), select));

  controls.appendChild(h("div", { class: "revenue-box" }));
}

function renderTaxContent(content, revenueBox) {
  content.innerHTML = "";
  const p = effectiveTaxParams();
  const reform = isTaxReform();

  renderRevenueBox(revenueBox, p, reform);

  // Haushalte
  const hhCard = card("Typische Haushalte", reform
    ? "Jahreswerte; die Plakette zeigt die Veränderung des Nettos durch Ihre Reform."
    : "Jahreswerte. Fahren Sie über die Balken für Details.");
  const grid = h("div", { class: "household-grid" });
  const results = HOUSEHOLDS.map(hh => {
    const now = computeHousehold(hh, TAX_BASE);
    const next = computeHousehold(hh, p);
    grid.appendChild(householdCard(hh, now, next, reform));
    return { hh, now, next };
  });
  hhCard.appendChild(grid);
  hhCard.appendChild(legend([
    { name: "Netto", color: NET_COLORS.net }, { name: "Sozialabgaben", color: NET_COLORS.sv },
    { name: "Einkommensteuer", color: NET_COLORS.est }, { name: "Soli", color: NET_COLORS.soli }]));
  content.appendChild(hhCard);

  // Reformwirkung
  if (reform) {
    const dCard = card("Wer gewinnt, wer verliert?", "Veränderung des verfügbaren Einkommens pro Jahr (inkl. Kindergeld)");
    const list = h("div");
    dCard.appendChild(list);
    content.appendChild(dCard);
    barList(list, results.map(r => {
      const d = r.next.net - r.now.net;
      return { label: `${r.hh.icon} ${r.hh.short}`, value: d, sub: `${fmtSigned(d / r.now.net * 100, v => fmtPct(v))} vom Netto`,
        color: d >= 0 ? "var(--series-1)" : "var(--series-8)" };
    }), { diverging: true, format: v => fmtSigned(Math.round(v), fmtEUR) });
  }

  // Custom household
  content.appendChild(customHouseholdCard(p, reform));

  // Tarifkurve
  const curveCard = card("Der Einkommensteuertarif", "Grenzsteuersatz: Anteil, der von jedem zusätzlichen Euro abgeht. Durchschnittssteuersatz: Anteil am gesamten zu versteuernden Einkommen (ohne Soli).");
  const range = h("div", { class: "segmented" }, [150000, 300000, 1000000].map(v =>
    h("button", { type: "button", class: taxState.curveMax === v ? "active" : "",
      onclick: () => { taxState.curveMax = v; renderTaxContent(content, revenueBox); } }, `bis ${fmtK(v)} €`)));
  curveCard.appendChild(range);
  const curve = h("div");
  curveCard.appendChild(curve);
  content.appendChild(curveCard);
  drawTariffChart(curve, p, reform);

  // Abgabenlast nach Haushaltstyp
  const loadCard = card("Abgabenlast nach Familienstand", "Steuern und Sozialabgaben abzüglich Kindergeld in % des Bruttolohns – bei gleichem Haushaltsbrutto und einem Verdiener");
  const loadChart = h("div");
  loadCard.appendChild(loadChart);
  content.appendChild(loadCard);
  drawLoadChart(loadChart, p, reform);
}

function householdCard(hh, now, next, reform) {
  const r = reform ? next : now;
  const delta = next.net - now.net;
  const abgaben = r.sv + r.est + r.soli;
  return h("article", { class: "household" },
    h("div", { class: "hh-head" },
      h("span", { class: "hh-icon", "aria-hidden": "true" }, hh.icon),
      h("div", {}, h("h3", {}, hh.name), h("p", {}, hh.note)),
      reform && Math.abs(delta) >= 1 ? h("span", { class: `delta-badge ${delta > 0 ? "delta-good" : "delta-bad"}`, title: "pro Monat" },
        `${fmtSigned(Math.round(delta / 12), fmtEUR)}/Mon.`) : null),
    h("div", { class: "hh-figures" },
      h("div", {}, h("span", {}, "Brutto"), h("strong", {}, fmtEUR(r.gross))),
      h("div", {}, h("span", {}, "Netto"), h("strong", {}, fmtEUR(r.net - r.kindergeld))),
      h("div", {}, h("span", {}, "Abgaben"), h("strong", {}, fmtPct(abgaben / r.gross * 100, 1)))),
    stackBar([
      { label: "Netto", value: r.net - r.kindergeld, color: NET_COLORS.net },
      { label: "Sozialabgaben", value: r.sv, color: NET_COLORS.sv },
      { label: "Einkommensteuer", value: r.est, color: NET_COLORS.est },
      { label: "Solidaritätszuschlag", value: r.soli, color: NET_COLORS.soli }], r.gross),
    h("p", { class: "hh-foot" },
      r.kindergeld ? `+ ${fmtEUR(r.kindergeld)} Kindergeld · ` : (r.kinderfreibetragGenutzt ? "Kinderfreibetrag günstiger als Kindergeld · " : ""),
      `${fmtEUR((r.net) / 12)} verfügbar pro Monat`));
}

function customHouseholdCard(p, reform) {
  const c = taxState.custom;
  const cardEl = card("Ihr eigener Haushalt", "Bruttojahreslöhne eintragen – gerechnet wird wie bei den Beispielen oben.");
  const result = h("div", { class: "custom-result" });

  const num = (label, value, onChange, attrs = {}) => {
    const input = h("input", { type: "number", min: 0, step: 1000, value, ...attrs });
    input.addEventListener("input", () => { onChange(Number(input.value) || 0); update(); });
    return h("label", { class: "num-field" }, h("span", {}, label), input);
  };
  const check = (label, value, onChange) => {
    const input = h("input", { type: "checkbox" });
    input.checked = value;
    input.addEventListener("change", () => { onChange(input.checked); update(); });
    return h("label", { class: "check-field" }, input, label);
  };

  cardEl.appendChild(h("div", { class: "custom-form" },
    num("Brutto Person 1 (€/Jahr)", c.incomes[0], v => { c.incomes[0] = v; }),
    num("Brutto Person 2 (€/Jahr)", c.incomes[1], v => { c.incomes[1] = v; }),
    num("Kinder", c.kids, v => { c.kids = Math.min(8, v); }, { step: 1, max: 8 }),
    check("verheiratet", c.married, v => { c.married = v; }),
    check("alleinerziehend", c.singleParent, v => { c.singleParent = v; })));
  cardEl.appendChild(result);

  function update() {
    const hh = { ...c, incomes: c.married || c.incomes[1] > 0 ? [c.incomes[0], c.incomes[1]] : [c.incomes[0]],
      singleParent: c.singleParent && !c.married };
    const now = computeHousehold(hh, TAX_BASE);
    const next = computeHousehold(hh, p);
    const r = reform ? next : now;
    result.innerHTML = "";
    if (r.gross <= 0) { result.textContent = "Bitte ein Bruttoeinkommen eintragen."; return; }
    const d = next.net - now.net;
    result.append(
      h("div", { class: "stat-row compact" },
        statTile("Sozialabgaben", fmtEUR(r.sv), fmtPct(r.sv / r.gross * 100)),
        statTile("Einkommensteuer + Soli", fmtEUR(r.est + r.soli), fmtPct((r.est + r.soli) / r.gross * 100)),
        statTile("Verfügbar", fmtEUR(r.net), `${fmtEUR(r.net / 12)} pro Monat${r.kindergeld ? " inkl. Kindergeld" : ""}`),
        reform ? statTile("Durch Ihre Reform", fmtSigned(Math.round(d), fmtEUR), `${fmtSigned(Math.round(d / 12), fmtEUR)} pro Monat`,
          { tone: d >= 0 ? "good" : "warn" }) : null),
      stackBar([
        { label: "Netto", value: r.net - r.kindergeld, color: NET_COLORS.net },
        { label: "Sozialabgaben", value: r.sv, color: NET_COLORS.sv },
        { label: "Einkommensteuer", value: r.est, color: NET_COLORS.est },
        { label: "Solidaritätszuschlag", value: r.soli, color: NET_COLORS.soli }], r.gross));
    if (Math.min(...hh.incomes.filter(x => x > 0)) < 24000) {
      result.appendChild(h("p", { class: "hint" }, "Hinweis: Unter rd. 24.000 € brutto gelten Midijob-Regeln mit geringeren Sozialabgaben – hier nicht abgebildet."));
    }
  }
  update();
  return cardEl;
}

function drawTariffChart(container, p, reform) {
  const max = taxState.curveMax;
  const step = max / 300;
  const pts = (fn) => { const out = []; for (let z = 0; z <= max; z += step) out.push([z, fn(z)]); return out; };
  const avg = (z, q) => z > 0 ? incomeTax(z, q) / z * 100 : 0;
  const series = [
    { name: "Grenzsteuersatz", color: "var(--series-1)", points: pts(z => marginalRate(z, TAX_BASE)) },
    { name: "Durchschnittssteuersatz", color: "var(--series-2)", points: pts(z => avg(z, TAX_BASE)) }
  ];
  if (reform) series.push(
    { name: "Grenzsteuersatz (Reform)", color: "var(--series-1)", dash: true, points: pts(z => marginalRate(z, p)) },
    { name: "Durchschnitt (Reform)", color: "var(--series-2)", dash: true, points: pts(z => avg(z, p)) });

  const markers = HOUSEHOLDS.filter(x => x.incomes.length === 1 && !x.singleParent).map(x => {
    const r = computeHousehold(x, reform ? p : TAX_BASE);
    return { x: r.zve, y: avg(r.zve, reform ? p : TAX_BASE), label: x.short, color: "var(--ink)" };
  }).filter(mk => mk.x <= max);

  lineChart(container, {
    series, markers, height: 300, xMin: 0, xMax: max, yMin: 0, yMax: Math.max(50, p.reichsatz + 5, p.spitzensatz + 5),
    xFormat: v => `${fmtK(v)}`, yFormat: v => `${v} %`,
    label: "Grenz- und Durchschnittssteuersatz nach zu versteuerndem Einkommen",
    tooltip: z => {
      z = Math.round(z / 100) * 100;
      let html = `<strong>zvE ${fmtEUR(z)}</strong><br>Steuer: ${fmtEUR(incomeTax(z))} · Grenz ${fmtPct(marginalRate(z))} · Ø ${fmtPct(avg(z, TAX_BASE))}`;
      if (reform) html += `<br>Reform: ${fmtEUR(incomeTax(z, p))} · Grenz ${fmtPct(marginalRate(z, p))} · Ø ${fmtPct(avg(z, p))}`;
      return html;
    }
  });
}

function drawLoadChart(container, p, reform) {
  const types = [
    { name: "Single", color: "var(--series-1)", make: g => ({ incomes: [g], married: false, kids: 0 }) },
    { name: "Ehepaar, ein Verdiener", color: "var(--series-2)", make: g => ({ incomes: [g, 0], married: true, kids: 0 }) },
    { name: "Ehepaar, ein Verdiener, 2 Kinder", color: "var(--series-3)", make: g => ({ incomes: [g, 0], married: true, kids: 2 }) }
  ];
  const quota = (hh, q) => { const r = computeHousehold(hh, q); return (r.gross - r.net) / r.gross * 100; };
  const grosses = []; for (let g = 25000; g <= 250000; g += 2500) grosses.push(g);
  const series = types.map(t => ({ name: t.name, color: t.color, points: grosses.map(g => [g, quota(t.make(g), TAX_BASE)]) }));
  if (reform) types.forEach(t => series.push({ name: `${t.name} (Reform)`, color: t.color, dash: true, noLegend: true,
    points: grosses.map(g => [g, quota(t.make(g), p)]) }));

  lineChart(container, {
    series, height: 280, xMin: 25000, xMax: 250000, yMin: Math.min(0, ...series.flatMap(s => s.points.map(pt => pt[1]))), yMax: 50,
    xFormat: v => fmtK(v), yFormat: v => `${v} %`,
    label: "Abgabenquote nach Bruttoeinkommen und Familienstand",
    xSnap: x => Math.round(x / 2500) * 2500,
    tooltip: g => `<strong>Brutto ${fmtEUR(g)}</strong><br>` + types.map(t => {
      const a = quota(t.make(g), TAX_BASE);
      return `${t.name}: ${fmtPct(a)}${reform ? ` → ${fmtPct(quota(t.make(g), p))}` : ""}`;
    }).join("<br>")
  });
  if (reform) container.appendChild(h("p", { class: "hint" }, "Gestrichelt: mit Ihrer Reform."));
}

function renderRevenueBox(box, p, reform) {
  box.innerHTML = "";
  box.appendChild(h("h3", {}, "Wirkung auf den Bundeshaushalt"));
  if (!reform) {
    box.appendChild(h("p", { class: "hint" }, "Regler bewegen oder eine Vorlage wählen, um die Aufkommenswirkung zu sehen."));
    return;
  }
  const r = revenueEffect(p);
  const totalBund = r.estBund + r.soliBund + r.kindergeldBund;
  const row = (label, v, strong) => h("div", { class: `rev-row${strong ? " strong" : ""}` },
    h("span", {}, label), h("span", { class: v >= 0 ? "pos" : "neg" }, fmtSigned(v, x => fmtBn(x))));
  box.append(
    row("Einkommensteuer, alle Ebenen", r.estGesamt),
    row("davon Bund (42,5 %)", r.estBund),
    row("Solidaritätszuschlag", r.soliBund),
    ...(Math.abs(r.kindergeldBund) > 0.001 ? [row("Kindergeld (Bundesanteil)", r.kindergeldBund)] : []),
    row("Saldo Bund pro Jahr", totalBund, true));
  if (!r.splittingModelliert) box.appendChild(h("p", { class: "hint" }, "Die Abschaffung des Splittings wirkt auf Ehepaare oben, ist in der Aufkommensschätzung aber nicht enthalten (keine Paardaten in der Modellverteilung)."));

  const applyBtn = h("button", { type: "button", class: "primary-btn" }, "In den Bundeshaushalt übernehmen");
  applyBtn.addEventListener("click", () => {
    setBundSlider("fm", /^Einkommensteuer$/, baselineBundSlider("fm", /^Einkommensteuer$/) + r.estBund + r.kindergeldBund);
    setBundSlider("fm", /^Solidarit/, baselineBundSlider("fm", /^Solidarit/) + r.soliBund);
    taxState.applied = true;
    renderRevenueBox(box, p, reform);
  });
  box.appendChild(applyBtn);
  if (taxState.applied) box.appendChild(h("p", { class: "hint ok" }, "Übernommen: Einkommensteuer und Soli im Bund angepasst. ",
    h("a", { href: "#/haushalt/bund:fm" }, "Im Haushalt ansehen →")));
}
