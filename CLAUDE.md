# 3D Shape Visualizations Project Guide

## Commands
- No build/lint commands required - this is a standalone web app
- To start: Open index.html in a browser
- To test: Manual testing with browser tools

## Code Structure
- index.html - Main HTML structure
- styles.css - All styling rules
- script.js - Core application logic using Three.js

## Code Style Guidelines
- HTML: Semantic tags, 4-space indentation
- CSS: Class-based styling, descriptive class names
- JavaScript:
  - Camel case for variables/functions (e.g., `createShape`, `updateCameraPosition`)
  - Use descriptive variable names
  - Comment complex logic and function purposes
  - Keep functions focused on single responsibilities

## Three.js Patterns
- Scene setup with main and orthographic views
- Shape creation with standard materials
- OrbitControls for camera manipulation
- Grid and axis helpers for orientation

## Educational Features
- Display formulas for volume, surface area with explanations
- Show detailed net patterns for 3D shapes
- Interactive cross-section visualization
- 2D projection views with proper orientation