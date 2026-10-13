let isApplyingFormula = false;

// Formelergebnisse werden auf Millionen genau uebernommen. Frueher wurde hier auf
// volle Mrd. gerundet – dann veraenderte schon das Oeffnen eines Detailfensters
// den Haushalt.
function roundBetrag(value) {
  return Math.round(value * 1000) / 1000;
}

// ──────────────────────────────────────────────
// STABILE BEZEICHNER
// Alle Stellen, die einen Regler eindeutig ansprechen muessen (DOM-IDs, der Link
// zum zugehoerigen Detail-Knoten, Szenario-Overrides), nutzen denselben Slug.
// Damit reicht eine Stelle zum Anpassen, und Szenarien/Varianten koennen sich
// darauf verlassen, dass ein Pfad wie "bmas.buergergeld" immer denselben Regler trifft.
function slugify(label) {
  return label.toLowerCase().replace(/\s/g, "-");
}

function domId(nodeId, slider) {
  return `${nodeId}-${slugify(slider.label)}`;
}

function advancedIdFor(nodeId, slider) {
  return `${nodeId}-${slugify(slider.label)}-advanced`;
}

// Override-Pfad fuer Szenarien: "<Knoten-ID>.<Regler-Slug>"
function sliderPath(nodeId, slider) {
  return `${nodeId}.${slugify(slider.label)}`;
}

// ──────────────────────────────────────────────
// REGIERUNGSENTWURF ALS BEZUGSPUNKT
// Unveraenderte Kopie aller Datensaetze, erfasst direkt nach data.js – bevor
// irgendeine Interaktion Werte aendern kann. Grundlage fuer Delta-Anzeigen,
// Zuruecksetzen, Szenarien und den gemeinsamen Reglermassstab.
const BASELINE = structuredClone(datasets);

// Abweichungen darunter (Rundung der Detailmodelle) gelten als "unveraendert"
const DELTA_EPS = 0.005;

function findBaselineNode(nodeId) {
  for (const ds of Object.values(BASELINE)) {
    const node = ds && ds.nodes.find(n => n.id === nodeId);
    if (node) return node;
  }
  return null;
}

function findBaselineTemplate(id) {
  for (const ds of Object.values(BASELINE)) {
    const tpl = ds && findTemplateIn(ds, id);
    if (tpl) return tpl;
  }
  return null;
}

// Wert eines Reglers im Regierungsentwurf (null, wenn unbekannt)
function baselineValue(node, slider) {
  if (node.isAdvanced) {
    const tpl = findBaselineTemplate(node.id);
    if (!tpl) return null;
    const variants = getTemplateVariants(tpl);
    const variant = variants.find(v => v.key === node.activeVariant) || variants[0];
    const match = variant.sliders.find(s => s.id ? s.id === slider.id : s.label === slider.label);
    return match ? Number(match.value) : null;
  }
  const base = findBaselineNode(node.id);
  const match = base && (base.sliders || []).find(s => s.label === slider.label);
  return match ? Number(match.value) : null;
}

function sliderDelta(node, slider) {
  const base = baselineValue(node, slider);
  if (base === null) return 0;
  const delta = Number(slider.value) - base;
  return Math.abs(delta) < DELTA_EPS ? 0 : delta;
}

// Summe eines Ressort-Knotens im Entwurf (Detailknoten haben keine eigene Summe)
function baselineNodeTotal(node) {
  const base = !node.isAdvanced && findBaselineNode(node.id);
  if (!base || !base.sliders) return 0;
  return base.sliders.reduce((sum, s) => sum + Number(s.value || 0), 0);
}

function nodeDelta(node) {
  if (node.isAdvanced || !findBaselineNode(node.id)) return 0;
  const delta = calculateNodeTotal(node) - baselineNodeTotal(node);
  return Math.abs(delta) < DELTA_EPS ? 0 : delta;
}

// Gemeinsamer Massstab aller Ressort-Regler der aktuellen Ansicht – bewusst fuer
// alle gleich, damit die Reglerstellung die Groessenordnung zeigt. Abgeleitet aus
// dem Entwurf: groesster Einzelposten x1,5, auf volle 100 aufgerundet
// (Bund 300, Sozialkassen 600, Laender 300).
function sharedSliderMax(nodes) {
  const values = nodes
    .map(n => !n.isAdvanced && findBaselineNode(n.id))
    .filter(Boolean)
    .flatMap(n => (n.sliders || []).map(s => Math.abs(Number(s.value) || 0)));
  return Math.ceil(Math.max(100, ...values) * 1.5 / 100) * 100;
}

