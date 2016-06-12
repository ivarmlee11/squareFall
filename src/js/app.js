// my game area object which includes some properties with values
// that are functions to start and end the game
// the object constructor and the structure of the for loop
// were directly inspired from http://www.w3schools.com/games/game_obstacles.asp

// establish a firebase ref from which I can store and read data
var myFirebaseRef = new Firebase('https://squarefall.firebaseio.com/');
var playerObject;
var updateBoardInterval;
var platforms = [];
var score = 0;
var scoreBox = document.getElementById('score');
var button = document.getElementById('reset');
var jsonDataArrayToBeSorted = [];
var playerName = prompt('Enter your name!');
var stopped = false;

var myGameArea = {
  canvas: document.createElement('canvas'),
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  drawBoard: function() {
    updateBoardInterval = setInterval(this.updateGameArea, 20);
    this.canvas.width = 300;
    this.canvas.height = 350;
    this.context = this.canvas.getContext('2d');
    this.ticker = 0; // game updates every 20 mil seconds
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    window.addEventListener('keydown', function (e) {
      // a property of .keys is assigned to myGameArea
      // or to an empty array
      myGameArea.keys = (myGameArea.keys || []);

      // the keydown event is passed as a value to the keys property
      // while keydown events are values of keys they are set to true
      myGameArea.keys[e.keyCode] = true;
      });
    window.addEventListener('keyup', function (e) {
      // when the key is released it is removed from the myGameArea
      myGameArea.keys[e.keyCode] = false;
      });
  },
  startGame: function() {
    // start game function that makes a player object and sets up the stopped
    // flag for later use in our stopgame function
    stopped = false;
    playerObject = new PieceConstructor(15, 15, 'lightgray', 120, 10);
    myGameArea.drawBoard();
  },
  stopGame: function() {
    // stopped flag is changed to true here to stop the game
    // the interval of 20 mili seconds is stopped
    clearInterval(updateBoardInterval);
    if (!stopped) {
      stopped = true;
      scoreBox.innerHTML = 'You got ' + score + ' points!';
      button.className = ('');
      firebase.firebaseInteraction();
      firebase.leaderBoardDisplay();
    }
  },
  updateGameArea: function() {
    // controls player movement, checks for hits
    // update game area is looped over every 20 mili
    var width;
    var gap;
    var minWidth;
    var maxWidth;
    var minGap;
    var maxGap;

    // checks for collisions with platforms

    for (var j = 0; j < platforms.length; j += 1) {
      if (playerObject.collideCheck(platforms[j])) {
        myGameArea.stopGame();
        // console.log("??");
      }
    }

    // this clears the 'old' objects
    // otherwise you'd see a ton of objects painted
    // to the screen with trailing tails

    myGameArea.clear();


    // display message until an arrow is pressed

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

    // game ticker iterates by one every time the game area refreshes
    // the obstacles are made based on the param passed to timeforobstacle--

    myGameArea.ticker += 1;
    // if statement that makes randomly sized obstacles
    // every second
    if (myGameArea.ticker === 1 || myGameArea.timerForObstacleRelease(60)) {
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
      // they are brought towards the top of the canvas because their
      // 'y' property is decremented by 2 pixes every time the game area is refreshed
      platforms[i].y += -2;
      platforms[i].update();
    }

    playerObject.position();
    playerObject.update();
  },
  timerForObstacleRelease: function(time) {
    // checks if the ticker and the time are equal
    // if they are equal, this timeForObstacleRelease runs
    // the code that creates new objects and draws them
    return ((myGameArea.ticker / time) % 1 === 0)
  }
};

var firebase = {
  firebaseInteraction: function() {
    // makes a new child in the firebase called the name of the player
    // entered at prompt screen
    // inside of the object there are two properties
    // one prop contains the score while the other contains the
    // player name
    myFirebaseRef.child(playerName).set({
      score: score,
      player: playerName
    });
  },
  leaderBoardDisplay: function() {
    // takes a snapshot of the firebase json file and
    // a for in loop iterates through the keys and pushes them to an empty array
    // the array is then sorted based on the score property from highest to lowest
    myFirebaseRef.on('value', function(snapshot) {
      var fireData = snapshot.val();
      for (var key in fireData) {
        jsonDataArrayToBeSorted.push(fireData[key]);
      }

      var sortedJson = jsonDataArrayToBeSorted.sort(function(obj1, obj2) {
        return obj2.score - obj1.score;
      });
      console.log(sortedJson);
      for (var l = 0; l < 10; l++) {
        document.write(l + 1 + ' ' + sortedJson[l].player + ' got '
          + sortedJson[l].score + ' points!' + '</br>');
      }
    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    });
  }
}

var PieceConstructor = function(width, height, color, x, y) {
  // constructor function; this function is a template for all my objects

  // sets these params to properties of the object
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.sideSpeed = 0;
  this.verticalSpeed = 0;

  // these properties contain functions that describe how
  // these objects will be drawn on the canvas

  this.update = function() {
    var ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  // this function describes the speed and direction

  this.position = function() {
    this.x += this.sideSpeed;
    this.y += this.verticalSpeed;
  };

  // this function covers hit detection

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

    // this if statement detects hits vs other objects

    if ((bottom < othertop) || (top > otherbottom) || (right < otherleft) ||
     (left > otherright)) {
      hitDetect = false;
    }

    // this if statement detects hits vs walls

    if ((bottom > myGameArea.canvas.height + 30) || (top < -100) ||
    (right > myGameArea.canvas.width) || (left < 0)) {
      myGameArea.stopGame();
    }
    return hitDetect;
  };
};

document.addEventListener('DOMContentLoaded', function() {
  myGameArea.startGame();
  button.addEventListener('click', function() {
    window.location.reload();
  });
});
