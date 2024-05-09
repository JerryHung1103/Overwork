const Item=function(ctx,src,width,height,x,y,rate,speedTiming,stage,type){
    const sequence={
        movingFront:{row:1, col:4, x:0,y:0,count:4,loop:true},
       
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
        setSrc:item.setSrc,
        type
    };
}