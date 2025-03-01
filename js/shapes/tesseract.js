// Create the wireframe material directly to avoid circular imports
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Create a tesseract (4D hypercube) projection into 3D
export function createTesseract(size) {
    // A tesseract is a 4D hypercube projected into 3D space
    // It can be visualized as a cube within a cube with connecting edges
    
    // Create materials
    const outerMaterial = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const innerMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b59b6, // Different color for inner cube
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    // Create edge materials
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const connectingEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
    
    // Create grid lines material
    const gridLinesMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        linewidth: 1, 
        transparent: true, 
        opacity: 0.4 
    });
    
    // Create outer cube (larger)
    const outerSize = size;
    const outerGeometry = new THREE.BoxGeometry(outerSize, outerSize, outerSize);
    const outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
    
    // Create inner cube (smaller)
    const innerSize = size * 0.6; // Inner cube is 60% of outer cube's size
    const innerGeometry = new THREE.BoxGeometry(innerSize, innerSize, innerSize);
    const innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
    
    // Create edge geometry for outer cube
    const outerEdges = new THREE.EdgesGeometry(outerGeometry);
    const outerEdgeLines = new THREE.LineSegments(outerEdges, edgeMaterial);
    
    // Create edge geometry for inner cube
    const innerEdges = new THREE.EdgesGeometry(innerGeometry);
    const innerEdgeLines = new THREE.LineSegments(innerEdges, edgeMaterial);
    
    // Create connecting edges between the cubes (representing the 4D connections)
    const connectingEdgesGeometry = new THREE.BufferGeometry();
    
    // Calculate outer and inner cube vertices
    const halfOuterSize = outerSize / 2;
    const halfInnerSize = innerSize / 2;
    
    // Define vertices for outer cube
    const outerVertices = [
        [-halfOuterSize, -halfOuterSize, -halfOuterSize],
        [halfOuterSize, -halfOuterSize, -halfOuterSize],
        [halfOuterSize, halfOuterSize, -halfOuterSize],
        [-halfOuterSize, halfOuterSize, -halfOuterSize],
        [-halfOuterSize, -halfOuterSize, halfOuterSize],
        [halfOuterSize, -halfOuterSize, halfOuterSize],
        [halfOuterSize, halfOuterSize, halfOuterSize],
        [-halfOuterSize, halfOuterSize, halfOuterSize]
    ];
    
    // Define vertices for inner cube
    const innerVertices = [
        [-halfInnerSize, -halfInnerSize, -halfInnerSize],
        [halfInnerSize, -halfInnerSize, -halfInnerSize],
        [halfInnerSize, halfInnerSize, -halfInnerSize],
        [-halfInnerSize, halfInnerSize, -halfInnerSize],
        [-halfInnerSize, -halfInnerSize, halfInnerSize],
        [halfInnerSize, -halfInnerSize, halfInnerSize],
        [halfInnerSize, halfInnerSize, halfInnerSize],
        [-halfInnerSize, halfInnerSize, halfInnerSize]
    ];
    
    // Create connecting edges (from each vertex of the outer cube to the corresponding vertex of the inner cube)
    const linePositions = [];
    
    // Connect corresponding vertices of the outer and inner cubes
    for (let i = 0; i < 8; i++) {
        linePositions.push(
            outerVertices[i][0], outerVertices[i][1], outerVertices[i][2],
            innerVertices[i][0], innerVertices[i][1], innerVertices[i][2]
        );
    }
    
    connectingEdgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const connectingEdges = new THREE.LineSegments(connectingEdgesGeometry, connectingEdgeMaterial);
    
    // Create grid lines for both cubes to show voxel units clearly
    const gridLinesGeometry = new THREE.BufferGeometry();
    const gridLinePositions = [];
    
    // Add grid lines for outer cube (similar to rectangular prism grid lines)
    // Create horizontal lines along width
    for (let y = -halfOuterSize; y <= halfOuterSize; y += 1) {
        for (let z = -halfOuterSize; z <= halfOuterSize; z += 1) {
            if (y % Math.ceil(outerSize/10) === 0 && z % Math.ceil(outerSize/10) === 0) {
                gridLinePositions.push(-halfOuterSize, y, z, halfOuterSize, y, z);
            }
        }
    }
    
    // Create vertical lines along height
    for (let x = -halfOuterSize; x <= halfOuterSize; x += 1) {
        for (let z = -halfOuterSize; z <= halfOuterSize; z += 1) {
            if (x % Math.ceil(outerSize/10) === 0 && z % Math.ceil(outerSize/10) === 0) {
                gridLinePositions.push(x, -halfOuterSize, z, x, halfOuterSize, z);
            }
        }
    }
    
    // Create depth lines along length
    for (let x = -halfOuterSize; x <= halfOuterSize; x += 1) {
        for (let y = -halfOuterSize; y <= halfOuterSize; y += 1) {
            if (x % Math.ceil(outerSize/10) === 0 && y % Math.ceil(outerSize/10) === 0) {
                gridLinePositions.push(x, y, -halfOuterSize, x, y, halfOuterSize);
            }
        }
    }
    
    // Add grid lines for inner cube
    // Create horizontal lines along width
    for (let y = -halfInnerSize; y <= halfInnerSize; y += 1) {
        for (let z = -halfInnerSize; z <= halfInnerSize; z += 1) {
            if (y % Math.ceil(innerSize/8) === 0 && z % Math.ceil(innerSize/8) === 0) {
                gridLinePositions.push(-halfInnerSize, y, z, halfInnerSize, y, z);
            }
        }
    }
    
    // Create vertical lines along height
    for (let x = -halfInnerSize; x <= halfInnerSize; x += 1) {
        for (let z = -halfInnerSize; z <= halfInnerSize; z += 1) {
            if (x % Math.ceil(innerSize/8) === 0 && z % Math.ceil(innerSize/8) === 0) {
                gridLinePositions.push(x, -halfInnerSize, z, x, halfInnerSize, z);
            }
        }
    }
    
    // Create depth lines along length
    for (let x = -halfInnerSize; x <= halfInnerSize; x += 1) {
        for (let y = -halfInnerSize; y <= halfInnerSize; y += 1) {
            if (x % Math.ceil(innerSize/8) === 0 && y % Math.ceil(innerSize/8) === 0) {
                gridLinePositions.push(x, y, -halfInnerSize, x, y, halfInnerSize);
            }
        }
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridLinePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create vertex markers for educational purposes
    const vertexGeometry = new THREE.SphereGeometry(size * 0.03, 8, 8);
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const vertexMarkers = new THREE.Group();
    
    // Add vertices for outer cube
    outerVertices.forEach(pos => {
        const vertex = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertex.position.set(pos[0], pos[1], pos[2]);
        vertexMarkers.add(vertex);
    });
    
    // Add vertices for inner cube
    innerVertices.forEach(pos => {
        const vertex = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertex.position.set(pos[0], pos[1], pos[2]);
        vertexMarkers.add(vertex);
    });
    
    // Group everything together for the main 3D view
    const mainGroup = new THREE.Group();
    mainGroup.add(outerCube);
    mainGroup.add(innerCube);
    mainGroup.add(outerEdgeLines);
    mainGroup.add(innerEdgeLines);
    mainGroup.add(connectingEdges);
    mainGroup.add(gridLines);
    mainGroup.add(vertexMarkers);
    
    // Create orthographic views (top, front, right, left)
    // Each view will have its own copy of the tesseract
    
    // Create top view
    const topGroup = createOrthographicView(size, outerMaterial.clone(), innerMaterial.clone(), edgeMaterial.clone());
    
    // Create front view
    const frontGroup = createOrthographicView(size, outerMaterial.clone(), innerMaterial.clone(), edgeMaterial.clone());
    
    // Create right view
    const rightGroup = createOrthographicView(size, outerMaterial.clone(), innerMaterial.clone(), edgeMaterial.clone());
    
    // Create left view
    const leftGroup = createOrthographicView(size, outerMaterial.clone(), innerMaterial.clone(), edgeMaterial.clone());
    
    // Create wireframe for transitions
    const wireframeGroup = new THREE.Group();
    
    // Outer cube wireframe
    const outerWireframe = new THREE.Mesh(outerGeometry.clone(), wireframeMaterial);
    
    // Inner cube wireframe
    const innerWireframe = new THREE.Mesh(innerGeometry.clone(), wireframeMaterial);
    
    // Connecting edges wireframe
    const connectingEdgesWireframe = connectingEdges.clone();
    
    wireframeGroup.add(outerWireframe);
    wireframeGroup.add(innerWireframe);
    wireframeGroup.add(connectingEdgesWireframe);
    
    return {
        mainMesh: mainGroup,
        topMesh: topGroup,
        frontMesh: frontGroup,
        rightMesh: rightGroup,
        leftMesh: leftGroup,
        wireframe: wireframeGroup,
        dimensions: { size },
        type: 'tesseract'
    };
}

