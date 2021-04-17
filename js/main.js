//Sounds
var volume = 25;
var sound = true;
var soundJump = new buzz.sound("resources/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("resources/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("resources/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("resources/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("resources/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

var gravity = 0.25;
var jump = -4.6;
var pipeHeight = 90;
var pipeWidth = 52;
var position = 200;
var flyZone = $("#flyZone").height();
var velocity = 0;
var rotation = 0;
var score = 0;
var gameLoop, pipeLoop, currentState;
var birdAlive = true;
var pipes = new Array();
var states = Object.freeze({
    waitingScreen: 0,
    gameScreen: 1,
});


$(document).ready(function() {
    gameScreen();
});


// Switch the sound icon 
function soundIconClick() {
    var img = document.getElementById("iconImage");
    if (sound) {
        img.src = './resources/image/mute.png';
        sound = false;
    } else {
        img.src = './resources/image/unmute.png';
        sound = true;
    }
}

function showScore() {
    birdDead = true;
    var elemScore = $("#score");
    elemScore.empty();
    elemScore = $("#gameOver");
    elemScore.show();
    elemScore.append("<h1>GameOver<br>Score:&nbsp&nbsp" + score + " <div class=right><button type=\"button\" onclick=\"window.open('game.html','_self')\">Play Again</button></h1>");
}

function playerScore() {
    score += 1;
    if (sound) { // Make sound
        soundScore.stop();
        soundScore.play();
    }
    var elemScore = $("#score");
    elemScore.empty();
    elemScore.append("<p>" + score + "</p>");
}

function gameScreen() {
    currentState = states.waitingScreen;
    var elemScore = $("#score");
    elemScore.empty();
    elemScore = $("#gameOver");
    elemScore.hide();
    $(".pipe").remove();
    pipes = new Array();
    $(".animated").css('animation-play-state', 'running');
    $(".animated").css('-webkit-animation-play-state', 'running');
    $("#player").css({ y: 0, x: 400 });
    updateBird($("#player"));
    if (sound) { // Make sound
        soundSwoosh.stop();
        soundSwoosh.play();
    }
}

function startGame() {
    currentState = states.gameScreen;
    var updateRate = 1000.0 / 60.0;
    gameLoop = setInterval(gameLoop, updateRate);
    pipeLoop = setInterval(updatePipes, 1400);
    birdJump();
}

function updateBird(bird) {
    rotation = Math.min((velocity / 10) * 90, 90);
    $(bird).css({ rotate: rotation, top: position });
}


// Handle space bar
$(document).keydown(function(e) {
    if (e.keyCode == 32) { // Space bar == 32
        screenClick();
    }
});

// Handle mouse
if ("ontouchstart" in window)
    $(document).on("touchstart", screenClick);
else
    $(document).on("mousedown", screenClick);

function screenClick() {
    if (currentState == states.gameScreen) {
        birdJump();
    } else if (currentState == states.waitingScreen) {
        startGame();
    } else {

    }
}

function birdJump() {
    velocity = jump;
    if (sound && birdAlive) { // Make sound
        soundJump.stop();
        soundJump.play();
    }
}

function birdDead() {
    birdAlive = false;
    $(".animated").css('animation-play-state', 'paused');
    $(".animated").css('-webkit-animation-play-state', 'paused');
    var playerBottom = $("#player").position().top + $("#player").width();
    var floor = flyZone;
    var positionY = Math.max(0, floor - playerBottom);
    $("#player").transition({ y: positionY + 'px', rotate: 90 }, 1000, 'easeInOutCubic');
    if (sound) { // make sound
        soundDie.stop();
        soundDie.play();
    }
    clearInterval(gameLoop);
    clearInterval(pipeLoop);
    showScore();
}

function updatePipes() {
    $(".pipe").filter(function() { return $(this).position().left <= -100; }).remove()
    var padding = 80;
    var constraint = flyZone - pipeHeight - (padding * 2);
    var topHeight = Math.floor((Math.random() * constraint) + padding);
    var bottomHeight = (flyZone - pipeHeight) - topHeight;
    var newPipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topHeight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomHeight + 'px;"></div></div>');
    $("#flyZone").append(newPipe);
    pipes.push(newPipe);
}

function gameLoop() {
    var player = $("#player");
    velocity += gravity;
    position += velocity;
    updateBird(player);
    // Create the bounding box
    var box = document.getElementById('player').getBoundingClientRect();
    var width = 34.0;
    var height = 24.0;
    var boxWidth = width - (Math.sin(Math.abs(rotation) / 90) * 8);
    var boxHeight = (height + box.height) / 2;
    var boxLeft = ((box.width - boxWidth) / 2) + box.left;
    var boxTop = ((box.height - boxHeight) / 2) + box.top;
    var boxRight = boxLeft + boxWidth;
    var boxBottom = boxTop + boxHeight;

    // Check if we have a pipe to continue play
    if (pipes[0] == null)
        return;
    // Handle bird hit the ceiling
    var ceiling = $("#ceiling");
    if (boxTop <= (ceiling.offset().top + ceiling.height()))
        position = 0;
    // Handle bird hit the land
    if (box.bottom >= $("#land").offset().top) {
        birdDead();
        return;
    }
    // Defines the boundaries of the pipe
    var nextPipe = pipes[0];
    var nextPipeUpper = nextPipe.children(".pipe_upper");
    var pipeTop = nextPipeUpper.offset().top + nextPipeUpper.height();
    var pipeLeft = nextPipeUpper.offset().left - 2;
    var pipeRight = pipeLeft + pipeWidth;
    var pipeBottom = pipeTop + pipeHeight;
    // Check if the bird hit the pipe
    if (boxRight > pipeLeft) {
        if (boxTop > pipeTop && boxBottom < pipeBottom) {
            // We pass
        } else {
            // Hit the pipe
            birdDead();
            return;
        }
    }
    // We passed the pipe
    if (boxLeft > pipeRight) {
        pipes.splice(0, 1);
        playerScore();
    }
}