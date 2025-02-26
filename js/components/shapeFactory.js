/**
 * ShapeFactory - Factory class for creating shape instances
 */
import { Cube } from '../shapes/cube.js';
// Import other shapes as needed

export class ShapeFactory {
    /**
     * Initialize the shape factory
     * @param {EventBus} eventBus - The application event bus
     */
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    
    /**
     * Create a shape based on its definition
     * @param {object} shapeDef - Shape definition from config
     * @returns {Shape} The created shape
     */
    createShape(shapeDef) {
        console.log(`Creating shape: ${shapeDef.type}`);
        
        let shape;
        
        switch (shapeDef.type) {
            case 'cube':
                shape = new Cube({
                    size: shapeDef.size
                });
                break;
                
            case 'rectangularPrism':
                // When RectangularPrism class is implemented
                /* 
                shape = new RectangularPrism({
                    width: shapeDef.width,
                    height: shapeDef.height,
                    length: shapeDef.length
                });
                */
                shape = this.createTempRectangularPrism(shapeDef);
                break;
                
            case 'triangularPrism':
                // When TriangularPrism class is implemented
                /*
                shape = new TriangularPrism({
                    height: shapeDef.height,
                    base: shapeDef.base
                });
                */
                shape = this.createTempTriangularPrism(shapeDef);
                break;
                
            case 'cylinder':
                // When Cylinder class is implemented
                /*
                shape = new Cylinder({
                    radius: shapeDef.radius,
                    height: shapeDef.height,
                    radiusSegments: shapeDef.radiusSegments
                });
                */
                shape = this.createTempCylinder(shapeDef);
                break;
                
            case 'cone':
                // When Cone class is implemented
                /*
                shape = new Cone({
                    radius: shapeDef.radius,
                    height: shapeDef.height,
                    radiusSegments: shapeDef.radiusSegments
                });
                */
                shape = this.createTempCone(shapeDef);
                break;
                
            case 'sphere':
                // When Sphere class is implemented
                /*
                shape = new Sphere({
                    radius: shapeDef.radius,
                    widthSegments: shapeDef.widthSegments,
                    heightSegments: shapeDef.heightSegments
                });
                */
                shape = this.createTempSphere(shapeDef);
                break;
                
            default:
                console.error(`Unknown shape type: ${shapeDef.type}`);
                return null;
        }
        
        // Create the shape and its components
        if (shape) {
            shape.create();
        }
        
        return shape;
    }
    
