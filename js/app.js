document.addEventListener("DOMContentLoaded", function(event) {

var myGamePiece;
var myObstacles = [];
var score = 0;
var scoreBox =  document.getElementById('score');



var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 300;
        this.canvas.height = 350;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
        document.body.innerHTML = "You got " +  score + " points!";
        // firebase high score
    }
}

function startGame() {
    myGamePiece = new component(15, 15, "lightgray", 120, 10);
    myGameArea.start();
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        if ((mybottom > myGameArea.canvas.height) || (mytop < 0) || (myright > myGameArea.canvas.width) || (myleft < 0)) {
            myGameArea.stop();
        }
        return crash;
    }
}

function updateGameArea() {
    var x, width, gap, midnWidth, maxWidth, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.stop();
        }
    }

    myGameArea.clear();
    if (!myGameArea.keys) {
        scoreBox.innerHTML = "Use the arrow keys to dodge the platforms"
    }
    else if (myGameArea.keys[37]) {
            myGamePiece.speedX = -2.5;
        }
    else if (myGameArea.keys[39]) {
            myGamePiece.speedX = 2.5;
        }
    else if (myGameArea.keys[38]) {
            myGamePiece.speedY = -2.5;
        }
    else if (myGameArea.keys[40]) {
            myGamePiece.speedY = 2.5;
        }

    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(60)) {
        score += 20;
        scoreBox.innerHTML = score;

        x = myGameArea.canvas.width;
        midnWidth = 20;
        maxWidth = 200;
        width = Math.floor(Math.random()*(maxWidth-midnWidth+1)+midnWidth);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(width, 10, "red", x-width, 330));
        myObstacles.push(new component(width/2, 10, "red", 0, 430));
        if(score % 100 === 0) {
            myObstacles.push(new component(width/1.6    , 10, "green", width - gap, 530));
        }
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].y += -2;
        myObstacles[i].update();
    }

    myGamePiece.newPos();
    myGamePiece.update();
}



function everyinterval(time) {
    if ((myGameArea.frameNo / time) % 1 == 0) {
        return true;
    }
    return false;
}


startGame();
});
