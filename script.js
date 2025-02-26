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
    },
    cylinder: {
        type: 'cylinder',
        radius: 2,
        height: 4,
        radiusSegments: 32
    },
    cone: {
        type: 'cone',
        radius: 2,
        height: 4,
        radiusSegments: 32
    },
    sphere: {
        type: 'sphere',
        radius: 2,
        widthSegments: 32,
        heightSegments: 16
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
                
                // If this is the view panel, trigger resize on mobile view renderers
                if (panel.id === 'view-panel') {
                    // Add a small delay to ensure the panel is fully visible first
                    setTimeout(() => {
                        if (window.mobileTopRenderer) {
                            const mobileTopContainer = document.getElementById('mobile-top-view-canvas');
                            if (mobileTopContainer) {
                                window.mobileTopRenderer.setSize(mobileTopContainer.clientWidth, mobileTopContainer.clientHeight);
                            }
                        }
                        
                        if (window.mobileFrontRenderer) {
                            const mobileFrontContainer = document.getElementById('mobile-front-view-canvas');
                            if (mobileFrontContainer) {
                                window.mobileFrontRenderer.setSize(mobileFrontContainer.clientWidth, mobileFrontContainer.clientHeight);
                            }
                        }
                        
                        if (window.mobileRightRenderer) {
                            const mobileRightContainer = document.getElementById('mobile-right-view-canvas');
                            if (mobileRightContainer) {
                                window.mobileRightRenderer.setSize(mobileRightContainer.clientWidth, mobileRightContainer.clientHeight);
                            }
                        }
                        
                        if (window.mobileLeftRenderer) {
                            const mobileLeftContainer = document.getElementById('mobile-left-view-canvas');
                            if (mobileLeftContainer) {
                                window.mobileLeftRenderer.setSize(mobileLeftContainer.clientWidth, mobileLeftContainer.clientHeight);
                            }
                        }
                        
                        // Force a re-render of the mobile views
                        if (window.mobileTopRenderer && window.mobileTopScene && window.mobileTopCamera) {
                            window.mobileTopRenderer.render(window.mobileTopScene, window.mobileTopCamera);
                        }
                        
                        if (window.mobileFrontRenderer && window.mobileFrontScene && window.mobileFrontCamera) {
                            window.mobileFrontRenderer.render(window.mobileFrontScene, window.mobileFrontCamera);
                        }
                        
                        if (window.mobileRightRenderer && window.mobileRightScene && window.mobileRightCamera) {
                            window.mobileRightRenderer.render(window.mobileRightScene, window.mobileRightCamera);
                        }
                        
                        if (window.mobileLeftRenderer && window.mobileLeftScene && window.mobileLeftCamera) {
                            window.mobileLeftRenderer.render(window.mobileLeftScene, window.mobileLeftCamera);
                        }
                    }, 100);
                }
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
    
    document.getElementById('mobile-cylinder-btn').addEventListener('click', () => {
        loadShape('cylinder');
        setActiveButton('mobile-cylinder-btn');
        setActiveButton('cylinder-btn');
    });
    
    document.getElementById('mobile-cone-btn').addEventListener('click', () => {
        loadShape('cone');
        setActiveButton('mobile-cone-btn');
        setActiveButton('cone-btn');
    });
    
    document.getElementById('mobile-sphere-btn').addEventListener('click', () => {
        loadShape('sphere');
        setActiveButton('mobile-sphere-btn');
        setActiveButton('sphere-btn');
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
    
    // Create grid helpers with proper visibility and spacing
    const gridSize = 10;
    const gridDivisions = 10;
    const gridColor = 0x000000;
    const gridOpacity = 0.2;
    
    // Create grid material
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: gridColor, 
        transparent: true, 
        opacity: gridOpacity 
    });
    
    // Function to create grid lines for given plane and size
    function createGridLines(plane, size, divisions) {
        const step = size / divisions;
        const halfSize = size / 2;
        
        const points = [];
        
        // Create grid lines based on plane orientation
        if (plane === 'xy') {
            // Vertical lines along X axis (moving in Z direction)
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(i, -halfSize, 0),
                    new THREE.Vector3(i, halfSize, 0)
                );
            }
            
            // Horizontal lines along Z axis (moving in X direction)
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(-halfSize, i, 0),
                    new THREE.Vector3(halfSize, i, 0)
                );
            }
        } else if (plane === 'xz') {
            // Create lines for XZ plane (top view)
            // Vertical lines along X axis
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(i, 0, -halfSize),
                    new THREE.Vector3(i, 0, halfSize)
                );
            }
            
            // Horizontal lines along Z axis
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(-halfSize, 0, i),
                    new THREE.Vector3(halfSize, 0, i)
                );
            }
        } else if (plane === 'yz') {
            // Create lines for YZ plane (side view)
            // Vertical lines along Y axis
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(0, i, -halfSize),
                    new THREE.Vector3(0, i, halfSize)
                );
            }
            
            // Horizontal lines along Z axis
            for (let i = -halfSize; i <= halfSize; i += step) {
                points.push(
                    new THREE.Vector3(0, -halfSize, i),
                    new THREE.Vector3(0, halfSize, i)
                );
            }
        }
        
        // Create buffer geometry from points
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create lines with the grid material
        return new THREE.LineSegments(geometry, gridMaterial.clone());
    }
    
    // Create specialized grid helpers for each orientation
    const gridHelperXZ = createGridLines('xz', gridSize, gridDivisions);
    const gridHelperXY = createGridLines('xy', gridSize, gridDivisions);
    const gridHelperYZ = createGridLines('yz', gridSize, gridDivisions);
    
    // Create axis helpers for better orientation
    const axisLength = 5;
    
    function createAxisHelper(plane) {
        const group = new THREE.Group();
        
        // Create materials for each axis
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        
        if (plane === 'xz') {
            // X and Z axes for top view that extend in both directions
            const xPoints = [
                new THREE.Vector3(-axisLength, 0, 0),
                new THREE.Vector3(axisLength, 0, 0)
            ];
            const zPoints = [
                new THREE.Vector3(0, 0, -axisLength),
                new THREE.Vector3(0, 0, axisLength)
            ];
            
            const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
            const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
            
            const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
            const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
            
            group.add(xAxis);
            group.add(zAxis);
        } else if (plane === 'xy') {
            // X and Y axes for front view that extend in both directions
            const xPoints = [
                new THREE.Vector3(-axisLength, 0, 0),
                new THREE.Vector3(axisLength, 0, 0)
            ];
            const yPoints = [
                new THREE.Vector3(0, -axisLength, 0),
                new THREE.Vector3(0, axisLength, 0)
            ];
            
            const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
            const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
            
            const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
            const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
            
            group.add(xAxis);
            group.add(yAxis);
        } else if (plane === 'yz') {
            // Y and Z axes for side view that extend in both directions
            const yPoints = [
                new THREE.Vector3(0, -axisLength, 0),
                new THREE.Vector3(0, axisLength, 0)
            ];
            const zPoints = [
                new THREE.Vector3(0, 0, -axisLength),
                new THREE.Vector3(0, 0, axisLength)
            ];
            
            const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
            const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
            
            const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
            const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
            
            group.add(yAxis);
            group.add(zAxis);
        }
        
        return group;
    }
    
    // Create axis helpers for each view
    const topAxisHelper = createAxisHelper('xz');
    const frontAxisHelper = createAxisHelper('xy');
    const rightAxisHelper = createAxisHelper('yz');
    const leftAxisHelper = createAxisHelper('yz');
    
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
    
    // Add grid and axis helpers to help with orientation
    topScene.add(gridHelperXZ);
    topScene.add(topAxisHelper);
    
    // Calculate aspect ratio to maintain square proportions
    const topAspect = topContainer.clientWidth / topContainer.clientHeight;
    
    // Create camera with square aspect ratio
    const topViewSize = 7; // Adjusted size for better view
    topCamera = new THREE.OrthographicCamera(
        -topViewSize * Math.max(topAspect, 1),
        topViewSize * Math.max(topAspect, 1),
        topViewSize / Math.min(topAspect, 1),
        -topViewSize / Math.min(topAspect, 1),
        0.1, 1000
    );
    topCamera.position.set(0, 10, 0);
    topCamera.lookAt(0, 0, 0);
    
    // Create renderer
    topRenderer = new THREE.WebGLRenderer({ antialias: true });
    topRenderer.setSize(topContainer.clientWidth, topContainer.clientHeight);
    topContainer.innerHTML = ''; // Clear container
    topContainer.appendChild(topRenderer.domElement);
    
    // Force an initial render to ensure the view appears
    topRenderer.render(topScene, topCamera);
    
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
    
    // Add grid and axis helpers
    frontScene.add(gridHelperXY);
    frontScene.add(frontAxisHelper);
    
    // Calculate aspect ratio for front view
    const frontAspect = frontContainer.clientWidth / frontContainer.clientHeight;
    
    // Create camera with square aspect ratio
    const frontViewSize = 7;
    frontCamera = new THREE.OrthographicCamera(
        -frontViewSize * Math.max(frontAspect, 1),
        frontViewSize * Math.max(frontAspect, 1),
        frontViewSize / Math.min(frontAspect, 1),
        -frontViewSize / Math.min(frontAspect, 1),
        0.1, 1000
    );
    frontCamera.position.set(0, 0, 10);
    frontCamera.lookAt(0, 0, 0);
    
    // Create renderer
    frontRenderer = new THREE.WebGLRenderer({ antialias: true });
    frontRenderer.setSize(frontContainer.clientWidth, frontContainer.clientHeight);
    frontContainer.innerHTML = ''; // Clear container
    frontContainer.appendChild(frontRenderer.domElement);
    
    // Force an initial render to ensure the view appears
    frontRenderer.render(frontScene, frontCamera);
    
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
    
    // Add grid and axis helpers
    rightScene.add(gridHelperYZ);
    rightScene.add(rightAxisHelper);
    
    // Calculate aspect ratio for right view
    const rightAspect = rightContainer.clientWidth / rightContainer.clientHeight;
    
    // Create camera with square aspect ratio
    const rightViewSize = 7;
    rightCamera = new THREE.OrthographicCamera(
        -rightViewSize * Math.max(rightAspect, 1),
        rightViewSize * Math.max(rightAspect, 1),
        rightViewSize / Math.min(rightAspect, 1),
        -rightViewSize / Math.min(rightAspect, 1),
        0.1, 1000
    );
    rightCamera.position.set(10, 0, 0);
    rightCamera.lookAt(0, 0, 0);
    
    // Create renderer
    rightRenderer = new THREE.WebGLRenderer({ antialias: true });
    rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
    rightContainer.innerHTML = ''; // Clear container
    rightContainer.appendChild(rightRenderer.domElement);
    
    // Force an initial render to ensure the view appears
    rightRenderer.render(rightScene, rightCamera);
    
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
    
    // Add grid and axis helpers
    leftScene.add(gridHelperYZ.clone()); // Clone to have separate instance
    leftScene.add(leftAxisHelper);
    
    // Calculate aspect ratio for left view
    const leftAspect = leftContainer.clientWidth / leftContainer.clientHeight;
    
    // Create camera with square aspect ratio
    const leftViewSize = 7;
    leftCamera = new THREE.OrthographicCamera(
        -leftViewSize * Math.max(leftAspect, 1),
        leftViewSize * Math.max(leftAspect, 1),
        leftViewSize / Math.min(leftAspect, 1),
        -leftViewSize / Math.min(leftAspect, 1),
        0.1, 1000
    );
    leftCamera.position.set(-10, 0, 0);
    leftCamera.lookAt(0, 0, 0);
    
    // Create renderer for left view
    leftRenderer = new THREE.WebGLRenderer({ antialias: true });
    leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
    leftContainer.innerHTML = ''; // Clear container
    leftContainer.appendChild(leftRenderer.domElement);
    
    // Force an initial render to ensure the view appears
    leftRenderer.render(leftScene, leftCamera);
    
    // Initialize mobile views with the same settings
    initMobileOrthographicViews(gridHelperXZ, gridHelperXY, gridHelperYZ);
    
    console.log("Orthographic views initialized successfully");
}

