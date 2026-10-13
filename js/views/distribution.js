// Bereich "Verteilung": Einkommen und Vermögen heute, ihre Entwicklung, eigene
// Position und ein Vermögensteuer-Rechner, der das Detailmodell des Haushalts nutzt.

const distState = { netMonth: 3500, adults: 2, kidsYoung: 1, kidsOld: 0, wealth: 80000 };
const wealthTaxState = { variant: "breit", freibetrag: 2000000, satz: 1, applied: false };

const DIST_SECTIONS = [
  { id: "heute", label: "Heute" },
  { id: "entwicklung", label: "Entwicklung" },
  { id: "vermoegen", label: "Vermögen" },
  { id: "position", label: "Wo stehe ich?" },
  { id: "vermoegensteuer", label: "Vermögensteuer" }
];

pageView({
  id: "verteilung",
  title: "Verteilung",
  icon: "◔",
  teaser() {
    return { value: fmtPct(REF.vermoegen[9], 0), label: "des Nettovermögens besitzen die reichsten 10 % der Haushalte" };
  },
  render(el) {
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Einkommen & Vermögen", "Wie ungleich ist Deutschland?",
      "Markteinkommen sind deutlich ungleicher verteilt als das, was nach Steuern, Abgaben und Transfers bleibt. Beim Vermögen ist die Konzentration noch viel stärker – und beides hat sich über die Jahre verschoben."));

    const sections = {};
    const subnav = h("nav", { class: "subnav", "aria-label": "Abschnitte" }, DIST_SECTIONS.map(s =>
      h("button", { type: "button", class: "chip", onclick: () => sections[s.id].scrollIntoView({ behavior: "smooth", block: "start" }) }, s.label)));
    wrap.appendChild(subnav);
    const section = (id, title) => {
      const sec = h("section", { class: "page-section", id: `dist-${id}` }, h("h2", { class: "section-title" }, title));
      sections[id] = sec;
      wrap.appendChild(sec);
      return sec;
    };

    renderDistToday(section("heute", "Heute"));
    renderDistTrends(section("entwicklung", "Entwicklung über die Zeit"));
    renderDistWealth(section("vermoegen", "Vermögen"));
    renderDistPosition(section("position", "Wo stehe ich – und wer zahlt?"));
    renderWealthTax(section("vermoegensteuer", "Was brächte eine Vermögensteuer?"));

    wrap.appendChild(sourceNote(`Quellen (gerundete Größenordnungen, vor Veröffentlichung prüfen): ${REF.quellenVerteilung}; SOEP/DIW (Gini-Zeitreihen); Destatis (Mikrozensus, Reallohnindex, Verbraucherpreise); World Inequality Database (Einkommensanteile vor Steuern); Eurostat EU-SILC (Wohneigentum); BMF, Datensammlung zur Steuerpolitik. Gini-Werte für „Heute“ aus Zehntel-Anteilen berechnet und daher etwas niedriger als in Studien mit Mikrodaten. Vermögensbefragungen erfassen Hochvermögende unvollständig; Schätzungen mit Reichenlisten sehen das oberste 1 % bei rd. 30–35 %.`));
  }
});

// ── Heute ──────────────────────────────────────

