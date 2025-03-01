// Unified projection functions for creating 2D projections of 3D shapes

// Create a top projection (looking down from +y)
export function createTopProjection(width, length, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            0, 0, 0,
            width, 0, 0,
            0, length, 0,
            0, 0, 0
        ]);
    } else {
        vertices = new Float32Array([
            -width/2, -length/2, 0,
            width/2, -length/2, 0,
            width/2, length/2, 0,
            -width/2, length/2, 0,
            -width/2, -length/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

// Create a front projection (looking from +z)
export function createFrontProjection(width, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -width/2, -height/2, 0,
            width/2, -height/2, 0,
            width/2, height/2, 0,
            -width/2, height/2, 0,
            -width/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -width/2, -height/2, 0,
            width/2, -height/2, 0,
            width/2, height/2, 0,
            -width/2, height/2, 0,
            -width/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

// Create a right side projection (looking from +x)
export function createRightProjection(length, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            0, height/2, 0,
            -length/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            length/2, height/2, 0,
            -length/2, height/2, 0,
            -length/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}

// Create a left side projection (looking from -x)
export function createLeftProjection(length, height, type) {
    const geometry = new THREE.BufferGeometry();
    let vertices;
    
    if (type === 'triangularPrism') {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            0, height/2, 0,
            -length/2, -height/2, 0
        ]);
    } else {
        vertices = new Float32Array([
            -length/2, -height/2, 0,
            length/2, -height/2, 0,
            length/2, height/2, 0,
            -length/2, height/2, 0,
            -length/2, -height/2, 0
        ]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
}