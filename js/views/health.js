// Bereich "Kranken- & Pflegekasse": Wirkung der Beitragsbemessungsgrenze, Vergleich
// mit der PKV und Szenarien bis zur Bürgerversicherung (Modell: js/socialmodel.js)

const BBG_NONE_SLIDER = 200000; // Reglerposition ganz rechts = keine Grenze

const healthState = { ...HEALTH_STATUS_QUO, mode: "eur" };

const HEALTH_PRESETS = [
  { label: "Status quo", set: { bbg: 69750, pkvIn: false, kapital: false } },
  { label: "BBG auf Rentenniveau", set: { bbg: 101400, pkvIn: false, kapital: false } },
  { label: "BBG abschaffen", set: { bbg: Infinity, pkvIn: false, kapital: false } },
  { label: "PKV integrieren", set: { bbg: 69750, pkvIn: true, kapital: false } },
  { label: "Bürgerversicherung", set: { bbg: Infinity, pkvIn: true, kapital: false },
    note: "PKV abgeschafft, alle in einer Kranken- und Pflegekasse, keine BBG" },
  { label: "… plus Kapital- und Mieteinkünfte", set: { bbg: Infinity, pkvIn: true, kapital: true } }
];

const fmtBBG = v => isFinite(v) ? fmtEUR(v) : "keine Grenze";

pageView({
  id: "gesundheit",
  title: "Kranken- & Pflegekasse",
  icon: "✚",
  teaser() {
    const bv = healthScenario({ ...HEALTH_STATUS_QUO, bbg: Infinity, pkvIn: true });
    const sq = healthScenario(HEALTH_STATUS_QUO);
    return { value: fmtSigned(bv.kv + bv.pv - sq.kv - sq.pv, v => `${v.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Punkte`),
      label: "Beitragssatz mit einer Bürgerversicherung (Modell)" };
  },
  render: renderHealthPage
});