function renderDistToday(sec) {
  const lMarkt = lorenzFromDeciles(REF.einkommenMarkt);
  const lVerf = lorenzFromDeciles(REF.einkommenVerfuegbar);
  const lVerm = lorenzFromDeciles(REF.vermoegen);
  const bottom50 = REF.vermoegen.slice(0, 5).reduce((a, b) => a + b, 0);
  const gini = v => v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  sec.appendChild(h("div", { class: "stat-row" },
    statTile("Gini Markteinkommen", gini(lMarkt.gini), "vor Steuern und Transfers"),
    statTile("Gini verfügbares Einkommen", gini(lVerf.gini), `Umverteilung senkt die Ungleichheit um ${fmtPct((1 - lVerf.gini / lMarkt.gini) * 100, 0)}`),
    statTile("Gini Nettovermögen", gini(lVerm.gini), "0 = alle gleich, 1 = einer hat alles"),
    statTile("Untere Hälfte", fmtPct(bottom50, 0), "des Nettovermögens")));

  const lc = card("Lorenzkurven", "Welchen Anteil am Gesamten besitzen die unteren x % der Haushalte? Je weiter die Kurve unter der Diagonale liegt, desto ungleicher.");
  const lChart = h("div");
  lc.appendChild(lChart);
  sec.appendChild(lc);
  const series = [
    { name: "Gleichverteilung", color: "var(--axis)", dash: true, points: [[0, 0], [100, 100]], noHover: true, width: 1.5 },
    { name: "Markteinkommen", color: "var(--series-2)", points: lMarkt.points },
    { name: "Verfügbares Einkommen", color: "var(--series-1)", points: lVerf.points },
    { name: "Nettovermögen", color: "var(--series-3)", points: lVerm.points }
  ];
  lineChart(lChart, {
    series, height: 320, xMin: 0, xMax: 100, yMin: Math.min(0, ...lVerm.points.map(p => p[1])), yMax: 100,
    xTicks: [0, 20, 40, 60, 80, 100], xFormat: v => `${v} %`, yFormat: v => `${v} %`,
    label: "Lorenzkurven für Einkommen und Vermögen",
    xSnap: x => Math.round(x / 10) * 10,
    tooltip: x => `<strong>Untere ${x} % der Haushalte</strong><br>` + series.slice(1).map(s =>
      `${s.name}: ${fmtPct(valueAt(s.points, x), 1)}`).join("<br>")
  });

  const dc = card("Anteile nach Zehnteln", "Jedes Zehntel umfasst 10 % der Haushalte, sortiert vom ärmsten zum reichsten");
  const dChart = h("div");
  dc.appendChild(dChart);
  sec.appendChild(dc);
  columnChart(dChart, ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10."], [
    { name: "Verfügbares Einkommen", color: "var(--series-1)", values: REF.einkommenVerfuegbar },
    { name: "Nettovermögen", color: "var(--series-3)", values: REF.vermoegen }
  ], { yFormat: v => `${v} %`, valueFormat: v => fmtPct(v), xTitle: d => `${d} Zehntel` });
}

// ── Entwicklung ────────────────────────────────

