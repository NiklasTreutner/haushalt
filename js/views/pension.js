// Bereich "Rente & Demografie": Altenquotient und ein grobes Modell, wie
// Rentenniveau, Renteneintrittsalter und Beitragsdeckel auf Beitragssatz und
// Bundeszuschuss durchschlagen. Startwert des Zuschusses kommt aus dem Haushalt.

const pensionState = { niveau: 48, alter: 67, deckel: 26, bbgWeg: false, alle: false };

// Faustregel: ein Jahr späterer Renteneintritt senkt das Verhältnis von Rentnern
// zu Beitragszahlern um rd. 6 % (weniger Rentenbezieher, mehr Beschäftigte).
const RENTE_EFFEKT_JE_JAHR = 0.06;

// Neu Versicherte erwerben Ansprüche, die erst nach und nach fällig werden: nach
// rd. 45 Jahren zahlt die Kasse ihnen so viel aus, wie sie (im Verhältnis) einzahlen.
const NEUE_ANSPRUECHE_JAHRE = 45;

const PENSION_SCENARIOS = [
  { key: "sq", label: "Status quo", bbgWeg: false, alle: false, color: "var(--series-muted)" },
  { key: "bbg", label: "BBG abschaffen, Renten nicht erhöhen", bbgWeg: true, alle: false, color: "var(--series-1)" },
  { key: "alle", label: "Alle zahlen ein (inkl. Beamte, Selbstständige)", bbgWeg: false, alle: true, color: "var(--series-3)" },
  { key: "beides", label: "Kombiniert", bbgWeg: true, alle: true, color: "var(--series-2)" }
];

function pensionPath({ niveau, alter, deckel, bbgWeg = false, alle = false }, zuschuss2027) {
  const r = REF.rente;
  const aq0 = interpSeries(REF.altenquotient, 2026);
  const aq27 = interpSeries(REF.altenquotient, 2027);
  const extra = pensionBaseExtras({ bbgWeg, alle });
  const basis0 = r.beitragsbasis2026;
  const out = { aq: [], satz: [], satzOhneDeckel: [], zuschuss: [] };
  for (let y = 2026; y <= 2045; y++) {
    const phase = Math.min(1, Math.max(0, (y - 2029) / 6)); // Übergang 2030–2035
    const aq = interpSeries(REF.altenquotient, y) * (1 - RENTE_EFFEKT_JE_JAHR * (alter - 67) * phase);
    const satzHeute = r.beitragssatz2026 * aq / aq0 * niveau / 48;
    // Ausgabenanteil wie heute plus die nach und nach fälligen Renten der neu
    // Versicherten, verteilt auf die verbreiterte Grundlage. Die Abschaffung der
    // BBG erzeugt keine zusätzlichen Ansprüche.
    const reife = Math.min(1, Math.max(0, (y - 2027) / NEUE_ANSPRUECHE_JAHRE));
    const satz = satzHeute * (basis0 + extra.neu * reife) / (basis0 + extra.gesamt);
    const wachstum = Math.pow(1 + r.lohnwachstum / 100, y - 2027);
    let zuschuss = zuschuss2027 * wachstum * aq / aq27 * niveau / 48;
    const ueber = Math.max(0, satz - deckel);
    zuschuss += ueber / 100 * (basis0 + extra.gesamt) * Math.pow(1 + r.lohnwachstum / 100, y - 2026);
    out.aq.push([y, aq]);
    out.satz.push([y, Math.min(satz, deckel)]);
    out.satzOhneDeckel.push([y, satz]);
    out.zuschuss.push([y, zuschuss]);
  }
  out.extra = extra;
  return out;
}

