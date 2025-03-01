// Create the wireframe material directly to avoid circular imports
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    wireframe: true 
});

// Create a sphere
export function createSphere(radius, widthSegments = 32, heightSegments = 16) {
    // Create the geometry
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    
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
    
    // Create grid lines for latitude and longitude
    const linePositions = [];
    
    // Latitude lines (horizontal circles)
    const latitudeSteps = 8;
    for (let i = 1; i < latitudeSteps; i++) {
        const phi = (i / latitudeSteps) * Math.PI;
        const radiusAtPhi = radius * Math.sin(phi);
        const y = radius * Math.cos(phi);
        
        for (let j = 0; j < widthSegments; j++) {
            const theta1 = (j / widthSegments) * Math.PI * 2;
            const theta2 = ((j + 1) / widthSegments) * Math.PI * 2;
            
            const x1 = radiusAtPhi * Math.cos(theta1);
            const z1 = radiusAtPhi * Math.sin(theta1);
            const x2 = radiusAtPhi * Math.cos(theta2);
            const z2 = radiusAtPhi * Math.sin(theta2);
            
            linePositions.push(x1, y, z1, x2, y, z2);
        }
    }
    
    // Longitude lines (vertical half-circles)
    const longitudeSteps = 12;
    for (let i = 0; i < longitudeSteps; i++) {
        const theta = (i / longitudeSteps) * Math.PI * 2;
        
        for (let j = 0; j < heightSegments; j++) {
            const phi1 = (j / heightSegments) * Math.PI;
            const phi2 = ((j + 1) / heightSegments) * Math.PI;
            
            const y1 = radius * Math.cos(phi1);
            const y2 = radius * Math.cos(phi2);
            
            const radiusAtPhi1 = radius * Math.sin(phi1);
            const radiusAtPhi2 = radius * Math.sin(phi2);
            
            const x1 = radiusAtPhi1 * Math.cos(theta);
            const z1 = radiusAtPhi1 * Math.sin(theta);
            const x2 = radiusAtPhi2 * Math.cos(theta);
            const z2 = radiusAtPhi2 * Math.sin(theta);
            
            linePositions.push(x1, y1, z1, x2, y2, z2);
        }
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
        dimensions: { radius },
        type: 'sphere'
    };
}