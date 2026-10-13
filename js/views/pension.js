// Bereich "Rente & Demografie": Altenquotient und ein grobes Modell, wie
// Rentenniveau, Renteneintrittsalter und Beitragsdeckel auf Beitragssatz und
// Bundeszuschuss durchschlagen. Startwert des Zuschusses kommt aus dem Haushalt.

const pensionState = { niveau: 48, alter: 67, deckel: 26 };

// Faustregel: ein Jahr späterer Renteneintritt senkt das Verhältnis von Rentnern
// zu Beitragszahlern um rd. 6 % (weniger Rentenbezieher, mehr Beschäftigte).
const RENTE_EFFEKT_JE_JAHR = 0.06;

function pensionPath({ niveau, alter, deckel }, zuschuss2027) {
  const r = REF.rente;
  const aq0 = interpSeries(REF.altenquotient, 2026);
  const aq27 = interpSeries(REF.altenquotient, 2027);
  const out = { aq: [], satz: [], zuschuss: [] };
  for (let y = 2026; y <= 2045; y++) {
    const phase = Math.min(1, Math.max(0, (y - 2029) / 6)); // Übergang 2030–2035
    const aq = interpSeries(REF.altenquotient, y) * (1 - RENTE_EFFEKT_JE_JAHR * (alter - 67) * phase);
    const satz = r.beitragssatz2026 * aq / aq0 * niveau / 48;
    const wachstum = Math.pow(1 + r.lohnwachstum / 100, y - 2027);
    let zuschuss = zuschuss2027 * wachstum * aq / aq27 * niveau / 48;
    const ueber = Math.max(0, satz - deckel);
    zuschuss += ueber / 100 * r.beitragsbasis2026 * Math.pow(1 + r.lohnwachstum / 100, y - 2026);
    out.aq.push([y, aq]);
    out.satz.push([y, Math.min(satz, deckel)]);
    out.satzOhneDeckel = out.satzOhneDeckel || [];
    out.satzOhneDeckel.push([y, satz]);
    out.zuschuss.push([y, zuschuss]);
  }
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

    const field = (label, key, min, max, step, fmt, base) => ctr.appendChild(rangeField({
      label, min, max, step, value: pensionState[key], base, format: fmt,
      onInput: v => { pensionState[key] = v; draw(); } }));
    field("Rentenniveau (Haltelinie)", "niveau", 40, 55, 0.5, v => fmtPct(v), 48);
    field("Regelaltersgrenze ab 2035", "alter", 65, 70, 0.5, v => `${v.toLocaleString("de-DE")} Jahre`, 67);
    field("Beitragssatz höchstens", "deckel", 18.6, 26, 0.1, v => fmtPct(v), 26);

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
    }
    draw();

    wrap.appendChild(sourceNote("Altenquotient: Destatis, 15. koordinierte Bevölkerungsvorausberechnung (moderate Variante), gerundet. Das Modell ist bewusst einfach: Es unterstellt einen konstanten Anteil des Bundeszuschusses an den Ausgaben, 3 % Lohnwachstum und eine Faustregel für das Renteneintrittsalter (rd. 6 % Entlastung je Jahr). Es ersetzt keine Rentenvorausberechnung der Bundesregierung."));
  }
});
