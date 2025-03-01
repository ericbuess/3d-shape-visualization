import { setupTabEvents } from '../utils/ui.js';

// Display shape details in the UI with educational content
export function updateShapeDetails(shape) {
    console.log("Updating shape details for:", shape.type);
    console.log("Full shape object:", JSON.stringify(shape));
    if (!shape) {
        console.error("Shape is undefined in updateShapeDetails");
        return;
    }
    
    // Desktop elements
    const dimensionsDiv = document.getElementById('shape-dimensions');
    const propertiesDiv = document.getElementById('shape-properties');
    const formulasDiv = document.getElementById('shape-formulas');
    const netsDiv = document.getElementById('shape-nets');
    const topologyDiv = document.getElementById('shape-topology');
    
    // Define netImageContainer variable that was missing
    const netImageContainer = netsDiv;
    
    // Mobile elements
    const mobileDimensionsDiv = document.getElementById('mobile-shape-dimensions');
    const mobilePropertiesDiv = document.getElementById('mobile-shape-properties');
    const mobileFormulasDiv = document.getElementById('mobile-shape-formulas');
    const mobileNetsDiv = document.getElementById('mobile-shape-nets');
    const mobileTopologyDiv = document.getElementById('mobile-shape-topology');
    
    // Define mobileNetImageContainer variable that was missing
    const mobileNetImageContainer = mobileNetsDiv;
    
    // Debug console output
    console.log("Shape details elements:", {
        dimensionsDiv, propertiesDiv, formulasDiv, netsDiv, topologyDiv,
        mobileDimensionsDiv, mobilePropertiesDiv, mobileFormulasDiv, mobileNetsDiv, mobileTopologyDiv
    });
    
    // Check if elements exist - return early if not
    if (!dimensionsDiv || !propertiesDiv || !formulasDiv || !netsDiv || !topologyDiv) {
        console.error("One or more shape detail elements not found");
        return;
    }
    
    // Now make shape details panel visible - it was initially hidden
    const shapeDetails = document.getElementById('shape-details');
    if (shapeDetails) { // Show on any screen size
        shapeDetails.style.display = 'flex';
    }
    
    // Make mobile panel visible too
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.style.display = 'block';
    }
    
    // Don't automatically show mobile elements - they should only show when the icon is tapped
    // Mobile panel visibility is controlled by the mobile panel system
    
    if (shape.type === 'triangularPrism') {
        const { height, side1, side2, side3 } = shape.dimensions;
        
        // Calculate volume
        const baseArea = (side1 * side2) / 2;
        const volume = baseArea * height;
        
        // Calculate surface area
        const basePerimeter = side1 + side2 + side3;
        const lateralArea = basePerimeter * height;
        const totalArea = 2 * baseArea + lateralArea;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Base sides:</strong> ${side1} units, ${side2} units, ${side3.toFixed(2)} units</p>
            <p><strong>Dimensions:</strong> Triangular base with height ${height} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${totalArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralArea.toFixed(2)} square units</p>
        `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = `
            <h4>Triangular Prism Formulas</h4>
            
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (base area) × height</span>
            <div class="formula-explanation">
                The volume is calculated by multiplying the area of the triangular base by the height of the prism.
            </div>
            
            <span class="formula">V = (1/2 × base₁ × base₂) × height</span>
            <div class="formula-explanation">
                For a triangular base, the area is half the product of the two sides that form the right angle.
            </div>
            
            <span class="formula">V = <span class="formula-highlight">${baseArea.toFixed(2)}</span> × <span class="formula-highlight">${height}</span> = <span class="formula-highlight">${volume.toFixed(2)}</span> cubic units</span>
            <div class="formula-explanation">
                Applied to this specific triangular prism with base area ${baseArea.toFixed(2)} square units and height ${height} units.
            </div>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2(base area) + (perimeter of base) × height</span>
            <div class="formula-explanation">
                The surface area consists of two triangular bases plus the rectangular sides. The sides have a total area equal to the perimeter of the base multiplied by the height.
            </div>
            
            <span class="formula">SA = 2(<span class="formula-highlight">${baseArea.toFixed(2)}</span>) + <span class="formula-highlight">${basePerimeter.toFixed(2)}</span> × <span class="formula-highlight">${height}</span></span>
            <div class="formula-explanation">
                For this triangular prism: two triangular bases of area ${baseArea.toFixed(2)} square units each, plus the lateral surface formed by three rectangles with a total area of ${lateralArea.toFixed(2)} square units.
            </div>
            
            <span class="formula">SA = <span class="formula-highlight">${(2 * baseArea).toFixed(2)}</span> + <span class="formula-highlight">${lateralArea.toFixed(2)}</span> = <span class="formula-highlight">${totalArea.toFixed(2)}</span> square units</span>
            
            <div class="educational-note">
                A triangular prism's volume increases linearly with height, while surface area consists of the bases plus the sides. This relationship is important in understanding how shape affects capacity and material requirements.
            </div>
        `;
        
        // Generate HTML content for net diagram with improved explanations
        const netHTML = `
            <!-- 3D to Unfolded Net Sequence for Triangular Prism -->
            <svg width="100%" height="350" viewBox="0 0 300 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Improved net showing all faces clearly in a single column arrangement -->
                    
                    <!-- First triangular base (top) -->
                    <polygon points="75,30 225,30 150,130" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- First rectangular side (left) -->
                    <polygon points="75,130 75,230 150,230 150,130" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Second rectangular side (middle) - moved down for clarity -->
                    <polygon points="150,130 150,230 225,230 225,130" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Third rectangular side (bottom) - moved to bottom row -->
                    <polygon points="75,230 225,230 225,280 75,280" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Second triangular base (attached to bottom) -->
                    <polygon points="75,280 225,280 150,330" fill="#dcf1fd" stroke="#2196f3" stroke-width="3"/>
                    
                    <!-- Grid lines to show units on the triangular bases -->
                    <line x1="75" y1="30" x2="225" y2="30" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="55" x2="213" y2="55" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="80" x2="200" y2="80" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="105" x2="175" y2="105" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <line x1="75" y1="30" x2="75" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="100" y1="30" x2="100" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="125" y1="30" x2="125" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="150" y1="30" x2="150" y2="130" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="175" y1="30" x2="175" y2="105" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="200" y1="30" x2="200" y2="80" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <!-- Grid lines for rectangular faces -->
                    <line x1="75" y1="155" x2="225" y2="155" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="180" x2="225" y2="180" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="75" y1="205" x2="225" y2="205" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <line x1="100" y1="130" x2="100" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="125" y1="130" x2="125" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="150" y1="130" x2="150" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="175" y1="130" x2="175" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    <line x1="200" y1="130" x2="200" y2="280" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>
                    
                    <!-- Labels with black text and background for readability -->
                    <rect x="135" y="75" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Base 1</text>
                    
                    <rect x="100" y="175" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="115" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 1</text>
                    
                    <rect x="175" y="175" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="190" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 2</text>
                    
                    <rect x="135" y="250" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="260" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Side 3</text>
                    
                    <rect x="135" y="300" width="30" height="14" fill="white" fill-opacity="0.8"/>
                    <text x="150" y="310" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Base 2</text>
                    
                    <!-- Lines showing fold edges with improved visibility -->
                    <line x1="75" y1="130" x2="150" y2="130" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="150" y1="130" x2="225" y2="130" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="75" y1="230" x2="225" y2="230" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    <line x1="75" y1="280" x2="225" y2="280" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
                    
                    <!-- Dimension indicators -->
                    <line x1="50" y1="30" x2="50" y2="130" stroke="#000" stroke-width="1"/>
                    <text x="40" y="80" text-anchor="middle" font-size="10" fill="#000">${side2} units</text>
                    
                    <line x1="75" y1="10" x2="225" y2="10" stroke="#000" stroke-width="1"/>
                    <text x="150" y="20" text-anchor="middle" font-size="10" fill="#000">${side1} units</text>
                    
                    <line x1="250" y1="130" x2="250" y2="230" stroke="#000" stroke-width="1"/>
                    <text x="265" y="180" text-anchor="middle" font-size="10" fill="#000">${height} units</text>
                </svg>
            
            <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a triangular prism showing all 5 faces in a single vertical column: 2 triangular bases and 3 rectangular sides</p>
            
            <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                <p><strong>Understanding the Net:</strong> A net is a flattened arrangement of all faces of a 3D shape. For this triangular prism:</p>
                <ul>
                    <li>The two <span class="property-highlight">triangular bases</span> (blue) at top and bottom with dimensions ${side1} × ${side2} units</li>
                    <li>Three <span class="property-highlight">rectangular sides</span> (lighter blue) connecting the corresponding edges of the bases</li>
                    <li>Side 1 and Side 2 are ${side2} × ${height} units</li>
                    <li>Side 3 (bottom rectangle) is ${side1} × ${height} units</li>
                </ul>
                <p>When folded along the dashed lines, this net forms a complete triangular prism. The grid lines show the unit measurements. The shape has a total of 5 faces, 9 edges, and 6 vertices.</p>
            </div>
        `;
        
        // Generate topology HTML with enhanced educational content
        const topologyHTML = `
            <h4>Triangular Prism Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td><span class="property-highlight">5</span> (2 triangular bases + 3 rectangular sides)</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td><span class="property-highlight">9</span></td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td><span class="property-highlight">6</span></td>
                </tr>
                <tr>
                    <td>Euler's Formula</td>
                    <td>V - E + F = 2 → <span class="property-highlight">6 - 9 + 5 = 2</span> ✓</td>
                </tr>
                <tr>
                    <td>Regular</td>
                    <td>Only if the base is an equilateral triangle</td>
                </tr>
                <tr>
                    <td>Base Shape</td>
                    <td>Triangle</td>
                </tr>
                <tr>
                    <td>Convex</td>
                    <td>Yes</td>
                </tr>
                <tr>
                    <td>Right Prism</td>
                    <td>Yes (bases are perpendicular to lateral edges)</td>
                </tr>
            </table>
            
            <div class="educational-note">
                <p><strong>Euler's Characteristic:</strong> For any convex polyhedron, the formula V - E + F = 2 holds true, where V is the number of vertices, E is the number of edges, and F is the number of faces.</p>
                <p><strong>Topological Importance:</strong> The triangular prism is one of the simplest 3D shapes that demonstrates fundamental principles of polyhedra. Its structure forms the basis for understanding more complex polyhedra.</p>
            </div>
        `;
        
        // Update all content with safety checks and debug logging
        console.log("Updating all shape detail panels with content");
        
        // Desktop panels
        if (dimensionsDiv) {
            dimensionsDiv.innerHTML = dimensionsHTML;
            console.log("Updated dimensions content");
        } else {
            console.error("dimensionsDiv not found");
        }
        
        if (propertiesDiv) {
            propertiesDiv.innerHTML = propertiesHTML;
            console.log("Updated properties content");
        } else {
            console.error("propertiesDiv not found");
        }
        
        if (formulasDiv) {
            formulasDiv.innerHTML = formulasHTML;
            console.log("Updated formulas content");
        } else {
            console.error("formulasDiv not found");
        }
        
        if (netsDiv) {
            netsDiv.innerHTML = netHTML;
            console.log("Updated nets content");
        } else {
            console.error("netsDiv not found");
        }
        
        if (topologyDiv) {
            topologyDiv.innerHTML = topologyHTML;
            console.log("Updated topology content");
        } else {
            console.error("topologyDiv not found");
        }
        
        // Mobile panels
        if (mobileDimensionsDiv) {
            mobileDimensionsDiv.innerHTML = dimensionsHTML;
            console.log("Updated mobile dimensions content");
        }
        
        if (mobilePropertiesDiv) {
            mobilePropertiesDiv.innerHTML = propertiesHTML;
            console.log("Updated mobile properties content");
        }
        
        if (mobileFormulasDiv) {
            mobileFormulasDiv.innerHTML = formulasHTML;
            console.log("Updated mobile formulas content");
        }
        
        if (mobileNetsDiv) {
            mobileNetsDiv.innerHTML = netHTML;
            console.log("Updated mobile nets content");
        }
        
        if (mobileTopologyDiv) {
            mobileTopologyDiv.innerHTML = topologyHTML;
            console.log("Updated mobile topology content");
        }
        
        // Ensure tabs are set up properly
        setupTabEvents();
    } else if (shape.type === 'rectangularPrism' || shape.type === 'cube') {
        // Implementation for rectangular prism and cube
        console.log("▶️ ENTERING RECTANGULAR PRISM/CUBE BRANCH");
        console.log("Rendering details for:", shape.type, shape.dimensions);
        
        let width, height, length;
        
        if (shape.type === 'cube') {
            width = height = length = shape.dimensions.size;
        } else {
            width = shape.dimensions.width;
            height = shape.dimensions.height;
            length = shape.dimensions.length;
        }
        
        // Calculate volume and surface area
        const volume = width * height * length;
        const surfaceArea = 2 * (width * length + width * height + height * length);
        const facePerimeter = 2 * (width + height);
        const spaceDialognal = Math.sqrt(width*width + height*height + length*length);
        
        // Generate HTML content for dimensions
        const dimensionsHTML = shape.type === 'cube' 
            ? `
                <p><strong>Edge Length:</strong> ${width} units</p>
                <p><strong>Dimensions:</strong> ${width} × ${width} × ${width} units</p>
            `
            : `
                <p><strong>Width:</strong> ${width} units</p>
                <p><strong>Height:</strong> ${height} units</p>
                <p><strong>Length:</strong> ${length} units</p>
                <p><strong>Dimensions:</strong> ${width} × ${height} × ${length} units</p>
            `;
        
        // Generate HTML content for properties
        const propertiesHTML = shape.type === 'cube'
            ? `
                <p><strong>Volume:</strong> ${volume} cubic units</p>
                <p><strong>Surface Area:</strong> ${surfaceArea} square units</p>
                <p><strong>Face Area:</strong> ${width * width} square units</p>
                <p><strong>Face Diagonal:</strong> ${(width * Math.sqrt(2)).toFixed(2)} units</p>
                <p><strong>Space Diagonal:</strong> ${(width * Math.sqrt(3)).toFixed(2)} units</p>
            `
            : `
                <p><strong>Volume:</strong> ${volume} cubic units</p>
                <p><strong>Surface Area:</strong> ${surfaceArea} square units</p>
                <p><strong>Base Area:</strong> ${width * length} square units</p>
                <p><strong>Lateral Surface Area:</strong> ${2 * (width + length) * height} square units</p>
                <p><strong>Space Diagonal:</strong> ${spaceDialognal.toFixed(2)} units</p>
            `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = shape.type === 'cube'
            ? `
                <h4>Cube Formulas</h4>
                <p><strong>Volume:</strong></p>
                <span class="formula">V = s³</span>
                <div class="formula-explanation">
                    The volume of a cube is calculated by cubing the side length.
                </div>
                <span class="formula">V = ${width}³ = ${volume} cubic units</span>
                
                <p><strong>Surface Area:</strong></p>
                <span class="formula">SA = 6s²</span>
                <div class="formula-explanation">
                    The surface area consists of 6 identical square faces, each with area s².
                </div>
                <span class="formula">SA = 6 × ${width}² = 6 × ${width * width} = ${surfaceArea} square units</span>
                
                <p><strong>Face Diagonal:</strong></p>
                <span class="formula">d = s√2</span>
                <div class="formula-explanation">
                    The diagonal of a square face is calculated using the Pythagorean theorem.
                </div>
                <span class="formula">d = ${width} × √2 = ${(width * Math.sqrt(2)).toFixed(2)} units</span>
                
                <p><strong>Space Diagonal:</strong></p>
                <span class="formula">d = s√3</span>
                <div class="formula-explanation">
                    The space diagonal connects opposite corners of the cube through its center.
                </div>
                <span class="formula">d = ${width} × √3 = ${(width * Math.sqrt(3)).toFixed(2)} units</span>
                
                <div class="educational-note">
                    A cube is a special case of a rectangular prism where all edges have equal length. 
                    It is one of the five Platonic solids, which are perfectly regular polyhedra.
                </div>
            `
            : `
                <h4>Rectangular Prism Formulas</h4>
                <p><strong>Volume:</strong></p>
                <span class="formula">V = length × width × height</span>
                <div class="formula-explanation">
                    The volume is calculated by multiplying the three dimensions together.
                </div>
                <span class="formula">V = ${length} × ${width} × ${height} = ${volume} cubic units</span>
                
                <p><strong>Surface Area:</strong></p>
                <span class="formula">SA = 2(length × width + length × height + width × height)</span>
                <div class="formula-explanation">
                    The surface area consists of three pairs of identical rectangular faces.
                </div>
                <span class="formula">SA = 2(${length} × ${width} + ${length} × ${height} + ${width} × ${height})</span>
                <span class="formula">SA = 2(${length * width} + ${length * height} + ${width * height}) = ${surfaceArea} square units</span>
                
                <p><strong>Space Diagonal:</strong></p>
                <span class="formula">d = √(length² + width² + height²)</span>
                <div class="formula-explanation">
                    The space diagonal connects opposite corners of the prism through its center.
                </div>
                <span class="formula">d = √(${length}² + ${width}² + ${height}²) = ${spaceDialognal.toFixed(2)} units</span>
                
                <div class="educational-note">
                    A rectangular prism is a 3D shape with six rectangular faces. Each face connects to four other faces at right angles.
                    When all dimensions are equal, it becomes a cube, which is a special case of a rectangular prism.
                </div>
            `;
        
        // Create HTML for the net diagram with enhanced visualization
        const netHTML = shape.type === 'cube'
            ? `
                <svg width="100%" height="460" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Complete net of a cube showing all 6 faces in a cross pattern -->
                    
                    ${(() => {
                        const centerX = 200;
                        const centerY = 200;
                        const cellSize = width*30;
                        
                        // Calculate face positions in cross layout with spacing between faces
                        const topX = centerX - cellSize/2;
                        const topY = centerY - cellSize - cellSize - 10; // Added gap
                        
                        const leftX = centerX - cellSize - cellSize/2 - 10; // Added gap
                        const leftY = centerY - cellSize;
                        
                        const frontX = centerX - cellSize/2;
                        const frontY = centerY - cellSize;
                        
                        const rightX = centerX + cellSize/2 + 10; // Added gap
                        const rightY = centerY - cellSize;
                        
                        const bottomX = centerX - cellSize/2;
                        const bottomY = centerY + 10; // Added gap
                        
                        const backX = centerX - cellSize/2;
                        const backY = centerY + cellSize + 20; // Added gap
                        
                        return `
                            <!-- Top face - light blue -->
                            <rect x="${topX}" y="${topY}" width="${cellSize}" height="${cellSize}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Left face - medium blue -->
                            <rect x="${leftX}" y="${leftY}" width="${cellSize}" height="${cellSize}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Front face - light blue variant -->
                            <rect x="${frontX}" y="${frontY}" width="${cellSize}" height="${cellSize}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Right face - medium blue -->
                            <rect x="${rightX}" y="${rightY}" width="${cellSize}" height="${cellSize}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Bottom face - light blue -->
                            <rect x="${bottomX}" y="${bottomY}" width="${cellSize}" height="${cellSize}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Back face - darker blue -->
                            <rect x="${backX}" y="${backY}" width="${cellSize}" height="${cellSize}" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Grid lines for all 6 faces -->
                            ${(() => {
                                let gridLines = '';
                                const scale = 30; // Consistent scale factor
                                
                                // Generate grid lines for each face
                                const createGridForFace = (x, y) => {
                                    let lines = '';
                                    for (let i = 1; i < width; i++) {
                                        lines += `<line x1="${x + i*scale}" y1="${y}" x2="${x + i*scale}" y2="${y + cellSize}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                    }
                                    for (let i = 1; i < width; i++) {
                                        lines += `<line x1="${x}" y1="${y + i*scale}" x2="${x + cellSize}" y2="${y + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                    }
                                    return lines;
                                };
                                
                                // Apply grid to all faces
                                gridLines += createGridForFace(topX, topY);
                                gridLines += createGridForFace(leftX, leftY);
                                gridLines += createGridForFace(frontX, frontY);
                                gridLines += createGridForFace(rightX, rightY);
                                gridLines += createGridForFace(bottomX, bottomY);
                                gridLines += createGridForFace(backX, backY);
                                
                                // Create fold lines - dashed lines to show folding
                                let foldLines = '';
                                
                                // Connect top to front
                                foldLines += `<line x1="${topX}" y1="${topY + cellSize}" x2="${topX + cellSize}" y2="${topY + cellSize}" 
                                                 stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect front to bottom                 
                                foldLines += `<line x1="${frontX}" y1="${frontY + cellSize}" x2="${frontX + cellSize}" y2="${frontY + cellSize}" 
                                                 stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect bottom to back
                                foldLines += `<line x1="${bottomX}" y1="${bottomY + cellSize}" x2="${bottomX + cellSize}" y2="${bottomY + cellSize}" 
                                                 stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect left to front
                                foldLines += `<line x1="${leftX + cellSize}" y1="${leftY}" x2="${leftX + cellSize}" y2="${leftY + cellSize}" 
                                                 stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect front to right
                                foldLines += `<line x1="${frontX + cellSize}" y1="${frontY}" x2="${frontX + cellSize}" y2="${frontY + cellSize}" 
                                                 stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                return gridLines + foldLines;
                            })()}
                            
                            <!-- Face labels -->
                            <rect x="${topX + width*15 - 15}" y="${topY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${topX + width*15}" y="${topY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Top</text>
                            
                            <rect x="${frontX + width*15 - 15}" y="${frontY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${frontX + width*15}" y="${frontY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Front</text>
                            
                            <rect x="${leftX + width*15 - 15}" y="${leftY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${leftX + width*15}" y="${leftY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Left</text>
                            
                            <rect x="${rightX + width*15 - 15}" y="${rightY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${rightX + width*15}" y="${rightY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Right</text>
                            
                            <rect x="${bottomX + width*15 - 15}" y="${bottomY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${bottomX + width*15}" y="${bottomY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Bottom</text>
                            
                            <rect x="${backX + width*15 - 15}" y="${backY + width*15 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${backX + width*15}" y="${backY + width*15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Back</text>
                            
                            <!-- Dimension indicators - show all dimensions -->
                            <!-- Top dimension -->
                            <line x1="${topX - 10}" y1="${topY + cellSize/2}" x2="${topX + cellSize + 10}" y2="${topY + cellSize/2}" stroke="#000" stroke-width="1"/>
                            <text x="${topX + cellSize/2}" y="${topY + cellSize/2 - 10}" text-anchor="middle" font-size="12" fill="#000">${width} units</text>
                            
                            <!-- Front dimension -->
                            <line x1="${frontX - 10}" y1="${frontY - 10}" x2="${frontX + cellSize + 10}" y2="${frontY - 10}" stroke="#000" stroke-width="1"/>
                            <text x="${frontX + cellSize/2}" y="${frontY - 20}" text-anchor="middle" font-size="12" fill="#000">${width} units</text>
                            
                            <!-- Right dimension -->
                            <line x1="${rightX}" y1="${rightY - 10}" x2="${rightX + cellSize}" y2="${rightY - 10}" stroke="#000" stroke-width="1"/>
                            <text x="${rightX + cellSize/2}" y="${rightY - 20}" text-anchor="middle" font-size="12" fill="#000">${width} units</text>
                        `;
                    })()}
                </svg>
                
                <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a cube showing all 6 identical square faces (${width}×${width} units each) that fold to create the 3D shape</p>
                
                <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                    <p><strong>Understanding the Net:</strong> This net shows all 6 identical square faces of a cube arranged in a cross pattern:</p>
                    <ul>
                        <li>Each face is a square with side length ${width} units</li>
                        <li>Grid lines show the unit measurements (${width}×${width} for each face)</li>
                        <li>When folded along the dashed lines, the squares form a perfect cube</li>
                        <li>This "cross pattern" is one of 11 possible nets for a cube</li>
                    </ul>
                    <p>The cube has 6 faces, 12 edges, and 8 vertices. Each vertex connects exactly 3 edges and 3 faces.</p>
                </div>
            `
            : `
                <svg width="100%" height="500" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                    <!-- Net of a rectangular prism showing all 6 faces in a cross pattern -->
                    
                    ${(() => {
                        const centerX = 200;
                        const centerY = 200;
                        const cellWidth = width*18;  // Scale factor adjusted for better spacing
                        const cellHeight = height*18; // Scale factor adjusted for better spacing
                        const cellDepth = length*18;  // Scale factor adjusted for better spacing
                        
                        // Calculate positions with more spacing between faces
                        const topX = centerX - cellWidth/2;
                        const topY = centerY - cellDepth - cellHeight - 10; // Added gap
                        
                        const frontX = centerX - cellWidth/2;
                        const frontY = centerY - cellHeight;
                        
                        const rightX = centerX + cellWidth/2 + 10; // Added gap
                        const rightY = centerY - cellHeight;
                        
                        const leftX = centerX - cellWidth/2 - cellDepth - 10; // Added gap
                        const leftY = centerY - cellHeight;
                        
                        const bottomX = centerX - cellWidth/2;
                        const bottomY = centerY + 10; // Added gap
                        
                        const backX = centerX - cellWidth/2;
                        const backY = centerY + cellDepth + 20; // Added gap
                        
                        return `
                            <!-- Top face - light blue -->
                            <rect x="${topX}" y="${topY}" width="${cellWidth}" height="${cellDepth}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Front face - medium blue -->
                            <rect x="${frontX}" y="${frontY}" width="${cellWidth}" height="${cellHeight}" fill="#bbdefb" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Right side face - light blue variant -->
                            <rect x="${rightX}" y="${rightY}" width="${cellDepth}" height="${cellHeight}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Left side face - light blue variant -->
                            <rect x="${leftX}" y="${leftY}" width="${cellDepth}" height="${cellHeight}" fill="#c8e6fa" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Bottom face - same as top -->
                            <rect x="${bottomX}" y="${bottomY}" width="${cellWidth}" height="${cellDepth}" fill="#e3f2fd" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Back face - darker blue -->
                            <rect x="${backX}" y="${backY}" width="${cellWidth}" height="${cellHeight}" fill="#a6d5f9" stroke="#2196f3" stroke-width="3"/>
                            
                            <!-- Grid lines for all faces -->
                            ${(() => {
                                let gridLines = '';
                                const scale = 18; // Consistent scale factor
                                
                                // Top face grid (width × length)
                                for (let i = 1; i < width; i++) {
                                    gridLines += `<line x1="${topX + i*scale}" y1="${topY}" x2="${topX + i*scale}" y2="${topY + cellDepth}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < length; i++) {
                                    gridLines += `<line x1="${topX}" y1="${topY + i*scale}" x2="${topX + cellWidth}" y2="${topY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Front face grid (width × height)
                                for (let i = 1; i < width; i++) {
                                    gridLines += `<line x1="${frontX + i*scale}" y1="${frontY}" x2="${frontX + i*scale}" y2="${frontY + cellHeight}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < height; i++) {
                                    gridLines += `<line x1="${frontX}" y1="${frontY + i*scale}" x2="${frontX + cellWidth}" y2="${frontY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Right face grid (length × height)
                                for (let i = 1; i < length; i++) {
                                    gridLines += `<line x1="${rightX + i*scale}" y1="${rightY}" x2="${rightX + i*scale}" y2="${rightY + cellHeight}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < height; i++) {
                                    gridLines += `<line x1="${rightX}" y1="${rightY + i*scale}" x2="${rightX + cellDepth}" y2="${rightY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Left face grid (length × height)
                                for (let i = 1; i < length; i++) {
                                    gridLines += `<line x1="${leftX + i*scale}" y1="${leftY}" x2="${leftX + i*scale}" y2="${leftY + cellHeight}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < height; i++) {
                                    gridLines += `<line x1="${leftX}" y1="${leftY + i*scale}" x2="${leftX + cellDepth}" y2="${leftY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Bottom face grid (width × length)
                                for (let i = 1; i < width; i++) {
                                    gridLines += `<line x1="${bottomX + i*scale}" y1="${bottomY}" x2="${bottomX + i*scale}" y2="${bottomY + cellDepth}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < length; i++) {
                                    gridLines += `<line x1="${bottomX}" y1="${bottomY + i*scale}" x2="${bottomX + cellWidth}" y2="${bottomY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Back face grid (width × height)
                                for (let i = 1; i < width; i++) {
                                    gridLines += `<line x1="${backX + i*scale}" y1="${backY}" x2="${backX + i*scale}" y2="${backY + cellHeight}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                for (let i = 1; i < height; i++) {
                                    gridLines += `<line x1="${backX}" y1="${backY + i*scale}" x2="${backX + cellWidth}" y2="${backY + i*scale}" 
                                                      stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                                }
                                
                                // Fold lines - keep dashed lines to show where folding occurs
                                let foldLines = '';
                                
                                // Top to front fold - connect these pieces
                                foldLines += `<line x1="${topX}" y1="${topY + cellDepth}" x2="${topX + cellWidth}" y2="${topY + cellDepth}" 
                                                  stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Front to bottom fold
                                foldLines += `<line x1="${frontX}" y1="${frontY + cellHeight}" x2="${frontX + cellWidth}" y2="${frontY + cellHeight}" 
                                                  stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Bottom to back fold
                                foldLines += `<line x1="${bottomX}" y1="${bottomY + cellDepth}" x2="${bottomX + cellWidth}" y2="${bottomY + cellDepth}" 
                                                  stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect left to front fold
                                foldLines += `<line x1="${leftX + cellDepth}" y1="${leftY}" x2="${leftX + cellDepth}" y2="${leftY + cellHeight}" 
                                                  stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                // Connect front to right fold
                                foldLines += `<line x1="${frontX + cellWidth}" y1="${frontY}" x2="${frontX + cellWidth}" y2="${frontY + cellHeight}" 
                                                  stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>`;
                                
                                return gridLines + foldLines;
                            })()}
                            
                            <!-- Labels -->
                            <rect x="${topX + cellWidth/2 - 15}" y="${topY + cellDepth/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${topX + cellWidth/2}" y="${topY + cellDepth/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Top</text>
                            
                            <rect x="${frontX + cellWidth/2 - 15}" y="${frontY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${frontX + cellWidth/2}" y="${frontY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Front</text>
                            
                            <rect x="${bottomX + cellWidth/2 - 15}" y="${bottomY + cellDepth/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${bottomX + cellWidth/2}" y="${bottomY + cellDepth/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Bottom</text>
                            
                            <rect x="${backX + cellWidth/2 - 15}" y="${backY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${backX + cellWidth/2}" y="${backY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Back</text>
                            
                            <rect x="${rightX + cellDepth/2 - 15}" y="${rightY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${rightX + cellDepth/2}" y="${rightY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Right</text>
                            
                            <rect x="${leftX + cellDepth/2 - 15}" y="${leftY + cellHeight/2 - 7}" width="30" height="14" fill="white" fill-opacity="0.8"/>
                            <text x="${leftX + cellDepth/2}" y="${leftY + cellHeight/2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Left</text>
                            
                            <!-- Dimension indicators -->
                            <!-- Front face width -->
                            <line x1="${frontX}" y1="${frontY - 10}" x2="${frontX + cellWidth}" y2="${frontY - 10}" stroke="#000" stroke-width="1"/>
                            <text x="${frontX + cellWidth/2}" y="${frontY - 15}" text-anchor="middle" font-size="10" fill="#000">${width} units</text>
                            
                            <!-- Front face height -->
                            <line x1="${frontX - 10}" y1="${frontY}" x2="${frontX - 10}" y2="${frontY + cellHeight}" stroke="#000" stroke-width="1"/>
                            <text x="${frontX - 25}" y="${frontY + cellHeight/2}" text-anchor="middle" font-size="10" fill="#000">${height} units</text>
                            
                            <!-- Right face length (fixed to correctly show length) -->
                            <line x1="${rightX}" y1="${rightY - 10}" x2="${rightX + cellDepth}" y2="${rightY - 10}" stroke="#000" stroke-width="1"/>
                            <text x="${rightX + cellDepth/2}" y="${rightY - 20}" text-anchor="middle" font-size="10" fill="#000">${length} units</text>
                            
                            <!-- Left face length (fixed to correctly show length) -->
                            <line x1="${leftX}" y1="${leftY - 10}" x2="${leftX + cellDepth}" y2="${leftY - 10}" stroke="#000" stroke-width="1"/>
                            <text x="${leftX + cellDepth/2}" y="${leftY - 20}" text-anchor="middle" font-size="10" fill="#000">${length} units</text>
                            
                            <!-- Top face dimensions (moved to prevent overlap) -->
                            <line x1="${topX - 10}" y1="${topY + cellDepth/2}" x2="${topX - 10}" y2="${topY + cellDepth/2}" stroke="none"/>
                            <text x="${topX + cellWidth/2}" y="${topY - 10}" text-anchor="middle" font-size="10" fill="#000">Width: ${width} units × Length: ${length} units</text>
                            
                            <!-- Bottom face dimensions (moved to prevent overlap) -->
                            <line x1="${bottomX - 10}" y1="${bottomY + cellDepth/2}" x2="${bottomX - 10}" y2="${bottomY + cellDepth/2}" stroke="none"/>
                            <text x="${bottomX + cellWidth/2}" y="${bottomY + cellDepth + 20}" text-anchor="middle" font-size="10" fill="#000">Width: ${width} units × Length: ${length} units</text>
                        `;
                    })()}
                </svg>
                
                <p class="net-description" style="display: block; width: 100%; clear: both; margin-top: 15px; padding: 0 10px; box-sizing: border-box;">Complete net of a rectangular prism showing all 6 faces that fold to create the 3D shape with dimensions ${width}×${height}×${length} units</p>
                
                <div class="net-explanation" style="display: block; width: 100%; clear: both; margin-top: 20px; box-sizing: border-box;">
                    <p><strong>Understanding the Net:</strong> This net shows all 6 rectangular faces of the prism unfolded in a T-shape:</p>
                    <ul>
                        <li>Two identical <span class="property-highlight">end faces</span> (top and bottom) with dimensions ${width} × ${length} units</li>
                        <li>Two identical <span class="property-highlight">side faces</span> (left and right) with dimensions ${length} × ${height} units</li>
                        <li>Two identical <span class="property-highlight">front/back faces</span> with dimensions ${width} × ${height} units</li>
                    </ul>
                    <p>The grid lines show the unit measurements to help visualize the dimensions. When folded along the dashed lines, this net forms a complete rectangular prism with 6 faces, 12 edges, and 8 vertices.</p>
                </div>
            `;
        
        // Generate topology HTML with enhanced educational content
        const topologyHTML = shape.type === 'cube'
            ? `
                <h4>Cube Properties</h4>
                <table class="property-table">
                    <tr>
                        <th>Property</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Number of Faces</td>
                        <td>6 (all congruent squares)</td>
                    </tr>
                    <tr>
                        <td>Number of Edges</td>
                        <td>12 (all equal length)</td>
                    </tr>
                    <tr>
                        <td>Number of Vertices</td>
                        <td>8</td>
                    </tr>
                    <tr>
                        <td>Euler's Formula</td>
                        <td>V - E + F = 2 → 8 - 12 + 6 = 2 ✓</td>
                    </tr>
                    <tr>
                        <td>Regular Polyhedron</td>
                        <td>Yes (one of the five Platonic solids)</td>
                    </tr>
                    <tr>
                        <td>Symmetry</td>
                        <td>High - 9 planes of symmetry</td>
                    </tr>
                    <tr>
                        <td>Dual Polyhedron</td>
                        <td>Regular octahedron</td>
                    </tr>
                    <tr>
                        <td>Face Shape</td>
                        <td>Square</td>
                    </tr>
                </table>
                
                <div class="educational-note">
                    <p><strong>Platonic Solid:</strong> A cube is one of the five Platonic solids, which are regular, convex polyhedra with congruent faces of regular polygons and the same number of faces meeting at each vertex.</p>
                    <p><strong>Perfect Symmetry:</strong> The cube has 9 planes of symmetry, 3 through faces and 6 through edges. It's one of the most symmetric 3D shapes.</p>
                </div>
            `
            : `
                <h4>Rectangular Prism Properties</h4>
                <div class="property-item">
                    <div class="property-name">Definition</div>
                    <div class="property-value">A rectangular prism is a polyhedron with 6 rectangular faces, where all faces meet at right angles.</div>
                </div>
                
                <div class="property-item">
                    <div class="property-name">Topology</div>
                    <div class="property-value">
                        <ul>
                            <li>Number of Faces: 6 rectangular faces</li>
                            <li>Number of Edges: 12</li>
                            <li>Number of Vertices: 8</li>
                        </ul>
                    </div>
                </div>
                
                <div class="property-item">
                    <div class="property-name">Euler's Formula</div>
                    <div class="property-value">
                        V - E + F = 2<br>
                        8 vertices - 12 edges + 6 faces = 2 ✓
                    </div>
                </div>
                
                <div class="property-item">
                    <div class="property-name">Special Properties</div>
                    <div class="property-value">
                        <ul>
                            <li>All faces are rectangles that meet at right angles</li>
                            <li>Opposite faces are parallel and congruent</li>
                            <li>The diagonal of this rectangular prism is √(${width}² + ${height}² + ${length}²) = ${Math.sqrt(width*width + height*height + length*length).toFixed(2)} units</li>
                            <li>Each vertex is the meeting point of exactly 3 edges</li>
                            <li>It is a right prism with a rectangular base</li>
                        </ul>
                    </div>
                </div>
                
                <div class="property-item">
                    <div class="property-name">Classification</div>
                    <div class="property-value">
                        <ul>
                            <li>Regular: ${width === height && height === length ? "Yes (cube)" : "No, different dimensions"}</li>
                            <li>Convex: Yes</li>
                            <li>Space-filling: Yes, can tile 3D space without gaps</li>
                        </ul>
                    </div>
                </div>
            `;
        
        // Update all content
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netsDiv.innerHTML = netHTML;
        topologyDiv.innerHTML = topologyHTML;
        
        // Update mobile panels
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetsDiv) mobileNetsDiv.innerHTML = netHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
        // Ensure tabs are set up properly
        setupTabEvents();
    } else if (shape.type === 'cylinder') {
        // Handle cylinder shape details
        console.log("Rendering details for cylinder:", shape.dimensions);
        const { radius, height } = shape.dimensions;
        
        // Calculate volume and surface area
        const volume = Math.PI * radius * radius * height;
        const lateralSurfaceArea = 2 * Math.PI * radius * height;
        const baseArea = Math.PI * radius * radius;
        const surfaceArea = lateralSurfaceArea + 2 * baseArea;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Diameter:</strong> ${2 * radius} units</p>
            <p><strong>Base Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units (each base)</p>
            <p><strong>Lateral Surface Width:</strong> ${(2 * Math.PI * radius).toFixed(2)} units (circumference of base)</p>
            <p><strong>Lateral Surface Height:</strong> ${height} units</p>
        `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = `
            <h4>Cylinder Formulas</h4>
            
            <p><strong>Volume:</strong></p>
            <span class="formula">V = πr²h</span>
            <div class="formula-explanation">
                The volume is calculated by multiplying the area of the circular base by the height of the cylinder.
            </div>
            <span class="formula">V = π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2πrh + 2πr²</span>
            <div class="formula-explanation">
                The surface area consists of the lateral curved surface (2πrh) plus the two circular bases (2πr²).
            </div>
            <span class="formula">SA = 2π × ${radius} × ${height} + 2π × ${radius}² = ${lateralSurfaceArea.toFixed(2)} + ${(2 * baseArea).toFixed(2)} = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Lateral Surface Area:</strong></p>
            <span class="formula">LSA = 2πrh</span>
            <div class="formula-explanation">
                The lateral surface is a rectangle with width equal to the circumference of the base (2πr) and height equal to the cylinder's height.
            </div>
            <span class="formula">LSA = 2π × ${radius} × ${height} = ${lateralSurfaceArea.toFixed(2)} square units</span>
            
            <div class="educational-note">
                <p>A cylinder is a solid figure with two identical parallel circular bases connected by a curved lateral surface. All cross-sections parallel to the bases are circles with the same radius.</p>
                <p>It can be thought of as the shape formed by rotating a rectangle around one of its sides or as a prism with circular bases.</p>
            </div>
        `;
        
        // Create enhanced net diagram HTML with more detailed visualization
        const netHTML = `
            <svg width="100%" height="350" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Cylinder net showing rectangular lateral surface and two circular bases -->
                <!-- Adjusted the positioning to be more balanced and centered -->
                <circle cx="110" cy="175" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Adjusted height position to better align with the circles -->
                <rect x="150" y="${175 - height * 5}" width="${2 * Math.PI * radius * 10}" height="${height * 10}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                
                <circle cx="390" cy="175" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Grid lines for the rectangular surface -->
                ${(() => {
                    let lines = '';
                    const rectWidth = 2 * Math.PI * radius * 10;
                    const rectHeight = height * 10;
                    const startX = 150;
                    const startY = 175 - height * 5;
                    
                    // Vertical grid lines at intervals
                    for (let i = 1; i < 10; i++) {
                        const x = startX + (rectWidth * i / 10);
                        lines += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + rectHeight}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Horizontal grid lines at intervals
                    for (let i = 1; i < height; i++) {
                        const y = startY + (rectHeight * i / height);
                        lines += `<line x1="${startX}" y1="${y}" x2="${startX + rectWidth}" y2="${y}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Internal grid for the circular bases
                    // Draw radial lines
                    const leftCenter = 110;
                    const rightCenter = 390;
                    const centerY = 175;
                    const baseRadius = radius * 10;
                    
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const x1 = leftCenter + baseRadius * Math.cos(angle);
                        const y1 = centerY + baseRadius * Math.sin(angle);
                        const x2 = rightCenter + baseRadius * Math.cos(angle);
                        const y2 = centerY + baseRadius * Math.sin(angle);
                        
                        lines += `<line x1="${leftCenter}" y1="${centerY}" x2="${x1}" y2="${y1}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        lines += `<line x1="${rightCenter}" y1="${centerY}" x2="${x2}" y2="${y2}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Circular grid lines
                    for (let i = 1; i < 3; i++) {
                        const innerRadius = baseRadius * i / 3;
                        lines += `<circle cx="${leftCenter}" cy="${centerY}" r="${innerRadius}" 
                                   fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                        lines += `<circle cx="${rightCenter}" cy="${centerY}" r="${innerRadius}" 
                                   fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    return lines;
                })()}
                
                <!-- Labels -->
                <rect x="80" y="125" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="110" y="137" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base 1</text>
                
                <rect x="240" y="${175 - height * 5 - 20}" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="270" y="${175 - height * 5 - 8}" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Lateral Surface</text>
                
                <rect x="360" y="125" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="390" y="137" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base 2</text>
                
                <!-- Folding lines -->
                <line x1="150" y1="${175 - height * 5}" x2="150" y2="${175 + height * 5}" stroke="#000" stroke-width="1.5" stroke-dasharray="5,3"/>
                <line x1="${150 + 2 * Math.PI * radius * 10}" y1="${175 - height * 5}" x2="${150 + 2 * Math.PI * radius * 10}" y2="${175 + height * 5}" stroke="#000" stroke-width="1.5" stroke-dasharray="5,3"/>
                
                <!-- Dimensions -->
                <line x1="110" y1="220" x2="110" y2="250" stroke="#000" stroke-width="1"/>
                <line x1="90" y1="235" x2="130" y2="235" stroke="#000" stroke-width="1"/>
                <text x="110" y="265" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <line x1="130" y1="${175 - height * 5}" x2="130" y2="${175 + height * 5}" stroke="#000" stroke-width="1"/>
                <text x="115" y="175" transform="rotate(90, 115, 175)" text-anchor="middle" font-size="12" fill="#000">h=${height} units</text>
                
                <line x1="150" y1="${175 - height * 5 - 20}" x2="${150 + 2 * Math.PI * radius * 10}" y2="${175 - height * 5 - 20}" stroke="#000" stroke-width="1"/>
                <text x="${150 + Math.PI * radius * 10}" y="${175 - height * 5 - 30}" text-anchor="middle" font-size="12" fill="#000">Circumference = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</text>
            </svg>
            
            <p class="net-description">Net of a cylinder showing the two circular bases (radius ${radius} units) and the rectangular lateral surface (${height} × ${(2 * Math.PI * radius).toFixed(2)} units)</p>
            
            <div class="net-explanation">
                <p><strong>Understanding the Net:</strong> The net of a cylinder consists of:</p>
                <ul>
                    <li>Two identical circular <span class="property-highlight">bases</span> with radius ${radius} units</li>
                    <li>One rectangular <span class="property-highlight">lateral surface</span> with:
                        <ul>
                            <li>Height = cylinder height = ${height} units</li>
                            <li>Width = circumference of base = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</li>
                        </ul>
                    </li>
                </ul>
                <p>When folded along the dashed lines, this net forms a complete cylinder. The lateral surface wraps around to connect the two circular bases.</p>
            </div>
        `;
        
        // Create enhanced topology HTML with more educational content
        const topologyHTML = `
            <h4>Cylinder Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A cylinder is a 3D solid with two parallel circular bases connected by a curved lateral surface.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 3 (2 circular bases + 1 curved lateral surface)</li>
                        <li>Number of Edges: 2 circular edges</li>
                        <li>Number of Vertices: 0 (a smooth curved surface has no vertices)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>Cross-sections parallel to the bases are circles</li>
                        <li>Cross-sections through the axis of symmetry are rectangles</li>
                        <li>The cylinder has infinite rotational symmetry around its axis</li>
                        <li>The lateral surface, when unfolded, forms a rectangle</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Applications</div>
                <div class="property-value">
                    <ul>
                        <li>Cylinders are used in many real-world objects like cans, pipes, and tanks</li>
                        <li>Cylindrical containers maximize volume for a given amount of material</li>
                        <li>The cylinder is an example of a surface of revolution (created by rotating a rectangle around an axis)</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update all the panels
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netsDiv.innerHTML = netHTML;
        topologyDiv.innerHTML = topologyHTML;
        
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetsDiv) mobileNetsDiv.innerHTML = netHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
        // Ensure tabs are set up properly
        setupTabEvents();
        
    } else if (shape.type === 'cone') {
        // Handle cone shape details
        console.log("Rendering details for cone:", shape.dimensions);
        const { radius, height } = shape.dimensions;
        
        // Calculate slant height using Pythagorean theorem
        const slantHeight = Math.sqrt(radius * radius + height * height);
        
        // Calculate volume and surface area
        const volume = (1/3) * Math.PI * radius * radius * height;
        const baseArea = Math.PI * radius * radius;
        const lateralSurfaceArea = Math.PI * radius * slantHeight;
        const surfaceArea = lateralSurfaceArea + baseArea;
        const apexAngle = 2 * Math.atan(radius/height) * 180 / Math.PI;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Slant Height:</strong> ${slantHeight.toFixed(2)} units</p>
            <p><strong>Apex Angle:</strong> ${apexAngle.toFixed(2)}°</p>
            <p><strong>Base Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units</p>
            <p><strong>Sector Angle:</strong> ${(360 * radius / slantHeight).toFixed(2)}°</p>
            <p><strong>Apex Angle:</strong> ${apexAngle.toFixed(2)}°</p>
        `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = `
            <h4>Cone Formulas</h4>
            
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (1/3)πr²h</span>
            <div class="formula-explanation">
                The volume is one-third of the volume of a cylinder with the same base and height.
            </div>
            <span class="formula">V = (1/3)π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Slant Height:</strong></p>
            <span class="formula">l = √(r² + h²)</span>
            <div class="formula-explanation">
                The slant height is the distance from the apex to the edge of the base, calculated using the Pythagorean theorem.
            </div>
            <span class="formula">l = √(${radius}² + ${height}²) = ${slantHeight.toFixed(2)} units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = πr² + πrl</span>
            <div class="formula-explanation">
                The surface area consists of the circular base (πr²) plus the curved lateral surface (πrl).
            </div>
            <span class="formula">SA = πr² + πrl = ${baseArea.toFixed(2)} + ${lateralSurfaceArea.toFixed(2)} = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Lateral Surface Area:</strong></p>
            <span class="formula">LSA = πrl</span>
            <div class="formula-explanation">
                The lateral surface is a sector of a circle with radius equal to the slant height.
            </div>
            <span class="formula">LSA = π × ${radius} × ${slantHeight.toFixed(2)} = ${lateralSurfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Apex Angle:</strong></p>
            <span class="formula">θ = 2 × tan⁻¹(r/h)</span>
            <div class="formula-explanation">
                The apex angle is the angle at the tip of the cone, formed by the slant height lines.
            </div>
            <span class="formula">θ = 2 × tan⁻¹(${radius}/${height}) = ${apexAngle.toFixed(2)}°</span>
            
            <div class="educational-note">
                <p>A cone is formed by connecting all points on a circular base to a single apex point. The ratio of its height to radius determines how pointy or flat the cone appears.</p>
                <p>The lateral surface of a cone, when unfolded, creates a sector of a circle with radius equal to the slant height.</p>
            </div>
        `;
        
        // Create HTML for the net diagram with enhanced visualization
        const netHTML = `
            <svg width="100%" height="350" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Cone net showing circular base and sector for lateral surface -->
                <circle cx="150" cy="175" r="${radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Circular sector for lateral surface - improved positioning and angle -->
                <!-- The central angle of the sector is 2π×r/slant height -->
                ${(() => {
                    const sectorRadius = slantHeight * 10;
                    const sectorAngle = (radius / slantHeight) * 2 * Math.PI;
                    const centerX = 350;
                    const centerY = 175;
                    
                    // Calculate end point of arc
                    const endX = centerX + sectorRadius * Math.sin(sectorAngle);
                    const endY = centerY - sectorRadius * Math.cos(sectorAngle);
                    
                    // Create sector path with accurate angle
                    return `
                        <path d="M ${centerX},${centerY} 
                                L ${centerX},${centerY - sectorRadius} 
                                A ${sectorRadius} ${sectorRadius} 0 0 1 ${endX},${endY} 
                                Z" 
                              fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                    `;
                })()}
                
                <!-- Grid lines for the base -->
                ${(() => {
                    let lines = '';
                    const centerX = 150;
                    const centerY = 175;
                    const baseRadius = radius * 10;
                    
                    // Radial grid lines
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const x = centerX + baseRadius * Math.cos(angle);
                        const y = centerY + baseRadius * Math.sin(angle);
                        
                        lines += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Circular grid lines
                    for (let i = 1; i < 4; i++) {
                        const innerRadius = baseRadius * i / 4;
                        lines += `<circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" 
                                   fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    return lines;
                })()}
                
                <!-- Grid lines for sector - curved lines and radial lines -->
                ${(() => {
                    let lines = '';
                    const centerX = 350;
                    const centerY = 175;
                    const sectorRadius = slantHeight * 10;
                    const sectorAngle = (radius / slantHeight) * 2 * Math.PI;
                    
                    // Radial grid lines for sector
                    for (let i = 1; i < 6; i++) {
                        const subAngle = sectorAngle * i / 6;
                        const x = centerX + sectorRadius * Math.sin(subAngle);
                        const y = centerY - sectorRadius * Math.cos(subAngle);
                        
                        lines += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Circular arc grid lines for sector
                    for (let i = 1; i < 5; i++) {
                        const innerRadius = sectorRadius * i / 5;
                        const arcEndX = centerX + innerRadius * Math.sin(sectorAngle);
                        const arcEndY = centerY - innerRadius * Math.cos(sectorAngle);
                        
                        lines += `<path d="M ${centerX},${centerY - innerRadius} 
                                         A ${innerRadius} ${innerRadius} 0 0 1 ${arcEndX},${arcEndY}" 
                                   fill="none" stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    return lines;
                })()}
                
                <!-- Labels -->
                <rect x="120" y="125" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="137" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Base</text>
                
                <rect x="320" y="125" width="60" height="16" fill="white" fill-opacity="0.8"/>
                <text x="350" y="137" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Lateral Surface</text>
                
                <!-- Dimensions -->
                <line x1="150" y1="225" x2="150" y2="255" stroke="#000" stroke-width="1"/>
                <line x1="130" y1="240" x2="170" y2="240" stroke="#000" stroke-width="1"/>
                <text x="150" y="270" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <line x1="350" y1="175" x2="350" y2="${175 - slantHeight * 10}" stroke="#000" stroke-width="1" stroke-dasharray="5,3"/>
                <text x="365" y="110" text-anchor="middle" font-size="12" fill="#000">l=${slantHeight.toFixed(2)} units</text>
                
                ${(() => {
                    // Define sectorAngle for use in the path
                    const sectorAngle = (radius / slantHeight) * 2 * Math.PI;
                    return `
                        <path d="M ${350},${175} A 30 30 0 0 0 ${350 + 30 * Math.sin(sectorAngle)},${175 - 30 * Math.cos(sectorAngle)}" fill="none" stroke="#000" stroke-width="1"/>
                        <text x="${350 + 15 * Math.sin(sectorAngle/2)}" y="${175 - 15 * Math.cos(sectorAngle/2) - 5}" text-anchor="middle" font-size="10" fill="#000">${(sectorAngle * 180 / Math.PI).toFixed(1)}°</text>
                    `;
                })()}
                
                <line x1="200" y1="175" x2="300" y2="175" stroke="#000" stroke-width="1"/>
                <text x="250" y="165" text-anchor="middle" font-size="12" fill="#000">Cone height = ${height} units</text>
            </svg>
            
            <p class="net-description">Net of a cone showing the circular base (radius ${radius} units) and the sector that forms the lateral surface</p>
            
            <div class="net-explanation">
                <p><strong>Understanding the Net:</strong> The net of a cone consists of:</p>
                <ul>
                    <li>One circular <span class="property-highlight">base</span> with radius ${radius} units</li>
                    <li>One circular sector forming the <span class="property-highlight">lateral surface</span> with:
                        <ul>
                            <li>Radius = slant height = ${slantHeight.toFixed(2)} units</li>
                            <li>Arc length = circumference of base = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</li>
                            <li>Sector angle = ${(360 * radius / slantHeight).toFixed(2)}° (determined by the ratio of the base circumference to the slant height)</li>
                        </ul>
                    </li>
                </ul>
                <p>When the sector is folded around to form a cone, the straight edges of the sector meet, and the curved edge forms the circular base of the cone. The apex angle of the cone is ${apexAngle.toFixed(2)}°.</p>
            </div>
        `;
        
        // Create enhanced topology HTML with more educational content
        const topologyHTML = `
            <h4>Cone Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A cone is a 3D solid with a circular base and a single vertex (apex) connected to every point on the base by straight line segments.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 2 (1 circular base + 1 curved lateral surface)</li>
                        <li>Number of Edges: 1 circular edge</li>
                        <li>Number of Vertices: 1 (the apex)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Cross-Sections</div>
                <div class="property-value">
                    <ul>
                        <li>Parallel to the base: circles (decreasing in size toward the apex)</li>
                        <li>Through the apex and center of base: isosceles triangles</li>
                        <li>At an angle: ellipses, parabolas, or hyperbolas (conic sections)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>The apex is equidistant from any point on the base perimeter when measured along the lateral surface</li>
                        <li>The cone has rotational symmetry around its central axis</li>
                        <li>The lateral surface, when unfolded, forms a sector of a circle</li>
                        <li>Angle at the apex: ${apexAngle.toFixed(2)}°</li>
                        <li>Cones are the basis for "conic sections" - when sliced at different angles, they produce circles, ellipses, parabolas, and hyperbolas</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update all the panels
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netsDiv.innerHTML = netHTML;
        topologyDiv.innerHTML = topologyHTML;
        
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetsDiv) mobileNetsDiv.innerHTML = netHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
        // Ensure tabs are set up properly
        setupTabEvents();
        
    } else if (shape.type === 'sphere') {
        // Handle sphere shape details
        console.log("Rendering details for sphere:", shape.dimensions);
        const { radius } = shape.dimensions;
        
        // Calculate volume and surface area
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
        const greatCircleArea = Math.PI * Math.pow(radius, 2);
        const greatCircleCircumference = 2 * Math.PI * radius;
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Diameter:</strong> ${2 * radius} units</p>
            <p><strong>Great Circle Circumference:</strong> ${greatCircleCircumference.toFixed(2)} units</p>
            <p><strong>Center to Any Surface Point:</strong> ${radius} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Great Circle Area:</strong> ${greatCircleArea.toFixed(2)} square units</p>
            <p><strong>Surface Area to Volume Ratio:</strong> ${(surfaceArea/volume).toFixed(4)} units⁻¹</p>
            <p><strong>Isoperimetric Quotient:</strong> 1 (perfect efficiency)</p>
            <p><strong>Symmetry:</strong> Infinite (all rotation axes pass through center)</p>
        `;
        
        // Generate HTML content for formulas with enhanced explanations
        const formulasHTML = `
            <h4>Sphere Formulas</h4>
            
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (4/3)πr³</span>
            <div class="formula-explanation">
                The volume of a sphere is determined by its radius. A sphere contains the maximum volume for a given surface area.
            </div>
            <span class="formula">V = (4/3)π × ${radius}³ = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 4πr²</span>
            <div class="formula-explanation">
                The surface area of a sphere is exactly 4 times the area of its great circle, regardless of radius.
            </div>
            <span class="formula">SA = 4π × ${radius}² = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Great Circle Area:</strong></p>
            <span class="formula">Area = πr²</span>
            <div class="formula-explanation">
                A great circle is any circle on the sphere's surface that has the same center and radius as the sphere.
            </div>
            <span class="formula">Area = π × ${radius}² = ${greatCircleArea.toFixed(2)} square units</span>
            
            <p><strong>Great Circle Circumference:</strong></p>
            <span class="formula">C = 2πr</span>
            <div class="formula-explanation">
                The circumference of any great circle is the same as the circumference of a circle with the same radius.
            </div>
            <span class="formula">C = 2π × ${radius} = ${greatCircleCircumference.toFixed(2)} units</span>
            
            <div class="educational-note">
                <p>The sphere is the only 3D shape that has a fixed width in all directions. It has the minimum surface area for a given volume, which is why bubbles and droplets naturally form spheres.</p>
                <p>The surface area of a sphere is exactly 4 times the area of its great circle - this is a remarkable mathematical property that comes from the sphere's perfect symmetry.</p>
            </div>
        `;
        
        // Create an enhanced diagram for sphere with more detailed visualization and educational content
        const netHTML = `
            <svg width="100%" height="450" viewBox="0 0 500 450" preserveAspectRatio="xMidYMid meet" style="display: block; min-width: 100%; max-width: 100%; margin: 0 auto;">
                <!-- Sphere projections: globe view and stereographic projection -->
                
                <!-- 3D globe representation -->
                <circle cx="150" cy="150" r="${radius * 10}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Equator line -->
                <ellipse cx="150" cy="150" rx="${radius * 10}" ry="${radius * 3}" stroke="#2196f3" stroke-width="1.5" fill="none"/>
                
                <!-- Prime meridian -->
                <line x1="150" y1="${150 - radius * 10}" x2="150" y2="${150 + radius * 10}" stroke="#2196f3" stroke-width="1.5"/>
                
                <!-- Grid lines for latitude and longitude -->
                ${(() => {
                    let lines = '';
                    const centerX = 150;
                    const centerY = 150;
                    const sphereRadius = radius * 10;
                    
                    // Latitude lines (parallel to equator)
                    for (let i = 1; i < 4; i++) {
                        const yOffset = sphereRadius * i / 4;
                        lines += `<ellipse cx="${centerX}" cy="${centerY - yOffset}" rx="${sphereRadius}" ry="${sphereRadius * 0.3 * (4-i)/4}" 
                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                        lines += `<ellipse cx="${centerX}" cy="${centerY + yOffset}" rx="${sphereRadius}" ry="${sphereRadius * 0.3 * (4-i)/4}" 
                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                    }
                    
                    // Longitude lines (meridians)
                    for (let i = 1; i < 6; i++) {
                        const angle = (i / 6) * Math.PI;
                        
                        lines += `<ellipse cx="${centerX}" cy="${centerY}" rx="${sphereRadius * Math.sin(angle)}" ry="${sphereRadius}" 
                                  transform="rotate(${90 - i * 30}, ${centerX}, ${centerY})"
                                  stroke="#000" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>`;
                    }
                    
                    return lines;
                })()}
                
                <!-- Highlight great circle -->
                <ellipse cx="150" cy="150" rx="${radius * 10}" ry="${radius * 10}" stroke="#e74c3c" stroke-width="1.5" fill="none"/>
                
                <!-- Labels -->
                <rect x="100" y="90" width="100" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="102" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Sphere</text>
                
                <rect x="90" y="115" width="120" height="16" fill="white" fill-opacity="0.8"/>
                <text x="150" y="127" text-anchor="middle" font-size="12" fill="#e74c3c">Great Circle</text>
                
                <!-- Dimensions for sphere -->
                <line x1="150" y1="${150 + radius * 10 + 10}" x2="150" y2="${150 + radius * 10 + 30}" stroke="#000" stroke-width="1"/>
                <line x1="125" y1="${150 + radius * 10 + 20}" x2="175" y2="${150 + radius * 10 + 20}" stroke="#000" stroke-width="1"/>
                <text x="150" y="${150 + radius * 10 + 45}" text-anchor="middle" font-size="12" fill="#000">r=${radius} units</text>
                
                <!-- Map projection (mercator-style) -->
                <rect x="300" y="80" width="${2 * Math.PI * radius * 5}" height="${2 * radius * 10}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                
                <!-- Grid lines for map projection -->
                ${(() => {
                    let lines = '';
                    const startX = 300;
                    const startY = 80;
                    const width = 2 * Math.PI * radius * 5;
                    const height = 2 * radius * 10;
                    
                    // Latitude lines
                    for (let i = 1; i < 9; i++) {
                        const y = startY + height * i / 10;
                        lines += `<line x1="${startX}" y1="${y}" x2="${startX + width}" y2="${y}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    // Longitude lines
                    for (let i = 1; i < 12; i++) {
                        const x = startX + width * i / 12;
                        lines += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + height}" 
                                   stroke="#000" stroke-width="0.5" stroke-opacity="0.3"/>`;
                    }
                    
                    return lines;
                })()}
                
                <rect x="360" y="60" width="140" height="16" fill="white" fill-opacity="0.8"/>
                <text x="430" y="72" text-anchor="middle" font-size="14" font-weight="bold" fill="#000">Map Projection</text>
                
                <!-- Dimensions for map -->
                <line x1="300" y1="${80 + 2 * radius * 10 + 10}" x2="${300 + 2 * Math.PI * radius * 5}" y2="${80 + 2 * radius * 10 + 10}" stroke="#000" stroke-width="1"/>
                <text x="${300 + Math.PI * radius * 5}" y="${80 + 2 * radius * 10 + 25}" text-anchor="middle" font-size="12" fill="#000">Circumference = 2πr = ${(2 * Math.PI * radius).toFixed(2)} units</text>
                
                <!-- Great Circle with 3D effect - moved down -->
                <ellipse cx="250" cy="320" rx="${radius * 5}" ry="${radius * 5}" fill="#e3f2fd" stroke="#e74c3c" stroke-width="2"/>
                <line x1="250" y1="320" x2="${250 + radius * 5}" y2="320" stroke="#000" stroke-width="0.5" stroke-opacity="0.7"/>
                <text x="${250 + radius * 2.5}" y="310" text-anchor="middle" font-size="10" fill="#000">r=${radius} units</text>
                <text x="250" y="355" text-anchor="middle" font-size="12" fill="#e74c3c">Great Circle Cross-Section</text>
            </svg>
            
            <p class="net-description">Unlike polyhedra, a sphere doesn't have a flat net. Instead, we show representations: a 3D globe, a map projection, and a great circle.</p>
            
            <div class="net-explanation">
                <p><strong>Understanding Sphere Projections:</strong></p>
                <ul>
                    <li>A sphere is a perfectly round geometrical object in 3D space</li>
                    <li>All points on the surface are equidistant from the center (radius = ${radius} units)</li>
                    <li>The red circle shows a "great circle" - any circle on the sphere with the same center and radius as the sphere</li>
                    <li>The rectangular map shows a flattened projection of the sphere's surface (similar to how world maps work)</li>
                </ul>
                <p>Unlike polyhedra, spheres cannot be unfolded into a flat net without distortion. Map projections help visualize the sphere's surface in 2D, but always introduce some form of distortion (either in area, angle, or distance).</p>
                <p>Great circles are important in navigation and mathematics - they represent the shortest path between two points on a sphere's surface.</p>
            </div>
        `;
        
        // Create enhanced topology HTML with more educational content
        const topologyHTML = `
            <h4>Sphere Properties</h4>
            <div class="property-item">
                <div class="property-name">Definition</div>
                <div class="property-value">A sphere is a perfectly round geometrical object in 3D space where all points on the surface are equidistant from the center.</div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Topology</div>
                <div class="property-value">
                    <ul>
                        <li>Number of Faces: 1 continuous curved surface</li>
                        <li>Number of Edges: 0</li>
                        <li>Number of Vertices: 0</li>
                        <li>Genus: 0 (a sphere has no holes)</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Special Properties</div>
                <div class="property-value">
                    <ul>
                        <li>A sphere has the smallest surface area among all shapes enclosing a given volume</li>
                        <li>All cross-sections through a sphere's center are great circles with radius = ${radius} units</li>
                        <li>Any cross-section of a sphere is a circle (not necessarily a great circle)</li>
                        <li>A sphere has infinite rotational symmetry around any diameter</li>
                        <li>The shadow of a sphere is always a circle, regardless of light direction</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-item">
                <div class="property-name">Interesting Facts</div>
                <div class="property-value">
                    <ul>
                        <li>A sphere is a special case of an ellipsoid where all three radii are equal</li>
                        <li>The Euler characteristic of a sphere is 2 (V - E + F = 2)</li>
                        <li>A sphere is the only shape with a constant width in all directions</li>
                        <li>The surface area of a sphere is exactly 4 times the area of its great circle</li>
                        <li>Soap bubbles form spheres because they minimize surface tension</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Update all the panels
        dimensionsDiv.innerHTML = dimensionsHTML;
        propertiesDiv.innerHTML = propertiesHTML;
        formulasDiv.innerHTML = formulasHTML;
        netsDiv.innerHTML = netHTML;
        topologyDiv.innerHTML = topologyHTML;
        
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = dimensionsHTML;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = propertiesHTML;
        if (mobileFormulasDiv) mobileFormulasDiv.innerHTML = formulasHTML;
        if (mobileNetsDiv) mobileNetsDiv.innerHTML = netHTML;
        if (mobileTopologyDiv) mobileTopologyDiv.innerHTML = topologyHTML;
        
        // Ensure tabs are set up properly
        setupTabEvents();
        
    } else {
        // For any other shapes, display a generic message
        console.log("Unknown shape type:", shape.type);
        
        dimensionsDiv.innerHTML = `<p>Dimensions for ${shape.type}</p>`;
        propertiesDiv.innerHTML = `<p>Properties for ${shape.type}</p>`;
        
        if (mobileDimensionsDiv) mobileDimensionsDiv.innerHTML = `<p>Dimensions for ${shape.type}</p>`;
        if (mobilePropertiesDiv) mobilePropertiesDiv.innerHTML = `<p>Properties for ${shape.type}</p>`;
        
        // Ensure tabs are set up properly
        setupTabEvents();
    }
}