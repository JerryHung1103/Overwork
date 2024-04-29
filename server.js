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



app.get('/play', (req, res) => {

    res.sendFile(path.join(__dirname, '../public/game.html'));
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
   

    console.log(socket.id + " is connected my server");
    io.emit('addPlayer',socket.id);
    //all browser update the 

    
    socket.on('constructPlayer', (obj) => {
        PlayerArray.push({id: obj.id, x:obj.x , y:obj.y});
        io.emit('updatePlayer',PlayerArray);
      });

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
