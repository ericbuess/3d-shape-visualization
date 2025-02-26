/**
 * UI helper functions
 */

/**
 * Set active state on a button and remove from siblings
 * @param {string} buttonId - ID of the button to set as active
 * @param {string} activeClass - Class to apply to active button (default: 'active')
 */
export function setActiveButton(buttonId, activeClass = 'active') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Find parent container
    const parent = button.parentElement;
    if (!parent) return;
    
    // Remove active class from all siblings
    const buttons = parent.querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove(activeClass));
    
    // Add active class to target button
    button.classList.add(activeClass);
}

/**
 * Toggle visibility of an element
 * @param {string} elementId - ID of the element to toggle
 * @param {boolean} show - Whether to show or hide the element
 * @param {string} hiddenClass - Class used to hide elements (default: 'hidden')
 */
export function toggleVisibility(elementId, show, hiddenClass = 'hidden') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (show) {
        element.classList.remove(hiddenClass);
    } else {
        element.classList.add(hiddenClass);
    }
}

/**
 * Update a span element's text content
 * @param {string} elementId - ID of the span element
 * @param {string} text - New text content
 */
export function updateSpanText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Create HTML for formulas with proper formatting
 * @param {string} title - Formula title
 * @param {string[]} formulas - Array of formula strings
 * @param {string} explanation - Optional explanation text
 * @returns {string} Formatted HTML for the formula
 */
export function createFormulaHTML(title, formulas, explanation = '') {
    let html = `<p><strong>${title}:</strong></p>`;
    
    formulas.forEach(formula => {
        html += `<span class="formula">${formula}</span>`;
    });
    
    if (explanation) {
        html += `<div class="formula-explanation">${explanation}</div>`;
    }
    
    return html;
}

/**
 * Format a number to fixed decimal places, avoiding trailing zeros
 * @param {number} value - Number to format
 * @param {number} decimals - Maximum decimal places
 * @returns {string} Formatted number as string
 */
export function formatNumber(value, decimals = 2) {
    const result = Number(value.toFixed(decimals));
    return result.toString();
}

/**
 * Show a fullscreen image overlay
 * @param {string} imageSrc - Image source path
 */
export function showFullScreenImage(imageSrc) {
    const overlay = document.getElementById('fullscreen-image-overlay');
    const image = document.getElementById('fullscreen-image');
    
    if (!overlay || !image) return;
    
    image.src = imageSrc;
    overlay.classList.remove('hidden');
    
    // Prevent scrolling while overlay is open
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the fullscreen image overlay
 */
export function hideFullScreenImage() {
    const overlay = document.getElementById('fullscreen-image-overlay');
    if (!overlay) return;
    
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}