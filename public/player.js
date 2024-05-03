const Player=function(ctx,src,width,height,x,y,rate,speedTiming,stage){
    let speed=1;
    const sequence={
        stayFront:{row:1, col:3, x:0,y:0,count:3,loop:false},
        stayLeft:{row:1, col:3, x:0,y:height,count:3,loop:false},
        stayUp:{row:1, col:1, x:0,y:2*height,count:1,loop:false},
        stayRight:{row:1, col:3, x:0,y:3*height,count:3,loop:false},
        movingFront:{row:1, col:10, x:0,y:4*height,count:10,loop:true},
        movingLeft:{row:1, col:10, x:0,y:5*height,count:10,loop:true},
        movingUp:{row:1, col:10, x:0,y:6*height,count:10,loop:true},
        movingRight:{row:1, col:10, x:0,y:7*height,count:10,loop:true}
    }
 
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

    function moveRight(){
        if(stage!='movingRight'){
            stage='movingRight';
            player.setStage('movingRight')
        }
        x+=speed;
        player.setX(x);
     }
     function moveLeft(){
        if(stage!='movingLeft'){
            stage='movingLeft';
            player.setStage('movingLeft')
        }
        x-=speed;
        player.setX(x);
     }
    function moveUp(){
        if(stage!='movingUp'){
            stage='movingUp';
            player.setStage('movingUp')
        }
        y-=speed;
        player.setY(y);
     }

     function moveFront(){
        if(stage!='movingFront'){
            stage='movingFront';
            player.setStage('movingFront')
        }
        y+=speed;
        player.setY(y);
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
        return x+32;
    }
    
    
    function getCenterY(){
        return y+42;
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
        getCenterY
    };
}
