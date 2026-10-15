// Daten je Tab
// Bund: Regierungsentwurf Bundeshaushalt 2027 (HH 2027 RegE), alle Werte in Mrd. Euro
// Quelle: Gesamtplan + Einzelplaene (info/HH_2027_RegE_ALL.csv, info/Gesamtplan-und-Uebersichten.pdf)
// Ausgaben Kernhaushalt 2027: 555,436 Mrd. | Einnahmen ohne Kredite: 429,889 Mrd. | Nettokreditaufnahme: 118,727 Mrd.
// Steuern sind brutto veranschlagt; die Abfuehrungen an EU und Laender stehen als eigener Ausgabeknoten.
const datasets = {
  bund: {

      nodes: [
        {
          id: "fm",
          name: "Finanzministerium (Einnahmen)",
		  "isIncomeRoot": true,
          children: [
			"bmas",       // Arbeit und Soziales
			"bmv",        // Verteidigung
			"eu",         // EU-Eigenmittel und Zuweisungen an die Laender
			"allgfin",    // Allgemeine Finanzverwaltung
			"bfin",       // Bundesschuld / Zinsen
			"bmviz",      // Verkehr
			"bmbf",       // Forschung, Technologie und Raumfahrt
			"bmi",        // Inneres und Heimat
			"bmfjs",      // Bildung, Familie, Senioren, Frauen und Jugend
			"bmg",        // Gesundheit
			"bmf",        // Finanzen (Einzelplan 08)
			"bmwk",       // Wirtschaftliche Zusammenarbeit und Entwicklung
			"bmwsb",      // Wohnen, Stadtentwicklung und Bauwesen
			"bml",        // Landwirtschaft, Ernaehrung und Heimat
			"aa",         // Auswaertiges Amt
			"bmw",        // Wirtschaft und Energie
			"bk",         // Kanzleramt, Kultur und Medien
			"bmu",        // Umwelt, Klimaschutz, nukleare Sicherheit
			"bmds",       // Digitales und Staatsmodernisierung
			"bmj",        // Justiz und Verbraucherschutz
			"vfo",        // Verfassungsorgane
			"dbt",        // Deutschlandticket / Klimageld / BGE
          ],
          sliders: [
				{ label: "Mehrwertsteuer", value: 160.301, advanced: "fm-mehrwertsteuer-advanced", max: 300 },
            	{ label: "Einkommensteuer", value: 157.101, advanced: "fm-einkommensteuer-advanced", max: 500},
				{ label: "Energiesteuer", value: 35.600, advanced: "fm-energiesteuer-advanced" },
				{ label: "Verwaltungseinnahmen und Sonstiges", value: 29.016 },
				{ label: "Versicherungsteuer", value: 21.330, advanced: "fm-versicherungsteuer-advanced" },
				{ label: "Koerperschaftsteuer", value: 18.225, advanced: "fm-koerperschaftsteuer-advanced"  },
				{ label: "Tabaksteuer", value: 17.786, advanced: "fm-tabaksteuer-advanced" },
				{ label: "Kapitalertragsteuer", value: 15.775, advanced: "fm-kapitalertragsteuer-advanced" },
				{ label: "Maut", value: 13.196, advanced: "fm-maut-advanced" },
				{ label: "Solidaritätszuschlag", value: 13.100, advanced: "fm-solidaritätszuschlag-advanced" },
            	{ label: "Abgeltungsteuer", value: 10.164, advanced: "fm-abgeltungsteuer-advanced" },
				{ label: "Kfz-Steuer", value: 9.460, advanced: "fm-kfz-steuer-advanced" },
            	{ label: "Stromsteuer", value: 5.090, advanced: "fm-stromsteuer-advanced" },
				{ label: "Verbrauchsteuern", value: 3.683, advanced: "fm-verbrauchsteuern-advanced" },
				{ label: "Gewerbesteuerumlage", value: 2.733, advanced: "fm-gewerbesteuerumlage-advanced" },
            	{ label: "Luftverkehrsteuer", value: 1.730, advanced: "fm-luftverkehrsteuer-advanced" },

				{ label: "Vermoegensteuer", value: 0, advanced: "fm-vermoegensteuer-advanced" },
				{ label: "Finanztransaktionssteuer", value: 0, advanced: "fm-finanztransaktionssteuer-advanced" },
				{ label: "Digitalsteuer", value: 0, advanced: "fm-digitalsteuer-advanced" },

          ]
        },
		{
			"id": "bmas",
			"name": "Arbeit und Soziales",
			"children": [],
			"sliders": [
			{ "label": "Zuschuss Rentenversicherung", "value": 100.796, "max": 300, "advanced": "bmas-zuschuss-rentenversicherung-advanced" },
			{ "label": "Bürgergeld", "value": 27.700, "advanced": "bmas-bürgergeld-advanced" },
			{ "label": "Weitere Rentenleistungen", "value": 31.087 },
			{ "label": "Kosten der Unterkunft", "value": 13.145, "advanced": "bmas-kosten-der-unterkunft-advanced" },
			{ "label": "Grundsicherung im Alter", "value": 13.064 },
			{ "label": "Verwaltung und Eingliederung in Arbeit", "value": 9.950 },
			{ "label": "Sonstiges", "value": 5.719 }
			]
		},
		{
			"id": "bmv",
			"name": "Verteidigung",
			"children": [],
			"sliders": [
			{ "label": "Militärische Beschaffungen", "value": 30.306 },
			{ "label": "Militärisches Personal", "value": 23.421, "advanced": "bmv-militärisches-personal-advanced" },
			{ "label": "Unterbringung", "value": 19.298 },
			{ "label": "Bundeswehrverwaltung", "value": 10.174 },
			{ "label": "Sonstiger Betrieb", "value": 9.262 },
			{ "label": "Materialerhaltung", "value": 8.617 },
			{ "label": "Sonstiges", "value": 8.672 }
			]
		},
		{
			"id": "eu",
			"name": "EU und Länder",
			"children": [],
			"sliders": [
			{ "label": "EU-Eigenmittel (BNE)", "value": 34.859 },
			{ "label": "Regionalisierungsmittel", "value": 13.765 },
			{ "label": "Umsatzsteueranteile der Länder", "value": 11.316 },
			{ "label": "Kfz-Steuer-Ausgleich", "value": 8.992 },
			{ "label": "EU-Eigenmittel (MwSt, Kunststoff)", "value": 7.199 },
			{ "label": "Sanierungs- und Kommunalhilfen", "value": 1.450 }
			]
		},
		{
			"id": "allgfin",
			"name": "Allgemeine Finanzverwaltung",
			"children": [],
			"sliders": [
			{ "label": "Strompreisentlastung", "value": 16.500 },
			{ "label": "Ukrainehilfe", "value": 12.082 },
			{ "label": "Postbeamten Rentenzuschuss", "value": 10.692 },
			{ "label": "Versorgung und Personalverstärkung", "value": 5.899 },
			{ "label": "Kohleregionen und Strukturhilfen", "value": 3.438 },
			{ "label": "Globale Minderausgabe", "value": -8.000, "min": -30 },
			{ "label": "Sonstiges", "value": 6.267 }
			]
		},
		{
			"id": "bfin",
			"name": "Bundesschuld",
			"children": [],
			"sliders": [
			{ "label": "Zinsen Bundesanleihen", "value": 24.013, "advanced": "bfin-zinsen-bundesanleihen-advanced" },
			{ "label": "Zinsen Obligationen und Schatzanweisungen", "value": 9.840 },
			{ "label": "Sonstige Zinsen", "value": 4.450 },
			{ "label": "Zinsen Sondervermögen und grüne Anleihen", "value": 3.580 },
			{ "label": "Gewährleistungen", "value": 1.728 }
			]
		},
		{
			"id": "bmviz",
			"name": "Verkehr",
			"children": [],
			"sliders": [
			{ "label": "Autobahnen und Bundesstraßen", "value": 10.694 },
			{ "label": "Bundeseisenbahnvermögen", "value": 5.609 },
			{ "label": "Bundesschienenwege", "value": 3.000 },
			{ "label": "ÖPNV und Gemeindeverkehr", "value": 2.077 },
			{ "label": "Wasserstraßen", "value": 1.997 },
			{ "label": "Sonstiges", "value": 3.053 }
			]
		},
		{
			"id": "bmbf",
			"name": "Forschung und Raumfahrt",
			"children": [],
			"sliders": [
			{ "label": "Forschung und Hightech-Agenda", "value": 8.783 },
			{ "label": "Wissenschaft und Hochschulen", "value": 8.446 },
			{ "label": "BaFöG etc.", "value": 2.562 },
			{ "label": "Raumfahrt und Sonstiges", "value": 2.175 }
			]
		},
		{
			"id": "bmg",
			"name": "Gesundheit",
			"children": [],
			"sliders": [
			{ "label": "Zuschüsse an Krankenkassen", "value": 12.500 },
			{ "label": "Prävention und Gesundheitsschutz", "value": 0.851 },
			{ "label": "Bundesbehörden (RKI, BfArM, PEI)", "value": 0.519 },
			{ "label": "Sonstiges", "value": 0.467 }
			]
		},
		{
			"id": "bmi",
			"name": "Inneres und Heimat",
			"children": [],
			"sliders": [
			{ "label": "Bundespolizei", "value": 5.180, "advanced": "bmi-bundespolizei-advanced" },
			{ "label": "Kriminalamt und Verfassungsschutz", "value": 2.221 },
			{ "label": "Migration und Integration", "value": 2.063 },
			{ "label": "Bevölkerungsschutz und THW", "value": 1.987 },
			{ "label": "IT und Digitalfunk", "value": 1.301 },
			{ "label": "Verwaltung und Sonstiges", "value": 3.961 }
			]
		},
		{
			"id": "bmfjs",
			"name": "Bildung, Familie + Sen. + Jug.",
			"children": [],
			"sliders": [
			{ "label": "Elterngeld", "value": 7.070, "advanced": "bmfjs-elterngeld-advanced" },
			{ "label": "Kinderzuschlag", "value": 3.116, "advanced": "bmfjs-kinderzuschlag-advanced" },
			{ "label": "Bildung und Aufstiegsförderung", "value": 1.712 },
			{ "label": "Unterhaltsvorschuss und Kindergeld", "value": 1.155 },
			{ "label": "Kinder- und Jugendpolitik", "value": 1.085 },
			{ "label": "Sonstiges", "value": 1.340 }
			]
		},
		{
			"id": "bmf",
			"name": "Finanzen",
			"children": [],
			"sliders": [
			{ "label": "Zollverwaltung", "value": 3.758 },
			{ "label": "Versorgung und Beihilfen", "value": 2.056 },
			{ "label": "Informationstechnikzentrum Bund", "value": 1.617 },
			{ "label": "Wiedergutmachung", "value": 1.592 },
			{ "label": "Bundeszentralamt für Steuern", "value": 1.026 },
			{ "label": "Sonstiges", "value": 1.017 }
			]
		},
		{
			"id": "bmw",
			"name": "Wirtschaft und Energie",
			"children": [],
			"sliders": [
			{ "label": "Industrie und Mittelstand", "value": 1.800 },
			{ "label": "Regionale Wirtschaftsförderung", "value": 0.935 },
			{ "label": "Energie", "value": 0.474 },
			{ "label": "Außenwirtschaft", "value": 0.322 },
			{ "label": "Behörden und Sonstiges", "value": 2.019 }
			]
		},
		{
			"id": "bmwk",
			"name": "Entwicklung",
			"children": [],
			"sliders": [
			{ "label": "Bilaterale Zusammenarbeit", "value": 3.906 },
			{ "label": "Europäische und multilaterale Hilfen", "value": 1.613 },
			{ "label": "Entwicklungsbanken", "value": 1.362 },
			{ "label": "Zivilgesellschaft und Wirtschaft", "value": 1.166 },
			{ "label": "Krisenbewältigung und Sonstiges", "value": 1.422 }
			]
		},
		{
			"id": "bmwsb",
			"name": "Wohnen und Bauen",
			"children": [],
			"sliders": [
			{ "label": "Sozialer Wohnungsbau", "value": 3.283 },
			{ "label": "Wohngeld", "value": 1.812, "advanced": "bmwsb-wohngeld-advanced" },
			{ "label": "Baukindergeld und Prämien", "value": 0.940 },
			{ "label": "Städtebauförderung", "value": 0.606 },
			{ "label": "Sonstiges", "value": 0.868 }
			]
		},
		{
			"id": "bml",
			"name": "Landwirtschaft",
			"children": [],
			"sliders": [
			{ "label": "Alterssicherung der Landwirte", "value": 2.465 },
			{ "label": "Krankenversicherung der Landwirte", "value": 1.705 },
			{ "label": "Agrarstruktur und Küstenschutz", "value": 0.853 },
			{ "label": "Forschung und Nachhaltigkeit", "value": 0.300 },
			{ "label": "Verbraucherschutz und Ernährung", "value": 0.191 },
			{ "label": "Sonstiges", "value": 1.459 }
			]
		},
		{
			"id": "aa",
			"name": "Auswärtiges Amt",
			"children": [],
			"sliders": [
			{ "label": "Humanitäre Hilfe und Krisenprävention", "value": 2.204 },
			{ "label": "Diplomatischer Dienst", "value": 2.201 },
			{ "label": "Auswärtige Kultur- und Bildungspolitik", "value": 0.960 },
			{ "label": "Bilaterale Zusammenarbeit", "value": 0.229 },
			{ "label": "Sonstiges", "value": 0.364 }
			]
		},
		{
			"id": "bk",
			"name": "Kanzleramt",
			"children": [],
			"sliders": [
			{ "label": "Kulturförderung", "value": 2.117 },
			{ "label": "Bundesnachrichtendienst", "value": 1.852 },
			{ "label": "Sport und Ehrenamt", "value": 0.410 },
			{ "label": "Bundesarchiv und Presseamt", "value": 0.358 },
			{ "label": "Allgemeine Verwaltung", "value": 0.427 }
			]
		},
		{
			"id": "bmu",
			"name": "Umwelt",
			"children": [],
			"sliders": [
			{ "label": "Zwischen- und Endlagerung", "value": 1.481 },
			{ "label": "Nukleare Sicherheit und Strahlenschutz", "value": 0.309 },
			{ "label": "Umweltschutz", "value": 0.233 },
			{ "label": "Naturschutz", "value": 0.206 },
			{ "label": "Sonstiges", "value": 0.512 }
			]
		},
		{
			"id": "bmds",
			"name": "Digitales",
			"children": [],
			"sliders": [
			{ "label": "IT-Infrastruktur des Bundes", "value": 1.086 },
			{ "label": "Digitalpolitik und Innovationen", "value": 0.208 },
			{ "label": "Sonstiges", "value": 0.150 }
			]
		},
		{
			"id": "bmj",
			"name": "Justiz",
			"children": [],
			"sliders": [
			{ "label": "Patent- und Markenamt", "value": 0.321 },
			{ "label": "Bundesgerichte und Generalbundesanwalt", "value": 0.223 },
			{ "label": "Bundesamt für Justiz", "value": 0.151 },
			{ "label": "Verbraucherpolitik", "value": 0.041 },
			{ "label": "Verwaltung und Sonstiges", "value": 0.473 }
			]
		},
		{
			"id": "vfo",
			"name": "Verfassungsorgane",
			"children": [],
			"sliders": [
			{ "label": "Deutscher Bundestag", "value": 1.276 },
			{ "label": "Bundesrechnungshof", "value": 0.219 },
			{ "label": "Bundespräsident", "value": 0.070 },
			{ "label": "Bundesverfassungsgericht", "value": 0.049 },
			{ "label": "Bundesrat", "value": 0.041 },
			{ "label": "Datenschutz und Kontrollrat", "value": 0.073 }
			]
		},
		{
			"id": "dbt",
			"name": "Reformoptionen",
			"children": [],
			"sliders": [
			{ "label": "Deutschlandticket", "value": 0, advanced: "dbt-deutschlandticket-advanced" },
			{ "label": "Klimageld", "value": 0, advanced: "dbt-klimageld-advanced" },
			{ "label": "Bedingungsloses Grundeinkommen", "value": 0, advanced: "dbt-bedingungsloses-grundeinkommen-advanced", max: 1500 }
			]
		},

		// ── Sondervermögen und Fonds (eigener Kreislauf, kreditfinanziert) ──
		{
			id: "sv",
			name: "Sondervermögen und Fonds",
			isIncomeRoot: true,
			children: ["svik", "ktf", "svbw", "afh"],
			sliders: [
			{ label: "Kredite Infrastruktur (SVIK)", value: 54.925, max: 200 },
			{ label: "Kredite Bundeswehr", value: 29.955, max: 200 },
			{ label: "CO2-Preis", value: 20.029, advanced: "sv-co2-preis-advanced" },
			{ label: "Entnahmen aus Rücklagen", value: 7.796 },
			{ label: "Europäischer Emissionshandel", value: 2.510 },
			{ label: "Zuführungen des Bundes", value: 1.174 }
			]
		},
		{
			id: "svik",
			name: "Infrastruktur und Klimaneutralität",
			children: [],
			sliders: [
			{ label: "Schienenwege der Bahn", value: 13.714 },
			{ label: "Zuweisungen an Länder und Kommunen", value: 8.333 },
			{ label: "Digitalisierung und Mikroelektronik", value: 6.791 },
			{ label: "Straßen und Wasserstraßen", value: 4.010 },
			{ label: "Krankenhaus-Transformationsfonds", value: 3.500 },
			{ label: "Klimaneutrale Wärmenetze", value: 1.865 },
			{ label: "Sonstige Investitionen", value: 6.712 }
			]
		},
		{
			id: "ktf",
			name: "Klima- und Transformationsfonds",
			children: [],
			sliders: [
			{ label: "Gebäudeförderung", value: 12.555 },
			{ label: "Strompreisentlastung Industrie", value: 7.445 },
			{ label: "Übertragungsnetzkosten", value: 5.525 },
			{ label: "Wasserstoff und Dekarbonisierung", value: 3.537 },
			{ label: "Zuführung an Rücklage", value: 3.100 },
			{ label: "Ladeinfrastruktur und E-Mobilität", value: 2.435 },
			{ label: "Sonstiges", value: 4.341 }
			]
		},
		{
			id: "svbw",
			name: "Sondervermögen Bundeswehr",
			children: [],
			sliders: [
			{ label: "Luftfahrzeuge", value: 9.721 },
			{ label: "Munition und Ausrüstung", value: 6.012 },
			{ label: "Schiffe und Marine", value: 4.611 },
			{ label: "Digitalisierung und Führungsfähigkeit", value: 3.775 },
			{ label: "Zinsen", value: 1.893 },
			{ label: "Sonstiges", value: 3.943 }
			]
		},
		{
			id: "afh",
			name: "Aufbauhilfefonds 2021",
			children: [],
			sliders: [
			{ label: "Infrastruktur in den Gemeinden", value: 1.553 },
			{ label: "Zuführung an Rücklage", value: 0.489 },
			{ label: "Hilfen für Haushalte und Unternehmen", value: 0.401 },
			{ label: "Sonstiges", value: 0.128 }
			]
		}

      ],
	  // ──────────────────────────────────────────────────────────────
	  // DETAILMODELLE
	  // Jedes Modell trifft mit unveraenderten Parametern den Soll-Wert 2027 aus
	  // dem Regierungsentwurf. Wo ein Mengengeruest die Realitaet nur grob abbildet,
	  // steht der Rest als benannte Konstante im Code – nicht als stiller Faktor.
	  advancedNodes:
	  [
	  // ── EINNAHMEN ──
	  {
		  id: "fm-mehrwertsteuer-advanced",
		  name: "Mehrwertsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  // Zwei Annahmen darüber, wie sich der Konsum auf Regel- und ermäßigten Satz
		  // verteilt. Beide sind eigene, nicht extern verifizierte Modellrechnungen –
		  // wer echte Institutszahlen hat, kann hier eine weitere Variante ergänzen.
		  variants: [
			{
			  key: "standard",
			  label: "Standardmodell (breite Konsumbasis)",
			  sliders: [
				{ label: "Regelsatz (%)", id: "rate_19", value: 19, max: 30, step: 0.1 },
				{ label: "Ermäßigter Satz (%)", id: "rate_7", value: 7, max: 15, step: 0.1 },
				{ label: "Anteil des Bundes (%)", id: "anteil_bund", value: 50, max: 100, step: 0.1 }
			  ],
			  formula: `
				// Konsumausgaben der privaten Haushalte und des Staates, soweit umsatzsteuerbar
				const konsum = 2.13024e12;
				const anteil_19 = 70;   // Anteil zum Regelsatz
				const anteil_7 = 25;    // Anteil zum ermäßigten Satz (Rest: steuerfrei)
				const steuer_19 = konsum * anteil_19 / 100 * rate_19 / 100;
				const steuer_7  = konsum * anteil_7  / 100 * rate_7  / 100;
				// Umsatz- und Einfuhrumsatzsteuer werden zwischen Bund, Ländern und Gemeinden geteilt
				return (steuer_19 + steuer_7) * anteil_bund / 100 / 1e9;
			  `
			},
			{
			  key: "hoher-ermaessigt-anteil",
			  label: "Alternativmodell (mehr Konsum zum ermäßigten Satz)",
			  note: "Nimmt einen größeren Anteil an Lebensmitteln, Mieten und Dienstleistungen zum 7-%-Satz an. Eigene Annahme, keine Instituts-Schätzung.",
			  sliders: [
				{ label: "Regelsatz (%)", id: "rate_19", value: 19, max: 30, step: 0.1 },
				{ label: "Ermäßigter Satz (%)", id: "rate_7", value: 7, max: 15, step: 0.1 },
				{ label: "Anteil des Bundes (%)", id: "anteil_bund", value: 50, max: 100, step: 0.1 }
			  ],
			  formula: `
				const konsum = 2.2187e12;
				const anteil_19 = 65;
				const anteil_7 = 30;    // 5 Punkte mehr als im Standardmodell
				const steuer_19 = konsum * anteil_19 / 100 * rate_19 / 100;
				const steuer_7  = konsum * anteil_7  / 100 * rate_7  / 100;
				return (steuer_19 + steuer_7) * anteil_bund / 100 / 1e9;
			  `
			}
		  ]
		},
		{
		  id: "fm-einkommensteuer-advanced",
		  name: "Einkommensteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  // Beide Varianten nutzen dieselbe Einkommensverteilung und dieselben Regler,
		  // unterscheiden sich nur im Tarifverlauf zwischen Eingangs- und Spitzensatz.
		  variants: [
			{
			  key: "zwei-zonen",
			  label: "Standardmodell (zweizoniger Tarif wie § 32a EStG)",
			  sliders: [
				{ label: "Grundfreibetrag", id: "freibetrag", value: 12348, max: 50000, step: 1 },
				{ label: "Eingangssteuersatz (%)", id: "eingangssatz", value: 14, max: 50, step: 0.1 },
				{ label: "Progressionsgrenze", id: "progressionsgrenze", value: 69879, max: 200000, step: 1 },
				{ label: "Max. Steuersatz (%)", id: "max_rate", value: 42, max: 100, step: 0.1 },
				{ label: "Top-Tax ab", id: "top_threshold", value: 277826, max: 1000000, step: 1 },
				{ label: "Top-Tax-Satz (%)", id: "top_rate", value: 45, max: 100, step: 0.1 }
			  ],
			  formula: `
				// Steuerpflichtige nach zu versteuerndem Einkommen (rd. 48,5 Mio., Summe rd. 1.550 Mrd. €)
				const einkommensverteilung = [
					{ einkommen: 5000,    anzahl: 5_200_000 },  // Minijobs, sehr geringe Einkommen
					{ einkommen: 10000,   anzahl: 6_000_000 },  // Rentner, Teilzeit, Studenten
					{ einkommen: 15000,   anzahl: 5_600_000 },  // einfache Beschäftigungen
					{ einkommen: 20000,   anzahl: 5_200_000 },  // unteres Mittelfeld
					{ einkommen: 25000,   anzahl: 4_900_000 },  // untere Mitte
					{ einkommen: 30000,   anzahl: 5_600_000 },  // mittlere Einkommen
					{ einkommen: 40000,   anzahl: 5_200_000 },  // mittlere Einkommen, Fachkräfte
					{ einkommen: 50000,   anzahl: 4_200_000 },  // obere Mitte
					{ einkommen: 60000,   anzahl: 2_800_000 },  // obere Mitte, Fach- und Führungskräfte
					{ einkommen: 75000,   anzahl: 1_750_000 },  // obere 10 %
					{ einkommen: 90000,   anzahl: 1_050_000 },  // obere 5 %
					{ einkommen: 120000,  anzahl: 520_000 },    // obere 1,5 %
					{ einkommen: 150000,  anzahl: 260_000 },    // obere 0,8 %
					{ einkommen: 200000,  anzahl: 128_000 },    // obere 0,4 %
					{ einkommen: 300000,  anzahl: 64_000 },     // obere 0,2 %
					{ einkommen: 500000,  anzahl: 32_000 },     // obere 0,1 %
					{ einkommen: 1000000, anzahl: 16_000 }      // obere 0,05 %
				];

				// Tarif 2026 nach § 32a EStG aus js/tax.js (incomeTax), mit den Reglerwerten
				// als Parametern. Der Knick (Grenzsteuersatz 23,97 %) liegt im amtlichen Tarif
				// 5.451 € über dem Grundfreibetrag; bei verschobenen Grenzen wandert er anteilig mit.
				const spanne = Math.max(1, progressionsgrenze - freibetrag);
				const basisSpanne = TAX_BASE.spitzeAb - TAX_BASE.freibetrag;
				const p = {
				  ...TAX_BASE,
				  freibetrag,
				  eingangssatz,
				  knickAbstand: TAX_BASE.knickAbstand * spanne / basisSpanne,
				  progEndeSatz: max_rate,
				  spitzeAb: progressionsgrenze,
				  spitzensatz: max_rate,
				  reichAb: top_threshold,
				  reichsatz: top_rate
				};
				const tarif = zvE => incomeTax(zvE, p);

				let gesamtsteuer = 0;
				for (const gruppe of einkommensverteilung) {
				  gesamtsteuer += tarif(gruppe.einkommen) * gruppe.anzahl;
				}

				const anteil_bund = 42.5;  // Bund 42,5 %, Länder 42,5 %, Gemeinden 15 %
				// Kalibrierung: die 17 Einkommensklassen bilden Ehegattensplitting und die
				// Streuung innerhalb der Klassen nicht ab und untertreffen das Ist um rd. 24 %.
				const KALIBRIERUNG = 1.24234;
				return gesamtsteuer * anteil_bund / 100 / 1e9 * KALIBRIERUNG;
			  `
			},
			{
			  key: "linear",
			  label: "Alternativmodell (linearer Grenzsteuersatz, kein Tarifknick)",
			  note: "Vereinfachung ohne den Knick des echten Tarifs: der Grenzsteuersatz steigt gleichmäßig vom Eingangs- bis zum Spitzensatz. Trifft das Soll 2027 bei unveränderten Reglern ebenso genau, verteilt die Wirkung von Änderungen aber gleichmäßiger über alle Einkommen statt stärker im unteren Mittelfeld.",
			  sliders: [
				{ label: "Grundfreibetrag", id: "freibetrag", value: 12348, max: 50000, step: 1 },
				{ label: "Eingangssteuersatz (%)", id: "eingangssatz", value: 14, max: 50, step: 0.1 },
				{ label: "Progressionsgrenze", id: "progressionsgrenze", value: 69879, max: 200000, step: 1 },
				{ label: "Max. Steuersatz (%)", id: "max_rate", value: 42, max: 100, step: 0.1 },
				{ label: "Top-Tax ab", id: "top_threshold", value: 277826, max: 1000000, step: 1 },
				{ label: "Top-Tax-Satz (%)", id: "top_rate", value: 45, max: 100, step: 0.1 }
			  ],
			  formula: `
				const einkommensverteilung = [
					{ einkommen: 5000,    anzahl: 5_200_000 },
					{ einkommen: 10000,   anzahl: 6_000_000 },
					{ einkommen: 15000,   anzahl: 5_600_000 },
					{ einkommen: 20000,   anzahl: 5_200_000 },
					{ einkommen: 25000,   anzahl: 4_900_000 },
					{ einkommen: 30000,   anzahl: 5_600_000 },
					{ einkommen: 40000,   anzahl: 5_200_000 },
					{ einkommen: 50000,   anzahl: 4_200_000 },
					{ einkommen: 60000,   anzahl: 2_800_000 },
					{ einkommen: 75000,   anzahl: 1_750_000 },
					{ einkommen: 90000,   anzahl: 1_050_000 },
					{ einkommen: 120000,  anzahl: 520_000 },
					{ einkommen: 150000,  anzahl: 260_000 },
					{ einkommen: 200000,  anzahl: 128_000 },
					{ einkommen: 300000,  anzahl: 64_000 },
					{ einkommen: 500000,  anzahl: 32_000 },
					{ einkommen: 1000000, anzahl: 16_000 }
				];

				// Eine einzige Progressionszone: der Grenzsteuersatz waechst linear vom
				// Eingangssatz bis zum Spitzensteuersatz, ohne Zwischenknick.
				function tarif(zvE) {
				  if (zvE <= freibetrag) return 0;
				  if (zvE <= progressionsgrenze) {
					const d = zvE - freibetrag;
					return d * (eingangssatz + (max_rate - eingangssatz) * d / (2 * (progressionsgrenze - freibetrag))) / 100;
				  }
				  let steuer = (progressionsgrenze - freibetrag) * (eingangssatz + max_rate) / 200 + max_rate / 100 * (zvE - progressionsgrenze);
				  if (zvE > top_threshold) steuer += (top_rate - max_rate) / 100 * (zvE - top_threshold);
				  return steuer;
				}

				let gesamtsteuer = 0;
				for (const gruppe of einkommensverteilung) {
				  gesamtsteuer += tarif(gruppe.einkommen) * gruppe.anzahl;
				}

				const anteil_bund = 42.5;
				const KALIBRIERUNG = 1.435925;
				return gesamtsteuer * anteil_bund / 100 / 1e9 * KALIBRIERUNG;
			  `
			}
		  ]
		},
		{
		  id: "fm-energiesteuer-advanced",
		  name: "Energiesteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Dieselsteuer (€/L)", id: "diesel_rate", value: 0.4704, max: 2, step: 0.01 },
			{ label: "Benzinsteuer (€/L)", id: "benzin_rate", value: 0.6545, max: 2, step: 0.01 },
			{ label: "Heizölsteuer (€/L)", id: "heizoel_rate", value: 0.061, max: 2, step: 0.01 },
			{ label: "Erdgassteuer (€/m³)", id: "gas_rate", value: 0.055, max: 2, step: 0.01 },
			{ label: "Kerosinsteuer (€/L)", id: "kerosin_rate", value: 0.00, max: 2, step: 0.01 }
		  ],
		  formula: `
			const diesel  = 37e9;   // Liter
			const benzin  = 17e9;   // Liter
			const heizoel = 13e9;   // Liter
			const gas     = 45e9;   // m³ (steuerpflichtiger Teil)
			const kerosin = 10e9;   // Liter, derzeit steuerbefreit
			// Flüssiggas, Schweröl und übrige Energieerzeugnisse
			const sonstige = 3.8007e9;
			const total = diesel * diesel_rate + benzin * benzin_rate + heizoel * heizoel_rate
						+ gas * gas_rate + kerosin * kerosin_rate + sonstige;
			return total / 1e9;
		  `
		},
		{
		  id: "fm-versicherungsteuer-advanced",
		  name: "Versicherungsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuersatz (%)", id: "vers_rate", value: 19, max: 40, step: 0.1 }
		  ],
		  formula: `
			// Steuerpflichtige Versicherungsprämien (ohne Lebens- und Krankenversicherung)
			const praemien = 112.263e9;
			return praemien * vers_rate / 100 / 1e9;
		  `
		},
		{
			id: "fm-koerperschaftsteuer-advanced",
			name: "Körperschaftsteuer – Details",
			parent: "fm",
			isVirtual: true,
			sliders: [
				{ label: "Steuersatz (%)", id: "koerp_rate", value: 15, max: 40, step: 0.1 },
				{ label: "Zu versteuernde Gewinne (Mrd €)", id: "gewinne", value: 243, max: 600, step: 1 }
			],
			formula: `
				const bund_anteil = 50;  // Körperschaftsteuer je zur Hälfte Bund und Länder
				const steuer = gewinne * 1e9 * koerp_rate / 100;
				return steuer * bund_anteil / 100 / 1e9;
			`
		},
		{
		  id: "fm-tabaksteuer-advanced",
		  name: "Tabaksteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuer pro Packung (€)", id: "steuer_pro_pack", value: 4.00, max: 15, step: 0.1 },
			{ label: "Packungen (Mrd)", id: "packungen", value: 3.2, max: 6, step: 0.1 }
		  ],
		  formula: `
			// Feinschnitt, Zigarren, Wasserpfeifentabak, Substitute (E-Liquids)
			const sonstige_tabakwaren = 4.986e9;
			return (packungen * 1e9 * steuer_pro_pack + sonstige_tabakwaren) / 1e9;
		  `
		},
		{
		  id: "fm-kapitalertragsteuer-advanced",
		  name: "Kapitalertragsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuersatz (%)", id: "kap_rate", value: 25, max: 100, step: 0.1 },
			{ label: "Sparer-Pauschbetrag (€)", id: "freibetrag", value: 1000, max: 100000, step: 100 }
		  ],
		  formula: `
			// Nicht veranlagte Steuern vom Ertrag: Abzug auf Dividenden und Ausschüttungen
			const kapitalertraege = 151.2e9;
			const anleger = 25e6;
			const anteil_bund = 50;   // je zur Hälfte Bund und Länder
			const steuerpflichtig = Math.max(0, kapitalertraege - freibetrag * anleger);
			return steuerpflichtig * kap_rate / 100 * anteil_bund / 100 / 1e9;
		  `
		},
		{
		  id: "fm-abgeltungsteuer-advanced",
		  name: "Abgeltungsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuersatz (%)", id: "abg_rate", value: 25, max: 100, step: 0.1 },
			{ label: "Sparer-Pauschbetrag (€)", id: "abg_freibetrag", value: 1000, max: 100000, step: 100 }
		  ],
		  formula: `
			// Zins- und Veräußerungserträge privater Anleger
			const ertraege = 117.4e9;
			const anleger = 25e6;
			const anteil_bund = 44;   // Bund 44 %, Länder 44 %, Gemeinden 12 %
			const steuerpflichtig = Math.max(0, ertraege - abg_freibetrag * anleger);
			return steuerpflichtig * abg_rate / 100 * anteil_bund / 100 / 1e9;
		  `
		},
		{
		  id: "fm-maut-advanced",
		  name: "Maut – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Mautsatz (€/km)", id: "maut_satz", value: 0.35, max: 2, step: 0.01 },
			{ label: "Fahrleistung (Mrd km)", id: "fahrleistung", value: 37.703, max: 80, step: 0.1 }
		  ],
		  formula: `
			// Mautpflichtige Fahrleistung schwerer Nutzfahrzeuge, Satz inkl. CO2-Aufschlag
			return fahrleistung * maut_satz;
		  `
		},
		{
		  id: "fm-solidaritätszuschlag-advanced",
		  name: "Solidaritätszuschlag – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Zuschlagsatz (%)", id: "soli_satz", value: 5.5, max: 15, step: 0.1 },
			{ label: "Soli-pflichtiger Anteil der ESt (%)", id: "soli_anteil", value: 39.8, max: 100, step: 0.1 }
		  ],
		  formula: `
			// Seit 2021 zahlen nur noch die oberen rd. 10 % der Einkommensteuerpflichtigen
			const est_gesamt = 369.65;              // Lohn- und Einkommensteuer insgesamt (Mrd €)
			const kst_und_kapitalertraege = 91.061; // voll soli-pflichtig (Mrd €)
			const basis = est_gesamt * soli_anteil / 100 + kst_und_kapitalertraege;
			return basis * soli_satz / 100;         // fließt vollständig dem Bund zu
		  `
		},
		{
		  id: "fm-kfz-steuer-advanced",
		  name: "Kfz-Steuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Durchschnitt pro Pkw (€)", id: "kfz_rate", value: 155, max: 800, step: 5 },
			{ label: "Pkw-Bestand (Mio)", id: "pkw", value: 49.3, max: 70, step: 0.1 }
		  ],
		  formula: `
			// Nutzfahrzeuge, Anhänger und Krafträder zahlen nach anderen Tarifen
			const nutzfahrzeuge = 1.8185e9;
			return (pkw * 1e6 * kfz_rate + nutzfahrzeuge) / 1e9;
		  `
		},
		{
		  id: "fm-stromsteuer-advanced",
		  name: "Stromsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Steuersatz (ct/kWh)", id: "strom_rate", value: 2.05, max: 5, step: 0.05 }
		  ],
		  formula: `
			// Steuerpflichtiger Verbrauch: von rd. 460 TWh sind Industrie und Schienenbahnen
			// weitgehend entlastet, voll besteuert werden rd. 248 TWh.
			const stromverbrauch = 248.3e9; // kWh
			return stromverbrauch * strom_rate / 100 / 1e9;
		  `
		},
		{
		  id: "fm-verbrauchsteuern-advanced",
		  name: "Alkohol-, Kaffee- und Schaumweinsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Alkoholsteuer (€/hl reiner Alkohol)", id: "alk_satz", value: 1303, max: 4000, step: 10 },
			{ label: "Kaffeesteuer (€/kg)", id: "kaffee_satz", value: 2.19, max: 10, step: 0.01 },
			{ label: "Schaumweinsteuer (€/hl)", id: "schaumwein_satz", value: 136, max: 500, step: 1 }
		  ],
		  formula: `
			const alkohol = 1.764e6;     // hl reiner Alkohol (Spirituosen)
			const kaffee = 480e6;        // kg Röstkaffee
			const schaumwein = 2.45e6;   // hl
			return (alkohol * alk_satz + kaffee * kaffee_satz + schaumwein * schaumwein_satz) / 1e9;
		  `
		},
		{
		  id: "fm-gewerbesteuerumlage-advanced",
		  name: "Gewerbesteuerumlage – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Bundesanteil (%)", id: "umlage_satz", value: 3.5, max: 20, step: 0.1 },
			{ label: "Gewerbesteueraufkommen (Mrd €)", id: "gewerbesteuer", value: 78.086, max: 150, step: 1 }
		  ],
		  formula: `
			// Die Gemeinden führen einen Teil der Gewerbesteuer an Bund und Länder ab
			return gewerbesteuer * umlage_satz / 100;
		  `
		},
		{
		  id: "fm-luftverkehrsteuer-advanced",
		  name: "Luftverkehrsteuer – Details",
		  parent: "fm",
		  isVirtual: true,
		  sliders: [
			{ label: "Kurzstrecke (€/Passagier)", id: "kurz_satz", value: 12.48, max: 100, step: 0.1 },
			{ label: "Mittelstrecke (€/Passagier)", id: "mittel_satz", value: 31.61, max: 200, step: 0.1 },
			{ label: "Langstrecke (€/Passagier)", id: "lang_satz", value: 56.70, max: 400, step: 0.1 }
		  ],
		  formula: `
			// Abflüge von deutschen Flughäfen, Sätze seit der Absenkung zum 1. Juli 2026
			const kurz = 62e6;
			const mittel = 15e6;
			const lang = 8.5e6;
			return (kurz * kurz_satz + mittel * mittel_satz + lang * lang_satz) / 1e9;
		  `
		},
		{
		  id: "fm-vermoegensteuer-advanced",
		  name: "Vermögensteuer",
		  parent: "fm",
		  isVirtual: true,
		  // Beide Verteilungen sind grobe Näherungen an rd. 68 Mio. Erwachsene und liefern
		  // beim Standard-Steuersatz 0 % identisch 0 €. Der Unterschied zeigt sich erst,
		  // sobald der Regler bewegt wird – siehe variantNote.
		  variants: [
			{
			  key: "breit",
			  label: "Verteilung A (breite Streuung)",
			  sliders: [
				{ label: "Freibetrag", id: "v_freibetrag", value: 3000000, max: 100000000, step: 10000 },
				{ label: "Steuersatz (%)", id: "v_steuersatz", value: 0.0, max: 5.0, step: 0.1 }
			  ],
			  formula: `
				const vermoegensverteilung = [
				  { vermoegen: 0, anzahl: 14_000_000 },        // kein Nettovermögen oder Verschuldung
				  { vermoegen: 10_000, anzahl: 10_000_000 },
				  { vermoegen: 50_000, anzahl: 12_000_000 },
				  { vermoegen: 100_000, anzahl: 14_000_000 },
				  { vermoegen: 250_000, anzahl: 8_000_000 },
				  { vermoegen: 500_000, anzahl: 6_000_000 },   // obere 8 %
				  { vermoegen: 1_000_000, anzahl: 2_500_000 }, // obere 1,5 %
				  { vermoegen: 2_500_000, anzahl: 1_000_000 }, // obere 0,7 %
				  { vermoegen: 5_000_000, anzahl: 400_000 },
				  { vermoegen: 10_000_000, anzahl: 150_000 },
				  { vermoegen: 25_000_000, anzahl: 40_000 },
				  { vermoegen: 50_000_000, anzahl: 10_000 },
				  { vermoegen: 100_000_000, anzahl: 3_000 }
				];

				let gesamtsteuer = 0;
				for (const gruppe of vermoegensverteilung) {
				  const netto = Math.max(0, gruppe.vermoegen - v_freibetrag);
				  gesamtsteuer += netto * v_steuersatz / 100 * gruppe.anzahl;
				}
				return gesamtsteuer / 1e9;
			  `
			},
			{
			  key: "konzentriert",
			  label: "Verteilung B (stärkere Konzentration an der Spitze)",
			  note: "Vermögensbefragungen wie die EZB-Erhebung HFCS finden regelmäßig eine deutlich stärkere Konzentration an der Spitze, als eine grobe Dezil-Einteilung zeigt. Diese Variante bildet das nach, ist aber ebenfalls keine Instituts-Schätzung, sondern eine eigene Annäherung.",
			  sliders: [
				{ label: "Freibetrag", id: "v_freibetrag", value: 3000000, max: 100000000, step: 10000 },
				{ label: "Steuersatz (%)", id: "v_steuersatz", value: 0.0, max: 5.0, step: 0.1 }
			  ],
			  formula: `
				const vermoegensverteilung = [
				  { vermoegen: 0, anzahl: 16_000_000 },
				  { vermoegen: 10_000, anzahl: 11_000_000 },
				  { vermoegen: 50_000, anzahl: 11_000_000 },
				  { vermoegen: 100_000, anzahl: 12_000_000 },
				  { vermoegen: 250_000, anzahl: 7_000_000 },
				  { vermoegen: 500_000, anzahl: 5_500_000 },
				  { vermoegen: 1_000_000, anzahl: 3_000_000 },
				  { vermoegen: 2_500_000, anzahl: 1_400_000 },
				  { vermoegen: 5_000_000, anzahl: 600_000 },
				  { vermoegen: 10_000_000, anzahl: 250_000 },
				  { vermoegen: 25_000_000, anzahl: 80_000 },
				  { vermoegen: 50_000_000, anzahl: 25_000 },
				  { vermoegen: 100_000_000, anzahl: 8_000 }
				];

				let gesamtsteuer = 0;
				for (const gruppe of vermoegensverteilung) {
				  const netto = Math.max(0, gruppe.vermoegen - v_freibetrag);
				  gesamtsteuer += netto * v_steuersatz / 100 * gruppe.anzahl;
				}
				return gesamtsteuer / 1e9;
			  `
			}
		  ]
		},
		{
			id: "fm-finanztransaktionssteuer-advanced",
			name: "Finanztransaktionssteuer",
			parent: "fm",
			isVirtual: true,
			sliders: [
			  { label: "Steuersatz (%)", id: "t_satz", value: 0.0, max: 1.0, step: 0.01 },
			  { label: "Ausweichquote (%)", id: "t_ausweich", value: 25, max: 90, step: 1 }
			],
			formula: `
			  // Handelsvolumen deutscher Aktien pro Jahr; ein Teil des Handels wandert
			  // bei Einführung ins Ausland ab oder unterbleibt.
			  const t_volumen = 1800;  // Mrd €
			  return t_volumen * t_satz / 100 * (1 - t_ausweich / 100);
			`
		},
		{
			id: "fm-digitalsteuer-advanced",
			name: "Digitalsteuer (Big Tech)",
			parent: "fm",
			isVirtual: true,
			sliders: [
			  { label: "Steuersatz (%)", id: "d_steuersatz", value: 0, max: 10, step: 0.1 },
			  { label: "Besteuerte Umsätze (Mrd €)", id: "d_umsatz", value: 20, max: 100, step: 1 }
			],
			formula: `
			  // In Deutschland erzielte Werbe- und Vermittlungsumsätze großer Digitalkonzerne.
			  // Zum Vergleich: Frankreichs Digitalsteuer bringt bei 3 % rd. 0,7 Mrd €.
			  return d_umsatz * d_steuersatz / 100;
			`
		},
		{
		  id: "sv-co2-preis-advanced",
		  name: "CO₂-Preis – Details",
		  parent: "sv",
		  isVirtual: true,
		  sliders: [
			{ label: "Preis je Tonne CO₂ (€)", id: "co2_rate", value: 85, max: 300, step: 1 }
		  ],
		  formula: `
			// Emissionen aus Brennstoffen für Wärme und Verkehr; ab 2027 löst der
			// europäische Emissionshandel ETS 2 den nationalen Handel ab.
			const emissionen = 235.64e6; // t CO2
			return emissionen * co2_rate / 1e9;
		  `
		},

		  // ── AUSGABEN ──
		  {
			id: "bmas-zuschuss-rentenversicherung-advanced",
			name: "Zuschuss Rentenversicherung – Details",
			parent: "bmas",
			isVirtual: true,
			sliders: [
			  { label: "Rentenausgaben (Mrd €)", id: "rentenausgaben", value: 403.184, max: 700, step: 1 },
			  { label: "Bundesanteil (%)", id: "renten_anteil", value: 25, max: 60, step: 0.1 }
			],
			formula: `
			  // Allgemeiner und zusätzlicher Bundeszuschuss zur allgemeinen Rentenversicherung
			  return rentenausgaben * renten_anteil / 100;
			`
		  },
		  {
			id: "bmas-bürgergeld-advanced",
			name: "Bürgergeld – Details",
			parent: "bmas",
			isVirtual: true,
			sliders: [
			  { label: "Leistungsberechtigte (Mio)", id: "bg_personen", value: 5.5, max: 12, step: 0.1 },
			  { label: "Regelsatz (€/Monat)", id: "bg_regelsatz", value: 419.7, max: 1500, step: 0.1 }
			],
			formula: `
			  // Regelleistungsberechtigte im SGB II, gemittelter Regelbedarf über alle
			  // Altersstufen (Alleinstehende 563 €, Kinder je nach Alter weniger)
			  return bg_personen * 1e6 * bg_regelsatz * 12 / 1e9;
			`
		  },
		  {
			id: "bmas-kosten-der-unterkunft-advanced",
			name: "Kosten der Unterkunft – Details",
			parent: "bmas",
			isVirtual: true,
			sliders: [
			  { label: "Bedarfsgemeinschaften (Mio)", id: "kdu_bg", value: 2.85, max: 6, step: 0.01 },
			  { label: "Unterkunftskosten (€/Monat)", id: "kdu_kosten", value: 550, max: 1500, step: 10 },
			  { label: "Bundesanteil (%)", id: "kdu_anteil", value: 69.88, max: 100, step: 0.1 }
			],
			formula: `
			  // Die Kommunen tragen die Unterkunftskosten, der Bund beteiligt sich daran
			  return kdu_bg * 1e6 * kdu_kosten * 12 * kdu_anteil / 100 / 1e9;
			`
		  },
		  {
			id: "bmv-militärisches-personal-advanced",
			name: "Militärisches Personal – Details",
			parent: "bmv",
			isVirtual: true,
			sliders: [
			  { label: "Soldatinnen und Soldaten (Tsd)", id: "soldaten", value: 183, max: 400, step: 1 },
			  { label: "Bezüge je Soldat (Tsd €)", id: "soldaten_bezuege", value: 58, max: 150, step: 1 }
			],
			formula: `
			  // Versorgungsbezüge, Sozialversicherung und laufender Betrieb der Truppe
			  const sonstige = 12.807e9;
			  return (soldaten * 1e3 * soldaten_bezuege * 1e3 + sonstige) / 1e9;
			`
		  },
		  {
			id: "bfin-zinsen-bundesanleihen-advanced",
			name: "Zinsen Bundesanleihen – Details",
			parent: "bfin",
			isVirtual: true,
			sliders: [
			  { label: "Umlaufende Bundesanleihen (Mrd €)", id: "anleihen", value: 1100, max: 2500, step: 10 },
			  { label: "Durchschnittlicher Kupon (%)", id: "kupon", value: 2.183, max: 8, step: 0.01 }
			],
			formula: `
			  // Nur die langlaufenden Bundesanleihen; Obligationen, Schatzanweisungen
			  // und Sondervermögen stehen in eigenen Positionen.
			  return anleihen * kupon / 100;
			`
		  },
		  {
			id: "bmi-bundespolizei-advanced",
			name: "Bundespolizei – Details",
			parent: "bmi",
			isVirtual: true,
			sliders: [
			  { label: "Beschäftigte (Tsd)", id: "bpol_personal", value: 54, max: 120, step: 1 },
			  { label: "Personalkosten je Kopf (Tsd €)", id: "bpol_kosten", value: 88, max: 200, step: 1 }
			],
			formula: `
			  // Sachmittel, Liegenschaften, Luftfahrzeuge und Ausrüstung
			  const sachausgaben = 0.428e9;
			  return (bpol_personal * 1e3 * bpol_kosten * 1e3 + sachausgaben) / 1e9;
			`
		  },
		  {
			id: "bmfjs-elterngeld-advanced",
			name: "Elterngeld – Details",
			parent: "bmfjs",
			isVirtual: true,
			sliders: [
			  { label: "Geburten (Tsd)", id: "geburten", value: 675, max: 1200, step: 5 },
			  { label: "Bezugsmonate je Geburt", id: "eg_monate", value: 15.61, max: 40, step: 0.1 },
			  { label: "Durchschnittsbetrag (€/Monat)", id: "eg_betrag", value: 671, max: 1800, step: 1 }
			],
			formula: `
			  // Mutter und Vater zusammen; ElterngeldPlus verlängert den Bezug bei
			  // halbiertem Monatsbetrag, daher der Durchschnitt unter dem Basisbetrag.
			  return geburten * 1e3 * eg_monate * eg_betrag / 1e9;
			`
		  },
		  {
			id: "bmfjs-kinderzuschlag-advanced",
			name: "Kinderzuschlag – Details",
			parent: "bmfjs",
			isVirtual: true,
			sliders: [
			  { label: "Kinder im Bezug (Tsd)", id: "kiz_kinder", value: 900, max: 3000, step: 10 },
			  { label: "Kinderzuschlag (€/Monat)", id: "kiz_betrag", value: 288.5, max: 600, step: 0.5 }
			],
			formula: `
			  // Zuschlag für Familien knapp oberhalb des Bürgergeldanspruchs (Höchstbetrag 297 €)
			  return kiz_kinder * 1e3 * kiz_betrag * 12 / 1e9;
			`
		  },
		  {
			id: "bmwsb-wohngeld-advanced",
			name: "Wohngeld – Details",
			parent: "bmwsb",
			isVirtual: true,
			sliders: [
			  { label: "Wohngeldhaushalte (Tsd)", id: "wg_haushalte", value: 816, max: 3000, step: 1 },
			  { label: "Wohngeld (€/Monat)", id: "wg_betrag", value: 370, max: 1000, step: 5 },
			  { label: "Bundesanteil (%)", id: "wg_anteil", value: 50, max: 100, step: 1 }
			],
			formula: `
			  // Bund und Länder tragen das Wohngeld je zur Hälfte
			  return wg_haushalte * 1e3 * wg_betrag * 12 * wg_anteil / 100 / 1e9;
			`
		  },
		  {
			id: "dbt-klimageld-advanced",
			name: "Klimageld",
			parent: "dbt",
			isVirtual: true,
			sliders: [
			  { label: "Bevölkerung (Millionen)", id: "klima_bewohner", value: 83, max: 100, step: 1 },
			  { label: "Pro-Kopf-Betrag (€/Jahr)", id: "klima_betrag", value: 0, max: 5000, step: 10 }
			],
			formula: `
			  // Pauschale Rückerstattung der CO2-Einnahmen an alle Einwohner
			  return klima_bewohner * klima_betrag / 1000;
			`
		  },
		  {
			id: "dbt-deutschlandticket-advanced",
			name: "Deutschlandticket",
			parent: "dbt",
			isVirtual: true,
			sliders: [
			  { label: "Abonnenten (Mio)", id: "dt_abos", value: 13, max: 100, step: 1 },
			  { label: "Zusätzlicher Zuschuss (€/Jahr)", id: "dt_zuschuss", value: 0, max: 1000, step: 10 }
			],
			formula: `
			  // Zusätzlich zu den Regionalisierungsmitteln, die bereits an die Länder fließen
			  return dt_abos * dt_zuschuss / 1000;
			`
		  },
		  {
			id: "dbt-bedingungsloses-grundeinkommen-advanced",
			name: "Bedingungsloses Grundeinkommen",
			parent: "dbt",
			isVirtual: true,
			sliders: [
			  { label: "Erwachsene (Mio)", id: "bge_erwachsene", value: 69, max: 100, step: 1 },
			  { label: "Kinder (Mio)", id: "bge_kinder", value: 14, max: 100, step: 1 },
			  { label: "BGE Erwachsene (€/Monat)", id: "bge_e_betrag", value: 0, max: 5000, step: 10 },
			  { label: "BGE Kinder (€/Monat)", id: "bge_k_betrag", value: 0, max: 5000, step: 10 }
			],
			formula: `
			  // Bruttokosten; Bürgergeld, Grundsicherung und Kindergeld würden entfallen
			  return (bge_erwachsene * bge_e_betrag + bge_kinder * bge_k_betrag) * 12 / 1000;
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
    { label: "Bundeszuschuss", value: 12.5 }   // HH 2027: pauschale Abgeltung gesamtgesellschaftlicher Aufgaben
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
    { label: "Bundeszuschuss", value: 120.399, max: 300 }  // HH 2027: Zuschuss + zusätzlicher Zuschuss + Kindererziehungszeiten
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
    { label: "Bundeszuschuss", value: 0 }   // HH 2027: kein Bundeszuschuss zur sozialen Pflegeversicherung veranschlagt
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
      return gesamtEinnahmen * 1.23913 / 1_000_000_000;
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

    return gesamtEinnahmen * 1.04379 / 1_000_000_000;
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
			{ label: "Erbschaftsteuer", value: 6.200, advanced: "laender-erbschaftsteuer-advanced" },
			{ label: "Anteil Umsatzsteuer", value: 120.000 },
			// aus dem Bundeshaushalt 2027 (Kap. 6001, Zuweisungen an die Länder)
			{ label: "Zuweisungen des Bundes", value: 34.523 }
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
			  // Verteilung von 100.000 steuerpflichtigen Erwerben pro Jahr
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

			  // Der Regler skaliert die gesamte Verteilung
			  const skalierung = e_faelle / 100000;
			  let gesamtsteuer = 0;

			  for (const fall of erbschaften) {
				const steuerpflichtigerBetrag = Math.max(0, fall.wert - e_freibetrag);
				const steuerProFall = steuerpflichtigerBetrag * (e_steuersatz / 100);
				gesamtsteuer += steuerProFall * fall.faelle * skalierung;
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
if (!data.variantChoice) {
    data.variantChoice = {};
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
