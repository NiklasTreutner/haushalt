// ──────────────────────────────────────────────────────────────
// SZENARIEN (Vorschläge von Akteuren)
//
// Ein Szenario ist ein benannter Satz von Regler-Überschreibungen, referenziert
// über stabile Pfade "<Knoten-ID>.<Regler-Slug>" (siehe sliderPath in
// calculations.js) bzw. bei Formel-Reglern "<advancedNodeId>.<Parameter-ID>".
// Szenarien wirken bewusst nur auf den Bund-Tab, weil dort die politisch
// diskutierten Stellschrauben (Steuersätze, große Ausgabenposten) liegen.
//
// WICHTIG: Die beiden Beispiel-Szenarien unten sind erfundene Illustrationen
// dieses Autors, keine echten Programme einer Partei oder eines Instituts.
// Um eine reale Position abzubilden, ein neues Objekt mit Quellenangabe
// (z. B. Link zum Wahlprogramm) hier ergänzen – das Format ist unten dokumentiert.

const scenarios = [
  {
    id: "beispiel-umverteilung",
    label: "Beispiel A – Höhere Vermögensbesteuerung & Klimageld",
    quelle: "Illustratives Beispiel dieses Tools – keine echte Parteiposition",
    overrides: {
      "fm-vermoegensteuer-advanced.v_steuersatz": 1.0,
      "fm-einkommensteuer-advanced.max_rate": 47,
      "fm-einkommensteuer-advanced.top_rate": 49,
      "fm-solidaritätszuschlag-advanced.soli_satz": 8,
      "sv-co2-preis-advanced.co2_rate": 130,
      "dbt-klimageld-advanced.klima_betrag": 200
    }
  },
  {
    id: "beispiel-entlastung",
    label: "Beispiel B – Steuersenkung & Ausgabenkürzung",
    quelle: "Illustratives Beispiel dieses Tools – keine echte Parteiposition",
    overrides: {
      "fm-einkommensteuer-advanced.max_rate": 38,
      "fm-koerperschaftsteuer-advanced.koerp_rate": 12,
      "allgfin.globale-minderausgabe": -20,
      "bmas.bürgergeld": 24,
      "bmv.militärische-beschaffungen": 25
    }
  }
];

// Unveraenderlicher Ausgangszustand (siehe BASELINE in calculations.js)
const SCENARIO_BASELINE = BASELINE;

// Gruppiert Override-Pfade nach Knoten-ID: { nodeId: { param: value, ... } }
function groupScenarioOverrides(overrides) {
  const byNode = {};
  Object.entries(overrides || {}).forEach(([path, value]) => {
    const dot = path.indexOf(".");
    if (dot === -1) {
      console.warn("Ungültiger Szenario-Pfad (kein Punkt):", path);
      return;
    }
    const nodeId = path.slice(0, dot);
    const param = path.slice(dot + 1);
    (byNode[nodeId] = byNode[nodeId] || {})[param] = value;
  });
  return byNode;
}

// Wertet die Formel eines Templates einmalig mit gegebenen Parametern aus,
// ohne irgendeinen Knoten im laufenden Canvas zu berühren.
function evalTemplateFormula(tpl, overrideParams) {
  const variant = getTemplateVariants(tpl)[0]; // Szenarien zielen auf die Standard-Variante
  const params = {};
  variant.sliders.forEach(s => { if (s.id) params[s.id] = Number(s.value); });
  Object.assign(params, overrideParams);
  return new Function(...Object.keys(params), variant.formula)(...Object.values(params));
}

// Baut eine Knoten-Instanz der Standard-Variante mit den Szenario-Werten schon
// in den Reglern eingetragen – so zeigt ein spaeter geoeffnetes Detail-Panel
// die tatsaechlich wirksamen Parameter statt der unveraenderten Vorgaben.
function resolveInstanceWithOverrides(tpl, overrideParams) {
  const instance = resolveTemplateInstance(tpl, getTemplateVariants(tpl)[0].key);
  instance.sliders.forEach(s => {
    if (s.id && s.id in overrideParams) s.value = Number(overrideParams[s.id]);
  });
  return instance;
}

