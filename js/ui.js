function makeDraggable(panel, handle, node) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handle.style.cursor = "move";

  handle.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    e.preventDefault();
    isDragging = true;

    // Account for current zoom level
    offsetX = e.clientX - panel.offsetLeft * zoomLevel;
    offsetY = e.clientY - panel.offsetTop * zoomLevel;

    function onMouseMove(e) {
      if (!isDragging) return;

      const adjustedX = (e.clientX - offsetX) / zoomLevel;
      const adjustedY = (e.clientY - offsetY) / zoomLevel;

      panel.style.left = `${adjustedX}px`;
      panel.style.top = `${adjustedY}px`;

      // Position merken, damit ein Neuaufbau die Karte nicht zurücksetzt
      node.x = adjustedX;
      node.y = adjustedY;
      node.manualPos = { x: adjustedX, y: adjustedY };

      drawConnections();
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// Kleine Hilfe für echte <button>-Elemente (tastatur- und screenreaderfähig)
function makeButton(className, text, ariaLabel) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  if (ariaLabel) {
    btn.setAttribute("aria-label", ariaLabel);
    btn.title = ariaLabel;
  }
  return btn;
}

// ──────────────────────────────────────────────
// DELTA-ANZEIGE (Abweichung vom Regierungsentwurf)

// Farbe nach Wirkung auf den Saldo: mehr Einnahmen bzw. weniger Ausgaben grün,
// umgekehrt rot. Parameter von Detailmodellen (Steuersätze usw.) bleiben neutral.
function deltaEffect(node) {
  if (node.isAdvanced) return 0;
  return node.isIncomeRoot ? 1 : -1;
}

function setDeltaBadge(badge, delta, effect = 1) {
  badge.hidden = delta === 0;
  badge.textContent = delta === 0 ? "" : fmtDelta(delta);
  const tone = effect === 0 ? "delta-neutral" : delta * effect > 0 ? "delta-good" : "delta-bad";
  badge.className = `delta-badge ${tone}`;
}

function updateSliderDelta(node, slider) {
  const id = domId(node.id, slider);
  const delta = sliderDelta(node, slider);
  const badge = document.getElementById(`${id}-delta`);
  const reset = document.getElementById(`${id}-reset`);
  if (badge) setDeltaBadge(badge, delta, deltaEffect(node));
  if (reset) reset.hidden = delta === 0;
}

// Summe, Delta, Größenbalken und Markierung einer Karte nachführen
function updateNodeFooter(node, div) {
  const total = calculateNodeTotal(node);

  const totalValue = div.querySelector(".total-value");
  if (totalValue) totalValue.textContent = fmtMrd(total);

  const delta = nodeDelta(node);
  const badge = div.querySelector(".total .delta-badge");
  if (badge) setDeltaBadge(badge, delta, deltaEffect(node));

  const changed = delta !== 0 || (node.sliders || []).some(s => sliderDelta(node, s) !== 0);
  div.classList.toggle("changed", changed);
  const reset = div.querySelector(".node-reset-btn");
  if (reset) reset.hidden = !changed;

  const fill = div.querySelector(".node-sizebar-fill");
  if (fill) fill.style.width = `${sizeBarPercent(total)}%`;
}

// Größenbalken: Anteil an der größten Karte der Ansicht (im Entwurf), damit die
// Balken beim Verschieben einzelner Regler nicht alle mitspringen.
let sizeBarScale = 1;

function sizeBarPercent(total) {
  return Math.min(100, Math.abs(total) / sizeBarScale * 100);
}

function computeSizeBarScale() {
  const totals = data.nodes.filter(n => !n.isAdvanced).map(n => Math.abs(baselineNodeTotal(n)));
  sizeBarScale = Math.max(1, ...totals);
}

// ──────────────────────────────────────────────
// ZURÜCKSETZEN

// Setzt einen Regler auf den Entwurf zurück. Hängt daran ein Detailmodell, wird
// auch dessen Parametersatz verworfen – sonst würde die offene Formel den Wert
// sofort wieder überschreiben.
function resetSlider(node, slider) {
  const base = baselineValue(node, slider);
  if (base === null) return;

  if (!node.isAdvanced && slider.advanced) {
    const advancedId = typeof slider.advanced === "string" ? slider.advanced : advancedIdFor(node.id, slider);
    delete data.closedAdvancedNodes[advancedId];
    const open = data.nodes.find(n => n.id === advancedId);
    if (open) resetAdvancedNodeParams(open);
  }

  slider.value = base;
  if (node.isAdvanced) applyCustomFormula(node);
  renderCurrentTab();
}

