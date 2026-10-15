// Bereich "Übersicht": Kennzahlen des Haushalts und Einstieg in alle Bereiche

pageView({
  id: "overview",
  title: "Übersicht",
  icon: "◎",
  render(el) {
    const b = budgetSnapshot();
    el.innerHTML = "";
    const wrap = h("div", { class: "page-inner" });
    el.appendChild(wrap);

    wrap.appendChild(pageHeader(
      "Bundeshaushalt 2027 · Regierungsentwurf",
      "Die Staatsfinanzen auf einen Blick",
      "Woher das Geld kommt, wohin es fließt und was das für Bürgerinnen und Bürger bedeutet. Alle Zahlen folgen live den Reglern im Haushalt."
    ));

    if (b.changed) {
      const delta = b.balanceDelta;
      wrap.appendChild(h("div", { class: "notice" },
        h("strong", {}, "Eigenes Szenario aktiv: "),
        `Der Saldo des Bundes liegt ${fmtSigned(delta, v => fmtBn(v))} ${delta >= 0 ? "über" : "unter"} dem Regierungsentwurf. `,
        h("a", { href: "#/haushalt/bund" }, "Zum Haushalt →")));
    }

    // Kennzahlen
    const perHead = b.expense * 1e9 / REF.einwohner;
    const creditShare = b.gap / b.expense * 100;
    wrap.appendChild(h("div", { class: "stat-row" },
      statTile("Ausgaben des Bundes", fmtBn(b.expense, 1), `${fmtEUR(perHead)} pro Kopf · ${fmtEUR(perHead / 365)} pro Tag`),
      statTile("Einnahmen ohne Kredite", fmtBn(b.income, 1), `davon Steuern ${fmtBn(b.steuern, 0)}`),
      statTile("Finanzierungslücke", fmtBn(b.gap, 1),
        b.gap > 0 ? `jeder ${Math.max(1, Math.round(100 / creditShare))}. Euro auf Kredit (${fmtPct(creditShare, 0)})` : "Überschuss",
        { tone: b.gap > 0 ? "warn" : "good" }),
      statTile("Zinsausgaben", fmtBn(b.zinsen, 1), `${fmtPct(b.zinsen / b.steuern * 100)} der Steuereinnahmen`, { href: "#/schulden" }),
      statTile("Sondervermögen", fmtBn(b.sonder.expense, 1), `zusätzlich, davon ${fmtBn(b.sonder.kredite, 0)} über Kredite`, { href: "#/haushalt/bund:sv" })
    ));

    // Geldflüsse
    const flows = h("div", { class: "grid-2" });
    const outCard = card("Wohin fließt das Geld?", "Ausgaben nach Ressort, Klick öffnet die Karte im Haushalt");
    const outList = h("div");
    outCard.appendChild(outList);
    const inCard = card("Woher kommt es?", "Einnahmen nach Art (Steuern brutto, vor Abführung an EU und Länder) und Kreditbedarf");
    const inList = h("div");
    inCard.appendChild(inList);
    flows.append(outCard, inCard);
    wrap.appendChild(flows);

    const top = b.ministries.slice(0, 9);
    const rest = b.ministries.slice(9).reduce((a, m) => a + m.value, 0);
    barList(outList, [
      ...top.map(m => ({ label: m.name, value: m.value, onClick: () => openInBudget(m.id), title: `${m.name} im Haushalt öffnen` })),
      { label: `Übrige ${b.ministries.length - 9} Ressorts`, value: rest, color: "var(--series-muted)" }
    ], { format: v => fmtNumber(v, 1) });

    const topIn = b.revenues.slice(0, 7);
    const restIn = b.revenues.slice(7).reduce((a, r) => a + r.value, 0);
    barList(inList, [
      ...topIn.map(r => ({ label: r.label, value: r.value, color: "var(--series-3)", onClick: () => openInBudget("fm") })),
      { label: "Übrige Einnahmen", value: restIn, color: "var(--series-muted)" },
      ...(b.gap > 0 ? [{ label: "Kredite & Rücklagen", value: b.gap, color: "var(--series-2)", sub: "Lücke zwischen Ausgaben und Einnahmen" }] : [])
    ], { format: v => fmtNumber(v, 1), max: Math.max(...b.ministries.map(m => m.value), b.gap) });

    // Staat insgesamt
    const staat = card("Der Staat insgesamt", "Bund, Sozialversicherungen und Länder – ohne Verrechnung der Zuschüsse untereinander");
    staat.appendChild(h("div", { class: "stat-row compact" },
      statTile("Bund", fmtBn(b.expense + b.sonder.expense, 0), "Kernhaushalt und Sondervermögen", { href: "#/haushalt/bund" }),
      statTile("Sozialkassen", fmtBn(b.sozial.expense, 0), "Rente, Kranken-, Pflege-, Arbeitslosenvers.", { href: "#/haushalt/sozial" }),
      statTile("Länder", fmtBn(b.laender.expense, 0), "Ausgaben", { href: "#/haushalt/laender" })
    ));
    wrap.appendChild(staat);

    // Bereiche
    wrap.appendChild(h("h2", { class: "section-title" }, "Bereiche"));
    const tiles = h("div", { class: "section-tiles" });
    VIEWS.filter(v => v.id !== "overview").forEach(v => {
      const t = v.teaser ? v.teaser(b) : null;
      tiles.appendChild(h("a", { class: "section-tile", href: `#/${v.id}` },
        h("span", { class: "tile-icon", "aria-hidden": "true" }, v.icon),
        h("span", { class: "tile-title" }, v.title),
        h("span", { class: "tile-desc" }, VIEW_DESCRIPTIONS[v.id] || ""),
        t ? h("span", { class: "tile-teaser" }, h("strong", {}, t.value), " ", t.label) : null));
    });
    wrap.appendChild(tiles);

    wrap.appendChild(sourceNote("Bund: Regierungsentwurf Bundeshaushalt 2027. Ausgaben und Einnahmen des Kernhaushalts netto, also ohne die Steueranteile von EU und Ländern (in der Liste als „EU und Länder“). Pro-Kopf-Werte bei 83,5 Mio. Einwohnern. Die Finanzierungslücke enthält neben der Nettokreditaufnahme (118,7 Mrd. €) auch Münzeinnahmen und Rücklagenbewegungen."));
  }
});

const VIEW_DESCRIPTIONS = {
  haushalt: "Alle Ressorts und Einnahmen als Karten mit Reglern – das Herzstück zum Durchspielen.",
  steuern: "Was Steuern und Abgaben für typische Haushalte bedeuten – und wie sich Reformen auswirken.",
  quittung: "Ihre persönliche Steuerquittung: wofür der Bund Ihr Geld ausgibt.",
  verteilung: "Wie Einkommen und Vermögen verteilt sind – und wo Sie selbst stehen.",
  schulden: "Schuldenstand, Zinslast und was steigende Zinsen für den Haushalt bedeuten.",
  rente: "Alternde Gesellschaft, Beitragssatz, Bundeszuschuss – und was passiert, wenn alle einzahlen.",
  subventionen: "Finanzhilfen, Steuervergünstigungen und EU-Mittel – streichen und in den Haushalt übernehmen.",
  gesundheit: "Beitragsbemessungsgrenze, PKV und die Bürgerversicherung im Szenario-Vergleich."
};

function card(title, sub) {
  return h("section", { class: "card" },
    h("h2", { class: "card-title" }, title),
    sub ? h("p", { class: "card-sub" }, sub) : null);
}
