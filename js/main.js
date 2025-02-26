/**
 * Main entry point for the 3D Shape Visualizer application
 * Initializes the application and orchestrates modules
 */
import { CONFIG, SHAPE_DEFINITIONS } from './config.js';
import { SceneManager } from './components/scene.js';
import { EventBus } from './utils/eventBus.js';
import { UIController } from './components/controls.js';
import { ShapeFactory } from './components/shapeFactory.js';
import { CrossSectionManager } from './components/crossSection.js';
import { ProjectionManager } from './components/projections.js';

// Console welcome message
console.log('3D Shape Visualizer - Starting application...');

class Application {
    constructor() {
        // Initialize the event bus for inter-component communication
        this.eventBus = new EventBus();
        
        // Global state
        this.state = {
            currentShape: null,
            transitionValue: CONFIG.TRANSITION.defaultValue,
            crossSectionEnabled: false,
            crossSectionPlane: 'horizontal',
            crossSectionPosition: 0.5
        };
        
        // Initialize components
        this.sceneManager = new SceneManager(this.eventBus);
        this.uiController = new UIController(this.eventBus, this.state);
        this.shapeFactory = new ShapeFactory(this.eventBus);
        this.crossSectionManager = new CrossSectionManager(this.eventBus, this.state);
        this.projectionManager = new ProjectionManager(this.eventBus, this.state);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up application-level event listeners
     */
    setupEventListeners() {
        // Listen for shape change events
        this.eventBus.subscribe('shape:change', (shapeId) => {
            this.loadShape(shapeId);
        });
        
        // Listen for transition events
        this.eventBus.subscribe('transition:update', (value) => {
            this.state.transitionValue = value;
            this.updateTransition();
        });
        
        // Listen for cross section events
        this.eventBus.subscribe('crossSection:toggle', (enabled) => {
            this.state.crossSectionEnabled = enabled;
            if (enabled) {
                this.crossSectionManager.createCrossSection();
            } else {
                this.crossSectionManager.removeCrossSection();
            }
        });
        
        this.eventBus.subscribe('crossSection:updatePlane', (plane) => {
            this.state.crossSectionPlane = plane;
            if (this.state.crossSectionEnabled) {
                this.crossSectionManager.updateCrossSection();
            }
        });
        
        this.eventBus.subscribe('crossSection:updatePosition', (position) => {
            this.state.crossSectionPosition = position;
            if (this.state.crossSectionEnabled) {
                this.crossSectionManager.updateCrossSection();
            }
        });
        
        // Listen for window resize events
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing application...');
        
        try {
            // Initialize the scene
            await this.sceneManager.init();
            
            // Initialize UI controls
            await this.uiController.init();
            
            // Load the default shape
            this.loadShape(CONFIG.DEFAULT_SHAPE);
            
            // Start animation loop
            this.animate();
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            alert('An error occurred while initializing the application. Please check the console for details.');
        }
    }
    
    /**
     * Load a shape
     * @param {string} shapeId - ID of the shape to load
     */
    loadShape(shapeId) {
        console.log(`Loading shape: ${shapeId}`);
        
        try {
            const shapeDef = SHAPE_DEFINITIONS[shapeId];
            if (!shapeDef) {
                console.error(`Shape definition not found for ID: ${shapeId}`);
                return;
            }
            
            // Clear existing shape
            if (this.state.currentShape) {
                this.sceneManager.clearShape(this.state.currentShape);
            }
            
            // Create new shape
            this.state.currentShape = this.shapeFactory.createShape(shapeDef);
            
            // Add to scene
            this.sceneManager.addShapeToScene(this.state.currentShape);
            
            // Update projections
            this.projectionManager.updateProjections(this.state.currentShape);
            
            // Update transition
            this.updateTransition();
            
            // Update cross section if enabled
            if (this.state.crossSectionEnabled) {
                this.crossSectionManager.updateCrossSection();
            }
            
            // Notify UI about shape change
            this.eventBus.publish('shape:loaded', this.state.currentShape);
            
        } catch (error) {
            console.error('Error loading shape:', error);
        }
    }
    
    /**
     * Update the transition between 2D and 3D views
     */
    updateTransition() {
        if (!this.state.currentShape) return;
        
        // Update the shape visuals based on transition value
        this.projectionManager.updateTransition(this.state.transitionValue);
        
        // Update cross section if enabled
        if (this.state.crossSectionEnabled) {
            this.crossSectionManager.updateCrossSection();
        }
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        this.sceneManager.resize();
        this.projectionManager.resize();
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.sceneManager.updateControls();
        
        // Render scenes
        this.sceneManager.render();
        this.projectionManager.render();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();
});