// Ist die Karte aufgeklappt? Detailknoten sind es immer; sonst entscheidet der
// Nutzer, voreingestellt ueber COLLAPSE_CARDS_BY_DEFAULT (main.js).
function isCardOpen(node) {
  if (node.isAdvanced) return true;
  return node.open ?? !COLLAPSE_CARDS_BY_DEFAULT;
}

// ──────────────────────────────────────────────
// ZAHLENFORMATE

function fmtNumber(value, digits = 1) {
  return Number(value).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtMrd(value) {
  return `${fmtNumber(value)} Mrd. €`;
}

// Vorzeichen immer sichtbar; sehr kleine Aenderungen mit mehr Stellen, damit sie nicht als "0,0" erscheinen
function fmtDelta(delta) {
  const abs = Math.abs(delta);
  const digits = abs < 0.1 ? 3 : abs < 1000 ? 1 : 0;
  return `${delta > 0 ? "+" : "−"}${abs.toLocaleString('de-DE', { maximumFractionDigits: digits })}`;
}

function findTemplateIn(dataset, id) {
  return (dataset.advancedNodes || []).find(t => t.id === id);
}

function findTemplate(id) {
  return findTemplateIn(data, id);
}

// ──────────────────────────────────────────────
// BERECHNUNGS-VARIANTEN
// Eine Formel-Vorlage kann mehrere gleichwertige Umsetzungen anbieten (z. B.
// unterschiedliche Institute oder Modellannahmen). Ohne "variants" verhaelt sich
// eine Vorlage weiterhin wie ein einzelner Regler-/Formel-Satz.
function getTemplateVariants(tpl) {
  if (Array.isArray(tpl.variants) && tpl.variants.length) return tpl.variants;
  return [{ key: "standard", label: "Standard", sliders: tpl.sliders, formula: tpl.formula, note: tpl.note }];
}

// Baut aus einer Vorlage + gewaehltem Variantenschluessel einen einsatzbereiten
// Knoten (mit eigenen, unabhaengigen Reglern). Wird beim Oeffnen eines
// Detail-Panels und beim Umschalten der Variante verwendet.
function resolveTemplateInstance(tpl, variantKey) {
  const variants = getTemplateVariants(tpl);
  const chosen = variants.find(v => v.key === variantKey) || variants[0];
  const rest = { ...tpl };
  delete rest.variants;
  delete rest.sliders;
  delete rest.formula;
  delete rest.note;
  return {
    ...structuredClone(rest),
    sliders: structuredClone(chosen.sliders),
    formula: chosen.formula,
    activeVariant: chosen.key,
    variantOptions: variants.length > 1 ? variants.map(v => ({ key: v.key, label: v.label })) : null,
    variantNote: chosen.note || null
  };
}

function applyCustomFormula(node) {
  if (isApplyingFormula) return;
  if (!node.formula) return;

  // try/finally: frueher blieb das Flag bei jedem fruehen return (z. B. fehlender
  // Elternknoten) auf true haengen und legte danach alle Formeln still.
  isApplyingFormula = true;
  try {
    return evaluateAndApplyFormula(node);
  } finally {
    isApplyingFormula = false;
  }
}

function evaluateAndApplyFormula(node) {

  // Build params object with slider IDs and their numeric values
  const params = {};
  node.sliders.forEach(s => {
    if (s.id) {
      const val = Number(s.value);
      if (isNaN(val)) {
        console.warn(`Slider value for '${s.id}' is not a number:`, s.value);
      }
      params[s.id] = val;
    }
  });

  // Create function from formula string
  let func;
  try {
    func = new Function(...Object.keys(params), node.formula);
  } catch (e) {
    console.error("Error compiling formula:", e);
    return;
  }

  // Execute formula with current slider values
  let result;
  try {
    result = func(...Object.values(params));
  } catch (e) {
    console.error("Error evaluating formula:", e);
    return;
  }

  if (typeof result !== "number" || isNaN(result)) {
    console.error("Formula result is not a valid number:", result);
    return;
  }

  // Find parent node
  const parentNode = data.nodes.find(n => n.id === node.parent);
  if (!parentNode) {
    console.warn("Parent node not found for node:", node.id);
    return;
  }

  // Find matching slider in parent node
  const slider = parentNode.sliders.find(s => advancedIdFor(parentNode.id, s) === node.id);

  if (!slider) {
    console.warn("Matching parent slider not found for advanced node id:", node.id);
    return;
  }

  // Update slider value
  slider.value = roundBetrag(result);

  // Call updateParentSlider to update UI, totals, inputs, etc.
  updateParentSlider(node, result);

  return result;
}


// ──────────────────────────────────────────────
// ANZEIGE-AGGREGATION (siehe AGG_THRESHOLD in main.js)
// Die Daten bleiben immer vollständig, nur die Darstellung wird ausgedünnt.

// Regler mit Detailmodell sind Stellschrauben und werden nie versteckt –
// sonst verschwänden z. B. Vermögensteuer oder BGE, die bewusst bei 0 stehen.
function isLeverSlider(slider) {
  return Boolean(slider.advanced || slider.keep);
}

// Liefert die anzuzeigenden Zeilen: entweder { slider } oder { rest, value }
function getVisibleRows(node) {
  const sliders = node.sliders || [];
  if (node.expanded) return sliders.map(slider => ({ slider }));

  const big = [];
  const small = [];
  sliders.forEach(slider => {
    const value = Math.abs(Number(slider.value) || 0);
    if (isLeverSlider(slider) || value >= AGG_THRESHOLD) big.push(slider);
    else small.push(slider);
  });

  // Ein einzelner kleiner Posten gewinnt nichts durch Zusammenfassen
  if (small.length < 2) return sliders.map(slider => ({ slider }));

  const value = small.reduce((sum, slider) => sum + Number(slider.value || 0), 0);
  return [...big.map(slider => ({ slider })), { rest: small, value }];
}

// Kleine Knoten zeigen nur noch Titel und Summe
function isCollapsedNode(node) {
  if (node.open === true) return false; // vom Nutzer aufgeklappt
  if (node.expanded || node.isIncomeRoot || node.isAdvanced || node.isVirtual) return false;
  if (!node.sliders || !node.sliders.length) return false;
  if (node.sliders.some(isLeverSlider)) return false;
  return Math.abs(calculateNodeTotal(node)) < AGG_THRESHOLD;
}

// Verbirgt der Knoten gerade etwas (oder ist er aufgeklappt)?
function hasHiddenDetail(node, rows) {
  return Boolean(node.expanded) || isCollapsedNode(node) || rows.some(row => row.rest);
}


function calculateNodeTotal(node) {
  if (!node.sliders) return 0;

  // If node itself has a formula, compute and return its result
  if (node.formula) {
    const result = applyCustomFormula(node);
    if (typeof result === "number" && !isNaN(result)) {
      return roundBetrag(result); // gleiche Genauigkeit wie im Elternregler
    } else {
      console.warn("Formula result invalid for node", node.id);
	  console.warn("Formula result:", result);
      return 0;
    }
  }

  // Otherwise, check for advanced subnodes and apply their formulas
  for (const slider of node.sliders) {
    const advancedNodeId = advancedIdFor(node.id, slider);
    const advancedNode = data.nodes.find(n => n.id === advancedNodeId && n.formula);
    if (advancedNode) {
      applyCustomFormula(advancedNode);
    }
  }

  // Sum all current slider values
  return node.sliders.reduce((sum, slider) => sum + Number(slider.value || 0), 0);
}


function updateSummary() {
  const incomeNodes = data.nodes.filter(n => n.isIncomeRoot);

  const expenseNodes = data.nodes.filter(n =>
    !n.isIncomeRoot && !n.isVirtual && !n.hiddenFromSummary
  );

  const totalIncome = incomeNodes.reduce((sum, node) => sum + calculateNodeTotal(node), 0);
  const totalExpenses = expenseNodes.reduce((sum, node) => sum + calculateNodeTotal(node), 0);
  const balance = totalIncome - totalExpenses;

  document.getElementById('total-income').textContent = fmtNumber(totalIncome);
  document.getElementById('total-expenses').textContent = fmtNumber(totalExpenses);
  document.getElementById('balance').textContent = fmtNumber(balance);

  const balanceElement = document.getElementById('balance');
  balanceElement.className = balance >= 0 ? 'positive' : 'negative';

  // Abstand zum Regierungsentwurf, bezogen auf dieselben Knoten wie oben
  const baseTotal = nodes => nodes.reduce((sum, node) => sum + baselineNodeTotal(node), 0);
  const balanceDelta = balance - (baseTotal(incomeNodes) - baseTotal(expenseNodes));
  const deltaEl = document.getElementById('balance-delta');
  if (deltaEl) {
    const changed = Math.abs(balanceDelta) >= DELTA_EPS;
    deltaEl.hidden = !changed;
    deltaEl.textContent = changed ? `${fmtDelta(balanceDelta)} ggü. Entwurf` : "";
    deltaEl.className = `delta-badge ${balanceDelta >= 0 ? 'delta-good' : 'delta-bad'}`;
  }
}
