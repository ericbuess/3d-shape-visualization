// Create the wireframe material directly to avoid circular imports
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Create a rectangular prism
export function createRectangularPrism(width, height, length) {
    // Create the geometry
    const geometry = new THREE.BoxGeometry(width, height, length);
    
    // Create material
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
    
    // Create an array to hold line positions
    const linePositions = [];
    
    // Create horizontal lines along width
    for (let y = -height/2; y <= height/2; y += 1) {
        for (let z = -length/2; z <= length/2; z += 1) {
            linePositions.push(-width/2, y, z, width/2, y, z);
        }
    }
    
    // Create vertical lines along height
    for (let x = -width/2; x <= width/2; x += 1) {
        for (let z = -length/2; z <= length/2; z += 1) {
            linePositions.push(x, -height/2, z, x, height/2, z);
        }
    }
    
    // Create depth lines along length
    for (let x = -width/2; x <= width/2; x += 1) {
        for (let y = -height/2; y <= height/2; y += 1) {
            linePositions.push(x, y, -length/2, x, y, length/2);
        }
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Add face labels (optional for educational purposes)
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const labelSize = Math.min(width, height, length) * 0.15;
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Add face labels and vertex markings (optional enhancement)
    const faceLabels = new THREE.Group();
    const vertexMarkers = new THREE.Group();
    
    // Vertex markers (small spheres at each vertex)
    const vertexGeometry = new THREE.SphereGeometry(labelSize * 0.3, 8, 8);
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Create 8 vertices for a box
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfLength = length / 2;
    
    const vertexPositions = [
        [-halfWidth, -halfHeight, -halfLength],
        [halfWidth, -halfHeight, -halfLength],
        [halfWidth, halfHeight, -halfLength],
        [-halfWidth, halfHeight, -halfLength],
        [-halfWidth, -halfHeight, halfLength],
        [halfWidth, -halfHeight, halfLength],
        [halfWidth, halfHeight, halfLength],
        [-halfWidth, halfHeight, halfLength]
    ];
    
    vertexPositions.forEach(pos => {
        const vertex = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertex.position.set(pos[0], pos[1], pos[2]);
        vertexMarkers.add(vertex);
    });
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines); // Add the voxel grid lines
    mainGroup.add(vertexMarkers);
    mainGroup.add(faceLabels);
    
    // Create full 3D meshes for the orthographic views (not just wireframes)
    const topMeshGeometry = geometry.clone();
    const frontMeshGeometry = geometry.clone();
    const rightMeshGeometry = geometry.clone();
    const leftMeshGeometry = geometry.clone();
    
    // Create meshes for different views with the same material
    const topMesh = new THREE.Mesh(topMeshGeometry, material.clone());
    const frontMesh = new THREE.Mesh(frontMeshGeometry, material.clone());
    const rightMesh = new THREE.Mesh(rightMeshGeometry, material.clone());
    const leftMesh = new THREE.Mesh(leftMeshGeometry, material.clone());
    
    // Add edge lines to orthographic views
    const topEdges = new THREE.LineSegments(new THREE.EdgesGeometry(topMeshGeometry), edgeMaterial.clone());
    const frontEdges = new THREE.LineSegments(new THREE.EdgesGeometry(frontMeshGeometry), edgeMaterial.clone());
    const rightEdges = new THREE.LineSegments(new THREE.EdgesGeometry(rightMeshGeometry), edgeMaterial.clone());
    const leftEdges = new THREE.LineSegments(new THREE.EdgesGeometry(leftMeshGeometry), edgeMaterial.clone());
    
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
    
    return {
        mainMesh: mainGroup,
        topMesh: topGroup,
        frontMesh: frontGroup,
        rightMesh: rightGroup,
        leftMesh: leftGroup,
        wireframe,
        dimensions: { width, height, length },
        type: 'rectangularPrism'
    };
}