    /**
     * Temporary method to create a rectangular prism until proper class is implemented
     * @param {object} shapeDef - Shape definition
     * @returns {object} Shape object
     */
    createTempRectangularPrism(shapeDef) {
        // Create a basic shape with minimum required properties
        return {
            type: 'rectangularPrism',
            dimensions: {
                width: shapeDef.width,
                height: shapeDef.height,
                length: shapeDef.length
            },
            create: function() {
                const geometry = new THREE.BoxGeometry(
                    this.dimensions.width,
                    this.dimensions.height,
                    this.dimensions.length
                );
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true 
                });
                
                // Create main mesh
                const mesh = new THREE.Mesh(geometry, material);
                
                // Create edge geometry
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                
                // Group mesh and edges
                const group = new THREE.Group();
                group.add(mesh);
                group.add(edgeLines);
                
                this.mainMesh = group;
                this.wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                
                // Simple orthographic views
                this.topMesh = group.clone();
                this.frontMesh = group.clone();
                this.rightMesh = group.clone();
                this.leftMesh = group.clone();
            }
        };
    }
    
    /**
     * Temporary method to create a triangular prism until proper class is implemented
     * @param {object} shapeDef - Shape definition
     * @returns {object} Shape object
     */
    createTempTriangularPrism(shapeDef) {
        // Create a basic shape with minimum required properties
        return {
            type: 'triangularPrism',
            dimensions: {
                height: shapeDef.height,
                side1: shapeDef.base.side1,
                side2: shapeDef.base.side2,
                side3: Math.sqrt(shapeDef.base.side1 * shapeDef.base.side1 + shapeDef.base.side2 * shapeDef.base.side2)
            },
            create: function() {
                // Create triangular shape
                const shape = new THREE.Shape();
                shape.moveTo(0, 0);
                shape.lineTo(this.dimensions.side1, 0);
                shape.lineTo(0, this.dimensions.side2);
                shape.lineTo(0, 0);
                
                const extrudeSettings = {
                    depth: this.dimensions.height,
                    bevelEnabled: false
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                geometry.center();
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true 
                });
                
                // Create main mesh
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = Math.PI / 2;
                
                // Create edge geometry
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                edgeLines.rotation.x = Math.PI / 2;
                
                // Group mesh and edges
                const group = new THREE.Group();
                group.add(mesh);
                group.add(edgeLines);
                
                this.mainMesh = group;
                
                // Create wireframe
                const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                wireframe.rotation.x = Math.PI / 2;
                this.wireframe = wireframe;
                
                // Simple orthographic views
                this.topMesh = group.clone();
                this.frontMesh = group.clone();
                this.rightMesh = group.clone();
                this.leftMesh = group.clone();
            }
        };
    }
    
    /**
     * Temporary method to create a cylinder until proper class is implemented
     * @param {object} shapeDef - Shape definition
     * @returns {object} Shape object
     */
    createTempCylinder(shapeDef) {
        // Create a basic shape with minimum required properties
        return {
            type: 'cylinder',
            dimensions: {
                radius: shapeDef.radius,
                height: shapeDef.height,
                radiusSegments: shapeDef.radiusSegments
            },
            create: function() {
                const geometry = new THREE.CylinderGeometry(
                    this.dimensions.radius,
                    this.dimensions.radius,
                    this.dimensions.height,
                    this.dimensions.radiusSegments
                );
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true 
                });
                
                // Create main mesh
                const mesh = new THREE.Mesh(geometry, material);
                
                // Create edge geometry
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                
                // Group mesh and edges
                const group = new THREE.Group();
                group.add(mesh);
                group.add(edgeLines);
                
                this.mainMesh = group;
                this.wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                
                // Simple orthographic views
                this.topMesh = group.clone();
                this.frontMesh = group.clone();
                this.rightMesh = group.clone();
                this.leftMesh = group.clone();
            }
        };
    }
    
    /**
     * Temporary method to create a cone until proper class is implemented
     * @param {object} shapeDef - Shape definition
     * @returns {object} Shape object
     */
    createTempCone(shapeDef) {
        // Create a basic shape with minimum required properties
        return {
            type: 'cone',
            dimensions: {
                radius: shapeDef.radius,
                height: shapeDef.height,
                radiusSegments: shapeDef.radiusSegments
            },
            create: function() {
                const geometry = new THREE.ConeGeometry(
                    this.dimensions.radius,
                    this.dimensions.height,
                    this.dimensions.radiusSegments
                );
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true 
                });
                
                // Create main mesh
                const mesh = new THREE.Mesh(geometry, material);
                
                // Create edge geometry
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                
                // Group mesh and edges
                const group = new THREE.Group();
                group.add(mesh);
                group.add(edgeLines);
                
                this.mainMesh = group;
                this.wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                
                // Simple orthographic views
                this.topMesh = group.clone();
                this.frontMesh = group.clone();
                this.rightMesh = group.clone();
                this.leftMesh = group.clone();
            }
        };
    }
    
    /**
     * Temporary method to create a sphere until proper class is implemented
     * @param {object} shapeDef - Shape definition
     * @returns {object} Shape object
     */
    createTempSphere(shapeDef) {
        // Create a basic shape with minimum required properties
        return {
            type: 'sphere',
            dimensions: {
                radius: shapeDef.radius,
                widthSegments: shapeDef.widthSegments,
                heightSegments: shapeDef.heightSegments
            },
            create: function() {
                const geometry = new THREE.SphereGeometry(
                    this.dimensions.radius,
                    this.dimensions.widthSegments,
                    this.dimensions.heightSegments
                );
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true 
                });
                
                // Create main mesh
                const mesh = new THREE.Mesh(geometry, material);
                
                // Create edge geometry
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                
                // Group mesh and edges
                const group = new THREE.Group();
                group.add(mesh);
                group.add(edgeLines);
                
                this.mainMesh = group;
                this.wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                
                // Simple orthographic views
                this.topMesh = group.clone();
                this.frontMesh = group.clone();
                this.rightMesh = group.clone();
                this.leftMesh = group.clone();
            }
        };
    }
}