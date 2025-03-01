// Create the wireframe material directly to avoid circular imports
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Create a cylinder
export function createCylinder(radius, height, radiusSegments = 32) {
    // Create the geometry
    const geometry = new THREE.CylinderGeometry(radius, radius, height, radiusSegments);
    
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
    
    // Add grid lines to show dimensions
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.4 });
    const gridLinesGeometry = new THREE.BufferGeometry();
    
    // Create circular grid lines
    const linePositions = [];
    
    // Horizontal circles at different heights
    for (let h = -height/2; h <= height/2; h += height/10) {
        for (let i = 0; i < radiusSegments; i++) {
            const theta1 = (i / radiusSegments) * Math.PI * 2;
            const theta2 = ((i + 1) / radiusSegments) * Math.PI * 2;
            
            const x1 = radius * Math.cos(theta1);
            const z1 = radius * Math.sin(theta1);
            const x2 = radius * Math.cos(theta2);
            const z2 = radius * Math.sin(theta2);
            
            linePositions.push(x1, h, z1, x2, h, z2);
        }
    }
    
    // Vertical lines
    for (let i = 0; i < radiusSegments; i++) {
        const theta = (i / radiusSegments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        linePositions.push(x, -height/2, z, x, height/2, z);
    }
    
    gridLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    
    // Create the main 3D mesh
    const mainMesh = new THREE.Mesh(geometry, material);
    
    // Group the mesh and its edges
    const mainGroup = new THREE.Group();
    mainGroup.add(mainMesh);
    mainGroup.add(edgeLines);
    mainGroup.add(gridLines);
    
    // Create meshes for orthographic views
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
    
    // Set correct rotations for orthographic views
    // For top view of cylinder, looking down the y-axis (no rotation needed)
    topMesh.rotation.x = 0;
    topEdges.rotation.x = 0;
    
    frontMesh.rotation.x = 0;
    frontEdges.rotation.x = 0;
    
    rightMesh.rotation.y = Math.PI / 2;
    rightEdges.rotation.y = Math.PI / 2;
    
    leftMesh.rotation.y = -Math.PI / 2;
    leftEdges.rotation.y = -Math.PI / 2;
    
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
        dimensions: { radius, height },
        type: 'cylinder'
    };
}