
var renderer, scene, camera, pointLight;

// field variables
var fieldWidth = 400,
    fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddle1, paddle2;
var paddle1DirY = 0,
    paddle2DirY = 0,
    paddleSpeed = 3;

// ball variables
var ball;
var ballDirX = 1,
    ballDirY = 1,
    ballSpeed = 2;

// game-related variables
var difficulty = 0.2;

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
    ballPhysics();
    playerPaddleMovement();
    opponentPaddleMovement();
}

function ballPhysics() {
    // update ball position over time
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;

    // limit ball's y-speed to 2x the x-speed
    // this is so the ball doesn't speed from left to right super fast
    // keeps game playable for humans
    if (ballDirY > ballSpeed * 2) {
        ballDirY = ballSpeed * 2;
    } else if (ballDirY < -ballSpeed * 2) {
        ballDirY = -ballSpeed * 2;
    }

    // if ball goes off the top side (side of table)
    if (ball.position.y <= -fieldHeight/2) {
        ballDirY = -ballDirY;
    }

    // if ball goes off the bottom side (side of table)
    if (ball.position.y >= fieldHeight/2) {
        ballDirY = -ballDirY;
    }
}

function playerPaddleMovement() {
    // move left
    if (Key.isDown(Key.A)) {
        // if paddle is not touching the side of table
        // we move
        if (paddle1.position.y < fieldHeight * 0.45) {
            paddle1DirY = paddleSpeed * 0.5;
        }
        // else we do not move and stretch the paddle
        // to indicate we can't move
        else {
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }
    }
    // move right
    else if (Key.isDown(Key.D)) {
        // if paddle is not touching the side of table
        // we move
        if (paddle1.position.y > -fieldHeight * 0.45) {
            paddle1DirY = -paddleSpeed * 0.5;
        }
        // else we do not move and stretch the paddle
        // to indicate we can't move
        else {
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }
    }
    // else don't move paddle
    else {
        paddle1DirY = 0;
    }

    paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;

    paddle1.position.y += paddle1DirY;
}

function opponentPaddleMovement() {
    // lerp towards the ball on the y plane
    paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty;

    // in case the Lerp function produces a value above max paddle speed, we clamp it
    if (Math.abs(paddle2DirY) <= paddleSpeed) {
        paddle2.position.y += paddle2DirY;
    }
    // if the lerp value is too high, we have to limit speed to paddleSpeed
    else {
        // if paddle is lerping in +ve direction
        if (paddle2DirY > paddleSpeed) {
            paddle2.position.y += paddleSpeed;
        }
        // if paddle is lerping in -ve direction
        else if (paddle2DirY < -paddleSpeed) {
            paddle2.position.y -= paddleSpeed;
        }
    }

    // we lerp the scale back to 1
    // this is done because we stretch the paddle at some points
    // stretching is done when paddle touches side of table and when paddle hits ball
    // by doing this here, we ensure paddle always comes back to default size
    paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;
}