// ──────────────────────────────────────────────────────────────
// REFERENZDATEN für Übersicht, Verteilung, Schulden und Rente
//
// Gerundete Größenordnungen aus amtlichen Quellen. Sie dienen der Einordnung,
// nicht als zitierfähige Statistik – vor einer Veröffentlichung bitte mit der
// angegebenen Quelle abgleichen und hier aktualisieren.

const REF = {
  einwohner: 83.5e6,
  bip2027: 4700,            // nominales BIP 2027, Mrd. € (Projektion, ca.)

  // Dezilanteile (%) – Haushaltsäquivalenzeinkommen, gerundet
  // Quelle: Größenordnung nach SOEP/EU-SILC bzw. OECD IDD; Markteinkommen inkl. Rentnerhaushalte
  einkommenVerfuegbar: [3.1, 5.0, 6.1, 7.1, 8.1, 9.1, 10.3, 11.8, 14.2, 25.2],
  einkommenMarkt:      [0.0, 0.6, 2.6, 4.8, 6.8, 8.8, 11.0, 13.6, 17.5, 34.3],
  // Nettovermögen der Haushalte nach Dezilen; Quelle: Bundesbank PHF 2021 (oberste 10 % ≈ 56 %)
  vermoegen:           [-0.3, 0.1, 0.4, 1.0, 1.8, 4.0, 7.0, 11.5, 18.5, 56.0],
  quellenVerteilung: "SOEP / EU-SILC (Einkommen), Deutsche Bundesbank, Panel on Household Finances 2021 (Vermögen) – gerundet",

  // Perzentilgrenzen des Nettoäquivalenzeinkommens (€/Jahr), Größenordnung EU-SILC 2024
  einkommenPerzentile: [
    [0, 0], [5, 11500], [10, 14500], [20, 18500], [30, 21800], [40, 24900], [50, 28000],
    [60, 31400], [70, 35500], [80, 41000], [90, 51500], [95, 62000], [99, 100000], [99.9, 220000], [100, 1e7]
  ],
  // Perzentilgrenzen des Haushaltsnettovermögens (€), Bundesbank PHF 2021 (Median 106.600 €)
  vermoegenPerzentile: [
    [0, -50000], [10, 0], [20, 5000], [30, 22000], [40, 55000], [50, 106600],
    [60, 170000], [70, 260000], [80, 410000], [90, 725000], [95, 1100000], [99, 2600000], [100, 1e9]
  ],

  // Anteil am Einkommensteueraufkommen; Quelle: BMF, Datensammlung zur Steuerpolitik (ca.)
  estAnteile: [
    { gruppe: "Oberstes 1 %", anteil: 23 },
    { gruppe: "Obere 10 %", anteil: 56 },
    { gruppe: "Obere 50 %", anteil: 94 },
    { gruppe: "Untere 50 %", anteil: 6 }
  ],

  // Schuldenquote Gesamtstaat (Maastricht, % des BIP); Quelle: Destatis / Eurostat, gerundet
  schuldenquote: [
    [2000, 59], [2002, 60], [2004, 65], [2006, 66], [2008, 65], [2009, 73], [2010, 82],
    [2012, 81], [2014, 75], [2016, 69], [2018, 61], [2019, 59.6], [2020, 68], [2021, 68],
    [2022, 65], [2023, 63], [2024, 62.5], [2025, 64]
  ],
  // Zinsausgaben des Bundes (Mrd. €, Ist, gerundet); Quelle: BMF Haushaltsrechnung
  zinsenBund: [
    [2008, 40], [2010, 33], [2012, 31], [2014, 26], [2016, 17], [2018, 17], [2019, 12],
    [2020, 6.5], [2021, 3.9], [2022, 15], [2023, 38], [2024, 34], [2025, 30]
  ],
  schuldenBund2026: 1850,   // Schulden des Bundes inkl. Sondervermögen Ende 2026, Mrd. € (ca.)

  // Altenquotient: Personen 65+ je 100 Personen von 20–64; Destatis, 15. koord.
  // Bevölkerungsvorausberechnung, moderate Variante (ab 2025 Projektion, gerundet)
  altenquotient: [
    [1990, 24], [2000, 27], [2010, 34], [2020, 37], [2025, 39], [2030, 44],
    [2035, 47], [2040, 48], [2045, 49], [2050, 50], [2060, 52], [2070, 53]
  ],
  // ── Entwicklung über die Zeit (alle Werte gerundet, vor Veröffentlichung prüfen) ──

  // Gini-Koeffizient der Haushaltseinkommen; Quelle: SOEP-Auswertungen (DIW), Größenordnung
  giniVerfuegbar: [[1991, 0.255], [1995, 0.262], [2000, 0.259], [2005, 0.288], [2010, 0.285], [2015, 0.290], [2019, 0.297], [2021, 0.300]],
  giniMarkt:      [[1991, 0.43], [1995, 0.46], [2000, 0.47], [2005, 0.51], [2010, 0.49], [2015, 0.50], [2019, 0.50], [2021, 0.50]],

  // Armutsgefährdungsquote (60 % des Medians, Bundesmedian), Mikrozensus; 2020 Methodenwechsel
  armutAlt: [[2005, 14.7], [2007, 14.3], [2009, 14.6], [2011, 15.0], [2013, 15.5], [2015, 15.7], [2017, 15.8], [2019, 15.9]],
  armutNeu: [[2020, 16.1], [2021, 16.6], [2022, 16.7], [2023, 16.6]],

  // Anteile am Vorsteuer-Nationaleinkommen; Quelle: World Inequality Database (WID), gerundet
  top10Einkommen:   [[1980, 30], [1985, 31], [1990, 31.5], [1995, 32], [2000, 33], [2005, 36], [2007, 38], [2010, 37], [2015, 37], [2020, 37.5], [2022, 37.5]],
  top1Einkommen:    [[1980, 10.5], [1985, 10.5], [1990, 10.5], [1995, 10], [2000, 11], [2005, 13], [2007, 14], [2010, 12.5], [2015, 13], [2020, 12.8], [2022, 12.8]],
  bottom50Einkommen:[[1980, 23], [1985, 22.5], [1990, 22], [1995, 21.5], [2000, 21], [2005, 19], [2007, 18.5], [2010, 19], [2015, 19], [2020, 19], [2022, 19]],

  // Veränderung ggü. Vorjahr in %: Reallohnindex und Verbraucherpreise; Quelle: Destatis, gerundet
  reallohnAenderung: { 2009: -0.4, 2010: 1.5, 2011: 1.2, 2012: 0.5, 2013: -0.1, 2014: 1.9, 2015: 2.4, 2016: 1.8, 2017: 0.8,
    2018: 1.3, 2019: 1.2, 2020: -1.1, 2021: 0.1, 2022: -4.0, 2023: -0.1, 2024: 3.1, 2025: 1.2 },
  inflation: { 2009: 0.3, 2010: 1.0, 2011: 2.2, 2012: 1.9, 2013: 1.5, 2014: 0.9, 2015: 0.7, 2016: 0.4, 2017: 1.7,
    2018: 1.9, 2019: 1.4, 2020: 0.5, 2021: 3.1, 2022: 6.9, 2023: 5.9, 2024: 2.2, 2025: 2.2 },

  // Nettovermögen der Haushalte; Quelle: Deutsche Bundesbank, Panel on Household Finances (PHF)
  phfWellen: [
    { jahr: 2011, label: "2010/11", median: 51400, mittel: 195200, top10: 59 },
    { jahr: 2014, label: "2014", median: 60400, mittel: 214500, top10: 60 },
    { jahr: 2017, label: "2017", median: 70800, mittel: 232800, top10: 55 },
    { jahr: 2021, label: "2021", median: 106600, mittel: 316500, top10: 56 }
  ],

  // Zusammensetzung des Bruttovermögens nach Vermögensgruppe in % (PHF, grobe Näherung)
  vermoegenArten: [
    { gruppe: "Untere 50 %", immobilien: 22, finanz: 43, betrieb: 2, sonstiges: 33 },
    { gruppe: "50–90 %", immobilien: 70, finanz: 20, betrieb: 4, sonstiges: 6 },
    { gruppe: "Obere 10 %", immobilien: 50, finanz: 18, betrieb: 28, sonstiges: 4 }
  ],

  // Anteil der Bevölkerung im selbstgenutzten Wohneigentum in %; Quelle: Eurostat (EU-SILC 2023), gerundet
  wohneigentum: [
    { land: "Deutschland", wert: 48 }, { land: "Österreich", wert: 51 }, { land: "Dänemark", wert: 59 },
    { land: "Frankreich", wert: 63 }, { land: "EU-Durchschnitt", wert: 69 }, { land: "Niederlande", wert: 70 },
    { land: "Belgien", wert: 71 }, { land: "Italien", wert: 75 }, { land: "Spanien", wert: 76 },
    { land: "Polen", wert: 87 }, { land: "Rumänien", wert: 95 }
  ],

  rente: {
    beitragssatz2026: 18.6,
    niveau2026: 48,
    beitragsbasis2026: 1610,  // beitragspflichtige Entgelte, Mrd. € (ca., aus 300 Mrd. Beitragseinnahmen)
    lohnwachstum: 3.0         // % p. a. nominal
  }
};

