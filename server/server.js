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
const playerLeaderboard = {};

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

// For switching pages
app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game.html'));
});

app.post('/gameover', (req, res) => {
    const {gameState} = req.body;
    res.render('gameover', { gameState });
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

// app.post('/submit-score', (req, res) => {
//     const { playerName, score , socket} = req.body;
  
//     // Store the player's name and score in the data structure
//     playerLeaderboard[playerName] = score;
  
//     // Check if both players have submitted their scores
//     if (Object.keys(playerLeaderboard).length == 2) {
//         // Both players have submitted their scores, perform calculations
  
//         // Retrieve score of the 2 players from playerLeaderboard. We don't know the name of the players until they play
//         const player1Score = playerLeaderboard[Object.keys(playerLeaderboard)[0]];
//         const player2Score = playerLeaderboard[Object.keys(playerLeaderboard)[1]];
//         console.log("player1's score: " + player1Score);
//         console.log("player2's score: " + player2Score);

//         // Swap the ordering of the players in playerLeaderboard if player1's score < player2's score
//         if (player1Score < player2Score) {
//             const temp = playerLeaderboard[Object.keys(playerLeaderboard)[0]];
//             playerLeaderboard[Object.keys(playerLeaderboard)[0]] = playerLeaderboard[Object.keys(playerLeaderboard)[1]];
//             playerLeaderboard[Object.keys(playerLeaderboard)[1]] = temp;
//         }

//         // Example: Calculate total score as the sum of player 1 and player 2 scores
//         const totalScore = player1Score + player2Score;
  
//         // Example: Determine win/loss status based on the total score
//         // Assume always win for now for testing
//         const winStatus = 'win';

//       // Render the view and pass the necessary data
//       res.render('result', { playerName, totalScore, winStatus});
  
//       // Clear the submitted scores for the next game
//       playerScores = {};
//     } else {
//       // Only one player has submitted their score, display a waiting message or redirect to a waiting page
//       res.render('waiting', { playerName });
//     }
//   });

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
    } else{
        // console.log('Connection established from the index.html page');
    }

})


httpServer.listen(8000);