function renderDistTrends(sec) {
  // Gini Markt vs. verfügbar, Fläche dazwischen = Wirkung der Umverteilung
  const gc = card("Ungleichheit vor und nach Umverteilung",
    "Gini-Koeffizient der Haushaltseinkommen seit der Wiedervereinigung. Die Fläche zwischen den Linien zeigt, wie stark Steuern, Abgaben und Transfers ausgleichen.");
  const gChart = h("div");
  gc.appendChild(gChart);
  sec.appendChild(gc);
  const gSeries = [
    { name: "Umverteilung durch Steuern und Transfers", color: "var(--series-1)", area: true, areaOpacity: 0.12,
      points: REF.giniMarkt, areaBase: REF.giniVerfuegbar, noHover: true },
    { name: "Markteinkommen", color: "var(--series-2)", points: REF.giniMarkt },
    { name: "Verfügbares Einkommen", color: "var(--series-1)", points: REF.giniVerfuegbar }
  ];
  lineChart(gChart, {
    series: gSeries, height: 280, xMin: 1991, xMax: 2021, yMin: 0.2, yMax: 0.55,
    xFormat: String, yFormat: v => v.toLocaleString("de-DE", { minimumFractionDigits: 2 }),
    bands: [{ from: 2003, to: 2005, label: "Hartz-Reformen" }],
    xSnap: x => Math.round(x), label: "Gini-Koeffizient von Markt- und verfügbarem Einkommen 1991 bis 2021",
    tooltip: x => {
      const m = valueAt(REF.giniMarkt, x), v = valueAt(REF.giniVerfuegbar, x);
      return `<strong>${x}</strong><br>Markteinkommen: ${m.toFixed(3).replace(".", ",")}<br>Verfügbar: ${v.toFixed(3).replace(".", ",")}<br>Umverteilung senkt um ${fmtPct((1 - v / m) * 100, 0)}`;
    }
  });
  gc.appendChild(h("p", { class: "hint" }, "Bis Mitte der 2000er stieg die Ungleichheit deutlich – getrieben vor allem durch auseinanderlaufende Markteinkommen. Seitdem ist sie beim verfügbaren Einkommen weitgehend stabil auf höherem Niveau."));

  const grid = h("div", { class: "grid-2" });
  sec.appendChild(grid);

  // Einkommensanteile (WID)
  const tc = card("Wer bekommt welchen Anteil?", "Anteil am gesamten Einkommen vor Steuern (WID)");
  const tChart = h("div");
  tc.appendChild(tChart);
  grid.appendChild(tc);
  const tSeries = [
    { name: "Obere 10 %", color: "var(--series-2)", points: REF.top10Einkommen },
    { name: "Untere 50 %", color: "var(--series-1)", points: REF.bottom50Einkommen },
    { name: "Oberstes 1 %", color: "var(--series-7)", points: REF.top1Einkommen }
  ];
  lineChart(tChart, {
    series: tSeries, height: 240, xMin: 1980, xMax: 2022, yMin: 0, yMax: 45, xFormat: String, yFormat: v => `${v} %`,
    xSnap: x => Math.round(x), label: "Einkommensanteile der oberen 10 %, unteren 50 % und des obersten 1 % seit 1980",
    tooltip: x => `<strong>${x}</strong><br>` + tSeries.map(s => `${s.name}: ${fmtPct(valueAt(s.points, x), 1)}`).join("<br>")
  });
  const t10 = REF.top10Einkommen, b50 = REF.bottom50Einkommen;
  tc.appendChild(h("p", { class: "hint" },
    `Seit 1980: obere 10 % ${fmtSigned(t10[t10.length - 1][1] - t10[0][1], v => `${v.toLocaleString("de-DE")} Prozentpunkte`)}, untere Hälfte ${fmtSigned(b50[b50.length - 1][1] - b50[0][1], v => `${v.toLocaleString("de-DE")} Prozentpunkte`)}`));

  // Armutsgefährdung
  const ac = card("Armutsgefährdungsquote", "Anteil der Bevölkerung mit weniger als 60 % des mittleren Einkommens (Mikrozensus)");
  const aChart = h("div");
  ac.appendChild(aChart);
  grid.appendChild(ac);
  const aSeries = [
    { name: "bis 2019", color: "var(--series-8)", points: REF.armutAlt },
    { name: "ab 2020, neues Verfahren", color: "var(--series-8)", dash: true, points: REF.armutNeu }
  ];
  lineChart(aChart, {
    series: aSeries, height: 240, xMin: 2005, xMax: 2023, yMin: 10, yMax: 20, xFormat: String, yFormat: v => `${v} %`,
    bands: [{ from: 2019, to: 2020, label: "Bruch" }],
    xSnap: x => Math.round(x), label: "Armutsgefährdungsquote 2005 bis 2023",
    tooltip: x => {
      const v = valueAt(REF.armutAlt, x) ?? valueAt(REF.armutNeu, x);
      return v == null ? `<strong>${x}</strong>` : `<strong>${x}</strong><br>${fmtPct(v, 1)} · rd. ${fmtK(Math.round(v / 100 * REF.einwohner / 1e5) * 1e5)} Menschen`;
    }
  });
  ac.appendChild(h("p", { class: "hint" }, "2020 wurde der Mikrozensus umgestellt – die Werte davor und danach sind nur eingeschränkt vergleichbar."));

  // Reallöhne
  const rc = card("Löhne, Preise und Kaufkraft seit 2008", "Index 2008 = 100. Reallöhne zeigen, was vom Lohnplus nach Inflation übrig bleibt.");
  const rChart = h("div");
  rc.appendChild(rChart);
  sec.appendChild(rc);
  const real = [[2008, 100]], cpi = [[2008, 100]], nominal = [[2008, 100]];
  let r = 100, p = 100;
  for (let y = 2009; y <= 2025; y++) {
    r *= 1 + REF.reallohnAenderung[y] / 100;
    p *= 1 + REF.inflation[y] / 100;
    real.push([y, r]); cpi.push([y, p]); nominal.push([y, r * p / 100]);
  }
  const rSeries = [
    { name: "Nominallöhne", color: "var(--series-1)", points: nominal },
    { name: "Verbraucherpreise", color: "var(--series-2)", points: cpi },
    { name: "Reallöhne", color: "var(--series-3)", points: real, width: 3 }
  ];
  lineChart(rChart, {
    series: rSeries, height: 280, xMin: 2008, xMax: 2025, yMin: 90, xFormat: String,
    bands: [{ from: 2021, to: 2023, label: "Inflationsschub" }],
    xSnap: x => Math.round(x), label: "Index von Nominallöhnen, Verbraucherpreisen und Reallöhnen seit 2008",
    tooltip: x => `<strong>${x}</strong><br>` + rSeries.map(s => `${s.name}: ${valueAt(s.points, x).toFixed(1).replace(".", ",")}`).join("<br>") +
      (REF.reallohnAenderung[x] != null ? `<br>Reallohn ggü. Vorjahr: ${fmtSigned(REF.reallohnAenderung[x], v => fmtPct(v))}` : "")
  });
  const peak = real.filter(pt => pt[0] <= 2021).reduce((a, b) => b[1] > a[1] ? b : a);
  const lowest = real.filter(pt => pt[0] >= 2021).reduce((a, b) => b[1] < a[1] ? b : a);
  rc.appendChild(h("p", { class: "hint" },
    `Die Inflation 2022/23 hat die Reallöhne auf das Niveau von ${real.find(pt => pt[1] >= lowest[1])[0]} zurückgeworfen (${fmtSigned((lowest[1] / peak[1] - 1) * 100, v => fmtPct(v))} ggü. ${peak[0]}). Erst 2024 begann die Aufholjagd.`));
}

