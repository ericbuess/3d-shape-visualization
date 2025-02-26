/**
 * UIController - Manages all UI controls and interactions
 */
import { CONFIG, SHAPE_DEFINITIONS } from '../config.js';
import { setActiveButton, toggleVisibility, updateSpanText } from '../utils/ui.js';

export class UIController {
    /**
     * Initialize the UI controller
     * @param {EventBus} eventBus - The application event bus
     * @param {object} appState - The application state
     */
    constructor(eventBus, appState) {
        this.eventBus = eventBus;
        this.appState = appState;
    }
    
    /**
     * Initialize the UI controls
     */
    init() {
        console.log('Initializing UI controls...');
        
        // Set up shape selection controls
        this.setupShapeControls();
        
        // Set up view controls
        this.setupViewControls();
        
        // Set up transition slider
        this.setupTransitionSlider();
        
        // Set up cross section controls
        this.setupCrossSectionControls();
        
        // Set up tab switching
        this.setupTabEvents();
        
        // Set up mobile controls
        this.setupMobileControls();
        
        // Set up custom shape generator
        this.setupCustomShapeGenerator();
        
        // Set up miscellaneous UI events
        this.setupMiscEvents();
        
        // Subscribe to events that affect UI state
        this.setupEventSubscriptions();
    }
    
    /**
     * Set up shape selection buttons
     */
    setupShapeControls() {
        // Desktop shape buttons
        document.getElementById('triangularPrism1-btn').addEventListener('click', () => {
            this.handleShapeSelection('triangularPrism1', 'triangularPrism1-btn');
        });
        
        document.getElementById('rectangularPrism-btn').addEventListener('click', () => {
            this.handleShapeSelection('rectangularPrism', 'rectangularPrism-btn');
        });
        
        document.getElementById('cube-btn').addEventListener('click', () => {
            this.handleShapeSelection('cube', 'cube-btn');
        });
        
        document.getElementById('cylinder-btn').addEventListener('click', () => {
            this.handleShapeSelection('cylinder', 'cylinder-btn');
        });
        
        document.getElementById('cone-btn').addEventListener('click', () => {
            this.handleShapeSelection('cone', 'cone-btn');
        });
        
        document.getElementById('sphere-btn').addEventListener('click', () => {
            this.handleShapeSelection('sphere', 'sphere-btn');
        });
        
        document.getElementById('custom-btn').addEventListener('click', () => {
            this.handleCustomButton();
        });
    }
    
    /**
     * Handle shape selection
     * @param {string} shapeId - ID of the selected shape
     * @param {string} buttonId - ID of the button that was clicked
     */
    handleShapeSelection(shapeId, buttonId) {
        setActiveButton(buttonId);
        this.eventBus.publish('shape:change', shapeId);
    }
    
    /**
     * Handle custom shape button click
     */
    handleCustomButton() {
        setActiveButton('custom-btn');
        // Focus on the word problem textarea
        document.getElementById('shape-description').focus();
        document.getElementById('shape-word-problem').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Set up view control buttons
     */
    setupViewControls() {
        document.getElementById('top-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:top');
            setActiveButton('top-view-btn', 'active');
        });
        
