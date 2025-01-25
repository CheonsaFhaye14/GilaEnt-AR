import * as THREE from './three.js-master/build/three.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

// Select the canvas element
const canvas = document.querySelector('.webgl');

// Create a scene
const scene = new THREE.Scene();

// Set up a camera feed as the texture for the background
const video = document.createElement('video');
video.autoplay = true;
video.loop = true;
video.muted = true;

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();  // Explicitly call play() for some browsers
        console.log("Camera feed started");

        // Create a texture from the video stream for the background
        const textureLoader = new THREE.VideoTexture(video);
        scene.background = textureLoader;  // Set the camera feed as the background
    })
    .catch((err) => {
        console.error("Error accessing the camera: ", err);
    });

// Load the GLTF model
const loader = new GLTFLoader();
let model;
loader.load('assets/eagle.glb', function (glb) {
    console.log(glb);
    model = glb.scene;
    model.scale.set(15, 15, 15);
    model.position.set(0, 1, 0); // Move the model up (increase the Y value)

    // Change the model's material to red
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color
        }
    });

    scene.add(model);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + "% loaded");
}, function (error) {
    console.log('An error occurred');
});

// Add light to the scene
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

// Boilerplate code to handle screen resizing and rendering
const sizes = {
    width: window.innerWidth * 0.6, // 60% of the screen width
    height: window.innerHeight * 0.6, // 60% of the screen height
};

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 5, 20); // Set the camera further away to keep the model in view
scene.add(camera);

// Create the WebGL renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});

// Set the renderer size
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

// Update the renderer and camera size on window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth * 0.6;  // 60% width of the screen
    sizes.height = window.innerHeight * 0.6; // 60% height of the screen

    // Update the camera aspect ratio and projection matrix
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update the renderer size
    renderer.setSize(sizes.width, sizes.height);
});

// Initialize OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Enable smooth controls
controls.dampingFactor = 0.03; // Control the speed of the damping
controls.screenSpacePanning = false; // Disable panning beyond the scene

// Variables for forward circular motion
let angle = 0;  // Angle for circular movement
const radius = 20;  // Radius of the circular path
const speed = 0.05;  // Speed of circular motion

// Animation loop (circular movement with fixed camera)
function animate() {
    requestAnimationFrame(animate);

    // Circular motion formula: (cos(angle), 0, sin(angle)) * radius
    if (model) {
        angle += speed; // Increment the angle for the circular motion

        // Move the model in a circular path
        model.position.x = radius * Math.cos(angle);  // X position on the circle
        model.position.z = radius * Math.sin(angle);  // Z position on the circle

        // Make the model face forward in the direction of its movement (forward Z)
        model.lookAt(model.position.x, model.position.y, model.position.z + 1); // Face forward along Z direction
    }

    // Update the camera to follow the model from behind
    camera.position.x = model.position.x + 15;  // Offset the camera on the X axis
    camera.position.z = model.position.z + 20;  // Offset the camera on the Z axis
    camera.position.y = model.position.y + 5;   // Offset the camera on the Y axis
    camera.lookAt(model.position);  // Keep the camera focused on the model

    // Update controls to allow smooth interaction
    controls.update();

    renderer.render(scene, camera);
}

animate();
