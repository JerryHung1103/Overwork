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

const playerWidth=576/9;
const playerHeight = 256/4;

// const ItemWidth=240/10;
// const ItemHeight = 200/8;

const ItemWidth=128/4;
const ItemHeight = 32;

const teaWidth = 360/4;
const teaHeight = 120;
 
const birdWidth = 1280/8;
const birdHeight = 150;

let playerImg=new Image();
let itemImg = new Image();
let backgroundImg = new Image();
let teaSteamImg = new Image();
let birdImg = new Image();
let JobArea = new Image();

doneList={A:0,B:0,C:0,D:0}//Test

// Play BGM
const audio = new Audio('audio/bgm.mp3');
const bookSFX = new Audio('audio/book.mp3');
const keyboardSFX = new Audio('audio/keyboard.mp3');
const printerSFX = new Audio('audio/printer.mp3');
const writingSFX = new Audio('audio/writing.mp3');
audio.volume = 0.1; // Adjust the volume value as desired (between 0.0 and 1.0)

audio.addEventListener('canplaythrough', () => {
  audio.play();
});


// Load the image sprites
backgroundImg.onload=()=>{
    // Draw background img covering the whole canvas
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);
    playerImg.onload=()=>{
        itemImg.onload=()=>{
                teaSteamImg.onload=()=>{
                birdImg.onload=()=>{
                    JobArea.onload=()=>{
                        requestAnimationFrame(drawAnimation);
                    }
                    JobArea.src='/image/GameObjectSpriteSheet.png'
                }
                birdImg.src='/image/BirdSprite.png'
            }
            teaSteamImg.src='/image/TeaSteam.png'
        }
        itemImg.src = '/image/blingbling.png'
    }
    playerImg.src= '/image/BusinessManSprites.png'
}
backgroundImg.src = '/image/background.png';

const players = {}
let browserID;

// Scoring: Things to pass back to the server when game ends
const playerName = sessionStorage.getItem('playerName');
console.log('playerName is =========================='); 
console.log(playerName); 
socket.emit('playerName',playerName)

let score = 0;

function showScore(players){
    let y=25
    let x=1000
    // console.log(players)
    for(const id in players){
        ctx.fillText(`player ${players[id].name} has score: ${players[id].getScore()}`,x,y)
        y+=100
    }
}

function submitScore(name, score) {
    const data = { name, score};
  
    // fetch('/submit-score', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // console.log('finished submitting score');

    socket.emit('submit-score', data);
    console.log('finished submitting score');
}

// Gameover page is here for testing right now
function fetchGameOverPage(){
    // Pause the audios
    console.log("pausing audio");
    audio.pause();
    audio.src = '';

    fetch('/gameover')
    .then(response => {
        if (response.ok) {
        return response.text();
        } else {
        throw new Error('Failed to load gameover page');
        }
    })
    .then(html => {
        // Switch to gameover page
        window.location.href = "/gameover";
        document.body.innerHTML = html;
    })
}

socket.on('GameOver',(players)=>{
    submitScore(playerName, pos.score);
})

//For testing 
// socket.on('connect', ()=>{
//     submitScore(playerName, score);
// })

socket.on('game-is-over', () => {
    fetchGameOverPage();
})

