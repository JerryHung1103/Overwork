const express = require('express');
const app = express();
app.use(express.static('../public'))
app.use(express.json());

const {createServer}= require('http');
const httpServer = createServer(app);

const {Server}= require('socket.io');
const io = new Server(httpServer);
const PlayerArray=[];

const fs = require('fs');

const path = require('path');

const players = {};

app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game.html'));
});



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

io.on('connection',(socket)=>{

    socket.emit('getID',socket.id);
    
    let initX = 400, initY=400;
    players[socket.id ] = {x:initX , y :initY };

    console.log(socket.id + " is connected my server");
    io.emit('updatePlayers',players);

    socket.on('disconnect',(reason)=>{
        console.log(reason);
        delete players[socket.id];
        io.emit('updatePlayers',players);
    })
  
    
    socket.on('moveRight',(obj)=>{
        io.emit('moveByID',socket.id);
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
})

httpServer.listen(8000);
