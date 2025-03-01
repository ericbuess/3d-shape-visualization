// Create the wireframe material directly to avoid circular imports
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Create a triangular prism
export function createTriangularPrism(height, side1, side2) {
    // Calculate the third side using the Law of Cosines
    // For simplicity, we'll use a right triangle
    const side3 = Math.sqrt(side1 * side1 + side2 * side2);
    
    // Create the geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side1, 0);
    shape.lineTo(0, side2);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
        depth: height,
        bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    
    // Create materials
    const material = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });
    
    // Create edge geometry for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    
    // Add grid lines to show voxel units clearly
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Calculate the bounds of the triangle in 3D space
    const minX = -side1/2;
    const maxX = side1/2;
    const minY = -side2/2;
    const maxY = side2/2;
    const minZ = -height/2;
    const maxZ = height/2;
    
    // Create an array to hold line positions
    const linePositions = [];
    
    // Create horizontal grid lines (in XY plane)
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x += 1) {
        linePositions.push(x, minY, 0, x, maxY, 0); // Front face
        linePositions.push(x, minY, height, x, maxY, height); // Back face
    }
    
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 1) {
        linePositions.push(minX, y, 0, maxX, y, 0); // Front face
        linePositions.push(minX, y, height, maxX, y, height); // Back face
    }
    
    // Create vertical grid lines along Z axis
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x += 1) {
        linePositions.push(x, minY, 0, x, minY, height); // Bottom edge
        linePositions.push(x, maxY, 0, x, maxY, height); // Top edge
    }
    
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 1) {
        linePositions.push(minX, y, 0, minX, y, height); // Left edge
        linePositions.push(maxX, y, 0, maxX, y, height); // Right edge
    }
    
    // Create depth lines
    for (let z = Math.ceil(minZ); z <= Math.floor(maxZ); z += 1) {
        linePositions.push(minX, minY, z, maxX, minY, z); // Bottom edge
        linePositions.push(minX, maxY, z, maxX, maxY, z); // Top edge
        linePositions.push(minX, minY, z, minX, maxY, z); // Left edge
        linePositions.push(maxX, minY, z, maxX, maxY, z); // Right edge
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.rotation.x = Math.PI / 2;
    edgeLines.rotation.x = Math.PI / 2;
    gridLines.rotation.x = Math.PI / 2;
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create full 3D meshes for the orthographic views (not just wireframes)
    // These will be actual 3D objects positioned in the orthographic scenes
    const topMeshGeometry = geometry.clone();
    const frontMeshGeometry = geometry.clone();
    const rightMeshGeometry = geometry.clone();
    const leftMeshGeometry = geometry.clone();
    
    // Create meshes for orthographic views with the same material
    const topMesh = new THREE.Mesh(topMeshGeometry, material.clone());
    const frontMesh = new THREE.Mesh(frontMeshGeometry, material.clone());
    const rightMesh = new THREE.Mesh(rightMeshGeometry, material.clone());
    const leftMesh = new THREE.Mesh(leftMeshGeometry, material.clone());
    
    // Add edge lines to orthographic views
    const topEdges = new THREE.LineSegments(new THREE.EdgesGeometry(topMeshGeometry), edgeMaterial.clone());
    const frontEdges = new THREE.LineSegments(new THREE.EdgesGeometry(frontMeshGeometry), edgeMaterial.clone());
    const rightEdges = new THREE.LineSegments(new THREE.EdgesGeometry(rightMeshGeometry), edgeMaterial.clone());
    const leftEdges = new THREE.LineSegments(new THREE.EdgesGeometry(leftMeshGeometry), edgeMaterial.clone());
    
    // Set correct rotations for orthographic views
    topMesh.rotation.x = Math.PI / 2;
    frontMesh.rotation.x = Math.PI / 2;
    rightMesh.rotation.x = Math.PI / 2;
    rightMesh.rotation.z = Math.PI / 2;
    leftMesh.rotation.x = Math.PI / 2;
    leftMesh.rotation.z = -Math.PI / 2;
    
    topEdges.rotation.x = Math.PI / 2;
    frontEdges.rotation.x = Math.PI / 2;
    rightEdges.rotation.x = Math.PI / 2;
    rightEdges.rotation.z = Math.PI / 2;
    leftEdges.rotation.x = Math.PI / 2;
    leftEdges.rotation.z = -Math.PI / 2;
    
    // Group the meshes with their edges for each view
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
    
    // Create wireframe for transitions
    const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
    wireframe.rotation.x = Math.PI / 2;
    
    return {
        mainMesh: mainGroup,
        topMesh: topGroup,
        frontMesh: frontGroup,
        rightMesh: rightGroup,
        leftMesh: leftGroup,
        wireframe,
        dimensions: { height, side1, side2, side3 },
        type: 'triangularPrism'
    };
}