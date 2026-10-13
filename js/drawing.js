function drawLine(x1, y1, x2, y2, amount, maxAmount) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // Farbe nach Vorzeichen
  ctx.strokeStyle = amount >= 0 ? 'rgba(0,100,0,0.8)' : 'rgba(170,0,0,0.8)';

  // Breite: benutze Verhältnis zur Maximalmenge (mit Fallback)
  const abs = Math.abs(amount) || 0;
  let w = 2;
  if (maxAmount > 0) {
    const ratio = Math.min(1, abs / maxAmount); // 0..1
    // skaliert von 1..14 px (you can tweak)
    w = Math.max(1, 1 + Math.pow(ratio, 0.6) * 13);
  }
  ctx.lineWidth = w * Math.max(zoomLevel, 0.4);

  ctx.stroke();
}

function drawConnections() {
  clearCanvas();

  // Erzeuge Map für schnelle Suche
  const nodeMap = Object.fromEntries(data.nodes.map(n => [n.id, n]));

  // Canvas-Client-Rect für Offsets
  const canvasRect = canvas.getBoundingClientRect();

  // 1) Bestimme maxAmount (für Breiten-Skalierung)
  let maxAmount = 0;
  data.nodes.forEach(parent => {
    if (!parent.children) return;
    parent.children.forEach(childId => {
      const child = nodeMap[childId];
      if (!child) return;
      // child-DIV muss existieren (sonst skip)
      const childDiv = document.getElementById(child.id);
      if (!childDiv) return;
      const amount = Number(calculateNodeTotal(child)) || 0;
      maxAmount = Math.max(maxAmount, Math.abs(amount));
    });
  });

  // 2) Zeichne Verbindungen anhand der realen DOM-Positionen
  data.nodes.forEach(parent => {
    if (!parent.children) return;

    const parentDiv = document.getElementById(parent.id);
    if (!parentDiv) return;

    const pRect = parentDiv.getBoundingClientRect();
    const pCenterX = (pRect.left - canvasRect.left) + pRect.width / 2;
    const pCenterY = (pRect.top  - canvasRect.top)  + pRect.height / 2;

    parent.children.forEach(childId => {
      const child = nodeMap[childId];
      if (!child) return;
      const childDiv = document.getElementById(child.id);
      if (!childDiv) return;

      const cRect = childDiv.getBoundingClientRect();
      const cCenterX = (cRect.left - canvasRect.left) + cRect.width / 2;
      const cCenterY = (cRect.top  - canvasRect.top)  + cRect.height / 2;

      const amount = Number(calculateNodeTotal(child)) || 0;

      drawLine(pCenterX, pCenterY, cCenterX, cCenterY, amount, maxAmount);
    });
  });
}