function renderHealthPage(el) {
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Gesundheit und Pflege", "Kranken- und Pflegekasse: Wer zahlt wie viel?",
      "Beiträge hängen vom Lohn ab – aber nur bis zur Beitragsbemessungsgrenze. Wer mehr verdient, Beamter oder selbstständig ist, kann sich privat versichern. Was passiert, wenn alle in eine Kasse einzahlen?"));

    const k = REF.kv;
    const sq = healthScenario(HEALTH_STATUS_QUO);
    const maxBeitrag = healthContribution(k.bbg, sq, k.bbg) / 12;
    wrap.appendChild(h("div", { class: "stat-row" },
      statTile("Beitragssatz 2026", fmtPct(k.satz + REF.pv.satz), `Kranken ${fmtPct(k.satz)} + Pflege ${fmtPct(REF.pv.satz)}, je zur Hälfte`),
      statTile("Beitragsbemessungsgrenze", fmtEUR(k.bbg / 12, 2), "pro Monat – darüber bleibt jeder Euro beitragsfrei"),
      statTile("Höchstbeitrag Arbeitnehmer", fmtEUR(maxBeitrag), "pro Monat, egal ob 6.000 € oder 60.000 € Lohn"),
      statTile("Versicherte", `${(k.versicherte / 1e6).toLocaleString("de-DE")} Mio. / ${(k.pkvVoll / 1e6).toLocaleString("de-DE")} Mio.`, "gesetzlich / privat vollversichert")));

    const grid = h("div", { class: "grid-2" });
    wrap.appendChild(grid);
    const pc = card("Wer ist privat versichert?", "Privat Vollversicherte nach Gruppe (Näherung)");
    const colors = ["var(--series-1)", "var(--series-3)", "var(--series-2)", "var(--series-muted)"];
    pc.appendChild(stackBar(k.pkvAnteile.map((a, i) => ({ label: a.label, value: a.wert, color: colors[i] })), 100, { pctOnly: true }));
    pc.appendChild(legend(k.pkvAnteile.map((a, i) => ({ name: `${a.label} (${a.wert} %)`, color: colors[i] }))));
    pc.appendChild(h("p", { class: "hint" }, `Wechseln dürfen Angestellte erst ab ${fmtEUR(k.vpg)} Jahreslohn (Versicherungspflichtgrenze). Für Beamte zahlt der Dienstherr über die Beihilfe 50–80 % der Krankheitskosten – deshalb ist für sie die PKV fast immer günstiger.`));
    grid.appendChild(pc);

    const fc = card("Zwei Systeme, ein Problem", "Was die Aufteilung für die gesetzliche Kasse bedeutet");
    fc.appendChild(h("ul", { class: "fact-list" },
      h("li", {}, h("strong", {}, "Gute Risiken fehlen: "), "Privatversicherte verdienen im Schnitt mehr und sind (außer Beamten im Ruhestand) oft gesünder – ihr Beitrag fehlt im Solidarausgleich."),
      h("li", {}, h("strong", {}, "Die BBG wirkt regressiv: "), "Oberhalb der Grenze sinkt die Belastung in Prozent des Einkommens."),
      h("li", {}, h("strong", {}, "Ärzte profitieren: "), `Höhere PKV-Honorare bringen Praxen und Kliniken rd. ${fmtBn(k.pkvMehrumsatz, 0)} Mehrumsatz pro Jahr.`),
      h("li", {}, h("strong", {}, "Die PKV spart an: "), "Privatversicherte bauen Alterungsrückstellungen auf; die GKV finanziert alles im Umlageverfahren.")));
    grid.appendChild(fc);

    // Beitragskurve
    const cc = card("Die Wirkung der Beitragsbemessungsgrenze", "Arbeitnehmerbeitrag zu Kranken- und Pflegeversicherung nach Bruttojahreslohn");
    const mode = h("div", { class: "segmented" },
      [["eur", "€ pro Jahr"], ["pct", "% vom Brutto"]].map(([key, label]) => h("button", { type: "button",
        class: healthState.mode === key ? "active" : "", onclick: () => { healthState.mode = key; renderHealthPage(el); } }, label)));
    cc.appendChild(mode);
    const curve = h("div");
    cc.appendChild(curve);
    wrap.appendChild(cc);

    // Szenarien
    const sc = card("Szenarien: Eine Kasse für alle?", "Welcher Beitragssatz würde reichen, um dieselben Ausgaben zu finanzieren? Annahmen lassen sich links verändern.");
    const sim = h("div", { class: "sim-layout" });
    const ctr = h("div", { class: "sim-controls" });
    const out = h("div", { class: "sim-out" });
    sim.append(ctr, out);
    sc.appendChild(sim);
    wrap.appendChild(sc);

    const draw = () => { drawHealthCurve(curve); drawHealthScenarios(out); };
    renderHealthControls(ctr, draw, () => renderHealthPage(el));
    draw();

    wrap.appendChild(sourceNote("Modell: GKV-Ausgaben 2026 rd. 350 Mrd. €, Bundeszuschuss 14,5 Mrd. €, durchschnittlicher Zusatzbeitrag 2,9 %. Löhne oberhalb der Grenze aus einer Lognormal-Näherung der Lohnverteilung (35 Mio. Beschäftigte, Median 40.000 €), davon 65 % bei gesetzlich und 45 % (bezogen auf dieselbe Kurve) bei privat Versicherten. Einkommen der Privatversicherten bis zur BBG: rd. 280 Mrd. €. Nicht abgebildet: Übergangsregeln und Bestandsschutz, die rd. 300 Mrd. € Alterungsrückstellungen der PKV, der Wegfall der Beihilfe bei gleichzeitigem Arbeitgeberbeitrag für Beamte, Verhaltensänderungen. Rechtlich wäre eine vollständige Abschaffung der PKV umstritten (Eigentumsschutz der Rückstellungen, Berufsfreiheit)."));
}

