// A cube is a special case of rectangular prism
import { createRectangularPrism } from './rectangularPrism.js';

export function createCube(size) {
    return createRectangularPrism(size, size, size);
}