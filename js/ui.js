
function setZoom(value) {
  zoomLevel = parseFloat(value);
  applyZoom();
  drawConnections(); // Optional: Redraw connections after zoom
}

function makeDraggable(panel, handle) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handle.style.cursor = "move";

  handle.addEventListener("mousedown", (e) => {
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

      const node = data.nodes.find(n => n.id === panel.id);
      if (node) {
        node.x = adjustedX;
        node.y = adjustedY;
      }

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



function updateSliderUI(slider, node, div) {
  // Find the slider input and number input DOM elements by their IDs
  const sliderInput = document.getElementById(`${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}`);
  const numberInput = document.getElementById(`${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}-number`);
  
  console.log("updateSliderUI:", node.id, slider.value);
  
  if (!sliderInput || !numberInput) {
    console.warn("Slider inputs not found for:", slider.label);
    return;
  }

  // Update inputs' values from slider.value
  sliderInput.value = slider.value;
  numberInput.value = slider.value;

  // Update total display
  const totalDiv = div.querySelector(".total");
  if (totalDiv) {
    const total = calculateNodeTotal(node);
    totalDiv.textContent = `Gesamt: ${total.toLocaleString('de-DE')}`;
  }
  else
  {
  console.log("no totalDiv:", node.id, slider.value);
  }

  drawConnections();
  updateSummary();
}

function updateParentSlider(node, result) {
  const parentNode = data.nodes.find(n => n.id === node.parent);
  if (!parentNode) {
    console.warn("Parent node not found for node:", node.id);
    return;
  }

  const slider = parentNode.sliders.find(s => {
    const normalizedLabel = s.label.toLowerCase().replace(/\s/g, "-");
    return `${parentNode.id}-${normalizedLabel}-advanced` === node.id;
  });

  if (!slider) {
    console.warn("Matching parent slider not found for advanced node id:", node.id);
    return;
  }

  // Make sure slider.value matches result
  slider.value = Math.round(result);

  // Find parent node's container div in the DOM
  const parentDiv = document.getElementById(parentNode.id);
  if (parentDiv) {
    // Call your UI update function that updates slider inputs and totals
    updateSliderUI(slider, parentNode, parentDiv);
  }
}


function updateSlider(slider, sliderInput, numberInput, node, div, source, value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return;

  slider.value = Math.min(Math.max(numValue, sliderInput.min), sliderInput.max);

  if (source !== sliderInput) sliderInput.value = slider.value;
  if (source !== numberInput) numberInput.value = slider.value;

  // Update total and redraw
  updateSliderUI(slider, node, div);
}


function createSlider(slider, container, node, div) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-container";

  const label = createLabel(slider, node, container, div);
  wrapper.appendChild(label);

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "slider-controls";
  controlsContainer.style.display = "flex";
  controlsContainer.style.gap = "5px";
  controlsContainer.style.alignItems = "center";

  const sliderInput = createSliderElement(slider, node);
  const numberInput = createNumberInput(slider, node);

  controlsContainer.appendChild(sliderInput);
  controlsContainer.appendChild(numberInput);
  wrapper.appendChild(controlsContainer);

  // Unified update function
  const handleSliderUpdate = (source, value) =>
    updateSlider(slider, sliderInput, numberInput, node, div, source, value);

  sliderInput.addEventListener("input", (e) => handleSliderUpdate(sliderInput, e.target.value));
  numberInput.addEventListener("input", (e) => handleSliderUpdate(numberInput, e.target.value));
  numberInput.addEventListener("change", (e) => handleSliderUpdate(numberInput, e.target.value));

  container.appendChild(wrapper);
}

// ──────────────────────────────────────────────

function createLabel(slider, node, container, div) {
  const label = document.createElement("div");
  label.className = "slider-label";

  if (!slider.advanced) {
    label.innerHTML = `<span>${slider.label}:</span>`;
  } else {
    label.innerHTML = `<span style="cursor:pointer; text-decoration:underline;">${slider.label}:</span>`;
    maybeAttachAdvancedClick(slider, label, node, div);
  }

  return label;
}

function createSliderElement(slider, node) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = typeof slider.min === "number" ? slider.min : 0;
  input.max = typeof slider.max === "number" ? slider.max : 200;
  input.step = typeof slider.step === "number" ? slider.step : 1;
  input.value = slider.value;
  input.style.flex = "1";
  input.id = `${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}`;
  return input;
}