function resetAdvancedNodeParams(node) {
  node.sliders.forEach(s => {
    const base = baselineValue(node, s);
    if (base !== null) s.value = base;
  });
}

function resetNode(node) {
  if (node.isAdvanced) {
    resetAdvancedNodeParams(node);
    applyCustomFormula(node);
    renderCurrentTab();
    return;
  }
  (node.sliders || []).forEach(slider => {
    const base = baselineValue(node, slider);
    if (base === null) return;
    if (slider.advanced) {
      const advancedId = typeof slider.advanced === "string" ? slider.advanced : advancedIdFor(node.id, slider);
      delete data.closedAdvancedNodes[advancedId];
      const open = data.nodes.find(n => n.id === advancedId);
      if (open) resetAdvancedNodeParams(open);
    }
    slider.value = base;
  });
  renderCurrentTab();
}

// Setzt alle Werte der aktuellen Ansicht zurück, lässt aber Auf-/Zuklappen und
// verschobene Positionen stehen. Geöffnete Detailmodelle werden geschlossen.
function resetAll() {
  const tabs = currentTab === "gesamt" ? ["bund", "sozial", "laender"] : [currentTab];
  tabs.forEach(tab => {
    const fresh = structuredClone(BASELINE[tab]);
    fresh.nodes.forEach(n => {
      const old = datasets[tab].nodes.find(o => o.id === n.id);
      if (old) Object.assign(n, { open: old.open, expanded: old.expanded, manualPos: old.manualPos });
    });
    fresh.closedAdvancedNodes = {};
    fresh.variantChoice = {};
    datasets[tab] = fresh;
  });
  selectTab(currentTab);
}

function hasAnyChange() {
  return data.nodes.some(node => (node.sliders || []).some(s => sliderDelta(node, s) !== 0));
}

// ──────────────────────────────────────────────
// REGLER

function updateSliderUI(slider, node, div) {
  const sliderInput = document.getElementById(domId(node.id, slider));
  const numberInput = document.getElementById(`${domId(node.id, slider)}-number`);

  // Der Regler kann zusammengefasst und damit unsichtbar sein – Summen
  // und Verbindungen müssen trotzdem nachgeführt werden.
  if (sliderInput && numberInput) {
    sliderInput.value = slider.value;
    if (document.activeElement !== numberInput) numberInput.value = slider.value;
  }

  updateSliderDelta(node, slider);
  updateNodeFooter(node, div);

  drawConnections();
  updateSummary();
  scheduleIndexRefresh();
}

function updateParentSlider(node, result) {
  const parentNode = data.nodes.find(n => n.id === node.parent);
  if (!parentNode) {
    console.warn("Parent node not found for node:", node.id);
    return;
  }

  const slider = parentNode.sliders.find(s => advancedIdFor(parentNode.id, s) === node.id);

  if (!slider) {
    console.warn("Matching parent slider not found for advanced node id:", node.id);
    return;
  }

  slider.value = roundBetrag(result);

  const parentDiv = document.getElementById(parentNode.id);
  if (parentDiv) {
    updateSliderUI(slider, parentNode, parentDiv);
  }
}

function updateSlider(slider, sliderInput, numberInput, node, div, source, value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return;

  // Grenzen kommen vom Zahlenfeld: der Schieberegler nutzt den gemeinsamen
  // Massstab, das Zahlenfeld erlaubt auch Werte darüber hinaus.
  slider.value = Math.min(Math.max(numValue, Number(numberInput.min)), Number(numberInput.max));

  if (source !== sliderInput) sliderInput.value = slider.value;
  if (source !== numberInput) numberInput.value = slider.value;

  updateSliderUI(slider, node, div);
}

function createSlider(slider, container, node, div) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-container";

  wrapper.appendChild(createLabel(slider, node, div));

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "slider-controls";

  const sliderInput = createSliderElement(slider, node);
  const numberInput = createNumberInput(slider, node);

  controlsContainer.appendChild(sliderInput);
  controlsContainer.appendChild(numberInput);
  wrapper.appendChild(controlsContainer);

  const handleSliderUpdate = (source, value) =>
    updateSlider(slider, sliderInput, numberInput, node, div, source, value);

  sliderInput.addEventListener("input", (e) => handleSliderUpdate(sliderInput, e.target.value));
  numberInput.addEventListener("input", (e) => handleSliderUpdate(numberInput, e.target.value));
  numberInput.addEventListener("change", (e) => {
    handleSliderUpdate(numberInput, e.target.value);
    numberInput.value = slider.value;
  });

  container.appendChild(wrapper);
}

