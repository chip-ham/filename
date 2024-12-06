import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const tooltip = document.getElementById('tooltip'); // Tooltip element

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,  2, 0.1, 1000);
camera.position.z = 8;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent background
renderer.setSize(1000, 500);
container.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Load the texture
const texture = textureLoader.load(
    'models/texture.jpg',
    () => console.log('Texture loaded successfully'),
    undefined,
    (error) => console.error('Error loading texture:', error)
);

// Store references to each model
let model1, model2, model3;

// Function to load and configure a model
function loadModel(positionX, name) {
    loader.load(
        'models/model.glb',
        function (gltf) {
            const model = gltf.scene;

            // Apply texture to all mesh materials in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture; // Apply texture
                    child.material.needsUpdate = true; // Update material
                }
            });

            model.scale.set(10, 10, 10);
            model.position.set(positionX, -0.5, 0);
            scene.add(model);

            // Assign model to the appropriate variable
            if (name === 'model1') model1 = model;
            if (name === 'model2') model2 = model;
            if (name === 'model3') model3 = model;

            console.log(`${name} loaded:`, model);
        },
        undefined,
        function (error) {
            console.error('An error occurred loading the model:', error);
        }
    );
}

// Load all models
loadModel(-6, 'model1'); // Left
loadModel(0, 'model2');  // Center
loadModel(6, 'model3');  // Right

// Lighting setup
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 2);
spotlight.position.set(5, 10, 5);
scene.add(spotlight);

// Raycaster for detecting hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle mouse movement
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

renderer.domElement.addEventListener('mousemove', onMouseMove, false);

function animate() {
    requestAnimationFrame(animate);

    // Update the raycaster based on mouse position
    raycaster.setFromCamera(mouse, camera);

    let isHovering = false; // Track whether the mouse is hovering over any model

    // Check all models for hover interactions
    [model1, model2, model3].forEach((model, index) => {
        if (model) {
            // Rotate the model
            model.rotation.y += 0.01;

            // Check for hover
            const intersects = raycaster.intersectObject(model, true); // Recursive intersection
            if (intersects.length > 0) {
                isHovering = true; // Mark as hovering
                tooltip.style.display = 'block';
                tooltip.textContent = `Model ${index + 1}`; // Display model-specific tooltip
            }
        }
    });

      // Change the cursor to pointer when hovering over a model
      renderer.domElement.style.cursor = isHovering ? 'pointer' : 'default';

    // If not hovering over any model, hide the tooltip
    if (!isHovering) {
        tooltip.style.display = 'none';
    }

    renderer.render(scene, camera);
}

animate();

renderer.domElement.addEventListener('click', onModelClick, false);

function onModelClick(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with each model
    [model1, model2, model3].forEach((model, index) => {
        if (model) {
            const intersects = raycaster.intersectObject(model, true);
            if (intersects.length > 0) {
                console.log(`Model ${index + 1} clicked!`);

                // Open a new blank page
                window.open(`https://example.com/model${index + 1}`, '_blank');
            }
        }
    });
}
