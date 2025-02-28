/**
 * CrossSectionManager - Manages cross section visualization for 3D shapes
 */
import { CONFIG } from '../config.js';

export class CrossSectionManager {
    /**
     * Initialize the cross section manager
     * @param {EventBus} eventBus - The application event bus
     * @param {object} appState - The application state
     */
    constructor(eventBus, appState) {
        this.eventBus = eventBus;
        this.appState = appState;
        
        // Cross section objects
        this.crossSectionMesh = null;
        this.planeHelper = null;
        
        // Reference to main scene
        this.scene = null;
    }
    
    /**
     * Initialize cross section manager
     * @param {THREE.Scene} scene - The main scene
     */
    init(scene) {
        this.scene = scene;
    }
    
    /**
     * Create a cross section visualization
     */
    createCrossSection() {
        if (!this.scene || !this.appState.currentShape) return;
        
        // Remove any existing cross section
        this.removeCrossSection();
        
        // Create new cross section based on current settings
        this.updateCrossSection();
    }
    
    /**
     * Update the cross section visualization
     */
    updateCrossSection() {
        if (!this.scene || !this.appState.currentShape || !this.appState.crossSectionEnabled) return;
        
        // Remove any existing cross section
        this.removeCrossSection();
        
        // Get the current shape
        const shape = this.appState.currentShape;
        
        // Create the appropriate plane based on selected plane type
        const plane = this.createCuttingPlane();
        
        // Adjust plane position
        const planeConstant = this.calculatePlaneConstant(shape);
        plane.constant = planeConstant;
        
        // Create plane helper
        this.planeHelper = new THREE.PlaneHelper(
            plane, 
            10, 
            CONFIG.CROSS_SECTION.planeColor
        );
        this.scene.add(this.planeHelper);
        
        // Create cross-section visualization if in 3D mode
        if (this.appState.transitionValue > 0) {
            this.createCrossSectionMesh(shape, plane);
        }
    }
    
    /**
     * Create a cutting plane based on the current settings
     * @returns {THREE.Plane} The cutting plane
     */
    createCuttingPlane() {
        let plane;
        
        switch (this.appState.crossSectionPlane) {
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
        
        return plane;
    }
    
    /**
     * Calculate the plane constant based on shape dimensions
     * @param {Shape} shape - The current shape
     * @returns {number} The plane constant
     */
    calculatePlaneConstant(shape) {
        let maxDimension = 5; // Default value
        
        if (shape.type === 'triangularPrism') {
            const { height, side1, side2 } = shape.dimensions;
            maxDimension = Math.max(height, side1, side2);
        } else if (shape.type === 'rectangularPrism' || shape.type === 'cube') {
            const { width, height, length } = shape.dimensions;
            maxDimension = Math.max(width, height, length);
        } else if (shape.type === 'cylinder' || shape.type === 'cone') {
            const { radius, height } = shape.dimensions;
            maxDimension = Math.max(radius * 2, height);
        } else if (shape.type === 'sphere') {
            const { radius } = shape.dimensions;
            maxDimension = radius * 2;
        }
        
        return (this.appState.crossSectionPosition - 0.5) * maxDimension;
    }
    
    /**
     * Create a cross section mesh
     * @param {Shape} shape - The current shape
     * @param {THREE.Plane} plane - The cutting plane
     */
    createCrossSectionMesh(shape, plane) {
        // We need to access the first mesh in the mainMesh group
        let sourceMesh;
        
        if (shape.mainMesh && shape.mainMesh.children && shape.mainMesh.children.length > 0) {
            // Find the first actual mesh in the group
            for (const child of shape.mainMesh.children) {
                if (child.isMesh && child.geometry) {
                    sourceMesh = child;
                    break;
                }
            }
        }
        
        // Only proceed if we found a valid mesh
        if (sourceMesh && sourceMesh.geometry) {
            const clippingPlanes = [plane];
            
            const clippedGeometry = sourceMesh.geometry.clone();
            
            // Always use the configured cross-section color, not the shape's color
            const crossSectionColor = CONFIG.CROSS_SECTION.sectionColor;
            
            const clippedMaterial = new THREE.MeshStandardMaterial({
                color: crossSectionColor,
                side: THREE.DoubleSide,
                clippingPlanes: clippingPlanes
            });
            
            this.crossSectionMesh = new THREE.Mesh(clippedGeometry, clippedMaterial);
            
            // Copy rotation and position from the source mesh
            this.crossSectionMesh.rotation.copy(sourceMesh.rotation);
            this.crossSectionMesh.position.copy(sourceMesh.position);
            
            this.scene.add(this.crossSectionMesh);
        }
    }
    
    /**
     * Remove cross section visualization
     */
    removeCrossSection() {
        if (!this.scene) return;
        
        // Remove plane helper
        if (this.planeHelper) {
            this.scene.remove(this.planeHelper);
            this.planeHelper = null;
        }
        
        // Remove cross section mesh
        if (this.crossSectionMesh) {
            this.scene.remove(this.crossSectionMesh);
            this.crossSectionMesh = null;
        }
        
        // Additional cleanup for any stray plane helpers
        this.scene.children = this.scene.children.filter(child => {
            return !(child instanceof THREE.PlaneHelper);
        });
    }
}