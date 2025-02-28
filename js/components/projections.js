/**
 * ProjectionManager - Manages orthographic projections and 2D/3D transitions
 */
import { CONFIG } from '../config.js';

export class ProjectionManager {
    /**
     * Initialize the projection manager
     * @param {EventBus} eventBus - The application event bus
     * @param {object} appState - The application state
     */
    constructor(eventBus, appState) {
        this.eventBus = eventBus;
        this.appState = appState;
        
        // Orthographic view objects
        this.topScene = null;
        this.topCamera = null;
        this.topRenderer = null;
        
        this.frontScene = null;
        this.frontCamera = null;
        this.frontRenderer = null;
        
        this.rightScene = null;
        this.rightCamera = null;
        this.rightRenderer = null;
        
        this.leftScene = null;
        this.leftCamera = null;
        this.leftRenderer = null;
        
        // Mobile orthographic views
        this.mobileViews = {
            top: { scene: null, camera: null, renderer: null },
            front: { scene: null, camera: null, renderer: null },
            right: { scene: null, camera: null, renderer: null },
            left: { scene: null, camera: null, renderer: null }
        };
        
        // Initialize view size
        this.orthographicViewSize = 7;
        
        // Subscribe to events
        this.eventBus.subscribe('mobileViews:resize', () => this.resizeMobileViewRenderers());
    }
    
    /**
     * Initialize orthographic views
     */
    init() {
        console.log('Initializing orthographic views...');
        
        // Create grid helpers
        const gridHelpers = this.createGridHelpers();
        
        // Initialize desktop views
        this.initDesktopViews(gridHelpers);
        
        // Initialize mobile views
        this.initMobileViews(gridHelpers);
    }
    
