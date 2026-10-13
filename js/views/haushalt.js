// Bereich "Haushalt": die bestehende Karten-/Regleransicht (ui.js, main.js)
// Aufruf mit #/haushalt/<tab> (bund, sozial, laender, gesamt) oder
// #/haushalt/<tab>:<knoten-id>, um direkt zu einem Ressort zu springen.

registerView({
  id: "haushalt",
  title: "Haushalt",
  icon: "▦",
  el: document.getElementById("view-haushalt"),
  show(arg) {
    const [tab, focus] = (arg || "").split(":");
    selectTab(datasets[tab] || tab === "gesamt" ? tab : currentTab);
    if (focus) requestAnimationFrame(() => focusNode(focus));
  },
  onResize() { renderCurrentTab(); }
});

function openInBudget(nodeId, tab = "bund") {
  navigate("haushalt", `${tab}:${nodeId}`);
}
