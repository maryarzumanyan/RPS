var config = {
    apiKey: "AIzaSyCOTPW2CsEQ8Pcmc8KT74rZupNjBMsyiV0",
    authDomain: "rockpaperscissors-4f045.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-4f045.firebaseio.com",
    projectId: "rockpaperscissors-4f045",
    storageBucket: "rockpaperscissors-4f045.appspot.com",
    messagingSenderId: "624592670627"
  };
firebase.initializeApp(config);

var db = firebase.database();

var yourName = "";
var sessionKey = "";

function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

function createPlayer(name) {
    var playerId = guid();
    db.ref('players/' + playerId).set({
        username: name
    });
    
    return playerId;
}

function findPartner(myPlayerId) {
    db.ref('waiting_room').on('value', function(snapshot) {
        db.ref('waiting_room').off();
        if (snapshot.val()) {
            var gameId = guid();
            db.ref('game_session/' + gameId).set({
                player1: myPlayerId,
                player2: snapshot.val()
            });

            db.ref('waiting_room').set(gameId);
            startGameSession(myPlayerId, snapshot.val());
        } else {
            waitForPartner(myPlayerId);
        }
    });
}

function waitForPartner(myPlayerId) {
    db.ref('waiting_room').set(myPlayerId);
    db.ref('waiting_room').on('value', function(snapshot) {
        if (snapshot.val() != myPlayerId) {
            // Someone joined the game
            db.ref('waiting_room').off();
            db.ref('waiting_room').remove();
            startGameSession(myPlayerId, snapshot.val());
            /// its a game_id, not a user_id////////////////////////////////////////////////////////////////////////////
        }
    });
}

function startGameSession(myPlayerId, otherPlayerId) {
    alert("Game Started between " + myPlayerId + " and " + otherPlayerId);
    $("#connect").css({display: "none"});
    $("#main-container").css({display: "block"});
}

window.onload = function() {

    $("#main-container").css({display: "none"});

    $("#btn-connect").on("click", function(){
        yourName = $("#name-input").val();
        var myPlayerId = createPlayer(yourName);
        findPartner(myPlayerId);
    })

    $(".btn-rps").on("click", function(){
        var name = $(this).attr("name");
        if(name === "Rock")
        {
            $("#img-status-your").attr("src", "assets/images/Rock.jpg");
        }
        else if(name === "Paper")
        {
            $("#img-status-your").attr("src", "assets/images/Paper.jpg");
        }
        else{
            $("#img-status-your").attr("src", "assets/images/Scissors.jpg");
        }
    })
}