// Zusammengefasste Zeile für alle Posten unterhalb von AGG_THRESHOLD
function createRestRow(row, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-container rest-row";
  wrapper.title = row.rest.map(s => `${s.label}: ${Number(s.value).toLocaleString('de-DE')}`).join("\n");

  const label = document.createElement("div");
  label.className = "slider-label";
  label.innerHTML = `<span>Übrige Posten (${row.rest.length}):</span>`;
  wrapper.appendChild(label);

  const value = document.createElement("div");
  value.className = "rest-value";
  value.textContent = row.value.toLocaleString('de-DE');
  wrapper.appendChild(value);

  container.appendChild(wrapper);
}

// Blendet die zusammengefassten Posten ein bzw. aus
function createDetailToggle(node) {
  const btn = makeButton(
    "link-btn detail-toggle",
    node.expanded ? "Kleine Posten zusammenfassen" : "Alle Posten zeigen"
  );
  btn.setAttribute("aria-expanded", String(Boolean(node.expanded)));
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    node.expanded = !node.expanded;
    renderCurrentTab();
  });
  return btn;
}

function createLabel(slider, node, div) {
  const label = document.createElement("div");
  label.className = "slider-label";

  if (slider.advanced) {
    // Öffnet das Detailmodell (z. B. Steuersätze) als eigene Karte
    const btn = makeButton("link-btn slider-name", `${slider.label} ▸`);
    btn.title = "Detailmodell öffnen/schließen";
    attachAdvancedClick(slider, btn, node);
    label.appendChild(btn);
  } else {
    const name = document.createElement("label");
    name.className = "slider-name";
    name.htmlFor = domId(node.id, slider);
    name.textContent = slider.label;
    label.appendChild(name);
  }

  const side = document.createElement("span");
  side.className = "slider-side";

  const badge = document.createElement("span");
  badge.id = `${domId(node.id, slider)}-delta`;
  setDeltaBadge(badge, sliderDelta(node, slider), deltaEffect(node));
  side.appendChild(badge);

  const reset = makeButton("icon-btn reset-btn", "↺", `${slider.label} auf Entwurf zurücksetzen`);
  reset.id = `${domId(node.id, slider)}-reset`;
  reset.hidden = sliderDelta(node, slider) === 0;
  reset.addEventListener("click", () => resetSlider(node, slider));
  side.appendChild(reset);

  label.appendChild(side);
  return label;
}

// Ressort-Regler teilen sich einen Maßstab (siehe sharedSliderMax); Detailmodelle
// behalten ihre eigenen Einheiten und Grenzen.
let currentSliderMax = 200;

function sliderBounds(slider, node) {
  const min = typeof slider.min === "number" ? slider.min : 0;
  if (node.isAdvanced) {
    const max = typeof slider.max === "number" ? slider.max : 200;
    return { min, rangeMax: max, inputMax: max, step: slider.step ?? 1 };
  }
  return {
    min,
    rangeMax: currentSliderMax,
    inputMax: Math.max(currentSliderMax, typeof slider.max === "number" ? slider.max : 0),
    step: slider.step ?? 0.1
  };
}

function createSliderElement(slider, node) {
  const bounds = sliderBounds(slider, node);
  const input = document.createElement("input");
  input.type = "range";
  input.min = bounds.min;
  input.max = bounds.rangeMax;
  input.step = bounds.step;
  input.value = slider.value;
  input.id = domId(node.id, slider);
  input.setAttribute("aria-label", slider.label);
  return input;
}

function createNumberInput(slider, node) {
  const bounds = sliderBounds(slider, node);
  const input = document.createElement("input");
  input.type = "number";
  input.min = bounds.min;
  input.max = bounds.inputMax;
  input.step = bounds.step;
  input.value = slider.value;
  input.id = `${domId(node.id, slider)}-number`;
  input.setAttribute("aria-label", `${slider.label} (Wert)`);
  return input;
}