// ── Vermögen ───────────────────────────────────

function renderDistWealth(sec) {
  const w = REF.phfWellen, first = w[0], last = w[w.length - 1];
  sec.appendChild(h("div", { class: "stat-row" },
    statTile("Medianvermögen 2021", fmtEUR(last.median), `${fmtSigned((last.median / first.median - 1) * 100, v => fmtPct(v, 0))} seit ${first.label}`),
    statTile("Durchschnittsvermögen 2021", fmtEUR(last.mittel), `${fmtSigned((last.mittel / first.mittel - 1) * 100, v => fmtPct(v, 0))} seit ${first.label}`),
    statTile("Durchschnitt ÷ Median", `${(last.mittel / last.median).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`, "je größer, desto stärker die Konzentration an der Spitze"),
    statTile("Anteil der oberen 10 %", fmtPct(last.top10, 0), `${first.label}: ${fmtPct(first.top10, 0)}`)));

  const pc = card("Vermögen der Haushalte, 2010 bis 2021", "Nettovermögen laut Bundesbank-Befragung (PHF), nominal. Der Median ist der „typische“ Haushalt, der Durchschnitt wird von sehr großen Vermögen nach oben gezogen.");
  const pChart = h("div");
  pc.appendChild(pChart);
  sec.appendChild(pc);
  columnChart(pChart, w.map(x => x.label), [
    { name: "Median", color: "var(--series-1)", values: w.map(x => x.median / 1000) },
    { name: "Durchschnitt", color: "var(--series-3)", values: w.map(x => x.mittel / 1000) }
  ], { yFormat: v => `${v} Tsd.`, valueFormat: v => fmtEUR(v * 1000), xTitle: d => `Befragungswelle ${d}`, height: 240 });
  pc.appendChild(h("p", { class: "hint" }, "Der Sprung 2021 geht vor allem auf gestiegene Immobilienpreise zurück: Wer Wohneigentum hatte, wurde reicher – Mieterhaushalte profitierten kaum. Inflationsbereinigt fällt der Zuwachs deutlich kleiner aus."));

  const grid = h("div", { class: "grid-2" });
  sec.appendChild(grid);

  const cc = card("Woraus besteht Vermögen?", "Bruttovermögen nach Art, je Vermögensgruppe (Näherung)");
  const parts = [
    { key: "immobilien", label: "Immobilien", color: "var(--series-1)" },
    { key: "finanz", label: "Finanzvermögen", color: "var(--series-3)" },
    { key: "betrieb", label: "Betriebsvermögen", color: "var(--series-2)" },
    { key: "sonstiges", label: "Fahrzeuge u. Sonstiges", color: "var(--series-muted)" }
  ];
  REF.vermoegenArten.forEach(g => {
    cc.appendChild(h("div", { class: "stack-row" }, h("span", { class: "stack-row-label" }, g.gruppe),
      stackBar(parts.map(p => ({ label: p.label, value: g[p.key], color: p.color })), 100, { pctOnly: true })));
  });
  cc.appendChild(legend(parts.map(p => ({ name: p.label, color: p.color }))));
  cc.appendChild(h("p", { class: "hint" }, "Die untere Hälfte besitzt vor allem Konten und Autos, die Mitte das eigene Zuhause, die Spitze zusätzlich Unternehmen – deshalb ist die Bewertung von Betriebsvermögen bei Erbschaft- und Vermögensteuer so umstritten."));
  grid.appendChild(cc);

  const oc = card("Mieterland Deutschland", "Anteil der Bevölkerung, der im eigenen Wohneigentum lebt");
  const oList = h("div");
  oc.appendChild(oList);
  grid.appendChild(oc);
  barList(oList, REF.wohneigentum.map(x => ({ label: x.land, value: x.wert,
    color: x.land === "Deutschland" ? "var(--series-2)" : x.land === "EU-Durchschnitt" ? "var(--ink-2)" : "var(--series-muted)" })),
    { max: 100, format: v => `${v} %` });
  oc.appendChild(h("p", { class: "hint" }, "Weil Wohneigentum der wichtigste Vermögensbaustein der Mitte ist, erklärt die niedrige Eigentumsquote einen Gutteil des im EU-Vergleich niedrigen Medianvermögens."));
}

