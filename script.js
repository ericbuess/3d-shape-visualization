// Global variables
let mainScene, mainCamera, mainRenderer, mainControls;
let topScene, topCamera, topRenderer;
let frontScene, frontCamera, frontRenderer;
let rightScene, rightCamera, rightRenderer;
let leftScene, leftCamera, leftRenderer;
let currentShape = null;
window.transitionValue = 1; // 0 = 2D, 1 = 3D - using window to ensure global scope
let crossSectionEnabled = false;
let crossSectionPlane = 'horizontal';
let crossSectionPosition = 0.5;
let crossSectionMesh = null;

// Debugging
console.log("Script loading...");

// Make sure THREE is defined
if (typeof THREE === 'undefined') {
    console.error("THREE is not defined. Please check if the THREE.js library is loaded correctly.");
    alert("Failed to load THREE.js library. Please check your internet connection and try again.");
    throw new Error("THREE is not defined");
}

// Define wireframe material
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Shape definitions
const shapeDefinitions = {
    triangularPrism1: {
        type: 'triangularPrism',
        height: 2,
        base: {
            side1: 4,
            side2: 5
        }
    },
    triangularPrism2: {
        type: 'triangularPrism',
        height: 4,
        base: {
            side1: 1,
            side2: 3
        }
    },
    triangularPrism3: {
        type: 'triangularPrism',
        height: 4,
        base: {
            side1: 2,
            side2: 6
        }
    },
    rectangularPrism: {
        type: 'rectangularPrism',
        height: 2,
        width: 3,
        length: 5
    },
    cube: {
        type: 'cube',
        size: 3
    }
};

// Initialize the application
// Start animation loop first, to ensure it's running before we initialize components
console.log("Starting animation loop...");
animate();

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing application...");
    try {
        // Initialize main components
        init();
        setupEventListeners();
        setupMobileControls();
        
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
            
            // Sequence the initialization for more reliable rendering
            // First resize the window to make sure dimensions are correct
            onWindowResize();
            
            // Then update shape transition after a short delay
            setTimeout(() => {
                updateShapeTransition();
                console.log("Initial transition applied:", window.transitionValue);
                
                // Force another resize after everything is ready
                onWindowResize();
                console.log("Initial shape loaded successfully");
            }, 300);
        }, 500); // Extra delay to ensure orthographic views are initialized
    } catch (error) {
        console.error("Error initializing application:", error);
        alert("An error occurred while initializing the application. Please check the console for details.");
    }
});

// Set up mobile control panel functionality
function setupMobileControls() {
    // Control icons
    const shapeIcon = document.getElementById('shape-icon');
    const viewIcon = document.getElementById('view-icon');
    const crossSectionIcon = document.getElementById('cross-section-icon');
    const infoIcon = document.getElementById('info-icon');
    
    // Panels
    const shapePanel = document.getElementById('shape-panel');
    const viewPanel = document.getElementById('view-panel');
    const crossSectionPanel = document.getElementById('cross-section-panel');
    const infoPanel = document.getElementById('info-panel');
    
    const allPanels = [shapePanel, viewPanel, crossSectionPanel, infoPanel];
    const allIcons = [shapeIcon, viewIcon, crossSectionIcon, infoIcon];
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close-panel');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            allPanels.forEach(panel => panel.classList.remove('active'));
            allIcons.forEach(icon => icon.classList.remove('active'));
        });
    });
    
    // Toggle panels on icon click
    function setupIconPanel(icon, panel) {
        icon.addEventListener('click', () => {
            const isActive = panel.classList.contains('active');
            
            // Close all panels
            allPanels.forEach(p => p.classList.remove('active'));
            allIcons.forEach(i => i.classList.remove('active'));
            
            // Open this panel if it wasn't already open
            if (!isActive) {
                panel.classList.add('active');
                icon.classList.add('active');
            }
        });
    }
    
    setupIconPanel(shapeIcon, shapePanel);
    setupIconPanel(viewIcon, viewPanel);
    setupIconPanel(crossSectionIcon, crossSectionPanel);
    setupIconPanel(infoIcon, infoPanel);
    
    // Setup mobile shape buttons
    document.getElementById('mobile-triangularPrism1-btn').addEventListener('click', () => {
        loadShape('triangularPrism1');
        setActiveButton('mobile-triangularPrism1-btn');
        setActiveButton('triangularPrism1-btn');
    });
    
    document.getElementById('mobile-triangularPrism2-btn').addEventListener('click', () => {
        loadShape('triangularPrism2');
        setActiveButton('mobile-triangularPrism2-btn');
        setActiveButton('triangularPrism2-btn');
    });
    
    document.getElementById('mobile-triangularPrism3-btn').addEventListener('click', () => {
        loadShape('triangularPrism3');
        setActiveButton('mobile-triangularPrism3-btn');
        setActiveButton('triangularPrism3-btn');
    });
    
    document.getElementById('mobile-rectangularPrism-btn').addEventListener('click', () => {
        loadShape('rectangularPrism');
        setActiveButton('mobile-rectangularPrism-btn');
        setActiveButton('rectangularPrism-btn');
    });
    
    document.getElementById('mobile-cube-btn').addEventListener('click', () => {
        loadShape('cube');
        setActiveButton('mobile-cube-btn');
        setActiveButton('cube-btn');
    });
    
    document.getElementById('mobile-custom-btn').addEventListener('click', () => {
        document.getElementById('mobile-custom-input').classList.toggle('hidden');
        setActiveButton('mobile-custom-btn');
        setActiveButton('custom-btn');
    });
    
    document.getElementById('mobile-generate-btn').addEventListener('click', () => {
        const description = document.getElementById('mobile-shape-description').value;
        parseAndGenerateShape(description);
    });
    
    // Setup mobile view controls
    document.getElementById('mobile-top-view-btn').addEventListener('click', () => {
        setTopView();
        setActiveViewButton('mobile-top-view-btn');
        setActiveViewButton('top-view-btn');
    });
    
    document.getElementById('mobile-front-view-btn').addEventListener('click', () => {
        setFrontView();
        setActiveViewButton('mobile-front-view-btn');
        setActiveViewButton('front-view-btn');
    });
    
    document.getElementById('mobile-side-view-btn').addEventListener('click', () => {
        setSideView();
        setActiveViewButton('mobile-side-view-btn');
        setActiveViewButton('side-view-btn');
    });
    
    document.getElementById('mobile-isometric-view-btn').addEventListener('click', () => {
        setIsometricView();
        setActiveViewButton('mobile-isometric-view-btn');
        setActiveViewButton('isometric-view-btn');
    });
    
    // Setup mobile transition slider
    const mobileTransitionSlider = document.getElementById('mobile-transition-slider');
    mobileTransitionSlider.addEventListener('input', () => {
        // Directly set the value for immediate feedback
        transitionValue = mobileTransitionSlider.value / 100;
        
        // Sync with desktop slider
        const desktopSlider = document.getElementById('transition-slider');
        desktopSlider.value = mobileTransitionSlider.value;
        
        // Update text
        const sliderValue = document.getElementById('slider-value');
        if (transitionValue < 0.1) {
            sliderValue.textContent = '2D View';
        } else if (transitionValue > 0.9) {
            sliderValue.textContent = '3D View';
        } else {
            sliderValue.textContent = 'Transition';
        }
        
        // Update the shape immediately
        updateShapeTransition();
        
        console.log("Mobile slider changed to:", transitionValue);
    });
    
    // Setup mobile camera controls
    document.getElementById('mobile-horizontal-angle').addEventListener('input', (e) => {
        const horizontalAngle = parseInt(e.target.value);
        const verticalAngle = parseInt(document.getElementById('mobile-vertical-angle').value);
        const distance = parseInt(document.getElementById('mobile-camera-distance').value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
        resetActiveViewButtons();
        
        // Sync with desktop controls
        document.getElementById('horizontal-angle').value = horizontalAngle;
    });
    
    document.getElementById('mobile-vertical-angle').addEventListener('input', (e) => {
        const horizontalAngle = parseInt(document.getElementById('mobile-horizontal-angle').value);
        const verticalAngle = parseInt(e.target.value);
        const distance = parseInt(document.getElementById('mobile-camera-distance').value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
        resetActiveViewButtons();
        
        // Sync with desktop controls
        document.getElementById('vertical-angle').value = verticalAngle;
    });
    
    document.getElementById('mobile-camera-distance').addEventListener('input', (e) => {
        const horizontalAngle = parseInt(document.getElementById('mobile-horizontal-angle').value);
        const verticalAngle = parseInt(document.getElementById('mobile-vertical-angle').value);
        const distance = parseInt(e.target.value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
        
        // Sync with desktop controls
        document.getElementById('camera-distance').value = distance;
    });
    
    // Setup mobile cross section controls
    const mobileCrossSectionToggle = document.getElementById('mobile-cross-section-toggle');
    mobileCrossSectionToggle.addEventListener('change', () => {
        crossSectionEnabled = mobileCrossSectionToggle.checked;
        
        if (crossSectionEnabled) {
            document.getElementById('mobile-cross-section-controls').classList.remove('hidden');
            document.getElementById('cross-section-controls').classList.remove('hidden');
            updateCrossSection();
            
            // Sync with desktop
            document.getElementById('cross-section-toggle').checked = true;
        } else {
            document.getElementById('mobile-cross-section-controls').classList.add('hidden');
            document.getElementById('cross-section-controls').classList.add('hidden');
            removeCrossSection();
            
            // Sync with desktop
            document.getElementById('cross-section-toggle').checked = false;
        }
    });
    
    // Mobile cross section plane buttons
    document.getElementById('mobile-horizontal-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'horizontal';
        setActivePlaneButton('mobile-horizontal-plane-btn');
        setActivePlaneButton('horizontal-plane-btn');
        updateCrossSection();
    });
    
    document.getElementById('mobile-vertical-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'vertical';
        setActivePlaneButton('mobile-vertical-plane-btn');
        setActivePlaneButton('vertical-plane-btn');
        updateCrossSection();
    });
    
    document.getElementById('mobile-angled-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'angled';
        setActivePlaneButton('mobile-angled-plane-btn');
        setActivePlaneButton('angled-plane-btn');
        updateCrossSection();
    });
    
    // Mobile cross section position slider
    document.getElementById('mobile-cross-section-position').addEventListener('input', (e) => {
        crossSectionPosition = e.target.value / 100;
        updateCrossSection();
        
        // Sync with desktop
        document.getElementById('cross-section-position').value = e.target.value;
    });
    
    // Mobile tabs
    setupMobileTabEvents();
}

// Set up mobile tab switching events
function setupMobileTabEvents() {
    // Mobile tab functionality is now handled in the setupTabEvents function
    console.log("Mobile tab events setup handled by setupTabEvents function");
}

// Main initialization function
function init() {
    console.log("Initializing views...");
    try {
        // Initialize main view first
        initMainView();
        console.log("Main view initialized successfully");
        
        // Ensure DOM elements for orthographic views exist before trying to initialize them
        setTimeout(() => {
            // Initialize orthographic views after a short delay to ensure DOM elements are ready
            initOrthographicViews();
            console.log("Orthographic views initialized");
            
            // Add resize listener
            window.addEventListener('resize', onWindowResize);
            
            // Handle initial sizing
            onWindowResize();
            console.log("Initialization complete.");
        }, 100);
    } catch (error) {
        console.error("Error in init:", error);
        throw error;
    }
}