// ──────────────────────────────────────────────
// ADVANCED NODE HANDLING
function attachAdvancedClick(slider, button, node) {
  button.addEventListener("click", () => {
    const advancedNodeId = typeof slider.advanced === "string"
      ? slider.advanced
      : advancedIdFor(node.id, slider);

    const existingIndex = data.nodes.findIndex(n => n.id === advancedNodeId);

    if (existingIndex !== -1) {
      // Save current state before removing
      data.closedAdvancedNodes[advancedNodeId] = structuredClone(data.nodes[existingIndex]);
      data.nodes.splice(existingIndex, 1);
      renderCurrentTab();
      return;
    }

    // Neben dem Elternknoten öffnen; die Position bleibt beim Neuaufbau erhalten
    const pos = { x: node.x + node.width + 30, y: node.y };

    // Restore from saved state if it exists (behaelt die zuletzt gewaehlte Variante)
    const saved = data.closedAdvancedNodes[advancedNodeId];
    const newNode = saved
      ? { ...saved, ...pos, manualPos: pos, measuredHeight: null }
      : (() => {
          const predefined = findTemplate(advancedNodeId);
          if (!predefined) {
            console.warn("Advanced node not found:", advancedNodeId);
            return;
          }
          const variantKey = (data.variantChoice || {})[advancedNodeId];
          const instance = resolveTemplateInstance(predefined, variantKey);
          return {
            ...instance,
            id: advancedNodeId,
            ...pos,
            manualPos: pos,
            parent: node.id,
            isAdvanced: true
          };
        })();

    if (newNode) {
      data.nodes.push(newNode);
      renderCurrentTab();
    }
  });
}

// Wechselt die aktive Berechnungs-Variante eines geoeffneten Detail-Knotens
// (z. B. Standardmodell vs. Alternativmodell einer Steuer) und rechnet sofort neu.
function createVariantSelector(node) {
  const wrapper = document.createElement("div");
  wrapper.className = "variant-select-row";

  const label = document.createElement("label");
  label.textContent = "Berechnung: ";

  const select = document.createElement("select");
  node.variantOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.key;
    option.textContent = opt.label;
    if (opt.key === node.activeVariant) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    const tpl = findTemplate(node.id);
    if (!tpl) return;
    const instance = resolveTemplateInstance(tpl, e.target.value);
    Object.assign(node, {
      sliders: instance.sliders,
      formula: instance.formula,
      activeVariant: instance.activeVariant,
      variantNote: instance.variantNote
    });
    data.variantChoice = data.variantChoice || {};
    data.variantChoice[node.id] = instance.activeVariant;
    applyCustomFormula(node);
    renderCurrentTab();
  });

  label.appendChild(select);
  wrapper.appendChild(label);

  if (node.variantNote) {
    const note = document.createElement("div");
    note.className = "variant-note";
    note.textContent = node.variantNote;
    wrapper.appendChild(note);
  }

  return wrapper;
}

// ──────────────────────────────────────────────
// KARTEN

function createNodeHeader(node, div) {
  const header = document.createElement("div");
  header.className = "node-title";

  if (!node.isAdvanced) {
    const open = isCardOpen(node);
    const chevron = makeButton("icon-btn node-chevron", open ? "▾" : "▸",
      open ? `${node.name} zuklappen` : `${node.name} aufklappen`);
    chevron.setAttribute("aria-expanded", String(open));
    chevron.addEventListener("click", () => {
      node.open = !open;
      renderCurrentTab();
    });
    header.appendChild(chevron);
  }

  const name = document.createElement("span");
  name.className = "node-name";
  name.textContent = node.name;
  header.appendChild(name);

  if (node.isAdvanced) {
    const closeBtn = makeButton("icon-btn node-close-btn", "×", "Detailmodell schließen");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      data.closedAdvancedNodes[node.id] = structuredClone(node);
      data.nodes = data.nodes.filter(n => n.id !== node.id);
      renderCurrentTab();
    });
    header.appendChild(closeBtn);
  }

  makeDraggable(div, header, node);
  return header;
}

function createTotalRow(node) {
  const totalDiv = document.createElement("div");
  totalDiv.className = "total";

  const label = document.createElement("span");
  label.textContent = "Gesamt: ";
  totalDiv.appendChild(label);

  const value = document.createElement("span");
  value.className = "total-value";
  totalDiv.appendChild(value);

  const badge = document.createElement("span");
  badge.className = "delta-badge";
  badge.hidden = true;
  totalDiv.appendChild(badge);

  const reset = makeButton("icon-btn node-reset-btn", "↺", `${node.name} auf Entwurf zurücksetzen`);
  reset.hidden = true;
  reset.addEventListener("click", () => resetNode(node));
  totalDiv.appendChild(reset);

  return totalDiv;
}

