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
        
        // Generate basic HTML content
        const dimensionsHTML = `
            <p><strong>Width:</strong> ${width} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Length:</strong> ${length} units</p>
            <p><strong>Dimensions:</strong> ${width} × ${height} × ${length} units</p>
        `;
        
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea} square units</p>
            <p><strong>Base Area:</strong> ${width * length} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${2 * (width + length) * height} square units</p>
        `;
        
        // Create the formulas HTML
        const formulasHTML = `
            <h4>${shape.type === 'cube' ? 'Cube' : 'Rectangular Prism'} Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = length × width × height</span>
            <span class="formula">V = ${length} × ${width} × ${height} = ${volume} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2(length × width + length × height + width × height)</span>
            <span class="formula">SA = 2(${length} × ${width} + ${length} × ${height} + ${width} × ${height})</span>
            <span class="formula">SA = 2(${length * width} + ${length * height} + ${width * height}) = ${surfaceArea} square units</span>
        `;
        
        // Create net diagram HTML
        const netHTML = `
            <h4>${shape.type === 'cube' ? 'Cube' : 'Rectangular Prism'} Net</h4>
            <p>A flat representation of all 6 faces that fold to create the 3D shape.</p>
            <div style="text-align: center; padding: 20px;">
                <svg width="300" height="300" viewBox="0 0 300 300">
                    <!-- Simple cube/rectangular prism net -->
                    <rect x="100" y="100" width="100" height="100" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                    <rect x="100" y="0" width="100" height="100" fill="#c8e6fa" stroke="#2196f3" stroke-width="2"/>
                    <rect x="100" y="200" width="100" height="100" fill="#c8e6fa" stroke="#2196f3" stroke-width="2"/>
                    <rect x="0" y="100" width="100" height="100" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                    <rect x="200" y="100" width="100" height="100" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                </svg>
            </div>
            <p>This net shows the 6 rectangular faces that make up the shape.</p>
        `;
        
        // Create topology HTML
        const topologyHTML = `
            <h4>${shape.type === 'cube' ? 'Cube' : 'Rectangular Prism'} Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td>6 rectangles</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td>12</td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td>8</td>
                </tr>
                <tr>
                    <td>Euler's Formula</td>
                    <td>V - E + F = 2 → 8 - 12 + 6 = 2 ✓</td>
                </tr>
            </table>
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
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units (each base)</p>
            <p><strong>Circumference of Base:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Create the formulas HTML
        const formulasHTML = `
            <h4>Cylinder Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = πr²h</span>
            <span class="formula">V = π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 2πrh + 2πr²</span>
            <span class="formula">SA = 2π × ${radius} × ${height} + 2π × ${radius}² = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Lateral Surface Area:</strong></p>
            <span class="formula">LSA = 2πrh</span>
            <span class="formula">LSA = 2π × ${radius} × ${height} = ${lateralSurfaceArea.toFixed(2)} square units</span>
        `;
        
        // Create net diagram HTML
        const netHTML = `
            <h4>Cylinder Net</h4>
            <p>A flat representation of a cylinder showing the rectangular lateral surface and two circular bases.</p>
            <div style="text-align: center; padding: 20px;">
                <svg width="300" height="200" viewBox="0 0 300 200">
                    <!-- Circular base 1 -->
                    <circle cx="50" cy="100" r="${radius * 15}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                    
                    <!-- Rectangular lateral surface -->
                    <rect x="100" y="50" width="${2 * Math.PI * radius * 8}" height="${height * 15}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                    
                    <!-- Circular base 2 -->
                    <circle cx="250" cy="100" r="${radius * 15}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                </svg>
            </div>
            <p>This net shows how a cylinder unfolds into a rectangle (the curved side) and two circles (the bases).</p>
        `;
        
        // Create topology HTML
        const topologyHTML = `
            <h4>Cylinder Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td>3 (2 circular bases + 1 curved lateral surface)</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td>2 circular edges</td>
                </tr>
                <tr>
                    <td>Cross Sections</td>
                    <td>Perpendicular to axis: Circles<br>Parallel to axis: Rectangles</td>
                </tr>
            </table>
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
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Height:</strong> ${height} units</p>
            <p><strong>Slant Height:</strong> ${slantHeight.toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Lateral Surface Area:</strong> ${lateralSurfaceArea.toFixed(2)} square units</p>
            <p><strong>Base Area:</strong> ${baseArea.toFixed(2)} square units</p>
            <p><strong>Base Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Create the formulas HTML
        const formulasHTML = `
            <h4>Cone Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (1/3)πr²h</span>
            <span class="formula">V = (1/3)π × ${radius}² × ${height} = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Slant Height:</strong></p>
            <span class="formula">l = √(r² + h²)</span>
            <span class="formula">l = √(${radius}² + ${height}²) = ${slantHeight.toFixed(2)} units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = πr² + πrl</span>
            <span class="formula">SA = πr² + πrl = ${baseArea.toFixed(2)} + ${lateralSurfaceArea.toFixed(2)} = ${surfaceArea.toFixed(2)} square units</span>
        `;
        
        // Create net diagram HTML
        const netHTML = `
            <h4>Cone Net</h4>
            <p>A flat representation of a cone showing the circular base and sector for the lateral surface.</p>
            <div style="text-align: center; padding: 20px;">
                <svg width="300" height="200" viewBox="0 0 300 200">
                    <!-- Circular base -->
                    <circle cx="100" cy="100" r="${radius * 15}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                    
                    <!-- Sector for lateral surface (approximated) -->
                    <path d="M 200,100 L 280,130 A 90,90 0 0 1 280,70 Z" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                </svg>
            </div>
            <p>This net shows how a cone unfolds into a circle (the base) and a sector of a circle (the curved side).</p>
        `;
        
        // Create topology HTML
        const topologyHTML = `
            <h4>Cone Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td>2 (1 circular base + 1 curved lateral surface)</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td>1 circular edge</td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td>1 (the apex point)</td>
                </tr>
                <tr>
                    <td>Cross Sections</td>
                    <td>Parallel to base: Circles<br>Through apex: Triangles</td>
                </tr>
            </table>
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
        
        // Generate HTML content for dimensions
        const dimensionsHTML = `
            <p><strong>Radius:</strong> ${radius} units</p>
            <p><strong>Diameter:</strong> ${2 * radius} units</p>
            <p><strong>Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Generate HTML content for properties
        const propertiesHTML = `
            <p><strong>Volume:</strong> ${volume.toFixed(2)} cubic units</p>
            <p><strong>Surface Area:</strong> ${surfaceArea.toFixed(2)} square units</p>
            <p><strong>Great Circle Area:</strong> ${greatCircleArea.toFixed(2)} square units</p>
            <p><strong>Great Circle Circumference:</strong> ${(2 * Math.PI * radius).toFixed(2)} units</p>
        `;
        
        // Create the formulas HTML
        const formulasHTML = `
            <h4>Sphere Formulas</h4>
            <p><strong>Volume:</strong></p>
            <span class="formula">V = (4/3)πr³</span>
            <span class="formula">V = (4/3)π × ${radius}³ = ${volume.toFixed(2)} cubic units</span>
            
            <p><strong>Surface Area:</strong></p>
            <span class="formula">SA = 4πr²</span>
            <span class="formula">SA = 4π × ${radius}² = ${surfaceArea.toFixed(2)} square units</span>
            
            <p><strong>Great Circle:</strong></p>
            <span class="formula">Area = πr²</span>
            <span class="formula">Area = π × ${radius}² = ${greatCircleArea.toFixed(2)} square units</span>
        `;
        
        // Create a diagram for sphere (not a true net but a representation)
        const netHTML = `
            <h4>Sphere Representation</h4>
            <p>Unlike polyhedra, a sphere cannot be unfolded into a flat net. Instead, we show a 3D representation and a flattened map projection.</p>
            <div style="text-align: center; padding: 20px;">
                <svg width="300" height="200" viewBox="0 0 300 200">
                    <!-- 3D sphere representation with latitude/longitude lines -->
                    <circle cx="100" cy="100" r="${radius * 15}" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
                    
                    <!-- Longitude lines (simplified) -->
                    <ellipse cx="100" cy="100" rx="${radius * 15}" ry="${radius * 5}" stroke="#2196f3" stroke-width="1" fill="none"/>
                    <line x1="100" y1="${100 - radius * 15}" x2="100" y2="${100 + radius * 15}" stroke="#2196f3" stroke-width="1"/>
                    
                    <!-- Map projection -->
                    <rect x="150" y="60" width="${radius * 30}" height="${radius * 15}" fill="#bbdefb" stroke="#2196f3" stroke-width="2"/>
                    
                    <!-- Grid lines on map -->
                    <line x1="165" y1="60" x2="165" y2="${60 + radius * 15}" stroke="#2196f3" stroke-width="0.5"/>
                    <line x1="195" y1="60" x2="195" y2="${60 + radius * 15}" stroke="#2196f3" stroke-width="0.5"/>
                    <line x1="225" y1="60" x2="225" y2="${60 + radius * 15}" stroke="#2196f3" stroke-width="0.5"/>
                    <line x1="255" y1="60" x2="255" y2="${60 + radius * 15}" stroke="#2196f3" stroke-width="0.5"/>
                    
                    <line x1="150" y1="75" x2="${150 + radius * 30}" y2="75" stroke="#2196f3" stroke-width="0.5"/>
                    <line x1="150" y1="90" x2="${150 + radius * 30}" y2="90" stroke="#2196f3" stroke-width="0.5"/>
                    <line x1="150" y1="105" x2="${150 + radius * 30}" y2="105" stroke="#2196f3" stroke-width="0.5"/>
                </svg>
            </div>
            <p>The image shows a sphere with a radius of ${radius} units and its map projection.</p>
        `;
        
        // Create topology HTML
        const topologyHTML = `
            <h4>Sphere Properties</h4>
            <table class="property-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Number of Faces</td>
                    <td>1 continuous curved surface</td>
                </tr>
                <tr>
                    <td>Number of Edges</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>Number of Vertices</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>Special Properties</td>
                    <td>
                        - All points are equidistant from center<br>
                        - Perfect symmetry in all directions<br>
                        - All cross-sections through center are great circles
                    </td>
                </tr>
            </table>
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