pageView({
  id: "rente",
  title: "Rente & Demografie",
  icon: "⌛",
  teaser(b) {
    const z = bundSlider("bmas", /Zuschuss Renten/);
    return z ? { value: fmtBn(Number(z.value), 0), label: `Bundeszuschuss zur Rente – ${fmtPct(Number(z.value) / b.expense * 100, 0)} des Bundeshaushalts` } : null;
  },
  render(el) {
    const b = budgetSnapshot();
    const zuschussSlider = bundSlider("bmas", /Zuschuss Renten/);
    const zuschuss2027 = zuschussSlider ? Number(zuschussSlider.value) : 100.8;
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Alterssicherung", "Rente in einer alternden Gesellschaft",
      "Die Babyboomer gehen in Rente: Auf 100 Menschen im Erwerbsalter kommen bald fast 50 über 65. Wer zahlt die Differenz – Beitragszahler oder Steuerzahler?"));

    const aqNow = interpSeries(REF.altenquotient, 2025);
    const aq40 = interpSeries(REF.altenquotient, 2040);
    wrap.appendChild(h("div", { class: "stat-row" },
      statTile("Altenquotient heute", Math.round(aqNow).toString(), "Menschen 65+ je 100 im Alter 20–64"),
      statTile("Altenquotient 2040", Math.round(aq40).toString(), `${fmtSigned((aq40 / aqNow - 1) * 100, v => fmtPct(v, 0))} ggü. heute`, { tone: "warn" }),
      statTile("Beitragssatz 2026", fmtPct(REF.rente.beitragssatz2026), "Arbeitnehmer und Arbeitgeber je zur Hälfte"),
      statTile("Bundeszuschuss 2027", fmtBn(zuschuss2027, 1), `${fmtPct(zuschuss2027 / b.expense * 100, 0)} des Bundeshaushalts`, { href: "#/haushalt/bund:bmas" })));

    const ac = card("Altenquotient 1990–2070", "ab 2025 Bevölkerungsvorausberechnung (moderate Variante)");
    const aChart = h("div");
    ac.appendChild(aChart);
    wrap.appendChild(ac);
    lineChart(aChart, {
      series: [{ name: "Altenquotient", color: "var(--series-1)", points: REF.altenquotient }],
      height: 230, xMin: 1990, xMax: 2070, yMin: 0, yMax: 60, xFormat: String,
      bands: [{ from: 2025, to: 2070, label: "Projektion" }],
      xSnap: x => Math.round(x), label: "Altenquotient 1990 bis 2070",
      tooltip: x => `<strong>${x}</strong><br>${Math.round(valueAt(REF.altenquotient, x))} Ältere je 100 Erwerbsfähige`
    });

    const sc = card("Stellschrauben bis 2045", "Grobes Umlagemodell: Ausgaben wachsen mit dem Altenquotienten und dem Rentenniveau. Was der Beitragsdeckel nicht erlaubt, muss der Bund zuschießen.");
    const sim = h("div", { class: "sim-layout" });
    const ctr = h("div", { class: "sim-controls" });
    const out = h("div", { class: "sim-out" });
    sim.append(ctr, out);
    sc.appendChild(sim);
    wrap.appendChild(sc);

    let reformOut = null; // wird unten angelegt; draw() aktualisiert ihn mit
    const field = (label, key, min, max, step, fmt, base) => ctr.appendChild(rangeField({
      label, min, max, step, value: pensionState[key], base, format: fmt,
      onInput: v => { pensionState[key] = v; draw(); } }));
    field("Rentenniveau (Haltelinie)", "niveau", 40, 55, 0.5, v => fmtPct(v), 48);
    field("Regelaltersgrenze ab 2035", "alter", 65, 70, 0.5, v => `${v.toLocaleString("de-DE")} Jahre`, 67);
    field("Beitragssatz höchstens", "deckel", 18.6, 26, 0.1, v => fmtPct(v), 26);
    const check = (label, key, sub) => {
      const input = h("input", { type: "checkbox" });
      input.checked = pensionState[key];
      input.addEventListener("change", () => { pensionState[key] = input.checked; draw(); });
      return h("label", { class: "check-field block" }, input, h("span", {}, label, h("small", {}, sub)));
    };
    ctr.append(
      check("BBG abschaffen, Renten nicht erhöhen", "bbgWeg", "Beiträge auf den vollen Lohn, Ansprüche weiter nur bis zur heutigen Grenze"),
      check("Alle zahlen ein", "alle", "Beamte, Selbstständige, freie Berufe, Abgeordnete"));

    function draw() {
      const base = pensionPath({ niveau: 48, alter: 67, deckel: 99 }, zuschuss2027);
      const mine = pensionPath(pensionState, zuschuss2027);
      const at = (s, y) => s.find(p => p[0] === y)[1];
      out.innerHTML = "";
      out.appendChild(h("div", { class: "stat-row compact" },
        statTile("Beitragssatz 2040", fmtPct(at(mine.satz, 2040)),
          at(mine.satzOhneDeckel, 2040) > pensionState.deckel ? `gedeckelt, nötig wären ${fmtPct(at(mine.satzOhneDeckel, 2040))}` : `Status quo: ${fmtPct(at(base.satz, 2040))}`),
        statTile("Bundeszuschuss 2040", fmtBn(at(mine.zuschuss, 2040), 0), `Status quo: ${fmtBn(at(base.zuschuss, 2040), 0)} (nominal)`,
          { tone: at(mine.zuschuss, 2040) > at(base.zuschuss, 2040) + 1 ? "warn" : "" })));

      const g = h("div", { class: "grid-2 tight" });
      const c1 = h("div"), c2 = h("div");
      g.append(h("div", {}, h("h3", { class: "mini-title" }, "Beitragssatz zur Rentenversicherung"), c1),
        h("div", {}, h("h3", { class: "mini-title" }, "Bundeszuschuss (Mrd. €, nominal)"), c2));
      out.appendChild(g);
      const s1 = [
        { name: "Status quo", color: "var(--series-muted)", points: base.satz },
        { name: "Ihre Einstellung", color: "var(--series-1)", points: mine.satz }
      ];
      lineChart(c1, {
        series: s1, height: 220, xMin: 2026, xMax: 2045, yMin: 15, yMax: 28, xFormat: String, yFormat: v => `${v} %`,
        refLines: pensionState.deckel < 26 ? [{ y: pensionState.deckel, label: "Deckel" }] : [],
        xSnap: x => Math.round(x), label: "Beitragssatz bis 2045",
        tooltip: x => `<strong>${x}</strong><br>` + s1.map(s => `${s.name}: ${fmtPct(valueAt(s.points, x))}`).join("<br>")
      });
      const s2 = [
        { name: "Status quo", color: "var(--series-muted)", points: base.zuschuss },
        { name: "Ihre Einstellung", color: "var(--series-2)", points: mine.zuschuss }
      ];
      lineChart(c2, {
        series: s2, height: 220, xMin: 2026, xMax: 2045, yMin: 0, xFormat: String,
        xSnap: x => Math.round(x), label: "Bundeszuschuss bis 2045",
        tooltip: x => `<strong>${x}</strong><br>` + s2.map(s => `${s.name}: ${fmtBn(valueAt(s.points, x), 1)}`).join("<br>")
      });
      if (reformOut) drawPensionReforms(reformOut, zuschuss2027);
    }
    draw();

    // Reformszenarien: Wer zahlt ein?
    const rc = card("Reformszenarien: Wer zahlt ein?", "Benötigter Beitragssatz bei Rentenniveau und Renteneintrittsalter wie oben eingestellt, ohne Beitragsdeckel");
    reformOut = h("div");
    rc.appendChild(reformOut);
    wrap.appendChild(rc);
    drawPensionReforms(reformOut, zuschuss2027);

    wrap.appendChild(sourceNote("Altenquotient: Destatis, 15. koordinierte Bevölkerungsvorausberechnung (moderate Variante), gerundet. Das Modell ist bewusst einfach: Es unterstellt einen konstanten Anteil des Bundeszuschusses an den Ausgaben, 3 % Lohnwachstum und eine Faustregel für das Renteneintrittsalter (rd. 6 % Entlastung je Jahr). Reformszenarien: Löhne oberhalb der BBG aus einer Lognormal-Näherung der Lohnverteilung (rd. 105 Mrd. € über 101.400 €); Einkommen der neuen Gruppen sind Näherungen. Neu Versicherte erwerben Ansprüche, die über 45 Jahre linear fällig werden. Es ersetzt keine Rentenvorausberechnung der Bundesregierung."));
  }
});

