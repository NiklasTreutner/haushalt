// Beispiel-Daten je Tab
const datasets = {
  bund: {
    
      nodes: [
        {
          id: "fm",
          name: "Finanzministerium",
		  "isIncomeRoot": true,
          children: [
			"bmas",       // Arbeit und Soziales
            "bmv",       // Verteidigung
			"bfin",     // Bundesschuld und Zinsausgaben	
			"bmviz",       // Digitales und Verkehr
			"bmbf",       // Bildung und Forschung		
			"aa",       
			"bmfjs",       
			"bmwk",       
			"bk",       
			"bmg",        // Gesundheit
			"bmw",       // Wirtschaft und Klimaschutz
			"bml",       // Ernährung und Landwirtschaft
			"bmi",        // Inneres und Heimat
			"bmj",        // Justiz
			"bmu",       // Umwelt, Naturschutz, nukleare Sicherheit und Verbraucherschutz
			"dbt",        // Deutschlandticket / Klimageld / BGE
          ],
          sliders: [
				{ label: "Mehrwertsteuer", value: 159.329, advanced: "fm-mehrwertsteuer-advanced" },
            	{ label: "Einkommensteuer", value: 148.602, advanced: "fm-einkommensteuer-advanced", max: 500},							
				{ label: "Energiesteuer", value: 33.249, advanced: "fm-energiesteuer-advanced" },
				{ label: "Versicherungsteuer", value: 20.080 },
				{ label: "Koerperschaftsteuer", value: 19.075, advanced: "fm-koerperschaftsteuer-advanced"  },
				{ label: "Tabaksteuer", value: 16.850, advanced: "fm-tabaksteuer-advanced" },
				{ label: "Kapitalertragsteuer", value: 16.250, advanced: "fm-kapitalertragsteuer-advanced" },
				{ label: "Maut", value: 14.668 },
				{ label: "CO2-Preis", value: 13.000, advanced: "fm-co2-preis-advanced" },
				{ label: "Solidaritätszuschlag", value: 9.635 },            	
				{ label: "Kfz-Steuer", value: 9.625, advanced: "fm-kfz-steuer-advanced" },
				
			//{ label: "Erbschaftsteuer", value: 6.500, advanced: "fm-erbschaftsteuer-advanced" },
			//{ label: "Digitalkonzernsteuer", value: 3.000, advanced: "fm-digitalsteuer-advanced" },
			
            	{ label: "Abgeltungsteuer", value: 8.514 },            	
            	{ label: "Stromsteuer", value: 7.080, advanced: "fm-stromsteuer-advanced" },
				{ label: "Gewerbesteuerumlage", value: 2.853 },
            	{ label: "Luftverkehrsteuer", value: 2.070 },            	
            	{ label: "EU-RRF", value: 10.564 },

				{ label: "Vermoegensteuer", value: 0, advanced: "fm-vermoegensteuer-advanced" },				
				{ label: "Finanztransaktionssteuer", value: 0, advanced: "fm-finanztransaktionssteuer-advanced" },
            	

          ]
        },		
		{
			"id": "bmas",
			"name": "Arbeit und Soziales",
			"children": [],
			"sliders": [
			{ "label": "Zuschuss Rentenversicherung", "value": 140.232 },
			{ "label": "Bürgergeld", "value": 28.050 },
			{ "label": "Wohngeld", "value": 13.000 },
			{ "label": "Verwaltung Grundsicherung", "value": 5.250 },
			{ "label": "Leistungen zur Eingliederung in Arbeit", "value": 4.700 },
			{ "label": "Sonstiges", "value": 6.175 }
			]
		},
		{
			"id": "bmv",
			"name": "Verteidigung",
			"children": [],
			"sliders": [
			{ "label": "Militärausrüstung", "value": 22.374 },
			{ "label": "Militärisches Personal", "value": 21.487 },
			{ "label": "Unterbringung", "value": 11.313 },
			{ "label": "Verwaltung", "value": 8.666 },
			{ "label": "Materialerhaltung", "value": 7.599 },
			{ "label": "Sonstiges", "value": 11.248 }
			]
		},
		{
			"id": "bfin",
			"name": "Finanzen",
			"children": [],
			"sliders": [
			{ "label": "Bundesschuld", "value": 34.080 },
			{ "label": "Strompreisbremse", "value": 17.200 },
			{ "label": "Postbeamten Rentenzuschuss", "value": 10.437 },
			{ "label": "Ukrainehilfe", "value": 8.546 },
			{ "label": "Zuschuss Hgr. 4", "value": 3.547 },
			{ "label": "sonstiges", "value": 9.043 }
			]
		},
		{
			"id": "bmviz",
			"name": "Verkehr und Digitales",
			"children": [],
			"sliders": [
			{ "label": "Autobahnen", "value": 10.835 },
			{ "label": "Bahn", "value": 10.704 },
			{ "label": "Sonstiges", "value": 6.680 }
			]
		},
		{
			"id": "bmbf",
			"name": "Bildung und Forschung",
			"children": [],
			"sliders": [
			{ "label": "Forschung", "value": 16.500 },
			{ "label": "BaFöG etc.", "value": 4.503 },
			{ "label": "Sonstiges", "value": 0.255 }
			]
		},
		{
			"id": "bmg",
			"name": "Gesundheit",
			"children": [],
			"sliders": [
			{ "label": "Zuschüsse an Krankenkassen", "value": 16.908 },
			{ "label": "Pflege", "value": 3.694 },
			{ "label": "Sonstiges", "value": 1.487 }
			]
		},
		{
			"id": "bmi",
			"name": "Inneres und Heimat",
			"children": [],
			"sliders": [
			{ "label": "Polizei und Sicherheit", "value": 10.675 },
			{ "label": "Migration und Integration", "value": 3.285 },
			{ "label": "Sonstiges", "value": 2.052 }
			]
		},
		{
			"id": "bmfjs",
			"name": "Familie, F. + Sen. + Jug.",
			"children": [],
			"sliders": [
			{ "label": "Familienleistungen", "value": 10.488 },
			{ "label": "Jugendförderung", "value": 2.622 },
			{ "label": "Sonstiges", "value": 1.608 }
			]
		},
		{
			"id": "bmw",
			"name": "Wirtschaft",
			"children": [],
			"sliders": [
			{ "label": "Energie- und Klimafonds", "value": 5.880 },
			{ "label": "Mittelstandsförderung", "value": 1.225 },
			{ "label": "Sonstiges", "value": 0.868 }
			]
		},
		{
			"id": "bmwk",
			"name": "Entwicklung",
			"children": [],
			"sliders": [
			{ "label": "Entwicklungsprojekte", "value": 6.961 },
			{ "label": "Internationale Zusammenarbeit", "value": 1.988 },
			{ "label": "Sonstiges", "value": 0.995 }
			]
		},
		{
			"id": "bml",
			"name": "Landwirtschaft",
			"children": [],
			"sliders": [
			{ "label": "Agrarförderung", "value": 5.594 },
			{ "label": "Ländliche Entwicklung", "value": 2.095 },
			{ "label": "Sonstiges", "value": 1.298 }
			]
		},
		{
			"id": "aa",
			"name": "Auswärtiges Amt",
			"children": [],
			"sliders": [
			{ "label": "Entwicklungshilfe", "value": 4.882 },
			{ "label": "Diplomatischer Dienst", "value": 1.215 },
			{ "label": "Sonstiges", "value": 0.062 }
			]
		},
		{
			"id": "bk",
			"name": "Kanzleramt",
			"children": [],
			"sliders": [
			{ "label": "Allgemeine Verwaltung", "value": 2.448 },
			{ "label": "Kulturförderung", "value": 1.836 },
			{ "label": "Sonstiges", "value": 0.613 }
			]
		},
		{
			"id": "bmu",
			"name": "Umwelt",
			"children": [],
			"sliders": [
			{ "label": "Klimaschutz", "value": 1.962 },
			{ "label": "Naturschutz", "value": 0.654 },
			{ "label": "Sonstiges", "value": 0.238 }
			]
		}

      ],
	  advancedNodes:
	  [
	  {
		  id: "fm-einkommensteuer-advanced",
		  name: "Einkommensteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			
			//{ label: "Anteil Bund (%)", id: "anteil_bund", value: 42.5, max: 100, step: 0.1 },
			{ label: "Freibetrag", id: "freibetrag", value: 10908, max: 50000 },
			{ label: "Progressionsgrenze", id: "progressionsgrenze", value: 68480, max: 200000 },
			{ label: "Max. Steuersatz (%)", id: "max_rate", value: 42, max: 100, step: 0.1 },
			{ label: "Top-Tax ab", id: "top_threshold", value: 277000, max: 1000000, step: 1000 },
			{ label: "Top-Tax-Satz (%)", id: "top_rate", value: 45, max: 100, step: 0.1 }
		  ],
		  formula: `
			const einkommensverteilung = [
				{ einkommen: 5000,   anzahl: 4_500_000 },  // Minijobs, sehr geringe Einkommen
				{ einkommen: 10000,  anzahl: 5_200_000 },  // Rentner, Teilzeit, Studenten
				{ einkommen: 15000,  anzahl: 4_800_000 },  // einfache Beschäftigungen
				{ einkommen: 20000,  anzahl: 4_500_000 },  // unteres Mittelfeld
				{ einkommen: 25000,  anzahl: 4_200_000 },  // untere Mitte
				{ einkommen: 30000,  anzahl: 4_800_000 },  // mittlere Einkommen
				{ einkommen: 40000,  anzahl: 4_500_000 },  // mittlere Einkommen, Fachkräfte
				{ einkommen: 50000,  anzahl: 3_600_000 },  // obere Mitte
				{ einkommen: 60000,  anzahl: 2_400_000 },  // obere Mitte, Fach- und Führungskräfte
				{ einkommen: 75000,  anzahl: 1_500_000 },  // obere 10 %
				{ einkommen: 90000,  anzahl: 900_000 },    // obere 5 %
				{ einkommen: 120000, anzahl: 450_000 },    // obere 1,5 %
				{ einkommen: 150000, anzahl: 225_000 },    // obere 0,8 %
				{ einkommen: 200000, anzahl: 110_000 },    // obere 0,4 %
				{ einkommen: 300000, anzahl: 55_000 },     // obere 0,2 %
				{ einkommen: 500000, anzahl: 28_000 },     // obere 0,1 %
				{ einkommen: 1000000, anzahl: 14_000 }     // obere 0,05 %
				];

			let gesamtsteuer = 0;
			const anteil_bund = 42.5;

			for (const gruppe of einkommensverteilung) {
			  const zvE = gruppe.einkommen;
			  let steuer = 0;

			  if (zvE <= freibetrag) {
				steuer = 0;
			  } else if (zvE <= progressionsgrenze) {
				const rate = max_rate * (zvE - freibetrag) / (progressionsgrenze - freibetrag);
				steuer = rate / 100 * zvE;   // statt (zvE - freibetrag)
			  } else {
				steuer = max_rate / 100 * zvE;

				// Add Top-Tax only on income above threshold
				if (zvE > top_threshold) {
				  steuer += (top_rate - max_rate) / 100 * (zvE - top_threshold);
				}
			  }

			  const steuerGruppe = steuer * gruppe.anzahl;
			  gesamtsteuer += steuerGruppe;
			}

			return gesamtsteuer * (anteil_bund / 100) / 1000000000 * 1.067; // als Faktur, um das 2025 Ergebnis zu erreichen...
		  `
		},
		{
		  id: "fm-vermoegensteuer-advanced",
		  name: "Vermögensteuer",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [			
			{ label: "Freibetrag", id: "v_freibetrag", value: 3000000, max: 100000000, step: 10000 },
			{ label: "Steuersatz (%)", id: "v_steuersatz", value: 0.0, max: 5.0, step: 0.1 },
			//{ label: "Anteil Bund (%)", id: "v_anteil_bund", value: 100, max: 100, step: 1 }
		  ],
		  formula: `
			const vermoegensverteilung = [
			  { vermoegen: 0, anzahl: 14_000_000 },        // Kein Nettovermögen oder Verschuldung (~20%)
			  { vermoegen: 10_000, anzahl: 10_000_000 },   // Sehr niedrig (<10 k €)
			  { vermoegen: 50_000, anzahl: 12_000_000 },   // Untere Mittelklasse (~10 k–50 k)
			  { vermoegen: 100_000, anzahl: 14_000_000 },  // Mittlere Vermögensschicht
			  { vermoegen: 250_000, anzahl: 8_000_000 },   // Obere Mittelklasse
			  { vermoegen: 500_000, anzahl: 6_000_000 },   // Obere (~Top 8 %)
			  { vermoegen: 1_000_000, anzahl: 2_500_000 }, // Wohlhabend (~1.5 % Erwachsenen) :contentReference[oaicite:1]{index=1}
			  { vermoegen: 2_500_000, anzahl: 1_000_000 }, // Reich (~0.7 %)
			  { vermoegen: 5_000_000, anzahl: 400_000 },   // Sehr Reich (~0.3 %)
			  { vermoegen: 10_000_000, anzahl: 150_000 },  // Ultra-Reich (~0.1 %)
			  { vermoegen: 25_000_000, anzahl: 40_000 },   // Super-Reich (~0.03 %)
			  { vermoegen: 50_000_000, anzahl: 10_000 },   // Top 0.01 %
			  { vermoegen: 100_000_000, anzahl: 3_000 }    // Billionaires (~0.003 %)
			];


			let gesamtsteuer = 0;

			const v_anteil_bund = 100;

			for (const gruppe of vermoegensverteilung) {
			  const netto = Math.max(0, gruppe.vermoegen - v_freibetrag);
			  const steuer = netto * (v_steuersatz / 100);
			  const steuerGruppe = steuer * gruppe.anzahl ;
			  gesamtsteuer += steuerGruppe;
			}

			return gesamtsteuer * (v_anteil_bund / 100) / 1000000000;
		  `
		},
		{
		  id: "fm-mehrwertsteuer-advanced",
		  name: "Mehrwertsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Regelsatz (%)", id: "rate_19", value: 19, max: 30 },
			{ label: "Ermäßigter Satz (%)", id: "rate_7", value: 7, max: 15 },
			//{ label: "Anteil Regel (%)", id: "anteil_19", value: 70, max: 100 },
			//{ label: "Anteil Ermäßigt (%)", id: "anteil_7", value: 25, max: 100 }
		  ],
		  formula: `
			const konsum = 1.059e12; // fixer Konsumwert
			const anteil_19 = 70;
			const anteil_7 = 25;
			const netto_19 = konsum * anteil_19 / 100;
			const netto_7 = konsum * anteil_7 / 100;
			const steuer_19 = netto_19 * rate_19 / 100;
			const steuer_7 = netto_7 * rate_7 / 100;
			return (steuer_19 + steuer_7) / 1e9;
		  `
		},
		{
		  id: "fm-energiesteuer-advanced",
		  name: "Energiesteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Dieselsteuer (€/L)", id: "diesel_rate", value: 0.47, max: 2, step: 0.1 },
			{ label: "Benzinsteuer (€/L)", id: "benzin_rate", value: 0.65, max: 2, step: 0.1 },
			{ label: "Gassteuer (€/m³)", id: "gas_rate", value: 0.055, max: 2, step: 0.01 },
			{ label: "Kerosinsteuer (€/L³)", id: "kerosin_rate", value: 0.00, max: 2, step: 0.1 }
		  ],
		  formula: `
			const diesel = 37e9;   // Liter
			const benzin = 17e9;   // Liter
			const gas = 90e9;      // m³
			const kerosin = 10e9;  // Liter (steuerfrei)
			const total = diesel * diesel_rate + benzin * benzin_rate + gas * gas_rate + kerosin * kerosin_rate;
			return total / 1e9;
		  `
		},
		{
			id: "fm-koerperschaftsteuer-advanced",
			name: "Körperschaftsteuer – Details",
			parent: "fm",
			isVirtual: true,
			sliders: [
				{ label: "Körperschaftsteuersatz (%)", id: "koerp_rate", value: 15, max: 30, step: 0.1 },
				//{ label: "Bemessungsgrundlage Gewinne (Mrd. €)", id: "gewinne", value: 200, max: 500, step: 10 },
				//{ label: "Bundesanteil (%)", id: "bund_anteil", value: 63, max: 100, step: 1 }
			],
			formula: `
			const gewinne = 200;
			const bund_anteil = 63;
				const steuer = (gewinne * 1e9) * (koerp_rate / 100);
				const bund = steuer * (bund_anteil / 100);
				return bund / 1e9;
			`
			},
			{
  id: "fm-kapitalertragsteuer-advanced",
  name: "Kapitalertragsteuer – Details",
  parent: "fm",
  isVirtual: true,
  sliders: [
    { label: "Kapitalertragsteuersatz (%)", id: "kap_rate", value: 25, max: 100, step: 0.1 },
    { label: "Freibetrag pro Person (€)", id: "freibetrag", value: 1000, max: 100000, step: 100 }
  ],
  formula: `
    const total_income = 89e9;            // angepasst, fix
    const anleger = 25e6;                  // fix
    const freibetrag_total = freibetrag * anleger;
    const taxable_income = Math.max(0, total_income - freibetrag_total);
    const steuer = taxable_income * (kap_rate / 100);
    return steuer / 1e9;
  `
}
,


		{
		  id: "fm-tabaksteuer-advanced",
		  name: "Tabaksteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuer pro Packung (€)", id: "steuer_pro_pack", value: 3.20, max: 10, step: 0.1 }
		  ],
		  formula: `
			const packs = 1500e6;
			return (packs * steuer_pro_pack) / 1e9;
		  `
		},		
		{
		  id: "fm-kfz-steuer-advanced",
		  name: "Kfz-Steuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Durchschnitt pro Fahrzeug (€)", id: "kfz_rate", value: 190, max: 500 }
		  ],
		  formula: `
			const autos = 48e6;
			return (autos * kfz_rate) / 1e9;
		  `
		},		
		{
		  id: "fm-stromsteuer-advanced",
		  name: "Stromsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuersatz (ct/kWh)", id: "strom_rate", value: 2.05, max: 5, step: 0.1 }
		  ],
		  formula: `
			const stromverbrauch = 360e9; // TWh = 360 TWh = 360e9 kWh
			return (stromverbrauch * strom_rate / 100) / 1e9;
		  `
		},		
		{
		  id: "fm-co2-preis-advanced",
		  name: "CO₂-Preis – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Preis je Tonne CO₂ (€)", id: "co2_rate", value: 55, max: 100 }
		  ],
		  formula: `
			const emissionen = 236363636; // Mio t
			return (emissionen * co2_rate) / 1e9;
		  `
		},
		
		  {
			id: "fm-digitalsteuer-advanced",
			name: "Digitalsteuer (Big Tech)",
			parent: "fm",
			isVirtual: true,
			sliders: [
			  { label: "Steuersatz (%)", id: "d_steuersatz", value: 3, max: 10, step: 0.1 },
			  { label: "Besteuerte Umsätze (Mrd)", id: "d_umsatz", value: 100, max: 500 }
			],
			formula: `
			  return d_steuersatz / 100 * d_umsatz;
			`
		  },
		  
		  {
			id: "fm-finanztransaktionssteuer-advanced",
			name: "Finanztransaktionssteuer",
			parent: "fm",
			isVirtual: true,
			sliders: [
			  { label: "Steuersatz (%)", id: "t_satz", value: 0.0, max: 1.0, step: 0.01 },
			  //{ label: "Handelsvolumen (Billionen)", id: "t_volumen", value: 320, max: 10, step: 0.1 }
			],
			formula: `
			  let t_volumen = 32000;
			  return t_satz / 100 * t_volumen ;
			`
		  },


		  //AUSGABEN!!!
		  {
			id: "bmk-klimageld-advanced",
			name: "Klimageld",
			parent: "bmk",
			isVirtual: true,
			sliders: [
			  { label: "Bevölkerung (Millionen)", id: "klima_bewohner", value: 83, max: 100 },
			  { label: "Pro-Kopf-Betrag (€)", id: "klima_betrag", value: 0, max: 5000 }
			],
			formula: `
			  return klima_bewohner * klima_betrag;
			`
		  },
		  {
			id: "bmdv-deutschlandticket-advanced",
			name: "Deutschlandticket",
			parent: "bmdv",
			isVirtual: true,
			sliders: [
			  { label: "Abonnenten (Mio)", id: "dt_abos", value: 11, max: 100 },
			  { label: "Zuschuss pro Abo (€)", id: "dt_zuschuss", value: 250, max: 1000 }
			],
			formula: `
			  return dt_abos * dt_zuschuss;
			`
		  },
		  {
			id: "bmas-bge-advanced",
			name: "Bedingungsloses Grundeinkommen",
			parent: "bmas",
			isVirtual: true,
			sliders: [
			  { label: "Erwachsene (Mio)", id: "bge_erwachsene", value: 69, max: 100 },
			  { label: "Kinder (Mio)", id: "bge_kinder", value: 14, max: 100 },
			  { label: "BGE Erwachsene (€)", id: "bge_e_betrag", value: 0, max: 5000 },
			  { label: "BGE Kinder (€)", id: "bge_k_betrag", value: 0, max: 5000 }
			],
			formula: `
			  return bge_erwachsene * bge_e_betrag + bge_kinder * bge_k_betrag;
			`
		  }
		  
		]
    
  },
  sozial: {
    nodes: [
      {
  id: "gkv",
  isIncomeRoot: true,
  name: "Gesetzliche Krankenversicherung",
  children: ["gkv_ausgaben"],
  sliders: [
    { label: "Beitraege", value: 252, advanced: "gkv-beitraege-advanced", max: 500 },
    { label: "Bundeszuschuss", value: 16.5 }
  ]
},
{
  id: "gkv_ausgaben",
  name: "GKV-Ausgaben",
  sliders: [
    { label: "Ärztliche Versorgung", value: 83 },
    { label: "Krankenhausbehandlung", value: 94.000 },
    { label: "Arzneimittel", value: 55.000 },
    { label: "Pflegezuschüsse", value: 18.000 },
    { label: "Verwaltung", value: 12.000 }
  ]
},
{
  id: "pkv",
  isIncomeRoot: true,
  name: "Private Krankenversicherung",
  children: ["pkv_ausgaben"],
  sliders: [
    { label: "Beiträge privat", value: 45.000 }
  ]
},
{
  id: "pkv_ausgaben",
  name: "PKV-Ausgaben",
  sliders: [
    { label: "Ärztliche Versorgung", value: 15.000 },
    { label: "Krankenhausbehandlung", value: 10.000 },
    { label: "Arzneimittel", value: 6.000 },
    { label: "Pflegezusatz", value: 2.000 },
    { label: "Verwaltung", value: 1.000 }
  ]
},
{
  id: "rv",
  name: "Rentenversicherung", 
  isIncomeRoot: true,
  children: ["rv_ausgaben"],
  sliders: [
    { label: "Beitraege", value: 289, advanced: "rv-beitraege-advanced", max: 500 },
    { label: "Bundeszuschuss", value: 105.000 }  // Reduziert auf realistischeres Niveau
  ]
},
{
  id: "rv_ausgaben", 
  name: "RV-Ausgaben",
  sliders: [
    { label: "Altersrenten", value: 350.000, max: 500.000 },  // Leicht reduziert
    { label: "Erwerbsminderungsrenten", value: 16.000 },      // An Realität angepasst
    { label: "Hinterbliebenenrenten", value: 33.000 },        // Leicht reduziert  
    { label: "Verwaltung", value: 3.500 }
  ]
},
{
  id: "alv",
  name: "Arbeitslosenversicherung",
  isIncomeRoot: true,
  children: ["alv_ausgaben"],
  sliders: [
    { label: "Beiträge Arbeitnehmer", value: 20.000 },
    { label: "Beiträge Arbeitgeber", value: 20.000 }
  ]
},
{
  id: "alv_ausgaben",
  name: "ALV-Ausgaben",
  sliders: [
    { label: "Arbeitslosengeld I", value: 17.000 },
    { label: "Kurzarbeit & Qualifizierung", value: 10.000 },
    { label: "Arbeitsmarkt-Förderung", value: 10.000 },
    { label: "Verwaltung", value: 3.000 }
  ]
},
{
  id: "pv",
  name: "Pflegeversicherung",
  isIncomeRoot: true,
  children: ["pv_ausgaben"],
  sliders: [
    { label: "Beiträge Arbeitnehmer", value: 32.500 },
    { label: "Beiträge Arbeitgeber", value: 32.500 },
    { label: "Bundeszuschuss", value: 1.000 }
  ]
},
{
  id: "pv_ausgaben",
  name: "PV-Ausgaben",
  sliders: [
    { label: "Pflege ambulant", value: 25.000 },
    { label: "Pflege stationär", value: 30.000 },
    { label: "Pflegegeld", value: 7.000 },
    { label: "Verwaltung", value: 3.000 }
  ]
}


	],
	  advancedNodes:
	 [
  {
    id: "gkv-beitraege-advanced",
    name: "GKV-Beiträge – Details",
    parent: "gkv",
    isVirtual: true,
    sliders: [
      { label: "Beitragssatz (%)", id: "beitragssatz", value: 17.16, max: 30, step: 0.1 },
      { label: "Beitragsbemessungsgrenze", id: "bemessungsgrenze", value: 66150, max: 1000000 },
      { label: "Anteil Versicherter oberhalb Bemessungsgrenze", id: "anteilVersicherterOberhalbBBGR", value: 20, max: 100 }
    ],
    formula: `
      // Einnahmen basierend auf Beitragssatz und Beitragsbemessungsgrenze
      // Analog zur Einkommensteuer: summiere über Einkommensverteilung der Versicherten
      const versichertenVerteilung = [
      { einkommen: 6500,   anzahl: 3_500_000 },   // Minijobs
      { einkommen: 12500,  anzahl: 5_000_000 },   // Teilzeit, Studenten, Azubis
      { einkommen: 18000,  anzahl: 6_500_000 },   // einfache Beschäftigungen
      { einkommen: 24000,  anzahl: 6_000_000 },   // unteres Mittelfeld
      { einkommen: 30000,  anzahl: 5_500_000 },   // untere Mitte
      { einkommen: 38000,  anzahl: 5_000_000 },   // mittlere Einkommen
      { einkommen: 48000,  anzahl: 4_500_000 },   // mittlere Einkommen, Fachkräfte
      { einkommen: 60000,  anzahl: 3_500_000 },   // obere Mitte
      { einkommen: 75000,  anzahl: 2_200_000 },   // obere 15%
      { einkommen: 90000,  anzahl: 1_200_000 },   // obere 8%
      { einkommen: 120000, anzahl: 500_000 },     // obere 3%
      { einkommen: 150000, anzahl: 250_000 },     // obere 1.5%
      { einkommen: 200000, anzahl: 120_000 },     // obere 0.8%
      { einkommen: 300000, anzahl: 60_000 },      // obere 0.4%
      { einkommen: 500000, anzahl: 30_000 },      // obere 0.2%
      { einkommen: 1000000, anzahl: 15_000 }      // obere 0.1%
];

      let gesamtEinnahmen = 0;
	  const anteilPflicht = anteilVersicherterOberhalbBBGR / 100;	  
      
      for (const gruppe of versichertenVerteilung) {
        let beitragspflichtigesEinkommen = Math.min(gruppe.einkommen, bemessungsgrenze);
        let beitrag = beitragspflichtigesEinkommen * (beitragssatz / 100);
		
		if (gruppe.einkommen > bemessungsgrenze) {
        	beitrag *= anteilPflicht;
      	}
        
		gesamtEinnahmen += beitrag * gruppe.anzahl;
      }

      // Optional: in Mrd. umrechnen
      return gesamtEinnahmen * 1.24 / 1_000_000_000;
    `
  },
{
  id: "rv-beitraege-advanced",
  name: "RV-Beiträge – Details",
  parent: "rv",
  isVirtual: true,
  sliders: [
    { label: "Beitragssatz (%)", id: "beitragssatz", value: 18.6, max: 30, step: 0.1 },
    { label: "Beitragsbemessungsgrenze", id: "bemessungsgrenze", value: 90600, max: 1000000 }    
  ],
  formula: `
    const versichertenVerteilung = [
      { einkommen: 6500,   anzahl: 3_500_000 },   // Minijobs
      { einkommen: 12500,  anzahl: 5_000_000 },   // Teilzeit, Studenten, Azubis
      { einkommen: 18000,  anzahl: 6_500_000 },   // einfache Beschäftigungen
      { einkommen: 24000,  anzahl: 6_000_000 },   // unteres Mittelfeld
      { einkommen: 30000,  anzahl: 5_500_000 },   // untere Mitte
      { einkommen: 38000,  anzahl: 5_000_000 },   // mittlere Einkommen
      { einkommen: 48000,  anzahl: 4_500_000 },   // mittlere Einkommen, Fachkräfte
      { einkommen: 60000,  anzahl: 3_500_000 },   // obere Mitte
      { einkommen: 75000,  anzahl: 2_200_000 },   // obere 15%
      { einkommen: 90000,  anzahl: 1_200_000 },   // obere 8%
      { einkommen: 120000, anzahl: 500_000 },     // obere 3%
      { einkommen: 150000, anzahl: 250_000 },     // obere 1.5%
      { einkommen: 200000, anzahl: 120_000 },     // obere 0.8%
      { einkommen: 300000, anzahl: 60_000 },      // obere 0.4%
      { einkommen: 500000, anzahl: 30_000 },      // obere 0.2%
      { einkommen: 1000000, anzahl: 15_000 }      // obere 0.1%
];


    let gesamtEinnahmen = 0;
    
    for (const gruppe of versichertenVerteilung) {
      let beitragspflichtigesEinkommen = Math.min(gruppe.einkommen, bemessungsgrenze);
      let beitrag = beitragspflichtigesEinkommen * (beitragssatz / 100);
      gesamtEinnahmen += beitrag * gruppe.anzahl;
    }

    return gesamtEinnahmen * 1.0433 / 1_000_000_000;
  `
}
 
    ]
  },
  laender: {
    nodes: [
      {
		id: "laender",
		name: "Länderkassen",
		"isIncomeRoot": true,
		children: ["laender_ausgaben"],
		sliders: [
			{ label: "Lohn-/Einkommensteuer Anteil", value: 100.000 },
			{ label: "Grunderwerbsteuer", value: 18.000 },
			{ label: "Erbschaftsteuer", value: 6.500, advanced: "laender-erbschaftsteuer-advanced" },
			{ label: "Anteil Umsatzsteuer", value: 120.000 }
		]
		},
		{
		id: "laender_ausgaben",
		name: "Länderausgaben",
		sliders: [
			{ label: "Bildung (Schulen, Hochschulen)", value: 150.000 },
			{ label: "Innere Sicherheit (Polizei, Justiz)", value: 50.000 },
			{ label: "Gesundheit & Soziales (Länderanteil)", value: 40.000 },
			{ label: "Kultur & Wissenschaft", value: 20.000 },
			{ label: "Zuweisungen an Kommunen", value: 80.000 },
			{ label: "Verwaltung & Sonstiges", value: 25.000 }
		]
		}
    ],
	  advancedNodes:
	 [

	{
			id: "laender-erbschaftsteuer-advanced",
			name: "Erbschaftsteuer – Details",
			parent: "laender",
			isVirtual: true,
			sliders: [
			  { label: "Freibetrag (pro Fall)", id: "e_freibetrag", value: 400000, max: 1000000, step: 10000 },
			  { label: "Steuersatz (%)", id: "e_steuersatz", value: 10, max: 50, step: 0.1 },
			  { label: "Anzahl Erbfälle", id: "e_faelle", value: 100000, max: 500000, step: 1000 }
			  
			],
			formula: `
			  const erbschaften = [
				{ wert: 50_000, faelle: 30000 },
				{ wert: 200_000, faelle: 25000 },
				{ wert: 500_000, faelle: 20000 },
				{ wert: 1_000_000, faelle: 15000 },
				{ wert: 2_500_000, faelle: 5000 },
				{ wert: 5_000_000, faelle: 3000 },
				{ wert: 10_000_000, faelle: 1500 },
				{ wert: 25_000_000, faelle: 500 }
			  ];
		  
			  let gesamtsteuer = 0;
		  
			  for (const fall of erbschaften) {
				const steuerpflichtigerBetrag = Math.max(0, fall.wert - e_freibetrag);
				const steuerProFall = steuerpflichtigerBetrag * (e_steuersatz / 100);
				const steuerGruppe = steuerProFall * fall.faelle;
				gesamtsteuer += steuerGruppe;
			  }
		  
			  return gesamtsteuer / 1e9;
			`
		  }
	]

  },
  gesamt: null // später kombinieren
};