// Initialize the main 3D view
function initMainView() {
    console.log("Initializing main view...");
    const container = document.getElementById('canvas-container');
    
    // Create scene
    mainScene = new THREE.Scene();
    mainScene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    mainCamera = new THREE.PerspectiveCamera(
        75, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    mainCamera.position.set(10, 10, 10);
    mainCamera.lookAt(0, 0, 0);
    
    // Create renderer
    mainRenderer = new THREE.WebGLRenderer({ antialias: true });
    mainRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(mainRenderer.domElement);
    
    // Add mouse listeners directly to canvas for debugging
    mainRenderer.domElement.addEventListener('mousedown', function(event) {
        console.log("Direct mouse down on canvas detected");
    });
    
    // Add controls
    if (typeof THREE.OrbitControls !== 'undefined') {
        console.log("OrbitControls is defined, creating controls...");
        try {
            // Create orbit controls and attach to renderer's DOM element
            mainControls = new THREE.OrbitControls(mainCamera, mainRenderer.domElement);
            console.log("OrbitControls instance created successfully");
            
            // Basic initialization - full setup will be done in setupDragControls
            mainControls.enableRotate = true;
            mainControls.enableZoom = true;
            mainControls.enablePan = true;
            
            // Set up drag controls using the configuration from the example
            setupDragControls();
        } catch (error) {
            console.error("Error creating OrbitControls:", error);
        }
    } else {
        console.error("THREE.OrbitControls is not defined. Camera controls will not be available.");
        alert("ERROR: OrbitControls not available. The 3D view cannot be rotated or manipulated.");
    }
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    mainScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    mainScene.add(directionalLight);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    mainScene.add(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    mainScene.add(axesHelper);
}

// Set up drag controls for the entire scene (via OrbitControls)
function setupDragControls() {
    console.log("Setting up enhanced OrbitControls for scene manipulation");
    
    // Make sure OrbitControls are always enabled
    if (mainControls) {
        try {
            // Configure the controls with simplest settings
            mainControls.enabled = true;
            mainControls.rotateSpeed = 1.0;
            mainControls.enableZoom = true;
            mainControls.zoomSpeed = 1.2;
            mainControls.minDistance = 5;
            mainControls.maxDistance = 50; // Increased to allow zooming out more
            
            // Reset the control's target and update
            mainControls.target.set(0, 0, 0);
            mainControls.update();
            
            // Don't add any fancy event listeners or handlers here
            // We're using the simplified base implementation from the custom controls
            
            console.log("Orbit controls successfully configured");
        } catch (error) {
            console.error("Error setting up OrbitControls:", error);
        }
    } else {
        console.error("OrbitControls not available - drag functionality disabled");
    }
}

// Initialize the orthographic views (top, front, right, left)
function initOrthographicViews() {
    console.log("Initializing orthographic views...");
    
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        console.error("THREE is not defined. Cannot initialize orthographic views.");
        return;
    }
    
    // Create grid helpers once
    const gridHelper = new THREE.GridHelper(10, 10);
    
    const gridHelperXZ = gridHelper.clone();
    gridHelperXZ.rotation.x = Math.PI / 2;
    
    const gridHelperXY = gridHelper.clone();
    
    const gridHelperYZ = gridHelper.clone();
    gridHelperYZ.rotation.z = Math.PI / 2;
    
    // Top view (looking down the Y axis)
    const topContainer = document.getElementById('top-view-canvas');
    if (!topContainer) {
        console.error("Top view container not found");
        return;
    }
    
    // Make sure all HTML elements are correctly in place before initializing
    console.log("Checking orthographic view containers...");
    
    topScene = new THREE.Scene();
    topScene.background = new THREE.Color(0xf5f5f5);
    
    // Create directional light for better visualization
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 10, 0);
    topScene.add(topLight);
    topScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    // Add grid to help with orientation
    topScene.add(gridHelperXZ.clone());
    
    // Create camera
    topCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    topCamera.position.set(0, 10, 0);
    topCamera.lookAt(0, 0, 0);
    
    // Create renderer
    topRenderer = new THREE.WebGLRenderer({ antialias: true });
    topRenderer.setSize(topContainer.clientWidth, topContainer.clientHeight);
    topContainer.innerHTML = ''; // Clear container
    topContainer.appendChild(topRenderer.domElement);
    
    // Front view (looking down the Z axis)
    const frontContainer = document.getElementById('front-view-canvas');
    if (!frontContainer) {
        console.error("Front view container not found");
        return;
    }
    
    frontScene = new THREE.Scene();
    frontScene.background = new THREE.Color(0xf5f5f5);
    
    // Create directional light for better visualization
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 10);
    frontScene.add(frontLight);
    frontScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    // Add grid to help with orientation
    frontScene.add(gridHelperXY.clone());
    
    // Create camera
    frontCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    frontCamera.position.set(0, 0, 10);
    frontCamera.lookAt(0, 0, 0);
    
    // Create renderer
    frontRenderer = new THREE.WebGLRenderer({ antialias: true });
    frontRenderer.setSize(frontContainer.clientWidth, frontContainer.clientHeight);
    frontContainer.innerHTML = ''; // Clear container
    frontContainer.appendChild(frontRenderer.domElement);
    
    // Right view (looking down the X axis)
    const rightContainer = document.getElementById('right-view-canvas');
    if (!rightContainer) {
        console.error("Right view container not found");
        return;
    }
    
    rightScene = new THREE.Scene();
    rightScene.background = new THREE.Color(0xf5f5f5);
    
    // Create directional light for better visualization
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rightLight.position.set(10, 0, 0);
    rightScene.add(rightLight);
    rightScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    // Add grid to help with orientation
    rightScene.add(gridHelperYZ.clone());
    
    // Create camera
    rightCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    rightCamera.position.set(10, 0, 0);
    rightCamera.lookAt(0, 0, 0);
    
    // Create renderer
    rightRenderer = new THREE.WebGLRenderer({ antialias: true });
    rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
    rightContainer.innerHTML = ''; // Clear container
    rightContainer.appendChild(rightRenderer.domElement);
    
    // Left view (looking down the negative X axis)
    const leftContainer = document.getElementById('left-view-canvas');
    if (!leftContainer) {
        console.error("Left view container not found");
        return;
    }
    
    leftScene = new THREE.Scene();
    leftScene.background = new THREE.Color(0xf5f5f5);
    
    // Create directional light for better visualization
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.8);
    leftLight.position.set(-10, 0, 0);
    leftScene.add(leftLight);
    leftScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    // Add grid to help with orientation
    leftScene.add(gridHelperYZ.clone());
    
    // Create camera
    leftCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    leftCamera.position.set(-10, 0, 0);
    leftCamera.lookAt(0, 0, 0);
    
    // Create renderer
    leftRenderer = new THREE.WebGLRenderer({ antialias: true });
    leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
    leftContainer.innerHTML = ''; // Clear container
    leftContainer.appendChild(leftRenderer.domElement);
    
    console.log("Orthographic views initialized successfully");
}

// Camera position functions
function setCameraPosition(horizontalAngle, verticalAngle, distance) {
    // Convert angles from degrees to radians
    const horizontalRad = horizontalAngle * Math.PI / 180;
    const verticalRad = verticalAngle * Math.PI / 180;
    
    // Calculate camera position using spherical coordinates
    const x = distance * Math.cos(verticalRad) * Math.sin(horizontalRad);
    const y = distance * Math.sin(verticalRad);
    const z = distance * Math.cos(verticalRad) * Math.cos(horizontalRad);
    
    mainCamera.position.set(x, y, z);
    mainCamera.lookAt(0, 0, 0);
    
    // Update angle display values
    document.getElementById('horizontal-angle-value').textContent = `${horizontalAngle}°`;
    document.getElementById('vertical-angle-value').textContent = `${verticalAngle}°`;
    document.getElementById('camera-distance-value').textContent = distance;
    
    // Update range input values to match
    document.getElementById('horizontal-angle').value = horizontalAngle;
    document.getElementById('vertical-angle').value = verticalAngle;
    document.getElementById('camera-distance').value = distance;
}

// Animation state for camera
let cameraAnimationInProgress = false;
let targetCameraPosition = { x: 0, y: 0, z: 0 };
let targetCameraLookAt = { x: 0, y: 0, z: 0 };
const cameraTransitionSpeed = 0.02; // Slower camera transitions

// View preset functions - now with animations
function setTopView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(0, 90, 12);
    }
}

function setFrontView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(0, 0, 12);
    }
}

function setSideView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(90, 0, 12);
    }
}

function setIsometricView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(45, 35, 12);
    }
}

// Reset the view orientation to baseline - but only if not actively dragging
function resetViewOrientation() {
    // Check if mouse is currently down in a drag operation - if so, don't reset
    if (mainControls && mainControls.isMouseDown) {
        console.log("Mouse is down, skipping orientation reset");
        return;
    }
    
    // Reset the camera's up vector to standard orientation
    mainCamera.up.set(0, 1, 0);
    
    // If we have controls, reset their target and state
    if (mainControls) {
        mainControls.target.set(0, 0, 0);
        
        // Update the controls if there's an update method
        if (typeof mainControls.update === 'function') {
            mainControls.update();
        }
    }
}

// View click handlers for 2D projections
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to 2D projections - only trigger on mouseup, not during dragging
    document.getElementById('top-view').addEventListener('mouseup', function(e) {
        // Only trigger view change if this was a click, not end of dragging
        if (!mainControls || !mainControls.isMouseDown) {
            setTopView();
        }
    });
    
    document.getElementById('front-view').addEventListener('mouseup', function(e) {
        if (!mainControls || !mainControls.isMouseDown) {
            setFrontView();
        }
    });
    
    document.getElementById('right-view').addEventListener('mouseup', function(e) {
        if (!mainControls || !mainControls.isMouseDown) {
            setSideView();
        }
    });
    
    document.getElementById('left-view').addEventListener('mouseup', function(e) {
        if (!mainControls || !mainControls.isMouseDown) {
            setSideView();
        }
    });
    
    // Add handler for mobile projections too
    if (document.getElementById('mobile-top-view')) {
        document.getElementById('mobile-top-view').addEventListener('mouseup', function(e) {
            if (!mainControls || !mainControls.isMouseDown) {
                setTopView();
            }
        });
    }
    if (document.getElementById('mobile-front-view')) {
        document.getElementById('mobile-front-view').addEventListener('mouseup', function(e) {
            if (!mainControls || !mainControls.isMouseDown) {
                setFrontView();
            }
        });
    }
});

// Smoothly animate camera to a new position
function animateCameraToPosition(horizontalAngle, verticalAngle, distance) {
    // If we're in the middle of dragging, don't interrupt
    if (mainControls && mainControls.isMouseDown) {
        console.log("Mouse is down, skipping animation");
        return;
    }
    
    // Convert angles from degrees to radians
    const horizontalRad = horizontalAngle * Math.PI / 180;
    const verticalRad = verticalAngle * Math.PI / 180;
    
    // Calculate target position using spherical coordinates
    targetCameraPosition = {
        x: distance * Math.cos(verticalRad) * Math.sin(horizontalRad),
        y: distance * Math.sin(verticalRad),
        z: distance * Math.cos(verticalRad) * Math.cos(horizontalRad)
    };
    
    // Update angle display values
    document.getElementById('horizontal-angle-value').textContent = `${horizontalAngle}°`;
    document.getElementById('vertical-angle-value').textContent = `${verticalAngle}°`;
    document.getElementById('camera-distance-value').textContent = distance;
    
    // Update range input values to match
    document.getElementById('horizontal-angle').value = horizontalAngle;
    document.getElementById('vertical-angle').value = verticalAngle;
    document.getElementById('camera-distance').value = distance;
    
    // Start animation if not already in progress
    if (!cameraAnimationInProgress) {
        cameraAnimationInProgress = true;
        animateCameraStep();
    }
}

