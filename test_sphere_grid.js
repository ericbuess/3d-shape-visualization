// Test script to check grid scaling with different sphere sizes

// Import necessary modules
import { createShape } from './js/components/shapeFactory.js';
import { animate, init } from './js/components/scene.js';

// Initialize the scene
init();

// Start animation loop
animate();

// Function to create a sphere with a specific radius
function testSphere(radius) {
    console.log(`Creating sphere with radius ${radius}`);
    
    const sphereDefinition = {
        type: 'sphere',
        radius: radius,
        widthSegments: 32,
        heightSegments: 16
    };
    
    createShape(sphereDefinition);
    
    // Log the grid size being used
    console.log('Grid size calculated for this sphere:');
    // We can't directly access the grid size, but we can observe it in the UI
}

// Wait for scene to initialize
setTimeout(() => {
    // Test with radius 10
    testSphere(10);
    
    // After 5 seconds, switch to radius 20
    setTimeout(() => {
        testSphere(20);
    }, 5000);
    
}, 1000);
