// Bereich "Schulden & Zinsen": Schuldenquote, Zinslast und ein Zins-Simulator,
// der mit der aktuellen Finanzierungslücke aus dem Haushalt startet.

const debtState = { debt: REF.schuldenBund2026, market: 2.8, maturity: 7, nka: null, taxGrowth: 3 };

pageView({
  id: "schulden",
  title: "Schulden & Zinsen",
  icon: "↯",
  teaser(b) {
    return { value: fmtBn(b.zinsen, 0), label: `Zinsen 2027 – mehr als für ${b.ministries.filter(m => m.value < b.zinsen).length} der ${b.ministries.length} Ressorts` };
  },
  render(el) {
    const b = budgetSnapshot();
    const neueKredite = Math.round(b.gap + b.sonder.kredite);
    if (debtState.nka == null) debtState.nka = neueKredite;
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Verschuldung", "Schulden, Zinsen und die Schuldenbremse",
      "Nach Jahren mit Nullzinsen sind die Zinsausgaben des Bundes zurück – und sie wachsen mit jeder Anschlussfinanzierung weiter."));

    const quote = REF.schuldenquote[REF.schuldenquote.length - 1];
    wrap.appendChild(h("div", { class: "stat-row" },
      statTile("Schuldenquote Gesamtstaat", fmtPct(quote[1], 0), `${quote[0]}, Maastricht-Grenze 60 %`),
      statTile("Schulden des Bundes", fmtBn(debtState.debt, 0), `rd. ${fmtEUR(debtState.debt * 1e9 / REF.einwohner)} pro Kopf`),
      statTile("Zinsen 2027", fmtBn(b.zinsen, 1), `${fmtPct(b.zinsen / b.steuern * 100)} der Steuereinnahmen des Bundes`, { href: "#/haushalt/bund:bfin" }),
      statTile("Neue Kredite 2027", fmtBn(b.gap + b.sonder.kredite, 0), `Kernhaushalt ${fmtBn(b.gap, 0)} + Sondervermögen ${fmtBn(b.sonder.kredite, 0)}`, { tone: "warn" })));

    // Historie
    const g = h("div", { class: "grid-2" });
    const qc = card("Schuldenquote seit 2000", "Schulden des Gesamtstaats in % des BIP");
    const qChart = h("div");
    qc.appendChild(qChart);
    const zc = card("Zinsausgaben des Bundes", "Mrd. €, 2027 aus dem aktuellen Haushaltsstand");
    const zChart = h("div");
    zc.appendChild(zChart);
    g.append(qc, zc);
    wrap.appendChild(g);

    lineChart(qChart, {
      series: [{ name: "Schuldenquote", color: "var(--series-1)", points: REF.schuldenquote }],
      height: 240, yMin: 0, yMax: 90, xMin: 2000, xMax: 2025, xFormat: String, yFormat: v => `${v} %`,
      refLines: [{ y: 60, label: "Maastricht 60 %" }],
      bands: [{ from: 2008, to: 2010, label: "Finanzkrise" }, { from: 2020, to: 2021, label: "Corona" }],
      xSnap: x => Math.round(x), label: "Schuldenquote 2000 bis 2025",
      tooltip: x => `<strong>${x}</strong><br>${fmtPct(valueAt(REF.schuldenquote, x), 1)} des BIP`
    });
    const zinsPts = [...REF.zinsenBund, [2027, b.zinsen]];
    lineChart(zChart, {
      series: [{ name: "Zinsausgaben", color: "var(--series-2)", points: zinsPts }],
      height: 240, yMin: 0, xMin: 2008, xMax: 2027, xFormat: String, yFormat: v => `${v}`,
      markers: [{ x: 2027, y: b.zinsen, label: "2027", labelLeft: true, color: "var(--series-2)" }],
      xSnap: x => Math.round(x), label: "Zinsausgaben des Bundes 2008 bis 2027",
      tooltip: x => `<strong>${x}</strong><br>${fmtBn(valueAt(zinsPts, x), 1)}${x === 2026 ? " (interpoliert)" : ""}`
    });

    // Simulator
    const sc = card("Zins-Simulator bis 2040", "Jedes Jahr wird ein Teil der alten Schulden zum dann gültigen Marktzins neu finanziert; neue Kredite kommen hinzu. Start: Zinsen 2027 laut Haushalt.");
    const sim = h("div", { class: "sim-layout" });
    const simControls = h("div", { class: "sim-controls" });
    const simOut = h("div", { class: "sim-out" });
    sim.append(simControls, simOut);
    sc.appendChild(sim);
    wrap.appendChild(sc);

    const field = (label, key, min, max, step, fmt, base) => simControls.appendChild(rangeField({
      label, min, max, step, value: debtState[key], base, format: fmt,
      onInput: v => { debtState[key] = v; drawSim(); } }));
    field("Marktzins für neue Anleihen", "market", 0, 6, 0.1, v => fmtPct(v), 2.8);
    field("Ø Laufzeit der Schulden", "maturity", 2, 15, 0.5, v => `${v.toLocaleString("de-DE")} Jahre`, 7);
    field("Neue Kredite pro Jahr", "nka", 0, 300, 1, v => fmtBn(v, 0), neueKredite);
    field("Wachstum der Steuereinnahmen", "taxGrowth", 0, 6, 0.1, v => `${fmtPct(v)} p. a.`, 3);

    function simulate(market) {
      let D = debtState.debt, interest = b.zinsen, rate = interest / D, tax = b.steuern;
      const pts = [[2027, interest]], quota = [[2027, interest / tax * 100]];
      for (let y = 2028; y <= 2040; y++) {
        rate += (market / 100 - rate) / debtState.maturity;
        rate = (rate * D + market / 100 * debtState.nka) / (D + debtState.nka);
        D += debtState.nka;
        tax *= 1 + debtState.taxGrowth / 100;
        interest = D * rate;
        pts.push([y, interest]);
        quota.push([y, interest / tax * 100]);
      }
      return { pts, quota, debt: D, rate };
    }

    function drawSim() {
      const lo = simulate(Math.max(0, debtState.market - 1));
      const mid = simulate(debtState.market);
      const hi = simulate(debtState.market + 1);
      const last = mid.pts[mid.pts.length - 1][1];
      const lastQ = mid.quota[mid.quota.length - 1][1];
      simOut.innerHTML = "";
      simOut.appendChild(h("div", { class: "stat-row compact" },
        statTile("Zinsen 2040", fmtBn(last, 0), `${fmtSigned(last - b.zinsen, v => fmtBn(v, 0))} ggü. 2027`),
        statTile("Anteil an Steuereinnahmen", fmtPct(lastQ, 1), `2027: ${fmtPct(mid.quota[0][1], 1)}`, { tone: lastQ > 15 ? "warn" : "" }),
        statTile("Schulden 2040", fmtBn(mid.debt, 0), `Ø Zins ${fmtPct(mid.rate * 100, 2)}`)));
      const chart = h("div");
      simOut.appendChild(chart);
      const series = [
        { name: `Marktzins ${fmtPct(debtState.market + 1)}`, color: "var(--series-8)", points: hi.pts, dash: true },
        { name: `Marktzins ${fmtPct(debtState.market)}`, color: "var(--series-1)", points: mid.pts, width: 2.5 },
        { name: `Marktzins ${fmtPct(Math.max(0, debtState.market - 1))}`, color: "var(--series-3)", points: lo.pts, dash: true }
      ];
      lineChart(chart, {
        series, height: 260, xMin: 2027, xMax: 2040, yMin: 0, xFormat: String, yFormat: v => `${v}`,
        xSnap: x => Math.round(x), label: "Projektion der Zinsausgaben bis 2040",
        tooltip: x => `<strong>${x}</strong><br>` + series.map(s => `${s.name}: ${fmtBn(valueAt(s.points, x), 1)}`).join("<br>")
      });
    }
    drawSim();
    simControls.appendChild(h("p", { class: "hint" }, "Voreinstellung: Die Kreditaufnahme von Kernhaushalt und Sondervermögen bleibt auf dem Niveau von 2027. Die gestrichelten Linien zeigen die Wirkung von einem Prozentpunkt mehr oder weniger Marktzins."));

    // Schuldenbremse
    const bmv = b.ministries.find(m => m.id === "bmv");
    const regel = REF.bip2027 * 0.0035;
    const verteidigungAusnahme = bmv ? Math.max(0, bmv.value - REF.bip2027 * 0.01) : 0;
    const bc = card("Die Schuldenbremse, grob eingeordnet", "Art. 115 GG: strukturell höchstens 0,35 % des BIP neue Schulden – seit 2025 mit Ausnahmen");
    const bl = h("div");
    bc.appendChild(bl);
    wrap.appendChild(bc);
    barList(bl, [
      { label: "Regelgrenze (0,35 % des BIP)", value: regel, color: "var(--series-1)" },
      { label: "Verteidigung über 1 % des BIP", sub: "von der Schuldenbremse ausgenommen", value: verteidigungAusnahme, color: "var(--series-3)" },
      { label: "Finanzierungslücke 2027", sub: "aktueller Haushaltsstand", value: b.gap, color: "var(--series-2)" }
    ], { format: v => fmtBn(v, 1) });
    bc.appendChild(h("p", { class: "hint" }, "Vereinfachung: Die tatsächliche Berechnung berücksichtigt zusätzlich die Konjunkturkomponente, finanzielle Transaktionen und eine engere Abgrenzung der Verteidigungsausgaben. Das Sondervermögen Infrastruktur (500 Mrd. € über 12 Jahre) läuft außerhalb des Kernhaushalts."));

    wrap.appendChild(sourceNote("Quellen: Destatis/Eurostat (Schuldenquote), BMF Haushaltsrechnung (Zinsausgaben Ist), Regierungsentwurf 2027 (Zinsen 2027). Werte gerundet. Schuldenstand des Bundes Ende 2026 inkl. Sondervermögen: Größenordnung, vor Veröffentlichung prüfen."));
  }
});
