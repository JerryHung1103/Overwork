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

const ItemWidth=240/10;
const ItemHeight = 200/8;

let playerImg=new Image();
let itemImg = new Image();
playerImg.onload=()=>{
    itemImg.onload=()=>{
        requestAnimationFrame(drawAnimation);
    }
    itemImg.src= '/image/player_sprite.png'
}
playerImg.src= '/image/player_sprite.png'

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

let item1;
let showItem1;
socket.on('drawItem',backendItem=>{
    item1=Item(ctx,itemImg,ItemWidth,ItemHeight,backendItem.x,backendItem.y,1,50, 'movingFront');
    showItem1=backendItem.show;
})

socket.on('change_state_to',show=>{
    showItem1=show;
});

document.getElementById('cd').addEventListener('click',()=>{
    socket.emit('start_progress',1);//barrier index
}) // Code Test


socket.on('receive_progress',index=>{
    barriers[index].startCountDown()
})// Code Test

socket.on('updateBarriers',state=>{
    barriers[state.id].update(state.progressing,state.stopProgres)
})

function drawAnimation(now){
    ctx.clearRect(0,0,cvw,cvh)
    if(barriers){
        barriers.forEach(barrier=>barrier.startProgress(ctx))
        ctx.fillStyle = "#4caf50";
        ctx.lineWidth = 2; // Set the line width of the rectangle outline
        barriers.forEach(barrier=>ctx.strokeRect(barrier.x-barrier.margin,barrier.y-barrier.margin,barrier.width+2*barrier.margin,barrier.width+2*barrier.margin))
        //the job area

        ctx.fillStyle = "black";
        barriers.forEach(barrier=>ctx.fillRect(barrier.x,barrier.y,barrier.width,barrier.width))
    }// visualize the barriers

    if(item1){
        item1.update(now);
    }
    if(showItem1){
        if(item1){
            item1.draw();
        }
    }
       
    for(const id in players){
        players[id].update(now);
        players[id].draw();
        ctx.fillStyle = 'red';
        ctx.fillRect(players[id].getCenterX(),players[id].getCenterY(), 2, 2); 
        //visualize center of player

        ctx.fillStyle = 'yellow'; // Set the color of the point
        ctx.fillRect(players[id].getX(),players[id].getY(), 2, 2); 
        //real canvas loaction of player

        ctx.fillStyle = 'black';
        if(barriers){
            barriers.forEach((barrier,index)=>{
                if(barrier.checkPlayer(players[id])!=-1){
                    barriers[index].startCountDown()//check if players are entering the job area
                } 
            })
        }
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
    socket.emit('updatePos',{x:players[id].getCenterX(), y:players[id].getCenterY()})
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
    socket.emit('updatePos',{x:players[id].getX(), y:players[id].getY()});
    socket.emit('print','');
})

let state = {
    moving:false,
    id:0
};

// barriers on map
let barriers = [
    Barrier(200,200,50,players,socket,0.1,0),
    Barrier(100,100,50,players,socket,0.1,1)
];


