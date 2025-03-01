// Helper functions for UI button states
export function setActiveButton(buttonId) {
    const buttons = document.querySelectorAll('.shape-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

export function setActiveViewButton(buttonId) {
    const buttons = document.querySelectorAll('.view-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

export function resetActiveViewButtons() {
    const buttons = document.querySelectorAll('.view-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
}

export function setActivePlaneButton(buttonId) {
    const buttons = document.querySelectorAll('.plane-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Show/hide fullscreen images
export function showFullScreenImage(imageSrc) {
    const overlay = document.getElementById('fullscreen-image-overlay');
    const image = document.getElementById('fullscreen-image');
    
    image.src = imageSrc;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    
    // Prevent scrolling while overlay is open
    document.body.style.overflow = 'hidden';
}

export function hideFullScreenImage() {
    const overlay = document.getElementById('fullscreen-image-overlay');
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Setup tab switching events
export function setupTabEvents() {
    console.log("Setting up tab events");
    
    // Make sure the shape details container is visible
    const shapeDetails = document.getElementById('shape-details');
    if (shapeDetails) {
        shapeDetails.style.display = 'flex';
    }
    
    // Mobile shape details
    const mobileShapeInfo = document.getElementById('info-panel');
    if (mobileShapeInfo) {
        mobileShapeInfo.style.display = 'block';
    }
    
    // Define tab buttons directly by ID for more reliable access
    const tabButtons = {
        metrics: document.getElementById('metrics-tab'),
        formulas: document.getElementById('formulas-tab'),
        nets: document.getElementById('nets-tab'),
        properties: document.getElementById('properties-tab')
    };
    
    const tabContents = {
        metrics: document.getElementById('metrics-content'),
        formulas: document.getElementById('formulas-content'),
        nets: document.getElementById('nets-content'),
        properties: document.getElementById('properties-content')
    };
    
    const mobileTabButtons = {
        metrics: document.getElementById('mobile-metrics-tab'),
        formulas: document.getElementById('mobile-formulas-tab'),
        nets: document.getElementById('mobile-nets-tab'),
        properties: document.getElementById('mobile-properties-tab')
    };
    
    const mobileTabContents = {
        metrics: document.getElementById('mobile-metrics-content'),
        formulas: document.getElementById('mobile-formulas-content'),
        nets: document.getElementById('mobile-nets-content'),
        properties: document.getElementById('mobile-properties-content')
    };
    
    // Debug log to check existence of elements
    console.log("Tab elements found:", {
        desktopButtons: tabButtons,
        desktopContents: tabContents,
        mobileButtons: mobileTabButtons,
        mobileContents: mobileTabContents
    });
    
    // Function to activate a specific tab
    function activateTab(type, tabName) {
        // Get the appropriate sets of buttons and contents
        const buttons = type === 'desktop' ? tabButtons : mobileTabButtons;
        const contents = type === 'desktop' ? tabContents : mobileTabContents;
        
        // Deactivate all tabs
        Object.values(buttons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        Object.values(contents).forEach(content => {
            if (content) content.classList.remove('active');
        });
        
        // Activate the selected tab
        if (buttons[tabName]) buttons[tabName].classList.add('active');
        if (contents[tabName]) contents[tabName].classList.add('active');
        
        console.log(`Activated ${type} tab: ${tabName}`);
    }
    
    // Set up click handlers for desktop tabs
    Object.entries(tabButtons).forEach(([tabName, button]) => {
        if (!button) return;
        
        // Remove any existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            tabButtons[tabName] = newButton; // Update reference
        }
        
        // Add click listener
        newButton.addEventListener('click', () => {
            activateTab('desktop', tabName);
        });
        
        // Also add touch event for better mobile response
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            activateTab('desktop', tabName);
        }, { passive: false });
    });
    
    // Set up click handlers for mobile tabs
    Object.entries(mobileTabButtons).forEach(([tabName, button]) => {
        if (!button) return;
        
        // Remove any existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            mobileTabButtons[tabName] = newButton; // Update reference
        }
        
        // Add click listener
        newButton.addEventListener('click', () => {
            activateTab('mobile', tabName);
        });
        
        // Also add touch event for better mobile response
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            activateTab('mobile', tabName);
        }, { passive: false });
    });
    
    // Activate default tabs
    activateTab('desktop', 'metrics');
    activateTab('mobile', 'metrics');
}