// ──────────────────────────────────────────────────────────────
// STEUER- UND ABGABENRECHNER (Rechtsstand 2026, vereinfacht)
//
// Bildet Lohn- und Einkommensteuer, Solidaritätszuschlag, Arbeitnehmer-Sozialabgaben
// und Kindergeld/Kinderfreibetrag für Beschäftigte ab. Nicht abgebildet: Midi-/Minijobs,
// Kirchensteuer, Kapitalerträge, Werbungskosten über der Pauschale, Private KV.
//
// Der Tarif ist als linear steigender Grenzsteuersatz in zwei Zonen formuliert –
// genau so ist § 32a EStG aufgebaut. Mit den Standardwerten reproduziert er den
// amtlichen Tarif 2026 auf den Euro (siehe TAX_SELFTEST unten).

const TAX_BASE = {
  freibetrag: 12348,        // Grundfreibetrag 2026
  eingangssatz: 14,         // Grenzsteuersatz am Grundfreibetrag (%)
  knickAbstand: 5451,       // Ende der ersten Progressionszone = Grundfreibetrag + Abstand
  knickSatz: 23.97,         // Grenzsteuersatz am Knick (%)
  progEndeSatz: 42,         // Grenzsteuersatz am Ende der Progressionszone
  spitzeAb: 69879,          // Beginn Spitzensteuersatz
  spitzensatz: 42,          // gilt ab spitzeAb; weicht er von progEndeSatz ab, springt der Grenzsteuersatz dort
  reichAb: 277826,          // Beginn "Reichensteuer"
  reichsatz: 45,
  soliSatz: 5.5,
  soliFreigrenze: 20350,    // ESt-Betrag (Einzelveranlagung), doppelt bei Zusammenveranlagung
  kindergeld: 259,          // € pro Kind und Monat
  kinderfreibetrag: 9756,   // je Kind, Elternpaar (inkl. BEA-Freibetrag)
  splitting: true           // false = Individualbesteuerung mit übertragbarem Grundfreibetrag
};

const SV_2026 = {
  bbgRV: 101400,            // Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung (€/Jahr)
  bbgKV: 69750,             // Beitragsbemessungsgrenze Kranken-/Pflegeversicherung
  rv: 9.3, av: 1.3,
  kv: 7.3 + 1.45,           // allg. Beitrag + halber durchschnittlicher Zusatzbeitrag (2,9 %)
  pv: 1.8, pvKinderlos: 0.6, pvAbschlagJeKind: 0.25
};

const WERBUNGSKOSTEN = 1230;
const SONDERAUSGABEN = 36;
const ENTLASTUNG_ALLEINERZIEHENDE = 4260;

// Grenzsteuersatz (%) bei zu versteuerndem Einkommen z
function marginalRate(z, p = TAX_BASE) {
  const knick = p.freibetrag + p.knickAbstand;
  if (z <= p.freibetrag) return 0;
  if (z <= knick) return p.eingangssatz + (p.knickSatz - p.eingangssatz) * (z - p.freibetrag) / p.knickAbstand;
  if (z <= p.spitzeAb) return p.knickSatz + (p.progEndeSatz - p.knickSatz) * (z - knick) / Math.max(1, p.spitzeAb - knick);
  return z <= p.reichAb ? p.spitzensatz : p.reichsatz;
}

// Tarifliche Einkommensteuer: Integral über den Grenzsteuersatz
function incomeTax(z, p = TAX_BASE) {
  z = Math.floor(Math.max(0, z));
  const knick = p.freibetrag + p.knickAbstand;
  const spitzeAb = Math.max(p.spitzeAb, knick + 1);
  const trapez = (a, b, rA, rB) => Math.max(0, b - a) * (rA + rB) / 200;
  let t = 0;
  if (z <= p.freibetrag) return 0;
  const z1 = Math.min(z, knick);
  t += trapez(p.freibetrag, z1, p.eingangssatz, marginalRate(z1, p));
  if (z > knick) {
    const z2 = Math.min(z, spitzeAb);
    t += trapez(knick, z2, p.knickSatz, marginalRate(z2, p));
  }
  if (z > spitzeAb) {
    const z3 = Math.min(z, Math.max(p.reichAb, spitzeAb));
    t += (z3 - spitzeAb) * p.spitzensatz / 100;
  }
  if (z > Math.max(p.reichAb, spitzeAb)) t += (z - Math.max(p.reichAb, spitzeAb)) * p.reichsatz / 100;
  return Math.floor(t);
}