function renderNodes() {
  container.innerHTML = "";
  currentSliderMax = sharedSliderMax(data.nodes);
  computeSizeBarScale();

  data.nodes.forEach(node => {
    const div = document.createElement("div");
    div.className = "node";
    div.id = node.id;
    div.style.left = node.x + "px";
    div.style.top = node.y + "px";
    div.style.width = node.width + "px";

    const open = isCardOpen(node);
    div.classList.toggle("closed", !open);
    div.classList.toggle("advanced", Boolean(node.isAdvanced));

    div.appendChild(createNodeHeader(node, div));

    if (!node.isAdvanced) {
      const bar = document.createElement("div");
      bar.className = "node-sizebar";
      bar.setAttribute("aria-hidden", "true");
      const fill = document.createElement("div");
      fill.className = `node-sizebar-fill${node.isIncomeRoot ? " income" : ""}`;
      bar.appendChild(fill);
      div.appendChild(bar);
    }

    if (open && node.variantOptions && node.variantOptions.length > 1) {
      div.appendChild(createVariantSelector(node));
    }

    const rows = open && !isCollapsedNode(node) ? getVisibleRows(node) : [];

    if (rows.length) {
      const sliderGrid = document.createElement("div");
      sliderGrid.className = "slider-grid";
      sliderGrid.style.gridTemplateColumns = `repeat(${getNodeColumns(rows.length)}, 1fr)`;
      rows.forEach(row => {
        if (row.rest) createRestRow(row, sliderGrid);
        else createSlider(row.slider, sliderGrid, node, div);
      });
      div.appendChild(sliderGrid);
    }

    if (open && hasHiddenDetail(node, rows)) {
      div.appendChild(createDetailToggle(node));
    }

    if (node.sliders) div.appendChild(createTotalRow(node));

    if (!open && node.sliders) {
      const count = node.sliders.length;
      const openBtn = makeButton("link-btn node-open-btn", `▸ ${count} Posten anzeigen`);
      openBtn.addEventListener("click", () => {
        node.open = true;
        renderCurrentTab();
      });
      div.appendChild(openBtn);
    }

    container.appendChild(div);
    updateNodeFooter(node, div);
  });

  updateSummary();
  scheduleIndexRefresh();
}