function createNumberInput(slider, node) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = slider.min ?? 0;
  input.max = slider.max ?? 200;
  input.step = slider.step ?? 1;
  input.value = slider.value;
  input.style.width = "70px";
  input.style.padding = "2px";
  input.id = `${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}-number`;
  return input;
}

// ──────────────────────────────────────────────
// ADVANCED NODE HANDLING
function maybeAttachAdvancedClick(slider, label, node, div) {
  const span = label.querySelector("span");
  if (!span) return;

  span.style.cursor = "pointer";

  span.addEventListener("click", () => {
    if (!slider.advanced) return;

    const advancedNodeId = typeof slider.advanced === "string"
      ? slider.advanced
      : `${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}-advanced`;

    const existingIndex = data.nodes.findIndex(n => n.id === advancedNodeId);

    if (existingIndex !== -1) {
      // Save current state before removing
      data.closedAdvancedNodes[advancedNodeId] = structuredClone(data.nodes[existingIndex]);
      data.nodes.splice(existingIndex, 1);
      renderNodes();
      return;
    }

    // Restore from saved state if it exists
    const saved = data.closedAdvancedNodes[advancedNodeId];
    const newNode = saved
      ? { ...saved, x: node.x + 350, y: node.y + 200 }  // move to fresh position
      : (() => {
          // Look up template
          const predefined = data.advancedNodes?.find(n => n.id === advancedNodeId);
          if (!predefined) {
            console.warn("Advanced node not found:", advancedNodeId);
            return;
          }
          return {
            ...structuredClone(predefined),
            id: advancedNodeId,
            x: node.x + 350,
            y: node.y + 200,
            parent: node.id,
            isAdvanced: true
          };
        })();

    if (newNode) {
      data.nodes.push(newNode);
      renderNodes();
    }
  });
}

function renderNodes() {
  container.innerHTML = "";
  
  data.nodes.forEach(node => {
    const div = document.createElement("div");
    div.className = "node";
    div.style.left = node.x + "px";
    div.style.top = node.y + "px";
    div.style.width = node.width + "px";
	
	div.id = node.id;
	
	if (node.isAdvanced) {
	  const closeBtn = document.createElement("div");
	  closeBtn.className = "node-close-btn";
	  closeBtn.title = "Knoten schließen";
	  closeBtn.innerHTML = "&times;";
	  closeBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		data.closedAdvancedNodes = data.closedAdvancedNodes || {};
		data.closedAdvancedNodes[node.id] = structuredClone(node);
		data.nodes = data.nodes.filter(n => n.id !== node.id);
		renderNodes();
	  });
	  div.appendChild(closeBtn);
	}

    const sliderCount = node.sliders?.length || 0;
    const columns = Math.min(4, Math.ceil(sliderCount / SLIDERS_PER_COLUMN));
    
    const sliderGrid = document.createElement("div");
    sliderGrid.className = "slider-grid";
    sliderGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    const title = document.createElement("div");
    title.className = "node-title";
    title.innerText = node.name;
	
	makeDraggable(div, title);
	
    sliderGrid.appendChild(title);

    if (node.sliders) {
	  node.sliders.forEach(slider => {
		createSlider(slider, sliderGrid, node, div);
	  });

	  const totalDiv = document.createElement("div");
	  totalDiv.className = "total";
	  totalDiv.textContent = `Gesamt: ${calculateNodeTotal(node).toLocaleString('de-DE')}`;
	  sliderGrid.appendChild(totalDiv);	  
	}

    div.appendChild(sliderGrid);
    container.appendChild(div);
  });
  
  updateSummary();
}

function clearCanvas() {
  // Sicherstellen, dass wir wirklich den gesamten Pixel-Puffer löschen,
  // unabhängig von ctx.setTransform(...) oder anderen Transforms.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset der Transform-Matrix auf Identity
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function renderCurrentTab() {
  clearCanvas();
  calculatePositions();
  renderNodes();
  drawConnections();
}

document.querySelectorAll("#sidebar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
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

    // Standardwerte für closedAdvancedNodes setzen, falls noch nicht vorhanden
    if (!data.closedAdvancedNodes) {
        data.closedAdvancedNodes = {};
    }

    renderCurrentTab();
  });
});