// ── Eigene Position und Steueranteile ──────────

function renderDistPosition(sec) {
  const pc = card("Wo stehe ich?", "Nettoeinkommen des Haushalts wird mit der neuen OECD-Skala auf eine Person umgerechnet (Äquivalenzeinkommen), damit Haushalte unterschiedlicher Größe vergleichbar sind.");
  const pForm = h("div", { class: "custom-form" });
  const pOut = h("div", { class: "position-out" });
  pc.append(pForm, pOut);
  sec.appendChild(pc);
  const num = (label, key, attrs) => {
    const input = h("input", { type: "number", value: distState[key], ...attrs });
    input.addEventListener("input", () => { distState[key] = Number(input.value) || 0; drawPosition(); });
    return h("label", { class: "num-field" }, h("span", {}, label), input);
  };
  pForm.append(
    num("Haushaltsnetto (€/Monat)", "netMonth", { min: 0, step: 100 }),
    num("Erwachsene", "adults", { min: 1, max: 6, step: 1 }),
    num("Kinder unter 14", "kidsYoung", { min: 0, max: 8, step: 1 }),
    num("Kinder ab 14", "kidsOld", { min: 0, max: 8, step: 1 }),
    num("Nettovermögen (€)", "wealth", { step: 5000 }));

  function drawPosition() {
    const s = distState;
    const scale = 1 + 0.5 * (Math.max(1, s.adults) - 1 + s.kidsOld) + 0.3 * s.kidsYoung;
    const eq = s.netMonth * 12 / scale;
    const pInc = percentileOf(eq, REF.einkommenPerzentile);
    const pW = percentileOf(s.wealth, REF.vermoegenPerzentile);
    pOut.innerHTML = "";
    pOut.append(
      positionStrip("Einkommen", pInc, `Äquivalenzeinkommen ${fmtEUR(eq)} pro Jahr – mehr als ${fmtPct(pInc, 0)} der Bevölkerung`, "var(--series-1)"),
      positionStrip("Vermögen", pW, `Nettovermögen ${fmtEUR(s.wealth)} – mehr als ${fmtPct(pW, 0)} der Haushalte`, "var(--series-3)"));
  }
  drawPosition();

  const ec = card("Wer zahlt die Einkommensteuer?", "Anteil am Aufkommen der Lohn- und Einkommensteuer nach Einkommensgruppe der Steuerpflichtigen");
  const eList = h("div");
  ec.appendChild(eList);
  sec.appendChild(ec);
  barList(eList, REF.estAnteile.map(e => ({ label: e.gruppe, value: e.anteil, color: "var(--series-2)" })),
    { max: 100, format: v => `${v} %` });
  ec.appendChild(h("p", { class: "hint" }, "Die Progression wirkt: Wer mehr verdient, zahlt überproportional – berücksichtigt man auch Mehrwertsteuer und Sozialabgaben, ist die Gesamtbelastung über die Einkommen hinweg allerdings deutlich gleichmäßiger. ",
    h("a", { href: "#/steuern" }, "Zum Steuerrechner →")));
}

// ── Vermögensteuer ─────────────────────────────

