// Bereich "Subventionen": Finanzhilfen aus dem Bundeshaushalt, große
// Steuervergünstigungen und EU-Mittel. Streichungen lassen sich in die Haushalte
// von Bund und Ländern übernehmen.

const subsidyState = {
  cut: new Set(),          // gestrichene Finanzhilfen (Index in REF.finanzhilfen)
  rasenmaeher: 0,          // pauschale Kürzung aller übrigen Finanzhilfen in %
  abolish: new Set(),      // abgeschaffte Steuervergünstigungen (id)
  orig: {},                // Reglerwerte vor der ersten Übernahme (Finanzhilfen)
  appliedTax: {},          // bereits übernommene Steuer-Mehreinnahmen je Ziel-Regler
  inBudget: 0,             // Entlastung des Bundes, die bereits im Haushalt steckt
  applied: false
};

// Findet den Regler einer Finanzhilfe im Bund-Datensatz (Kernhaushalt oder Sondervermögen)
function findSubsidySlider(item) {
  for (const n of datasets.bund.nodes) {
    if (n.isAdvanced || !n.sliders) continue;
    const s = n.sliders.find(x => item.label.test(x.label));
    if (s) return { node: n, slider: s };
  }
  return null;
}

function subsidyOverview() {
  const items = REF.finanzhilfen.map((item, i) => {
    const hit = findSubsidySlider(item);
    const key = hit ? `${hit.node.id}|${hit.slider.label}` : null;
    const basis = key && key in subsidyState.orig ? subsidyState.orig[key] : hit ? Number(hit.slider.value) : 0;
    const neu = subsidyState.cut.has(i) ? 0 : basis * (1 - subsidyState.rasenmaeher / 100);
    return { ...item, i, hit, key, basis, neu };
  }).filter(x => x.hit);
  const taxes = REF.steuerverguenstigungen.map(t => {
    const ziele = REF.steuerZiele[t.steuer] || [];
    const bund = ziele.filter(z => z.ds === "bund").reduce((a, z) => a + z.anteil, 0) * t.kosten;
    return { ...t, bund, aktiv: subsidyState.abolish.has(t.id) };
  });
  const sparenFH = items.reduce((a, x) => a + x.basis - x.neu, 0);
  const mehrSteuer = taxes.filter(t => t.aktiv).reduce((a, t) => a + t.kosten, 0);
  const mehrSteuerBund = taxes.filter(t => t.aktiv).reduce((a, t) => a + t.bund, 0);
  return { items, taxes, sparenFH, mehrSteuer, mehrSteuerBund };
}

// Überträgt Streichungen in die Datensätze. Merkt sich, was schon übernommen
// wurde, damit wiederholtes Übernehmen nicht doppelt zählt und sich mit
// Änderungen aus anderen Bereichen verträgt.
function applySubsidies() {
  const o = subsidyOverview();
  o.items.forEach(x => {
    if (!(x.key in subsidyState.orig)) subsidyState.orig[x.key] = Number(x.hit.slider.value);
    x.hit.slider.value = roundBetrag(x.neu);
  });

  const target = {};
  o.taxes.filter(t => t.aktiv).forEach(t => (REF.steuerZiele[t.steuer] || []).forEach(z => {
    const key = `${z.ds}|${z.node}|${z.label.source}`;
    target[key] = (target[key] || { z, delta: 0 });
    target[key].delta += t.kosten * z.anteil;
  }));
  const keys = new Set([...Object.keys(target), ...Object.keys(subsidyState.appliedTax)]);
  keys.forEach(key => {
    const prev = subsidyState.appliedTax[key] || { delta: 0 };
    const next = target[key] || { z: prev.z, delta: 0 };
    const z = next.z || prev.z;
    const slider = findSlider(z.ds, z.node, z.label);
    if (slider) setSliderIn(z.ds, z.node, z.label, Number(slider.value) - prev.delta + next.delta);
    subsidyState.appliedTax[key] = next;
  });
  data = currentTab === "gesamt" ? data : datasets[currentTab];
  subsidyState.inBudget = o.sparenFH + o.mehrSteuerBund;
  subsidyState.applied = true;
}

