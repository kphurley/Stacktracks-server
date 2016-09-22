var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');

console.log('server started');

var players = [];

io.on('connection', function(socket) {

  var thisPlayerId = shortid.generate();
  var thisPlayer = {id: thisPlayerId};

  console.log('client id: ' + thisPlayerId + ' connected, broadcasting spawn');
  socket.broadcast.emit('spawn', thisPlayer);

  players.push(thisPlayer);
  console.log('Current connected players: ', players);

  players.forEach(player => {
    if(player.id == thisPlayerId){
      return;
    }
    console.log('spawning player', player.id)
    socket.emit('spawn', player);
  })

  socket.on('move', function(data) {
    console.log('client id' + data.id + ' moved');
  });

  socket.on('disconnect', function() {
    console.log('player with id '+ thisPlayerId +' disconnected');
    players.splice(players.indexOf(thisPlayer), 1);
    socket.broadcast.emit('disconnected', thisPlayer);
  })

})
