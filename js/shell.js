// ──────────────────────────────────────────────────────────────
// APP-RAHMEN: Navigation zwischen den Bereichen ("Staatsfinanzen-OS")
//
// Jeder Bereich registriert sich mit registerView(). Die Haushaltsansicht (Karten
// und Regler) bleibt der Kern; alle anderen Bereiche lesen deren aktuellen Stand
// über budgetSnapshot() – Änderungen an Reglern wirken also überall mit.

const VIEWS = [];
let activeViewId = null;

function registerView(view) { VIEWS.push(view); }

// Summen eines Datensatzes direkt aus den Reglerwerten (Formeln sind beim
// Bewegen der Regler bereits in die Elternregler geschrieben worden)
function datasetTotals(ds) {
  const sum = n => (n.sliders || []).reduce((a, s) => a + (Number(s.value) || 0), 0);
  const income = ds.nodes.filter(n => n.isIncomeRoot).reduce((a, n) => a + sum(n), 0);
  const expenseNodes = ds.nodes.filter(n => !n.isIncomeRoot && !n.isVirtual && !n.isAdvanced && !n.hiddenFromSummary);
  const expense = expenseNodes.reduce((a, n) => a + sum(n), 0);
  return { income, expense, balance: income - expense, expenseNodes, sum };
}

// Der Bund-Datensatz enthält Kernhaushalt (Einnahmen "fm" und dessen Ressorts) und
// die Sondervermögen ("sv" und Fonds). Steuern sind brutto veranschlagt, die
// Abführungen an EU und Länder stehen als Ressort "eu" – für die offiziellen
// Netto-Summen (Ausgaben 2027: 555,4 Mrd. €) werden sie herausgerechnet.
function budgetSnapshot() {
  const ds = datasets.bund;
  const sum = n => (n ? n.sliders || [] : []).reduce((a, s) => a + (Number(s.value) || 0), 0);
  const byId = id => ds.nodes.find(n => n.id === id);
  const fm = byId("fm"), sv = byId("sv"), bfin = byId("bfin");
  const core = ds.nodes.filter(n => fm.children.includes(n.id));
  const sonder = sv ? ds.nodes.filter(n => sv.children.includes(n.id)) : [];
  const abf = sum(byId("eu"));

  const expenseGross = core.reduce((a, n) => a + sum(n), 0);
  const expense = expenseGross - abf;
  const income = sum(fm) - abf;
  const zinsen = bfin ? bfin.sliders.filter(s => /zins/i.test(s.label)).reduce((a, s) => a + Number(s.value), 0) : 0;
  const steuern = fm.sliders.filter(s => !/verwaltung/i.test(s.label)).reduce((a, s) => a + Number(s.value), 0) - abf;
  const ministries = core.map(n => ({ id: n.id, name: n.name, value: sum(n) })).sort((a, b) => b.value - a.value);
  const revenues = fm.sliders.map(s => ({ label: s.label, value: Number(s.value) })).sort((a, b) => b.value - a.value);
  const sonderKredite = sv ? sv.sliders.filter(s => /kredit/i.test(s.label)).reduce((a, s) => a + Number(s.value), 0) : 0;

  const whole = datasetTotals(ds), wholeBase = datasetTotals(BASELINE.bund);
  return {
    expense, expenseGross, income, abf, zinsen, steuern, ministries, revenues,
    gap: expense - income,
    sonder: { expense: sonder.reduce((a, n) => a + sum(n), 0), kredite: sonderKredite },
    balanceDelta: whole.balance - wholeBase.balance,
    changed: Math.abs(whole.balance - wholeBase.balance) >= 0.005,
    sozial: datasetTotals(datasets.sozial),
    laender: datasetTotals(datasets.laender)
  };
}

function findSlider(dsKey, nodeId, labelRe) {
  const node = datasets[dsKey].nodes.find(n => n.id === nodeId);
  return node && node.sliders.find(s => labelRe.test(s.label));
}