    /**
     * Create grid helpers for orthographic views
     * @returns {object} Object containing grid helpers
     */
    createGridHelpers() {
        // Grid helper properties
        const gridSize = 10;
        const gridDivisions = 10;
        const gridColor = 0x000000;
        const gridOpacity = 0.2;
        
        // Create grid material
        const gridMaterial = new THREE.LineBasicMaterial({ 
            color: gridColor, 
            transparent: true, 
            opacity: gridOpacity 
        });
        
        // Function to create grid lines for a specific plane
        const createGridLines = (plane, size, divisions) => {
            const step = size / divisions;
            const halfSize = size / 2;
            const points = [];
            
            // Create grid based on plane orientation
            if (plane === 'xy') {
                // Vertical lines along X axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(i, -halfSize, 0),
                        new THREE.Vector3(i, halfSize, 0)
                    );
                }
                
                // Horizontal lines along Y axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(-halfSize, i, 0),
                        new THREE.Vector3(halfSize, i, 0)
                    );
                }
            } else if (plane === 'xz') {
                // Create lines for XZ plane (top view)
                // Vertical lines along X axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(i, 0, -halfSize),
                        new THREE.Vector3(i, 0, halfSize)
                    );
                }
                
                // Horizontal lines along Z axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(-halfSize, 0, i),
                        new THREE.Vector3(halfSize, 0, i)
                    );
                }
            } else if (plane === 'yz') {
                // Create lines for YZ plane (side view)
                // Vertical lines along Y axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(0, i, -halfSize),
                        new THREE.Vector3(0, i, halfSize)
                    );
                }
                
                // Horizontal lines along Z axis
                for (let i = -halfSize; i <= halfSize; i += step) {
                    points.push(
                        new THREE.Vector3(0, -halfSize, i),
                        new THREE.Vector3(0, halfSize, i)
                    );
                }
            }
            
            // Create buffer geometry from points
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Create lines with the grid material
            return new THREE.LineSegments(geometry, gridMaterial.clone());
        };
        
        // Create axis helper function
        const createAxisHelper = (plane) => {
            const group = new THREE.Group();
            const axisLength = 5;
            
            // Create materials for each axis
            const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            
            if (plane === 'xz') {
                // X and Z axes for top view
                const xPoints = [
                    new THREE.Vector3(-axisLength, 0, 0),
                    new THREE.Vector3(axisLength, 0, 0)
                ];
                const zPoints = [
                    new THREE.Vector3(0, 0, -axisLength),
                    new THREE.Vector3(0, 0, axisLength)
                ];
                
                const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
                const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
                
                const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
                const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
                
                group.add(xAxis);
                group.add(zAxis);
            } else if (plane === 'xy') {
                // X and Y axes for front view
                const xPoints = [
                    new THREE.Vector3(-axisLength, 0, 0),
                    new THREE.Vector3(axisLength, 0, 0)
                ];
                const yPoints = [
                    new THREE.Vector3(0, -axisLength, 0),
                    new THREE.Vector3(0, axisLength, 0)
                ];
                
                const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
                const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
                
                const xAxis = new THREE.Line(xGeometry, xAxisMaterial);
                const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
                
                group.add(xAxis);
                group.add(yAxis);
            } else if (plane === 'yz') {
                // Y and Z axes for side view
                const yPoints = [
                    new THREE.Vector3(0, -axisLength, 0),
                    new THREE.Vector3(0, axisLength, 0)
                ];
                const zPoints = [
                    new THREE.Vector3(0, 0, -axisLength),
                    new THREE.Vector3(0, 0, axisLength)
                ];
                
                const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
                const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
                
                const yAxis = new THREE.Line(yGeometry, yAxisMaterial);
                const zAxis = new THREE.Line(zGeometry, zAxisMaterial);
                
                group.add(yAxis);
                group.add(zAxis);
            }
            
            return group;
        };
        
        // Create grid helpers for each plane
        const gridHelperXZ = createGridLines('xz', gridSize, gridDivisions);
        const gridHelperXY = createGridLines('xy', gridSize, gridDivisions);
        const gridHelperYZ = createGridLines('yz', gridSize, gridDivisions);
        
        // Create axis helpers
        const topAxisHelper = createAxisHelper('xz');
        const frontAxisHelper = createAxisHelper('xy');
        const rightAxisHelper = createAxisHelper('yz');
        const leftAxisHelper = createAxisHelper('yz');
        
        return {
            gridHelperXZ,
            gridHelperXY,
            gridHelperYZ,
            topAxisHelper,
            frontAxisHelper,
            rightAxisHelper,
            leftAxisHelper
        };
    }
    
    /**
     * Initialize desktop orthographic views
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initDesktopViews(gridHelpers) {
        // Initialize top view
        this.initTopView(gridHelpers);
        
        // Initialize front view
        this.initFrontView(gridHelpers);
        
        // Initialize right view
        this.initRightView(gridHelpers);
        
        // Initialize left view
        this.initLeftView(gridHelpers);
    }
    
    /**
     * Initialize top view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initTopView(gridHelpers) {
        const topContainer = document.getElementById('top-view-canvas');
        if (!topContainer) {
            console.error('Top view container not found');
            return;
        }
        
        this.topScene = new THREE.Scene();
        this.topScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
        topLight.position.set(0, 10, 0);
        this.topScene.add(topLight);
        this.topScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.topScene.add(gridHelpers.gridHelperXZ);
        this.topScene.add(gridHelpers.topAxisHelper);
        
        // Create orthographic camera
        this.topCamera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.topCamera.position.set(0, 10, 0);
        this.topCamera.lookAt(0, 0, 0);
        
        // Create renderer
        this.topRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.topRenderer.setSize(topContainer.clientWidth, topContainer.clientHeight);
        topContainer.innerHTML = ''; // Clear container
        topContainer.appendChild(this.topRenderer.domElement);
        
        // Force an initial render
        this.topRenderer.render(this.topScene, this.topCamera);
    }
    
    /**
     * Initialize front view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initFrontView(gridHelpers) {
        const frontContainer = document.getElementById('front-view-canvas');
        if (!frontContainer) {
            console.error('Front view container not found');
            return;
        }
        
        this.frontScene = new THREE.Scene();
        this.frontScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 10);
        this.frontScene.add(frontLight);
        this.frontScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.frontScene.add(gridHelpers.gridHelperXY);
        this.frontScene.add(gridHelpers.frontAxisHelper);
        
        // Create orthographic camera
        this.frontCamera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.frontCamera.position.set(0, 0, 10);
        this.frontCamera.lookAt(0, 0, 0);
        
        // Create renderer
        this.frontRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.frontRenderer.setSize(frontContainer.clientWidth, frontContainer.clientHeight);
        frontContainer.innerHTML = ''; // Clear container
        frontContainer.appendChild(this.frontRenderer.domElement);
        
        // Force an initial render
        this.frontRenderer.render(this.frontScene, this.frontCamera);
    }
    
    /**
     * Initialize right view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initRightView(gridHelpers) {
        const rightContainer = document.getElementById('right-view-canvas');
        if (!rightContainer) {
            console.error('Right view container not found');
            return;
        }
        
        this.rightScene = new THREE.Scene();
        this.rightScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const rightLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rightLight.position.set(10, 0, 0);
        this.rightScene.add(rightLight);
        this.rightScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.rightScene.add(gridHelpers.gridHelperYZ);
        this.rightScene.add(gridHelpers.rightAxisHelper);
        
        // Create orthographic camera
        this.rightCamera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.rightCamera.position.set(10, 0, 0);
        this.rightCamera.lookAt(0, 0, 0);
        
        // Create renderer
        this.rightRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
        rightContainer.innerHTML = ''; // Clear container
        rightContainer.appendChild(this.rightRenderer.domElement);
        
        // Force an initial render
        this.rightRenderer.render(this.rightScene, this.rightCamera);
    }
    
    /**
     * Initialize left view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initLeftView(gridHelpers) {
        const leftContainer = document.getElementById('left-view-canvas');
        if (!leftContainer) {
            console.error('Left view container not found');
            return;
        }
        
        this.leftScene = new THREE.Scene();
        this.leftScene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.8);
        leftLight.position.set(-10, 0, 0);
        this.leftScene.add(leftLight);
        this.leftScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.leftScene.add(gridHelpers.gridHelperYZ.clone()); // Clone to have separate instance
        this.leftScene.add(gridHelpers.leftAxisHelper);
        
        // Create orthographic camera
        this.leftCamera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.leftCamera.position.set(-10, 0, 0);
        this.leftCamera.lookAt(0, 0, 0);
        
        // Create renderer
        this.leftRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
        leftContainer.innerHTML = ''; // Clear container
        leftContainer.appendChild(this.leftRenderer.domElement);
        
        // Force an initial render
        this.leftRenderer.render(this.leftScene, this.leftCamera);
    }
    
    /**
     * Initialize mobile views
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initMobileViews(gridHelpers) {
        // Initialize mobile top view
        this.initMobileTopView(gridHelpers);
        
        // Initialize mobile front view
        this.initMobileFrontView(gridHelpers);
        
        // Initialize mobile right view
        this.initMobileRightView(gridHelpers);
        
        // Initialize mobile left view
        this.initMobileLeftView(gridHelpers);
    }
    
    /**
     * Initialize mobile top view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initMobileTopView(gridHelpers) {
        const mobileTopContainer = document.getElementById('mobile-top-view-canvas');
        if (!mobileTopContainer) return;
        
        // Create scene
        this.mobileViews.top.scene = new THREE.Scene();
        this.mobileViews.top.scene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
        topLight.position.set(0, 10, 0);
        this.mobileViews.top.scene.add(topLight);
        this.mobileViews.top.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.mobileViews.top.scene.add(gridHelpers.gridHelperXZ.clone());
        this.mobileViews.top.scene.add(gridHelpers.topAxisHelper.clone());
        
        // Create camera
        this.mobileViews.top.camera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.mobileViews.top.camera.position.set(0, 10, 0);
        this.mobileViews.top.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.mobileViews.top.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mobileViews.top.renderer.setSize(mobileTopContainer.clientWidth, mobileTopContainer.clientHeight);
        mobileTopContainer.innerHTML = '';
        mobileTopContainer.appendChild(this.mobileViews.top.renderer.domElement);
        
        // Force initial render
        this.mobileViews.top.renderer.render(this.mobileViews.top.scene, this.mobileViews.top.camera);
    }
    
    /**
     * Initialize mobile front view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initMobileFrontView(gridHelpers) {
        const mobileFrontContainer = document.getElementById('mobile-front-view-canvas');
        if (!mobileFrontContainer) return;
        
        // Create scene
        this.mobileViews.front.scene = new THREE.Scene();
        this.mobileViews.front.scene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 10);
        this.mobileViews.front.scene.add(frontLight);
        this.mobileViews.front.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.mobileViews.front.scene.add(gridHelpers.gridHelperXY.clone());
        this.mobileViews.front.scene.add(gridHelpers.frontAxisHelper.clone());
        
        // Create camera
        this.mobileViews.front.camera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.mobileViews.front.camera.position.set(0, 0, 10);
        this.mobileViews.front.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.mobileViews.front.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mobileViews.front.renderer.setSize(mobileFrontContainer.clientWidth, mobileFrontContainer.clientHeight);
        mobileFrontContainer.innerHTML = '';
        mobileFrontContainer.appendChild(this.mobileViews.front.renderer.domElement);
        
        // Force initial render
        this.mobileViews.front.renderer.render(this.mobileViews.front.scene, this.mobileViews.front.camera);
    }
    
    /**
     * Initialize mobile right view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initMobileRightView(gridHelpers) {
        const mobileRightContainer = document.getElementById('mobile-right-view-canvas');
        if (!mobileRightContainer) return;
        
        // Create scene
        this.mobileViews.right.scene = new THREE.Scene();
        this.mobileViews.right.scene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const rightLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rightLight.position.set(10, 0, 0);
        this.mobileViews.right.scene.add(rightLight);
        this.mobileViews.right.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.mobileViews.right.scene.add(gridHelpers.gridHelperYZ.clone());
        this.mobileViews.right.scene.add(gridHelpers.rightAxisHelper.clone());
        
        // Create camera
        this.mobileViews.right.camera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.mobileViews.right.camera.position.set(10, 0, 0);
        this.mobileViews.right.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.mobileViews.right.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mobileViews.right.renderer.setSize(mobileRightContainer.clientWidth, mobileRightContainer.clientHeight);
        mobileRightContainer.innerHTML = '';
        mobileRightContainer.appendChild(this.mobileViews.right.renderer.domElement);
        
        // Force initial render
        this.mobileViews.right.renderer.render(this.mobileViews.right.scene, this.mobileViews.right.camera);
    }
    
    /**
     * Initialize mobile left view
     * @param {object} gridHelpers - Grid helpers for the views
     */
    initMobileLeftView(gridHelpers) {
        const mobileLeftContainer = document.getElementById('mobile-left-view-canvas');
        if (!mobileLeftContainer) return;
        
        // Create scene
        this.mobileViews.left.scene = new THREE.Scene();
        this.mobileViews.left.scene.background = new THREE.Color(0xf5f5f5);
        
        // Add lighting
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.8);
        leftLight.position.set(-10, 0, 0);
        this.mobileViews.left.scene.add(leftLight);
        this.mobileViews.left.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        // Add grid and axis helpers
        this.mobileViews.left.scene.add(gridHelpers.gridHelperYZ.clone());
        this.mobileViews.left.scene.add(gridHelpers.leftAxisHelper.clone());
        
        // Create camera
        this.mobileViews.left.camera = new THREE.OrthographicCamera(
            -this.orthographicViewSize,
            this.orthographicViewSize,
            this.orthographicViewSize,
            -this.orthographicViewSize,
            0.1, 1000
        );
        this.mobileViews.left.camera.position.set(-10, 0, 0);
        this.mobileViews.left.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.mobileViews.left.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mobileViews.left.renderer.setSize(mobileLeftContainer.clientWidth, mobileLeftContainer.clientHeight);
        mobileLeftContainer.innerHTML = '';
        mobileLeftContainer.appendChild(this.mobileViews.left.renderer.domElement);
        
        // Force initial render
        this.mobileViews.left.renderer.render(this.mobileViews.left.scene, this.mobileViews.left.camera);
    }
    
    /**
     * Add a shape to the projection views
     * @param {Shape} shape - The shape to add
     */
    updateProjections(shape) {
        if (!shape) return;
        
        // Clear existing content
        this.clearProjections();
        
        // Add to desktop views
        if (this.topScene && shape.topMesh) this.topScene.add(shape.topMesh);
        if (this.frontScene && shape.frontMesh) this.frontScene.add(shape.frontMesh);
        if (this.rightScene && shape.rightMesh) this.rightScene.add(shape.rightMesh);
        if (this.leftScene && shape.leftMesh) this.leftScene.add(shape.leftMesh);
        
        // Add to mobile views
        if (this.mobileViews.top.scene && shape.topMesh) {
            this.mobileViews.top.scene.add(shape.topMesh.clone());
        }
        
        if (this.mobileViews.front.scene && shape.frontMesh) {
            this.mobileViews.front.scene.add(shape.frontMesh.clone());
        }
        
        if (this.mobileViews.right.scene && shape.rightMesh) {
            this.mobileViews.right.scene.add(shape.rightMesh.clone());
        }
        
        if (this.mobileViews.left.scene && shape.leftMesh) {
            this.mobileViews.left.scene.add(shape.leftMesh.clone());
        }
        
        // Update camera settings based on shape
        this.updateCamerasForShape(shape);
        
        // Render the views
        this.render();
    }
    
    /**
     * Clear projections from all views
     */
    clearProjections() {
        // Helper function to remove objects from a scene
        // Keeps grid helpers and lighting
        const clearScene = (scene) => {
            if (!scene) return;
            
            scene.children = scene.children.filter(child => {
                return (
                    child instanceof THREE.GridHelper ||
                    child instanceof THREE.LineSegments ||
                    child instanceof THREE.Light ||
                    child instanceof THREE.Group && (
                        child.children.some(c => c instanceof THREE.Line)
                    )
                );
            });
        };
        
        // Clear desktop views
        clearScene(this.topScene);
        clearScene(this.frontScene);
        clearScene(this.rightScene);
        clearScene(this.leftScene);
        
        // Clear mobile views
        clearScene(this.mobileViews.top.scene);
        clearScene(this.mobileViews.front.scene);
        clearScene(this.mobileViews.right.scene);
        clearScene(this.mobileViews.left.scene);
    }
    
    /**
     * Update cameras based on shape dimensions
     * @param {Shape} shape - The shape
     */
    updateCamerasForShape(shape) {
        // Calculate max dimension for camera adjustment
        let maxDimension = 5; // Default value
        
        if (shape.type === 'cube') {
            maxDimension = shape.dimensions.size;
        } else if (shape.type === 'rectangularPrism') {
            maxDimension = Math.max(
                shape.dimensions.width,
                shape.dimensions.height,
                shape.dimensions.length
            );
        } else if (shape.type === 'triangularPrism') {
            maxDimension = Math.max(
                shape.dimensions.height,
                shape.dimensions.side1,
                shape.dimensions.side2
            );
        } else if (shape.type === 'cylinder' || shape.type === 'cone') {
            maxDimension = Math.max(
                shape.dimensions.radius * 2,
                shape.dimensions.height
            );
        } else if (shape.type === 'sphere') {
            maxDimension = shape.dimensions.radius * 2;
        }
        
        // Add some padding
        const viewSize = maxDimension * 1.5;
        this.orthographicViewSize = viewSize;
        
        // Update all orthographic cameras
        this.updateOrthographicCamera(this.topCamera, viewSize);
        this.updateOrthographicCamera(this.frontCamera, viewSize);
        this.updateOrthographicCamera(this.rightCamera, viewSize);
        this.updateOrthographicCamera(this.leftCamera, viewSize);
        
        // Update mobile cameras
        this.updateOrthographicCamera(this.mobileViews.top.camera, viewSize);
        this.updateOrthographicCamera(this.mobileViews.front.camera, viewSize);
        this.updateOrthographicCamera(this.mobileViews.right.camera, viewSize);
        this.updateOrthographicCamera(this.mobileViews.left.camera, viewSize);
    }
    
    /**
     * Update an orthographic camera's view size
     * @param {THREE.OrthographicCamera} camera - The camera to update
     * @param {number} viewSize - The new view size
     */
    updateOrthographicCamera(camera, viewSize) {
        if (!camera) return;
        
        camera.left = -viewSize;
        camera.right = viewSize;
        camera.top = viewSize;
        camera.bottom = -viewSize;
        camera.updateProjectionMatrix();
    }
    
    /**
     * Update 2D/3D transition effect
     * @param {number} transitionValue - Transition value (0-1)
     */
    updateTransition(transitionValue) {
        if (!this.appState.currentShape) return;
        
        // Apply opacity to main 3D shape
        const shape = this.appState.currentShape;
        
        if (shape.mainMesh) {
            // Always keep visible but change opacity
            shape.mainMesh.visible = true;
            
            // Store the original materials if not already stored
            if (!shape.originalMaterials) {
                shape.originalMaterials = new Map();
                shape.mainMesh.traverse(child => {
                    if (child.isMesh && child.material) {
                        if (Array.isArray(child.material)) {
                            const materials = child.material.map(mat => mat.clone());
                            shape.originalMaterials.set(child, materials);
                        } else {
                            shape.originalMaterials.set(child, child.material.clone());
                        }
                    }
                });
            }
            
            // Apply opacity to all child meshes while preserving original materials
            shape.mainMesh.traverse(child => {
                if (child.isMesh) {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat, index) => {
                                // Get original material properties
                                const originalMat = shape.originalMaterials.get(child)?.[index];
                                // Keep original color and properties
                                if (originalMat) {
                                    mat.color.copy(originalMat.color);
                                }
                                mat.transparent = true;
                                mat.opacity = Math.max(0.2, transitionValue * 0.9);
                                mat.needsUpdate = true;
                            });
                        } else {
                            // Get original material properties
                            const originalMat = shape.originalMaterials.get(child);
                            // Keep original color and properties
                            if (originalMat) {
                                child.material.color.copy(originalMat.color);
                            }
                            child.material.transparent = true;
                            child.material.opacity = Math.max(0.2, transitionValue * 0.9);
                            child.material.needsUpdate = true;
                        }
                    }
                }
            });
        }
        
        // Update wireframe visibility
        if (shape.wireframe) {
            shape.wireframe.visible = transitionValue < 0.9;
            if (shape.wireframe.material) {
                shape.wireframe.material.opacity = 1 - transitionValue;
                shape.wireframe.material.needsUpdate = true;
            }
        }
        
        // Force renders
        this.render();
    }
    
    /**
     * Handle window resize
     */
    resize() {
        // Function to update a view's renderer size
        const updateRendererSize = (container, renderer, camera) => {
            if (!container || !renderer || !camera) return;
            
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            renderer.setSize(width, height);
            
            // For orthographic cameras, maintain aspect ratio
            this.updateOrthographicCamera(camera, this.orthographicViewSize);
        };
        
        // Update desktop views
        updateRendererSize(
            document.getElementById('top-view-canvas'),
            this.topRenderer,
            this.topCamera
        );
        
        updateRendererSize(
            document.getElementById('front-view-canvas'),
            this.frontRenderer,
            this.frontCamera
        );
        
        updateRendererSize(
            document.getElementById('right-view-canvas'),
            this.rightRenderer,
            this.rightCamera
        );
        
        updateRendererSize(
            document.getElementById('left-view-canvas'),
            this.leftRenderer,
            this.leftCamera
        );
        
        // Render views after resize
        this.render();
    }
    
    /**
     * Resize mobile view renderers
     */
    resizeMobileViewRenderers() {
        // Function to update a mobile view's renderer size
        const updateMobileRendererSize = (containerId, view) => {
            const container = document.getElementById(containerId);
            if (!container || !view.renderer || !view.camera) return;
            
            const width = container.clientWidth || 100;
            const height = container.clientHeight || 100;
            
            view.renderer.setSize(width, height);
            this.updateOrthographicCamera(view.camera, this.orthographicViewSize);
            
            // Force render
            if (view.scene) {
                view.renderer.render(view.scene, view.camera);
            }
        };
        
        // Update all mobile views
        updateMobileRendererSize('mobile-top-view-canvas', this.mobileViews.top);
        updateMobileRendererSize('mobile-front-view-canvas', this.mobileViews.front);
        updateMobileRendererSize('mobile-right-view-canvas', this.mobileViews.right);
        updateMobileRendererSize('mobile-left-view-canvas', this.mobileViews.left);
    }
    
    /**
     * Render all orthographic views
     */
    render() {
        // Render desktop views
        if (this.topRenderer && this.topScene && this.topCamera) {
            this.topRenderer.render(this.topScene, this.topCamera);
        }
        
        if (this.frontRenderer && this.frontScene && this.frontCamera) {
            this.frontRenderer.render(this.frontScene, this.frontCamera);
        }
        
        if (this.rightRenderer && this.rightScene && this.rightCamera) {
            this.rightRenderer.render(this.rightScene, this.rightCamera);
        }
        
        if (this.leftRenderer && this.leftScene && this.leftCamera) {
            this.leftRenderer.render(this.leftScene, this.leftCamera);
        }
        
        // Render mobile views
        const renderMobileView = (view) => {
            if (view.renderer && view.scene && view.camera) {
                view.renderer.render(view.scene, view.camera);
            }
        };
        
        renderMobileView(this.mobileViews.top);
        renderMobileView(this.mobileViews.front);
        renderMobileView(this.mobileViews.right);
        renderMobileView(this.mobileViews.left);
    }
}