/**
 * Base Shape class that all specific shapes extend
 */
import { CONFIG } from '../config.js';

export class Shape {
    /**
     * Constructor for the base Shape class
     * @param {object} options - Shape options
     */
    constructor(options = {}) {
        this.type = 'abstract';
        this.dimensions = {};
        
        // Main Three.js objects
        this.mainMesh = null;
        this.topMesh = null;
        this.frontMesh = null;
        this.rightMesh = null;
        this.leftMesh = null;
        this.wireframe = null;
        
        // Materials
        this.material = new THREE.MeshStandardMaterial({
            color: options.color || CONFIG.SHAPE.defaultColor,
            transparent: true,
            opacity: options.opacity || CONFIG.SHAPE.defaultOpacity,
            side: THREE.DoubleSide
        });
        
        this.wireframeMaterial = new THREE.MeshBasicMaterial({ 
            color: options.wireframeColor || CONFIG.SHAPE.wireframeColor, 
            wireframe: true 
        });
        
        this.edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, 
            linewidth: 2 
        });
        
        this.gridLinesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, 
            linewidth: 1, 
            transparent: true, 
            opacity: 0.4 
        });
    }
    
    /**
     * Create the geometry for the shape (to be implemented by subclasses)
     * @returns {THREE.Geometry} The shape's geometry
     */
    createGeometry() {
        throw new Error('createGeometry method must be implemented by subclass');
    }
    
    /**
     * Create the main 3D mesh for the shape
     * @returns {THREE.Group} Group containing the main mesh and its edges
     */
    createMainMesh() {
        const geometry = this.createGeometry();
        if (!geometry) return null;
        
        // Create main mesh
        const mesh = new THREE.Mesh(geometry, this.material);
        
        // Create edge geometry
        const edges = new THREE.EdgesGeometry(geometry);
        const edgeLines = new THREE.LineSegments(edges, this.edgeMaterial);
        
        // Create grid lines
        const gridLines = this.createGridLines(geometry);
        
        // Group mesh and edges
        const group = new THREE.Group();
        group.add(mesh);
        group.add(edgeLines);
        if (gridLines) group.add(gridLines);
        
        return group;
    }
    
    /**
     * Create grid lines for better visualization of dimensions
     * @param {THREE.Geometry} geometry - The shape's geometry
     * @returns {THREE.Object3D} The grid lines object
     */
    createGridLines(geometry) {
        // Default implementation - override in subclasses
        return null;
    }
    
    /**
     * Create wireframe for shape transition
     * @returns {THREE.Mesh} Wireframe mesh
     */
    createWireframe() {
        const geometry = this.createGeometry();
        if (!geometry) return null;
        
        return new THREE.Mesh(geometry, this.wireframeMaterial);
    }
    
    /**
     * Create meshes for orthographic projections
     * @returns {object} Object containing meshes for each orthographic view
     */
    createProjectionMeshes() {
        const geometry = this.createGeometry();
        if (!geometry) return {};
        
        // Create meshes for orthographic views
        const topGeometry = geometry.clone();
        const frontGeometry = geometry.clone();
        const rightGeometry = geometry.clone();
        const leftGeometry = geometry.clone();
        
        // Create meshes with the same material
        const topMesh = new THREE.Mesh(topGeometry, this.material.clone());
        const frontMesh = new THREE.Mesh(frontGeometry, this.material.clone());
        const rightMesh = new THREE.Mesh(rightGeometry, this.material.clone());
        const leftMesh = new THREE.Mesh(leftGeometry, this.material.clone());
        
        // Add edge lines
        const topEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(topGeometry), 
            this.edgeMaterial.clone()
        );
        
        const frontEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(frontGeometry), 
            this.edgeMaterial.clone()
        );
        
        const rightEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(rightGeometry), 
            this.edgeMaterial.clone()
        );
        
        const leftEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(leftGeometry), 
            this.edgeMaterial.clone()
        );
        
        // Set rotations for each view (to be customized by subclasses)
        this.setProjectionRotations(topMesh, frontMesh, rightMesh, leftMesh);
        this.setProjectionRotations(topEdges, frontEdges, rightEdges, leftEdges);
        
        // Group meshes with their edges
        const topGroup = new THREE.Group();
        topGroup.add(topMesh);
        topGroup.add(topEdges);
        
        const frontGroup = new THREE.Group();
        frontGroup.add(frontMesh);
        frontGroup.add(frontEdges);
        
        const rightGroup = new THREE.Group();
        rightGroup.add(rightMesh);
        rightGroup.add(rightEdges);
        
        const leftGroup = new THREE.Group();
        leftGroup.add(leftMesh);
        leftGroup.add(leftEdges);
        
        return {
            topMesh: topGroup,
            frontMesh: frontGroup,
            rightMesh: rightGroup,
            leftMesh: leftGroup
        };
    }
    
    /**
     * Set rotations for the projection meshes
     * @param {THREE.Mesh} topMesh - Top view mesh
     * @param {THREE.Mesh} frontMesh - Front view mesh
     * @param {THREE.Mesh} rightMesh - Right view mesh
     * @param {THREE.Mesh} leftMesh - Left view mesh
     */
    setProjectionRotations(topMesh, frontMesh, rightMesh, leftMesh) {
        // Default rotations - override in subclasses if needed
        topMesh.rotation.x = Math.PI / 2;
        frontMesh.rotation.x = 0;
        rightMesh.rotation.y = Math.PI / 2;
        leftMesh.rotation.y = -Math.PI / 2;
    }
    
    /**
     * Get the volume calculation details
     * @returns {object} Volume calculation details
     */
    getVolumeDetails() {
        return {
            formula: 'Volume calculation not implemented for this shape',
            value: 0
        };
    }
    
    /**
     * Get the surface area calculation details
     * @returns {object} Surface area calculation details
     */
    getSurfaceAreaDetails() {
        return {
            formula: 'Surface area calculation not implemented for this shape',
            value: 0
        };
    }
    
    /**
     * Get educational details for the shape
     * @returns {object} Educational details
     */
    getEducationalDetails() {
        return {
            description: 'Generic 3D shape',
            properties: [],
            formulas: [],
            netDescription: 'Net visualization not available for this shape'
        };
    }
    
    /**
     * Create the shape and all its components
     */
    create() {
        this.mainMesh = this.createMainMesh();
        this.wireframe = this.createWireframe();
        
        const projectionMeshes = this.createProjectionMeshes();
        this.topMesh = projectionMeshes.topMesh;
        this.frontMesh = projectionMeshes.frontMesh;
        this.rightMesh = projectionMeshes.rightMesh;
        this.leftMesh = projectionMeshes.leftMesh;
    }
}