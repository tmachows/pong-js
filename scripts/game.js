// set the scene size
var WIDTH = 640,
    HEIGHT = 360;

var VIEW_ANGLE = 50,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

var c = document.getElementById("gameCanvas");

// create a WebGL renderer, camera and scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();

// add the camera to the scene
scene.add(camera);

// set a default position for the camera
// not doing this somehow messes up shadow rendering
camera.position.z = 320;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element (the gameCanvas)
c.appendChild(renderer.domElement);

// set up the sphere vars
// lower 'segment' and 'rings' values will increase performance
var radius = 5,
    segments = 6,
    rings = 6;

// create the sphere's material
var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xD43001});

// Create a ball with sphere geometry
var ball = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings),
    sphereMaterial
);

// add the sphere to the scene
scene.add(ball);

// create a point light
var pointLight = new THREE.PointLight(0xF8D898);

// set its position
pointLight.position.x = -1000;
pointLight.position.y = 0;
pointLight.position.z = 1000;
pointLight.intensity = 2.9;
pointLight.distance = 10000;

// add to the scene
scene.add(pointLight);

function setup() {

    draw();
}

function draw() {
    // draw THREE.JS scene
    renderer.render(scene, camera);

    // loop the draw() function
    requestAnimationFrame(draw);

    // process game logic
}