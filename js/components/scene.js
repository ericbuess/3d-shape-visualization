// Scene management functions

// Global scene variables
let mainScene, mainCamera, mainRenderer, mainControls;
let topScene, topCamera, topRenderer;
let frontScene, frontCamera, frontRenderer;
let rightScene, rightCamera, rightRenderer;
let leftScene, leftCamera, leftRenderer;
let currentShape = null;

// Main initialization function
export function init() {
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
        -topViewSize,
        topViewSize,
        topViewSize,
        -topViewSize,
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
        -frontViewSize,
        frontViewSize,
        frontViewSize,
        -frontViewSize,
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
        -rightViewSize,
        rightViewSize,
        rightViewSize,
        -rightViewSize,
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
        -leftViewSize,
        leftViewSize,
        leftViewSize,
        -leftViewSize,
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
            -mobileTopViewSize,
            mobileTopViewSize,
            mobileTopViewSize,
            -mobileTopViewSize,
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
            -mobileFrontViewSize,
            mobileFrontViewSize,
            mobileFrontViewSize,
            -mobileFrontViewSize,
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
            -mobileRightViewSize,
            mobileRightViewSize,
            mobileRightViewSize,
            -mobileRightViewSize,
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
            -mobileLeftViewSize,
            mobileLeftViewSize,
            mobileLeftViewSize,
            -mobileLeftViewSize,
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
    
    // Add event listeners for panels becoming visible to handle resize
    const viewPanel = document.getElementById('view-panel');
    const projectionsPanel = document.getElementById('projections-panel');
    
    function setupPanelObserver(panel) {
        if (panel) {
            // Set up a MutationObserver to watch for class changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                        if (panel.classList.contains('active') && panel.style.display !== 'none') {
                            // Panel became visible - resize and re-render mobile views with multiple attempts
                            setTimeout(() => resizeMobileViewRenderers(), 100);
                            setTimeout(() => resizeMobileViewRenderers(), 300);
                            setTimeout(() => resizeMobileViewRenderers(), 500);
                            setTimeout(() => resizeMobileViewRenderers(), 800);
                        }
                    }
                });
            });
            
            // Start observing the panel for class and style changes
            observer.observe(panel, { attributes: true });
            
            // Also attach direct event listeners for display changes
            panel.addEventListener('transitionend', () => {
                if (panel.classList.contains('active') && panel.style.display !== 'none') {
                    // Trigger multiple resize attempts on transition end
                    setTimeout(() => resizeMobileViewRenderers(), 100);
                    setTimeout(() => resizeMobileViewRenderers(), 300);
                    setTimeout(() => resizeMobileViewRenderers(), 600);
                }
            });
            
            // Add click handler to ensure renderers update when panel is activated
            panel.querySelector('.mobile-panel-title')?.addEventListener('click', () => {
                if (panel.classList.contains('active')) {
                    setTimeout(() => resizeMobileViewRenderers(), 100);
                    setTimeout(() => resizeMobileViewRenderers(), 500);
                }
            });
        }
    }
    
    // Set up observers for both panels
    setupPanelObserver(viewPanel);
    setupPanelObserver(projectionsPanel);
    
    // Also handle the mobile icon click events to ensure views get refreshed
    document.getElementById('projections-icon')?.addEventListener('click', () => {
        setTimeout(() => resizeMobileViewRenderers(), 100);
        setTimeout(() => resizeMobileViewRenderers(), 300);
        setTimeout(() => resizeMobileViewRenderers(), 600);
    });
    
    document.getElementById('view-icon')?.addEventListener('click', () => {
        setTimeout(() => resizeMobileViewRenderers(), 100);
        setTimeout(() => resizeMobileViewRenderers(), 300);
        setTimeout(() => resizeMobileViewRenderers(), 600);
    });
    
    console.log("Mobile orthographic views initialized successfully");
}

// Helper function to resize and re-render mobile views
function resizeMobileViewRenderers() {
    console.log("Resizing mobile view renderers...");
    
    // Function to update an orthographic camera to maintain square proportions
    function updateMobileOrthographicCamera(camera, container, viewSize = 7) {
        if (!camera || !container) return;
        
        // Keep camera frustum as a perfect square regardless of container dimensions
        camera.left = -viewSize;
        camera.right = viewSize;
        camera.top = viewSize;
        camera.bottom = -viewSize;
        
        camera.updateProjectionMatrix();
    }
    
    // Force renderers to refresh their grid and axis helpers
    function refreshRendererScene(renderer, scene, camera) {
        if (renderer && scene && camera) {
            // Force a render to update the view with the grid and axis helpers
            renderer.render(scene, camera);
        }
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
                refreshRendererScene(window.mobileTopRenderer, window.mobileTopScene, window.mobileTopCamera);
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
                refreshRendererScene(window.mobileFrontRenderer, window.mobileFrontScene, window.mobileFrontCamera);
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
                refreshRendererScene(window.mobileRightRenderer, window.mobileRightScene, window.mobileRightCamera);
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
                refreshRendererScene(window.mobileLeftRenderer, window.mobileLeftScene, window.mobileLeftCamera);
            }
        }
    }
}

// Handle window resize
export function onWindowResize() {
    const container = document.getElementById('canvas-container');
    
    // Update main view
    if (mainCamera && mainRenderer) {
        mainCamera.aspect = container.clientWidth / container.clientHeight;
        mainCamera.updateProjectionMatrix();
        mainRenderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    // Function to update an orthographic camera to maintain square proportions
    function updateOrthographicCamera(camera, container, viewSize = 7) {
        if (!camera || !container) return;
        
        // Keep camera frustum as a perfect square regardless of container dimensions
        camera.left = -viewSize;
        camera.right = viewSize;
        camera.top = viewSize;
        camera.bottom = -viewSize;
        
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
    renderAllViews();
}

// Render all views
export function renderAllViews() {
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
export function animate() {
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
        renderAllViews();
        
        // Render mobile orthographic views - check both info panel and projections panel
        const infoPanel = document.getElementById('info-panel');
        const projectionsPanel = document.getElementById('projections-panel');
        
        // Check if either panel that contains views is visible
        const isInfoPanelActive = infoPanel && 
                                 infoPanel.style.display !== 'none' && 
                                 infoPanel.classList.contains('active');
                                 
        const isProjectionsPanelActive = projectionsPanel && 
                                        projectionsPanel.style.display !== 'none' && 
                                        projectionsPanel.classList.contains('active');
        
        if (isInfoPanelActive || isProjectionsPanelActive) {
            // A panel with views is visible, render the mobile views
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
        }
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
    
    // Check on every frame that panels are hidden if not active
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel && !infoPanel.classList.contains('active')) {
        infoPanel.style.display = 'none';
    }
    
    // Also check projections panel
    const projectionsPanel = document.getElementById('projections-panel');
    if (projectionsPanel && !projectionsPanel.classList.contains('active')) {
        projectionsPanel.style.display = 'none';
    }
}

// Export scene-related variables for other modules to use
export {
    mainScene, mainCamera, mainRenderer, mainControls,
    topScene, topCamera, topRenderer,
    frontScene, frontCamera, frontRenderer,
    rightScene, rightCamera, rightRenderer,
    leftScene, leftCamera, leftRenderer,
    currentShape
};

// Initialize currentShape as an empty object instead of null
// so that Object.assign will work properly
if (!currentShape) {
    currentShape = {};
}