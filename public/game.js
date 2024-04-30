const socket = io();
let canvas=document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
let cvw=1600;
let cvh=700;
canvas.width=1600;
canvas.height=700;
const playerWidth=240/10;
const playerHeight = 200/8;
let playerImg=new Image();
playerImg.onload=()=>{requestAnimationFrame(drawAnimation);}
playerImg.src= '/image/player_sprite.png'
let PlayerArray=[];
const players = {}
let browserID;
socket.on('getID',id=>browserID=id);
socket.on('updatePlayers',(backend_players)=>{
    for(const id in backend_players){
        const pos = backend_players[id];
        if(!players[id]){
            players[id]=Player(ctx,playerImg,playerWidth,playerHeight,pos.x,pos.y,3,50, 'stayFront')
        }
    }
    for(const id in players){
        if(!backend_players[id]){
            delete players[id];
        }
    }
})
function drawAnimation(now){
    ctx.clearRect(0,0,cvw,cvh)
    PlayerArray.forEach(d=>d.player.update(now))
    for(const id in players){
        players[id].update(now);
        players[id].draw();
    }
    requestAnimationFrame(drawAnimation);
}
document.addEventListener('keydown',event=>{
    let keycode=event.keyCode;
    switch(keycode){
        case 68:
            socket.emit('move','right');
            break;
        case 65:
            socket.emit('move','left');
            break;
        case 87:
            socket.emit('move','up');
            break;
        case 83:
            socket.emit('move','front');
            break;
    }
});
socket.on('moveByID_right',id=>{
   
    players[id].moveRight();
})
socket.on('moveByID_left',id=>{
    players[id].moveLeft();
})
socket.on('moveByID_up',id=>{
    players[id].moveUp();
})
socket.on('moveByID_front',id=>{
    players[id].moveFront();
})

document.addEventListener('keyup',event=>{
    let keycode=event.keyCode;
    switch(keycode){
        case 83: case 87:  case 65: case 68:socket.emit('stop','');     
    }
});

socket.on('stopByID',id=>{
    players[id].stop();
})

let state = {
    moving:false,
    id:0
};

canvas.addEventListener('click', function(event) {
    if(state.moving)
        clearInterval(state.id);
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left -  playerWidth;
        var y = event.clientY - rect.top - playerHeight;
        console.log('Clicked at: x=' + x + ', y=' + y);

        let playerX= players[browserID].getX();
        let playerY= players[browserID].getY();
        let diffX = Math.abs(playerX - x);
        let diffY = Math.abs(playerY - y);
    

        //1st quadrant
        if(playerX<=x && playerY>=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'right');
                    console.log(players[browserID].getX())
                    if(players[browserID].getX()>x - playerWidth){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'up');
                            if(players[browserID].getY()<y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
            else{
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'up');
                    if(players[browserID].getY()<y){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'right');
                            console.log(players[browserID].getX())
                            if(players[browserID].getX()>x- playerWidth){
                                clearInterval(id);
                               
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
        }
         //2nd quadrant
        else if(playerX>=x && playerY>=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'left');
                    console.log(players[browserID].getX())
                    if(players[browserID].getX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'up');
                            console.log(players[browserID].getY())
                            if(players[browserID].getY()<y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
            else{ 
                let id= setInterval(() => {
                state.id=id;
                socket.emit('move', 'up');
                if(players[browserID].getY()<y){
                    clearInterval(id);
                    id= setInterval(() => {
                        state.id=id;
                        socket.emit('move', 'left');
                        if(players[browserID].getX()<x){
                            clearInterval(id);
                            socket.emit('stop','');    
                            state.moving=false; 
                        }
                    }, 50);  
                }
            }, 50);
            }           
        }

        //3rd quadrant
        else if(playerX>=x && playerY<=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'left');
                    console.log(players[browserID].getX())
                    if(players[browserID].getX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'front');
                            console.log(players[browserID].getY())
                            if(players[browserID].getY()>y- playerHeight){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
            else{
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'front');
                    if(players[browserID].getY()>y- playerHeight){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'left');
                            if(players[browserID].getX()<x){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
        }
        //4th quadrant
        else if(playerX<=x && playerY<=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'right');
                    console.log(players[browserID].getX())
                    if(players[browserID].getX()>x- playerWidth){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'front');
                            console.log(players[browserID].getY())
                            if(players[browserID].getY()>y- playerHeight){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
            else{

                let id= setInterval(() => {
                    state.id=id;
                    socket.emit('move', 'front');
                    if(players[browserID].getY()>y- playerHeight){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            socket.emit('move', 'right');
                            if(players[browserID].getX()>x- playerWidth){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                            }
                        }, 50);  
                    }
                }, 50);
            }
            
        }
});


