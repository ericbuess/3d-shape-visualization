/**
 * Global configuration settings for the application
 */
export const CONFIG = {
    // Render settings
    RENDERER: {
        antialias: true,
        clearColor: 0xf0f0f0,
        shadowEnabled: false
    },
    
    // Camera settings
    CAMERA: {
        fov: 75,
        near: 0.1,
        far: 1000,
        defaultPosition: { x: 10, y: 10, z: 10 },
        minDistance: 5,
        maxDistance: 50
    },
    
    // Scene settings
    SCENE: {
        backgroundColor: 0xf0f0f0,
        gridSize: 20,
        gridDivisions: 20
    },
    
    // Transition settings
    TRANSITION: {
        speed: 0.05,
        defaultValue: 1 // 0 = 2D view, 1 = 3D view
    },
    
    // Shape defaults
    SHAPE: {
        defaultColor: 0x3498db,
        defaultOpacity: 0.85,
        wireframeColor: 0x000000
    },
    
    // Cross section settings
    CROSS_SECTION: {
        planeColor: 0xff0000,
        sectionColor: 0xff5555
    },
    
    // Animation settings
    ANIMATION: {
        cameraTransitionSpeed: 0.02
    },
    
    // Default shape to load on startup
    DEFAULT_SHAPE: 'triangularPrism1'
};

// Shape definitions
export const SHAPE_DEFINITIONS = {
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