// Initialize mobile orthographic views
function initMobileOrthographicViews(gridHelperXZ, gridHelperXY, gridHelperYZ) {
    console.log("Initializing mobile orthographic views...");
    
    // Use the same axis helper creation function from above
    // Re-create the function to avoid scope issues
    function createMobileAxisHelper(plane) {
        const group = new THREE.Group();
        
        // Create materials for each axis
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        
        const axisLength = 5;
        
        if (plane === 'xz') {
            // X and Z axes for top view that extend in both directions
            const xPoints = [
                new THREE.Vector3(-axisLength, 0, 0),
                new THREE.Vector3(axisLength, 0, 0)
            ];
            const zPoints = [
                new THREE.Vector3(0, 0, -axisLength),
                new THREE.Vector3(0, 0, axisLength)
            ];
            
            const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
            const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
            
            const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
            const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
            
            group.add(xAxis);
            group.add(zAxis);
        } else if (plane === 'xy') {
            // X and Y axes for front view that extend in both directions
            const xPoints = [
                new THREE.Vector3(-axisLength, 0, 0),
                new THREE.Vector3(axisLength, 0, 0)
            ];
            const yPoints = [
                new THREE.Vector3(0, -axisLength, 0),
                new THREE.Vector3(0, axisLength, 0)
            ];
            
            const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
            const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
            
            const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
            const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
            
            group.add(xAxis);
            group.add(yAxis);
        } else if (plane === 'yz') {
            // Y and Z axes for side view that extend in both directions
            const yPoints = [
                new THREE.Vector3(0, -axisLength, 0),
                new THREE.Vector3(0, axisLength, 0)
            ];
            const zPoints = [
                new THREE.Vector3(0, 0, -axisLength),
                new THREE.Vector3(0, 0, axisLength)
            ];
            
            const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
            const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
            
            const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
            const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
            
            group.add(yAxis);
            group.add(zAxis);
        }
        
        return group;
    }
    
    // Create mobile axis helpers
    const mobileTopAxisHelper = createMobileAxisHelper('xz');
    const mobileFrontAxisHelper = createMobileAxisHelper('xy');
    const mobileRightAxisHelper = createMobileAxisHelper('yz');
    const mobileLeftAxisHelper = createMobileAxisHelper('yz');
    
    // Mobile top view
    const mobileTopContainer = document.getElementById('mobile-top-view-canvas');
    if (mobileTopContainer) {
        window.mobileTopScene = new THREE.Scene();
        window.mobileTopScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const mobileTopLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mobileTopLight.position.set(0, 10, 0);
        window.mobileTopScene.add(mobileTopLight);
        window.mobileTopScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers to help with orientation
        window.mobileTopScene.add(gridHelperXZ.clone());
        window.mobileTopScene.add(mobileTopAxisHelper);
        
        // Calculate aspect ratio to maintain square proportions
        const mobileTopAspect = mobileTopContainer.clientWidth / mobileTopContainer.clientHeight;
        
        // Create camera with square aspect ratio
        const mobileTopViewSize = 7;
        window.mobileTopCamera = new THREE.OrthographicCamera(
            -mobileTopViewSize * Math.max(mobileTopAspect, 1),
            mobileTopViewSize * Math.max(mobileTopAspect, 1),
            mobileTopViewSize / Math.min(mobileTopAspect, 1),
            -mobileTopViewSize / Math.min(mobileTopAspect, 1),
            0.1, 1000
        );
        window.mobileTopCamera.position.set(0, 10, 0);
        window.mobileTopCamera.lookAt(0, 0, 0);
        
        // Create renderer
        window.mobileTopRenderer = new THREE.WebGLRenderer({ antialias: true });
        window.mobileTopRenderer.setSize(mobileTopContainer.clientWidth, mobileTopContainer.clientHeight);
        mobileTopContainer.innerHTML = ''; // Clear container
        mobileTopContainer.appendChild(window.mobileTopRenderer.domElement);
        
        // Force an initial render
        window.mobileTopRenderer.render(window.mobileTopScene, window.mobileTopCamera);
    }
    
    // Mobile front view
    const mobileFrontContainer = document.getElementById('mobile-front-view-canvas');
    if (mobileFrontContainer) {
        window.mobileFrontScene = new THREE.Scene();
        window.mobileFrontScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const mobileFrontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mobileFrontLight.position.set(0, 0, 10);
        window.mobileFrontScene.add(mobileFrontLight);
        window.mobileFrontScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        window.mobileFrontScene.add(gridHelperXY.clone());
        window.mobileFrontScene.add(mobileFrontAxisHelper);
        
        // Calculate aspect ratio for front view
        const mobileFrontAspect = mobileFrontContainer.clientWidth / mobileFrontContainer.clientHeight;
        
        // Create camera with square aspect ratio
        const mobileFrontViewSize = 7;
        window.mobileFrontCamera = new THREE.OrthographicCamera(
            -mobileFrontViewSize * Math.max(mobileFrontAspect, 1),
            mobileFrontViewSize * Math.max(mobileFrontAspect, 1),
            mobileFrontViewSize / Math.min(mobileFrontAspect, 1),
            -mobileFrontViewSize / Math.min(mobileFrontAspect, 1),
            0.1, 1000
        );
        window.mobileFrontCamera.position.set(0, 0, 10);
        window.mobileFrontCamera.lookAt(0, 0, 0);
        
        // Create renderer
        window.mobileFrontRenderer = new THREE.WebGLRenderer({ antialias: true });
        window.mobileFrontRenderer.setSize(mobileFrontContainer.clientWidth, mobileFrontContainer.clientHeight);
        mobileFrontContainer.innerHTML = ''; // Clear container
        mobileFrontContainer.appendChild(window.mobileFrontRenderer.domElement);
        
        // Force an initial render
        window.mobileFrontRenderer.render(window.mobileFrontScene, window.mobileFrontCamera);
    }
    
    // Mobile right view
    const mobileRightContainer = document.getElementById('mobile-right-view-canvas');
    if (mobileRightContainer) {
        window.mobileRightScene = new THREE.Scene();
        window.mobileRightScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const mobileRightLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mobileRightLight.position.set(10, 0, 0);
        window.mobileRightScene.add(mobileRightLight);
        window.mobileRightScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        window.mobileRightScene.add(gridHelperYZ.clone());
        window.mobileRightScene.add(mobileRightAxisHelper);
        
        // Calculate aspect ratio for right view
        const mobileRightAspect = mobileRightContainer.clientWidth / mobileRightContainer.clientHeight;
        
        // Create camera with square aspect ratio
        const mobileRightViewSize = 7;
        window.mobileRightCamera = new THREE.OrthographicCamera(
            -mobileRightViewSize * Math.max(mobileRightAspect, 1),
            mobileRightViewSize * Math.max(mobileRightAspect, 1),
            mobileRightViewSize / Math.min(mobileRightAspect, 1),
            -mobileRightViewSize / Math.min(mobileRightAspect, 1),
            0.1, 1000
        );
        window.mobileRightCamera.position.set(10, 0, 0);
        window.mobileRightCamera.lookAt(0, 0, 0);
        
        // Create renderer
        window.mobileRightRenderer = new THREE.WebGLRenderer({ antialias: true });
        window.mobileRightRenderer.setSize(mobileRightContainer.clientWidth, mobileRightContainer.clientHeight);
        mobileRightContainer.innerHTML = ''; // Clear container
        mobileRightContainer.appendChild(window.mobileRightRenderer.domElement);
        
        // Force an initial render
        window.mobileRightRenderer.render(window.mobileRightScene, window.mobileRightCamera);
    }
    
    // Mobile left view
    const mobileLeftContainer = document.getElementById('mobile-left-view-canvas');
    if (mobileLeftContainer) {
        window.mobileLeftScene = new THREE.Scene();
        window.mobileLeftScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const mobileLeftLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mobileLeftLight.position.set(-10, 0, 0);
        window.mobileLeftScene.add(mobileLeftLight);
        window.mobileLeftScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        window.mobileLeftScene.add(gridHelperYZ.clone());
        window.mobileLeftScene.add(mobileLeftAxisHelper);
        
        // Calculate aspect ratio for left view
        const mobileLeftAspect = mobileLeftContainer.clientWidth / mobileLeftContainer.clientHeight;
        
        // Create camera with square aspect ratio
        const mobileLeftViewSize = 7;
        window.mobileLeftCamera = new THREE.OrthographicCamera(
            -mobileLeftViewSize * Math.max(mobileLeftAspect, 1),
            mobileLeftViewSize * Math.max(mobileLeftAspect, 1),
            mobileLeftViewSize / Math.min(mobileLeftAspect, 1),
            -mobileLeftViewSize / Math.min(mobileLeftAspect, 1),
            0.1, 1000
        );
        window.mobileLeftCamera.position.set(-10, 0, 0);
        window.mobileLeftCamera.lookAt(0, 0, 0);
        
        // Create renderer
        window.mobileLeftRenderer = new THREE.WebGLRenderer({ antialias: true });
        window.mobileLeftRenderer.setSize(mobileLeftContainer.clientWidth, mobileLeftContainer.clientHeight);
        mobileLeftContainer.innerHTML = ''; // Clear container
        mobileLeftContainer.appendChild(window.mobileLeftRenderer.domElement);
        
        // Force an initial render
        window.mobileLeftRenderer.render(window.mobileLeftScene, window.mobileLeftCamera);
    }
    
    // Add event listener for the panel becoming visible to handle resize
    const viewPanel = document.getElementById('view-panel');
    if (viewPanel) {
        // Set up a MutationObserver to watch for class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (viewPanel.classList.contains('active')) {
                        // Panel became visible - resize and re-render mobile views after short delay
                        setTimeout(() => resizeMobileViewRenderers(), 100);
                    }
                }
            });
        });
        
        // Start observing the panel for class changes
        observer.observe(viewPanel, { attributes: true });
    }
    
    console.log("Mobile orthographic views initialized successfully");
}

