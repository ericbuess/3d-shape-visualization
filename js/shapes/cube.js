/**
 * Cube shape implementation
 */
import { Shape } from './shape.js';
import { calculateRectangularPrismVolume, calculateRectangularPrismSurfaceArea } from '../utils/math.js';
import { formatNumber } from '../utils/ui.js';

export class Cube extends Shape {
    /**
     * Create a cube
     * @param {object} options - Cube options
     * @param {number} options.size - Size (edge length) of the cube
     */
    constructor(options) {
        super(options);
        
        this.type = 'cube';
        this.dimensions = {
            size: options.size || 3
        };
    }
    
    /**
     * Create cube geometry
     * @returns {THREE.BoxGeometry} The cube geometry
     */
    createGeometry() {
        const { size } = this.dimensions;
        return new THREE.BoxGeometry(size, size, size);
    }
    
    /**
     * Create grid lines for better visualization
     * @param {THREE.Geometry} geometry - The cube geometry
     * @returns {THREE.LineSegments} Grid lines
     */
    createGridLines(geometry) {
        const { size } = this.dimensions;
        const gridLinesGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        
        // Create horizontal lines along width
        for (let y = -size/2; y <= size/2; y += 1) {
            for (let z = -size/2; z <= size/2; z += 1) {
                linePositions.push(-size/2, y, z, size/2, y, z);
            }
        }
        
        // Create vertical lines along height
        for (let x = -size/2; x <= size/2; x += 1) {
            for (let z = -size/2; z <= size/2; z += 1) {
                linePositions.push(x, -size/2, z, x, size/2, z);
            }
        }
        
        // Create depth lines along length
        for (let x = -size/2; x <= size/2; x += 1) {
            for (let y = -size/2; y <= size/2; y += 1) {
                linePositions.push(x, y, -size/2, x, y, size/2);
            }
        }
        
        gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        return new THREE.LineSegments(gridLinesGeometry, this.gridLinesMaterial);
    }
    
    /**
     * Get the volume calculation details
     * @returns {object} Volume calculation details
     */
    getVolumeDetails() {
        const { size } = this.dimensions;
        const volume = calculateRectangularPrismVolume(size, size, size);
        
        return {
            formula: `V = s³ = ${size}³ = ${volume} cubic units`,
            value: volume
        };
    }
    
    /**
     * Get the surface area calculation details
     * @returns {object} Surface area calculation details
     */
    getSurfaceAreaDetails() {
        const { size } = this.dimensions;
        const { totalArea } = calculateRectangularPrismSurfaceArea(size, size, size);
        const faceArea = size * size;
        
        return {
            formula: `SA = 6s² = 6 × ${size}² = ${totalArea} square units`,
            value: totalArea,
            faceArea: faceArea,
            faceDiagonal: formatNumber(size * Math.sqrt(2)),
            spaceDiagonal: formatNumber(size * Math.sqrt(3))
        };
    }
    
    /**
     * Get educational details for the cube
     * @returns {object} Educational details
     */
    getEducationalDetails() {
        const { size } = this.dimensions;
        const volume = calculateRectangularPrismVolume(size, size, size);
        const { totalArea } = calculateRectangularPrismSurfaceArea(size, size, size);
        
        return {
            description: `A cube with sides of ${size} units.`,
            properties: [
                `A cube is a regular hexahedron, one of the five Platonic solids.`,
                `All faces are identical squares.`,
                `All edges have the same length.`,
                `All vertices are identical, with three faces meeting at each vertex.`,
                `The cube has 6 faces, 12 edges, and 8 vertices.`,
                `Each vertex connects exactly 3 edges and 3 faces.`
            ],
            formulas: [
                {
                    title: 'Volume',
                    formula: `V = s³ = ${size}³ = ${volume} cubic units`,
                    explanation: 'The volume of a cube is the cube of its side length.'
                },
                {
                    title: 'Surface Area',
                    formula: `SA = 6s² = 6 × ${size}² = ${totalArea} square units`,
                    explanation: 'The surface area is the sum of the areas of all six faces.'
                },
                {
                    title: 'Face Diagonal',
                    formula: `d = s√2 = ${size} × √2 = ${formatNumber(size * Math.sqrt(2))} units`,
                    explanation: 'The face diagonal is the diagonal of any face of the cube.'
                },
                {
                    title: 'Space Diagonal',
                    formula: `d = s√3 = ${size} × √3 = ${formatNumber(size * Math.sqrt(3))} units`,
                    explanation: 'The space diagonal connects any two vertices that are not on the same face.'
                }
            ],
            netDescription: `The net of a cube consists of 6 identical square faces that can be folded to form the 3D shape.`
        };
    }
}