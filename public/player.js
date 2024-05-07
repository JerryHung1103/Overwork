const Player=function(socket,ctx,src,width,height,x,y,rate,speedTiming,stage,wall){
    let doneList={
        A:0,
        B:0,
        C:0,
        D:0,
        //...
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

    function showHalfPlayer(){
        
    }
let IsStopping=true;
    function moveRight(){
        if(stage!='movingRight' 
        // &&!IsStopping
    ){
            stage='movingRight';
            player.setStage('movingRight')
        }
        // x+=speed;
        // player.setX(x);
        if( !(getCenterY(y)<=wall.y +wall.height && getCenterY(y)>wall.y&&getCenterX(x)<wall.x)  ){
            x+=speed;
            player.setX(x);
            IsStopping=false
        }
    
        else if(getCenterX(x)+speed<wall.x){
            x+=speed;
            player.setX(x);
            IsStopping=false
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

        if( !(getCenterY(y)<=wall.y +wall.height && getCenterY(y)>wall.y &&getCenterX(x)>wall.x+wall.width)  ){
            x-=speed;
            player.setX(x);
        }
    
        else if(getCenterX(x)-speed>wall.x+wall.width){
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
        if(stage!='movingUp'
        // &&!IsStopping
        ){
            stage='movingUp';
            player.setStage('movingUp')
        }  
        if( !(getCenterX(x)<=wall.x +wall.width && getCenterX(x)>wall.x && getCenterY(y)>wall.y)  ){
            y-=speed;
            player.setY(y);
        }
    
         else if(getCenterY(y)-speed>wall.y+wall.height){
          
            y-=speed;
            player.setY(y);
        }
        else{
            socket.emit('stop');
            clearInterval(movingIntival)
            IsStopping=true
           

        }
     }

     function moveFront(){
        if(stage!='movingFront'
        // &&!IsStopping
        ){
            stage='movingFront';
            player.setStage('movingFront')
        }
        if( !(getCenterX(x)<=wall.x +wall.width && getCenterX(x)>wall.x  && getCenterY(y)<wall.y)  ){
            y+=speed;
            player.setY(y);
        }
    
        else if(getCenterY(y)+speed<wall.y){
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
        IsStopping,
        setPlayerIntival,
        doneList
    };
}