function calculatePositions() {
  const nodeMap = Object.fromEntries(data.nodes.map(n => [n.id, n]));
  const baseNodeWidth = 220;
  const horizontalSpacing = 5;
  const verticalSpacing = 40;
  
  // First pass - calculate all node heights and widths
  data.nodes.forEach(node => {
    const sliderCount = getVisibleRowCount(node);
    node.height = getNodeHeight(node);
    node.width = baseNodeWidth * Math.max(1, Math.min(3, Math.ceil(sliderCount / SLIDERS_PER_COLUMN)));
  });

  function layoutNode(nodeId, xStart, y, level = 0) {
  const node = nodeMap[nodeId];
  if (!node) return { width: 0, height: 0, maxX: 0, maxY: 0 };

  // Position the node
  node.x = xStart;
  node.y = y;
  node.level = level;

  if (!node.children || node.children.length === 0) {
    node.computedWidth = node.width;
    return { 
      width: node.width, 
      height: node.height,
      maxX: node.x + node.width,
      maxY: node.y + node.height
    };
  }

  const childYStart = y + node.height + verticalSpacing;

  let rowWidth = 0;
  let rowMaxHeight = 0;
  let totalWidth = 0;
  let totalHeight = 0;
  let maxX = 0;
  let maxY = 0;

  const childrenLayouts = [];

  node.children.forEach((childId, index) => {
    let isRowStart = false;
    if(rowWidth > 1700)
    {
      isRowStart = true;
    }
    if (isRowStart && index > 0) {
      // move to new row
      totalHeight += rowMaxHeight + verticalSpacing;
      rowWidth = 0;
      rowMaxHeight = 0;
    }

    const childX = xStart + rowWidth;
    const childY = childYStart + totalHeight;

    const childLayout = layoutNode(childId, childX, childY, level + 1);
    childrenLayouts.push(childLayout);

    rowWidth += childLayout.width + horizontalSpacing;
    rowMaxHeight = Math.max(rowMaxHeight, childLayout.height);

    maxX = Math.max(maxX, childLayout.maxX);
    maxY = Math.max(maxY, childLayout.maxY);
  });

  // add last row height
  totalHeight += rowMaxHeight;

  node.computedWidth = Math.max(node.width, maxX - xStart);

  return {
    width: node.computedWidth,
    height: node.height + totalHeight + verticalSpacing,
    maxX,
    maxY
  };
}


  // Find root nodes (nodes not referenced as children)
  const childIds = new Set();
  data.nodes.forEach(node => {
    if (node.children) {
      node.children.forEach(childId => childIds.add(childId));
    }
  });
  // Detailknoten haengen nicht im Baum, sondern werden frei neben ihrem
  // Elternknoten platziert (manualPos) – sonst sprangen sie bei jedem
  // Neuaufbau an den rechten Rand.
  const rootNodes = data.nodes.filter(node => !childIds.has(node.id) && !node.isAdvanced);

  // Layout all root nodes (supports multiple trees)
  let currentX = 10;
  let globalMaxX = 0;
  let globalMaxY = 0;
  
  rootNodes.forEach(rootNode => {
    const layout = layoutNode(rootNode.id, currentX, 10);
    currentX += layout.width + 100;
    globalMaxX = Math.max(globalMaxX, layout.maxX);
    globalMaxY = Math.max(globalMaxY, layout.maxY);
  });

  // Vom Nutzer verschobene Karten (und Detailknoten) behalten ihre Position
  data.nodes.forEach(node => {
    if (node.manualPos) {
      node.x = node.manualPos.x;
      node.y = node.manualPos.y;
    }
    globalMaxX = Math.max(globalMaxX, node.x + node.width);
    globalMaxY = Math.max(globalMaxY, node.y + node.height);
  });

  // Update content dimensions
  contentWidth = globalMaxX + 50; // Add some padding
  contentHeight = globalMaxY + 100; // Add space for summary
}

// Spaltenzahl aus der Anzahl sichtbarer Zeilen – von Layout und Rendering gemeinsam genutzt
function getNodeColumns(visibleRowCount) {
  return Math.max(1, Math.min(4, Math.ceil(visibleRowCount / SLIDERS_PER_COLUMN)));
}

function getVisibleRowCount(node) {
  if (!isCardOpen(node) || isCollapsedNode(node)) return 0;
  return getVisibleRows(node).length;
}

function getNodeHeight(node) {
  // Nach dem Rendern gemessene Hoehe (siehe renderCurrentTab) – die Schaetzung
  // unten dient nur dem ersten Durchlauf.
  if (node.measuredHeight) return node.measuredHeight;

  const baseHeight = 70;
  const titleHeight = 30;
  const totalHeight = 30;
  const rowHeight = 35;
  const variantRowHeight = node.variantOptions && node.variantOptions.length > 1 ? 34 : 0;
  const slidersCount = getVisibleRowCount(node);

  const columns = getNodeColumns(slidersCount);
  const rows = Math.ceil(slidersCount / columns);

  return baseHeight + titleHeight + variantRowHeight + (rows * rowHeight) + totalHeight;
}
