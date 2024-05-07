const socket = io();
console.log("Printing window socket");
console.log(window.socket);
let canvas=document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
let cvw=1600;
let cvh=700;
canvas.width=1600;
canvas.height=700;
// const playerWidth=240/10;
// const playerHeight = 200/8;

const ItemWidth=240/10;
const ItemHeight = 200/8;

let playerImg=new Image();
let itemImg = new Image();
let backgroundImg = new Image();
let JobArea = new Image();
//width is 38
//height is 44
//gap is 3, first one is 2
//gap height is 2


//first item is 2.2 and 10,10

backgroundImg.src = '/image/background.png';
backgroundImg.onload=()=>{
    // Draw background img covering the whole canvas
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);
    playerImg.onload=()=>{
        itemImg.onload=()=>{
            JobArea.onload=()=>{
                requestAnimationFrame(drawAnimation);
            }
            JobArea.src='/image/GameObjectSpriteSheet.png'
        }
        itemImg.src= '/image/player_sprite.png'
    }
    playerImg.src= '/image/BusinessManSprites.png'
}

const players = {}
let browserID;

// Scoring: Things to pass back to the server when game ends
const playerName = sessionStorage.getItem('playerName');
console.log(playerName); 
let score = 0;

// Gameover page is here for testing right now
function fetchGameOverPage(gameState){
    let data = {gameState: gameState};

    fetch('/gameover',{
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(data)
            })
    .then(response => {
        if (response.ok) {
        return response.text();
        } else {
        throw new Error('Failed to load gameover page');
        }
    })
    .then(html => {
        document.body.innerHTML = html;
    })
}

socket.on('getID',id=>browserID=id);
socket.on('updatePlayers',(backend_players)=>{
    for(const id in backend_players){
        const pos = backend_players[id];
        if(!players[id]){
            players[id]=Player(socket,ctx,playerImg,playerWidth,playerHeight,pos.x,pos.y,2,50, 'stayFront',
            {x:700,y:250,width:300,height:100})
        }
    }
    for(const id in players){
        if(!backend_players[id]){
            delete players[id];
        }
    }
})

let itemImageMap={
    // Task name : taks sprite
}
let item1=[];
let barriers =[]
let showItem1;

socket.on('drawItem',backendItemArray=>{
    backendItemArray.forEach(backendItem=> item1.push(
        {
            item:Item(ctx,itemImg,ItemWidth,ItemHeight,backendItem.x,backendItem.y,1,50, 'movingFront',backendItem.type),
            show:backendItem.show
        }))
        barriers = [

            Barrier(235,565,100,65,players,socket,0.5,0,'jobArea',item1[0]),
            Barrier(600,565,100,65,players,socket,.5,1,'jobArea',item1[1]),
            Barrier(960,565,100,65,players,socket,.5,2,'jobArea',item1[2]),
            Barrier(1320,565,100,65,players,socket,.5,3,'jobArea',item1[3]),
            //initx intiy width height playerList socket(optional actually   is not needed), bar rate, id, type
        
        ];
   
})

socket.on('change_state_to',show=>{
    item1.forEach(i=>i.show=show)
    // showItem1=show;
});

const subtaskWidth=50;
const subtaskHeight=50;
let task=[];
let numberofCurrentTask=0;

socket.on('displayTask',tasks=>{
    // console.log('displayTask')
    let taskCnt={}
    tasks.forEach(t=>{
        // console.log(t.subtasks.length)
        numberofCurrentTask+=t.subtasks.length
        t.subtasks.forEach(subt=>{
            if(!taskCnt[subt])taskCnt[subt]=1;
            else taskCnt[subt]++;
        })
    });
    task=tasks;
    item1.forEach(i=>{
        if(taskCnt[i.item.type]){
            i.show=true
        }
        else{
            i.show=false
        }
    })
    

   

});











socket.on('updateBarriers',state=>{
    barriers[state.id].update(state.progressing,state.stopProgres)
})

