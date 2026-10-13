// Bereich "Steuerquittung": persönliche Abgaben und wofür der Bund sie ausgibt.
// Die Aufteilung folgt den aktuellen Reglerwerten im Haushalt.

const receiptState = { gross: 50400, married: false, kids: 0, konsum: 85 };

// Effektive Belastung des Konsums (Anteil am Bruttokonsum inkl. Steuer)
const MWST_EFFEKTIV = 0.55 * 19 / 119 + 0.20 * 7 / 107; // rd. 55 % Regelsatz, 20 % ermäßigt, Rest steuerfrei (Miete u. a.)
const VERBRAUCHSTEUERN_EFFEKTIV = 0.025;               // Energie, Strom, Tabak, Alkohol … im Durchschnitt
const MWST_ANTEIL_BUND = 0.50;

pageView({
  id: "quittung",
  title: "Steuerquittung",
  icon: "🧾",
  teaser(b) {
    const share = b.ministries[0];
    return share ? { value: `${Math.round(share.value / b.expenseGross * 100)} Cent`, label: `von jedem Euro an den Bund fließen in „${share.name}“` } : null;
  },
  render(el) {
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);
    wrap.appendChild(pageHeader("Persönlich", "Ihre Steuerquittung",
      "Wie viel zahlen Sie – direkt und beim Einkaufen – und wofür gibt der Bund Ihren Anteil aus? Die Aufteilung folgt live dem Haushalt."));

    const layout = h("div", { class: "receipt-layout" });
    const form = h("div", { class: "card controls" });
    const out = h("div", { class: "receipt-out" });
    layout.append(form, out);
    wrap.appendChild(layout);

    form.appendChild(h("h2", { class: "card-title" }, "Ihre Angaben"));
    form.appendChild(rangeField({ label: "Bruttojahresgehalt", min: 15000, max: 300000, step: 500, value: receiptState.gross,
      format: v => fmtEUR(v), onInput: v => { receiptState.gross = v; draw(); } }));
    form.appendChild(rangeField({ label: "Kinder", min: 0, max: 4, step: 1, value: receiptState.kids,
      format: v => String(v), onInput: v => { receiptState.kids = v; draw(); } }));
    form.appendChild(rangeField({ label: "Anteil des Nettos, der ausgegeben wird", min: 50, max: 100, step: 1, value: receiptState.konsum,
      format: v => fmtPct(v, 0), onInput: v => { receiptState.konsum = v; draw(); } }));
    const married = h("input", { type: "checkbox" });
    married.checked = receiptState.married;
    married.addEventListener("change", () => { receiptState.married = married.checked; draw(); });
    form.appendChild(h("label", { class: "check-field" }, married, "verheiratet, Partner ohne Einkommen"));
    form.appendChild(h("p", { class: "hint" }, "Indirekte Steuern sind Durchschnittswerte: rd. 10 % des Konsums Mehrwertsteuer, 2,5 % Verbrauchsteuern."));

    function draw() { renderReceipt(out); }
    draw();

    wrap.appendChild(sourceNote("Bundesanteile: Einkommensteuer 42,5 %, Mehrwertsteuer rd. 50 %, Soli und Verbrauchsteuern 100 %. Der Bundesanteil wird im Verhältnis der Ressortausgaben aufgeteilt – auch der kreditfinanzierte Teil der Ausgaben ist dabei mitgedacht, deshalb der Hinweis zum Kredit. Arbeitgeberbeiträge zur Sozialversicherung kommen in ähnlicher Höhe hinzu."));
  }
});

