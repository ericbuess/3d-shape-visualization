/**
 * Helper function to update mesh opacity while preserving original colors
 * @param {THREE.Object3D} mesh - The mesh to update
 * @param {number} value - The opacity value (0-1)
 */
export function updateMeshOpacity(mesh, value) {
    if (!mesh) return;
    
    mesh.traverse(child => {
        // Skip any cross-section meshes to prevent them from being affected by opacity changes
        if (child.isCrossSectionMesh) return;
        
        if (child.isMesh && child.material) {
            // Store original material colors if not already stored
            if (!child.originalMaterial) {
                if (Array.isArray(child.material)) {
                    child.originalMaterial = child.material.map(mat => mat.clone());
                } else {
                    child.originalMaterial = child.material.clone();
                }
            }
            
            if (Array.isArray(child.material)) {
                child.material.forEach((mat, index) => {
                    // Keep original color
                    if (child.originalMaterial && child.originalMaterial[index]) {
                        mat.color.copy(child.originalMaterial[index].color);
                    }
                    mat.transparent = true;
                    mat.opacity = Math.max(0.2, value * 0.9);
                    mat.needsUpdate = true;
                });
            } else {
                // Keep original color
                if (child.originalMaterial) {
                    child.material.color.copy(child.originalMaterial.color);
                }
                child.material.transparent = true;
                child.material.opacity = Math.max(0.2, value * 0.9);
                child.material.needsUpdate = true;
            }
        }
    });
}