let data = datasets.bund; // Default
if (!data.closedAdvancedNodes) {
    data.closedAdvancedNodes = {};
}

const crossLinks = [
  { from: "bmg", to: "kv", amount: "zuschuss_gkv" },
  { from: "fm", to: "rv", amount: "zuschuss_rv" }
];

const einkommensverteilung = [
  // Lower income groups (approx. 30% of population)
  { einkommen: 5000, anteil: 0.05 },   // Mini-jobs, students
  { einkommen: 10000, anteil: 0.07 },  // Part-time workers
  { einkommen: 15000, anteil: 0.08 },  // Entry-level positions
  { einkommen: 20000, anteil: 0.10 },  // Lower full-time incomes
  
  // Middle class core (approx. 55% of population)
  { einkommen: 25000, anteil: 0.12 },  // Skilled workers
  { einkommen: 30000, anteil: 0.13 },  // Typical starting salaries
  { einkommen: 40000, anteil: 0.15 },  // Median income range
  { einkommen: 50000, anteil: 0.12 },  // Upper middle class
  { einkommen: 60000, anteil: 0.08 },  // Professionals
  { einkommen: 75000, anteil: 0.05 },  // Higher professionals
  
  // Upper income (approx. 10% of population)
  { einkommen: 90000, anteil: 0.03 },  // Management
  { einkommen: 120000, anteil: 0.015 }, // Upper management
  { einkommen: 150000, anteil: 0.008 }, // Directors
  { einkommen: 200000, anteil: 0.004 }, // Executives
  { einkommen: 300000, anteil: 0.002 }, // Top executives
  { einkommen: 500000, anteil: 0.001 }, // C-level
  { einkommen: 1000000, anteil: 0.0005 } // Top 0.05%
];