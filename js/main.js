const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('nodes');
const mainContainer = document.getElementById('main-container');
const canvasContainer = document.getElementById('canvas-container');

const SLIDERS_PER_COLUMN = 5;

// Anzeige-Schwelle in Mrd. €: Posten darunter werden zu "Übrige Posten" zusammengefasst,
// Knoten darunter nur noch als Titel + Summe gezeigt. Die Daten bleiben davon unberührt –
// über "Alle Posten zeigen" in der Karte lässt sich jederzeit alles aufklappen.
const AGG_THRESHOLD = 1.5;

// Karten starten eingeklappt (Name, Größenbalken, Summe) und werden per Klick
// geöffnet. Auf false setzen, um zur bisherigen Ansicht mit allen Reglern zurückzukehren.
const COLLAPSE_CARDS_BY_DEFAULT = true;

let contentWidth = 0;
let contentHeight = 0;

let zoomLevel = 1;
const minZoom = 0.3;
const maxZoom = 2.5;

let currentTab = "bund";

data.closedAdvancedNodes = data.closedAdvancedNodes || {};

// Scrollfläche folgt dem Zoom; die Leinwand für die Verbindungslinien ist nur so
// groß wie der sichtbare Ausschnitt und wandert beim Scrollen mit.
function initCanvas() {
  canvasContainer.style.width = Math.max(contentWidth * zoomLevel, mainContainer.clientWidth) + 'px';
  canvasContainer.style.height = Math.max(contentHeight * zoomLevel, mainContainer.clientHeight) + 'px';

  const dpr = window.devicePixelRatio || 1;
  const width = mainContainer.clientWidth;
  const height = mainContainer.clientHeight;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";

  positionCanvas();
}

function positionCanvas() {
  canvas.style.left = mainContainer.scrollLeft + "px";
  canvas.style.top = mainContainer.scrollTop + "px";
}

function applyZoom() {
  document.getElementById("panel-container").style.transform = `scale(${zoomLevel})`;
  initCanvas();
  drawConnections();
  document.getElementById("zoom-level").textContent = `${Math.round(zoomLevel * 100)} %`;
}

// Zoomt um einen Ankerpunkt (Koordinaten relativ zum sichtbaren Ausschnitt),
// damit der Punkt unter der Maus bzw. die Bildmitte an ihrem Platz bleibt.
function setZoom(value, anchorX = mainContainer.clientWidth / 2, anchorY = mainContainer.clientHeight / 2) {
  const newZoom = Math.min(Math.max(value, minZoom), maxZoom);
  const contentX = (mainContainer.scrollLeft + anchorX) / zoomLevel;
  const contentY = (mainContainer.scrollTop + anchorY) / zoomLevel;

  zoomLevel = newZoom;
  applyZoom();

  mainContainer.scrollLeft = contentX * zoomLevel - anchorX;
  mainContainer.scrollTop = contentY * zoomLevel - anchorY;
  positionCanvas();
  drawConnections();
}

function zoomToFit() {
  const fit = Math.min(
    (mainContainer.clientWidth - 20) / contentWidth,
    (mainContainer.clientHeight - 20) / contentHeight,
    1
  );
  zoomLevel = Math.min(Math.max(fit, minZoom), maxZoom);
  applyZoom();
  mainContainer.scrollLeft = 0;
  mainContainer.scrollTop = 0;
  positionCanvas();
  drawConnections();
}

function initZoomControls() {
  document.getElementById("zoom-in").addEventListener("click", () => setZoom(zoomLevel * 1.2));
  document.getElementById("zoom-out").addEventListener("click", () => setZoom(zoomLevel / 1.2));
  document.getElementById("zoom-level").addEventListener("click", () => setZoom(1));
  document.getElementById("zoom-fit").addEventListener("click", zoomToFit);

  // Mausrad scrollt; Strg + Mausrad (bzw. Pinch auf dem Trackpad) zoomt
  mainContainer.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = mainContainer.getBoundingClientRect();
    setZoom(zoomLevel * Math.exp(-e.deltaY * 0.002), e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  // Tastenkürzel +, -, 0 (Einpassen) – nicht während der Eingabe in Feldern
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === "+" || e.key === "=") setZoom(zoomLevel * 1.2);
    else if (e.key === "-") setZoom(zoomLevel / 1.2);
    else if (e.key === "0") zoomToFit();
  });
}

// Verschieben der Ansicht durch Ziehen auf freier Fläche
function initPanning() {
  mainContainer.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (!canvasContainer.contains(e.target) || e.target.closest(".node")) return;
    e.preventDefault();

    const startX = e.clientX, startY = e.clientY;
    const startLeft = mainContainer.scrollLeft, startTop = mainContainer.scrollTop;
    mainContainer.classList.add("panning");

    function onMove(ev) {
      mainContainer.scrollLeft = startLeft - (ev.clientX - startX);
      mainContainer.scrollTop = startTop - (ev.clientY - startY);
    }
    function onUp() {
      mainContainer.classList.remove("panning");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function init() {
  initTabs();
  initSidebarActions();
  initMinistryIndex();
  initZoomControls();
  initPanning();

  let scrollFrame = null;
  mainContainer.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      positionCanvas();
      drawConnections();
    });
  });

  // Neu aufbauen übernimmt der App-Rahmen (js/shell.js), nur solange sichtbar
}

init();