socket.on('getID',id=>browserID=id);
const wall=[
    {x:1250,y:250,width:150,height:115,type:'submission'},
    {x:0,y:260,width:2000,height:100,type:'wall'},

    {x:145,y:550,width:140,height:50,type:'wall'},
    {x:145,y:550+95,width:140,height:50,type:'wall'},
    {x:280,y:550,width:5,height:95,type:'wall'},
    {x:210,y:580,width:70,height:65,type:'wall'},
 

    {x:145+360,y:550,width:140,height:50,type:'wall'},
    {x:145+360,y:550+95,width:140,height:50,type:'wall'},
    {x:280+360,y:550,width:5,height:95,type:'wall'},
    {x:210+360,y:580,width:70,height:65,type:'wall'},

    {x:145+360*2,y:550,width:140,height:50,type:'wall'},
    {x:145+360*2,y:550+95,width:140,height:50,type:'wall'},
    {x:280+360*2,y:550,width:5,height:95,type:'wall'},
    {x:210+360*2,y:580,width:70,height:65,type:'wall'},

    {x:145+360*3,y:550,width:140,height:50,type:'wall'},
    {x:145+360*3,y:550+95,width:140,height:50,type:'wall'},
    {x:280+360*3,y:550,width:5,height:95,type:'wall'},
    {x:210+360*3,y:580,width:70,height:65,type:'wall'},



    //1st row
    {x:350,y:350,width:140,height:50,type:'wall'},
    {x:350,y:350+95,width:140,height:50,type:'wall'},
    {x:490,y:350,width:5,height:95,type:'wall'},
    {x:420,y:380,width:70,height:65,type:'wall'},

    {x:350+360,y:350,width:140,height:50,type:'wall'},
    {x:350+360,y:350+95,width:140,height:50,type:'wall'},
    {x:490+360,y:350,width:5,height:95,type:'wall'},
    {x:420+360,y:380,width:70,height:65,type:'wall'},

    {x:350+360*2,y:350,width:140,height:50,type:'wall'},
    {x:350+360*2,y:350+95,width:140,height:50,type:'wall'},
    {x:490+360*2,y:350,width:5,height:95,type:'wall'},
    {x:420+360*2,y:380,width:70,height:65,type:'wall'},

    {x:350+360*3,y:350,width:140,height:50,type:'wall'},
    {x:350+360*3,y:350+95,width:140,height:50,type:'wall'},
    {x:490+360*3,y:350,width:5,height:95,type:'wall'},
    {x:420+360*3,y:380,width:70,height:65,type:'wall'},
  
]

socket.on('updatePlayers',(backend_players)=>{
    for(const id in backend_players){
        const pos = backend_players[id];
        if(!players[id]){
            players[id]=Player(socket,id,ctx,playerImg,playerWidth,playerHeight,pos.x,pos.y,1.2,50, 'stayFront',
            wall,pos.doneList,pos.name,pos.score)
        }
        else{
            players[id].setdoneList(pos.doneList)
            players[id].setScore(pos.score)

          
            // console.log(players[id].getScore())
           

            // console.log('=====================')
        }
        
    }

    for(const id in players){
        if(!backend_players[id]){
            delete players[id];
        }
    }

    // console.log('after updating', players)
    
})
socket.on('updateDoneList',info=>{
   
    console.log(info.list)
    console.log(players)
    console.log('=======================')
     players[info.id].setdoneList(info.list)
     
     console.log(players[info.id].doneList)
     console.log('=======================')
     console.log(players)
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
            item:Item(ctx,itemImg,ItemWidth,ItemHeight,backendItem.x,backendItem.y,2,100, 'movingFront',backendItem.type),
            show:backendItem.show
        }))
        barriers = [

          
            Barrier(210,580,70,65,players,socket,0.5,0,'jobArea',item1[0],bookSFX),
            Barrier(210+360,580,70,65,players,socket,.5,1,'jobArea',item1[1],writingSFX),
            Barrier(210+360*2,580,70,65,players,socket,.5,2,'jobArea',item1[2],printerSFX),
            Barrier(210+360*3,580,70,65,players,socket,.5,3,'jobArea',item1[3],keyboardSFX),
            //initx intiy width height playerList socket(optional actually   is not needed), bar rate, id, type
          
            Barrier(420,380,70,65,players,socket,0.5,0,'jobArea',item1[4],bookSFX),
            Barrier(420+360,380,70,65,players,socket,.5,1,'jobArea',item1[5],writingSFX),
            Barrier(420+360*2,380,70,65,players,socket,.5,2,'jobArea',item1[6],printerSFX),
            Barrier(420+360*3,380,70,65,players,socket,.5,3,'jobArea',item1[7],keyboardSFX),
        
        
        ];
   
})


socket.on('change_state_to',show=>{
    item1.forEach(i=>i.show=show)
    // showItem1=show;
});

const subtaskWidth=50;
const subtaskHeight=50;

let numberofCurrentTask=0;

// let xxx=100,yyy=100;
// function drawDot(x,y){
//     ctx.fillRect(x,y,5,5);
// }


socket.on('updateBarriers',state=>{
    barriers[state.id].update(state.progressing,state.stopProgres)
})

let timeRemaining=120;

function drawAllTable(){
    
}


