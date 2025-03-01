import { mainCamera, mainControls } from './scene.js';
import eventBus from '../utils/eventBus.js';
import { setActiveButton, setActiveViewButton, resetActiveViewButtons, setActivePlaneButton } from '../utils/ui.js';
import { removeCrossSection, updateCrossSection } from './crossSection.js';
import { loadShape, parseAndGenerateShape } from './shapeFactory.js';

// Variable for transition between 2D and 3D views
let transitionValue = 1; // 0 = 2D, 1 = 3D

// Cross section variables
let crossSectionEnabled = false;
let crossSectionPlane = 'horizontal';
let crossSectionPosition = 0.5;

// Camera position functions
export function setCameraPosition(horizontalAngle, verticalAngle, distance) {
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
export function setTopView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(0, 90, 12);
    }
}

export function setFrontView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view
        animateCameraToPosition(0, 0, 12);
    }
}

export function setRightSideView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view - right side (positive X axis)
        animateCameraToPosition(90, 0, 12);
    }
}

export function setLeftSideView() {
    // Only reset if we're not currently dragging
    if (!mainControls || !mainControls.isMouseDown) {
        // First reset to baseline orientation
        resetViewOrientation();
        // Then animate to the target view - left side (negative X axis)
        animateCameraToPosition(-90, 0, 12);
    }
}

// For backwards compatibility
export function setSideView() {
    setRightSideView();
}

export function setIsometricView() {
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

// Set up event listeners for UI controls
export function setupEventListeners() {
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
    
    document.getElementById('tesseract-btn').addEventListener('click', () => {
        loadShape('tesseract');
        setActiveButton('tesseract-btn');
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
            sliderValue.textContent = 'Wireframe';
        } else if (transitionValue > 0.9) {
            sliderValue.textContent = 'Solid';
        } else {
            sliderValue.textContent = 'Mixed';
        }
        
        // Update the shape immediately
        eventBus.emit('transition-updated', transitionValue);
        
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
        setRightSideView();
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

    // Setup mobile controls as well
    setupMobileControls();

    // View click handlers for 2D projections
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
            setRightSideView();
        }
    });
    
    document.getElementById('left-view').addEventListener('mouseup', function(e) {
        if (!mainControls || !mainControls.isMouseDown) {
            setLeftSideView();
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
    if (document.getElementById('mobile-right-view')) {
        document.getElementById('mobile-right-view').addEventListener('mouseup', function(e) {
            if (!mainControls || !mainControls.isMouseDown) {
                setRightSideView();
            }
        });
    }
    if (document.getElementById('mobile-left-view')) {
        document.getElementById('mobile-left-view').addEventListener('mouseup', function(e) {
            if (!mainControls || !mainControls.isMouseDown) {
                setLeftSideView();
            }
        });
    }
}

// Set up mobile control panel functionality
function setupMobileControls() {
    // Control icons
    const shapeIcon = document.getElementById('shape-icon');
    const projectionsIcon = document.getElementById('projections-icon');
    const viewIcon = document.getElementById('view-icon');
    const crossSectionIcon = document.getElementById('cross-section-icon');
    const infoIcon = document.getElementById('info-icon');
    
    // Panels
    const shapePanel = document.getElementById('shape-panel');
    const projectionsPanel = document.getElementById('projections-panel');
    const viewPanel = document.getElementById('view-panel');
    const crossSectionPanel = document.getElementById('cross-section-panel');
    const infoPanel = document.getElementById('info-panel');
    
    const allPanels = [shapePanel, projectionsPanel, viewPanel, crossSectionPanel, infoPanel];
    const allIcons = [shapeIcon, projectionsIcon, viewIcon, crossSectionIcon, infoIcon];
    
    // Close panels function
    const closePanels = () => {
        allPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
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
        panel.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
    
    // Toggle panels on icon click
    function setupIconPanel(icon, panel, onOpen) {
        icon.addEventListener('click', (event) => {
            // Stop propagation to prevent the document click handler from running
            event.stopPropagation();
            
            const isActive = panel.classList.contains('active');
            
            // Close all panels
            allPanels.forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            allIcons.forEach(i => i.classList.remove('active'));
            
            // Open this panel if it wasn't already open
            if (!isActive) {
                panel.classList.add('active');
                panel.style.display = 'block';
                icon.classList.add('active');
                
                // Call the onOpen callback if provided
                if (typeof onOpen === 'function') {
                    onOpen();
                }
                
                // No special handling needed for the view panel anymore since projections moved to their own panel
            }
        });
    }
    
    setupIconPanel(shapeIcon, shapePanel);
    setupIconPanel(projectionsIcon, projectionsPanel, () => {
        // Resize renderers for the 2D projections when panel opens
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
    });
    setupIconPanel(viewIcon, viewPanel);
    setupIconPanel(crossSectionIcon, crossSectionPanel, () => {
        // Sync checkbox state in the modal with the actual state
        const mobileCrossSectionToggle = document.getElementById('mobile-cross-section-toggle');
        if (mobileCrossSectionToggle) {
            mobileCrossSectionToggle.checked = crossSectionEnabled;
        }
    });
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
    
    document.getElementById('mobile-tesseract-btn').addEventListener('click', () => {
        loadShape('tesseract');
        setActiveButton('mobile-tesseract-btn');
        setActiveButton('tesseract-btn');
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
        setRightSideView();
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
            sliderValue.textContent = 'Wireframe';
        } else if (transitionValue > 0.9) {
            sliderValue.textContent = 'Solid';
        } else {
            sliderValue.textContent = 'Mixed';
        }
        
        // Update the shape immediately
        eventBus.emit('transition-updated', transitionValue);
        
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
}

// Export relevant variables and functions
export { transitionValue, crossSectionEnabled, crossSectionPlane, crossSectionPosition };