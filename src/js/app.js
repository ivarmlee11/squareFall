
document.addEventListener('DOMContentLoaded', function() {

  var playerObject;
  var updateBoardInterval;
  var platforms = [];
  var score = 0;
  var scoreBox = document.getElementById('score');
  var button = document.getElementById('reset');

  var myGameArea = {
    canvas: document.createElement('canvas'),
    startTheGame: function() {
      this.canvas.width = 300;
      this.canvas.height = 350;
      this.context = this.canvas.getContext('2d');
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.ticker = 0;
      updateBoardInterval = setInterval(updateGameArea, 20);
      window.addEventListener('keydown', function (e) {
        // a property of .keys is checked to see if it exists or if it should be set to
        // an empty array
        myGameArea.keys = (myGameArea.keys || []);
        // the keydown event is passed as a value to the keys property
        myGameArea.keys[e.keyCode] = true;
      });
      window.addEventListener('keyup', function (e) {
        // when the key is released it is removed from the myGameArea
        myGameArea.keys[e.keyCode] = false;
      });
    },
    clear: function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };


  var stopGame = function() {
    clearInterval(updateBoardInterval);
    scoreBox.innerHTML = 'You got ' + score + ' points!';
    button.className = ('');
  };

  var PieceConstructor = function(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.sideSpeed = 0;
    this.verticalSpeed = 0;

    this.update = function() {
      var ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    this.position = function() {
      this.x += this.sideSpeed;
      this.y += this.verticalSpeed;
    };
    this.collideCheck = function(otherobj) {
      var left = this.x;
      var right = this.x + (this.width);
      var top = this.y;
      var bottom = this.y + (this.height);
      var otherleft = otherobj.x;
      var otherright = otherobj.x + (otherobj.width);
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + (otherobj.height);
      var hitDetect = true;
      if ((bottom < othertop) || (top > otherbottom) || (right < otherleft) ||
       (left > otherright)) {
        hitDetect = false;
      }
      if ((bottom > myGameArea.canvas.height + 30) || (top < -100) ||
      (right > myGameArea.canvas.width) || (left < 0)) {
        stopGame();
      }
      return hitDetect;
    };
  };

  var startGame = function() {
    playerObject = new PieceConstructor(15, 15, 'lightgray', 120, 10);
    myGameArea.startTheGame();
  };

  // checks if the ticker and the time are equal
  // if they are equal, this timeForObstacleRelease runs
  // the code that creates new objects and draws them

  var timerForObstacleRelease = function(time) {
    if ((myGameArea.ticker / time) % 1 === 0) {
      return true;
    }
    return false;
  };

  // controls player movement, checks for hits

  var updateGameArea = function() {
    var width;
    var gap;
    var minWidth;
    var maxWidth;
    var minGap;
    var maxGap;

    for (var j = 0; j < platforms.length; j += 1) {
      if (playerObject.collideCheck(platforms[j])) {
        stopGame();
      }
    }

    myGameArea.clear();

    if (!myGameArea.keys) {
      scoreBox.innerHTML = 'Use the arrow keys to dodge the platforms';
    } else if (myGameArea.keys[37]) {
      playerObject.sideSpeed = -0.5;
      playerObject.x = playerObject.x - 2.5;
    } else if (myGameArea.keys[39]) {
      playerObject.sideSpeed = 0.5;
      playerObject.x = playerObject.x + 2.5;
    } else if (myGameArea.keys[38]) {
      playerObject.verticalSpeed = -0.5;
      playerObject.y = playerObject.y - 2.5;
    } else if (myGameArea.keys[40]) {
      playerObject.verticalSpeed = 0.5;
      playerObject.y = playerObject.y + 2.5;
    }
    myGameArea.ticker += 1;

    if (myGameArea.ticker === 1 || timerForObstacleRelease(60)) {
      score += 20;
      scoreBox.innerHTML = score;

    // allows for random obstacle length

      minWidth = 20;
      maxWidth = 200;
      width = Math.floor(Math.random() * (maxWidth - minWidth) + minWidth);
      // allows for random gap between obstacles
      minGap = 100;
      maxGap = 200;
      gap = Math.floor(Math.random() * (maxGap - minGap + 1));
      // obstacles being pushed to an array
      platforms.push(new PieceConstructor((width - gap), 4, 'red', 260, 330));
      platforms.push(new PieceConstructor(width, 4, 'red', 0, 430));
      // obstacle that appears every 100 points
      if (score % 100 === 0) {
        platforms.push(new PieceConstructor((width / 4), 10, 'red', (width - gap), 530));
      }
    }

    // for loop that iterates through array of objects and brings them to the top of the

    for (var i = 0; i < platforms.length; i += 1) {
      platforms[i].y += -2;
      platforms[i].update();
    }

    playerObject.position();
    playerObject.update();
  };
  startGame();
  button.addEventListener('click', function() {
    window.location.reload();
  });
});
