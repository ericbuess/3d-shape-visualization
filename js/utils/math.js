/**
 * Math utility functions for geometry calculations
 */

/**
 * Calculate the volume of a triangular prism
 * @param {number} height - Height of the prism
 * @param {number} side1 - First side of the triangular base
 * @param {number} side2 - Second side of the triangular base
 * @returns {number} Volume
 */
export function calculateTriangularPrismVolume(height, side1, side2) {
    const baseArea = (side1 * side2) / 2;
    return baseArea * height;
}

/**
 * Calculate the surface area of a triangular prism
 * @param {number} height - Height of the prism
 * @param {number} side1 - First side of the triangular base
 * @param {number} side2 - Second side of the triangular base
 * @param {number} side3 - Third side of the triangular base (hypotenuse)
 * @returns {object} Object containing baseArea, lateralArea, and totalArea
 */
export function calculateTriangularPrismSurfaceArea(height, side1, side2, side3) {
    const baseArea = (side1 * side2) / 2;
    const basePerimeter = side1 + side2 + side3;
    const lateralArea = basePerimeter * height;
    const totalArea = 2 * baseArea + lateralArea;
    
    return {
        baseArea,
        lateralArea,
        totalArea
    };
}

/**
 * Calculate the volume of a rectangular prism
 * @param {number} width - Width of the prism
 * @param {number} height - Height of the prism 
 * @param {number} length - Length of the prism
 * @returns {number} Volume
 */
export function calculateRectangularPrismVolume(width, height, length) {
    return width * height * length;
}

/**
 * Calculate the surface area of a rectangular prism
 * @param {number} width - Width of the prism
 * @param {number} height - Height of the prism
 * @param {number} length - Length of the prism
 * @returns {object} Object containing face areas and total surface area
 */
export function calculateRectangularPrismSurfaceArea(width, height, length) {
    const frontBackArea = 2 * (width * height);
    const topBottomArea = 2 * (width * length);
    const leftRightArea = 2 * (height * length);
    const totalArea = frontBackArea + topBottomArea + leftRightArea;
    
    return {
        frontBackArea,
        topBottomArea,
        leftRightArea,
        totalArea
    };
}

/**
 * Calculate the volume of a cylinder
 * @param {number} radius - Radius of the cylinder
 * @param {number} height - Height of the cylinder
 * @returns {number} Volume
 */
export function calculateCylinderVolume(radius, height) {
    return Math.PI * radius * radius * height;
}

/**
 * Calculate the surface area of a cylinder
 * @param {number} radius - Radius of the cylinder
 * @param {number} height - Height of the cylinder
 * @returns {object} Object containing component areas and total surface area
 */
export function calculateCylinderSurfaceArea(radius, height) {
    const baseArea = Math.PI * radius * radius;
    const lateralArea = 2 * Math.PI * radius * height;
    const totalArea = 2 * baseArea + lateralArea;
    
    return {
        baseArea,
        lateralArea,
        totalArea
    };
}

/**
 * Calculate the volume of a cone
 * @param {number} radius - Radius of the cone base
 * @param {number} height - Height of the cone
 * @returns {number} Volume
 */
export function calculateConeVolume(radius, height) {
    return (1/3) * Math.PI * radius * radius * height;
}

/**
 * Calculate the surface area of a cone
 * @param {number} radius - Radius of the cone base
 * @param {number} height - Height of the cone
 * @returns {object} Object containing component areas and total surface area
 */
export function calculateConeSurfaceArea(radius, height) {
    const slantHeight = Math.sqrt(radius * radius + height * height);
    const baseArea = Math.PI * radius * radius;
    const lateralArea = Math.PI * radius * slantHeight;
    const totalArea = baseArea + lateralArea;
    
    return {
        baseArea,
        lateralArea,
        totalArea,
        slantHeight
    };
}

/**
 * Calculate the volume of a sphere
 * @param {number} radius - Radius of the sphere
 * @returns {number} Volume
 */
export function calculateSphereVolume(radius) {
    return (4/3) * Math.PI * Math.pow(radius, 3);
}

/**
 * Calculate the surface area of a sphere
 * @param {number} radius - Radius of the sphere
 * @returns {object} Object containing surface area and great circle area
 */
export function calculateSphereSurfaceArea(radius) {
    const surfaceArea = 4 * Math.PI * radius * radius;
    const greatCircleArea = Math.PI * radius * radius;
    
    return {
        surfaceArea,
        greatCircleArea
    };
}