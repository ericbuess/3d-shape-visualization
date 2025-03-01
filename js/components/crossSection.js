import { mainScene } from './scene.js';

// Cross section mesh reference
let crossSectionMesh = null;

// Update cross section visualization
export function updateCrossSection() {
    // Get current values from controls module (to avoid circular imports)
    const crossSectionEnabled = document.getElementById('cross-section-toggle').checked;
    let crossSectionPlane = 'horizontal';
    
    // Determine which plane button is active
    if (document.getElementById('vertical-plane-btn').classList.contains('active')) {
        crossSectionPlane = 'vertical';
    } else if (document.getElementById('angled-plane-btn').classList.contains('active')) {
        crossSectionPlane = 'angled';
    }
    
    // Get current position value
    const crossSectionPosition = document.getElementById('cross-section-position').value / 100;
    
    if (!currentShape || !crossSectionEnabled) return;
    
    removeCrossSection();
    
    let plane;
    
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
    } else if (currentShape.type === 'cylinder' || currentShape.type === 'cone') {
        const { radius, height } = currentShape.dimensions;
        const maxDimension = Math.max(radius * 2, height);
        planeConstant = (crossSectionPosition - 0.5) * maxDimension;
    } else if (currentShape.type === 'sphere') {
        const { radius } = currentShape.dimensions;
        planeConstant = (crossSectionPosition - 0.5) * radius * 2;
    }
    
    plane.constant = planeConstant;
    
    // Calculate appropriate size for the plane helper based on shape dimensions
    let planeSize = 10; // Default fallback size
    
    if (currentShape) {
        if (currentShape.type === 'triangularPrism') {
            const { height, side1, side2 } = currentShape.dimensions;
            planeSize = Math.max(height, side1, side2) * 3; // Make plane 3x the max dimension
        } else if (currentShape.type === 'rectangularPrism' || currentShape.type === 'cube') {
            const { width, height, length } = currentShape.dimensions;
            planeSize = Math.max(width, height, length) * 3;
        } else if (currentShape.type === 'cylinder' || currentShape.type === 'cone') {
            const { radius, height } = currentShape.dimensions;
            planeSize = Math.max(radius * 2, height) * 3;
        } else if (currentShape.type === 'sphere') {
            const { radius } = currentShape.dimensions;
            planeSize = radius * 6; // 3x diameter
        }
    }
    
    // Create plane helper with dynamic size - cross-section plane, not a solid section
    const planeHelper = new THREE.PlaneHelper(plane, planeSize, 0xff0000);
    planeHelper.userData.isCrossSectionHelper = true; // Flag so it's not affected by other functions
    mainScene.add(planeHelper);
}

// Remove cross section visualization
export function removeCrossSection() {
    // Remove existing cross section elements
    mainScene.children = mainScene.children.filter(child => {
        return !(child instanceof THREE.PlaneHelper);
    });
    
    if (crossSectionMesh) {
        mainScene.remove(crossSectionMesh);
        crossSectionMesh = null;
    }
}

// Access to the current shape
let currentShape = null;

// Set the current shape for this module to use
export function setCurrentShape(shape) {
    currentShape = shape;
    
    // If new shape is loaded and cross section is enabled, update it
    const crossSectionEnabled = document.getElementById('cross-section-toggle')?.checked;
    if (shape && crossSectionEnabled) {
        updateCrossSection();
    }
}

export { crossSectionMesh };