// Interpoliert ein Perzentil aus einer Liste [perzentil, wert]
function percentileOf(value, table) {
  if (value <= table[0][1]) return 0;
  for (let i = 1; i < table.length; i++) {
    const [p0, v0] = table[i - 1], [p1, v1] = table[i];
    if (value <= v1) return p0 + (p1 - p0) * (value - v0) / (v1 - v0);
  }
  return 100;
}

// Lineare Interpolation in einer Zeitreihe [[jahr, wert], ...]
function interpSeries(series, year) {
  if (year <= series[0][0]) return series[0][1];
  for (let i = 1; i < series.length; i++) {
    const [x0, y0] = series[i - 1], [x1, y1] = series[i];
    if (year <= x1) return y0 + (y1 - y0) * (year - x0) / (x1 - x0);
  }
  return series[series.length - 1][1];
}

// Lorenzkurve aus Dezilanteilen und Gini-Koeffizient (Trapezregel)
function lorenzFromDeciles(shares) {
  const total = shares.reduce((a, b) => a + b, 0);
  const pts = [[0, 0]];
  let cum = 0;
  shares.forEach((s, i) => { cum += s / total * 100; pts.push([(i + 1) * 10, cum]); });
  let area = 0;
  for (let i = 1; i < pts.length; i++) area += (pts[i][0] - pts[i - 1][0]) / 100 * (pts[i][1] + pts[i - 1][1]) / 200;
  return { points: pts, gini: 1 - 2 * area };
}