function drawAnimation(now){
    // Clear the canvas
    ctx.clearRect(0,0,cvw,cvh)
   
    // Redraw the background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    showScore(players);
    // drawDot(xxx,yyy)
    // Draw tea animation
    const frameIndex = Math.floor(now / 100) % 4; // Change frame every 100 milliseconds
    const teaframeX = frameIndex * teaWidth;
    ctx.drawImage(teaSteamImg, teaframeX, 0, teaWidth, teaHeight, 250, 320, teaWidth / 3.5, teaHeight / 3.5);    
    
    // Draw the bird animation
    const birdFrameIndex = Math.floor(now / 100) % 8; // Change frame every 100 milliseconds
    const birdFrameX = birdFrameIndex * birdWidth;

    const birdX = canvas.width - (now / 10) % (canvas.width + birdWidth);
    const birdY = canvas.height / 3 - birdHeight;

    ctx.drawImage(birdImg, birdFrameX, 0, birdWidth, birdHeight, birdX, birdY, birdWidth / 3, birdHeight/ 3);

    

    const tableWidth=150
    const secondRowY=550
    const firstRowY=350
    const firstRowstartingX=350
    ctx.drawImage(JobArea,
                20+420*0,200,400,450,
                140,secondRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420*1,200,400,450,
                500,secondRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420*2,200,400,450,
                860,secondRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420*3,200,400,450,
                1220,secondRowY,tableWidth,tableWidth
            )//Drawing the jobTable


    //first row
    ctx.drawImage(JobArea,
                20,200,400,450,
                firstRowstartingX,firstRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420,200,400,450,
                firstRowstartingX+360,firstRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420*2,200,400,450,
                firstRowstartingX+2*360,firstRowY,tableWidth,tableWidth
            )//Drawing the jobTable
    ctx.drawImage(JobArea,
                20+420*3,200,400,450,
                firstRowstartingX+3*360,firstRowY,tableWidth,tableWidth
            )//Drawing the jobTable

    ctx.drawImage(JobArea,
                450, 20, 150, 140, 
                1250,310,150, 55);// Drawing the submission table

    if(barriers){
        barriers.filter(b=>b.type !='wall')
                .forEach(barrier=>barrier.startProgress(ctx,socket))
        // ctx.fillStyle = "#4caf50";
        ctx.strokeStyle = "rgba(0,0,0,0)"; // Set the stroke color with transparency
        ctx.lineWidth = 2; // Set the line width of the rectangle outline
        barriers.forEach(barrier=>ctx.strokeRect(
            barrier.x-barrier.margin,
            barrier.y,
            barrier.width+1*barrier.margin,
            barrier.height+0*barrier.margin))
        //the job area

        ctx.fillStyle = "black";
        barriers.forEach(barrier=>ctx.strokeRect(barrier.x,barrier.y,barrier.width,barrier.height))


        // ctx.fillRect(700,250,300,100)
        wall.forEach(w=>{
            ctx.strokeRect(w.x,w.y,w.width,w.height)
        })
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
    let x=20;
    for(const id in players){
        // console.log(id)
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
                let interactionState = barrier.checkPlayer(players[id],id);
                // console.log('interaction state is',interactionState);
                if(interactionState == 0 ){//and index is currently active
                    barriers[index].startCountDown()//check if players are entering the job area
                    // Play task music
                    // if (index % 4 == 0) {
                    //     bookSFX.loop = true; 
                    //     bookSFX.play();
                    // } else if (index % 4 == 1) {
                    //     keyboardSFX.loop = true;
                    //     keyboardSFX.play();
                    // } else if (index % 4 == 2) {
                    //     printerSFX.loop = true;
                    //     printerSFX.play();
                    // } else if (index % 4 == 3) {
                    //     writingSFX.loop = true;
                    //     writingSFX.play();
                    // }
    
                } 
                // Stop the task music when the player leaves the task area
                else if (interactionState == 1) {
                    // bookSFX.pause();
                    // keyboardSFX.pause();
                    // printerSFX.pause();
                    // writingSFX.pause();
                }
                
            })
        }
        
        drawDoneList(players[id].name,700,x,players[id].doneList)
        x+=80
        // drawDoneList('hehe',700,100,doneList)



    }
    drawTimer(timeRemaining,800,200)
    drawTasks();


    


    // drawDoneList('haha',700,20,doneList)
    // drawDoneList('hehe',700,100,doneList)
    requestAnimationFrame(drawAnimation);
}

function drawTimer(timeRemaining, x, y) {
    // Save the current context settings
    ctx.save();
  
    // Set styles for the timer
    ctx.font = '40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 5;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    // Calculate the minutes and seconds
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
  
    // Format the time as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
    // Draw the timer text at the specified location
    ctx.fillText(formattedTime, x, y);
    ctx.strokeText(formattedTime, x, y);
  
    // Restore the context settings
    ctx.restore();
}