// Reine Simulation: rechnet ein Szenario auf Basis von SCENARIO_BASELINE.bund
// durch und liefert Kennzahlen zurück, OHNE die aktuell angezeigten Regler
// anzufassen. Dient der Vergleichstabelle.
function computeScenarioSnapshot(scenario) {
  const base = SCENARIO_BASELINE.bund;
  const values = {}; // nodeId -> { slug: value }
  base.nodes.forEach(n => {
    values[n.id] = {};
    (n.sliders || []).forEach(s => { values[n.id][slugify(s.label)] = Number(s.value) || 0; });
  });

  const byNode = groupScenarioOverrides(scenario.overrides);
  Object.entries(byNode).forEach(([nodeId, params]) => {
    if (values[nodeId]) {
      Object.entries(params).forEach(([slug, value]) => {
        if (slug in values[nodeId]) values[nodeId][slug] = Number(value);
        else console.warn(`Szenario "${scenario.id}": unbekannter Regler ${nodeId}.${slug}`);
      });
      return;
    }
    const tpl = findTemplateIn(base, nodeId);
    if (!tpl) { console.warn(`Szenario "${scenario.id}": unbekannter Knoten ${nodeId}`); return; }
    let result;
    try { result = evalTemplateFormula(tpl, params); }
    catch (e) { console.error(`Szenario "${scenario.id}": Formelfehler in ${nodeId}`, e); return; }
    const parent = base.nodes.find(n => n.id === tpl.parent);
    const slider = parent && parent.sliders.find(s => advancedIdFor(parent.id, s) === nodeId);
    if (slider) values[parent.id][slugify(slider.label)] = roundBetrag(result);
  });

  let income = 0, expense = 0;
  const nodeTotals = {};
  base.nodes.forEach(n => {
    const total = Object.values(values[n.id]).reduce((a, b) => a + b, 0);
    nodeTotals[n.id] = roundBetrag(total);
    if (n.isIncomeRoot) income += total;
    else if (!n.isVirtual) expense += total;
  });

  return { income: roundBetrag(income), expense: roundBetrag(expense), balance: roundBetrag(income - expense), nodeTotals };
}

// Laedt ein Szenario in die lebendige Ansicht: baut den Bund-Datensatz aus der
// Baseline neu auf, wendet die Overrides direkt auf die Regler an und
// wechselt (falls noetig) auf den Bund-Tab.
function applyScenarioLive(scenario) {
  datasets.bund = structuredClone(SCENARIO_BASELINE.bund);
  datasets.bund.closedAdvancedNodes = {};
  datasets.bund.variantChoice = {};

  const byNode = groupScenarioOverrides(scenario.overrides);
  Object.entries(byNode).forEach(([nodeId, params]) => {
    const node = datasets.bund.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.entries(params).forEach(([slug, value]) => {
        const slider = node.sliders.find(s => slugify(s.label) === slug);
        if (slider) slider.value = Number(value);
        else console.warn(`Szenario "${scenario.id}": unbekannter Regler ${nodeId}.${slug}`);
      });
      return;
    }
    const tpl = findTemplateIn(datasets.bund, nodeId);
    if (!tpl) { console.warn(`Szenario "${scenario.id}": unbekannter Knoten ${nodeId}`); return; }
    let result;
    try { result = evalTemplateFormula(tpl, params); }
    catch (e) { console.error(`Szenario "${scenario.id}": Formelfehler in ${nodeId}`, e); return; }
    const parent = datasets.bund.nodes.find(n => n.id === tpl.parent);
    const slider = parent && parent.sliders.find(s => advancedIdFor(parent.id, s) === nodeId);
    if (slider) slider.value = roundBetrag(result);

    // Detail-Panel "geschlossen" mit den Szenario-Werten hinterlegen, damit ein
    // spaeteres Oeffnen die tatsaechlich wirksamen Parameter zeigt statt der
    // unveraenderten Vorgabewerte.
    if (parent) {
      const instance = resolveInstanceWithOverrides(tpl, params);
      datasets.bund.closedAdvancedNodes[nodeId] = {
        ...instance, id: nodeId, parent: parent.id, isAdvanced: true, x: 0, y: 0
      };
    }
  });

  const bundButton = document.querySelector('#sidebar button[data-tab="bund"]');
  if (bundButton) bundButton.click(); // uebernimmt datasets.bund als aktive Ansicht + rendert neu
}

// ──────────────────────────────────────────────
// UI: Szenario-Panel

