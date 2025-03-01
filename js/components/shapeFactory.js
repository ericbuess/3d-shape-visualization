import { mainScene, topScene, frontScene, rightScene, leftScene, currentShape as currentShapeRef } from './scene.js';
import { 
    createTriangularPrism, 
    createRectangularPrism, 
    createCube,
    createCylinder,
    createCone,
    createSphere
} from '../shapes/index.js';
// Get the transition value directly from the DOM to avoid circular imports
import { updateShapeDetails } from './shapeDetails.js';
import { setCurrentShape } from './crossSection.js';
import { setActiveButton } from '../utils/ui.js';
import { setupTabEvents } from '../utils/ui.js';
import eventBus from '../utils/eventBus.js';

// Define wireframe material - make it globally accessible for shapes
export const wireframeMaterial = new THREE.MeshBasicMaterial({ 
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

// Reference to current shape
let currentShape = null;

// Update reference to the shape for other modules
function updateCurrentShapeRef(shape) {
    currentShape = shape;
    
    // Update the reference in the scene module
    if (currentShapeRef && shape) {
        Object.assign(currentShapeRef, shape);
    } else if (shape) {
        // If the currentShapeRef is null or undefined, just use the shape directly
        // This is handled elsewhere in the code
    }
    
    // Update the reference in the crossSection module
    setCurrentShape(shape);
}

// Load a predefined shape
export function loadShape(shapeId) {
    console.log("Loading shape:", shapeId);
    const shapeDefinition = shapeDefinitions[shapeId];
    if (shapeDefinition) {
        try {
            // Create the shape
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
            
            // Make sure details are updated for the new shape
            if (currentShape) {
                console.log("Updating details for newly loaded shape:", currentShape.type);
                try {
                    // Directly update the shape details
                    updateShapeDetails(currentShape);
                    
                    // Force tabs to be properly set up 
                    setupTabEvents();
                    
                    // Select the metrics tab by default
                    const metricsTab = document.getElementById('metrics-tab');
                    if (metricsTab) metricsTab.click();
                    
                    // Select mobile metrics tab if it exists
                    const mobileMetricsTab = document.getElementById('mobile-metrics-tab');
                    if (mobileMetricsTab) mobileMetricsTab.click();
                    
                    console.log("Shape details update completed successfully for", currentShape.type);
                } catch (error) {
                    console.error("Error updating shape details in loadShape:", error);
                }
            } else {
                console.error("Shape was loaded but currentShape is null");
            }
        } catch (error) {
            console.error("Error in loadShape function:", error);
        }
    } else {
        console.error("No shape definition found for ID:", shapeId);
    }
}

// Create mesh opacity update function to avoid circular imports
function updateMeshOpacity(mesh, value) {
    if (!mesh) return;
    
    mesh.traverse(child => {
        // Skip any cross-section meshes to prevent them from being affected by opacity changes
        if (child.isCrossSectionMesh) return;
        
        if (child.isMesh && child.material) {
            // Store original material colors if not already stored
            if (!child.originalMaterial) {
                if (Array.isArray(child.material)) {
                    child.originalMaterial = child.material.map(mat => mat.clone());
                } else {
                    child.originalMaterial = child.material.clone();
                }
            }
            
            if (Array.isArray(child.material)) {
                child.material.forEach((mat, index) => {
                    // Keep original color
                    if (child.originalMaterial && child.originalMaterial[index]) {
                        mat.color.copy(child.originalMaterial[index].color);
                    }
                    mat.transparent = true;
                    mat.opacity = Math.max(0.2, value * 0.9);
                    mat.needsUpdate = true;
                });
            } else {
                // Keep original color
                if (child.originalMaterial) {
                    child.material.color.copy(child.originalMaterial.color);
                }
                child.material.transparent = true;
                child.material.opacity = Math.max(0.2, value * 0.9);
                child.material.needsUpdate = true;
            }
        }
    });
}

// Create a shape based on the definition
export function createShape(shapeDef) {
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
        
        // Update current shape reference for other modules
        updateCurrentShapeRef(currentShape);
        
        // Add the shape to scenes
        mainScene.add(currentShape.mainMesh);
        if (topScene) topScene.add(currentShape.topMesh);
        if (frontScene) frontScene.add(currentShape.frontMesh);
        if (rightScene) rightScene.add(currentShape.rightMesh);
        if (leftScene) leftScene.add(currentShape.leftMesh);
        
        // Add the shape to mobile scenes if available - create real clones
        if (window.mobileTopScene && currentShape.topMesh) {
            const clonedTopMesh = currentShape.topMesh.clone();
            currentShape.mobileTopMesh = clonedTopMesh;
            window.mobileTopScene.add(clonedTopMesh);
        }
        
        if (window.mobileFrontScene && currentShape.frontMesh) {
            const clonedFrontMesh = currentShape.frontMesh.clone();
            currentShape.mobileFrontMesh = clonedFrontMesh;
            window.mobileFrontScene.add(clonedFrontMesh);
        }
        
        if (window.mobileRightScene && currentShape.rightMesh) {
            const clonedRightMesh = currentShape.rightMesh.clone();
            currentShape.mobileRightMesh = clonedRightMesh;
            window.mobileRightScene.add(clonedRightMesh);
        }
        
        if (window.mobileLeftScene && currentShape.leftMesh) {
            const clonedLeftMesh = currentShape.leftMesh.clone();
            currentShape.mobileLeftMesh = clonedLeftMesh;
            window.mobileLeftScene.add(clonedLeftMesh);
        }
        
        // Update camera to fit the shape
        updateCamerasForShape(shapeDef);
        
        // Update shape details in the UI - make sure this is called
        console.log("Shape created, updating shape details for UI...");
        try {
            updateShapeDetails(currentShape);
            console.log("Shape details updated successfully for type:", currentShape.type);
        } catch (err) {
            console.error("Error updating shape details:", err);
        }
        
        // Update the transition based on current value
        updateShapeTransition();
        
        console.log("Shape created successfully, type:", currentShape.type);
        
        // Register for transition updates
        eventBus.on('transition-updated', updateShapeTransition);
        
    } catch (error) {
        console.error("Error creating shape:", error);
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
        
        // Clear specific mobile meshes if they were created
        if (window.mobileTopScene && currentShape.mobileTopMesh) {
            window.mobileTopScene.remove(currentShape.mobileTopMesh);
        }
        
        if (window.mobileFrontScene && currentShape.mobileFrontMesh) {
            window.mobileFrontScene.remove(currentShape.mobileFrontMesh);
        }
        
        if (window.mobileRightScene && currentShape.mobileRightMesh) {
            window.mobileRightScene.remove(currentShape.mobileRightMesh);
        }
        
        if (window.mobileLeftScene && currentShape.mobileLeftMesh) {
            window.mobileLeftScene.remove(currentShape.mobileLeftMesh);
        }
        
        // Also do a full clean of mobile scenes to be thorough
        // Keep only grid and light elements
        if (window.mobileTopScene) {
            window.mobileTopScene.children = window.mobileTopScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light || child instanceof THREE.Group || child instanceof THREE.AxesHelper || child instanceof THREE.LineSegments;
            });
        }
        
        if (window.mobileFrontScene) {
            window.mobileFrontScene.children = window.mobileFrontScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light || child instanceof THREE.Group || child instanceof THREE.AxesHelper || child instanceof THREE.LineSegments;
            });
        }
        
        if (window.mobileRightScene) {
            window.mobileRightScene.children = window.mobileRightScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light || child instanceof THREE.Group || child instanceof THREE.AxesHelper || child instanceof THREE.LineSegments;
            });
        }
        
        if (window.mobileLeftScene) {
            window.mobileLeftScene.children = window.mobileLeftScene.children.filter(child => {
                return child instanceof THREE.GridHelper || child instanceof THREE.Light || child instanceof THREE.Group || child instanceof THREE.AxesHelper || child instanceof THREE.LineSegments;
            });
        }
        
        // Force re-render all mobile views to ensure the scene is updated
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
    
    currentShape = null;
    updateCurrentShapeRef(null);
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
}