socket.on('countdown', function(gameDuration) {
    timeRemaining=gameDuration
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

// document.addEventListener('keyup',event=>{
//     let keycode=event.keyCode;
//     switch(keycode){
//         case 83: case 87:  case 65: case 68:socket.emit('stop','');     
//     }
// });

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

        // xxx=x,yyy=y

        let playerX= players[browserID].getCenterX();
        let playerY= players[browserID].getCenterY();
        let diffX = Math.abs(playerX - x);
        let diffY = Math.abs(playerY - y);

        //1st quadrant
        if(playerX<=x && playerY>=y){
            state.moving=true;
            // console.log('moving 1 quadrant')
            if(diffX<=diffY){
                let id= setInterval(() => {
                    players[browserID].setPlayerIntival(id);
                    state.id=id;
            
                    socket.emit('move', 'right');
                    // console.log('moving right')
                    if( players[browserID].getCenterX()  >x ){      
                        clearInterval(id);
                        // console.log('moving right stop')
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

// let task=[];
socket.on('displayTask',t=>{
    tasks=t;
    // let exits={
    //     'A':false,
    //     'B':false,
    //     'C':false,
    //     'D':false
    // }

    // tasks.forEach(t=>{
    //     t.subtasks.forEach(st=>{
    //         if(!exits[st]){
    //             exits[st]=true
    //         }
    //     })
    // })

 

    // barriers.forEach(b=>{
    
    //     if(exits[b.itemType]){
    //         if(!b.item.show)
    //             b.setShow(true)
    //     }
    //     else{
    //         if(b.item.show)
    //             b.setShow(false)
    //     }
    // })


});
var tasks = [
    // { subtasks: generateRandomSubtasks(), duration: 200 },
    // { subtasks: generateRandomSubtasks(), duration: 200 },
    // { subtasks: generateRandomSubtasks(), duration: 200 }
  ];

function drawingSubtask(type,x,y){
    switch(type){
        case 'A':
            ctx.drawImage(JobArea, 110*0,0,110,110 ,x, y, 20, 20);
            break;
        case 'B':
            ctx.drawImage(JobArea, 110*1,0,110,110 ,x, y, 20, 20);
            break;
        case 'C':
            ctx.drawImage(JobArea, 110*2,0,110,110 ,x, y, 20, 20);
            break;
        case 'D':
            ctx.drawImage(JobArea, 110*3,0,110,110 ,x, y, 20, 20);
            break;
    }

}

  function drawTasks() {

    if(tasks)
      {ctx.save()
   

    var horizontalOffset = 10; // Offset for horizontal positioning
    var verticalOffset = 50; // Offset for vertical positioning

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      var remainingDuration = task.duration;

      // Display remaining duration
   
      ctx.fillStyle = 'red';
      ctx.fillRect(horizontalOffset, verticalOffset,100,5);
    ctx.fillStyle = 'green';
    ctx.fillRect(horizontalOffset, verticalOffset,100*(remainingDuration/200),5);
    
      ctx.strokeRect(horizontalOffset, verticalOffset,100,5)
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`${remainingDuration}s left`, horizontalOffset, verticalOffset-5);

      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      var subtasksText = 'Subtasks: ' 
    //   + task.subtasks.join(' ');
      ctx.fillText(subtasksText, horizontalOffset, verticalOffset + 20);

      // Display image below the text
      let posx=horizontalOffset;
      tasks[i].subtasks.forEach(st=>{
        drawingSubtask(st,posx,verticalOffset + 40)
        posx+=40
      })
    //   ctx.drawImage(JobArea, horizontalOffset, verticalOffset + 40, 40, 40);

      // Update horizontal offset for the next task
      horizontalOffset += 200;

      // Reset horizontal offset and move to the next row if necessary
      if (horizontalOffset + 200 > canvas.width) {
        horizontalOffset = 10;
        verticalOffset += 120;
      }
    }

    ctx.restore()}
  }


  
function drawDoneList(playerid,x,y,doneList ){
            
    const Xgap=25
    const Ygap=50
    const ydiff=13
    ctx.fillText(`Player ${playerid}`, x, y );
    y+=20
    for(const id in doneList){
        drawingSubtask(id,x,y)
        ctx.fillText(doneList[id], x+Xgap, y +ydiff); 
        x += Ygap;
    }
}