function buildScenarioPanel() {
  const overlay = document.createElement("div");
  overlay.id = "scenario-panel";
  overlay.className = "scenario-panel hidden";

  const box = document.createElement("div");
  box.className = "scenario-box";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "scenario-close";
  closeBtn.setAttribute("aria-label", "Szenarien schließen");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.add("hidden");
  });
  box.appendChild(closeBtn);

  const heading = document.createElement("h2");
  heading.textContent = "Szenarien";
  box.appendChild(heading);

  const hint = document.createElement("p");
  hint.className = "scenario-hint";
  hint.textContent = "Wirkt nur auf den Bund-Tab. \"Anwenden\" lädt ein Szenario in die Ansicht, die Auswahl unten vergleicht mehrere Szenarien in einer Tabelle.";
  box.appendChild(hint);

  const list = document.createElement("div");
  list.className = "scenario-list";

  const resetRow = document.createElement("div");
  resetRow.className = "scenario-row";
  resetRow.innerHTML = `<label><input type="checkbox" checked disabled> <strong>Regierungsentwurf 2027</strong> (Basis)</label>`;
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Anwenden";
  resetBtn.addEventListener("click", () => {
    applyScenarioLive({ id: "baseline", overrides: {} });
    overlay.classList.add("hidden");
  });
  resetRow.appendChild(resetBtn);
  list.appendChild(resetRow);

  const checkboxes = [];
  scenarios.forEach(scenario => {
    const row = document.createElement("div");
    row.className = "scenario-row";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = scenario.id;
    checkboxes.push(checkbox);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${scenario.label}`));
    row.appendChild(label);

    const note = document.createElement("div");
    note.className = "scenario-quelle";
    note.textContent = scenario.quelle;
    row.appendChild(note);

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Anwenden";
    applyBtn.addEventListener("click", () => {
      applyScenarioLive(scenario);
      overlay.classList.add("hidden");
    });
    row.appendChild(applyBtn);

    list.appendChild(row);
  });

  box.appendChild(list);

  const compareBtn = document.createElement("button");
  compareBtn.className = "scenario-compare-btn";
  compareBtn.textContent = "Ausgewählte vergleichen";
  box.appendChild(compareBtn);

  const resultContainer = document.createElement("div");
  resultContainer.className = "scenario-result";
  box.appendChild(resultContainer);

  compareBtn.addEventListener("click", () => {
    const selected = scenarios.filter((_, i) => checkboxes[i].checked);
    resultContainer.innerHTML = "";
    if (!selected.length) {
      resultContainer.textContent = "Bitte mindestens ein Szenario auswählen.";
      return;
    }
    resultContainer.appendChild(buildComparisonTable(selected));
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  return overlay;
}

// Baut die Kennzahlen-Tabelle: Einnahmen/Ausgaben/Saldo, dann alle Ressorts,
// bei denen sich mindestens ein Szenario spürbar vom Regierungsentwurf unterscheidet.
function buildComparisonTable(selectedScenarios) {
  const baseline = { id: "baseline", label: "Regierungsentwurf 2027" };
  const snapshots = [baseline, ...selectedScenarios].map(s => ({
    scenario: s,
    snap: s.id === "baseline" ? computeScenarioSnapshot({ overrides: {} }) : computeScenarioSnapshot(s)
  }));

  const baseSnap = snapshots[0].snap;
  const nodeNames = Object.fromEntries(SCENARIO_BASELINE.bund.nodes.map(n => [n.id, n.name]));
  const nodeOrder = SCENARIO_BASELINE.bund.nodes.map(n => n.id);

  const EPS = 0.05; // Mrd. – Positionen darunter gelten als "unveraendert"
  const changedRows = nodeOrder.filter(id =>
    snapshots.some(s => Math.abs((s.snap.nodeTotals[id] || 0) - (baseSnap.nodeTotals[id] || 0)) > EPS)
  );

  const table = document.createElement("table");
  table.className = "scenario-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Position</th>` + snapshots.map(s => `<th>${s.scenario.label}</th>`).join("");
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  function addRow(label, getValue, opts = {}) {
    const tr = document.createElement("tr");
    if (opts.strong) tr.className = "scenario-row-strong";
    let cells = `<td>${label}</td>`;
    snapshots.forEach(s => {
      const v = getValue(s.snap);
      const delta = v - getValue(baseSnap);
      const deltaTxt = s.scenario.id === "baseline" || Math.abs(delta) < EPS
        ? ""
        : ` (${delta > 0 ? "+" : ""}${delta.toLocaleString('de-DE', { maximumFractionDigits: 1 })})`;
      cells += `<td>${v.toLocaleString('de-DE', { maximumFractionDigits: 1 })}${deltaTxt}</td>`;
    });
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  }

  addRow("Einnahmen", s => s.income, { strong: true });
  addRow("Ausgaben", s => s.expense, { strong: true });
  addRow("Saldo", s => s.balance, { strong: true });

  if (changedRows.length) {
    const sep = document.createElement("tr");
    sep.innerHTML = `<td colspan="${snapshots.length + 1}" class="scenario-sep">Veränderte Ressorts</td>`;
    tbody.appendChild(sep);
    changedRows
      .sort((a, b) => {
        const maxDelta = id => Math.max(...snapshots.map(s => Math.abs((s.snap.nodeTotals[id] || 0) - (baseSnap.nodeTotals[id] || 0))));
        return maxDelta(b) - maxDelta(a);
      })
      .forEach(id => addRow(nodeNames[id] || id, s => s.nodeTotals[id] || 0));
  }

  table.appendChild(tbody);
  return table;
}

// Sidebar-Button anhängen (nach dem Laden von ui.js, damit dessen generischer
// Tab-Klick-Handler diesen Button nicht faelschlich als Tab behandelt).
function initScenarioUI() {
  const sidebar = document.getElementById("sidebar-actions") || document.getElementById("sidebar");
  if (!sidebar) return;

  const button = document.createElement("button");
  button.textContent = "Szenarien";
  button.className = "scenario-open-btn";

  const panel = buildScenarioPanel();
  button.addEventListener("click", () => panel.classList.remove("hidden"));

  sidebar.prepend(button);
}

initScenarioUI();
