const express = require('express');
const app = express();
app.use(express.static('../public'))
app.use(express.json());
app.set("view engine", "ejs")
app.set('views', '../views');

const {createServer}= require('http');
const httpServer = createServer(app);

const {Server}= require('socket.io');
const io = new Server(httpServer);
const PlayerArray=[];

const fs = require('fs');

const path = require('path');

const players = {};

// For index.html
const rooms = {};
const playersInLobby = {};

function getAvailableRooms() {
    const availableRooms = [];
    const roomIds = Object.keys(rooms);
    
    for (let i = 0; i < roomIds.length; i++) {
      const roomId = roomIds[i];
      if (rooms[roomId].players.length == 1) {
        availableRooms.push(roomId);
      }
    }
    
    return availableRooms;
}

function broadcastAvailableRooms() {
    const availableRooms = getAvailableRooms();
    const broadcastData = {
      availableRooms: availableRooms
    };

    io.emit('broadcastRooms', broadcastData);
}

function getPlayersIdle() {
    const playersIdle = [];
    const playerIds = Object.keys(playersInLobby);
  
    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      if (playersInLobby[playerId].isIdle) {
        playersIdle.push(playerId);
      }
    }
    
    return playersIdle;
  }

app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game.html'));
});

app.post('/gameover', (req, res) => {
    const {gameState} = req.body;
    res.render('gameover', { gameState });
});

const item1_location={
    x:210,
    y:170,
    show:true
}

app.post("/signin", (req, res) => {
 
    const {username , pw} = req.body;
    const playerList = JSON.parse( fs.readFileSync('player.json'));
    if (!playerList[`${username}`]) {
        res.json(
            {
                success: false,
                reason: 'Player does not exist',
            }
        );
    }
    else{
        if(playerList[username].pw != pw){
            res.json(
                {
                    success: false,
                    reason: 'Wrong password',
                }
            );
        }
        else{
            res.json(
                {
                    success: true,
                    reason: '',
                }
            );
            playersInLobby[username] = {isIdle: true};
        }
        
    }
});


app.post("/register", (req, res) => {
    const {username , pw} = req.body;
    const playerList = JSON.parse( fs.readFileSync('player.json'));
    if (playerList[username]) {
        res.json({ success: false });
    }
    else{
        playerList[username]={pw};
        fs.writeFileSync('player.json',JSON.stringify(playerList,null, " "));
        res.json({success:true});
    }
});

function switchItem(){
    // console.log('switch to ', !item1_location.show)
    if(item1_location.show){
        io.emit('change_state_to',false);
        item1_location.show=false;
    }
    else{
        io.emit('change_state_to',true);
        item1_location.show=true;
    }
}
let sameRoom=true

io.on('connection',(socket)=>{
    // console.log('Connection from:', socket.handshake.headers.referer);
    if (socket.handshake.headers.referer.endsWith('play')) {
        // console.log('Connection established from the game.html page');
        socket.emit('getID',socket.id);
    
        let initX = 400, initY=400;
        players[socket.id] = {x:initX , y :initY};
    
        // console.log(socket.id + " is connected my server");
        io.emit('updatePlayers',players);
    
        socket.on('disconnect',(reason)=>{
            console.log(reason);
            delete players[socket.id];
            io.emit('updatePlayers',players);
        })
        
        io.emit('drawItem',item1_location);
        if(sameRoom)
            {
                setInterval(switchItem,5000);//Make it random
                sameRoom=false
            }
          socket.on('print',()=>{
            console.log('calling server print',players)
        })
      
        
        socket.on('moveRight',(obj)=>{
            io.emit('moveByID',socket.id);
        })
         socket.on('updatePos',pos=>{
            players[socket.id]={x:pos.x , y:pos.y}
        })
        socket.on('move',(obj)=>{
            switch(obj){
                case 'right':
                    io.emit('moveByID_right',socket.id);
                    break;
                case 'left':
                    io.emit('moveByID_left',socket.id);
                    break;
                case 'up':
                    io.emit('moveByID_up',socket.id);
                    break;
                case 'front':
                    io.emit('moveByID_front',socket.id);
                    break;
            }
            
        })
        
        socket.on('stop',(obj)=>{
            io.emit('stopByID',socket.id);
        }) 
        socket.on('start_progress',index=>{
            io.emit('receive_progress',index);
        })
        // socket.emit('update_barrier',id)
        socket.on('update_barrier',state=>{
            console.log(state)
            io.emit('updateBarriers',state);
        })

    } else{
        // console.log('Connection established from the index.html page');
    }

})

app.get('/get-available-rooms',(req,res)=>{
    let availableRooms = getAvailableRooms();
    res.json({availableRooms});
});

app.post("/create-room", (req, res) => {
    console.log(req.body);
    const { playerId } = req.body;

    // Generate a unique room ID using the player's name, which is unique
    const roomId = playerId;
  
    // Create the room
    rooms[roomId] = {
      players: [playerId],
    };
    
    playersInLobby[playerId] = { isIdle: false };

    // Broadcast latest list of available rooms to the players
    broadcastAvailableRooms();

    // Return the roomId to client
    res.json({ roomId });
})

app.post("/join-room", (req, res) => {
    console.log("Join room");
    const { playerId, roomId } = req.body;

    // Join the room
    rooms[roomId].players.push(playerId);
    // Alert the other player in the room that the room is now full, send them a message to start the game
    const otherPlayerId = rooms[roomId].players[0];

    console.log("Send start game message to: ", otherPlayerId);
    io.emit('startGame', otherPlayerId);

    playersInLobby[playerId] = { isIdle: false };
    // Broadcast latest list of available rooms to the players
    broadcastAvailableRooms();

    console.log("Send start game message to: ", playerId);
    io.emit('startGame', playerId);
    // Send the room id to the client
    res.json({ roomId });
});

httpServer.listen(8000);