function renderHealthControls(ctr, draw, fullRender) {
  const chips = h("div", { class: "chips" });
  HEALTH_PRESETS.forEach(p => chips.appendChild(h("button", { type: "button", class: `chip${presetActive(p) ? " active" : ""}`, title: p.note || null,
    onclick: () => { Object.assign(healthState, p.set); fullRender(); } }, p.label)));
  ctr.appendChild(chips);

  ctr.appendChild(rangeField({ label: "Beitragsbemessungsgrenze", min: 69750, max: BBG_NONE_SLIDER, step: 250,
    value: isFinite(healthState.bbg) ? healthState.bbg : BBG_NONE_SLIDER, base: 69750,
    format: v => v >= BBG_NONE_SLIDER ? "keine Grenze" : fmtEUR(v),
    onInput: v => { healthState.bbg = v >= BBG_NONE_SLIDER ? Infinity : v; draw(); } }));

  const check = (label, key, sub) => {
    const input = h("input", { type: "checkbox" });
    input.checked = healthState[key];
    input.addEventListener("change", () => { healthState[key] = input.checked; draw(); });
    return h("label", { class: "check-field block" }, input, h("span", {}, label, sub ? h("small", {}, sub) : null));
  };
  ctr.append(
    check("PKV abschaffen – alle in die gesetzliche Kasse", "pkvIn", "auch Beamte, Selbstständige, Gutverdiener"),
    check("Auch Kapital- und Mieteinkünfte verbeitragen", "kapital", `rd. ${fmtBn(REF.kv.kapitalMiete, 0)} zusätzliche Grundlage`),
    check("Honorarverlust der Ärzte ausgleichen", "honorarAusgleich", `+${fmtBn(REF.kv.pkvMehrumsatz, 0)} Ausgaben, nur mit PKV-Integration`));
  ctr.appendChild(rangeField({ label: "Krankheitskosten bisher Privatversicherter", min: 60, max: 120, step: 1,
    value: healthState.kostenfaktor, base: 85, format: v => `${v} % des GKV-Schnitts`,
    onInput: v => { healthState.kostenfaktor = v; draw(); } }));
  ctr.appendChild(h("p", { class: "hint" }, "Die Kostenannahme ist der umstrittenste Punkt: Privatversicherte sind jünger und gesünder, Beamte im Ruhestand aber teuer."));
}

function presetActive(p) {
  return Object.entries(p.set).every(([k, v]) => healthState[k] === v);
}

function drawHealthCurve(container) {
  const k = REF.kv;
  const sq = healthScenario(HEALTH_STATUS_QUO);
  const sc = healthScenario(healthState);
  const pct = healthState.mode === "pct";
  const grosses = []; for (let g = 10000; g <= 250000; g += 2500) grosses.push(g);
  const val = (g, s, bbg) => { const c = healthContribution(g, s, bbg); return pct ? c / g * 100 : c; };
  const pkvJahr = k.pkvBeispielMonat * 12 / 2;
  const series = [
    { name: "Heute", color: "var(--series-1)", points: grosses.map(g => [g, val(g, sq, k.bbg)]) }
  ];
  const changed = !presetActive(HEALTH_PRESETS[0]) || healthState.kostenfaktor !== 85 || !healthState.honorarAusgleich;
  if (changed) series.push({ name: "Ihr Szenario", color: "var(--series-2)", dash: true, points: grosses.map(g => [g, val(g, sc, healthState.bbg)]) });
  if (!healthState.pkvIn) series.push({ name: `PKV-Beispiel (${fmtEUR(k.pkvBeispielMonat)}/Monat, AG zahlt die Hälfte)`, color: "var(--series-7)",
    points: grosses.filter(g => g >= k.vpg).map(g => [g, pct ? pkvJahr / g * 100 : pkvJahr]) });

  lineChart(container, {
    series, height: 300, xMin: 10000, xMax: 250000, yMin: 0,
    xFormat: v => fmtK(v), yFormat: v => pct ? `${v} %` : fmtK(v),
    bands: [{ from: k.bbg, to: k.vpg, label: "BBG → Pflichtgrenze" }],
    xSnap: x => Math.round(x / 2500) * 2500, label: "Arbeitnehmerbeitrag zu Kranken- und Pflegeversicherung nach Bruttolohn",
    tooltip: g => `<strong>Brutto ${fmtEUR(g)}</strong><br>` + series.map(s => {
      const v = valueAt(s.points, g);
      return v == null ? "" : `${s.name.split(" (")[0]}: ${pct ? fmtPct(v) : fmtEUR(v) + " / Jahr"}`;
    }).filter(Boolean).join("<br>")
  });
  const low = val(40000, sq, k.bbg), high = val(250000, sq, k.bbg);
  container.appendChild(h("p", { class: "hint" }, pct
    ? `Heute zahlt ein Beschäftigter mit 40.000 € ${fmtPct(low)} seines Bruttos, mit 250.000 € nur ${fmtPct(high)}.`
    : `Ab ${fmtEUR(k.bbg)} steigt der Beitrag nicht mehr. Ab ${fmtEUR(k.vpg)} lohnt für junge, gesunde Gutverdiener oft der Wechsel in die PKV – die gesetzliche Kasse verliert dann ihren Höchstbeitrag.`));
}