//handle click event
canvas.addEventListener('click', function(event) {
    if(state.moving)
        clearInterval(state.id);
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left 
        var y = event.clientY - rect.top 

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
            
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'right');
                    // if(StopBarrier(browserID,id,x,y))return;
                    console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if( players[browserID].getCenterX()  >x ){      console.log('player x is',players[browserID].getX())
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                        
                    })
                    if(indicator)return;

                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                            socket.emit('move', 'up');
                            console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            if( players[browserID].getCenterY()<y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                                // barrier.Set_stopping_state('')
                               
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{
                let id= setInterval(() => {
                    state.id=id;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                       
                    })
                    if(indicator)return;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    socket.emit('move', 'up');
                    // if(StopBarrier(browserID,id,x,y,'up'))return;
                    console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if(players[browserID].getCenterY()<y){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                               
                            })
                            if(indicator)return;
                            // if(barrier.StopBarrier(browserID,id,x,y))return;
                            socket.emit('move', 'right');
                            // if(StopBarrier(browserID,id,x,y,'right'))return;
                            console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            
                            if(players[browserID].getCenterX()>x){
                                clearInterval(id);
                               
                                socket.emit('stop','');    
                                state.moving=false; 
                               barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            // barrier.Set_stopping_state('')
                            }
                        }, 5);  
                    }
                }, 5);
            }
        }
         //2nd quadrant
        else if(playerX>=x && playerY>=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'left');
                    // console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    // if(StopBarrier(browserID,id,x,y,'left'))return;
                    if(players[browserID].getCenterX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            // if(barrier.StopBarrier(browserID,id,x,y))return;
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                            })
                            if(indicator)return;
                            socket.emit('move', 'up');
                            // if(StopBarrier(browserID,id,x,y,'up'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            if(players[browserID].getCenterY()<y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                // barrier.Set_stopping_state('');
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{ 
                let id= setInterval(() => {
                state.id=id;
                // if(barrier.StopBarrier(browserID,id,x,y))return;
                let indicator=false
                barriers.forEach(b=>{
                    indicator |= b.StopBarrier(browserID,id,x,y);
                })
                if(indicator)return;
                socket.emit('move', 'up');
                // if(StopBarrier(browserID,id,x,y,'up'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                if(players[browserID].getCenterY()<y){
                    clearInterval(id);
                    id= setInterval(() => {
                        state.id=id;
                        // if(barrier.StopBarrier(browserID,id,x,y))return;
                        let indicator=false
                        barriers.forEach(b=>{
                            indicator |= b.StopBarrier(browserID,id,x,y);
                        }) 
                        if(indicator)return;
                        socket.emit('move', 'left');
                        // if(StopBarrier(browserID,id,x,y,'left'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                        if(players[browserID].getCenterX()<x){
                            clearInterval(id);
                            socket.emit('stop','');    
                            state.moving=false; 
                            // barrier.Set_stopping_state('');
                            barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                        }
                    }, 5);  
                }
            }, 5);
            }           
        }

        //3rd quadrant
        else if(playerX>=x && playerY<=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'left');
                    // if(StopBarrier(browserID,id,x,y,'left'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if(players[browserID].getCenterX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            // if(barrier.StopBarrier(browserID,id,x,y))return;
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                            })
                            if(indicator)return;
                            socket.emit('move', 'front');
                            // if(StopBarrier(browserID,id,x,y,'front'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            if(players[browserID].getCenterY()>y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                // barrier.Set_stopping_state('');
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{
                let id= setInterval(() => {
                    state.id=id;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'front');
                    // if(StopBarrier(browserID,id,x,y,'front'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if(players[browserID].getCenterY()>y){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            // if(barrier.StopBarrier(browserID,id,x,y))return;
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                            })
                            if(indicator)return;
                            socket.emit('move', 'left');
                            // if(StopBarrier(browserID,id,x,y,'left'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            if(players[browserID].getCenterX()<x){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                // barrier.Set_stopping_state('');
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
        }
        //4th quadrant
        else if(playerX<=x && playerY<=y){
            state.moving=true;
            if(diffX<=diffY){
                let id= setInterval(() => {
                    state.id=id;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'right');
                    // if(StopBarrier(browserID,id,x,y,'right'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if(players[browserID].getCenterX()>x){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
                            // if(barrier.StopBarrier(browserID,id,x,y))return;
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                            })
                            if(indicator)return;
                            socket.emit('move', 'front');
                            // if(StopBarrier(browserID,id,x,y,'front'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                            if(players[browserID].getCenterY()>y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                // barrier.Set_stopping_state('');
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{

                let id= setInterval(() => {
                    state.id=id;
                    // if(barrier.StopBarrier(browserID,id,x,y))return;
                    let indicator=false
                    barriers.forEach(b=>{
                        indicator |= b.StopBarrier(browserID,id,x,y);
                    })
                    if(indicator)return;
                    socket.emit('move', 'front');
                    // if(StopBarrier(browserID,id,x,y,'front'))return;// console.log("x is ",players[browserID].getX(), " y is ",players[browserID].getY())
                    if(players[browserID].getCenterY()>y){
                        clearInterval(id);
                        id= setInterval(() => {
                            state.id=id;
              
                            let indicator=false
                            barriers.forEach(b=>{
                                indicator |= b.StopBarrier(browserID,id,x,y);
                            })
                            if(indicator)return;
                             barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            socket.emit('move', 'right');

                            if(players[browserID].getCenterX()>x){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                                // barrier.Set_stopping_state('');
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
            
        }
});