function drawPensionReforms(rOut, zuschuss2027) {
  rOut.innerHTML = "";
  const paths = PENSION_SCENARIOS.map(sc => ({ ...sc,
    path: pensionPath({ niveau: pensionState.niveau, alter: pensionState.alter, deckel: 99, bbgWeg: sc.bbgWeg, alle: sc.alle }, zuschuss2027) }));
  const at = (pts, y) => pts.find(p => p[0] === y)[1];
  const sq = paths[0];
  const pts = v => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });

  const table = h("table", { class: "data-table" },
    h("thead", {}, h("tr", {}, h("th", {}, "Szenario"), h("th", {}, "Zusätzliche Grundlage"), h("th", {}, "Mehr Beiträge 2027"),
      h("th", {}, "Satz 2030"), h("th", {}, "Satz 2040"))),
    h("tbody", {}, paths.map(p => h("tr", { class: p.bbgWeg === pensionState.bbgWeg && p.alle === pensionState.alle ? "active" : "" },
      h("td", {}, h("span", { class: "legend-swatch", style: `--c:${p.color}` }), " ", p.label),
      h("td", {}, p.path.extra.gesamt ? `+${fmtBn(p.path.extra.gesamt, 0)}` : "–"),
      h("td", {}, p.path.extra.gesamt ? fmtBn(p.path.extra.gesamt * at(sq.path.satzOhneDeckel, 2027) / 100, 0) : "–"),
      h("td", {}, fmtPct(at(p.path.satzOhneDeckel, 2030))),
      h("td", {}, fmtPct(at(p.path.satzOhneDeckel, 2040)),
        p.key !== "sq" ? h("small", {}, ` (${fmtSigned(at(p.path.satzOhneDeckel, 2040) - at(sq.path.satzOhneDeckel, 2040), pts)})`) : null)))));
  rOut.appendChild(h("div", { class: "table-scroll" }, table));

  const chart = h("div");
  rOut.appendChild(chart);
  const series = paths.map(p => ({ name: p.label, color: p.color, points: p.path.satzOhneDeckel, width: p.key === "beides" ? 3 : 2 }));
  lineChart(chart, {
    series, height: 260, xMin: 2026, xMax: 2045, yMin: 12, yMax: Math.ceil(Math.max(24, ...series.flatMap(s => s.points.map(pt => pt[1]))) + 1),
    xFormat: String, yFormat: v => `${v} %`, xSnap: x => Math.round(x), label: "Beitragssatz zur Rentenversicherung je Reformszenario",
    tooltip: x => `<strong>${x}</strong><br>` + series.map(s => `${s.name}: ${fmtPct(valueAt(s.points, x))}`).join("<br>")
  });

  // Wirkung auf einzelne Beschäftigte 2030
  const satzSQ = at(sq.path.satzOhneDeckel, 2030), satzBBG = at(paths[1].path.satzOhneDeckel, 2030);
  rOut.appendChild(h("h3", { class: "mini-title" }, "Arbeitnehmerbeitrag 2030: Status quo vs. „BBG abschaffen“"));
  const eff = h("div");
  rOut.appendChild(eff);
  barList(eff, [40000, 70000, 100000, 150000, 250000].map(g => {
    const alt = Math.min(g, REF.rente.bbg) * satzSQ / 200, neu = g * satzBBG / 200;
    return { label: `${fmtEUR(g)} brutto`, value: alt - neu, sub: `${fmtEUR(alt)} → ${fmtEUR(neu)} pro Jahr`,
      color: neu <= alt ? "var(--series-1)" : "var(--series-8)" };
  }), { diverging: true, format: v => v >= 0 ? `+${fmtEUR(Math.round(v))} netto` : `−${fmtEUR(Math.round(-v))} netto` });

  const n = REF.rente.neueGruppen;
  rOut.appendChild(h("ul", { class: "fact-list" },
    h("li", {}, h("strong", {}, "BBG abschaffen: "), `Gutverdiener zahlen auf ihr ganzes Einkommen (rd. ${fmtBn(paths[1].path.extra.ueberBBG, 0)} zusätzliche Grundlage), ohne höhere Rente. Das entlastet dauerhaft, bricht aber mit dem Äquivalenzprinzip (Beitrag gleich Anspruch) und wäre verfassungsrechtlich angreifbar. Für die Betroffenen wirkt der Beitrag oberhalb der Grenze wie eine Steuer.`),
    h("li", {}, h("strong", {}, "Alle zahlen ein: "), `Beamte (${fmtBn(n.beamte, 0)}), Selbstständige (${fmtBn(n.selbststaendige, 0)}) und Mitglieder der Versorgungswerke (${fmtBn(n.versorgungswerke, 0)}) verbreitern die Grundlage sofort. Weil sie Ansprüche erwerben, schmilzt der Vorteil über Jahrzehnte ab. Er hilft vor allem, die Babyboomer-Jahre zu überbrücken.`),
    h("li", {}, h("strong", {}, "Doppelbelastung der Dienstherren: "), `Bund, Länder und Kommunen müssten für aktive Beamte Beiträge zahlen (Arbeitgeberanteil rd. ${fmtBn(n.beamte * REF.rente.beitragssatz2026 / 200, 0)}, bei gleichbleibenden Nettobezügen rd. ${fmtBn(n.beamte * REF.rente.beitragssatz2026 / 100, 0)} pro Jahr) und zugleich die laufenden Pensionen weiter finanzieren.`)));
}