// Helper function to create orthographic views
function createOrthographicView(size, outerMaterial, innerMaterial, edgeMaterial) {
    const outerSize = size;
    const innerSize = size * 0.6;
    
    // Create geometries
    const outerGeometry = new THREE.BoxGeometry(outerSize, outerSize, outerSize);
    const innerGeometry = new THREE.BoxGeometry(innerSize, innerSize, innerSize);
    
    // Create meshes
    const outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
    const innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
    
    // Create edges
    const outerEdges = new THREE.EdgesGeometry(outerGeometry);
    const innerEdges = new THREE.EdgesGeometry(innerGeometry);
    
    const outerEdgeLines = new THREE.LineSegments(outerEdges, edgeMaterial);
    const innerEdgeLines = new THREE.LineSegments(innerEdges, edgeMaterial);
    
    // Create connecting edges between the cubes
    const connectingEdgesGeometry = new THREE.BufferGeometry();
    
    // Calculate outer and inner cube vertices
    const halfOuterSize = outerSize / 2;
    const halfInnerSize = innerSize / 2;
    
    // Define vertices for outer cube
    const outerVertices = [
        [-halfOuterSize, -halfOuterSize, -halfOuterSize],
        [halfOuterSize, -halfOuterSize, -halfOuterSize],
        [halfOuterSize, halfOuterSize, -halfOuterSize],
        [-halfOuterSize, halfOuterSize, -halfOuterSize],
        [-halfOuterSize, -halfOuterSize, halfOuterSize],
        [halfOuterSize, -halfOuterSize, halfOuterSize],
        [halfOuterSize, halfOuterSize, halfOuterSize],
        [-halfOuterSize, halfOuterSize, halfOuterSize]
    ];
    
    // Define vertices for inner cube
    const innerVertices = [
        [-halfInnerSize, -halfInnerSize, -halfInnerSize],
        [halfInnerSize, -halfInnerSize, -halfInnerSize],
        [halfInnerSize, halfInnerSize, -halfInnerSize],
        [-halfInnerSize, halfInnerSize, -halfInnerSize],
        [-halfInnerSize, -halfInnerSize, halfInnerSize],
        [halfInnerSize, -halfInnerSize, halfInnerSize],
        [halfInnerSize, halfInnerSize, halfInnerSize],
        [-halfInnerSize, halfInnerSize, halfInnerSize]
    ];
    
    // Create connecting edges (from each vertex of the outer cube to the corresponding vertex of the inner cube)
    const linePositions = [];
    
    // Connect corresponding vertices of the outer and inner cubes
    for (let i = 0; i < 8; i++) {
        linePositions.push(
            outerVertices[i][0], outerVertices[i][1], outerVertices[i][2],
            innerVertices[i][0], innerVertices[i][1], innerVertices[i][2]
        );
    }
    
    connectingEdgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const connectingEdges = new THREE.LineSegments(connectingEdgesGeometry, edgeMaterial);
    
    // Group everything together
    const group = new THREE.Group();
    group.add(outerCube);
    group.add(innerCube);
    group.add(outerEdgeLines);
    group.add(innerEdgeLines);
    group.add(connectingEdges);
    
    return group;
}