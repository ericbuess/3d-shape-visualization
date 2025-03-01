// Main application entry point

// Import core components
import { init, animate, onWindowResize } from './components/scene.js';
import { setupEventListeners, setIsometricView } from './components/controls.js';
import { setupTabEvents, setActiveButton, setActiveViewButton, showFullScreenImage, hideFullScreenImage } from './utils/ui.js';
import { loadShape } from './components/shapeFactory.js';

// Make fullscreen image functions global
window.showFullScreenImage = showFullScreenImage;
window.hideFullScreenImage = hideFullScreenImage;

// Debug logging
console.log("Script loading...");

// Make sure THREE is defined
if (typeof THREE === 'undefined') {
    console.error("THREE is not defined. Please check if the THREE.js library is loaded correctly.");
    alert("Failed to load THREE.js library. Please check your internet connection and try again.");
    throw new Error("THREE is not defined");
}

// Start animation loop first, to ensure it's running before we initialize components
console.log("Starting animation loop...");
animate();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing application...");
    try {
        // Initialize main components
        init();
        setupEventListeners();
        
        // Hide shape details by default - only show after a shape is loaded
        const shapeDetails = document.getElementById('shape-details');
        if (shapeDetails) {
            shapeDetails.style.display = 'none';
        }
        
        // Hide mobile shape details panel by default
        const mobileShapeInfo = document.getElementById('info-panel');
        if (mobileShapeInfo) {
            mobileShapeInfo.style.display = 'none';
        }
        
        // Since orthographic views might not be ready yet when we load the first shape,
        // we'll initialize the application but delay loading the first shape
        setTimeout(() => {
            console.log("Loading initial shape with delay to ensure views are ready...");
            
            // Start with triangular prism
            loadShape('triangularPrism1');
            setActiveButton('triangularPrism1-btn');
            
            // Set initial view to isometric
            setIsometricView();
            setActiveViewButton('isometric-view-btn');
            
            // Force a known global variable for transition value
            window.transitionValue = 1;
            document.getElementById('transition-slider').value = 100;
            
            // Mobile slider may not exist yet
            const mobileSlider = document.getElementById('mobile-transition-slider');
            if (mobileSlider) mobileSlider.value = 100;
            
            console.log("Setting up initial rendering sequence...");
            
            // Ensure tabs are set up properly
            setupTabEvents();
            
            // Select the metrics tab by default
            const metricsTab = document.getElementById('metrics-tab');
            if (metricsTab) metricsTab.click();
            
            // Select mobile metrics tab if it exists
            const mobileMetricsTab = document.getElementById('mobile-metrics-tab');
            if (mobileMetricsTab) mobileMetricsTab.click();
            
            // Sequence the initialization for more reliable rendering
            // First resize the window to make sure dimensions are correct
            onWindowResize();
            
            console.log("Initial shape loaded successfully");
        }, 500); // Extra delay to ensure orthographic views are initialized
    } catch (error) {
        console.error("Error initializing application:", error);
        alert("An error occurred while initializing the application. Please check the console for details.");
    }
});