        document.getElementById('front-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:front');
            setActiveButton('front-view-btn', 'active');
        });
        
        document.getElementById('side-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:side');
            setActiveButton('side-view-btn', 'active');
        });
        
        document.getElementById('isometric-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:isometric');
            setActiveButton('isometric-view-btn', 'active');
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.eventBus.publish('view:reset');
            setActiveButton('isometric-view-btn', 'active');
        });
        
        // Camera angle controls
        document.getElementById('horizontal-angle').addEventListener('input', (e) => {
            this.handleCameraControls();
        });
        
        document.getElementById('vertical-angle').addEventListener('input', (e) => {
            this.handleCameraControls();
        });
        
        document.getElementById('camera-distance').addEventListener('input', (e) => {
            this.handleCameraControls();
        });
    }
    
    /**
     * Handle camera control adjustments
     */
    handleCameraControls() {
        const horizontalAngle = parseInt(document.getElementById('horizontal-angle').value);
        const verticalAngle = parseInt(document.getElementById('vertical-angle').value);
        const distance = parseInt(document.getElementById('camera-distance').value);
        
        this.eventBus.publish('camera:set', {
            horizontalAngle,
            verticalAngle,
            distance
        });
        
        // Reset active view buttons
        const viewButtons = document.querySelectorAll('.view-buttons button');
        viewButtons.forEach(button => button.classList.remove('active'));
    }
    
    /**
     * Set up transition slider
     */
    setupTransitionSlider() {
        const transitionSlider = document.getElementById('transition-slider');
        const sliderValue = document.getElementById('slider-value');
        
        transitionSlider.addEventListener('input', () => {
            // Get slider value (0-100)
            const value = transitionSlider.value / 100;
            
            // Update transition value
            this.appState.transitionValue = value;
            
            // Update UI text
            if (value < 0.1) {
                sliderValue.textContent = '2D View';
            } else if (value > 0.9) {
                sliderValue.textContent = '3D View';
            } else {
                sliderValue.textContent = 'Transition';
            }
            
            // Publish event
            this.eventBus.publish('transition:update', value);
        });
    }
    
    /**
     * Set up cross section controls
     */
    setupCrossSectionControls() {
        // Cross section toggle
        const crossSectionToggle = document.getElementById('cross-section-toggle');
        crossSectionToggle.addEventListener('change', () => {
            const enabled = crossSectionToggle.checked;
            this.appState.crossSectionEnabled = enabled;
            
            toggleVisibility('cross-section-controls', enabled, 'hidden');
            this.eventBus.publish('crossSection:toggle', enabled);
        });
        
        // Cross section plane buttons
        document.getElementById('horizontal-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('horizontal', 'horizontal-plane-btn');
        });
        
        document.getElementById('vertical-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('vertical', 'vertical-plane-btn');
        });
        
        document.getElementById('angled-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('angled', 'angled-plane-btn');
        });
        
        // Cross section position slider
        const crossSectionPositionSlider = document.getElementById('cross-section-position');
        const crossSectionPositionValue = document.getElementById('cross-section-position-value');
        
        crossSectionPositionSlider.addEventListener('input', () => {
            const value = crossSectionPositionSlider.value;
            const position = value / 100;
            
            this.appState.crossSectionPosition = position;
            crossSectionPositionValue.textContent = `${value}%`;
            
            this.eventBus.publish('crossSection:updatePosition', position);
        });
    }
    
    /**
     * Update cross section plane
     * @param {string} plane - Plane type ('horizontal', 'vertical', 'angled')
     * @param {string} buttonId - ID of the button that was clicked
     */
    updateCrossSectionPlane(plane, buttonId) {
        // Update state
        this.appState.crossSectionPlane = plane;
        
        // Update UI
        setActiveButton(buttonId, 'active');
        
        // Publish event
        this.eventBus.publish('crossSection:updatePlane', plane);
    }
    
    /**
     * Set up tab switching events
     */
    setupTabEvents() {
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
        
        // Function to activate a specific tab
        const activateTab = (type, tabName) => {
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
        };
        
        // Set up click handlers for desktop tabs
        Object.entries(tabButtons).forEach(([tabName, button]) => {
            if (!button) return;
            
            // Clone button to remove any existing listeners
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
                tabButtons[tabName] = newButton;
            }
            
            // Add click listener
            newButton.addEventListener('click', () => {
                activateTab('desktop', tabName);
            });
            
            // Add touch event for better mobile response
            newButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                activateTab('desktop', tabName);
            }, { passive: false });
        });
        
        // Set up click handlers for mobile tabs
        Object.entries(mobileTabButtons).forEach(([tabName, button]) => {
            if (!button) return;
            
            // Clone button to remove any existing listeners
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
                mobileTabButtons[tabName] = newButton;
            }
            
            // Add click listener
            newButton.addEventListener('click', () => {
                activateTab('mobile', tabName);
            });
            
            // Add touch event for better mobile response
            newButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                activateTab('mobile', tabName);
            }, { passive: false });
        });
        
        // Activate default tabs
        activateTab('desktop', 'metrics');
        activateTab('mobile', 'metrics');
    }
    
    /**
     * Set up mobile controls
     */
    setupMobileControls() {
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
        
        // Close panels function
        const closePanels = () => {
            allPanels.forEach(panel => panel.classList.remove('active'));
            allIcons.forEach(icon => icon.classList.remove('active'));
        };
        
        // Close buttons
        const closeButtons = document.querySelectorAll('.close-panel');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closePanels);
        });
        
        // Close panels when clicking outside
        document.addEventListener('click', (event) => {
            // If click is outside any panel and not on an icon
            if (!event.target.closest('.mobile-panel') && 
                !event.target.closest('.control-icon') &&
                !event.target.closest('.close-panel')) {
                closePanels();
            }
        });
        
        // Prevent clicks inside panels from closing the panel
        allPanels.forEach(panel => {
            if (!panel) return;
            
            panel.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });
        
        // Function to setup icon panel toggling
        const setupIconPanel = (icon, panel, onOpen) => {
            if (!icon || !panel) return;
            
            icon.addEventListener('click', (event) => {
                // Stop propagation to prevent document click handler
                event.stopPropagation();
                
                const isActive = panel.classList.contains('active');
                
                // Close all panels
                allPanels.forEach(p => p && p.classList.remove('active'));
                allIcons.forEach(i => i && i.classList.remove('active'));
                
                // Open this panel if it wasn't already open
                if (!isActive) {
                    panel.classList.add('active');
                    icon.classList.add('active');
                    
                    // Call onOpen callback if provided
                    if (typeof onOpen === 'function') {
                        onOpen();
                    }
                }
            });
        };
        
        // Setup panel toggles
        setupIconPanel(shapeIcon, shapePanel);
        setupIconPanel(viewIcon, viewPanel, () => {
            this.resizeMobileViewRenderers();
        });
        setupIconPanel(crossSectionIcon, crossSectionPanel, () => {
            // Sync checkbox state
            const mobileCrossSectionToggle = document.getElementById('mobile-cross-section-toggle');
            if (mobileCrossSectionToggle) {
                mobileCrossSectionToggle.checked = this.appState.crossSectionEnabled;
            }
        });
        setupIconPanel(infoIcon, infoPanel);
        
        // Setup mobile shape buttons
        this.setupMobileShapeButtons();
        
        // Setup mobile view controls
        this.setupMobileViewControls();
        
        // Setup mobile cross section controls
        this.setupMobileCrossSectionControls();
    }
    
    /**
     * Set up mobile shape buttons
     */
    setupMobileShapeButtons() {
        document.getElementById('mobile-triangularPrism1-btn').addEventListener('click', () => {
            this.handleShapeSelection('triangularPrism1', 'mobile-triangularPrism1-btn');
            setActiveButton('triangularPrism1-btn');
        });
        
        document.getElementById('mobile-rectangularPrism-btn').addEventListener('click', () => {
            this.handleShapeSelection('rectangularPrism', 'mobile-rectangularPrism-btn');
            setActiveButton('rectangularPrism-btn');
        });
        
        document.getElementById('mobile-cube-btn').addEventListener('click', () => {
            this.handleShapeSelection('cube', 'mobile-cube-btn');
            setActiveButton('cube-btn');
        });
        
        document.getElementById('mobile-cylinder-btn').addEventListener('click', () => {
            this.handleShapeSelection('cylinder', 'mobile-cylinder-btn');
            setActiveButton('cylinder-btn');
        });
        
        document.getElementById('mobile-cone-btn').addEventListener('click', () => {
            this.handleShapeSelection('cone', 'mobile-cone-btn');
            setActiveButton('cone-btn');
        });
        
        document.getElementById('mobile-sphere-btn').addEventListener('click', () => {
            this.handleShapeSelection('sphere', 'mobile-sphere-btn');
            setActiveButton('sphere-btn');
        });
        
        document.getElementById('mobile-custom-btn').addEventListener('click', () => {
            toggleVisibility('mobile-custom-input', true, 'hidden');
            setActiveButton('mobile-custom-btn');
            setActiveButton('custom-btn');
        });
    }
    
    /**
     * Set up mobile view controls
     */
    setupMobileViewControls() {
        document.getElementById('mobile-top-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:top');
            setActiveButton('mobile-top-view-btn', 'active');
            setActiveButton('top-view-btn', 'active');
        });
        
        document.getElementById('mobile-front-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:front');
            setActiveButton('mobile-front-view-btn', 'active');
            setActiveButton('front-view-btn', 'active');
        });
        
        document.getElementById('mobile-side-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:side');
            setActiveButton('mobile-side-view-btn', 'active');
            setActiveButton('side-view-btn', 'active');
        });
        
        document.getElementById('mobile-isometric-view-btn').addEventListener('click', () => {
            this.eventBus.publish('view:isometric');
            setActiveButton('mobile-isometric-view-btn', 'active');
            setActiveButton('isometric-view-btn', 'active');
        });
        
        // Mobile transition slider
        const mobileTransitionSlider = document.getElementById('mobile-transition-slider');
        if (mobileTransitionSlider) {
            mobileTransitionSlider.addEventListener('input', () => {
                // Get slider value (0-100)
                const value = mobileTransitionSlider.value / 100;
                
                // Update transition value
                this.appState.transitionValue = value;
                
                // Sync with desktop slider
                const desktopSlider = document.getElementById('transition-slider');
                if (desktopSlider) desktopSlider.value = mobileTransitionSlider.value;
                
                // Update UI text
                const sliderValue = document.getElementById('slider-value');
                if (sliderValue) {
                    if (value < 0.1) {
                        sliderValue.textContent = '2D View';
                    } else if (value > 0.9) {
                        sliderValue.textContent = '3D View';
                    } else {
                        sliderValue.textContent = 'Transition';
                    }
                }
                
                // Publish event
                this.eventBus.publish('transition:update', value);
            });
        }
        
        // Mobile camera controls
        document.getElementById('mobile-horizontal-angle').addEventListener('input', (e) => {
            const horizontalAngle = parseInt(e.target.value);
            const verticalAngle = parseInt(document.getElementById('mobile-vertical-angle').value);
            const distance = parseInt(document.getElementById('mobile-camera-distance').value);
            
            this.eventBus.publish('camera:set', {
                horizontalAngle,
                verticalAngle,
                distance
            });
            
            // Sync with desktop controls
            document.getElementById('horizontal-angle').value = horizontalAngle;
        });
        
        document.getElementById('mobile-vertical-angle').addEventListener('input', (e) => {
            const horizontalAngle = parseInt(document.getElementById('mobile-horizontal-angle').value);
            const verticalAngle = parseInt(e.target.value);
            const distance = parseInt(document.getElementById('mobile-camera-distance').value);
            
            this.eventBus.publish('camera:set', {
                horizontalAngle,
                verticalAngle,
                distance
            });
            
            // Sync with desktop controls
            document.getElementById('vertical-angle').value = verticalAngle;
        });
        
        document.getElementById('mobile-camera-distance').addEventListener('input', (e) => {
            const horizontalAngle = parseInt(document.getElementById('mobile-horizontal-angle').value);
            const verticalAngle = parseInt(document.getElementById('mobile-vertical-angle').value);
            const distance = parseInt(e.target.value);
            
            this.eventBus.publish('camera:set', {
                horizontalAngle,
                verticalAngle,
                distance
            });
            
            // Sync with desktop controls
            document.getElementById('camera-distance').value = distance;
        });
    }
    
    /**
     * Set up mobile cross section controls
     */
    setupMobileCrossSectionControls() {
        // Mobile cross section toggle
        const mobileCrossSectionToggle = document.getElementById('mobile-cross-section-toggle');
        mobileCrossSectionToggle.addEventListener('change', () => {
            const enabled = mobileCrossSectionToggle.checked;
            this.appState.crossSectionEnabled = enabled;
            
            toggleVisibility('mobile-cross-section-controls', enabled, 'hidden');
            toggleVisibility('cross-section-controls', enabled, 'hidden');
            
            // Sync with desktop
            document.getElementById('cross-section-toggle').checked = enabled;
            
            this.eventBus.publish('crossSection:toggle', enabled);
        });
        
        // Mobile cross section plane buttons
        document.getElementById('mobile-horizontal-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('horizontal', 'mobile-horizontal-plane-btn');
            setActiveButton('horizontal-plane-btn', 'active');
        });
        
        document.getElementById('mobile-vertical-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('vertical', 'mobile-vertical-plane-btn');
            setActiveButton('vertical-plane-btn', 'active');
        });
        
        document.getElementById('mobile-angled-plane-btn').addEventListener('click', () => {
            this.updateCrossSectionPlane('angled', 'mobile-angled-plane-btn');
            setActiveButton('angled-plane-btn', 'active');
        });
        
        // Mobile cross section position slider
        document.getElementById('mobile-cross-section-position').addEventListener('input', (e) => {
            const value = e.target.value;
            const position = value / 100;
            
            this.appState.crossSectionPosition = position;
            
            // Sync with desktop
            document.getElementById('cross-section-position').value = value;
            updateSpanText('cross-section-position-value', `${value}%`);
            
            this.eventBus.publish('crossSection:updatePosition', position);
        });
    }
    
    /**
     * Resize mobile view renderers
     */
    resizeMobileViewRenderers() {
        this.eventBus.publish('mobileViews:resize');
    }
    
    /**
     * Set up custom shape generator
     */
    setupCustomShapeGenerator() {
        // Desktop generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            const description = document.getElementById('shape-description').value;
            this.parseAndGenerateShape(description);
        });
        
        // Mobile generate button
        document.getElementById('mobile-generate-btn').addEventListener('click', () => {
            const description = document.getElementById('mobile-shape-description').value;
            this.parseAndGenerateShape(description);
        });
    }
    
    /**
     * Parse and generate a custom shape from description
     * @param {string} description - Text description of the shape
     */
    parseAndGenerateShape(description) {
        console.log(`Parsing custom shape description: ${description}`);
        
        try {
            // This would connect to a shape parser component in a full implementation
            // For this example, we'll just create a cube
            this.eventBus.publish('shape:change', 'cube');
            setActiveButton('cube-btn');
            setActiveButton('mobile-cube-btn');
        } catch (error) {
            console.error('Error parsing shape description:', error);
            alert('Could not parse shape description. Please try again with a different format.');
        }
    }
    
    /**
     * Set up miscellaneous UI events
     */
    setupMiscEvents() {
        // Fullscreen image handling
        const exampleImages = document.querySelectorAll('.example-image');
        exampleImages.forEach(img => {
            img.addEventListener('click', () => {
                this.showFullScreenImage(img.src);
            });
        });
        
        // Close overlay
        const closeOverlay = document.querySelector('.close-overlay');
        if (closeOverlay) {
            closeOverlay.addEventListener('click', () => {
                this.hideFullScreenImage();
            });
        }
    }
    
    /**
     * Show fullscreen image
     * @param {string} imageSrc - Image source URL
     */
    showFullScreenImage(imageSrc) {
        const overlay = document.getElementById('fullscreen-image-overlay');
        const image = document.getElementById('fullscreen-image');
        
        if (!overlay || !image) return;
        
        image.src = imageSrc;
        overlay.classList.remove('hidden');
        
        // Prevent scrolling while overlay is open
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Hide fullscreen image
     */
    hideFullScreenImage() {
        const overlay = document.getElementById('fullscreen-image-overlay');
        if (!overlay) return;
        
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    /**
     * Set up event subscriptions
     */
    setupEventSubscriptions() {
        // Listen for camera updates
        this.eventBus.subscribe('camera:updated', (params) => {
            // Update angle display values
            updateSpanText('horizontal-angle-value', `${params.horizontalAngle}°`);
            updateSpanText('vertical-angle-value', `${params.verticalAngle}°`);
            updateSpanText('camera-distance-value', params.distance.toString());
            
            // Update range input values to match
            const horizontalInput = document.getElementById('horizontal-angle');
            const verticalInput = document.getElementById('vertical-angle');
            const distanceInput = document.getElementById('camera-distance');
            
            if (horizontalInput) horizontalInput.value = params.horizontalAngle;
            if (verticalInput) verticalInput.value = params.verticalAngle;
            if (distanceInput) distanceInput.value = params.distance;
        });
        
        // Listen for shape loaded events
        this.eventBus.subscribe('shape:loaded', (shape) => {
            this.updateShapeInfo(shape);
        });
    }
    
    /**
     * Update shape information
     * @param {Shape} shape - The loaded shape
     */
    updateShapeInfo(shape) {
        // This is a placeholder - in a complete implementation,
        // this would update metrics, formulas, nets, etc.
        console.log(`Updating UI for shape: ${shape.type}`);
    }
}