pageView({
  id: "subventionen",
  title: "Subventionen",
  icon: "⚑",
  teaser() {
    const o = subsidyOverview();
    const total = o.items.reduce((a, x) => a + x.basis, 0) + o.taxes.reduce((a, t) => a + t.kosten, 0);
    return { value: fmtBn(total, 0), label: "für die größten Finanzhilfen und Steuervergünstigungen pro Jahr" };
  },
  render: renderSubsidyPage
});

function renderSubsidyPage(el) {
  el.innerHTML = "";
  const wrap = h("div", { class: "page-inner" });
  el.appendChild(wrap);
  wrap.appendChild(pageHeader("Finanzhilfen, Steuervergünstigungen und EU-Mittel", "Subventionen: Wer bekommt was?",
    "Der Staat fördert auf zwei Wegen: mit Geld aus dem Haushalt und mit Steuern, die er gar nicht erst erhebt. Dazu kommen Mittel aus Brüssel. Streichen Sie, was Sie für verzichtbar halten – und übernehmen Sie das Ergebnis in den Haushalt."));

  const stats = h("div", { class: "stat-row" });
  wrap.appendChild(stats);

  const subnav = h("nav", { class: "subnav", "aria-label": "Abschnitte" });
  wrap.appendChild(subnav);

  // Finanzhilfen
  const fhSec = h("section", { class: "page-section" }, h("h2", { class: "section-title" }, "Finanzhilfen aus dem Bundeshaushalt"));
  const fhCard = card("Direkte Zahlungen an Unternehmen und Haushalte", "Werte live aus dem Haushalt. Haken setzen = Posten streichen; der Regler kürzt alle übrigen pauschal („Rasenmäher“).");
  const fhList = h("div");
  fhCard.appendChild(rangeField({ label: "Pauschale Kürzung aller übrigen Finanzhilfen", min: 0, max: 50, step: 1,
    value: subsidyState.rasenmaeher, base: 0, format: v => fmtPct(v, 0),
    onInput: v => { subsidyState.rasenmaeher = v; subsidyState.applied = false; refresh(); } }));
  fhCard.appendChild(fhList);
  fhSec.appendChild(fhCard);
  wrap.appendChild(fhSec);

  // Steuervergünstigungen
  const svSec = h("section", { class: "page-section" }, h("h2", { class: "section-title" }, "Steuervergünstigungen"));
  const svCard = card("Steuern, die der Staat nicht erhebt", "Mindereinnahmen aller Ebenen pro Jahr. Haken setzen = Vergünstigung abschaffen (statische Rechnung ohne Verhaltensänderungen).");
  const svList = h("div");
  svCard.appendChild(svList);
  svSec.appendChild(svCard);
  wrap.appendChild(svSec);

  // Übernahme
  const applyBox = h("div", { class: "card apply-card" });
  wrap.appendChild(applyBox);

  // EU
  const euSec = h("section", { class: "page-section" }, h("h2", { class: "section-title" }, "EU-Mittel für Deutschland"));
  wrap.appendChild(euSec);
  renderEuFunds(euSec);

  const sections = [["Finanzhilfen", fhSec], ["Steuervergünstigungen", svSec], ["EU-Mittel", euSec]];
  sections.forEach(([label, sec]) => subnav.appendChild(h("button", { type: "button", class: "chip",
    onclick: () => sec.scrollIntoView({ behavior: "smooth", block: "start" }) }, label)));

  wrap.appendChild(sourceNote("Finanzhilfen: Regierungsentwurf 2027 inkl. Klima- und Transformationsfonds (KTF) und Sondervermögen Infrastruktur (SVIK); Auswahl der größten Posten mit Subventionscharakter. Steuervergünstigungen: Größenordnungen nach Subventionsbericht der Bundesregierung, Umweltbundesamt und Kiel Institut – die Abgrenzung ist umstritten (z. B. gelten Splitting und ermäßigter Mehrwertsteuersatz offiziell nicht als Subvention). Mehreinnahmen werden nach den gesetzlichen Anteilen auf Bund und Länder verteilt; der Gemeindeanteil (Einkommensteuer 15 %) ist nicht dargestellt. EU-Mittel: Durchschnittswerte, Auszahlungen schwanken von Jahr zu Jahr stark."));

  function refresh() {
    const o = subsidyOverview();
    const fhTotal = o.items.reduce((a, x) => a + x.basis, 0);
    const svTotal = o.taxes.reduce((a, t) => a + t.kosten, 0);
    const euTotal = REF.euMittel.reduce((a, x) => a + x.wert, 0);
    stats.innerHTML = "";
    stats.append(
      statTile("Finanzhilfen (Auswahl)", fmtBn(fhTotal, 1), `${o.items.length} Posten im Bundeshaushalt`),
      statTile("Steuervergünstigungen (Auswahl)", fmtBn(svTotal, 1), "Mindereinnahmen aller Ebenen"),
      statTile("EU-Mittel für Deutschland", fmtBn(euTotal, 1), "pro Jahr, Durchschnitt"),
      statTile("Ihre Streichungen", fmtBn(o.sparenFH + o.mehrSteuer, 1), `davon Bund ${fmtBn(o.sparenFH + o.mehrSteuerBund, 1)}`,
        { tone: o.sparenFH + o.mehrSteuer > 0 ? "good" : "" }));

    fhList.innerHTML = "";
    const maxFH = Math.max(...o.items.map(x => x.basis));
    o.items.sort((a, b) => b.basis - a.basis).forEach(x => fhList.appendChild(toggleRow({
      checked: subsidyState.cut.has(x.i), label: x.name, sub: x.kat, value: x.basis, max: maxFH,
      after: x.neu !== x.basis ? x.neu : null,
      onToggle: on => { on ? subsidyState.cut.add(x.i) : subsidyState.cut.delete(x.i); subsidyState.applied = false; refresh(); },
      onOpen: () => openInBudget(x.hit.node.id)
    })));

    svList.innerHTML = "";
    const maxSV = Math.max(...o.taxes.map(t => t.kosten));
    o.taxes.forEach(t => svList.appendChild(toggleRow({
      checked: t.aktiv, label: t.name, sub: t.sub, value: t.kosten, max: maxSV, note: t.note, color: "var(--series-2)",
      extra: t.bund ? `Bund ${fmtBn(t.bund, 1)}` : "Länder",
      onToggle: on => { on ? subsidyState.abolish.add(t.id) : subsidyState.abolish.delete(t.id); subsidyState.applied = false; refresh(); }
    })));

    applyBox.innerHTML = "";
    const b = budgetSnapshot();
    const bundEffekt = o.sparenFH + o.mehrSteuerBund;
    applyBox.append(
      h("div", { class: "apply-summary" },
        h("div", {}, h("strong", {}, "Mehr Spielraum für den Bund: "), fmtBn(bundEffekt, 1), " pro Jahr",
          h("span", { class: "hint" }, ` – ${fmtPct(Math.min(100, bundEffekt / Math.max(1e-9, b.gap + subsidyState.inBudget) * 100), 0)} der Finanzierungslücke`)),
        h("div", { class: "hint" }, `Länder zusätzlich ${fmtBn(o.mehrSteuer - o.mehrSteuerBund, 1)}. Ohne Verhaltensänderungen – gerade bei Diesel, Kerosin und Pendlerpauschale wären die Einnahmen geringer und Preise höher.`)),
      h("div", { class: "apply-row" },
        h("button", { type: "button", class: "primary-btn inline", onclick: () => { applySubsidies(); refresh(); } }, "In die Haushalte übernehmen"),
        subsidyState.applied ? h("span", { class: "hint ok" }, "Übernommen. ", h("a", { href: "#/haushalt/bund" }, "Bund ansehen →"), " · ", h("a", { href: "#/haushalt/laender" }, "Länder ansehen →")) : null));
  }
  refresh();
}

