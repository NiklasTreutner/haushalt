

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('nodes');
const mainContainer = document.getElementById('main-container');
const canvasContainer = document.getElementById('canvas-container');

const SLIDERS_PER_COLUMN = 5;

let contentWidth = 0;
let contentHeight = 0;

let zoomLevel = 1;
const minZoom = 0.3;
const maxZoom = 2.5;

data.closedAdvancedNodes = data.closedAdvancedNodes || {};

function applyZoom() {
  const panelContainer = document.getElementById("panel-container");
  panelContainer.style.transform = `scale(${zoomLevel})`;
  drawConnections();
}

function initCanvas() {
  // Set canvas size to match container
  canvas.width = mainContainer.clientWidth;
  canvas.height = mainContainer.clientHeight;
  
  // Set canvas container size to match content
  canvasContainer.style.width = Math.max(contentWidth, mainContainer.clientWidth) + 'px';
  canvasContainer.style.height = Math.max(contentHeight, mainContainer.clientHeight) + 'px';
}

function handleScroll() {
  // Update canvas position when scrolling
  canvas.style.transform = `translate(${-mainContainer.scrollLeft}px, ${-mainContainer.scrollTop}px)`;
}

// Initialize everything
function init() {
  calculatePositions();
  renderNodes();
  initCanvas();
  applyZoom();  
  drawConnections();
  
  // Set up scroll event
  mainContainer.addEventListener('scroll', handleScroll);
  
  document.getElementById("canvas-container").addEventListener("wheel", (e) => {
	  e.preventDefault();

	  const zoomFactor = 0.1;
	  const delta = Math.sign(e.deltaY); // -1 for zoom in, 1 for zoom out

	  // Adjust zoom level
	  zoomLevel -= delta * zoomFactor;
	  zoomLevel = Math.min(Math.max(zoomLevel, minZoom), maxZoom);

	  applyZoom();
	}, { passive: false });

  
  // Set up resize event
  window.addEventListener('resize', () => {
    calculatePositions();
    renderNodes();
    initCanvas();
    drawConnections();
    renderCurrentTab();
  });
  
  
}

init();