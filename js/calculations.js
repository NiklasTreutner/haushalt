let isApplyingFormula = false;

function applyCustomFormula(node) {
	if (isApplyingFormula) return;
	
  if (!node.formula) return;
  
  isApplyingFormula = true;

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
  const slider = parentNode.sliders.find(s => {
    const normalizedLabel = s.label.toLowerCase().replace(/\s/g, "-");
    return `${parentNode.id}-${normalizedLabel}-advanced` === node.id;
  });

  if (!slider) {
    console.warn("Matching parent slider not found for advanced node id:", node.id);
    return;
  }

  // Update slider value
  slider.value = Math.round(result);

  // Call updateParentSlider to update UI, totals, inputs, etc.
  updateParentSlider(node, result);

isApplyingFormula = false;

  return result;
}


function calculateNodeTotal(node) {
  if (!node.sliders) return 0;

  // If node itself has a formula, compute and return its result
  if (node.formula) {
    const result = applyCustomFormula(node);
    if (typeof result === "number" && !isNaN(result)) {
      return Math.round(result); // Same scaling as in parent slider
    } else {
      console.warn("Formula result invalid for node", node.id);
	  console.warn("Formula result:", result);
      return 0;
    }
  }

  // Otherwise, check for advanced subnodes and apply their formulas
  for (const slider of node.sliders) {
    const advancedNodeId = `${node.id}-${slider.label.toLowerCase().replace(/\s/g, "-")}-advanced`;
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

  document.getElementById('total-income').textContent = totalIncome.toLocaleString('de-DE');
  document.getElementById('total-expenses').textContent = totalExpenses.toLocaleString('de-DE');
  document.getElementById('balance').textContent = balance.toLocaleString('de-DE');

  const balanceElement = document.getElementById('balance');
  balanceElement.className = balance >= 0 ? 'positive' : 'negative';
}
