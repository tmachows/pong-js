
var renderer, scene, camera, spotLight1, spotLight2, spotLight3, spotLight4, opponentLight;

// field variables
var fieldWidth = 400,
    fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddle1, paddle2;
var paddle1DirY = 0,
    paddle2DirY = 0,
    paddleSpeed = 3,
    opponentPaddleSpeed = 3;

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
var hittingBallSound = new Audio("./sounds/hittingBall.mp3");

// background music
backgroundMusic = new Audio('./sounds/backgroundMusic.mp3');
backgroundMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
backgroundMusic.play();

// player win music
playerWinMusic = new Audio('./sounds/playerWin.mp3');
playerWinMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

// player lose music
playerLoseMusic = new Audio('./sounds/playerLose.mp3');
playerLoseMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

// player goal sound
var playerGoalSound = new Audio("./sounds/playerGoal.mp3");

// clock
var clock = new THREE.Clock();

function setup() {
    document.getElementById("winnerBoard").innerHTML = "First to " + maxScore + "wins!";

    // set up all the 3D objects in the scene
    createScene();

    // and let's get cracking!
    draw();
}


function createMesh(geom, imageFile) {
    var texture = THREE.ImageUtils.loadTexture("textures/" + imageFile);
    var mat = new THREE.MeshPhongMaterial();
    mat.map = texture;

    return new THREE.Mesh(geom, mat);
}

function createScene() {
    // set the scene size
    var WIDTH = 1200,
        HEIGHT = 440;

    // set camera attributes
    var VIEW_ANGLE = 60,
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

    ball = createMesh(
        new THREE.SphereGeometry(radius, segments, rings),
        "ball.png"
    );

    // add the sphere to the scene
    scene.add(ball);

    ball.position.x = 0;
    ball.position.y = 0;
    // set ball above the table surface
    ball.position.z = radius;

    ball.receiveShadow = true;
    ball.castShadow = true;

    // add a spot lights
    // this is important for casting shadows
    var lightsOffset = 320;
    var lightsHeight = 440;
    var lightsAngle = 0.3;
    var lightsDistance = 1000;
    var lightsColor = 0xffffff;
    var lightsIntensity = 3.5;
    var lightsPenumbra = 0.1;

    spotLight1 = new THREE.SpotLight(lightsColor, lightsIntensity, lightsDistance, lightsAngle, lightsPenumbra);
    spotLight1.position.set(fieldWidth/2 + lightsOffset, fieldHeight/2 + lightsOffset, lightsHeight);
    spotLight1.castShadow = true;
    scene.add(spotLight1);

    spotLight2 = new THREE.SpotLight(lightsColor, lightsIntensity, lightsDistance, lightsAngle, lightsPenumbra);
    spotLight2.position.set(fieldWidth/2 + lightsOffset, -fieldHeight/2 - lightsOffset, lightsHeight);
    spotLight2.castShadow = true;
    scene.add(spotLight2);

    spotLight3 = new THREE.SpotLight(lightsColor, lightsIntensity, lightsDistance, lightsAngle, lightsPenumbra);
    spotLight3.position.set(-fieldWidth/2 - lightsOffset, fieldHeight/2 + lightsOffset, lightsHeight);
    spotLight3.castShadow = true;
    scene.add(spotLight3);

    spotLight4 = new THREE.SpotLight(lightsColor, lightsIntensity, lightsDistance, lightsAngle, lightsPenumbra);
    spotLight4.position.set(-fieldWidth/2 - lightsOffset, -fieldHeight/2 - lightsOffset, lightsHeight);
    spotLight4.castShadow = true;
    scene.add(spotLight4);

    opponentLight = new THREE.PointLight( 0xffffff, 3.0, 40 );
    opponentLight.position.set( fieldWidth/2 - 30, 0, 10 );
    scene.add( opponentLight );

    renderer.shadowMapEnabled = true;

    var planeWidth = fieldWidth,
        planeHeight = fieldHeight + 16,
        planeQuality = 10;

    // create the playing surface plane
    var plane = createMesh(
        new THREE.PlaneGeometry(planeWidth * 0.95, planeHeight, planeQuality, planeQuality),
        "football_pitch.png"
    );

    scene.add(plane);

    plane.receiveShadow = true;
    plane.castShadow = true;

    // set up the wall vars
    var wallWidth = fieldWidth * 0.95;
    var wallHeight = 3;
    var wallDepth = 20;
    var wallQuality = 1;

    // right wall
    var rightWall = createMesh(
        new THREE.CubeGeometry(wallWidth, wallHeight, wallDepth, wallQuality, wallQuality, wallQuality),
        "portugalWall.png"
    );

    scene.add(rightWall);

    rightWall.receiveShadow = true;
    rightWall.castShadow = true;

    rightWall.position.x = fieldHeight/1000;
    rightWall.position.y = -fieldHeight/2 - 8;
    rightWall.position.z = wallDepth/2;

    // left wall
    var leftWall = createMesh(
        new THREE.CubeGeometry(wallWidth, wallHeight, wallDepth, wallQuality, wallQuality, wallQuality),
        "polandWall.png"
    );

    scene.add(leftWall);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;

    leftWall.position.x = fieldHeight/1000;
    leftWall.position.y = fieldHeight/2 + 8;
    leftWall.position.z = wallDepth/2;

    // set up the paddle vars
    paddleWidth = 10;
    paddleHeight = 30;
    paddleDepth = 10;
    paddleQuality = 1;

    paddle1 = createMesh(
        new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality),
        "poland.png"
    );

    // add the padle to the scene
    scene.add(paddle1);

    paddle1.receiveShadow = true;
    paddle1.castShadow = true;

    paddle2 = createMesh(
        new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality),
        "portugal.png"
    );

    // add the second paddle to the scene
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

    // fountain of player win
    this.fountainPlayerWin = new ParticleEngine();
    fountainPlayerWin.setValues( Examples.rain );
    fountainPlayerWin.initialize();
}

