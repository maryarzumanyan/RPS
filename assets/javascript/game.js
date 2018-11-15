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

var rps =
{
    myPlayerId: "",
    oppId: "",
    gameId: "",
    myName: "",
    oppName: "",
    myScore: 0,
    oppScore: 0,
    myPick: 0,
    oppPick: 0
}


function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  function createPlayer() {
    rps.myPlayerId = guid();
    db.ref('players/' + rps.myPlayerId).set({
        username: rps.myName
    });   
}

function findPartner() {
    var waitingRoomRef = db.ref('waiting_room');
    waitingRoomRef.once('value', function(snapshot) {
        if (snapshot.val()) {
            // Someone is available to start the game
            rps.gameId = guid();
            waitingRoomRef.set(rps.gameId);
            startGameSession();
        } else {
            waitForPartner();
        }
    });
}

function waitForPartner() {
    var waitingRoomRef = db.ref('waiting_room');
    waitingRoomRef.set(rps.myPlayerId);
    waitingRoomRef.on('value', function(snapshot) {
        if (snapshot.val() != rps.myPlayerId) {
            // Someone joined the game
            waitingRoomRef.off();
            waitingRoomRef.remove();
            rps.gameId = snapshot.val();
            startGameSession();
        }
    });
}

function startGameSession() {
    var gameSessionRef = db.ref('game_session/' + rps.gameId);
    gameSessionRef.child(rps.myPlayerId).set(0);
    gameSessionRef.on('child_added', function(snapshot) {
        if (snapshot.key != rps.myPlayerId) {
            rps.oppId = snapshot.key;
            gameSessionRef.off();

            db.ref('game_session/' + rps.gameId + "/" + rps.oppId).on('value', function(snapshot){
                if (snapshot.val() != 0) {
                    rps.oppPick = snapshot.val();
                    match();
                    if(rps.myPick != 0){
                        scoresCalculation();
                    }
                }
                
            });
        }
    });

    $("#connect").css({display: "none"});
    $("#main-container").css({display: "block"});
}


function match()
{
    if(rps.myPick === 0)
    {
        $("#img-status-opp").attr("src", "assets/images/picked.jpg")
    }
    else
    {
        $("#img-status-opp").attr("src", "assets/images/" + rps.oppPick + ".jpg");
    }
}

function scoresCalculation()
{
    var result = "";
    if(rps.myPick === rps.oppPick)
    {
        result = "Draw :-|";
    }
    else if(rps.myPick === "Rock" && rps.oppPick === "Scissors" || rps.myPick === "Paper" && rps.oppPick === "Rock" ||
            rps.myPick === "Scissors" && rps.oppPick === "Paper" ){
        rps.myScore ++ ;
        $("#myScore").text( rps.myScore );
        result = "You won :-)";
    }
    else{
        rps.oppScore ++ ;
        $("#oppScore").text( rps.oppScore );
        result = "You lost :-(";
    }
    
    setTimeout(function() {
        rps.myPick = 0;
        rps.oppPick = 0; 
        alert(result);
        
        db.ref("game_session/" + rps.gameId + "/" + rps.myPlayerId).set(0);

        if(rps.myScore === 3)
        {
            alert("You won the game !!!");
        }
        else if(rps.oppScore === 3)
        {
            alert("You lost the game");
        }
        else {
            $("#buttons").attr("style", "pointer-events: auto; opacity: 1;");
            $("#img-status-your").attr("src", "assets/images/!available.jpg");
            $("#img-status-opp").attr("src", "assets/images/!available.jpg");
        }
    }, 1500);

    
}

window.onload = function() {

    $("#main-container").css({display: "none"});

    $("#btn-connect").on("click", function(){
        rps.myName = $("#name-input").val();
        createPlayer();
        findPartner();
    });

    $(".btn-rps").on("click", function(){
        var pick = $(this).attr("name");
        $("#img-status-your").attr("src", "assets/images/" + pick + ".jpg");

        $("#buttons").attr("style", "pointer-events: none; opacity: 0.4;");
        db.ref("game_session/" + rps.gameId + "/" + rps.myPlayerId).set(pick);
        rps.myPick = pick;
        if(rps.oppPick != 0){
            $("#img-status-opp").attr("src", "assets/images/" + rps.oppPick + ".jpg");
            scoresCalculation();
        }

    });
}