// Animate a single step of camera movement
function animateCameraStep() {
    // Stop animation if camera controls are being used
    if (!cameraAnimationInProgress || (mainControls && mainControls.isMouseDown)) {
        cameraAnimationInProgress = false;
        return;
    }
    
    // Get current position
    const currentPos = mainCamera.position;
    
    // Calculate step towards target
    const dx = targetCameraPosition.x - currentPos.x;
    const dy = targetCameraPosition.y - currentPos.y;
    const dz = targetCameraPosition.z - currentPos.z;
    
    // Check if we're close enough to stop animating
    const distanceSquared = dx*dx + dy*dy + dz*dz;
    if (distanceSquared < 0.01) {
        // Final step - set exact position
        mainCamera.position.set(
            targetCameraPosition.x,
            targetCameraPosition.y,
            targetCameraPosition.z
        );
        mainCamera.lookAt(0, 0, 0);
        
        cameraAnimationInProgress = false;
        return;
    }
    
    // Move camera a fraction of the way to target
    mainCamera.position.x += dx * cameraTransitionSpeed;
    mainCamera.position.y += dy * cameraTransitionSpeed;
    mainCamera.position.z += dz * cameraTransitionSpeed;
    
    // Always look at origin
    mainCamera.lookAt(0, 0, 0);
    
    // Update controls
    if (mainControls) {
        mainControls.update();
    }
    
    // Continue animation
    requestAnimationFrame(animateCameraStep);
}