// Rechnet das Vermögensteuer-Detailmodell des Bundeshaushalts mit eigenen Parametern
function wealthTaxRevenue(variantKey, freibetrag, satz) {
  const tpl = findTemplateIn(BASELINE.bund, "fm-vermoegensteuer-advanced");
  if (!tpl) return 0;
  const variants = getTemplateVariants(tpl);
  const v = variants.find(x => x.key === variantKey) || variants[0];
  return new Function("v_freibetrag", "v_steuersatz", v.formula)(freibetrag, satz);
}

function renderWealthTax(sec) {
  const tpl = findTemplateIn(BASELINE.bund, "fm-vermoegensteuer-advanced");
  if (!tpl) return;
  const c = card("Vermögensteuer-Rechner", "Seit 1997 wird keine Vermögensteuer mehr erhoben. Hier lässt sich durchspielen, was Freibetrag und Satz einbrächten – mit dem Modell, das auch im Haushalt hinterlegt ist.");
  const sim = h("div", { class: "sim-layout" });
  const ctr = h("div", { class: "sim-controls" });
  const out = h("div", { class: "sim-out" });
  sim.append(ctr, out);
  c.appendChild(sim);
  sec.appendChild(c);

  const select = h("select", {}, getTemplateVariants(tpl).map(v => h("option", { value: v.key }, v.label)));
  select.value = wealthTaxState.variant;
  select.addEventListener("change", () => { wealthTaxState.variant = select.value; wealthTaxState.applied = false; draw(); });
  ctr.appendChild(h("label", { class: "select-field" }, h("span", {}, "Vermögensverteilung im Modell"), select));
  ctr.appendChild(rangeField({ label: "Freibetrag pro Person", min: 500000, max: 10000000, step: 100000, value: wealthTaxState.freibetrag,
    format: v => fmtEUR(v), onInput: v => { wealthTaxState.freibetrag = v; wealthTaxState.applied = false; draw(); } }));
  ctr.appendChild(rangeField({ label: "Steuersatz pro Jahr", min: 0, max: 3, step: 0.1, value: wealthTaxState.satz,
    format: v => fmtPct(v), onInput: v => { wealthTaxState.satz = v; wealthTaxState.applied = false; draw(); } }));

  function draw() {
    const s = wealthTaxState;
    const revenue = wealthTaxRevenue(s.variant, s.freibetrag, s.satz);
    const current = Number(bundSlider("fm", /^Vermoegensteuer$/)?.value || 0);
    const b = budgetSnapshot();
    out.innerHTML = "";
    out.appendChild(h("div", { class: "stat-row compact" },
      statTile("Aufkommen pro Jahr", fmtBn(revenue, 1), "vor Ausweichreaktionen"),
      statTile("Entspricht", fmtPct(revenue / b.expense * 100, 1), "der Bundesausgaben"),
      // Lücke ohne eine bereits übernommene Vermögensteuer, sonst rechnet sie sich doppelt klein
      statTile("Deckt die Kreditlücke zu", fmtPct(Math.min(100, revenue / Math.max(b.gap + current, 1e-9) * 100), 0), `von ${fmtBn(b.gap + current, 0)}`)));

    const chart = h("div");
    out.appendChild(h("h3", { class: "mini-title" }, "Aufkommen je nach Freibetrag"));
    out.appendChild(chart);
    const pts = [];
    for (let f = 500000; f <= 10000000; f += 250000) pts.push([f, wealthTaxRevenue(s.variant, f, s.satz)]);
    const other = getTemplateVariants(tpl).find(v => v.key !== s.variant);
    const series = [{ name: `Satz ${fmtPct(s.satz)}`, color: "var(--series-1)", points: pts }];
    if (other) series.push({ name: `${other.label.split(" (")[0]}, gleicher Satz`, color: "var(--series-muted)", dash: true,
      points: pts.map(([f]) => [f, wealthTaxRevenue(other.key, f, s.satz)]) });
    lineChart(chart, {
      series, height: 220, xMin: 500000, xMax: 10000000, yMin: 0, xFormat: v => `${(v / 1e6).toLocaleString("de-DE")} Mio.`,
      markers: [{ x: s.freibetrag, y: revenue, color: "var(--series-1)" }],
      xSnap: x => Math.round(x / 250000) * 250000, label: "Aufkommen der Vermögensteuer nach Freibetrag",
      tooltip: f => `<strong>Freibetrag ${fmtEUR(f)}</strong><br>` + series.map(x => `${x.name}: ${fmtBn(valueAt(x.points, f), 1)}`).join("<br>")
    });

    const apply = h("button", { type: "button", class: "primary-btn inline" }, "In den Bundeshaushalt übernehmen");
    apply.addEventListener("click", () => {
      setBundSlider("fm", /^Vermoegensteuer$/, revenue);
      wealthTaxState.applied = true;
      draw();
    });
    out.appendChild(h("div", { class: "apply-row" }, apply,
      h("span", { class: "hint" }, s.applied ? h("span", { class: "ok" }, "Übernommen. ", h("a", { href: "#/haushalt/bund:fm" }, "Im Haushalt ansehen →"))
        : `Im Haushalt aktuell: ${fmtBn(current, 1)}`)));
  }
  draw();

  c.appendChild(h("p", { class: "hint" }, "Nicht berücksichtigt: Ausweichen und Wegzug, Bewertungsfragen bei Betriebsvermögen und Immobilien, Verwaltungskosten sowie die Frage, ob Freibeträge pro Person oder Haushalt gelten. Laut Grundgesetz stünde das Aufkommen den Ländern zu; im Modell ist es zur Vereinfachung beim Bund verbucht."));
}