function soli(est, joint, p = TAX_BASE) {
  const grenze = p.soliFreigrenze * (joint ? 2 : 1);
  if (est <= grenze) return 0;
  return Math.min(est * p.soliSatz / 100, (est - grenze) * 0.119 * (p.soliSatz / 5.5));
}

// Arbeitnehmeranteile zur Sozialversicherung
function socialContributions(gross, kids) {
  const s = SV_2026;
  const baseRV = Math.min(gross, s.bbgRV);
  const baseKV = Math.min(gross, s.bbgKV);
  let pvRate = s.pv + (kids === 0 ? s.pvKinderlos : 0) - (kids >= 2 ? Math.min(kids, 5) - 1 : 0) * s.pvAbschlagJeKind;
  const rv = baseRV * s.rv / 100, av = baseRV * s.av / 100;
  const kv = baseKV * s.kv / 100, pv = baseKV * pvRate / 100;
  return { rv, av, kv, pv, total: rv + av + kv + pv };
}

// Zu versteuerndes Einkommen einer Person (Pauschalen + Vorsorgeaufwendungen)
function taxableIncome(gross, sv) {
  if (gross <= 0) return 0;
  const vorsorge = sv.rv + sv.kv * 0.96 + sv.pv; // KV ohne Krankengeld-Anteil
  return Math.max(0, gross - Math.min(gross, WERBUNGSKOSTEN) - SONDERAUSGABEN - vorsorge);
}

// Steuer eines Haushalts für gegebene zvE (mit oder ohne Kinderfreibeträge)
function householdIncomeTax(z1, z2, married, p) {
  if (!married) return incomeTax(z1, p);
  if (p.splitting) return 2 * incomeTax((z1 + z2) / 2, p);
  // Individualbesteuerung: ungenutzter Grundfreibetrag geht auf den Partner über
  const [hi, lo] = z1 >= z2 ? [z1, z2] : [z2, z1];
  const unused = Math.max(0, p.freibetrag - lo);
  return incomeTax(hi - unused, p) + incomeTax(lo, p);
}

// Haushalt: { incomes: [brutto1, brutto2?], married, kids, singleParent }
function computeHousehold(h, p = TAX_BASE) {
  const kids = h.kids || 0;
  const incomes = h.incomes.filter(x => x > 0);
  const married = Boolean(h.married) && h.incomes.length > 1;
  const people = h.incomes.map(g => {
    const sv = socialContributions(g, kids);
    return { gross: g, sv, zve: taxableIncome(g, sv) };
  });

  const gross = people.reduce((a, b) => a + b.gross, 0);
  const svTotal = people.reduce((a, b) => a + b.sv.total, 0);

  if (!married && people.length > 1) {
    // Unverheiratetes Paar: jede Person für sich, Kinder bei der ersten Person
    const parts = people.map((person, i) => computeHousehold(
      { incomes: [person.gross], kids: i === 0 ? kids : 0, singleParent: false }, p));
    const sum = k => parts.reduce((a, b) => a + b[k], 0);
    return { gross, sv: svTotal, est: sum("est"), soli: sum("soli"), kindergeld: sum("kindergeld"),
      net: sum("net"), zve: sum("zve") };
  }

  let z1 = people[0] ? people[0].zve : 0;
  let z2 = people[1] ? people[1].zve : 0;
  if (h.singleParent && kids > 0) z1 = Math.max(0, z1 - ENTLASTUNG_ALLEINERZIEHENDE - 240 * (kids - 1));

  const estOhneFB = householdIncomeTax(z1, z2, married, p);
  // Kinderfreibetrag: bei Paaren hälftig, Alleinerziehende hier vereinfachend voll
  const fb = kids * p.kinderfreibetrag;
  const estMitFB = married
    ? householdIncomeTax(Math.max(0, z1 - fb / 2), Math.max(0, z2 - fb / 2), true, p)
    : householdIncomeTax(Math.max(0, z1 - fb), 0, false, p);

  const kindergeldJahr = kids * p.kindergeld * 12;
  // Günstigerprüfung: Freibetrag nur, wenn die Steuerersparnis das Kindergeld übersteigt
  const fbBesser = kids > 0 && estOhneFB - estMitFB > kindergeldJahr;
  const est = fbBesser ? estMitFB : estOhneFB;
  const kindergeld = fbBesser ? 0 : kindergeldJahr;
  // Der Soli bemisst sich immer an der ESt nach Abzug der Kinderfreibeträge
  const soliBetrag = soli(estMitFB, married, p);

  const net = gross - svTotal - est - soliBetrag + kindergeld;
  return { gross, sv: svTotal, est, soli: soliBetrag, kindergeld, net, zve: z1 + z2, kinderfreibetragGenutzt: fbBesser };
}