function drawHealthScenarios(out) {
  const k = REF.kv;
  const sq = healthScenario(HEALTH_STATUS_QUO);
  const sc = healthScenario(healthState);
  out.innerHTML = "";
  const d = Math.round((sc.kv + sc.pv - sq.kv - sq.pv) * 100) / 100;
  out.appendChild(h("div", { class: "stat-row compact" },
    statTile("Krankenversicherung", fmtPct(sc.kv, 2), `heute ${fmtPct(sq.kv, 2)}`),
    statTile("Pflegeversicherung", fmtPct(sc.pv, 2), `heute ${fmtPct(sq.pv, 2)}`),
    statTile("Veränderung gesamt", fmtSigned(d, v => `${v.toLocaleString("de-DE", { maximumFractionDigits: 2 })} Punkte`),
      `Grundlage ${fmtBn(sc.basis, 0)} statt ${fmtBn(sq.basis, 0)}`, { tone: d < -0.005 ? "good" : d > 0.005 ? "warn" : "" })));

  // Alle Szenarien im Vergleich (mit den aktuellen Kostenannahmen)
  out.appendChild(h("h3", { class: "mini-title" }, "Beitragssatz Kranken + Pflege im Vergleich"));
  const cmp = h("div");
  out.appendChild(cmp);
  barList(cmp, HEALTH_PRESETS.map((p, i) => {
    const r = healthScenario({ ...healthState, ...p.set });
    return { label: p.label, value: r.kv + r.pv, sub: p.note || null,
      color: presetActive(p) ? "var(--series-2)" : i === 0 ? "var(--series-1)" : "var(--series-muted)" };
  }), { format: v => fmtPct(v, 2), max: Math.max(...HEALTH_PRESETS.map(p => { const r = healthScenario({ ...healthState, ...p.set }); return r.kv + r.pv; })) });

  // Wirkung auf Beschäftigte
  out.appendChild(h("h3", { class: "mini-title" }, "Was es für gesetzlich versicherte Beschäftigte bedeutet (Arbeitnehmeranteil pro Jahr)"));
  const eff = h("div");
  out.appendChild(eff);
  barList(eff, [25000, 40000, 55000, 70000, 100000, 150000, 250000].map(g => {
    const delta = healthContribution(g, sc, healthState.bbg) - healthContribution(g, sq, k.bbg);
    return { label: `${fmtEUR(g)} brutto`, value: -delta, sub: `${fmtSigned(delta, fmtEUR)} Beitrag`,
      color: delta <= 0 ? "var(--series-1)" : "var(--series-8)" };
  }), { diverging: true, format: v => v >= 0 ? `+${fmtEUR(Math.round(v))} netto` : `−${fmtEUR(Math.round(-v))} netto` });

  if (healthState.pkvIn) {
    const beamter = 55000;
    const neu = healthContribution(beamter, sc, healthState.bbg);
    out.appendChild(h("p", { class: "hint" },
      `Bisher Privatversicherte zahlen künftig einkommensabhängig: Eine Beamtin mit ${fmtEUR(beamter)} Bezügen hätte einen Arbeitnehmeranteil von ${fmtEUR(neu)} pro Jahr; der Dienstherr zahlt den Arbeitgeberanteil statt der Beihilfe. Für Selbstständige mit hohem Gewinn und ohne Arbeitgeber wird es deutlich teurer.`));
  }
}