// Helper function to resize and re-render mobile views
function resizeMobileViewRenderers() {
    console.log("Resizing mobile view renderers...");
    
    // Function to update an orthographic camera to maintain square proportions
    function updateMobileOrthographicCamera(camera, container, viewSize = 7) {
        if (!camera || !container) return;
        
        const aspect = container.clientWidth / container.clientHeight;
        
        // Update camera frustum to maintain square grid cells
        camera.left = -viewSize * Math.max(aspect, 1);
        camera.right = viewSize * Math.max(aspect, 1);
        camera.top = viewSize / Math.min(aspect, 1);
        camera.bottom = -viewSize / Math.min(aspect, 1);
        
        camera.updateProjectionMatrix();
    }
    
    // Handle top view
    if (window.mobileTopRenderer) {
        const container = document.getElementById('mobile-top-view-canvas');
        if (container) {
            const width = container.clientWidth || 100;
            const height = container.clientHeight || 100;
            window.mobileTopRenderer.setSize(width, height);
            
            if (window.mobileTopScene && window.mobileTopCamera) {
                // Update camera to maintain square proportions
                updateMobileOrthographicCamera(window.mobileTopCamera, container);
                window.mobileTopRenderer.render(window.mobileTopScene, window.mobileTopCamera);
            }
        }
    }
    
    // Handle front view
    if (window.mobileFrontRenderer) {
        const container = document.getElementById('mobile-front-view-canvas');
        if (container) {
            const width = container.clientWidth || 100;
            const height = container.clientHeight || 100;
            window.mobileFrontRenderer.setSize(width, height);
            
            if (window.mobileFrontScene && window.mobileFrontCamera) {
                // Update camera to maintain square proportions
                updateMobileOrthographicCamera(window.mobileFrontCamera, container);
                window.mobileFrontRenderer.render(window.mobileFrontScene, window.mobileFrontCamera);
            }
        }
    }
    
    // Handle right view
    if (window.mobileRightRenderer) {
        const container = document.getElementById('mobile-right-view-canvas');
        if (container) {
            const width = container.clientWidth || 100;
            const height = container.clientHeight || 100;
            window.mobileRightRenderer.setSize(width, height);
            
            if (window.mobileRightScene && window.mobileRightCamera) {
                // Update camera to maintain square proportions
                updateMobileOrthographicCamera(window.mobileRightCamera, container);
                window.mobileRightRenderer.render(window.mobileRightScene, window.mobileRightCamera);
            }
        }
    }
    
    // Handle left view
    if (window.mobileLeftRenderer) {
        const container = document.getElementById('mobile-left-view-canvas');
        if (container) {
            const width = container.clientWidth || 100;
            const height = container.clientHeight || 100;
            window.mobileLeftRenderer.setSize(width, height);
            
            if (window.mobileLeftScene && window.mobileLeftCamera) {
                // Update camera to maintain square proportions
                updateMobileOrthographicCamera(window.mobileLeftCamera, container);
                window.mobileLeftRenderer.render(window.mobileLeftScene, window.mobileLeftCamera);
            }
        }
    }
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
    } else if (shape.type === 'cylinder') {
        const { radius, height } = shape.dimensions;
        
        // Calculate volume and surface area
        const volume = Math.PI * radius * radius * height;
        const lateralSurfaceArea = 2 * Math.PI * radius * height;
        const baseArea = Math.PI * radius * radius;
        const surfaceArea = lateralSurfaceArea + 2 * baseArea;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Diameter:</strong> ${2 * radius} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units (each base)</p>
            <p><strong>Circumference of Base:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for formulas
        const formulasHTML = `
            <h4>Cylinder Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = πr²h</span>
            <span class="formula">V = π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2πrh + 2πr²</span>
            <span class="formula">SA = 2π × ${radius} × ${height} + 2π × ${radius}² = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Lateral Surface Area:</strong></p>
            <span class="formula">LSA = 2πrh</span>
            <span class="formula">LSA = 2π × ${radius} × ${height} = ${lateralSurfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Base Area:</strong></p>
            <span class="formula">A = πr²</span>
            <span class="formula">A = π × ${radius}² = ${baseArea.toFixed(2)} square units</span>
        `;
        
        // Create HTML for the net diagram
        const netHTML = `
            <svg width="100%" height="350" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Cylinder net showing rectangular lateral surface and two circular bases -->
                <circle cx="110" cy="180" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <rect x="150" y="80" width="${2 * Math.PI * radius * 10}" height="${height * 10}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                
                <circle cx="390" cy="180" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Grid lines for the rectangular surface -->
                ${
                    // Create the grid lines for the cylinder lateral surface
                    (function() {
                        let lines = '';
                        const rectWidth = 2 * Math.PI * radius * 10;
                        const rectHeight = height * 10;
                        const startX = 150;
                        const startY = 80;
                        
                        // Vertical grid lines at intervals
                        for (let i = 1; i < 10; i++) {
                            const x = startX + (rectWidth * i / 10);
                            lines += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + rectHeight}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Horizontal grid lines at intervals
                        for (let i = 1; i < height; i++) {
                            const y = startY + (rectHeight * i / height);
                            lines += `<line x1="${startX}" y1="${y}" x2="${startX + rectWidth}" y2="${y}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Internal grid for the circular bases
                        // Draw radial lines
                        const leftCenter = 110;
                        const rightCenter = 390;
                        const centerY = 180;
                        const baseRadius = radius * 10;
                        
                        for (let i = 0; i < 8; i++) {
                            const angle = (i / 8) * Math.PI * 2;
                            const x1 = leftCenter + baseRadius * Math.cos(angle);
                            const y1 = centerY + baseRadius * Math.sin(angle);
                            const x2 = rightCenter + baseRadius * Math.cos(angle);
                            const y2 = centerY + baseRadius * Math.sin(angle);
                            
                            lines += `<line x1="${leftCenter}" y1="${centerY}" x2="${x1}" y2="${y1}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            lines += `<line x1="${rightCenter}" y1="${centerY}" x2="${x2}" y2="${y2}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Circular grid lines
                        for (let i = 1; i < 3; i++) {
                            const innerRadius = baseRadius * i / 3;
                            lines += `<circle cx="${leftCenter}" cy="${centerY}" r="${innerRadius}" 
                                       fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                            lines += `<circle cx="${rightCenter}" cy="${centerY}" r="${innerRadius}" 
                                       fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        return lines;
                    })()
                }
                
                <!-- Labels -->
                <rect x="80" y="130" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="110" y="142" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base 1</text>
                
                <rect x="240" y="68" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="270" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Lateral Surface</text>
                
                <rect x="360" y="130" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="390" y="142" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base 2</text>
                
                <!-- Folding lines -->
                <line x1="150" y1="80" x2="150" y2="${80 + height * 10}" stroke="#000" stroke-width="1.5" stroke-dasharray="5,3"/>
                <line x1="${150 + 2 * Math.PI * radius * 10}" y1="80" x2="${150 + 2 * Math.PI * radius * 10}" y2="${80 + height * 10}" stroke="#000" stroke-width="1.5" stroke-dasharray="5,3"/>
                
                <!-- Dimensions -->
                <line x1="110" y1="230" x2="110" y2="260" stroke="#000" stroke-width="1"/>
                <line x1="90" y1="245" x2="130" y2="245" stroke="#000" stroke-width="1"/>
                <text x="110" y="265" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <line x1="130" y1="80" x2="130" y2="${80 + height * 10}" stroke="#000" stroke-width="1"/>
                <text x="120" y="${80 + height * 5}" transform="rotate(90, 120, ${80 + height * 5})" text-anchor="middle" font-size="12" fill="#000">h=${height} units</text>
                
                <line x1="150" y1="60" x2="${150 + 2 * Math.PI * radius * 10}" y2="60" stroke="#000" stroke-width="1"/>
                <text x="${150 + Math.PI * radius * 10}" y="50" text-anchor="middle" font-size="12" fill="#000">Circumference = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</text>
            </svg>
            
            <p class="net-description">Net of a cylinder showing the two circular bases (radius ${radius} units) and the rectangular lateral surface (${height} × ${(2 * Math.PI * radius).toFixed(2)} units)</p>
            
            <div class="net-explanation">
                <p><strong>Understanding the Net:</strong> The net of a cylinder consists of:</p>
                <ul>
                    <li>Two identical circular <span class="property-highlight">bases</span> with radius ${radius} units</li>
                    <li>One rectangular <span class="property-highlight">lateral surface</span> with:
                        <ul>
                            <li>Height = cylinder height = ${height} units</li>
                            <li>Width = circumference of base = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</li>
                        </ul>
                    </li>
                </ul>
                <p>When folded along the dashed lines, this net forms a complete cylinder. The lateral surface wraps around to connect the two circular bases.</p>
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
        
        // Generate topology HTML for cylinder
        const topologyHTML = `
            <h4>Cylinder Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A cylinder is a 3D solid with two parallel circular bases connected by a curved lateral surface.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 3 (2 circular bases + 1 curved lateral surface)</li>
                        <li>Number of Edges: 2 circular edges</li>
                        <li>Number of Vertices: 0 (a smooth curved surface has no vertices)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>Cross-sections parallel to the bases are circles</li>
                        <li>Cross-sections through the axis of symmetry are rectangles</li>
                        <li>The cylinder has infinite rotational symmetry around its axis</li>
                        <li>The lateral surface, when unfolded, forms a rectangle</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Applications</div>
                <div class="property-value">
                    <ul>
                        <li>Cylinders are used in many real-world objects like cans, pipes, and tanks</li>
                        <li>Cylindrical containers maximize volume for a given amount of material</li>
                        <li>The cylinder is an example of a surface of revolution (created by rotating a rectangle around an axis)</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update desktop and mobile topology panels
        topologyDiv.innerHTML = topologyHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
    } else if (shape.type === 'cone') {
        const { radius, height } = shape.dimensions;
        
        // Calculate slant height using Pythagorean theorem
        const slantHeight = Math.sqrt(radius * radius + height * height);
        
        // Calculate volume and surface area
        const volume = (1/3) * Math.PI * radius * radius * height;
        const baseArea = Math.PI * radius * radius;
        const lateralSurfaceArea = Math.PI * radius * slantHeight;
        const surfaceArea = lateralSurfaceArea + baseArea;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Slant Height:</strong> ${slantHeight.toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units</p>
            <p><strong>Base Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for formulas
        const formulasHTML = `
            <h4>Cone Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (1/3)πr²h</span>
            <span class="formula">V = (1/3)π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Slant Height:</strong></p>
            <span class="formula">l = √(r² + h²)</span>
            <span class="formula">l = √(${radius}² + ${height}²) = ${slantHeight.toFixed(2)} units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = πr² + πrl</span>
            <span class="formula">SA = πr² + πrl = ${baseArea.toFixed(2)} + ${lateralSurfaceArea.toFixed(2)} = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Lateral Surface Area:</strong></p>
            <span class="formula">LSA = πrl</span>
            <span class="formula">LSA = π × ${radius} × ${slantHeight.toFixed(2)} = ${lateralSurfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Angle of Apex:</strong></p>
            <span class="formula">θ = 2 × tan⁻¹(r/h)</span>
            <span class="formula">θ = 2 × tan⁻¹(${radius}/${height}) = ${(2 * Math.atan(radius/height) * 180 / Math.PI).toFixed(2)}°</span>
        `;
        
        // Create HTML for the net diagram
        const netHTML = `
            <svg width="100%" height="350" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Cone net showing circular base and sector for lateral surface -->
                <circle cx="150" cy="200" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Circular sector for lateral surface -->
                <!-- The central angle of the sector is 2π×r/slant height -->
                <path d="M 350,180 L 350,${180 + slantHeight * 10} A ${radius * 10 * 2 * Math.PI / slantHeight} ${radius * 10 * 2 * Math.PI / slantHeight} 0 0 1 350,180 Z" 
                      fill="#bbdefb" stroke="#2196f3" stroke-width="2" transform="rotate(${-180 * radius / slantHeight}, 350, 180)"/>
                
                <!-- Grid lines for the base -->
                ${
                    // Create grid lines for base
                    (function() {
                        let lines = '';
                        const centerX = 150;
                        const centerY = 200;
                        const baseRadius = radius * 10;
                        
                        // Radial grid lines
                        for (let i = 0; i < 8; i++) {
                            const angle = (i / 8) * Math.PI * 2;
                            const x = centerX + baseRadius * Math.cos(angle);
                            const y = centerY + baseRadius * Math.sin(angle);
                            
                            lines += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Circular grid lines
                        for (let i = 1; i < 4; i++) {
                            const innerRadius = baseRadius * i / 4;
                            lines += `<circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" 
                                       fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        return lines;
                    })()
                }
                
                <!-- Grid lines for sector - curved lines and radial lines -->
                ${
                    // Create grid lines for sector
                    (function() {
                        let lines = '';
                        const centerX = 350;
                        const centerY = 180;
                        const sectorRadius = slantHeight * 10;
                        const angle = 2 * Math.PI * radius / slantHeight;
                        
                        // Radial grid lines for sector
                        for (let i = 1; i < 6; i++) {
                            const subAngle = angle * i / 6 - angle/2;
                            const x = centerX + sectorRadius * Math.sin(subAngle);
                            const y = centerY + sectorRadius * Math.cos(subAngle);
                            
                            lines += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Circular arc grid lines for sector
                        for (let i = 1; i < 5; i++) {
                            const innerRadius = sectorRadius * i / 5;
                            const arcStart = centerX + innerRadius * Math.sin(-angle/2);
                            const arcStartY = centerY + innerRadius * Math.cos(-angle/2);
                            const arcEnd = centerX + innerRadius * Math.sin(angle/2);
                            const arcEndY = centerY + innerRadius * Math.cos(angle/2);
                            
                            lines += `<path d="M ${arcStart},${arcStartY} A ${innerRadius} ${innerRadius} 0 0 1 ${arcEnd},${arcEndY}" 
                                       fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        return lines;
                    })()
                }
                
                <!-- Labels -->
                <rect x="120" y="150" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="162" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base</text>
                
                <rect x="320" y="230" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="350" y="242" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Lateral Surface</text>
                
                <!-- Dimensions -->
                <line x1="150" y1="250" x2="150" y2="280" stroke="#000" stroke-width="1"/>
                <line x1="130" y1="265" x2="170" y2="265" stroke="#000" stroke-width="1"/>
                <text x="150" y="295" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <line x1="350" y1="180" x2="${350 + slantHeight * 10 * 0.5}" y2="${180 + slantHeight * 10 * 0.866}" stroke="#000" stroke-width="1" stroke-dasharray="5,3"/>
                <text x="${350 + slantHeight * 5 * 0.5}" y="${180 + slantHeight * 5 * 0.866 - 10}" text-anchor="middle" font-size="12" fill="#000">l=${slantHeight.toFixed(2)} units</text>
                
                <line x1="200" y1="200" x2="300" y2="200" stroke="#000" stroke-width="1"/>
                <text x="250" y="190" text-anchor="middle" font-size="12" fill="#000">Cone height = ${height} units</text>
            </svg>
            
            <p class="net-description">Net of a cone showing the circular base (radius ${radius} units) and the sector that forms the lateral surface</p>
            
            <div class="net-explanation">
                <p><strong>Understanding the Net:</strong> The net of a cone consists of:</p>
                <ul>
                    <li>One circular <span class="property-highlight">base</span> with radius ${radius} units</li>
                    <li>One circular sector forming the <span class="property-highlight">lateral surface</span> with:
                        <ul>
                            <li>Radius = slant height = ${slantHeight.toFixed(2)} units</li>
                            <li>Arc length = circumference of base = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</li>
                        </ul>
                    </li>
                </ul>
                <p>When the sector is folded around to form a cone, the straight edges of the sector meet, and the curved edge forms the circular base of the cone. The apex angle of the cone is ${(2 * Math.atan(radius/height) * 180 / Math.PI).toFixed(2)}°.</p>
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
        
        // Generate topology HTML for cone
        const topologyHTML = `
            <h4>Cone Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A cone is a 3D solid with a circular base and a single vertex (apex) connected to every point on the base by straight line segments.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 2 (1 circular base + 1 curved lateral surface)</li>
                        <li>Number of Edges: 1 circular edge</li>
                        <li>Number of Vertices: 1 (the apex)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Cross-Sections</div>
                <div class="property-value">
                    <ul>
                        <li>Parallel to the base: circles (decreasing in size toward the apex)</li>
                        <li>Through the apex and center of base: isosceles triangles</li>
                        <li>At an angle: ellipses, parabolas, or hyperbolas (conic sections)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>The apex is equidistant from any point on the base perimeter when measured along the lateral surface</li>
                        <li>The cone has rotational symmetry around its central axis</li>
                        <li>The lateral surface, when unfolded, forms a sector of a circle</li>
                        <li>Angle at the apex: ${(2 * Math.atan(radius/height) * 180 / Math.PI).toFixed(2)}°</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update desktop and mobile topology panels
        topologyDiv.innerHTML = topologyHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
    } else if (shape.type === 'sphere') {
        const { radius } = shape.dimensions;
        
        // Calculate volume and surface area
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
        const greatCircleArea = Math.PI * Math.pow(radius, 2);
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Diameter:</strong> ${2 * radius} units</p>
            <p><strong>Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Great Circle Area:</strong> ${greatCircleArea.toFixed(2)} square units</p>
            <p><strong>Great Circle Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for formulas
        const formulasHTML = `
            <h4>Sphere Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (4/3)πr³</span>
            <span class="formula">V = (4/3)π × ${radius}³ = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 4πr²</span>
            <span class="formula">SA = 4π × ${radius}² = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Great Circle:</strong></p>
            <span class="formula">Area = πr²</span>
            <span class="formula">Area = π × ${radius}² = ${greatCircleArea.toFixed(2)} square units</span>
            
            <p><strong>Great Circle Circumference:</strong></p>
            <span class="formula">C = 2πr</span>
            <span class="formula">C = 2π × ${radius} = ${(2 * Math.PI * radius).toFixed(2)} units</span>
            
            <div class="educational-note">
                <p>A sphere is the only 3D shape that has a fixed width in all directions. The surface area of a sphere is exactly 4 times the area of its great circle.</p>
            </div>
        `;
        
        // Create HTML for sphere projection (since a sphere doesn't have a traditional net)
        const netHTML = `
            <svg width="100%" height="400" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Sphere projections: globe view and stereographic projection -->
                
                <!-- 3D globe representation -->
                <circle cx="150" cy="200" r="${radius * 10}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Equator line -->
                <ellipse cx="150" cy="200" rx="${radius * 10}" ry="${radius * 3}" stroke="#2196f3" stroke-width="1.5" fill="none"/>
                
                <!-- Prime meridian -->
                <line x1="150" y1="${200 - radius * 10}" x2="150" y2="${200 + radius * 10}" stroke="#2196f3" stroke-width="1.5"/>
                
                <!-- Grid lines for latitude and longitude -->
                ${
                    // Create grid lines for the globe
                    (function() {
                        let lines = '';
                        const centerX = 150;
                        const centerY = 200;
                        const sphereRadius = radius * 10;
                        
                        // Latitude lines (parallel to equator)
                        for (let i = 1; i < 4; i++) {
                            const yOffset = sphereRadius * i / 4;
                            lines += `<ellipse cx="${centerX}" cy="${centerY - yOffset}" rx="${sphereRadius}" ry="${sphereRadius * 0.3 * (4-i)/4}" 
                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                            lines += `<ellipse cx="${centerX}" cy="${centerY + yOffset}" rx="${sphereRadius}" ry="${sphereRadius * 0.3 * (4-i)/4}" 
                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                        }
                        
                        // Longitude lines (meridians)
                        for (let i = 1; i < 6; i++) {
                            const angle = (i / 6) * Math.PI;
                            const x1 = centerX + sphereRadius * Math.cos(angle);
                            const y1 = centerY - sphereRadius * 0.3 * Math.sin(angle);
                            const x2 = centerX + sphereRadius * Math.cos(angle + Math.PI);
                            const y2 = centerY - sphereRadius * 0.3 * Math.sin(angle + Math.PI);
                            
                            lines += `<ellipse cx="${centerX}" cy="${centerY}" rx="${sphereRadius * Math.sin(angle)}" ry="${sphereRadius}" 
                                      transform="rotate(${90 - i * 30}, ${centerX}, ${centerY})"
                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                        }
                        
                        return lines;
                    })()
                }
                
                <!-- Highlight great circle -->
                <ellipse cx="150" cy="200" rx="${radius * 10}" ry="${radius * 10}" stroke="#e74c3c" stroke-width="1.5" fill="none"/>
                
                <!-- Map projection (mercator-style) -->
                <rect x="300" y="${200 - radius * 10}" width="${2 * Math.PI * radius * 5}" height="${2 * radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Grid lines for map projection -->
                ${
                    // Create grid lines for the map projection
                    (function() {
                        let lines = '';
                        const startX = 300;
                        const startY = 200 - radius * 10;
                        const width = 2 * Math.PI * radius * 5;
                        const height = 2 * radius * 10;
                        
                        // Latitude lines
                        for (let i = 1; i < 9; i++) {
                            const y = startY + height * i / 10;
                            lines += `<line x1="${startX}" y1="${y}" x2="${startX + width}" y2="${y}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        // Longitude lines
                        for (let i = 1; i < 12; i++) {
                            const x = startX + width * i / 12;
                            lines += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + height}" 
                                       stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        }
                        
                        return lines;
                    })()
                }
                
                <!-- Labels -->
                <rect x="120" y="140" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="152" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Sphere</text>
                
                <rect x="120" y="165" width="120" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="177" text-anchor="start" font-size="12" font-weight="normal" fill="#e74c3c">Great Circle</text>
                
                <rect x="360" y="140" width="120" height="16" fill="white" fill-opacity="0.8"/>
                <text x="410" y="152" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Map Projection</text>
                
                <!-- Dimensions -->
                <line x1="150" y1="${200 + radius * 10 + 10}" x2="150" y2="${200 + radius * 10 + 30}" stroke="#000" stroke-width="1"/>
                <line x1="130" y1="${200 + radius * 10 + 20}" x2="170" y2="${200 + radius * 10 + 20}" stroke="#000" stroke-width="1"/>
                <text x="150" y="${200 + radius * 10 + 45}" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <line x1="300" y1="${200 + radius * 10 + 10}" x2="${300 + 2 * Math.PI * radius * 5}" y2="${200 + radius * 10 + 10}" stroke="#000" stroke-width="1"/>
                <text x="${300 + Math.PI * radius * 5}" y="${200 + radius * 10 + 25}" text-anchor="middle" font-size="12" fill="#000">Circumference = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</text>
            </svg>
            
            <p class="net-description">Unlike polyhedra, a sphere doesn't have a flat net. Instead, we show a globe view and a map projection.</p>
            
            <div class="net-explanation">
                <p><strong>Understanding Sphere Projections:</strong></p>
                <ul>
                    <li>A sphere is a perfectly round geometrical object in 3D space</li>
                    <li>All points on the surface are equidistant from the center (radius = ${radius} units)</li>
                    <li>The red circle shows a "great circle" - any circle on the sphere with the same center and radius as the sphere</li>
                    <li>The rectangular map shows a flattened projection of the sphere's surface</li>
                </ul>
                <p>Unlike polyhedra, spheres cannot be unfolded into a flat net without distortion. Map projections help visualize the sphere's surface in 2D, but always introduce some form of distortion (either in area, angle, or distance).</p>
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
        
        // Generate topology HTML for sphere
        const topologyHTML = `
            <h4>Sphere Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A sphere is a perfectly round geometrical object in 3D space where all points on the surface are equidistant from the center.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 1 continuous curved surface</li>
                        <li>Number of Edges: 0</li>
                        <li>Number of Vertices: 0</li>
                        <li>Genus: 0 (a sphere has no holes)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>A sphere has the smallest surface area among all shapes enclosing a given volume</li>
                        <li>All cross-sections through a sphere's center are great circles with radius = ${radius} units</li>
                        <li>Any cross-section of a sphere is a circle (not necessarily a great circle)</li>
                        <li>A sphere has infinite rotational symmetry around any diameter</li>
                        <li>The shadow of a sphere is always a circle, regardless of light direction</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Interesting Facts</div>
                <div class="property-value">
                    <ul>
                        <li>A sphere is a special case of an ellipsoid where all three radii are equal</li>
                        <li>The Euler characteristic of a sphere is 2 (V - E + F = 2)</li>
                        <li>A sphere is the only shape with a constant width in all directions</li>
                        <li>The surface area of a sphere is exactly 4 times the area of its great circle</li>
                    </ul>
                </div>
            </div>
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
    
    document.getElementById('rectangularPrism-btn').addEventListener('click', () => {
        loadShape('rectangularPrism');
        setActiveButton('rectangularPrism-btn');
    });
    
    document.getElementById('cube-btn').addEventListener('click', () => {
        loadShape('cube');
        setActiveButton('cube-btn');
    });
    
    document.getElementById('cylinder-btn').addEventListener('click', () => {
        loadShape('cylinder');
        setActiveButton('cylinder-btn');
    });
    
    document.getElementById('cone-btn').addEventListener('click', () => {
        loadShape('cone');
        setActiveButton('cone-btn');
    });
    
    document.getElementById('sphere-btn').addEventListener('click', () => {
        loadShape('sphere');
        setActiveButton('sphere-btn');
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
        } else if (description.match(/cylinder/i)) {
            shapeType = 'cylinder';
        } else if (description.match(/cone/i)) {
            shapeType = 'cone';
        } else if (description.match(/sphere|ball|circle/i)) {
            shapeType = 'sphere';
        }
        
        if (!shapeType) {
            // Try to infer from other clues
            if (description.match(/triangle/i) && description.match(/base/i)) {
                shapeType = 'triangularPrism';
            } else if (description.match(/rectangle/i) && description.match(/base/i)) {
                shapeType = 'rectangularPrism';
            } else if (description.match(/equal\s*sides/i) || description.match(/all\s*sides\s*equal/i)) {
                shapeType = 'cube';
            } else if (description.match(/circular\s*base/i) || description.match(/round/i)) {
                shapeType = 'cylinder';
            } else if (description.match(/pointed|apex/i)) {
                shapeType = 'cone';
            } else if (description.match(/round|circular/i)) {
                shapeType = 'sphere';
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
        
        const radiusMatch = description.match(/(\d+)\s*units?\s*(?:radius)/i) || 
                          description.match(/radius\s*(?:of|is|:)?\s*(\d+)\s*units?/i) ||
                          description.match(/(\d+)\s*units?\s*in\s*radius/i);
        
        const diameterMatch = description.match(/(\d+)\s*units?\s*(?:diameter)/i) || 
                            description.match(/diameter\s*(?:of|is|:)?\s*(\d+)\s*units?/i) ||
                            description.match(/(\d+)\s*units?\s*in\s*diameter/i);
        
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
            
        } else if (shapeType === 'cylinder') {
            const height = heightMatch ? parseInt(heightMatch[1]) : 
                        (allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 4);
            
            let radius;
            if (radiusMatch) {
                radius = parseInt(radiusMatch[1]);
            } else if (diameterMatch) {
                radius = parseInt(diameterMatch[1]) / 2;
            } else {
                radius = allNumbers && allNumbers.length > 1 ? parseInt(allNumbers[1]) : 2;
            }
            
            const customShape = {
                type: 'cylinder',
                height: height,
                radius: radius,
                radiusSegments: 32
            };
            
            createShape(customShape);
            return true;
            
        } else if (shapeType === 'cone') {
            const height = heightMatch ? parseInt(heightMatch[1]) : 
                        (allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 4);
            
            let radius;
            if (radiusMatch) {
                radius = parseInt(radiusMatch[1]);
            } else if (diameterMatch) {
                radius = parseInt(diameterMatch[1]) / 2;
            } else {
                radius = allNumbers && allNumbers.length > 1 ? parseInt(allNumbers[1]) : 2;
            }
            
            const customShape = {
                type: 'cone',
                height: height,
                radius: radius,
                radiusSegments: 32
            };
            
            createShape(customShape);
            return true;
            
        } else if (shapeType === 'sphere') {
            let radius;
            if (radiusMatch) {
                radius = parseInt(radiusMatch[1]);
            } else if (diameterMatch) {
                radius = parseInt(diameterMatch[1]) / 2;
            } else {
                radius = allNumbers && allNumbers.length > 0 ? parseInt(allNumbers[0]) : 2;
            }
            
            const customShape = {
                type: 'sphere',
                radius: radius,
                widthSegments: 32,
                heightSegments: 16
            };
            
            createShape(customShape);
            return true;
            
        } else {
            // Attempt to infer shape from numbers available
            if (allNumbers && allNumbers.length === 1) {
                // One number = probably a sphere or cube
                if (description.match(/round|circle/i)) {
                    const customShape = {
                        type: 'sphere',
                        radius: parseInt(allNumbers[0]),
                        widthSegments: 32,
                        heightSegments: 16
                    };
                    createShape(customShape);
                } else {
                    const customShape = {
                        type: 'cube',
                        size: parseInt(allNumbers[0])
                    };
                    createShape(customShape);
                }
                return true;
            } else if (allNumbers && allNumbers.length === 2) {
                // Two numbers = height and radius, could be cylinder or cone
                if (description.match(/point|tip|apex/i)) {
                    const customShape = {
                        type: 'cone',
                        height: parseInt(allNumbers[0]),
                        radius: parseInt(allNumbers[1]),
                        radiusSegments: 32
                    };
                    createShape(customShape);
                } else {
                    const customShape = {
                        type: 'cylinder',
                        height: parseInt(allNumbers[0]),
                        radius: parseInt(allNumbers[1]),
                        radiusSegments: 32
                    };
                    createShape(customShape);
                }
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
            }
            
            alert('Unsupported shape type or not enough information. Please specify a shape type like cube, cylinder, cone, sphere with dimensions.');
            return false;
        }
    } catch (error) {
        console.error('Error parsing shape description:', error);
        alert('Could not parse shape description. Please try again with a format like "Cylinder 4 units high with radius 2"');
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
                
            case 'cylinder':
                currentShape = createCylinder(
                    shapeDef.radius,
                    shapeDef.height,
                    shapeDef.radiusSegments
                );
                break;
                
            case 'cone':
                currentShape = createCone(
                    shapeDef.radius,
                    shapeDef.height,
                    shapeDef.radiusSegments
                );
                break;
                
            case 'sphere':
                currentShape = createSphere(
                    shapeDef.radius,
                    shapeDef.widthSegments,
                    shapeDef.heightSegments
                );
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
        
        // Add the shape to mobile scenes if available
        if (window.mobileTopScene) window.mobileTopScene.add(currentShape.topMesh.clone());
        if (window.mobileFrontScene) window.mobileFrontScene.add(currentShape.frontMesh.clone());
        if (window.mobileRightScene) window.mobileRightScene.add(currentShape.rightMesh.clone());
        if (window.mobileLeftScene) window.mobileLeftScene.add(currentShape.leftMesh.clone());
        
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

// Create a cylinder
function createCylinder(radius, height, radiusSegments = 32) {
    // Create the geometry
    const geometry = new THREE.CylinderGeometry(radius, radius, height, radiusSegments);
    
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
    
    // Add grid lines to show dimensions
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Create circular grid lines
    const linePositions = [];
    
    // Horizontal circles at different heights
    for (let h = -height/2; h <= height/2; h += height/10) {
        for (let i = 0; i < radiusSegments; i++) {
            const theta1 = (i / radiusSegments) * Math.PI * 2;
            const theta2 = ((i + 1) / radiusSegments) * Math.PI * 2;
            
            const x1 = radius * Math.cos(theta1);
            const z1 = radius * Math.sin(theta1);
            const x2 = radius * Math.cos(theta2);
            const z2 = radius * Math.sin(theta2);
            
            linePositions.push(x1, h, z1, x2, h, z2);
        }
    }
    
    // Vertical lines
    for (let i = 0; i < radiusSegments; i++) {
        const theta = (i / radiusSegments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        linePositions.push(x, -height/2, z, x, height/2, z);
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create meshes for orthographic views
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
    
    // Set correct rotations for orthographic views
    // No rotation needed for top view of cylinder
    topMesh.rotation.x = Math.PI / 2;
    topEdges.rotation.x = Math.PI / 2;
    
    frontMesh.rotation.x = 0;
    frontEdges.rotation.x = 0;
    
    rightMesh.rotation.y = Math.PI / 2;
    rightEdges.rotation.y = Math.PI / 2;
    
    leftMesh.rotation.y = -Math.PI / 2;
    leftEdges.rotation.y = -Math.PI / 2;
    
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
        dimensions: { radius, height },
        type: 'cylinder'
    };
}

// Create a cone
function createCone(radius, height, radiusSegments = 32) {
    // Create the geometry
    const geometry = new THREE.ConeGeometry(radius, height, radiusSegments);
    
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
    
    // Add grid lines to show dimensions
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Create circular grid lines
    const linePositions = [];
    
    // Horizontal circles at different heights
    for (let h = -height/2; h <= height/2; h += height/8) {
        // Calculate the radius at this height
        const heightRatio = (h + height/2) / height;
        const radiusAtHeight = radius * (1 - heightRatio);
        
        if (radiusAtHeight > 0.01) {
            for (let i = 0; i < radiusSegments; i++) {
                const theta1 = (i / radiusSegments) * Math.PI * 2;
                const theta2 = ((i + 1) / radiusSegments) * Math.PI * 2;
                
                const x1 = radiusAtHeight * Math.cos(theta1);
                const z1 = radiusAtHeight * Math.sin(theta1);
                const x2 = radiusAtHeight * Math.cos(theta2);
                const z2 = radiusAtHeight * Math.sin(theta2);
                
                linePositions.push(x1, h, z1, x2, h, z2);
            }
        }
    }
    
    // Vertical lines from base to apex
    for (let i = 0; i < radiusSegments; i += 4) {
        const theta = (i / radiusSegments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        linePositions.push(x, -height/2, z, 0, height/2, 0);
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create meshes for orthographic views
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
    
    // Set correct rotations for orthographic views
    topMesh.rotation.x = Math.PI / 2;
    topEdges.rotation.x = Math.PI / 2;
    
    // No rotation needed for front view
    
    rightMesh.rotation.y = Math.PI / 2;
    rightEdges.rotation.y = Math.PI / 2;
    
    leftMesh.rotation.y = -Math.PI / 2;
    leftEdges.rotation.y = -Math.PI / 2;
    
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
        dimensions: { radius, height },
        type: 'cone'
    };
}

// Create a sphere
function createSphere(radius, widthSegments = 32, heightSegments = 16) {
    // Create the geometry
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    
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
    
    // Add grid lines to show dimensions
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Create grid lines for latitude and longitude
    const linePositions = [];
    
    // Latitude lines (horizontal circles)
    const latitudeSteps = 8;
    for (let i = 1; i < latitudeSteps; i++) {
        const phi = (i / latitudeSteps) * Math.PI;
        const radiusAtPhi = radius * Math.sin(phi);
        const y = radius * Math.cos(phi);
        
        for (let j = 0; j < widthSegments; j++) {
            const theta1 = (j / widthSegments) * Math.PI * 2;
            const theta2 = ((j + 1) / widthSegments) * Math.PI * 2;
            
            const x1 = radiusAtPhi * Math.cos(theta1);
            const z1 = radiusAtPhi * Math.sin(theta1);
            const x2 = radiusAtPhi * Math.cos(theta2);
            const z2 = radiusAtPhi * Math.sin(theta2);
            
            linePositions.push(x1, y, z1, x2, y, z2);
        }
    }
    
    // Longitude lines (vertical half-circles)
    const longitudeSteps = 12;
    for (let i = 0; i < longitudeSteps; i++) {
        const theta = (i / longitudeSteps) * Math.PI * 2;
        
        for (let j = 0; j < heightSegments; j++) {
            const phi1 = (j / heightSegments) * Math.PI;
            const phi2 = ((j + 1) / heightSegments) * Math.PI;
            
            const y1 = radius * Math.cos(phi1);
            const y2 = radius * Math.cos(phi2);
            
            const radiusAtPhi1 = radius * Math.sin(phi1);
            const radiusAtPhi2 = radius * Math.sin(phi2);
            
            const x1 = radiusAtPhi1 * Math.cos(theta);
            const z1 = radiusAtPhi1 * Math.sin(theta);
            const x2 = radiusAtPhi2 * Math.cos(theta);
            const z2 = radiusAtPhi2 * Math.sin(theta);
            
            linePositions.push(x1, y1, z1, x2, y2, z2);
        }
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create meshes for orthographic views
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
        dimensions: { radius },
        type: 'sphere'
    };
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
        // Clear from main scene
        mainScene.remove(currentShape.mainMesh);
        mainScene.remove(currentShape.wireframe);
        
        // Clear from desktop orthographic scenes
        if (topScene) topScene.remove(currentShape.topMesh);
        if (frontScene) frontScene.remove(currentShape.frontMesh);
        if (rightScene) rightScene.remove(currentShape.rightMesh);
        if (leftScene) leftScene.remove(currentShape.leftMesh);
        
        // Clear from mobile scenes if they exist
        if (window.mobileTopScene) {
            window.mobileTopScene.children = window.mobileTopScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light;
            });
        }
        
        if (window.mobileFrontScene) {
            window.mobileFrontScene.children = window.mobileFrontScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light;
            });
        }
        
        if (window.mobileRightScene) {
            window.mobileRightScene.children = window.mobileRightScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light;
            });
        }
        
        if (window.mobileLeftScene) {
            window.mobileLeftScene.children = window.mobileLeftScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light;
            });
        }
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
    
    // Update desktop cameras
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
    
    // Update mobile cameras
    if (window.mobileTopCamera) {
        window.mobileTopCamera.left = -viewSize;
        window.mobileTopCamera.right = viewSize;
        window.mobileTopCamera.top = viewSize;
        window.mobileTopCamera.bottom = -viewSize;
        window.mobileTopCamera.updateProjectionMatrix();
    }
    
    if (window.mobileFrontCamera) {
        window.mobileFrontCamera.left = -viewSize;
        window.mobileFrontCamera.right = viewSize;
        window.mobileFrontCamera.top = viewSize;
        window.mobileFrontCamera.bottom = -viewSize;
        window.mobileFrontCamera.updateProjectionMatrix();
    }
    
    if (window.mobileRightCamera) {
        window.mobileRightCamera.left = -viewSize;
        window.mobileRightCamera.right = viewSize;
        window.mobileRightCamera.top = viewSize;
        window.mobileRightCamera.bottom = -viewSize;
        window.mobileRightCamera.updateProjectionMatrix();
    }
    
    if (window.mobileLeftCamera) {
        window.mobileLeftCamera.left = -viewSize;
        window.mobileLeftCamera.right = viewSize;
        window.mobileLeftCamera.top = viewSize;
        window.mobileLeftCamera.bottom = -viewSize;
        window.mobileLeftCamera.updateProjectionMatrix();
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
    
    // Update main view
    mainCamera.aspect = container.clientWidth / container.clientHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(container.clientWidth, container.clientHeight);
    
    // Function to update an orthographic camera to maintain square proportions
    function updateOrthographicCamera(camera, container, viewSize = 7) {
        if (!camera || !container) return;
        
        const aspect = container.clientWidth / container.clientHeight;
        
        // Update camera frustum to maintain square grid cells
        camera.left = -viewSize * Math.max(aspect, 1);
        camera.right = viewSize * Math.max(aspect, 1);
        camera.top = viewSize / Math.min(aspect, 1);
        camera.bottom = -viewSize / Math.min(aspect, 1);
        
        camera.updateProjectionMatrix();
    }
    
    // Update desktop orthographic views if they exist
    if (topRenderer) {
        const topContainer = document.getElementById('top-view-canvas');
        if (topContainer) {
            topRenderer.setSize(topContainer.clientWidth, topContainer.clientHeight);
            updateOrthographicCamera(topCamera, topContainer);
        }
    }
    
    if (frontRenderer) {
        const frontContainer = document.getElementById('front-view-canvas');
        if (frontContainer) {
            frontRenderer.setSize(frontContainer.clientWidth, frontContainer.clientHeight);
            updateOrthographicCamera(frontCamera, frontContainer);
        }
    }
    
    if (rightRenderer) {
        const rightContainer = document.getElementById('right-view-canvas');
        if (rightContainer) {
            rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
            updateOrthographicCamera(rightCamera, rightContainer);
        }
    }
    
    if (leftRenderer) {
        const leftContainer = document.getElementById('left-view-canvas');
        if (leftContainer) {
            leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
            updateOrthographicCamera(leftCamera, leftContainer);
        }
    }
    
    // Update mobile orthographic views if they exist
    if (window.mobileTopRenderer && window.mobileTopCamera) {
        const mobileTopContainer = document.getElementById('mobile-top-view-canvas');
        if (mobileTopContainer) {
            window.mobileTopRenderer.setSize(mobileTopContainer.clientWidth, mobileTopContainer.clientHeight);
            updateOrthographicCamera(window.mobileTopCamera, mobileTopContainer);
        }
    }
    
    if (window.mobileFrontRenderer && window.mobileFrontCamera) {
        const mobileFrontContainer = document.getElementById('mobile-front-view-canvas');
        if (mobileFrontContainer) {
            window.mobileFrontRenderer.setSize(mobileFrontContainer.clientWidth, mobileFrontContainer.clientHeight);
            updateOrthographicCamera(window.mobileFrontCamera, mobileFrontContainer);
        }
    }
    
    if (window.mobileRightRenderer && window.mobileRightCamera) {
        const mobileRightContainer = document.getElementById('mobile-right-view-canvas');
        if (mobileRightContainer) {
            window.mobileRightRenderer.setSize(mobileRightContainer.clientWidth, mobileRightContainer.clientHeight);
            updateOrthographicCamera(window.mobileRightCamera, mobileRightContainer);
        }
    }
    
    if (window.mobileLeftRenderer && window.mobileLeftCamera) {
        const mobileLeftContainer = document.getElementById('mobile-left-view-canvas');
        if (mobileLeftContainer) {
            window.mobileLeftRenderer.setSize(mobileLeftContainer.clientWidth, mobileLeftContainer.clientHeight);
            updateOrthographicCamera(window.mobileLeftCamera, mobileLeftContainer);
        }
    }
    
    // Trigger a render to update all views immediately
    if (mainRenderer && mainScene && mainCamera) {
        mainRenderer.render(mainScene, mainCamera);
    }
    
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
        
        // Render mobile orthographic views
        if (window.mobileTopRenderer && window.mobileTopScene && window.mobileTopCamera) {
            window.mobileTopRenderer.render(window.mobileTopScene, window.mobileTopCamera);
        }
        
        if (window.mobileFrontRenderer && window.mobileFrontScene && window.mobileFrontCamera) {
            window.mobileFrontRenderer.render(window.mobileFrontScene, window.mobileFrontCamera);
        }
        
        if (window.mobileRightRenderer && window.mobileRightScene && window.mobileRightCamera) {
            window.mobileRightRenderer.render(window.mobileRightScene, window.mobileRightCamera);
        }
        
        if (window.mobileLeftRenderer && window.mobileLeftScene && window.mobileLeftCamera) {
            window.mobileLeftRenderer.render(window.mobileLeftScene, window.mobileLeftCamera);
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