function clearCanvas() {
  // Sicherstellen, dass wir wirklich den gesamten Pixel-Puffer löschen,
  // unabhängig von ctx.setTransform(...) oder anderen Transforms.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset der Transform-Matrix auf Identity
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

// Zwei Durchläufe: erst mit geschätzten Höhen auslegen und rendern, dann mit den
// tatsächlich gemessenen Höhen neu positionieren – so überlappen keine Karten.
function renderCurrentTab() {
  // Versteckt lässt sich nichts messen – beim Einblenden wird ohnehin neu gerendert
  if (document.getElementById("view-haushalt").hidden) return;
  data.nodes.forEach(node => { node.measuredHeight = null; });
  calculatePositions();
  renderNodes();

  data.nodes.forEach(node => {
    const div = document.getElementById(node.id);
    if (div) node.measuredHeight = div.offsetHeight;
  });
  calculatePositions();
  data.nodes.forEach(node => {
    const div = document.getElementById(node.id);
    if (!div) return;
    div.style.left = node.x + "px";
    div.style.top = node.y + "px";
  });

  initCanvas();
  drawConnections();
}

// ──────────────────────────────────────────────
// TABS

function selectTab(tab) {
  currentTab = tab;
  if (tab === "gesamt") {
    // kombiniere Bund + Sozial + Länder
    data = {
      nodes: [
        ...datasets.bund.nodes,
        ...datasets.sozial.nodes,
        ...datasets.laender.nodes
      ]
    };
  } else {
    data = datasets[tab];
  }

  // Standardwerte für closedAdvancedNodes / variantChoice setzen, falls noch nicht vorhanden
  data.closedAdvancedNodes = data.closedAdvancedNodes || {};
  data.variantChoice = data.variantChoice || {};

  document.querySelectorAll("#tabs button").forEach(btn => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  renderCurrentTab();
}

function initTabs() {
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.addEventListener("click", () => selectTab(btn.dataset.tab));
  });
  document.querySelectorAll("#tabs button").forEach(btn => {
    const active = btn.dataset.tab === currentTab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function initSidebarActions() {
  const actions = document.getElementById("sidebar-actions");

  const row = document.createElement("div");
  row.className = "sidebar-row";

  const openAll = makeButton("small-btn", "Alle aufklappen");
  openAll.addEventListener("click", () => {
    data.nodes.forEach(n => { if (!n.isAdvanced) n.open = true; });
    renderCurrentTab();
  });
  const closeAll = makeButton("small-btn", "Alle zuklappen");
  closeAll.addEventListener("click", () => {
    data.nodes.forEach(n => { if (!n.isAdvanced) n.open = false; });
    renderCurrentTab();
  });
  row.append(openAll, closeAll);
  actions.appendChild(row);

  const resetBtn = makeButton("small-btn reset-all-btn", "↺ Alles auf Entwurf zurücksetzen");
  resetBtn.addEventListener("click", () => {
    if (!hasAnyChange()) return;
    if (confirm("Alle Änderungen in dieser Ansicht verwerfen und zum Regierungsentwurf zurückkehren?")) resetAll();
  });
  actions.appendChild(resetBtn);
}

// ──────────────────────────────────────────────
// RESSORT-VERZEICHNIS (Seitenleiste)

let indexFrame = null;

function scheduleIndexRefresh() {
  if (indexFrame) return;
  indexFrame = requestAnimationFrame(() => {
    indexFrame = null;
    renderMinistryIndex();
  });
}

function normalizeSearch(text) {
  return text.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
}

function renderMinistryIndex() {
  const list = document.getElementById("ministry-list");
  const query = normalizeSearch(document.getElementById("ministry-search").value.trim());

  list.innerHTML = "";
  const nodes = data.nodes.filter(n => !n.isAdvanced && n.sliders);

  nodes.forEach(node => {
    const nameHit = !query || normalizeSearch(node.name).includes(query);
    const itemHits = query
      ? node.sliders.filter(s => normalizeSearch(s.label).includes(query)).map(s => s.label)
      : [];
    if (!nameHit && !itemHits.length) return;

    const li = document.createElement("li");
    const btn = makeButton("ministry-item", "");
    if (node.isIncomeRoot) btn.classList.add("income");
    if (nodeDelta(node) !== 0 || node.sliders.some(s => sliderDelta(node, s) !== 0)) btn.classList.add("changed");

    const name = document.createElement("span");
    name.className = "ministry-name";
    name.textContent = node.name;
    const total = document.createElement("span");
    total.className = "ministry-total";
    total.textContent = fmtNumber(calculateNodeTotal(node));
    btn.append(name, total);

    if (itemHits.length && !nameHit) {
      const hits = document.createElement("span");
      hits.className = "ministry-hits";
      hits.textContent = itemHits.join(", ");
      btn.appendChild(hits);
    }

    btn.addEventListener("click", () => focusNode(node.id));
    li.appendChild(btn);
    list.appendChild(li);
  });

  if (!list.children.length) {
    const empty = document.createElement("li");
    empty.className = "ministry-empty";
    empty.textContent = "Kein Treffer";
    list.appendChild(empty);
  }
}

// Karte öffnen, in die Mitte scrollen und kurz hervorheben
function focusNode(nodeId) {
  const node = data.nodes.find(n => n.id === nodeId);
  if (!node) return;
  if (!isCardOpen(node)) {
    node.open = true;
    renderCurrentTab();
  }

  const div = document.getElementById(nodeId);
  if (!div) return;
  mainContainer.scrollTo({
    left: Math.max(0, (node.x + div.offsetWidth / 2) * zoomLevel - mainContainer.clientWidth / 2),
    top: Math.max(0, (node.y + div.offsetHeight / 2) * zoomLevel - mainContainer.clientHeight / 2),
    behavior: "smooth"
  });

  div.classList.remove("flash");
  void div.offsetWidth; // Animation neu starten
  div.classList.add("flash");
}

function initMinistryIndex() {
  const search = document.getElementById("ministry-search");
  search.addEventListener("input", renderMinistryIndex);
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = document.querySelector("#ministry-list .ministry-item");
      if (first) first.click();
    } else if (e.key === "Escape") {
      search.value = "";
      renderMinistryIndex();
    }
  });
}
