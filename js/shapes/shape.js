// Base shape class that defines the interface for all shapes
export default class Shape {
    constructor() {
        this.mainMesh = null;
        this.topMesh = null;
        this.frontMesh = null;
        this.rightMesh = null;
        this.leftMesh = null;
        this.wireframe = null;
        this.dimensions = {};
        this.type = '';
    }

    // Method to return max dimension for camera positioning
    getMaxDimension() {
        return 5; // Default value, should be overridden by subclasses
    }

    // Method to cleanup shape resources when removed
    cleanup() {
        // Dispose of geometries, materials, etc.
        if (this.mainMesh) {
            // Remove from scene if needed
            // Dispose of geometries and materials
        }
    }
}