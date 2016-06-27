
var renderer, scene, camera, pointLight, spotLight;

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
    ballSpeed = 3;

// game-related variables
var difficulty = 0.2;
var score1 = 0,
    score2 = 0,
    maxScore = 7;

// hitting ball sound
var snd = new Audio("./sounds/hittingBall.mp3");

// background music
backgroundMusic = new Audio('./sounds/backgroundMusic.mp3');
backgroundMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
backgroundMusic.play();

function setup() {
    document.getElementById("winnerBoard").innerHTML = "First to " + maxScore + "wins!";

    // set up all the 3D objects in the scene
    createScene();

    // and let's get cracking!
    draw();
}


function createMesh(geom, imageFile) {
    var texture = THREE.ImageUtils.loadTexture("textures/" + imageFile)
    var mat = new THREE.MeshPhongMaterial();
    mat.map = texture;

    var mesh = new THREE.Mesh(geom, mat);
    return mesh;
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

    ball.position.x = 0;
    ball.position.y = 0;
    // set ball above the table surface
    ball.position.z = radius;

    ball.receiveShadow = true;
    ball.castShadow = true;

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

    // add a spot light
    // this is important for casting shadows
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    renderer.shadowMapEnabled = true;

    var planeWidth = fieldWidth,
        planeHeight = fieldHeight,
        planeQuality = 10;

    // create the plane's material
    // var planeMaterial = new THREE.MeshLambertMaterial({color: 0x4BD121}); //TODO delete with next pull request if new surface merged

    // create the playing surface plane
    var plane = createMesh(
        new THREE.PlaneGeometry(planeWidth * 0.95, planeHeight, planeQuality, planeQuality),
        "surface.png"
    );

    scene.add(plane);

    plane.receiveShadow = true;
    plane.castShadow = true;

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

    paddle1.receiveShadow = true;
    paddle1.castShadow = true;

    // set up paddle 2
    paddle2 = new THREE.Mesh(
        new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality),
        paddle2Material
    );

    // add the second padle to the scene
    scene.add(paddle2);

    paddle2.receiveShadow = true;
    paddle2.castShadow = true;

    // set paddles on each side of the table
    paddle1.position.x = -fieldWidth/2 + paddleWidth;
    paddle2.position.x = fieldWidth/2 - paddleWidth;

    // lift paddles over playing surface
    paddle1.position.z = paddleDepth;
    paddle2.position.z = paddleDepth;

    // skybox
    var imagePrefix = "./textures/";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix  ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add( skyBox );
}

function draw() {
    // draw THREE.JS scene
    renderer.render(scene, camera);

    // loop the draw() function
    requestAnimationFrame(draw);

    // process game logic
    ballPhysics();
    paddlePhysics();
    cameraPhysics();
    playerPaddleMovement();
    opponentPaddleMovement();
}

function ballPhysics() {
    // if ball goes off the 'left' side (Player's side)
    if (ball.position.x <= -fieldWidth/2) {
        // CPU scores
        score2++;
        // update scoreboard
        document.getElementById("scores").innerHTML = score1 + "-" + score2;
        // reset ball
        resetBall(2);
        // check if match over
        matchScoreCheck();
    }
    // if ball goes off the 'right' side (CPU's side)
    if (ball.position.x >= fieldWidth/2) {
        // Player scores
        score1++;
        // update scoreboard
        document.getElementById("scores").innerHTML = score1 + "-" + score2;
        // reset ball
        resetBall(1);
        // check if match over
        matchScoreCheck();
    }

    // if ball goes off the top side (side of table)
    if (ball.position.y <= -fieldHeight/2) {
        ballDirY = -ballDirY;
    }

    // if ball goes off the bottom side (side of table)
    if (ball.position.y >= fieldHeight/2) {
        ballDirY = -ballDirY;
    }

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

    paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;
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

// Handles paddle collision logic
function paddlePhysics() {
    // Player paddle logic

    // if ball is aligned with paddle1 on x plane
    // remember the position is the CENTER of the object
    // we only check between the front and the middle of the paddle (one-way collision)
    if (ball.position.x <= paddle1.position.x + paddleWidth &&
        ball.position.x >= paddle1.position.x) {
        // and if ball is aligned with paddle1 on y plane
        if (ball.position.y <= paddle1.position.y + paddleHeight/2 &&
            ball.position.y >= paddle1.position.y - paddleHeight/2) {
            // ball is intersecting with the front half of the paddle
            // and if ball is travelling towards player (-ve direction)
            if (ballDirX < 0) {
                // stretch the paddle to indicate a hit
                paddle1.scale.y = 5;

                // sound of hitting ball
                snd.play();

                // switch direction of ball travel to create bounce
                ballDirX = -ballDirX;

                // we impact ball angle when hitting it
                // this is not realistic physics, just spices up the gameplay
                // allows you to 'slice' the ball to beat the opponent
                ballDirY -= paddle1DirY * 0.7;
            }
        }
    }

    // Opponent paddle logic

    // if ball is aligned with paddle2 on x plane
    // remember the position is the CENTER of the object
    // we only check between the front and the middle of the paddle (one-way collision)
    if (ball.position.x <= paddle2.position.x + paddleWidth &&
        ball.position.x >= paddle2.position.x) {
        // and if ball is aligned with paddle2 on y plane
        if (ball.position.y <= paddle2.position.y + paddleHeight/2 &&
            ball.position.y >= paddle2.position.y - paddleHeight/2) {
            // ball is intersecting with the front half of the paddle
            // and if ball is travelling towards opponent (+ve direction)
            if (ballDirX > 0) {
                // stretch the paddle to indicate a hit
                paddle2.scale.y = 5;

                // sound of hitting ball
                snd.play();

                // switch direction of ball travel to create bounce
                ballDirX = -ballDirX;

                // we impact ball angle when hitting it
                // this is not realistic physics, just spices up the gameplay
                // allows you to 'slice' the ball to beat the opponent
                ballDirY -= paddle2DirY * 0.7;
            }
        }
    }
}

function cameraPhysics() {
    // we can easily notice shadows if we dynamically move lights during the game
    spotLight.position.x = ball.position.x;
    spotLight.position.y = ball.position.y;

    // move to behind the player's paddle
    camera.position.x = paddle1.position.x - 100;
    camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
    camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);

    // rotate to face towards the opponent
    camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
    camera.rotation.y = -60 * Math.PI/180;
    camera.rotation.z = -90 * Math.PI/180;
}

// resets the ball's position to the centre of the play area
// also sets the ball direction speed towards the last point winner
function resetBall(loser) {
    // position the ball in the center of the table
    ball.position.x = 0;
    ball.position.y = 0;

    // if player lost the last point, we send the ball to the opponent
    if (loser == 1) {
        ballDirX = -1;
    }
    // else if opponent lost, we send the ball to player
    else {
        ballDirX = 1;
    }

    // set the ball to move +ve in y plane (towards left from the camera)
    ballDirY = 1;
}

// checks if either player or opponent has reached 7 points
function matchScoreCheck() {
    // if player has 7 points
    if (score1 >= maxScore) {
        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "Player wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
    // else if opponent has 7 points
    else if (score2 >= maxScore) {
        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "CPU wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
}