// Display shape details in the UI with educational content
function updateShapeDetails(shape) {
    // Desktop elements
    const dimensionsDiv = document.getElementById('shape-dimensions');
    const propertiesDiv = document.getElementById('shape-properties');
    const formulasDiv = document.getElementById('shape-formulas');
    const netsDiv = document.getElementById('shape-nets');
    const topologyDiv = document.getElementById('shape-topology');
    
    // Define netImageContainer variable that was missing
    const netImageContainer = netsDiv;
    
    // Mobile elements
    const mobileDimensionsDiv = document.getElementById('mobile-shape-dimensions');
    const mobilePropertiesDiv = document.getElementById('mobile-shape-properties');
    const mobileFormulasDiv = document.getElementById('mobile-shape-formulas');
    const mobileNetsDiv = document.getElementById('mobile-shape-nets');
    const mobileTopologyDiv = document.getElementById('mobile-shape-topology');
    
    // Define mobileNetImageContainer variable that was missing
    const mobileNetImageContainer = mobileNetsDiv;
    
    // Debug console output
    console.log("Shape details elements:", {
        dimensionsDiv, propertiesDiv, formulasDiv, netsDiv, topologyDiv,
        mobileDimensionsDiv, mobilePropertiesDiv, mobileFormulasDiv, mobileNetsDiv, mobileTopologyDiv
    });
    
    if (!dimensionsDiv || !propertiesDiv || !formulasDiv || !netsDiv || !topologyDiv) {
        console.error("One or more shape detail elements not found");
        return;
    }
    
    if (shape.type === 'triangularPrism') {
        const { height, side1, side2, side3 } = shape.dimensions;
        
        // Calculate volume
        const baseArea = (side1 * side2) / 2;
        const volume = baseArea * height;
        
        // Calculate surface area
        const basePerimeter = side1 + side2 + side3;
        const lateralArea = basePerimeter * height;
        const totalArea = 2 * baseArea + lateralArea;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Base sides:</strong> ${side1} units, ${side2} units, ${side3.toFixed(2)} units</p>
            <p><strong>Dimensions:</strong> Triangular base with height ${height} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${totalArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralArea.toFixed(2)} square units</p>
        `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = `
            <h4>Triangular Prism Formulas</h4>
            
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (base area) × height</span>
            <div class="formula-explanation">
                The volume is calculated by multiplying the area of the triangular base by the height of the prism.
            </div>
            
            <span class="formula">V = (1/2 × base₁ × base₂) × height</span>
            <div class="formula-explanation">
                For a triangular base, the area is half the product of the two sides that form the right angle.
            </div>
            
            <span class="formula">V = <span class="formula-highlight">${baseArea.toFixed(2)}</span> × <span class="formula-highlight">${height}</span> = <span class="formula-highlight">${volume.toFixed(2)}</span> cubic units</span>
            <div class="formula-explanation">
                Applied to this specific triangular prism with base area ${baseArea.toFixed(2)} square units and height ${height} units.
            </div>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2(base area) + (perimeter of base) × height</span>
            <div class="formula-explanation">
                The surface area consists of two triangular bases plus the rectangular sides. The sides have a total area equal to the perimeter of the base multiplied by the height.
            </div>
            
            <span class="formula">SA = 2(<span class="formula-highlight">${baseArea.toFixed(2)}</span>) + <span class="formula-highlight">${basePerimeter.toFixed(2)}</span> × <span class="formula-highlight">${height}</span></span>
            <div class="formula-explanation">
                For this triangular prism: two triangular bases of area ${baseArea.toFixed(2)} square units each, plus the lateral surface formed by three rectangles with a total area of ${lateralArea.toFixed(2)} square units.
            </div>
            
            <span class="formula">SA = <span class="formula-highlight">${(2 * baseArea).toFixed(2)}</span> + <span class="formula-highlight">${lateralArea.toFixed(2)}</span> = <span class="formula-highlight">${totalArea.toFixed(2)}</span> square units</span>
            
            <div class="educational-note">
                A triangular prism's volume increases linearly with height, while surface area consists of the bases plus the sides. This relationship is important in understanding how shape affects capacity and material requirements.
            </div>
        `;
        
        // Generate HTML content for net diagram with improved explanations
        const netHTML = `
            <!-- 3D to Unfolded Net Sequence for Triangular Prism -->
            <svg width="100%" height="350" viewBox="0 0 300 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Improved net showing all faces clearly in a single column arrangement -->
                    
                    <!-- First triangular base (top) -->
                    <polygon points="75,30 225,30 150,130" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- First rectangular side (left) -->
                    <polygon points="75,130 75,230 150,230 150,130" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Second rectangular side (middle) - moved down for clarity -->
                    <polygon points="150,130 150,230 225,230 225,130" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Third rectangular side (bottom) - moved to bottom row -->
                    <polygon points="75,230 225,230 225,280 75,280" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Second triangular base (attached to bottom) -->
                    <polygon points="75,280 225,280 150,330" fill="#dcf1fd" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Grid lines to show units on the triangular bases -->
                    <line x1="75" y1="30" x2="225" y2="30" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="55" x2="213" y2="55" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="80" x2="200" y2="80" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="105" x2="175" y2="105" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <line x1="75" y1="30" x2="75" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="100" y1="30" x2="100" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="125" y1="30" x2="125" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="150" y1="30" x2="150" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="175" y1="30" x2="175" y2="105" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="200" y1="30" x2="200" y2="80" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <!-- Grid lines for rectangular faces -->
                    <line x1="75" y1="155" x2="225" y2="155" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="180" x2="225" y2="180" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="205" x2="225" y2="205" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <line x1="100" y1="130" x2="100" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="125" y1="130" x2="125" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="150" y1="130" x2="150" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="175" y1="130" x2="175" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="200" y1="130" x2="200" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <!-- Labels with black text and background for readability -->
                    <rect x="135" y="75" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Base 1</text>
                    
                    <rect x="100" y="175" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="115" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 1</text>
                    
                    <rect x="175" y="175" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="190" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 2</text>
                    
                    <rect x="135" y="250" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="260" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 3</text>
                    
                    <rect x="135" y="300" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="310" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Base 2</text>
                    
                    <!-- Lines showing fold edges with improved visibility -->
                    <line x1="75" y1="130" x2="150" y2="130" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="150" y1="130" x2="225" y2="130" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="75" y1="230" x2="225" y2="230" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="75" y1="280" x2="225" y2="280" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    
                    <!-- Dimension indicators -->
                    <line x1="50" y1="30" x2="50" y2="130" stroke="#000" stroke-width="1"/>
                    <text x="40" y="80" text-anchor="middle" font-size="10" fill="#000">${side2} units</text>
                    
                    <line x1="75" y1="10" x2="225" y2="10" stroke="#000" stroke-width="1"/>
                    <text x="150" y="20" text-anchor="middle" font-size="10" fill="#000">${side1} units</text>
                    
                    <line x1="250" y1="130" x2="250" y2="230" stroke="#000" stroke-width="1"/>
                    <text x="265" y="180" text-anchor="middle" font-size="10" fill="#000">${height} units</text>
                </svg>
            
            <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a triangular prism showing all 5 faces in a single vertical column: 2 triangular bases and 3 rectangular sides</p>
            
            <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                <p><strong>Understanding the Net:</strong> A net is a flattened arrangement of all faces of a 3D shape. For this triangular prism:</p>
                <ul>
                    <li>The two <span class="property-highlight">triangular bases</span> (blue) at top and bottom with dimensions ${side1} × ${side2} units</li>
                    <li>Three <span class="property-highlight">rectangular sides</span> (lighter blue) connecting the corresponding edges of the bases</li>
                    <li>Side 1 and Side 2 are ${side2} × ${height} units</li>
                    <li>Side 3 (bottom rectangle) is ${side1} × ${height} units</li>
                </ul>
                <p>When folded along the dashed lines, this net forms a complete triangular prism. The grid lines show the unit measurements. The shape has a total of 5 faces, 9 edges, and 6 vertices.</p>
            </div>
        `;
        
        // We'll update all content after generating all HTML
        // Generate topology HTML with enhanced educational content
        const topologyHTML = `
            <h4>Triangular Prism Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td><span class="property-highlight">5</span> (2 triangular bases + 3 rectangular sides)</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td><span class="property-highlight">9</span></td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td><span class="property-highlight">6</span></td>
                </tr>
                <tr>
                    <td>Euler's Formula</td>
                    <td>V - E + F = 2 → <span class="property-highlight">6 - 9 + 5 = 2</span> ✓</td>
                </tr>
                <tr>
                    <td>Regular</td>
                    <td>Only if the base is an equilateral triangle</td>
                </tr>
                <tr>
                    <td>Base Shape</td>
                    <td>Triangle</td>
                </tr>
                <tr>
                    <td>Convex</td>
                    <td>Yes</td>
                </tr>
                <tr>
                    <td>Right Prism</td>
                    <td>Yes (bases are perpendicular to lateral edges)</td>
                </tr>
            </table>
            
            <div class="educational-note">
                <p><strong>Euler's Characteristic:</strong> For any convex polyhedron, the formula V - E + F = 2 holds true, where V is the number of vertices, E is the number of edges, and F is the number of faces.</p>
                <p><strong>Topological Importance:</strong> The triangular prism is one of the simplest 3D shapes that demonstrates fundamental principles of polyhedra. Its structure forms the basis for understanding more complex polyhedra.</p>
            </div>
        `;
        
        // Update all content with safety checks and debug logging
        console.log("Updating all shape detail panels with content");
        
        // Desktop panels
        if (dimensionsDiv) {
            dimensionsDiv.innerHTML = dimensionsHTML;
            console.log("Updated dimensions content");
        } else {
            console.error("dimensionsDiv not found");
        }
        
        if (propertiesDiv) {
            propertiesDiv.innerHTML = propertiesHTML;
            console.log("Updated properties content");
        } else {
            console.error("propertiesDiv not found");
        }
        
        if (formulasDiv) {
            formulasDiv.innerHTML = formulasHTML;
            console.log("Updated formulas content");
        } else {
            console.error("formulasDiv not found");
        }
        
        if (netsDiv) {
            netsDiv.innerHTML = netHTML;
            console.log("Updated nets content");
        } else {
            console.error("netsDiv not found");
        }
        
        if (topologyDiv) {
            topologyDiv.innerHTML = topologyHTML;
            console.log("Updated topology content");
        } else {
            console.error("topologyDiv not found");
        }
        
        // Mobile panels
        if (mobileDimensionsDiv) {
            mobileDimensionsDiv.innerHTML = dimensionsHTML;
            console.log("Updated mobile dimensions content");
        }
        
        if (mobilePropertiesDiv) {
            mobilePropertiesDiv.innerHTML = propertiesHTML;
            console.log("Updated mobile properties content");
        }
        
        if (mobileFormulasDiv) {
            mobileFormulasDiv.innerHTML = formulasHTML;
            console.log("Updated mobile formulas content");
        }
        
        if (mobileNetsDiv) {
            mobileNetsDiv.innerHTML = netHTML;
            console.log("Updated mobile nets content");
        }
        
        if (mobileTopologyDiv) {
            mobileTopologyDiv.innerHTML = topologyHTML;
            console.log("Updated mobile topology content");
        }
        
        // Ensure tabs are set up properly
        setupTabEvents();
        
    } else if (shape.type === 'rectangularPrism') {
        const { width, height, length } = shape.dimensions;
        
        // Calculate volume
        const volume = width * height * length;
        
        // Calculate surface area
        const surfaceArea = 2 * (width * length + width * height + height * length);
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Width:</strong> ${width} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Length:</strong> ${length} units</p>
            <p><strong>Dimensions:</strong> ${width} × ${height} × ${length} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea} square units</p>
            <p><strong>Base Area:</strong> ${width * length} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${2 * (width + length) * height} square units</p>
        `;
        
        // Generate HTML content for formulas
        const formulasHTML = `
            <h4>Rectangular Prism Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = length × width × height</span>
            <span class="formula">V = ${length} × ${width} × ${height} = ${volume} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2(length × width + length × height + width × height)</span>
            <span class="formula">SA = 2(${length} × ${width} + ${length} × ${height} + ${width} × ${height})</span>
            <span class="formula">SA = 2(${length * width} + ${length * height} + ${width * height}) = ${surfaceArea} square units</span>
        `;
        
        // Generate HTML content for net diagram
        const netHTML = `
            <svg width="100%" height="500" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Improved net of a rectangular prism showing all 6 faces in a cross pattern -->
                    
                    <!-- Define center point for better positioning -->
                    ${
                        /* Calculate center position for better layout */
                        (function() {
                            const centerX = 200;
                            const centerY = 200;
                            const cellWidth = width*20;
                            const cellHeight = height*20;
                            const cellDepth = length*20;
                            
                            // Calculate positions
                            const topX = centerX - cellWidth/2;
                            const topY = centerY - cellDepth - cellHeight;
                            
                            const frontX = centerX - cellWidth/2;
                            const frontY = centerY - cellHeight;
                            
                            const rightX = centerX + cellWidth/2;
                            const rightY = centerY - cellHeight;
                            
                            const leftX = centerX - cellWidth/2 - cellDepth;
                            const leftY = centerY - cellHeight;
                            
                            const bottomX = centerX - cellWidth/2;
                            const bottomY = centerY;
                            
                            const backX = centerX - cellWidth/2;
                            const backY = centerY + cellHeight;
                            
                            return `
                                <!-- Top face - light blue -->
                                <rect x="${topX}" y="${topY}" width="${cellWidth}" height="${cellDepth}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Front face - medium blue -->
                                <rect x="${frontX}" y="${frontY}" width="${cellWidth}" height="${cellHeight}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Right side face - light blue variant -->
                                <rect x="${rightX}" y="${rightY}" width="${cellDepth}" height="${cellHeight}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Left side face - light blue variant -->
                                <rect x="${leftX}" y="${leftY}" width="${cellDepth}" height="${cellHeight}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Bottom face - same as top -->
                                <rect x="${bottomX}" y="${bottomY}" width="${cellWidth}" height="${cellDepth}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Back face - darker blue -->
                                <rect x="${backX}" y="${backY}" width="${cellWidth}" height="${cellHeight}" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                            `;
                        })()
                    }
                    
                    ${
                        /* Generate grid lines and fold lines using the dynamically calculated positions */
                        (function() {
                            const centerX = 200;
                            const centerY = 200;
                            const cellWidth = width*20;
                            const cellHeight = height*20;
                            const cellDepth = length*20;
                            
                            // Calculate positions
                            const topX = centerX - cellWidth/2;
                            const topY = centerY - cellDepth - cellHeight;
                            
                            const frontX = centerX - cellWidth/2;
                            const frontY = centerY - cellHeight;
                            
                            const rightX = centerX + cellWidth/2;
                            const rightY = centerY - cellHeight;
                            
                            const leftX = centerX - cellWidth/2 - cellDepth;
                            const leftY = centerY - cellHeight;
                            
                            const bottomX = centerX - cellWidth/2;
                            const bottomY = centerY;
                            
                            const backX = centerX - cellWidth/2;
                            const backY = centerY + cellHeight;
                            
                            let gridLines = '';
                            
                            // Top face grid
                            for (let i = 1; i < width; i++) {
                                gridLines += `<line x1="${topX + i*20}" y1="${topY}" x2="${topX + i*20}" y2="${topY + cellDepth}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < length; i++) {
                                gridLines += `<line x1="${topX}" y1="${topY + i*20}" x2="${topX + cellWidth}" y2="${topY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Front face grid
                            for (let i = 1; i < width; i++) {
                                gridLines += `<line x1="${frontX + i*20}" y1="${frontY}" x2="${frontX + i*20}" y2="${frontY + cellHeight}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < height; i++) {
                                gridLines += `<line x1="${frontX}" y1="${frontY + i*20}" x2="${frontX + cellWidth}" y2="${frontY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Right face grid
                            for (let i = 1; i < length; i++) {
                                gridLines += `<line x1="${rightX + i*20}" y1="${rightY}" x2="${rightX + i*20}" y2="${rightY + cellHeight}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < height; i++) {
                                gridLines += `<line x1="${rightX}" y1="${rightY + i*20}" x2="${rightX + cellDepth}" y2="${rightY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Left face grid
                            for (let i = 1; i < length; i++) {
                                gridLines += `<line x1="${leftX + i*20}" y1="${leftY}" x2="${leftX + i*20}" y2="${leftY + cellHeight}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < height; i++) {
                                gridLines += `<line x1="${leftX}" y1="${leftY + i*20}" x2="${leftX + cellDepth}" y2="${leftY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Bottom face grid
                            for (let i = 1; i < width; i++) {
                                gridLines += `<line x1="${bottomX + i*20}" y1="${bottomY}" x2="${bottomX + i*20}" y2="${bottomY + cellDepth}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < length; i++) {
                                gridLines += `<line x1="${bottomX}" y1="${bottomY + i*20}" x2="${bottomX + cellWidth}" y2="${bottomY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Back face grid
                            for (let i = 1; i < width; i++) {
                                gridLines += `<line x1="${backX + i*20}" y1="${backY}" x2="${backX + i*20}" y2="${backY + cellHeight}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            for (let i = 1; i < height; i++) {
                                gridLines += `<line x1="${backX}" y1="${backY + i*20}" x2="${backX + cellWidth}" y2="${backY + i*20}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            }
                            
                            // Fold lines
                            let foldLines = '';
                            
                            // Top to front fold
                            foldLines += `<line x1="${topX}" y1="${topY + cellDepth}" x2="${topX + cellWidth}" y2="${topY + cellDepth}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Front to bottom fold
                            foldLines += `<line x1="${frontX}" y1="${frontY + cellHeight}" x2="${frontX + cellWidth}" y2="${frontY + cellHeight}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Bottom to back fold
                            foldLines += `<line x1="${bottomX}" y1="${bottomY + cellDepth}" x2="${bottomX + cellWidth}" y2="${bottomY + cellDepth}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Left to front fold
                            foldLines += `<line x1="${leftX + cellDepth}" y1="${leftY}" x2="${leftX + cellDepth}" y2="${leftY + cellHeight}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Front to right fold
                            foldLines += `<line x1="${frontX + cellWidth}" y1="${frontY}" x2="${frontX + cellWidth}" y2="${frontY + cellHeight}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Label positions for each face
                            const labels = `
                                <!-- Labels with white background for better visibility -->
                                <rect x="${topX + cellWidth/2 - 15}" y="${topY + cellDepth/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${topX + cellWidth/2}" y="${topY + cellDepth/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Top</text>
                                
                                <rect x="${frontX + cellWidth/2 - 15}" y="${frontY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${frontX + cellWidth/2}" y="${frontY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Front</text>
                                
                                <rect x="${bottomX + cellWidth/2 - 15}" y="${bottomY + cellDepth/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${bottomX + cellWidth/2}" y="${bottomY + cellDepth/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Bottom</text>
                                
                                <rect x="${backX + cellWidth/2 - 15}" y="${backY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${backX + cellWidth/2}" y="${backY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Back</text>
                                
                                <rect x="${rightX + cellDepth/2 - 15}" y="${rightY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${rightX + cellDepth/2}" y="${rightY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Right</text>
                                
                                <rect x="${leftX + cellDepth/2 - 15}" y="${leftY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${leftX + cellDepth/2}" y="${leftY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Left</text>
                            `;
                            
                            // Dimension indicators
                            const dimensions = `
                                <!-- Width dimension -->
                                <line x1="${frontX}" y1="${frontY - 10}" x2="${frontX + cellWidth}" y2="${frontY - 10}" stroke="#000" stroke-width="1"/>
                                <text x="${frontX + cellWidth/2}" y="${frontY - 15}" text-anchor="middle" font-size="10" fill="#000">${width} units</text>
                                
                                <!-- Height dimension -->
                                <line x1="${frontX - 10}" y1="${frontY}" x2="${frontX - 10}" y2="${frontY + cellHeight}" stroke="#000" stroke-width="1"/>
                                <text x="${frontX - 20}" y="${frontY + cellHeight/2}" text-anchor="middle" font-size="10" fill="#000">${height} units</text>
                                
                                <!-- Length dimension -->
                                <line x1="${rightX + cellDepth + 10}" y1="${rightY}" x2="${rightX + cellDepth + 10}" y2="${rightY + cellHeight}" stroke="#000" stroke-width="1"/>
                                <text x="${rightX + cellDepth + 20}" y="${rightY + cellHeight/2}" text-anchor="middle" font-size="10" fill="#000">${length} units</text>
                            `;
                            
                            return gridLines + foldLines + labels + dimensions;
                        })()
                    }
                </svg>
                
            <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a rectangular prism showing all 6 faces that fold to create the 3D shape with dimensions ${width}×${height}×${length} units</p>
            
            <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                <p><strong>Understanding the Net:</strong> This net shows all 6 rectangular faces of the prism unfolded in a T-shape:</p>
                <ul>
                    <li>Two identical <span class="property-highlight">end faces</span> (top and bottom) with dimensions ${width} × ${length} units</li>
                    <li>Two identical <span class="property-highlight">side faces</span> (left and right) with dimensions ${length} × ${height} units</li>
                    <li>Two identical <span class="property-highlight">front/back faces</span> with dimensions ${width} × ${height} units</li>
                </ul>
                <p>The grid lines show the unit measurements to help visualize the dimensions. When folded along the dashed lines, this net forms a complete rectangular prism with 6 faces, 12 edges, and 8 vertices.</p>
            </div>
        `;
        
        // Update desktop panels
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netImageContainer.innerHTML = netHTML;
        
        // Update mobile panels if they exist
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetImageContainer) mobileNetImageContainer.innerHTML = netHTML;
        
        // Generate topology HTML for rectangular prism
        const topologyHTML = `
            <h4>Rectangular Prism Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A rectangular prism is a polyhedron with 6 rectangular faces, where all faces meet at right angles.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 6 rectangular faces</li>
                        <li>Number of Edges: 12</li>
                        <li>Number of Vertices: 8</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Euler's Formula</div>
                <div class="property-value">
                    V - E + F = 2<br>
                    8 vertices - 12 edges + 6 faces = 2 ✓
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>All faces are rectangles that meet at right angles</li>
                        <li>Opposite faces are parallel and congruent</li>
                        <li>The diagonal of this rectangular prism is √(${width}² + ${height}² + ${length}²) = ${Math.sqrt(width*width + height*height + length*length).toFixed(2)} units</li>
                        <li>Each vertex is the meeting point of exactly 3 edges</li>
                        <li>It is a right prism with a rectangular base</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Classification</div>
                <div class="property-value">
                    <ul>
                        <li>Regular: ${width === height && height === length ? "Yes (cube)" : "No, different dimensions"}</li>
                        <li>Convex: Yes</li>
                        <li>Space-filling: Yes, can tile 3D space without gaps</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update desktop and mobile topology panels
        topologyDiv.innerHTML = topologyHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
    } else if (shape.type === 'cube') {
        const { size } = shape.dimensions;
        
        // Calculate volume
        const volume = Math.pow(size, 3);
        
        // Calculate surface area
        const surfaceArea = 6 * Math.pow(size, 2);
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Edge Length:</strong> ${size} units</p>
            <p><strong>Dimensions:</strong> ${size} × ${size} × ${size} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea} square units</p>
            <p><strong>Face Area:</strong> ${size * size} square units</p>
            <p><strong>Face Diagonal:</strong> ${(size * Math.sqrt(2)).toFixed(2)} units</p>
            <p><strong>Space Diagonal:</strong> ${(size * Math.sqrt(3)).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for formulas
        const formulasHTML = `
            <h4>Cube Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = s³</span>
            <span class="formula">V = ${size}³ = ${volume} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 6s²</span>
            <span class="formula">SA = 6 × ${size}² = 6 × ${size * size} = ${surfaceArea} square units</span>
            
            <p><strong>Face Diagonal:</strong></p>
            <span class="formula">d = s√2</span>
            <span class="formula">d = ${size} × √2 = ${(size * Math.sqrt(2)).toFixed(2)} units</span>
            
            <p><strong>Space Diagonal:</strong></p>
            <span class="formula">d = s√3</span>
            <span class="formula">d = ${size} × √3 = ${(size * Math.sqrt(3)).toFixed(2)} units</span>
        `;
        
        // Generate HTML content for net diagram
        const netHTML = `
            <svg width="100%" height="460" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Complete net of a cube showing all 6 faces in a cross pattern -->
                    
                    ${
                        // Calculate better positioning for cube net
                        (function() {
                            const centerX = 200;
                            const centerY = 200;
                            const cellSize = size*30;
                            
                            // Calculate face positions in cross layout
                            const topX = centerX - cellSize/2;
                            const topY = centerY - cellSize - cellSize;
                            
                            const leftX = centerX - cellSize - cellSize/2;
                            const leftY = centerY - cellSize;
                            
                            const frontX = centerX - cellSize/2;
                            const frontY = centerY - cellSize;
                            
                            const rightX = centerX + cellSize/2;
                            const rightY = centerY - cellSize;
                            
                            const bottomX = centerX - cellSize/2;
                            const bottomY = centerY;
                            
                            const backX = centerX - cellSize/2;
                            const backY = centerY + cellSize;
                            
                            return `
                                <!-- Top face - light blue -->
                                <rect x="${topX}" y="${topY}" width="${cellSize}" height="${cellSize}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Left face - medium blue -->
                                <rect x="${leftX}" y="${leftY}" width="${cellSize}" height="${cellSize}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Front face - light blue variant -->
                                <rect x="${frontX}" y="${frontY}" width="${cellSize}" height="${cellSize}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Right face - medium blue -->
                                <rect x="${rightX}" y="${rightY}" width="${cellSize}" height="${cellSize}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Bottom face - light blue -->
                                <rect x="${bottomX}" y="${bottomY}" width="${cellSize}" height="${cellSize}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                                
                                <!-- Back face - darker blue -->
                                <rect x="${backX}" y="${backY}" width="${cellSize}" height="${cellSize}" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                            `;
                        })()
                    }
                    
                    ${
                        /* Generate grid lines and fold lines using the dynamically calculated positions */
                        (function() {
                            const centerX = 200;
                            const centerY = 200;
                            const cellSize = size*30;
                            
                            // Calculate positions
                            const topX = centerX - cellSize/2;
                            const topY = centerY - cellSize - cellSize;
                            
                            const leftX = centerX - cellSize - cellSize/2;
                            const leftY = centerY - cellSize;
                            
                            const frontX = centerX - cellSize/2;
                            const frontY = centerY - cellSize;
                            
                            const rightX = centerX + cellSize/2;
                            const rightY = centerY - cellSize;
                            
                            const bottomX = centerX - cellSize/2;
                            const bottomY = centerY;
                            
                            const backX = centerX - cellSize/2;
                            const backY = centerY + cellSize;
                            
                            let gridLines = '';
                            
                            // Generate grid lines for all 6 faces
                            // Since it's a cube, all faces have the same grid pattern
                            // Generate a function to create grid lines for a face
                            const createGridForFace = (x, y) => {
                                let lines = '';
                                // Vertical grid lines
                                for (let i = 1; i < size; i++) {
                                    lines += `<line x1="${x + i*30}" y1="${y}" x2="${x + i*30}" y2="${y + cellSize}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Horizontal grid lines
                                for (let i = 1; i < size; i++) {
                                    lines += `<line x1="${x}" y1="${y + i*30}" x2="${x + cellSize}" y2="${y + i*30}" 
                                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                return lines;
                            };
                            
                            // Apply grid to all faces
                            gridLines += createGridForFace(topX, topY);
                            gridLines += createGridForFace(leftX, leftY);
                            gridLines += createGridForFace(frontX, frontY);
                            gridLines += createGridForFace(rightX, rightY);
                            gridLines += createGridForFace(bottomX, bottomY);
                            gridLines += createGridForFace(backX, backY);
                            
                            // Create fold lines
                            let foldLines = '';
                            
                            // Top to front fold
                            foldLines += `<line x1="${topX}" y1="${topY + cellSize}" x2="${topX + cellSize}" y2="${topY + cellSize}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Front to bottom fold
                            foldLines += `<line x1="${frontX}" y1="${frontY + cellSize}" x2="${frontX + cellSize}" y2="${frontY + cellSize}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Bottom to back fold
                            foldLines += `<line x1="${bottomX}" y1="${bottomY + cellSize}" x2="${bottomX + cellSize}" y2="${bottomY + cellSize}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Left to front fold
                            foldLines += `<line x1="${leftX + cellSize}" y1="${leftY}" x2="${leftX + cellSize}" y2="${leftY + cellSize}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Front to right fold
                            foldLines += `<line x1="${frontX + cellSize}" y1="${frontY}" x2="${frontX + cellSize}" y2="${frontY + cellSize}" 
                                              stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                            
                            // Add face labels
                            const labels = `
                                <!-- Face labels -->
                                <rect x="${topX + cellSize/2 - 15}" y="${topY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${topX + cellSize/2}" y="${topY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Top</text>
                                
                                <rect x="${frontX + cellSize/2 - 15}" y="${frontY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${frontX + cellSize/2}" y="${frontY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Front</text>
                                
                                <rect x="${leftX + cellSize/2 - 15}" y="${leftY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${leftX + cellSize/2}" y="${leftY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Left</text>
                                
                                <rect x="${rightX + cellSize/2 - 15}" y="${rightY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${rightX + cellSize/2}" y="${rightY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Right</text>
                                
                                <rect x="${bottomX + cellSize/2 - 15}" y="${bottomY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${bottomX + cellSize/2}" y="${bottomY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Bottom</text>
                                
                                <rect x="${backX + cellSize/2 - 15}" y="${backY + cellSize/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                                <text x="${backX + cellSize/2}" y="${backY + cellSize/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Back</text>
                            `;
                            
                            // Add dimensions
                            const dimensions = `
                                <!-- Dimension indicators -->
                                <line x1="${frontX - 10}" y1="${frontY - 10}" x2="${frontX + cellSize + 10}" y2="${frontY - 10}" stroke="#000" stroke-width="1"/>
                                <text x="${frontX + cellSize/2}" y="${frontY - 20}" text-anchor="middle" font-size="12" fill="#000">${size} units</text>
                            `;
                            
                            return gridLines + foldLines + labels + dimensions;
                        })()
                    }
                </svg>
            
            <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a cube showing all 6 identical square faces (${size}×${size} units each) that fold to create the 3D shape</p>
            
            <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                <p><strong>Understanding the Net:</strong> This net shows all 6 identical square faces of a cube arranged in a cross pattern:</p>
                <ul>
                    <li>Each face is a square with side length ${size} units</li>
                    <li>Grid lines show the unit measurements (${size}×${size} for each face)</li>
                    <li>When folded along the dashed lines, the squares form a perfect cube</li>
                    <li>This "cross pattern" is one of 11 possible nets for a cube</li>
                </ul>
                <p>The cube has 6 faces, 12 edges, and 8 vertices. Each vertex connects exactly 3 edges and 3 faces.</p>
            </div>
        `;
        
        // Update desktop panels
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netImageContainer.innerHTML = netHTML;
        
        // Update mobile panels if they exist
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetImageContainer) mobileNetImageContainer.innerHTML = netHTML;
        
        // Generate topology HTML for cube
        const topologyHTML = `
            <h4>Cube Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td>6 (all congruent squares)</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td>12 (all equal length)</td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td>8</td>
                </tr>
                <tr>
                    <td>Euler's Formula</td>
                    <td>V - E + F = 2 → 8 - 12 + 6 = 2 ✓</td>
                </tr>
                <tr>
                    <td>Regular Polyhedron</td>
                    <td>Yes (one of the five Platonic solids)</td>
                </tr>
                <tr>
                    <td>Symmetry</td>
                    <td>High - 9 planes of symmetry</td>
                </tr>
                <tr>
                    <td>Dual Polyhedron</td>
                    <td>Regular octahedron</td>
                </tr>
                <tr>
                    <td>Face Shape</td>
                    <td>Square</td>
                </tr>
            </table>
        `;
        
        // Update desktop and mobile topology panels
        topologyDiv.innerHTML = topologyHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
    }
    
    // Set up tab switching
    setupTabEvents();
}

// Set up tab switching events
function setupTabEvents() {
    console.log("Setting up tab events");
    
    // Define tab buttons directly by ID for more reliable access
    const tabButtons = {
        metrics: document.getElementById('metrics-tab'),
        formulas: document.getElementById('formulas-tab'),
        nets: document.getElementById('nets-tab'),
        properties: document.getElementById('properties-tab')
    };
    
    const tabContents = {
        metrics: document.getElementById('metrics-content'),
        formulas: document.getElementById('formulas-content'),
        nets: document.getElementById('nets-content'),
        properties: document.getElementById('properties-content')
    };
    
    const mobileTabButtons = {
        metrics: document.getElementById('mobile-metrics-tab'),
        formulas: document.getElementById('mobile-formulas-tab'),
        nets: document.getElementById('mobile-nets-tab'),
        properties: document.getElementById('mobile-properties-tab')
    };
    
    const mobileTabContents = {
        metrics: document.getElementById('mobile-metrics-content'),
        formulas: document.getElementById('mobile-formulas-content'),
        nets: document.getElementById('mobile-nets-content'),
        properties: document.getElementById('mobile-properties-content')
    };
    
    // Debug log to check existence of elements
    console.log("Tab elements found:", {
        desktopButtons: tabButtons,
        desktopContents: tabContents,
        mobileButtons: mobileTabButtons,
        mobileContents: mobileTabContents
    });
    
    // Function to activate a specific tab
    function activateTab(type, tabName) {
        // Get the appropriate sets of buttons and contents
        const buttons = type === 'desktop' ? tabButtons : mobileTabButtons;
        const contents = type === 'desktop' ? tabContents : mobileTabContents;
        
        // Deactivate all tabs
        Object.values(buttons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        Object.values(contents).forEach(content => {
            if (content) content.classList.remove('active');
        });
        
        // Activate the selected tab
        if (buttons[tabName]) buttons[tabName].classList.add('active');
        if (contents[tabName]) contents[tabName].classList.add('active');
        
        console.log(`Activated ${type} tab: ${tabName}`);
    }
    
    // Set up click handlers for desktop tabs
    Object.entries(tabButtons).forEach(([tabName, button]) => {
        if (!button) return;
        
        // Remove any existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            tabButtons[tabName] = newButton; // Update reference
        }
        
        // Add click listener
        newButton.addEventListener('click', () => {
            activateTab('desktop', tabName);
        });
        
        // Also add touch event for better mobile response
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            activateTab('desktop', tabName);
        }, { passive: false });
    });
    
    // Set up click handlers for mobile tabs
    Object.entries(mobileTabButtons).forEach(([tabName, button]) => {
        if (!button) return;
        
        // Remove any existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            mobileTabButtons[tabName] = newButton; // Update reference
        }
        
        // Add click listener
        newButton.addEventListener('click', () => {
            activateTab('mobile', tabName);
        });
        
        // Also add touch event for better mobile response
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            activateTab('mobile', tabName);
        }, { passive: false });
    });
    
    // Activate default tabs
    activateTab('desktop', 'metrics');
    activateTab('mobile', 'metrics');
}

// Set up event listeners for UI controls
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Shape selection buttons
    document.getElementById('triangularPrism1-btn').addEventListener('click', () => {
        loadShape('triangularPrism1');
        setActiveButton('triangularPrism1-btn');
    });
    
    document.getElementById('triangularPrism2-btn').addEventListener('click', () => {
        loadShape('triangularPrism2');
        setActiveButton('triangularPrism2-btn');
    });
    
    document.getElementById('triangularPrism3-btn').addEventListener('click', () => {
        loadShape('triangularPrism3');
        setActiveButton('triangularPrism3-btn');
    });
    
    document.getElementById('rectangularPrism-btn').addEventListener('click', () => {
        loadShape('rectangularPrism');
        setActiveButton('rectangularPrism-btn');
    });
    
    document.getElementById('cube-btn').addEventListener('click', () => {
        loadShape('cube');
        setActiveButton('cube-btn');
    });
    
    document.getElementById('custom-btn').addEventListener('click', () => {
        // Focus on the word problem textarea
        document.getElementById('shape-description').focus();
        document.getElementById('shape-word-problem').scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveButton('custom-btn');
    });
    
    // Custom shape generation
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', () => {
        const description = document.getElementById('shape-description').value;
        parseAndGenerateShape(description);
    });
    
    // Transition slider
    const transitionSlider = document.getElementById('transition-slider');
    const sliderValue = document.getElementById('slider-value');
    
    transitionSlider.addEventListener('input', () => {
        // Directly set the value for immediate feedback
        transitionValue = transitionSlider.value / 100;
        
        if (transitionValue < 0.1) {
            sliderValue.textContent = '2D View';
        } else if (transitionValue > 0.9) {
            sliderValue.textContent = '3D View';
        } else {
            sliderValue.textContent = 'Transition';
        }
        
        // Update the shape immediately
        updateShapeTransition();
        
        console.log("Slider changed to:", transitionValue);
    });
    
    // View control buttons
    document.getElementById('top-view-btn').addEventListener('click', () => {
        setTopView();
        setActiveViewButton('top-view-btn');
    });
    
    document.getElementById('front-view-btn').addEventListener('click', () => {
        setFrontView();
        setActiveViewButton('front-view-btn');
    });
    
    document.getElementById('side-view-btn').addEventListener('click', () => {
        setSideView();
        setActiveViewButton('side-view-btn');
    });
    
    document.getElementById('isometric-view-btn').addEventListener('click', () => {
        setIsometricView();
        setActiveViewButton('isometric-view-btn');
    });
    
    // Reset view button
    const resetViewBtn = document.getElementById('reset-view');
    resetViewBtn.addEventListener('click', () => {
        if (mainControls) {
            setIsometricView();
            mainControls.reset();
            setActiveViewButton('isometric-view-btn');
        }
    });
    
    // Camera angle controls
    const horizontalAngleSlider = document.getElementById('horizontal-angle');
    horizontalAngleSlider.addEventListener('input', () => {
        const horizontalAngle = parseInt(horizontalAngleSlider.value);
        const verticalAngle = parseInt(document.getElementById('vertical-angle').value);
        const distance = parseInt(document.getElementById('camera-distance').value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
        resetActiveViewButtons();
    });
    
    const verticalAngleSlider = document.getElementById('vertical-angle');
    verticalAngleSlider.addEventListener('input', () => {
        const horizontalAngle = parseInt(document.getElementById('horizontal-angle').value);
        const verticalAngle = parseInt(verticalAngleSlider.value);
        const distance = parseInt(document.getElementById('camera-distance').value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
        resetActiveViewButtons();
    });
    
    const distanceSlider = document.getElementById('camera-distance');
    distanceSlider.addEventListener('input', () => {
        const horizontalAngle = parseInt(document.getElementById('horizontal-angle').value);
        const verticalAngle = parseInt(document.getElementById('vertical-angle').value);
        const distance = parseInt(distanceSlider.value);
        
        setCameraPosition(horizontalAngle, verticalAngle, distance);
    });
    
    // Cross section toggle
    const crossSectionToggle = document.getElementById('cross-section-toggle');
    crossSectionToggle.addEventListener('change', () => {
        crossSectionEnabled = crossSectionToggle.checked;
        
        if (crossSectionEnabled) {
            document.getElementById('cross-section-controls').classList.remove('hidden');
            updateCrossSection();
        } else {
            document.getElementById('cross-section-controls').classList.add('hidden');
            removeCrossSection();
        }
    });
    
    // Cross section plane buttons
    document.getElementById('horizontal-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'horizontal';
        setActivePlaneButton('horizontal-plane-btn');
        updateCrossSection();
    });
    
    document.getElementById('vertical-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'vertical';
        setActivePlaneButton('vertical-plane-btn');
        updateCrossSection();
    });
    
    document.getElementById('angled-plane-btn').addEventListener('click', () => {
        crossSectionPlane = 'angled';
        setActivePlaneButton('angled-plane-btn');
        updateCrossSection();
    });
    
    // Cross section position slider
    const crossSectionPositionSlider = document.getElementById('cross-section-position');
    const crossSectionPositionValue = document.getElementById('cross-section-position-value');
    
    crossSectionPositionSlider.addEventListener('input', () => {
        const value = crossSectionPositionSlider.value;
        crossSectionPosition = value / 100;
        crossSectionPositionValue.textContent = `${value}%`;
        updateCrossSection();
    });
}

// Helper functions for UI button states
function setActiveButton(buttonId) {
    const buttons = document.querySelectorAll('.shape-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function setActiveViewButton(buttonId) {
    const buttons = document.querySelectorAll('.view-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function resetActiveViewButtons() {
    const buttons = document.querySelectorAll('.view-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
}

function setActivePlaneButton(buttonId) {
    const buttons = document.querySelectorAll('.plane-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Parse custom shape description and generate the shape
function parseAndGenerateShape(description) {
    console.log("Parsing custom shape description:", description);
    try {
        // More flexible parsing to handle various description formats
        
        // Try to extract shape type
        let shapeType = null;
        if (description.match(/triangular\s*prism/i)) {
            shapeType = 'triangularPrism';
        } else if (description.match(/rectangular\s*prism/i) || description.match(/cuboid/i)) {
            shapeType = 'rectangularPrism';
        } else if (description.match(/cube/i)) {
            shapeType = 'cube';
        }
        
        if (!shapeType) {
            // Try to infer from other clues
            if (description.match(/triangle/i) && description.match(/base/i)) {
                shapeType = 'triangularPrism';
            } else if (description.match(/rectangle/i) && description.match(/base/i)) {
                shapeType = 'rectangularPrism';
            } else if (description.match(/equal\s*sides/i) || description.match(/all\s*sides\s*equal/i)) {
                shapeType = 'cube';
            }
        }
        
        // Extract dimensions using more flexible patterns
        const heightMatch = description.match(/(\d+)\s*units?\s*(?:tall|high|height)/i) || 
                          description.match(/height\s*(?:of|is|:)?\s*(\d+)\s*units?/i) ||
                          description.match(/(\d+)\s*units?\s*in\s*height/i);
        
        const widthMatch = description.match(/(\d+)\s*units?\s*(?:wide|width)/i) || 
                         description.match(/width\s*(?:of|is|:)?\s*(\d+)\s*units?/i) ||
                         description.match(/(\d+)\s*units?\s*in\s*width/i);
        
        const lengthMatch = description.match(/(\d+)\s*units?\s*(?:long|length)/i) || 
                          description.match(/length\s*(?:of|is|:)?\s*(\d+)\s*units?/i) ||
                          description.match(/(\d+)\s*units?\s*in\s*length/i);
        
        const sidesMatch = description.match(/sides?\s*.+?(\d+)(?:.*?)and\s*(\d+)/i) || 
                         description.match(/base\s*with\s*sides\s*(\d+)(?:.*?)and\s*(\d+)/i) ||
                         description.match(/base\s*of\s*(\d+)(?:.*?)by\s*(\d+)/i) ||
                         description.match(/(\d+)\s*by\s*(\d+)\s*(?:base|triangle)/i);
        
        const sizeMatch = description.match(/(\d+)\s*(?:unit|cm|mm|m)/i) ||
                        description.match(/side\s*length\s*(?:of|is|:)?\s*(\d+)/i) ||
                        description.match(/edge\s*length\s*(?:of|is|:)?\s*(\d+)/i);
        
        // Numbers detection as fallback
        const allNumbers = description.match(/\d+/g);
        
        // Create the custom shape based on shape type and extracted dimensions
        if (shapeType === 'triangularPrism') {
            const height = heightMatch ? parseInt(heightMatch[1]) : 
                        (allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 4);
            
            const side1 = sidesMatch ? parseInt(sidesMatch[1]) : 
                      (allNumbers && allNumbers.length > 1 ? parseInt(allNumbers[1]) : 3);
            
            const side2 = sidesMatch ? parseInt(sidesMatch[2]) : 
                      (allNumbers && allNumbers.length > 2 ? parseInt(allNumbers[2]) : 4);
            
            const customShape = {
                type: 'triangularPrism',
                height: height,
                base: {
                    side1: side1,
                    side2: side2
                }
            };
            
            createShape(customShape);
            return true;
            
        } else if (shapeType === 'rectangularPrism') {
            const height = heightMatch ? parseInt(heightMatch[1]) : 
                        (allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 3);
            
            const width = widthMatch ? parseInt(widthMatch[1]) : 
                       (allNumbers && allNumbers.length > 1 ? parseInt(allNumbers[1]) : 4);
            
            const length = lengthMatch ? parseInt(lengthMatch[1]) : 
                        (allNumbers && allNumbers.length > 2 ? parseInt(allNumbers[2]) : 5);
            
            const customShape = {
                type: 'rectangularPrism',
                height: height,
                width: width,
                length: length
            };
            
            createShape(customShape);
            return true;
            
        } else if (shapeType === 'cube') {
            const size = sizeMatch ? parseInt(sizeMatch[1]) : 
                      (allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 3);
            
            const customShape = {
                type: 'cube',
                size: size
            };
            
            createShape(customShape);
            return true;
        } else {
            // Attempt to infer shape from numbers available
            if (allNumbers && allNumbers.length === 1) {
                // One number = probably a cube
                const customShape = {
                    type: 'cube',
                    size: parseInt(allNumbers[0])
                };
                createShape(customShape);
                return true;
            } else if (allNumbers && allNumbers.length === 3) {
                // Three numbers = probably a rectangular prism
                const customShape = {
                    type: 'rectangularPrism',
                    height: parseInt(allNumbers[0]),
                    width: parseInt(allNumbers[1]),
                    length: parseInt(allNumbers[2])
                };
                createShape(customShape);
                return true;
            } else if (allNumbers && allNumbers.length === 2) {
                // Two numbers = ambiguous, default to triangular prism
                const customShape = {
                    type: 'triangularPrism',
                    height: parseInt(allNumbers[0]),
                    base: {
                        side1: parseInt(allNumbers[1]),
                        side2: parseInt(allNumbers[1])
                    }
                };
                createShape(customShape);
                return true;
            }
            
            alert('Unsupported shape type or not enough information. Please specify triangular prism, rectangular prism, or cube with dimensions.');
            return false;
        }
    } catch (error) {
        console.error('Error parsing shape description:', error);
        alert('Could not parse shape description. Please try again with format like "Triangular prism 4 units high with base sides 3 and 5"');
        return false;
    }
}

// Load a predefined shape
function loadShape(shapeId) {
    console.log("Loading shape:", shapeId);
    const shapeDefinition = shapeDefinitions[shapeId];
    if (shapeDefinition) {
        createShape(shapeDefinition);
        
        // Show the custom input section if custom shape
        if (shapeId === 'custom') {
            const customInput = document.getElementById('custom-input');
            const mobileCustomInput = document.getElementById('mobile-custom-input');
            if (customInput) customInput.classList.remove('hidden');
            if (mobileCustomInput) mobileCustomInput.classList.remove('hidden');
        } else {
            const customInput = document.getElementById('custom-input');
            const mobileCustomInput = document.getElementById('mobile-custom-input');
            if (customInput) customInput.classList.add('hidden');
            if (mobileCustomInput) mobileCustomInput.classList.add('hidden');
        }
    }
}

// Create a shape based on the definition
function createShape(shapeDef) {
    console.log("Creating shape:", shapeDef.type);
    
    try {
        // Clear existing shapes
        clearShapes();
        
        // Create geometry based on shape type
        switch (shapeDef.type) {
            case 'triangularPrism':
                currentShape = createTriangularPrism(
                    shapeDef.height, 
                    shapeDef.base.side1, 
                    shapeDef.base.side2
                );
                break;
                
            case 'rectangularPrism':
                currentShape = createRectangularPrism(
                    shapeDef.width,
                    shapeDef.height,
                    shapeDef.length
                );
                break;
                
            case 'cube':
                currentShape = createCube(shapeDef.size);
                break;
                
            default:
                console.error('Unknown shape type:', shapeDef.type);
                return;
        }
        
        // Add the shape to scenes
        mainScene.add(currentShape.mainMesh);
        if (topScene) topScene.add(currentShape.topMesh);
        if (frontScene) frontScene.add(currentShape.frontMesh);
        if (rightScene) rightScene.add(currentShape.rightMesh);
        if (leftScene) leftScene.add(currentShape.leftMesh);
        
        // Update camera to fit the shape
        updateCamerasForShape(shapeDef);
        
        // Update shape details in the UI
        updateShapeDetails(currentShape);
        
        // Update the transition based on current value
        updateShapeTransition();
        
        // Update cross section if enabled
        if (crossSectionEnabled) {
            updateCrossSection();
        }
        
        // Set default active buttons
        setActiveViewButton('isometric-view-btn');
        if (crossSectionEnabled) {
            setActivePlaneButton('horizontal-plane-btn');
        }
        
        // Ensure the metrics tab is selected by default
        // Select the metrics tab on desktop
        document.getElementById('metrics-tab').click();
        // Select the metrics tab on mobile if it exists
        const mobilemetricsTab = document.getElementById('mobile-metrics-tab');
        if (mobilemetricsTab) mobilemetricsTab.click();
        
        console.log("Shape created successfully, type:", currentShape.type);
    } catch (error) {
        console.error("Error creating shape:", error);
    }
}

// Create a triangular prism
function createTriangularPrism(height, side1, side2) {
    // Calculate the third side using the Law of Cosines
    // For simplicity, we'll use a right triangle
    const side3 = Math.sqrt(side1 * side1 + side2 * side2);
    
    // Create the geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side1, 0);
    shape.lineTo(0, side2);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
        depth: height,
        bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    
    // Create materials
    const material = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });
    
    // Create edge geometry for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    
    // Add grid lines to show voxel units clearly
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Calculate the bounds of the triangle in 3D space
    const minX = -side1/2;
    const maxX = side1/2;
    const minY = -side2/2;
    const maxY = side2/2;
    const minZ = -height/2;
    const maxZ = height/2;
    
    // Create an array to hold line positions
    const linePositions = [];
    
    // Create horizontal grid lines (in XY plane)
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x += 1) {
        linePositions.push(x, minY, 0, x, maxY, 0); // Front face
        linePositions.push(x, minY, height, x, maxY, height); // Back face
    }
    
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 1) {
        linePositions.push(minX, y, 0, maxX, y, 0); // Front face
        linePositions.push(minX, y, height, maxX, y, height); // Back face
    }
    
    // Create vertical grid lines along Z axis
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x += 1) {
        linePositions.push(x, minY, 0, x, minY, height); // Bottom edge
        linePositions.push(x, maxY, 0, x, maxY, height); // Top edge
    }
    
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 1) {
        linePositions.push(minX, y, 0, minX, y, height); // Left edge
        linePositions.push(maxX, y, 0, maxX, y, height); // Right edge
    }
    
    // Create depth lines
    for (let z = Math.ceil(minZ); z <= Math.floor(maxZ); z += 1) {
        linePositions.push(minX, minY, z, maxX, minY, z); // Bottom edge
        linePositions.push(minX, maxY, z, maxX, maxY, z); // Top edge
        linePositions.push(minX, minY, z, minX, maxY, z); // Left edge
        linePositions.push(maxX, minY, z, maxX, maxY, z); // Right edge
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.rotation.x = Math.PI / 2;
    edgeLines.rotation.x = Math.PI / 2;
    gridLines.rotation.x = Math.PI / 2;
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create full 3D meshes for the orthographic views (not just wireframes)
    // These will be actual 3D objects positioned in the orthographic scenes
    const topMeshGeometry = geometry.clone();
    const frontMeshGeometry = geometry.clone();
    const rightMeshGeometry = geometry.clone();
    const leftMeshGeometry = geometry.clone();
    
    // Create meshes for orthographic views with the same material
    const topMesh = new THREE.Mesh(topMeshGeometry, material.clone());
    const frontMesh = new THREE.Mesh(frontMeshGeometry, material.clone());
    const rightMesh = new THREE.Mesh(rightMeshGeometry, material.clone());
    const leftMesh = new THREE.Mesh(leftMeshGeometry, material.clone());
    
    // Add edge lines to orthographic views
    const topEdges = new THREE.LineSegments(new THREE.EdgesGeometry(topMeshGeometry), edgeMaterial.clone());
    const frontEdges = new THREE.LineSegments(new THREE.EdgesGeometry(frontMeshGeometry), edgeMaterial.clone());
    const rightEdges = new THREE.LineSegments(new THREE.EdgesGeometry(rightMeshGeometry), edgeMaterial.clone());
    const leftEdges = new THREE.LineSegments(new THREE.EdgesGeometry(leftMeshGeometry), edgeMaterial.clone());
    
    // Set correct rotations for orthographic views
    topMesh.rotation.x = Math.PI / 2;
    frontMesh.rotation.x = Math.PI / 2;
    rightMesh.rotation.x = Math.PI / 2;
    rightMesh.rotation.z = Math.PI / 2;
    leftMesh.rotation.x = Math.PI / 2;
    leftMesh.rotation.z = -Math.PI / 2;
    
    topEdges.rotation.x = Math.PI / 2;
    frontEdges.rotation.x = Math.PI / 2;
    rightEdges.rotation.x = Math.PI / 2;
    rightEdges.rotation.z = Math.PI / 2;
    leftEdges.rotation.x = Math.PI / 2;
    leftEdges.rotation.z = -Math.PI / 2;
    
    // Group the meshes with their edges for each view
    const topGroup = new THREE.Group();
    topGroup.add(topMesh);
    topGroup.add(topEdges);
    
    const frontGroup = new THREE.Group();
    frontGroup.add(frontMesh);
    frontGroup.add(frontEdges);
    
    const rightGroup = new THREE.Group();
    rightGroup.add(rightMesh);
    rightGroup.add(rightEdges);
    
    const leftGroup = new THREE.Group();
    leftGroup.add(leftMesh);
    leftGroup.add(leftEdges);
    
    // Create wireframe for transitions
    const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
    wireframe.rotation.x = Math.PI / 2;
    mainScene.add(wireframe);
    
    return {
        mainMesh: mainGroup,
        topMesh: topGroup,
        frontMesh: frontGroup,
        rightMesh: rightGroup,
        leftMesh: leftGroup,
        wireframe,
        dimensions: { height, side1, side2, side3 },
        type: 'triangularPrism'
    };
}

// Create a rectangular prism
function createRectangularPrism(width, height, length) {
    // Create the geometry
    const geometry = new THREE.BoxGeometry(width, height, length);
    
    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });
    
    // Create edge geometry for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    
    // Add grid lines to show voxel units clearly
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Create an array to hold line positions
    const linePositions = [];
    
    // Create horizontal lines along width
    for (let y = -height/2; y <= height/2; y += 1) {
        for (let z = -length/2; z <= length/2; z += 1) {
            linePositions.push(-width/2, y, z, width/2, y, z);
        }
    }
    
    // Create vertical lines along height
    for (let x = -width/2; x <= width/2; x += 1) {
        for (let z = -length/2; z <= length/2; z += 1) {
            linePositions.push(x, -height/2, z, x, height/2, z);
        }
    }
    
    // Create depth lines along length
    for (let x = -width/2; x <= width/2; x += 1) {
        for (let y = -height/2; y <= height/2; y += 1) {
            linePositions.push(x, y, -length/2, x, y, length/2);
        }
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Add face labels (optional for educational purposes)
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const labelSize = Math.min(width, height, length) * 0.15;
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Add face labels and vertex markings (optional enhancement)
    const faceLabels = new THREE.Group();
    const vertexMarkers = new THREE.Group();
    
    // Vertex markers (small spheres at each vertex)
    const vertexGeometry = new THREE.SphereGeometry(labelSize * 0.3, 8, 8);
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Create 8 vertices for a box
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfLength = length / 2;
    
    const vertexPositions = [
        [-halfWidth, -halfHeight, -halfLength],
        [halfWidth, -halfHeight, -halfLength],
        [halfWidth, halfHeight, -halfLength],
        [-halfWidth, halfHeight, -halfLength],
        [-halfWidth, -halfHeight, halfLength],
        [halfWidth, -halfHeight, halfLength],
        [halfWidth, halfHeight, halfLength],
        [-halfWidth, halfHeight, halfLength]
    ];
    
    vertexPositions.forEach(pos => {
        const vertex = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertex.position.set(pos[0], pos[1], pos[2]);
        vertexMarkers.add(vertex);
    });
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines); // Add the voxel grid lines
    mainGroup.add(vertexMarkers);
    mainGroup.add(faceLabels);
    
    // Create full 3D meshes for the orthographic views (not just wireframes)
    const topMeshGeometry = geometry.clone();
    const frontMeshGeometry = geometry.clone();
    const rightMeshGeometry = geometry.clone();
    const leftMeshGeometry = geometry.clone();
    
    // Create meshes for different views with the same material
    const topMesh = new THREE.Mesh(topMeshGeometry, material.clone());
    const frontMesh = new THREE.Mesh(frontMeshGeometry, material.clone());
    const rightMesh = new THREE.Mesh(rightMeshGeometry, material.clone());
    const leftMesh = new THREE.Mesh(leftMeshGeometry, material.clone());
    
    // Add edge lines to orthographic views
    const topEdges = new THREE.LineSegments(new THREE.EdgesGeometry(topMeshGeometry), edgeMaterial.clone());
    const frontEdges = new THREE.LineSegments(new THREE.EdgesGeometry(frontMeshGeometry), edgeMaterial.clone());
    const rightEdges = new THREE.LineSegments(new THREE.EdgesGeometry(rightMeshGeometry), edgeMaterial.clone());
    const leftEdges = new THREE.LineSegments(new THREE.EdgesGeometry(leftMeshGeometry), edgeMaterial.clone());
    
    // Group the meshes with their edges for each view
    const topGroup = new THREE.Group();
    topGroup.add(topMesh);
    topGroup.add(topEdges);
    
    const frontGroup = new THREE.Group();
    frontGroup.add(frontMesh);
    frontGroup.add(frontEdges);
    
    const rightGroup = new THREE.Group();
    rightGroup.add(rightMesh);
    rightGroup.add(rightEdges);
    
    const leftGroup = new THREE.Group();
    leftGroup.add(leftMesh);
    leftGroup.add(leftEdges);
    
    // Create wireframe for transitions
    const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
    mainScene.add(wireframe);
    
    return {
        mainMesh: mainGroup,
        topMesh: topGroup,
        frontMesh: frontGroup,
        rightMesh: rightGroup,
        leftMesh: leftGroup,
        wireframe,
        dimensions: { width, height, length },
        type: 'rectangularPrism'
    };
}

// Create a cube
function createCube(size) {
    return createRectangularPrism(size, size, size);
}

// Unified projection functions
function createTopProjection(width, length, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            0, 0, 0,
            width, 0, 0,
            0, length, 0,
            0, 0, 0
        ]);
    } else {
        vertices = new Float32Array([
            -width/2, -length/2, 0,
            width/2, -length/2, 0,
            width/2, length/2, 0,
            -width/2, length/2, 0,
            -width/2, -length/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

function createFrontProjection(width, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -width/2, -height/2, 0,
            width/2, -height/2, 0,
            width/2, height/2, 0,
            -width/2, height/2, 0,
            -width/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -width/2, -height/2, 0,
            width/2, -height/2, 0,
            width/2, height/2, 0,
            -width/2, height/2, 0,
            -width/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

function createRightProjection(length, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            0, height/2, 0,
            -length/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            length/2, height/2, 0,
            -length/2, height/2, 0,
            -length/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

function createLeftProjection(length, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            0, height/2, 0,
            -length/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            length/2, height/2, 0,
            -length/2, height/2, 0,
            -length/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

// Animation state
let targetTransitionValue = 1;
let transitionSpeed = 0.05; // Faster transition speed for better feedback

// Update shape transition based on slider value - FIXED VERSION
function updateShapeTransition() {
    if (!currentShape) {
        console.log("No current shape to transition");
        return;
    }
    
    console.log("Updating shape transition, value:", transitionValue);
    
    // Apply opacity to main 3D shape - directly inspect and update child meshes
    if (currentShape.mainMesh) {
        // Always keep visible but change opacity
        currentShape.mainMesh.visible = true;
        
        // Directly apply opacity to all child meshes to ensure it works
        currentShape.mainMesh.traverse(child => {
            if (child.isMesh) {
                // Make sure material is set to be transparent
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.transparent = true;
                            mat.opacity = Math.max(0.2, transitionValue * 0.9);
                            mat.needsUpdate = true;
                        });
                    } else {
                        child.material.transparent = true;
                        child.material.opacity = Math.max(0.2, transitionValue * 0.9);
                        child.material.needsUpdate = true;
                    }
                }
            }
        });
    }
    
    // Update wireframe visibility - make it more visible at lower transition values
    if (currentShape.wireframe) {
        currentShape.wireframe.visible = transitionValue < 0.9;
        if (currentShape.wireframe.material) {
            currentShape.wireframe.material.opacity = 1 - transitionValue;
            currentShape.wireframe.material.needsUpdate = true;
        }
    }
    
    // Make sure orthographic views are always visible
    if (currentShape.topMesh) currentShape.topMesh.visible = true;
    if (currentShape.frontMesh) currentShape.frontMesh.visible = true;
    if (currentShape.rightMesh) currentShape.rightMesh.visible = true;
    if (currentShape.leftMesh) currentShape.leftMesh.visible = true;
    
    // Scale and adjust orthographic views based on transition value
    const scale = Math.max(0.7, 1 - transitionValue * 0.3);
    if (currentShape.topMesh) currentShape.topMesh.scale.set(scale, scale, scale);
    if (currentShape.frontMesh) currentShape.frontMesh.scale.set(scale, scale, scale);
    if (currentShape.rightMesh) currentShape.rightMesh.scale.set(scale, scale, scale);
    if (currentShape.leftMesh) currentShape.leftMesh.scale.set(scale, scale, scale);
    
    // Update cross section if enabled
    if (crossSectionEnabled) {
        updateCrossSection();
    }
    
    // Force render to ensure updates are visible
    if (mainRenderer) mainRenderer.render(mainScene, mainCamera);
    if (topRenderer) topRenderer.render(topScene, topCamera);
    if (frontRenderer) frontRenderer.render(frontScene, frontCamera);
    if (rightRenderer) rightRenderer.render(rightScene, rightCamera);
    if (leftRenderer) leftRenderer.render(leftScene, leftCamera);
}

// Remove animation function since we're using direct updates for better responsiveness

// Update cross section visualization
function updateCrossSection() {
    if (!currentShape || !crossSectionEnabled) return;
    
    removeCrossSection();
    
    let plane, planeHelper;
    
    // Create the appropriate plane based on selected plane type
    switch (crossSectionPlane) {
        case 'horizontal':
            plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            break;
            
        case 'vertical':
            plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
            break;
            
        case 'angled':
            plane = new THREE.Plane(new THREE.Vector3(1, 1, 0).normalize(), 0);
            break;
            
        default:
            plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    }
    
    // Adjust plane position
    let planeConstant = 0;
    
    if (currentShape.type === 'triangularPrism') {
        const { height, side1, side2 } = currentShape.dimensions;
        const maxDimension = Math.max(height, side1, side2);
        planeConstant = (crossSectionPosition - 0.5) * maxDimension;
    } else if (currentShape.type === 'rectangularPrism' || currentShape.type === 'cube') {
        const { width, height, length } = currentShape.dimensions;
        const maxDimension = Math.max(width, height, length);
        planeConstant = (crossSectionPosition - 0.5) * maxDimension;
    }
    
    plane.constant = planeConstant;
    
    // Create plane helper
    planeHelper = new THREE.PlaneHelper(plane, 10, 0xff0000);
    mainScene.add(planeHelper);
    
    // Create cross-section visualization
    if (transitionValue > 0) {
        const clippingPlanes = [plane];
        
        // Clone the shape and apply clipping
        const clippedGeometry = currentShape.mainMesh.geometry.clone();
        
        const clippedMaterial = new THREE.MeshStandardMaterial({
            color: 0xff5555,
            side: THREE.DoubleSide,
            clippingPlanes: clippingPlanes
        });
        
        crossSectionMesh = new THREE.Mesh(clippedGeometry, clippedMaterial);
        crossSectionMesh.rotation.copy(currentShape.mainMesh.rotation);
        crossSectionMesh.position.copy(currentShape.mainMesh.position);
        mainScene.add(crossSectionMesh);
    }
}

// Remove cross section visualization
function removeCrossSection() {
    // Remove existing cross section elements
    mainScene.children = mainScene.children.filter(child => {
        return !(child instanceof THREE.PlaneHelper);
    });
    
    if (crossSectionMesh) {
        mainScene.remove(crossSectionMesh);
        crossSectionMesh = null;
    }
}

// Clear all shapes from the scenes
function clearShapes() {
    if (currentShape) {
        mainScene.remove(currentShape.mainMesh);
        mainScene.remove(currentShape.wireframe);
        topScene.remove(currentShape.topMesh);
        frontScene.remove(currentShape.frontMesh);
        rightScene.remove(currentShape.rightMesh);
        leftScene.remove(currentShape.leftMesh);
    }
    
    removeCrossSection();
    currentShape = null;
}

// Update camera settings based on the shape
function updateCamerasForShape(shapeDef) {
    let maxDimension = 5;
    
    if (shapeDef.type === 'triangularPrism') {
        maxDimension = Math.max(shapeDef.height, shapeDef.base.side1, shapeDef.base.side2);
    } else if (shapeDef.type === 'rectangularPrism') {
        maxDimension = Math.max(shapeDef.width, shapeDef.height, shapeDef.length);
    } else if (shapeDef.type === 'cube') {
        maxDimension = shapeDef.size;
    }
    
    // Adjust orthographic cameras if they exist
    const viewSize = maxDimension * 1.5;
    
    if (topCamera) {
        topCamera.left = -viewSize;
        topCamera.right = viewSize;
        topCamera.top = viewSize;
        topCamera.bottom = -viewSize;
        topCamera.updateProjectionMatrix();
    }
    
    if (frontCamera) {
        frontCamera.left = -viewSize;
        frontCamera.right = viewSize;
        frontCamera.top = viewSize;
        frontCamera.bottom = -viewSize;
        frontCamera.updateProjectionMatrix();
    }
    
    if (rightCamera) {
        rightCamera.left = -viewSize;
        rightCamera.right = viewSize;
        rightCamera.top = viewSize;
        rightCamera.bottom = -viewSize;
        rightCamera.updateProjectionMatrix();
    }
    
    if (leftCamera) {
        leftCamera.left = -viewSize;
        leftCamera.right = viewSize;
        leftCamera.top = viewSize;
        leftCamera.bottom = -viewSize;
        leftCamera.updateProjectionMatrix();
    }
    
    // Adjust main camera
    mainCamera.position.set(
        maxDimension * 2,
        maxDimension * 2,
        maxDimension * 2
    );
    mainCamera.lookAt(0, 0, 0);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    
    mainCamera.aspect = container.clientWidth / container.clientHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(container.clientWidth, container.clientHeight);
    
    // Update orthographic views if they exist
    if (topRenderer) {
        const topContainer = document.getElementById('top-view-canvas');
        if (topContainer) topRenderer.setSize(topContainer.clientWidth, topContainer.clientHeight);
    }
    
    if (frontRenderer) {
        const frontContainer = document.getElementById('front-view-canvas');
        if (frontContainer) frontRenderer.setSize(frontContainer.clientWidth, frontContainer.clientHeight);
    }
    
    if (rightRenderer) {
        const rightContainer = document.getElementById('right-view-canvas');
        if (rightContainer) rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
    }
    
    if (leftRenderer) {
        const leftContainer = document.getElementById('left-view-canvas');
        if (leftContainer) leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    try {
        // IMPORTANT: Always update controls in the animation loop
        // This is crucial for smooth dragging/rotation
        if (mainControls) {
            // First check if mainControls.update is a function
            if (typeof mainControls.update === 'function') {
                mainControls.update();
            }
        }
        
        // Render scenes - check if renderers exist before trying to use them
        if (mainRenderer && mainScene && mainCamera) {
            mainRenderer.render(mainScene, mainCamera);
        }
        
        // Check if orthographic renderers exist before rendering
        if (topRenderer && topScene && topCamera) {
            topRenderer.render(topScene, topCamera);
        }
        
        if (frontRenderer && frontScene && frontCamera) {
            frontRenderer.render(frontScene, frontCamera);
        }
        
        if (rightRenderer && rightScene && rightCamera) {
            rightRenderer.render(rightScene, rightCamera);
        }
        
        if (leftRenderer && leftScene && leftCamera) {
            leftRenderer.render(leftScene, leftCamera);
        }
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
}

// Show/hide fullscreen images
function showFullScreenImage(imageSrc) {
    const overlay = document.getElementById('fullscreen-image-overlay');
    const image = document.getElementById('fullscreen-image');
    
    image.src = imageSrc;
    overlay.classList.remove('hidden');
    
    // Prevent scrolling while overlay is open
    document.body.style.overflow = 'hidden';
}

function hideFullScreenImage() {
    const overlay = document.getElementById('fullscreen-image-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Animation loop is started in the initialization section at the top of the file