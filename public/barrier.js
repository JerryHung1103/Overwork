const Barrier=(x,y,width,height,players,socket,progressDuration,id,type,item,audio)=>{



    function pauseAudio(){
        socket.emit('pauseAudio',id)
    }

    function getAudio(){
        return audio
    }


    function getIndex(){
        return id;
    }
    function setShow(s){
        item.show=s;
    }

    function getShow(){
        return item.show;
    }

    function setSpeed(s){
        progressDuration=s;
    }

    function Set_stopping_state(stage){
        stopping_state=stage
    }       
    
    
    let barwidth=width;
    let barheight = 5;
    
    let progress=barwidth;
    function startProgress(ctx,socket){
        
            if(progress>=barwidth){
                
                if(playerInside){//finished
                    pauseAudio()
                    audio.currentTime = 0
                    playerInside.setWorkingState({
                        isWorking:false,
                        id:id
                    })
                    if(item)
                   { 
                  
                    // socket.emit('finish_subTask',item.item.type)//to be changed
                    // playerInside.doneList[item.item.type]++;
                    // console.log(playerInside.doneList)
                    if(playerInside)
                        playerInside.updateList(playerInside.id,item.item.type,playerInside.doneList[item.item.type]+1)
              
                    socket.emit('hideTask',id)
                    // console.log('hide',id)
                    // item.show=false;
                    // setTimeout(()=>{
                    //     item.show=true;
                    // },5000)
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
                    {
                        progress+=progressDuration;
                    
                            audio.play()
                        
                    }
    
            }
            else{
                pauseAudio()
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
    function checkPlayer(p,socketid){
        // console.log('p is',p.id,'!!!')
        if(item && !item.show) return -1;
        let playerX=p.getCenterX();
        let playerY = p.getCenterY()
        let topleftX = x-margin;
        // let topleftY = y-margin;
        let topleftY = y;
        let areaWidth = width+1*margin;
        let areaHeight = height+0*margin;
        if( playerX>topleftX && 
            playerX<topleftX+areaWidth && 
            playerY>topleftY && 
            playerY<topleftY+areaHeight 
        ){      
                //one player inside the job area
                if(!playerInside)
                    {   
                        playerInside=players[socketid];
                        // console.log('player',playerInside.id,'inside!!!')
                        // console.log('id is',socketid)
                        // if(audio.paused)
                            // audio.play();
                        playerInside.setWorkingState({
                            isWorking:true,
                            id:id
                        })
                    }
                if(!progressing){
                    // audio.pause();
                    progressing=true;
                    stopProgres=false
                    playerInside.setWorkingState({
                        isWorking:true,
                        id:id
                    })
                    socket.emit('update_barrier',{id:id,progressing:progressing,stopProgres:stopProgres,player:playerInside})
                    return 0;
                }
               
            }
       else {
            if(progressing && playerInside===p){
                // console.log('player',p.id,'out!!!')
                //that player is leaving the job area
                playerInside.setWorkingState({
                    isWorking:false,
                    id:id
                })
                
                pauseAudio()
               
                playerInside=null
                progressing=false
                stopProgres=true
                socket.emit('update_barrier',{id:id,progressing:progressing,stopProgres:stopProgres})
                return 1;
        }
    }
    
        return -1;
    }
    
    function update(pro,stop,p){
        progressing=pro;
        stopProgres=stop;
        playerInside=p;
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
        item,
        itemType:item.item.type,
        setShow,
        setSpeed,
        getShow,
        getIndex,
        getAudio
    
    }
    
    
    }