function draw() {
    // draw THREE.JS scene
    renderer.render(scene, camera);

    // update fountain of player win
    if (score1 >= maxScore) {
        var dt = clock.getDelta();
        fountainPlayerWin.update( dt * 0.5 );
    }

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
        difficulty -= 0.1;
        opponentPaddleSpeed -= 1;
        // update scoreboard
        document.getElementById("scores").innerHTML = score1 + "-" + score2;
        // reset ball
        resetBall(2);
        // check if match over
        matchScoreCheck();
    }
    // if ball goes off the 'right' side (CPU's side)
    if (ball.position.x >= fieldWidth/2) {
        // goal sound
        playerGoalSound.play();
        // Player scores
        score1++;
        difficulty += 0.2;
        opponentPaddleSpeed += 1;
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

    ball.rotation.x += ballDirX * ballSpeed;
    ball.rotation.y += ballDirY * ballSpeed;

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
        // else we do not move
        else {
            paddle1DirY = 0;
        }
    }
    // move right
    else if (Key.isDown(Key.D)) {
        // if paddle is not touching the side of table
        // we move
        if (paddle1.position.y > -fieldHeight * 0.45) {
            paddle1DirY = -paddleSpeed * 0.5;
        }
        // else we do not move
        else {
            paddle1DirY = 0;
        }
    }
    // else don't move paddle
    else {
        paddle1DirY = 0;
    }

    paddle1.position.y += paddle1DirY;
}

function opponentPaddleMovement() {
    // lerp towards the ball on the y plane
    paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty;

    // in case the Lerp function produces a value above max paddle speed, we clamp it
    if (Math.abs(paddle2DirY) <= opponentPaddleSpeed) {
        paddle2.position.y += paddle2DirY;
    }
    // if the lerp value is too high, we have to limit speed to opponentPaddleSpeed
    else {
        // if paddle is lerping in +ve direction
        if (paddle2DirY > opponentPaddleSpeed) {
            paddle2.position.y += opponentPaddleSpeed;
        }
        // if paddle is lerping in -ve direction
        else if (paddle2DirY < -opponentPaddleSpeed) {
            paddle2.position.y -= opponentPaddleSpeed;
        }
    }

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

                // sound of hitting ball
                hittingBallSound.play();

                // switch direction of ball travel to create bounce
                ballDirX = -ballDirX;

                // we impact ball angle when hitting it
                // this is not realistic physics, just spices up the gameplay
                // allows you to 'slice' the ball to beat the opponent
                // ballDirY -= paddle1DirY * 0.7;
                ballDirY -= (paddle1.position.y - ball.position.y) * 0.1;
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

                // sound of hitting ball
                hittingBallSound.play();

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
    // spotLight.position.x = ball.position.x;
    // spotLight.position.y = ball.position.y;
    opponentLight.position.y = paddle2.position.y;

    // move to behind the player's paddle
    camera.position.x = paddle1.position.x - 80;
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
        // stop backgroung music and play victory anthem
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        playerWinMusic.play();

        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "Player wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
    // else if opponent has 7 points
    else if (score2 >= maxScore) {
        // stop backgroung music and play victory anthem
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        playerLoseMusic.play();

        // sound of silence and black screen when we lose
        var c = document.getElementById("gameCanvas");
        c.style.display="none";

        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "CPU wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
}