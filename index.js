import * as THREE from './three.js-master/build/three.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

// Select the canvas element
const canvas = document.querySelector('.webgl');

// Create a scene
const scene = new THREE.Scene();

// Set the scene background to white
scene.background = new THREE.Color(0xffffff);  // White background

// Set up a camera feed as the texture inside the box
const video = document.createElement('video');
video.autoplay = true;
video.loop = true;
video.muted = true;

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();  // Explicitly call play() for some browsers
        console.log("Camera feed started");
    })
    .catch((err) => {
        console.error("Error accessing the camera: ", err);
    });

// Load the GLTF model
const loader = new GLTFLoader();
loader.load('assets/eagle.glb', function (glb) {
    console.log(glb);
    const root = glb.scene;
    root.scale.set(4, 4, 4);
    root.position.set(0, 1, 0); // Move the model up (increase the Y value)
    scene.add(root);
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
    width: window.innerWidth,
    height: window.innerHeight
};

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1, 10); // Position the camera in the scene
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
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update the camera aspect ratio and projection matrix
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update the renderer size
    renderer.setSize(sizes.width, sizes.height);
});

// Initialize OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Enable smooth controls
controls.dampingFactor = 0.25; // Control the speed of the damping
controls.screenSpacePanning = false; // Disable panning beyond the scene

// Create a frame (box) that holds the camera feed texture
const boxGeometry = new THREE.PlaneGeometry(5, 5);  // Size of the box/frame (smaller)
const boxMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.VideoTexture(video),  // Use the video as a texture for the box
    side: THREE.DoubleSide,
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 1, 0);  // Position the box in the center of the scene
scene.add(box);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update controls to allow smooth interaction
    controls.update();

    renderer.render(scene, camera);
}

animate();
