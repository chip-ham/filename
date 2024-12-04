import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const tooltip = document.getElementById('tooltip'); // Tooltip element

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent background
renderer.setSize(500, 500);
container.appendChild(renderer.domElement);

const loader = new GLTFLoader();
let model;

// Load the texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./models/texture.png'); // Path to your texture image

// Load the model
loader.load('models/model.glb', function (gltf) {
    model = gltf.scene;
    
    // Apply the texture to all mesh materials in the model
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.map = texture; // Set the texture
            child.material.needsUpdate = true; // Notify Three.js that the material needs to be updated
        }
    });

    model.scale.set(3, 3, 3);
    model.position.set(0, -0.5, 0);
    scene.add(model);
    console.log('Model loaded:', model);
}, undefined, function (error) {
    console.error('An error occurred loading the model:', error);
});

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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update the raycaster based on mouse position
    raycaster.setFromCamera(mouse, camera);

    if (model) { // Check if the model is loaded
        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObject(model, true); // Use 'true' for recursive intersection

        if (intersects.length > 0) {
            // Show tooltip and change color on hover
            tooltip.style.display = 'block';
            tooltip.textContent = '3D Model'; // Text to show in tooltip
            model.traverse((child) => {
                if (child.isMesh) child.material.color.set(0xff5733);
            });
        } else {
            // Hide tooltip and reset color when not hovering
            tooltip.style.display = 'none';
        }

        model.rotation.y += 0.01; // Rotate the model
    }

    renderer.render(scene, camera);
}

animate();
