const Item=function(ctx,src,width,height,x,y,rate,speedTiming,stage){
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

 
     let item=Character(
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

   


    return{
        update:item.update,
        draw:item.draw,
        getX:item.getX,
        getY:item.getY,
        setX:item.setX,
        setY:item.setY,
    };
}