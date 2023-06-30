// main.js
import './style.css'
import * as THREE from 'three'
import $ from 'jquery'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
THREE.ColorManagement.enabled = false

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//const materialMotorcycle = new THREE.MeshNormalMaterial();


// Objects
const objectsDistance = 15

const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );

const group = new THREE.Group()
scene.add(group)

let myModel;

loader.load(
    './models/scene.gltf',
    function ( gltf ) {

        gltf.scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                //child.material = newMaterial; // Assign the new material
            }
        });

        group.add(gltf.scene); // add gltf.scene to the group
        gltf.scene.scale.set(.008, .008, .008)
        gltf.scene.rotation.y = Math.PI/2;
        gltf.scene.position.x = 4.5;
        gltf.scene.position.y = - objectsDistance * 1 - 2.5;
        gltf.scene.position.z = -2;

        myModel = gltf.scene; // store reference to the scene, not the gltf object
    },
    // called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

const sectionMeshes = []

$(document).ready(function() {
    $('#about-button').click(function() {
        $('html, body').animate({
            scrollTop: $("#about").offset().top - 125
        }, 800); // Change this number to make the scroll more or less smooth
    });

    $('#contact-button').click(function() {
        $('html, body').animate({
            scrollTop: $("#contact").offset().top
        }, 800); // Change this number to make the scroll more or less smooth
    });
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden, .about-hidden, .contact-hidden');
hiddenElements.forEach(el => observer.observe(el));

const tween = KUTE.fromTo(
    '#blob1',
    { path: '#blob1' },
    { path: '#blob2' },
    { repeat: 999, duration: 3000, yoyo: true }
  ).start();

  /**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Lights
const directionalLight = new THREE.DirectionalLight(0x5A5A5A, .6);
directionalLight.position.set(2, 6, 4.5); // Adjust the position as needed
scene.add(directionalLight);

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, .1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true,
    canvas: canvas,
    alpha: true
})
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection)
    {
        currentSection = newSection
    }
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;
const maxDeltaTime = 1 / 60; // Corresponds to 30 FPS


const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    let deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Clamp deltaTime
    deltaTime = Math.min(deltaTime, maxDeltaTime);

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    //Check if modelMotorcycle is defined and apply rotation
    if (myModel) {
        myModel.rotation.y += deltaTime * 0.1; // adjust rotation speed here
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()