// ── Bausteine ──────────────────────────────────

function positionStrip(label, pct, text, color) {
  return h("div", { class: "position" },
    h("div", { class: "position-head" }, h("strong", {}, label), h("span", {}, `Perzentil ${Math.round(pct)}`)),
    h("div", { class: "position-track", role: "img", "aria-label": text },
      [10, 20, 30, 40, 50, 60, 70, 80, 90].map(t => h("span", { class: "position-tick", style: `left:${t}%` })),
      h("span", { class: "position-fill", style: `width:${pct}%;background:${color}` }),
      h("span", { class: "position-dot", style: `left:${pct}%;border-color:${color}` })),
    h("div", { class: "position-scale" }, h("span", {}, "ärmste"), h("span", {}, "Median"), h("span", {}, "reichste")),
    h("p", { class: "position-text" }, text));
}

// Gruppiertes Säulendiagramm: categories × series
function columnChart(container, categories, series, opts = {}) {
  container.innerHTML = "";
  container.classList.add("chart");
  const width = Math.max(280, container.clientWidth);
  const height = opts.height || 260;
  const m = { top: 12, right: 10, bottom: 28, left: 52 };
  const iw = width - m.left - m.right, ih = height - m.top - m.bottom;
  const all = series.flatMap(s => s.values);
  const yMin = Math.min(0, ...all), yMax = Math.max(...all) * 1.08;
  const ys = v => m.top + ih - (v - yMin) / (yMax - yMin) * ih;
  const svg = svgEl("svg", { width, height, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": opts.label || "" }, container);

  niceTicks(yMin, yMax, 5).forEach(t => {
    svgEl("line", { x1: m.left, x2: m.left + iw, y1: ys(t), y2: ys(t), class: t === 0 ? "axis-base" : "grid" }, svg);
    svgEl("text", { x: m.left - 6, y: ys(t) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = (opts.yFormat || String)(t);
  });

  const band = iw / categories.length;
  const gap = 2;
  const bw = Math.min(56, Math.max(3, (band * 0.72 - gap * (series.length - 1)) / series.length));
  categories.forEach((c, i) => {
    const x0 = m.left + i * band + (band - (bw * series.length + gap * (series.length - 1))) / 2;
    series.forEach((s, j) => {
      const v = s.values[i];
      const y = ys(Math.max(v, 0)), y2 = ys(Math.min(v, 0));
      const rect = svgEl("rect", { x: x0 + j * (bw + gap), y, width: bw, height: Math.max(1, y2 - y), rx: Math.min(3, bw / 2), fill: s.color }, svg);
      rect.addEventListener("mousemove", e => chartTip.show(`<strong>${(opts.xTitle || String)(c)}</strong><br>${s.name}: ${(opts.valueFormat || String)(v)}`, e.clientX, e.clientY));
      rect.addEventListener("mouseleave", () => chartTip.hide());
    });
    svgEl("text", { x: m.left + i * band + band / 2, y: m.top + ih + 18, class: "tick", "text-anchor": "middle" }, svg).textContent = c;
  });
  if (series.length > 1) container.appendChild(legend(series));
}