function bundSlider(nodeId, labelRe) {
  return findSlider("bund", nodeId, labelRe);
}

// Setzt einen Regler in einem Datensatz von außen (z. B. Steuerreform aus dem
// Steuerbereich). Ein offenes oder gemerktes Detailmodell würde den Wert sonst
// beim nächsten Rendern wieder überschreiben und wird deshalb verworfen.
function setSliderIn(dsKey, nodeId, labelRe, value) {
  const ds = datasets[dsKey];
  const node = ds.nodes.find(n => n.id === nodeId);
  const slider = node && node.sliders.find(s => labelRe.test(s.label));
  if (!slider) return false;
  if (slider.advanced) {
    const advId = typeof slider.advanced === "string" ? slider.advanced : advancedIdFor(node.id, slider);
    ds.nodes = ds.nodes.filter(n => n.id !== advId);
    if (ds.closedAdvancedNodes) delete ds.closedAdvancedNodes[advId];
  }
  slider.value = roundBetrag(value);
  if (currentTab === dsKey) data = ds;
  return true;
}

function setBundSlider(nodeId, labelRe, value) {
  return setSliderIn("bund", nodeId, labelRe, value);
}

function baselineBundSlider(nodeId, labelRe) {
  const node = BASELINE.bund.nodes.find(n => n.id === nodeId);
  const slider = node && node.sliders.find(s => labelRe.test(s.label));
  return slider ? Number(slider.value) : 0;
}

// ──────────────────────────────────────────────
// ROUTING (#/bereich)

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  return { view: parts[0] || "overview", arg: parts[1] || null };
}

function navigate(viewId, arg) {
  const hash = `#/${viewId === "overview" ? "" : viewId}${arg ? "/" + arg : ""}`;
  if (location.hash === hash) showRoute();
  else location.hash = hash;
}

function showRoute() {
  const { view, arg } = parseRoute();
  const target = VIEWS.find(v => v.id === view) || VIEWS[0];
  activeViewId = target.id;

  VIEWS.forEach(v => { v.el.hidden = v !== target; });
  document.querySelectorAll("#section-nav a").forEach(a => {
    const active = a.dataset.view === target.id;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.title = target.id === "overview" ? "Staatsfinanzen – Übersicht" : `${target.title} – Staatsfinanzen`;
  target.show(arg);
  if (target.el.classList.contains("page")) target.el.scrollTop = 0;
}

function buildShell() {
  const nav = document.getElementById("section-nav");
  VIEWS.forEach(v => {
    nav.appendChild(h("a", { href: `#/${v.id === "overview" ? "" : v.id}`, "data-view": v.id },
      h("span", { class: "nav-icon", "aria-hidden": "true" }, v.icon), h("span", { class: "nav-text" }, v.title)));
  });
  window.addEventListener("hashchange", showRoute);

  let resizeFrame = null;
  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      const v = VIEWS.find(x => x.id === activeViewId);
      if (v && v.onResize) v.onResize();
    });
  });
}

// Einfache Seitenansicht: render(el) baut den Inhalt bei jedem Öffnen neu auf,
// damit Zahlen aus dem Haushalt immer aktuell sind.
function pageView({ id, title, icon, render, teaser }) {
  const el = h("section", { class: "view page", id: `view-${id}`, hidden: true, "aria-label": title });
  document.getElementById("views").appendChild(el);
  const view = { id, title, icon, el, teaser,
    show() { render(el); },
    onResize() { render(el); } };
  registerView(view);
  return view;
}

// Kopf einer Seitenansicht
function pageHeader(kicker, title, lead) {
  return h("header", { class: "page-header" },
    h("p", { class: "kicker" }, kicker),
    h("h1", {}, title),
    lead ? h("p", { class: "lead" }, lead) : null);
}

function sourceNote(text) {
  return h("p", { class: "source-note" }, text);
}
