const Barrier=(x,y,width,players,socket,progressDuration,id)=>{
    

    let stopping_state;
    function StopBarrier(browserID,intivalId,clickX,clickY){
        let playerX=players[browserID]. getCenterX();
        let playerY= players[browserID].getCenterY();
        let rect_y=y;
        let rect_x = x;
        let rectWidth =width
        switch(stopping_state){
                case 'movingUp':case 'stayUp':
                    if(clickY<rect_y && playerX>rect_x && playerX<rect_x+rectWidth && playerY>rect_y && playerY<rect_y+rectWidth){
                        stopping_state=players[browserID].getStage();
                        clearInterval(intivalId);
                        socket.emit('stop','');  
                        return true  
                    }
                    else{
                        return false;
                    } 
                    break;
                case 'movingFront': case 'stayFront':
                    if(clickY>rect_y +rectWidth && playerX>rect_x && playerX<rect_x+rectWidth && playerY>rect_y && playerY<rect_y+rectWidth){
                        stopping_state=players[browserID].getStage();
                        clearInterval(intivalId);
                        socket.emit('stop','');  
                        return true  
                    }
                    else{
                        return false;
                    } 
                    break;
                case 'movingLeft':case 'stayLeft':
                    if(clickX<rect_x && playerX>rect_x && playerX<rect_x+rectWidth && playerY>rect_y && playerY<rect_y+rectWidth){
                        stopping_state=players[browserID].getStage();
                        clearInterval(intivalId);
                        socket.emit('stop','');  
                        return true  
                        }
                        else{
                            return false;
                        } 
                        break;
                case 'movingRight':case 'stayRight':
                    if( clickX>rect_x+rectWidth && playerX>rect_x && playerX<rect_x+rectWidth && playerY>rect_y && playerY<rect_y+rectWidth){
                        stopping_state=players[browserID].getStage();
                        clearInterval(intivalId);
                        socket.emit('stop','');  
                        return true  
                    }
                    else{
                        return false;
                    } 
                    break;   
    
                default: 
                    if(playerX>rect_x && playerX<rect_x+rectWidth && playerY>rect_y && playerY<rect_y+rectWidth){
                        console.log('stoppppppppppppppppppppp')
                        stopping_state=players[browserID].getStage();
                        clearInterval(intivalId);
                        socket.emit('stop','');  
                        return true  
                    }
                    return false;
            }
}

function Set_stopping_state(stage){
    stopping_state=stage
}       


let barwidth=width;
let barheight = 5;

let progress=barwidth;
function startProgress(ctx){
    if(progress>=barwidth){
        if(playerInside){//finished
            console.log(playerInside,"finished")
            playerInside=null;
        }
        //else not start yet
        progressing=false
        return
    }

    
    ctx.fillStyle = "red"; // Set the color of the empty bar
    ctx.fillRect(x, y-10, barwidth, barheight); // Draw the empty bar
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(x,y-10,(progress), barheight); 
    ctx.fillStyle = "black";
    if(!stopProgres )
        progress+=progressDuration;
}

function startCountDown(){
    if(progress>=barwidth)
        progress=0;
}

let playerInside=null;
let progressing=false
let stopProgres=false;
let margin = 20;
function checkPlayer(p){
    let playerX=p.getCenterX();
    let playerY = p.getCenterY()
    let topleftX = x-margin;
    let topleftY = y-margin;
    let areaWidth = width+2*margin;
    if( playerX>topleftX && 
        playerX<topleftX+areaWidth && 
        playerY>topleftY && 
        playerY<topleftY+areaWidth 
    ){      
            //one player inside the job area
            if(!playerInside)
                playerInside=p;
            if(!progressing){
                progressing=true;
                stopProgres=false
                socket.emit('update_barrier',{id:id,progressing:progressing,stopProgres:stopProgres})
                return 0;
            }
        }
   else {
        if(progressing && playerInside==p){
            //that player is leaving the job area
            playerInside=null
            progressing=false
            stopProgres=true
            socket.emit('update_barrier',{id:id,progressing:progressing,stopProgres:stopProgres})
            return 1;
    }
}
    return -1;
}

function update(pro,stop){
    progressing=pro;
    stopProgres=stop;
}


return{
    x,
    y,
    width,
    StopBarrier,
    Set_stopping_state,
    startCountDown,
    startProgress,
    checkPlayer,
    margin,
    progressing,
    stopProgres,
    update

}


}