function toggleRow({ checked, label, sub, value, max, after, note, extra, color, onToggle, onOpen }) {
  const input = h("input", { type: "checkbox", "aria-label": `${label} streichen` });
  input.checked = checked;
  input.addEventListener("change", () => onToggle(input.checked));
  const fill = h("span", { class: "bar-fill", style: `width:${value / max * 100}%;background:${color || "var(--series-1)"}` });
  const afterFill = after != null ? h("span", { class: "bar-fill after", style: `width:${after / max * 100}%` }) : null;
  return h("div", { class: `toggle-row${checked ? " off" : ""}`, title: note || null },
    h("label", { class: "toggle-check" }, input),
    h("span", { class: "bar-label" },
      onOpen ? h("button", { type: "button", class: "link-btn", onclick: onOpen, title: "Im Haushalt öffnen" }, label) : label,
      h("small", {}, sub, note ? " ⓘ" : "")),
    h("span", { class: "bar-track" }, fill, afterFill),
    h("span", { class: "bar-value" }, after != null && after !== value ? h("s", {}, fmtNumber(value, 1)) : null,
      after != null && after !== value ? ` ${fmtNumber(after, 1)}` : fmtNumber(value, 1),
      extra ? h("small", {}, extra) : null));
}

function renderEuFunds(sec) {
  const b = budgetSnapshot();
  const eu = datasets.bund.nodes.find(n => n.id === "eu");
  const beitrag = eu ? eu.sliders.filter(s => /^EU-Eigenmittel/.test(s.label)).reduce((a, s) => a + Number(s.value), 0) : 0;
  const erhalt = REF.euMittel.reduce((a, x) => a + x.wert, 0);

  sec.appendChild(h("div", { class: "stat-row" },
    statTile("Deutschland zahlt", fmtBn(beitrag, 1), "EU-Eigenmittel 2027 laut Haushalt", { href: "#/haushalt/bund:eu" }),
    statTile("Deutschland erhält", fmtBn(erhalt, 1), "Rückflüsse pro Jahr (Durchschnitt)"),
    statTile("Nettobeitrag", fmtBn(beitrag - erhalt, 1), `rd. ${fmtEUR((beitrag - erhalt) * 1e9 / REF.einwohner)} pro Kopf`, { tone: "warn" })));

  const grid = h("div", { class: "grid-2" });
  sec.appendChild(grid);
  const c1 = card("Wofür fließt EU-Geld nach Deutschland?", "Mrd. € pro Jahr");
  const l1 = h("div");
  c1.appendChild(l1);
  barList(l1, REF.euMittel.map((x, i) => ({ label: x.name, sub: x.sub, value: x.wert, color: i === 0 || i === 4 ? "var(--series-3)" : "var(--series-1)" })),
    { format: v => fmtNumber(v, 1) });
  c1.appendChild(legend([{ name: "Agrarpolitik", color: "var(--series-3)" }, { name: "Übrige Programme", color: "var(--series-1)" }]));
  grid.appendChild(c1);

  const c2 = card("Agrarsubventionen: wer profitiert?", "Direktzahlungen hängen überwiegend an der Fläche");
  const agrar = REF.euMittel[0].wert + REF.euMittel[4].wert;
  c2.appendChild(h("div", { class: "stat-row compact" },
    statTile("Agrar-Mittel aus Brüssel", fmtBn(agrar, 1), "pro Jahr"),
    statTile("EU-weit", "80 / 20", "rd. 80 % der Direktzahlungen gehen an rd. 20 % der Betriebe")));
  c2.appendChild(h("ul", { class: "fact-list" },
    h("li", {}, "Weil vor allem pro Hektar gezahlt wird, erhalten große Betriebe und Flächeneigentümer den größten Teil – in Deutschland besonders in Ostdeutschland mit seinen großen Agrarbetrieben."),
    h("li", {}, "Ein Teil ist an Umweltauflagen gebunden („Eco-Schemes“); kleine Betriebe und die ersten Hektare werden bevorzugt („Umverteilungsprämie“)."),
    h("li", {}, "Neben EU-Mitteln fördert der Staat Unternehmen national: Deutschland gehört laut EU-Beihilfeanzeiger regelmäßig zu den größten Beihilfegebern in der EU – etwa mit Strompreishilfen und Chipfabriken.")));
  grid.appendChild(c2);
}
