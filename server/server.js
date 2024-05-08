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

const fs = require('fs');

const path = require('path');

const players = {};
const playerScoreArray=[];

// For index.html
const rooms = {};
const playersInLobby = {};
let gameoverStatus;


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

// For switching pages
app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game.html'));
});

app.get('/gameover', (req, res) => {
    res.render('gameover', gameoverStatus);
});

// For index.html
// Sign in form
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

// Register form
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

// Pairup page
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

app.get('/remove-room', (req, res) => {
    const { roomId } = req.query;
    
    // Check if the room exists
    if (rooms[roomId]) {
      delete rooms[roomId];
      // Broadcast the updated list of available rooms to other players
      broadcastAvailableRooms();
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });
  
// For game.html
let sameRoom=true;
let temp=true;
const itemArray=[
    {
        x:270,
        y:540,
        show:true,
        type:'A'
    },
    {
        x:640,
        y:540,
        show:true,
        type:'B'
    },
    {
        x:1010,
        y:540,
        show:true,
        type:'C'
    },
    {
        x:1380,
        y:540,
        show:true,
        type:'D'
    }
]

var tasks = [
    {  subtasks: generateRandomSubtasks() , duration :20},
    {  subtasks: generateRandomSubtasks() , duration :20},
    {  subtasks: generateRandomSubtasks() , duration :20}
];

//return sub set of task
function generateRandomSubtasks() {
    var subtasks = [];
    var possibleSubtasks = ["A", "B", "C", "D"];

    // Randomly select subtasks
    var numSubtasks = Math.floor(Math.random() * 3) + 1;
    for (var i = 0; i < numSubtasks; i++) {
        var index = Math.floor(Math.random() * possibleSubtasks.length);
        subtasks.push(possibleSubtasks[index]);
        possibleSubtasks.splice(index, 1);
    }

    return subtasks;
}

function switchItem(){
    itemArray.forEach(i=>{
        if(i.show){
            io.emit('change_state_to',false);
            i.show=false;
        }
        else{
            io.emit('change_state_to',true);
            i.show=true;
        }

    })
}

io.on('connection',(socket)=>{
    // console.log('Connection from:', socket.handshake.headers.referer);
    if (socket.handshake.headers.referer.endsWith('play')) {
        // console.log('Connection established from the game.html page');
        io.emit('displayTask',tasks);//to be implement as same room
        if(temp){
            setInterval(()=>{
                tasks.forEach(t=>{
                    t.duration--;
                    if(t.duration===0){
                        t.subtasks=generateRandomSubtasks();
                        t.duration=20;
                       
                    }
                });
                io.emit('displayTask',tasks);//to be implement as same room
                // console.log(tasks[0].duration)
            },1000)
            temp=false;
        }
    
        socket.on('finish_subTask',subTask=>{
    
    
            for(let i=0;i<tasks.length;++i){
                let task=tasks[i];
                var indexToRemove = task.subtasks.indexOf(subTask);
                if (indexToRemove !== -1) {
                    // Remove the element
                    // console.log("old task",tasks)
                    task.subtasks.splice(indexToRemove, 1);
                    
                    if(task.subtasks.length===0){//finish one big task
                        task.subtasks=generateRandomSubtasks();
                    }
                    // console.log("now task",tasks)
                    io.emit('displayTask',tasks);//to be implement as same room
                    break;
            }
        }})

        socket.emit('getID',socket.id);
    
        let initX = 400, initY=400;
        players[socket.id] = {x:initX , y :initY , inGame:false};
    
        console.log(players)
        console.log(socket.id + " is connected my server");
        io.emit('updatePlayers',players);
    
        socket.on('disconnect',(reason)=>{
            console.log(reason);
            delete players[socket.id];
            io.emit('updatePlayers',players);
        })
        
        io.emit('drawItem',itemArray);
        if(sameRoom)
            {
                setInterval(switchItem,1000000);//Make it random
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

        socket.on('submit-score', ({ name, score}) => {
            console.log('In Submit score for player: ', name, ' with score: ', score, ' and socketId: ', socket.id);
            // 1. Create a new player object
            const player = {
              name,
              score,
              socketId: socket
            };
          
            // 2. Push the player object into the PlayerArray
            playerScoreArray.push(player);
        
            // 3. If playerScoreArray has 2 players, perform calculations to show in the gameover / scoring menu
            console.log
            console.log(playerScoreArray);
            if (playerScoreArray.length == 2) {
                let player1Score = -Infinity;
                let player2Score;
                let player1Name;
                let player2Name;
                let totalScore = 0;
                playerScoreArray.forEach((player) => {
                    // 3.1. Fetch socket of each player
                    const { socketId } = socket;
            
                    // 3.2. Calculate the total score
                    totalScore += score;
            
                    // 3.3. Rank the players
                    if (player.score > player1Score) {
                        // Swap the players
                        player2Name = player1Name;
                        player2Score = player1Score;
                        player1Score = player.score;
                        player1Name = player.name;
                    } else{
                        // No need to swap the player. The rank is already correct
                        player2Score = player.score;
                        player2Name = player.name;
                    }
                });    
            
                // 4. Determine if they players have won or lost
                // Assume always win for now for testing
                const gameState = 'win';
            
                // 5. Store the gameover status
                gameoverStatus = {player1Name, player1Score, player2Name, player2Score, totalScore, gameState};
        
                // 6. Alert each player that they can now ask for the view
                playerScoreArray.forEach((player) => {
                    const { socketId } = player;
                    socketId.emit('game-is-over');
                });

                // 7. Empty the playerScoreArray
                playerScoreArray = [];
            }
        });

    } else{
        // console.log('Connection established from the index.html page');
    }

})


httpServer.listen(8000);
