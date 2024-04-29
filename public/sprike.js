const Character=function(ctx,image,width,height,x,y,rate,timing,stage,sequence){
    let X_index=0;
    let Y_index=0;
    let count=0;
    function IsImageOk(img) {
        if (!img.complete) {
            return false;
        }
        if (img.naturalWidth === 0) {
            return false;
        }
        return true;
    }
    function setCtx(newCtx){
        ctx=newCtx;
    }
    function setSrc(newSrc){
        src=newSrc;
    }
    function setX(newX){
        x=newX;
     }
     function setY(newY){
        y=newY;
     }
     function setRate(newRate){
        rate=newRate;
     }
     function setTime(newTime){
        timing=newTime;
     }
    
     function setSequence(newSequence){
        sequence=newSequence;
     }
     function setStage(newStage){
        stage=newStage;
        X_index=0;
        Y_index=0;
        count=0;
    }
    let constructTime=performance.now();
    function draw(){
        if(IsImageOk(image)){
            ctx.save();
            ctx.drawImage(
                image,
                sequence[stage].x+X_index*width,
                sequence[stage].y+Y_index*height,
                width,
                height,
                x,
                y,
                width*rate,
                height*rate
            );
            ctx.restore();
        }      
    }
    function update(now){
        if(now-constructTime>=timing){
                if(count==sequence[stage].count){
                    if(sequence[stage].loop===true){
                        X_index=0;
                        Y_index=0;
                        count=0;
                    }
                }
                count++;
                if(X_index<sequence[stage].col-1){
                    X_index++;
                }
                else{
                    if(Y_index<sequence[stage].row-1){
                        Y_index++
                    }
                }
            constructTime=now;
        }   
    }
    return{
        setStage,
        setX,
        setCtx,
        setSrc,
        setY,
        setRate,
        setTime,
        setSequence,
        update,
        draw
     
    };
}