// Amtliche Tarifformel 2026 zum Gegencheck der linearen Formulierung
function officialTax2026(x) {
  x = Math.floor(x);
  if (x <= 12348) return 0;
  if (x <= 17799) { const y = (x - 12348) / 10000; return Math.floor((914.51 * y + 1400) * y); }
  if (x <= 69878) { const z = (x - 17799) / 10000; return Math.floor((173.10 * z + 2397) * z + 1034.87); }
  if (x <= 277825) return Math.floor(0.42 * x - 11135.63);
  return Math.floor(0.45 * x - 19470.38);
}

// ──────────────────────────────────────────────
// AUFKOMMENSSCHÄTZUNG
// Nutzt dieselbe Einkommensverteilung wie das Einkommensteuer-Detailmodell im
// Haushalt (rd. 48,5 Mio. Steuerpflichtige). Gerechnet wird nur die relative
// Veränderung ggü. dem Status quo – sie wird auf das Haushalts-Soll übertragen.
// Jede Klasse wird in fünf Stützstellen zerlegt, damit verschobene Tarifgrenzen
// nicht ruckartig wirken.

const TAXPAYER_DISTRIBUTION = [
  { einkommen: 5000, anzahl: 5_200_000 }, { einkommen: 10000, anzahl: 6_000_000 },
  { einkommen: 15000, anzahl: 5_600_000 }, { einkommen: 20000, anzahl: 5_200_000 },
  { einkommen: 25000, anzahl: 4_900_000 }, { einkommen: 30000, anzahl: 5_600_000 },
  { einkommen: 40000, anzahl: 5_200_000 }, { einkommen: 50000, anzahl: 4_200_000 },
  { einkommen: 60000, anzahl: 2_800_000 }, { einkommen: 75000, anzahl: 1_750_000 },
  { einkommen: 90000, anzahl: 1_050_000 }, { einkommen: 120000, anzahl: 520_000 },
  { einkommen: 150000, anzahl: 260_000 }, { einkommen: 200000, anzahl: 128_000 },
  { einkommen: 300000, anzahl: 64_000 }, { einkommen: 500000, anzahl: 32_000 },
  { einkommen: 1000000, anzahl: 16_000 }
];

const TAXPAYER_POINTS = TAXPAYER_DISTRIBUTION.flatMap(g =>
  [0.8, 0.9, 1, 1.1, 1.2].map(f => ({ einkommen: g.einkommen * f, anzahl: g.anzahl / 5 })));

const REVENUE_2027 = {
  estGesamt: 369.65,        // Lohn- und Einkommensteuer aller Ebenen (Mrd. €)
  anteilBund: 42.5,
  soliBund: 13.1,           // Soli im Bundeshaushalt 2027
  soliKapital: 91.061 * 0.055, // davon auf KSt und Kapitalerträge (bleibt bei Tarifreformen gleich)
  kinder: 17.3e6,           // Kinder mit Kindergeldanspruch
  kindergeldAnteilBund: 74  // Bund trägt rd. 74 % des Familienleistungsausgleichs
};

function aggregateTax(p) {
  let est = 0, soliSum = 0;
  TAXPAYER_POINTS.forEach(g => {
    const t = incomeTax(g.einkommen, p);
    est += t * g.anzahl;
    soliSum += soli(t, false, p) * g.anzahl;
  });
  return { est, soli: soliSum };
}

const AGG_BASE = aggregateTax(TAX_BASE);

