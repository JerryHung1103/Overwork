const Player=function(socket,id,ctx,src,width,height,x,y,rate,speedTiming,stage,walls,list){

    // let walls=[
    //     {x:700,y:250,width:300,height:100,type:'submission'},
    //     {x:100,y:100,width:300,height:100,type:'wall'},
    // ];


   function inWall(x,y){
    for(let i=0;i<walls.length;++i){
        if(x>walls[i].x && x<walls[i].x +walls[i].width && y>walls[i].y && y<walls[i].y +walls[i].height)
            return {inWall:true, type:walls[i].type}
    } 
    return {inWall:false, type:''}
   }



  let doneList = list
    function setdoneList(d){
        doneList['A']=d['A']
        doneList['B']=d['B']
        doneList['C']=d['C']
        doneList['D']=d['D']
    }
  
    let speed=1;
    let movingIntival;
    function setPlayerIntival(intival){
        movingIntival=intival
    }
    const sequence={//movingFront
        
        stayUp:{row:1, col:1, x:0,y:0,count:1,loop:false},
        stayLeft:{row:1, col:1, x:0,y:height,count:1,loop:false},
        stayFront:{row:1, col:1, x:0,y:2*height,count:1,loop:false},
        stayRight:{row:1, col:1, x:0,y:3*height,count:1,loop:false},
        movingUp:{row:1, col:9, x:0,y:0*height,count:9,loop:true},
        movingLeft:{row:1, col:9, x:0,y:1*height,count:9,loop:true},
        movingFront:{row:1, col:9, x:0,y:2*height,count:9,loop:true},
        movingRight:{row:1, col:9, x:0,y:3*height,count:9,loop:true}
    }//
 
     let player=Character(
        ctx,//context
        src,
        width,
        height,
        x,
        y,
        rate,
        speedTiming,
        stage,
        sequence
    );
   

    function updateList(idd,type,newValue){
       
           
        doneList[type]++
        console.log('doneList is',doneList)
        let copy = doneList
        socket.emit('uppdateDoneList',{id:id,  list:copy});
    
    }
let IsStopping=true;
    function moveRight(){
        if(stage!='movingRight' 
        // &&!IsStopping
    ){
            stage='movingRight';
            player.setStage('movingRight')
        }
   
    
        if(!inWall(getCenterX(x)+speed, getCenterY(y)).inWall){
                x+=speed;
                player.setX(x);
        }
       
        else{
          
            // socket.emit('stop','');  
            socket.emit('stop');
            clearInterval(movingIntival)
            IsStopping=true
        
            
        }
     }
     function moveLeft(){
        if(stage!='movingLeft'
        // &&!IsStopping
        ){
            stage='movingLeft';
            player.setStage('movingLeft')
        }
        // x-=speed;
        // player.setX(x);

        if(!inWall(getCenterX(x)-speed, getCenterY(y)).inWall){
           x-=speed;
        player.setX(x);
    }
    
       
        else{
            socket.emit('stop');
            clearInterval(movingIntival)
            IsStopping=true
        }
     }
    function moveUp(){
        // if(id=== socket.id){ 
        // console.log('player', socket.id, 'is moving')
        if(stage!='movingUp'
        // &&!IsStopping
        ){
            stage='movingUp';
            player.setStage('movingUp')
        }  
        // if( !(getCenterX(x)<=wall.x +wall.width && getCenterX(x)>wall.x && getCenterY(y)>wall.y)  ){
        //     y-=speed;
        //     player.setY(y);
        // }
    
        //  else if(getCenterY(y)-speed>wall.y+wall.height){
          
        //     y-=speed;
        //     player.setY(y);
        // }
        let flg = inWall(getCenterX(x), getCenterY(y)-speed)
        if(!flg.inWall){
                y-=speed;
                player.setY(y);
    }
        else{
            if(flg.type==='submission'){
                submit(id);
                console.log('submit now')

            }
            console.log('player', socket.id, 'is stopping')
            socket.emit('stop');
           
            clearInterval(movingIntival)
            IsStopping=true
           

        // }
    }
     }

    function submit(id){
            socket.emit('handInTask',id)
    }

     function moveFront(){
        if(stage!='movingFront'
        // &&!IsStopping
        ){
            stage='movingFront';
            player.setStage('movingFront')
        }
        // if( !(getCenterX(x)<=wall.x +wall.width && getCenterX(x)>wall.x  && getCenterY(y)<wall.y)  ){
        //     y+=speed;
        //     player.setY(y);
        // }
    
        // else if(getCenterY(y)+speed<wall.y){
        //     y+=speed;
        //     player.setY(y);
        // }
        if(!inWall(getCenterX(x), getCenterY(y)+speed).inWall){
            y+=speed;
                player.setY(y);
    }
        else{
           
            socket.emit('stop');
            clearInterval(movingIntival)
            IsStopping=true
        }
         
     }
     function stop(){
        
        if(stage!='stayRight' && stage=='movingRight'){
            stage='stayRight';
            player.setStage('stayRight')
        }
        else if(stage!='stayFront' && stage=='movingFront'){
            stage='stayFront';
            player.setStage('stayFront')
        }
        else if(stage!='stayLeft' && stage=='movingLeft'){
            stage='stayLeft';
            player.setStage('stayLeft')
        }
        else if(stage!='stayUp' && stage=='movingUp'){
            stage='stayUp';
            player.setStage('stayUp')
        }
      
     }

     function getStage(){
        return stage;
     }


     //this can be hard coded
     function getCenterX(){
        return x+64;
    }
    
    
    function getCenterY(){
        return y+75;
    }

   

    
   

    return{
        moveRight:moveRight,
        moveLeft:moveLeft,
        moveUp:moveUp,
        moveFront:moveFront,
        stop:stop,
        update:player.update,
        draw:player.draw,
        getX:player.getX,
        getY:player.getY,
        setX:player.setX,
        setY:player.setY,
        getStage,
        getCenterX,
        getCenterY,
        // setSocket,
        setPlayerIntival,
        updateList,
        setdoneList,
        doneList,
        id
        // socket
        
   
    };
}

