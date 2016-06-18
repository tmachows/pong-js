
var renderer, scene, camera, pointLight;

// field variables
var fieldWidth = 400,
    fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;

// ball variables
var ball, paddle1, paddle2;

function setup() {

    // set up all the 3D objects in the scene
    createScene();

    // and let's get cracking!
    draw();
}

function createScene() {
    // set the scene size
    var WIDTH = 640,
        HEIGHT = 360;

    // set camera attributes
    var VIEW_ANGLE = 50,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    var c = document.getElementById("gameCanvas");

    // create a WebGL renderer, camera and scene
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

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
    ball = new THREE.Mesh(
        new THREE.SphereGeometry(radius, segments, rings),
        sphereMaterial
    );

    // add the sphere to the scene
    scene.add(ball);

    // create a point light
    pointLight = new THREE.PointLight(0xF8D898);

    // set its position
    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 2.9;
    pointLight.distance = 10000;

    // add to the scene
    scene.add(pointLight);

    var planeWidth = fieldWidth,
        planeHeight = fieldHeight,
        planeQuality = 10;

    // create the plane's material
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x4BD121});

    // create the playing surface plane
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth * 0.95, planeHeight, planeQuality, planeQuality),
        planeMaterial
    );

    scene.add(plane);

    // set up the paddle vars
    paddleWidth = 10;
    paddleHeight = 30;
    paddleDepth = 10;
    paddleQuality = 1;

    // create the paddle1's material
    var paddle1Material = new THREE.MeshLambertMaterial({color: 0x1B32C0});
    // create the paddle2's material
    var paddle2Material = new THREE.MeshLambertMaterial({color: 0xFF4045});

    // set up paddle 1
    paddle1 = new THREE.Mesh(
        new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality),
        paddle1Material
    );

    // add the padle to the scene
    scene.add(paddle1);

    // set up paddle 2
    paddle2 = new THREE.Mesh(
        new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality),
        paddle2Material
    );

    // add the second padle to the scene
    scene.add(paddle2);

    // set paddles on each side of the table
    paddle1.position.x = -fieldWidth/2 + paddleWidth;
    paddle2.position.x = fieldWidth/2 - paddleWidth;

    // lift paddles over playing surface
    paddle1.position.z = paddleDepth;
    paddle2.position.z = paddleDepth;
}

function draw() {
    // draw THREE.JS scene
    renderer.render(scene, camera);

    // loop the draw() function
    requestAnimationFrame(draw);

    // process game logic
}