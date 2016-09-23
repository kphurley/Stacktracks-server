var io = require('socket.io')(3000);
var shortid = require('shortid');

console.log('server started');

var players = [];
var gameState = {};

const TICK_RATE = 50;

io.on('connection', function(socket) {

  //Generate a unique ID for the connecting player
  var thisPlayerId = shortid.generate();
  var thisPlayer = {id: thisPlayerId};

  //Broadcast this spawn to the other clients
  console.log('client id: ' + thisPlayerId + ' connected, broadcasting spawn');
  socket.broadcast.emit('spawn', thisPlayer);

  //Push this player onto the player list
  players.push(thisPlayer);

  //Register this player's car info to the game state
  gameState[thisPlayer.id] = {}

  console.log('Currently connected players: ', players);

  //Send the other players' info for this player to spawn on their client
  players.forEach(player => {
    if(player.id == thisPlayerId){
      return;
    }
    console.log('spawning player', player.id)
    socket.emit('spawn', player);
  })

  //When a client sends a move action, replace what is in the state with data
  /*
    data should have the object signature:
    {
      position: {x: float, y: float, z: float},
      velocity: {x: float, y: float, z: float}
    }
  */
  socket.on('move', function(data) {
    gameState[thisPlayer.id] = data;
  });

  //Handle player disconnects and broadcast them to the other clients
  socket.on('disconnect', function() {
    console.log('player with id '+ thisPlayerId +' disconnected');
    players.splice(players.indexOf(thisPlayer), 1);
    delete gameState[thisPlayer.id];
    socket.broadcast.emit('disconnected', thisPlayer);
    console.log('Currently connected players: ', players);
  });

});

//Broadcast the game state to all clients (tick)
setInterval(function(){
  io.emit('tick', gameState);
}, TICK_RATE)