function renderReceipt(out) {
  const s = receiptState;
  const hh = { incomes: s.married ? [s.gross, 0] : [s.gross], married: s.married, kids: s.kids };
  const r = computeHousehold(hh);
  const sv = socialContributions(s.gross, s.kids);
  const konsum = r.net * s.konsum / 100;
  const mwst = konsum * MWST_EFFEKTIV;
  const verbrauch = konsum * VERBRAUCHSTEUERN_EFFEKTIV;

  const bundShare = r.est * 0.425 + r.soli + mwst * MWST_ANTEIL_BUND + verbrauch;
  const andere = r.est * 0.575 + mwst * (1 - MWST_ANTEIL_BUND);
  const steuern = r.est + r.soli + mwst + verbrauch;

  const b = budgetSnapshot();
  const lines = b.ministries.map(m => ({ ...m, amount: bundShare * m.value / b.expenseGross }));
  const top = lines.slice(0, 12);
  const rest = lines.slice(12).reduce((a, l) => a + l.amount, 0);
  const kreditFaktor = b.gap > 0 ? b.expense / b.income : 1;

  out.innerHTML = "";
  const paper = h("div", { class: "receipt", role: "group", "aria-label": "Steuerquittung" });
  const line = (label, value, cls = "") => h("div", { class: `r-line ${cls}` }, h("span", {}, label), h("span", {}, fmtEUR(value)));

  paper.append(...[
    h("div", { class: "r-head" }, h("strong", {}, "BUNDESKASSE"), h("span", {}, "Quittung · Haushaltsjahr 2027"), h("span", {}, "* * * * * * * * * *")),
    h("div", { class: "r-section" }, "IHRE ABGABEN PRO JAHR"),
    line("Einkommensteuer", r.est),
    r.soli ? line("Solidaritätszuschlag", r.soli) : null,
    line("Mehrwertsteuer (geschätzt)", mwst),
    line("Verbrauchsteuern (geschätzt)", verbrauch),
    r.kindergeld ? line("Kindergeld (zurück)", -r.kindergeld, "minus") : null,
    line("Steuern gesamt", steuern - r.kindergeld, "total"),
    h("div", { class: "r-sub" }, `davon an den Bund: ${fmtEUR(bundShare)} · an Länder & Gemeinden: ${fmtEUR(andere)}`),
    h("div", { class: "r-section" }, "SO VERWENDET DER BUND IHRE " + fmtEUR(bundShare).toUpperCase()),
    ...top.map(l => {
      const row = line(l.name, l.amount, "clickable");
      row.title = `${l.name} im Haushalt öffnen`;
      row.addEventListener("click", () => openInBudget(l.id));
      return row;
    }),
    rest > 0 ? line(`Übrige ${lines.length - 12} Ressorts`, rest) : null,
    h("div", { class: "r-section" }, "SOZIALVERSICHERUNG (IHR ANTEIL)"),
    line("Rentenversicherung", sv.rv),
    line("Krankenversicherung", sv.kv),
    line("Pflegeversicherung", sv.pv),
    line("Arbeitslosenversicherung", sv.av),
    line("Sozialabgaben gesamt", sv.total, "total"),
    h("div", { class: "r-foot" },
      h("div", {}, `Pro Tag zahlen Sie ${fmtEUR((steuern - r.kindergeld + sv.total) / 365, 2)} an den Staat.`),
      b.gap > 0 ? h("div", {}, `Weil der Bund ${fmtPct((1 - 1 / kreditFaktor) * 100, 0)} seiner Ausgaben über Kredite deckt, stehen jedem Ihrer Euro ${fmtEUR(kreditFaktor - 1, 2)} Schulden gegenüber – zusammen ${fmtEUR(bundShare * (kreditFaktor - 1))}.`) : null,
      h("div", { class: "r-thanks" }, "Vielen Dank für Ihren Beitrag!"))].filter(Boolean));
  out.appendChild(paper);

  // Visual: Verteilung des Bundesanteils
  const chartCard = card("Ihr Bundesanteil nach Ressort", "Anteil an Ihren Zahlungen an den Bund");
  const list = h("div");
  chartCard.appendChild(list);
  out.appendChild(chartCard);
  barList(list, top.slice(0, 8).map(l => ({ label: l.name, value: l.amount, sub: fmtPct(l.amount / bundShare * 100), onClick: () => openInBudget(l.id) })),
    { format: v => fmtEUR(v) });
}