function drawAnimation(now){
    // Clear the canvas
    ctx.clearRect(0,0,cvw,cvh)
  
    // Redraw the background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    if(task){
        // ctx.lineWidth = 2; 
        // ctx.strokeRect(0,0,numberofCurrentTask*subtaskWidth,50)
        var x = 10; // X position
        var y = 20; // Y position

        // Display the task list
        for (var i = 0; i < task.length; i++) {
            var t = task[i];
            // ctx.fillText("Task ID: " + t.name, x, y);

            var subtasks = t.subtasks.join(", ");
            ctx.fillText("Subtasks: " + subtasks, x, y + 20);

            x += 100; // Move to the next task position
        }


        // for(let i =0;i<numberofCurrentTask;++i){
        //     if(i%2) ctx.fillStyle = "#4caf50"
        //     else ctx.fillStyle = "black";
        //     ctx.fillRect(i*subtaskWidth,0,subtaskWidth,subtaskHeight)
        // }
       
           
    

       
    }
    

    ctx.drawImage(JobArea,
                20,200,400,450,
                140,500,200,200
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20,200,400,450,
                500,500,200,200
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20,200,400,450,
                860,500,200,200
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20,200,400,450,
                1220,500,200,200
            )//Drawing the jobTable
    if(barriers){
        barriers.filter(b=>b.type !='wall')
                .forEach(barrier=>barrier.startProgress(ctx))
        ctx.fillStyle = "#4caf50";
        ctx.lineWidth = 2; // Set the line width of the rectangle outline
        barriers.forEach(barrier=>ctx.strokeRect(barrier.x-barrier.margin,barrier.y-barrier.margin,barrier.width+2*barrier.margin,barrier.height+2*barrier.margin))
        //the job area

        ctx.fillStyle = "black";
        barriers.forEach(barrier=>ctx.fillRect(barrier.x,barrier.y,barrier.width,barrier.height))


        ctx.fillRect(700,250,300,100)
    }// visualize the barriers

    if(item1){
        item1.forEach(i=>{{
            i.item.update(now)
            if(i.show)i.item.draw();
        }})
        // item1.update(now);
    }
    // if(showItem1){
    //     if(item1){
    //         item1.draw();
    //     }
    // }
       
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
                if(barrier.checkPlayer(players[id])!=-1 ){//and index is currentlu active
                    barriers[index].startCountDown()//check if players are entering the job area
                } 
            })
        }
    }
    requestAnimationFrame(drawAnimation);
}
// document.addEventListener('keydown',event=>{
//     let keycode=event.keyCode;
//     switch(keycode){
//         case 68:
//             socket.emit('move','right');
//             break;
//         case 65:
//             socket.emit('move','left');
//             break;
//         case 87:
//             socket.emit('move','up');
//             break;
//         case 83:
//             socket.emit('move','front');
//             break;
//     }
// });
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

// document.addEventListener('keyup',event=>{
//     let keycode=event.keyCode;
//     switch(keycode){
//         case 83: case 87:  case 65: case 68:socket.emit('stop','');     
//     }
// });

socket.on('stopByID',id=>{
    players[id].stop();
    socket.emit('updatePos',{x:players[id].getX(), y:players[id].getY()});
    socket.emit('print','');
})

let state = {
    moving:false,
    id:0
};

//width = 195

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
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
            
                    socket.emit('move', 'right');
   
                    if( players[browserID].getCenterX()  >x ){      
                        clearInterval(id);
                       
                            id= setInterval(() => {
                                players[browserID].setPlayerIntival(id);
                                state.id=id;
                                
                   
                                socket.emit('move', 'up');
                             
                                if( players[browserID].getCenterY()<y){
                                    clearInterval(id);
                                    socket.emit('stop','');    
                                    state.moving=false; 
     
                                }
                            }, 5);  

                        
                
                    }
                }, 5);
            }
            else{
                let id= setInterval(() => {
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
                  
                    socket.emit('move', 'up');
 
  
                    if(players[browserID].getCenterY()<y){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;
                     
                            socket.emit('move', 'right');
 
                            
                            if(players[browserID].getCenterX()>x){
                                clearInterval(id);
                               
                                socket.emit('stop','');    
                                state.moving=false; 

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
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
 
                    socket.emit('move', 'left');

                    if(players[browserID].getCenterX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;
                         
                            socket.emit('move', 'up');
                    
                            if(players[browserID].getCenterY()<y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{ 
                let id= setInterval(() => {
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
             
                socket.emit('move', 'up');

                if(players[browserID].getCenterY()<y){
                    clearInterval(id);
                    id= setInterval(() => {
                        players[browserID].setPlayerIntival(id);
                        state.id=id;

                       
                        socket.emit('move', 'left');
                     
                        if(players[browserID].getCenterX()<x){
                            clearInterval(id);
                            socket.emit('stop','');    
                            state.moving=false; 
                          
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
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
                  
                 
                    socket.emit('move', 'left');

                    if(players[browserID].getCenterX()<x){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;
                       
                            socket.emit('move', 'front');
                          
                            if(players[browserID].getCenterY()>y){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
                               
                                barriers.forEach(barrier=> barrier.Set_stopping_state(''))
                            }
                        }, 5);  
                    }
                }, 5);
            }
            else{
                let id= setInterval(() => {
                    players[browserID].setPlayerIntival(id);
                    state.id=id;

                 
                    socket.emit('move', 'front');
                 
                    if(players[browserID].getCenterY()>y){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;

                          
                            socket.emit('move', 'left');
                          
                            if(players[browserID].getCenterX()<x){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 

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
                    players[browserID].setPlayerIntival(id);
                    state.id=id;

                 
                    socket.emit('move', 'right');
                  
                    if(players[browserID].getCenterX()>x){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;

                        
                            socket.emit('move', 'front');
                           
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
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
            
                  
                    socket.emit('move', 'front');
              
                    if(players[browserID].getCenterY()>y){
                        clearInterval(id);
                        id= setInterval(() => {
                            players[browserID].setPlayerIntival(id);
                            state.id=id;
              
                         
                            socket.emit('move', 'right');

                            if(players[browserID].getCenterX()>x){
                                clearInterval(id);
                                socket.emit('stop','');    
                                state.moving=false; 
             
                            }
                        }, 5);  
                    }
                }, 5);
            }
            
        }
});



