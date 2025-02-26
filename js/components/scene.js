/**
 * SceneManager - Manages the main 3D scene and rendering
 */
import { CONFIG } from '../config.js';

export class SceneManager {
    /**
     * Initialize the scene manager
     * @param {EventBus} eventBus - The application event bus
     */
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Animation
        this.cameraAnimationInProgress = false;
        this.targetCameraPosition = { x: 0, y: 0, z: 0 };
    }
    
    /**
     * Initialize the scene
     */
    init() {
        console.log('Initializing main scene...');
        
        // Create the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SCENE.backgroundColor);
        
        // Get the container
        const container = document.getElementById('canvas-container');
        if (!container) {
            throw new Error('Canvas container not found');
        }
        
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.fov,
            container.clientWidth / container.clientHeight,
            CONFIG.CAMERA.near,
            CONFIG.CAMERA.far
        );
        
        this.camera.position.set(
            CONFIG.CAMERA.defaultPosition.x,
            CONFIG.CAMERA.defaultPosition.y,
            CONFIG.CAMERA.defaultPosition.z
        );
        this.camera.lookAt(0, 0, 0);
        
        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.RENDERER.antialias
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        
        // Setup controls
        this.setupControls();
        
        // Add lighting
        this.setupLighting();
        
        // Add helper objects
        this.addHelpers();
        
        // Subscribe to view preset events
        this.setupViewEvents();
    }
    
    /**
     * Setup camera controls
     */
    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableRotate = true;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.minDistance = CONFIG.CAMERA.minDistance;
            this.controls.maxDistance = CONFIG.CAMERA.maxDistance;
            this.controls.update();
        } else {
            console.error('THREE.OrbitControls is not defined. Camera controls will not be available.');
        }
    }
    
    /**
     * Setup scene lighting
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);
    }
    
    /**
     * Add helper objects to the scene
     */
    addHelpers() {
        // Add grid helper
        const gridHelper = new THREE.GridHelper(
            CONFIG.SCENE.gridSize,
            CONFIG.SCENE.gridDivisions
        );
        this.scene.add(gridHelper);
        
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    
    /**
     * Setup view preset event listeners
     */
    setupViewEvents() {
        this.eventBus.subscribe('view:top', () => this.setTopView());
        this.eventBus.subscribe('view:front', () => this.setFrontView());
        this.eventBus.subscribe('view:side', () => this.setSideView());
        this.eventBus.subscribe('view:isometric', () => this.setIsometricView());
        this.eventBus.subscribe('view:reset', () => this.resetView());
        this.eventBus.subscribe('camera:set', (params) => {
            this.setCameraPosition(params.horizontalAngle, params.verticalAngle, params.distance);
        });
    }
    
    /**
     * Add a shape to the scene
     * @param {Shape} shape - The shape to add
     */
    addShapeToScene(shape) {
        if (!shape) return;
        
        if (shape.mainMesh) this.scene.add(shape.mainMesh);
        if (shape.wireframe) this.scene.add(shape.wireframe);
    }
    
    /**
     * Clear a shape from the scene
     * @param {Shape} shape - The shape to clear
     */
    clearShape(shape) {
        if (!shape) return;
        
        if (shape.mainMesh) this.scene.remove(shape.mainMesh);
        if (shape.wireframe) this.scene.remove(shape.wireframe);
        
        // Remove cross section
        this.scene.children = this.scene.children.filter(child => {
            return !(child instanceof THREE.PlaneHelper);
        });
    }
    
    /**
     * Set top view camera position
     */
    setTopView() {
        if (!this.controls || !this.controls.isMouseDown) {
            this.resetViewOrientation();
            this.animateCameraToPosition(0, 90, 12);
        }
    }
    
    /**
     * Set front view camera position
     */
    setFrontView() {
        if (!this.controls || !this.controls.isMouseDown) {
            this.resetViewOrientation();
            this.animateCameraToPosition(0, 0, 12);
        }
    }
    
    /**
     * Set side view camera position
     */
    setSideView() {
        if (!this.controls || !this.controls.isMouseDown) {
            this.resetViewOrientation();
            this.animateCameraToPosition(90, 0, 12);
        }
    }
    
    /**
     * Set isometric view camera position
     */
    setIsometricView() {
        if (!this.controls || !this.controls.isMouseDown) {
            this.resetViewOrientation();
            this.animateCameraToPosition(45, 35, 12);
        }
    }
    
    /**
     * Reset view to default
     */
    resetView() {
        if (this.controls) {
            this.controls.reset();
            this.setIsometricView();
        }
    }
    
    /**
     * Reset the view orientation
     */
    resetViewOrientation() {
        // Don't reset if currently dragging
        if (this.controls && this.controls.isMouseDown) {
            return;
        }
        
        // Reset the camera's up vector
        this.camera.up.set(0, 1, 0);
        
        // Reset controls target
        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }
    
    /**
     * Set camera position directly
     * @param {number} horizontalAngle - Horizontal angle in degrees
     * @param {number} verticalAngle - Vertical angle in degrees
     * @param {number} distance - Distance from origin
     */
    setCameraPosition(horizontalAngle, verticalAngle, distance) {
        // Convert angles to radians
        const horizontalRad = horizontalAngle * Math.PI / 180;
        const verticalRad = verticalAngle * Math.PI / 180;
        
        // Calculate position using spherical coordinates
        const x = distance * Math.cos(verticalRad) * Math.sin(horizontalRad);
        const y = distance * Math.sin(verticalRad);
        const z = distance * Math.cos(verticalRad) * Math.cos(horizontalRad);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
        
        // Update UI elements
        this.eventBus.publish('camera:updated', {
            horizontalAngle,
            verticalAngle,
            distance
        });
    }
    
    /**
     * Smoothly animate camera to a new position
     * @param {number} horizontalAngle - Horizontal angle in degrees
     * @param {number} verticalAngle - Vertical angle in degrees
     * @param {number} distance - Distance from origin
     */
    animateCameraToPosition(horizontalAngle, verticalAngle, distance) {
        // Skip if currently dragging
        if (this.controls && this.controls.isMouseDown) {
            return;
        }
        
        // Convert angles to radians
        const horizontalRad = horizontalAngle * Math.PI / 180;
        const verticalRad = verticalAngle * Math.PI / 180;
        
        // Calculate target position
        this.targetCameraPosition = {
            x: distance * Math.cos(verticalRad) * Math.sin(horizontalRad),
            y: distance * Math.sin(verticalRad),
            z: distance * Math.cos(verticalRad) * Math.cos(horizontalRad)
        };
        
        // Update UI elements
        this.eventBus.publish('camera:updated', {
            horizontalAngle,
            verticalAngle,
            distance
        });
        
        // Start animation if not already in progress
        if (!this.cameraAnimationInProgress) {
            this.cameraAnimationInProgress = true;
            this.animateCameraStep();
        }
    }
    
    /**
     * Animate a single step of camera movement
     */
    animateCameraStep() {
        // Stop if no longer animating or controls are being used
        if (!this.cameraAnimationInProgress || (this.controls && this.controls.isMouseDown)) {
            this.cameraAnimationInProgress = false;
            return;
        }
        
        // Get current position
        const currentPos = this.camera.position;
        
        // Calculate step towards target
        const dx = this.targetCameraPosition.x - currentPos.x;
        const dy = this.targetCameraPosition.y - currentPos.y;
        const dz = this.targetCameraPosition.z - currentPos.z;
        
        // Check if close enough to stop
        const distanceSquared = dx*dx + dy*dy + dz*dz;
        if (distanceSquared < 0.01) {
            // Final step - set exact position
            this.camera.position.set(
                this.targetCameraPosition.x,
                this.targetCameraPosition.y,
                this.targetCameraPosition.z
            );
            this.camera.lookAt(0, 0, 0);
            
            this.cameraAnimationInProgress = false;
            return;
        }
        
        // Move camera fraction of the way to target
        this.camera.position.x += dx * CONFIG.ANIMATION.cameraTransitionSpeed;
        this.camera.position.y += dy * CONFIG.ANIMATION.cameraTransitionSpeed;
        this.camera.position.z += dz * CONFIG.ANIMATION.cameraTransitionSpeed;
        
        // Look at origin
        this.camera.lookAt(0, 0, 0);
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animateCameraStep());
    }
    
    /**
     * Update controls in animation loop
     */
    updateControls() {
        if (this.controls && typeof this.controls.update === 'function') {
            this.controls.update();
        }
    }
    
    /**
     * Handle window resize
     */
    resize() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        
        // Update camera aspect ratio
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}