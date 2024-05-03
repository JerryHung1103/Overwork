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

app.post('/gameover', (req, res) => {
    const {gameState} = req.body;
    if (gameState == 'win') {
        res.sendFile(path.join(__dirname, '../public/win.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/lose.html'));
    }
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

    socket.emit('getID',socket.id);
    
    let initX = 400, initY=400;
    players[socket.id ] = {x:initX , y :initY };

    console.log(players)
    console.log(socket.id + " is connected my server");
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
})

httpServer.listen(8000);
