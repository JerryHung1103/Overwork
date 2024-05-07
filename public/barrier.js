const Barrier=(x,y,width,height,players,socket,progressDuration,id,type,item)=>{
//     let item
//    function setItem(i){
//         item=i;
//    }
   

function Set_stopping_state(stage){
    stopping_state=stage
}       


let barwidth=width;
let barheight = 5;

let progress=barwidth;
function startProgress(ctx){
    
        if(progress>=barwidth){
            if(playerInside){//finished
                if(item)
               { 
                // console.log(playerInside,"finished",'type',item.item.type)
                socket.emit('finish_subTask',item.item.type)
                playerInside.doneList[item.item.type]++;
                console.log( playerInside.doneList)
                item.show=false;
            }
                playerInside=null;
            }
            //else not start yet
            progressing=false
            return
        }

        if(item && item.show){
            ctx.fillStyle = "red"; // Set the color of the empty bar
            ctx.fillRect(x, y-10, barwidth, barheight); // Draw the empty bar
            ctx.fillStyle = "#4caf50";
            ctx.fillRect(x,y-10,(progress), barheight); 
            ctx.fillStyle = "black";
            if(!stopProgres )
                progress+=progressDuration;

        }
        else{
            progress=barwidth;
        }
    
        
       

  
    
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
    if(item && !item.show) return -1;
    let playerX=p.getCenterX();
    let playerY = p.getCenterY()
    let topleftX = x-margin;
    let topleftY = y-margin;
    let areaWidth = width+2*margin;
    let areaHeight = height+2*margin;
    if( playerX>topleftX && 
        playerX<topleftX+areaWidth && 
        playerY>topleftY && 
        playerY<topleftY+areaHeight 
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
    height,
    // StopBarrier,
    Set_stopping_state,
    startCountDown,
    startProgress,
    checkPlayer,
    margin,
    progressing,
    stopProgres,
    update,
    type,
    // setItem

}


}