// Update shape transition based on slider value - FIXED VERSION
function updateShapeTransition() {
    if (!currentShape) {
        console.log("No current shape to transition");
        return;
    }
    
    // Get transition value directly from the slider
    const transitionValue = document.getElementById('transition-slider').value / 100;
    
    console.log("Updating shape transition, value:", transitionValue);
    
    // Apply opacity to main 3D shape - directly inspect and update child meshes
    if (currentShape.mainMesh) {
        // Always keep visible but change opacity
        currentShape.mainMesh.visible = true;
        
        // Check if cross sections are enabled
        const crossSectionEnabled = document.getElementById('cross-section-toggle').checked;
        
        // Handle shapes with cross-sections differently to prevent color issues
        if (crossSectionEnabled) {
            // When cross-section is active, more carefully update the materials to avoid color conflicts
            currentShape.mainMesh.traverse(child => {
                // Skip objects marked as cross-section meshes
                if (child.isCrossSectionMesh) return;
                
                if (child.isMesh) {
                    // Store original material properties if not already stored
                    if (!child.originalMaterial) {
                        if (Array.isArray(child.material)) {
                            child.originalMaterial = child.material.map(mat => mat.clone());
                        } else {
                            child.originalMaterial = child.material.clone();
                        }
                    }
                    
                    // Update materials with strict color preservation
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat, index) => {
                                // Always restore the exact original color
                                if (child.originalMaterial?.[index]?._originalColor) {
                                    mat.color.copy(child.originalMaterial[index]._originalColor);
                                }
                                mat.transparent = true;
                                mat.opacity = Math.max(0.2, transitionValue * 0.9);
                                mat.needsUpdate = true;
                            });
                        } else {
                            // Always restore the exact original color
                            if (child.originalMaterial?._originalColor) {
                                child.material.color.copy(child.originalMaterial._originalColor);
                            }
                            child.material.transparent = true;
                            child.material.opacity = Math.max(0.2, transitionValue * 0.9);
                            child.material.needsUpdate = true;
                        }
                    }
                }
            });
        } else {
            // Use standard opacity updating when no cross-section
            updateMeshOpacity(currentShape.mainMesh, transitionValue);
        }
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
    
    // Make sure mobile orthographic views are also always visible
    if (currentShape.mobileTopMesh) currentShape.mobileTopMesh.visible = true;
    if (currentShape.mobileFrontMesh) currentShape.mobileFrontMesh.visible = true;
    if (currentShape.mobileRightMesh) currentShape.mobileRightMesh.visible = true;
    if (currentShape.mobileLeftMesh) currentShape.mobileLeftMesh.visible = true;
    
    // Update opacity of orthographic views based on transition value without scaling
    if (currentShape.topMesh) updateMeshOpacity(currentShape.topMesh, transitionValue);
    if (currentShape.frontMesh) updateMeshOpacity(currentShape.frontMesh, transitionValue);
    if (currentShape.rightMesh) updateMeshOpacity(currentShape.rightMesh, transitionValue);
    if (currentShape.leftMesh) updateMeshOpacity(currentShape.leftMesh, transitionValue);
    
    // Also update opacity for mobile views
    if (currentShape.mobileTopMesh) updateMeshOpacity(currentShape.mobileTopMesh, transitionValue);
    if (currentShape.mobileFrontMesh) updateMeshOpacity(currentShape.mobileFrontMesh, transitionValue);
    if (currentShape.mobileRightMesh) updateMeshOpacity(currentShape.mobileRightMesh, transitionValue);
    if (currentShape.mobileLeftMesh) updateMeshOpacity(currentShape.mobileLeftMesh, transitionValue);
    
    // Force render the mobile views to ensure changes are visible
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

// (Removed duplicate function)

// Parse custom shape description and generate the shape
export function parseAndGenerateShape(description) {
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

export { shapeDefinitions, currentShape, updateShapeTransition };