// Wirkung einer Reform auf den Bundeshaushalt (Mrd. €, positiv = Mehreinnahmen)
function revenueEffect(p) {
  const agg = aggregateTax(p);
  const r = REVENUE_2027;
  const estRel = agg.est / AGG_BASE.est - 1;
  const estGesamt = r.estGesamt * estRel;
  const soliEstBasis = r.soliBund - r.soliKapital;
  const soliNeu = soliEstBasis * (AGG_BASE.soli ? agg.soli / AGG_BASE.soli : 1) + r.soliKapital * p.soliSatz / 5.5;
  const kindergeld = -(p.kindergeld - TAX_BASE.kindergeld) * 12 * r.kinder / 1e9;
  return {
    estGesamt,                                  // alle Ebenen
    estBund: estGesamt * r.anteilBund / 100,
    soliBund: soliNeu - r.soliBund,
    kindergeldGesamt: kindergeld,
    kindergeldBund: kindergeld * r.kindergeldAnteilBund / 100,
    splittingModelliert: p.splitting === TAX_BASE.splitting
  };
}

// Anteil am Einkommensteueraufkommen, den die oberen x % zahlen (Modellwert)
function topShareOfTax(topFraction, p = TAX_BASE) {
  const pts = TAXPAYER_POINTS.slice().sort((a, b) => b.einkommen - a.einkommen);
  const total = pts.reduce((s, g) => s + g.anzahl, 0);
  const totalTax = pts.reduce((s, g) => s + incomeTax(g.einkommen, p) * g.anzahl, 0);
  let left = total * topFraction, tax = 0;
  for (const g of pts) {
    const take = Math.min(left, g.anzahl);
    tax += incomeTax(g.einkommen, p) * take;
    left -= take;
    if (left <= 0) break;
  }
  return tax / totalTax;
}

// ──────────────────────────────────────────────
// TYPISCHE HAUSHALTE
// Bruttojahreslöhne gerundet; Medianlohn Vollzeit nach Destatis-Verdiensterhebung
// in der Größenordnung von 4.200 €/Monat, Mindestlohn 2026: 13,90 €/Std.

const HOUSEHOLDS = [
  { id: "mindestlohn", name: "Mindestlohn, Vollzeit", short: "Mindestlohn", icon: "🧹",
    note: "13,90 €/Std. × 40 Std.", incomes: [28900], married: false, kids: 0 },
  { id: "median", name: "Single, Medianlohn", short: "Median-Single", icon: "🧑‍💻",
    note: "rd. 4.200 €/Monat", incomes: [50400], married: false, kids: 0 },
  { id: "alleinerz", name: "Alleinerziehend, 1 Kind", short: "Alleinerz.", icon: "👩‍👦",
    note: "Teilzeit 30 Std.", incomes: [34000], married: false, kids: 1, singleParent: true },
  { id: "dink", name: "DINK – verheiratet, zwei Gehälter", short: "DINK", icon: "👫",
    note: "beide Medianlohn, keine Kinder", incomes: [50400, 50400], married: true, kids: 0 },
  { id: "allein", name: "Ehepaar, Alleinverdiener", short: "Alleinverdiener", icon: "💍",
    note: "maximaler Splittingvorteil", incomes: [70000, 0], married: true, kids: 0 },
  { id: "familie", name: "Familie, 2 Kinder", short: "Familie 2K", icon: "👨‍👩‍👧‍👦",
    note: "Vollzeit + Teilzeit", incomes: [55000, 22000], married: true, kids: 2 },
  { id: "top10", name: "Single, obere 10 %", short: "Top 10 %", icon: "🏙️",
    note: "Führungskraft", incomes: [100000], married: false, kids: 0 },
  { id: "top1", name: "Single, oberstes 1 %", short: "Top 1 %", icon: "🛥️",
    note: "Vorstand, Spitzenarzt …", incomes: [280000], married: false, kids: 0 }
];

// Selbsttest beim Laden: weicht die lineare Formulierung vom amtlichen Tarif ab?
const TAX_SELFTEST = (() => {
  let maxDiff = 0;
  for (let x = 0; x <= 400000; x += 137) maxDiff = Math.max(maxDiff, Math.abs(incomeTax(x) - officialTax2026(x)));
  if (maxDiff > 2) console.warn("Steuertarif weicht vom amtlichen Tarif 2026 ab, max. Differenz €", maxDiff);
  return maxDiff;
})();

if (typeof module !== "undefined") module.exports = {
  TAX_BASE, incomeTax, officialTax2026, marginalRate, computeHousehold, socialContributions,
  revenueEffect, topShareOfTax, HOUSEHOLDS, TAX_SELFTEST, AGG_BASE
};
